from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import or_

from app.models.package import Package

class PackageService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_packages(
        self,
        category: Optional[str] = None,
        city: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Package]:
        """Get packages with optional filtering"""
        query = self.db.query(Package)

        if category:
            query = query.filter(Package.category == category)
        if city:
            query = query.filter(Package.city == city)
        if min_price:
            query = query.filter(Package.price >= min_price)
        if max_price:
            query = query.filter(Package.price <= max_price)
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Package.name.ilike(search_term),
                    Package.description.ilike(search_term),
                    Package.city.ilike(search_term)
                )
            )

        return query.offset(skip).limit(limit).all()
    
    async def get_package(self, package_id: int) -> Optional[Package]:
        """Get package by ID"""
        return self.db.query(Package).filter(
            Package.id == package_id,
            Package.is_active == True
        ).first()
    
    async def get_popular_packages(self) -> List[Package]:
        """Get popular packages"""
        return self.db.query(Package).filter(
            Package.is_popular == True,
            Package.is_active == True
        ).all()

    async def get_categories(self) -> List[str]:
        """Get all package categories"""
        result = self.db.query(Package.category).distinct().all()
        return [row[0] for row in result]
    
    async def get_cities(self) -> List[str]:
        """Get all package cities"""
        result = self.db.query(Package.city).distinct().all()
        return [row[0] for row in result]