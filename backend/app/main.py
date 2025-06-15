from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
import logging
import sys
import json
from datetime import datetime
import os
import firebase_admin
from firebase_admin import credentials

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging
from app.api.v1.api import api_router

# Setup logging using the centralized configuration
setup_logging()

# Get logger for this module
logger = logging.getLogger('app.main')
logger.info("Starting application...")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Forever N Co. API",
    description="Wedding Services E-commerce Platform API",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

@app.on_event("startup")
async def startup_event():
    """Initialize Firebase Admin SDK after logging is set up"""
    firebase_logger = logging.getLogger('app.firebase')

    if not firebase_admin._apps:
        firebase_logger.info("Initializing Firebase Admin SDK...")
        try:
            service_account_path = settings.FIREBASE_SERVICE_ACCOUNT_KEY
            if not service_account_path:
                raise ValueError("FIREBASE_SERVICE_ACCOUNT_KEY is not set in environment variables")
            
            firebase_logger.info(f"Using service account key from file path: {service_account_path}")
            if not os.path.exists(service_account_path):
                raise FileNotFoundError(f"Firebase service account file not found at: {service_account_path}")
            
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
            firebase_logger.info("Firebase Admin SDK initialized successfully")
        except Exception as e:
            firebase_logger.error(f"Firebase initialization error: {e}", exc_info=True)
            raise RuntimeError(f"Failed to initialize Firebase Admin SDK: {str(e)}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Log all exceptions"""
    logger.error(f"Global exception handler caught: {str(exc)}", exc_info=True)
    raise exc

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.com", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "Forever N Co. API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    logger.info("Health check endpoint called")
    return {"status": "healthy"}

if __name__ == "__main__":
    logger.info("Starting uvicorn server...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info"
    )