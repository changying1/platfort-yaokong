import sys
from loguru import logger
import os

# Create logs directory if it doesn't exist
BASE_DIR = os.path.dirname(__file__)
LOG_DIR = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "logs"))
os.makedirs(LOG_DIR, exist_ok=True)

# Configure logger
# Rotates every 500MB, keeps logs for 10 days
LOG_PATH = os.path.join(LOG_DIR, "smart_helmet.log")
logger.add(LOG_PATH, mode="w", rotation="500 MB", retention="10 days", level="INFO", encoding="utf-8")

def get_logger(module_name: str):
    """
    Returns a logger instance bound to a specific module name.
    """
    return logger.bind(module=module_name)
