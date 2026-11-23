// The bench's database server's log as Docker keeps it (piece 5's SPEC §8 B.7): read through a child process, and
// only from the bench's own database container — first seen to be that, by its name and its project label, as
// `bench/fixtures/real-bench.ts` sees it before it asks anything inside.
import { execFile } from "node:child_process";

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
