from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Numeric, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wedding_id = Column(Integer, ForeignKey("weddings.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    category = Column(String(100), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    booking_date = Column(DateTime, nullable=False)
    status = Column(String(50), default="wishlisted")  # wishlisted, visited, selected, booked
    visit_date = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="cart_items")
    wedding = relationship("Wedding", back_populates="cart_items")
    vendor = relationship("Vendor", back_populates="cart_items")