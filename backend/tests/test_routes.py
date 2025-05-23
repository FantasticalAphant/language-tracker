import pytest
import sqlalchemy
from fastapi.testclient import TestClient
from sqlalchemy.orm import sessionmaker

from backend.app.database import get_db
from backend.app.helpers import hash_password
from backend.app.main import app

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = sqlalchemy.create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# These two event listeners are only needed for sqlite for proper
# SAVEPOINT / nested transaction support. Other databases like postgres
# don't need them.
# From: https://docs.sqlalchemy.org/en/14/dialects/sqlite.html#serializable-isolation-savepoints-transactional-ddl
@sqlalchemy.event.listens_for(engine, "connect")
def do_connect(dbapi_connection, connection_record):
    # disable pysqlite's emitting of the BEGIN statement entirely.
    # also stops it from emitting COMMIT before any DDL.
    dbapi_connection.isolation_level = None


@sqlalchemy.event.listens_for(engine, "begin")
def do_begin(conn):
    # emit our own BEGIN
    conn.exec_driver_sql("BEGIN")


# This fixture is the main difference to before. It creates a nested
# transaction, recreates it when the application code calls session.commit
# and rolls it back at the end.
# Based on: https://docs.sqlalchemy.org/en/14/orm/session_transaction.html#joining-a-session-into-an-external-transaction-such-as-for-test-suites
@pytest.fixture()
def session():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    # Begin a nested transaction (using SAVEPOINT).
    nested = connection.begin_nested()

    # If the application code calls session.commit, it will end the nested
    # transaction. Need to start a new one when that happens.
    @sqlalchemy.event.listens_for(session, "after_transaction_end")
    def end_savepoint(session, transaction):
        nonlocal nested
        if not nested.is_active:
            nested = connection.begin_nested()

    yield session

    # Rollback the overall transaction, restoring the state before the test ran.
    session.close()
    transaction.rollback()
    connection.close()


# A fixture for the fastapi test client which depends on the
# previous session fixture. Instead of creating a new session in the
# dependency override as before, it uses the one provided by the
# session fixture.
@pytest.fixture()
def client(session):
    def override_get_db():
        yield session

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    del app.dependency_overrides[get_db]


@pytest.fixture()
def user():
    return {
        "username": "username@test.com",
        "password": "password",
        "hashed_password": hash_password("password"),
    }


@pytest.fixture()
def registered_user(client, user):
    response = client.post("/register", json=user)
    assert response.status_code == 200
    return user


@pytest.fixture()
def created_wordlist(client, registered_user):
    token = test_login(client, registered_user)
    response = client.post(
        "/wordlists",
        json={"name": "test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "test"

    # Add some entry numbers 1, 3, 5 to the list
    client.post("/wordlists/add/1", params={"add_wordlist_ids": [1]})
    client.post("/wordlists/add/3", params={"add_wordlist_ids": [1]})
    client.post("/wordlists/add/5", params={"add_wordlist_ids": [1]})

    return response.json()


def test_login(client, registered_user):
    response = client.post(
        "/token",
        data={
            "username": registered_user["username"],
            "password": registered_user["password"],
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    assert token is not None
    return token


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
def test_get_hsk_level_words(client, level, expected_count):
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
def test_get_sentence(client, sentence_id, sentence_text):
    """Check if the sentences are created."""
    response = client.get(f"/sentence/{sentence_id}")
    assert response.status_code == 200
    assert response.json()["text"] == sentence_text


def test_get_sentences_default(client):
    """Check if the number of sentences sent is correct."""
    response = client.get("/sentences")
    assert response.status_code == 200
    assert len(response.json()) == 100


def test_get_sentences_limit(client):
    """Check if the sentence limit is applied."""
    response = client.get("/sentences", params={"limit": 30000})
    assert response.status_code == 200
    assert len(response.json()) == 30000


def test_get_dictionary_entries_default(client):
    """Check if the dictionary entries are created."""
    response = client.get("/dictionary")
    assert response.status_code == 200
    assert len(response.json()) == 20


def test_get_dictionary_entries_limit(client):
    """Check if the entry limit is applied.."""
    response = client.get("/dictionary", params={"limit": 5000})
    assert response.status_code == 200
    assert len(response.json()) == 5000


@pytest.mark.parametrize(
    "initial_text,parsed_text",
    [
        ("这是个句子。", [
            {
                "word": "这",
                "count": 1,
                "hsk_level": 1
            },
            {
                "word": "是",
                "count": 1,
                "hsk_level": 1
            },
            {
                "word": "个",
                "count": 1,
                "hsk_level": 1
            },
            {
                "word": "句子",
                "count": 1,
                "hsk_level": 3
            }
        ]),
    ],
)
def test_analyzer_submit_text(client, initial_text, parsed_text):
    response = client.post(
        "/analyzer",
        json={
            "text": initial_text,
        },
    )
    assert response.status_code == 200
    assert response.json() == parsed_text


@pytest.mark.parametrize(
    "initial_text,parsed_text",
    [
        (
                "I wish I didn't have to live a life full of regrets.",
                "我希望我的人生不必充满遗憾。",
        ),
    ],
)
def test_translator_submit_text(client, initial_text, parsed_text):
    response = client.post("/translator", json={"text": initial_text})
    assert response.status_code == 200
    assert response.json()["translated_text"] == parsed_text


def test_read_wordlist_without_auth(client, created_wordlist):
    response = client.get("/wordlists/1")
    assert response.status_code == 401


def test_read_wordlist_with_auth(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    response = client.get("/wordlists/1", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200


def test_create_wordlist_without_auth(client):
    response = client.post("/wordlists", json={"name": "test"})
    assert response.status_code == 401


def test_create_wordlist_with_auth(client, registered_user):
    token = test_login(client, registered_user)
    response = client.post(
        "/wordlists",
        json={"name": "test"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["name"] == "test"


def test_read_wordlists(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    response = client.get("/wordlists", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_delete_wordlists(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    client.delete("/wordlists/1", headers={"Authorization": f"Bearer {token}"})
    response = client.get("/wordlists", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert len(response.json()) == 0


# TODO: need to implement this endpoint
def test_update_wordlists(client):
    response = client.post("/wordlists/entries/1", json={})


def test_get_entry_not_in_wordlist(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    response = client.get(
        "/wordlists/entries/1", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    # should return the ids for all lists containing entry number 1
    assert response.json() == [1]


def test_get_entry_in_wordlist(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    response = client.get(
        "/wordlists/entries/2", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 0


def test_add_wordlist_entries(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    # list should already contain entries 1, 3, and 5

    response = client.get(
        "/wordlists/entries/6", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 0

    # add entry number 6 to the list
    client.post("/wordlists/add/6", params={"add_wordlist_ids": [1]})

    response = client.get(
        "/wordlists/entries/6", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json() == [1]


def test_delete_wordlist_entries(client, registered_user, created_wordlist):
    token = test_login(client, registered_user)
    # list should already contain entries 1, 3, and 5

    response = client.get(
        "/wordlists/entries/5", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json() == [1]

    # remove entry 5 from the wordlist
    client.delete("/wordlists/remove/5", params={"remove_wordlist_ids": [1]})

    response = client.get(
        "/wordlists/entries/5", headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) == 0
