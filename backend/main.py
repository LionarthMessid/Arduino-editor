from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# Import API routers
from api.boards import router as boards_router
from api.libraries import router as libraries_router
from api.compile import router as compile_router
from api.files import router as files_router
from api.serial import router as serial_router
from api.cores import router as cores_router

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app
app = FastAPI(title="Arduino Code Editor API")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(boards_router, prefix="/api")
app.include_router(libraries_router, prefix="/api")
app.include_router(compile_router, prefix="/api")
app.include_router(files_router, prefix="/api")
app.include_router(serial_router, prefix="/api")
app.include_router(cores_router, prefix="/api")

@app.get("/api")
async def root():
    return {"message": "Arduino Code Editor API"}

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)