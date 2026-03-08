#!/bin/bash

# FinBERT Quick Start Script
# This script helps you quickly set up and test FinBERT integration

echo "======================================"
echo "FinBERT Integration Setup"
echo "======================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

echo "✓ Python found: $(python3 --version)"
echo ""

# Navigate to Python directory
cd "$(dirname "$0")/src/python" || exit 1

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

echo ""

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate || {
    echo "❌ Failed to activate virtual environment"
    exit 1
}

echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "Installing Python dependencies..."
echo "This may take a few minutes on first run..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "======================================"
echo "Starting FinBERT Service"
echo "======================================"
echo ""
echo "Note: First run will download the FinBERT model (~440MB)"
echo "This may take several minutes depending on your internet speed."
echo ""

# Start the service
python app.py
