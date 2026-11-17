#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261117-dosya-boyutu-bekcisi"
"/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort high "$(cat "$J/sol-brief-2.txt")" > "$J/sol-2.raw" 2> "$J/sol-2.err"
echo "SOL_EXIT=$?"; wc -c "$J/sol-2.raw"
