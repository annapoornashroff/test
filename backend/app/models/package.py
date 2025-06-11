from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Numeric
from sqlalchemy.sql import func
from app.core.database import Base

class Package(Base):
    __tablename__ = "packages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Numeric(12, 2), nullable=False)
    original_price = Column(Numeric(12, 2))
    discount_percentage = Column(Integer, default=0)
    duration = Column(String(50))  # e.g., "3 Days"
    includes = Column(JSON)  # List of included services
    vendors = Column(JSON)  # List of vendor mappings
    is_popular = Column(Boolean, default=False)
    is_customizable = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    image_url = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())