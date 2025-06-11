from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.guest import GuestCreate, GuestResponse, GuestUpdate
from app.schemas.user import UserResponse
from app.services.guest_service import GuestService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=GuestResponse)
async def add_guest(
    guest_data: GuestCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Add new guest"""
    guest_service = GuestService(db)
    guest = await guest_service.add_guest(current_user.id, guest_data)
    return guest

@router.get("/", response_model=List[GuestResponse])
async def get_guests(
    wedding_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all guests for a wedding"""
    guest_service = GuestService(db)
    guests = await guest_service.get_guests(current_user.id, wedding_id)
    return guests

@router.put("/{guest_id}", response_model=GuestResponse)
async def update_guest(
    guest_id: int,
    guest_update: GuestUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update guest information"""
    guest_service = GuestService(db)
    guest = await guest_service.update_guest(guest_id, current_user.id, guest_update)
    if not guest:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )
    return guest

@router.delete("/{guest_id}")
async def delete_guest(
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Delete guest"""
    guest_service = GuestService(db)
    success = await guest_service.delete_guest(guest_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )
    return {"message": "Guest deleted successfully"}

@router.post("/{guest_id}/send-invitation")
async def send_invitation(
    guest_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Send invitation to guest"""
    guest_service = GuestService(db)
    success = await guest_service.send_invitation(guest_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Guest not found"
        )
    return {"message": "Invitation sent successfully"}

@router.get("/statistics")
async def get_guest_statistics(
    wedding_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get guest statistics for a wedding"""
    guest_service = GuestService(db)
    stats = await guest_service.get_guest_statistics(current_user.id, wedding_id)
    return stats