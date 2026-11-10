#!/usr/bin/env bash
# One headless turn of a real session with the trial mod loaded.
#   run-turn.sh <label> new|resume <session-id> <talk-model or -> <prompt> [extra claude flags…]
# The session's model is claude-fable-5-2 unless env DXB_RUN_MODEL names another
# (added for arm C, 2026-11-10; arms A and B ran with the default).
# Writes runs/<label>.json (the CLI's JSON result), runs/<label>.err, runs/<label>.debug.log.
set -u
JOB="/home/dxb/DxB Global OS/.planning/quick/20261110-mod-deneme"
REPO="/home/dxb/DxB Global OS"
label="$1"; mode="$2"; sid="$3"; talk="$4"; prompt="$5"; shift 5

cd "$REPO"

if [ "$mode" = new ]; then sess=(--session-id "$sid"); else sess=(--resume "$sid"); fi
if [ "$talk" = "-" ]; then unset DXB_MOD_TALK_MODEL; else export DXB_MOD_TALK_MODEL="$talk"; fi

# The launching session's own bindings must not leak into the measured session.
for v in CLAUDECODE CLAUDE_CODE_ENTRYPOINT CLAUDE_CODE_SESSION_ID CLAUDE_CODE_BRIDGE_SESSION_ID \
  CLAUDE_CODE_CHILD_SESSION CLAUDE_CODE_MESSAGING_SOCKET CLAUDE_CODE_MESSAGING_TOKEN CLAUDE_CODE_SSE_PORT \
  CLAUDE_CODE_SESSION_ATTENDED CLAUDE_CODE_EXECPATH CLAUDE_EFFORT CLAUDE_PID; do unset "$v"; done

systemd-run --user --scope --quiet --collect -p MemoryMax=16G -p MemorySwapMax=4G -- \
  /home/dxb/.local/bin/claude -p "$prompt" \
  --plugin-dir "$JOB/mod" \
  --model "${DXB_RUN_MODEL:-claude-fable-5-2}" \
  "${sess[@]}" \
  --output-format json \
  "$@" \
  --debug-file "$JOB/runs/$label.debug.log" \
  >"$JOB/runs/$label.json" 2>"$JOB/runs/$label.err" </dev/null
echo "exit=$? label=$label session=$sid"
