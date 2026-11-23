import { describe, expect, it } from "vitest";
import {
  statusOf,
  type BenchContainer,
  type InstanceRecord,
  type ListFile,
  type PendingRecord,
  type Status,
  type VolumeFacts,
} from "@dxb-foundation/bench";

// Pure (SPEC §5b.3, §5b.4): every container, volume and record below is invented —
// nothing here reaches Docker or the machine's list file.

const DB = "aaaa1111aaaa";
const KONG = "bbbb2222bbbb";

/** A running container the bench made, as Docker would describe it. */
const container = (id: string, over: Partial<BenchContainer> = {}): BenchContainer => ({
  id,
  name: `supabase_service_${id}_DxB_Foundation`,
  project: "DxB_Foundation",
  createdAt: "2026-11-23T00:10:05.000000000Z",
  volumes: [],
  running: true,
  published: [],
  ...over,
});

const DB_VOLUME: VolumeFacts = { name: "supabase_db_DxB_Foundation", createdAt: "2026-11-23T03:10:05+03:00" };

/** The record of a make that wrote its record and has not seen the chain through. */
const recorded: InstanceRecord = {
  sysid: "7700000000000000001",
  dboid: "5",
  dbname: "postgres",
  project: "DxB_Foundation",
  dbContainer: DB,
  containers: [DB, KONG],
  volumes: ["supabase_db_DxB_Foundation"],
  madeAt: "2026-11-23T00:10:30.000Z",
};
const made: InstanceRecord = { ...recorded, chainAppliedAt: "2026-11-23T00:10:55.000Z" };
const pending: PendingRecord = { project: "DxB_Foundation", pending: true, startedAt: "2026-11-23T00:10:00.123Z" };

const bothRunning = [container(DB), container(KONG)];
const listOf = (...instances: InstanceRecord[]): ListFile => ({ instances });

/** The detail of a foreign status; fails the case when the status is anything else. */
function whyForeign(status: Status): string {
  expect(status).toEqual({ state: "foreign", detail: expect.any(String) });
  const detail = (status as { detail: string }).detail;
  expect(detail.trim()).not.toBe("");
  return detail;
}

describe("statusOf — absent is nothing at all", () => {
  it("says absent with no container, no labelled volume and an empty list", () => {
    expect(statusOf([], [], listOf())).toEqual({ state: "absent" });
  });
});

describe("statusOf — standing is one record whose chain was applied, every recorded container running", () => {
  it("says standing, with the record, when the chain was applied and each recorded container runs", () => {
    expect(statusOf(bothRunning, [DB_VOLUME], listOf(made))).toEqual({ state: "standing", record: made });
  });

  it("says foreign for a record without chainAppliedAt, though everything it names runs — the chain did not finish", () => {
    expect(whyForeign(statusOf(bothRunning, [DB_VOLUME], listOf(recorded)))).toMatch(/chain/i);
  });

  it("says foreign when a recorded container is stopped", () => {
    const oneStopped = [container(DB), container(KONG, { running: false })];
    whyForeign(statusOf(oneStopped, [DB_VOLUME], listOf(made)));
  });

  it("says foreign when a recorded container is gone", () => {
    whyForeign(statusOf([container(DB)], [DB_VOLUME], listOf(made)));
  });

  it("says foreign when a container carries the label and is not in the record", () => {
    const stranger = container("dddd4444dddd");
    whyForeign(statusOf([...bothRunning, stranger], [DB_VOLUME], listOf(made)));
  });

  it("says foreign when the list holds more than one record — the bench makes one instance", () => {
    const another: InstanceRecord = { ...made, sysid: "7700000000000000002" };
    whyForeign(statusOf(bothRunning, [DB_VOLUME], listOf(made, another)));
  });
});

describe("statusOf — a make that has not finished, and what no record explains, are foreign", () => {
  it("says foreign for a pending record — with the containers it started, and with none", () => {
    whyForeign(statusOf(bothRunning, [DB_VOLUME], { instances: [], pending }));
    whyForeign(statusOf([], [], { instances: [], pending }));
  });

  it("says foreign for containers that carry the label when the list holds no record", () => {
    whyForeign(statusOf(bothRunning, [], listOf()));
  });

  it("says foreign for a labelled volume when the list holds no record — a volume stands like a container does", () => {
    whyForeign(statusOf([], [DB_VOLUME], listOf()));
  });
});
