#!/usr/bin/env bash
# refresh-test-db — rebuild `dxb_test` as a fresh clone of the company database.
#
# Why the clone exists (CEO, 2026-07-28: "bu inşaa sürecinin her boku neden bu
# şirkete yansıyor — burası ayrı bir platform"): until then every suite wrote
# into the SAME Postgres database the CEO's dashboard reads. Six residue classes
# had accumulated in tests/global-teardown.ts, each one a leak that had already
# reached a CEO surface once. A post-run sweep only protects him when the run
# survives to reach it — on 2026-07-28 01:49 earlyoom killed the editor
# mid-suite and construction artifacts stood on his KRİTİK UYARILAR panel.
#
# The clone is a FULL copy — schema, seeds, roles, RLS — in the same Postgres
# instance, so the live-data acceptance proofs this corpus depends on still
# measure real rows. It is not a schema-only scaffold and must not become one.
#
# Run it:
#   · after applying a migration (the clone does not receive migrations)
#   · before an acceptance run whose verdict must reflect current reality
#
# The company database is only ever READ here. `dxb_test` is dropped and
# recreated, so anything a suite left inside it is gone by construction.
set -euo pipefail

CONTAINER="${DXB_DB_CONTAINER:-supabase_db_DxB_Global_OS}"
SOURCE_DB="${DXB_SOURCE_DB:-postgres}"
TEST_DB="${DXB_TEST_DB:-dxb_test}"

if [[ "$TEST_DB" == "$SOURCE_DB" ]]; then
  echo "refresh-test-db: refusing to drop the source database ($SOURCE_DB)" >&2
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "refresh-test-db: container '$CONTAINER' is not running" >&2
  exit 1
fi

echo "refresh-test-db: cloning $SOURCE_DB -> $TEST_DB ..."
# supabase_admin, not postgres: the auth/storage schemas carry ownership the
# plain postgres role cannot SET ROLE into (measured 2026-07-28 — the first
# attempt produced 15 'must be able to SET ROLE "supabase_admin"' errors).
docker exec "$CONTAINER" bash -c "
  set -euo pipefail
  psql -U supabase_admin -d postgres -q -c 'DROP DATABASE IF EXISTS $TEST_DB WITH (FORCE)'
  psql -U supabase_admin -d postgres -q -c 'CREATE DATABASE $TEST_DB'
  pg_dump -U supabase_admin $SOURCE_DB | psql -U supabase_admin -d $TEST_DB -q
"

# Proof, not assumption: the clone must carry the company's rows, not an empty
# schema. A suite silently running against an empty database would turn every
# live-data acceptance proof into a false green.
docker exec -i "$CONTAINER" psql -U postgres -d "$TEST_DB" -t -A -c "
  SELECT 'tables=' || (SELECT count(*) FROM information_schema.tables WHERE table_schema='public')
      || ' agents=' || (SELECT count(*) FROM agents)
      || ' personas=' || (SELECT count(*) FROM personas)
      || ' hook_policies=' || (SELECT count(*) FROM hook_policies)"
echo "refresh-test-db: done — vitest.config.ts points the suite at $TEST_DB"
