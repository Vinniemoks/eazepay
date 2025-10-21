@echo off
echo ================================
echo Eazepay Desktop App Setup
echo ================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Download the LTS version and install it.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

echo Navigating to desktop app directory...
cd desktop-app

echo.
echo Installing dependencies (this may take a few minutes)...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    echo Try these fixes:
    echo 1. Delete node_modules folder
    echo 2. Run: npm cache clean --force
    echo 3. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Desktop app is ready!
echo.
echo To run the app:
echo   cd desktop-app
echo   npm run dev
echo.
echo To build executable:
echo   npm run build:win
echo.
pause
