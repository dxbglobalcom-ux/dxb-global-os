#!/usr/bin/env bash
D="/home/dxb/DxB Global OS/.planning/quick/20261014-iki-video"
"/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort xhigh "$(cat "$D/sol-brief.txt")" > "$D/sol.raw" 2>&1
echo "EXIT=$?" >> "$D/sol.raw"
