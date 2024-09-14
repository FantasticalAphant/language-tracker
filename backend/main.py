from fastapi import FastAPI, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from . import crud
from . import schemas
from .database import get_db

app = FastAPI()

router = APIRouter()


@router.get("/")
async def root():
    return {"message": "Hello World"}


@router.get("/level/{level}/words", response_model=list[schemas.Word])
def get_hsk_level_words(level: int, db: Session = Depends(get_db), limit: int = 100, offset: int = 0):
    hsk_level = crud.get_words_by_level(db, level, limit, offset)
    if not hsk_level:
        raise HTTPException(status_code=404, detail="HSK Level not found")
    return hsk_level


@router.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}


app.include_router(router)
