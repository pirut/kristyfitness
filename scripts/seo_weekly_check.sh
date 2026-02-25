#!/usr/bin/env bash

set -euo pipefail

BASE_URL="${1:-https://www.kingdomhealth.fitness}"
REPORT_PATH="${2:-seo-weekly-report.md}"
CANONICAL_URL="${BASE_URL%/}/"
ROBOTS_URL="${BASE_URL%/}/robots.txt"
SITEMAP_URL="${BASE_URL%/}/sitemap.xml"
LLMS_URL="${BASE_URL%/}/llms.txt"

PASS_COUNT=0
FAIL_COUNT=0

pass() {
  PASS_COUNT=$((PASS_COUNT + 1))
  printf -- "- PASS: %s\n" "$1"
}

fail() {
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf -- "- FAIL: %s\n" "$1"
}

HOME_HEADERS="$(mktemp)"
HOME_HTML="$(mktemp)"
ROBOTS_TXT="$(mktemp)"
SITEMAP_XML="$(mktemp)"
LLMS_TXT="$(mktemp)"
trap 'rm -f "$HOME_HEADERS" "$HOME_HTML" "$ROBOTS_TXT" "$SITEMAP_XML" "$LLMS_TXT"' EXIT

curl -sS -I -L "$CANONICAL_URL" >"$HOME_HEADERS"
curl -sS -L "$CANONICAL_URL" >"$HOME_HTML"
curl -sS -L "$ROBOTS_URL" >"$ROBOTS_TXT"
curl -sS -L "$SITEMAP_URL" >"$SITEMAP_XML"
curl -sS -L "$LLMS_URL" >"$LLMS_TXT"

{
  printf "# Weekly SEO Check\n\n"
  printf "Date (UTC): %s\n\n" "$(date -u +"%Y-%m-%d %H:%M:%S")"
  printf "Base URL: %s\n\n" "$BASE_URL"
  printf "## Automated Checks\n"

  if grep -Eq "^HTTP/2 200|^HTTP/1.1 200" "$HOME_HEADERS"; then
    pass "Homepage resolves with HTTP 200."
  else
    fail "Homepage did not resolve with HTTP 200."
  fi

  if grep -Fq "<link rel=\"canonical\" href=\"$CANONICAL_URL\"" "$HOME_HTML"; then
    pass "Canonical URL matches $CANONICAL_URL."
  else
    fail "Canonical URL does not match $CANONICAL_URL."
  fi

  if grep -Fq "Sitemap: $SITEMAP_URL" "$ROBOTS_TXT"; then
    pass "robots.txt advertises the canonical sitemap URL."
  else
    fail "robots.txt does not advertise the canonical sitemap URL."
  fi

  if grep -Fq "<loc>$CANONICAL_URL</loc>" "$SITEMAP_XML"; then
    pass "sitemap.xml contains canonical homepage URL."
  else
    fail "sitemap.xml canonical homepage URL mismatch."
  fi

  if grep -Fq "$CANONICAL_URL" "$LLMS_TXT"; then
    pass "llms.txt references canonical URL."
  else
    fail "llms.txt canonical URL mismatch."
  fi

  if grep -Fq "User-agent: OAI-SearchBot" "$ROBOTS_TXT" && grep -Fq "User-agent: GPTBot" "$ROBOTS_TXT"; then
    pass "robots.txt includes OpenAI crawler directives."
  else
    fail "robots.txt missing OpenAI crawler directives."
  fi

  printf "\n## Weekly Console Workflow\n"
  printf "1. Open Google Search Console property: https://search.google.com/search-console?resource_id=sc-domain:kingdomhealth.fitness\n"
  printf "2. Open Bing Webmaster Tools: https://www.bing.com/webmasters/home\n"
  printf "3. In both consoles, review:\n"
  printf "   - Coverage/indexing errors\n"
  printf "   - Query performance for christian health/christain health variants\n"
  printf "   - Crawl stats and last crawl time\n"
  printf "4. Re-submit sitemap if indexing lag is observed: %s\n" "$SITEMAP_URL"
  printf "\nSummary: %d passed, %d failed.\n" "$PASS_COUNT" "$FAIL_COUNT"
} | tee "$REPORT_PATH"

if [ "$FAIL_COUNT" -gt 0 ]; then
  exit 1
fi
