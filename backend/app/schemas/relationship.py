from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class RelationshipBase(BaseModel):
    related_user_id: int
    relationship_type: str
    relationship_name: str
    is_primary: bool = True
    privacy_level: str = "private"
    status: str = "pending"
    expires_at: Optional[datetime] = None

class RelationshipCreate(RelationshipBase):
    pass

class RelationshipUpdate(BaseModel):
    relationship_type: Optional[str] = None
    relationship_name: Optional[str] = None
    is_primary: Optional[bool] = None
    privacy_level: Optional[str] = None
    status: Optional[str] = None

class RelationshipResponse(RelationshipBase):
    id: int
    user_id: int
    requested_at: datetime
    responded_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True) 