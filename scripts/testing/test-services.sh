#!/bin/bash

echo "Ì∑™ Testing AfriPay Universal Services..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    
    echo -e "${YELLOW}Testing ${service_name}...${NC}"
    
    # Wait for service to be ready
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -s "http://localhost:${port}${endpoint}" > /dev/null; then
            echo -e "${GREEN}‚úÖ ${service_name} is ready${NC}"
            return 0
        fi
        
        echo "Waiting for ${service_name}... (attempt $((attempt + 1))/${max_attempts})"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}‚ùå ${service_name} failed to start${NC}"
    return 1
}

# Start services
echo "Ì∫Ä Starting services..."
docker-compose up -d

# Test each service
test_service "Identity Service" 8000 "/health"
test_service "Biometric Service" 8001 "/health"

# Run unit tests
echo -e "${YELLOW}Running unit tests...${NC}"

# Test Identity Service
if [ -d "services/identity-service" ]; then
    echo "Testing Identity Service..."
    cd services/identity-service
    npm test
    cd ../../
fi

# Test Biometric Service  
if [ -d "services/biometric-service" ]; then
    echo "Testing Biometric Service..."
    cd services/biometric-service
    python -m pytest test_main.py -v
    cd ../../
fi

echo -e "${GREEN}‚úÖ All tests completed!${NC}"
