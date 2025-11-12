#!/bin/bash
# Eazepay - Install Node.js prerequisites across all services

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SERVICES_DIR="services"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Eazepay - Installing Service Dependencies${NC}"
echo -e "${BLUE}========================================${NC}"

if [ ! -d "$SERVICES_DIR" ]; then
  echo -e "${RED}Services directory not found: $SERVICES_DIR${NC}"
  exit 1
fi

installed_count=0
skipped_count=0
declare -a installed_dirs=()
declare -a skipped_dirs=()

for dir in "$SERVICES_DIR"/*; do
  [ -d "$dir" ] || continue

  service_name=$(basename "$dir")
  echo -e "\n${YELLOW}→ Checking ${service_name}...${NC}"

  ran_install=false

  # Install at service root if package.json exists
  if [ -f "$dir/package.json" ]; then
    echo -e "${BLUE}  • Found package.json at ${service_name}/ (running npm install)${NC}"
    (
      cd "$dir"
      npm install
    ) && ran_install=true || ran_install=false
  fi

  # Install at service src if src/package.json exists
  if [ -f "$dir/src/package.json" ]; then
    echo -e "${BLUE}  • Found package.json at ${service_name}/src (running npm install)${NC}"
    (
      cd "$dir/src"
      npm install
    ) && ran_install=true || ran_install=false
  fi

  if [ "$ran_install" = true ]; then
    echo -e "${GREEN}  ✓ Installed dependencies for ${service_name}${NC}"
    installed_dirs+=("$service_name")
    installed_count=$((installed_count + 1))
  else
    echo -e "${YELLOW}  • No Node package.json found for ${service_name}; skipping${NC}"
    skipped_dirs+=("$service_name")
    skipped_count=$((skipped_count + 1))
  fi
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Installed: ${installed_count}${NC}"
echo -e "${YELLOW}Skipped:   ${skipped_count}${NC}"

if [ ${installed_count} -gt 0 ]; then
  echo -e "${GREEN}Installed services:${NC} ${installed_dirs[*]}"
fi
if [ ${skipped_count} -gt 0 ]; then
  echo -e "${YELLOW}Skipped services:${NC} ${skipped_dirs[*]}"
fi

echo -e "\n${GREEN}✅ Installation complete. You can now start services or portals.${NC}"