#!/bin/bash

echo "🧪 Testing Eazepay Phase 2 (Biometric Payment)..."
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
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "\n%{http_code}" -X $method "$url")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        FAILED=$((FAILED + 1))
    fi
    echo ""
}

# 1. Health Checks
echo "=== Health Checks ==="
test_endpoint "API Gateway Health" "$BASE_URL/health"
test_endpoint "User Service Health" "$BASE_URL:8000/health"
test_endpoint "Wallet Service Health" "$BASE_URL:8003/health"
test_endpoint "M-Pesa Service Health" "$BASE_URL:8004/health"
test_endpoint "Biometric Service Health" "$BASE_URL:8001/health"
test_endpoint "Agent Service Health" "$BASE_URL:8005/health"
test_endpoint "Payment Auth Service Health" "$BASE_URL:8006/health"

# 2. Register Agent
echo "=== Agent Registration ==="
PHONE="254$(date +%s | tail -c 9)"
AGENT_DATA="{\"phoneNumber\":\"$PHONE\",\"fullName\":\"Test Agent\",\"email\":\"agent$PHONE@example.com\",\"password\":\"AgentPass123\",\"role\":\"agent\"}"
AGENT_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$AGENT_DATA" "$BASE_URL/api/auth/register")

echo "Registering agent with phone: $PHONE"
echo "$AGENT_RESPONSE" | jq '.'

# Extract token
AGENT_TOKEN=$(echo "$AGENT_RESPONSE" | jq -r '.data.tokens.accessToken')

if [ "$AGENT_TOKEN" != "null" ] && [ -n "$AGENT_TOKEN" ]; then
    echo -e "${GREEN}✓ Agent registration successful${NC}"
    echo "Agent Token: ${AGENT_TOKEN:0:20}..."
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ Agent registration failed${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# 3. Create mock biometric file
echo "=== Creating Mock Biometric Data ==="
dd if=/dev/urandom of=/tmp/fingerprint.dat bs=1024 count=10 2>/dev/null
echo -e "${GREEN}✓ Mock biometric data created${NC}"
echo ""

# 4. Test Biometric Enrollment
echo "=== Biometric Enrollment ==="
if [ "$AGENT_TOKEN" != "null" ] && [ -n "$AGENT_TOKEN" ]; then
    ENROLL_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $AGENT_TOKEN" \
        -F "biometricData=@/tmp/fingerprint.dat" \
        -F "biometricType=fingerprint" \
        -F "fingerType=index" \
        -F "hand=right" \
        -F "isPrimary=true" \
        "$BASE_URL/api/biometric/enroll")
    
    echo "$ENROLL_RESPONSE" | jq '.'
    
    if echo "$ENROLL_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Biometric enrollment successful${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Biometric enrollment failed${NC}"
        FAILED=$((FAILED + 1))
    fi
fi
echo ""

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
