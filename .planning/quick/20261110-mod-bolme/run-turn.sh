#!/usr/bin/env bash
# One headless turn of a real session with the dxb-live-pane spike mod loaded.
#   run-turn.sh <label> new|resume <session-id> <prompt> [extra claude flags…]
# Model: the session's default unless DXB_RUN_MODEL names one.
# DXB_MOD_* variables in the caller's environment reach the mod.
# Writes runs/<label>.json (the CLI's JSON result), runs/<label>.err, runs/<label>.debug.log.
set -u
JOB="/home/dxb/DxB Global OS/.planning/quick/20261110-mod-bolme"
REPO="/home/dxb/DxB Global OS"
label="$1"; mode="$2"; sid="$3"; prompt="$4"; shift 4

cd "$REPO"

if [ "$mode" = new ]; then sess=(--session-id "$sid"); else sess=(--resume "$sid"); fi
model=()
if [ -n "${DXB_RUN_MODEL:-}" ]; then model=(--model "$DXB_RUN_MODEL"); fi

# The launching session's own bindings must not leak into the measured session.
for v in CLAUDECODE CLAUDE_CODE_ENTRYPOINT CLAUDE_CODE_SESSION_ID CLAUDE_CODE_BRIDGE_SESSION_ID \
  CLAUDE_CODE_CHILD_SESSION CLAUDE_CODE_MESSAGING_SOCKET CLAUDE_CODE_MESSAGING_TOKEN CLAUDE_CODE_SSE_PORT \
  CLAUDE_CODE_SESSION_ATTENDED CLAUDE_CODE_EXECPATH CLAUDE_EFFORT CLAUDE_PID; do unset "$v"; done

echo "start $(date +%T) label=$label session=$sid mode=$mode"
systemd-run --user --scope --quiet --collect -p MemoryMax=16G -p MemorySwapMax=4G -- \
  timeout 225 /home/dxb/.local/bin/claude -p "$prompt" \
  --plugin-dir "$JOB/mod" \
  "${model[@]}" \
  "${sess[@]}" \
  --output-format json \
  "$@" \
  --debug-file "$JOB/runs/$label.debug.log" \
  >"$JOB/runs/$label.json" 2>"$JOB/runs/$label.err" </dev/null
echo "exit=$? end $(date +%T) label=$label"
python3 - "$JOB/runs/$label.json" "$JOB/runs/$label.err" <<'PY'
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception as e:
    print("NO JSON:", e); print(open(sys.argv[2]).read()[-800:]); sys.exit(1)
print("is_error", d.get("is_error"), "subtype", d.get("subtype"), "num_turns", d.get("num_turns"),
      "duration_ms", d.get("duration_ms"), "cost", d.get("total_cost_usd"),
      "models", {m: round(u.get("costUSD", 0), 4) for m, u in (d.get("modelUsage") or {}).items()})
r = d.get("result") or ""
low = r.lower()
if d.get("is_error") or "usage limit" in low or "limit reached" in low:
    print("STOP? result:", r[:600])
else:
    print("result:", r[:400].replace("\n", " | "))
PY
