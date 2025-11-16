#!/bin/bash

# ================================
# Eazepay Security Verification Script
# ================================
# Verifies all security features are properly configured

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════╗"
echo "║   Eazepay Security Verification        ║"
echo "╚════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

PASSED=0
FAILED=0
WARNINGS=0

# Function to check
check() {
  local name=$1
  local command=$2
  
  echo -n "Checking $name... "
  
  if eval "$command" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
    return 1
  fi
}

# Function to warn
warn() {
  local name=$1
  local message=$2
  
  echo -e "${YELLOW}⚠ WARNING: $name${NC}"
  echo "  $message"
  ((WARNINGS++))
}

echo "=== Authentication & Authorization ==="
check "JWT secret length" "[ \${#JWT_SECRET} -ge 64 ]"
check "Internal API key set" "[ -n \"\$INTERNAL_API_KEY\" ]"
check "Session secret set" "[ -n \"\$SESSION_SECRET\" ]"
echo ""

echo "=== TLS/SSL Configuration ==="
check "Server certificate exists" "[ -f infrastructure/ssl/server-cert.pem ]"
check "Server key exists" "[ -f infrastructure/ssl/server-key.pem ]"
check "CA certificate exists" "[ -f infrastructure/ssl/ca-cert.pem ]"
check "Certificate permissions" "[ \$(stat -c %a infrastructure/ssl/server-key.pem 2>/dev/null || stat -f %A infrastructure/ssl/server-key.pem) = '600' ]"
echo ""

echo "=== Database Security ==="
check "DB password set" "[ -n \"\$DB_PASSWORD\" ]"
check "DB SSL enabled" "[ \"\$DB_SSL\" = 'true' ]"
check "Redis password set" "[ -n \"\$REDIS_PASSWORD\" ]"
check "Redis TLS enabled" "[ \"\$REDIS_TLS\" = 'true' ]"
echo ""

echo "=== Network Security ==="
check "CORS origins configured" "[ -n \"\$ALLOWED_ORIGINS\" ]"
check "Rate limiting enabled" "[ \"\$RATE_LIMITING_ENABLED\" = 'true' ]"
check "Security headers enabled" "[ \"\$SECURITY_HEADERS_ENABLED\" = 'true' ]"
echo ""

echo "=== Encryption ==="
check "Encryption key set" "[ -n \"\$ENCRYPTION_KEY\" ]"
check "Encryption key length" "[ \${#ENCRYPTION_KEY} -eq 64 ]"
echo ""

echo "=== Audit & Monitoring ==="
check "Audit logging enabled" "[ \"\$AUDIT_LOGGING_ENABLED\" = 'true' ]"
check "Security monitoring enabled" "[ \"\$SECURITY_MONITORING_ENABLED\" = 'true' ]"
check "Logs directory exists" "[ -d logs ]"
echo ""

echo "=== Service Security ==="
if command -v docker-compose >/dev/null 2>&1; then
  check "Services running" "docker-compose ps | grep -q 'Up'"
  check "PostgreSQL healthy" "docker-compose exec -T postgresql pg_isready"
  check "Redis healthy" "docker-compose exec -T redis redis-cli ping"
else
  warn "Docker Compose" "Docker Compose not found, skipping service checks"
fi
echo ""

echo "=== Secrets Management ==="
if [ -f ".env.generated" ]; then
  warn "Generated secrets file" ".env.generated still exists. Move secrets to secrets manager and delete this file."
fi

if [ -f ".env" ] && grep -q "your_super_secret" .env 2>/dev/null; then
  warn "Default secrets" "Default secrets detected in .env file. Replace with strong secrets."
fi
echo ""

echo "=== Compliance Checks ==="
check "HSTS enabled" "[ \"\$HSTS_ENABLED\" = 'true' ]"
check "Audit retention configured" "[ -n \"\$AUDIT_LOG_RETENTION_DAYS\" ]"
check "Backup encryption enabled" "[ \"\$BACKUP_ENCRYPTION\" = 'true' ]"
echo ""

# Summary
echo "═══════════════════════════════════════"
echo -e "Security Verification Summary:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo "═══════════════════════════════════════"
echo ""

# Calculate score
TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
  SCORE=$((PASSED * 100 / TOTAL))
  echo -e "Security Score: ${BLUE}$SCORE/100${NC}"
  echo ""
  
  if [ $SCORE -ge 90 ]; then
    echo -e "${GREEN}✓ Excellent! Your security configuration is production-ready.${NC}"
  elif [ $SCORE -ge 70 ]; then
    echo -e "${YELLOW}⚠ Good, but some improvements needed.${NC}"
  else
    echo -e "${RED}✗ Critical issues found. Please address failed checks.${NC}"
  fi
fi

echo ""
echo "For detailed security documentation, see:"
echo "  docs/security/SECURITY_IMPLEMENTATION_GUIDE.md"
echo ""

# Exit with error if any checks failed
if [ $FAILED -gt 0 ]; then
  exit 1
fi

exit 0
