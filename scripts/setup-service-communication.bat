@echo off
REM Script to set up service communication infrastructure

setlocal enabledelayedexpansion

echo ==========================================
echo Setting Up Service Communication
echo ==========================================
echo.

REM Step 1: Build shared libraries
echo [INFO] Step 1: Building shared libraries...
echo.

echo Building service-client...
cd services\shared\service-client
call npm install
call npm run build
cd ..\..\..
echo [SUCCESS] service-client built
echo.

echo Building event-bus...
cd services\shared\event-bus
call npm install
call npm run build
cd ..\..\..
echo [SUCCESS] event-bus built
echo.

REM Step 2: Update service dependencies
echo [INFO] Step 2: Updating service dependencies...
echo.

set "SERVICES=financial-service ussd-service agent-service identity-service iot-service blockchain-service robotics-service"

for %%s in (%SERVICES%) do (
    if exist "services\%%s\package.json" (
        echo Updating %%s...
        
        findstr /C:"@eazepay/service-client" "services\%%s\package.json" >nul 2>&1
        if !errorlevel! neq 0 (
            echo   Adding @eazepay/service-client dependency
            cd services\%%s
            call npm install --save file:../shared/service-client
            cd ..\..
        )
        
        findstr /C:"@eazepay/event-bus" "services\%%s\package.json" >nul 2>&1
        if !errorlevel! neq 0 (
            echo   Adding @eazepay/event-bus dependency
            cd services\%%s
            call npm install --save file:../shared/event-bus
            cd ..\..
        )
        
        echo   [SUCCESS] %%s updated
    ) else (
        echo   [ERROR] %%s package.json not found
    )
    echo.
)

REM Step 3: Verify RabbitMQ
echo [INFO] Step 3: Verifying RabbitMQ configuration...
echo.

if exist "docker-compose.yml" (
    findstr /C:"rabbitmq:" docker-compose.yml >nul 2>&1
    if !errorlevel! equ 0 (
        echo [SUCCESS] RabbitMQ configured in docker-compose.yml
    ) else (
        echo [WARNING] RabbitMQ not found in docker-compose.yml
    )
) else (
    echo [ERROR] docker-compose.yml not found
)
echo.

REM Summary
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo [SUCCESS] Shared libraries built and installed
echo.
echo Next steps:
echo   1. Update service code to use ServiceClient
echo   2. Add event publishing where needed
echo   3. Update .env files with service URLs
echo   4. Start RabbitMQ: docker-compose up -d rabbitmq
echo   5. Test inter-service communication
echo.
echo Documentation:
echo   - docs\SERVICE_COMMUNICATION.md
echo   - SERVICE_COMMUNICATION_IMPLEMENTATION.md
echo.

pause
