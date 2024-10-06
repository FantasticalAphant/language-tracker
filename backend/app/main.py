import os
from pathlib import Path

import jieba
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

import crud
import helpers
import schemas
from database import get_db

# Set up file paths for jieba
BASE_DIR = Path(__file__).resolve().parent.parent
DICTIONARY_FILE = os.path.join(BASE_DIR, "resources", "dict.txt.big")

# initialize jieba on startup
jieba.setLogLevel(20)  # don't print initialization information
jieba.set_dictionary(DICTIONARY_FILE)
jieba.initialize()

tags_metadata = [
    {
        "name": "word lists",
        "description": "List of HSK words",
    },
    {
        "name": "sentences",
        "description": "List of example sentences"
    },
    {
        "name": "dictionary",
        "description": "List of dictionary entries"
    },
    {
        "name": "analyzer",
        "description": "Text analyzer"
    },
    {
        "name": "translator",
        "description": "Text translator"
    },
    {
        "name": "user lists",
        "description": "User-created vocabulary lists",
    },
]

app = FastAPI(tags_metadata=tags_metadata)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
router = APIRouter()


@router.get("/level/{level}/words", response_model=list[schemas.Word], tags=["word_lists"])
def get_hsk_level_words(level: int, db: Session = Depends(get_db)):
    hsk_level = crud.get_words_by_level(db, level)
    if not hsk_level:
        raise HTTPException(status_code=404, detail="HSK Level not found")
    return hsk_level


# TODO: allow the user to search for characters in a string
# Also, try to normalize simplified and traditional characters
@router.get("/sentences", response_model=list[schemas.Sentence], tags=["sentences"])
def get_sentences(db: Session = Depends(get_db), limit: int = 100, offset: int = 0, keyword: str = None):
    sentences = crud.get_sentences(db, limit, offset, keyword)
    if not sentences:
        raise HTTPException(status_code=404, detail="Sentences not found")
    return sentences


@router.get("/dictionary", response_model=list[schemas.Entry], tags=["dictionary"])
def get_dictionary_entries(db: Session = Depends(get_db), limit: int = 100, offset: int = 0):
    entries = crud.get_dictionary_entries(db, limit, offset)
    if not entries:
        raise HTTPException(status_code=404, detail="Dictionary entries not found")
    return entries


# Define a Pydantic model for the request body
class TextInput(BaseModel):
    text: str


# POST endpoint to receive text from the React form
@router.post("/analyzer", tags=["analyzer"])
async def submit_text(user_input: TextInput):
    # Process the text here (e.g., save to database, etc.)
    try:
        received_text = user_input.text
        split_text = helpers.split_text(received_text)
        # Do something with received_text
        print(f"Received text: {received_text}")

        # Return a success message or any other response
        return {"message": "Text received successfully", "text": split_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# POST endpoint to receive text from the React form
@router.post("/translator", tags=["translator"])
async def submit_text(user_input: TextInput):
    # Process the text here (e.g., save to database, etc.)
    try:
        received_text = user_input.text
        translated_text = helpers.translate_text(received_text)
        # Do something with received_text
        print(f"Received text: {received_text}")

        # Return a success message or any other response
        return {"message": "Text received successfully", "text": translated_text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/wordlists/", response_model=schemas.WordList, tags=["wordlists"])
def create_wordlist(wordlist: schemas.WordListUpdate, db: Session = Depends(get_db)):
    return crud.create_word_list(db, name=wordlist.name)


@router.get("/wordlists/{wordlist_id}", response_model=schemas.WordList, tags=["wordlists"])
def read_wordlist(wordlist_id: int, db: Session = Depends(get_db)):
    db_wordlist = crud.get_word_list(db, wordlist_id=wordlist_id)
    if db_wordlist is None:
        raise HTTPException(status_code=404, detail="Wordlist not found")
    return db_wordlist


@router.get("/wordlists/", response_model=list[schemas.WordList], tags=["wordlists"])
def read_wordlists(db: Session = Depends(get_db)):
    db_wordlists = crud.get_word_lists(db)
    if db_wordlists is None:
        raise HTTPException(status_code=404, detail="Wordlists not found")
    return db_wordlists


app.include_router(router)
