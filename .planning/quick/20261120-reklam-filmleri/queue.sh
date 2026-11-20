#!/usr/bin/env bash
# Runs the ORVO render jobs in queue.txt one at a time, top line first, so the lead can reorder or add jobs
# while it runs (2026-11-20: a fixed chain had to be killed and rebuilt each time a fault was found).
# queue.txt lines: <seed> <board> [take numbers...] [@steps] — no take numbers = every take; '#' lines are skipped.
J="$(cd "$(dirname "$0")" && pwd)"; Q="$J/queue.txt"
while pgrep -f "^bash .*render_takes.sh" >/dev/null; do sleep 15; done
while :; do
  line=$(grep -v '^[[:space:]]*#' "$Q" | grep -m1 '[^[:space:]]') || break
  python3 -c '
import sys
p, line = sys.argv[1], sys.argv[2]
L = open(p).read().splitlines()
L.remove(line)
open(p, "w").write("\n".join(L) + ("\n" if L else ""))' "$Q" "$line"
  read -r seed board shots <<<"$line"
  # an "@<n>" token sets the sampling steps for that job (default 8)
  steps=8; rest=""
  for w in $shots; do if [[ "$w" == @* ]]; then steps=${w#@}; else rest="$rest $w"; fi; done
  echo "queue: $board seed $seed takes ${rest:- all} steps $steps $(date +%H:%M:%S)"
  STEPS="$steps" SHOTS="${rest# }" "$J/render_takes.sh" "$seed" "$board"
done
echo "queue empty $(date +%H:%M:%S)"
