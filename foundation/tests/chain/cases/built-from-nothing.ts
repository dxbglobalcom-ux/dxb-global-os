import { describe, expect, it } from "vitest";
import { RUNNER_VERSION, applyChain } from "@dxb-foundation/chain";
import { PEOPLE, PLACES, VISITS, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot } from "../fixtures/chain-on-disk.ts";
import { ledgerOf, ledgerToTheInstant, serverClock, standingOf, valueOf } from "../fixtures/looking.ts";
import { CASE_MS, LOGIN, inAThrowawayDatabase } from "../fixtures/throwaway-database.ts";

// SPEC §9.4, "built from nothing": an empty database and a chain of three. The
// third file needs the two before it, so the order is not only said — it is what made the run pass.

const THE_THREE = ["0001-people.sql", "0002-places.sql", "0003-visits.sql"];

export function builtFromNothing(): void {
  describe("built from nothing — an empty database and a chain of three", { timeout: CASE_MS }, () => {
    it("applies the three in order, and their tables stand", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await applyChain({ target: db.target, root: chainRoot(chainOf(PEOPLE, PLACES, VISITS)) });
        expect(outcome).toEqual({ state: "applied", applied: THE_THREE, standing: 3 });
        expect(await standingOf(db.client, "public.people", "public.places", "public.visits")).toEqual(["public.people", "public.places", "public.visits"]);
      });
    });

    it("the ledger holds row 0 and one row for each: name, kind, the file's hash, the login, the runner's version, positions 1 to 3", async () => {
      await inAThrowawayDatabase(async (db) => {
        const before = await serverClock(db.client);
        await applyChain({ target: db.target, root: chainRoot(chainOf(PEOPLE, PLACES, VISITS)) });
        const after = await serverClock(db.client);

        const [bootstrap, ...files] = await ledgerOf(db.client);
        expect(bootstrap).toEqual({
          position: 0,
          file: "(ledger)",
          kind: "ledger",
          hash: expect.stringMatching(/^[0-9a-f]{64}$/),
          applied_by: LOGIN,
          runner_version: "1",
        });
        expect(files).toEqual([
          { position: 1, file: "0001-people.sql", kind: "schema", hash: PEOPLE.sha256, applied_by: LOGIN, runner_version: "1" },
          { position: 2, file: "0002-places.sql", kind: "schema", hash: PLACES.sha256, applied_by: LOGIN, runner_version: "1" },
          { position: 3, file: "0003-visits.sql", kind: "schema", hash: VISITS.sha256, applied_by: LOGIN, runner_version: "1" },
        ]);
        expect(RUNNER_VERSION).toBe("1");
        // `applied_at` is the server's clock when the row was written: within the run, as the server itself timed it.
        const outsideTheRun = "select count(*)::int from os_chain.ledger where applied_at < $1::timestamptz or applied_at > $2::timestamptz";
        expect(await valueOf(db.client, outsideTheRun, [before, after])).toBe(0);
      });
    });

    it("a file's row and what the file made were written by one transaction — and so were row 0 and the ledger's schema", async () => {
      await inAThrowawayDatabase(async (db) => {
        await applyChain({ target: db.target, root: chainRoot(chainOf(PEOPLE, PLACES)) });
        // SPEC §12.1: the transaction that wrote a row, as the server keeps it on the row itself.
        const writerOf = async (row: string, named: string): Promise<string> => String(await valueOf(db.client, `select xmin::text from ${row}`, [named]));
        const ofTheLedgerRow = "os_chain.ledger where file = $1";
        const ofTheTable = "pg_catalog.pg_class where oid = $1::regclass";

        const people = await writerOf(ofTheLedgerRow, "0001-people.sql");
        const places = await writerOf(ofTheLedgerRow, "0002-places.sql");
        const bootstrap = await writerOf(ofTheLedgerRow, "(ledger)");
        expect(await writerOf(ofTheTable, "public.people")).toBe(people);
        expect(await writerOf(ofTheTable, "public.places")).toBe(places);
        expect(await writerOf("pg_catalog.pg_namespace where nspname = $1", "os_chain")).toBe(bootstrap);
        // Three transactions the server numbered, each file in its own: the equalities above are not of three empty answers.
        expect([bootstrap, people, places].join(" ")).toMatch(/^\d+ \d+ \d+$/);
        expect(new Set([bootstrap, people, places]).size).toBe(3);
      });
    });

    it("a second run applies nothing and changes no row", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot(chainOf(PEOPLE, PLACES, VISITS));
        expect(await applyChain({ target: db.target, root })).toMatchObject({ state: "applied", applied: THE_THREE });
        const afterTheFirst = await ledgerToTheInstant(db.client);
        expect(afterTheFirst).toHaveLength(4);

        expect(await applyChain({ target: db.target, root })).toEqual({ state: "applied", applied: [], standing: 3 });
        expect(await ledgerToTheInstant(db.client)).toEqual(afterTheFirst);
      });
    });
  });
}
