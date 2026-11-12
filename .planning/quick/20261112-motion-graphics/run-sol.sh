#!/bin/bash
echo 100 > /proc/self/oom_score_adj
J="/home/dxb/DxB Global OS/.planning/quick/20261112-motion-graphics"
bash "/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort high --deny-read "/tmp/claude-1000" --deny-read "/home/dxb/.claude/projects" "$(cat "$J/sol-brief.txt")" > "$J/sol-plan.raw" 2> "$J/sol-plan.err"
echo "EXIT=$?" >> "$J/sol-plan.raw"
