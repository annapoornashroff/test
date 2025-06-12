from pydantic import BaseModel, EmailStr
from typing import Optional

class LoginRequest(BaseModel):
    phone_number: str

class OTPRequest(BaseModel):
    phone_number: str
    otp: str

class FirebaseSignupRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    city: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str