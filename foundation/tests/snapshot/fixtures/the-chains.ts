// Where the snapshot's tests find what they judge with, and the fixture chain as a run is given it (SPEC §6).
//
// The fixture chain is the real chain's two schema files byte for byte, then the fixture's own. The two are READ
// FROM db/schema AT RUN TIME, not copied here: one copy of them stands in the repository, and an edit to either
// reaches the fixture's run as it reaches the real one — its expected text carries their ledger hashes, so both
// texts go red together. Every root a run is given is assembled in a temporary directory outside the repository
// (chain/fixtures/chain-on-disk.ts), so no test writes under foundation/tests.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chainRoot } from "../../chain/fixtures/chain-on-disk.ts";
import { REAL_ROOT } from "../../roles/fixtures/the-run.ts";

/** The committed expected texts, written by hand (SPEC §6), found from this file's place. */
export const EXPECTED_REAL = fileURLToPath(new URL("../expected/real.snapshot.txt", import.meta.url));
export const EXPECTED_FIXTURE = fileURLToPath(new URL("../expected/fixture.snapshot.txt", import.meta.url));

/** The fixture's own files: schema/0003…, schema/0004…, functions/, reference/. */
export const FIXTURE_FILES = fileURLToPath(new URL("./chain/", import.meta.url));

/** The real chain's two schema files that open the fixture chain, by name. */
export const REAL_SCHEMA_FILES = ["0001-roles.sql", "0002-os.sql"] as const;

/** The fixture's own schema files, in the chain's order; the last is the one SPEC §6 C.1 leaves out. */
export const FIXTURE_SCHEMA_FILES = ["0003-inside.sql", "0004-outside.sql"] as const;
export const LAST_SCHEMA_FILE = "0004-outside.sql";

/** The function file C.2 leaves out: its function's first form is made again by the last schema file. */
export const LEFT_OUT_FUNCTION = "parts_touch.sql";

/** The reference file C.3 leaves out. */
export const LEFT_OUT_REFERENCE = "kinds.json";

const bytesOf = (path: string): Buffer => readFileSync(path);

/** What a schema file of the fixture chain holds: the real chain's from db/schema, the fixture's own from here. */
export function schemaFileOfTheFixture(name: string): Buffer {
  const real = (REAL_SCHEMA_FILES as readonly string[]).includes(name);
  return bytesOf(join(real ? join(REAL_ROOT, "schema") : join(FIXTURE_FILES, "schema"), name));
}

/** The text of one of the fixture's function files — what a case runs again to put a function back. */
export const functionFileOfTheFixture = (name: string): string => readFileSync(join(FIXTURE_FILES, "functions", name), "utf8");

export type LeftOut = { schema?: readonly string[]; functions?: readonly string[]; reference?: readonly string[] };

/**
 * A root holding the fixture chain, but what `leftOut` names: schema/ with the real two files and the fixture's,
 * functions/ and reference/ with the fixture's files. A directory whose every file is left out still stands, empty.
 */
export function fixtureRoot(leftOut: LeftOut = {}): string {
  const schema = [...REAL_SCHEMA_FILES, ...FIXTURE_SCHEMA_FILES].filter((name) => !leftOut.schema?.includes(name));
  const root = chainRoot(Object.fromEntries(schema.map((name) => [name, schemaFileOfTheFixture(name)])));
  for (const pass of ["functions", "reference"] as const) {
    mkdirSync(join(root, pass));
    for (const name of readdirSync(join(FIXTURE_FILES, pass))) {
      if (leftOut[pass]?.includes(name)) continue;
      writeFileSync(join(root, pass, name), bytesOf(join(FIXTURE_FILES, pass, name)));
    }
  }
  return root;
}
