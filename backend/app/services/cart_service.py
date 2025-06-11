from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.models.cart import CartItem
from app.schemas.cart import CartItemCreate, CartItemUpdate

class CartService:
    def __init__(self, db: Session):
        self.db = db
    
    async def add_to_cart(self, user_id: int, cart_item: CartItemCreate) -> CartItem:
        """Add item to cart"""
        item = CartItem(user_id=user_id, **cart_item.dict())
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item
    
    async def get_cart_items(self, user_id: int) -> List[CartItem]:
        """Get all cart items for user"""
        return self.db.query(CartItem).filter(CartItem.user_id == user_id).all()
    
    async def update_cart_item(self, item_id: int, user_id: int, item_update: CartItemUpdate) -> Optional[CartItem]:
        """Update cart item"""
        item = self.db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == user_id
        ).first()
        
        if not item:
            return None
        
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)
        
        self.db.commit()
        self.db.refresh(item)
        return item
    
    async def remove_from_cart(self, item_id: int, user_id: int) -> bool:
        """Remove item from cart"""
        item = self.db.query(CartItem).filter(
            CartItem.id == item_id,
            CartItem.user_id == user_id
        ).first()
        
        if not item:
            return False
        
        self.db.delete(item)
        self.db.commit()
        return True
    
    async def get_cart_summary(self, user_id: int) -> Dict[str, Any]:
        """Get cart summary with totals"""
        items = await self.get_cart_items(user_id)
        
        total_items = len(items)
        total_amount = sum(float(item.price) for item in items)
        
        status_counts = {}
        for item in items:
            status_counts[item.status] = status_counts.get(item.status, 0) + 1
        
        return {
            "total_items": total_items,
            "total_amount": total_amount,
            "status_breakdown": status_counts
        }