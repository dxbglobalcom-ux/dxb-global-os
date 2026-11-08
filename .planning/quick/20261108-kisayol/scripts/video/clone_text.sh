#!/bin/bash
# Clone a GitHub repo as text only: sparse checkout of text extensions, then drop .git.
# usage: clone_text.sh <dest_root> owner/repo [owner/repo ...]
dest="$1"; shift
for r in "$@"; do
  slug="${r/\//__}"; d="$dest/$slug"
  [ -d "$d" ] && { echo "skip $slug"; continue; }
  timeout 90 git clone -q --depth 1 --filter=blob:limit=200k --no-checkout "https://github.com/$r.git" "$d" || { echo "FAIL $r"; continue; }
  git -C "$d" sparse-checkout set --no-cone '*.md' '*.MD' '*.json' '*.jsonl' '*.txt' '*.csv' '*.tsv' '*.yaml' '*.yml' '*.html' '*.ts' '*.js' '*.mjs' '*.py' 'LICENSE*' '!package-lock.json' '!pnpm-lock.yaml' '!node_modules/' >/dev/null 2>&1
  timeout 90 git -C "$d" checkout -q 2>&1 | tail -1
  git -C "$d" log -1 --format='%cs' > "$d/.last_commit_date" 2>/dev/null
  rm -rf "$d/.git"
  echo "$slug $(du -sh "$d" | cut -f1)"
done
