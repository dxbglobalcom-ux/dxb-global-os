#!/bin/bash
# the second round of Meta's public ad library: thin trades (queries2.tsv: sector, query, country), three at a time, slowly
D=/home/dxb/.local/share/dxb/hook-lab/meta
echo 100 > /proc/self/oom_score_adj 2>/dev/null
mkdir -p $D/out2
one() { s="$1"; q="$2"; c="$3"; f="$D/out2/${c}_$(echo "$q" | tr -c 'a-zA-Z0-9' '_').jsonl"; [ -s "$f" ] && exit 0; timeout 150 node $D/adlib.js "$f" "$c" 6 2026-05-25 "$q" >> $D/run2.log 2>&1; sleep 3; }
export -f one; export D
xargs -P 3 -d '\n' -I{} bash -c 'IFS=$'"'"'\t'"'"' read -r s q c <<< "{}"; one "$s" "$q" "$c"' < $D/queries2.tsv
echo DONE >> $D/run2.log
