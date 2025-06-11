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
            'location': request.location or existing_user.location,
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
            location=request.location,
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

# Keep existing OTP endpoints for backward compatibility
@router.post("/login", response_model=dict)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Send OTP to phone number for login (Legacy endpoint)"""
    auth_service = AuthService(db)
    sms_service = SMSService()
    
    # Generate and store OTP
    otp = generate_otp()
    await auth_service.store_otp(request.phone_number, otp)
    
    # Send OTP via SMS
    await sms_service.send_otp(request.phone_number, otp)
    
    return {"message": "OTP sent successfully", "phone_number": request.phone_number}

@router.post("/verify-otp", response_model=Token)
async def verify_otp(request: OTPRequest, db: Session = Depends(get_db)):
    """Verify OTP and return access token (Legacy endpoint)"""
    auth_service = AuthService(db)
    
    # Verify OTP
    is_valid = await auth_service.verify_otp(request.phone_number, request.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP"
        )
    
    # Get or create user
    user = await auth_service.get_or_create_user(request.phone_number)
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}