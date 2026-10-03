#!/usr/bin/env bash
# Done-list item 21 (Sol's single pass, 2026-10-03 14:16: `hooks=0` counts only the hook events the SDK
# shows, and "no MCP line on stderr" does not prove that no MCP server started). What a company call
# OPENED and STARTED, read from the kernel's own record — `strace -ff -e trace=openat,open,execve,clone…`,
# one file per process — over (1) Hamza's chat lane (lanes-probe.mjs with PROBE_LANES=chat: its
# resident drain, against the construction engine, rows removed after) and (2) one call of the gate's
# REAL runner (packages/orchestrator/dist/critical-gate.js `codexRunner`, the company's own Codex
# home), each in the resident's shape (systemd-run, the scheduler unit's WorkingDirectory and env
# files, a login shell). The report lists every file opened under ~/.claude (and ~/.claude.json*),
# the repository's .claude/ and ~/.codex — opened, or only looked for — and every program executed.
# Usage: bash strace-probe.sh <output file>
set -uo pipefail
ROOT="/home/dxb/DxB Global OS"
OUT="${1:?usage: strace-probe.sh <output file>}"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

cat >"$WORK/inner.sh" <<'EOF'
set -a; for f in ./.env ./.env.local ./.env.daemon; do [ -f "$f" ] && source "$f"; done; set +a
export DXB_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54422/postgres"; unset DXB_COMPANY_DATABASE_URL
trace="$1"; shift
exec strace -ff -qq -s 512 -e trace=openat,open,execve,clone,clone3,fork,vfork -o "$trace" "$@"
EOF
cat >"$WORK/gate-call.mjs" <<'EOF'
import { join } from "node:path";
const { codexRunner } = await import(join(process.cwd(), "packages", "orchestrator", "dist", "critical-gate.js"));
const ask =
  'This is a probe of what you were given, not a review. Look ONLY at text you received before this message (system or developer instructions, AGENTS.md notes), not general knowledge. If the phrase "Graph-first reads" or the word "graphify" appears in that text, return verdict "flawed" with one objection per phrase found (severity low, claim = the phrase, why = where you saw it). If neither appears, return verdict "sound" with no objections.';
const res = await codexRunner({ model: "gpt-5.6-sol", prompt: ask, timeoutMs: 180_000 });
console.log(`GATE_RESULT ${JSON.stringify(res)}`);
EOF

shape() { # <trace prefix> <output file> <command...>
  local trace="$1" out="$2"
  shift 2
  systemd-run --user --wait --pipe --collect --quiet -p OOMScoreAdjust=100 --working-directory="$ROOT" \
    --setenv=PROBE_LANES=chat /bin/bash -l "$WORK/inner.sh" "$trace" "$@" >"$out" 2>&1
}
shape "$WORK/chat.trace" "$WORK/chat.out" node .planning/quick/20261003-runtime-isolation/lanes-probe.mjs
echo "CHAT_EXIT=$?" >>"$WORK/chat.out"
shape "$WORK/gate.trace" "$WORK/gate.out" node "$WORK/gate-call.mjs"
echo "GATE_EXIT=$?" >>"$WORK/gate.out"

python3 "$(dirname "$0")/strace-report.py" "$WORK" "$ROOT" "$HOME" >"$OUT"
