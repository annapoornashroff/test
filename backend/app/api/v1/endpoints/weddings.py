from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.wedding import WeddingCreate, WeddingResponse, WeddingUpdate
from app.schemas.user import UserResponse
from app.services.wedding_service import WeddingService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=WeddingResponse)
async def create_wedding(
    wedding_data: WeddingCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Create a new wedding project"""
    wedding_service = WeddingService(db)
    wedding = await wedding_service.create_wedding(current_user.id, wedding_data)
    return wedding

@router.get("/", response_model=List[WeddingResponse])
async def get_user_weddings(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all weddings for current user"""
    wedding_service = WeddingService(db)
    weddings = await wedding_service.get_user_weddings(current_user.id)
    return weddings

@router.get("/{wedding_id}", response_model=WeddingResponse)
async def get_wedding(
    wedding_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get specific wedding by ID"""
    wedding_service = WeddingService(db)
    wedding = await wedding_service.get_wedding(wedding_id, current_user.id)
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    return wedding

@router.put("/{wedding_id}", response_model=WeddingResponse)
async def update_wedding(
    wedding_id: int,
    wedding_update: WeddingUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update wedding information"""
    wedding_service = WeddingService(db)
    wedding = await wedding_service.update_wedding(wedding_id, current_user.id, wedding_update)
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    return wedding

@router.delete("/{wedding_id}")
async def delete_wedding(
    wedding_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete wedding project"""
    wedding_service = WeddingService(db)
    success = await wedding_service.delete_wedding(wedding_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    return {"message": "Wedding deleted successfully"}