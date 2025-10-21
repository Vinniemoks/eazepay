@echo off
echo ================================
echo Eazepay Mobile App Setup
echo ================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

echo Navigating to mobile app directory...
cd mobile-app

echo.
echo Installing dependencies (this may take several minutes)...
call npm install

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Installation failed!
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Mobile app dependencies installed!
echo.
echo ================================
echo Next Steps:
echo ================================
echo.
echo For Android:
echo 1. Install Android Studio
echo 2. Set up Android SDK
echo 3. Run: npm run android
echo.
echo For iOS (Mac only):
echo 1. Install Xcode
echo 2. Run: cd ios && pod install
echo 3. Run: npm run ios
echo.
echo See QUICK_TEST_GUIDE.md for detailed instructions
echo.
pause
