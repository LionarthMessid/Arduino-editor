from fastapi import FastAPI, APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
import asyncio
import subprocess
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# Models
class FileContent(BaseModel):
    path: str
    content: str

class CompileRequest(BaseModel):
    code: str
    board: str
    sketch_path: str

class UploadRequest(BaseModel):
    code: str
    board: str
    port: str
    sketch_path: str

class LibraryRequest(BaseModel):
    library_name: str

class CoreRequest(BaseModel):
    core_name: str

class LibrarySearchRequest(BaseModel):
    query: str = ""

# Arduino CLI wrapper functions
def run_arduino_cli(command: List[str]) -> Dict:
    """Run arduino-cli command and return result"""
    try:
        # Add arduino-cli to PATH and set HOME
        env = os.environ.copy()
        env['PATH'] = f"/app/bin:{env.get('PATH', '')}"
        env['HOME'] = '/root'
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            env=env
        )
        
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except Exception as e:
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Arduino Code Editor API"}

@api_router.get("/boards")
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

@api_router.get("/boards/available")
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

@api_router.post("/libraries/search")
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

@api_router.get("/cores")
async def get_cores():
    """Get list of installed cores"""
    result = run_arduino_cli(['arduino-cli', 'core', 'list', '--format', 'json'])
    
    if result['success']:
        try:
            cores = json.loads(result['stdout'])
            return {"success": True, "cores": cores}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse cores"}
    
    return {"success": False, "error": result['stderr']}

@api_router.post("/cores/install")
async def install_core(request: CoreRequest):
    """Install a core"""
    result = run_arduino_cli(['arduino-cli', 'core', 'install', request.core_name])
    
    return {
        "success": result['success'],
        "message": result['stdout'] if result['success'] else result['stderr']
    }

@api_router.post("/cores/uninstall")
async def uninstall_core(request: CoreRequest):
    """Uninstall a core"""
    result = run_arduino_cli(['arduino-cli', 'core', 'uninstall', request.core_name])
    
    return {
        "success": result['success'],
        "message": result['stdout'] if result['success'] else result['stderr']
    }

@api_router.get("/ports")
async def get_ports():
    """Get list of available COM ports"""
    result = run_arduino_cli(['arduino-cli', 'board', 'list', '--format', 'json'])
    
    if result['success']:
        try:
            ports = json.loads(result['stdout'])
            return {"success": True, "ports": ports}
        except json.JSONDecodeError:
            return {"success": False, "error": "Failed to parse port list"}
    
    return {"success": False, "error": result['stderr']}

@api_router.get("/libraries")
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

@api_router.post("/libraries/install")
async def install_library(request: LibraryRequest):
    """Install a library"""
    result = run_arduino_cli(['arduino-cli', 'lib', 'install', request.library_name])
    
    return {
        "success": result['success'],
        "message": result['stdout'] if result['success'] else result['stderr']
    }

@api_router.post("/libraries/uninstall")
async def uninstall_library(request: LibraryRequest):
    """Uninstall a library"""
    result = run_arduino_cli(['arduino-cli', 'lib', 'uninstall', request.library_name])
    
    return {
        "success": result['success'],
        "message": result['stdout'] if result['success'] else result['stderr']
    }

@api_router.post("/compile")
async def compile_code(request: CompileRequest):
    """Compile Arduino code"""
    # Create temp directory for sketch
    temp_dir = Path(f"/tmp/arduino_sketch_{uuid.uuid4()}")
    temp_dir.mkdir(exist_ok=True)
    
    # Write sketch file
    sketch_file = temp_dir / f"{temp_dir.name}.ino"
    sketch_file.write_text(request.code)
    
    # Compile
    result = run_arduino_cli([
        'arduino-cli', 'compile',
        '--fqbn', request.board,
        str(temp_dir)
    ])
    
    # Cleanup
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    return {
        "success": result['success'],
        "message": result['stdout'] if result['success'] else result['stderr']
    }

@api_router.post("/upload")
async def upload_code(request: UploadRequest):
    """Upload Arduino code to board"""
    # Create temp directory for sketch
    temp_dir = Path(f"/tmp/arduino_sketch_{uuid.uuid4()}")
    temp_dir.mkdir(exist_ok=True)
    
    # Write sketch file
    sketch_file = temp_dir / f"{temp_dir.name}.ino"
    sketch_file.write_text(request.code)
    
    # Upload
    result = run_arduino_cli([
        'arduino-cli', 'upload',
        '--fqbn', request.board,
        '--port', request.port,
        str(temp_dir)
    ])
    
    # Cleanup
    import shutil
    shutil.rmtree(temp_dir, ignore_errors=True)
    
    return {
        "success": result['success'],
        "message": result['stdout'] if result['success'] else result['stderr']
    }

@api_router.get("/files/{file_path:path}")
async def get_file(file_path: str):
    """Get file content"""
    try:
        file_path = Path(file_path)
        if file_path.exists() and file_path.is_file():
            content = file_path.read_text()
            return {"success": True, "content": content}
        else:
            return {"success": False, "error": "File not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@api_router.post("/files")
async def save_file(file_data: FileContent):
    """Save file content"""
    try:
        file_path = Path(file_data.path)
        file_path.parent.mkdir(parents=True, exist_ok=True)
        file_path.write_text(file_data.content)
        return {"success": True, "message": "File saved successfully"}
    except Exception as e:
        return {"success": False, "error": str(e)}

@api_router.get("/workspace")
async def get_workspace():
    """Get workspace file tree"""
    workspace_dir = Path("/tmp/arduino_workspace")
    workspace_dir.mkdir(exist_ok=True)
    
    def build_tree(path: Path):
        tree = []
        try:
            for item in path.iterdir():
                if item.is_file():
                    tree.append({
                        "name": item.name,
                        "path": str(item),
                        "type": "file"
                    })
                elif item.is_dir():
                    tree.append({
                        "name": item.name,
                        "path": str(item),
                        "type": "directory",
                        "children": build_tree(item)
                    })
        except PermissionError:
            pass
        return tree
    
    return {"success": True, "tree": build_tree(workspace_dir)}

# WebSocket for serial monitor
@app.websocket("/api/serial/{port}")
async def serial_websocket(websocket: WebSocket, port: str):
    await manager.connect(websocket)
    try:
        # Start serial monitor
        env = os.environ.copy()
        env['PATH'] = f"/app/bin:{env.get('PATH', '')}"
        env['HOME'] = '/root'
        
        process = subprocess.Popen(
            ['arduino-cli', 'monitor', '--port', port],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env
        )
        
        while True:
            # Read from serial
            if process.poll() is not None:
                break
                
            line = process.stdout.readline()
            if line:
                await manager.send_personal_message(line.strip(), websocket)
            
            # Check for WebSocket messages
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=0.1)
                # Send data to serial port would go here
                # For now, just echo back
                await manager.send_personal_message(f"Sent: {data}", websocket)
            except asyncio.TimeoutError:
                continue
            except WebSocketDisconnect:
                break
        
        process.terminate()
        
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        logger.info(f"Serial monitor disconnected for port {port}")
    except Exception as e:
        logger.error(f"Serial monitor error: {e}")
        await manager.send_personal_message(f"Error: {str(e)}", websocket)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()