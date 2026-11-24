// What piece 6c's tests judge with (its SPEC §5–§6): the committed expected texts, the root that holds revision B of
// the fixture chain and this piece's 0006, the inventory kept aside, and the two commands as they are run — a child
// started by path from the repository root with PATH and nothing else, as every command of the chain's is.
//
// Revision B is piece 6b's, by import (upgrade/fixtures/the-roots.ts) — never copied, never edited. Every root, and
// every inventory kept aside, lies in a temporary directory outside the repository; nothing here writes under
// foundation/tests, and no expected text is ever written.
import { execFile } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";
import { repositoryRoot } from "../../bench/fixtures/real-bench.ts";
import { chainCommand, type Said } from "../../chain/fixtures/command.ts";
import { COMMAND_MS } from "../../roles/fixtures/the-run.ts";
import { rootB } from "../../upgrade/fixtures/the-roots.ts";

export { COMMAND_MS };
export type { Said };

/** The three committed texts of this piece, written by hand (SPEC §6), found from this file's place. */
export const EXPECTED_REAL = fileURLToPath(new URL("../expected/real.outside.txt", import.meta.url));
export const EXPECTED_FIXTURE = fileURLToPath(new URL("../expected/fixture.outside.txt", import.meta.url));
export const EXPECTED_FURTHER = fileURLToPath(new URL("../expected/further.outside.txt", import.meta.url));

/** This piece's one fixture file: what a build may change outside os, applied on top of revision B. */
export const FURTHER_FILE = "0006-further-outside.sql";
const FURTHER_FILES = fileURLToPath(new URL("./chain-further/schema/", import.meta.url));

/** The bytes of 0006, as the root is given them. */
export const furtherFile = (): Buffer => readFileSync(join(FURTHER_FILES, FURTHER_FILE));

/** A root holding revision B (piece 6b's, assembled by its own helper), then 0006. */
export function rootFurther(): string {
  const root = rootB();
  writeFileSync(join(root, "schema", FURTHER_FILE), furtherFile());
  return root;
}

/** A committed text, whole. */
export const textOf = (file: string): string => readFileSync(file, "utf8");

/** How many lines a committed text holds, the first among them: what OUTSIDE_EQUAL says. */
export const linesOf = (file: string): number => textOf(file).split("\n").length - 1;

const made: string[] = [];

/** A file holding `text`, in a temporary directory of its own outside the repository: an inventory kept aside. */
export function keptAside(name: string, text: string): string {
  const directory = mkdtempSync(join(tmpdir(), "dxb-foundation-outside-"));
  made.push(directory);
  const path = join(directory, name);
  writeFileSync(path, text);
  return path;
}

/** Removes every directory keptAside made: called once, when a test file ends. */
export function removeWhatWasKeptAside(): void {
  for (const directory of made.splice(0)) rmSync(directory, { recursive: true, force: true });
}

export type Printed = { code: number; stdout: string; stderr: string };

/** `node foundation/chain/src/cli.ts <words>`: its stdout whole, byte for byte — not split into lines. */
export function printedBy(words: string[], timeoutMs = COMMAND_MS): Promise<Printed> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env: { PATH: process.env.PATH }, maxBuffer: 256 * 1024 * 1024 };
    execFile(process.execPath, ["foundation/chain/src/cli.ts", ...words], options, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      else reject(new Error(`cli.ts ${words[0] ?? ""} did not end by itself: ${error.message}`));
    });
  });
}

/** `inventory`: the text, exit 0 — what a case reads and keeps aside. */
export async function inventoryPrinted(): Promise<string> {
  const printed = await printedBy(["inventory"]);
  expect(printed.code, printed.stderr.slice(-1_500)).toBe(0);
  return printed.stdout;
}

/** `outside --before <file> [--check <file>]`: exit code, the non-empty lines of stdout, stderr. */
export const outsideSaid = (before: string, check?: string): Promise<Said> =>
  chainCommand(["outside", "--before", before, ...(check === undefined ? [] : ["--check", check])], COMMAND_MS);

/** What a failing expectation shows of an answer: its lines and the end of its stderr. */
export const shown = (said: Said): string => `${said.lines.join("\n")}\n--- stderr\n${said.stderr.slice(-1_500)}`;

/** The check said OUTSIDE_EQUAL lines=<n> for the file, exit 0, and nothing else on stdout. */
export async function expectOutsideEqual(before: string, file: string): Promise<void> {
  const said = await outsideSaid(before, file);
  expect(said.lines, shown(said)).toEqual([`OUTSIDE_EQUAL lines=${linesOf(file)}`]);
  expect(said.code).toBe(0);
}

/** The check printed exactly these lines — the difference and its verdict, written down by hand — and exit 1. */
export async function expectOutsideRed(before: string, file: string, printed: readonly string[]): Promise<void> {
  const said = await outsideSaid(before, file);
  expect(said.lines, shown(said)).toEqual(printed);
  expect(said.code).toBe(1);
}
