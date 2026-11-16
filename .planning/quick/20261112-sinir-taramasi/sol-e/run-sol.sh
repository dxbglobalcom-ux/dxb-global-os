#!/bin/bash
# Sol blind audit of the 2026-11-16 research-engine and section-E commits; run as the background command itself.
echo 100 > /proc/self/oom_score_adj
J="/home/dxb/DxB Global OS/.planning/quick/20261112-sinir-taramasi/sol-e"
bash "/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort xhigh --deny-read "/tmp/claude-1000" --deny-read "/home/dxb/.claude/projects" --deny-read "/home/dxb/.claude/.credentials.json" "$(cat "$J/sol-brief.txt")" > "$J/sol.raw" 2> "$J/sol.err"; rc=$?
echo "sol exit=$rc, $(wc -c < "$J/sol.raw") bytes"; exit $rc
