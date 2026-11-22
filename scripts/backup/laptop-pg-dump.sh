#!/usr/bin/env bash
# E13.0 / B72 — the nightly copy of the COMPANY's database, and the truth about it.
#
# One night's backup is a SET of three files with one stem, dxb-laptop-<date>
# (the contract: .planning/quick/20261122-b72-yedek/SET-CONTRACT.md):
#   .dump           pg_dump -Fc of the company, taken on an exported snapshot
#   .globals.sql    pg_dumpall --globals-only --no-role-passwords: the roles, and
#                   no password — a password comes back from the vault, never
#                   from a file that leaves the machine
#   .manifest.json  what the database held at the dump's own snapshot
#                   (scripts/backup/inventory.sql) and the sha256 of the other
#                   two. It is written last, and it is the set's proof.
# Three legs, each of which says what happened: the set is taken and proven in
# BACKUP_DIR; a copy goes to an off-site destination and is read back before it
# is called landed; and only when BOTH are proven in this run are the sets older
# than the retention pruned. The one transport written so far, scp, carries the
# .dump alone and its home is gone: the transport that replaces it must carry
# the three together (board row B72).
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
# A run works in a folder of its own (.dxb-backup-run.*), removed however the
# run ends, and the three files take their names only when all three are whole.
# One run at a time holds the folder's lock; a second call fails at once and
# touches nothing.
#
# The company is only READ: pg_dump, pg_dumpall and one read-only transaction.
# None of those tools' own error text reaches a log — it can quote a row — only
# a fixed reason and an exit code.
#
# Rebuilt the same night on the blind audit of 6c8f858d
# (.planning/quick/20261122-b72-yedek/SOL.md).
#
# Settings (environment; the unit reads them from ~/.config/dxb/backup.env):
#   BACKUP_DEST              where the off-site copy goes: <ssh host>:<directory>.
#                            Empty tonight — the Storage Box is gone and the new
#                            home is the CEO's choice (board row B72).
#   BACKUP_DIR               local sets (default ~/backups/dxb)
#   BACKUP_RETENTION_DAYS    sets of nights older than this are pruned (default 14)
#   BACKUP_DB_WAIT_SECONDS   how long to wait for the database at boot (default 300)
#
# Log grammar, one line per event, <date> = the run's day. Every line goes to
# stdout (the journal, under the unit) and is appended to BACKUP_DIR/backup.log
# by this script itself, once the folder is there:
#   BACKUP_WAIT <date> database accepted connections after <n>s
#   BACKUP_OK <date> <n> bytes        | BACKUP_FAIL <date> <reason>
#   OFFSITE_OK <date>                 | OFFSITE_FAIL <date> <reason>
#   PRUNE_FAIL <date>                 (an old set could not be removed)
#   BACKUP_RUN <date> invocation=<systemd's INVOCATION_ID|manual> local=<ok|fail> offsite=<ok|fail|unset> prune=<ok|fail|skipped> bytes=<n> exit=<n>
# BACKUP_RUN is the last line of every run that ends by its own hand.
#
# Run by dxb-backup.timer at 02:30 (scripts/systemd/, installed by
# scripts/backup/install-units.sh); a failed run raises
# scripts/backup/backup-alert.sh through the unit's OnFailure=.
set -euo pipefail
# `set -e` is a net and not the method: inside a function called from an `if` it
# stops nothing, so every step that can fail is checked where it stands.
trap '' PIPE # a session that died must fail the write to it, not kill the job

CONTAINER="supabase_db_DxB_Global_OS"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/dxb}"
BACKUP_DEST="${BACKUP_DEST:-}"
RETENTION="${BACKUP_RETENTION_DAYS:-14}"
DB_WAIT="${BACKUP_DB_WAIT_SECONDS:-300}"
DB_POLL=5
ANSWER_WAIT=600
ANSWER_MARK="dxb-backup-answer-ends"
INVENTORY_SQL="$(dirname "${BASH_SOURCE[0]}")/inventory.sql"
STAMP="$(date +%F)"
STEM="dxb-laptop-$STAMP"
SET="$BACKUP_DIR/$STEM"
OUT="$SET.dump"
SET_PARTS=(dump globals.sql manifest.json) # the files of one night, in the order they take their names
LOG=""      # backup.log, once it is known to take a line
RUN_DIR=""  # this run's own working folder; nothing in it has a backup's name
READBACK="" # the off-site copy as read back, inside RUN_DIR

# A leg is `fail` until it is proven, so a run that dies anywhere reports the truth.
local_leg=fail
offsite_leg=fail
prune_leg=skipped
bytes=0
company_pid=""
company_exit=0
declare -A staged_sha=() # sha256 of each part as this run made it, by the part's name

say() {
  echo "$*" || true
  if [ -n "$LOG" ]; then echo "$*" >> "$LOG" || true; fi
}

refuse() { say "BACKUP_FAIL $STAMP $*"; }

end_run() {
  local status=$?
  company_close
  [ -z "$RUN_DIR" ] || rm -rf "$RUN_DIR" || true
  say "BACKUP_RUN $STAMP invocation=${INVOCATION_ID:-manual} local=$local_leg offsite=$offsite_leg prune=$prune_leg bytes=$bytes exit=$status"
}
trap end_run EXIT

# What a dead run left behind — its working folder, or the .partial and .readback
# names the job wrote under until 2026-11-22 — is nobody's after a day. Sweeping
# it decides nothing about the night.
sweep_dead_runs() {
  find "$BACKUP_DIR" -maxdepth 1 -mtime +0 \
    \( -name '.dxb-backup-run.*' -o -name 'dxb-laptop-*.dump.partial' -o -name 'dxb-laptop-*.dump.readback' \) \
    -exec rm -rf {} + 2>/dev/null || true
}

# The boot race: the timer catches up as soon as the user manager is there, which
# is before docker has started the company's container. One probe covers all of
# "docker is not up", "the container is not running" and "postgres is starting".
wait_for_database() {
  local waited=0
  until docker exec "$CONTAINER" pg_isready -q -U postgres -d postgres >/dev/null 2>&1; do
    if [ "$waited" -ge "$DB_WAIT" ]; then
      refuse "database not accepting connections after ${waited}s"
      return 1
    fi
    sleep "$DB_POLL"
    waited=$((waited + DB_POLL))
  done
  [ "$waited" -eq 0 ] || say "BACKUP_WAIT $STAMP database accepted connections after ${waited}s"
}

# The company is asked through ONE psql session that stays open, because the
# snapshot it exports lives only as long as its transaction: two pipes in the
# run's folder, psql between them. company_ask sends one request and prints its
# one line of answer; psql echoes the mark when the request is done, and a
# session that died answers with end-of-file instead — that is a failure, and
# company_close then leaves psql's exit code in company_exit.
company_open() {
  mkfifo "$RUN_DIR/ask" "$RUN_DIR/answer" 2>/dev/null || return 1
  docker exec -i "$CONTAINER" psql -U postgres -d postgres -AtqX -v ON_ERROR_STOP=1 \
    < "$RUN_DIR/ask" > "$RUN_DIR/answer" 2>/dev/null &
  local pid=$!
  exec {ask_fd}> "$RUN_DIR/ask" {answer_fd}< "$RUN_DIR/answer" || { kill "$pid" 2>/dev/null; return 1; }
  company_pid=$pid
}

company_ask() {
  local line answer="" answers=0
  printf '%s\n\\echo %s\n' "$1" "$ANSWER_MARK" >&"$ask_fd" 2>/dev/null || return 1
  while IFS= read -r -t "$ANSWER_WAIT" line <&"$answer_fd"; do
    if [ "$line" = "$ANSWER_MARK" ]; then
      [ "$answers" -eq 1 ] && [ -n "$answer" ] || return 1
      printf '%s\n' "$answer"
      return 0
    fi
    answer="$line"
    answers=$((answers + 1))
  done
  return 1
}

company_close() {
  [ -n "$company_pid" ] || return 0
  printf 'ROLLBACK;\n\\q\n' >&"$ask_fd" 2>/dev/null || true
  exec {ask_fd}>&- {answer_fd}<&-
  company_exit=0
  wait "$company_pid" || company_exit=$?
  company_pid=""
}

session_failed() {
  company_close
  refuse "$1 (psql exited $company_exit)"
}

sha256_of() {
  local sum
  sum="$(sha256sum 2>/dev/null < "$1")" || return 1
  printf '%s\n' "${sum%% *}"
}

# The counts and the dump see the same instant: the inventory is taken inside
# the read-only transaction that exported the snapshot, and pg_dump is given
# that snapshot while the transaction is still open (measured on the company
# 2026-11-22: pg_dump refuses the snapshot once its session has ended).
# Proven = pg_dump exited 0, the file is not empty, and pg_restore read the WHOLE
# archive back. `pg_restore --list` is not enough: measured 2026-11-22, it reads
# only the table of contents and passes a dump cut off at 20 of its 25 MB; the
# full read (`-f /dev/null`, 0.3 s) refuses that one and a corrupted byte. It is
# given no -d, so it connects to no database: it only reads its stdin.
dump_on_snapshot() {
  local snapshot status=0
  [ -r "$INVENTORY_SQL" ] || { refuse "inventory.sql is not beside the job"; return 1; }
  company_open || { refuse "no session with the company could be started"; return 1; }
  snapshot="$(company_ask "BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY; SELECT pg_export_snapshot();")" \
    || { session_failed "the snapshot could not be exported"; return 1; }
  taken_at="$(date -Iseconds)"
  server_version="$(company_ask "SELECT current_setting('server_version');")" \
    || { session_failed "the server's version could not be read"; return 1; }
  company_ask "$(< "$INVENTORY_SQL")" > "$RUN_DIR/inventory" \
    || { session_failed "the inventory could not be taken"; return 1; }
  jq -e '(.inventory | has("tables") and has("sequences") and has("large_objects") and has("extensions") and has("roles") and has("acl_sha256"))
         and (.excluded | type == "array")' "$RUN_DIR/inventory" >/dev/null 2>&1 \
    || { company_close; refuse "the inventory is not the document the manifest needs"; return 1; }
  docker exec "$CONTAINER" pg_dump -U postgres -d postgres -Fc --snapshot="$snapshot" > "$RUN_DIR/dump" 2>/dev/null || status=$?
  company_close
  [ "$status" -eq 0 ] || { refuse "pg_dump exited $status"; return 1; }
  [ -s "$RUN_DIR/dump" ] || { refuse "empty dump"; return 1; }
  docker exec -i "$CONTAINER" pg_restore -f /dev/null < "$RUN_DIR/dump" >/dev/null 2>&1 \
    || { refuse "dump is not a readable archive"; return 1; }
}

# The roles, their attributes and memberships — what a pg_dump does not carry. A
# file without pg_dumpall's closing line was cut short; one with a password in
# it breaks the contract. Either is refused.
dump_globals() {
  local status=0
  docker exec "$CONTAINER" pg_dumpall -U postgres --globals-only --no-role-passwords > "$RUN_DIR/globals.sql" 2>/dev/null || status=$?
  [ "$status" -eq 0 ] || { refuse "pg_dumpall exited $status"; return 1; }
  grep -q '^-- PostgreSQL database cluster dump complete$' "$RUN_DIR/globals.sql" || { refuse "the globals file is not complete"; return 1; }
  ! grep -q "PASSWORD '" "$RUN_DIR/globals.sql" || { refuse "the globals file carries a password"; return 1; }
}

write_manifest() {
  dump_bytes="$(stat -c%s "$RUN_DIR/dump" 2>/dev/null)" && staged_sha[dump]="$(sha256_of "$RUN_DIR/dump")" \
    && staged_sha[globals.sql]="$(sha256_of "$RUN_DIR/globals.sql")" || { refuse "the dump and the globals could not be measured"; return 1; }
  jq -n --arg stem "$STEM" --arg taken_at "$taken_at" --arg server_version "$server_version" --argjson dump_bytes "$dump_bytes" \
    --arg dump_sha256 "${staged_sha[dump]}" --arg globals_sha256 "${staged_sha[globals.sql]}" --slurpfile document "$RUN_DIR/inventory" \
    '{format: 1, $stem, $taken_at, $server_version, $dump_bytes, $dump_sha256, $globals_sha256,
      inventory: $document[0].inventory, excluded: $document[0].excluded}' > "$RUN_DIR/manifest.json" 2>/dev/null \
    && staged_sha[manifest.json]="$(sha256_of "$RUN_DIR/manifest.json")" || { refuse "the manifest could not be written"; return 1; }
}

# The three take their names in the contract's order, the manifest last, and the
# night is called good only when the files that NOW stand under those names hash
# as this run's own. Half a set is no set: once one name is taken and the rest
# cannot follow, all three names of tonight are withdrawn — a same-day earlier
# set is then gone with them, and every other night's is untouched.
publish_set() {
  local part placed=0
  for part in "${SET_PARTS[@]}"; do
    if ! mv -f "$RUN_DIR/$part" "$SET.$part"; then
      [ "$placed" -eq 0 ] || withdraw_set
      refuse "the set could not take its names"
      return 1
    fi
    placed=1
  done
  for part in "${SET_PARTS[@]}"; do
    if [ "$(sha256_of "$SET.$part")" != "${staged_sha[$part]}" ]; then
      withdraw_set
      refuse "what stands under tonight's names is not this run's set"
      return 1
    fi
  done
}

withdraw_set() {
  local part
  for part in "${SET_PARTS[@]}"; do rm -f "$SET.$part" || true; done
}

take_set() {
  dump_on_snapshot && dump_globals && write_manifest && publish_set || return 1
  bytes="$dump_bytes"
  say "BACKUP_OK $STAMP $bytes bytes"
}

# Called only when tonight's set is proven here AND its copy is proven off-site:
# on any other night the old sets may be all there is. A set's age is its night
# — the date in its name — so the files of one night always go together, and
# tonight's, the newest proven set, is never taken whatever the retention says.
prune_old_sets() {
  local oldest_kept part file night failed=0
  [[ "$RETENTION" =~ ^[0-9]+$ ]] || return 1
  oldest_kept="$(date -d "$STAMP 12:00 $RETENTION days ago" +%F 2>/dev/null)" || return 1
  for part in "${SET_PARTS[@]}"; do
    for file in "$BACKUP_DIR"/dxb-laptop-????-??-??."$part"; do
      [ -e "$file" ] || continue
      night="${file##*/dxb-laptop-}"
      night="${night%%.*}"
      [ "$night" != "$STAMP" ] && [[ "$night" < "$oldest_kept" ]] || continue
      rm -f -- "$file" 2>/dev/null || failed=1
    done
  done
  return "$failed"
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
  if [ "$offsite_leg" = ok ]; then say "OFFSITE_OK $STAMP"; else say "OFFSITE_FAIL $STAMP $reason"; fi
}

mkdir -p "$BACKUP_DIR" 2>/dev/null || { refuse "the backup folder cannot be made"; exit 1; }
umask 077
LOG="$BACKUP_DIR/backup.log"
{ : >> "$LOG"; } 2>/dev/null || LOG="" # the night's work does not wait on its log: the lines still reach stdout
exec {lock_fd}< "$BACKUP_DIR" || { refuse "the backup folder cannot be opened"; exit 1; }
flock -n "$lock_fd" || { refuse "another run holds the lock"; exit 1; }
sweep_dead_runs
RUN_DIR="$(mktemp -d "$BACKUP_DIR/.dxb-backup-run.XXXXXX" 2>/dev/null)" || { RUN_DIR=""; refuse "this run could not make its working folder"; exit 1; }
READBACK="$RUN_DIR/readback"

if wait_for_database && take_set; then local_leg=ok; fi
copy_offsite
if [ "$local_leg" = ok ] && [ "$offsite_leg" = ok ]; then
  # An old set that cannot be removed is said and fails the run; tonight's set stands either way.
  if prune_old_sets; then prune_leg=ok; else prune_leg=fail; say "PRUNE_FAIL $STAMP"; fi
fi
[ "$local_leg" = ok ] && [ "$offsite_leg" = ok ] && [ "$prune_leg" = ok ] || exit 1
