#!/bin/bash
# usage: srch.sh outfile query...   (paced for the 30/min search limit)
out=$1; shift
for q in "$@"; do
  echo "## $q" >> "$out"
  for i in 1 2 3; do
    r=$(gh search repos $q --limit 20 --sort stars --json fullName,stargazersCount,updatedAt,description -q '.[] | "\(.stargazersCount)\t\(.fullName)\t\(.updatedAt[:10])\t\(.description[:90])"' 2>&1)
    if echo "$r" | grep -q "rate limit"; then sleep 20; else echo "$r" >> "$out"; break; fi
  done
  sleep 2.2
done
