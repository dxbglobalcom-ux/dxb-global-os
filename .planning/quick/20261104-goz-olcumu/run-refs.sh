#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261104-goz-olcumu"
until grep -q '^EXIT=' "$J/capture.log"; do sleep 15; done
node "$J/capture.mjs" "$J/refs.json" --jobs 1
echo "EXIT=$?"
