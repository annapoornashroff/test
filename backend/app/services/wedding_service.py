from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from fastapi import HTTPException, status

from app.models.wedding import Wedding
from app.models.user import User
from app.models.relationship import Relationship
from app.schemas.wedding import WeddingCreate, WeddingUpdate

class WeddingService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_wedding(self, user_id: int, wedding_data: WeddingCreate) -> Wedding:
        """Create new wedding project"""
        # Validate family members
        if wedding_data.family_details:
            await self._validate_family_members(wedding_data.family_details)
        
        wedding = Wedding(user_id=user_id, **wedding_data.dict())
        self.db.add(wedding)
        self.db.commit()
        self.db.refresh(wedding)
        return wedding
    
    async def get_user_weddings(self, user_id: int) -> List[Wedding]:
        """Get all weddings for a user"""
        return self.db.query(Wedding).filter(Wedding.user_id == user_id).all()
    
    async def get_wedding(self, wedding_id: int, user_id: int) -> Optional[Wedding]:
        """Get specific wedding by ID"""
        return self.db.query(Wedding).filter(
            Wedding.id == wedding_id,
            Wedding.user_id == user_id
        ).first()
    
    async def update_wedding(self, wedding_id: int, user_id: int, wedding_update: WeddingUpdate) -> Optional[Wedding]:
        """Update wedding information"""
        wedding = await self.get_wedding(wedding_id, user_id)
        if not wedding:
            return None
        
        # Validate family members if being updated
        if wedding_update.family_details:
            await self._validate_family_members(wedding_update.family_details)
        
        update_data = wedding_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(wedding, field, value)
        
        self.db.commit()
        self.db.refresh(wedding)
        return wedding
    
    async def delete_wedding(self, wedding_id: int, user_id: int) -> bool:
        """Delete wedding project"""
        wedding = await self.get_wedding(wedding_id, user_id)
        if not wedding:
            return False
        
        self.db.delete(wedding)
        self.db.commit()
        return True
    
    async def _validate_family_members(self, family_details: List[Dict[str, Any]]) -> None:
        """Validate family members and ensure they have user accounts"""
        for member in family_details:
            if not member.get('phone_number'):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Phone number is required for family member: {member.get('name')}"
                )
            
            # Check if user exists with this phone number
            user = self.db.query(User).filter(User.phone_number == member['phone_number']).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"User account not found for phone number: {member['phone_number']}. Please ask them to create an account first."
                )
            
            # Update member with user_id
            member['user_id'] = user.id