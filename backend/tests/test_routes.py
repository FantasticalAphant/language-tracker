from datetime import datetime

import pytest
import sqlalchemy
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.database import get_db, Base
from backend.app.load_data import populate_hsk_lists, populate_dictionary, populate_sentences
from backend.app.main import app
from backend.app.models import WordList

SQLALCHEMY_DATABASE_URI = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_DATABASE_URI, connect_args={"check_same_thread": False})
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


# Initialize the database with real data once for the whole test session
@pytest.fixture(scope="session", autouse=True)
def initialize_test_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    # Create a session and populate with real data
    db = TestingSessionLocal()
    try:
        print("Populating test database with real data...")
        populate_hsk_lists(db)
        populate_dictionary(db)
        populate_sentences(db)
        db.commit()
        print("Test database populated successfully")
    except Exception as e:
        print(f"Error populating test database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

    yield  # This runs all the tests


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


@pytest.fixture
def sample_wordlists(db):
    current_time = datetime.now()

    wordlists = [
        WordList(
            name="List 1",
            time_created=current_time,
            time_modified=current_time,
        ),
        WordList(
            name="List 2",
            time_created=current_time,
            time_modified=current_time
        ),
        WordList(
            name="List 3",
            time_created=current_time,
            time_modified=current_time
        ),
    ]

    db.add_all(wordlists)
    db.commit()
    return [w.id for w in wordlists]


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
    response = client.get(f"/sentence/{sentence_id}")
    assert response.status_code == 200
    assert response.json()["text"] == sentence_text


def test_get_sentences_default():
    response = client.get("/sentences")
    assert response.status_code == 200
    assert len(response.json()) == 100


def test_get_sentences_limit():
    response = client.get("/sentences", params={"limit": 30000})
    assert response.status_code == 200
    assert len(response.json()) == 30000


def test_get_dictionary_entries_default():
    response = client.get("/dictionary")
    assert response.status_code == 200
    assert len(response.json()) == 20


def test_get_dictionary_entries_limit():
    response = client.get("/dictionary", params={"limit": 5000})
    assert response.status_code == 200
    assert len(response.json()) == 5000


def test_submit_text():
    response = client.post("/analyzer", json={})
    assert response.status_code == 200


def test_submit_test():
    response = client.post("/translator", json={})
    assert response.status_code == 200


def test_create_wordlist(db):
    response = client.post("/wordlists", json={"name": "Created List"})
    assert response.status_code == 200

    created_list = db.query(WordList).filter_by(name="Created List").first()
    assert created_list is not None
    assert created_list.name == "Created List"


def test_delete_wordlist():
    response = client.post("/wordlists", json={})


def test_read_wordlist(db, sample_wordlists):
    response = client.get("/wordlists/1")
    assert response.status_code == 200
    assert len(response.json()) == 2


def test_read_wordlists():
    response = client.get("/wordlists")


def test_get_entry_wordlists():
    response = client.get("/wordlists/entries/1")


def test_add_wordlist_entries():
    response = client.post("/wordlists/entries/1", json={})


def test_delete_wordlist_entries(db, sample_wordlists):
    response = client.delete("/wordlists/1")
