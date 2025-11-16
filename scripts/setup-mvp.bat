@echo off
echo 🚀 Setting up Eazepay MVP...

REM Check if .env exists
if not exist .env.mvp (
    echo 📝 Creating .env.mvp file...
    copy .env.mvp.example .env.mvp
    echo ⚠️  Please edit .env.mvp with your M-Pesa credentials
    exit /b 1
)

REM Install dependencies for all services
echo 📦 Installing dependencies...

cd services\user-service && npm install && cd ..\..
cd services\wallet-service && npm install && cd ..\..
cd services\mpesa-service && npm install && cd ..\..

echo ✅ Dependencies installed

REM Build Docker images
echo 🐳 Building Docker images...
docker-compose -f docker-compose.mvp.yml build

REM Start services
echo 🚀 Starting services...
docker-compose -f docker-compose.mvp.yml up -d

REM Wait for services
echo ⏳ Waiting for services to be ready...
timeout /t 10 /nobreak

REM Run migrations
echo 🗄️  Running database migrations...
docker-compose -f docker-compose.mvp.yml exec user-service npm run migrate
docker-compose -f docker-compose.mvp.yml exec wallet-service npm run migrate

echo.
echo ✅ Eazepay MVP is running!
echo.
echo 📍 Services:
echo    - API Gateway: http://localhost
echo    - User Service: http://localhost:8000
echo    - Wallet Service: http://localhost:8003
echo    - M-Pesa Service: http://localhost:8004
echo.
echo 🧪 Test the API:
echo    curl http://localhost/health
echo.
echo 📚 Next steps:
echo    1. Register a user: POST http://localhost/api/auth/register
echo    2. Login: POST http://localhost/api/auth/login
echo    3. Create wallet: POST http://localhost/api/wallet/create
echo    4. Top up with M-Pesa: POST http://localhost/api/mpesa/initiate
echo.
