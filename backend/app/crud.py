from sqlalchemy.orm import Session

import models


def get_sentences(db: Session, limit: int = 100, offset: int = 0):
    return db.query(models.Sentence).offset(offset).limit(limit).all()


def get_words_by_level(db: Session, level: int, limit: int = 100, offset: int = 0):
    return (
        db.query(models.Word)
        .filter(models.Word.level_id == level)
        .limit(limit)
        .offset(offset)
        .all()
    )
