from fastapi import APIRouter, HTTPException
import json
import logging
from typing import Dict, List
from services.arduino_cli import run_arduino_cli

router = APIRouter(prefix="/boards", tags=["boards"])
logger = logging.getLogger(__name__)

@router.get("/")
async def get_boards():
    """Get list of available boards"""
    result = run_arduino_cli(['arduino-cli', 'board', 'listall', '--format', 'json'])
    
    if result['success']:
        try:
            boards = json.loads(result['stdout'])
            return {"success": True, "boards": boards.get('boards', [])}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse board list"}
    
    return {"success": False, "error": result['stderr']}

@router.get("/available")
async def get_available_boards():
    """Get list of all available boards for installation"""
    result = run_arduino_cli(['arduino-cli', 'board', 'listall', '--format', 'json'])
    
    if result['success']:
        try:
            boards = json.loads(result['stdout'])
            return {"success": True, "boards": boards.get('boards', [])}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse available boards"}
    
    return {"success": False, "error": result['stderr']}