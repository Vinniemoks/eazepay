#!/bin/bash

echo "🚀 Setting up Eazepay Phase 3 (Virtual Cards)..."

# Check if .env exists
if [ ! -f .env.phase3 ]; then
    echo "📝 Creating .env.phase3 file..."
    cp .env.phase3.example .env.phase3
    echo "⚠️  Please edit .env.phase3 with your credentials"
    exit 1
fi

# Install dependencies for all services
echo "📦 Installing dependencies..."

cd services/user-service && npm install && cd ../..
cd services/wallet-service && npm install && cd ../..
cd services/mpesa-service && npm install && cd ../..
cd services/biometric-service-v2 && npm install && cd ../..
cd services/agent-service-v2 && npm install && cd ../..
cd services/payment-auth-service && npm install && cd ../..
cd services/virtual-card-service-v2 && npm install && cd ../..

echo "✅ Dependencies installed"

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.phase3.yml build

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.phase3.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.phase3.yml exec -T user-service npm run migrate
docker-compose -f docker-compose.phase3.yml exec -T wallet-service npm run migrate
docker-compose -f docker-compose.phase3.yml exec -T biometric-service npm run migrate
docker-compose -f docker-compose.phase3.yml exec -T agent-service npm run migrate
docker-compose -f docker-compose.phase3.yml exec -T virtual-card-service npm run migrate

echo ""
echo "✅ Eazepay Phase 3 is running!"
echo ""
echo "📍 Services:"
echo "   - API Gateway: http://localhost"
echo "   - User Service: http://localhost:8000"
echo "   - Wallet Service: http://localhost:8003"
echo "   - M-Pesa Service: http://localhost:8004"
echo "   - Biometric Service: http://localhost:8001"
echo "   - Agent Service: http://localhost:8005"
echo "   - Payment Auth Service: http://localhost:8006"
echo "   - Virtual Card Service: http://localhost:8007"
echo ""
echo "🧪 Test the API:"
echo "   ./scripts/test-phase3.sh"
echo ""
echo "📚 Complete flow:"
echo "   1. Register user: POST http://localhost/api/auth/register"
echo "   2. Create wallet: POST http://localhost/api/wallet/create"
echo "   3. Top up wallet: POST http://localhost/api/mpesa/initiate"
echo "   4. Create virtual card: POST http://localhost/api/cards/create"
echo "   5. Top up card: POST http://localhost/api/cards/:cardId/topup"
echo "   6. Shop globally! 🌍"
echo ""
