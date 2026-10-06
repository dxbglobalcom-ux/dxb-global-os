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

# ── THE ENGINE IS TAKEN OUT HERE, ON THE HOST SIDE ──────────────────────────
# One run at a time on one bench, and the door is where that is decided for
# everything that goes through it. It cannot be decided on the other side:
# measured 2026-09-21, inside the wall `/tmp` is a fresh tmpfs, so the lock file
# is not even visible there, and no environment variable of ours crosses either.
# So the lock is held HERE, by this shell, for as long as the command inside
# runs — which is also why the wall is no longer `exec`ed: a shell that has been
# replaced is a shell that is no longer holding anything.
# The battery sets DXB_ENGINE_LOCK_HELD before it calls this door, because it is
# already holding the same lock and must not queue behind itself.
LOCK="${TMPDIR:-/tmp}/dxb-construction-battery.lock"
if [ -z "${DXB_ENGINE_LOCK_HELD:-}" ] && command -v flock >/dev/null 2>&1; then
  exec 200>"$LOCK"
  # DXB_ENGINE_LOCK_WAIT=<seconds> (dxb-team2 §5, 2026-10-06): parallel writers
  # queue for the engine instead of colliding on it. A positive integer only;
  # anything else is today's immediate refusal.
  WAIT="${DXB_ENGINE_LOCK_WAIT:-}"
  [[ "$WAIT" =~ ^[1-9][0-9]*$ ]] || WAIT=""
  if ! flock -n 200 && { [ -z "$WAIT" ] || {
        echo "waiting up to $WAIT s for the construction engine…" >&2
        ! flock -w "$WAIT" 200; }; }; then
    echo "REFUSED: another run already holds the construction engine." >&2
    echo "         Two runs on one bench measure each other, not the code. Wait for it," >&2
    echo "         or point this one elsewhere with DXB_CONSTRUCTION_URL." >&2
    exit 2
  fi
  export DXB_ENGINE_LOCK_HELD=1
elif ! command -v flock >/dev/null 2>&1; then
  echo "⚠ UNVERIFIED — flock is not installed, so a concurrent run cannot be ruled out" >&2
fi

rc=0
sudo -n "$WALL" "$@" || rc=$?
exit "$rc"
