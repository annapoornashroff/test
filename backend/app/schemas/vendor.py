from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class VendorBase(BaseModel):
    name: str
    category: str
    city: str
    description: Optional[str] = None
    price_min: Optional[Decimal] = None
    price_max: Optional[Decimal] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_website: Optional[str] = None

class VendorCreate(VendorBase):
    images: Optional[List[str]] = []
    services: Optional[List[str]] = []
    portfolio: Optional[List[str]] = []
    availability: Optional[List[str]] = []

class VendorUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    price_min: Optional[Decimal] = None
    price_max: Optional[Decimal] = None
    services: Optional[List[str]] = None
    portfolio: Optional[List[str]] = None
    availability: Optional[List[str]] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_website: Optional[str] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None

class VendorResponse(VendorBase):
    id: int
    images: List[str]
    rating: Decimal
    review_count: int
    services: List[str]
    portfolio: List[str]
    availability: List[str]
    is_active: bool
    is_featured: bool
    created_at: datetime
    
    class Config:
        from_attributes = True