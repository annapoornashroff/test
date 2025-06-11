from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(100), nullable=False, index=True)
    location = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    images = Column(JSON)  # List of image URLs
    price_min = Column(Numeric(12, 2))
    price_max = Column(Numeric(12, 2))
    rating = Column(Numeric(3, 2), default=0.0)
    review_count = Column(Integer, default=0)
    availability = Column(JSON)  # List of available dates
    services = Column(JSON)  # List of services offered
    portfolio = Column(JSON)  # List of portfolio image URLs
    contact_phone = Column(String(20))
    contact_email = Column(String(100))
    contact_website = Column(String(200))
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    cart_items = relationship("CartItem", back_populates="vendor")