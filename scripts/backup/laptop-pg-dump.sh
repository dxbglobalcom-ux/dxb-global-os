#!/usr/bin/env bash
# E13.0 — daily dump of the LAPTOP live DB (control-terminal reality: the
# production containers run on the X230 until the VPS cutover; the VPS has
# its own live pipeline in vps/backup/pg_dump.sh since 2026-07-09, but the
# laptop DB had none — this closes the local-RPO gap).
#
# Custom-format dump from the supabase container + retention prune + optional
# off-site copy. Off-site (Hetzner Storage Box) needs a laptop-side SSH key
# installed on subaccount u629578-sub1 — a CEO-owned credential step
# (recorded boundary); until then BACKUP_DEST stays unset and the script
# says so honestly.
#
# Cron (installed by scripts/backup/install-cron.sh):
#   30 2 * * * /home/ghost/DxB\ Global\ OS/scripts/backup/laptop-pg-dump.sh >> /home/ghost/backups/dxb/backup.log 2>&1
set -euo pipefail

CONTAINER="supabase_db_DxB_Global_OS"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/dxb}"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date +%F)"
OUT="$BACKUP_DIR/dxb-laptop-$STAMP.dump"

mkdir -p "$BACKUP_DIR"
umask 077

docker exec "$CONTAINER" pg_dump -U postgres -d postgres -Fc > "$OUT"
test -s "$OUT" || { echo "BACKUP_FAIL empty dump"; exit 1; }
echo "BACKUP_OK $STAMP $(stat -c%s "$OUT") bytes"

if [ -n "${BACKUP_DEST:-}" ]; then
  scp -q "$OUT" "$BACKUP_DEST/" && echo "OFFSITE_OK $STAMP"
else
  echo "OFFSITE_SKIP (BACKUP_DEST unset — laptop→StorageBox key is a CEO-owned credential step)"
fi

find "$BACKUP_DIR" -name "dxb-laptop-*.dump" -mtime "+$RETENTION" -delete
