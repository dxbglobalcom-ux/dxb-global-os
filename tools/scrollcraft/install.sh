#!/usr/bin/env bash
# Install the holding's vendored copy of the scrollcraft skill into the machine's global
# skills path, and prove the installed copy is byte-identical to the one in this repository.
#
# The repository copy at tools/scrollcraft/skill is the ONLY source of truth. The installed
# copy is a product of this script and is replaced by it. Run this after changing the
# vendored copy, and run it with --check to find out whether the two have drifted apart.
#
#   bash tools/scrollcraft/install.sh          install (or reinstall) and verify
#   bash tools/scrollcraft/install.sh --check   verify only, change nothing
#
# Upstream: https://github.com/nateherkai/scroll-craft  pinned at e957985  (MIT)
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC="$REPO/tools/scrollcraft/skill"
DST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/scrollcraft"

fingerprint() { # sha256 over every file's path and content, order-stable
  (cd "$1" && find . -type f -print0 | LC_ALL=C sort -z | xargs -0 sha256sum | sha256sum | cut -d' ' -f1)
}

[ -d "$SRC" ] || { echo "source missing: $SRC" >&2; exit 1; }

if [ "${1:-}" != "--check" ]; then
  mkdir -p "$(dirname "$DST")"
  rm -rf "$DST"
  cp -r "$SRC" "$DST"
  echo "installed: $DST"
fi

[ -d "$DST" ] || { echo "NOT INSTALLED: $DST" >&2; exit 1; }

a="$(fingerprint "$SRC")"
b="$(fingerprint "$DST")"
echo "repo copy      $a"
echo "installed copy $b"
if [ "$a" = "$b" ]; then
  echo "IDENTICAL — the installed skill is the holding's own copy."
else
  echo "DRIFT — the installed skill is not the repository's copy. Run without --check to restore." >&2
  exit 1
fi
