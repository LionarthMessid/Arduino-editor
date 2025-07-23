from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import logging
import asyncio
import serial
import serial.tools.list_ports
from typing import Dict, List

router = APIRouter(prefix="/serial", tags=["serial"])
logger = logging.getLogger(__name__)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.serial_connection = None
        self.read_task = None

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

    async def connect_serial(self, port: str, baud_rate: int):
        try:
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.close()
            
            self.serial_connection = serial.Serial(port, baud_rate, timeout=0)
            
            if self.read_task:
                self.read_task.cancel()
            
            self.read_task = asyncio.create_task(self.read_serial())
            
            return True
        except Exception as e:
            logger.error(f"Error connecting to serial port: {e}")
            return False

    async def disconnect_serial(self):
        try:
            if self.read_task:
                self.read_task.cancel()
                self.read_task = None
            
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.close()
                self.serial_connection = None
            
            return True
        except Exception as e:
            logger.error(f"Error disconnecting from serial port: {e}")
            return False

    async def send_serial(self, data: str):
        try:
            if self.serial_connection and self.serial_connection.is_open:
                self.serial_connection.write(data.encode())
                return True
            return False
        except Exception as e:
            logger.error(f"Error sending data to serial port: {e}")
            return False

    async def read_serial(self):
        try:
            while self.serial_connection and self.serial_connection.is_open:
                if self.serial_connection.in_waiting > 0:
                    data = self.serial_connection.read(self.serial_connection.in_waiting).decode(errors='replace')
                    await self.broadcast(data)
                await asyncio.sleep(0.01)
        except asyncio.CancelledError:
            pass
        except Exception as e:
            logger.error(f"Error reading from serial port: {e}")

manager = ConnectionManager()

@router.get("/ports")
async def get_ports():
    """Get list of available serial ports"""
    try:
        ports = []
        for port in serial.tools.list_ports.comports():
            ports.append({
                "device": port.device,
                "description": port.description,
                "hwid": port.hwid
            })
        return {"success": True, "ports": {"detected_ports": ports}}
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                if message.get("type") == "connect":
                    port = message.get("port")
                    baud_rate = int(message.get("baudRate", 9600))
                    success = await manager.connect_serial(port, baud_rate)
                    await websocket.send_json({"type": "connect", "success": success})
                elif message.get("type") == "disconnect":
                    success = await manager.disconnect_serial()
                    await websocket.send_json({"type": "disconnect", "success": success})
                elif message.get("type") == "send":
                    data = message.get("data", "")
                    success = await manager.send_serial(data)
                    await websocket.send_json({"type": "send", "success": success})
            except json.JSONDecodeError:
                await manager.send_serial(data)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        manager.disconnect(websocket)