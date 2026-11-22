#!/usr/bin/env bash
# B72 — the restore drill: a nightly dump is a backup only once it has been
# restored. This replays one dump into a throwaway Postgres that it creates
# itself and removes itself, and says what came back.
#
#   scripts/backup/restore-drill.sh [--require-equal] [dump]
#   dump defaults to the newest non-empty dxb-laptop-*.dump in BACKUP_DIR.
#
# WHAT "RESTORED" MEANS HERE — all of it, or RESTORE_DRILL_FAIL:
#   1. pg_restore exits 0 and prints not one error. Nothing is ignored. An error
#      is reported as its kind and a count (RESTORE_ERRORS), never as its text.
#   2. Every table in the dump's own table of contents stands in the restored
#      database.
#   3. Every table is counted row by row; the last line carries the totals for
#      the dump's tables.
#   4. The same count is read from the company (SELECT only, in a read-only
#      session) and every difference is printed, table by table. A difference
#      is information — the company moves on after a dump — unless the caller
#      knows it has stood still since and says --require-equal.
#
# WHAT IT LEAVES BEHIND — nothing, or it says so. The container and the working
# directory are removed however the drill ends (a signal too), each on its own,
# and then looked for. RESTORE_DRILL_OK is the last line only when both are
# gone. A good restore with something left ends RESTORE_DRILL_LEFTOVER <what>
# and a non-zero exit. A drill killed outright (kill -9) removes nothing: the
# next run finds its container by the label every drill carries and refuses to
# start until it is gone.
#
# THE INVOCATION, measured 2026-11-22 on supabase/postgres 17.6.1.140: the whole
# dump, every schema, as the image's superuser, with --clean --if-exists. The
# image builds its own auth / realtime / storage / vault at their first shape;
# replayed on top of that without --clean the dump's auth tables collide with
# them (59 errors) and auth.users — the CEO's login — is silently lost. With
# --clean the dump's objects replace the image's: 0 errors, exit 0, every table
# of the dump there, counts equal to the company's (223 tables, 331,379 rows on
# the dump of 2026-11-22). A pg_dump carries no roles, so the role NAMES the
# company has and the image lacks are created first, without login or password,
# and listed (ROLES_ADDED). The container is given no password either: with
# trust on its local socket the image comes up healthy in 12 s with the same
# roles, relations and extensions, and `docker inspect` then holds no secret.
#
# THE WALL. --clean drops what it replaces: aimed at the company's database it
# would end it. The drill restores only into the container whose ID its own
# `docker create` returned, and only after own_container has proven that ID.
set -euo pipefail
export LC_ALL=C # one collation for sort and comm

COMPANY="supabase_db_DxB_Global_OS"
PROTECTED=("$COMPANY" "supabase_db_DxB_Build")
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/dxb}"
HEALTHY_WAIT=180
DRILL_NAME="dxb-restore-drill-$(date +%Y%m%d-%H%M%S)-$$"
# Every drill container carries this label; its value is a token only this run knows.
DRILL_LABEL="dxb.restore-drill"
RUN_TOKEN="$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')"
DRILL_ID=""
verdict_said=0
ok_line="" # the success line once the restore has earned it — owed, and said only by finish
WORK="$(mktemp -d "${TMPDIR:-/tmp}/dxb-restore-drill.XXXXXXXX")" # mode 700; everything the run writes is in here

require_equal=0
if [ "${1:-}" = "--require-equal" ]; then require_equal=1; shift; fi
DUMP="${1:-}"
[ -n "$DUMP" ] || DUMP="$(find "$BACKUP_DIR" -maxdepth 1 -name 'dxb-laptop-*.dump' -size +0 2>/dev/null | sort | tail -n 1 || true)"

fail() { verdict_said=1; echo "RESTORE_DRILL_FAIL $*"; exit 1; }

# The containers this run created, by full ID — asked of docker by the label, not remembered: one that exists is
# known here even when `docker create` was stopped before it handed its ID back.
labelled_ids() { docker ps -aq --no-trunc --filter "label=$DRILL_LABEL=$RUN_TOKEN" 2>/dev/null; }

# The one way out, however the drill ends. The two removals are independent — neither's failure skips the other —
# and neither is believed: what is left is looked for afterwards, and only when nothing is does the OK line follow.
finish() {
  local status=$? id ids left=() what
  set +e
  trap '' HUP INT TERM # a second signal must not stop the removal half-way
  [ "$verdict_said" -eq 1 ] || echo "RESTORE_DRILL_FAIL stopped before its verdict (exit $status)"
  rm -rf "$WORK" 2>/dev/null
  for id in $(labelled_ids); do
    own_container "$id" && docker rm -f -v "$id" >/dev/null 2>&1
  done
  [ ! -e "$WORK" ] || left+=("the working directory $WORK")
  if ! ids="$(labelled_ids)"; then left+=("a container, perhaps: docker did not answer")
  elif [ -n "$ids" ]; then left+=("the container ${ids//$'\n'/ }")
  elif docker inspect "$DRILL_NAME" >/dev/null 2>&1; then left+=("the container $DRILL_NAME"); fi
  if [ "${#left[@]}" -gt 0 ]; then
    printf -v what '%s; ' "${left[@]}"
    echo "RESTORE_DRILL_LEFTOVER ${what%; }"
    exit 1
  fi
  # The line is said when the drill reached its own end (it is owed) and nothing stopped it after (status 0).
  if [ "$status" -eq 0 ] && [ -n "$ok_line" ]; then echo "$ok_line"; exit 0; fi
  [ "$status" -ne 0 ] || status=1 # bash hands an untrapped fatal signal to this trap as status 0
  exit "$status"
}
trap finish EXIT
# Trapped, a signal waits for the docker command in flight and then ends the drill through finish: nothing this
# run started is still running when the removal is verified.
trap 'fail "stopped by a signal"' HUP INT TERM

# An ID is this run's own when it is a full container ID, docker resolves it to the name this run made up AND to
# the label token only this run knows, and it is the ID of neither protected container.
own_container() {
  local id="$1" protected
  [[ "$id" =~ ^[0-9a-f]{64}$ ]] || return 1
  [ "$(docker inspect -f "{{.Name}} {{index .Config.Labels \"$DRILL_LABEL\"}}" "$id" 2>/dev/null)" = "/$DRILL_NAME $RUN_TOKEN" ] || return 1
  for protected in "${PROTECTED[@]}"; do
    [ "$(docker inspect -f '{{.Id}}' "$protected" 2>/dev/null)" != "$id" ] || return 1
  done
}
require_own_container() {
  own_container "$DRILL_ID" || fail "refused: '$DRILL_ID' is not this drill's own container ($DRILL_NAME)"
}

# The two doors. `drill` is the only way anything is run in a container this
# script writes to; `company_select` is the only way the company is asked.
drill() {
  require_own_container
  docker exec -i "$DRILL_ID" "$@"
}
drill_sql() { drill psql -U supabase_admin -d postgres -AtX -v ON_ERROR_STOP=1 "$@"; }
company_select() {
  docker exec -e PGOPTIONS="-c default_transaction_read_only=on" "$COMPANY" \
    psql -U postgres -d postgres -AtX -v ON_ERROR_STOP=1 -c "$1"
}

ROLE_NAMES="select quote_ident(rolname) from pg_roles where rolname !~ '^pg_'"
# FROM ONLY: a partitioned parent counts 0 and each partition its own, so no row is counted twice.
ROW_COUNTS="select n.nspname || '.' || c.relname || '|' ||
  (xpath('/row/n/text()', query_to_xml(format('select count(*) as n from only %I.%I', n.nspname, c.relname), false, true, '')))[1]::text
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where c.relkind in ('r', 'p') and n.nspname !~ '^pg_' and n.nspname <> 'information_schema'"

# pg_restore's stderr in, one "kind=count" line per kind out: fixed words and digits. The text itself is neither
# printed nor stored — an error line can carry a value from a row of the company's data. The kinds are a closed
# list of message shapes; a shape nobody listed is `other`.
error_kinds() {
  awk '
    !/^pg_restore: error:/ { next }
    /^pg_restore: error: COPY failed/ { kind = "copy_failed" }
    /^pg_restore: error: (input file|could not (open|read)|unsupported version|unexpected end)/ { kind = "archive_unreadable" }
    /^pg_restore: error: connection|server closed the connection|terminating connection/ { kind = "connection_lost" }
    kind == "" && / already exists$/ { kind = "already_exists" }
    kind == "" && / does not exist$/ { kind = "does_not_exist" }
    kind == "" && /ERROR:  (permission denied|must be )/ { kind = "permission_denied" }
    kind == "" && / depend on it$/ { kind = "dependency" }
    kind == "" && /violates .*constraint/ { kind = "constraint_violated" }
    { count[kind == "" ? "other" : kind]++; kind = "" }
    END { for (kind in count) print kind "=" count[kind] }' | sort
}

[ -s "$DUMP" ] || fail "no dump to restore: ${DUMP:-none in $BACKUP_DIR}"
# A container of an earlier drill holds a copy of the company's data — a drill still running, or one killed before
# it could clean up. This run removes only what it created, so it does not start beside one: it says so and stops.
earlier="$(docker ps -a --filter "label=$DRILL_LABEL" --format '{{.Names}}' | tr '\n' ' ')" \
  || fail "cannot ask docker for the containers of earlier drills"
[ -z "$earlier" ] || fail "refused: a container of an earlier drill exists (${earlier% }): still running, or killed before it cleaned up"
image="$(docker inspect -f '{{.Config.Image}}' "$COMPANY")" || fail "cannot read the company container's image"

# No published port and no network: the copy of the company inside it can be reached by `docker exec` alone.
# No password: trust on the local socket, which is all that leads in. Created first and started second, so that a
# container whose start fails is already one this run has proven its own.
DRILL_ID="$(docker create --name "$DRILL_NAME" --label "$DRILL_LABEL=$RUN_TOKEN" --network none \
  -e POSTGRES_HOST_AUTH_METHOD=trust "$image")" || fail "docker create failed"
require_own_container
docker start "$DRILL_ID" >/dev/null || fail "docker start failed"

# The image's own health check, not pg_isready: its first start runs a temporary server that answers on the
# socket before the platform schemas exist.
waited=0
until [ "$(docker inspect -f '{{.State.Health.Status}}' "$DRILL_ID")" = healthy ]; do
  [ "$waited" -lt "$HEALTHY_WAIT" ] || fail "the throwaway container was not healthy after ${waited}s"
  sleep 2
  waited=$((waited + 2))
done

company_select "$ROLE_NAMES" | sort > "$WORK/roles.company"
drill_sql -c "$ROLE_NAMES" < /dev/null | sort > "$WORK/roles.drill"
comm -23 "$WORK/roles.company" "$WORK/roles.drill" > "$WORK/roles.missing"
sed 's/.*/create role & nologin;/' "$WORK/roles.missing" | drill_sql -q
added="$(tr '\n' ' ' < "$WORK/roles.missing")"
echo "ROLES_ADDED ${added:-none }(a pg_dump carries no roles: names only, no login, no password)"

require_own_container # said here in the open: inside the pipeline below, drill's own refusal would go to /dev/null
restore_exit=0
drill pg_restore -U supabase_admin -d postgres --clean --if-exists < "$DUMP" 2>&1 >/dev/null | error_kinds > "$WORK/restore.kinds" \
  || restore_exit=$?
errors="$(awk -F= '{ sum += $2 } END { print sum + 0 }' "$WORK/restore.kinds")"
if [ "$restore_exit" -ne 0 ] || [ "$errors" -ne 0 ]; then
  [ "$errors" -eq 0 ] || echo "RESTORE_ERRORS $(paste -sd' ' "$WORK/restore.kinds")"
  fail "pg_restore exited $restore_exit with $errors errors — none is ignored"
fi
echo "RESTORED every schema of the dump with pg_restore --clean --if-exists: exit 0, 0 errors, nothing ignored"

drill pg_restore --list < "$DUMP" | awk 'NF == 7 && $4 == "TABLE" { print $5 "." $6 }' | sort > "$WORK/tables.dump"
drill_sql -c "$ROW_COUNTS" < /dev/null | sort > "$WORK/counts.drill"
company_select "$ROW_COUNTS" | sort > "$WORK/counts.company"

tables="$(wc -l < "$WORK/tables.dump")"
[ "$tables" -gt 0 ] || fail "the dump's table of contents lists no table"
missing="$(cut -d'|' -f1 "$WORK/counts.drill" | sort | comm -23 "$WORK/tables.dump" - | tr '\n' ' ')"
[ -z "$missing" ] || fail "$(wc -w <<< "$missing") of the dump's $tables tables missing after restore: ${missing% }"
rows="$(awk -F'|' 'NR == FNR { in_dump[$1]; next } $1 in in_dump { sum += $2 } END { print sum + 0 }' "$WORK/tables.dump" "$WORK/counts.drill")"

awk -F'|' '
  NR == FNR { dump[$1] = $2; next }
  { company[$1] = $2 }
  END {
    for (t in dump) if (!(t in company)) print "DIFF", t, "dump=" dump[t], "company=absent"
                    else if (dump[t] != company[t]) print "DIFF", t, "dump=" dump[t], "company=" company[t]
    for (t in company) if (!(t in dump)) print "DIFF", t, "dump=absent", "company=" company[t]
  }' "$WORK/counts.drill" "$WORK/counts.company" | sort > "$WORK/diff"
cat "$WORK/diff"
differ="$(wc -l < "$WORK/diff")"
compared="$(cut -d'|' -f1 "$WORK/counts.drill" "$WORK/counts.company" | sort -u | wc -l)"
echo "COMPARED $compared tables with the company: $differ differ"
if [ "$require_equal" -eq 1 ] && [ "$differ" -ne 0 ]; then
  fail "$differ tables differ from the company (--require-equal)"
fi

verdict_said=1
ok_line="RESTORE_DRILL_OK $DUMP $tables tables $rows rows"
