from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas.auth import Token, FirebaseSignupRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter()

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    # In production, use service account key file
    # For development, you can use the default credentials
    try:
        if os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'):
            cred = credentials.Certificate(os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY'))
        else:
            # Use default credentials for development
            cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Firebase initialization error: {e}")

async def verify_firebase_token(token: str):
    """Verify Firebase ID token and return user info"""
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )

@router.post("/firebase-signup", response_model=UserResponse)
async def firebase_signup(
    request: FirebaseSignupRequest,
    db: Session = Depends(get_db),
    firebase_token: str = Depends(verify_firebase_token)
):
    """Create or update user account after Firebase authentication"""
    auth_service = AuthService(db)
    
    # Extract phone number from Firebase token
    phone_number = firebase_token.get('phone_number')
    firebase_uid = firebase_token.get('uid')
    
    if not phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not found in Firebase token"
        )
    
    # Check if user already exists
    existing_user = await auth_service.get_user_by_phone(phone_number)
    
    if existing_user:
        # Update existing user with new information
        user_data = {
            'name': request.name or existing_user.name,
            'email': request.email or existing_user.email,
            'city': request.city or existing_user.city,
            'firebase_uid': firebase_uid,
            'is_verified': True
        }
        updated_user = await auth_service.update_user(existing_user.id, user_data)
        return updated_user
    else:
        # Create new user
        user_data = UserCreate(
            phone_number=phone_number,
            name=request.name,
            email=request.email,
            city=request.city,
            firebase_uid=firebase_uid,
            is_verified=True
        )
        user = await auth_service.create_user(user_data)
        return user

@router.post("/token", response_model=Token)
async def get_access_token(
    firebase_token: str = Depends(verify_firebase_token),
    db: Session = Depends(get_db)
):
    """Generate backend access token for authenticated Firebase user"""
    auth_service = AuthService(db)
    
    phone_number = firebase_token.get('phone_number')
    if not phone_number:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone number not found in Firebase token"
        )
    
    # Get user from database
    user = await auth_service.get_user_by_phone(phone_number)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found. Please complete signup first."
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}