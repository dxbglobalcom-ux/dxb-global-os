// The inventory's `held` lines (piece 6c's SPEC §4.2): that what a table outside the covered schemas holds, or where
// a sequence there stands, is what it was — a digest computed in the database, so that a platform table's rows never
// reach this process. A table's rows are read as piece 6b's rows are (its `rows/read.ts`): by a statement the server
// spells, the relation named by its own `regclass`.
import type { Client } from "pg";
import { flag, inATemporarySchema } from "../snapshot/sql.ts";
import type { Covered } from "../snapshot/sql.ts";

// The hex SHA-256 of a text as UTF-8, spelled once for both statements below.
const sha256Of = (text: string): string => `pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(${text}, 'UTF8')), 'hex')`;

// Every ordinary table — a partition is one, read `only` — that stands in no covered schema (`$1`), nor in
// `pg_catalog` or `information_schema`, nor in a temporary schema; and every sequence outside the covered schemas.
// For each, its word, its name as `regclass` spells it, and the statement that reads its digest. A table's digest is
// of the number of its rows and of each row's own digest, the row as the server prints it — sorted by bytes, so that
// it does not depend on their order, and with no text between two rows that one row could also print. A sequence's
// is of its `last_value` and `is_called`.
const HELD = `
select 'rows' as word, c.oid::pg_catalog.regclass::pg_catalog.text as relation,
       pg_catalog.format($s$select ${sha256Of(`pg_catalog.count(*)::pg_catalog.text || ' ' || coalesce(pg_catalog.string_agg(r.digest, ' ' order by r.digest collate "C"), '')`)} as digest
                              from (select ${sha256Of("(t.*)::pg_catalog.text")} as digest from only %s t) r$s$, c.oid::pg_catalog.regclass) as statement
  from pg_catalog.pg_class c
  join pg_catalog.pg_namespace n on n.oid = c.relnamespace
 where c.relkind = 'r' and not (c.relnamespace = any ($1::pg_catalog.oid[]))
   and n.nspname not in ('pg_catalog', 'information_schema') and not ${inATemporarySchema("c.relnamespace")}
union all
select 'position', c.oid::pg_catalog.regclass::pg_catalog.text,
       pg_catalog.format($s$select ${sha256Of(`s.last_value::pg_catalog.text || ' ' || ${flag("s.is_called")}`)} as digest from %s s$s$, c.oid::pg_catalog.regclass)
  from pg_catalog.pg_class c
 where c.relkind = 'S' and not (c.relnamespace = any ($1::pg_catalog.oid[])) and not ${inATemporarySchema("c.relnamespace")}`;

/** Every `held` line, unescaped and in no order. A table or a sequence the session may not read fails the call. */
export async function heldLines(conn: Client, { schemas }: Covered): Promise<string[]> {
  const lines: string[] = [];
  const { rows } = await conn.query<{ word: string; relation: string; statement: string }>(HELD, [schemas]);
  for (const { word, relation, statement } of rows) {
    const { rows: [read] } = await conn.query<{ digest: string }>(statement);
    if (read === undefined) throw new Error(`the inventory: no digest was answered for ${relation}`);
    lines.push(`held out ${word} ${read.digest} ${relation}`);
  }
  return lines;
}
