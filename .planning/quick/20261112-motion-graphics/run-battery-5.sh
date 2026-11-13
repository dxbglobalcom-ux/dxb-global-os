#!/bin/bash
# The battery of 2026-11-13 morning. Run as the background command itself: its own exit wakes the lead.
# It exits non-zero when the typecheck OR the battery failed.
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
J=".planning/quick/20261112-motion-graphics"
pnpm typecheck > "$J/typecheck-5.out" 2>&1; tc=$?; echo "TYPECHECK_EXIT=$tc" >> "$J/typecheck-5.out"
pnpm construction:battery > "$J/battery-5.out" 2>&1; rc=$?; echo "EXIT=$rc" >> "$J/battery-5.out"
tail -n 1 "$J/typecheck-5.out"; grep -E "BATTERY_|suite *:|Tests  |FAIL " "$J/battery-5.out" | tail -n 12
[ "$tc" -eq 0 ] && [ "$rc" -eq 0 ]
