#!/bin/bash

echo "🚀 Starting Eazepay Local Deployment..."

# Build frontend applications
echo "📦 Building Customer Portal..."
cd services/customer-portal
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
npm run build
cd ../..

echo "📦 Building Agent Portal..."
cd services/agent-portal
if [ ! -d "node_modules" ]; then
  npm install --silent
fi
npm run build
cd ../..

# Build Docker images for portals
echo "🐳 Building portal Docker images..."
docker-compose build customer-portal agent-portal

# Start Docker Compose
echo "🐳 Starting all Docker containers..."
echo "Note: This may take a few minutes on first run..."
docker-compose up -d

echo "⏳ Waiting for services to start (60 seconds)..."
sleep 60

# Check service health
echo "🏥 Checking service health..."
services=("identity-service:8000" "biometric-service:8001" "transaction-service:8002" "wallet-service:8003" "ussd-service:8004" "agent-service:8005")

healthy=0
total=${#services[@]}

for service in "${services[@]}"; do
  IFS=':' read -r name port <<< "$service"
  if curl -f http://localhost:$port/health > /dev/null 2>&1; then
    echo "✅ $name is healthy"
    ((healthy++))
  else
    echo "⚠️  $name is not responding yet (may still be starting)"
  fi
done

echo ""
echo "🎉 Deployment initiated! ($healthy/$total services responding)"
echo ""
echo "Access your applications:"
echo "  Customer Portal: http://localhost:3001"
echo "  Agent Portal:    http://localhost:3002"
echo "  Admin Portal:    http://localhost:8080"
echo "  API Gateway:     http://localhost:80"
echo "  Grafana:         http://localhost:3000"
echo "  RabbitMQ:        http://localhost:15673"
echo ""
echo "To check service status: docker-compose ps"
echo "To view logs: docker-compose logs -f [service-name]"
