#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${BASE_URL:-http://localhost:3000}
TMP_DIR=${TMP_DIR:-./tmp}
COOKIE_JAR="${TMP_DIR}/auth-cookie.txt"

mkdir -p "${TMP_DIR}"

suffix=$(date +%s)
username="dast_${suffix}"
email="dast_${suffix}@example.com"
password="Passw0rd!${suffix}"

curl -s -X POST "${BASE_URL}/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"${username}\",\"email\":\"${email}\",\"password\":\"${password}\"}" \
  >/dev/null || true

csrf_token=$(
  curl -s -c "${COOKIE_JAR}" "${BASE_URL}/api/auth/csrf" | python3 -c \
    "import json,sys; print(json.load(sys.stdin).get('csrfToken',''))"
)

curl -s -b "${COOKIE_JAR}" -c "${COOKIE_JAR}" \
  -X POST "${BASE_URL}/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "csrfToken=${csrf_token}&username=${username}&password=${password}&callbackUrl=${BASE_URL}/&json=true" \
  >/dev/null

cookie_header=$(
  awk 'BEGIN{ORS="; "} {
    line=$0
    if (line ~ /^#HttpOnly_/) { sub(/^#HttpOnly_/, "", line) }
    if (line ~ /^#/) { next }
    split(line, parts, "\t")
    if (length(parts) >= 7) { print parts[6] "=" parts[7] }
  }' "${COOKIE_JAR}" | sed 's/; $//'
)

echo "${cookie_header}"
