import pytest
import os
import sys
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from dotenv import load_dotenv
import json

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

# Load environment variables from .env file
load_dotenv(os.path.join(backend_dir, '.env'))

from app.core.database import Base
from app.main import app
from app.core.config import settings

# Configure logging for tests
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Create test database URL by appending _test to the database name
TEST_DATABASE_URL = DATABASE_URL.rsplit('/', 1)[0] + '/test_' + DATABASE_URL.rsplit('/', 1)[1]

@pytest.fixture(scope="session")
def test_engine():
    """Create a test database engine"""
    logging.info(f"Creating test database engine with URL: {TEST_DATABASE_URL}")
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    yield engine
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create a test database session"""
    logging.info("Creating test database session...")
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(scope="session")
def client():
    """Create a test client"""
    return TestClient(app)

@pytest.fixture(scope="session")
def firebase_credentials():
    """Get Firebase credentials from environment"""
    creds_json = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    if not creds_json:
        raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set")
    try:
        return json.loads(creds_json)
    except json.JSONDecodeError as e:
        raise ValueError(f"Invalid JSON in FIREBASE_SERVICE_ACCOUNT_KEY: {str(e)}")

@pytest.fixture(scope="session")
def mock_firebase_token():
    """Mock Firebase token data for isolated tests"""
    return {
        "phone_number": "+919999999999",
        "uid": "test-uid",
        "firebase": {
            "identities": {
                "phone": ["+919999999999"]
            },
            "sign_in_provider": "phone"
        }
    } 