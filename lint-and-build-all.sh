#!/bin/bash
# Eazepay Universal - Linting and Build Automation Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

function lint_node() {
  local dir=$1
  echo -e "${YELLOW}Linting Node.js in $dir...${NC}"
  cd "$dir"
  if [ -f "package.json" ]; then
    if npm run lint; then
      echo -e "${GREEN}✅ Lint passed in $dir${NC}"
    else
      echo -e "${RED}❌ Lint failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No package.json found in $dir, skipping lint.${NC}"
  fi
  cd - > /dev/null
}

function build_node() {
  local dir=$1
  echo -e "${YELLOW}Building Node.js in $dir...${NC}"
  cd "$dir"
  if [ -f "package.json" ]; then
    if npm run build; then
      echo -e "${GREEN}✅ Build succeeded in $dir${NC}"
    else
      echo -e "${RED}❌ Build failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No package.json found in $dir, skipping build.${NC}"
  fi
  cd - > /dev/null
}

function lint_python() {
  local dir=$1
  echo -e "${YELLOW}Linting Python in $dir...${NC}"
  cd "$dir"
  if [ -f "requirements.txt" ]; then
    if flake8 app/; then
      echo -e "${GREEN}✅ Lint passed in $dir${NC}"
    else
      echo -e "${RED}❌ Lint failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No requirements.txt found in $dir, skipping lint.${NC}"
  fi
  cd - > /dev/null
}

function build_python() {
  local dir=$1
  echo -e "${YELLOW}Checking Python dependencies in $dir...${NC}"
  cd "$dir"
  if [ -f "requirements.txt" ]; then
    if pip install -r requirements.txt; then
      echo -e "${GREEN}✅ Dependencies installed in $dir${NC}"
    else
      echo -e "${RED}❌ Dependency install failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No requirements.txt found in $dir, skipping dependency check.${NC}"
  fi
  cd - > /dev/null
}

function lint_java() {
  local dir=$1
  echo -e "${YELLOW}Linting Java in $dir...${NC}"
  cd "$dir"
  if [ -f "pom.xml" ]; then
    if mvn checkstyle:check; then
      echo -e "${GREEN}✅ Lint passed in $dir${NC}"
    else
      echo -e "${RED}❌ Lint failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No pom.xml found in $dir, skipping lint.${NC}"
  fi
  cd - > /dev/null
}

function build_java() {
  local dir=$1
  echo -e "${YELLOW}Building Java in $dir...${NC}"
  cd "$dir"
  if [ -f "pom.xml" ]; then
    if mvn clean package; then
      echo -e "${GREEN}✅ Build succeeded in $dir${NC}"
    else
      echo -e "${RED}❌ Build failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No pom.xml found in $dir, skipping build.${NC}"
  fi
  cd - > /dev/null
}

function lint_go() {
  local dir=$1
  echo -e "${YELLOW}Linting Go in $dir...${NC}"
  cd "$dir"
  if [ -f "go.mod" ]; then
    if golint ./...; then
      echo -e "${GREEN}✅ Lint passed in $dir${NC}"
    else
      echo -e "${RED}❌ Lint failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No go.mod found in $dir, skipping lint.${NC}"
  fi
  cd - > /dev/null
}

function build_go() {
  local dir=$1
  echo -e "${YELLOW}Building Go in $dir...${NC}"
  cd "$dir"
  if [ -f "go.mod" ]; then
    if go build ./...; then
      echo -e "${GREEN}✅ Build succeeded in $dir${NC}"
    else
      echo -e "${RED}❌ Build failed in $dir${NC}"
    fi
  else
    echo -e "${BLUE}No go.mod found in $dir, skipping build.${NC}"
  fi
  cd - > /dev/null
}

function main() {
  echo -e "${BLUE}🛠️ Eazepay Universal Lint & Build Automation${NC}"
  echo "============================================="

  # Node.js services
  lint_node "services/agent-service"
  build_node "services/agent-service"
  lint_node "services/identity-service"
  build_node "services/identity-service"
  lint_node "services/ussd-service"
  build_node "services/ussd-service"

  # Python service
  lint_python "services/biometric-service"
  build_python "services/biometric-service"

  # Java service
  lint_java "services/transaction-service"
  build_java "services/transaction-service"

  # Go service
  lint_go "services/wallet-service"
  build_go "services/wallet-service"

  echo -e "\n${GREEN}✅ Linting and build checks complete!${NC}"
}

main
