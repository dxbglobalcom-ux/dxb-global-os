// The functions pass (piece 4's SPEC §6 step 8): every file of `functions/` applied again, each held to its own function, then the manifest.
import type { Client } from "pg";
import type { AssertHeld } from "./lock.ts";
import { asTheFiles, endThePass, inOnePass } from "./one-pass.ts";
import type { NotGreen } from "./one-pass.ts";
import { inOrder } from "./outcome.ts";
import type { Offence } from "./outcome.ts";
import { namedBy } from "./passes.ts";
import type { PassFile } from "./passes.ts";
import { executeText } from "./session.ts";
import type { InASession } from "./session.ts";

/** A row of `pg_proc`, with its schema's name: a function, a procedure or an aggregate (SPEC §3). */
type Routine = { oid: string; ctid: string; schema: string; name: string };

/** A row of `pg_proc` in `os`, as the manifest says it: with its identity arguments. */
type Standing = { name: string; arguments: string };

// Every row of every schema (SPEC §12.2): a function made with no schema lands outside `os`. The rows are read into
// the runner and compared there; every catalogue name is spelled with its schema.
const EVERY_ROUTINE = `
select p.oid::pg_catalog.text as oid, p.ctid::pg_catalog.text as ctid, n.nspname::pg_catalog.text as schema, p.proname::pg_catalog.text as name
  from pg_catalog.pg_proc p
  join pg_catalog.pg_namespace n on n.oid = p.pronamespace`;

// The rows of `os` alone, and none when no schema `os` stands.
const STANDING_IN_OS = `
select p.proname::pg_catalog.text as name, pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
  from pg_catalog.pg_proc p
 where p.pronamespace = pg_catalog.to_regnamespace('os')`;

const everyRoutine = async (conn: Client): Promise<Routine[]> => (await conn.query<Routine>(EVERY_ROUTINE)).rows;

/** A row as SPEC §6's message says it: bare when its schema is `os`, `<schema>.<name>` otherwise (SPEC §12.2). */
const said = ({ schema, name }: Routine): string => (schema === "os" ? name : `${schema}.${name}`);

/** These rows as they are said, ascending by code unit, each once: `[a, public.b]`, or `[]`. */
const saidOf = (rows: readonly Routine[]): string => `[${[...new Set(rows.map(said))].sort().join(", ")}]`;

/**
 * What a file did when it did not make or replace exactly its own function, as SPEC §6's message — or nothing
 * when it did: exactly one row is new or moved, it is in `os` and carries the file's name, and no row of any schema
 * is gone. A row is new by its `oid` and moved by its `ctid` (SPEC §3, measured: a replaced function keeps the one
 * and changes the other, also when its text is the same as before).
 */
function notItsOwn(name: string, before: readonly Routine[], after: readonly Routine[]): string | undefined {
  const stoodAt = new Map(before.map((row) => [row.oid, row.ctid]));
  const stands = new Set(after.map((row) => row.oid));
  const madeOrChanged = after.filter((row) => stoodAt.get(row.oid) !== row.ctid);
  const removed = before.filter((row) => !stands.has(row.oid));
  const [only] = madeOrChanged;
  if (madeOrChanged.length === 1 && only?.schema === "os" && only.name === name && removed.length === 0) return undefined;
  return `the file did not make or replace exactly os.${name}: made or changed ${saidOf(madeOrChanged)}, removed ${saidOf(removed)}`;
}

/**
 * A file's text executed, and its session put back as every file meets it (SPEC §12.3): the role first, then every
 * setting — measured: `reset all` alone leaves the role. So what a file set reaches neither the runner's reading
 * after it nor the next file, whose bytes would otherwise be read in another encoding. The server's refusal of the
 * text is the file's; the two resets are the runner's own statements.
 */
async function applyThenPutBack(conn: Client, file: PassFile): Promise<void> {
  await asTheFiles("functions", file.name, () => executeText(conn, file.text));
  await conn.query("reset role");
  await conn.query("reset all");
}

/**
 * The manifest's offences: a row whose name no file holds is an orphan, said with its arguments — each such row,
 * also when two carry one name; a name a file holds that more than one row carries is a second signature, said once.
 */
function manifestOffences(files: readonly PassFile[], standing: readonly Standing[]): Offence[] {
  const held = new Set(files.map(namedBy));
  const orphans = standing.filter((row) => !held.has(row.name)).map((row): Offence => ({ kind: "orphan", detail: `${row.name}(${row.arguments})` }));
  const carriedTwice = [...held].filter((name) => standing.filter((row) => row.name === name).length > 1);
  return inOrder([...orphans, ...carriedTwice.map((name): Offence => ({ kind: "second-signature", detail: name }))]);
}

/**
 * The files of `functions/`, in the order given — by name — each executed as a schema file's text is, in one
 * session and one transaction. Answers how many files were applied, or how the pass ended instead: nothing of it
 * is left then. `assertHeld` is asked as the pass's last act, before its commit.
 */
export async function functionsPass(inASession: InASession, files: readonly PassFile[], assertHeld: AssertHeld): Promise<number | NotGreen> {
  const ended = await inOnePass(inASession, assertHeld, async (conn) => {
    for (const file of files) {
      const before = await everyRoutine(conn);
      await applyThenPutBack(conn, file);
      const message = notItsOwn(namedBy(file), before, await everyRoutine(conn));
      if (message !== undefined) endThePass({ state: "pass-failed", pass: "functions", file: file.name, message });
    }
    const offences = manifestOffences(files, (await conn.query<Standing>(STANDING_IN_OS)).rows);
    if (offences.length > 0) endThePass({ state: "manifest", offences });
  });
  return ended ?? files.length;
}
