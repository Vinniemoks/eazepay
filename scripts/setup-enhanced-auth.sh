#!/bin/bash

echo "========================================"
echo "Enhanced Authentication Setup"
echo "========================================"
echo ""

echo "[1/4] Installing auth-middleware dependencies..."
cd services/shared/auth-middleware
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install auth-middleware dependencies"
    exit 1
fi

echo ""
echo "[2/4] Building auth-middleware..."
npm run build
if [ $? -ne 0 ]; then
    echo "Error: Failed to build auth-middleware"
    exit 1
fi

echo ""
echo "[3/4] Installing identity-service dependencies..."
cd ../../..
cd services/identity-service
npm install
if [ $? -ne 0 ]; then
    echo "Error: Failed to install identity-service dependencies"
    exit 1
fi

echo ""
echo "[4/4] Building identity-service..."
npm run build
if [ $? -ne 0 ]; then
    echo "Warning: Build failed, but continuing..."
fi

cd ../..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Ensure Redis is running (default: localhost:6379)"
echo "2. Set environment variables in .env:"
echo "   - JWT_SECRET (strong secret key)"
echo "   - REDIS_HOST (default: localhost)"
echo "   - REDIS_PORT (default: 6379)"
echo "   - REDIS_PASSWORD (if required)"
echo "3. Start the identity service: npm run dev"
echo ""
