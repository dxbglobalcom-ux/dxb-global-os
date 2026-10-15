#!/usr/bin/env bash
D="/home/dxb/DxB Global OS/.planning/quick/20261015-arama-testi"
"/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort high "$(cat "$D/sol-brief.txt")" > "$D/sol.raw" 2>&1
echo "EXIT=$?" >> "$D/sol.raw"
