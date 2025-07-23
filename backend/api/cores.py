from fastapi import APIRouter, HTTPException
import json
import logging
from typing import Dict, List
from pydantic import BaseModel
from services.arduino_cli import run_arduino_cli

router = APIRouter(prefix="/cores", tags=["cores"])
logger = logging.getLogger(__name__)

class CoreRequest(BaseModel):
    core_name: str

@router.get("/")
async def get_cores():
    """Get list of installed cores"""
    result = run_arduino_cli(['arduino-cli', 'core', 'list', '--format', 'json'])
    
    if result['success']:
        try:
            cores = json.loads(result['stdout'])
            return {"success": True, "cores": cores.get('platforms', [])}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse cores"}
    
    return {"success": False, "error": result['stderr']}

@router.get("/search")
async def search_cores():
    """Get list of all available cores for installation"""
    result = run_arduino_cli(['arduino-cli', 'core', 'search', '--format', 'json'])
    
    if result['success']:
        try:
            cores = json.loads(result['stdout'])
            return {"success": True, "platforms": cores.get('platforms', [])}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse available cores"}
    
    return {"success": False, "error": result['stderr']}

@router.post("/install")
async def install_core(request: CoreRequest):
    """Install a core"""
    result = run_arduino_cli(['arduino-cli', 'core', 'install', request.core_name])
    
    if result['success']:
        return {"success": True, "message": f"Core {request.core_name} installed successfully"}
    
    return {"success": False, "error": result['stderr']}

@router.post("/uninstall")
async def uninstall_core(request: CoreRequest):
    """Uninstall a core"""
    result = run_arduino_cli(['arduino-cli', 'core', 'uninstall', request.core_name])
    
    if result['success']:
        return {"success": True, "message": f"Core {request.core_name} uninstalled successfully"}
    
    return {"success": False, "error": result['stderr']}