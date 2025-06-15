from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from datetime import timedelta
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
import os
import logging
from pydantic import ValidationError
from typing import Optional

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.config import settings
from app.schemas.auth import Token, FirebaseSignupRequest
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import AuthService

# Get logger instance
logger = logging.getLogger('app.auth')

router = APIRouter()

# Remove the module-level Firebase initialization code
# It's now handled in main.py startup event

async def verify_firebase_token(authorization: Optional[str] = Header(None)):
    """Verify Firebase ID token and return user info"""    
    if not authorization:
        logger.error("No authorization header provided")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header required"
        )
    
    # Extract token from "Bearer <token>" format
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            logger.error(f"Invalid authorization scheme: {scheme}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authorization scheme"
            )
    except ValueError:
        logger.error("Invalid authorization header format")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format"
        )
    
    logger.info(f"Verifying Firebase token... Token: {token[:20]}...")
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        logger.info(f"Token verified successfully. User ID: {decoded_token.get('uid')}")
        logger.info(f"Full token data: {decoded_token}")
        return decoded_token
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Firebase token"
        )

@router.post("/firebase-signup", response_model=UserResponse)
async def firebase_signup(
    request: Request,
    signup_request: FirebaseSignupRequest,
    db: Session = Depends(get_db),
    firebase_token: str = Depends(verify_firebase_token)
):
    """Create or update user account after Firebase authentication"""
    try:
        logger.info("=== Firebase Signup Request ===")
        logger.info(f"Request data: {signup_request.dict()}")
        logger.info(f"Firebase token data: {firebase_token}")
        logger.info(f"Raw request body: {await request.body()}")
        
        auth_service = AuthService(db)
        
        # Extract phone number from Firebase token
        phone_number = firebase_token.get('phone_number')
        firebase_uid = firebase_token.get('uid')
        
        logger.info(f"Extracted phone_number: {phone_number}")
        logger.info(f"Extracted firebase_uid: {firebase_uid}")
        
        if not phone_number:
            logger.error("Phone number not found in Firebase token")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Phone number not found in Firebase token"
            )
        
        # Check if user already exists
        existing_user = await auth_service.get_user_by_phone(phone_number)
        logger.info(f"Existing user found: {existing_user is not None}")
        
        if existing_user:
            logger.info(f"Updating existing user with ID: {existing_user.id}")
            # Update existing user with new information
            user_data = {
                'name': signup_request.name or existing_user.name,
                'email': signup_request.email or existing_user.email,
                'city': signup_request.city or existing_user.city,
                'firebase_uid': firebase_uid,
                'is_verified': True
            }
            logger.info(f"Update user data: {user_data}")
            updated_user = await auth_service.update_user(existing_user.id, user_data)
            logger.info(f"User updated successfully: {updated_user.id}")
            return updated_user
        else:
            logger.info("Creating new user")
            # Create new user
            user_data = UserCreate(
                phone_number=phone_number,
                name=signup_request.name,
                email=signup_request.email,
                city=signup_request.city,
                firebase_uid=firebase_uid,
                is_verified=True
            )
            logger.info(f"Create user data: {user_data.dict()}")
            user = await auth_service.create_user(user_data)
            logger.info(f"New user created successfully: {user.id}")
            return user
    except ValidationError as e:
        logger.error(f"Validation error: {str(e)}")
        logger.error(f"Validation errors: {e.errors()}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.errors()
        )
    except Exception as e:
        logger.error(f"Error in firebase_signup: {str(e)}", exc_info=True)
        raise

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