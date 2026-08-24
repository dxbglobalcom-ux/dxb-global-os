#!/usr/bin/env bash
# START THE CEO'S DASHBOARD WITH THE COMPANY'S ADDRESS IN ITS HAND.
#
# B36 Block 4, 2026-08-24. Until that day `apps/dashboard/src/app/api/voice/call/
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
# THE STAMP. This script exports DXB_DASHBOARD_LAUNCHER, and
# apps/dashboard/src/instrumentation.ts REFUSES TO SERVE without it. The auditor's
# instruction of 2026-08-24 is the reason: measured that evening, the dashboard
# answering on :3000 had been started 6h50m earlier by a bare
# `pnpm --filter ./apps/dashboard dev`, and its next-server process carried NO
# DXB_DATABASE_URL at all — so the voice-call route was already broken and only a
# request would have found out. A wrapper nobody is forced to use is a note, not a
# gate.
#
# THE ADDRESS IT LISTENS ON. Loopback by default. Measured the same evening: the
# dashboard was bound to `*:3000` and answered on 192.168.178.44:3000 — the home
# network — which is the same open door the CEO ordered shut on the database ports
# that morning. Override deliberately with DXB_DASHBOARD_HOST=0.0.0.0 if the
# dashboard is ever meant to be reachable from another machine.
#
#   bash scripts/dashboard.sh dev     # next dev   (pnpm dashboard)
#   bash scripts/dashboard.sh start   # next start (pnpm dashboard:start, after a build)
set -euo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO"

MODE="${1:-dev}"
case "$MODE" in
  dev|start) ;;
  *) echo "usage: bash scripts/dashboard.sh [dev|start]" >&2; exit 2 ;;
esac

HOST="${DXB_DASHBOARD_HOST:-127.0.0.1}"
PORT="${DXB_DASHBOARD_PORT:-3000}"

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

# The stamp the server checks. It carries WHAT started the server, so a refusal
# can say something better than "a variable is missing".
export DXB_DASHBOARD_LAUNCHER="scripts/dashboard.sh ${MODE}"

echo "dashboard: ${MODE} on ${HOST}:${PORT}, address handed in from the company's env files."
exec pnpm --filter @dxb/dashboard exec next "$MODE" -H "$HOST" -p "$PORT"
