import jieba


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
