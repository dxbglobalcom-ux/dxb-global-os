import type { InstanceRecord } from "./instances.ts";

export type ContainerFacts = { id: string; name: string; project: string; createdAt: string; volumes: string[] };

/** A volume that carries the project's label now. Docker gives a volume's creation to the whole second. */
export type VolumeFacts = { name: string; createdAt: string };

export class RemovalRefused extends Error {
  name = "RemovalRefused";
}

/** A make that died before it could write its record. */
export type PendingRecord = { project: string; pending: true; startedAt: string };

// The company's project and the old bench's. Nothing that carries either is ever removed here.
const REFUSED_PROJECTS = ["DxB_Global_OS", "DxB_Build"] as const;

const refusedProjectIn = (text: string): string | undefined => REFUSED_PROJECTS.find((project) => text.includes(project));

/** Throws when any of the names carries a refused project — a container's label, its name, or a volume's name. */
function refuseWhatCarriesARefusedProject(found: readonly ContainerFacts[], volumes: readonly string[]): void {
  for (const container of found) {
    const refused = refusedProjectIn(container.project) ?? refusedProjectIn(container.name);
    if (refused !== undefined) throw new RemovalRefused(`container ${container.name} (${container.id}) carries ${refused}`);
  }
  for (const volume of volumes) {
    const refused = refusedProjectIn(volume);
    if (refused !== undefined) throw new RemovalRefused(`volume ${volume} carries ${refused}`);
  }
}

/** A moment taken to its whole second: Docker gives a volume's creation no finer. */
const wholeSecondOf = (moment: string): number => Math.floor(Date.parse(moment) / 1_000);

/** The labelled volume a made instance's record does not explain: it neither names it nor has a found container that mounts it. */
export function volumeTheRecordDoesNotExplain(
  found: readonly ContainerFacts[],
  record: InstanceRecord,
  labelled: readonly VolumeFacts[],
): VolumeFacts | undefined {
  const mounted = found.flatMap((container) => container.volumes);
  return labelled.find((volume) => !record.volumes.includes(volume.name) && !mounted.includes(volume.name));
}

/**
 * Pure. A name or a label never authorises a removal by itself. `labelled` is
 * the volumes that carry the project's label now (SPEC §5b.4): they stand under
 * the same authority as the found containers.
 */
export function selectRemovalTargets(
  found: readonly ContainerFacts[],
  record: InstanceRecord | PendingRecord | undefined,
  labelled: readonly VolumeFacts[],
): { containers: string[]; volumes: string[] } {
  const recordedVolumes = record !== undefined && !("pending" in record) ? record.volumes : [];
  const mounted = found.flatMap((container) => container.volumes);
  const carryingTheLabel = labelled.map((volume) => volume.name);
  // A refused name is refused wherever it stands — also in a record's text, which removes nothing.
  refuseWhatCarriesARefusedProject(found, [...recordedVolumes, ...mounted, ...carryingTheLabel]);

  if (record === undefined) {
    const unexplained = [...found.map((container) => container.name), ...carryingTheLabel.map((name) => `volume ${name}`)];
    if (unexplained.length > 0) {
      throw new RemovalRefused(`no record explains ${unexplained.join(", ")}: a label alone authorises nothing`);
    }
  } else if ("pending" in record) {
    // Moments, not texts: Docker trims the trailing zeros of a timestamp's fraction.
    const started = Date.parse(record.startedAt);
    const older = found.find((container) => !(Date.parse(container.createdAt) >= started));
    if (older !== undefined) {
      throw new RemovalRefused(
        `container ${older.name} (${older.id}) was created at ${older.createdAt}, not after the make started at ${record.startedAt}`,
      );
    }
    // Both to the whole second: a volume made in the second the make started is this make's.
    const startedInSecond = wholeSecondOf(record.startedAt);
    const olderVolume = labelled.find((volume) => !(wholeSecondOf(volume.createdAt) >= startedInSecond));
    if (olderVolume !== undefined) {
      throw new RemovalRefused(
        `volume ${olderVolume.name} was created at ${olderVolume.createdAt}, before the make started at ${record.startedAt}`,
      );
    }
  } else {
    const stranger = found.find((container) => !record.containers.includes(container.id));
    if (stranger !== undefined) {
      throw new RemovalRefused(`container ${stranger.name} (${stranger.id}) is not in the record of the instance`);
    }
    const unexplained = volumeTheRecordDoesNotExplain(found, record, labelled);
    if (unexplained !== undefined) {
      throw new RemovalRefused(`volume ${unexplained.name} carries the label; the record does not name it and no found container mounts it`);
    }
  }
  // What carries the label now, and what a found container mounts: a name that stands only in the list file's text removes nothing.
  return { containers: found.map((container) => container.id), volumes: [...new Set([...carryingTheLabel, ...mounted])] };
}
