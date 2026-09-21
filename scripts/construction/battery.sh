#!/usr/bin/env bash
# B36 · Block 3-bis — THE WHOLE BATTERY, and it says which half ran where.
#
# Two halves, both required, nothing hidden between them:
#
#   1. THE CONSTRUCTION RUNTIME — everything, inside the sandbox opened by
#      scripts/construction/run.sh: no network, no Docker socket, no credential,
#      and one unix socket to the company's read gateway.
#
#   2. THE AUTHOR'S HAND, on the company's side — the few files that must enter a
#      container or inspect this machine's own processes, and therefore cannot
#      run inside a sandbox built to take those away. They are named here, in
#      full, so that nothing can be moved out of the wall quietly.
set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO"

# ── ONE BATTERY AT A TIME ON ONE ENGINE ─────────────────────────────────────
# The bench is a single database, and a suite that measures "what is in the
# table" cannot be right while a second run is writing to the same table.
# Measured 2026-09-21 by the adversarial pass: two `construction:battery`
# processes overlapped on port 54422 and audit_log moved 59215 -> 59211 ->
# 59212 underneath the observer, and one run's teardown could have deleted the
# other's queued jobs. Suites defend themselves with markers and watermarks
# against each OTHER; nothing can defend a run against its own twin. So the
# battery refuses to start beside one, loudly, instead of producing a number
# that is not true. (`flock` is util-linux; if it is missing the battery runs
# as before and says so, because a missing lock must not stop the work.)
if command -v flock >/dev/null 2>&1; then
  exec 200>"${TMPDIR:-/tmp}/dxb-construction-battery.lock"
  if ! flock -n 200; then
    echo "REFUSED: another construction battery is already running against this engine."
    echo "         Two runs on one bench measure each other, not the code. Wait for it,"
    echo "         or point this one elsewhere with DXB_CONSTRUCTION_URL."
    exit 2
  fi
else
  echo "⚠ UNVERIFIED — flock is not installed, so a concurrent battery cannot be ruled out"
fi

HOST_FILES=(
  tests/b36/live-drills.host.test.ts   # enters the construction container: creates and drops roles
  tests/ops/freeze-guard.test.ts       # reads this machine's process tree and its systemd units
  tests/ops/dashboard-launcher.host.test.ts  # asks WHICH process is serving the CEO's dashboard
  # B46 — the research engine's own battery. Each case COPIES the engine out of .claude/skills
  # and runs the real scripts against stubbed binaries; inside the sandbox (uid 997) the copy
  # is refused and every case dies on `cp`. The engine is the author's side of the house, not
  # the construction site's, so these belong here beside the other host files.
  tests/b46/research-ruler.test.ts
  tests/b46/judge-is-one-metre.test.ts
  tests/b46/the-number-he-sees.test.ts
  tests/b46/the-crowd-is-read.test.ts
  tests/b46/no-green-on-a-failure.test.ts
  tests/b46/one-run-one-owner.test.ts
  tests/b46/a-hunter-cannot-write.test.ts
)

# ── THE BENCH'S OWN RULER (CEO 2026-09-21: "tezgah kendini temizlesin her zaman
# bu sorunlarla karşılaşmayalım temiz işle ilerleyelim").
#
# A suite that leaves rows behind poisons the next audit, and for months the
# only way to learn that was for a later run to go red for a reason that had
# nothing to do with the code under test — three files did exactly that on
# 2026-09-21, counting work another suite's scheduler had done. So the battery
# now measures itself: every table in the construction engine's public schema
# is counted before and after, and a table that GREW names itself and turns the
# battery red. pg-boss's own schema is excluded — it is the queue's bookkeeping,
# not the company's record.
#
# It measures the CONSTRUCTION engine and nothing else (port 54422).
#
# FOUR THINGS THE FIRST VERSION OF THIS RULER GOT WRONG, each one measured by
# the adversarial pass on the day it was written (2026-09-21):
#   · it compared with `>` and so was blind to SHRINKING — which is the very
#     fault that started this work, a suite deleting another suite's rows;
#   · it counted only the `public` schema, and `dxb_internal.ops_live_issued`
#     grew 0 -> 247 under it while it reported "no suite left a row behind";
#   · it used an inner join, so a table BORN or DROPPED during the run fell
#     silently out of the comparison;
#   · when it could not measure at all it still printed "residue: none" and
#     allowed BATTERY_GREEN — a ruler that cannot see must say so, not agree.
# WHAT IT COUNTS, and the list is deliberate. `public` and `dxb_internal` are
# the schemas this repository's own migrations build — the bench's record of
# the company. Everything else on the engine belongs to somebody else's
# machinery and churns on its own: `pgboss` is the queue's bookkeeping,
# `realtime` grew 642 rows in one run with no suite involved, and `auth`,
# `storage`, `net`, `vault` and the supabase_* schemas are the platform's.
BENCH_URL="${DXB_CONSTRUCTION_URL:-postgresql://postgres:postgres@127.0.0.1:54422/postgres}"
bench_counts() {
  local q
  q=$(psql -tA "$BENCH_URL" -c "SELECT string_agg(format('SELECT %L AS t, count(*)::bigint AS n FROM %I.%I', schemaname||'.'||tablename, schemaname, tablename), ' UNION ALL ') FROM pg_tables WHERE schemaname IN ('public','dxb_internal');" 2>/dev/null) || return 1
  [ -z "$q" ] && return 1
  # COLLATE "C" and LC_ALL=C below so the two lists are ordered by the same
  # rule; join needs that, and the server's collation is not the shell's.
  psql -tA -F'|' "$BENCH_URL" -c "SELECT t, n FROM ($q) s ORDER BY t COLLATE \"C\";" 2>/dev/null
}
BEFORE_ROWS="$(PGPASSWORD=postgres bench_counts || true)"
if [ -z "$BEFORE_ROWS" ]; then
  echo "⚠ UNVERIFIED — the bench ruler could not read $BENCH_URL; residue is NOT measured this run"
fi

echo "=== 1/2 · THE CONSTRUCTION RUNTIME — the sandboxed suite ==="
EXCLUDES=()
for f in "${HOST_FILES[@]}"; do EXCLUDES+=(--exclude "$f"); done
bash scripts/construction/run.sh pnpm vitest run "${EXCLUDES[@]}"
sandboxed=$?

echo
echo "=== 2/2 · THE AUTHOR'S HAND — on the company's side, outside the sandbox ==="
for f in "${HOST_FILES[@]}"; do echo "    $f"; done
pnpm vitest run "${HOST_FILES[@]}"
host=$?

echo
echo "=== THE BENCH'S OWN RULER — what this run left behind ==="
# 0 = measured and clean · 1 = measured and dirty · 2 = could not be measured
residue=2
if [ -n "$BEFORE_ROWS" ]; then
  AFTER_ROWS="$(PGPASSWORD=postgres bench_counts || true)"
  if [ -z "$AFTER_ROWS" ]; then
    echo "⚠ UNVERIFIED — the bench could not be re-counted; residue unknown for this run"
  else
    # -a1 -a2: a table that exists on only ONE side is reported too, never
    # dropped. The empty side reads as '-' and the line says so.
    moved=$(join -t'|' -a1 -a2 -e '-' -o '0,1.2,2.2' \
              <(LC_ALL=C sort -t'|' -k1,1 <<<"$BEFORE_ROWS") \
              <(LC_ALL=C sort -t'|' -k1,1 <<<"$AFTER_ROWS") \
            | awk -F'|' '$2 != $3 {
                 if ($2 == "-")      printf "    %-34s (absent) -> %s   table appeared\n", $1, $3;
                 else if ($3 == "-") printf "    %-34s %s -> (absent)   table vanished\n", $1, $2;
                 else                printf "    %-34s %s -> %s  (%+d)\n", $1, $2, $3, $3-$2;
               }')
    if [ -n "$moved" ]; then
      echo "    a suite changed the construction engine — it must leave what it found:"
      echo "$moved"
      residue=1
    else
      echo "    every table is the size it was — no suite left or took a row"
      residue=0
    fi
  fi
fi

echo
echo "sandboxed suite : exit $sandboxed"
echo "host suite      : exit $host"
case "$residue" in
  0) echo "bench residue   : none" ;;
  1) echo "bench residue   : LEFT_BEHIND" ;;
  *) echo "bench residue   : UNVERIFIED — not measured, so not green" ;;
esac
if [ "$sandboxed" -ne 0 ] || [ "$host" -ne 0 ] || [ "$residue" -ne 0 ]; then
  echo "BATTERY_RED"
  exit 1
fi
echo "BATTERY_GREEN"
