@echo off
echo ================================
echo Eazepay Web App Test
echo ================================
echo.

echo Checking if backend is running...
curl -s http://localhost:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Backend is not running!
    echo.
    echo Please start the backend first:
    echo   docker-compose up -d identity-service
    echo.
    pause
    exit /b 1
)

echo [OK] Backend is running!
echo.
echo Opening web app in your browser...
echo.
echo Login with:
echo   Email: admin@eazepay.com
echo   Password: your_password
echo.

start test-apps\web-app\index.html

echo.
echo Web app opened in your browser!
echo.
echo If you see connection errors:
echo 1. Make sure backend is running: docker-compose ps
echo 2. Check backend logs: docker-compose logs identity-service
echo 3. Try accessing: http://localhost:8000/health
echo.
pause
