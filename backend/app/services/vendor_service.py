from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional

from app.models.vendor import Vendor

class VendorService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_vendors(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Vendor]:
        """Get vendors with optional filtering"""
        query = self.db.query(Vendor)

        if category:
            query = query.filter(Vendor.category == category)
        if city:
            query = query.filter(Vendor.city == city)
        if min_price:
            query = query.filter(Vendor.price_min >= min_price)
        if max_price:
            query = query.filter(Vendor.price_max <= max_price)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Vendor.name.ilike(search_term),
                    Vendor.description.ilike(search_term),
                    Vendor.city.ilike(search_term)
                )
            )

        return query.offset(skip).limit(limit).all()
    
    async def get_vendor(self, vendor_id: int) -> Optional[Vendor]:
        """Get vendor by ID"""
        return self.db.query(Vendor).filter(
            Vendor.id == vendor_id,
            Vendor.is_active == True
        ).first()
    
    async def get_featured_vendors(self, limit: int = 10) -> List[Vendor]:
        """Get featured vendors"""
        return self.db.query(Vendor).filter(
            Vendor.is_featured == True,
            Vendor.is_active == True
        ).limit(limit).all()
    
    async def get_categories(self) -> List[str]:
        """Get all vendor categories"""
        result = self.db.query(Vendor.category).distinct().all()
        return [row[0] for row in result]
    
    async def get_cities(self) -> List[str]:
        """Get all vendor cities"""
        result = self.db.query(Vendor.city).distinct().all()
        return [row[0] for row in result]