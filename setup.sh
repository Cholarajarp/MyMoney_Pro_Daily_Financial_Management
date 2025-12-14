#!/bin/bash
echo ""
echo "  docker-compose up"
echo "Or use Docker:"
echo ""
echo "  Frontend: npm start"
echo "  Backend:  python backend/app.py"
echo "To start the development servers:"
echo ""
echo "🎉 Setup complete!"

echo ""
fi
    echo "✅ .env file already exists"
else
    echo "✅ .env file created. Please update it with your configuration."
    cp .env.example .env
    echo "📝 Creating .env file..."
if [ ! -f .env ]; then
# Create .env file if it doesn't exist

echo ""
echo "✅ Database initialized"
fi
    exit 1
    echo "❌ Failed to initialize database"
if [ $? -ne 0 ]; then
$PYTHON_CMD init_db.py
echo "🗄️  Initializing database..."
# Initialize database

echo ""
echo "✅ Backend dependencies installed"
fi
    exit 1
    echo "❌ Failed to install backend dependencies"
if [ $? -ne 0 ]; then
pip install -r requirements.txt
echo "📦 Installing backend dependencies..."
# Install backend dependencies

echo ""
echo "✅ Frontend dependencies installed"
fi
    exit 1
    echo "❌ Failed to install frontend dependencies"
if [ $? -ne 0 ]; then
npm install
echo "📦 Installing frontend dependencies..."
# Install frontend dependencies

echo ""
echo "✅ Python version: $($PYTHON_CMD --version)"
echo "✅ Node.js version: $(node --version)"

fi
    PYTHON_CMD=python
else
    PYTHON_CMD=python3
if command -v python3 &> /dev/null; then
# Use python3 if available, otherwise python

fi
    exit 1
    echo "❌ Python is not installed. Please install Python 3.11+ first."
if ! command -v python &> /dev/null && ! command -v python3 &> /dev/null; then
# Check if Python is installed

fi
    exit 1
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
if ! command -v node &> /dev/null; then
# Check if Node.js is installed

echo ""
echo "🚀 MyMoney Pro - Setting up local development environment..."

# MyMoney Pro - Local Development Setup Script


