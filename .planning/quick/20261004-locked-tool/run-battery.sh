#!/bin/bash
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
OUT="/home/dxb/DxB Global OS/.planning/quick/20261004-locked-tool/evidence/battery${1:+-$1}.log"
pnpm construction:battery > "$OUT" 2>&1
echo "EXIT=$?" >> "$OUT"
