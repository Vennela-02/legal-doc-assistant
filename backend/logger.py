# logger.py
import logging
import sys
from logging.handlers import RotatingFileHandler
import os

# Ensure logs directory exists
os.makedirs("logs", exist_ok=True)

logger = logging.getLogger("legal_ai")
logger.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - %(levelname)s - %(name)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

# Console handler (so you still see logs in terminal)
#console_handler = logging.StreamHandler(sys.stdout)
#console_handler.setFormatter(formatter)
#logger.addHandler(console_handler)

# File handler (rotates after 5 MB, keeps 3 backups)
file_handler = RotatingFileHandler(
    "logs/app.log", maxBytes=5*1024*1024, backupCount=3, encoding="utf-8"
)
file_handler.setFormatter(formatter)
logger.addHandler(file_handler)
