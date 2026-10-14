#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS" || exit 1
bash scripts/governance/refuter.sh --effort xhigh "$(cat .planning/quick/20261014-b64-adim1/sol-brief.txt)" > .planning/quick/20261014-b64-adim1/SOL.md.raw 2>&1
echo "EXIT=$?" >> .planning/quick/20261014-b64-adim1/SOL.md.raw
