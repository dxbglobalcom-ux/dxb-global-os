#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS" || exit 1
bash scripts/governance/refuter.sh --effort xhigh "$(cat .planning/quick/20261012-b64-is-akisi/sol-brief-specs.txt)" > .planning/quick/20261012-b64-is-akisi/SOL-specs.md.raw 2>&1
echo "EXIT=$?" >> .planning/quick/20261012-b64-is-akisi/SOL-specs.md.raw
