#!/bin/bash
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
DXB_LIVE_GATE=1 DXB_ENGINE_LOCK_WAIT=200 pnpm exec vitest run tests/b51/gate-live.test.ts > "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/evidence/gate-live.log" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/evidence/gate-live.log"
