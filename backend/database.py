from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the absolute path to the directory where this script is located
# Otherwise, it's going to refer to the directory where the project is being run

base_dir = Path(__file__).resolve().parent
DATABASE_URL = f"sqlite:///{base_dir}/tracker.db"
# DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost:2024/postgres"


engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
