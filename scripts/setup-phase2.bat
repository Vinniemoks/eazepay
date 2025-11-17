@echo off
echo 🚀 Setting up Eazepay Phase 2 (Biometric Payment)...

REM Check if .env exists
if not exist .env.phase2 (
    echo 📝 Creating .env.phase2 file...
    copy .env.phase2.example .env.phase2
    echo ⚠️  Please edit .env.phase2 with your M-Pesa credentials
    exit /b 1
)

REM Install dependencies for all services
echo 📦 Installing dependencies...

cd services\user-service && npm install && cd ..\..
cd services\wallet-service && npm install && cd ..\..
cd services\mpesa-service && npm install && cd ..\..
cd services\biometric-service-v2 && npm install && cd ..\..
cd services\agent-service-v2 && npm install && cd ..\..
cd services\payment-auth-service && npm install && cd ..\..

echo ✅ Dependencies installed

REM Build Docker images
echo 🐳 Building Docker images...
docker-compose -f docker-compose.phase2.yml build

REM Start services
echo 🚀 Starting services...
docker-compose -f docker-compose.phase2.yml up -d

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 15 /nobreak

REM Run migrations
echo 🗄️  Running database migrations...
docker-compose -f docker-compose.phase2.yml exec user-service npm run migrate
docker-compose -f docker-compose.phase2.yml exec wallet-service npm run migrate
docker-compose -f docker-compose.phase2.yml exec biometric-service npm run migrate
docker-compose -f docker-compose.phase2.yml exec agent-service npm run migrate

echo.
echo ✅ Eazepay Phase 2 is running!
echo.
echo 📍 Services:
echo    - API Gateway: http://localhost
echo    - User Service: http://localhost:8000
echo    - Wallet Service: http://localhost:8003
echo    - M-Pesa Service: http://localhost:8004
echo    - Biometric Service: http://localhost:8001
echo    - Agent Service: http://localhost:8005
echo    - Payment Auth Service: http://localhost:8006
echo.
echo 🧪 Test the API:
echo    .\scripts\test-phase2.bat
echo.
