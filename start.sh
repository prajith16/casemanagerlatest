#!/bin/bash

# CaseManager Startup Script
# This script starts the backend API, frontend Angular application, and MCP Server

echo "🚀 Starting CaseManager Application..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Function to cleanup processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down CaseManager..."
    if [ ! -z "$BACKEND_PID" ]; then
        echo "Stopping backend (PID: $BACKEND_PID)..."
        kill $BACKEND_PID 2>/dev/null
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Stopping frontend (PID: $FRONTEND_PID)..."
        kill $FRONTEND_PID 2>/dev/null
    fi
    if [ ! -z "$MCP_PID" ]; then
        echo "Stopping MCP Server (PID: $MCP_PID)..."
        kill $MCP_PID 2>/dev/null
    fi
    echo "✅ Shutdown complete"
    exit 0
}

# Set up trap to catch SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Start Backend API
echo "📡 Starting Backend API..."
cd "$SCRIPT_DIR/CaseManager.Api"
dotnet run > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
echo "Backend logs: $SCRIPT_DIR/CaseManager.Api/backend.log"
echo ""

# Wait for backend to start
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Check if backend is running
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "❌ Backend failed to start. Check backend.log for errors."
    exit 1
fi

# Start Frontend Angular App
echo "🎨 Starting Frontend Angular App..."
cd "$SCRIPT_DIR/CaseManager.web"
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"
echo "Frontend logs: $SCRIPT_DIR/CaseManager.web/frontend.log"
echo ""

# Wait for frontend to compile
echo "⏳ Waiting for frontend to compile..."
sleep 10

# Start MCP Server
echo "🔌 Starting MCP Server..."
cd "$SCRIPT_DIR/CaseManager.McpServer"
dotnet run > mcp-server.log 2>&1 &
MCP_PID=$!
echo "MCP Server started (PID: $MCP_PID)"
echo "MCP Server logs: $SCRIPT_DIR/CaseManager.McpServer/mcp-server.log"
echo ""

echo "✅ CaseManager is now running!"
echo ""
echo "📍 Access points:"
echo "   - Frontend:  http://localhost:4200"
echo "   - Backend:   http://localhost:5226"
echo "   - Swagger:   http://localhost:5226"
echo "   - MCP Server: stdio (for MCP clients)"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Keep script running and wait for Ctrl+C
wait
