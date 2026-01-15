#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}
OUTPUT_DIR=${OUTPUT_DIR:-docs/dast-results}
SQLMAP_BIN=${SQLMAP_BIN:-${HOME}/.local/bin/sqlmap}
WAPITI_BIN=${WAPITI_BIN:-${HOME}/.local/bin/wapiti}

mkdir -p "${OUTPUT_DIR}"

AUTH_COOKIE=$(BASE_URL="${BASE_URL}" scripts/dast/get-auth-cookie.sh)

echo "Running Nuclei..."
nuclei -u "${BASE_URL}" \
  -H "Cookie: ${AUTH_COOKIE}" \
  -severity "medium,high,critical" \
  -tags "cves,misconfig,exposure" \
  -no-interactsh \
  -timeout 5 \
  -retries 1 \
  -o "${OUTPUT_DIR}/nuclei.txt"

echo "Running Nikto..."
nikto -h "${BASE_URL}" \
  -C "${AUTH_COOKIE}" \
  -output "${OUTPUT_DIR}/nikto.txt"

echo "Running Wapiti..."
"${WAPITI_BIN}" \
  -u "${BASE_URL}" \
  -C "${AUTH_COOKIE}" \
  --scope url \
  --depth 2 \
  --max-scan-time 60 \
  --max-attack-time 20 \
  --tasks 4 \
  -m "xss,sql" \
  -f txt \
  -o "${OUTPUT_DIR}/wapiti.txt"

echo "Running SQLMap..."
"${SQLMAP_BIN}" \
  -u "${BASE_URL}/api/posts?search=test" \
  --cookie="${AUTH_COOKIE}" \
  --batch \
  --level=1 \
  --risk=1 \
  --output-dir="${OUTPUT_DIR}/sqlmap"
