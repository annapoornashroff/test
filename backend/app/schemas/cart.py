from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from decimal import Decimal

class CartItemBase(BaseModel):
    wedding_id: int
    vendor_id: int
    category: str
    price: Decimal
    booking_date: datetime

class CartItemCreate(CartItemBase):
    pass

class CartItemUpdate(BaseModel):
    price: Optional[Decimal] = None
    booking_date: Optional[datetime] = None
    status: Optional[str] = None
    visit_date: Optional[datetime] = None
    notes: Optional[str] = None

class CartItemResponse(CartItemBase):
    id: int
    user_id: int
    status: str
    visit_date: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True