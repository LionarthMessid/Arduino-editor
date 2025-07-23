from fastapi import APIRouter, HTTPException
import json
import logging
import os
from typing import Dict, List
from pydantic import BaseModel
from services.arduino_cli import run_arduino_cli

router = APIRouter(prefix="/compile", tags=["compile"])
logger = logging.getLogger(__name__)

class CompileRequest(BaseModel):
    code: str
    board: str
    sketch_path: str

class UploadRequest(BaseModel):
    code: str
    board: str
    port: str
    sketch_path: str

@router.post("/verify")
async def compile_code(request: CompileRequest):
    """Compile Arduino code"""
    # Ensure the sketch directory exists
    os.makedirs(os.path.dirname(request.sketch_path), exist_ok=True)
    
    # Write the code to the sketch file
    with open(request.sketch_path, 'w') as f:
        f.write(request.code)
    
    # Compile the code
    result = run_arduino_cli([
        'arduino-cli', 'compile',
        '--fqbn', request.board,
        request.sketch_path
    ])
    
    return {
        "success": result['success'],
        "output": result['stdout'] if result['success'] else result['stderr']
    }

@router.post("/upload")
async def upload_code(request: UploadRequest):
    """Upload Arduino code to a board"""
    # Ensure the sketch directory exists
    os.makedirs(os.path.dirname(request.sketch_path), exist_ok=True)
    
    # Write the code to the sketch file
    with open(request.sketch_path, 'w') as f:
        f.write(request.code)
    
    # Upload the code
    result = run_arduino_cli([
        'arduino-cli', 'upload',
        '--fqbn', request.board,
        '--port', request.port,
        request.sketch_path
    ])
    
    return {
        "success": result['success'],
        "output": result['stdout'] if result['success'] else result['stderr']
    }