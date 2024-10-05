from datetime import datetime

from sqlalchemy.orm import Session

import models


def get_sentences(db: Session, limit: int = 100, offset: int = 0):
    return db.query(models.Sentence).offset(offset).limit(limit).all()


# def get_sentences_by_keyword(db: Session, keyword: str, limit: int = 100, offset: int = 0):
#     return (
#         db.query(models.Sentence)
#         .filter(models.Sentence.text.contains(keyword))
#         .limit(limit)
#         .offset(offset)
#         .all()
#     )


def get_words_by_level(db: Session, level: int):
    return (
        db.query(models.Word)
        .filter(models.Word.level_id == level)
        .all()
    )


def get_dictionary_entries(db: Session, limit: int = 100, offset: int = 0):
    return (
        db.query(models.Entry)
        .limit(limit)
        .offset(offset)
        .all()
    )


def create_word_list(db: Session, name: str):
    wordlist = models.WordList(
        name=name,
        time_created=datetime.now(),
        time_modified=datetime.now()
    )

    db.add(wordlist)
    db.commit()
    db.refresh(wordlist)

    return wordlist


def get_word_list(db: Session, wordlist_id: int):
    return db.query(models.WordList).filter(models.WordList.id == wordlist_id).first()


def get_word_lists(db: Session):
    return db.query(models.WordList).all()

# def update_word_list(db: Session, wordlist_id: int, entry_ids: list[int]):
#     wordlist = get_word_list(db, wordlist_id)
#
#     entries = db.query(models.Entry).filter(models.Entry.id.in_(entry_ids)).all()
#     wordlist.entries.extend(entries)
#
#     db.refresh(wordlist)
