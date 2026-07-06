#!/usr/bin/env bash
# Dead-value probe for the critical credential subset (CRED-01, 07, 08, 14, 15).
# Prompts for OLD (rotated) values with hidden input. Values are never echoed,
# never written to disk, never logged — only HTTP status codes / curl exit codes
# land in probe-results.txt. Run this AFTER rotating.
set -u
out="$(cd "$(dirname "$0")" && pwd)/probe-results.txt"
: > "$out"
ts() { date -u +"%Y-%m-%dT%H:%MZ"; }
say() { echo "$1" | tee -a "$out"; }

echo "== Ölü-değer probe — sadece ESKİ değerleri yapıştır. Görünmez giriş, kayıt yok. =="
echo "Atlamak istediğin adımda değer yerine boş ENTER bas."
echo

# CRED-01 — Google app password over SMTP AUTH
read -rp  "Gmail adresi (CRED-01, boş=atla): " GUSER
if [ -n "${GUSER}" ]; then
  read -rsp "ESKİ Google app password: " GPASS; echo
  curl -s --connect-timeout 15 --url "smtps://smtp.gmail.com:465" \
       --user "${GUSER}:${GPASS}" --ssl-reqd --mail-from "${GUSER}" -T /dev/null >/dev/null 2>&1
  rc=$?
  if [ $rc -eq 67 ]; then
    say "CRED-01 $(ts) SMTP AUTH: login rejected (curl 67)"
  else
    say "CRED-01 $(ts) SMTP AUTH: curl exit ${rc} (67 beklenir; farklıysa değer hâlâ CANLI olabilir)"
  fi
  unset GPASS
fi

# CRED-07 — Cloudflare account/agent token
read -rsp "ESKİ Cloudflare agent token (CRED-07, boş=atla): " CFT1; echo
if [ -n "${CFT1}" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 15 \
    -H "Authorization: Bearer ${CFT1}" \
    "https://api.cloudflare.com/client/v4/user/tokens/verify")
  say "CRED-07 $(ts) tokens/verify: HTTP ${code} (401/403 beklenir)"
  unset CFT1
fi

# CRED-08 — Cloudflare legacy user token
read -rsp "ESKİ Cloudflare legacy token (CRED-08, boş=atla): " CFT2; echo
if [ -n "${CFT2}" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 15 \
    -H "Authorization: Bearer ${CFT2}" \
    "https://api.cloudflare.com/client/v4/user/tokens/verify")
  say "CRED-08 $(ts) tokens/verify: HTTP ${code} (401/403 beklenir)"
  unset CFT2
fi

# CRED-14 — OpenAI key
read -rsp "ESKİ OpenAI key (CRED-14, boş=atla): " OAK; echo
if [ -n "${OAK}" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 15 \
    -H "Authorization: Bearer ${OAK}" "https://api.openai.com/v1/models")
  say "CRED-14 $(ts) /v1/models: HTTP ${code} (401 beklenir)"
  unset OAK
fi

# CRED-15 — OpenRouter key
read -rsp "ESKİ OpenRouter key (CRED-15, boş=atla): " ORK; echo
if [ -n "${ORK}" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 15 \
    -H "Authorization: Bearer ${ORK}" "https://openrouter.ai/api/v1/key")
  say "CRED-15 $(ts) /api/v1/key: HTTP ${code} (401 beklenir)"
  unset ORK
fi

echo
echo "== Bitti. Sonuçlar (değersiz, sadece kodlar): ${out} =="
