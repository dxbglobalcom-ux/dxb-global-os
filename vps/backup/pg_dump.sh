#!/usr/bin/env bash
# DXB daily Postgres backup (07-05 Task 3; VPS single-point-of-failure
# mitigation). Custom-format dump from the compose db container + optional
# off-site copy + retention prune. Destination comes from env (vps/.env),
# never hardcoded. Dumps are 0600 (T-07-18). Cron line (documented in
# vps/README.md): 30 2 * * * /opt/dxb/vps/backup/pg_dump.sh
set -euo pipefail

ENV_FILE="$(dirname "$0")/../.env"
# shellcheck disable=SC1090
set -a && . "$ENV_FILE" && set +a

BACKUP_DIR="${BACKUP_DIR:-/opt/dxb/backups}"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
STAMP="$(date +%F)"
OUT="$BACKUP_DIR/dxb-$STAMP.dump"

mkdir -p "$BACKUP_DIR"
umask 077

docker compose -f /opt/dxb/vps/compose.yaml --profile core exec -T db \
  pg_dump -U postgres -d postgres -Fc > "$OUT"
test -s "$OUT" || { echo "BACKUP_FAIL empty dump"; exit 1; }

if [ -n "${BACKUP_DEST:-}" ]; then
  scp -q "$OUT" "$BACKUP_DEST/" && echo "OFFSITE_OK $STAMP"
else
  echo "OFFSITE_SKIP (BACKUP_DEST unset)"
fi

find "$BACKUP_DIR" -name 'dxb-*.dump' -mtime "+$RETENTION" -delete
echo "BACKUP_OK $OUT ($(stat -c%s "$OUT") bytes)"
