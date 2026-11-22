#!/usr/bin/env bash
# B72 — installs the nightly backup's three systemd USER units, and nothing else:
# dxb-backup.service, dxb-backup.timer and dxb-backup-alert.service are copied
# into ~/.config/systemd/user, the user manager reloads, and the TIMER alone is
# enabled and started. No service is started here — the job runs when its timer
# fires, the alert only when the job fails — and no other unit is touched: the
# general installer (scripts/systemd/install.sh) restarts the resident services,
# which a change to the backup must never do.
# Re-run safe: cp + daemon-reload + enable --now is idempotent.
set -euo pipefail

UNIT_DIR="${HOME}/.config/systemd/user"
SRC_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../systemd" && pwd)"

mkdir -p "${UNIT_DIR}"
cp "${SRC_DIR}/dxb-backup.service" "${SRC_DIR}/dxb-backup.timer" "${SRC_DIR}/dxb-backup-alert.service" "${UNIT_DIR}/"
systemctl --user daemon-reload
# A oneshot unit is enabled by its TIMER, never by itself.
systemctl --user enable --now dxb-backup.timer
echo "installed dxb-backup.service, dxb-backup.timer, dxb-backup-alert.service; dxb-backup.timer enabled and started"
