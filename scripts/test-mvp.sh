#!/bin/bash

echo "🧪 Testing Eazepay MVP..."
echo ""

BASE_URL="http://localhost"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Helper function
test_endpoint() {
    local name=$1
    local url=$2
    local method=${3:-GET}
    local data=$4
    local auth=$5
    
    echo -n "Testing $name... "
    
    if [ -z "$data" ]; then
        if [ -z "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method -H "Authorization: Bearer $auth" "$url")
        fi
    else
        if [ -z "$auth" ]; then
            response=$(curl -s -w "\n%{http_code}" -X $method -H "Content-Type: application/json" -d "$data" "$url")
        else
            response=$(curl -s -w "\n%{http_code}" -X $method -H "Content-Type: application/json" -H "Authorization: Bearer $auth" -d "$data" "$url")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED=$((FAILED + 1))
        echo "$body"
    fi
    echo ""
}

# 1. Health Checks
echo "=== Health Checks ==="
test_endpoint "API Gateway Health" "$BASE_URL/health"
test_endpoint "User Service Health" "$BASE_URL:8000/health"
test_endpoint "Wallet Service Health" "$BASE_URL:8003/health"
test_endpoint "M-Pesa Service Health" "$BASE_URL:8004/health"

# 2. User Registration
echo "=== User Registration ==="
PHONE="254$(date +%s | tail -c 9)"
REGISTER_DATA="{\"phoneNumber\":\"$PHONE\",\"fullName\":\"Test User\",\"email\":\"test$PHONE@example.com\",\"password\":\"TestPass123\"}"
REGISTER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$REGISTER_DATA" "$BASE_URL/api/auth/register")

echo "Registering user with phone: $PHONE"
echo "$REGISTER_RESPONSE" | jq '.'

# Extract token
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.accessToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Access Token: ${ACCESS_TOKEN:0:20}..."
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Registration failed${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# 3. Login
echo "=== User Login ==="
LOGIN_DATA="{\"phoneNumber\":\"$PHONE\",\"password\":\"TestPass123\"}"
test_endpoint "Login" "$BASE_URL/api/auth/login" "POST" "$LOGIN_DATA"

# 4. Get Profile
echo "=== Get Profile ==="
test_endpoint "Get Profile" "$BASE_URL/api/auth/profile" "GET" "" "$ACCESS_TOKEN"

# 5. Create Wallet
echo "=== Create Wallet ==="
WALLET_DATA='{"currency":"KES"}'
test_endpoint "Create Wallet" "$BASE_URL/api/wallet/create" "POST" "$WALLET_DATA" "$ACCESS_TOKEN"

# 6. Check Balance
echo "=== Check Balance ==="
test_endpoint "Check Balance" "$BASE_URL/api/wallet/balance" "GET" "" "$ACCESS_TOKEN"

# 7. Get Transactions
echo "=== Get Transactions ==="
test_endpoint "Get Transactions" "$BASE_URL/api/wallet/transactions" "GET" "" "$ACCESS_TOKEN"

# Summary
echo "================================"
echo "Test Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
