#!/usr/bin/env bash
# E13.0 pagination/perf drill (roadmap E13.0: "100+/10k kayıt pagination/
# performans" — tatbikat raporu). Runs against an EPHEMERAL container only
# (db-suite idiom; the live DB is never volume-seeded). Flow:
#   1. pristine supabase-postgres container (2× ready wait — init restarts PG)
#   2. full chain via scripts/bootstrap-db.sh
#   3. synthetic volume: 10k tasks + 10k audit_log + 1k approvals
#   4. EXPLAIN ANALYZE the dashboard's REAL bounded queries (limits measured
#      in source: approvals 200/50, tasks 50, library 30/500) + the hot views
#   5. PASS gate: every measured query under THRESHOLD_MS
#   6. teardown (trap — also on failure)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
IMG="public.ecr.aws/supabase/postgres:17.6.1.140"
NAME="dxb_perfdrill_pg"
PORT="55434"
THRESHOLD_MS="250"

docker rm -f "$NAME" >/dev/null 2>&1 || true
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT

docker run -d --name "$NAME" -p "$PORT:5432" \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=postgres "$IMG" >/dev/null

# 2× "ready to accept connections" (R2.5 lesson: init restarts postgres once)
for i in $(seq 1 120); do
  n=$(docker logs "$NAME" 2>&1 | grep -c "ready to accept connections" || true)
  [ "$n" -ge 2 ] && break
  sleep 1
done
sleep 2

PSQL_C() { docker exec -i "$NAME" psql -U postgres -d postgres "$@"; }

echo "[perf-drill] pushing chain"
DXB_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:$PORT/postgres" \
DXB_PSQL="docker exec -i $NAME psql -U postgres -d postgres" \
DXB_PSQL_ADMIN="docker exec -i $NAME psql -U supabase_admin -d postgres" \
  bash "$REPO/scripts/bootstrap-db.sh" | tail -1

echo "[perf-drill] seeding 10k tasks / 10k audit / 1k approvals"
PSQL_C -v ON_ERROR_STOP=1 -q <<'SQL'
WITH depts AS (SELECT array_agg(slug) AS a FROM departments)
INSERT INTO tasks (department, objective, output_contract, model_tier,
                   approval_class, status, priority)
SELECT (SELECT a[1 + (g % array_length(a,1))] FROM depts),
       'perf-drill synthetic task #' || g,
       'synthetic output contract #' || g,
       (ARRAY['L1','L2','L3'])[1 + (g % 3)],
       'none',
       (ARRAY['done','done','done','queued','failed','review'])[1 + (g % 6)],
       g % 5
FROM generate_series(1, 10000) g;

INSERT INTO audit_log (actor, actor_type, action, payload)
SELECT 'perf-drill', 'system', 'perf.synthetic',
       jsonb_build_object('n', g)
FROM generate_series(1, 10000) g;

INSERT INTO approvals (task_id, action_type, payload, risk_class, status,
                       operation, operation_class, purpose)
SELECT t.id, 'perf.synthetic', jsonb_build_object('n', row_number() OVER ()),
       (ARRAY['low','high'])[1 + (row_number() OVER () % 2)],
       (ARRAY['pending','approved'])[1 + (row_number() OVER () % 2)],
       'perf.synthetic', 'other', 'perf drill row'
FROM (SELECT id FROM tasks WHERE objective LIKE 'perf-drill%' LIMIT 1000) t;
SQL

counts=$(PSQL_C -qtA -c "SELECT (SELECT count(*) FROM tasks)||'/'||(SELECT count(*) FROM audit_log)||'/'||(SELECT count(*) FROM approvals)")
echo "[perf-drill] volume: tasks/audit/approvals = $counts"

measure() { # name, sql
  local ms
  ms=$(PSQL_C -qtA -c "EXPLAIN (ANALYZE, FORMAT JSON) $2" \
    | docker exec -i "$NAME" sh -c "cat" \
    | tr -d '\n' | grep -o '"Execution Time": [0-9.]*' | head -1 | grep -o '[0-9.]*')
  printf "%-38s %8s ms" "$1" "$ms"
  if [ -z "$ms" ]; then echo "  FAIL (no measurement — query errored)"; return 1; fi
  awk -v ms="$ms" -v th="$THRESHOLD_MS" 'BEGIN { exit !(ms+0 < th+0) }' \
    && echo "  PASS" || { echo "  FAIL (>= ${THRESHOLD_MS}ms)"; return 1; }
}

echo "[perf-drill] measuring dashboard-real queries (threshold ${THRESHOLD_MS}ms)"
FAILS=0
measure "approvals center pending LIMIT 200" \
  "SELECT * FROM v_approvals_center WHERE status='pending' LIMIT 200" || FAILS=$((FAILS+1))
measure "approvals center decided LIMIT 50" \
  "SELECT * FROM v_approvals_center WHERE status<>'pending' LIMIT 50" || FAILS=$((FAILS+1))
measure "tasks list ORDER created_at LIMIT 50" \
  "SELECT * FROM tasks ORDER BY created_at DESC LIMIT 50" || FAILS=$((FAILS+1))
measure "tasks by dept+status LIMIT 50" \
  "SELECT * FROM tasks WHERE department=(SELECT slug FROM departments LIMIT 1) AND status='queued' ORDER BY priority DESC, created_at LIMIT 50" || FAILS=$((FAILS+1))
measure "audit feed LIMIT 100" \
  "SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100" || FAILS=$((FAILS+1))
measure "library list LIMIT 30" \
  "SELECT * FROM library_items ORDER BY updated_at DESC LIMIT 30" || FAILS=$((FAILS+1))
measure "equipment view full scan" \
  "SELECT count(*) FROM v_hr_equipment_check" || FAILS=$((FAILS+1))

if [ "$FAILS" -gt 0 ]; then
  echo "PERF DRILL FAIL ($FAILS queries over threshold)"; exit 1
fi
echo "PERF DRILL PASS (all queries < ${THRESHOLD_MS}ms at 10k/10k/1k volume)"
