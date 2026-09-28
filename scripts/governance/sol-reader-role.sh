#!/usr/bin/env bash
# dxb-team2 job 1 — build (or re-state) the auditor's read-only role `sol_reader`
# on the CONSTRUCTION engine. Plan: .planning/quick/20260928-sol-db-reach/PLAN.md.
#
# CEO 2026-09-28: "önerin tmm" — the auditor (GPT-6 Sol) gathers database
# evidence with its own hand, never the company's database. "Tamam onaylıyorum."
#
# What it does, in order:
#   1. reads the allowed identities and the company's from
#      tools/hooks/ledger-identity.json (the battery's own guard);
#   2. asks the engine who it is (read-only) and refuses the company, or any
#      identity not on allowed[], before anything else;
#   3. if the one-way window is missing (a freshly rebuilt engine: PUBLIC still
#      holds EXECUTE on lo_create), installs it with the existing installer —
#      the window takes effectful functions from PUBLIC and never hands them to
#      sol_reader (c_windows in scripts/b36/company-one-way-window.sql);
#   4. applies scripts/governance/sol-reader-role.sql in ONE transaction on ONE
#      connection, whose first statement re-checks the identity triple and whose
#      last block refuses to commit unless the role is measured read-only.
#
# The password is minted once into ~/.config/dxb/sol-reader.env (mode 600,
# outside the repository) and only a SCRAM-SHA-256 verifier ever reaches the
# engine. Rebuild order: supabase db reset → ledger-identity.mjs --allow →
# construction:schema (which ends with this script) → construction:seed.
#
# Usage:  bash scripts/governance/sol-reader-role.sh
#         DXB_SOL_CONTAINER=<container> …   (only to prove the refusal)
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BUILD_CONTAINER="supabase_db_DxB_Build"
CONTAINER="${DXB_SOL_CONTAINER:-$BUILD_CONTAINER}"
ENV_FILE="${HOME}/.config/dxb/sol-reader.env"
PSQL=(docker exec -i "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -qtA)

# 1. the identity guard's own file
read -r ALLOWED COMPANY < <(node -e '
  const d = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  const t = (i) => `${i.sysid}/${i.dboid}/${i.dbname}`;
  console.log((d.allowed || []).map(t).join(",") || "-", d.company ? t(d.company) : "-");
' "$ROOT/tools/hooks/ledger-identity.json")

# 2. who is this engine — read-only, refused before any change
HERE="$("${PSQL[@]}" -c "SELECT (SELECT system_identifier::text FROM pg_control_system()) || '/' || (SELECT oid::text FROM pg_database WHERE datname = current_database()) || '/' || current_database()")"
if [ "$HERE" = "$COMPANY" ]; then
  echo "REFUSED company identity $HERE — the auditor's hand is never built on the holding's database." >&2
  exit 1
fi
case ",$ALLOWED," in
  *",$HERE,"*) ;;
  *) echo "REFUSED unknown identity $HERE — not on ledger-identity.json allowed[] (run ledger-identity.mjs --allow first)." >&2
     exit 1 ;;
esac

# 3. the one-way window, when a rebuilt engine does not have it yet
WINDOW_ON="$("${PSQL[@]}" -c "SELECT NOT has_function_privilege('public', 'pg_catalog.lo_create(oid)', 'EXECUTE')")"
if [ "$WINDOW_ON" != "t" ]; then
  if [ "$CONTAINER" != "$BUILD_CONTAINER" ]; then
    echo "REFUSED: the one-way window is missing on $CONTAINER and this script installs it only on $BUILD_CONTAINER." >&2
    exit 1
  fi
  echo "sol-reader-role: the one-way window is not on this engine — installing it first"
  node "$ROOT/scripts/b36/install-company-window.mjs" construction
fi

# 4. the password (minted once) and its verifier
if [ ! -f "$ENV_FILE" ]; then
  mkdir -p "$(dirname "$ENV_FILE")"
  ( umask 077
    printf 'DXB_SOL_READER_URL=postgresql://sol_reader:%s@127.0.0.1:54422/postgres\n' \
      "$(node -e 'process.stdout.write(require("crypto").randomBytes(24).toString("hex"))')" > "$ENV_FILE" )
fi
chmod 600 "$ENV_FILE"
VERIFIER="$(node -e '
  const c = require("crypto");
  const url = require("fs").readFileSync(process.argv[1], "utf8").match(/^DXB_SOL_READER_URL=(\S+)$/m)[1];
  const pw = decodeURIComponent(new URL(url).password);
  const salt = c.randomBytes(16), iter = 4096;
  const salted = c.pbkdf2Sync(pw, salt, iter, 32, "sha256");
  const hmac = (k, s) => c.createHmac("sha256", k).update(s).digest();
  const stored = c.createHash("sha256").update(hmac(salted, "Client Key")).digest();
  const server = hmac(salted, "Server Key");
  process.stdout.write(`SCRAM-SHA-256$${iter}:${salt.toString("base64")}$${stored.toString("base64")}:${server.toString("base64")}`);
' "$ENV_FILE")"

EFFECTFUL="$(perl -0ne 'print $1 if /c_effectful CONSTANT text := \$flt\$(.*?)\$flt\$;/s' "$ROOT/scripts/b36/company-one-way-window.sql")"
if [ -z "$EFFECTFUL" ]; then
  echo "sol-reader-role: cannot read c_effectful out of company-one-way-window.sql" >&2
  exit 1
fi

sq() { printf "%s" "$1" | sed "s/'/''/g"; }
out="$({
  printf "SELECT set_config('dxb.allowed', '%s', false);\n" "$(sq "$ALLOWED")"
  printf "SELECT set_config('dxb.company', '%s', false);\n" "$(sq "$COMPANY")"
  printf "SELECT set_config('dxb.effectful', '%s', false);\n" "$(sq "$EFFECTFUL")"
  printf "SELECT set_config('dxb.verifier', '%s', false);\n" "$(sq "$VERIFIER")"
  cat "$ROOT/scripts/governance/sol-reader-role.sql"
} | docker exec -i "$CONTAINER" psql -U supabase_admin -d postgres -v ON_ERROR_STOP=1 -qtA -o /dev/null 2>&1)" || {
  printf '%s\n' "$out" | grep -v '^$' >&2
  echo "SOL_READER_FAIL — nothing was committed (one transaction)." >&2
  exit 1
}
visible="$(printf '%s\n' "$out" | sed -n 's/.*SOL_READER readable public tables \([0-9]*\).*/\1/p')"
# The tool's own drift guard is the one definition of "a function the auditor
# must not be able to call" beyond this file's assertion (future functions in
# `extensions` / `supabase_migrations`); the role is only OK when the tool,
# asked as sol_reader, answers. The installer is not Sol: it holds no bench lock
# question, so it says the engine is held on its behalf.
if [ "$CONTAINER" = "$BUILD_CONTAINER" ]; then
  # The path goes by environment, not argv: with argv[1] set to the tool's own
  # path the tool believes it was launched as the MCP server and waits on stdin.
  guard="$(DXB_ENGINE_LOCK_HELD=1 SOL_TOOL="$ROOT/scripts/governance/sol-db-mcp.mjs" timeout 30 node --input-type=module -e '
    const { sqlRead } = await import(process.env.SOL_TOOL);
    const r = await sqlRead("select 1");
    console.log(r.ok ? "TOOL_GUARD_OK" : r.error);' < /dev/null 2>&1)"
  if [ "$guard" != "TOOL_GUARD_OK" ]; then
    echo "SOL_READER_FAIL — the role is committed but the tool refuses it: $guard" >&2
    exit 1
  fi
fi
echo "SOL_READER_OK sysid=$HERE readable_public_tables=${visible:-?} credential=$ENV_FILE"
