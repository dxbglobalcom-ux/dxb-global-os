#!/bin/bash
echo 100 > /proc/self/oom_score_adj
cd "/home/dxb/DxB Global OS"
J=".planning/quick/20261112-motion-graphics"
pnpm typecheck > "$J/typecheck-4.out" 2>&1; echo "TYPECHECK_EXIT=$?" >> "$J/typecheck-3.out"
pnpm construction:battery > "$J/battery-4.out" 2>&1; echo "EXIT=$?" >> "$J/battery-3.out"
