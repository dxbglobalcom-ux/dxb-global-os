#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261104-goz-olcumu"
node "$J/capture.mjs" "$J/pages.json" --jobs 1
echo "EXIT=$?"
