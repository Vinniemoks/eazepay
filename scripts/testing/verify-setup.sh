#!/bin/bash

# AfriPay Universal - Setup Verification Script
# This script verifies that all services are running correctly

echo "🔍 Verifying AfriPay Universal Setup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local endpoint=$3
    local expected_status=${4:-200}
    
    echo -e "${YELLOW}Checking $service_name...${NC}"
    
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${port}${endpoint}" 2>/dev/null)
        
        if [ "$response_code" = "$expected_status" ]; then
            echo -e "${GREEN}✅ $service_name is healthy (HTTP $response_code)${NC}"
            return 0
        fi
        
        if [ $attempt -eq 0 ]; then
            echo -e "   Waiting for $service_name to start..."
        fi
        
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed health check${NC}"
    return 1
}

# Function to check database connection
check_database() {
    local db_name=$1
    local port=$2
    local user=$3
    
    echo -e "${YELLOW}Checking $db_name database...${NC}"
    
    case $db_name in
        "PostgreSQL")
            if docker exec afripay-postgres pg_isready -h localhost -p 5432 -U developer > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $db_name is ready${NC}"
                return 0
            fi
            ;;
        "Redis")
            if docker exec afripay-redis redis-cli ping > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $db_name is ready${NC}"
                return 0
            fi
            ;;
        "MongoDB")
            if docker exec afripay-mongo mongosh --quiet --eval "db.runCommand('ping')" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $db_name is ready${NC}"
                return 0
            fi
            ;;
        "RabbitMQ")
            if docker exec afripay-rabbitmq rabbitmq-diagnostics -q ping > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $db_name is ready${NC}"
                return 0
            fi
            ;;
    esac
    
    echo -e "${RED}❌ $db_name is not ready${NC}"
    return 1
}

# Function to display service URLs
show_service_urls() {
    echo -e "\n${BLUE}📋 Service URLs:${NC}"
    echo "• API Gateway:          http://localhost"
    echo "• Identity Service:     http://localhost:8000"
    echo "• Biometric Service:    http://localhost:8001"
    echo "• Transaction Service:  http://localhost:8002"
    echo "• Wallet Service:       http://localhost:8003"
    echo "• USSD Gateway:         http://localhost:8004"
    echo "• Agent Service:        http://localhost:8005"
    echo ""
    echo -e "${BLUE}🔧 Management URLs:${NC}"
    echo "• Grafana Dashboard:    http://localhost:3000 (admin/grafana_admin_2024!)"
    echo "• Prometheus:           http://localhost:9090"
    echo "• RabbitMQ Management:  http://localhost:15672 (admin/rabbitmq_password_2024!)"
    echo "• Kibana:               http://localhost:5601"
    echo "• Database Admin:       http://localhost:8080"
    echo ""
}

# Function to run API tests
test_apis() {
    echo -e "\n${YELLOW}🧪 Running API tests...${NC}"
    
    # Test user registration
    echo "Testing user registration..."
    local reg_response=$(curl -s -X POST "http://localhost:8000/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{
            "phoneNumber": "+254700000001",
            "nationalId": "12345678",
            "firstName": "Test",
            "lastName": "User"
        }')
    
    if echo "$reg_response" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ User registration API works${NC}"
        
        # Extract user ID for biometric test
        local user_id=$(echo "$reg_response" | jq -r '.data.userId')
        
        # Test biometric enrollment (with dummy image)
        echo "Testing biometric enrollment..."
        echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_image.png
        
        local bio_response=$(curl -s -X POST "http://localhost:8001/enroll/fingerprint" \
            -F "user_id=$user_id" \
            -F "file=@/tmp/test_image.png")
        
        if echo "$bio_response" | jq -e '.success' > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Biometric enrollment API works${NC}"
        else
            echo -e "${YELLOW}⚠️  Biometric enrollment API needs attention${NC}"
        fi
        
        # Cleanup
        rm -f /tmp/test_image.png
    else
        echo -e "${YELLOW}⚠️  User registration API needs attention${NC}"
    fi
}

# Main verification process
echo -e "${BLUE}🏗️  AfriPay Universal Setup Verification${NC}"
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if services are running
echo -e "\n${YELLOW}📊 Checking infrastructure services...${NC}"
check_database "PostgreSQL" 5432 "developer"
check_database "Redis" 6379 ""
check_database "MongoDB" 27017 ""
check_database "RabbitMQ" 5672 ""

echo -e "\n${YELLOW}🏥 Checking application services...${NC}"
check_service "Identity Service" 8000 "/health"
check_service "Biometric Service" 8001 "/health"

# Check optional services
check_service "API Gateway" 80 "/health" || echo -e "${YELLOW}⚠️  API Gateway not running (optional)${NC}"
check_service "Prometheus" 9090 "/api/v1/status/config" || echo -e "${YELLOW}⚠️  Prometheus not running (optional)${NC}"
check_service "Grafana" 3000 "/api/health" || echo -e "${YELLOW}⚠️  Grafana not running (optional)${NC}"

# Run API tests if services are up
if curl -s http://localhost:8000/health > /dev/null 2>&1 && curl -s http://localhost:8001/health > /dev/null 2>&1; then
    test_apis
fi

# Display service URLs
show_service_urls

# Final summary
echo -e "${BLUE}🎯 Verification Summary:${NC}"
echo "========================================"

# Count running containers
local running_containers=$(docker ps --filter "name=afripay-" --format "{{.Names}}" | wc -l)
echo "• Running AfriPay containers: $running_containers"

# Check Docker volumes
local volumes=$(docker volume ls --filter "name=afripay-universal" --format "{{.Name}}" | wc -l)
echo "• Data volumes created: $volumes"

# Check network
if docker network ls | grep -q "afripay-network"; then
    echo -e "• Docker network: ${GREEN}afripay-network created${NC}"
else
    echo -e "• Docker network: ${RED}afripay-network missing${NC}"
fi

echo ""
echo -e "${GREEN}🚀 Setup verification complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Visit http://localhost:3000 to access Grafana dashboards"
echo "2. Check service logs: docker-compose logs -f [service-name]"
echo "3. Start developing additional services"
echo "4. Run integration tests: ./scripts/testing/integration-test.sh"
echo "5. Run unit tests: ./scripts/testing/unit-test.sh"
echo "6. Monitor services with Prometheus and Grafana"
echo ""echo -e "${BLUE}Thank you for using AfriPay Universal!${NC}"
echo ""