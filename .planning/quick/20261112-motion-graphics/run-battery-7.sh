#!/bin/bash
# Sol fixes of the second film's piece and the model-week piece: the typecheck and the whole battery. Run as the background command itself: its exit wakes the lead. Non-zero when either fails.
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
J=".planning/quick/20261112-motion-graphics"
pnpm typecheck > "$J/typecheck-7.out" 2>&1; tc=$?; echo "TYPECHECK_EXIT=$tc" >> "$J/typecheck-7.out"
pnpm construction:battery > "$J/battery-7.out" 2>&1; rc=$?; echo "EXIT=$rc" >> "$J/battery-7.out"
tail -n 1 "$J/typecheck-7.out"; grep -E "BATTERY_|suite *:|Tests  |FAIL " "$J/battery-7.out" | tail -n 12; grep -E "motion-graphics[^ ]*\.test\.ts" "$J/battery-7.out" | grep -E "\([0-9]+ test" | head -8
[ "$tc" -eq 0 ] && [ "$rc" -eq 0 ]
