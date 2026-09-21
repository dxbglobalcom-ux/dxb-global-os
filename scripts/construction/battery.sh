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
BENCH_URL="${DXB_CONSTRUCTION_URL:-postgresql://postgres:postgres@127.0.0.1:54422/postgres}"
bench_counts() {
  local q
  q=$(psql -tA "$BENCH_URL" -c "SELECT string_agg(format('SELECT %L AS t, count(*)::bigint AS n FROM public.%I', tablename, tablename), ' UNION ALL ') FROM pg_tables WHERE schemaname='public';" 2>/dev/null) || return 1
  [ -z "$q" ] && return 1
  psql -tA -F'|' "$BENCH_URL" -c "SELECT t, n FROM ($q) s ORDER BY 1;" 2>/dev/null
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
residue=0
if [ -n "$BEFORE_ROWS" ]; then
  AFTER_ROWS="$(PGPASSWORD=postgres bench_counts || true)"
  if [ -z "$AFTER_ROWS" ]; then
    echo "⚠ UNVERIFIED — the bench could not be re-counted; residue unknown for this run"
  else
    grew=$(join -t'|' <(echo "$BEFORE_ROWS") <(echo "$AFTER_ROWS") \
           | awk -F'|' '$3 > $2 {printf "    %-30s %s -> %s  (+%d)\n", $1, $2, $3, $3-$2}')
    if [ -n "$grew" ]; then
      echo "    a suite left rows in the construction engine — it must sweep what it writes:"
      echo "$grew"
      residue=1
    else
      echo "    every table is the size it was — no suite left a row behind"
    fi
  fi
fi

echo
echo "sandboxed suite : exit $sandboxed"
echo "host suite      : exit $host"
echo "bench residue   : $([ "$residue" -eq 0 ] && echo none || echo LEFT_BEHIND)"
if [ "$sandboxed" -ne 0 ] || [ "$host" -ne 0 ] || [ "$residue" -ne 0 ]; then
  echo "BATTERY_RED"
  exit 1
fi
echo "BATTERY_GREEN"
