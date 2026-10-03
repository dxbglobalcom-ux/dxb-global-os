#!/usr/bin/env bash
# Phase 3, done-list items 32-33 (CEO 2026-10-03, "ikisine de evet"): after his login, what a company
# Claude call opens and starts now that companyIsolation() gives it its own Claude home, working folder
# and cache. strace (-ff, openat/open/execve/clone…) over lanes-probe.mjs — Hamza's chat lane and the
# task lane, the BUILT helper (run `pnpm build` first), against the construction engine, rows removed
# after — in the resident's shape (systemd-run, the scheduler unit's WorkingDirectory and env files).
# It refuses to run while the company home is not logged in: a logged-out home answers "Not logged
# in", and the probe would measure nothing. The login is checked in the call's own env shape
# (env -i, CLAUDE_CONFIG_DIR and HOME both the company home — done-list 36/38).
# FAIL-CLOSED (Sol's single pass on phase 3, A3): the lanes' own exit, a verdict other than CLEAN and a
# report that cannot run each end in exit 1; the trace adds chdir/fchdir, mkdir*, unlink*/rmdir,
# rename*, link*, symlink* and -y (fds and AT_FDCWD decoded to paths); the raw traces and the lanes'
# output are KEPT beside the output file (<output>-raw.tgz), never deleted.
# Usage: bash phase3-strace-probe.sh <output file>
set -uo pipefail
ROOT="/home/dxb/DxB Global OS"
OUT="${1:?usage: phase3-strace-probe.sh <output file>}"
HOMEDIR="${DXB_COMPANY_CLAUDE_HOME:-$HOME/.local/share/dxb/company-claude}"
CLI="$(ls -d "$ROOT"/node_modules/.pnpm/@anthropic-ai+claude-agent-sdk-linux-x64@*/node_modules/@anthropic-ai/claude-agent-sdk-linux-x64/claude 2>/dev/null | tail -1)"
[ -x "$CLI" ] || { echo "PHASE3_PROBE_REFUSED: the SDK's bundled claude CLI was not found under node_modules" | tee "$OUT"; exit 2; }
STATUS="$(env -i PATH="$PATH" CLAUDE_CONFIG_DIR="$HOMEDIR" HOME="$HOMEDIR" XDG_CACHE_HOME="$HOMEDIR/cache" "$CLI" auth status 2>&1)"
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
exec strace -ff -qq -y -s 512 -e trace=openat,open,creat,execve,clone,clone3,fork,vfork,chdir,fchdir,mkdir,mkdirat,unlink,unlinkat,rmdir,rename,renameat,renameat2,link,linkat,symlink,symlinkat -o "$trace" "$@"
INNER
systemd-run --user --wait --pipe --collect --quiet -p OOMScoreAdjust=100 --working-directory="$ROOT" \
  --setenv=PROBE_LANES=all /bin/bash -l "$WORK/inner.sh" "$WORK/trace" node .planning/quick/20261003-runtime-isolation/lanes-probe.mjs >"$WORK/lanes.out" 2>&1
LANES_EXIT=$?
echo "LANES_EXIT=$LANES_EXIT" >>"$WORK/lanes.out"
RAW="${OUT%.txt}-raw.tgz"
tar -czf "$RAW" -C "$WORK" . || echo "PHASE3_PROBE_WARN: the raw traces could not be kept at $RAW" >&2
{
  echo "== auth status (no secret in it)"; printf '%s\n' "$STATUS"
  echo "== the lanes' own output"; cat "$WORK/lanes.out"
  echo "== every path the company's side touched (raw traces: $RAW)"
  python3 "$(dirname "$0")/phase3-strace-report.py" "$WORK" "$ROOT" "$HOME" "$HOMEDIR" "$WORK/lanes.out"
  echo "REPORT_EXIT=$?"
} >"$OUT"
grep -E "^PHASE3_VERDICT" "$OUT"
status=0
[ "$LANES_EXIT" -eq 0 ] || { echo "PHASE3_PROBE_FAIL: the lanes exited $LANES_EXIT" | tee -a "$OUT"; status=1; }
grep -q '^REPORT_EXIT=0$' "$OUT" || { echo "PHASE3_PROBE_FAIL: the report did not answer CLEAN" | tee -a "$OUT"; status=1; }
grep -q '^PHASE3_VERDICT=CLEAN$' "$OUT" || status=1
exit "$status"
