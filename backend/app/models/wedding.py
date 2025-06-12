from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, JSON, Numeric
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Wedding(Base):
    __tablename__ = "weddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    city = Column(String(100), nullable=False)
    date = Column(DateTime, nullable=False)
    is_date_fixed = Column(Boolean, default=False)
    duration = Column(Integer, default=2)  # days
    events = Column(JSON)  # List of events
    categories = Column(JSON)  # List of service categories
    estimated_guests = Column(Integer, default=100)
    actual_guests = Column(Integer)
    budget = Column(Numeric(12, 2), nullable=False)
    spent = Column(Numeric(12, 2), default=0)
    status = Column(String(50), default="planning")  # planning, partially_booked, booked, completed
    family_details = Column(JSON)  # List of family members
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="weddings")
    cart_items = relationship("CartItem", back_populates="wedding")
    guests = relationship("Guest", back_populates="wedding")