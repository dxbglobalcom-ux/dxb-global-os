#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261117-temel/stage-0/piece-1"
cd "/home/dxb/DxB Global OS" || exit 1
scripts/governance/refuter.sh --effort xhigh \
  --deny-read /tmp/claude-1000 --deny-read /home/dxb/.claude/projects --deny-read /home/dxb/.claude-mem \
  "$(cat "$J/audit-brief.txt")" > "$J/ASTRA.raw" 2>&1
echo "EXIT $?" >> "$J/ASTRA.raw"; tail -c 300 "$J/ASTRA.raw"
