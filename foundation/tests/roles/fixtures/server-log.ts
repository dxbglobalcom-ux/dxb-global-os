// The bench's database server's log as Docker keeps it (piece 5's SPEC §8 B.7): read through a child process, and
// only from the bench's own database container — first seen to be that, by its name and its project label, as
// `bench/fixtures/real-bench.ts` sees it before it asks anything inside — and the window of it a case reads, between
// two lines of the case's own.
import { execFile } from "node:child_process";
import { randomBytes } from "node:crypto";
import { expect } from "vitest";
import { onTheInstance } from "../../chain/fixtures/throwaway-database.ts";

const CONTAINER = "supabase_db_DxB_Foundation";

type Ran = { code: number; stdout: string; stderr: string };

function docker(args: string[], timeoutMs = 30_000): Promise<Ran> {
  return new Promise((resolve, reject) => {
    execFile("docker", args, { timeout: timeoutMs, maxBuffer: 64 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      // A fixed text: Node's message embeds what the child wrote — for `docker logs`, the server's log itself.
      else reject(new Error(`docker ${args[0]} did not end by itself within ${timeoutMs} ms, or could not be started`));
    });
  });
}

/**
 * Every line the server wrote to its log since `since` — what `docker logs` gives on either stream. The container
 * is first seen to be the bench's database container; any other answer is an error, and nothing is read.
 */
export async function serverLogSince(since: Date): Promise<string[]> {
  const format = '{{.Name}} {{index .Config.Labels "com.supabase.cli.project"}}';
  const inspected = await docker(["inspect", "--format", format, CONTAINER]);
  if (inspected.code !== 0 || inspected.stdout.trim() !== `/${CONTAINER} DxB_Foundation`) {
    throw new Error(`refusing to read the log of ${CONTAINER}: docker answered "${inspected.stdout.trim()}" (${inspected.code})`);
  }
  const logged = await docker(["logs", "--since", since.toISOString(), CONTAINER]);
  if (logged.code !== 0) throw new Error(`docker logs ended with ${logged.code}`);
  return `${logged.stdout}\n${logged.stderr}`.split("\n").filter((line) => line.trim() !== "");
}

/** How many of the lines hold any of these texts — a count, so an assertion on it prints none of them. */
export const linesHolding = (lines: readonly string[], texts: readonly string[]): number =>
  lines.filter((line) => texts.some((text) => line.includes(text))).length;

/** A window of the log: opened by a line of the case's own, written to the log before the act it is to hold. */
export type LogWindow = { opening: string; since: Date };

const aMarker = (): string => `roles-test-log-window-${randomBytes(8).toString("hex")}`;

/** `marker` written to the server's log by the installer, from a connection of its own; the statement's text is the marker. */
const toTheLog = async (marker: string): Promise<void> => {
  await onTheInstance((installer) => installer.query(`do $m$ begin raise log '${marker}'; end $m$`));
};

/** The window opened: its first marker written to the log now. */
export async function openTheLogsWindow(): Promise<LogWindow> {
  const opening = aMarker();
  const since = new Date(Date.now() - 1_000);
  await toTheLog(opening);
  return { opening, since };
}

// What the server writes reaches `docker logs` a moment later; the closing marker is looked for again within this.
const CLOSING_SEEN_MS = 5_000;
const READ_AGAIN_MS = 250;

/**
 * The window closed and read: a second marker of the case's own is written after the act, and the lines read are seen
 * to hold both markers before any is counted — a line the server wrote late cannot make "none" true by being absent.
 * The server writes a statement's lines before it answers, and the closing marker is sent after the act was answered.
 */
export async function theLogsWindow({ opening, since }: LogWindow): Promise<string[]> {
  const closing = aMarker();
  await toTheLog(closing);
  const until = Date.now() + CLOSING_SEEN_MS;
  let lines = await serverLogSince(since);
  while (linesHolding(lines, [closing]) === 0 && Date.now() < until) {
    await new Promise((resolve) => setTimeout(resolve, READ_AGAIN_MS));
    lines = await serverLogSince(since);
  }
  expect([opening, closing].map((marker) => `${marker === opening ? "opening" : "closing"} ${linesHolding(lines, [marker]) > 0}`)).toEqual([
    "opening true",
    "closing true",
  ]);
  return lines;
}
