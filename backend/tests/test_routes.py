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
    response = client.get(f"/sentence/{sentence_id}")
    assert response.status_code == 200
    assert response.json()["text"] == sentence_text


def test_get_sentences():
    response = client.get("/sentences")


def test_get_dictionary_entries():
    response = client.get("/dictionary")


def test_submit_text():
    response = client.post("/analyzer", json={})


def test_submit_test():
    response = client.post("/translator", json={})


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
