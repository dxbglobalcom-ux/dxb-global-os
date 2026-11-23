import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { inSchema } from "../../chain/fixtures/chain-on-disk.ts";
import { valueOf } from "../../chain/fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../../chain/fixtures/throwaway-database.ts";
import { rowsIn, rowsToTheInstant } from "../fixtures/looking-at-os.ts";
import { referenceFailedAt } from "../fixtures/outcomes.ts";
import { KINDS_TABLE, MAKES_OS, ROUTING_RULES_SEEDED, SEVERITIES_TABLE, TOPICS_TABLE, WHAT_THE_KINDS_SEQUENCE_GAVE, fileOf, marked } from "../fixtures/pass-files.ts";
import { inReference, passesRoot, standsWith, type Files } from "../fixtures/passes-on-disk.ts";

// SPEC §12.5: a table is a vocabulary because the schema file that made it says so — its
// comment begins with the word `vocabulary`. A file named after a table that carries no
// such mark is refused, an empty array too: his policy is not rewritten or emptied by a
// file planted beside the vocabularies. And §12.13: the order a file's faults are said in,
// every file judged before any row of any table is written.

const NOTES_THAT_CASCADE = "create table os.notes (id integer primary key, topic text constraint note_topic references os.topics (name) on delete cascade);\n";

// the two faults · what 0001-os.sql makes after os · the files · the file and the message said
const TWO_FAULTS: [string, string, Files, string, string][] = [
  [
    "no mark, and a key of the file that is no column: the mark is said",
    TOPICS_TABLE,
    { "topics.json": fileOf({ name: "weather", colour: "red" }) },
    "topics.json",
    "os.topics is not marked as a vocabulary",
  ],
  [
    "a column named twice in a row, and that column no column of the table: the column named twice is said",
    TOPICS_TABLE + marked("topics"),
    { "topics.json": '[\n  {"name": "weather", "colour": "red", "colour": "blue"}\n]\n' },
    "topics.json",
    "the file names the column colour twice in one row",
  ],
  [
    "a key twice, and a reference that writes: the key is said",
    TOPICS_TABLE + marked("topics") + NOTES_THAT_CASCADE,
    { "topics.json": fileOf({ name: "weather" }, { name: "weather" }) },
    "topics.json",
    "the file holds a key twice: weather",
  ],
  [
    "the first file by name with the last of the faults, the second with the first of them: the first file's is said",
    TOPICS_TABLE + marked("topics") + NOTES_THAT_CASCADE,
    { "topics.json": fileOf({ name: "weather" }), "zz_gone.json": fileOf({ name: "nothing of this name stands" }) },
    "topics.json",
    "the reference note_topic on os.notes writes when a row of os.topics is removed or changed",
  ],
];

export function referenceMarkedAndJudged(): void {
  describe("the reference pass — a table is a vocabulary because the schema says so", { timeout: CASE_MS }, () => {
    it.each([
      ["rows of its own", fileOf({ rule: "default", model: "small" }, { rule: "at night", model: "medium" })],
      ["an empty array", "[]\n"],
    ])("a file planted for a table of his policy, holding %s: os.<table> is not marked as a vocabulary — his rows as he left them", async (_what, planted) => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + ROUTING_RULES_SEEDED } });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1 });
        await db.client.query("update os.routing_rules set model = 'large' where rule = 'default'");
        const asHeLeftIt = await rowsToTheInstant(db.client, "os.routing_rules");
        expect(asHeLeftIt).toHaveLength(1);

        standsWith(root, "reference", { "routing_rules.json": planted });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("routing_rules.json", "os.routing_rules is not marked as a vocabulary"));
        expect(await rowsToTheInstant(db.client, "os.routing_rules")).toEqual(asHeLeftIt);
      });
    });

    it.each(["the vocabulary of topics", "topics: a vocabulary"])("a comment that does not begin with the word — '%s' — is no mark, and the table is not written", async (comment) => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": `${MAKES_OS}${TOPICS_TABLE}comment on table os.topics is '${comment}';\n` },
          reference: { "topics.json": fileOf({ name: "weather" }) },
        });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("topics.json", "os.topics is not marked as a vocabulary", ["0001-os.sql"]));
        expect(await valueOf(db.client, "select count(*)::int from os.topics")).toBe(0);
      });
    });

    it("the mark brought by a later schema file: the table that was refused is written by the run that marks it", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + TOPICS_TABLE }, reference: { "topics.json": fileOf({ name: "weather" }, { name: "tides" }) } });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("topics.json", "os.topics is not marked as a vocabulary", ["0001-os.sql"]));
        expect(await valueOf(db.client, "select count(*)::int from os.topics")).toBe(0);

        writeFileSync(inSchema(root, "0002-topics-are-a-vocabulary.sql"), "comment on table os.topics is 'vocabulary: what a note may be about';\n");
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0002-topics-are-a-vocabulary.sql"], standing: 2, reference: 1 });
        expect(await rowsIn(db.client, 'select name from os.topics order by name collate "C"')).toEqual([{ name: "tides" }, { name: "weather" }]);
      });
    });
  });

  describe("the reference pass — the judgement's order", { timeout: CASE_MS }, () => {
    it.each(TWO_FAULTS)("%s", async (_what, made, reference, file, message) => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({ schema: { "0001-os.sql": MAKES_OS + made }, reference });
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt(file, message, ["0001-os.sql"]));
        expect(await valueOf(db.client, "select count(*)::int from os.topics")).toBe(0);
      });
    });

    it("every file is judged before any row is written: a value of the wrong type in the second file, and the first table never drew from its sequence", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = passesRoot({
          schema: { "0001-os.sql": MAKES_OS + KINDS_TABLE + SEVERITIES_TABLE },
          reference: { "kinds.json": fileOf({ name: "plain", label: "Plain" }, { name: "urgent", label: "Urgent" }), "severities.json": fileOf({ level: "low", rank: 1 }) },
        });
        expect(await applyChain({ target: db.target, root })).toStrictEqual({ state: "applied", applied: ["0001-os.sql"], standing: 1, reference: 2 });
        expect(await valueOf(db.client, WHAT_THE_KINDS_SEQUENCE_GAVE)).toBe("2, given");
        const kinds = await rowsToTheInstant(db.client, "os.kinds");

        // The first file by name gains a row; the second carries a value its column cannot read.
        writeFileSync(inReference(root, "kinds.json"), fileOf({ name: "plain", label: "Plain" }, { name: "urgent", label: "Urgent" }, { name: "late", label: "Late" }));
        writeFileSync(inReference(root, "severities.json"), fileOf({ level: "low", rank: 1 }, { level: "high", rank: "heavy" }));
        expect(await applyChain({ target: db.target, root })).toEqual(referenceFailedAt("severities.json", 'invalid input syntax for type integer: "heavy"'));
        expect(await valueOf(db.client, WHAT_THE_KINDS_SEQUENCE_GAVE)).toBe("2, given");
        expect(await rowsToTheInstant(db.client, "os.kinds")).toEqual(kinds);
      });
    });
  });
}
