#!/bin/bash
J="/home/dxb/DxB Global OS/.planning/quick/20261012-b64-is-akisi"
echo 100 > /proc/self/oom_score_adj 2>/dev/null
"/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort xhigh "$(cat "$J/sol-brief-v9.txt")" > "$J/SOL-v9.md.raw" 2>&1
echo "EXIT=$?" >> "$J/SOL-v9.md.raw"
