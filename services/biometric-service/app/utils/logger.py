import logging
import sys
import os
from datetime import datetime

# Create logger
logger = logging.getLogger('biometric-service')
logger.setLevel(logging.INFO)

# Create formatters
formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)
logger.addHandler(console_handler)

# File handler (if not in production container)
if not os.getenv('CONTAINER_ENV'):
    file_handler = logging.FileHandler('biometric_service.log')
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

# Prevent duplicate logs
logger.propagate = False
