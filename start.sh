#!/bin/bash

# Photography Portfolio - Start Script

echo "🎨 Photography Portfolio Website"
echo "================================"
echo ""

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    echo "🚀 Starting server..."
    echo ""
    python3 server.py
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    echo "🚀 Starting server..."
    echo ""
    python server.py
else
    echo "❌ Python not found"
    echo ""
    echo "Alternative ways to run the website:"
    echo "1. Open index.html directly in your browser"
    echo "2. Use Node.js: npm start (if you have Node.js installed)"
    echo "3. Install Python 3 and try again"
    echo ""
    echo "For the best experience, use a local server to avoid CORS issues."
    exit 1
fi
