#!/usr/bin/env bash
J="/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/plan"
bash "/home/dxb/DxB Global OS/scripts/governance/second-plan.sh" audit "$J" "$J/sol-brief.txt" xhigh > "$J/sol-run.log" 2>&1
echo "EXIT=$?" >> "$J/sol-run.log"
