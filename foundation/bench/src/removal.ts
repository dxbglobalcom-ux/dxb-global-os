import type { InstanceRecord } from "./instances.ts";

export type ContainerFacts = { id: string; name: string; project: string; createdAt: string; volumes: string[] };

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

/** Pure. A name or a label never authorises a removal by itself. */
export function selectRemovalTargets(
  found: readonly ContainerFacts[],
  record: InstanceRecord | PendingRecord | undefined,
): { containers: string[]; volumes: string[] } {
  const recordedVolumes = record !== undefined && !("pending" in record) ? record.volumes : [];
  const volumes = [...new Set([...recordedVolumes, ...found.flatMap((container) => container.volumes)])];
  refuseWhatCarriesARefusedProject(found, volumes);

  if (record === undefined) {
    if (found.length > 0) {
      const names = found.map((container) => container.name).join(", ");
      throw new RemovalRefused(`no record explains ${names}: a label alone authorises nothing`);
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
  } else {
    const stranger = found.find((container) => !record.containers.includes(container.id));
    if (stranger !== undefined) {
      throw new RemovalRefused(`container ${stranger.name} (${stranger.id}) is not in the record of the instance`);
    }
  }
  return { containers: found.map((container) => container.id), volumes };
}
