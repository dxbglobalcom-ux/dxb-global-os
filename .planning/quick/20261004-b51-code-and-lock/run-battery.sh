#!/bin/bash
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
pnpm construction:battery > "/home/dxb/DxB Global OS/.planning/quick/20261004-b51-code-and-lock/evidence/battery.log" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261004-b51-code-and-lock/evidence/battery.log"
