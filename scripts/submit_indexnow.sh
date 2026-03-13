#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-https://www.kingdomhealth.fitness/}"
KEY="${INDEXNOW_KEY:-895f0a5792527e3bbb4635f68d0ab8ed}"
KEY_LOCATION="${2:-https://www.kingdomhealth.fitness/${KEY}.txt}"
ENDPOINT="${INDEXNOW_ENDPOINT:-https://api.indexnow.org/indexnow}"
SITEMAP_URL="${BASE_URL%/}/sitemap.xml"

HOST="$(printf "%s" "$BASE_URL" | sed -E 's#https?://([^/]+)/?.*#\1#')"
HOMEPAGE_URL="${BASE_URL%/}/"
declare -a URLS=()

while IFS= read -r url; do
  [ -n "$url" ] && URLS+=("$url")
done < <(
  curl -fsSL "$SITEMAP_URL" 2>/dev/null |
    grep -o '<loc>[^<]*</loc>' |
    sed -E 's#</?loc>##g'
)

if [ "${#URLS[@]}" -eq 0 ]; then
  URLS=("$HOMEPAGE_URL")
fi

URLS_JSON=""
for url in "${URLS[@]}"; do
  escaped_url="$(printf '%s' "$url" | sed 's/\\/\\\\/g; s/"/\\"/g')"
  if [ -n "$URLS_JSON" ]; then
    URLS_JSON="${URLS_JSON},
    "
  fi
  URLS_JSON="${URLS_JSON}\"${escaped_url}\""
done

PAYLOAD="$(cat <<JSON
{
  "host": "$HOST",
  "key": "$KEY",
  "keyLocation": "$KEY_LOCATION",
  "urlList": [
    $URLS_JSON
  ]
}
JSON
)"

echo "Submitting IndexNow payload for $HOST with ${#URLS[@]} URL(s)..."
curl -sS -X POST "$ENDPOINT" \
  -H "Content-Type: application/json; charset=utf-8" \
  --data "$PAYLOAD"
echo
echo "IndexNow submission complete."
