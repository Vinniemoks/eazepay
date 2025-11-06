#!/bin/bash

# Script to verify Winston logging is properly configured in all services

set -e

echo "=========================================="
echo "Verifying Winston Logging Configuration"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Services to check
SERVICES=(
  "financial-service"
  "ussd-service"
  "agent-service"
  "identity-service"
  "iot-service"
  "blockchain-service"
  "robotics-service"
)

check_service() {
  local service=$1
  local service_path="services/$service"
  local errors=0
  
  echo -e "${BLUE}Checking $service...${NC}"
  
  # Check if package.json has winston
  if grep -q '"winston"' "$service_path/package.json" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Winston dependency found in package.json"
  else
    echo -e "  ${RED}✗${NC} Winston dependency missing in package.json"
    ((errors++))
  fi
  
  # Check if winston-daily-rotate-file is present
  if grep -q '"winston-daily-rotate-file"' "$service_path/package.json" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} winston-daily-rotate-file dependency found"
  else
    echo -e "  ${YELLOW}⚠${NC} winston-daily-rotate-file dependency missing (optional)"
  fi
  
  # Check if logger file exists
  if [ -f "$service_path/src/utils/logger.ts" ] || [ -f "$service_path/utils/logger.js" ]; then
    echo -e "  ${GREEN}✓${NC} Logger utility file exists"
  else
    echo -e "  ${RED}✗${NC} Logger utility file not found"
    ((errors++))
  fi
  
  # Check if winston is installed in node_modules
  if [ -d "$service_path/node_modules/winston" ]; then
    echo -e "  ${GREEN}✓${NC} Winston installed in node_modules"
  else
    echo -e "  ${RED}✗${NC} Winston not installed (run npm install)"
    ((errors++))
  fi
  
  # Check if logs directory exists or will be created
  if [ -d "$service_path/logs" ]; then
    echo -e "  ${GREEN}✓${NC} Logs directory exists"
  else
    echo -e "  ${YELLOW}⚠${NC} Logs directory will be created on first run"
  fi
  
  echo ""
  return $errors
}

# Main execution
TOTAL_ERRORS=0

for service in "${SERVICES[@]}"; do
  if check_service "$service"; then
    :
  else
    ((TOTAL_ERRORS+=$?))
  fi
done

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""

if [ $TOTAL_ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All services configured correctly!${NC}"
  echo ""
  echo "Next steps:"
  echo "  1. Start services to generate logs"
  echo "  2. Check logs in services/*/logs/"
  echo "  3. Verify JSON format and rotation"
  exit 0
else
  echo -e "${RED}✗ Found $TOTAL_ERRORS error(s)${NC}"
  echo ""
  echo "Please fix the issues above and run:"
  echo "  npm install (in affected service directories)"
  exit 1
fi
