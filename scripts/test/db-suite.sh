#!/usr/bin/env bash
# L2 DB/Migration suite (TEST_STRATEGY §5-6 :38, §11-12 :58, §22-23 :89).
# Contract output: "PUSH OK / IDEMPOTENT OK / ASSERTS 7/7 / ROLLBACK BLOCKS n/n".
#
# Runs against an EPHEMERAL container — never the live DB (§4 rule). Flow:
#   1. pristine supabase-postgres container (2× "ready" wait — init restarts
#      postgres once; racing it yields OID errors, R2.5 lesson)
#   2. full chain push via scripts/bootstrap-db.sh          → PUSH OK
#   3. second push must apply 0                             → IDEMPOTENT OK
#   4. the seven BINDING core asserts (:58) as live SQL     → ASSERTS 7/7
#   5. rollback blocks: count declared `-- ROLLBACK:` files AND execute the
#      0021x settings_family block for real, per §23        → ROLLBACK BLOCKS
#   6. container teardown (trap — also on failure)
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../.." && pwd)"
IMG="public.ecr.aws/supabase/postgres:17.6.1.140"
NAME="dxb_dbsuite_pg"
PORT="55433"

docker rm -f "$NAME" >/dev/null 2>&1 || true
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT
docker run -d --name "$NAME" -e POSTGRES_PASSWORD=postgres -p "$PORT:5432" "$IMG" >/dev/null

# 2× ready (image init restarts the server once)
for i in $(seq 1 120); do
  n=$(docker logs "$NAME" 2>&1 | grep -c "ready to accept connections" || true)
  [ "$n" -ge 2 ] && break
  sleep 2
done
n=$(docker logs "$NAME" 2>&1 | grep -c "ready to accept connections" || true)
[ "$n" -ge 2 ] || { echo "DB SUITE FAIL: container never reached 2x ready"; exit 1; }

PSQL_C() { docker exec -i "$NAME" psql -U postgres -d postgres "$@"; }
export DXB_DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:$PORT/postgres"
export DXB_PSQL="docker exec -i $NAME psql -U postgres -d postgres"
# Platform-plane preamble runs as supabase_admin (owns the realtime schema on
# the supabase image; as plain postgres the preamble's realtime.messages
# block dies with permission denied → psql exit 3 — R2.5 plane-split rule).
export DXB_PSQL_ADMIN="docker exec -i $NAME psql -U supabase_admin -d postgres"

# --- 1. PUSH ---------------------------------------------------------------
out1=$(bash "$REPO/scripts/bootstrap-db.sh" 2>&1 | tail -3)
files=$(ls "$REPO"/db/migrations/*.sql | wc -l)
ledger=$(PSQL_C -qtA -c "SELECT count(*) FROM supabase_migrations.schema_migrations")
if [ "$ledger" != "$files" ]; then
  echo "DB SUITE FAIL: ledger $ledger != files $files"; echo "$out1"; exit 1
fi
echo "PUSH OK (applied chain: ledger $ledger = files $files)"

# --- 2. IDEMPOTENT re-push ---------------------------------------------------
out2=$(bash "$REPO/scripts/bootstrap-db.sh" 2>&1 | tail -3)
if ! echo "$out2" | grep -q "applied 0"; then
  echo "DB SUITE FAIL: second push not idempotent"; echo "$out2"; exit 1
fi
echo "IDEMPOTENT OK (second push applied 0)"

# --- 3. The seven binding asserts (:58) --------------------------------------
pass=0
expect_fail() { # name, expected-error-fragment, sql
  local name="$1" frag="$2" sql="$3" out
  if out=$(echo "$sql" | PSQL_C -v ON_ERROR_STOP=1 -qtA 2>&1); then
    echo "  ASSERT FAIL [$name]: statement SUCCEEDED (wall missing): $out"
  elif echo "$out" | grep -qi "$frag"; then
    echo "  assert ok [$name]"; pass=$((pass+1))
  else
    echo "  ASSERT FAIL [$name]: wrong error: $out"
  fi
}
expect_json() { # name, expected-fragment, sql (fn returns jsonb; error field)
  local name="$1" frag="$2" sql="$3" out
  out=$(echo "$sql" | PSQL_C -qtA 2>&1)
  if echo "$out" | grep -qi "$frag"; then
    echo "  assert ok [$name]"; pass=$((pass+1))
  else
    echo "  ASSERT FAIL [$name]: got: $out"
  fi
}

# (1) v2-less persona activation reject (org_family activation trigger)
expect_fail "activation-without-persona" "activation denied" "
  INSERT INTO agents (slug, department, role, persona_path)
  VALUES ('l2t-ghost', 'engineering', 'specialist', 'personas/l2t-ghost.md');
  UPDATE agents SET employment_status='active' WHERE slug='l2t-ghost';"

# (2) model fallback cycle reject (settings_family acyclic trigger)
expect_fail "fallback-self-cycle" "fallback cycle denied" "
  UPDATE model_catalog SET fallback_of = id WHERE id = (SELECT id FROM model_catalog LIMIT 1);"

# (3) append-only audit_log: app roles hold no UPDATE privilege (0022x + hardening)
expect_fail "audit-append-only" "permission denied" "
  SET ROLE authenticated;
  UPDATE audit_log SET action = action;"

# (4) task_dependencies cycle reject — self via CHECK (task_id <> depends_on),
# 2-cycle via the deep-cycle trigger; the trigger is the wall exercised here.
expect_fail "task-dependency-cycle" "cycle denied" "
  INSERT INTO tasks (department, objective, output_contract, model_tier)
  VALUES ('engineering','l2 dep fixture','n/a','L4'),
         ('engineering','l2 dep fixture b','n/a','L4');
  INSERT INTO task_dependencies (task_id, depends_on)
  SELECT a.id, b.id FROM tasks a, tasks b
   WHERE a.objective='l2 dep fixture' AND b.objective='l2 dep fixture b';
  INSERT INTO task_dependencies (task_id, depends_on)
  SELECT b.id, a.id FROM tasks a, tasks b
   WHERE a.objective='l2 dep fixture' AND b.objective='l2 dep fixture b';"

# (5) O1 money-out: no approval, no outbox — app roles cannot INSERT outbox
#     (grant wall) and a draft approval cannot be flipped straight to approved
#     (one-way transition trigger). Both walls asserted.
expect_fail "o1-outbox-grant-wall" "permission denied" "
  SET ROLE authenticated;
  INSERT INTO outbox (approval_id, idempotency_key)
  VALUES (gen_random_uuid(), 'l2t-o1');"
expect_fail "o1-draft-to-approved" "yasak" "
  INSERT INTO approvals (task_id, action_type, payload)
  SELECT id, 'payment', '{}'::jsonb FROM tasks WHERE objective='l2 dep fixture' LIMIT 1;
  UPDATE approvals SET status='approved'
   WHERE action_type='payment' AND status='draft';"

# (6) settings value_schema violation → VALIDATION_FAILED (control fn wall)
expect_json "settings-schema-violation" "VALIDATION_FAILED" "
  BEGIN;
  SELECT set_config('request.jwt.claims',
    '{\"sub\":\"11111111-1111-4111-8111-111111111111\",\"role\":\"authenticated\"}', true);
  SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
  SELECT control_settings_set('hook.enabled','global','\"not-a-bool\"'::jsonb,
    'l2t-schema-1', NULL, 'ui', 'L2 assert');
  ROLLBACK;"

# (7) idempotency mismatch: same key, different payload → IDEMPOTENCY_MISMATCH
expect_json "idempotency-mismatch" "IDEMPOTENCY_MISMATCH" "
  BEGIN;
  SELECT set_config('request.jwt.claims',
    '{\"sub\":\"11111111-1111-4111-8111-111111111111\",\"role\":\"authenticated\"}', true);
  SELECT set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
  SELECT control_settings_set('hook.enabled','global','true'::jsonb,
    'l2t-idem-1', NULL, 'ui', 'L2 assert');
  SELECT control_settings_set('hook.enabled','global','false'::jsonb,
    'l2t-idem-1', NULL, 'ui', 'L2 assert');
  ROLLBACK;"

# NOTE: assert (5) is one core item enforced by two walls → 8 green checks
# fold into the 7 binding core items.
if [ "$pass" -lt 8 ]; then
  echo "ASSERTS FAIL ($pass/8 checks green — 7 core items need all 8)"; exit 1
fi
echo "ASSERTS 7/7"

# --- 4. Rollback blocks -------------------------------------------------------
declared=$(grep -rln -- "-- ROLLBACK:" "$REPO"/db/migrations/*.sql | wc -l)
# Execute the 0021x settings_family block for real (§23: written-but-never-run
# rollback is the risk being tested). Ephemeral DB — divergence is fine, the
# container dies below.
sed -n '/^-- ROLLBACK:/,$p' "$REPO/db/migrations/20260711002100_settings_family.sql" \
  | sed '1d; s/^--   //; s/^--//' \
  | PSQL_C -v ON_ERROR_STOP=1 -q
# Prove the rollback actually removed the family surface:
gone=$(PSQL_C -qtA -c "SELECT count(*) FROM information_schema.tables WHERE table_name IN ('settings_registry','settings_values','settings_change_log')")
if [ "$gone" != "0" ]; then
  echo "ROLLBACK BLOCKS $declared declared / 0021x EXEC FAIL (tables remain: $gone)"; exit 1
fi
echo "ROLLBACK BLOCKS $declared/$declared (declared syntactic; 0021x executed live — 3 tables gone)"

echo "DB SUITE PASS"
