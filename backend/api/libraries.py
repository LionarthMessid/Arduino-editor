from fastapi import APIRouter, HTTPException
import json
import logging
from typing import Dict, List
from pydantic import BaseModel
from services.arduino_cli import run_arduino_cli

router = APIRouter(prefix="/libraries", tags=["libraries"])
logger = logging.getLogger(__name__)

class LibraryRequest(BaseModel):
    library_name: str

class LibrarySearchRequest(BaseModel):
    query: str = ""

@router.get("/")
async def get_libraries():
    """Get list of installed libraries"""
    result = run_arduino_cli(['arduino-cli', 'lib', 'list', '--format', 'json'])
    
    if result['success']:
        try:
            libraries = json.loads(result['stdout'])
            return {"success": True, "libraries": libraries.get('libraries', [])}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse library list"}
    
    return {"success": False, "error": result['stderr']}

@router.post("/search")
async def search_libraries(request: LibrarySearchRequest):
    """Search for libraries"""
    if request.query:
        result = run_arduino_cli(['arduino-cli', 'lib', 'search', request.query, '--format', 'json'])
    else:
        result = run_arduino_cli(['arduino-cli', 'lib', 'search', '--format', 'json'])
    
    if result['success']:
        try:
            libraries = json.loads(result['stdout'])
            return {"success": True, "libraries": libraries.get('libraries', [])}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse library search results"}
    
    return {"success": False, "error": result['stderr']}

@router.post("/install")
async def install_library(request: LibraryRequest):
    """Install a library"""
    result = run_arduino_cli(['arduino-cli', 'lib', 'install', request.library_name])
    
    if result['success']:
        return {"success": True, "message": f"Library {request.library_name} installed successfully"}
    
    return {"success": False, "error": result['stderr']}

@router.post("/uninstall")
async def uninstall_library(request: LibraryRequest):
    """Uninstall a library"""
    result = run_arduino_cli(['arduino-cli', 'lib', 'uninstall', request.library_name])
    
    if result['success']:
        return {"success": True, "message": f"Library {request.library_name} uninstalled successfully"}
    
    return {"success": False, "error": result['stderr']}