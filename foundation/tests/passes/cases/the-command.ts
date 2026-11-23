import { beforeAll, describe, expect, it } from "vitest";
import { applyChain } from "@dxb-foundation/chain";
import { chainCommand } from "../../chain/fixtures/command.ts";
import { hasTheLedgersSchema, standingIn } from "../../chain/fixtures/looking.ts";
import { inAThrowawayDatabase, onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import { greets } from "../fixtures/pass-files.ts";
import { passesRoot, type Files } from "../fixtures/passes-on-disk.ts";

// SPEC §8 and §9.3, "the command": started as it is run, by path, with PATH and nothing
// else. Its target is the instance's own `postgres` database, so each call here must end at
// the disk, before any connection. A runner that did not read the passes' directories would
// not end there: it would go on and write its ledger into that database. So the command is
// started only after the library — the very run the command makes — has answered the same
// root from the disk alone, in a throwaway database; a case that fails there starts nothing.

const COMMAND_MS = 30_000;

export function theCommand(): void {
  describe("the command", { timeout: COMMAND_MS }, () => {
    // Taken before the first call below: the instance's own database as these cases found it.
    let before: Awaited<ReturnType<typeof standingIn>> | undefined;
    beforeAll(async () => {
      before = await onTheInstance(standingIn);
    }, COMMAND_MS);

    it.each<[string, { functions?: Files; reference?: Files }, string, string]>([
      ["functions/ holds an entry off the pattern", { functions: { "Greet.sql": greets("hello") } }, "unknown-entry", "functions/Greet.sql"],
      ["reference/ holds a file that is no array of objects", { reference: { "event_types.json": '{"name": "job.opened"}\n' } }, "malformed", "reference/event_types.json"],
    ])("up --root <a root whose %s>: the OFFENCE line, then CHAIN_RED offences=1, exit 1", async (_what, passes, kind, detail) => {
      const root = passesRoot(passes);
      await inAThrowawayDatabase(async (db) => {
        expect(await applyChain({ target: db.target, root })).toEqual({ state: "offences", offences: [{ kind, detail }] });
        expect(await hasTheLedgersSchema(db.client)).toBe(false);
      });

      const said = await chainCommand(["up", "--root", root], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([`OFFENCE ${kind} ${detail}`, "CHAIN_RED offences=1"]);
      expect(said.code).toBe(1);
    });

    it("after them, the instance's own postgres database is as it was found: its ledger to the instant, or none, and its schemas", async () => {
      // Not its relations: the bench's own services make some as they run (piece 3's SPEC §12a).
      const ledgerAndSchemas = ({ ledger, schemas }: Awaited<ReturnType<typeof standingIn>>) => ({ ledger, schemas });
      expect(before).toBeDefined();
      if (before === undefined) return;
      expect(ledgerAndSchemas(await onTheInstance(standingIn))).toEqual(ledgerAndSchemas(before));
    });
  });
}
