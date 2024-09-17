import csv
import os
from pathlib import Path

from sqlalchemy.orm import sessionmaker

from database import Base, engine
from models import Word

ENCODING = "utf-8-sig"  # BOM (byte order mark)

MIN_LEVEL = 1
MAX_LEVEL = 6

BASE_DIR = Path(__file__).resolve().parent.parent
DICTIONARY_FILE = os.path.join(BASE_DIR, "resources", "hsk_lists")

Session = sessionmaker(bind=engine)
session = Session()


def create_tables():
    print("Creating database...")
    Base.metadata.create_all(engine)


def populate_from_file(session, file_path):
    # CSV FILE FIELDS
    # 0 - simplified characters
    # 1 - traditional characters
    # 2 - pinyin with tone numbers
    # 3 - pinyin with tone marks
    # 4 - definition
    for level in range(MIN_LEVEL, MAX_LEVEL + 1):
        with open(
                os.path.join(BASE_DIR, "resources", "hsk_lists", f"hsk{level}.csv"),
                mode="r",
                encoding=ENCODING,
        ) as f:
            csv_reader = csv.reader(f, delimiter="\t")
            for row in csv_reader:
                entry = Word(
                    simplified=row[0],
                    traditional=row[1],
                    pinyin=row[2],
                    definition=row[4],
                    level_id=level,
                )
                session.add(entry)

    session.commit()


if __name__ == "__main__":
    create_tables()
    populate_from_file(session, DICTIONARY_FILE)
    print("Database created and populated")
