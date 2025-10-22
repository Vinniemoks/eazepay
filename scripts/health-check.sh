#!/bin/bash

# Eazepay Services Health Check Script
# This script checks the health of all Eazepay services

echo "🏥 Checking Eazepay Services Health..."
echo "========================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Services to check
declare -A services=(
  ["Identity Service"]="8000:/health"
  ["Biometric Service"]="8001:/health"
  ["Transaction Service"]="8002:/actuator/health"
  ["Wallet Service"]="8003:/health"
  ["USSD Service"]="8004:/health"
  ["Agent Service"]="8005:/health"
  ["AI/ML Service"]="8010:/health"
  ["IoT Service"]="8020:/health"
  ["Blockchain Service"]="8030:/health"
  ["Robotics Service"]="8040:/health"
)

# Infrastructure services
declare -A infrastructure=(
  ["PostgreSQL"]="5433:/"
  ["Redis"]="6379:/"
  ["MongoDB"]="27017:/"
  ["RabbitMQ"]="15673:/"
  ["Prometheus"]="9090:/-/healthy"
  ["Grafana"]="3000:/api/health"
  ["Elasticsearch"]="9200:/_cluster/health"
)

all_healthy=true
healthy_count=0
unhealthy_count=0

# Function to check service health
check_service() {
  local name=$1
  local port_path=$2
  local port="${port_path%%:*}"
  local path="${port_path##*:}"
  local url="http://localhost:$port$path"
  
  response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  
  if [ "$response" == "200" ]; then
    echo -e "${GREEN}✅ $name${NC} (Port $port): HEALTHY"
    ((healthy_count++))
    return 0
  else
    echo -e "${RED}❌ $name${NC} (Port $port): UNHEALTHY (HTTP $response)"
    ((unhealthy_count++))
    all_healthy=false
    return 1
  fi
}

# Check application services
echo "📱 Application Services:"
echo "------------------------"
for service in "${!services[@]}"; do
  check_service "$service" "${services[$service]}"
done

echo ""
echo "🔧 Infrastructure Services:"
echo "---------------------------"
for service in "${!infrastructure[@]}"; do
  check_service "$service" "${infrastructure[$service]}"
done

echo ""
echo "========================================"
echo "📊 Summary:"
echo "  Healthy:   $healthy_count"
echo "  Unhealthy: $unhealthy_count"
echo "  Total:     $((healthy_count + unhealthy_count))"
echo ""

if [ "$all_healthy" = true ]; then
  echo -e "${GREEN}🎉 All services are healthy!${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some services are unhealthy. Check logs for details:${NC}"
  echo "  docker compose logs -f <service-name>"
  exit 1
fi
