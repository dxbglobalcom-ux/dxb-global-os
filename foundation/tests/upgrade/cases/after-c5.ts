import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect } from "vitest";
import { connectionString, loginConnectionString } from "@dxb-foundation/bench";
import { rowsOf } from "@dxb-foundation/chain";
import { logins } from "../../roles/fixtures/bench-command.ts";
import { asLogin } from "../../roles/fixtures/tcp-logins.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { asTheSuperuser } from "../../snapshot/fixtures/superuser.ts";
import { aTemporaryDirectory } from "../fixtures/a-repository.ts";
import { COMMAND_MS, expectRowsPrinted, rowsPrinted } from "../fixtures/the-rows.ts";
import { EXPECTED_B_ROWS } from "../fixtures/the-roots.ts";

// Piece 6b's SPEC §10.1 rows 7, 8 and 10, on the upgraded instance after C.5 (SOL.md B1, B2, B7): tables the bench's
// superuser makes in os — each row one line, once, written down here by hand; who may read the rows' text — a login
// that row security would filter is refused, and one without USAGE on os_chain is not refused for the ledger it is not
// asked to read; the command's stdout, byte for byte; a table of 150,000 rows read whole.

/** What the superuser makes in os (row 10): a partitioned table and two partitions, a parent and a child, an unlogged table, a table with no column, a table and a column whose names need quotes — a row or two in each. */
const MADE_BY_THE_SUPERUSER = [
  "create table os.measured (at integer, v text) partition by range (at)",
  "create table os.measured_low partition of os.measured for values from (0) to (10)",
  "create table os.measured_high partition of os.measured for values from (10) to (20)",
  "insert into os.measured values (1, 'low'), (11, 'high')",
  "create table os.base (id integer)",
  "create table os.derived (extra text) inherits (os.base)",
  "insert into os.base values (1)",
  "insert into os.derived values (2, 'child')",
  "create unlogged table os.scratch (id integer)",
  "insert into os.scratch values (7)",
  "create table os.nothing ()",
  "insert into os.nothing default values",
  "insert into os.nothing default values",
  'create table os."Odd Table" ("Odd Column" integer, "a""b" text)',
  `insert into os."Odd Table" values (1, 'q')`,
];

/**
 * The rows' text after them, written by hand from SPEC §4: the partitions' rows under the partitions' names and none
 * under the parent's; the parent's own row and the child's each under its own table; two equal `{}` lines; the quoted
 * table as `regclass` spells it, its key `a"b` escaped by JSON and its backslash doubled by the text. Beside them, what
 * C.5 left: B's seeded row, os.parts without P-3 and with P-2's grade 4, os.ticket_seq at its start. jsonb orders a
 * row's keys shorter first.
 */
const C6_TEXT = [
  "rows-format 1",
  String.raw`row os."Odd Table" {"a\\"b": "q", "Odd Column": 1}`,
  'row os.base {"id": 1}',
  'row os.derived {"id": 2, "extra": "child"}',
  'row os.measured_high {"v": "high", "at": 11}',
  'row os.measured_low {"v": "low", "at": 1}',
  'row os.notes {"note": "seeded by B"}',
  "row os.nothing {}",
  "row os.nothing {}",
  'row os.parts {"id": 10, "qty": 1, "code": "P-1", "kind": "bolt", "size": 10, "grade": 3, "amount": 0.3333, "ratio4": 0.1, "ratio8": 0.0000001}',
  'row os.parts {"id": 20, "qty": 2, "code": "P-2", "kind": "nut", "size": 20, "grade": 4, "amount": 12.5000, "ratio4": 0.5, "ratio8": 0.30000000000000004}',
  String.raw`row os.parts {"id": 40, "qty": 4, "code": "P-4 one\\ntwo\\\\three\\rfour ş", "kind": "bolt", "size": 40, "grade": 3, "amount": -7.0001, "ratio4": 1.25, "ratio8": -0.000000025}`,
  'row os.parts {"id": 50, "qty": 5, "code": "P-5", "kind": "nut", "size": 50, "grade": 3, "amount": 0.0000, "ratio4": -0.75, "ratio8": 100}',
  'row os.scratch {"id": 7}',
  "sequence-position os.parts_id_seq 50 called t ascending t",
  "sequence-position os.ticket_seq 100 called f ascending t",
  "",
].join("\n");

/** The login of rows 7 and 10: os_reader over TCP, with the password the install step gave it — never printed. */
const theReader = (): { connectionString: string } => ({ connectionString: loginConnectionString("os_reader") });

/** What os_reader may do, said by its own session: USAGE on os and on os_chain, SELECT on os.parts. */
const whatTheReaderMay = (): Promise<unknown> =>
  asLogin(theReader().connectionString, async (client) => {
    const { rows } = await client.query({
      text: "select pg_catalog.has_schema_privilege('os', 'USAGE'), pg_catalog.has_schema_privilege('os_chain', 'USAGE'), pg_catalog.has_table_privilege('os.parts', 'SELECT')",
      rowMode: "array",
    });
    return rows[0];
  });

export function afterC5(step: Step, cLostAndBack: readonly string[]): void {
  step("C.6 (§10.1 row 10) the superuser makes in os a partitioned table and two partitions, a parent and a child that inherits it, an unlogged table, a table with no column, a quoted table and column — rows is exactly the lines written here, by the command and by the library", 3 * COMMAND_MS, async () => {
    for (const statement of MADE_BY_THE_SUPERUSER) await asTheSuperuser(statement);
    await expectRowsPrinted(C6_TEXT);
    expect(await rowsOf({ connectionString: connectionString() })).toBe(C6_TEXT);
  });

  step("C.7 (§10.1 row 10) os_reader, given SELECT on every table and sequence of os, with row security standing on os.parts — its policy parts_read would filter: rowsOf through it rejects with the server's refusal of row security, and gives no text", 3 * COMMAND_MS, async () => {
    const said = await logins(COMMAND_MS);
    expect(said.lastLine).toMatch(/^LOGINS_SET logins=4 /);
    expect(said.code).toBe(0);
    await asTheSuperuser("grant select on all tables in schema os to os_reader");
    await asTheSuperuser("grant select on all sequences in schema os to os_reader");
    expect(await whatTheReaderMay()).toEqual([true, false, true]);
    await expect(rowsOf(theReader())).rejects.toThrow('query would be affected by row-level security policy for table "parts"');
  });

  step("C.8 (§10.1 row 7) the same login, row security lifted from os.parts by the superuser and still no USAGE on os_chain: rowsOf through it is C.6's text — the ledger it is not asked to read refuses nothing; row security put back", 3 * COMMAND_MS, async () => {
    await asTheSuperuser("alter table os.parts no force row level security");
    await asTheSuperuser("alter table os.parts disable row level security");
    try {
      expect(await whatTheReaderMay()).toEqual([true, false, true]);
      expect(await rowsOf(theReader())).toBe(C6_TEXT);
    } finally {
      await asTheSuperuser("alter table os.parts enable row level security");
      await asTheSuperuser("alter table os.parts force row level security");
    }
  });

  step("C.9 (§10.1 row 10) rows --kept, its raw stdout byte for byte, final newline and all: ROWS_KEPT against C.6's text; ROWS_RED against b.rows.txt — C.5's difference", 2 * COMMAND_MS, async () => {
    const before = join(aTemporaryDirectory("dxb-foundation-upgrade-c6-"), "c6.rows.txt");
    writeFileSync(before, C6_TEXT);
    const kept = await rowsPrinted(["--kept", before]);
    expect(kept.stdout, kept.stderr.slice(-1_500)).toBe("ROWS_KEPT rows=13 sequences=2\n");
    expect(kept.code).toBe(0);
    const red = await rowsPrinted(["--kept", EXPECTED_B_ROWS]);
    expect(red.stdout, red.stderr.slice(-1_500)).toBe(`${cLostAndBack.join("\n")}\n`);
    expect(red.code).toBe(1);
  });

  step("C.10 (§10.1 row 8) a table of 150,000 rows made by the superuser in os: rowsOf reads it whole — 150,000 lines of it, the first and the last as written, the rest C.6's text; dropped after", 3 * COMMAND_MS, async () => {
    await asTheSuperuser("create table os.many (n integer)");
    try {
      await asTheSuperuser("insert into os.many select g from pg_catalog.generate_series(100000, 249999) g");
      const text = await rowsOf({ connectionString: connectionString() });
      const many = text.split("\n").filter((line) => line.startsWith("row os.many "));
      expect(many).toHaveLength(150_000);
      expect(many[0]).toBe('row os.many {"n": 100000}');
      expect(many[149_999]).toBe('row os.many {"n": 249999}');
      expect(text.split("\n").filter((line) => !line.startsWith("row os.many ")).join("\n")).toBe(C6_TEXT);
    } finally {
      await asTheSuperuser("drop table os.many");
    }
  });
}
