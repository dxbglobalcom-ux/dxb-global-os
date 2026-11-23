// How a case changes the database and undoes it (SPEC §6 B.8): as the installer, as the owner of os (the installer
// may SET its role), as a login over TCP, or as the bench's superuser (fixtures/superuser.ts). Each connection
// passes the bench's guard first (chain/fixtures/throwaway-database.ts).
import { readFileSync } from "node:fs";
import { expect } from "vitest";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";
import type { Step } from "../../roles/fixtures/the-run.ts";
import { EXPECTED_FIXTURE } from "./the-chains.ts";
import { COMMAND_MS, expectEqual, expectRedBy } from "./the-check.ts";

/** These statements as the installer, in one transaction. */
export const asTheInstaller = (...statements: string[]): Promise<void> =>
  onTheInstance(async (client) => {
    await client.query("begin");
    try {
      for (const statement of statements) await client.query(statement);
      await client.query("commit");
    } catch (failure) {
      await client.query("rollback").catch(() => undefined);
      throw failure;
    }
  });

/** These statements as the owner of os, in one transaction. */
export const asTheOwner = (...statements: string[]): Promise<void> => asTheInstaller("set local role os_owner", ...statements);

/** How many lines a committed text holds, the first among them: what SNAPSHOT_EQUAL says. */
export const linesOf = (file: string): number => readFileSync(file, "utf8").split("\n").length - 1;

/** The check against the fixture's text is equal: the state every B.8 case begins and ends in. */
export const fixtureEqual = (): Promise<void> => expectEqual(EXPECTED_FIXTURE, linesOf(EXPECTED_FIXTURE));

/** One case's time: a change, two checks and an undo, with room for a busy machine. */
export const CASE_MS = 3 * COMMAND_MS;

export type Change = {
  /** What the case does to the database. */
  change: () => Promise<void>;
  /** What puts it back; run however the check ended. */
  undo: () => Promise<void>;
  /** The lines the check must name, each side written down by hand from SPEC §4.3. */
  expectedOnly?: readonly string[];
  actualOnly?: readonly string[];
  /** For a change whose lines cannot all be written down: what is asked of the red check instead. */
  red?: () => Promise<void>;
};

/**
 * One B.8 case as a step: the change turns the check against the fixture's text red by exactly the lines written
 * down (or as `red` asks), and the undo makes it equal again — so no case leaks into the next.
 */
export function aChange(step: Step, name: string, { change, undo, expectedOnly, actualOnly, red }: Change): void {
  step(name, CASE_MS, async () => {
    await change();
    try {
      if (red !== undefined) await red();
      else await expectRedBy(EXPECTED_FIXTURE, { expectedOnly, actualOnly });
    } finally {
      await undo();
    }
    await fixtureEqual();
  });
}

/** The answer of a chain run that is green: `CHAIN_GREEN …` exactly, exit 0. */
export function expectChainSaid(said: { code: number; lines: string[]; stderr: string }, verdict: string, code: number): void {
  expect(said.lines.at(-1), `${said.lines.join("\n")}\n${said.stderr.slice(-1_500)}`).toBe(verdict);
  expect(said.code).toBe(code);
}
