#!/bin/bash
# Paced GitHub code search (10 req/min); prints repo and path per hit.
out="$1"; shift
for q in "$@"; do
  for try in 1 2 3; do
    r=$(gh search code "$q" --limit 30 --json repository,path -q '.[]|"\(.repository.nameWithOwner)\t\(.path)"' 2>&1)
    if echo "$r" | grep -q "rate limit"; then sleep 25; else break; fi
  done
  { echo "=== $q"; echo "$r" | sort | uniq; } >> "$out"
  sleep 7
done
