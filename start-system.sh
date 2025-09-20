#!/bin/bash

# Start the backend server in the background
node server.js &

# Store the process ID
BACKEND_PID=$!

# Wait a few seconds for the backend to start
sleep 5

# Start a simple HTTP server for the frontend
npx http-server -p 8000 &

# Store the process ID
FRONTEND_PID=$!

echo "System startup initiated!"
echo "Backend server running on http://localhost:3000"
echo "Frontend server running on http://localhost:8000"

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID