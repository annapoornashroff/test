from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.config import settings

class AuthService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_by_phone(self, phone_number: str) -> Optional[User]:
        """Get user by phone number"""
        return self.db.query(User).filter(User.phone_number == phone_number).first()
    
    async def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        """Get user by Firebase UID"""
        return self.db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user"""
        user = User(**user_data.dict())
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    async def update_user(self, user_id: int, user_data: dict) -> Optional[User]:
        """Update user information"""
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None
        
        for field, value in user_data.items():
            if hasattr(user, field):
                setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user