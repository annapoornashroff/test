from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.wedding import Wedding
from app.schemas.wedding import WeddingCreate, WeddingUpdate

class WeddingService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_wedding(self, user_id: int, wedding_data: WeddingCreate) -> Wedding:
        """Create new wedding project"""
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