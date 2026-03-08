@echo off
REM FinBERT Quick Start Script for Windows
REM This script helps you quickly set up and test FinBERT integration

echo ======================================
echo FinBERT Integration Setup
echo ======================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed. Please install Python 3.8 or higher.
    exit /b 1
)

echo Python found
python --version
echo.

REM Navigate to Python directory
cd /d "%~dp0src\python"

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    echo Virtual environment created
) else (
    echo Virtual environment already exists
)

echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error: Failed to activate virtual environment
    exit /b 1
)

echo Virtual environment activated
echo.

REM Install dependencies
echo Installing Python dependencies...
echo This may take a few minutes on first run...
python -m pip install --upgrade pip >nul 2>&1
python -m pip install -r requirements.txt

if errorlevel 1 (
    echo Error: Failed to install dependencies
    exit /b 1
)

echo Dependencies installed successfully
echo.

echo ======================================
echo Starting FinBERT Service
echo ======================================
echo.
echo Note: First run will download the FinBERT model (~440MB)
echo This may take several minutes depending on your internet speed.
echo.

REM Start the service
python app.py
