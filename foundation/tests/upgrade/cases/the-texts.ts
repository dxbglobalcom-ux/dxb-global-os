import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { differenceOf, readChain, readPasses } from "@dxb-foundation/chain";
import { FIXTURE_SCHEMA_FILES, REAL_SCHEMA_FILES, schemaFileOfTheFixture } from "../../snapshot/fixtures/the-chains.ts";
import { offencesOf } from "../../snapshot/fixtures/the-form.ts";
import { rowsOffencesOf } from "../fixtures/the-rows-form.ts";
import { B_SCHEMA_FILE, EXPECTED_A_ROWS, EXPECTED_B, EXPECTED_B_ROWS, EXPECTED_FIXTURE, FROM_TXT, bFile, rootB, rootC } from "../fixtures/the-roots.ts";

// Piece 6b's SPEC §6 A.3: the three expected texts obey their form and hold no line of a kind their table does not
// name; b.snapshot.txt is 6a's fixture text with exactly the lines B's files cause; real/from.txt is a commit id.

/** The lines B's files change in 6a's fixture text, written down from 6a §4.3 — what b.snapshot.txt was made from. */
const A_ONLY = [
  "function os.next_ticket(text,double precision) kind f owner os_owner language sql returns text definer f volatility v strict f parallel u leakproof f cost 100 rows 0",
  "function-arguments os.next_ticket(text,double precision) prefix text DEFAULT 'T-'::text, scale double precision DEFAULT 0.1",
  "function-body os.count_parts(integer) 00001|select count(*) from os.parts where qty >= min_qty",
  "function-body os.next_ticket(text,double precision) 00001|select prefix || nextval('os.ticket_seq')::text || (scale * 1)::text",
  "grant function os.next_ticket(text,double precision) to os_owner EXECUTE option f by os_owner stored",
  'reference os.kinds {"name": "bolt", "label": "Bolt", "weight": 0.1}',
  'reference os.kinds {"name": "washer", "label": "Washer", "weight": 0.30000000000000004}',
];
const B_ONLY = [
  "column os.notes 1 note type text not-null t identity - generated - collation - default -",
  "column os.parts 8 grade type integer not-null t identity - generated - collation - default 3",
  "column os.parts 9 size type integer not-null t identity - generated - collation - default -",
  "constraint os.parts parts_size_check type c deferrable f deferred f validated t def CHECK ((size > 0))",
  "function os.next_ticket(text) kind f owner os_owner language sql returns text definer f volatility v strict f parallel u leakproof f cost 100 rows 0",
  "function-arguments os.next_ticket(text) prefix text DEFAULT 'T-'::text",
  "function-body os.count_parts(integer) 00001|select count(*) from os.parts where qty > min_qty",
  "function-body os.next_ticket(text) 00001|select prefix || nextval('os.ticket_seq')::text",
  "grant function os.next_ticket(text) to os_owner EXECUTE option f by os_owner stored",
  ...["DELETE", "INSERT", "MAINTAIN", "REFERENCES", "SELECT", "TRIGGER", "TRUNCATE", "UPDATE"].map((privilege) => `grant relation os.notes to os_owner ${privilege} option f by os_owner stored`),
  "grant relation os.notes to os_reader SELECT option f by os_owner stored",
  "index os.parts valid t replident f clustered f def CREATE INDEX parts_code_idx ON os.parts USING btree (code)",
  "ledger 5 0005-grade-size-notes.sql schema 84045c55951c232b139cd8a61ce7840d4d8051e0cf32b430fb055ec0dd56a20d runner 1",
  'reference os.kinds {"name": "bolt", "label": "Bolt, steel", "weight": 0.1}',
  'reference os.kinds {"name": "pin", "label": "Pin", "weight": 2.5}',
  "relation os.notes kind r owner os_owner persistence p rowsecurity f force f replident d options -",
];

const sha256 = (bytes: Buffer): string => createHash("sha256").update(bytes).digest("hex");

export function theTextsCases(): void {
  describe("A.3 the rows' texts obey SPEC §4's form and hold only its two kinds of line", () => {
    it("the judge is seen to work first: it finds each offence planted in a text that is otherwise in the form", () => {
      const good = 'rows-format 1\nrow os.a {"id": 1}\nsequence-position os.s 1 called f ascending t\n';
      expect(rowsOffencesOf(good)).toEqual([]);
      const planted: [string, string][] = [
        ['rows-format 1\nrow os.a {"id": 1}', "no final newline"],
        ['rows-format 1\r\nrow os.a {"id": 1}\n', "a carriage return"],
        ['snapshot-format 1\nrow os.a {"id": 1}\n', `line 1 is not "rows-format 1"`],
        ['rows-format 1\nrow os.b {"id": 1}\nrow os.a {"id": 1}\n', "line 3 is out of order"],
        ['rows-format 1\n\nrow os.a {"id": 1}\n', "line 2 is empty"],
        ["rows-format 1\nschema os owner os_owner\n", "line 2 is of no kind §4 names: schema"],
        ['rows-format 1\nrow  os.a {"id": 1}\n', "line 2 has a double space outside its last field"],
        ["rows-format 1\nsequence-position os.s 1 called f\n", "line 2 is not of its kind's shape: sequence-position os.s 1 called f"],
        ['rows-format 1\nrow os.kinds {"name": "bolt"}\n', "line 2 is a row of a table the snapshot reads: os.kinds"],
        ['rows-format 1\nrow os_chain.ledger {"position": 0}\n', "line 2 is a row of a table the snapshot reads: os_chain.ledger"],
      ];
      for (const [text, offence] of planted) expect(rowsOffencesOf(text)).toContain(offence);
    });

    it.each([
      ["a.rows.txt", EXPECTED_A_ROWS],
      ["b.rows.txt", EXPECTED_B_ROWS],
    ])("expected/%s: the first line, sorted by bytes, no \\r, no empty line, a final newline, only row and sequence-position lines of their shapes", (_name, path) => {
      expect(rowsOffencesOf(readFileSync(path, "utf8"))).toEqual([]);
    });

    it("a.rows.txt holds the five rows given and the two sequences; b.rows.txt the same five, the seeded row and the same two", () => {
      const kinds = (path: string): string[] => readFileSync(path, "utf8").split("\n").slice(1, -1).map((line) => line.split(" ").slice(0, 2).join(" "));
      expect(kinds(EXPECTED_A_ROWS)).toEqual([...Array(5).fill("row os.parts"), "sequence-position os.parts_id_seq", "sequence-position os.ticket_seq"]);
      expect(kinds(EXPECTED_B_ROWS)).toEqual(["row os.notes", ...Array(5).fill("row os.parts"), "sequence-position os.parts_id_seq", "sequence-position os.ticket_seq"]);
    });
  });

  describe("A.3 b.snapshot.txt: 6a's form, and 6a's fixture text with exactly the lines B's files cause", () => {
    it("the first line, sorted by bytes, no \\r, no empty line, no double space outside a last field, a final newline, every line of 6a §4.3's kinds and shapes", () => {
      expect(offencesOf(readFileSync(EXPECTED_B, "utf8"))).toEqual([]);
    });

    it("against 6a's committed fixture text: out the lines A's next_ticket, count_parts body and two vocabulary rows made; in the lines B's files make", () => {
      expect(differenceOf(readFileSync(EXPECTED_FIXTURE, "utf8"), readFileSync(EXPECTED_B, "utf8"))).toEqual({ expectedOnly: A_ONLY, actualOnly: B_ONLY });
    });

    it("its ledger carries each schema file's SHA-256, as the runner writes it: the real two, the fixture's two, then B's 0005", () => {
      const ledger = readFileSync(EXPECTED_B, "utf8").split("\n").filter((line) => line.startsWith("ledger ") && !line.startsWith("ledger 0 "));
      const a = [...REAL_SCHEMA_FILES, ...FIXTURE_SCHEMA_FILES].map((name, at) => `ledger ${at + 1} ${name} schema ${sha256(schemaFileOfTheFixture(name))} runner 1`);
      expect(ledger).toEqual([...a, `ledger 5 ${B_SCHEMA_FILE} schema ${sha256(bFile("schema", B_SCHEMA_FILE))} runner 1`]);
    });

    it("B's root and C's, assembled, read with no offence: five and six schema files, A's three function files with B's two, B's reference file", () => {
      for (const [root, last] of [
        [rootB(), B_SCHEMA_FILE],
        [rootC(), "0006-rows-decide.sql"],
      ] as const) {
        const chain = readChain(root);
        expect(chain.offences).toEqual([]);
        expect(chain.files.map((file) => file.name).at(-1)).toBe(last);
        const passes = readPasses(root);
        expect(passes.offences).toEqual([]);
        expect(passes.functions?.map((file) => file.name)).toEqual(["count_parts.sql", "next_ticket.sql", "parts_touch.sql"]);
        expect(passes.reference?.map((file) => file.name)).toEqual(["kinds.json"]);
        expect(passes.functions?.find((file) => file.name === "next_ticket.sql")?.text).toBe(bFile("functions", "next_ticket.sql").toString("utf8"));
      }
    });
  });

  describe("A.3 real/from.txt (SPEC §7)", () => {
    it("is forty lower-case hex digits and one newline", () => {
      expect(readFileSync(FROM_TXT, "utf8")).toMatch(/^[0-9a-f]{40}\n$/);
    });
  });
}
