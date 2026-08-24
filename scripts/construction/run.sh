#!/usr/bin/env bash
# B36 · Block 3-bis — THE DOOR THE CONSTRUCTION SITE RUNS THROUGH.
#
# This file is deliberately thin. The wall itself — the identity it drops to, the
# empty network namespace, the list of ports that may be carried in, what is
# bound and what is not — lives in a ROOT-OWNED program the construction cannot
# rewrite:
#
#   /usr/local/sbin/dxb-construction-sandbox
#
# Its reviewable source is scripts/construction/sandbox.sh, and
# scripts/construction/install-wall.sh is what puts it in place. If the two ever
# differ, tests/b36/company-is-read-only.test.ts says so.
#
# Usage:  scripts/construction/run.sh <command …>
#         scripts/construction/run.sh pnpm test
set -euo pipefail

WALL=/usr/local/sbin/dxb-construction-sandbox

if [ ! -x "$WALL" ]; then
  echo "the construction wall is not installed: $WALL" >&2
  echo "install it:  bash scripts/construction/install-wall.sh" >&2
  exit 2
fi

exec sudo -n "$WALL" "$@"
