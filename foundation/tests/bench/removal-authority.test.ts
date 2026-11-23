import { describe, expect, it } from "vitest";
import {
  RemovalRefused,
  selectRemovalTargets,
  type ContainerFacts,
  type InstanceRecord,
  type PendingRecord,
  type VolumeFacts,
} from "@dxb-foundation/bench";

// Every container and volume below is invented. The company's and the old bench's names
// are spelled only as facts handed to a pure function — nothing here reaches Docker.

const DB = "aaaa1111aaaa";
const KONG = "bbbb2222bbbb";
const AUTH = "cccc3333cccc";

/** A container the bench made, as Docker would describe it. */
const benchContainer = (id: string, over: Partial<ContainerFacts> = {}): ContainerFacts => ({
  id,
  name: `supabase_service_${id}_DxB_Foundation`,
  project: "DxB_Foundation",
  createdAt: "2026-11-23T00:10:05.000000000Z",
  volumes: [],
  ...over,
});

const record: InstanceRecord = {
  sysid: "7700000000000000001",
  dboid: "5",
  dbname: "postgres",
  project: "DxB_Foundation",
  dbContainer: DB,
  containers: [DB, KONG, AUTH],
  volumes: ["supabase_db_DxB_Foundation"],
  madeAt: "2026-11-23T00:10:30.000Z",
};

const pending: PendingRecord = { project: "DxB_Foundation", pending: true, startedAt: "2026-11-23T00:10:00.123Z" };

/** A volume that carries the bench's label now, as Docker describes it: created to the whole second, in the host's offset. */
const labelledVolume = (name: string, createdAt = "2026-11-23T03:10:05+03:00"): VolumeFacts => ({ name, createdAt });
const DB_VOLUME = labelledVolume("supabase_db_DxB_Foundation");
const EDGE_VOLUME = labelledVolume("supabase_edge_runtime_DxB_Foundation");

const sorted = (names: readonly string[]): string[] => [...new Set(names)].sort();

/** The message of the RemovalRefused a call ends in; fails the case when it ends any other way. */
function whyRefused(call: () => unknown): string {
  let refusal: unknown;
  try {
    call();
  } catch (error) {
    refusal = error;
  }
  expect(refusal).toBeInstanceOf(RemovalRefused);
  return (refusal as RemovalRefused).message;
}

describe("removal authority — a refused project is refused before anything else", () => {
  it.each([
    ["the company's project as its label", { project: "DxB_Global_OS" }],
    ["the old bench's project as its label", { project: "DxB_Build" }],
    ["the company's project in its name, under the bench's label", { name: "supabase_db_DxB_Global_OS" }],
    ["the old bench's project in its name, under the bench's label", { name: "supabase_db_DxB_Build" }],
  ])("refuses a container that carries %s — even when the record lists its id", (_what, over) => {
    const found = [benchContainer(KONG), benchContainer(DB, over)];
    expect(() => selectRemovalTargets(found, record, [DB_VOLUME])).toThrow(RemovalRefused);
  });

  it("refuses it under a pending record, however lately it was created", () => {
    const found = [benchContainer(DB, { name: "supabase_db_DxB_Build", createdAt: "2026-11-23T00:20:00.000000000Z" })];
    expect(() => selectRemovalTargets(found, pending, [])).toThrow(RemovalRefused);
  });

  it("refuses it with no record for the project it carries — not only because no record explains it", () => {
    // Only the label carries the company's project; the name is one the bench gives. With no
    // record every container is refused, so what tells this rule apart is the project it names.
    const found = [benchContainer(DB, { project: "DxB_Global_OS" })];
    expect(whyRefused(() => selectRemovalTargets(found, undefined, []))).toContain("DxB_Global_OS");
  });

  it.each<[string, ContainerFacts[], InstanceRecord | PendingRecord, VolumeFacts[]]>([
    ["the company's, standing in the record's volumes", [], { ...record, volumes: ["supabase_db_DxB_Global_OS"] }, []],
    ["the old bench's, standing in the record's volumes", [], { ...record, volumes: ["supabase_db_DxB_Build"] }, []],
    ["the old bench's, mounted by a recorded container", [benchContainer(DB, { volumes: ["supabase_db_DxB_Build"] })], record, []],
    ["the company's, carrying the bench's label since the pending make", [], pending, [labelledVolume("supabase_db_DxB_Global_OS")]],
  ])("refuses a volume whose name carries a refused project — %s", (_what, found, explainedBy, labelled) => {
    expect(() => selectRemovalTargets(found, explainedBy, labelled)).toThrow(RemovalRefused);
  });
});

describe("removal authority — with the record of a made instance", () => {
  it("answers the found containers' ids, and the volumes that carry the label joined with the found containers' own", () => {
    const found = [
      benchContainer(DB, { volumes: ["supabase_db_DxB_Foundation", "an_anonymous_volume_0f0f"] }),
      benchContainer(KONG),
      // The record does not name this volume; a found container mounts it, and that is enough.
      benchContainer(AUTH, { volumes: ["supabase_edge_runtime_DxB_Foundation"] }),
    ];
    const targets = selectRemovalTargets(found, record, [DB_VOLUME, EDGE_VOLUME]);
    expect(sorted(targets.containers)).toEqual([DB, KONG, AUTH].sort());
    expect(targets.containers).toHaveLength(3);
    expect(sorted(targets.volumes)).toEqual([
      "an_anonymous_volume_0f0f",
      "supabase_db_DxB_Foundation",
      "supabase_edge_runtime_DxB_Foundation",
    ]);
  });

  it("answers only the ids that were found — not the recorded ones that are already gone", () => {
    const targets = selectRemovalTargets([benchContainer(KONG)], record, [DB_VOLUME]);
    expect(targets.containers).toEqual([KONG]);
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation"]);
  });

  it("with nothing found, answers no container and the recorded volume that still carries the label", () => {
    const targets = selectRemovalTargets([], record, [DB_VOLUME]);
    expect(targets.containers).toEqual([]);
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation"]);
  });

  it("a name that stands only in the record's text removes nothing — with nothing found, and beside a found container", () => {
    expect(selectRemovalTargets([], record, [])).toEqual({ containers: [], volumes: [] });
    expect(selectRemovalTargets([benchContainer(KONG)], record, [])).toEqual({ containers: [KONG], volumes: [] });
  });

  it("a volume a found container mounts is removed, though it carries no label and the record does not name it", () => {
    const found = [benchContainer(DB, { volumes: ["an_anonymous_volume_0f0f"] })];
    expect(selectRemovalTargets(found, record, [])).toEqual({ containers: [DB], volumes: ["an_anonymous_volume_0f0f"] });
  });

  it("refuses a labelled volume that the record does not name and no found container mounts", () => {
    const found = [benchContainer(DB, { volumes: ["supabase_db_DxB_Foundation"] }), benchContainer(KONG)];
    expect(() => selectRemovalTargets(found, record, [DB_VOLUME, EDGE_VOLUME])).toThrow(RemovalRefused);
    expect(() => selectRemovalTargets([], record, [EDGE_VOLUME])).toThrow(RemovalRefused);
  });

  it("refuses when a found container's id is not in the record, and names the stranger", () => {
    const stranger = benchContainer("dddd4444dddd", { name: "supabase_rest_DxB_Foundation" });
    const message = whyRefused(() => selectRemovalTargets([benchContainer(DB), stranger, benchContainer(KONG)], record, []));
    expect(message.includes("dddd4444dddd") || message.includes("supabase_rest_DxB_Foundation")).toBe(true);
  });

  it("a label and a name of the bench do not make a stranger removable", () => {
    const lookalike = benchContainer("eeee5555eeee", { name: "supabase_db_DxB_Foundation", project: "DxB_Foundation" });
    expect(() => selectRemovalTargets([lookalike], record, [DB_VOLUME])).toThrow(RemovalRefused);
  });
});

describe("removal authority — with a pending record, a make that died before it wrote its record", () => {
  it("answers the containers created at or after the make started, with their volumes", () => {
    const found = [
      benchContainer(DB, { createdAt: "2026-11-23T00:10:00.123Z", volumes: ["supabase_db_DxB_Foundation"] }),
      benchContainer(KONG, { createdAt: "2026-11-23T00:10:07.5Z" }),
    ];
    const targets = selectRemovalTargets(found, pending, []);
    expect(sorted(targets.containers)).toEqual([DB, KONG].sort());
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation"]);
  });

  it("takes a labelled volume created in the second the make started — a volume's creation is known to the second", () => {
    // 03:10:00+03:00 is 00:10:00Z: before 00:10:00.123Z as a moment, the same second as it.
    const sameSecond = labelledVolume("supabase_edge_runtime_DxB_Foundation", "2026-11-23T03:10:00+03:00");
    const targets = selectRemovalTargets([], pending, [sameSecond, labelledVolume("supabase_db_DxB_Foundation")]);
    expect(targets.containers).toEqual([]);
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation", "supabase_edge_runtime_DxB_Foundation"]);
  });

  it("refuses a labelled volume created in a second before the make started — an earlier attempt's, not this make's", () => {
    // 03:09:59+03:00 is 00:09:59Z, one second early — and as a text it sorts after the start.
    const older = labelledVolume("supabase_db_DxB_Foundation", "2026-11-23T03:09:59+03:00");
    expect(() => selectRemovalTargets([], pending, [older])).toThrow(RemovalRefused);
    const found = [benchContainer(DB, { createdAt: "2026-11-23T00:10:05.000000000Z" })];
    expect(() => selectRemovalTargets(found, pending, [EDGE_VOLUME, older])).toThrow(RemovalRefused);
  });

  it("refuses when one container was created before the make started", () => {
    const found = [
      benchContainer(DB, { createdAt: "2026-11-23T00:10:05.000000000Z" }),
      benchContainer(KONG, { createdAt: "2026-11-22T23:59:59.000000000Z" }),
    ];
    expect(() => selectRemovalTargets(found, pending, [])).toThrow(RemovalRefused);
  });

  it("compares the two as moments, not as texts: 00:10:00.1Z is before a make started at 00:10:00.123Z", () => {
    // Docker trims a timestamp's trailing zeros, so the earlier moment sorts later as a string.
    const found = [benchContainer(DB, { createdAt: "2026-11-23T00:10:00.1Z" })];
    expect(() => selectRemovalTargets(found, pending, [])).toThrow(RemovalRefused);
  });

  it("with nothing found and no labelled volume, answers nothing to remove", () => {
    expect(selectRemovalTargets([], pending, [])).toEqual({ containers: [], volumes: [] });
  });
});

describe("removal authority — with no record", () => {
  it("refuses when containers were found: the label alone authorises nothing", () => {
    expect(() => selectRemovalTargets([benchContainer(DB), benchContainer(KONG)], undefined, [])).toThrow(RemovalRefused);
  });

  it("refuses any labelled volume, though no container was found: the label alone authorises nothing", () => {
    expect(() => selectRemovalTargets([], undefined, [DB_VOLUME])).toThrow(RemovalRefused);
  });

  it("answers nothing to remove when no container was found and no volume carries the label", () => {
    expect(selectRemovalTargets([], undefined, [])).toEqual({ containers: [], volumes: [] });
  });
});
