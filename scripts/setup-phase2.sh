#!/bin/bash

echo "🚀 Setting up Eazepay Phase 2 (Biometric Payment)..."

# Check if .env exists
if [ ! -f .env.phase2 ]; then
    echo "📝 Creating .env.phase2 file..."
    cp .env.phase2.example .env.phase2
    echo "⚠️  Please edit .env.phase2 with your M-Pesa credentials"
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

echo "✅ Dependencies installed"

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose -f docker-compose.phase2.yml build

# Start services
echo "🚀 Starting services..."
docker-compose -f docker-compose.phase2.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be ready..."
sleep 15

# Run migrations
echo "🗄️  Running database migrations..."
docker-compose -f docker-compose.phase2.yml exec -T user-service npm run migrate
docker-compose -f docker-compose.phase2.yml exec -T wallet-service npm run migrate
docker-compose -f docker-compose.phase2.yml exec -T biometric-service npm run migrate
docker-compose -f docker-compose.phase2.yml exec -T agent-service npm run migrate

echo ""
echo "✅ Eazepay Phase 2 is running!"
echo ""
echo "📍 Services:"
echo "   - API Gateway: http://localhost"
echo "   - User Service: http://localhost:8000"
echo "   - Wallet Service: http://localhost:8003"
echo "   - M-Pesa Service: http://localhost:8004"
echo "   - Biometric Service: http://localhost:8001"
echo "   - Agent Service: http://localhost:8005"
echo "   - Payment Auth Service: http://localhost:8006"
echo ""
echo "🧪 Test the API:"
echo "   ./scripts/test-phase2.sh"
echo ""
echo "📚 Next steps:"
echo "   1. Register an agent: POST http://localhost/api/auth/register (role: agent)"
echo "   2. Register a customer: POST http://localhost/api/agent/register-customer"
echo "   3. Authorize payment: POST http://localhost/api/payment/authorize"
echo ""
