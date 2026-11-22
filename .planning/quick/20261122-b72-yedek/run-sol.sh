#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261122-b72-yedek"
cd "/home/dxb/DxB Global OS" || exit 1
scripts/governance/refuter.sh --effort high --model sol \
  --deny-read /tmp/claude-1000 --deny-read /home/dxb/.claude/projects --deny-read /home/dxb/.claude-mem \
  "$(cat "$J/audit-brief.txt")" > "$J/SOL.raw" 2>&1
echo "EXIT $?" >> "$J/SOL.raw"; tail -c 200 "$J/SOL.raw"
