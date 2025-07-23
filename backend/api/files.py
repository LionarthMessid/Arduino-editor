from fastapi import APIRouter, HTTPException
import json
import logging
import os
from pathlib import Path
from typing import Dict, List
from pydantic import BaseModel

router = APIRouter(prefix="/files", tags=["files"])
logger = logging.getLogger(__name__)

class FileContent(BaseModel):
    path: str
    content: str

@router.get("/workspace")
async def get_workspace():
    """Get the workspace file structure"""
    workspace_path = "/tmp/arduino_workspace"
    os.makedirs(workspace_path, exist_ok=True)
    
    def get_directory_structure(path):
        result = []
        for item in os.listdir(path):
            item_path = os.path.join(path, item)
            if os.path.isdir(item_path):
                result.append({
                    "name": item,
                    "path": item_path,
                    "type": "directory",
                    "children": get_directory_structure(item_path)
                })
            else:
                result.append({
                    "name": item,
                    "path": item_path,
                    "type": "file"
                })
        return result
    
    try:
        structure = get_directory_structure(workspace_path)
        return {"success": True, "workspace": structure}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.get("/get")
async def get_file(path: str):
    """Get file content"""
    try:
        with open(path, 'r') as f:
            content = f.read()
        return {"success": True, "content": content}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/save")
async def save_file(file: FileContent):
    """Save file content"""
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(file.path), exist_ok=True)
        
        with open(file.path, 'w') as f:
            f.write(file.content)
        return {"success": True, "message": "File saved successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}