from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import HTTPException, status
from datetime import datetime, timedelta

from app.models.relationship import Relationship
from app.models.user import User
from app.schemas.relationship import RelationshipCreate, RelationshipUpdate

class RelationshipService:
    def __init__(self, db: Session):
        self.db = db
    
    async def create_relationship(self, user_id: int, relationship_data: RelationshipCreate) -> Relationship:
        """Create new relationship between users"""
        # Check if related user exists
        related_user = self.db.query(User).filter(User.id == relationship_data.related_user_id).first()
        if not related_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Related user not found"
            )
        
        # Check if relationship already exists
        existing = self.db.query(Relationship).filter(
            Relationship.user_id == user_id,
            Relationship.related_user_id == relationship_data.related_user_id,
            Relationship.relationship_type == relationship_data.relationship_type
        ).first()
        
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Relationship already exists"
            )
        
        # Set expiration for pending requests (7 days)
        expires_at = datetime.now() + timedelta(days=7) if relationship_data.status == "pending" else None
        
        relationship = Relationship(
            user_id=user_id,
            **relationship_data.dict(),
            expires_at=expires_at
        )
        self.db.add(relationship)
        self.db.commit()
        self.db.refresh(relationship)
        return relationship
    
    async def get_user_relationships(self, user_id: int) -> List[Relationship]:
        """Get all relationships for a user"""
        return self.db.query(Relationship).filter(Relationship.user_id == user_id).all()
    
    async def get_pending_relationships(self, user_id: int) -> List[Relationship]:
        """Get pending relationship requests for a user"""
        return self.db.query(Relationship).filter(
            Relationship.related_user_id == user_id,
            Relationship.status == "pending",
            Relationship.expires_at > datetime.now()
        ).all()
    
    async def update_relationship(
        self,
        relationship_id: int,
        user_id: int,
        relationship_update: RelationshipUpdate
    ) -> Optional[Relationship]:
        """Update relationship information"""
        relationship = self.db.query(Relationship).filter(
            Relationship.id == relationship_id,
            Relationship.user_id == user_id
        ).first()
        
        if not relationship:
            return None
        
        update_data = relationship_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(relationship, field, value)
        
        self.db.commit()
        self.db.refresh(relationship)
        return relationship
    
    async def respond_to_relationship(
        self,
        relationship_id: int,
        user_id: int,
        accept: bool
    ) -> Optional[Relationship]:
        """Accept or reject a relationship request"""
        relationship = self.db.query(Relationship).filter(
            Relationship.id == relationship_id,
            Relationship.related_user_id == user_id,
            Relationship.status == "pending"
        ).first()
        
        if not relationship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Relationship request not found"
            )
        
        if relationship.expires_at and relationship.expires_at < datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Relationship request has expired"
            )
        
        relationship.status = "accepted" if accept else "rejected"
        relationship.responded_at = datetime.now()
        
        self.db.commit()
        self.db.refresh(relationship)
        return relationship
    
    async def delete_relationship(self, relationship_id: int, user_id: int) -> bool:
        """Delete relationship"""
        relationship = self.db.query(Relationship).filter(
            Relationship.id == relationship_id,
            Relationship.user_id == user_id
        ).first()
        
        if not relationship:
            return False
        
        self.db.delete(relationship)
        self.db.commit()
        return True 