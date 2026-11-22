#!/usr/bin/env bash
# E13.0 / B72 — the nightly copy of the COMPANY's database, and the truth about it.
#
# Three legs, each of which says what happened: a custom-format pg_dump of the
# company engine into BACKUP_DIR, the pruning of old local copies, and a copy
# to an off-site destination that is read back before it is called landed.
#
# WHY IT WAS REWRITTEN, measured 2026-11-22. The line that shipped the copy was
# `scp … && echo OFFSITE_OK` under `set -e`: a failing left side of `&&` stops
# nothing, so the job exited 0 on every one of the 55 nights the copy did not
# land. And that morning the timer caught up 20 seconds after boot, pg_dump met
# `Connection refused`, and the redirect had already created the file — a 0-byte
# file under a backup's name. So: a dump is written under a name that is not a
# backup's and takes its name only once it is proven; a failed leg is a line in
# the log AND a non-zero exit; no destination is a failure, never a skip.
#
# Settings (environment; the unit reads them from ~/.config/dxb/backup.env):
#   BACKUP_DEST              where the off-site copy goes: <ssh host>:<directory>.
#                            Empty tonight — the Storage Box is gone and the new
#                            home is the CEO's choice (board row B72).
#   BACKUP_DIR               local copies (default ~/backups/dxb)
#   BACKUP_RETENTION_DAYS    local copies older than this are pruned (default 14)
#   BACKUP_DB_WAIT_SECONDS   how long to wait for the database at boot (default 300)
#
# Log grammar, one line per event, <date> = the run's day:
#   BACKUP_WAIT <date> database accepted connections after <n>s
#   BACKUP_OK <date> <n> bytes        | BACKUP_FAIL <date> <reason>
#   OFFSITE_OK <date>                 | OFFSITE_FAIL <date> <reason>
#   PRUNE_FAIL <date>                 (an old copy could not be removed)
#   BACKUP_RUN <date> local=<ok|fail> offsite=<ok|fail|unset> prune=<ok|fail|skipped> bytes=<n> exit=<n>
# BACKUP_RUN is the last line of every run, whatever ended it.
#
# Run by dxb-backup.timer at 02:30 (scripts/systemd/); a failed run raises
# scripts/backup/backup-alert.sh through the unit's OnFailure=.
set -euo pipefail

CONTAINER="supabase_db_DxB_Global_OS"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/dxb}"
BACKUP_DEST="${BACKUP_DEST:-}"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
DB_WAIT="${BACKUP_DB_WAIT_SECONDS:-300}"
DB_POLL=5
STAMP="$(date +%F)"
OUT="$BACKUP_DIR/dxb-laptop-$STAMP.dump"
# Neither name matches dxb-laptop-*.dump: what is not proven never looks like a backup.
PARTIAL="$OUT.partial"
READBACK="$OUT.readback"

# A leg is `fail` until it is proven, so a run that dies anywhere reports the truth.
local_leg=fail
offsite_leg=fail
prune_leg=skipped
bytes=0

mkdir -p "$BACKUP_DIR"
umask 077

say_run() {
  local status=$?
  rm -f "$PARTIAL" "$READBACK"
  echo "BACKUP_RUN $STAMP local=$local_leg offsite=$offsite_leg prune=$prune_leg bytes=$bytes exit=$status"
}
trap say_run EXIT

# The boot race: the timer catches up as soon as the user manager is there, which
# is before docker has started the company's container. One probe covers all of
# "docker is not up", "the container is not running" and "postgres is starting".
wait_for_database() {
  local waited=0
  until docker exec "$CONTAINER" pg_isready -q -U postgres -d postgres >/dev/null 2>&1; do
    if [ "$waited" -ge "$DB_WAIT" ]; then
      echo "BACKUP_FAIL $STAMP database not accepting connections after ${waited}s"
      return 1
    fi
    sleep "$DB_POLL"
    waited=$((waited + DB_POLL))
  done
  [ "$waited" -eq 0 ] || echo "BACKUP_WAIT $STAMP database accepted connections after ${waited}s"
}

# Proven = pg_dump exited 0, the file is not empty, and pg_restore read the WHOLE
# archive back. `pg_restore --list` is not enough: measured 2026-11-22, it reads
# only the table of contents and passes a dump cut off at 20 of its 25 MB; the
# full read (`-f /dev/null`, 0.3 s) refuses that one and a corrupted byte. It is
# given no -d, so it connects to no database: it only reads its stdin.
dump_and_prove() {
  docker exec "$CONTAINER" pg_dump -U postgres -d postgres -Fc > "$PARTIAL" \
    || { echo "BACKUP_FAIL $STAMP pg_dump exited $?"; return 1; }
  [ -s "$PARTIAL" ] || { echo "BACKUP_FAIL $STAMP empty dump"; return 1; }
  docker exec -i "$CONTAINER" pg_restore -f /dev/null < "$PARTIAL" \
    || { echo "BACKUP_FAIL $STAMP dump is not a readable archive"; return 1; }
  mv -f "$PARTIAL" "$OUT"
  bytes="$(stat -c%s "$OUT")"
  echo "BACKUP_OK $STAMP $bytes bytes"
}

# Called only after tonight's dump is proven, and it never takes tonight's: the
# newest good copy outlives any retention. On a failed night nothing is pruned —
# the old copies are then all there is.
prune_old_dumps() {
  find "$BACKUP_DIR" -maxdepth 1 \( -name "dxb-laptop-*.dump" -o -name "dxb-laptop-*.dump.partial" \) \
    ! -name "${OUT##*/}" -mtime "+$RETENTION" -delete
}

# One function per KIND of destination: it copies $OUT there and proves the copy
# landed, or prints the reason and returns non-zero. A new kind is a new function
# and one more arm in copy_offsite. The scp kind proves by reading the copy back
# and comparing every byte — it asks nothing of the far side but scp itself.
offsite_by_scp() {
  local remote="$BACKUP_DEST/${OUT##*/}" scp_opts=(-q -o BatchMode=yes -o ConnectTimeout=30)
  scp "${scp_opts[@]}" "$OUT" "$remote" >&2 || { echo "scp to $BACKUP_DEST failed"; return 1; }
  scp "${scp_opts[@]}" "$remote" "$READBACK" >&2 || { echo "the copy could not be read back from $BACKUP_DEST"; return 1; }
  cmp -s "$OUT" "$READBACK" || { echo "the copy read back from $BACKUP_DEST is not the dump"; return 1; }
}

copy_offsite() {
  local reason
  if [ -z "$BACKUP_DEST" ]; then
    offsite_leg=unset
    reason="no destination set (BACKUP_DEST)"
  elif [ "$local_leg" != ok ]; then
    reason="no dump of tonight to copy"
  else
    case "$BACKUP_DEST" in
      *:*) reason="$(offsite_by_scp)" && offsite_leg=ok ;;
      *)   reason="no known kind of destination: $BACKUP_DEST" ;;
    esac
  fi
  if [ "$offsite_leg" = ok ]; then echo "OFFSITE_OK $STAMP"; else echo "OFFSITE_FAIL $STAMP $reason"; fi
}

if wait_for_database && dump_and_prove; then
  local_leg=ok
  # A copy that cannot be pruned is said and fails the run, but does not keep tonight's dump on this desk.
  if prune_old_dumps; then prune_leg=ok; else prune_leg=fail; echo "PRUNE_FAIL $STAMP"; fi
fi
copy_offsite
[ "$local_leg" = ok ] && [ "$offsite_leg" = ok ] && [ "$prune_leg" = ok ]
