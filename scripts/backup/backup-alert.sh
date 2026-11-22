#!/usr/bin/env bash
# B72 — "the job fails LOUDLY": a failed nightly backup is said on the desktop,
# so nobody has to open ~/backups/dxb/backup.log to learn of it. Started by
# dxb-backup.service's OnFailure= (scripts/systemd/dxb-backup-alert.service).
#
# It names the leg that failed from the last line of the run that STARTED it:
# systemd hands an OnFailure= unit the failed run's id (MONITOR_INVOCATION_ID),
# and the job writes that id into its BACKUP_RUN line (the grammar is in
# laptop-pg-dump.sh). When the log holds no such line — the run was cut off, or
# the log could not be written — it says so, with how systemd saw the run end
# (MONITOR_SERVICE_RESULT, e.g. timeout). It never reads another run's line as
# this one's, and it does not need the log to exist. The notification is
# critical, which GNOME keeps on the screen until it is dismissed. A run can
# fail minutes after boot, before the desktop is there to be told — so it keeps
# trying for a bounded time and fails itself if nobody ever listened (then
# `systemctl --user --failed` shows both units).
#
# The desktop is the only place it speaks. The CEO's phone waits for the one
# approval inbox (board row B32); no phone path is built here.
set -euo pipefail

LOG="${BACKUP_DIR:-$HOME/backups/dxb}/backup.log"
INVOCATION="${MONITOR_INVOCATION_ID:-}"
WAIT=600
RETRY=15

this_run=""
if [ -n "$INVOCATION" ]; then
  this_run="$(grep -F -- " invocation=$INVOCATION " "$LOG" 2>/dev/null | grep '^BACKUP_RUN ' | tail -n 1 || true)"
fi
failed=()
case "$this_run" in *" local=fail "*) failed+=("yerel döküm alınamadı") ;; esac
case "$this_run" in
  *" offsite=fail "*)  failed+=("şirket dışı kopya yerine ulaşmadı") ;;
  *" offsite=unset "*) failed+=("şirket dışı kopyanın gideceği hedef tanımlı değil") ;;
esac
case "$this_run" in *" prune=fail "*) failed+=("eski kopyalar silinemedi") ;; esac

if [ ${#failed[@]} -gt 0 ]; then
  day="$(cut -d' ' -f2 <<< "$this_run")"
  printf -v legs '%s; ' "${failed[@]}"
  body="$day: ${legs%; }."
else
  body="Koşu kayda son satırını yazmadan bitti (systemd sonucu: ${MONITOR_SERVICE_RESULT:-bilinmiyor})."
fi

waited=0
until notify-send -u critical -a "DXB yedek" "Şirket yedeği BAŞARISIZ" "$body Kayıt: $LOG"; do
  [ "$waited" -lt "$WAIT" ] || { echo "BACKUP_ALERT_FAIL no desktop took the notification after ${waited}s: $body"; exit 1; }
  sleep "$RETRY"
  waited=$((waited + RETRY))
done
