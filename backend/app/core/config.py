from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Firebase
    FIREBASE_SERVICE_ACCOUNT_KEY: Optional[str] = None
    
    GOOGLE_CALENDAR_CREDENTIALS: Optional[str] = None

    # Google Places API for Reviews
    GOOGLE_PLACES_API_KEY: Optional[str] = None
    GOOGLE_PLACE_ID: Optional[str] = None  # Your business place ID
    
    # Stripe for Payments
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_PUBLISHABLE_KEY: Optional[str] = None
    
    # Gmail SMTP (replacing SendGrid)
    GMAIL_EMAIL: Optional[str] = None
    GMAIL_APP_PASSWORD: Optional[str] = None  # Use App Password, not regular password
    
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()