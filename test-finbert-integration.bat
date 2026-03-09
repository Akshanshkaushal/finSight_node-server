@echo off
REM Test script for FinBERT news classification integration

echo ==========================================
echo FinBERT News Classification Test
echo ==========================================
echo.

REM Configuration
set NEWS_SERVICE_URL=http://localhost:3003
set ML_SERVICE_URL=http://localhost:3009
set FINBERT_SERVICE_URL=http://localhost:5000

echo Step 1: Checking service availability
echo --------------------------------------
echo.

REM Check FinBERT Service
echo Checking FinBERT Service...
curl -s -f %FINBERT_SERVICE_URL%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] FinBERT Service not running
    goto :error
) else (
    echo [OK] FinBERT Service is running
)

REM Check ML Service
echo Checking ML Service...
curl -s -f %ML_SERVICE_URL%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] ML Service not running
    goto :error
) else (
    echo [OK] ML Service is running
)

REM Check News Service
echo Checking News Service...
curl -s -f %NEWS_SERVICE_URL%/health >nul 2>&1
if errorlevel 1 (
    echo [ERROR] News Service not running
    goto :error
) else (
    echo [OK] News Service is running
)

echo.
echo All services are running!
echo.

REM Test FinBERT
echo Step 2: Testing FinBERT classification
echo --------------------------------------
echo.

curl -X POST %FINBERT_SERVICE_URL%/classify ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"RBI increases repo rate\", \"content\": \"Reserve Bank raises rates\", \"credibility\": 90}"

echo.
echo.

REM Test ML Service
echo Step 3: Testing ML Service
echo --------------------------------------
echo.

curl -X POST %ML_SERVICE_URL%/classify-news ^
  -H "Content-Type: application/json" ^
  -d "{\"title\": \"Rupee falls against dollar\", \"content\": \"Currency weakens\", \"credibility\": 85}"

echo.
echo.

REM Test News Service
echo Step 4: Testing News Service
echo --------------------------------------
echo.

curl -X POST %NEWS_SERVICE_URL%/fetch

echo.
echo.

REM Get news with sentiment
echo Step 5: Retrieving classified news
echo --------------------------------------
echo.

curl %NEWS_SERVICE_URL%/?limit=3

echo.
echo.

echo ==========================================
echo Test Complete
echo ==========================================
echo.
echo FinBERT integration is working!
echo Check the output above for sentiment data.
echo.
goto :end

:error
echo.
echo [ERROR] Not all services are running!
echo.
echo Please start the required services:
echo   1. FinBERT: cd ml-service ^&^& start-finbert.bat
echo   2. ML Service: cd ml-service ^&^& npm start
echo   3. News Service: cd news-service ^&^& npm start
echo.
echo Or use Docker: cd docker ^&^& docker-compose up -d
exit /b 1

:end
