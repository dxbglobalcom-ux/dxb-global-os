// The instance as it stands, and its removal. Making one is `make.ts`.
import { BENCH } from "./bench.ts";
import {
  benchNetwork,
  labelledContainers,
  labelledVolumes,
  removeBenchNetwork,
  removeContainer,
  removeVolume,
  serverInside,
  standingVolumes,
} from "./docker.ts";
import type { BenchContainer } from "./docker.ts";
import { readIdentity, sameIdentity } from "./identity.ts";
import type { Identity } from "./identity.ts";
import { readListFile, writeListFile } from "./instances.ts";
import type { InstanceRecord, ListFile } from "./instances.ts";
import { assertTheHostLock } from "./lock.ts";
import type { HostLock } from "./lock.ts";
import { RemovalRefused, selectRemovalTargets } from "./removal.ts";
import { step } from "./run.ts";

export type Status =
  | { state: "absent" }
  | { state: "standing"; record: InstanceRecord }
  // something carries the project label that the list does not explain
  | { state: "foreign"; detail: string };

const named = (container: BenchContainer): string => `${container.name} (${container.id.slice(0, 12)})`;
const spelled = (identity: Identity): string =>
  `cluster ${identity.sysid}, database ${identity.dboid} ${identity.dbname}`;

/** The bench makes one instance. A list that holds more is said here, and nothing is decided on it. */
const moreRecordsThanOne = (list: ListFile): string | undefined =>
  list.instances.length > 1 ? `the list holds ${list.instances.length} records; the bench makes one instance` : undefined;

/**
 * Pure: what the labelled containers and the list file say together. Standing
 * is one record that explains every container, each of its containers running;
 * absent is no container and an empty list; everything between is foreign.
 */
export function statusOf(containers: readonly BenchContainer[], list: ListFile): Status {
  const foreign = (detail: string): Status => ({ state: "foreign", detail });
  const tooMany = moreRecordsThanOne(list);
  if (tooMany !== undefined) return foreign(tooMany);
  if (list.pending !== undefined) {
    return foreign(`a make started at ${list.pending.startedAt} has not finished (containers carrying the label: ${containers.length})`);
  }
  const [record] = list.instances;
  if (record === undefined) {
    if (containers.length === 0) return { state: "absent" };
    return foreign(`the list holds no record of ${containers.map(named).join(", ")}`);
  }
  const stranger = containers.find((container) => !record.containers.includes(container.id));
  if (stranger !== undefined) return foreign(`${named(stranger)} carries the label and is not in the record`);
  const running = containers.filter((container) => container.running).length;
  if (running < record.containers.length) {
    return foreign(`of the ${record.containers.length} recorded containers, ${running} are running`);
  }
  return { state: "standing", record };
}

export async function instanceStatus(): Promise<Status> {
  return statusOf(await labelledContainers(), readListFile());
}

/**
 * While the recorded database container runs, the server inside it — asked by
 * `docker exec` on its id — must be the recorded database. Anything else, an
 * identity that cannot be read included, refuses the removal.
 */
async function assertTheRecordedDatabase(containers: readonly BenchContainer[], record: InstanceRecord): Promise<void> {
  const database = containers.find((container) => container.id === record.dbContainer);
  if (database === undefined || !database.running) return;
  let answered: Identity;
  try {
    answered = await readIdentity(serverInside(database.id));
  } catch (cause) {
    throw new RemovalRefused(`the database container ${named(database)} runs and does not say who it is: ${String(cause)}`);
  }
  if (!sameIdentity(answered, record)) {
    throw new RemovalRefused(
      `the database container ${named(database)} answers ${spelled(answered)}; the record says ${spelled(record)}`,
    );
  }
}

/**
 * Removes the instance the list explains — a made one by its record, an
 * unfinished make by its pending record — and nothing the list does not explain.
 * Containers go by id, volumes by the names `selectRemovalTargets` answered,
 * the network when nothing is attached to it, and last the record. The host
 * lock is asked for again before each removal.
 */
export async function destroyInstance(lock: HostLock): Promise<"destroyed" | "absent"> {
  assertTheHostLock(lock);
  const containers = await labelledContainers();
  const list = readListFile();
  const tooMany = moreRecordsThanOne(list);
  if (tooMany !== undefined) throw new RemovalRefused(tooMany);
  const [record] = list.instances;
  const explainedBy = record ?? list.pending;
  if (containers.length === 0 && explainedBy === undefined) return "absent";

  const targets = selectRemovalTargets(containers, explainedBy);
  if (record !== undefined) await assertTheRecordedDatabase(containers, record);

  await step(`removing containers (${targets.containers.length})`, async () => {
    for (const id of targets.containers) {
      assertTheHostLock(lock);
      await removeContainer(id);
    }
  });
  const standing = await standingVolumes();
  const volumes = targets.volumes.filter((name) => standing.includes(name));
  await step(`removing volumes (${volumes.length})`, async () => {
    for (const name of volumes) {
      assertTheHostLock(lock);
      await removeVolume(name);
    }
  });
  if ((await benchNetwork())?.attached === 0) {
    assertTheHostLock(lock);
    await step(`removing the network ${BENCH.network}`, removeBenchNetwork);
  }
  assertTheHostLock(lock);
  writeListFile({ instances: [] });

  // A pending record names no volume, so a labelled one that no container mounted is not this removal's to take.
  const unnamed = await labelledVolumes();
  if (unnamed.length > 0) {
    process.stderr.write(`[bench] stays, labelled and named by no record: ${unnamed.join(", ")} — the next make records it\n`);
  }
  return "destroyed";
}
