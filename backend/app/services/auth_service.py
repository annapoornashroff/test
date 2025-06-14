from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import logging

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.config import settings

# Get logger instance
logger = logging.getLogger('app.auth_service')

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_by_phone(self, phone_number: str) -> Optional[User]:
        """Get user by phone number"""
        try:
            logger.info(f"Looking up user by phone number: {phone_number}")
            user = self.db.query(User).filter(User.phone_number == phone_number).first()
            logger.info(f"User lookup result: {'Found' if user else 'Not found'}")
            return user
        except Exception as e:
            logger.error(f"Error looking up user by phone: {str(e)}", exc_info=True)
            raise
    
    async def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        """Get user by Firebase UID"""
        try:
            logger.info(f"Looking up user by Firebase UID: {firebase_uid}")
            user = self.db.query(User).filter(User.firebase_uid == firebase_uid).first()
            logger.info(f"User lookup result: {'Found' if user else 'Not found'}")
            return user
        except Exception as e:
            logger.error(f"Error looking up user by Firebase UID: {str(e)}", exc_info=True)
            raise
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        try:
            logger.info(f"Creating new user with data: {user_data.dict()}")
            user = User(**user_data.dict())
            self.db.add(user)
            try:
                self.db.commit()
                self.db.refresh(user)
                logger.info(f"User created successfully with ID: {user.id}")
                return user
            except Exception as e:
                self.db.rollback()
                logger.error(f"Database error while creating user: {str(e)}", exc_info=True)
                raise
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            raise
    
    async def update_user(self, user_id: int, user_data: dict) -> Optional[User]:
        """Update user information"""
        try:
            logger.info(f"Updating user {user_id} with data: {user_data}")
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                logger.warning(f"User not found with ID: {user_id}")
                return None
            
            for field, value in user_data.items():
                if hasattr(user, field):
                    setattr(user, field, value)
            
            try:
                self.db.commit()
                self.db.refresh(user)
                logger.info(f"User updated successfully: {user.id}")
                return user
            except Exception as e:
                self.db.rollback()
                logger.error(f"Database error while updating user: {str(e)}", exc_info=True)
                raise
        except Exception as e:
            logger.error(f"Error updating user: {str(e)}", exc_info=True)
            raise