// The other hand: what a case itself does to a ledger a real run made, to see
// what the runner then says. The runner has no such door (SPEC §2, §5).
import type { Client } from "pg";
import { columnOf } from "./looking.ts";

/** One well-formed row, written and committed by the test's own connection: its hash is no file's, its login no login. */
export async function writeARowByHand(client: Client, row: { position: number; file: string; kind: "ledger" | "schema" }): Promise<void> {
  const insert = `insert into os_chain.ledger (position, file, kind, hash, applied_at, applied_by, runner_version)
                  values ($1, $2, $3, repeat('a', 64), now(), 'another hand', '1')`;
  await client.query(insert, [row.position, row.file, row.kind]);
}

/** What a constraint is to the catalog: the primary key, a unique, a check. */
export type ConstraintKind = "p" | "u" | "c";

/**
 * Drops the one constraint of this kind that the ledger holds on this column. It is found in the catalog,
 * so a case spells no name the bootstrap chose; none there, or more than one, is an error.
 */
export async function dropTheConstraint(client: Client, kind: ConstraintKind, column: string): Promise<void> {
  const held = `select c.conname from pg_catalog.pg_constraint c
                  join pg_catalog.pg_attribute a on a.attrelid = c.conrelid and a.attnum = any (c.conkey)
                 where c.conrelid = 'os_chain.ledger'::regclass and c.contype = $1 and a.attname = $2`;
  const names = await columnOf(client, held, [kind, column]);
  const [name] = names;
  if (names.length !== 1 || name === undefined) throw new Error(`the ledger holds ${names.length} constraints of kind ${kind} on ${column}, not one`);
  await client.query(`alter table os_chain.ledger drop constraint "${name.replaceAll('"', '""')}"`);
}

/** A trigger that swallows every row written to the ledger: the insert is taken, and no row is there. */
export async function swallowWhatIsWritten(client: Client): Promise<void> {
  await client.query("create function public.swallows() returns trigger language plpgsql as $$ begin return null; end $$");
  await client.query("create trigger swallows before insert on os_chain.ledger for each row execute function public.swallows()");
}
