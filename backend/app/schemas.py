import datetime

from pydantic import BaseModel


class Sentence(BaseModel):
    text: str


class Entry(BaseModel):
    id: int
    simplified: str
    traditional: str
    pinyin: str
    definition: str


class WordBase(BaseModel):
    simplified: str
    traditional: str
    pinyin: str
    definition: str


class Word(WordBase):
    id: int
    level_id: int

    class Config:
        # TODO: what does this do?
        from_attributes = True


class HSKLevel(BaseModel):
    id: int
    level: int
    words: list[Word]

    class Config:
        from_attributes = True


class WordListUpdate(BaseModel):
    name: str


class WordList(BaseModel):
    id: int
    name: str
    time_modified: datetime.datetime
    time_created: datetime.datetime
    entries: list[Entry]

    class Config:
        from_attributes = True
