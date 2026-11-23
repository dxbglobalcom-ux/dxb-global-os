// The snapshot's lines of the routines in the covered schemas (piece 6a's SPEC §4.3): `function`,
// `function-arguments`, `function-setting`, `function-body` — functions, procedures, aggregates and window functions.
import type { Client } from "pg";
import { flag, linesOf, numberedLinesOf, orDash, role } from "./sql.ts";
import type { Covered } from "./sql.ts";

// `$1` is the covered schemas throughout. A routine is spelled by `regprocedure` under the empty search_path.
const IN_COVERED = "p.pronamespace = any ($1::pg_catalog.oid[])";
const ROUTINE = "p.oid::pg_catalog.regprocedure::pg_catalog.text";

// A procedure returns nothing: `pg_get_function_result` is null for it. Cost and rows are float4, read with every
// digit they hold (the transaction's `extra_float_digits`).
const FUNCTIONS = `
select 'function ' || ${ROUTINE} || ' kind ' || p.prokind::pg_catalog.text || ' owner ' || ${role("p.proowner")}
       || ' language ' || pg_catalog.quote_ident(l.lanname) || ' returns ' || ${orDash("pg_catalog.pg_get_function_result(p.oid)")}
       || ' definer ' || ${flag("p.prosecdef")} || ' volatility ' || p.provolatile::pg_catalog.text || ' strict ' || ${flag("p.proisstrict")}
       || ' parallel ' || p.proparallel::pg_catalog.text || ' leakproof ' || ${flag("p.proleakproof")}
       || ' cost ' || p.procost::pg_catalog.text || ' rows ' || p.prorows::pg_catalog.text as line
  from pg_catalog.pg_proc p
  join pg_catalog.pg_language l on l.oid = p.prolang
 where ${IN_COVERED}`;

// Its arguments with their names, modes and defaults — a default is meaning; none for a routine that takes none.
const ARGUMENTS = `
select 'function-arguments ' || ${ROUTINE} || ' ' || pg_catalog.pg_get_function_arguments(p.oid) as line
  from pg_catalog.pg_proc p
 where ${IN_COVERED} and pg_catalog.pg_get_function_arguments(p.oid) <> ''`;

// Each `name=value` of `proconfig` as written; their order is the text's sorting.
const SETTINGS = `
select 'function-setting ' || ${ROUTINE} || ' ' || c.item as line
  from pg_catalog.pg_proc p
 cross join lateral pg_catalog.unnest(p.proconfig) as c (item)
 where ${IN_COVERED}`;

// `prosrc`, or a SQL-standard body as the server deparses it — `prosrc` is empty for one.
const BODIES = `
select 'function-body ' || ${ROUTINE} as head, coalesce(pg_catalog.pg_get_function_sqlbody(p.oid), p.prosrc) as text
  from pg_catalog.pg_proc p
 where ${IN_COVERED}`;

/** Every routine of the covered schemas, whoever owns it. */
export async function routineLines(conn: Client, { schemas }: Covered): Promise<string[]> {
  const lines: string[] = [];
  for (const sql of [FUNCTIONS, ARGUMENTS, SETTINGS]) lines.push(...(await linesOf(conn, sql, [schemas])));
  lines.push(...(await numberedLinesOf(conn, BODIES, [schemas])));
  return lines;
}
