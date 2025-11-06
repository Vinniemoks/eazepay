#!/bin/bash

# Script to install dependencies for all Node.js services
# This script is useful after adding new dependencies like Winston logging

set -e

echo "=========================================="
echo "Installing Dependencies for All Services"
echo "=========================================="
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Array of Node.js services
NODE_SERVICES=(
  "financial-service"
  "ussd-service"
  "agent-service"
  "identity-service"
  "iot-service"
  "blockchain-service"
  "robotics-service"
  "admin-portal"
  "customer-portal"
  "agent-portal"
  "web-portal"
)

# Function to install dependencies for a service
install_service() {
  local service=$1
  local service_path="services/$service"
  
  if [ -f "$service_path/package.json" ]; then
    echo -e "${BLUE}Installing dependencies for $service...${NC}"
    cd "$service_path"
    
    if npm install; then
      echo -e "${GREEN}✓ Successfully installed dependencies for $service${NC}"
    else
      echo -e "${RED}✗ Failed to install dependencies for $service${NC}"
      return 1
    fi
    
    cd - > /dev/null
    echo ""
  else
    echo -e "${RED}✗ No package.json found for $service${NC}"
    echo ""
  fi
}

# Main execution
FAILED_SERVICES=()
SUCCESSFUL_SERVICES=()

for service in "${NODE_SERVICES[@]}"; do
  if install_service "$service"; then
    SUCCESSFUL_SERVICES+=("$service")
  else
    FAILED_SERVICES+=("$service")
  fi
done

# Summary
echo "=========================================="
echo "Installation Summary"
echo "=========================================="
echo ""
echo -e "${GREEN}Successful (${#SUCCESSFUL_SERVICES[@]}):${NC}"
for service in "${SUCCESSFUL_SERVICES[@]}"; do
  echo "  ✓ $service"
done

if [ ${#FAILED_SERVICES[@]} -gt 0 ]; then
  echo ""
  echo -e "${RED}Failed (${#FAILED_SERVICES[@]}):${NC}"
  for service in "${FAILED_SERVICES[@]}"; do
    echo "  ✗ $service"
  done
  exit 1
else
  echo ""
  echo -e "${GREEN}All services installed successfully!${NC}"
fi
