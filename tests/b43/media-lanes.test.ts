// B43 · plan ① (CEO 2026-09-05 "Onaylıyorum, başla"): THE HANDS ARE LANES TOO.
// Measured before the change: the media tick claimed one job per ten seconds and
// re-armed only after it ended — 30 jobs in the company's book, 0 overlapping pairs;
// a probe waited behind a fourteen-minute shoot. Now: one GPU lane, N CPU lanes,
// each its own loop (media-lanes.ts on top of task-lanes.ts).
//   1. pure: a processor job is claimed while the card lane is inside a long shoot
//   2. pure: two card jobs never overlap — the card is one
//   3. pure: a lane that just finished looks again at once; an idle lane rests one tick
//   4. pure: DXB_MEDIA_CPU_LANES=0 is the rollback shape (one lane, every kind, the old id)
//   5. engine: runMediaLaneOnce with `kinds` claims only its kinds; a GPU-kinds lane and a
//      CPU-kinds lane run their jobs AT THE SAME TIME on the construction engine, and the
//      job book shows the overlap (started/ended) — the claim the CEO's screen will read
// Suite deletes ONLY what it creates (marker b43l-…, E9.3 rule). Construction engine
// only — vitest.config.ts injects the address.
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { sql } from "kysely";
import { closeDb, getDb, resolveMediaBinary } from "@dxb/shared";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import { CPU_KINDS, GPU_KINDS, runMediaLaneOnce, type EngineRunner, type MediaKind, type MediaLaneResult } from "../../packages/outbox-executor/src/media-lane.js";
import { ALL_MEDIA_KINDS, MediaLanes, cpuLanesFromEnv, desiredMediaLanes, mediaLaneId, mediaLaneKinds } from "../../packages/outbox-executor/src/media-lanes.js";
import { pinHookOff, sweepByDepartment } from "../helpers/suite-scope.js";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ── 1–4: the loop shape, no engine ────────────────────────────────────────────

interface FakeJob { kind: MediaKind; ms: number; name: string }

/** a queue of fake jobs; runOnce claims the oldest job whose kind the lane may take */
function fakeQueue(jobs: FakeJob[]) {
  const queue = [...jobs];
  const t0 = Date.now();
  const started: Record<string, number> = {};
  const ended: Record<string, number> = {};
  const runOnce = async (o: { laneId: string; kinds: readonly MediaKind[] }): Promise<MediaLaneResult> => {
    const i = queue.findIndex((j) => o.kinds.includes(j.kind));
    if (i < 0) return { claimed: false };
    const [job] = queue.splice(i, 1);
    started[job.name] = Date.now() - t0;
    await wait(job.ms);
    ended[job.name] = Date.now() - t0;
    return { claimed: true, jobId: job.name, status: "done" };
  };
  return { runOnce, started, ended, queue };
}

describe("B43 · media lanes — the studio's hands are lanes too", () => {
  it("a processor job is claimed while the card lane is inside a long shoot", async () => {
    const q = fakeQueue([
      { kind: "shoot", ms: 600, name: "shoot" },
      { kind: "probe", ms: 20, name: "probe" },
      { kind: "voice", ms: 20, name: "voice" },
    ]);
    const lanes = new MediaLanes({ runOnce: q.runOnce, sleep: wait }, { cpuLanes: 2, restMs: 50, laneIdBase: "w" });
    expect(lanes.reconcile()).toEqual({ desired: 3, started: 3, running: 3 });
    await wait(150);
    expect(q.started.shoot).toBeLessThan(100);
    expect(q.started.probe).toBeLessThan(100); // taken by a CPU lane while the card lane is busy
    expect(q.started.voice).toBeLessThan(100);
    expect(q.ended.shoot).toBeUndefined(); // the shoot is still running
    await lanes.stop();
    expect(lanes.running).toBe(0);
  });

  it("two card jobs never overlap — the card is one", async () => {
    const q = fakeQueue([
      { kind: "shoot", ms: 200, name: "a" },
      { kind: "still", ms: 100, name: "b" },
    ]);
    const lanes = new MediaLanes({ runOnce: q.runOnce, sleep: wait }, { cpuLanes: 3, restMs: 30, laneIdBase: "w" });
    lanes.reconcile();
    await wait(450);
    expect(q.ended.a).toBeDefined();
    expect(q.started.b).toBeGreaterThanOrEqual(q.ended.a);
    await lanes.stop();
  });

  it("a lane that just finished looks again at once; an idle lane rests one tick", async () => {
    const calls: number[] = [];
    const t0 = Date.now();
    let left = 2;
    const runOnce = async (): Promise<MediaLaneResult> => {
      calls.push(Date.now() - t0);
      if (left > 0) {
        left -= 1;
        await wait(20);
        return { claimed: true, jobId: "x", status: "done" };
      }
      return { claimed: false };
    };
    const lanes = new MediaLanes({ runOnce, sleep: wait }, { cpuLanes: 0, restMs: 200, laneIdBase: "w" });
    expect(lanes.reconcile()).toEqual({ desired: 1, started: 1, running: 1 });
    await wait(120);
    // two claims back to back (≈20 ms apart), then the first empty look — no 200 ms rest between jobs
    expect(calls.length).toBe(3);
    expect(calls[1] - calls[0]).toBeLessThan(100);
    expect(calls[2] - calls[1]).toBeLessThan(100);
    await wait(250);
    // the idle lane rested a full tick before looking again
    expect(calls.length).toBe(4);
    expect(calls[3] - calls[2]).toBeGreaterThanOrEqual(190);
    await lanes.stop();
  });

  it("DXB_MEDIA_CPU_LANES=0 is the rollback shape: one lane, every kind, the historical id", () => {
    expect(cpuLanesFromEnv({ DXB_MEDIA_CPU_LANES: "0" } as NodeJS.ProcessEnv)).toBe(0);
    expect(cpuLanesFromEnv({} as NodeJS.ProcessEnv)).toBe(3);
    expect(cpuLanesFromEnv({ DXB_MEDIA_CPU_LANES: "99" } as NodeJS.ProcessEnv)).toBe(8);
    expect(desiredMediaLanes(0)).toBe(1);
    expect(desiredMediaLanes(3)).toBe(4);
    expect(mediaLaneId("resident-worker", 0, 0)).toBe("resident-worker-media");
    expect(mediaLaneId("resident-worker", 0, 3)).toBe("resident-worker-media-gpu");
    expect(mediaLaneId("resident-worker", 2, 3)).toBe("resident-worker-media-cpu-2");
    expect([...mediaLaneKinds(0, 0)].sort()).toEqual([...ALL_MEDIA_KINDS].sort());
    expect([...mediaLaneKinds(0, 3)].sort()).toEqual([...GPU_KINDS].sort());
    expect([...mediaLaneKinds(1, 3)].sort()).toEqual([...CPU_KINDS].sort());
    expect(ALL_MEDIA_KINDS.length).toBe(6);
  });
});

// ── 5: the real lane on the construction engine ───────────────────────────────

const db = () => getDb();
const M = `b43l-${randomUUID().slice(0, 6)}`;
const DEPT = `${M}-studio`;

pinHookOff(db);

let client: Client;
let workRoot: string;
let clip: string;

async function callJson(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

async function makeTask(department: string): Promise<string> {
  const row = await db()
    .insertInto("tasks")
    .values({
      department,
      agent_id: null,
      objective: `${M} media lanes task`,
      output_contract: "probe",
      model_tier: "L4",
      approval_class: "none",
      budget_max_tokens: 1000,
      priority: 5,
      status: "queued",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

beforeAll(async () => {
  workRoot = mkdtempSync(join(tmpdir(), "b43-lanes-"));
  process.env.DXB_MEDIA_WORK_ROOT = workRoot;
  process.env.DXB_MEDIA_PROBE_ROOTS = workRoot;
  clip = join(workRoot, "pattern.mp4");
  execFileSync(resolveMediaBinary("ffmpeg"), [
    "-y", "-v", "error", "-f", "lavfi", "-i", "testsrc=size=320x180:rate=24:duration=1",
    "-pix_fmt", "yuv420p", "-c:v", "libx264", clip,
  ]);
  const server = createDxbMcpServer();
  client = new Client({ name: "b43-lanes-test", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  await sweepByDepartment(db(), M);
  await sql`DELETE FROM media_jobs WHERE department LIKE 'b43l-%'`.execute(db()); // earlier runs of this family
});

afterAll(async () => {
  await sql`DELETE FROM audit_log WHERE payload::text LIKE ${"%" + M + "%"}`.execute(db()).catch(() => {});
  await sql`DELETE FROM media_jobs WHERE department LIKE 'b43l-%'`.execute(db());
  await sweepByDepartment(db(), M);
  await client.close();
  await closeDb();
  rmSync(workRoot, { recursive: true, force: true });
});

describe("B43 · media lanes on the engine — kinds are claimed by the right lane, at the same time", () => {
  it("a GPU-kinds lane and a CPU-kinds lane run their jobs at once; the book shows the overlap", { timeout: 30_000 }, async () => {
    const taskId = await makeTask(DEPT);
    const shoot = await callJson("media_submit", { task_id: taskId, kind: "shoot", params: { prompt: `${M}`, seconds: 1, width: 512, height: 256, prefix: M } });
    const probe = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: clip } });
    const probe2 = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: clip } });

    const slowShoot: EngineRunner = async () => {
      await wait(900);
      return { output_path: null, result: { fake: "shoot" } };
    };
    const quickProbe: EngineRunner = async () => {
      await wait(150);
      return { output_path: null, result: { fake: "probe" } };
    };
    const base = { db: db(), workRoot, departments: [DEPT], resourceCheck: async () => ({ ok: true }) };

    // a CPU-kinds lane on a queue holding a shoot first: it must NOT take the shoot
    const gpuLane = runMediaLaneOnce({ ...base, laneId: `${M}-gpu`, kinds: [...GPU_KINDS], engines: { shoot: slowShoot } });
    await wait(100);
    const cpu1 = await runMediaLaneOnce({ ...base, laneId: `${M}-cpu-1`, kinds: [...CPU_KINDS], engines: { probe: quickProbe } });
    const cpu2 = await runMediaLaneOnce({ ...base, laneId: `${M}-cpu-2`, kinds: [...CPU_KINDS], engines: { probe: quickProbe } });
    expect(cpu1).toMatchObject({ claimed: true, jobId: probe.id, status: "done" });
    expect(cpu2).toMatchObject({ claimed: true, jobId: probe2.id, status: "done" });
    const gpu = await gpuLane;
    expect(gpu).toMatchObject({ claimed: true, jobId: shoot.id, status: "done" });

    const rows = await db()
      .selectFrom("media_jobs")
      .select(["id", "kind", "claimed_by", "started_at", "ended_at"])
      .where("department", "=", DEPT)
      .execute();
    const byId = Object.fromEntries(rows.map((r) => [r.id, r]));
    expect(byId[shoot.id].claimed_by).toBe(`${M}-gpu`);
    expect(byId[probe.id].claimed_by).toBe(`${M}-cpu-1`);
    expect(byId[probe2.id].claimed_by).toBe(`${M}-cpu-2`);
    // the probes started AND ended while the shoot was still running — the overlap the
    // company's book had never shown before this plan
    const s = byId[shoot.id];
    for (const p of [byId[probe.id], byId[probe2.id]]) {
      expect(new Date(p.started_at as never).getTime()).toBeGreaterThanOrEqual(new Date(s.started_at as never).getTime());
      expect(new Date(p.ended_at as never).getTime()).toBeLessThanOrEqual(new Date(s.ended_at as never).getTime());
    }
    // the same overlap query the position report uses on the company's book
    const overlap = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM media_jobs a JOIN media_jobs b ON a.id < b.id
       WHERE a.department = ${DEPT} AND b.department = ${DEPT}
         AND a.ended_at > b.started_at AND b.ended_at > a.started_at
    `.execute(db());
    expect(overlap.rows[0].n).toBeGreaterThanOrEqual(2);
  });

  it("a lane with kinds sees nothing when only other kinds are queued", { timeout: 15_000 }, async () => {
    const taskId = await makeTask(DEPT);
    const voice = await callJson("media_submit", { task_id: taskId, kind: "voice", params: { text: "lanes", out: "l.mp3" } });
    const base = { db: db(), workRoot, departments: [DEPT], resourceCheck: async () => ({ ok: true }) };
    const gpu = await runMediaLaneOnce({ ...base, laneId: `${M}-gpu`, kinds: [...GPU_KINDS] });
    expect(gpu).toEqual({ claimed: false });
    const noop: EngineRunner = async () => ({ output_path: null, result: {} });
    const cpu = await runMediaLaneOnce({ ...base, laneId: `${M}-cpu-1`, kinds: [...CPU_KINDS], engines: { voice: noop } });
    expect(cpu).toMatchObject({ claimed: true, jobId: voice.id, status: "done" });
  });
});
