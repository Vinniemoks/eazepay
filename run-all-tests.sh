#!/bin/bash
# AfriPay Universal - Automated Test Runner for All Microservices

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function run_node_tests() {
  local dir=$1
  echo -e "${YELLOW}Running Node.js tests in $dir...${NC}"
  cd "$dir"
  if [ -f "package.json" ]; then
    if npm test; then
      echo -e "${GREEN}✅ Node.js tests passed in $dir${NC}"
    else
      echo -e "${RED}❌ Node.js tests failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No package.json found in $dir, skipping Node.js tests.${NC}"
  fi
  cd - > /dev/null
}

function run_python_tests() {
  local dir=$1
  echo -e "${YELLOW}Running Python tests in $dir...${NC}"
  cd "$dir"
  if [ -f "test_main.py" ]; then
    if python3 -m unittest test_main.py; then
      echo -e "${GREEN}✅ Python tests passed in $dir${NC}"
    else
      echo -e "${RED}❌ Python tests failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No test_main.py found in $dir, skipping Python tests.${NC}"
  fi
  cd - > /dev/null
}

function run_java_tests() {
  local dir=$1
  echo -e "${YELLOW}Running Java tests in $dir...${NC}"
  cd "$dir"
  if [ -f "pom.xml" ]; then
    if mvn test; then
      echo -e "${GREEN}✅ Java tests passed in $dir${NC}"
    else
      echo -e "${RED}❌ Java tests failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No pom.xml found in $dir, skipping Java tests.${NC}"
  fi
  cd - > /dev/null
}

function run_go_tests() {
  local dir=$1
  echo -e "${YELLOW}Running Go tests in $dir...${NC}"
  cd "$dir"
  if [ -f "go.mod" ]; then
    if go test ./...; then
      echo -e "${GREEN}✅ Go tests passed in $dir${NC}"
    else
      echo -e "${RED}❌ Go tests failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No go.mod found in $dir, skipping Go tests.${NC}"
  fi
  cd - > /dev/null
}

function main() {
  echo -e "${BLUE}🔬 AfriPay Universal Automated Test Runner${NC}"
  echo "========================================="

  # Node.js services
  run_node_tests "services/agent-service"
  run_node_tests "services/identity-service"
  run_node_tests "services/ussd-service"

  # Python service
  run_python_tests "services/biometric-service"

  # Java service
  run_java_tests "services/transaction-service"

  # Go service
  run_go_tests "services/wallet-service"

  echo -e "\n${GREEN}✅ All test runs complete!${NC}"
}

main
