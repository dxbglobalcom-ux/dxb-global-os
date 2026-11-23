// How the instance test looks at the real bench from outside: the command as it
// is run, Docker and the kernel as they see the stack, the server as it answers.
// Everything here runs the command or reads. One Docker object is made and
// removed here, by its literal name and no other: the stray volume at the end.
import { execFile, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { beforeAll, expect, it } from "vitest";
import { instanceStatus, readInstances, type Identity } from "@dxb-foundation/bench";

export const repositoryRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const PROJECT_LABEL = "label=com.supabase.cli.project=DxB_Foundation";

type Ran = { code: number; stdout: string; stderr: string };

/** One program, an argument array, no shell. Answers its exit code and what it printed; a timeout is an error. */
function run(file: string, args: string[], timeoutMs: number, env?: NodeJS.ProcessEnv): Promise<Ran> {
  return new Promise((resolve, reject) => {
    const options = { cwd: repositoryRoot, timeout: timeoutMs, env, maxBuffer: 64 * 1024 * 1024 };
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error === null) resolve({ code: 0, stdout, stderr });
      else if (typeof error.code === "number") resolve({ code: error.code, stdout, stderr });
      else reject(new Error(`${file} ${args.join(" ")} did not end by itself: ${error.message}`));
    });
  });
}

export type CommandResult = { code: number; lastLine: string; output: string };

const CLI = "foundation/bench/src/cli.ts";

/** What the command is started with: PATH, the lock wait when one is asked for, and what a case sets beside them. */
const environmentOf = (lockWaitSeconds?: number, alsoSet: Record<string, string> = {}): NodeJS.ProcessEnv => ({
  PATH: process.env.PATH,
  DXB_FOUNDATION_LOCK_WAIT: lockWaitSeconds === undefined ? undefined : String(lockWaitSeconds),
  ...alsoSet,
});

/**
 * `node foundation/bench/src/cli.ts <call>` from the repository root. Its
 * environment holds the two variables SPEC §5b.1 names and nothing else of the
 * caller's — but for `alsoSet`, a variable a case plants to see that it is not handed on.
 */
export async function command(
  call: "up" | "down" | "fresh" | "status",
  timeoutMs: number,
  lockWaitSeconds?: number,
  alsoSet?: Record<string, string>,
): Promise<CommandResult> {
  const ran = await run(process.execPath, [CLI, call], timeoutMs, environmentOf(lockWaitSeconds, alsoSet));
  const printed = ran.stdout.split("\n").filter((line) => line.trim() !== "");
  return { code: ran.code, lastLine: printed.at(-1)?.trimEnd() ?? "", output: `${ran.stdout}\n${ran.stderr}` };
}

/** The end of what a command printed: enough to say why an expectation on it failed. */
export const tail = (output: string): string => output.slice(-1_500);

export type Ending = { code: number | null; signal: NodeJS.Signals | null; output: string };

/**
 * `up`, started and sent `signal` as soon as Docker shows one container of the
 * project — a make stopped in the middle of its start. Answers how the command
 * itself ended; what it had started may live on.
 */
export async function upSignalledOnceAContainerShows(signal: "SIGKILL" | "SIGTERM", withinMs: number): Promise<Ending> {
  const child = spawn(process.execPath, [CLI, "up"], { cwd: repositoryRoot, env: environmentOf(), stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", (chunk) => (output += String(chunk)));
  child.stderr.on("data", (chunk) => (output += String(chunk)));
  let ending: Ending | undefined;
  // "exit", not "close": a start that outlives the command must not keep this waiting.
  const ended = new Promise<Ending>((resolve, reject) => {
    child.on("error", reject);
    child.on("exit", (code, endedBy) => resolve((ending = { code, signal: endedBy, output })));
  });
  const deadline = Date.now() + withinMs;
  while ((await benchContainers()).length === 0) {
    if (ending !== undefined) throw new Error(`up ended (${ending.code ?? ending.signal}) before a container showed: ${tail(output)}`);
    if (Date.now() > deadline) {
      child.kill("SIGKILL");
      throw new Error(`no container of the project showed within ${withinMs} ms: ${tail(output)}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  child.kill(signal);
  return ended;
}

/** The non-empty lines `docker <args>` prints; a failing call is an error. */
async function docker(args: string[]): Promise<string[]> {
  const ran = await run("docker", args, 30_000);
  if (ran.code !== 0) throw new Error(`docker ${args.join(" ")} ended with ${ran.code}: ${ran.stderr.trim()}`);
  return ran.stdout.split("\n").map((line) => line.trim()).filter((line) => line !== "");
}

/** The full ids of every container, running or not, that carries the project's label. */
export const benchContainers = (): Promise<string[]> =>
  docker(["ps", "-a", "--no-trunc", "--filter", PROJECT_LABEL, "--format", "{{.ID}}"]);

/** The volumes that carry the project's label, and those whose name carries the project — whichever way they are the bench's. */
export async function benchVolumes(): Promise<string[]> {
  const labelled = await docker(["volume", "ls", "--filter", PROJECT_LABEL, "--format", "{{.Name}}"]);
  const named = (await docker(["volume", "ls", "--format", "{{.Name}}"])).filter((name) => name.includes("DxB_Foundation"));
  return [...new Set([...labelled, ...named])].sort();
}

/** The bench's network when it exists — `<name> <the host address its published ports bind>` — else nothing. */
export async function benchNetwork(): Promise<string[]> {
  const names = await docker(["network", "ls", "--filter", "name=dxb_foundation_bench", "--format", "{{.Name}}"]);
  if (!names.includes("dxb_foundation_bench")) return [];
  const format = '{{.Name}} {{index .Options "com.docker.network.bridge.host_binding_ipv4"}}';
  return docker(["network", "inspect", "dxb_foundation_bench", "--format", format]);
}

/** `docker port` of every container of the project: lines such as `5432/tcp -> 127.0.0.1:54522`. */
export async function publishedPorts(): Promise<string[]> {
  const lines: string[] = [];
  for (const id of await benchContainers()) lines.push(...(await docker(["port", id])));
  return lines;
}

/** The local addresses the kernel listens on for the bench's two ports, e.g. `127.0.0.1:54522`. */
export async function listenersOnTheBenchPorts(): Promise<string[]> {
  const ran = await run("ss", ["-ltnH"], 30_000);
  if (ran.code !== 0) throw new Error(`ss ended with ${ran.code}: ${ran.stderr.trim()}`);
  return ran.stdout
    .split("\n")
    .map((line) => line.trim().split(/\s+/)[3] ?? "")
    .filter((address) => /:(54521|54522)$/.test(address))
    .sort();
}

/**
 * One answer from the server, asked inside the database container. The
 * container is first seen to be the bench's own — by its name and its label —
 * so this can never exec into another stack's container.
 */
export async function askInsideTheContainer(container: string, sql: string): Promise<string> {
  const format = '{{.Name}} {{index .Config.Labels "com.supabase.cli.project"}}';
  const [facts] = await docker(["inspect", "--format", format, container]);
  if (facts !== "/supabase_db_DxB_Foundation DxB_Foundation") {
    throw new Error(`refusing to exec into ${container}: it is "${facts}", not the bench's database container`);
  }
  const psql = ["psql", "-U", "postgres", "-d", "postgres", "-At", "-v", "ON_ERROR_STOP=1", "-c", sql];
  return (await docker(["exec", container, ...psql])).join("\n");
}

/**
 * A TCP connection to one database of the bench's cluster, closed when the work
 * ends. Only the database's name is the caller's: the address is the bench's,
 * as SPEC §4 spells it, so this can connect nowhere else.
 */
export async function withConnection<T>(database: string, work: (client: Client) => Promise<T>): Promise<T> {
  const connectionString = `postgresql://postgres:postgres@127.0.0.1:54522/${database}`;
  const client = new Client({ connectionString, connectionTimeoutMillis: 10_000 });
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

/** The identity the server gives on a connection — the two queries of SPEC §2, asked by the test itself. */
export async function identityOn(client: Client): Promise<Identity> {
  const cluster = await client.query("select system_identifier::text from pg_control_system()");
  const database = await client.query("select oid::text, datname from pg_database where datname = current_database()");
  return { sysid: cluster.rows[0].system_identifier, dboid: database.rows[0].oid, dbname: database.rows[0].datname };
}

/** One value: the first column of the first row. */
export async function valueOf(client: Client, sql: string): Promise<unknown> {
  const answer = await client.query({ text: sql, rowMode: "array" });
  return (answer.rows[0] as unknown[] | undefined)?.[0];
}

/** Nothing of the bench stands: no container, no volume by label or by name, no network, no listener, no record. */
export async function expectNothingStands(): Promise<void> {
  expect(await benchContainers()).toEqual([]);
  expect(await benchVolumes()).toEqual([]);
  expect(await benchNetwork()).toEqual([]);
  expect(await listenersOnTheBenchPorts()).toEqual([]);
  expect(readInstances()).toEqual([]);
  expect(await instanceStatus()).toEqual({ state: "absent" });
  expect(await command("status", 30_000)).toMatchObject({ code: 0, lastLine: "INSTANCE_ABSENT" });
}

/**
 * What stands on the host beside the bench — every container and every volume
 * that is not the bench's, each as `<id or name> <name> <project label>`. Read only.
 */
async function standingBesideTheBench(): Promise<{ containers: string[]; volumes: string[] }> {
  const project = '{{.Label "com.supabase.cli.project"}}';
  // The bench's own carry its project in their name or their label; its stray volume carries it in lower case.
  const besideTheBench = (line: string): boolean => !/dxb_foundation/i.test(line);
  const containers = await docker(["ps", "-a", "--no-trunc", "--format", `{{.ID}} {{.Names}} ${project}`]);
  const volumes = await docker(["volume", "ls", "--format", `{{.Name}} ${project}`]);
  return { containers: containers.filter(besideTheBench).sort(), volumes: volumes.filter(besideTheBench).sort() };
}

/**
 * The central promise, asked of one file on the real bench: what stood beside
 * the bench before the file's first step stands after its last. Called last in
 * the file's `describe`; the case is not a step, so it is asked whatever the
 * steps did, and the bench's own are left out of both sides.
 */
export function theRestOfTheHostStandsAsBefore(): void {
  let before: Awaited<ReturnType<typeof standingBesideTheBench>>;
  beforeAll(async () => {
    before = await standingBesideTheBench();
  }, 30_000);
  it("every container and volume that is not the bench's stands as it stood before the first step", { timeout: 30_000 }, async () => {
    expect(await standingBesideTheBench()).toEqual(before);
  });
}

/**
 * The one Docker object a test makes by itself: a volume that carries the
 * project's label and that no record explains. Its name is spelled here whole,
 * and it is removed by that name and no other.
 */
export const createTheStrayVolume = (): Promise<string[]> =>
  docker(["volume", "create", "--label", "com.supabase.cli.project=DxB_Foundation", "dxb_foundation_test_stray"]);
export const removeTheStrayVolume = (): Promise<string[]> => docker(["volume", "rm", "dxb_foundation_test_stray"]);
