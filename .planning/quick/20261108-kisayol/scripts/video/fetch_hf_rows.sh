#!/bin/bash
# Fetch all rows of a HF dataset config/split as JSON pages via datasets-server (text; avoids parquet binaries).
# usage: fetch_hf_rows.sh <dest_root> <owner/name> <config> <split> <num_rows>
dest="$1"; ds="$2"; cfg="$3"; split="$4"; n="$5"
d="$dest/hf__${ds/\//__}"; mkdir -p "$d/rows"
curl -s "https://huggingface.co/api/datasets/$ds" > "$d/.hf_api.json"
for ((o=0; o<n; o+=100)); do
  curl -sf "https://datasets-server.huggingface.co/rows?dataset=$ds&config=$cfg&split=$split&offset=$o&length=100" -o "$d/rows/${cfg}_${split}_$o.json" || echo "FAIL $o"
done
echo "$ds/$cfg $(ls "$d/rows" | wc -l) pages"
