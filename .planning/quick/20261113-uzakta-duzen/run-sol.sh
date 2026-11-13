#!/bin/bash
# Sol blind audit of the away arrangement; run as the background command itself: its exit wakes the lead.
echo 100 > /proc/self/oom_score_adj
J="/home/dxb/DxB Global OS/.planning/quick/20261113-uzakta-duzen"
bash "/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort xhigh --deny-read "/tmp/claude-1000" --deny-read "/home/dxb/.claude/projects" "$(cat "$J/sol-brief.txt")" > "$J/sol.raw" 2> "$J/sol.err"; rc=$?
echo "sol exit=$rc, $(wc -c < "$J/sol.raw") bytes"; exit $rc
