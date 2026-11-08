#!/bin/bash
# usage: fetch.sh owner/repo  -> raw/image-ads/owner__repo (text files only, .git removed)
set -u
R="/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/raw/image-ads"
L="/home/dxb/DxB Global OS/.planning/quick/20261108-kisayol/scripts/image-ads"
r=$1; d="$R/${r/\//__}"
[ -d "$d" ] && { echo "skip $r"; exit 0; }
git clone -q --depth 1 --filter=blob:limit=200k --no-checkout "https://github.com/$r.git" "$d" || exit 1
git -C "$d" sparse-checkout set --no-cone '*.md' '*.MD' '*.json' '*.jsonl' '*.csv' '*.tsv' '*.txt' '*.yaml' '*.yml' '*.ts' '*.js' '*.mjs' '*.py' '*.toml' '*.html' 'LICENSE*' '!node_modules/' '!*.min.js' '!package-lock.json' '!pnpm-lock.yaml' '!yarn.lock'
GIT_LFS_SKIP_SMUDGE=1 git -C "$d" checkout -q 2>/dev/null
printf "%s\t%s\n" "$r" "$(git -C "$d" log -1 --format=%cs)" >> "$L/commit-dates.tsv"
rm -rf "$d/.git"
# drop anything binary that slipped in, and huge files over 20 MB
find "$d" -type f -size +20M -delete
find "$d" -type f -exec sh -c 'file -b --mime "$1" | grep -q "charset=binary" && rm -f "$1"' _ {} \;
echo "ok $r $(du -sh "$d" | cut -f1)"
