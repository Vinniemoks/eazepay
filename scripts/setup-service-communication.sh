#!/bin/bash

# Script to set up service communication infrastructure
# Installs shared libraries and updates service dependencies

set -e

echo "=========================================="
echo "Setting Up Service Communication"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Build shared libraries
echo -e "${BLUE}Step 1: Building shared libraries...${NC}"
echo ""

echo "Building service-client..."
cd services/shared/service-client
npm install
npm run build
cd ../../..
echo -e "${GREEN}✓ service-client built${NC}"
echo ""

echo "Building event-bus..."
cd services/shared/event-bus
npm install
npm run build
cd ../../..
echo -e "${GREEN}✓ event-bus built${NC}"
echo ""

# Step 2: Update service package.json files
echo -e "${BLUE}Step 2: Updating service dependencies...${NC}"
echo ""

SERVICES=(
  "financial-service"
  "ussd-service"
  "agent-service"
  "identity-service"
  "iot-service"
  "blockchain-service"
  "robotics-service"
)

for service in "${SERVICES[@]}"; do
  SERVICE_PATH="services/$service"
  
  if [ -f "$SERVICE_PATH/package.json" ]; then
    echo "Updating $service..."
    
    # Check if dependencies already exist
    if ! grep -q "@afripay/service-client" "$SERVICE_PATH/package.json"; then
      echo -e "${YELLOW}  Adding @afripay/service-client dependency${NC}"
      cd "$SERVICE_PATH"
      npm install --save file:../shared/service-client
      cd ../..
    fi
    
    if ! grep -q "@afripay/event-bus" "$SERVICE_PATH/package.json"; then
      echo -e "${YELLOW}  Adding @afripay/event-bus dependency${NC}"
      cd "$SERVICE_PATH"
      npm install --save file:../shared/event-bus
      cd ../..
    fi
    
    echo -e "${GREEN}  ✓ $service updated${NC}"
  else
    echo -e "${RED}  ✗ $service package.json not found${NC}"
  fi
  echo ""
done

# Step 3: Verify RabbitMQ configuration
echo -e "${BLUE}Step 3: Verifying RabbitMQ configuration...${NC}"
echo ""

if [ -f "docker-compose.yml" ]; then
  if grep -q "rabbitmq:" docker-compose.yml; then
    echo -e "${GREEN}✓ RabbitMQ configured in docker-compose.yml${NC}"
  else
    echo -e "${YELLOW}⚠ RabbitMQ not found in docker-compose.yml${NC}"
  fi
else
  echo -e "${RED}✗ docker-compose.yml not found${NC}"
fi
echo ""

# Step 4: Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo -e "${GREEN}Shared libraries built and installed${NC}"
echo ""
echo "Next steps:"
echo "  1. Update service code to use ServiceClient"
echo "  2. Add event publishing where needed"
echo "  3. Update .env files with service URLs"
echo "  4. Start RabbitMQ: docker-compose up -d rabbitmq"
echo "  5. Test inter-service communication"
echo ""
echo "Documentation:"
echo "  - docs/SERVICE_COMMUNICATION.md"
echo "  - SERVICE_COMMUNICATION_IMPLEMENTATION.md"
echo ""
