from sqlalchemy.orm import Session
from typing import Optional
from fastapi import HTTPException, status

from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

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

    async def send_invite(
        self,
        phone_number: str,
        name: str,
        relationship: str,
        invited_by: int
    ) -> None:
        """Send invitation to create account"""
        # Check if user already exists
        existing_user = await self.get_user_by_phone(phone_number)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already exists"
            )
        
        # TODO: Implement actual invitation sending logic
        # This could involve:
        # 1. Sending SMS with registration link
        # 2. Creating a pending invitation record
        # 3. Sending email if available
        # For now, we'll just raise an error
        raise HTTPException(
            status_code=status.HTTP_501_NOT_IMPLEMENTED,
            detail="Invitation system not implemented yet"
        )