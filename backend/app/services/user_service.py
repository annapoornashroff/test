from sqlalchemy.orm import Session
from typing import Optional

from app.models.user import User
from app.schemas.user import UserUpdate

class UserService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    async def get_user_by_phone(self, phone_number: str) -> Optional[User]:
        """Get user by phone number"""
        return self.db.query(User).filter(User.phone_number == phone_number).first()
    
    async def get_user_by_firebase_uid(self, firebase_uid: str) -> Optional[User]:
        """Get user by Firebase UID"""
        return self.db.query(User).filter(User.firebase_uid == firebase_uid).first()
    
    async def update_user(self, user_id: int, user_update: UserUpdate) -> Optional[User]:
        """Update user information"""
        user = await self.get_user(user_id)
        if not user:
            return None
        
        update_data = user_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    async def delete_user(self, user_id: int) -> bool:
        """Delete user account"""
        user = await self.get_user(user_id)
        if not user:
            return False
        
        user.is_active = False
        self.db.commit()
        return True