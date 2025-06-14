import logging
import sys
from logging.handlers import RotatingFileHandler
import os
from app.core.config import settings

def setup_logging():
    """Configure logging for the application"""
    # Create logs directory if it doesn't exist
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO if settings.DEBUG else logging.WARNING)

    # Create formatters
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)

    # File handler
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, 'app.log'),
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(file_formatter)
    root_logger.addHandler(file_handler)

    # Set specific loggers
    logging.getLogger('uvicorn').setLevel(logging.INFO)
    logging.getLogger('uvicorn.access').setLevel(logging.INFO)

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the given name"""
    return logging.getLogger(name) 