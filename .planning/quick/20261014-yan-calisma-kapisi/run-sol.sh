#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS" || exit 1
bash scripts/governance/refuter.sh --effort medium "$(cat .planning/quick/20261014-yan-calisma-kapisi/sol-brief.txt)" > .planning/quick/20261014-yan-calisma-kapisi/SOL.md.raw 2>&1
echo "EXIT=$?" >> .planning/quick/20261014-yan-calisma-kapisi/SOL.md.raw
