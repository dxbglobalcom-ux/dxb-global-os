// How the instance test looks at the real bench from outside: the command as it
// is run, Docker and the kernel as they see the stack, the server as it answers.
// Everything here runs the command or reads; nothing here removes anything.
import { execFile } from "node:child_process";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import type { Identity } from "@dxb-foundation/bench";

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

/**
 * `node foundation/bench/src/cli.ts <call>` from the repository root. Its
 * environment holds the variables SPEC §3 names and nothing else of the caller's.
 */
export async function command(
  call: "up" | "down" | "fresh" | "status",
  timeoutMs: number,
  lockWaitSeconds?: number,
): Promise<CommandResult> {
  const env = {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    XDG_STATE_HOME: process.env.XDG_STATE_HOME,
    XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR,
    DXB_FOUNDATION_LOCK_WAIT: lockWaitSeconds === undefined ? undefined : String(lockWaitSeconds),
  };
  const ran = await run(process.execPath, ["foundation/bench/src/cli.ts", call], timeoutMs, env);
  const printed = ran.stdout.split("\n").filter((line) => line.trim() !== "");
  return { code: ran.code, lastLine: printed.at(-1)?.trimEnd() ?? "", output: `${ran.stdout}\n${ran.stderr}` };
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

/** The volumes whose name carries the project. */
export const benchVolumes = async (): Promise<string[]> =>
  (await docker(["volume", "ls", "--format", "{{.Name}}"])).filter((name) => name.includes("DxB_Foundation"));

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
