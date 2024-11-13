from datetime import datetime

from sqlalchemy.orm import Session

import models
from helpers import is_chinese_script


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


def get_sentence(db: Session, sentence_id: int):
    return db.query(models.Sentence).filter(models.Sentence.id == sentence_id).first()


def get_words_by_level(db: Session, level: int):
    """Get all words for an HSK level"""
    return db.query(models.Word).filter(models.Word.level_id == level).all()


def get_dictionary_entries(db: Session, limit: int = 25, keyword: str = None):
    """Get all dictionary entries"""
    # TODO: search character or pinyin depending on keyword type
    query = db.query(models.Entry)

    if keyword:  # search by query if it exists
        if is_chinese_script(keyword):
            query = query.filter(models.Entry.simplified.contains(keyword))
        else:
            query = query.join(models.Entry.pronunciations).filter(
                models.Pronunciation.pinyin.contains(keyword)
            )

    return query.limit(limit).all()


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


def get_entry_word_lists(db: Session, entry_id: int):
    """Get all word lists that contain the specified entry"""
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    return [wordlist.id for wordlist in entry.word_lists]


def add_entry_word_lists(db: Session, wordlist_ids: list[int], entry_id: int):
    """Add to the word lists a specific entry"""

    # TODO: check if the word is already in the list

    word_lists = (
        db.query(models.WordList).filter(models.WordList.id.in_(wordlist_ids)).all()
    )
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()

    for word_list in word_lists:
        if entry not in word_list.entries:
            word_list.entries.append(entry)

    db.commit()

    return word_lists  # just return the updated word lists for now


def delete_entry_word_lists(db: Session, wordlist_ids: list[int], entry_id: int):
    """Delete from the word lists a specific entry"""
    word_lists = (
        db.query(models.WordList).filter(models.WordList.id.in_(wordlist_ids)).all()
    )
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()

    for word_list in word_lists:
        word_list.entries.remove(entry)

    db.commit()

    return word_lists
