from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class WeddingBase(BaseModel):
    name: str
    city: str
    date: datetime
    is_date_fixed: bool = False
    duration: int = 2
    events: Optional[List[str]] = []
    categories: Optional[List[str]] = []
    estimated_guests: int = 100
    budget: Decimal

class WeddingCreate(WeddingBase):
    pass

class WeddingUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    date: Optional[datetime] = None
    is_date_fixed: Optional[bool] = None
    duration: Optional[int] = None
    events: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    estimated_guests: Optional[int] = None
    actual_guests: Optional[int] = None
    budget: Optional[Decimal] = None
    status: Optional[str] = None
    family_details: Optional[List[Dict[str, Any]]] = None

class WeddingResponse(WeddingBase):
    id: int
    user_id: int
    actual_guests: Optional[int] = None
    spent: Decimal
    status: str
    family_details: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)