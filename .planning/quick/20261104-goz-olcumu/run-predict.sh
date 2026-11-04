#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261104-goz-olcumu"
C=/home/dxb/.cache/dxb-goz-olcumu
ls "$C/packets" | sort -t- -k2,2 | xargs -P 3 -I{} bash "$J/predict.sh" "$C/packets/{}" "$C/out/{}.json" high
echo "EXIT=$?"
