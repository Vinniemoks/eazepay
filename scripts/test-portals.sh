#!/bin/bash

echo "🧪 Testing Eazepay Portals..."

# Build frontend applications
echo "📦 Building Customer Portal..."
cd services/customer-portal
npm install --silent
npm run build
cd ../..

echo "📦 Building Agent Portal..."
cd services/agent-portal
npm install --silent
npm run build
cd ../..

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build customer-portal agent-portal

echo "✅ Portal builds completed successfully!"
echo ""
echo "To start the portals, run:"
echo "  docker-compose up -d customer-portal agent-portal"
echo ""
echo "Or to start all services:"
echo "  docker-compose up -d"
