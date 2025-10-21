#!/bin/bash

# Test Admin & Superuser Ports
# This script tests if the admin and superuser portals and APIs are working

echo "================================"
echo "Testing Admin & Superuser Ports"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" = "$expected" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC} (Expected HTTP $expected, got $response)"
        return 1
    fi
}

# Test web endpoints
echo "=== Testing Web Portals ==="
test_endpoint "Admin Portal" "http://localhost:8080" "200"
test_endpoint "Admin Portal Health" "http://localhost:8080/health" "200"
test_endpoint "Superuser Portal" "http://localhost:8090" "200"
test_endpoint "Superuser Portal Health" "http://localhost:8090/health" "200"
echo ""

# Test API endpoints
echo "=== Testing API Endpoints ==="
test_endpoint "Identity Service Health" "http://localhost:8000/health" "200"
test_endpoint "Identity Service Root" "http://localhost:8000/" "200"
test_endpoint "Auth Routes" "http://localhost:8000/api/auth/health" "200"

# Test protected endpoints (should return 401 without auth)
echo ""
echo "=== Testing Protected Endpoints (should require auth) ==="
test_endpoint "Superuser List (no auth)" "http://localhost:8000/api/superuser/list" "401"
test_endpoint "Admin Users (no auth)" "http://localhost:8000/api/admin/users" "401"
echo ""

# Check Docker containers
echo "=== Checking Docker Containers ==="
echo ""
docker-compose ps identity-service admin-portal superuser-portal 2>/dev/null || echo -e "${YELLOW}Note: Docker containers may not be running${NC}"
echo ""

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo ""
echo "If all tests passed:"
echo "  ✓ Admin Portal: http://localhost:8080"
echo "  ✓ Superuser Portal: http://localhost:8090"
echo "  ✓ Identity API: http://localhost:8000"
echo ""
echo "If tests failed, try:"
echo "  1. docker-compose build identity-service admin-portal superuser-portal"
echo "  2. docker-compose up -d identity-service admin-portal superuser-portal"
echo "  3. docker-compose logs -f identity-service"
echo ""
