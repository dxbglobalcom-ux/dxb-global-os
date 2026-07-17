#!/usr/bin/env bash
# R2.5 — schema/function/view/trigger/RLS/grant inventory diff (audit F-08
# mandatory evidence item 3): compares the DXB-owned database surface of two
# environments and exits 0 only when the inventories are IDENTICAL.
#
#   DXB_PSQL_A="docker exec -i supabase_db_X psql -U postgres -d postgres" \
#   DXB_PSQL_B="docker exec -i dxb_fresh_pg psql -U supabase_admin -d postgres" \
#   scripts/schema-inventory-diff.sh
#
# Scope: schemas owned by the DXB migration chain (public, pgboss,
# supabase_migrations). Platform schemas (auth, storage, realtime, …) are the
# supabase stack's own responsibility — they are born from stack services,
# not from db/migrations, and both reference environments run the same image.
# Every invocation feeds SQL on stdin (container-exec friendly, no host psql).
set -euo pipefail

A="${DXB_PSQL_A:?DXB_PSQL_A required (psql command for the reference side)}"
B="${DXB_PSQL_B:?DXB_PSQL_B required (psql command for the candidate side)}"
OUTDIR="${DXB_INV_OUT:-$(mktemp -d)}"
mkdir -p "$OUTDIR"

INVENTORY_SQL=$(cat <<'SQL'
-- pgboss.queue_stats_YYYYMMDD are pg-boss's own DATED maintenance partitions
-- (runtime-born daily); they are pg-boss internals, not chain surface.
WITH scope(s) AS (VALUES ('public'), ('pgboss'), ('supabase_migrations'))
SELECT line FROM (
  -- 1) tables + columns (type, nullability, default-presence)
  SELECT 'column|' || c.table_schema || '.' || c.table_name || '.' || c.column_name
         || '|' || c.data_type || '|' || c.is_nullable
         || '|' || CASE WHEN c.column_default IS NULL THEN 'nodefault' ELSE 'hasdefault' END AS line
    FROM information_schema.columns c JOIN scope ON c.table_schema = scope.s
   WHERE c.table_name NOT LIKE 'queue\_stats\_%'
  UNION ALL
  -- 2) functions (full definition fingerprint)
  SELECT 'function|' || n.nspname || '.' || p.proname
         || '(' || pg_get_function_identity_arguments(p.oid) || ')'
         || '|' || md5(pg_get_functiondef(p.oid))
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN scope ON n.nspname = scope.s
   WHERE p.prokind IN ('f','p','w')
  UNION ALL
  -- 3) views — alias/whitespace-insensitive fingerprint: a dump/restore
  --    round trip decompiles implicit column aliases into explicit "AS x"
  --    (measured on v_alerts_active); view column names/types are already
  --    inventoried by the column section, so stripping aliases loses nothing.
  SELECT 'view|' || schemaname || '.' || viewname || '|'
         || md5(regexp_replace(regexp_replace(definition, '\s+AS\s+[a-z_0-9"]+', '', 'gi'), '\s+', ' ', 'g'))
    FROM pg_views JOIN scope ON schemaname = scope.s
  UNION ALL
  -- 4) triggers (full definition)
  SELECT 'trigger|' || n.nspname || '.' || c.relname || '.' || t.tgname
         || '|' || md5(pg_get_triggerdef(t.oid)) || '|enabled:' || t.tgenabled::text
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN scope ON n.nspname = scope.s
   WHERE NOT t.tgisinternal
  UNION ALL
  -- 5) RLS: table posture + policies
  SELECT 'rls|' || n.nspname || '.' || c.relname
         || '|enabled:' || c.relrowsecurity || '|forced:' || c.relforcerowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN scope ON n.nspname = scope.s
   WHERE c.relkind = 'r' AND c.relname NOT LIKE 'queue\_stats\_%'
  UNION ALL
  SELECT 'policy|' || schemaname || '.' || tablename || '.' || policyname
         || '|' || cmd || '|roles:' || array_to_string(roles, ',')
         || '|' || md5(coalesce(qual,'') || '~' || coalesce(with_check,''))
    FROM pg_policies JOIN scope ON schemaname = scope.s
  UNION ALL
  -- 6) grants: stored ACLs on tables/views/matviews/sequences/partitions
  --    (aclexplode over pg_class = one honest source incl. sequences; a NULL
  --    relacl means owner-only defaults and is identically absent on both sides)
  SELECT 'grant|' || n.nspname || '.' || c.relname
         || '|' || pg_get_userbyid(a.grantee)
         || '|' || string_agg(a.privilege_type, ',' ORDER BY a.privilege_type)
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN scope ON n.nspname = scope.s,
    LATERAL aclexplode(c.relacl) a
   WHERE c.relkind IN ('r','p','v','m','S')
     AND c.relname NOT LIKE 'queue\_stats\_%'
   GROUP BY n.nspname, c.relname, a.grantee
  UNION ALL
  -- 6a2) COLUMN-level ACLs (pg_attribute.attacl — invisible to relacl; the
  --      dashboard command-bar wall lives here)
  SELECT 'colgrant|' || n.nspname || '.' || c.relname || '.' || att.attname
         || '|' || pg_get_userbyid(a.grantee)
         || '|' || string_agg(a.privilege_type, ',' ORDER BY a.privilege_type)
    FROM pg_attribute att
    JOIN pg_class c ON c.oid = att.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN scope ON n.nspname = scope.s,
    LATERAL aclexplode(att.attacl) a
   WHERE att.attacl IS NOT NULL AND NOT att.attisdropped
     AND c.relname NOT LIKE 'queue\_stats\_%'
   GROUP BY n.nspname, c.relname, att.attname, a.grantee
  UNION ALL
  -- 6b) default ACLs (future-object privilege posture per schema)
  SELECT 'defacl|' || pg_get_userbyid(d.defaclrole)
         || '|' || n.nspname || '|' || d.defaclobjtype::text || '|' || d.defaclacl::text
    FROM pg_default_acl d
    JOIN pg_namespace n ON n.oid = d.defaclnamespace
    JOIN scope ON n.nspname = scope.s
  UNION ALL
  -- 7) indexes + constraints
  SELECT 'index|' || schemaname || '.' || tablename || '.' || indexname
         || '|' || md5(indexdef)
    FROM pg_indexes JOIN scope ON schemaname = scope.s
   WHERE tablename NOT LIKE 'queue\_stats\_%'
  UNION ALL
  SELECT 'constraint|' || n.nspname || '.' || cl.relname || '.' || con.conname
         || '|' || md5(pg_get_constraintdef(con.oid))
    FROM pg_constraint con
    JOIN pg_class cl ON cl.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = cl.relnamespace
    JOIN scope ON n.nspname = scope.s
   WHERE cl.relname NOT LIKE 'queue\_stats\_%'
) inv
ORDER BY line;
SQL
)

echo "$INVENTORY_SQL" | $A -v ON_ERROR_STOP=1 -qtA > "$OUTDIR/inventory_a.txt"
echo "$INVENTORY_SQL" | $B -v ON_ERROR_STOP=1 -qtA > "$OUTDIR/inventory_b.txt"

wc_a=$(wc -l < "$OUTDIR/inventory_a.txt")
wc_b=$(wc -l < "$OUTDIR/inventory_b.txt")
echo "[inventory] reference side: $wc_a lines · candidate side: $wc_b lines"

if diff -u "$OUTDIR/inventory_a.txt" "$OUTDIR/inventory_b.txt" > "$OUTDIR/inventory.diff"; then
  echo "[inventory] DIFF = 0 — surfaces identical ($OUTDIR)"
else
  n=$(grep -cE '^[+-][^+-]' "$OUTDIR/inventory.diff" || true)
  echo "[inventory] DIFF = $n lines — see $OUTDIR/inventory.diff"
  exit 1
fi
