#!/usr/bin/env bash
# Sol's raw dumps (*.raw) and the briefs sent to it (*brief*.txt) live in the job folders under
# .planning/quick/, on this disk only (out of git), and are deleted once older than 90 days
# (CEO 2026-10-06: "3 ayda bir silsin"). Run after every commit by scripts/hooks/post-commit.
# Only a file git IGNORES is ever a candidate, so a tracked file — SOL.md, the verdict — is never touched.
# Usage: sol-dump-sweep.sh [repo]   (default: the repository this script lives in)
set -euo pipefail
REPO="${1:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
DAYS=90
deleted=0
while IFS= read -r -d '' rel; do
  case "$rel" in
    *.raw|*brief*.txt) ;;
    *) continue ;;
  esac
  file="$REPO/$rel"
  [ -f "$file" ] && [ ! -L "$file" ] || continue
  if [ -n "$(find "$file" -maxdepth 0 -mtime +"$DAYS" -print)" ]; then
    rm -f -- "$file" && deleted=$((deleted + 1))
  fi
done < <(git -C "$REPO" ls-files -z --others --ignored --exclude-standard -- .planning/quick)
echo "sol-dump-sweep: $deleted deleted (older than $DAYS days)"
