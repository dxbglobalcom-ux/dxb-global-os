#!/usr/bin/env bash
# P3: session B runs a real turn (a 70 s Bash sleep); 20 s in, session A starts
# with DXB_MOD_P3=1 and its mod sends B a text by session id, then A's own
# prompt is dropped by the mod (no model turn in A).
set -u
JOB="/home/dxb/DxB Global OS/.planning/quick/20261110-mod-bolme"
B=$(uuidgen); A=$(uuidgen)
echo "$B" > "$JOB/runs/P3B.session-id"; echo "$A" > "$JOB/runs/P3A.session-id"
DXB_MOD_LOG_NAME=p3-B.pane-log.jsonl DXB_RUN_MODEL=sonnet bash "$JOB/run-turn.sh" P3B new "$B" \
  "Run the shell command \`python3 -c 'import time; time.sleep(70)'\` with the Bash tool, one call, in the foreground (it is a deliberate 70-second wait for a test). When it has finished, reply DONE; then, if any message from another session or a plugin reached you while you waited, quote it verbatim on a second line, else write NO MESSAGE." &
bpid=$!
sleep 25
DXB_MOD_LOG_NAME=p3-A.pane-log.jsonl DXB_MOD_P3=1 DXB_MOD_SEND_TO="$B" DXB_MOD_DROP_PROMPT=1 \
  bash "$JOB/run-turn.sh" P3A new "$A" "probe (dropped by the mod)"
wait "$bpid"
