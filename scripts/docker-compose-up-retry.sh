#!/usr/bin/env bash
set -euo pipefail

MAX_RETRIES="${MAX_RETRIES:-5}"
RETRY_DELAY="${RETRY_DELAY:-15}"

attempt=1
while (( attempt <= MAX_RETRIES )); do
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] docker compose up -d attempt ${attempt}/${MAX_RETRIES}"
  if docker compose up -d "$@"; then
    echo "docker compose up -d succeeded on attempt ${attempt}."
    exit 0
  fi

  if (( attempt == MAX_RETRIES )); then
    echo "docker compose up -d failed after ${MAX_RETRIES} attempts." >&2
    exit 1
  fi

  echo "docker compose up -d failed; retrying in ${RETRY_DELAY} seconds..." >&2
  sleep "${RETRY_DELAY}"
  attempt=$(( attempt + 1 ))
done
