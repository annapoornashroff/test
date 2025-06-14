from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from decimal import Decimal

class PackageBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    original_price: Optional[Decimal] = None
    duration: Optional[str] = None

class PackageCreate(PackageBase):
    includes: List[str] = []
    vendors: List[Dict[str, Any]] = []
    image_url: Optional[str] = None

class PackageResponse(PackageBase):
    id: int
    discount_percentage: int
    includes: List[str]
    vendors: List[Dict[str, Any]]
    is_popular: bool
    is_customizable: bool
    is_active: bool
    image_url: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)