#!/usr/bin/env bash
# After the corrections' commit: every lock on the committed revision, then the real chain's own proof with the outside text.
P="/home/dxb/DxB Global OS/.planning/quick/20261117-temel/stage-0/piece-6c"
"$P/run-verify.sh" verify-at-the-corrections-commit.log
"$P/evidence/real-upgrade-outside.sh" > "$P/evidence/real-upgrade-outside-at-the-corrections.out" 2>&1
grep -E "^== |exit=|EQUAL|RED|KEPT|GREEN|STOPPED|INSTANCE|^[+-] |marked in" "$P/evidence/real-upgrade-outside-at-the-corrections.out"
