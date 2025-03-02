import collections
import os
import pickle
from datetime import timedelta
from pathlib import Path
from typing import Annotated

import jieba
import jwt
import redis
from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jwt import InvalidTokenError
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from youtube_transcript_api import YouTubeTranscriptApi, NoTranscriptFound, NoTranscriptAvailable, TranscriptsDisabled

import backend.app.crud as crud
import backend.app.helpers as helpers
import backend.app.schemas as schemas
from backend.app import models
from backend.app.database import get_db

# Set up file paths for jieba
BASE_DIR = Path(__file__).resolve().parent.parent
DICTIONARY_FILE = os.path.join(BASE_DIR, "resources", "dict.txt.big")

# initialize jieba on startup
jieba.setLogLevel(20)  # don't print initialization information
jieba.set_dictionary(DICTIONARY_FILE)
jieba.initialize()

# Create some tags to group up endpoints at /docs
tags_metadata = [
    {
        "name": "word lists",
        "description": "List of HSK words",
    },
    {"name": "sentences", "description": "List of example sentences"},
    {"name": "dictionary", "description": "List of dictionary entries"},
    {"name": "analyzer", "description": "Text analyzer"},
    {"name": "translator", "description": "Text translator"},
    {
        "name": "user_lists",
        "description": "User-created vocabulary lists",
    },
    {"name": "transcript", "description": "Video transcriptions"},
]

app = FastAPI(tags_metadata=tags_metadata)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


def get_current_user(
        token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, helpers.SECRET_KEY, algorithms=[helpers.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except InvalidTokenError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception

    return user


# Use redis to cache HSK lists
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
if os.getenv("REDIS_HOST") == "redis":  # If using Docker
    redis_url = "redis://redis:6379"

r = redis.from_url(redis_url)

# Use localhost:3000 as the default host and port
# The value for ALLOWED_ORIGINS is a comma-separated string of URIs
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str


@router.post("/register")
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter_by(username=user_data.username).first()
    if user:
        raise HTTPException(status_code=400, detail="Username already registered")

    return crud.create_user(
        db=db, username=user_data.username, password=user_data.password
    )


@router.post("/token")
def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
        db: Session = Depends(get_db),
) -> schemas.Token:
    user = (
        db.query(models.User).filter(models.User.username == form_data.username).first()
    )
    if not user or not helpers.verify_password(
            form_data.password, user.hashed_password
    ):
        raise HTTPException(status_code=400, detail="Incorrect username or password.")
    access_token_expires = timedelta(minutes=30)
    access_token = helpers.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return schemas.Token(access_token=access_token, token_type="bearer")


@router.get("/verify-token")
async def verify_token(current_user: schemas.User = Depends(get_current_user)):
    return {"valid": True}


@router.get(
    "/level/{level}/words", response_model=list[schemas.Word], tags=["word_lists"]
)
def get_hsk_level_words(level: int, db: Session = Depends(get_db)):
    """Get all the HSK words for a given level."""
    cache_key = f"hsk_level_{level}"
    cached_result = r.get(cache_key)

    if cached_result:
        return pickle.loads(cached_result)

    hsk_level = crud.get_hsk_words_by_level(db, level)
    if not hsk_level:
        raise HTTPException(status_code=404, detail="HSK Level not found")

    r.setex(cache_key, 3600, pickle.dumps(hsk_level))
    return hsk_level


class TranslatedSentence(schemas.Sentence):
    translated_sentence: str


@router.get(
    "/sentence/{sentence_id}", response_model=TranslatedSentence, tags=["sentences"]
)
def get_sentence(sentence_id: int, db: Session = Depends(get_db)):
    """Get a specific sentence based on its ID."""
    sentence = crud.get_sentence(db, sentence_id)
    translated_sentence = helpers.translate_text(sentence, target_lang="EN")
    return {
        "id": sentence_id,
        "text": sentence.text,
        "translated_sentence": translated_sentence,
    }


# TODO: allow the user to search for characters in a string
# Also, try to normalize simplified and traditional characters
@router.get("/sentences", response_model=list[schemas.Sentence], tags=["sentences"])
def get_sentences(
        db: Session = Depends(get_db),
        limit: int = 100,
        offset: int = 0,
        keyword: str = None,
):
    """Get all sentences (subject to limit/keyword)."""
    sentences = crud.get_sentences(db, limit, offset, keyword)
    return sentences


@router.get("/dictionary", response_model=list[schemas.Entry], tags=["dictionary"])
def get_dictionary_entries(
        db: Session = Depends(get_db),
        limit: int = 20,
        keyword: str = None,
):
    """Get all entries in a dictionary (subject to limit/keyword)."""
    entries = crud.get_dictionary_entries(db, limit, keyword)
    return entries


# Define a Pydantic model for the request body
class TextInput(BaseModel):
    text: str


@router.post("/analyzer", tags=["analyzer"])
def analyze_text_submit(user_input: TextInput, db: Session = Depends(get_db)):
    """Split and analyze user text."""
    try:
        received_text = user_input.text
        split_text = helpers.split_text(received_text)

        word_counts = collections.Counter(split_text)

        # get all words at once to avoid the N+1 query problem
        hsk_words = crud.get_hsk_words(db)

        words_sorted_by_frequency = word_counts.most_common()

        # create a lookup table mapping simplified form to hsk level
        hsk_lookup = {word.simplified: word.level_id for word in hsk_words}

        word_info = [
            {
                "word": word,
                "count": count,
                "hsk_level": hsk_lookup.get(
                    word
                ),  # this returns None for non-HSK words
            }
            for word, count in words_sorted_by_frequency
        ]

        return word_info

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# POST endpoint to receive text from the React form
@router.post("/translator", tags=["translator"])
def submit_text(user_input: TextInput):
    """Translates user text."""
    # Process the text here (e.g., save to database, etc.)
    try:
        received_text = user_input.text
        # translate to chinese
        translated_text = helpers.translate_text(received_text, target_lang="ZH")

        return {"original_text": received_text, "translated_text": translated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wordlists/", response_model=schemas.WordList, tags=["user_lists"])
def create_wordlist(
        wordlist: schemas.WordListUpdate,
        current_user: Annotated[schemas.User, Depends(get_current_user)],
        db: Session = Depends(get_db),
):
    """Create a new wordlist."""
    if not current_user:
        raise HTTPException(status_code=403, detail="Not authorized.")

    return crud.create_word_list(db, name=wordlist.name, user_id=current_user.id)


@router.get(
    "/wordlists/{wordlist_id}", response_model=schemas.WordList, tags=["user_lists"]
)
def read_wordlist(
        wordlist_id: int,
        current_user: Annotated[schemas.User, Depends(get_current_user)],
        db: Session = Depends(get_db),
):
    """Get a specific wordlist based on ID."""
    if not current_user:
        return HTTPException(status_code=403, detail="Not authorized.")

    db_wordlist = crud.get_word_list(db, wordlist_id=wordlist_id)
    if db_wordlist is None:
        raise HTTPException(status_code=404, detail="Wordlist not found")

    return db_wordlist


@router.delete("/wordlists/{wordlist_id}", tags=["user_lists"])
def delete_wordlist(wordlist_id: int, db: Session = Depends(get_db)):
    """Delete a wordlist based on ID."""
    # TODO: check if the user owns the word list
    crud.delete_word_list(db, wordlist_id=wordlist_id)


@router.get("/wordlists/", response_model=list[schemas.WordList], tags=["user_lists"])
def read_wordlists(
        current_user: Annotated[schemas.User, Depends(get_current_user)],
        db: Session = Depends(get_db),
):
    """Get all wordlists for a user."""
    db_wordlists = crud.get_word_lists(db, user_id=current_user.id)
    return db_wordlists


# TODO: come up with a better endpoint
@router.get(
    "/wordlists/entries/{entry_id}", response_model=list[int], tags=["user_lists"]
)
def get_entry_wordlists(
        entry_id: int,
        current_user: Annotated[schemas.User, Depends(get_current_user)],
        db: Session = Depends(get_db),
):
    """Get ids of all wordlists containing a given entry (id)"""
    return crud.get_entry_word_lists(db, entry_id=entry_id, user_id=current_user.id)


@router.post(
    "/wordlists/add/{entry_id}",
    tags=["user_lists"],
)
def add_wordlist_entries(
        entry_id: int,
        add_wordlist_ids: Annotated[list[int] | None, Query()] = None,
        db: Session = Depends(get_db),
):
    """Add entry to a list of wordlists"""
    if add_wordlist_ids is not None:
        crud.add_entry_word_lists(db, entry_id=entry_id, wordlist_ids=add_wordlist_ids)


@router.delete(
    "/wordlists/remove/{entry_id}",
    tags=["user_lists"],
)
def delete_wordlist_entries(
        entry_id: int,
        remove_wordlist_ids: Annotated[list[int] | None, Query()] = None,
        db: Session = Depends(get_db),
):
    """Remove entry from a list of wordlists"""
    if remove_wordlist_ids is not None:
        crud.delete_entry_word_lists(
            db, entry_id=entry_id, wordlist_ids=remove_wordlist_ids
        )


@router.get("/videos/transcript", tags=["transcript"])
def get_transcription(video_url: str = "v=dQw4w9WgXcQ"):
    video_id = helpers.get_video_id(video_url)
    if video_id is None:
        raise HTTPException(status_code=400, detail="Invalid URL")
    try:
        return YouTubeTranscriptApi.get_transcript(video_id, languages=["zh"])
    except (NoTranscriptFound, NoTranscriptAvailable, TranscriptsDisabled):
        raise HTTPException(status_code=404, detail="No transcript available for this video")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


app.include_router(router)
