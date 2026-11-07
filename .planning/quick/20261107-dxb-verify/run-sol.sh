#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS"
bash scripts/governance/refuter.sh --effort high "$(cat .planning/quick/20261107-dxb-verify/sol-brief.txt)" > .planning/quick/20261107-dxb-verify/sol.raw 2> .planning/quick/20261107-dxb-verify/sol.err
echo "EXIT=$?" >> .planning/quick/20261107-dxb-verify/sol.raw
