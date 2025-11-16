#!/bin/bash

# ================================
# Eazepay Secrets Rotation Script
# ================================
# This script rotates secrets in production
# Run this script every 30-90 days

set -e

echo "🔄 Starting secrets rotation for Eazepay..."
echo ""

# Configuration
SECRETS_PROVIDER=${SECRETS_PROVIDER:-"aws"}
ENVIRONMENT=${ENVIRONMENT:-"production"}
DRY_RUN=${DRY_RUN:-"false"}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to rotate AWS secret
rotate_aws_secret() {
  local secret_name=$1
  local new_value=$2
  
  echo -e "${YELLOW}Rotating AWS secret: ${secret_name}${NC}"
  
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would rotate secret: $secret_name"
    return
  fi
  
  aws secretsmanager update-secret \
    --secret-id "eazepay/${secret_name}" \
    --secret-string "$new_value" \
    --region ${AWS_REGION:-us-east-1}
  
  echo -e "${GREEN}✓ Rotated: ${secret_name}${NC}"
}

# Function to rotate Azure secret
rotate_azure_secret() {
  local secret_name=$1
  local new_value=$2
  
  echo -e "${YELLOW}Rotating Azure secret: ${secret_name}${NC}"
  
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would rotate secret: $secret_name"
    return
  fi
  
  az keyvault secret set \
    --vault-name ${AZURE_VAULT_NAME:-eazepay-vault} \
    --name "$secret_name" \
    --value "$new_value"
  
  echo -e "${GREEN}✓ Rotated: ${secret_name}${NC}"
}

# Function to rotate GCP secret
rotate_gcp_secret() {
  local secret_name=$1
  local new_value=$2
  
  echo -e "${YELLOW}Rotating GCP secret: ${secret_name}${NC}"
  
  if [ "$DRY_RUN" = "true" ]; then
    echo "  [DRY RUN] Would rotate secret: $secret_name"
    return
  fi
  
  echo -n "$new_value" | gcloud secrets versions add "$secret_name" --data-file=-
  
  echo -e "${GREEN}✓ Rotated: ${secret_name}${NC}"
}

# Function to generate new secret
generate_secret() {
  node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
}

# Function to generate API key
generate_api_key() {
  node -e "console.log('ak_' + require('crypto').randomBytes(32).toString('base64').replace(/[+/=]/g, ''))"
}

# Function to generate password
generate_password() {
  node -e "
    const crypto = require('crypto');
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#\$%^&*';
    let password = '';
    for (let i = 0; i < 32; i++) {
      password += charset[crypto.randomInt(0, charset.length)];
    }
    console.log(password);
  "
}

# Main rotation logic
rotate_secrets() {
  echo "Environment: $ENVIRONMENT"
  echo "Provider: $SECRETS_PROVIDER"
  echo "Dry Run: $DRY_RUN"
  echo ""
  
  # Secrets to rotate
  declare -A secrets=(
    ["JWT_SECRET"]=$(generate_secret)
    ["INTERNAL_API_KEY"]=$(generate_api_key)
    ["REDIS_PASSWORD"]=$(generate_password)
    ["SESSION_SECRET"]=$(generate_secret)
    ["ENCRYPTION_KEY"]=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
  )
  
  # Rotate each secret
  for secret_name in "${!secrets[@]}"; do
    new_value="${secrets[$secret_name]}"
    
    case $SECRETS_PROVIDER in
      aws)
        rotate_aws_secret "$secret_name" "$new_value"
        ;;
      azure)
        rotate_azure_secret "$secret_name" "$new_value"
        ;;
      gcp)
        rotate_gcp_secret "$secret_name" "$new_value"
        ;;
      *)
        echo -e "${RED}Unknown secrets provider: $SECRETS_PROVIDER${NC}"
        exit 1
        ;;
    esac
  done
  
  echo ""
  echo -e "${GREEN}✅ Secrets rotation complete!${NC}"
  echo ""
  echo -e "${YELLOW}⚠️  IMPORTANT: Restart all services to pick up new secrets${NC}"
  echo ""
  echo "Restart commands:"
  echo "  kubectl rollout restart deployment -n eazepay"
  echo "  docker-compose restart"
  echo ""
}

# Confirmation prompt
if [ "$DRY_RUN" != "true" ]; then
  echo -e "${RED}⚠️  WARNING: This will rotate production secrets!${NC}"
  echo "This action cannot be undone."
  echo ""
  read -p "Are you sure you want to continue? (yes/no): " confirm
  
  if [ "$confirm" != "yes" ]; then
    echo "Aborted."
    exit 0
  fi
  echo ""
fi

# Run rotation
rotate_secrets

# Log rotation event
echo "$(date -u +"%Y-%m-%dT%H:%M:%SZ") - Secrets rotated for environment: $ENVIRONMENT" >> /var/log/eazepay/secrets-rotation.log

echo "✅ Done!"
