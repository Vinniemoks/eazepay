#!/bin/bash
# Secret Generation Script
# Generates secure random secrets for various purposes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SECRET_TYPE=$1
LENGTH=${2:-32}

if [ -z "$SECRET_TYPE" ]; then
    echo "Usage: $0 <type> [length]"
    echo ""
    echo "Types:"
    echo "  password    - Random password (base64)"
    echo "  jwt         - JWT secret (hex)"
    echo "  encryption  - Encryption key (hex, 32 bytes)"
    echo "  api-key     - API key (base64)"
    echo "  token       - General token (base64)"
    echo ""
    echo "Examples:"
    echo "  $0 password 32"
    echo "  $0 jwt"
    echo "  $0 encryption"
    exit 1
fi

case $SECRET_TYPE in
    password)
        echo -e "${GREEN}Generating password (${LENGTH} characters)...${NC}"
        openssl rand -base64 $LENGTH
        ;;
    jwt)
        echo -e "${GREEN}Generating JWT secret (64 hex characters)...${NC}"
        openssl rand -hex 32
        ;;
    encryption)
        echo -e "${GREEN}Generating encryption key (64 hex characters = 32 bytes)...${NC}"
        openssl rand -hex 16
        echo -e "${YELLOW}Note: This is exactly 32 bytes for AES-256${NC}"
        ;;
    api-key)
        echo -e "${GREEN}Generating API key (${LENGTH} characters)...${NC}"
        openssl rand -base64 $LENGTH | tr -d "=+/" | cut -c1-$LENGTH
        ;;
    token)
        echo -e "${GREEN}Generating token (${LENGTH} characters)...${NC}"
        openssl rand -base64 $LENGTH
        ;;
    *)
        echo -e "${RED}Unknown secret type: ${SECRET_TYPE}${NC}"
        exit 1
        ;;
esac

