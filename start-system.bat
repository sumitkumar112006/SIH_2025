@echo off

REM Start the backend server in a new command prompt window
start "Backend Server" cmd /k "node server.js"

REM Wait a few seconds for the backend to start
timeout /t 5 /nobreak >nul

REM Start a simple HTTP server for the frontend
start "Frontend Server" cmd /k "npx http-server -p 8000"

echo System startup initiated!
echo Backend server running on http://localhost:3000
echo Frontend server running on http://localhost:8000
echo Press any key to exit...
pause >nul