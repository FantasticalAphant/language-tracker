import pytest
from fastapi.testclient import TestClient

from backend.app.main import app

client = TestClient(app)


@pytest.mark.parametrize(
    "level,expected_count",
    [
        (1, 150),
        (2, 151),
        (3, 300),
        (4, 600),
        (5, 1300),
        (6, 2500),
    ],
)
def test_get_hsk_level_words(level, expected_count):
    """
    Check if the lengths of the HSK lists match up.
    Basically just checking if the HSK lists are actually created.
    """
    response = client.get(
        f"/level/{level}/words",
    )
    assert response.status_code == 200
    assert len(response.json()) == expected_count


@pytest.mark.parametrize(
    "sentence_id,sentence_text",
    [
        (1, "我們試試看！"),
        (100, "十分感谢。"),
        (148, "我觉得这个网站的构思非常好。"),
        (360, "如果我现在有100万日元，我会买辆车。"),
        (72501, "你空闲的时候一般做些什么？"),
    ],
)
def test_get_sentence(sentence_id, sentence_text):
    """Check if the sentences are created."""
    response = client.get(f"/sentence/{sentence_id}")
    assert response.status_code == 200
    assert response.json()["text"] == sentence_text


def test_get_sentences_default():
    """Check if the number of sentences sent is correct."""
    response = client.get("/sentences")
    assert response.status_code == 200
    assert len(response.json()) == 100


def test_get_sentences_limit():
    """Check if the sentence limit is applied."""
    response = client.get("/sentences", params={"limit": 30000})
    assert response.status_code == 200
    assert len(response.json()) == 30000


def test_get_dictionary_entries_default():
    """Check if the dictionary entries are created."""
    response = client.get("/dictionary")
    assert response.status_code == 200
    assert len(response.json()) == 20


def test_get_dictionary_entries_limit():
    """Check if the entry limit is applied.."""
    response = client.get("/dictionary", params={"limit": 5000})
    assert response.status_code == 200
    assert len(response.json()) == 5000


@pytest.mark.parametrize(
    "initial_text,parsed_text",
    [
        ("这是个句子。", ["这", "是", "个", "句子"]),
    ],
)
def test_analyzer_submit_text(initial_text, parsed_text):
    response = client.post("/analyzer", json={
        "text": initial_text,
    })
    assert response.status_code == 200
    assert response.json()["text"] == parsed_text


@pytest.mark.parametrize(
    "initial_text,parsed_text",
    [
        ("I wish I didn't have to live a life full of regrets.", "我希望我的人生不必充满遗憾。"),
    ],
)
def test_translator_submit_text(initial_text, parsed_text):
    response = client.post("/translator", json={
        "text": initial_text
    })
    assert response.status_code == 200
    assert response.json()["text"] == parsed_text


def test_create_wordlist():
    response = client.post("/wordlists", json={})


def test_read_wordlist():
    response = client.get("/wordlists/1")


def test_read_wordlists():
    response = client.get("/wordlists")


def test_get_entry_wordlists():
    response = client.get("/wordlists/entries/1")


def test_update_wordlists():
    response = client.post("/wordlists/entries/1", json={})


def test_delete_wordlists():
    response = client.delete("/wordlists/1")
