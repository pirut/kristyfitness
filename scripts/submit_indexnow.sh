#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-https://www.kingdomhealth.fitness/}"
KEY="${INDEXNOW_KEY:-895f0a5792527e3bbb4635f68d0ab8ed}"
KEY_LOCATION="${2:-https://www.kingdomhealth.fitness/${KEY}.txt}"
ENDPOINT="${INDEXNOW_ENDPOINT:-https://api.indexnow.org/indexnow}"

HOST="$(printf "%s" "$BASE_URL" | sed -E 's#https?://([^/]+)/?.*#\1#')"
HOMEPAGE_URL="${BASE_URL%/}/"

PAYLOAD="$(cat <<JSON
{
  "host": "$HOST",
  "key": "$KEY",
  "keyLocation": "$KEY_LOCATION",
  "urlList": [
    "$HOMEPAGE_URL"
  ]
}
JSON
)"

echo "Submitting IndexNow payload for $HOST..."
curl -sS -X POST "$ENDPOINT" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "$PAYLOAD"
echo
echo "IndexNow submission complete."
