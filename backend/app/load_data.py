import csv
import os
import re
from pathlib import Path

from sqlalchemy.orm import sessionmaker

from backend.app.models import Word, Entry, Sentence
from database import engine

ENCODING = "utf-8-sig"  # BOM (byte order mark)

# Min and Max levels for HSK lists
MIN_LEVEL = 1
MAX_LEVEL = 6

BASE_DIR = Path(__file__).resolve().parent.parent
HSK_LIST_DIR = os.path.join(BASE_DIR, "resources", "hsk_lists")
DICTIONARY_FILE = os.path.join(BASE_DIR, "resources", "cedict_ts.u8")
SENTENCES_FILE = os.path.join(BASE_DIR, "resources", "sentences.txt")

Session = sessionmaker(bind=engine)
session = Session()


def populate_hsk_lists(session, batch_size=3000):
    # CSV FILE FIELDS
    # 0 - simplified characters
    # 1 - traditional characters
    # 2 - pinyin with tone numbers
    # 3 - pinyin with tone marks
    # 4 - definition
    for level in range(MIN_LEVEL, MAX_LEVEL + 1):
        batch = []
        # go through each HSK file and populate the database
        with open(
            os.path.join(HSK_LIST_DIR, f"hsk{level}.csv"),
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
                batch.append(entry)
                if len(batch) >= batch_size:
                    session.bulk_save_objects(batch)
                    batch.clear()

            if batch:
                session.bulk_save_objects(batch)

    session.commit()


PARSE_REGEX = r"^\[(.*)\] /(.*)/$"  # always use raw strings for regex


def _parse_rest(line: str) -> tuple[list[str], list[str]]:
    """Parse pronunciation and definition"""
    m = re.match(PARSE_REGEX, line)

    # pronunciation inside square brackets
    # definition inside slashes
    if m is not None:
        pronunciations = m.groups()[0].split()  # pronunciations
        definitions = m.groups()[1].split("/")  # definitions
        return pronunciations, definitions
    raise SystemExit(1)


def _is_surname(line: list[str], definitions: list[str]) -> bool:
    """Check if entry is a surname"""
    # remove surnames by checking for first letter in pinyin + 'surname' in def
    # speed of parsing the dictionary shouldn't matter too much
    if line[0][0].isupper() and len(definitions) == 1:
        for definition in definitions:
            return "surname" in definition.lower()
    return False


# refactor so that this returns a value; design smell
def _parse_entry(line: str) -> tuple[str, str, list[str], list[str]] | None:
    """Parse entry into simplified, pronunciation, and definition"""

    # first word is traditional
    # second word is simplified

    traditional, simplified, rest = line.split(maxsplit=2)
    pronunciation, definition = _parse_rest(rest)

    # do not include entry into database if it is a surname
    if _is_surname(pronunciation, definition):
        return None

    return simplified, traditional, pronunciation, definition


def populate_dictionary(session):
    # File source: https://www.mdbg.net/chinese/dictionary?page=cc-cedict

    print("Importing dictionary...")
    with open(DICTIONARY_FILE, "rt") as file:
        for line in file:
            if line.startswith("#"):
                continue  # ignore comments at the beginning of the file

            if result := _parse_entry(line):
                simplified, traditional, pronunciations, definitions = result
                # TODO: use a normalized design instead since current implementation doesn't allow for pinyin search
                # NOTE: serialize since SQLAlchemy doesn't support lists
                # To deserialize, use json.loads()
                entry = Entry.create(
                    simplified=simplified,
                    traditional=traditional,
                    pronunciations=pronunciations,
                    definitions=definitions,
                )
                session.add(entry)

    session.commit()


def populate_sentences(session, batch_size=1000):
    """Store sentences from file into database"""
    # Source: https://tatoeba.org/en/downloads

    with open(SENTENCES_FILE, "rt") as file:
        batch = []  # use batched operations to speed things up
        for line in file:
            batch.append(Sentence(text=line.strip()))
            if len(batch) >= batch_size:
                session.bulk_save_objects(batch)
                batch.clear()
        if batch:
            session.bulk_save_objects(batch)

    session.commit()


def populate_from_files(session):
    populate_hsk_lists(session)
    populate_dictionary(session)
    populate_sentences(session)


if __name__ == "__main__":
    populate_from_files(session)
    print("Database created and populated")
