#!/bin/bash

# Christmas Quiz Startup Script

echo "🎄 Starting Christmas Quiz Game 🎅"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Function to check if dependencies are installed
check_dependencies() {
    if [ ! -d "$1/node_modules" ]; then
        echo "📦 Installing dependencies for $2..."
        cd "$1" && npm install
        cd ..
        echo "✓ $2 dependencies installed"
        echo ""
    else
        echo "✓ $2 dependencies already installed"
    fi
}

# Check and install backend dependencies
check_dependencies "backend" "Backend"

# Check and install frontend dependencies
check_dependencies "frontend" "Frontend"

echo ""
echo "🚀 Starting servers..."
echo ""

# Start backend server in background
echo "Starting backend server on port 3001..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend server
echo "Starting frontend on port 3000..."
echo ""
echo "=================================="
echo "🎄 Christmas Quiz is starting! 🎅"
echo "=================================="
echo ""
echo "📋 Quizmaster Dashboard: http://localhost:3000"
echo "🔗 Team URLs will be displayed in the backend console above"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

cd frontend
npm start

# When frontend is stopped, also stop backend
kill $BACKEND_PID 2>/dev/null
