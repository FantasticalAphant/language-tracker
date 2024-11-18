import datetime

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class User(BaseModel):
    username: str
    email: str | None = None
    full_name: str | None = None
    disabled: bool | None = None


class Sentence(BaseModel):
    id: int
    text: str


class PronunciationBase(BaseModel):
    pinyin: str
    position: int


class DefinitionBase(BaseModel):
    definition: str


class Entry(BaseModel):
    id: int
    simplified: str
    traditional: str
    pronunciations: list[PronunciationBase]
    definitions: list[DefinitionBase]


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
