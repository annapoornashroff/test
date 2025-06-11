from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    related_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    relationship_type = Column(String(50), nullable=False)  # spouse, parent, child, sibling, other
    relationship_name = Column(String(100), nullable=False)  # e.g., "Mother", "Father", "Sister"
    is_primary = Column(Boolean, default=True)
    privacy_level = Column(String(20), default="private")  # public, friends, private
    status = Column(String(20), default="pending")  # pending, accepted, rejected
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    responded_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))  # Optional expiration for pending requests
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="relationships")
    related_user = relationship("User", foreign_keys=[related_user_id], back_populates="related_relationships") 