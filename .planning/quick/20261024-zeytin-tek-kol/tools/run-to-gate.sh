#!/usr/bin/env bash
# Steps 1a … 9 of the signed DISPATCH, in its order, parallel where the plan runs parts side by side.
# The P8 ↔ P9 loop and everything after it are run by the lead step by step.
set -uo pipefail
S=/home/dxb/test-kutu/20261024-zeytin/tools/step.sh
L=/home/dxb/test-kutu/20261024-zeytin/TIMES.log
grp() { echo "$(date '+%F %T') group $*" >>"$L"; }
grp 1;  "$S" 1a medium & "$S" 1b medium & wait
grp 2;  "$S" 2 max
grp 3;  "$S" 3 high owner
grp 4;  "$S" 4a high & "$S" 4b xhigh & "$S" 4c high & wait
grp 5;  "$S" 5 xhigh
grp 6;  "$S" 6a high & "$S" 6b high & "$S" 6c xhigh & "$S" 6d high & wait
grp 7;  "$S" 7 xhigh owner
grp 8;  "$S" 8 xhigh
grp 9;  "$S" 9 xhigh
grp done-to-gate
