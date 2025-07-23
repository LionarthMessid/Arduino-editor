import os
from pathlib import Path
from dotenv import load_dotenv

# Root directory
ROOT_DIR = Path(__file__).parent.parent

# Load environment variables
load_dotenv(ROOT_DIR / '.env')

# MongoDB settings
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'arduino_editor')

# Arduino CLI settings
BIN_PATH = str(ROOT_DIR.parent / 'bin')
TEMP_DIR = os.environ.get('TEMP', os.path.join(ROOT_DIR, 'temp'))
WORKSPACE_DIR = Path(os.path.join(TEMP_DIR, "arduino_workspace"))

# Ensure workspace directory exists
WORKSPACE_DIR.mkdir(exist_ok=True, parents=True)

# API settings
API_PREFIX = "/api"

# CORS settings
CORS_ORIGINS = ["*"]
CORS_METHODS = ["*"]
CORS_HEADERS = ["*"]