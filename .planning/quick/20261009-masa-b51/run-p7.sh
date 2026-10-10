#!/bin/bash
# B51 P7's side-by-side run, detached. The engine is the caller's to name — no database address lives in a
# tracked file (B36): DXB_DATABASE_URL=<company> bash run-p7.sh
: "${DXB_DATABASE_URL:?name the engine: DXB_DATABASE_URL=<url> bash run-p7.sh}"
J="/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51"
node "/home/dxb/DxB Global OS/scripts/models/side-by-side.mjs" --n 20 > "$J/evidence/p7-side-by-side-run.log" 2>&1
echo "EXIT=$?" >> "$J/evidence/p7-side-by-side-run.log"
