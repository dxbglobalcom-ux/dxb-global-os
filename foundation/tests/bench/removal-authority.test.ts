import { describe, expect, it } from "vitest";
import {
  RemovalRefused,
  selectRemovalTargets,
  type ContainerFacts,
  type InstanceRecord,
  type PendingRecord,
} from "@dxb-foundation/bench";

// Every container below is invented. The company's and the old bench's names are
// spelled only as facts handed to a pure function — nothing here reaches Docker.

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

const sorted = (names: readonly string[]): string[] => [...new Set(names)].sort();

describe("removal authority — a refused project is refused before anything else", () => {
  it.each([
    ["the company's project as its label", { project: "DxB_Global_OS" }],
    ["the old bench's project as its label", { project: "DxB_Build" }],
    ["the company's project in its name, under the bench's label", { name: "supabase_db_DxB_Global_OS" }],
    ["the old bench's project in its name, under the bench's label", { name: "supabase_db_DxB_Build" }],
  ])("refuses a container that carries %s — even when the record lists its id", (_what, over) => {
    const found = [benchContainer(KONG), benchContainer(DB, over)];
    expect(() => selectRemovalTargets(found, record)).toThrow(RemovalRefused);
  });

  it("refuses it under a pending record, however lately it was created", () => {
    const found = [benchContainer(DB, { name: "supabase_db_DxB_Build", createdAt: "2026-11-23T00:20:00.000000000Z" })];
    expect(() => selectRemovalTargets(found, pending)).toThrow(RemovalRefused);
  });

  it("refuses it with no record", () => {
    const found = [benchContainer(DB, { project: "DxB_Global_OS", name: "supabase_db_DxB_Global_OS" })];
    expect(() => selectRemovalTargets(found, undefined)).toThrow(RemovalRefused);
  });
});

describe("removal authority — with the record of a made instance", () => {
  it("answers the found containers' ids, and the record's volumes joined with the found containers' own", () => {
    const found = [
      benchContainer(DB, { volumes: ["supabase_db_DxB_Foundation", "an_anonymous_volume_0f0f"] }),
      benchContainer(KONG),
      benchContainer(AUTH, { volumes: ["supabase_edge_runtime_DxB_Foundation"] }),
    ];
    const targets = selectRemovalTargets(found, record);
    expect(sorted(targets.containers)).toEqual([DB, KONG, AUTH].sort());
    expect(targets.containers).toHaveLength(3);
    expect(sorted(targets.volumes)).toEqual([
      "an_anonymous_volume_0f0f",
      "supabase_db_DxB_Foundation",
      "supabase_edge_runtime_DxB_Foundation",
    ]);
  });

  it("answers only the ids that were found — not the recorded ones that are already gone", () => {
    const targets = selectRemovalTargets([benchContainer(KONG)], record);
    expect(targets.containers).toEqual([KONG]);
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation"]);
  });

  it("with nothing found, answers no container and the record's volumes", () => {
    const targets = selectRemovalTargets([], record);
    expect(targets.containers).toEqual([]);
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation"]);
  });

  it("refuses when a found container's id is not in the record, and names the stranger", () => {
    const stranger = benchContainer("dddd4444dddd", { name: "supabase_rest_DxB_Foundation" });
    let refusal: unknown;
    try {
      selectRemovalTargets([benchContainer(DB), stranger, benchContainer(KONG)], record);
    } catch (error) {
      refusal = error;
    }
    expect(refusal).toBeInstanceOf(RemovalRefused);
    const message = (refusal as RemovalRefused).message;
    expect(message.includes("dddd4444dddd") || message.includes("supabase_rest_DxB_Foundation")).toBe(true);
  });

  it("a label and a name of the bench do not make a stranger removable", () => {
    const lookalike = benchContainer("eeee5555eeee", { name: "supabase_db_DxB_Foundation", project: "DxB_Foundation" });
    expect(() => selectRemovalTargets([lookalike], record)).toThrow(RemovalRefused);
  });
});

describe("removal authority — with a pending record, a make that died before it wrote its record", () => {
  it("answers the containers created at or after the make started, with their volumes", () => {
    const found = [
      benchContainer(DB, { createdAt: "2026-11-23T00:10:00.123Z", volumes: ["supabase_db_DxB_Foundation"] }),
      benchContainer(KONG, { createdAt: "2026-11-23T00:10:07.5Z" }),
    ];
    const targets = selectRemovalTargets(found, pending);
    expect(sorted(targets.containers)).toEqual([DB, KONG].sort());
    expect(sorted(targets.volumes)).toEqual(["supabase_db_DxB_Foundation"]);
  });

  it("refuses when one container was created before the make started", () => {
    const found = [
      benchContainer(DB, { createdAt: "2026-11-23T00:10:05.000000000Z" }),
      benchContainer(KONG, { createdAt: "2026-11-22T23:59:59.000000000Z" }),
    ];
    expect(() => selectRemovalTargets(found, pending)).toThrow(RemovalRefused);
  });

  it("compares the two as moments, not as texts: 00:10:00.1Z is before a make started at 00:10:00.123Z", () => {
    // Docker trims a timestamp's trailing zeros, so the earlier moment sorts later as a string.
    const found = [benchContainer(DB, { createdAt: "2026-11-23T00:10:00.1Z" })];
    expect(() => selectRemovalTargets(found, pending)).toThrow(RemovalRefused);
  });

  it("with nothing found, answers nothing to remove", () => {
    expect(selectRemovalTargets([], pending)).toEqual({ containers: [], volumes: [] });
  });
});

describe("removal authority — with no record", () => {
  it("refuses when containers were found: the label alone authorises nothing", () => {
    expect(() => selectRemovalTargets([benchContainer(DB), benchContainer(KONG)], undefined)).toThrow(RemovalRefused);
  });

  it("answers nothing to remove when nothing was found", () => {
    expect(selectRemovalTargets([], undefined)).toEqual({ containers: [], volumes: [] });
  });
});
