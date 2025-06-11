from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate
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