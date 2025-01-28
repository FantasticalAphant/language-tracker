import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jieba
import jwt
import requests
from dotenv import load_dotenv
from passlib.context import CryptContext

# Maybe move security stuff to security.py or something like that?

env_path = Path(__file__).resolve().parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


def split_text(text: str) -> list[str]:
    """Split text using jieba and remove all punctuation"""
    return list(filter(lambda w: w.isalnum(), jieba.lcut(text, cut_all=True)))


# def analyze_text(text: str) -> list[Entry]:
#     """Parses text and checks for HSK frequency"""
#     # Search using simplified and traditional characters
#     return [
#         Entry.objects.filter(Q(simplified=word) | Q(traditional=word))
#         for word in _split_text(text)
#     ]


TRANSLATION_API_KEY = os.getenv("TRANSLATION_API_KEY")
TRANSLATION_API_URL = os.getenv("TRANSLATION_API_URL")


def translate_text(text: str, target_lang: str):
    params = {
        "auth_key": TRANSLATION_API_KEY,
        "text": text,
        "target_lang": target_lang,
    }

    response = requests.post(TRANSLATION_API_URL, data=params)
    translated_text = response.json()["translations"][0]["text"]
    return translated_text


def is_chinese_script(characters):
    character_ranges = [
        (0x4E00, 0x9FFF),  # CJK Unified Ideographs
        (0x3400, 0x4DBF),  # CJK Unified Ideographs Extension A
        (0x20000, 0x2A6DF),  # CJK Unified Ideographs Extension B
        (0x2A700, 0x2B73F),  # CJK Unified Ideographs Extension C
        (0x2B740, 0x2B81F),  # CJK Unified Ideographs Extension D
        (0x2B820, 0x2CEAF),  # CJK Unified Ideographs Extension E
        (0x2CEB0, 0x2EBEF),  # CJK Unified Ideographs Extension F
    ]

    # if any character is chinese, search by character instead of pinyin
    for character in characters:
        codepoint = ord(character)
        if any(start <= codepoint <= end for start, end in character_ranges):
            return True

    return False
