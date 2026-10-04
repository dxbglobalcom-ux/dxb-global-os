#!/bin/bash
cd "/home/dxb/DxB Global OS"
echo 100 > /proc/self/oom_score_adj
J="/home/dxb/DxB Global OS/.planning/quick/20261004-auditor-text"
scripts/governance/refuter.sh --card "$J/CARD.md" "$(cat "$J/BRIEF.txt")" > "$J/SOL.md.raw" 2>&1
echo "EXIT=$?" >> "$J/SOL.md.raw"
