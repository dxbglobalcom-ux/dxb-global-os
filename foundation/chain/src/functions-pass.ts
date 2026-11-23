// The functions pass (piece 4's SPEC §6 step 8): every file of `functions/` applied again, each held to its own function, then the manifest.
import type { Client } from "pg";
import { asTheFiles, endThePass, inOnePass } from "./one-pass.ts";
import type { NotGreen } from "./one-pass.ts";
import { inOrder } from "./outcome.ts";
import type { Offence } from "./outcome.ts";
import { namedBy } from "./passes.ts";
import type { PassFile } from "./passes.ts";
import { executeText } from "./session.ts";
import type { InASession } from "./session.ts";

/** A row of `pg_proc` in `os`: a function, a procedure or an aggregate (SPEC §3). */
type Routine = { oid: string; ctid: string; name: string; arguments: string };

// Every row, and none when no schema `os` stands. The rows are read into the runner and compared there: a function
// file may have left this session another role and another search path, so the reading needs no privilege and
// spells every catalogue name with its schema.
const ROUTINES = `
select p.oid::pg_catalog.text as oid, p.ctid::pg_catalog.text as ctid, p.proname::pg_catalog.text as name,
       pg_catalog.pg_get_function_identity_arguments(p.oid) as arguments
  from pg_catalog.pg_proc p
 where p.pronamespace = pg_catalog.to_regnamespace('os')`;

const routinesIn = async (conn: Client): Promise<Routine[]> => (await conn.query<Routine>(ROUTINES)).rows;

/** The names these rows carry, ascending by code unit, each once: `[a, b]`, or `[]`. */
const namesOf = (rows: readonly Routine[]): string => `[${[...new Set(rows.map((row) => row.name))].sort().join(", ")}]`;

/**
 * What a file did when it did not make or replace exactly its own function, as SPEC §6's message — or nothing
 * when it did. A row is new by its `oid` and moved by its `ctid` (SPEC §3, measured: a replaced function keeps the
 * one and changes the other, also when its text is the same as before).
 */
function notItsOwn(name: string, before: readonly Routine[], after: readonly Routine[]): string | undefined {
  const stoodAt = new Map(before.map((row) => [row.oid, row.ctid]));
  const stands = new Set(after.map((row) => row.oid));
  const madeOrChanged = after.filter((row) => stoodAt.get(row.oid) !== row.ctid);
  const removed = before.filter((row) => !stands.has(row.oid));
  if (madeOrChanged.length === 1 && madeOrChanged[0]?.name === name && removed.length === 0) return undefined;
  return `the file did not make or replace exactly os.${name}: made or changed ${namesOf(madeOrChanged)}, removed ${namesOf(removed)}`;
}

/**
 * The manifest's offences: a row whose name no file holds is an orphan, said with its arguments — each such row,
 * also when two carry one name; a name a file holds that more than one row carries is a second signature, said once.
 */
function manifestOffences(files: readonly PassFile[], standing: readonly Routine[]): Offence[] {
  const held = new Set(files.map(namedBy));
  const orphans = standing.filter((row) => !held.has(row.name)).map((row): Offence => ({ kind: "orphan", detail: `${row.name}(${row.arguments})` }));
  const carriedTwice = [...held].filter((name) => standing.filter((row) => row.name === name).length > 1);
  return inOrder([...orphans, ...carriedTwice.map((name): Offence => ({ kind: "second-signature", detail: name }))]);
}

/**
 * The files of `functions/`, in the order given — by name — each executed as a schema file's text is, in one
 * session and one transaction. Answers how many files were applied, or how the pass ended instead: nothing of it
 * is left then.
 */
export async function functionsPass(inASession: InASession, files: readonly PassFile[]): Promise<number | NotGreen> {
  const ended = await inOnePass(inASession, async (conn) => {
    for (const file of files) {
      const before = await routinesIn(conn);
      await asTheFiles("functions", file.name, () => executeText(conn, file.text));
      const message = notItsOwn(namedBy(file), before, await routinesIn(conn));
      if (message !== undefined) endThePass({ state: "pass-failed", pass: "functions", file: file.name, message });
    }
    const offences = manifestOffences(files, await routinesIn(conn));
    if (offences.length > 0) endThePass({ state: "manifest", offences });
  });
  return ended ?? files.length;
}
