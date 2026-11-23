#!/usr/bin/env bash
# After the code commit: the lock's verdict on every piece, then the real chain's own upgrade from real/from.txt.
P="/home/dxb/DxB Global OS/.planning/quick/20261117-temel/stage-0/piece-6b"
"$P/run-verify.sh" "$1"
"$P/evidence/real-upgrade-from.sh" > "$P/evidence/real-upgrade-from.out" 2>&1
cat "$P/evidence/real-upgrade-from.out"
