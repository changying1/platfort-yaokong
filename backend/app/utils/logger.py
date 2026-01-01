import sys
from loguru import logger
import os

# Create logs directory if it doesn't exist
if not os.path.exists("logs"):
    os.makedirs("logs")

# Configure logger
# Rotates every 500MB, keeps logs for 10 days
logger.add("logs/smart_helmet.log", rotation="500 MB", retention="10 days", level="INFO", encoding="utf-8")

def get_logger(module_name: str):
    """
    Returns a logger instance bound to a specific module name.
    """
    return logger.bind(module=module_name)
