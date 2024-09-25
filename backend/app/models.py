from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import Relationship

from database import Base


# Create your models here.
class Sentence(Base):
    __tablename__ = 'sentences'

    id = Column(Integer, primary_key=True)
    text = Column(String, index=True)

    def __repr__(self):
        return self.text


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    simplified = Column(String, index=True)
    traditional = Column(String, index=True)
    pinyin = Column(String, index=True)
    definition = Column(String, index=True)

    def __repr__(self):
        return f"{self.simplified} ({self.traditional}) {self.pinyin} - {self.definition}"


# Other Column properties to consider include nullable and field size
class HSKLevel(Base):
    __tablename__ = "hsk_levels"
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, unique=True, index=True)
    # TODO: find out what back_populates means
    word = Relationship("Word", back_populates="level")

    # TODO: add repr for printing


class Word(Base):
    __tablename__ = "words"
    id = Column(Integer, primary_key=True, index=True)
    simplified = Column(String, index=True)
    traditional = Column(String, index=True)
    pinyin = Column(String, index=True)
    definition = Column(String, index=True)

    # Create another class with level_id and level information?
    # These fields might also be redundant
    level_id = Column(Integer, ForeignKey("hsk_levels.id"))
    level = Relationship("HSKLevel", back_populates="word")

    def __repr__(self):
        return f"{self.simplified} ({self.traditional}) [{self.pinyin}] - {self.definition}"
