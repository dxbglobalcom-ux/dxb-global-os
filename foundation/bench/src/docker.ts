// The bench as Docker sees it. Every question here is asked for the bench's own
// project label or its own network's name; every removal takes the one id or
// name it was handed — no name pattern, no prune, and never the CLI's `stop`.
import { BENCH, PROJECT_LABEL_KEY } from "./bench.ts";
import type { Queryable } from "./identity.ts";
import type { ContainerFacts, VolumeFacts } from "./removal.ts";
import { linesOf, run } from "./run.ts";

const ASK_MS = 30_000;
const REMOVE_MS = 60_000;

const docker = (args: readonly string[], timeoutMs: number = ASK_MS): Promise<string> => run("docker", args, { timeoutMs });

const CARRIES_THE_LABEL = ["--filter", `label=${PROJECT_LABEL_KEY}=${BENCH.project}`];
const HOST_BINDING_OPTION = "com.docker.network.bridge.host_binding_ipv4";

/** One port a container publishes on the host. */
export type PublishedPort = { containerPort: string; hostAddress: string; hostPort: number };

/** A container that carries the project's label: the facts removal is decided on, and how it stands now. */
export type BenchContainer = ContainerFacts & { running: boolean; published: PublishedPort[] };

/** The part of `docker inspect <container>` the bench reads. */
type InspectedContainer = {
  Id: string;
  Name: string;
  Created: string;
  State: { Running: boolean };
  Config: { Labels: Record<string, string> | null };
  Mounts: { Type: string; Name?: string }[] | null;
  NetworkSettings: { Ports: Record<string, { HostIp: string; HostPort: string }[] | null> | null };
};

function benchContainerOf(inspected: InspectedContainer): BenchContainer {
  const published = Object.entries(inspected.NetworkSettings.Ports ?? {}).flatMap(([containerPort, bindings]) =>
    (bindings ?? []).map((binding) => ({ containerPort, hostAddress: binding.HostIp, hostPort: Number(binding.HostPort) })),
  );
  // Volumes only, named or anonymous: a bind mount is a path of the host and never the bench's to remove.
  const volumes = (inspected.Mounts ?? []).flatMap((mount) =>
    mount.Type === "volume" && mount.Name !== undefined ? [mount.Name] : [],
  );
  return {
    id: inspected.Id,
    name: inspected.Name.replace(/^\//, ""),
    project: inspected.Config.Labels?.[PROJECT_LABEL_KEY] ?? "",
    createdAt: inspected.Created,
    volumes,
    running: inspected.State.Running,
    published,
  };
}

/** Every container, running or not, that carries the project's label. */
export async function labelledContainers(): Promise<BenchContainer[]> {
  const ids = linesOf(await docker(["ps", "--all", "--no-trunc", ...CARRIES_THE_LABEL, "--format", "{{.ID}}"]));
  if (ids.length === 0) return [];
  const inspected = JSON.parse(await docker(["inspect", "--type", "container", ...ids])) as InspectedContainer[];
  return inspected.map(benchContainerOf);
}

/** The volumes that carry the project's label — also those no container mounts any more — each with its creation, which Docker gives to the second. */
export async function labelledVolumes(): Promise<VolumeFacts[]> {
  const names = linesOf(await docker(["volume", "ls", ...CARRIES_THE_LABEL, "--format", "{{.Name}}"]));
  if (names.length === 0) return [];
  const inspected = JSON.parse(await docker(["volume", "inspect", ...names])) as { Name: string; CreatedAt: string }[];
  return inspected.map((volume) => ({ name: volume.Name, createdAt: volume.CreatedAt }));
}

/** The names of every volume Docker holds: what a removal checks a name against before it asks. */
export async function standingVolumes(): Promise<string[]> {
  return linesOf(await docker(["volume", "ls", "--format", "{{.Name}}"]));
}

/** The bench's network as it stands: the host address its published ports bind, and how many containers are on it. */
export type BenchNetwork = { hostBinding: string | undefined; attached: number };

export async function benchNetwork(): Promise<BenchNetwork | undefined> {
  // `name=` matches a part of a name; the exact name is looked for in what it answers.
  const names = linesOf(await docker(["network", "ls", "--filter", `name=${BENCH.network}`, "--format", "{{.Name}}"]));
  if (!names.includes(BENCH.network)) return undefined;
  const [inspected] = JSON.parse(await docker(["network", "inspect", BENCH.network])) as {
    Options: Record<string, string> | null;
    Containers: Record<string, unknown> | null;
  }[];
  if (inspected === undefined) throw new Error(`docker network inspect ${BENCH.network} answered nothing`);
  return {
    hostBinding: inspected.Options?.[HOST_BINDING_OPTION],
    attached: Object.keys(inspected.Containers ?? {}).length,
  };
}

/** Creates the bench's network so that every port published on it binds the loopback address only. */
export async function createBenchNetwork(): Promise<void> {
  await docker(["network", "create", "--opt", `${HOST_BINDING_OPTION}=${BENCH.bind}`, BENCH.network]);
}

export async function removeBenchNetwork(): Promise<void> {
  await docker(["network", "rm", BENCH.network], REMOVE_MS);
}

/** Removes one container, running or not, by its id. Its volumes stay: they are removed by their names. */
export async function removeContainer(id: string): Promise<void> {
  await docker(["rm", "--force", "--", id], REMOVE_MS);
}

/** Removes one volume by its name. Docker refuses while any container still mounts it. */
export async function removeVolume(name: string): Promise<void> {
  await docker(["volume", "rm", "--", name], REMOVE_MS);
}

/**
 * The server inside one container, asked through `docker exec` on the
 * container's id — the path the old chain takes. A `Queryable` for one select
 * at a time: the server answers it as JSON, so the rows keep its column names.
 */
export function serverInside(containerId: string): Queryable {
  return {
    async query(text) {
      const asJson = `select coalesce(json_agg(answer), '[]'::json) from (${text}) answer`;
      const psql = ["psql", "-U", "postgres", "-d", "postgres", "-X", "-At", "-v", "ON_ERROR_STOP=1", "-c", asJson];
      return { rows: JSON.parse(await docker(["exec", containerId, ...psql])) as Record<string, unknown>[] };
    },
  };
}
