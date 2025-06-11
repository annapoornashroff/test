from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import firebase_admin
from firebase_admin import auth as firebase_auth

from app.core.database import get_db
from app.core.security import verify_token
from app.services.user_service import UserService

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user (supports both Firebase and legacy JWT tokens)"""
    token = credentials.credentials
    
    try:
        # Try Firebase token verification first
        try:
            decoded_token = firebase_auth.verify_id_token(token)
            phone_number = decoded_token.get('phone_number')
            
            if phone_number:
                user_service = UserService(db)
                user = await user_service.get_user_by_phone(phone_number)
                
                if not user:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User not found. Please complete signup first."
                    )
                
                if not user.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="User account is inactive"
                    )
                
                return user
        except Exception:
            # If Firebase verification fails, try legacy JWT verification
            pass
    
        # Fallback to legacy JWT verification
        user_id = verify_token(token)
        user_service = UserService(db)
        user = await user_service.get_user(int(user_id))
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )