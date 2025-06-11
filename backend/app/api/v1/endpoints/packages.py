from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.package import PackageResponse
from app.services.package_service import PackageService

router = APIRouter()

@router.get("/", response_model=List[PackageResponse])
async def get_packages(db: Session = Depends(get_db)):
    """Get all available packages"""
    package_service = PackageService(db)
    packages = await package_service.get_packages()
    return packages

@router.get("/popular", response_model=List[PackageResponse])
async def get_popular_packages(db: Session = Depends(get_db)):
    """Get popular packages"""
    package_service = PackageService(db)
    packages = await package_service.get_popular_packages()
    return packages

@router.get("/{package_id}", response_model=PackageResponse)
async def get_package(package_id: int, db: Session = Depends(get_db)):
    """Get specific package by ID"""
    package_service = PackageService(db)
    package = await package_service.get_package(package_id)
    if not package:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Package not found"
        )
    return package