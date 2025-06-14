import pytest
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
import logging

from app.models.user import User

# Get logger instance
logger = logging.getLogger('test.database')

def test_database_connection(test_db):
    """Test basic database connectivity"""
    logger.info("Testing database connection...")
    try:
        # Try to execute a simple query using text()
        result = test_db.execute(text("SELECT 1")).scalar()
        assert result == 1
        logger.info("Database connection successful")
    except SQLAlchemyError as e:
        logger.error(f"Database connection failed: {str(e)}")
        raise

def test_user_model_operations(test_db):
    """Test User model CRUD operations"""
    logger.info("Testing User model operations...")
    
    # Test data
    test_user = {
        "phone_number": "+919999999999",
        "name": "Test User",
        "email": "test@example.com",
        "city": "Test City",
        "firebase_uid": "test-uid",
        "is_verified": True
    }
    
    try:
        # Create user
        logger.info("Creating test user...")
        user = User(**test_user)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)
        assert user.id is not None
        assert user.phone_number == test_user["phone_number"]
        logger.info(f"User created successfully with ID: {user.id}")
        
        # Read user using SQLAlchemy query
        logger.info("Reading test user...")
        retrieved_user = test_db.query(User).filter(User.id == user.id).first()
        assert retrieved_user is not None
        assert retrieved_user.name == test_user["name"]
        logger.info("User retrieved successfully")
        
        # Update user
        logger.info("Updating test user...")
        new_name = "Updated User"
        retrieved_user.name = new_name
        test_db.commit()
        test_db.refresh(retrieved_user)
        assert retrieved_user.name == new_name
        logger.info("User updated successfully")
        
        # Delete user
        logger.info("Deleting test user...")
        test_db.delete(retrieved_user)
        test_db.commit()
        deleted_user = test_db.query(User).filter(User.id == user.id).first()
        assert deleted_user is None
        logger.info("User deleted successfully")
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"Database operation failed: {str(e)}")
        raise

def test_database_transactions(test_db):
    """Test database transaction handling"""
    logger.info("Testing database transactions...")
    
    # Test data
    test_user = {
        "phone_number": "+919999999999",
        "name": "Test User",
        "email": "test@example.com",
        "city": "Test City",
        "firebase_uid": "test-uid",
        "is_verified": True
    }
    
    try:
        # Test successful transaction
        logger.info("Testing successful transaction...")
        user = User(**test_user)
        test_db.add(user)
        test_db.commit()
        assert user.id is not None
        logger.info("Successful transaction test passed")
        
        # Test failed transaction
        logger.info("Testing failed transaction...")
        invalid_user = User(phone_number=None)  # This should fail due to NOT NULL constraint
        test_db.add(invalid_user)
        try:
            test_db.commit()
            assert False, "Should have raised an exception"
        except SQLAlchemyError:
            test_db.rollback()
            logger.info("Failed transaction test passed")
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"Transaction test failed: {str(e)}")
        raise

@pytest.mark.integration
def test_database_concurrent_operations(test_db):
    """Test concurrent database operations"""
    logger.info("Testing concurrent database operations...")
    
    # Test data
    test_users = [
        {
            "phone_number": f"+91999999999{i}",
            "name": f"Test User {i}",
            "email": f"test{i}@example.com",
            "city": "Test City",
            "firebase_uid": f"test-uid-{i}",
            "is_verified": True
        }
        for i in range(5)
    ]
    
    try:
        # Create multiple users
        logger.info("Creating multiple users...")
        users = []
        for user_data in test_users:
            user = User(**user_data)
            test_db.add(user)
            users.append(user)
        
        test_db.commit()
        
        # Verify all users were created
        for user in users:
            test_db.refresh(user)
            assert user.id is not None
            logger.info(f"User {user.id} created successfully")
        
        # Update all users
        logger.info("Updating all users...")
        for user in users:
            user.name = f"Updated {user.name}"
        
        test_db.commit()
        
        # Verify all updates
        for user in users:
            test_db.refresh(user)
            assert user.name.startswith("Updated")
            logger.info(f"User {user.id} updated successfully")
        
        # Delete all users
        logger.info("Deleting all users...")
        for user in users:
            test_db.delete(user)
        
        test_db.commit()
        
        # Verify all deletions
        for user in users:
            deleted_user = test_db.query(User).filter(User.id == user.id).first()
            assert deleted_user is None
            logger.info(f"User {user.id} deleted successfully")
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"Concurrent operations test failed: {str(e)}")
        raise

def test_database_constraints(test_db):
    """Test database constraints"""
    logger.info("Testing database constraints...")
    
    try:
        # Test unique phone number constraint
        logger.info("Testing unique phone number constraint...")
        test_user = {
            "phone_number": "+919999999999",
            "name": "Test User",
            "email": "test@example.com",
            "city": "Test City",
            "firebase_uid": "test-uid",
            "is_verified": True
        }
        
        # Create first user
        user1 = User(**test_user)
        test_db.add(user1)
        test_db.commit()
        
        # Try to create second user with same phone number
        user2 = User(**test_user)
        test_db.add(user2)
        try:
            test_db.commit()
            assert False, "Should have raised an exception for duplicate phone number"
        except SQLAlchemyError:
            test_db.rollback()
            logger.info("Unique phone number constraint test passed")
        
        # Clean up
        test_db.delete(user1)
        test_db.commit()
        
    except SQLAlchemyError as e:
        test_db.rollback()
        logger.error(f"Constraint test failed: {str(e)}")
        raise 