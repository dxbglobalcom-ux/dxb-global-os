#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS"
echo 100 > /proc/self/oom_score_adj 2>/dev/null
OUT=".planning/quick/20261015-arama-testi/evidence"
{ pnpm typecheck; echo "TYPECHECK_EXIT=$?"; } > "$OUT/typecheck-after-fixes.txt" 2>&1
{ pnpm construction:battery; echo "EXIT=$?"; } > "$OUT/battery-after-fixes.txt" 2>&1
