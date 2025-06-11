from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.cart import CartItemCreate, CartItemResponse, CartItemUpdate
from app.schemas.user import UserResponse
from app.services.cart_service import CartService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=CartItemResponse)
async def add_to_cart(
    cart_item: CartItemCreate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Add item to cart"""
    cart_service = CartService(db)
    item = await cart_service.add_to_cart(current_user.id, cart_item)
    return item

@router.get("/", response_model=List[CartItemResponse])
async def get_cart_items(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all cart items for current user"""
    cart_service = CartService(db)
    items = await cart_service.get_cart_items(current_user.id)
    return items

@router.put("/{item_id}", response_model=CartItemResponse)
async def update_cart_item(
    item_id: int,
    item_update: CartItemUpdate,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Update cart item"""
    cart_service = CartService(db)
    item = await cart_service.update_cart_item(item_id, current_user.id, item_update)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    return item

@router.delete("/{item_id}")
async def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Remove item from cart"""
    cart_service = CartService(db)
    success = await cart_service.remove_from_cart(item_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    return {"message": "Item removed from cart"}

@router.get("/summary")
async def get_cart_summary(
    db: Session = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get cart summary with totals"""
    cart_service = CartService(db)
    summary = await cart_service.get_cart_summary(current_user.id)
    return summary