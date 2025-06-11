from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.services.user_service import UserService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get current user information"""
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update current user information"""
    user_service = UserService(db)
    updated_user = await user_service.update_user(current_user.id, user_update)
    return updated_user

@router.delete("/me")
async def delete_current_user(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete current user account"""
    user_service = UserService(db)
    await user_service.delete_user(current_user.id)
    return {"message": "User account deleted successfully"}

@router.get("/by-phone/{phone_number}", response_model=UserResponse)
async def get_user_by_phone(
    phone_number: str,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get user by phone number"""
    user_service = UserService(db)
    user = await user_service.get_user_by_phone(phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.post("/invite")
async def send_invite(
    invite_data: dict,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Send invitation to create account"""
    user_service = UserService(db)
    await user_service.send_invite(
        phone_number=invite_data["phone_number"],
        name=invite_data["name"],
        relationship=invite_data["relationship"],
        invited_by=current_user.id
    )
    return {"message": "Invitation sent successfully"}