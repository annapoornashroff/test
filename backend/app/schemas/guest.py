from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class GuestBase(BaseModel):
    wedding_id: int
    name: str
    phone_number: str
    email: Optional[EmailStr] = None
    relationship: Optional[str] = None
    category: str = "Family"

class GuestCreate(GuestBase):
    pass

class GuestUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    relationship: Optional[str] = None
    category: Optional[str] = None
    confirmation_status: Optional[str] = None
    notes: Optional[str] = None

class GuestResponse(GuestBase):
    id: int
    user_id: int
    confirmation_status: str
    invitation_sent: bool
    invitation_sent_at: Optional[datetime] = None
    response_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True