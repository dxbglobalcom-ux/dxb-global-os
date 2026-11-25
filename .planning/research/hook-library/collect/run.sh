#!/bin/bash
# runs every query of queries.tsv for US and GB, three at a time
D=/home/dxb/.local/share/dxb/hook-lab/meta
echo 100 > /proc/self/oom_score_adj 2>/dev/null
mkdir -p $D/out
one() { sector="$1"; q="$2"; c="$3"; f="$D/out/${c}_$(echo "$q" | tr -c 'a-zA-Z0-9' '_').jsonl"; [ -s "$f" ] && exit 0; timeout 150 node $D/adlib.js "$f" "$c" 10 2026-05-25 "$q" >> $D/run.log 2>&1; sleep 2; }
export -f one; export D
for c in US GB; do while IFS=$'\t' read -r s q; do printf '%s\t%s\t%s\n' "$s" "$q" "$c"; done < $D/queries.tsv; done | xargs -P 3 -d '\n' -I{} bash -c 'IFS=$'"'"'\t'"'"' read -r s q c <<< "{}"; one "$s" "$q" "$c"'
echo DONE >> $D/run.log
