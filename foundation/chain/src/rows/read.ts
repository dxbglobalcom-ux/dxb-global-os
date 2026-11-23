// The rows' text (piece 6b's SPEC §4): what the tables of the covered schemas hold — every row, and where every
// sequence stands — read as the snapshot is, in the snapshot's form under its own first line.
import type { Client } from "pg";
import type { Target } from "../session.ts";
import { readAsTheSnapshotIs } from "../snapshot/read.ts";
import { tablesOf } from "../snapshot/reference-and-ledger.ts";
import { flag, linesOf } from "../snapshot/sql.ts";
import type { Covered } from "../snapshot/sql.ts";
import { textHeadedBy } from "../snapshot/text.ts";
import { ROWS_FIRST_LINE } from "./text.ts";

// Every sequence of the covered schemas (`$1`) — an identity column's too, which is a sequence of its schema — and the
// statement that reads where it stands from the sequence itself (§4), the sequence spelled by the server's `regclass`.
// `ascending` from the catalogue's increment, said in the outer statement; `last_value` and `is_called` read inside.
const SEQUENCES = `
select pg_catalog.format($s$select %L || s.last_value::pg_catalog.text || ' called ' || ${flag("s.is_called")} || %L as line from %s s$s$,
                         'sequence-position ' || c.oid::pg_catalog.regclass::pg_catalog.text || ' ',
                         ' ascending ' || ${flag("q.seqincrement > 0")}, c.oid::pg_catalog.regclass) as statement
  from pg_catalog.pg_class c
  join pg_catalog.pg_sequence q on q.seqrelid = c.oid
 where c.relnamespace = any ($1::pg_catalog.oid[]) and c.relkind = 'S'`;

/** Every `row` and `sequence-position` line (§4), unescaped and in no order. */
async function rowAndSequenceLines(conn: Client, covered: Covered): Promise<string[]> {
  const lines: string[] = [];
  // The ledger and every vocabulary are lines of the snapshot, and change by the chain's own design (§4's "but").
  for (const { vocabulary, ledger, statement } of await tablesOf(conn, covered, "row")) {
    if (!vocabulary && !ledger) lines.push(...(await linesOf(conn, statement)));
  }
  const { rows } = await conn.query<{ statement: string }>(SEQUENCES, [covered.schemas]);
  for (const { statement } of rows) lines.push(...(await linesOf(conn, statement)));
  return lines;
}

/**
 * The rows' text of `target` (SPEC §4). A table or a sequence the session may not read fails the call: a text is
 * whole or there is none. A database with no covered schema gives the first line alone.
 */
export function rowsOf(target: Target): Promise<string> {
  return readAsTheSnapshotIs(target, async (conn, covered) => textHeadedBy(ROWS_FIRST_LINE, await rowAndSequenceLines(conn, covered)));
}
