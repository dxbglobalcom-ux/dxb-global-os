#!/bin/bash
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
pnpm construction:battery > "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/evidence/battery-step3-b2-smoke-gate-b6.log" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/evidence/battery-step3-b2-smoke-gate-b6.log"
