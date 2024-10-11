from datetime import datetime

from sqlalchemy.orm import Session

import models


def get_sentences(db: Session, limit: int = 100, offset: int = 0, keyword: str = None):
    """Get all sentences in accordance to limit and offset"""
    if keyword:  # search by query if it exists
        return (
            db.query(models.Sentence)
            .filter(models.Sentence.text.contains(keyword))
            .limit(limit)
            .offset(offset)
            .all()
        )

    return db.query(models.Sentence).offset(offset).limit(limit).all()


def get_words_by_level(db: Session, level: int):
    """Get all words for an HSK level"""
    return db.query(models.Word).filter(models.Word.level_id == level).all()


def get_dictionary_entries(db: Session, limit: int = 100, offset: int = 0):
    """Get all dictionary entries"""
    return db.query(models.Entry).limit(limit).offset(offset).all()


def create_word_list(db: Session, name: str):
    """Create a new word list"""
    wordlist = models.WordList(
        name=name, time_created=datetime.now(), time_modified=datetime.now()
    )

    db.add(wordlist)
    db.commit()
    db.refresh(wordlist)

    return wordlist


def get_word_list(db: Session, wordlist_id: int):
    """Get a single word list based on the id"""
    return db.query(models.WordList).filter(models.WordList.id == wordlist_id).first()


def get_word_lists(db: Session):
    """Get all word lists"""
    return db.query(models.WordList).all()


# def update_word_list(db: Session, wordlist_id: int, entry_ids: list[int]):
#     wordlist = get_word_list(db, wordlist_id)
#
#     entries = db.query(models.Entry).filter(models.Entry.id.in_(entry_ids)).all()
#     wordlist.entries.extend(entries)
#
#     db.refresh(wordlist)
