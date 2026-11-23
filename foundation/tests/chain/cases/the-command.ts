import { beforeAll, describe, expect, it } from "vitest";
import { chainRoot, emptyDirectory } from "../fixtures/chain-on-disk.ts";
import { chainCommand } from "../fixtures/command.ts";
import { standingIn } from "../fixtures/looking.ts";
import { onTheInstance } from "../fixtures/throwaway-database.ts";

// SPEC §8 and §9.4, "the command": started as it is run, by path, with PATH and
// nothing else. Its target is the instance's own `postgres` database, so every
// call here is one that ends before any connection — a disk offence, no chain,
// a wrong spelling — and the last case sees that the database is as it was
// before the first (SPEC §12.6: from piece 5 on a ledger rightly stands there).
// Where a spelling could be taken for a plain `up`, a root with no chain stands
// before it: the worst a wrong parse can then answer is no-chain.

const COMMAND_MS = 30_000;
const USAGE = "usage: cli.ts up [--root <dir>] [--wait <seconds>]";

export function theCommand(): void {
  describe("the command", { timeout: COMMAND_MS }, () => {
    // Taken before the first call below: the instance's own database as these cases found it.
    let before: Awaited<ReturnType<typeof standingIn>> | undefined;
    beforeAll(async () => {
      before = await onTheInstance(standingIn);
    }, COMMAND_MS);

    it("up --root <a root with a disk offence>: the OFFENCE line, then CHAIN_RED, exit 1", async () => {
      const root = chainRoot({ "0001-nothing.sql": "" });
      const said = await chainCommand(["up", "--root", root], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual(["OFFENCE empty 0001-nothing.sql", "CHAIN_RED offences=1"]);
      expect(said.code).toBe(1);
    });

    it("up --root <dir> --wait <a positive integer> is the same command: the wait is taken, and the answer is the disk's", async () => {
      const root = chainRoot({ "0001-nothing.sql": "" });
      const said = await chainCommand(["up", "--root", root, "--wait", "5"], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual(["OFFENCE empty 0001-nothing.sql", "CHAIN_RED offences=1"]);
      expect(said.code).toBe(1);
    });

    it("up --root <dir> --wait <five digits> is taken too: the answer is the disk's", async () => {
      const said = await chainCommand(["up", "--root", emptyDirectory(), "--wait", "99999"], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual(["CHAIN_REFUSED no-chain"]);
      expect(said.code).toBe(2);
    });

    it("up --root <a directory with no schema/>: CHAIN_REFUSED no-chain, exit 2", async () => {
      const said = await chainCommand(["up", "--root", emptyDirectory()], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual(["CHAIN_REFUSED no-chain"]);
      expect(said.code).toBe(2);
    });

    it.each<[string, string[]]>([
      ["a wrong word", ["down"]],
      ["the word in capitals", ["UP"]],
      ["no word at all", []],
      // No root can stand before this one — `--root` is the word it spells wrongly. Taken for a root named
      // `--wait`, it answers no-chain: no such directory stands where the command is started. Taken for a
      // plain `up`, it would reach the instance — and the last case below would say so.
      ["up --root with an option's name where its value belongs", ["up", "--root", "--wait"]],
    ])("%s: the usage line, exit 2", async (_what, args) => {
      const said = await chainCommand(args, COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([USAGE]);
      expect(said.code).toBe(2);
    });

    it.each<[string, string[]]>([
      ["a word after the options", ["extra"]],
      ["an option the command does not have", ["--target", "postgres"]],
      ["--wait 0", ["--wait", "0"]],
      ["--wait with a fraction", ["--wait", "1.5"]],
      ["--wait with a word", ["--wait", "soon"]],
      ["--wait with nothing after it", ["--wait"]],
      ["--wait with six digits", ["--wait", "100000"]],
    ])("up --root <dir> and then %s: the usage line, exit 2", async (_what, rest) => {
      const said = await chainCommand(["up", "--root", emptyDirectory(), ...rest], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([USAGE]);
      expect(said.code).toBe(2);
    });

    it("after them, the instance's own postgres database is as it was before them: its ledger to the instant, or none, and its schemas", async () => {
      // Not its relations: the bench's own services make some as they run (the lead, on SPEC §12.6), and a
      // run that reached this database would show in the ledger or in a schema.
      const ledgerAndSchemas = ({ ledger, schemas }: Awaited<ReturnType<typeof standingIn>>) => ({ ledger, schemas });
      expect(before).toBeDefined();
      if (before === undefined) return;
      expect(ledgerAndSchemas(await onTheInstance(standingIn))).toEqual(ledgerAndSchemas(before));
    });
  });
}
