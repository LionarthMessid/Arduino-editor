import subprocess
import os
import logging
from typing import Dict, List
from pathlib import Path

logger = logging.getLogger(__name__)

# Get the root directory
ROOT_DIR = Path(__file__).parent.parent

def run_arduino_cli(command: List[str]) -> Dict:
    """Run arduino-cli command and return result"""
    try:
        # Add arduino-cli to PATH
        env = os.environ.copy()
        bin_path = str(ROOT_DIR.parent / 'bin')
        env['PATH'] = f"{bin_path};{env.get('PATH', '')}"
        # Set HOME to a Windows-compatible path
        env['HOME'] = str(ROOT_DIR)
        
        # Use arduino-cli.exe on Windows
        if command[0] == 'arduino-cli' and os.name == 'nt':
            command[0] = 'arduino-cli.exe'
        
        logger.info(f"Running command: {' '.join(command)}")
        
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            env=env
        )
        
        if result.returncode != 0:
            logger.error(f"Command failed with code {result.returncode}: {result.stderr}")
        
        return {
            'success': result.returncode == 0,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        }
    except Exception as e:
        logger.error(f"Exception running arduino-cli: {e}")
        return {
            'success': False,
            'stdout': '',
            'stderr': str(e),
            'returncode': -1
        }