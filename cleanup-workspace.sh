#!/bin/bash
# Eazepay - Workspace Cleanup Utility
# Safely collect or delete caches and build artifacts across the repo

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR=$(pwd)
COLLECT_DIR="$ROOT_DIR/unused"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
DEST_DIR="$COLLECT_DIR/$TIMESTAMP"

ACTION="move"        # move to unused/ by default (safer)
DRY_RUN=0             # set to 1 for dry-run
INCLUDE_ROOT_NODE=1   # include root node_modules by default
NPM_CACHE=0           # do not clear npm cache by default

function usage() {
  cat <<EOF
Usage: bash ./cleanup-workspace.sh [options]

Options:
  --delete                 Permanently delete instead of moving to ./unused/
  --dry-run                Show what would be cleaned without changing anything
  --skip-root-node         Do not clean root node_modules
  --npm-cache              Also run 'npm cache clean --force' (global)
  -h, --help               Show this help

Targets:
  - Node:      node_modules, dist, coverage, .next, .nuxt, .turbo, .vite, build, out, .cache
  - Java:      target, .gradle
  - Python:    __pycache__, .pytest_cache, .mypy_cache, .venv
  - Misc:      *.log, Thumbs.db, .DS_Store

Default behavior is SAFE: move items to ./unused/<timestamp>/.
Use --delete to actually remove files and reclaim disk space immediately.
EOF
}

for arg in "$@"; do
  case "$arg" in
    --delete)
      ACTION="delete" ;;
    --dry-run)
      DRY_RUN=1 ;;
    --skip-root-node)
      INCLUDE_ROOT_NODE=0 ;;
    --npm-cache)
      NPM_CACHE=1 ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      echo -e "${YELLOW}Unknown option: $arg${NC}" ; usage; exit 1 ;;
  esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Eazepay - Workspace Cleanup Utility${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Mode: ${YELLOW}${ACTION}${NC} | Dry-run: ${YELLOW}${DRY_RUN}${NC} | npm cache: ${YELLOW}${NPM_CACHE}${NC}"

if [ "$ACTION" = "move" ] && [ "$DRY_RUN" -eq 0 ]; then
  mkdir -p "$DEST_DIR"
  echo -e "${BLUE}Collecting unused files into: ${DEST_DIR}${NC}"
fi

TOTAL_BYTES=0

function size_of() {
  local path=$1
  if command -v du >/dev/null 2>&1; then
    du -sb "$path" 2>/dev/null | awk '{print $1}'
  else
    echo 0
  fi
}

function pretty_bytes() {
  local bytes=$1
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec --suffix=B "$bytes"
  else
    echo "$bytes bytes"
  fi
}

function handle_item() {
  local item=$1
  local rel=${item#"$ROOT_DIR/"}
  local sz=$(size_of "$item")
  TOTAL_BYTES=$((TOTAL_BYTES + sz))

  if [ "$DRY_RUN" -eq 1 ]; then
    echo -e "${YELLOW}[dry-run]${NC} ${rel} (${sz} bytes)"
    return
  fi

  if [ "$ACTION" = "delete" ]; then
    rm -rf "$item"
    echo -e "${GREEN}Deleted${NC} ${rel} ($(pretty_bytes "$sz"))"
  else
    local dest="$DEST_DIR/$rel"
    mkdir -p "$(dirname "$dest")"
    mv "$item" "$dest"
    echo -e "${GREEN}Moved${NC} ${rel} -> ${dest} ($(pretty_bytes "$sz"))"
  fi
}

declare -a patterns=(
  "node_modules"
  "dist"
  "coverage"
  ".next" ".nuxt" ".turbo" ".vite"
  "build" "out" ".cache"
  "target" ".gradle"
  "__pycache__" ".pytest_cache" ".mypy_cache" ".venv"
)

declare -a files=("*.log" "Thumbs.db" ".DS_Store")

# Clean directories by patterns across repo
for pattern in "${patterns[@]}"; do
  while IFS= read -r -d '' match; do
    handle_item "$match"
  done < <(find "$ROOT_DIR" -type d -name "$pattern" -print0 2>/dev/null)
done

# Clean files by patterns across repo
for f in "${files[@]}"; do
  while IFS= read -r -d '' match; do
    handle_item "$match"
  done < <(find "$ROOT_DIR" -type f -name "$f" -print0 2>/dev/null)
done

# Optionally skip root node_modules
if [ "$INCLUDE_ROOT_NODE" -eq 0 ]; then
  echo -e "${YELLOW}Skipping root node_modules as requested${NC}"
else
  if [ -d "$ROOT_DIR/node_modules" ]; then
    handle_item "$ROOT_DIR/node_modules"
  fi
fi

# npm cache (global)
if [ "$NPM_CACHE" -eq 1 ]; then
  if command -v npm >/dev/null 2>&1; then
    if [ "$DRY_RUN" -eq 1 ]; then
      echo -e "${YELLOW}[dry-run]${NC} would run: npm cache clean --force"
    else
      npm cache clean --force || true
      echo -e "${GREEN}npm cache cleaned${NC}"
    fi
  else
    echo -e "${YELLOW}npm not found; skipping npm cache clean${NC}"
  fi
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Cleanup Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Total affected size (pre-move/delete): $(pretty_bytes "$TOTAL_BYTES")"
if [ "$ACTION" = "move" ]; then
  echo -e "Items were moved to: ${DEST_DIR}"
else
  echo -e "Items were deleted. Space should be reclaimed."
fi

echo -e "\n${GREEN}✅ Cleanup complete.${NC}"