import { renameSync, rmSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ChainRefused, applyChain, type Offence } from "@dxb-foundation/chain";
import { PEOPLE, PLACES, REMARKS, VISITS, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot, emptyDirectory, inSchema } from "../fixtures/chain-on-disk.ts";
import { hasTheLedgersSchema, standingIn } from "../fixtures/looking.ts";
import { refusalOf } from "../fixtures/refusal.ts";
import { CASE_MS, inAThrowawayDatabase, type Throwaway } from "../fixtures/throwaway-database.ts";

// SPEC §4's second table on a real ledger, and SPEC §6 steps 1 and 4: the check
// comes before every write. Each case applies a chain of three, then spoils the
// disk — or, for the one fault no disk can make, the ledger, by the test's own hand.

const OTHER_SQL = "create table public.other (id integer);\n";

/** What is wrong, the hand that makes it so, and every offence the run must then say. */
type Fault = [what: string, spoil: (root: string, db: Throwaway) => Promise<void> | void, offences: Offence[]];

const FAULTS: Fault[] = [
  [
    "changed — an applied file is rewritten",
    (root) => writeFileSync(inSchema(root, "0002-places.sql"), `${PLACES.text}-- and a word more\n`),
    [{ kind: "changed", detail: "0002-places.sql" }],
  ],
  [
    "renamed — an applied file is given another name",
    (root) => renameSync(inSchema(root, "0002-places.sql"), inSchema(root, "0002-sites.sql")),
    [{ kind: "renamed", detail: "0002-places.sql 0002-sites.sql" }],
  ],
  [
    "missing — an applied file is removed",
    (root) => rmSync(inSchema(root, "0002-places.sql")),
    [{ kind: "missing", detail: "0002-places.sql" }],
  ],
  [
    "before-applied — a new file with a number lower than the last applied one",
    (root) => writeFileSync(inSchema(root, "0000-first-of-all.sql"), OTHER_SQL),
    [{ kind: "before-applied", detail: "0000-first-of-all.sql" }],
  ],
  [
    // A new file beside the applied one of that number is the disk's own duplicated-number; alone it stands where that one was.
    "before-applied — a new file with the number of the last applied one, which is gone: both faults are said",
    (root) => {
      rmSync(inSchema(root, "0003-visits.sql"));
      writeFileSync(inSchema(root, "0003-other.sql"), OTHER_SQL);
    },
    [
      { kind: "missing", detail: "0003-visits.sql" },
      { kind: "before-applied", detail: "0003-other.sql" },
    ],
  ],
  [
    // The runner never writes such a ledger. Rows 2 and 3 change places, by way of a position no row holds.
    "reordered — the ledger holds a file after one of a greater number",
    async (_root, db) => {
      for (const [from, to] of [[2, 99], [3, 2], [99, 3]]) {
        await db.client.query("update os_chain.ledger set position = $2 where position = $1", [from, to]);
      }
    },
    [{ kind: "reordered", detail: "0002-places.sql" }],
  ],
];

export function theCheck(): void {
  describe("the disk against a real ledger — each sentence of SPEC §4's second table", { timeout: CASE_MS }, () => {
    it.each(FAULTS)("%s", async (_what, spoil, offences) => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot(chainOf(PEOPLE, PLACES, VISITS));
        expect(await applyChain({ target: db.target, root })).toMatchObject({ state: "applied", standing: 3 });
        await spoil(root, db);
        // A rightly new file, after the last: with an offence standing, it is not applied either.
        writeFileSync(inSchema(root, REMARKS.name), REMARKS.text);
        const before = await standingIn(db.client);

        expect(await applyChain({ target: db.target, root })).toEqual({ state: "offences", offences });
        expect(await standingIn(db.client)).toEqual(before);
      });
    });
  });

  describe("nothing before the check", { timeout: CASE_MS }, () => {
    it("an empty database and a chain with an offence of the disk's own: the offence is said, and no schema os_chain is made", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot({ ...chainOf(PEOPLE), "0002-nothing.sql": "" });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "offences",
          offences: [{ kind: "empty", detail: "0002-nothing.sql" }],
        });
        expect(await hasTheLedgersSchema(db.client)).toBe(false);
        expect(await standingIn(db.client)).toMatchObject({ ledger: "no ledger", relations: [] });
      });
    });

    it("the disk is judged before the target is asked who it is: a database no list holds, and still the disk's offence is the answer", async () => {
      await inAThrowawayDatabase(async (db) => {
        db.relist([]);
        const root = chainRoot({ ...chainOf(PEOPLE), "0002-nothing.sql": "" });
        expect(await applyChain({ target: db.target, root })).toEqual({
          state: "offences",
          offences: [{ kind: "empty", detail: "0002-nothing.sql" }],
        });
        expect(await hasTheLedgersSchema(db.client)).toBe(false);
      });
    });

    it("a root with no schema/ is refused as no-chain, and no schema os_chain is made", async () => {
      await inAThrowawayDatabase(async (db) => {
        const refusal = await refusalOf(ChainRefused, () => applyChain({ target: db.target, root: emptyDirectory() }));
        expect(refusal.reason).toBe("no-chain");
        expect(await hasTheLedgersSchema(db.client)).toBe(false);
      });
    });
  });
}
