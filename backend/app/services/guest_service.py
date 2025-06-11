from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime

from app.models.guest import Guest
from app.schemas.guest import GuestCreate, GuestUpdate
from app.services.email_service import EmailService

class GuestService:
    def __init__(self, db: Session):
        self.db = db
        self.email_service = EmailService()
    
    async def add_guest(self, user_id: int, guest_data: GuestCreate) -> Guest:
        """Add new guest"""
        guest = Guest(user_id=user_id, **guest_data.dict())
        self.db.add(guest)
        self.db.commit()
        self.db.refresh(guest)
        return guest
    
    async def get_guests(self, user_id: int, wedding_id: int) -> List[Guest]:
        """Get all guests for a wedding"""
        return self.db.query(Guest).filter(
            Guest.user_id == user_id,
            Guest.wedding_id == wedding_id
        ).all()
    
    async def update_guest(self, guest_id: int, user_id: int, guest_update: GuestUpdate) -> Optional[Guest]:
        """Update guest information"""
        guest = self.db.query(Guest).filter(
            Guest.id == guest_id,
            Guest.user_id == user_id
        ).first()
        
        if not guest:
            return None
        
        update_data = guest_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(guest, field, value)
        
        self.db.commit()
        self.db.refresh(guest)
        return guest
    
    async def delete_guest(self, guest_id: int, user_id: int) -> bool:
        """Delete guest"""
        guest = self.db.query(Guest).filter(
            Guest.id == guest_id,
            Guest.user_id == user_id
        ).first()
        
        if not guest:
            return False
        
        self.db.delete(guest)
        self.db.commit()
        return True
    
    async def send_invitation(self, guest_id: int, user_id: int) -> bool:
        """Send invitation to guest"""
        guest = self.db.query(Guest).filter(
            Guest.id == guest_id,
            Guest.user_id == user_id
        ).first()
        
        if not guest:
            return False
        
        # Send email invitation if email is available
        if guest.email:
            wedding_details = f"the wedding celebration"  # You can get actual wedding details
            await self.email_service.send_wedding_invitation(
                guest.email,
                guest.name,
                wedding_details
            )
        
        # Update guest record
        guest.invitation_sent = True
        guest.invitation_sent_at = datetime.utcnow()
        self.db.commit()
        
        return True
    
    async def get_guest_statistics(self, user_id: int, wedding_id: int) -> Dict[str, Any]:
        """Get guest statistics for a wedding"""
        guests = await self.get_guests(user_id, wedding_id)
        
        total = len(guests)
        confirmed = len([g for g in guests if g.confirmation_status == "confirmed"])
        pending = len([g for g in guests if g.confirmation_status == "pending"])
        declined = len([g for g in guests if g.confirmation_status == "declined"])
        invitations_sent = len([g for g in guests if g.invitation_sent])
        
        return {
            "total": total,
            "confirmed": confirmed,
            "pending": pending,
            "declined": declined,
            "invitations_sent": invitations_sent
        }