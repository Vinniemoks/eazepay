@echo off
echo ========================================
echo   Eazepay - Starting All Portals
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Starting Customer Portal on port 3001...
start "Customer Portal" cmd /k "cd services\customer-portal && npm run dev"
timeout /t 2 /nobreak >nul

echo [2/4] Starting Agent Portal on port 3002...
start "Agent Portal" cmd /k "cd services\agent-portal && npm run dev"
timeout /t 2 /nobreak >nul

echo [3/4] Starting Admin Portal on port 3000...
start "Admin Portal" cmd /k "cd services\admin-portal && npm run dev"
timeout /t 2 /nobreak >nul

echo [4/4] Starting Web Portal on port 8080...
start "Web Portal" cmd /k "cd services\web-portal && npx serve public -p 8080"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo   All Portals Started Successfully!
echo ========================================
echo.
echo Portal URLs:
echo   - Customer Portal: http://localhost:3001
echo   - Agent Portal:    http://localhost:3002
echo   - Admin Portal:    http://localhost:3000
echo   - Web Portal:      http://localhost:8080
echo.
echo Press any key to open all portals in browser...
pause >nul

start http://localhost:8080
timeout /t 1 /nobreak >nul
start http://localhost:3001
timeout /t 1 /nobreak >nul
start http://localhost:3002
timeout /t 1 /nobreak >nul
start http://localhost:3000

echo.
echo All portals opened in browser!
echo Close this window when done (portal windows will remain open)
pause
