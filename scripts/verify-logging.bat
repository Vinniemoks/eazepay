@echo off
REM Script to verify Winston logging is properly configured in all services

setlocal enabledelayedexpansion

echo ==========================================
echo Verifying Winston Logging Configuration
echo ==========================================
echo.

set "SERVICES=financial-service ussd-service agent-service identity-service iot-service blockchain-service robotics-service"
set TOTAL_ERRORS=0

for %%s in (%SERVICES%) do (
    echo [INFO] Checking %%s...
    set SERVICE_ERRORS=0
    
    REM Check if package.json has winston
    findstr /C:"winston" "services\%%s\package.json" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] Winston dependency found in package.json
    ) else (
        echo   [ERROR] Winston dependency missing in package.json
        set /a SERVICE_ERRORS+=1
    )
    
    REM Check if winston-daily-rotate-file is present
    findstr /C:"winston-daily-rotate-file" "services\%%s\package.json" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [OK] winston-daily-rotate-file dependency found
    ) else (
        echo   [WARNING] winston-daily-rotate-file dependency missing
    )
    
    REM Check if logger file exists
    if exist "services\%%s\src\utils\logger.ts" (
        echo   [OK] Logger utility file exists
    ) else if exist "services\%%s\utils\logger.js" (
        echo   [OK] Logger utility file exists
    ) else (
        echo   [ERROR] Logger utility file not found
        set /a SERVICE_ERRORS+=1
    )
    
    REM Check if winston is installed
    if exist "services\%%s\node_modules\winston" (
        echo   [OK] Winston installed in node_modules
    ) else (
        echo   [ERROR] Winston not installed - run npm install
        set /a SERVICE_ERRORS+=1
    )
    
    REM Check logs directory
    if exist "services\%%s\logs" (
        echo   [OK] Logs directory exists
    ) else (
        echo   [WARNING] Logs directory will be created on first run
    )
    
    set /a TOTAL_ERRORS+=!SERVICE_ERRORS!
    echo.
)

echo ==========================================
echo Verification Summary
echo ==========================================
echo.

if !TOTAL_ERRORS! equ 0 (
    echo [SUCCESS] All services configured correctly!
    echo.
    echo Next steps:
    echo   1. Start services to generate logs
    echo   2. Check logs in services\*\logs\
    echo   3. Verify JSON format and rotation
    exit /b 0
) else (
    echo [ERROR] Found !TOTAL_ERRORS! error^(s^)
    echo.
    echo Please fix the issues above and run:
    echo   npm install ^(in affected service directories^)
    exit /b 1
)
