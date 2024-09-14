from sqlalchemy.orm import Session

from . import models


def get_words_by_level(db: Session, level: int, limit: int = 100, offset: int = 0):
    return (
        db.query(models.Word)
        .filter(models.Word.level_id == level)
        .limit(limit)
        .offset(offset)
        .all()
    )
