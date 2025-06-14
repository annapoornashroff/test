import pytest
from sqlalchemy.exc import SQLAlchemyError
import logging
from datetime import datetime

from app.models.user import User

# Get logger instance
logger = logging.getLogger('test.user_operations')

@pytest.mark.create
def test_create_user(test_db):
    """Test user creation in database"""
    logger.info("=== Testing User Creation ===")
    
    # Test data
    test_user = {
        "phone_number": "+919999999999",  # Unique phone number
        "name": "Test User",
        "email": "test@example.com",
        "city": "Test City",
        "firebase_uid": "test-uid",
        "is_verified": True
    }
    
    try:
        # Create user
        logger.info(f"Creating user with data: {test_user}")
        user = User(**test_user)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        # Verify user was created
        assert user.id is not None, "User ID should not be None"
        assert user.phone_number == test_user["phone_number"], "Phone number should match"
        assert user.name == test_user["name"], "Name should match"
        assert user.email == test_user["email"], "Email should match"
        assert user.city == test_user["city"], "City should match"
        assert user.firebase_uid == test_user["firebase_uid"], "Firebase UID should match"
        assert user.is_verified == test_user["is_verified"], "Verification status should match"
        
        logger.info(f"User created successfully with ID: {user.id}")
        logger.info(f"User data: {user.__dict__}")
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"User creation failed: {str(e)}")
        raise

@pytest.mark.delete
def test_delete_user(test_db):
    """Test user deletion from database"""
    logger.info("=== Testing User Deletion ===")
    
    # First create a user to delete
    test_user = {
        "phone_number": "+919999999991",  # Unique phone number
        "name": "Test User to Delete",
        "email": "delete@example.com",
        "city": "Test City",
        "firebase_uid": "test-uid-delete",
        "is_verified": True
    }
    
    try:
        # Create user
        logger.info("Creating user for deletion test...")
        user = User(**test_user)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        
        user_id = user.id
        logger.info(f"Created user with ID: {user_id}")
        
        # Delete user
        logger.info(f"Deleting user with ID: {user_id}")
        test_db.delete(user)
        test_db.commit()
        
        # Verify user was deleted
        deleted_user = test_db.query(User).filter(User.id == user_id).first()
        assert deleted_user is None, f"User with ID {user_id} should be deleted"
        
        logger.info(f"User {user_id} deleted successfully")
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"User deletion failed: {str(e)}")
        raise

@pytest.mark.cleanup
def test_cleanup_test_users(test_db):
    """Clean up test users from database"""
    logger.info("=== Cleaning Up Test Users ===")
    
    try:
        # Find all test users (those with phone numbers containing the test pattern)
        test_users = test_db.query(User).filter(
            User.phone_number.like("+919999999999_%")
        ).all()
        
        if not test_users:
            logger.info("No test users found to clean up")
            return
        
        logger.info(f"Found {len(test_users)} test users to clean up")
        
        # Delete each test user
        for user in test_users:
            logger.info(f"Deleting test user: {user.id} - {user.phone_number}")
            test_db.delete(user)
        
        test_db.commit()
        logger.info("Test users cleanup completed")
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"Cleanup failed: {str(e)}")
        raise 