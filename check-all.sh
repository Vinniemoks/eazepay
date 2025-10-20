#!/bin/bash
# AfriPay Universal - Automated Service & Infrastructure Check Script

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICES=(
  "Identity Service:8000/health"
  "Biometric Service:8001/health"
  "Transaction Service:8002/health"
  "Wallet Service:8003/health"
  "USSD Gateway:8004/health"
  "Agent Service:8005/health"
)

DATABASES=(
  "PostgreSQL:5432"
  "Redis:6379"
  "MongoDB:27017"
  "RabbitMQ:5672"
)

function check_service() {
  local name=$1
  local url=$2
  echo -e "${YELLOW}Checking $name at $url...${NC}"
  local code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$url")
  if [ "$code" = "200" ]; then
    echo -e "${GREEN}✅ $name is healthy${NC}"
  else
    echo -e "${RED}❌ $name failed health check (HTTP $code)${NC}"
  fi
}

function check_db_port() {
  local name=$1
  local port=$2
  echo -e "${YELLOW}Checking $name on port $port...${NC}"
  if command -v nc >/dev/null 2>&1; then
    if nc -z localhost "$port"; then
      echo -e "${GREEN}✅ $name port $port is open${NC}"
    else
      echo -e "${RED}❌ $name port $port is not open${NC}"
    fi
    return
  fi

  if bash -c "</dev/tcp/localhost/$port" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ $name port $port is open${NC}"
  else
    echo -e "${YELLOW}⚠️  Unable to verify $name port $port (netcat unavailable)${NC}"
  fi
}

function check_env_files() {
  echo -e "${YELLOW}Checking for .env files in services...${NC}"
  local missing=0
  for dir in services/*; do
    if [ -d "$dir" ]; then
      if [ ! -f "$dir/.env" ]; then
        echo -e "${RED}❌ Missing .env in $dir${NC}"
        missing=1
      else
        echo -e "${GREEN}✅ Found .env in $dir${NC}"
      fi
    fi
  done
  return $missing
}

function check_dockerfiles() {
  echo -e "${YELLOW}Checking for Dockerfiles in services...${NC}"
  local missing=0
  for dir in services/*; do
    if [ -d "$dir" ]; then
      if [ ! -f "$dir/Dockerfile" ]; then
        echo -e "${RED}❌ Missing Dockerfile in $dir${NC}"
        missing=1
      else
        echo -e "${GREEN}✅ Found Dockerfile in $dir${NC}"
      fi
    fi
  done
  return $missing
}

function check_compose() {
  echo -e "${YELLOW}Checking for docker-compose.yml at root...${NC}"
  if [ -f "docker-compose.yml" ]; then
    echo -e "${GREEN}✅ docker-compose.yml found${NC}"
  else
    echo -e "${RED}❌ docker-compose.yml missing${NC}"
  fi
}

function check_readmes() {
  echo -e "${YELLOW}Checking for README.md in services...${NC}"
  local missing=0
  for dir in services/*; do
    if [ -d "$dir" ]; then
      if [ ! -f "$dir/README.md" ]; then
        echo -e "${RED}❌ Missing README.md in $dir${NC}"
        missing=1
      else
        echo -e "${GREEN}✅ Found README.md in $dir${NC}"
      fi
    fi
  done
  return $missing
}

function main() {
  echo -e "${BLUE}🔍 AfriPay Universal Automated Check${NC}"
  echo "========================================"

  check_compose
  check_env_files
  check_dockerfiles
  check_readmes

  echo -e "\n${BLUE}🏥 Checking service health...${NC}"
  for svc in "${SERVICES[@]}"; do
    name=$(echo $svc | cut -d: -f1)
    url=$(echo $svc | cut -d: -f2)
    check_service "$name" "$url"
  done

  echo -e "\n${BLUE}🗄️  Checking database ports...${NC}"
  for db in "${DATABASES[@]}"; do
    name=$(echo $db | cut -d: -f1)
    port=$(echo $db | cut -d: -f2)
    check_db_port "$name" "$port"
  done

  echo -e "\n${GREEN}✅ All checks complete!${NC}"
}

main
