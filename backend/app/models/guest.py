from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship as SQLRelationship
from sqlalchemy.sql import func
from app.core.database import Base

class Guest(Base):
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    wedding_id = Column(Integer, ForeignKey("weddings.id"), nullable=False)
    name = Column(String(200), nullable=False)
    phone_number = Column(String(20), nullable=False)
    email = Column(String(100))
    relationship = Column(String(100))
    category = Column(String(50), default="Family")  # Family, Friends, Colleagues, etc.
    confirmation_status = Column(String(50), default="pending")  # pending, confirmed, declined
    invitation_sent = Column(Boolean, default=False)
    invitation_sent_at = Column(DateTime)
    response_at = Column(DateTime)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = SQLRelationship("User", back_populates="guests")
    wedding = SQLRelationship("Wedding", back_populates="guests")