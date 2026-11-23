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
import { decide } from "./guard.ts";
import { readIdentity, sameIdentity } from "./identity.ts";
import type { Identity } from "./identity.ts";
import { readListFile, writeListFile } from "./instances.ts";
import type { InstanceRecord, ListFile } from "./instances.ts";
import { assertTheHostLock } from "./lock.ts";
import type { HostLock } from "./lock.ts";
import { RemovalRefused, selectRemovalTargets, volumeTheRecordDoesNotExplain } from "./removal.ts";
import type { VolumeFacts } from "./removal.ts";
import { step } from "./run.ts";

export type Status =
  | { state: "absent" }
  | { state: "standing"; record: InstanceRecord }
  // something carries the project label that the list does not explain
  | { state: "foreign"; detail: string };

const named = (container: BenchContainer): string => `${container.name} (${container.id.slice(0, 12)})`;
const volumeNamed = (volume: VolumeFacts): string => `volume ${volume.name}`;
const spelled = (identity: Identity): string =>
  `cluster ${identity.sysid}, database ${identity.dboid} ${identity.dbname}`;

/** The bench makes one instance. A list that holds more is said here, and nothing is decided on it. */
const moreRecordsThanOne = (list: ListFile): string | undefined =>
  list.instances.length > 1 ? `the list holds ${list.instances.length} records; the bench makes one instance` : undefined;

/**
 * Pure: what the labelled containers, the labelled volumes and the list file
 * say together (SPEC §5b.3, §5b.4). Standing is one record whose chain was
 * applied and that explains every container and every volume, each of its
 * containers running; absent is no container, no volume and an empty list;
 * everything between is foreign.
 */
export function statusOf(containers: readonly BenchContainer[], labelled: readonly VolumeFacts[], list: ListFile): Status {
  const foreign = (detail: string): Status => ({ state: "foreign", detail });
  const tooMany = moreRecordsThanOne(list);
  if (tooMany !== undefined) return foreign(tooMany);
  if (list.pending !== undefined) {
    const carrying = `containers carrying the label: ${containers.length}, volumes: ${labelled.length}`;
    return foreign(`a make started at ${list.pending.startedAt} has not finished (${carrying})`);
  }
  const [record] = list.instances;
  if (record === undefined) {
    if (containers.length === 0 && labelled.length === 0) return { state: "absent" };
    return foreign(`the list holds no record of ${[...containers.map(named), ...labelled.map(volumeNamed)].join(", ")}`);
  }
  const stranger = containers.find((container) => !record.containers.includes(container.id));
  if (stranger !== undefined) return foreign(`${named(stranger)} carries the label and is not in the record`);
  const unexplained = volumeTheRecordDoesNotExplain(containers, record, labelled);
  if (unexplained !== undefined) return foreign(`${volumeNamed(unexplained)} carries the label and is not in the record`);
  const running = containers.filter((container) => container.running).length;
  if (running < record.containers.length) {
    return foreign(`of the ${record.containers.length} recorded containers, ${running} are running`);
  }
  // A record is not yet a made instance: the old chain is seen whole before it says so.
  if (record.chainAppliedAt === undefined) return foreign(`the chain did not finish on the instance recorded at ${record.madeAt}`);
  return { state: "standing", record };
}

export async function instanceStatus(): Promise<Status> {
  return statusOf(await labelledContainers(), await labelledVolumes(), readListFile());
}

/**
 * While the recorded database container runs, the server inside it — asked by
 * `docker exec` on its id — must be the recorded database, and never a cluster
 * the guard refuses by name, whatever the record says (SPEC §5b.5). Anything
 * else, an identity that cannot be read included, refuses the removal.
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
  // The refused list is asked before the record: a record that names a refused cluster explains nothing.
  const byTheGuard = decide(answered, []);
  if (!byTheGuard.allowed && byTheGuard.reason !== "not-listed") {
    throw new RemovalRefused(`the database container ${named(database)} answers the cluster of the ${byTheGuard.reason}, ${answered.sysid}`);
  }
  if (!sameIdentity(answered, record)) {
    throw new RemovalRefused(
      `the database container ${named(database)} answers ${spelled(answered)}; the record says ${spelled(record)}`,
    );
  }
}

/** The bench's network goes when nothing is attached to it — on every path of a removal, also when nothing else stood. */
async function removeTheNetworkWhenUnattached(lock: HostLock): Promise<void> {
  if ((await benchNetwork())?.attached !== 0) return;
  assertTheHostLock(lock);
  await step(`removing the network ${BENCH.network}`, removeBenchNetwork);
}

/**
 * Removes the instance the list explains — a made one by its record, an
 * unfinished make by its pending record — and nothing the list does not explain.
 * Containers go by id, volumes by the names `selectRemovalTargets` answered,
 * the network when nothing is attached to it, and last the record — only after
 * it has looked again and found nothing that carries the label (SPEC §5b.4).
 * The host lock is asked for again before each removal.
 */
export async function destroyInstance(lock: HostLock): Promise<"destroyed" | "absent"> {
  assertTheHostLock(lock);
  const containers = await labelledContainers();
  const labelled = await labelledVolumes();
  const list = readListFile();
  const tooMany = moreRecordsThanOne(list);
  if (tooMany !== undefined) throw new RemovalRefused(tooMany);
  const [record] = list.instances;
  const explainedBy = record ?? list.pending;
  if (containers.length === 0 && labelled.length === 0 && explainedBy === undefined) {
    await removeTheNetworkWhenUnattached(lock);
    return "absent";
  }

  const targets = selectRemovalTargets(containers, explainedBy, labelled);
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
  await removeTheNetworkWhenUnattached(lock);

  // Looked at again, not concluded from the calls above: while anything carries the label the record stays, and with it the authority to remove.
  const left = [...(await labelledContainers()).map(named), ...(await labelledVolumes()).map(volumeNamed)];
  if (left.length > 0) throw new Error(`the removal left ${left.join(", ")} carrying the label; the list is kept as it was`);
  assertTheHostLock(lock);
  writeListFile({ instances: [] });
  return "destroyed";
}
