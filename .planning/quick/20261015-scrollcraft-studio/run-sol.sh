#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS"
bash scripts/governance/refuter.sh --effort high "$(cat "/home/dxb/DxB Global OS/.planning/quick/20261015-scrollcraft-studio/sol-brief.txt")" > "/home/dxb/DxB Global OS/.planning/quick/20261015-scrollcraft-studio/sol.raw" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261015-scrollcraft-studio/sol.raw"
