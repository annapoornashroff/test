from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    phone_number: str
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    location: Optional[str] = None

class UserCreate(UserBase):
    firebase_uid: Optional[str] = None
    is_verified: bool = False

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    location: Optional[str] = None
    firebase_uid: Optional[str] = None
    is_verified: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    firebase_uid: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True