// Making the instance: SPEC §4 "makeInstance", its nine steps in their order.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import { BENCH, benchDirectory, connectionString, repositoryRoot } from "./bench.ts";
import { benchNetwork, createBenchNetwork, labelledContainers, labelledVolumes, serverInside } from "./docker.ts";
import type { BenchContainer } from "./docker.ts";
import { TargetRefused, decide, guarded } from "./guard.ts";
import { readIdentity, sameIdentity } from "./identity.ts";
import type { Identity, Queryable } from "./identity.ts";
import { destroyInstance, statusOf } from "./instance.ts";
import { readListFile, writeListFile } from "./instances.ts";
import type { InstanceRecord } from "./instances.ts";
import { assertTheHostLock, theHostLockDescriptor } from "./lock.ts";
import type { HostLock } from "./lock.ts";
import { selectRemovalTargets } from "./removal.ts";
import type { PendingRecord } from "./removal.ts";
import { assertNotToldToStop, oneLine, run, step } from "./run.ts";

export class InstanceStands extends Error {
  name = "InstanceStands";
}

export class ExposureRefused extends Error {
  name = "ExposureRefused";
}

// Measured by the lead (SPEC §2): the start about 32 s, the old chain about 22 s.
const START_MS = 180_000;
const OLD_CHAIN_MS = 180_000;
const CONNECT_MS = 10_000;

/** The CLI is this package's own dependency; it is not on PATH. */
const SUPABASE = join(benchDirectory, "node_modules/.bin/supabase");
const CONFIG = join(benchDirectory, "supabase/config.toml");

/** `table.key` → the value as it is written, for the plain `key = value` lines of a TOML text. */
function settingsOf(toml: string): Map<string, string> {
  const settings = new Map<string, string>();
  let table = "";
  for (const line of toml.split("\n")) {
    const header = /^\s*\[\s*([^\]]+?)\s*\]/.exec(line);
    const setting = /^\s*([\w-]+)\s*=\s*(.*?)\s*(?:#.*)?$/.exec(line);
    if (header?.[1] !== undefined) table = `${header[1]}.`;
    else if (setting?.[1] !== undefined && setting[2] !== undefined) settings.set(`${table}${setting[1]}`, setting[2]);
  }
  return settings;
}

/** Pure. What a stack config says that is not the bench — its project or one of its two ports — or undefined when it is the bench's. */
export function configMismatch(tomlText: string): string | undefined {
  const written = settingsOf(tomlText);
  const theBench = {
    project_id: `"${BENCH.project}"`,
    "api.port": String(BENCH.apiPort),
    "db.port": String(BENCH.dbPort),
  };
  for (const [setting, value] of Object.entries(theBench)) {
    if (written.get(setting) !== value) return `${setting} = ${written.get(setting) ?? "nothing"}; the bench is ${value}`;
  }
  return undefined;
}

/** Step 1. The stack's config must say the bench's project and its two ports before anything starts. */
function assertTheConfigIsTheBench(): void {
  const mismatch = configMismatch(readFileSync(CONFIG, "utf8"));
  if (mismatch !== undefined) throw new Error(`${CONFIG} says ${mismatch}`);
}

/** Step 3. The bench's network, binding published ports to the loopback address: made when absent, refused when it binds otherwise. */
async function standOnTheLoopbackNetwork(lock: HostLock): Promise<void> {
  let network = await benchNetwork();
  if (network === undefined) {
    assertTheHostLock(lock);
    await createBenchNetwork();
    network = await benchNetwork();
  }
  if (network?.hostBinding !== BENCH.bind) {
    const binds = network === undefined ? "is absent after it was made" : `binds ${network.hostBinding ?? "every address"}`;
    throw new ExposureRefused(`the network ${BENCH.network} ${binds}; it must bind ${BENCH.bind}`);
  }
}

/** Pure. Every published port that is bound anywhere but the loopback address, each named; empty when none is. */
export function exposedBeyondLoopback(containers: readonly BenchContainer[]): string[] {
  return containers.flatMap((container) =>
    container.published
      .filter((port) => port.hostAddress !== BENCH.bind)
      .map((port) => `${container.name} ${port.containerPort} -> ${port.hostAddress || "every address"}:${port.hostPort}`),
  );
}

/** Step 5. Every published port of every container must be bound to the loopback address and nowhere else. */
function assertNothingIsExposed(containers: readonly BenchContainer[]): void {
  const exposed = exposedBeyondLoopback(containers);
  if (exposed.length > 0) throw new ExposureRefused(`published beyond ${BENCH.bind}: ${exposed.join(", ")}`);
}

/** The database container is the one that publishes the bench's database port — found by what it does, not by its name. */
function theDatabaseContainer(containers: readonly BenchContainer[]): BenchContainer {
  const publishing = containers.filter((container) => container.published.some((port) => port.hostPort === BENCH.dbPort));
  const [database] = publishing;
  if (database === undefined || publishing.length !== 1) {
    throw new Error(`${publishing.length} containers publish the database port ${BENCH.dbPort}; exactly one must`);
  }
  return database;
}

/** One TCP connection to the bench's address, closed when the work ends. */
async function overTcp<T>(work: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ connectionString: connectionString(), connectionTimeoutMillis: CONNECT_MS });
  // A connection lost while it idles shows in the next query's rejection; without a listener it would end the process.
  client.on("error", () => undefined);
  await client.connect();
  try {
    return await work(client);
  } finally {
    await client.end();
  }
}

/**
 * Step 6. The server says who it is on both paths the old chain will use —
 * inside the database container, and over TCP. The two must be one database,
 * and one the guard knows neither as the company nor as the old bench.
 */
async function identityOnBothPaths(database: BenchContainer, client: Queryable): Promise<Identity> {
  const inside = await readIdentity(serverInside(database.id));
  const identity = await readIdentity(client);
  if (!sameIdentity(inside, identity)) {
    throw new Error(
      `two servers answer: cluster ${inside.sysid} inside ${database.name}, cluster ${identity.sysid} at ${BENCH.bind}:${BENCH.dbPort}`,
    );
  }
  const decision = decide(identity, []);
  if (decision.allowed) throw new Error("the guard allowed an identity against an empty list");
  if (decision.reason !== "not-listed") throw new TargetRefused(decision.reason, identity);
  return identity;
}

/**
 * Step 7. `bash scripts/bootstrap-db.sh` from the repository root. Its
 * environment is PATH, HOME and the three variables below — `run` hands a child
 * nothing else of the caller's. Both psql commands address the database
 * container by its id. It changes the stack, so it is handed the host lock.
 */
async function runTheOldChain(databaseContainerId: string, lock: HostLock): Promise<void> {
  // The chain splits these two commands into words: an id is hexadecimal and nothing else.
  if (!/^[0-9a-f]{64}$/.test(databaseContainerId)) throw new Error(`not a container id: ${databaseContainerId}`);
  const psqlAs = (role: string): string => `docker exec -i ${databaseContainerId} psql -U ${role} -d postgres`;
  await run("bash", [join(repositoryRoot, "scripts/bootstrap-db.sh")], {
    timeoutMs: OLD_CHAIN_MS,
    holdingTheLock: theHostLockDescriptor(lock),
    environment: {
      DXB_DATABASE_URL: connectionString(),
      DXB_PSQL: psqlAs("postgres"),
      DXB_PSQL_ADMIN: psqlAs("supabase_admin"),
    },
  });
}

/** Step 8. The ledger holds exactly as many rows as `db/migrations` has `.sql` files. */
async function assertTheLedgerIsWhole(conn: Queryable): Promise<void> {
  const files = readdirSync(join(repositoryRoot, "db/migrations")).filter((name) => name.endsWith(".sql")).length;
  const { rows } = await conn.query("select count(*)::int as recorded from supabase_migrations.schema_migrations");
  const recorded = rows[0]?.["recorded"];
  if (recorded !== files) throw new Error(`the ledger holds ${String(recorded)} rows; db/migrations has ${files} files`);
}

/** Steps 4 to 8: from the pending record to the old schema standing on the recorded instance. */
async function startRecordAndBootstrap(lock: HostLock): Promise<InstanceRecord> {
  const pending: PendingRecord = { project: BENCH.project, pending: true, startedAt: new Date().toISOString() };
  assertTheHostLock(lock);
  writeListFile({ instances: [], pending });
  const start = ["start", "--workdir", benchDirectory, "--network-id", BENCH.network];
  // The start makes the stack, so it is handed the host lock: killed, this process leaves the lock with it.
  await step("supabase start", () => run(SUPABASE, start, { timeoutMs: START_MS, holdingTheLock: theHostLockDescriptor(lock) }));

  const containers = await labelledContainers();
  assertNothingIsExposed(containers);
  const database = theDatabaseContainer(containers);
  // The record names what a removal by the pending record would take, and no more: what was created since
  // this make started. Anything older that carries the label is refused here — a make adopts nothing.
  const made = selectRemovalTargets(containers, pending, await labelledVolumes());

  const record = await overTcp(async (client) => {
    const identity = await step("the identity, inside the container and over TCP", () => identityOnBothPaths(database, client));
    const recorded: InstanceRecord = {
      ...identity,
      project: BENCH.project,
      dbContainer: database.id,
      containers: made.containers,
      volumes: made.volumes,
      madeAt: new Date().toISOString(),
    };
    assertTheHostLock(lock);
    writeListFile({ instances: [recorded] });

    await guarded(client, async (conn) => {
      assertTheHostLock(lock);
      await step("the old chain", () => runTheOldChain(database.id, lock));
      await assertTheLedgerIsWhole(conn);
    });
    return recorded;
  });

  // Only now is it a made instance (SPEC §5b.3). Nothing waits between this and the answer, so a
  // command told to stop either fails here, and step 9 removes what it made, or had already made it whole.
  assertNotToldToStop();
  assertTheHostLock(lock);
  const whole: InstanceRecord = { ...record, chainAppliedAt: new Date().toISOString() };
  writeListFile({ instances: [whole] });
  return whole;
}

/** Step 9. Removes what this run made, by the same authority as any removal. Its own failure is said and never thrown. */
async function removeWhatThisRunMade(lock: HostLock): Promise<void> {
  try {
    await step("removing what this run made", () => destroyInstance(lock));
  } catch (failure) {
    process.stderr.write(`[bench] the removal failed too, and what it left stands: ${oneLine(String(failure))}\n`);
  }
}

export async function makeInstance(lock: HostLock): Promise<InstanceRecord> {
  assertTheHostLock(lock);
  assertTheConfigIsTheBench();

  // Step 2. A labelled volume stands like a container does: with no record it is foreign, and the make stops here.
  const before = statusOf(await labelledContainers(), await labelledVolumes(), readListFile());
  if (before.state === "standing") throw new InstanceStands(`the instance of cluster ${before.record.sysid} stands`);
  if (before.state === "foreign") throw new InstanceStands(before.detail);

  await step(`the network ${BENCH.network}`, () => standOnTheLoopbackNetwork(lock));
  try {
    return await startRecordAndBootstrap(lock);
  } catch (firstFailure) {
    await removeWhatThisRunMade(lock);
    throw firstFailure;
  }
}
