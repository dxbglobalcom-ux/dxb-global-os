import { describe, expect, it } from "vitest";
import { chainRoot, emptyDirectory } from "../fixtures/chain-on-disk.ts";
import { chainCommand } from "../fixtures/command.ts";
import { valueOf } from "../fixtures/looking.ts";
import { onTheInstance } from "../fixtures/throwaway-database.ts";

// SPEC §8 and §9.4, "the command": started as it is run, by path, with PATH and
// nothing else. Its target is the instance's own `postgres` database, so every
// call here is one that ends before any connection — a disk offence, no chain,
// a wrong spelling — and the last case sees that nothing was written there.
// Where a spelling could be taken for a plain `up`, a root with no chain stands
// before it: the worst a wrong parse can then answer is no-chain.

const COMMAND_MS = 30_000;
const USAGE = "usage: cli.ts up [--root <dir>] [--wait <seconds>]";

export function theCommand(): void {
  describe("the command", { timeout: COMMAND_MS }, () => {
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

    it("up --root <a directory with no schema/>: CHAIN_REFUSED no-chain, exit 2", async () => {
      const said = await chainCommand(["up", "--root", emptyDirectory()], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual(["CHAIN_REFUSED no-chain"]);
      expect(said.code).toBe(2);
    });

    it.each<[string, string[]]>([
      ["a wrong word", ["down"]],
      ["the word in capitals", ["UP"]],
      ["no word at all", []],
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
    ])("up --root <dir> and then %s: the usage line, exit 2", async (_what, rest) => {
      const said = await chainCommand(["up", "--root", emptyDirectory(), ...rest], COMMAND_MS);
      expect(said.lines, said.stderr).toEqual([USAGE]);
      expect(said.code).toBe(2);
    });

    it("after them, the instance's own postgres database holds no schema os_chain", async () => {
      const schemas = await onTheInstance((instance) => valueOf(instance, "select count(*)::int from pg_catalog.pg_namespace where nspname = 'os_chain'"));
      expect(schemas).toBe(0);
    });
  });
}
