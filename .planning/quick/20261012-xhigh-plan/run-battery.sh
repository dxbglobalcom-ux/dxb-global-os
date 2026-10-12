#!/bin/bash
J="/home/dxb/DxB Global OS/.planning/quick/20261012-xhigh-plan"
echo 100 > /proc/self/oom_score_adj 2>/dev/null
pnpm -C "/home/dxb/DxB Global OS" typecheck > "$J/typecheck.log" 2>&1; echo "EXIT=$?" >> "$J/typecheck.log"
pnpm -C "/home/dxb/DxB Global OS" construction:battery > "$J/battery.log" 2>&1; echo "EXIT=$?" >> "$J/battery.log"
