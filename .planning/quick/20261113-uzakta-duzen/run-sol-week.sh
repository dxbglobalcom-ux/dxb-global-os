#!/bin/bash
# Sol blind audit of the model-week piece; run as the background command itself: its exit wakes the lead.
echo 100 > /proc/self/oom_score_adj
J="/home/dxb/DxB Global OS/.planning/quick/20261113-uzakta-duzen"
bash "/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort xhigh --deny-read "/tmp/claude-1000" --deny-read "/home/dxb/.claude/projects" --deny-read "/home/dxb/.claude/.credentials.json" "$(cat "$J/sol-week-brief.txt")" > "$J/sol-week.raw" 2> "$J/sol-week.err"; rc=$?
echo "sol exit=$rc, $(wc -c < "$J/sol-week.raw") bytes"; exit $rc
