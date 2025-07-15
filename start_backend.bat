@echo off
echo Starting Arduino Code Editor Backend...
cd %~dp0\backend
python -m pip install -r requirements.txt
python server.py