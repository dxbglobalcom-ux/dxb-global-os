#!/usr/bin/env bash
# B72 — the restore drill: a night's backup is a backup only once it has been
# restored. This replays one night's SET into a throwaway Postgres that it
# creates itself and removes itself, from the set alone, and says whether what
# came back is what the night held.
#
#   scripts/backup/restore-drill.sh [set]
#   set is a stem (dxb-laptop-<date>; without a slash it is looked for in
#   BACKUP_DIR) or any one of the set's three files. With nothing named it is
#   TODAY's set, and a day that has none is a failure: an older night is never
#   taken in its place.
#
# A set is three files with one stem (the contract:
# .planning/quick/20261122-b72-yedek/SET-CONTRACT.md): .dump, .globals.sql and
# .manifest.json — what the database held at the dump's own snapshot, as
# scripts/backup/inventory.sql counted it, and the sha256 of the other two.
#
# WHAT "RESTORED" MEANS HERE — all of it, or RESTORE_DRILL_FAIL:
#   1. The set is PROVEN before anything is created: its manifest parses, is of
#      format 1, and names the sha256 of the dump and of the globals as they
#      stand.
#   2. The roles come from the set's own globals file. Nothing but "this role
#      already exists" is tolerated — the image brings some of them — and the
#      statements after it give that role the set's attributes and memberships.
#   3. pg_restore exits 0 and prints not one error. Nothing is ignored.
#   4. The inventory of the restored copy, taken with the same inventory.sql,
#      EQUALS the manifest's, part by part and name by name. One exception, and
#      it is the manifest's: a sequence is not transactional, so the dump may
#      carry a later value than the manifest — a sequence passes when it is not
#      BEHIND. Every difference is printed by name with both values (DIFF); one
#      difference is a failure. Names and counts are printed, never a row.
# No tool's own error text is printed or kept — it can quote a row. An error is
# its kind and a count (GLOBALS_ERRORS, RESTORE_ERRORS), or a fixed reason and
# an exit code.
#
# WHAT IT ASKS THE LIVING COMPANY — the name of its image, of docker, and
# nothing else: not one query. (docker is also asked for the IDs of the two
# protected containers, to stay away from them.)
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
# --clean the dump's objects replace the image's: 0 errors, exit 0. The
# container is given no password: with trust on its local socket the image
# comes up healthy in 12 s, and `docker inspect` then holds no secret.
#
# BEFORE THE RESTORE the image's own default privileges are removed, every one.
# The image grants anon, authenticated and service_role everything on whatever
# is created in public; a dump writes an object's privileges only as they differ
# from the owner's default, and --clean does not drop default privileges. Left
# in place they open every restored object: measured, the set of 2026-11-22
# came back with 1,440 privileges the company does not grant — anon could read
# and write 96 relations of public. Removed first, the dump's own default
# privileges are the only ones, and the privileges come back equal.
#
# THE WALL. --clean drops what it replaces: aimed at the company's database it
# would end it. The drill restores only into the container whose ID its own
# `docker create` returned, and only after own_container has proven that ID.
#
# 2026-11-22: restores from the set alone and demands equality with its
# manifest — until then it compared with the living company and let it differ
# (the blind audit's finding 6, .planning/quick/20261122-b72-yedek/SOL.md).
set -euo pipefail
export LC_ALL=C # one collation for sort

COMPANY="supabase_db_DxB_Global_OS"
PROTECTED=("$COMPANY" "supabase_db_DxB_Build")
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/dxb}"
INVENTORY_SQL="$(dirname "${BASH_SOURCE[0]}")/inventory.sql"
SET_PARTS=(dump globals.sql manifest.json) # the files of one night's set
HEALTHY_WAIT=180
DRILL_NAME="dxb-restore-drill-$(date +%Y%m%d-%H%M%S)-$$"
# Every drill container carries this label; its value is a token only this run knows.
DRILL_LABEL="dxb.restore-drill"
RUN_TOKEN="$(od -An -N16 -tx1 /dev/urandom | tr -d ' \n')"
DRILL_ID=""
verdict_said=0
ok_line="" # the success line once the restore has earned it — owed, and said only by finish
WORK="$(mktemp -d "${TMPDIR:-/tmp}/dxb-restore-drill.XXXXXXXX")" # mode 700; everything the run writes is in here

# The set, by its stem: named by the stem or by any of its files, and today's when nothing is named.
if [ "$#" -eq 0 ]; then which_set="today's set"; else which_set="the set named"; fi
SET="${1:-dxb-laptop-$(date +%F)}"
for part in "${SET_PARTS[@]}"; do SET="${SET%."$part"}"; done
[[ "$SET" == */* ]] || SET="$BACKUP_DIR/$SET"

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

# The one door: nothing is run in a container this script writes to but through `drill`. Whoever sends drill's
# output away calls require_own_container in the open first — in a pipeline or a capture, drill's own refusal
# would go where the output goes.
drill() {
  require_own_container
  docker exec -i "$DRILL_ID" "$@"
}
DRILL_PSQL=(psql -U supabase_admin -d postgres -AtqX)
# One SQL script on stdin, its answer out; it stops at the first error, and what psql says of it goes nowhere.
drill_sql() { drill "${DRILL_PSQL[@]}" -v ON_ERROR_STOP=1 2>/dev/null; }

# A tool's stderr in, one "kind=count" line per kind out: fixed words and digits. The text itself is neither
# printed nor stored — an error line can carry a value from a row of the company's data. $1 is how an error line
# of that tool begins. The kinds are a closed list of message shapes; a shape nobody listed is `other`.
error_kinds() {
  awk -v error_line="$1" '
    $0 !~ error_line { next }
    /^pg_restore: error: COPY failed/ { kind = "copy_failed" }
    /^pg_restore: error: (input file|could not (open|read)|unsupported version|unexpected end)/ { kind = "archive_unreadable" }
    /^pg_restore: error: connection|server closed the connection|terminating connection/ { kind = "connection_lost" }
    kind == "" && /ERROR:  role ".*" already exists$/ { kind = "role_exists" }
    kind == "" && / already exists$/ { kind = "already_exists" }
    kind == "" && / does not exist$/ { kind = "does_not_exist" }
    kind == "" && /ERROR:  (permission denied|must be )/ { kind = "permission_denied" }
    kind == "" && / depend on it$/ { kind = "dependency" }
    kind == "" && /violates .*constraint/ { kind = "constraint_violated" }
    { count[kind == "" ? "other" : kind]++; kind = "" }
    END { for (kind in count) print kind "=" count[kind] }' | sort
}
# Runs one tool in the drill's container on what stdin holds, keeps the kinds of its errors in $WORK/<step>.kinds
# and returns the tool's own exit status: classified <step> <how an error line begins> <tool …>.
classified() {
  local step="$1" error_line="$2"
  shift 2
  require_own_container
  drill "$@" 2>&1 >/dev/null | error_kinds "$error_line" > "$WORK/$step.kinds"
}
# How many errors a step's kinds hold; the kind $2, when given, is not one.
errors_of() { awk -F= -v tolerated="${2:-}" '$1 != tolerated { sum += $2 } END { print sum + 0 }' "$WORK/$1.kinds"; }
kinds_of() { paste -sd' ' "$WORK/$1.kinds"; }
counted() { if [ "$1" -eq 1 ]; then echo "1 $2"; else echo "$1 $2s"; fi; }

sha256_of() {
  local sum
  sum="$(sha256sum 2>/dev/null < "$1")" || return 1
  printf '%s\n' "${sum%% *}"
}

# Whether a file is JSON with an inventory in it — the manifest's shape, and the shape of inventory.sql's answer.
holds_inventory() { jq -e '.inventory | type == "object"' "$1" >/dev/null 2>&1; }

# A set is proven when its three files are there, its manifest parses and is of format 1, and the dump and the
# globals hash as the manifest says. The manifest is read ONCE, into the working directory: what was proven is
# what the restored copy is compared with.
prove_set() {
  local part
  for part in "${SET_PARTS[@]}"; do
    [ -s "$SET.$part" ] || fail "$which_set is not there: $SET.$part is missing or empty"
  done
  cp "$SET.manifest.json" "$WORK/manifest.json" 2>/dev/null || fail "not a proven set: the manifest cannot be read"
  holds_inventory "$WORK/manifest.json" || fail "not a proven set: the manifest does not parse, or holds no inventory"
  [ "$(jq -r '.format' "$WORK/manifest.json" 2>/dev/null)" = 1 ] || fail "not a proven set: the manifest's format is not 1"
  for part in dump globals.sql; do
    [ "$(sha256_of "$SET.$part")" = "$(jq -r --arg key "${part%.sql}_sha256" '.[$key]' "$WORK/manifest.json" 2>/dev/null)" ] \
      || fail "not a proven set: $SET.$part is not the file the manifest names (${part%.sql}_sha256)"
  done
}

# Every default privilege of the instance, revoked from everyone it names; then how many are left. See the header.
CLEAR_DEFAULT_PRIVILEGES="SELECT format('ALTER DEFAULT PRIVILEGES FOR ROLE %I%s REVOKE ALL ON %s FROM %s', pg_get_userbyid(d.defaclrole),
         CASE WHEN n.oid IS NULL THEN '' ELSE format(' IN SCHEMA %I', n.nspname) END,
         CASE d.defaclobjtype WHEN 'r' THEN 'TABLES' WHEN 'S' THEN 'SEQUENCES' WHEN 'f' THEN 'FUNCTIONS' WHEN 'T' THEN 'TYPES' WHEN 'n' THEN 'SCHEMAS' END,
         string_agg(DISTINCT CASE WHEN x.grantee = 0 THEN 'PUBLIC' ELSE quote_ident(pg_get_userbyid(x.grantee)) END, ', '))
  FROM pg_default_acl d LEFT JOIN pg_namespace n ON n.oid = d.defaclnamespace, LATERAL aclexplode(d.defaclacl) x
  GROUP BY d.oid, d.defaclrole, n.oid, n.nspname, d.defaclobjtype
\gexec
SELECT count(*) FROM pg_default_acl;"

# The manifest's inventory and the restored copy's in, one DIFF line per difference out. A part that is an object
# on both sides is compared name by name, any other part as one value; no part is named here but the two a ruling
# is about. A sequence passes when it is not behind the manifest: a greater value, or the same value and not back
# from handed out to not yet.
INVENTORY_DIFF='
  def not_behind($was): .last_value > $was.last_value
    or (.last_value == $was.last_value and (.is_called or ($was.is_called | not)));
  def said($name): if has($name) then .[$name] | tojson else "absent" end;
  $manifest[0].inventory as $m | $restored[0].inventory as $r
  | ($m + $r | keys[]) as $part
  | if [$m[$part], $r[$part]] | all(type == "object") then
      $m[$part] as $was | $r[$part] as $is
      | ($was + $is | keys[]) as $name
      | select(([$was, $is] | all(has($name)))
               and (if $part == "sequences" then $is[$name] | not_behind($was[$name]) else $is[$name] == $was[$name] end) | not)
      | "DIFF \($part) \($name) manifest=\($was | said($name)) restored=\($is | said($name))"
    else
      select($m[$part] != $r[$part])
      | "DIFF \($part) manifest=\($m | said($part)) restored=\($r | said($part))"
        + (if $part == "acl_sha256" then " (the privileges differ)" else "" end)
    end'
# What the manifest holds of each part, for the line that says what was compared.
INVENTORY_SIZE='.inventory | "\(.tables | length) tables, \(.sequences | length) sequences, \(.extensions | length) extensions, \(.roles | length) roles"'

[ "$#" -le 1 ] || fail "one set at a time: a stem, or one of its three files"
prove_set
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

require_own_container
defaults_left="$(drill_sql <<< "$CLEAR_DEFAULT_PRIVILEGES")" || fail "the image's default privileges could not be cleared (psql exited $?)"
[ "$defaults_left" = 0 ] || fail "the image's default privileges could not be cleared: $defaults_left are left"

# psql goes on after an error and exits 0 (no ON_ERROR_STOP here): every statement of the file is tried, and the
# errors are judged by their kind afterwards. A role the image had already is not one; anything else is.
globals_exit=0
classified globals '^(ERROR|FATAL|PANIC|psql: error):' "${DRILL_PSQL[@]}" < "$SET.globals.sql" || globals_exit=$?
errors="$(errors_of globals role_exists)"
if [ "$globals_exit" -ne 0 ] || [ "$errors" -ne 0 ]; then
  [ ! -s "$WORK/globals.kinds" ] || echo "GLOBALS_ERRORS $(kinds_of globals)"
  fail "the set's globals: psql exited $globals_exit with $(counted "$errors" error) other than a role the image had already"
fi
echo "GLOBALS_APPLIED the set's own roles, attributes and memberships: $(counted "$(errors_of globals)" role) the image had already, nothing else refused"

restore_exit=0
classified restore '^pg_restore: error:' pg_restore -U supabase_admin -d postgres --clean --if-exists < "$SET.dump" || restore_exit=$?
errors="$(errors_of restore)"
if [ "$restore_exit" -ne 0 ] || [ "$errors" -ne 0 ]; then
  [ "$errors" -eq 0 ] || echo "RESTORE_ERRORS $(kinds_of restore)"
  fail "pg_restore exited $restore_exit with $errors errors — none is ignored"
fi
echo "RESTORED every schema of the dump with pg_restore --clean --if-exists: exit 0, 0 errors, nothing ignored"

require_own_container
drill_sql < "$INVENTORY_SQL" > "$WORK/inventory.restored" || fail "the inventory of the restored copy could not be taken (psql exited $?)"
holds_inventory "$WORK/inventory.restored" || fail "what the restored copy answered is not an inventory"
jq -rn --slurpfile manifest "$WORK/manifest.json" --slurpfile restored "$WORK/inventory.restored" "$INVENTORY_DIFF" > "$WORK/diff" 2>/dev/null \
  || fail "the restored copy's inventory could not be compared with the manifest's"
cat "$WORK/diff"
differ="$(wc -l < "$WORK/diff")"
echo "COMPARED $(jq -r "$INVENTORY_SIZE" "$WORK/manifest.json"), the large objects and the privileges with the manifest: $differ differ"
[ "$differ" -eq 0 ] || fail "$(counted "$differ" difference) between the restored copy and the manifest of ${SET##*/}"

ok_line="RESTORE_DRILL_OK $SET $(jq -r '.inventory.tables | "\(length) tables \(add // 0) rows"' "$WORK/inventory.restored")"
verdict_said=1
