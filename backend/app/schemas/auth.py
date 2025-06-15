from pydantic import BaseModel, EmailStr, validator
from typing import Optional


class FirebaseSignupRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    city: Optional[str] = None
    id: Optional[str] = None
    createdAt: Optional[str] = None

    @validator('email')
    def validate_email(cls, v):
        if v == "":
            return None
        if v is not None:
            try:
                EmailStr.validate(v)
            except ValueError:
                raise ValueError('Invalid email format')
        return v

    @validator('name')
    def validate_name(cls, v):
        if v == "":
            return None
        return v

    @validator('city')
    def validate_city(cls, v):
        if v == "":
            return None
        return v

class Token(BaseModel):
    access_token: str
    token_type: str