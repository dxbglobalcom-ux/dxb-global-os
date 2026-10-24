#!/usr/bin/env bash
# The owner's revised DISPATCH (r1 … r10, delivery by 22:45), run in its order.
set -uo pipefail
J=/home/dxb/test-kutu/20261024-zeytin
S=$J/tools/step.sh
L=$J/TIMES.log
grp() { echo "$(date '+%F %T') group $*" >>"$L"; }
until_clock() { while [ "$(date +%H%M)" -lt "$1" ]; do sleep 20; done; }

grp r1;  "$S" r1 high owner
grp r2-r4; "$S" r2a xhigh & a=$!; "$S" r2b xhigh & b=$!; "$S" r3 high & c=$!; "$S" r4 xhigh & d=$!
until_clock 2030
grp r5;  "$S" r5 high owner
wait $c
grp r6;  "$S" r6 high owner
wait $a $b $d
grp r7;  "$S" r7 high owner
grp r8-r9
mkdir -p "$J/job/work/r8-audit"
SOL_EFFORT=high "$J/tools/sol-try.sh" "$J/job" "$J/job/work/r8-audit/report.md" 8791 >"$J/logs/sol-final.out" 2>&1 & s=$!
"$S" r9 xhigh & r=$!
wait $s $r
grp r10; "$S" r10 high owner "The auditor's report is work/r8-audit/report.md; the jury's verdict is work/r9-jury/jury.md."
grp done
