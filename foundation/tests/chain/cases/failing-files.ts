import { writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { PEOPLE, chainOf } from "../fixtures/chain-files.ts";
import { chainRoot, inSchema } from "../fixtures/chain-on-disk.ts";
import { columnOf, filesLedgered, standingOf } from "../fixtures/looking.ts";
import { CASE_MS, inAThrowawayDatabase } from "../fixtures/throwaway-database.ts";

// SPEC §6 steps 6 and 7 and §9.4: a file is one transaction that the runner
// owns. A file that fails leaves nothing of itself; so does a file that opens
// or closes a transaction — the server refuses it in the act (SPEC §3).

const HALF_MADE = "create table public.half_made (id integer);";
const AFTER_IT = "create table public.after_it (id integer);";

/** A file that makes a table, then says `statement`, then would make another. */
const withInTheMiddle = (statement: string): string => `${HALF_MADE}\n${statement}\n${AFTER_IT}\n`;

/** A chain of three whose second file makes a table and then divides by zero. */
const brokenInTheMiddle = (): string =>
  chainRoot({ ...chainOf(PEOPLE), "0002-broken.sql": withInTheMiddle("select 1/0;"), "0003-later.sql": "create table public.later (id integer);\n" });

export function failingFiles(): void {
  describe("a failing file", { timeout: CASE_MS }, () => {
    it("the second of three fails after making a table: file-failed, the first stands ledgered, nothing of the second or third", async () => {
      await inAThrowawayDatabase(async (db) => {
        const outcome = await applyChain({ target: db.target, root: brokenInTheMiddle() });
        expect(outcome).toEqual({ state: "file-failed", file: "0002-broken.sql", message: expect.stringContaining("division by zero"), applied: ["0001-people.sql"] });
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-people.sql"]);
        expect(await standingOf(db.client, "public.people", "public.half_made", "public.after_it", "public.later")).toEqual(["public.people"]);
      });
    });

    it("the file corrected: the next run applies it and the one after it", async () => {
      await inAThrowawayDatabase(async (db) => {
        const root = brokenInTheMiddle();
        expect(await applyChain({ target: db.target, root })).toMatchObject({ state: "file-failed", file: "0002-broken.sql" });

        writeFileSync(inSchema(root, "0002-broken.sql"), withInTheMiddle("select 1/1;"));
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "applied", applied: ["0002-broken.sql", "0003-later.sql"], standing: 3 });
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-people.sql", "0002-broken.sql", "0003-later.sql"]);
        expect(await standingOf(db.client, "public.half_made", "public.after_it", "public.later")).toEqual(["public.half_made", "public.after_it", "public.later"]);
      });
    });
  });

  describe("a file that opens or closes a transaction", { timeout: CASE_MS }, () => {
    it.each([
      ["commit", "commit;"],
      ["rollback", "rollback;"],
      ["begin", "begin;"],
      ["savepoint", "savepoint here;"],
      ["a do block that commits", "do $$ begin commit; end $$;"],
    ])("%s in the middle of a file: file-failed with a message that says transaction, and the statements before it left nothing", async (_what, statement) => {
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot({ ...chainOf(PEOPLE), "0002-closes.sql": withInTheMiddle(statement) });
        const outcome = await applyChain({ target: db.target, root });
        expect(outcome).toEqual({ state: "file-failed", file: "0002-closes.sql", message: expect.stringContaining("transaction"), applied: ["0001-people.sql"] });
        expect(await standingOf(db.client, "public.people", "public.half_made", "public.after_it")).toEqual(["public.people"]);
        expect(await filesLedgered(db.client)).toEqual(["(ledger)", "0001-people.sql"]);
      });
    });

    it("a file with a plpgsql body, and the words inside a string and a comment, is applied", async () => {
      const spellsTheWords = [
        "create table public.said (word text);",
        "create function public.spelled() returns text language plpgsql as $$ begin return 'commit; rollback;'; end $$;",
        "insert into public.said select public.spelled(); -- commit;",
        "/* rollback; savepoint here; */ insert into public.said values ('begin;');",
        "",
      ].join("\n");
      await inAThrowawayDatabase(async (db) => {
        const root = chainRoot({ "0001-spells-the-words.sql": spellsTheWords });
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "applied", applied: ["0001-spells-the-words.sql"], standing: 1 });
        expect(await columnOf(db.client, "select word from public.said order by word")).toEqual(["begin;", "commit; rollback;"]);
      });
    });
  });
}
