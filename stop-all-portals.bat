@echo off
echo ========================================
echo   AfriPay - Stopping All Portals
echo ========================================
echo.

echo Stopping Node.js processes...
taskkill /F /IM node.exe >nul 2>&1

echo Stopping serve processes...
taskkill /F /IM serve.exe >nul 2>&1

echo.
echo All portals stopped!
echo.
pause
