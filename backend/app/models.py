from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship

from backend.app.database import Base

# Association table for dictionary entries and user-defined vocab lists
wordlist_entries = Table(
    "wordlist_entries",
    Base.metadata,
    Column("wordlist_id", Integer, ForeignKey("wordlists.id"), primary_key=True),
    Column("entry_id", Integer, ForeignKey("entries.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)


class Sentence(Base):
    __tablename__ = "sentences"

    id = Column(Integer, primary_key=True)
    text = Column(String, index=True)

    def __repr__(self):
        return self.text


class Entry(Base):
    __tablename__ = "entries"

    id = Column(Integer, primary_key=True, index=True)
    simplified = Column(String, index=True)
    traditional = Column(String, index=True)

    pronunciations = relationship("Pronunciation", back_populates="entry")
    definitions = relationship("Definition", back_populates="entry")

    word_lists = relationship(
        "WordList", secondary=wordlist_entries, back_populates="entries"
    )

    @classmethod
    def create(cls, simplified, traditional, pronunciations, definitions):
        entry = cls(simplified=simplified, traditional=traditional)
        entry.pronunciations = [
            Pronunciation(pinyin=pinyin, position=i)
            for i, pinyin in enumerate(pronunciations)
        ]

        entry.definitions = [
            Definition(definition=definition) for definition in definitions
        ]

        return entry

    def __repr__(self):
        return (
            f"{self.simplified} ({self.traditional}) "
            f"{' '.join(p.pinyin for p in self.pronunciations)} - "
            f"{'; '.join(d.text for d in self.definitions)}"
        )


class Pronunciation(Base):
    __tablename__ = "pronunciations"

    id = Column(Integer, primary_key=True)
    entry_id = Column(Integer, ForeignKey("entries.id"), index=True)
    pinyin = Column(String, nullable=False, index=True)
    position = Column(Integer, nullable=True)

    entry = relationship("Entry", back_populates="pronunciations")


class Definition(Base):
    __tablename__ = "definitions"

    id = Column(Integer, primary_key=True)
    entry_id = Column(Integer, ForeignKey("entries.id"), index=True)
    definition = Column(String, nullable=True, index=True)

    entry = relationship("Entry", back_populates="definitions")


# Other Column properties to consider include nullable and field size
class HSKLevel(Base):
    __tablename__ = "hsk_levels"
    id = Column(Integer, primary_key=True, index=True)
    level = Column(Integer, unique=True, index=True)
    # TODO: find out what back_populates means
    word = relationship("Word", back_populates="level")

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
    level = relationship("HSKLevel", back_populates="word")

    def __repr__(self):
        return f"{self.simplified} ({self.traditional}) [{self.pinyin}] - {self.definition}"


class WordList(Base):
    __tablename__ = "wordlists"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    time_modified = Column(DateTime, index=True)
    time_created = Column(DateTime, index=True)
    # TODO: add user column after OAuth2 is implemented

    entries = relationship(
        "Entry", secondary=wordlist_entries, back_populates="word_lists"
    )
