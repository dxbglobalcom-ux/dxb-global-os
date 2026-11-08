#!/bin/bash
# Paced GitHub repo search for video prompt collections (search API: 30 req/min shared).
out="$1"; shift
for q in "$@"; do
  for try in 1 2 3 4; do
    r=$(gh search repos "$q" --sort stars --limit 15 --json fullName,stargazersCount,updatedAt,description -q '.[]|"\(.stargazersCount)\t\(.fullName)\t\(.updatedAt[:10])\t\((.description // "")[:100])"' 2>&1)
    if echo "$r" | grep -q "rate limit"; then sleep 30; else break; fi
  done
  { echo "=== $q"; echo "$r"; } >> "$out"
  sleep 4
done
echo DONE >> "$out"
