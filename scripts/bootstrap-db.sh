#!/usr/bin/env bash
# R2.5 — THE canonical bootstrap chain (audit F-08): a completely empty
# database reaches the full DXB schema with this ONE command:
#
#   DXB_DATABASE_URL=postgres://... scripts/bootstrap-db.sh
#
# Order: preamble (bare-PG platform stubs; every block self-skips on a live
#        Supabase database)
#      → pg-boss schema (the library's OWN initializer — never hand-rolled)
#      → every db/migrations/*.sql in lexical order, each recorded in
#        supabase_migrations.schema_migrations (version = leading timestamp)
# Already-recorded versions are SKIPPED, so the same command is the safe
# deploy step on an existing environment (staging = production chain, F-08).
#
# DXB_PSQL overrides the psql runner (e.g. a docker exec on the control
# laptop, where no host psql exists): every invocation feeds SQL on stdin, so
# file paths never need to exist inside a container.
#
# DXB_PSQL_ADMIN (optional) runs ONLY the preamble — platform-plane surface
# (extensions, platform schemas, stubs) is an admin act on managed images
# where the app role cannot write into e.g. the realtime schema. On bare PG
# it defaults to DXB_PSQL (postgres owns everything, planes collapse) so the
# one-command contract is unchanged. App-chain objects stay owned by the app
# role either way — live parity (definer/RLS semantics follow ownership).
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_URL="${DXB_DATABASE_URL:?DXB_DATABASE_URL required (session-mode port, never a transaction pooler)}"
# DXB_PSQL must be a COMPLETE connection command (its own -U/-d/host); the
# default connects with the URL. Every call feeds SQL on stdin.
PSQL="${DXB_PSQL:-psql $DB_URL}"
PSQL_ADMIN="${DXB_PSQL_ADMIN:-$PSQL}"

run_sql_file() { $PSQL -v ON_ERROR_STOP=1 -q < "$1"; }
run_sql() { echo "$1" | $PSQL -v ON_ERROR_STOP=1 -qtA; }

echo "[bootstrap] preamble (bare-PG compat surface; admin plane)"
$PSQL_ADMIN -v ON_ERROR_STOP=1 -q < "$REPO/scripts/bootstrap/preamble.sql"

echo "[bootstrap] pg-boss schema (library initializer)"
(cd "$REPO/packages/outbox-executor" && node - <<'NODE'
const { PgBoss } = require("pg-boss");
(async () => {
  const boss = new PgBoss(process.env.DXB_DATABASE_URL);
  boss.on("error", () => {});
  await boss.start();
  await boss.stop({ graceful: false });
  console.log("[bootstrap] pgboss schema ready");
})().catch((e) => { console.error(e); process.exit(1); });
NODE
)

applied=0; skipped=0
for f in "$REPO"/db/migrations/*.sql; do
  base="$(basename "$f")"
  version="${base%%_*}"
  name="${base#*_}"; name="${name%.sql}"
  exists=$(run_sql "SELECT 1 FROM supabase_migrations.schema_migrations WHERE version = '$version' LIMIT 1")
  if [ "$exists" = "1" ]; then
    skipped=$((skipped+1)); continue
  fi
  echo "[bootstrap] applying $base"
  run_sql_file "$f"
  run_sql "INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES ('$version', \$dxb\$$name\$dxb\$)" > /dev/null
  applied=$((applied+1))
done

total=$(run_sql "SELECT count(*) FROM supabase_migrations.schema_migrations")
echo "[bootstrap] done — applied $applied, skipped $skipped, ledger total $total"
