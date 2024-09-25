from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db

tags_metadata = [
    {
        "name": "word lists",
        "description": "List of HSK words",
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


@router.get("/")
async def root():
    return {"message": "Hello World"}


@router.get("/level/{level}/words", response_model=list[schemas.Word], tags=["word_lists"])
def get_hsk_level_words(level: int, db: Session = Depends(get_db), limit: int = 100, offset: int = 0):
    hsk_level = crud.get_words_by_level(db, level, limit, offset)
    if not hsk_level:
        raise HTTPException(status_code=404, detail="HSK Level not found")
    return hsk_level


@router.get("/sentences", response_model=list[schemas.Sentence], tags=["sentences"])
def get_sentences(db: Session = Depends(get_db), limit: int = 100, offset: int = 0):
    sentences = crud.get_sentences(db, limit, offset)
    if not sentences:
        raise HTTPException(status_code=404, detail="Sentences not found")
    return sentences


@router.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


app.include_router(router)
