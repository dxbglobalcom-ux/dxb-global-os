#!/usr/bin/env bash
# Text-only shallow clone: no blobs fetched except text file types.
# usage: clone.sh <owner/repo> <slug>
set -u
B="/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/raw/image-general"
repo="$1"; slug="$2"; d="$B/$slug"
[ -d "$d" ] && { echo "exists $slug"; exit 0; }
git clone -q --depth 1 --filter=blob:none --no-checkout "https://github.com/$repo.git" "$d" || exit 1
git -C "$d" sparse-checkout set --no-cone '*.md' '*.json' '*.jsonl' '*.csv' '*.tsv' '*.txt' '*.yaml' '*.yml' '!node_modules/' '!package*.json' '!tsconfig*.json' '!*lock*'
git -C "$d" checkout -q 2>&1 | tail -2
rm -rf "$d/.git"
# drop anything over 50 MB or binary that slipped in
find "$d" -type f -size +50M -print -delete
echo "$slug $(du -sh "$d" | cut -f1) $(find "$d" -type f | wc -l) files"
