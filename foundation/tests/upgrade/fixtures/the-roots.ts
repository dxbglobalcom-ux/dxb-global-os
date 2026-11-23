// The two revisions of the fixture chain and the three variants (piece 6b's SPEC §6), each assembled as a root in a
// temporary directory of its own outside the repository (chain/fixtures/chain-on-disk.ts, through 6a's fixtureRoot).
//
// Revision A is 6a's fixture chain as it stands — imported, never copied. Revision B is A's files, then B's own:
// schema/0005-…, and the function and reference files B changes, written over A's.
import { appendFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { fixtureRoot } from "../../snapshot/fixtures/the-chains.ts";

export { EXPECTED_FIXTURE, fixtureRoot } from "../../snapshot/fixtures/the-chains.ts";

/** B's own files: schema/, functions/ and reference/, each holding only what B adds or changes. */
export const B_FILES = fileURLToPath(new URL("./chain-b/", import.meta.url));
const VARIANTS = fileURLToPath(new URL("./variants/", import.meta.url));

/** The committed texts of this piece, written by hand (SPEC §6), found from this file's place. */
export const EXPECTED_B = fileURLToPath(new URL("../expected/b.snapshot.txt", import.meta.url));
export const EXPECTED_A_ROWS = fileURLToPath(new URL("../expected/a.rows.txt", import.meta.url));
export const EXPECTED_B_ROWS = fileURLToPath(new URL("../expected/b.rows.txt", import.meta.url));
export const FROM_TXT = fileURLToPath(new URL("../real/from.txt", import.meta.url));

/** The rows given on A (SPEC §6), sent statement by statement (fixtures/the-rows-given.ts). */
export const ROWS_SQL = fileURLToPath(new URL("./rows.sql", import.meta.url));

/** B's versioned change, and the names the variants add. */
export const B_SCHEMA_FILE = "0005-grade-size-notes.sql";
export const REFUSED_FILE = "0005-not-null-no-default.sql";
export const C_FILE = "0006-rows-decide.sql";
/** The applied file the variant *edited* changes in place. */
export const EDITED_FILE = "0003-inside.sql";
/** The one statement *edited* adds inside it. */
export const EDITED_STATEMENT = "comment on column os.parts.code is 'edited in place';\n";

/**
 * The two lines of the database's that C's 0006 adds to B's text on a populated instance (SPEC §6 C.5), written by
 * hand from 6a §4.3: its ledger line — the SHA-256 of variants/0006-rows-decide.sql, read from os_chain.ledger after
 * the runner wrote it — which a clean build has too, and the index it makes only on rows, which a clean build has not.
 */
export const C_LEDGER_LINE = "ledger 6 0006-rows-decide.sql schema 08dc15e38c53af79086ebedace4314928338fe958e26ab928b3048e5577b7923 runner 1";
export const C_INDEX_LINE = "index os.parts valid t replident f clustered f def CREATE INDEX parts_grade_idx ON os.parts USING btree (grade)";

/** The bytes of one of B's own files, by its pass and name. */
export const bFile = (pass: "schema" | "functions" | "reference", name: string): Buffer => readFileSync(join(B_FILES, pass, name));

/** The bytes of one of the variants' files. */
export const variantFile = (name: string): Buffer => readFileSync(join(VARIANTS, name));

/** A root holding revision A: 6a's fixture chain, whole. */
export const rootA = (): string => fixtureRoot();

/** A root holding revision B: A's files, then B's own written over them where B changes a file. */
export function rootB(): string {
  const root = fixtureRoot();
  for (const pass of ["schema", "functions", "reference"] as const) {
    for (const name of readdirSync(join(B_FILES, pass))) writeFileSync(join(root, pass, name), bFile(pass, name));
  }
  return root;
}

/** *edited*: A with one statement added inside an applied file, and no 0005. */
export function rootEdited(): string {
  const root = fixtureRoot();
  appendFileSync(join(root, "schema", EDITED_FILE), EDITED_STATEMENT);
  return root;
}

/** *refused-when-populated*: A, then a 0005 that adds a not-null column without a default. */
export function rootRefusedWhenPopulated(): string {
  const root = fixtureRoot();
  writeFileSync(join(root, "schema", REFUSED_FILE), variantFile(REFUSED_FILE));
  return root;
}

/** *C*: B, then 0006 — nothing the snapshot reads on an empty database; rows and a structure on a populated one. */
export function rootC(): string {
  const root = rootB();
  writeFileSync(join(root, "schema", C_FILE), variantFile(C_FILE));
  return root;
}
