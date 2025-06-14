from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
import uvicorn
import logging
import sys
import json
from datetime import datetime
import os

from app.core.config import settings
from app.core.database import engine, Base
from app.core.logging import setup_logging
from app.api.v1.api import api_router

# Create logs directory if it doesn't exist
os.makedirs('logs', exist_ok=True)

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)

# Remove any existing handlers
for handler in root_logger.handlers[:]:
    root_logger.removeHandler(handler)

# Create formatters
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setFormatter(formatter)
console_handler.setLevel(logging.INFO)
root_logger.addHandler(console_handler)

# File handler
file_handler = logging.FileHandler('logs/app.log')
file_handler.setFormatter(formatter)
file_handler.setLevel(logging.INFO)
root_logger.addHandler(file_handler)

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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests and responses"""
    start_time = datetime.now()
    
    # Log request
    logger.info(f"Request: {request.method} {request.url}")
    try:
        body = await request.body()
        if body:
            try:
                body_json = json.loads(body)
                logger.info(f"Request body: {json.dumps(body_json, indent=2)}")
            except:
                logger.info(f"Request body: {body}")
    except:
        pass

    # Process request
    response = await call_next(request)
    
    # Log response
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"Response: {response.status_code} - Process time: {process_time:.2f}s")
    
    return response

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