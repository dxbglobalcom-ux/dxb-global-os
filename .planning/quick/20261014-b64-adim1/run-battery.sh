#!/bin/bash
# B64 step 1 — typecheck, then the whole battery, detached; last line EXIT=<code>.
echo 100 > /proc/self/oom_score_adj 2>/dev/null
cd "/home/dxb/DxB Global OS" || exit 1
{ echo "== typecheck $(date -Is)"; pnpm typecheck; echo "TYPECHECK_EXIT=$?";
  echo "== battery $(date -Is)"; pnpm construction:battery; echo "BATTERY_EXIT=$?"; } > "$1" 2>&1
echo "EXIT=done $(date -Is)" >> "$1"
