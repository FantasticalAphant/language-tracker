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
