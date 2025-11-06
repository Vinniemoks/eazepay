@echo off
REM Script to install dependencies for all Node.js services
REM This script is useful after adding new dependencies like Winston logging

setlocal enabledelayedexpansion

echo ==========================================
echo Installing Dependencies for All Services
echo ==========================================
echo.

set "SERVICES=financial-service ussd-service agent-service identity-service iot-service blockchain-service robotics-service admin-portal customer-portal agent-portal web-portal"

set FAILED_COUNT=0
set SUCCESS_COUNT=0

for %%s in (%SERVICES%) do (
    if exist "services\%%s\package.json" (
        echo [INFO] Installing dependencies for %%s...
        cd services\%%s
        
        call npm install
        
        if !errorlevel! equ 0 (
            echo [SUCCESS] Successfully installed dependencies for %%s
            set /a SUCCESS_COUNT+=1
        ) else (
            echo [ERROR] Failed to install dependencies for %%s
            set /a FAILED_COUNT+=1
        )
        
        cd ..\..
        echo.
    ) else (
        echo [WARNING] No package.json found for %%s
        echo.
    )
)

echo ==========================================
echo Installation Summary
echo ==========================================
echo.
echo Successful: %SUCCESS_COUNT%
echo Failed: %FAILED_COUNT%
echo.

if %FAILED_COUNT% gtr 0 (
    echo Some services failed to install dependencies.
    exit /b 1
) else (
    echo All services installed successfully!
    exit /b 0
)
