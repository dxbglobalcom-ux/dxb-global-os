#!/usr/bin/env bash
# provision-dept-keys.sh — COST-02 department virtual keys (E12.5 unblocking,
# 2026-07-18). The worker's api-path model calls read DXB_LITELLM_KEY_<DEPT>
# from the process env (packages/shared/src/litellm.ts departmentKeyEnvVar);
# until today only DXB_LITELLM_KEY_OS existed, so every first-rung api call
# failed and the ladder fell through to the subscription path — polluting the
# U17 derived probation scores with infra retries.
#
# For every department that has hireable employees (draft/probation/active):
#   1. skip if alias dxb-<dept> already lives in the proxy key table
#   2. generate the key INSIDE the proxy container (master key stays in its
#      own env — A8; the raw key is captured by this script only)
#   3. append `export DXB_LITELLM_KEY_<DEPT>=<key>` to .env.daemon
#      (gitignored vault file sourced by the systemd scheduler unit)
#
# The raw key value is never printed to stdout/stderr — PROVISIONED lines
# carry alias + var NAME only. Budget per key = department.budget_eur registry
# default (measured: 25 EUR / 30d), overridable per-dept via settings_values.
#
# After a run that provisions anything: systemctl --user restart dxb-scheduler
set -euo pipefail
cd "$(dirname "$0")/../.."

ENV_FILE=".env.daemon"
LITELLM_CONTAINER="dxb_litellm"
PSQL=(docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -v ON_ERROR_STOP=1)
q() { "${PSQL[@]}" -c "$1" < /dev/null; }

# refuse to run if the vault file could ever reach git
git check-ignore -q "$ENV_FILE" || { echo "ABORT: $ENV_FILE is not gitignored" >&2; exit 1; }

BUDGET=$(q "SELECT COALESCE(
  (SELECT (value)::numeric FROM settings_values WHERE key='department.budget_eur' AND scope='global'),
  (SELECT (value_schema->>'default')::numeric FROM settings_registry WHERE key='department.budget_eur'));")
[[ -n "$BUDGET" ]] || { echo "ABORT: department.budget_eur unresolved" >&2; exit 1; }

DEPTS=$(q "SELECT DISTINCT department FROM agents
            WHERE employment_status IN ('draft','probation','active')
              AND department IS NOT NULL ORDER BY 1;")

touch "$ENV_FILE"; chmod 600 "$ENV_FILE"
OK=0; EXISTED=0; FAILED=0
for D in $DEPTS; do
  ALIAS="dxb-$D"
  VAR="DXB_LITELLM_KEY_${D^^}"; VAR="${VAR//-/_}"
  HAVE=$(q "SELECT count(*) FROM litellm.\"LiteLLM_VerificationToken\" WHERE key_alias='$ALIAS';")
  if [[ "$HAVE" != "0" ]]; then echo "EXISTS $ALIAS (proxy already holds it — not regenerated)"; EXISTED=$((EXISTED+1)); continue; fi
  RAW=$(docker exec -i "$LITELLM_CONTAINER" /app/.venv/bin/python - "$ALIAS" "$BUDGET" <<'PY'
import json, os, sys, urllib.request
alias, budget = sys.argv[1], float(sys.argv[2])
req = urllib.request.Request(
    "http://localhost:4000/key/generate",
    data=json.dumps({
        "key_alias": alias,
        "max_budget": budget,
        "budget_duration": "30d",
        "metadata": {"tier": "department", "wave": "e125-dept-keys"},
    }).encode(),
    headers={
        "Authorization": "Bearer " + os.environ["LITELLM_MASTER_KEY"],
        "Content-Type": "application/json",
    },
)
try:
    with urllib.request.urlopen(req, timeout=30) as r:
        print(json.load(r)["key"])
except Exception as e:
    sys.stderr.write("keygen error: %r\n" % (e,))
    sys.exit(1)
PY
  ) || { echo "FAIL $ALIAS"; FAILED=$((FAILED+1)); continue; }
  printf 'export %s=%s\n' "$VAR" "$RAW" >> "$ENV_FILE"
  echo "PROVISIONED $ALIAS -> \$$VAR (value written to $ENV_FILE only)"
  OK=$((OK+1))
done
echo "dept-keys: provisioned=$OK existed=$EXISTED failed=$FAILED budget=${BUDGET}EUR/30d"
echo "proxy-side proof: $(q "SELECT count(*) FROM litellm.\"LiteLLM_VerificationToken\" WHERE key_alias LIKE 'dxb-%';") dxb-* aliases live"
[[ "$OK" -gt 0 ]] && echo "NEXT: systemctl --user restart dxb-scheduler (env change needs a restart)"
