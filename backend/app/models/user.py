from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone_number = Column(String(20), unique=True, index=True, nullable=False)
    firebase_uid = Column(String(128), unique=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True, index=True)
    location = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    weddings = relationship("Wedding", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")
    guests = relationship("Guest", back_populates="user")
    relationships = relationship("Relationship", foreign_keys="Relationship.user_id", back_populates="user")
    related_relationships = relationship("Relationship", foreign_keys="Relationship.related_user_id", back_populates="related_user")