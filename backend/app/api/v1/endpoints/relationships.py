from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.relationship import (
    RelationshipCreate,
    RelationshipUpdate,
    RelationshipResponse
)
from app.services.relationship_service import RelationshipService

router = APIRouter()

@router.post("/", response_model=RelationshipResponse)
async def create_relationship(
    relationship: RelationshipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new relationship request"""
    service = RelationshipService(db)
    return await service.create_relationship(current_user.id, relationship)

@router.get("/", response_model=List[RelationshipResponse])
async def get_relationships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all relationships for current user"""
    service = RelationshipService(db)
    return await service.get_user_relationships(current_user.id)

@router.get("/pending", response_model=List[RelationshipResponse])
async def get_pending_relationships(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending relationship requests for current user"""
    service = RelationshipService(db)
    return await service.get_pending_relationships(current_user.id)

@router.put("/{relationship_id}", response_model=RelationshipResponse)
async def update_relationship(
    relationship_id: int,
    relationship: RelationshipUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update relationship information"""
    service = RelationshipService(db)
    updated = await service.update_relationship(relationship_id, current_user.id, relationship)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found"
        )
    return updated

@router.post("/{relationship_id}/respond")
async def respond_to_relationship(
    relationship_id: int,
    accept: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Accept or reject a relationship request"""
    service = RelationshipService(db)
    try:
        relationship = await service.respond_to_relationship(
            relationship_id,
            current_user.id,
            accept
        )
        return {"message": "Relationship request processed successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.delete("/{relationship_id}")
async def delete_relationship(
    relationship_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a relationship"""
    service = RelationshipService(db)
    if not await service.delete_relationship(relationship_id, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relationship not found"
        )
    return {"message": "Relationship deleted successfully"} 