#!/usr/bin/env bash
# START THE CEO'S DASHBOARD WITH THE COMPANY'S ADDRESS IN ITS HAND.
#
# B36 Block 4, 2026-08-24. Until today `apps/dashboard/src/app/api/voice/call/
# route.ts` opened with
#
#     process.env.DXB_DATABASE_URL ??= "postgresql://…@127.0.0.1:54322/postgres"
#
# — a live application route inventing a database for itself. It is the only file
# in the dashboard that touches the engine directly, and Next.js reads env files
# from `apps/dashboard/`, not from the repository root, so that fallback was the
# ONLY thing that ever gave the route an address on this machine. Block 4 deleted
# it: a route may not guess where the holding lives.
#
# So the address is handed in here instead, by exactly the mechanism the two
# resident daemons use (scripts/systemd/dxb-scheduler.service): source the
# company's own env files, then map DXB_COMPANY_DATABASE_URL — the name nothing
# reads by accident — onto DXB_DATABASE_URL, for this process and nothing else.
#
#   bash scripts/dashboard.sh dev     # next dev
#   bash scripts/dashboard.sh start   # next start (after a build)
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

MODE="${1:-dev}"
case "$MODE" in
  dev|start) ;;
  *) echo "usage: bash scripts/dashboard.sh [dev|start]" >&2; exit 2 ;;
esac

set -a
for f in ./.env ./.env.local ./.env.daemon; do [ -f "$f" ] && source "$f"; done
set +a
export DXB_DATABASE_URL="${DXB_DATABASE_URL:-${DXB_COMPANY_DATABASE_URL:-}}"

if [ -z "${DXB_DATABASE_URL}" ]; then
  echo "dashboard: no company address found." >&2
  echo "  Put DXB_COMPANY_DATABASE_URL=… in .env.daemon (db/README.md §Environment)," >&2
  echo "  or run scripts/systemd/install.sh, which writes it." >&2
  exit 2
fi

exec pnpm --filter @dxb/dashboard "$MODE"
