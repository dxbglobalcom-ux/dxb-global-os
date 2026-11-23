// The snapshot's lines of the code-owned values (piece 6a's SPEC §4.3): `reference` — the rows of every vocabulary
// in a covered schema — and `ledger` — the ledger's rows, without when or by whom.
import type { Client } from "pg";
import { MARKED } from "../reference-judgement.ts";
import { linesOf } from "./sql.ts";
import type { Covered } from "./sql.ts";

// Every ordinary table of the covered schemas (`$1`) with its comment, which may mark it a vocabulary — judged
// here by piece 4's own mark — and the statement that reads its rows, spelled by the server: the table by
// `regclass`, never by this reader. `only`, as the reference pass reads and writes. `t.*`, not `t`: a column named
// `t` would be read instead of the row.
const TABLES = `
select pg_catalog.obj_description(c.oid, 'pg_class') as comment,
       pg_catalog.format('select %L || pg_catalog.to_jsonb(t.*)::pg_catalog.text as line from only %s t',
                         'reference ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' ', c.oid::pg_catalog.regclass) as statement
  from pg_catalog.pg_class c
 where c.relnamespace = any ($1::pg_catalog.oid[]) and c.relkind = 'r'`;

// The ledger's rows (piece 3's SPEC §5): position, file, kind, hash and runner version — not `applied_at` nor
// `applied_by`. None when no ledger stands: that is no failure (SPEC §4.4).
const LEDGER_STANDS = "select pg_catalog.to_regclass('os_chain.ledger') is not null as stands";
const LEDGER = `
select 'ledger ' || l.position::pg_catalog.text || ' ' || l.file || ' ' || l.kind || ' ' || l.hash || ' runner ' || l.runner_version as line
  from os_chain.ledger l`;

/** Every `reference` and `ledger` line. Each row of a vocabulary as `to_jsonb`, under the transaction's settings. */
export async function referenceAndLedgerLines(conn: Client, { schemas }: Covered): Promise<string[]> {
  const lines: string[] = [];
  const { rows: tables } = await conn.query<{ comment: string | null; statement: string }>(TABLES, [schemas]);
  for (const { comment, statement } of tables) {
    if (MARKED.test(comment ?? "")) lines.push(...(await linesOf(conn, statement)));
  }
  const { rows } = await conn.query<{ stands: boolean }>(LEDGER_STANDS);
  if (rows[0]?.stands === true) lines.push(...(await linesOf(conn, LEDGER)));
  return lines;
}
