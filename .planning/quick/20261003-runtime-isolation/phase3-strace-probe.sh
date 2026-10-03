#!/usr/bin/env bash
# Phase 3, done-list items 32-33 (CEO 2026-10-03, "ikisine de evet"): after his login, what a company
# Claude call opens and starts now that companyIsolation() gives it its own Claude home, working folder
# and cache. strace (-ff, openat/open/execve/clone…) over lanes-probe.mjs — Hamza's chat lane and the
# task lane, the BUILT helper (run `pnpm build` first), against the construction engine, rows removed
# after — in the resident's shape (systemd-run, the scheduler unit's WorkingDirectory and env files).
# It refuses to run while the company home is not logged in: a logged-out home answers "Not logged
# in", and the probe would measure nothing. Usage: bash phase3-strace-probe.sh <output file>
set -uo pipefail
ROOT="/home/dxb/DxB Global OS"
OUT="${1:?usage: phase3-strace-probe.sh <output file>}"
HOMEDIR="${DXB_COMPANY_CLAUDE_HOME:-$HOME/.local/share/dxb/company-claude}"
CLI="$(ls -d "$ROOT"/node_modules/.pnpm/@anthropic-ai+claude-agent-sdk-linux-x64@*/node_modules/@anthropic-ai/claude-agent-sdk-linux-x64/claude 2>/dev/null | tail -1)"
[ -x "$CLI" ] || { echo "PHASE3_PROBE_REFUSED: the SDK's bundled claude CLI was not found under node_modules" | tee "$OUT"; exit 2; }
STATUS="$(CLAUDE_CONFIG_DIR="$HOMEDIR" "$CLI" auth status 2>&1)"
if ! printf '%s' "$STATUS" | grep -q '"loggedIn": *true'; then
  { echo "PHASE3_PROBE_REFUSED: the company Claude home $HOMEDIR is not logged in — his login comes first (done-list 33)"; echo "auth status: $STATUS"; } | tee "$OUT"
  exit 3
fi
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cat >"$WORK/inner.sh" <<'INNER'
set -a; for f in ./.env ./.env.local ./.env.daemon; do [ -f "$f" ] && source "$f"; done; set +a
export DXB_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54422/postgres"; unset DXB_COMPANY_DATABASE_URL
trace="$1"; shift
exec strace -ff -qq -s 512 -e trace=openat,open,execve,clone,clone3,fork,vfork -o "$trace" "$@"
INNER
systemd-run --user --wait --pipe --collect --quiet -p OOMScoreAdjust=100 --working-directory="$ROOT" \
  --setenv=PROBE_LANES=all /bin/bash -l "$WORK/inner.sh" "$WORK/trace" node .planning/quick/20261003-runtime-isolation/lanes-probe.mjs >"$WORK/lanes.out" 2>&1
echo "LANES_EXIT=$?" >>"$WORK/lanes.out"
{
  echo "== auth status (no secret in it)"; printf '%s\n' "$STATUS"
  echo "== the lanes' own output"; cat "$WORK/lanes.out"
  echo "== what the company's side opened and started"
  python3 "$(dirname "$0")/phase3-strace-report.py" "$WORK" "$ROOT" "$HOME" "$HOMEDIR"
} >"$OUT"
grep -E "^PHASE3_VERDICT" "$OUT"
