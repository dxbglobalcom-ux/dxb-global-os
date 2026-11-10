#!/usr/bin/env bash
# One turn of the second measurement round (2026-11-10, arms A2, B2, C1, C2).
#   step.sh <run> <prompt-number 1..5>
# run A*  : one session on Fable 5.2, talk switch off            (as arm A)
# run B*  : one session on Fable 5.2, talk turns sent to Opus 5.5 (as arm B)
# run C*  : two sessions; talk prompts (1,3,4) to session <run>o on Opus 5.5,
#           design prompts (2,5) to session <run>f on Fable 5.2; talk switch off.
# Session ids are made on first use and kept in runs/session-<name>.id.
set -u
JOB="/home/dxb/DxB Global OS/.planning/quick/20261110-mod-deneme"
run="$1"; n="$2"
prompt="$(sed -n "${n}p" "$JOB/prompts.txt")"
[ -n "$prompt" ] || { echo "no prompt $n"; exit 2; }
case "$n" in 1|3|4) kind=talk ;; *) kind=design ;; esac

talk="-"; model=claude-fable-5-2; sname="$run"
case "$run" in
  A*) ;;
  B*) talk=claude-opus-5-5 ;;
  C*) if [ "$kind" = talk ]; then sname="${run}o"; model=claude-opus-5-5; else sname="${run}f"; fi ;;
  *) echo "unknown run $run"; exit 2 ;;
esac

idf="$JOB/runs/session-$sname.id"
if [ -f "$idf" ]; then mode=resume; sid="$(cat "$idf")"; else mode=new; sid="$(uuidgen)"; echo "$sid" >"$idf"; fi
label="$run-t$n"
[ -e "$JOB/runs/$label.json" ] && { echo "refusing: runs/$label.json exists"; exit 2; }

echo "start $(date +%T) $label session=$sname($mode) model=$model talk=$talk"
DXB_RUN_MODEL="$model" timeout 230 bash "$JOB/run-turn.sh" "$label" "$mode" "$sid" "$talk" "$prompt"
echo "end   $(date +%T) timeout-exit=$?"
python3 - "$JOB/runs/$label.json" "$JOB/runs/$label.err" <<'PY'
import json, sys
try:
    d = json.load(open(sys.argv[1]))
except Exception as e:
    print("NO JSON:", e); print(open(sys.argv[2]).read()[-800:]); sys.exit(1)
print("is_error", d.get("is_error"), "subtype", d.get("subtype"), "api_error_status", d.get("api_error_status"),
      "num_turns", d.get("num_turns"), "models", {m: round(u["costUSD"], 4) for m, u in (d.get("modelUsage") or {}).items()})
r = d.get("result") or ""
low = r.lower()
if d.get("is_error") or "usage limit" in low or "limit reached" in low or "rate limit" in low:
    print("STOP? result:", r[:600])
else:
    print("result head:", r[:160].replace("\n", " | "))
PY
