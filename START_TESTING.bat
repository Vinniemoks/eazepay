@echo off
echo ================================
echo Eazepay - Quick Start Testing
echo ================================
echo.

echo Step 1: Starting backend services...
echo.
docker-compose up -d postgresql redis identity-service

echo.
echo Waiting for services to start (30 seconds)...
timeout /t 30 /nobreak >nul

echo.
echo Step 2: Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Backend might not be ready yet
    echo Waiting another 30 seconds...
    timeout /t 30 /nobreak >nul
)

echo.
echo Step 3: Opening web app...
start test-apps\web-app\index.html

echo.
echo ================================
echo SUCCESS!
echo ================================
echo.
echo Web app opened in your browser!
echo.
echo Backend API: http://localhost:8000
echo Web App: test-apps/web-app/index.html
echo.
echo Login with any credentials to test the UI
echo (Backend authentication may not work yet)
echo.
echo To check backend status:
echo   docker-compose ps
echo.
echo To view backend logs:
echo   docker-compose logs -f identity-service
echo.
echo To stop everything:
echo   docker-compose down
echo.
pause
