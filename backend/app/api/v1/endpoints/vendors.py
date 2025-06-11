from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.vendor import VendorResponse
from app.services.vendor_service import VendorService

router = APIRouter()

@router.get("/", response_model=List[VendorResponse])
async def get_vendors(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    search: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    """Get vendors with optional filtering"""
    vendor_service = VendorService(db)
    vendors = await vendor_service.get_vendors(
        category=category,
        location=location,
        min_price=min_price,
        max_price=max_price,
        search=search,
        skip=skip,
        limit=limit
    )
    return vendors

@router.get("/categories")
async def get_vendor_categories(db: Session = Depends(get_db)):
    """Get all vendor categories"""
    vendor_service = VendorService(db)
    categories = await vendor_service.get_categories()
    return {"categories": categories}

@router.get("/locations")
async def get_vendor_locations(db: Session = Depends(get_db)):
    """Get all vendor locations"""
    vendor_service = VendorService(db)
    locations = await vendor_service.get_locations()
    return {"locations": locations}

@router.get("/{vendor_id}", response_model=VendorResponse)
async def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    """Get specific vendor by ID"""
    vendor_service = VendorService(db)
    vendor = await vendor_service.get_vendor(vendor_id)
    if not vendor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vendor not found"
        )
    return vendor

@router.get("/featured", response_model=List[VendorResponse])
async def get_featured_vendors(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=20)
):
    """Get featured vendors"""
    vendor_service = VendorService(db)
    vendors = await vendor_service.get_featured_vendors(limit=limit)
    return vendors