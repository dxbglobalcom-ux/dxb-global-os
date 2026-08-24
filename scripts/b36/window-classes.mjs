#!/usr/bin/env node
/**
 * B36 — ONE definition of "what a read-only window on a PostgreSQL engine may
 * still do", asked class by class out of the catalogue rather than by trying a
 * handful of examples.
 *
 * It lived inside prove-window.mjs until 2026-08-24. Block 3-bis withdrew the
 * construction site's login and replaced that drill with prove-wall.mjs, and the
 * class sweep had to survive the drill it was born in: a second copy written in
 * the new file would be the defect the second audit already named once — a seal
 * and a proof that drifted apart.
 *
 * The predicate for "a function whose call can leave something behind" is not
 * written here either. It is read out of the SQL that seals those functions.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const REPO = fileURLToPath(new URL("../..", import.meta.url));
const WINDOW_SQL = join(REPO, "scripts/b36/company-one-way-window.sql");

export const EFFECTFUL = (() => {
  const sql = readFileSync(WINDOW_SQL, "utf8");
  const m = sql.match(/c_effectful CONSTANT text := \$flt\$([\s\S]*?)\$flt\$;/);
  if (!m) throw new Error("window-classes: cannot find c_effectful in company-one-way-window.sql");
  return m[1];
})();

/** Every class, asked of `role`. A count of 0 is the only acceptable answer. */
export function classesFor(role) {
  return [
  ["tables it can change or maintain (7 verbs, every schema)", `
    SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind IN ('r','p','v','m','f')
       AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_table_privilege('${role}',c.oid,'INSERT')
         OR has_table_privilege('${role}',c.oid,'UPDATE')
         OR has_table_privilege('${role}',c.oid,'DELETE')
         OR has_table_privilege('${role}',c.oid,'TRUNCATE')
         OR has_table_privilege('${role}',c.oid,'REFERENCES')
         OR has_table_privilege('${role}',c.oid,'TRIGGER')
         OR has_table_privilege('${role}',c.oid,'MAINTAIN'))`],
  ["counters it can turn (every sequence, every schema)", `
    SELECT count(*) FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE c.relkind = 'S' AND n.nspname NOT IN ('pg_catalog','information_schema')
       AND (has_sequence_privilege('${role}',c.oid,'USAGE')
         OR has_sequence_privilege('${role}',c.oid,'UPDATE')
         OR has_sequence_privilege('${role}',c.oid,'SELECT'))`],
  ["functions whose call can leave something behind", `
    SELECT count(*) FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE (${EFFECTFUL}) AND has_function_privilege('${role}', p.oid, 'EXECUTE')`],
  ["rooms it may stand in outside public/pgboss", `
    SELECT count(*) FROM pg_namespace n
     WHERE n.nspname NOT IN ('public','pgboss','information_schema')
       AND n.nspname NOT LIKE 'pg\\_%'
       AND has_schema_privilege('${role}', n.oid, 'USAGE')`],
  ["ways to create anything (database CREATE/TEMP, schema CREATE)", `
    SELECT (has_database_privilege('${role}',current_database(),'CREATE')::int
          + has_database_privilege('${role}',current_database(),'TEMPORARY')::int
          + has_schema_privilege('${role}','public','CREATE')::int
          + has_schema_privilege('${role}','pgboss','CREATE')::int)`],
  ["default privileges that would hand it a future object", `
    SELECT count(*) FROM pg_default_acl d
     WHERE d.defaclobjtype <> 'r'
       AND array_to_string(d.defaclacl,' ') ~ '(^|\\s)(${role}|)='`],
  ["large objects it owns", `
    SELECT count(*) FROM pg_largeobject_metadata WHERE lomowner = '${role}'::regrole`],
  ["roles it is a member of", `
    SELECT count(*) FROM pg_auth_members m JOIN pg_roles r ON r.oid = m.member
     WHERE r.rolname = '${role}'`],
  // Asked by OID, not by name: resolving 'dxb_internal.ops_live_issued' as text
  // needs USAGE on the schema, and the whole point is that the window does not
  // have it — so the honest measurement would have thrown instead of answering.
  ["ways to reach the live-event receipts (dxb_internal)", `
    SELECT has_schema_privilege('${role}','dxb_internal','USAGE')::int
         + coalesce((SELECT has_table_privilege('${role}', c.oid, 'SELECT')::int
                          + has_table_privilege('${role}', c.oid, 'INSERT')::int
                       FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
                      WHERE n.nspname = 'dxb_internal' AND c.relname = 'ops_live_issued'), 0)`],
  ];
}
