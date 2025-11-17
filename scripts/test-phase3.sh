#!/bin/bash

echo "🧪 Testing Eazepay Phase 3 (Virtual Cards)..."
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
test_endpoint "Virtual Card Service Health" "$BASE_URL:8007/health"

# 2. Register User
echo "=== User Registration ==="
PHONE="254$(date +%s | tail -c 9)"
USER_DATA="{\"phoneNumber\":\"$PHONE\",\"fullName\":\"Test User\",\"email\":\"user$PHONE@example.com\",\"password\":\"UserPass123\"}"
USER_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" -d "$USER_DATA" "$BASE_URL/api/auth/register")

echo "Registering user with phone: $PHONE"
echo "$USER_RESPONSE" | jq '.'

# Extract token
USER_TOKEN=$(echo "$USER_RESPONSE" | jq -r '.data.tokens.accessToken')

if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
    echo -e "${GREEN}✓ User registration successful${NC}"
    echo "User Token: ${USER_TOKEN:0:20}..."
    PASSED=$((PASSED + 1))
else
    echo -e "${RED}✗ User registration failed${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# 3. Create Wallet
echo "=== Create Wallet ==="
if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
    WALLET_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $USER_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"currency":"KES"}' \
        "$BASE_URL/api/wallet/create")
    
    echo "$WALLET_RESPONSE" | jq '.'
    
    if echo "$WALLET_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Wallet creation successful${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Wallet creation failed${NC}"
        FAILED=$((FAILED + 1))
    fi
fi
echo ""

# 4. Create Virtual Card
echo "=== Create Virtual Card ==="
if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
    CARD_DATA='{
        "cardholderName":"Test User",
        "billingAddress":{
            "street":"123 Main St",
            "city":"Nairobi",
            "state":"Nairobi",
            "country":"KE",
            "postalCode":"00100"
        },
        "cardType":"mastercard",
        "currency":"USD"
    }'
    
    CARD_RESPONSE=$(curl -s -X POST \
        -H "Authorization: Bearer $USER_TOKEN" \
        -H "Content-Type: application/json" \
        -d "$CARD_DATA" \
        "$BASE_URL/api/cards/create")
    
    echo "$CARD_RESPONSE" | jq '.'
    
    CARD_ID=$(echo "$CARD_RESPONSE" | jq -r '.data.cardId')
    
    if echo "$CARD_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Virtual card creation successful${NC}"
        echo "Card ID: $CARD_ID"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ Virtual card creation failed${NC}"
        FAILED=$((FAILED + 1))
    fi
fi
echo ""

# 5. List Cards
echo "=== List Virtual Cards ==="
if [ "$USER_TOKEN" != "null" ] && [ -n "$USER_TOKEN" ]; then
    LIST_RESPONSE=$(curl -s \
        -H "Authorization: Bearer $USER_TOKEN" \
        "$BASE_URL/api/cards/list")
    
    echo "$LIST_RESPONSE" | jq '.'
    
    if echo "$LIST_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ List cards successful${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ List cards failed${NC}"
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
    echo ""
    echo "🎉 Phase 3 is working! You can now:"
    echo "   1. Create virtual cards"
    echo "   2. Top up cards from wallet"
    echo "   3. Shop globally with local currency"
    echo "   4. Track all transactions"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
