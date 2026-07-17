#!/usr/bin/env bash
# E13.0 — THE canonical DXB restore chain (pairs with scripts/bootstrap-db.sh;
# F-08 evidence item 5: "after a restore drill the same checks pass again").
#
#   DXB_RESTORE_DUMP=/path/to/dump \
#   DXB_PG_RESTORE="docker exec dxb_restore_pg pg_restore" \
#   DXB_PSQL_ADMIN="docker exec -i dxb_restore_pg psql -U supabase_admin -d postgres" \
#   scripts/restore-db.sh
#
# Order: platform preamble on the ADMIN plane (extensions [pgvector], roles,
#        platform stubs — a schema-filtered pg_dump NEVER carries
#        CREATE EXTENSION, measured 2026-07-17: without this step
#        memory_embeddings and 6 dependents are silently lost)
#      → pg_restore as the ADMIN role (default-privilege entries of other
#        roles need superuser), ownership forced to the app role via
#        --no-owner --role=postgres (live parity: definer/RLS semantics)
#      → decisive counts printed for the drill record.
# The dump is expected at a path REACHABLE BY the pg_restore command (for a
# docker exec runner: docker cp it into the container first).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DUMP="${DXB_RESTORE_DUMP:?DXB_RESTORE_DUMP required (path visible to the pg_restore runner)}"
PG_RESTORE="${DXB_PG_RESTORE:?DXB_PG_RESTORE required (complete pg_restore command, its own connection flags)}"
PSQL_ADMIN="${DXB_PSQL_ADMIN:?DXB_PSQL_ADMIN required (admin-plane psql, feeds SQL on stdin)}"

echo "[restore] platform preamble (admin plane — extensions/roles/stubs)"
$PSQL_ADMIN -v ON_ERROR_STOP=1 -q < "$REPO/scripts/bootstrap/preamble.sql"

# Default-privilege posture BEFORE object creation (keep in lockstep with
# db/migrations/20260717070000_grant_hardening_parity.sql). pg_dump omits a
# table's ACL entry when it equals the dump-time defacl outcome — so if the
# restore target still carries the image's PERMISSIVE defaults at CREATE
# time, every such table is born wide-open and nothing in the dump corrects
# it (measured: restored anon regained full DML, 551 diff lines). Superuser
# plane may alter FOR ROLE postgres.
echo "[restore] hardened default privileges (pre-ACL posture)"
echo "ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, USAGE ON SEQUENCES FROM anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, service_role;" \
  | $PSQL_ADMIN -v ON_ERROR_STOP=1 -q

echo "[restore] pg_restore ($DUMP)"
start=$(date -u +%s)
# Tolerated error classes — each one measured and explained; anything else
# fails the drill loudly (silent 'errors ignored' is exactly what E13.0
# forbids). The inventory-diff step that follows the drill is the arbiter:
# if a tolerated skip ever loses a real object, the diff stops being 0.
#   1. CREATE SCHEMA public — exists on every PostgreSQL.
#   2/3/4. supabase_migrations schema + ledger table + its PK — the preamble
#      pre-creates the ledger (bootstrap contract); the dump's own CREATE
#      collides, the COPY of ledger rows still lands (verified below).
#   5. 'permission denied to change default privileges' — the dump carries
#      the image-init defacls FOR ROLE supabase_admin (platform plane);
#      under --role=postgres another role's defacl cannot be altered. On a
#      supabase image those defacls pre-exist identically (measured in the
#      R2.5 inventory), so the skip loses nothing.
errlog=$(mktemp)
$PG_RESTORE -d postgres --no-owner --role=postgres "$DUMP" 2> "$errlog" || true
end=$(date -u +%s)
residual=$(grep "ERROR" "$errlog" \
  | grep -v 'schema "public" already exists' \
  | grep -v 'schema "supabase_migrations" already exists' \
  | grep -v 'relation "schema_migrations" already exists' \
  | grep -v 'multiple primary keys for table "schema_migrations"' \
  | grep -v 'permission denied to change default privileges' || true)
if [ -n "$residual" ]; then
  echo "[restore] FAIL — unexpected restore errors:"
  echo "$residual"
  exit 1
fi
echo "[restore] errors: tolerated platform/preamble collisions only"

# ACL normalization: pg_dump reconstructs grants ASSUMING the target's
# default state — a privilege the target's defacl grants at CREATE time that
# the dump never saw is silently retained (measured: TRUNCATE survived on 60
# grant pairs). The grant-hardening parity file is an idempotent
# per-(relation × role) REVOKE ALL + exact re-GRANT, so replaying it
# normalizes every pair to chain truth on any restore target.
echo "[restore] ACL normalization (grant-hardening parity replay)"
$PSQL_ADMIN -v ON_ERROR_STOP=1 -q < "$REPO/db/migrations/20260717070000_grant_hardening_parity.sql"

echo "[restore] verify (decisive counts)"
echo "SELECT 'ledger '||count(*) FROM supabase_migrations.schema_migrations;
SELECT 'agents '||count(*) FROM public.agents;
SELECT 'memory_embeddings present: '||count(*) FROM information_schema.tables
 WHERE table_schema='public' AND table_name='memory_embeddings';" \
  | $PSQL_ADMIN -v ON_ERROR_STOP=1 -qtA

echo "[restore] done in $((end - start))s (RTO for this dump size)"
