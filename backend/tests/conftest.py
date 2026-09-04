"""
Pytest fixtures and configuration for FinSight AI backend tests.
Uses SQLite in-memory database for testing.
"""
import os
import sys

# Ensure backend is on the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import app.core.database as db_module
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
import pytest

# Override database to SQLite BEFORE importing the app
test_engine = create_engine("sqlite:///./test_finsight.db")
TestingSessionLocal = sessionmaker(bind=test_engine)

# Patch the module-level engine and SessionLocal so that any code
# that imported `engine` from app.core.database before the patch
# still works (we patch the attribute on the module object).
db_module.engine = test_engine
db_module.SessionLocal = TestingSessionLocal

Base = db_module.Base

# Override the get_db dependency
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def db():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client(db):
    from app.main import app
    from app.core.database import get_db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)
