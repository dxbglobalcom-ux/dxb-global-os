#!/usr/bin/env bash
# Install/refresh the DXB systemd USER units (scheduler + JARVIS) and start
# them. User units need no sudo; they live with the CEO's login session.
# Re-run safe: cp + daemon-reload + enable --now is idempotent.
set -euo pipefail

UNIT_DIR="${HOME}/.config/systemd/user"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPO_ROOT="$(cd "${SRC_DIR}/../.." && pwd)"

# Daemon env: the resident processes need DXB_DATABASE_URL outside any
# interactive shell. If no committed-name env file carries it, materialize
# the repo-documented local-dev value (db/README.md) into gitignored
# .env.daemon — never echoed, never committed.
if ! /bin/bash -c 'set -a; for f in "'"${REPO_ROOT}"'/.env" "'"${REPO_ROOT}"'/.env.local" "'"${REPO_ROOT}"'/.env.daemon"; do [ -f "$f" ] && source "$f"; done; [ -n "${DXB_DATABASE_URL:-}" ]'; then
  printf 'DXB_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres\n' \
    > "${REPO_ROOT}/.env.daemon"
  echo "wrote .env.daemon (local-dev DB URL from db/README.md template)"
fi

mkdir -p "${UNIT_DIR}"
cp "${SRC_DIR}/dxb-scheduler.service" "${UNIT_DIR}/"
cp "${SRC_DIR}/dxb-jarvis.service" "${UNIT_DIR}/"

systemctl --user daemon-reload
systemctl --user enable dxb-scheduler.service dxb-jarvis.service
systemctl --user restart dxb-scheduler.service
systemctl --user restart dxb-jarvis.service

# Survive logout/idle on the CEO terminal (needs one-time sudo if not yet on;
# failure is non-fatal — units still run while logged in).
loginctl enable-linger "$(whoami)" 2>/dev/null || true

echo "--- status ---"
systemctl --user --no-pager --lines 3 status dxb-scheduler.service || true
systemctl --user --no-pager --lines 3 status dxb-jarvis.service || true
