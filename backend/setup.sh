#!/bin/bash

echo "🚀 Starting Bharat Records Backend Setup..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔧 Backend setup complete!"
echo ""
echo "To start the server:"
echo "  Development mode: npm run dev"
echo "  Production mode:  npm start"
echo ""
echo "📚 Check README.md for testing instructions"
echo "📖 Check API_DOCUMENTATION.md for API details"
echo ""
