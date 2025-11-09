#!/bin/bash
# Eazepay Universal - Security, Dependency, and Documentation Automation Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function scan_dockerfile() {
  local dir=$1
  echo -e "${YELLOW}Scanning Dockerfile in $dir with Trivy...${NC}"
  if [ -f "$dir/Dockerfile" ]; then
    if trivy config "$dir/Dockerfile"; then
      echo -e "${GREEN}✅ No critical issues in $dir/Dockerfile${NC}"
    else
      echo -e "${RED}❌ Security issues found in $dir/Dockerfile${NC}"
    fi
  else
    echo -e "${BLUE}No Dockerfile found in $dir, skipping scan.${NC}"
  fi
}

function scan_node_security() {
  local dir=$1
  echo -e "${YELLOW}Running npm audit in $dir...${NC}"
  cd "$dir"
  if [ -f "package.json" ]; then
    if npm audit --audit-level=high; then
      echo -e "${GREEN}✅ No high vulnerabilities in $dir${NC}"
    else
      echo -e "${RED}❌ Vulnerabilities found in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function scan_python_security() {
  local dir=$1
  echo -e "${YELLOW}Running safety check in $dir...${NC}"
  cd "$dir"
  if [ -f "requirements.txt" ]; then
    if safety check -r requirements.txt; then
      echo -e "${GREEN}✅ No vulnerabilities in $dir${NC}"
    else
      echo -e "${RED}❌ Vulnerabilities found in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function scan_java_security() {
  local dir=$1
  echo -e "${YELLOW}Running OWASP dependency-check in $dir...${NC}"
  cd "$dir"
  if [ -f "pom.xml" ]; then
    if mvn org.owasp:dependency-check-maven:check; then
      echo -e "${GREEN}✅ No vulnerabilities in $dir${NC}"
    else
      echo -e "${RED}❌ Vulnerabilities found in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function scan_go_security() {
  local dir=$1
  echo -e "${YELLOW}Running gosec in $dir...${NC}"
  cd "$dir"
  if [ -f "go.mod" ]; then
    if gosec ./...; then
      echo -e "${GREEN}✅ No vulnerabilities in $dir${NC}"
    else
      echo -e "${RED}❌ Vulnerabilities found in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function check_node_deps() {
  local dir=$1
  echo -e "${YELLOW}Checking Node.js dependencies in $dir...${NC}"
  cd "$dir"
  if [ -f "package.json" ]; then
    if npm install; then
      echo -e "${GREEN}✅ Dependencies installed in $dir${NC}"
    else
      echo -e "${RED}❌ Dependency install failed in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function check_python_deps() {
  local dir=$1
  echo -e "${YELLOW}Checking Python dependencies in $dir...${NC}"
  cd "$dir"
  if [ -f "requirements.txt" ]; then
    if pip install -r requirements.txt; then
      echo -e "${GREEN}✅ Dependencies installed in $dir${NC}"
    else
      echo -e "${RED}❌ Dependency install failed in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function check_java_deps() {
  local dir=$1
  echo -e "${YELLOW}Checking Java dependencies in $dir...${NC}"
  cd "$dir"
  if [ -f "pom.xml" ]; then
    if mvn install; then
      echo -e "${GREEN}✅ Dependencies installed in $dir${NC}"
    else
      echo -e "${RED}❌ Dependency install failed in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function check_go_deps() {
  local dir=$1
  echo -e "${YELLOW}Checking Go dependencies in $dir...${NC}"
  cd "$dir"
  if [ -f "go.mod" ]; then
    if go mod tidy; then
      echo -e "${GREEN}✅ Dependencies tidy in $dir${NC}"
    else
      echo -e "${RED}❌ Dependency tidy failed in $dir${NC}"
    fi
  fi
  cd - > /dev/null
}

function check_docs() {
  local dir=$1
  echo -e "${YELLOW}Checking documentation in $dir...${NC}"
  local missing=0
  if [ ! -f "$dir/README.md" ]; then
    echo -e "${RED}❌ Missing README.md in $dir${NC}"
    missing=1
  else
    echo -e "${GREEN}✅ Found README.md in $dir${NC}"
  fi
  if ls "$dir" | grep -iE 'swagger|openapi'; then
    echo -e "${GREEN}✅ Found API spec in $dir${NC}"
  else
    echo -e "${YELLOW}⚠️ No API spec found in $dir${NC}"
  fi
  return $missing
}

function main() {
  echo -e "${BLUE}🔒 Eazepay Universal Security, Dependency & Docs Automation${NC}"
  echo "========================================================="

  # Node.js services
  scan_dockerfile "services/agent-service"
  scan_node_security "services/agent-service"
  check_node_deps "services/agent-service"
  check_docs "services/agent-service"

  scan_dockerfile "services/identity-service"
  scan_node_security "services/identity-service"
  check_node_deps "services/identity-service"
  check_docs "services/identity-service"

  scan_dockerfile "services/ussd-service"
  scan_node_security "services/ussd-service"
  check_node_deps "services/ussd-service"
  check_docs "services/ussd-service"

  # Python service
  scan_dockerfile "services/biometric-service"
  scan_python_security "services/biometric-service"
  check_python_deps "services/biometric-service"
  check_docs "services/biometric-service"

  # Java service
  scan_dockerfile "services/transaction-service"
  scan_java_security "services/transaction-service"
  check_java_deps "services/transaction-service"
  check_docs "services/transaction-service"

  # Go service
  scan_dockerfile "services/wallet-service"
  scan_go_security "services/wallet-service"
  check_go_deps "services/wallet-service"
  check_docs "services/wallet-service"

  echo -e "\n${GREEN}✅ Security, dependency, and documentation checks complete!${NC}"
}

main
