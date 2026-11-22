#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261117-temel/workers"
cd "/home/dxb/DxB Global OS" || exit 1
scripts/governance/fable-audit.sh "$J" "$J/blind/AUDIT-BRIEF.txt" high > "$J/fable-audit.out" 2>&1
echo "EXIT $?" >> "$J/fable-audit.out"
