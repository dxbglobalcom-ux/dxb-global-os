#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261117-kapi-iki-kural"
"/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort medium "$(cat "$J/sol-brief.txt")" > "$J/sol.raw" 2> "$J/sol.err"
echo "SOL_EXIT=$?"; wc -c "$J/sol.raw"
