#!/bin/bash
cd "/home/dxb/DxB Global OS"
echo 100 > /proc/self/oom_score_adj
scripts/governance/refuter.sh --card "/home/dxb/DxB Global OS/.planning/quick/20261004-b51-code-and-lock/CARD.md" "$(cat "/home/dxb/DxB Global OS/.planning/quick/20261004-b51-code-and-lock/BRIEF.txt")" > "/home/dxb/DxB Global OS/.planning/quick/20261004-b51-code-and-lock/SOL.md.raw" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261004-b51-code-and-lock/SOL.md.raw"
