from datetime import datetime

from sqlalchemy import func, tuple_
from sqlalchemy.orm import Session

import backend.app.models as models
from backend.app.helpers import is_chinese_script, hash_password


def create_user(db: Session, username: str, password: str):
    """Create a new user based on the username and hashed password"""
    hashed_password = hash_password(password)
    user = models.User(username=username, hashed_password=hashed_password)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


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
    """Get a sentence based on its ID"""
    return db.query(models.Sentence).filter(models.Sentence.id == sentence_id).first()


def get_hsk_words(db: Session):
    """Get all HSK words"""
    return db.query(models.Word).all()


def get_hsk_words_by_level(db: Session, level: int):
    """Get all words for an HSK level"""
    return db.query(models.Word).filter(models.Word.level_id == level).all()


def get_dictionary_entries(db: Session, limit: int = 20, keyword: str = None):
    """Get all dictionary entries"""
    # TODO: search character or pinyin depending on keyword type

    # need to parse the search string and then map that to the individual components
    # for example, ji1lei3 (积累) should be parsed into "ji1" and "lei3"
    # note that the position of each part is also important
    # so ji1 should be part 0 and lei3 should be part 1 with the same entry id
    # this mapping with designate a matching result and would be part of the search results

    # if the user omits tones, then the search query would be jilei
    # the hardest part would probably be parsing this output
    # find the matching pinyin would just be a matter of excluding the tones from database searches
    # "ji" and "lei" would just be matched with starts_with() or its equivalent

    # another case would be "ji lei"
    # you can just split along whitespace for this case

    # TODO: figure out how to search if there is hanzi mixed with pinyin
    # probably best to implement pinyin search first since this supposedly targeting mandarin learners

    # search the entries table if trying to find matching characters

    pinyin_list = ["ji1", "lei3"]

    # otherwise, search through the pronunciations table

    # TODO: clean up this logic; it's way too messy
    if keyword:  # search by query if it exists
        if is_chinese_script(keyword):
            query = db.query(models.Entry).filter(models.Entry.simplified.contains(keyword))
            return query.limit(limit).all()
        else:
            # the input would be a list of the pinyin components
            # so it would basically be ["ji1", "lei3"] or ["ji", "lei"]
            # it would then match each of these parts to the index e.g., ji -> 0 and lei -> 1

            position_pinyin_pairs = [(i, p) for i, p in enumerate(pinyin_list)]

            query = (
                db.query(models.Pronunciation.entry_id)
                .filter(
                    # use tuple to make sure that both position and pinyin match
                    tuple_(models.Pronunciation.position, models.Pronunciation.pinyin)
                    .in_(position_pinyin_pairs)
                )
                .group_by(models.Pronunciation.entry_id)
                .having(func.count(models.Pronunciation.entry_id) == len(pinyin_list))  # for complete matches
            )
    else:
        query = db.query(models.Entry)
        return query.limit(limit).all()

    entries = [row.entry_id for row in query.all()]
    return db.query(models.Entry).filter(models.Entry.id.in_(entries)).all()  # return as list of Entries


def create_word_list(db: Session, name: str, user_id: int):
    """Create a new word list"""
    wordlist = models.WordList(
        name=name,
        time_created=datetime.now(),
        time_modified=datetime.now(),
        user_id=user_id,
    )

    db.add(wordlist)
    db.commit()
    db.refresh(wordlist)

    return wordlist


def get_word_list(db: Session, wordlist_id: int):
    """Get a single word list based on the ID"""
    return db.query(models.WordList).filter(models.WordList.id == wordlist_id).first()


def delete_word_list(db: Session, wordlist_id: int):
    """Delete a word list based on the ID"""
    db.query(models.WordList).filter(models.WordList.id == wordlist_id).delete()
    db.commit()


def get_word_lists(db: Session, user_id: int):
    """Get all word lists for the user"""
    return db.query(models.WordList).filter(models.WordList.user_id == user_id).all()


def get_entry_word_lists(db: Session, entry_id: int, user_id: int):
    """Get all word lists that contain the specified entry"""
    entry = db.query(models.Entry).filter(models.Entry.id == entry_id).first()
    return [wordlist.id for wordlist in entry.word_lists if wordlist.user_id == user_id]


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
