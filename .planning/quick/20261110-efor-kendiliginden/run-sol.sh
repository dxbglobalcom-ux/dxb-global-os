#!/usr/bin/env bash
cd "/home/dxb/DxB Global OS"
scripts/governance/refuter.sh --effort xhigh --deny-read /home/dxb/.claude/projects --deny-read /tmp/claude-1000 "$(cat "/home/dxb/DxB Global OS/.planning/quick/20261110-efor-kendiliginden/sol-brief.txt")" > "/home/dxb/DxB Global OS/.planning/quick/20261110-efor-kendiliginden/sol.raw" 2> "/home/dxb/DxB Global OS/.planning/quick/20261110-efor-kendiliginden/sol.err"
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261110-efor-kendiliginden/sol.raw"
