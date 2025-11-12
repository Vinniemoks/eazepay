#!/bin/bash
# Eazepay - Documentation Consolidation Script
# Removes non-essential docs, keeping only README files and OpenAPI specs.

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ROOT_DIR=$(pwd)
DOCS_DIR="$ROOT_DIR/docs"
DRY_RUN=0
MODE="delete"   # delete by default

function usage() {
  cat <<EOF
Usage: bash ./consolidate-docs.sh [options]

Options:
  --dry-run         Show what would be removed without deleting
  --archive         Move files into ./unused/<timestamp>/docs/ instead of deleting
  -h, --help        Show this help

Policy:
  - Keep: README.md files anywhere, root README.md, and any openapi.yaml
  - Remove: All other documentation files under ./docs and root-level *.md docs
EOF
}

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --archive) MODE="archive" ;;
    -h|--help) usage; exit 0 ;;
    *) echo -e "${YELLOW}Unknown option: $arg${NC}" ; usage; exit 1 ;;
  esac
done

if [ ! -d "$DOCS_DIR" ]; then
  echo -e "${YELLOW}No docs directory found at $DOCS_DIR${NC}"
fi

ARCHIVE_DIR="$ROOT_DIR/unused/$(date +"%Y%m%d-%H%M%S")/docs"
if [ "$MODE" = "archive" ] && [ "$DRY_RUN" -eq 0 ]; then
  mkdir -p "$ARCHIVE_DIR"
fi

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Eazepay - Consolidating Documentation${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Mode: ${YELLOW}${MODE}${NC} | Dry-run: ${YELLOW}${DRY_RUN}${NC}"

removed_count=0
archived_count=0

function remove_or_archive() {
  local path=$1
  local rel=${path#"$ROOT_DIR/"}
  if [ "$DRY_RUN" -eq 1 ]; then
    echo -e "${YELLOW}[dry-run] remove ${rel}${NC}"
    return
  fi
  if [ "$MODE" = "archive" ]; then
    local dest="$ARCHIVE_DIR/${rel#"docs/"}"
    mkdir -p "$(dirname "$dest")"
    mv "$path" "$dest"
    archived_count=$((archived_count + 1))
    echo -e "${GREEN}Archived${NC} ${rel} -> ${dest}"
  else
    rm -rf "$path"
    removed_count=$((removed_count + 1))
    echo -e "${GREEN}Deleted${NC} ${rel}"
  fi
}

# 1) Clean within docs/: keep README.md and openapi.yaml
if [ -d "$DOCS_DIR" ]; then
  while IFS= read -r -d '' file; do
    # Skip README.md files
    case "$file" in
      *README.md) continue ;;
    esac
    # Skip OpenAPI specs
    case "$file" in
      *openapi.yaml) continue ;;
    esac
    remove_or_archive "$file"
  done < <(find "$DOCS_DIR" \( -type f -o -type d \) -print0)
fi

# 2) Root-level markdown: keep README.md, remove other *.md docs
for root_md in "$ROOT_DIR"/*.md; do
  [ -e "$root_md" ] || continue
  case "$root_md" in
    "$ROOT_DIR/README.md") continue ;;
  esac
  remove_or_archive "$root_md"
done

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}  Consolidation Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Removed:  ${removed_count}"
echo -e "Archived: ${archived_count}"
echo -e "\n${GREEN}✅ Documentation consolidation complete.${NC}"