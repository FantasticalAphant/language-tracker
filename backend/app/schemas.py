from pydantic import BaseModel


class Sentence(BaseModel):
    text: str


class Entry(BaseModel):
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
