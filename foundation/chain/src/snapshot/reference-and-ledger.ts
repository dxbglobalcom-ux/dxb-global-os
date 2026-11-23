// The snapshot's lines of the code-owned values (piece 6a's SPEC §4.3): `reference` — the rows of every vocabulary
// in a covered schema — and `ledger` — the ledger's rows, without when or by whom. Which ordinary table of a covered
// schema is a vocabulary, and which is the ledger, is asked here once: piece 6b's rows read every other one.
import type { Client } from "pg";
import { MARKED } from "../reference-judgement.ts";
import { linesOf } from "./sql.ts";
import type { Covered } from "./sql.ts";

// Every ordinary table of the covered schemas (`$1`) with its comment, which may mark it a vocabulary — judged
// here by piece 4's own mark —, whether it is the ledger, and the statement that reads its rows as lines headed by
// `$2`, spelled by the server: the table by `regclass`, never by this reader. `only`, as the reference pass reads and
// writes. `t.*`, not `t`: a column named `t` would be read instead of the row.
const TABLES = `
select pg_catalog.obj_description(c.oid, 'pg_class') as comment,
       coalesce(c.oid = pg_catalog.to_regclass('os_chain.ledger')::pg_catalog.oid, false) as ledger,
       pg_catalog.format('select %L || pg_catalog.to_jsonb(t.*)::pg_catalog.text as line from only %s t',
                         $2::pg_catalog.text || ' ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' ', c.oid::pg_catalog.regclass) as statement
  from pg_catalog.pg_class c
 where c.relnamespace = any ($1::pg_catalog.oid[]) and c.relkind = 'r'`;

/** An ordinary table of a covered schema: what it is to the chain, and the statement that reads its rows as lines. */
export type Table = { vocabulary: boolean; ledger: boolean; statement: string };

/** Every ordinary table of the covered schemas, its rows to be read as lines `<head> <regclass> <to_jsonb(row)>`. */
export async function tablesOf(conn: Client, { schemas }: Covered, head: string): Promise<Table[]> {
  const { rows } = await conn.query<{ comment: string | null; ledger: boolean; statement: string }>(TABLES, [schemas, head]);
  return rows.map(({ comment, ledger, statement }) => ({ vocabulary: MARKED.test(comment ?? ""), ledger, statement }));
}

// The ledger's rows (piece 3's SPEC §5): position, file, kind, hash and runner version — not `applied_at` nor
// `applied_by`. None when no ledger stands: that is no failure (SPEC §4.4).
const LEDGER_STANDS = "select pg_catalog.to_regclass('os_chain.ledger') is not null as stands";
const LEDGER = `
select 'ledger ' || l.position::pg_catalog.text || ' ' || l.file || ' ' || l.kind || ' ' || l.hash || ' runner ' || l.runner_version as line
  from os_chain.ledger l`;

/** Every `reference` and `ledger` line. Each row of a vocabulary as `to_jsonb`, under the transaction's settings. */
export async function referenceAndLedgerLines(conn: Client, covered: Covered): Promise<string[]> {
  const lines: string[] = [];
  for (const { vocabulary, statement } of await tablesOf(conn, covered, "reference")) {
    if (vocabulary) lines.push(...(await linesOf(conn, statement)));
  }
  const { rows } = await conn.query<{ stands: boolean }>(LEDGER_STANDS);
  if (rows[0]?.stands === true) lines.push(...(await linesOf(conn, LEDGER)));
  return lines;
}
