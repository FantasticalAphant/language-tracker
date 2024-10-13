import jieba
import requests


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


# FIXME: remove hard-coded API key
TRANSLATION_API_KEY = "d17c5da4-5e06-48b1-188e-70bd69e05d7b:fx"
TRANSLATION_API_URL = "https://api-free.deepl.com/v2/translate"


def translate_text(text):
    params = {
        "auth_key": TRANSLATION_API_KEY,
        "text": text,
        "target_lang": "ZH",
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
