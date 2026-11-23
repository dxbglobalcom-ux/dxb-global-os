// The rows' command as it is run (piece 6b's SPEC §5): `node foundation/chain/src/cli.ts rows [--kept <file>]`, a
// child started from the repository root with PATH and nothing else — and what a case asks of its answer. The texts
// and differences a case expects are written in the case or in expected/, by hand; nothing here derives one.
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { expect } from "vitest";
import { connectionString } from "@dxb-foundation/bench";
import { repositoryRoot } from "../../bench/fixtures/real-bench.ts";
import { chainCommand, type Said } from "../../chain/fixtures/command.ts";
import { COMMAND_MS } from "../../roles/fixtures/the-run.ts";

export { COMMAND_MS };

/** `rows` and its words: the stdout whole, byte for byte — not split into lines — its exit code and its stderr. */
export function rowsPrinted(words: string[] = [], timeoutMs = COMMAND_MS): Promise<{ code: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env: { PATH: process.env.PATH }, maxBuffer: 64 * 1024 * 1024 };
    execFile(process.execPath, ["foundation/chain/src/cli.ts", "rows", ...words], options, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      else reject(new Error(`rows did not end by itself: ${error.message}`));
    });
  });
}

/** `rows --kept <file>`: its exit code, the non-empty lines of its stdout, its stderr. */
export const keptSaid = (file: string): Promise<Said> => chainCommand(["rows", "--kept", file], COMMAND_MS);

/** What a failing expectation shows of an answer: its lines and the end of its stderr. */
export const shown = (said: Said): string => `${said.lines.join("\n")}\n--- stderr\n${said.stderr.slice(-1_500)}`;

/** `rows` prints exactly this text, exit 0: the bytes of the file or of the text written in the case. */
export async function expectRowsPrinted(text: string): Promise<void> {
  const printed = await rowsPrinted();
  expect(printed.stdout, printed.stderr.slice(-1_500)).toBe(text);
  expect(printed.code).toBe(0);
}

/** `rows --kept <file>` says ROWS_KEPT with these counts, and nothing else, exit 0. */
export async function expectKept(file: string, rows: number, sequences: number): Promise<void> {
  const said = await keptSaid(file);
  expect(said.lines, shown(said)).toEqual([`ROWS_KEPT rows=${rows} sequences=${sequences}`]);
  expect(said.code).toBe(0);
}

/** A committed text, read as the command and the library must print it. */
export const textOf = (file: string): string => readFileSync(file, "utf8");

/** The bench's address with these settings said by the connection itself (libpq's `options`), as a login could. */
export function withTheSessionSaying(settings: Record<string, string>): string {
  const address = new URL(connectionString());
  address.searchParams.set("options", Object.entries(settings).map(([name, value]) => `-c ${name}=${value}`).join(" "));
  return address.toString();
}

/**
 * Hostile to a reader that did not say its own settings (piece 6a's SPEC §6 B.2): each changes a catalogue text or
 * a value's — `extra_float_digits=0` reads the float 0.30000000000000004 of a given row as 0.3.
 */
export const HOSTILE: Readonly<Record<string, string>> = {
  search_path: "os,public",
  DateStyle: "SQL,DMY",
  IntervalStyle: "sql_standard",
  TimeZone: "Asia/Tokyo",
  bytea_output: "escape",
  quote_all_identifiers: "on",
  extra_float_digits: "0",
};

/** How a session opened with HOSTILE says them back: the instrument seen to work before it is trusted. */
export const HOSTILE_AS_SAID: Readonly<Record<string, string>> = { ...HOSTILE, DateStyle: "SQL, DMY" };
