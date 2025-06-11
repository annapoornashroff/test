from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.package import Package

class PackageService:
    def __init__(self, db: Session):
        self.db = db
    
    async def get_packages(self) -> List[Package]:
        """Get all active packages"""
        return self.db.query(Package).filter(Package.is_active == True).all()
    
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