#!/bin/bash

echo "🚀 Setting up AfriPay Universal development environment..."

# Check if required tools are installed
check_tool() {
    if ! command -v $1 &> /dev/null; then
        echo "❌ $1 is not installed. Please install it first."
        exit 1
    else
        echo "✅ $1 is installed"
    fi
}

echo "📋 Checking required tools..."
check_tool "node"
check_tool "python"
check_tool "java"
check_tool "go"
check_tool "docker"
check_tool "git"

# Create environment files
echo "📝 Creating environment files..."





echo "🐳 Starting Docker services..."
docker-compose up -d postgresql redis mongodb rabbitmq

echo "⏳ Waiting for databases to be ready..."
sleep 10

echo "✅ Development environment setup complete!"
echo ""
echo "📚 Next steps:"
echo "1. cd services/identity-service && npm install && npm run dev"
echo "2. cd services/biometric-service && pip install -r requirements.txt && python main.py"
echo "3. Open http://localhost:8000 for Identity Service"
echo "4. Open http://localhost:8001 for Biometric Service"
echo ""
echo "🔧 Useful commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Reset data: docker-compose down -v"
