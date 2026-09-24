#!/usr/bin/env bash
# Install/refresh the DXB systemd USER units and start them. User units need no
# sudo; they live with the CEO's login session.
# Re-run safe: cp + daemon-reload + enable --now is idempotent.
#
# Four resident services — the scheduler, JARVIS, the company's read gateway and
# the board — plus three timers: the weekly screenshot sweep, the nightly backup
# and the daily model watch.
set -euo pipefail

UNIT_DIR="${HOME}/.config/systemd/user"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

REPO_ROOT="$(cd "${SRC_DIR}/../.." && pwd)"

# Daemon env: the resident processes need the company's address outside any
# interactive shell.
#
# B36 Block 4 — IT IS NOT WRITTEN UNDER THE NAME EVERY TOOL READS. Until
# 2026-08-24 this file put `DXB_DATABASE_URL=<the company>` into .env.daemon, so
# anything that sourced that file — a construction script, a helper, a shell
# doing `set -a; source .env*` — silently inherited a live, write-capable
# address for the holding's own database in the exact variable
# packages/shared/src/db.ts picks up. The value is the same; the name is now
# DXB_COMPANY_DATABASE_URL, which nothing reads by accident. The two company
# daemons map it back to DXB_DATABASE_URL inside their own ExecStart, and only
# there (scripts/systemd/dxb-scheduler.service, dxb-jarvis.service).
if ! /bin/bash -c 'set -a; for f in "'"${REPO_ROOT}"'/.env" "'"${REPO_ROOT}"'/.env.local" "'"${REPO_ROOT}"'/.env.daemon"; do [ -f "$f" ] && source "$f"; done; [ -n "${DXB_COMPANY_DATABASE_URL:-}${DXB_DATABASE_URL:-}" ]'; then
  printf 'DXB_COMPANY_DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres\n' \
    > "${REPO_ROOT}/.env.daemon"
  echo "wrote .env.daemon (local-dev DB URL from db/README.md template)"
fi

mkdir -p "${UNIT_DIR}"
cp "${SRC_DIR}/dxb-scheduler.service" "${UNIT_DIR}/"
cp "${SRC_DIR}/dxb-jarvis.service" "${UNIT_DIR}/"
# B36 · Block 3-bis — the holding's read gateway. The construction side holds no
# account on the company's database; it asks this service by name over a unix
# socket. Without it, the governance gate fails closed by design.
cp "${SRC_DIR}/dxb-company-read.service" "${UNIT_DIR}/"

# B36 · 2026-08-24, on the CEO's ruling — the weekly screenshot sweep. Both files
# used to exist ONLY on this machine, hand-written and in no repository, so the
# nightly failure they produced could not be fixed anywhere but by hand. They are
# under version control now and this installer owns them.
cp "${SRC_DIR}/dxb-screenshot-cleanup.service" "${UNIT_DIR}/"
cp "${SRC_DIR}/dxb-screenshot-cleanup.timer" "${UNIT_DIR}/"

# 2026-08-26, on his order "takip etmek istiorm" — the readable open-work board.
# It redraws var/board/tahta.html within a second of the board, the Turkish
# index or HEAD moving, so the page he keeps open is a
# window rather than a photograph. Reads files, writes one HTML file, nothing else.
cp "${SRC_DIR}/dxb-board.service" "${UNIT_DIR}/"

# 2026-08-27 — the holding's nightly copy, RESTORED after the move to the
# workstation left its schedule behind on the X230 (the script's own header still
# installs a cron line under /home/ghost). Measured that day: no crontab for this
# user, no dxb timer, last automatic dump 2026-08-13 — thirteen nights in which
# the company existed on one desk and nowhere else.
cp "${SRC_DIR}/dxb-backup.service" "${UNIT_DIR}/"
cp "${SRC_DIR}/dxb-backup.timer" "${UNIT_DIR}/"

# 2026-09-24, row B55 — the watch behind the pinned model. Once a day it reads
# Anthropic's public models page and guidance sources and leaves a notice for the
# next session's opening; it never changes a setting (his order: he is told, he
# and the chief engineer review together, the setting moves only on his "geç").
cp "${SRC_DIR}/dxb-model-watch.service" "${UNIT_DIR}/"
cp "${SRC_DIR}/dxb-model-watch.timer" "${UNIT_DIR}/"

systemctl --user daemon-reload
systemctl --user enable dxb-scheduler.service dxb-jarvis.service dxb-company-read.service dxb-board.service
# A oneshot unit is enabled by its TIMER, never by itself.
systemctl --user reset-failed dxb-screenshot-cleanup.service 2>/dev/null || true
systemctl --user enable --now dxb-screenshot-cleanup.timer
# A oneshot unit is enabled by its TIMER, never by itself (same rule as above).
systemctl --user reset-failed dxb-backup.service 2>/dev/null || true
systemctl --user enable --now dxb-backup.timer
# A oneshot unit is enabled by its TIMER, never by itself (same rule as above).
systemctl --user reset-failed dxb-model-watch.service 2>/dev/null || true
systemctl --user enable --now dxb-model-watch.timer
systemctl --user restart dxb-scheduler.service
systemctl --user restart dxb-jarvis.service
systemctl --user restart dxb-company-read.service
systemctl --user restart dxb-board.service

# Survive logout/idle on the CEO terminal (needs one-time sudo if not yet on;
# failure is non-fatal — units still run while logged in).
loginctl enable-linger "$(whoami)" 2>/dev/null || true

echo "--- status ---"
systemctl --user --no-pager --lines 3 status dxb-scheduler.service || true
systemctl --user --no-pager --lines 3 status dxb-jarvis.service || true
systemctl --user --no-pager --lines 3 status dxb-company-read.service || true
systemctl --user --no-pager --lines 3 status dxb-board.service || true
systemctl --user --no-pager list-timers dxb-screenshot-cleanup.timer dxb-backup.timer dxb-model-watch.timer || true
