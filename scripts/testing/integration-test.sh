#!/bin/bash

echo "Ì¥ó Running Integration Tests..."

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test user registration flow
test_user_registration() {
    echo -e "${YELLOW}Testing user registration flow...${NC}"
    
    # Create a test user
    local phone_number="+254700000001"
    local response=$(curl -s -X POST "http://localhost:8000/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{
            \"phoneNumber\": \"${phone_number}\",
            \"nationalId\": \"12345678\",
            \"firstName\": \"Test\",
            \"lastName\": \"User\"
        }")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        echo -e "${GREEN}‚úÖ User registration successful${NC}"
        echo "$response" | jq '.data.userId'
        return 0
    else
        echo -e "${RED}‚ùå User registration failed${NC}"
        echo "$response"
        return 1
    fi
}

# Test biometric enrollment (simulated)
test_biometric_enrollment() {
    local user_id=$1
    echo -e "${YELLOW}Testing biometric enrollment...${NC}"
    
    # Create a dummy image file
    echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" | base64 -d > /tmp/test_fingerprint.png
    
    local response=$(curl -s -X POST "http://localhost:8001/enroll/fingerprint" \
        -F "user_id=${user_id}" \
        -F "file=@/tmp/test_fingerprint.png")
    
    if echo "$response" | jq -e '.success' > /dev/null; then
        echo -e "${GREEN}‚úÖ Biometric enrollment successful${NC}"
        return 0
    else
        echo -e "${RED}‚ùå Biometric enrollment failed${NC}"
        echo "$response"
        return 1
    fi
}

# Run tests
if test_user_registration; then
    user_id=$(curl -s -X POST "http://localhost:8000/api/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"phoneNumber": "+254700000002", "firstName": "Test", "lastName": "User2"}' | \
        jq -r '.data.userId')
    
    if [ "$user_id" != "null" ] && [ -n "$user_id" ]; then
        test_biometric_enrollment "$user_id"
    fi
fi

# Cleanup
rm -f /tmp/test_fingerprint.png

echo -e "${GREEN}‚úÖ Integration tests completed!${NC}"
