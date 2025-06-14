import pytest
from unittest.mock import patch, MagicMock
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os
import logging
import json

from app.core.config import settings

# Get logger instance
logger = logging.getLogger('test.firebase')

def test_firebase_initialization(firebase_credentials):
    """Test Firebase Admin SDK initialization with actual credentials"""
    logger.info("Testing Firebase initialization with actual credentials...")
    
    try:
        # Initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_credentials)
            app = firebase_admin.initialize_app(cred)
            assert app is not None
            logger.info("Firebase initialization successful")
    except Exception as e:
        logger.error(f"Firebase initialization failed: {str(e)}")
        raise
    finally:
        # Clean up
        if firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin._apps['[DEFAULT]'])

@patch('firebase_admin.auth.verify_id_token')
def test_firebase_token_verification(mock_verify, mock_firebase_token):
    """Test Firebase token verification with mocked token"""
    logger.info("Testing Firebase token verification...")
    
    # Mock the verify_id_token method
    mock_verify.return_value = mock_firebase_token
    
    try:
        # Test token verification
        test_token = "mock-firebase-token"
        decoded_token = firebase_auth.verify_id_token(test_token)
        
        # Verify token data
        assert decoded_token["phone_number"] == mock_firebase_token["phone_number"]
        assert decoded_token["uid"] == mock_firebase_token["uid"]
        assert "firebase" in decoded_token
        logger.info("Token verification successful")
        
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise

@patch('firebase_admin.auth.verify_id_token')
def test_firebase_token_verification_failure(mock_verify):
    """Test Firebase token verification failure"""
    logger.info("Testing Firebase token verification failure...")
    
    # Mock the verify_id_token method to raise an exception
    mock_verify.side_effect = firebase_auth.InvalidIdTokenError("Invalid token")
    
    try:
        # Test token verification with invalid token
        test_token = "invalid-token"
        with pytest.raises(firebase_auth.InvalidIdTokenError):
            firebase_auth.verify_id_token(test_token)
        logger.info("Token verification failure test passed")
        
    except Exception as e:
        logger.error(f"Token verification failure test failed: {str(e)}")
        raise

def test_firebase_phone_number_extraction(mock_firebase_token):
    """Test phone number extraction from Firebase token"""
    logger.info("Testing phone number extraction...")
    
    try:
        # Extract phone number from token
        phone_number = mock_firebase_token.get("phone_number")
        assert phone_number == "+919999999999"
        logger.info("Phone number extraction successful")
        
    except Exception as e:
        logger.error(f"Phone number extraction failed: {str(e)}")
        raise

@pytest.mark.integration
def test_firebase_actual_token_verification(firebase_credentials):
    """Test Firebase token verification with actual Firebase service"""
    logger.info("Testing Firebase token verification with actual service...")
    
    try:
        # Initialize Firebase with actual credentials
        if not firebase_admin._apps:
            cred = credentials.Certificate(firebase_credentials)
            firebase_admin.initialize_app(cred)
        
        # Note: This test requires a valid Firebase token
        # You should get this token from your frontend or Firebase console
        test_token = os.getenv('TEST_FIREBASE_TOKEN')
        if not test_token:
            pytest.skip("TEST_FIREBASE_TOKEN environment variable not set")
        
        # Verify token
        decoded_token = firebase_auth.verify_id_token(test_token)
        assert "phone_number" in decoded_token
        assert "uid" in decoded_token
        logger.info("Actual token verification successful")
        
    except Exception as e:
        logger.error(f"Actual token verification failed: {str(e)}")
        raise
    finally:
        # Clean up
        if firebase_admin._apps:
            firebase_admin.delete_app(firebase_admin._apps['[DEFAULT]']) 