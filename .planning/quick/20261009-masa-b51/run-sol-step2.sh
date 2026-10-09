#!/bin/bash
"/home/dxb/DxB Global OS/scripts/governance/refuter.sh" --effort xhigh "$(cat "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/sol-brief-step2.txt")" > "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/SOL-step2.md.raw" 2>&1
echo "EXIT=$?" >> "/home/dxb/DxB Global OS/.planning/quick/20261009-masa-b51/SOL-step2.md.raw"
