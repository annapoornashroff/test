import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime

from app.main import app
from app.core.config import settings

client = TestClient(app)

@pytest.fixture
def mock_firebase_token():
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

@pytest.fixture
def mock_firebase_auth():
    with patch('firebase_admin.auth.verify_id_token') as mock_verify:
        mock_verify.return_value = {
            "phone_number": "+919999999999",
            "uid": "test-uid",
            "firebase": {
                "identities": {
                    "phone": ["+919999999999"]
                },
                "sign_in_provider": "phone"
            }
        }
        yield mock_verify

def test_firebase_signup_new_user(mock_firebase_auth):
    """Test Firebase signup for a new user"""
    # Test data
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "city": "Test City"
    }
    
    # Mock Firebase token
    test_token = "mock-firebase-token"
    
    # Make request
    response = client.post(
        "/api/v1/auth/firebase-signup",
        json=test_data,
        headers={"Authorization": f"Bearer {test_token}"}
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == test_data["name"]
    assert data["email"] == test_data["email"]
    assert data["city"] == test_data["city"]
    assert data["phone_number"] == "+919999999999"
    assert data["is_verified"] is True

def test_firebase_signup_existing_user(mock_firebase_auth):
    """Test Firebase signup for an existing user"""
    # First create a user
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "city": "Test City"
    }
    
    test_token = "mock-firebase-token"
    
    # Create initial user
    client.post(
        "/api/v1/auth/firebase-signup",
        json=test_data,
        headers={"Authorization": f"Bearer {test_token}"}
    )
    
    # Update user data
    updated_data = {
        "name": "Updated User",
        "email": "updated@example.com",
        "city": "Updated City"
    }
    
    # Make update request
    response = client.post(
        "/api/v1/auth/firebase-signup",
        json=updated_data,
        headers={"Authorization": f"Bearer {test_token}"}
    )
    
    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == updated_data["name"]
    assert data["email"] == updated_data["email"]
    assert data["city"] == updated_data["city"]
    assert data["phone_number"] == "+919999999999"
    assert data["is_verified"] is True

def test_firebase_signup_invalid_token():
    """Test Firebase signup with invalid token"""
    test_data = {
        "name": "Test User",
        "email": "test@example.com",
        "city": "Test City"
    }
    
    # Make request with invalid token
    response = client.post(
        "/api/v1/auth/firebase-signup",
        json=test_data,
        headers={"Authorization": "Bearer invalid-token"}
    )
    
    # Assertions
    assert response.status_code == 401
    assert "Invalid Firebase token" in response.json()["detail"] 