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
import { CPU_KINDS, GPU_KINDS, runMediaLaneOnce, type EngineRunner, type MediaKind, type MediaLaneResult, recoverOrphanedMediaJobs } from "../../packages/outbox-executor/src/media-lane.js";
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
      { kind: "assemble", ms: 20, name: "assemble" },   // W7: was the retired voice kind
    ]);
    const lanes = new MediaLanes({ runOnce: q.runOnce, sleep: wait }, { cpuLanes: 2, restMs: 50, laneIdBase: "w" });
    expect(lanes.reconcile()).toEqual({ desired: 3, started: 3, running: 3 });
    await wait(150);
    expect(q.started.shoot).toBeLessThan(100);
    expect(q.started.probe).toBeLessThan(100); // taken by a CPU lane while the card lane is busy
    expect(q.started.assemble).toBeLessThan(100);
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
    // W7 (CEO 2026-09-15, "kaldır"): five, not six — the voice kind was retired.
    expect(ALL_MEDIA_KINDS.length).toBe(5);
    expect([...ALL_MEDIA_KINDS]).not.toContain("voice");
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
    // W7: this needs any CPU-lane kind the job book still accepts; it was the voice kind.
    const cpuJob = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: "/tmp/w7-lanes-probe.mp4" } });
    const base = { db: db(), workRoot, departments: [DEPT], resourceCheck: async () => ({ ok: true }) };
    const gpu = await runMediaLaneOnce({ ...base, laneId: `${M}-gpu`, kinds: [...GPU_KINDS] });
    expect(gpu).toEqual({ claimed: false });
    const noop: EngineRunner = async () => ({ output_path: null, result: {} });
    const cpu = await runMediaLaneOnce({ ...base, laneId: `${M}-cpu-1`, kinds: [...CPU_KINDS], engines: { probe: noop } });
    expect(cpu).toMatchObject({ claimed: true, jobId: cpuJob.id, status: "done" });
  });
});

// W8 (CEO 2026-09-15) — THE SEAMS: a killed process must end 'cancelled', not 'failed',
// and a job a dead process was holding must come back.
//
// The defect these pin, measured 2026-09-15: `stopScoped` waits up to 10 s for the child to
// die, so the process's own `close` event always settled the promise first and a cancellation
// was recorded as a failure — job 16277dac carries cancel_requested=t, status=failed and the
// error "python exited null: …". And nothing anywhere returned a 'running' row after the
// process holding it was gone: the lane had 0 hits for recover/reap/heartbeat, while the
// scheduler was restarted twice that same afternoon.
describe("W8 · the media lane's seams", () => {
  it("a REAL child process killed mid-run ends 'cancelled', never 'failed'", { timeout: 40_000 }, async () => {
    const dept = `${DEPT}-w8kill`;
    const taskId = await makeTask(dept);
    const job = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: "/tmp/w8-kill.mp4" } });

    // a real child: `sleep` is a process, not a stub — it is what the cancel path must kill
    const realChild: EngineRunner = async (ctx) => {
      await ctx.exec("/bin/sleep", ["120"]);
      return { output_path: null, result: {} };
    };
    const running = runMediaLaneOnce({
      db: db(), laneId: `${M}-w8-kill`, workRoot, departments: [dept],
      resourceCheck: async () => ({ ok: true }), engines: { probe: realChild },
    });
    // let the lane claim it and spawn the child, then ask for the cancel
    await wait(1500);
    await callJson("media_cancel", { job_id: job.id, reason: "W8 test" });
    const out = await running;
    expect(out).toMatchObject({ claimed: true, status: "cancelled" });

    const row = await sql<{ status: string; error: string | null }>`
      SELECT status, error FROM media_jobs WHERE id = ${job.id}::uuid
    `.execute(db());
    expect(row.rows[0].status).toBe("cancelled");
    // the old bug wrote the child's exit into the row; the reason for the kill wins now
    expect(row.rows[0].error ?? "").not.toMatch(/exited null/);
  });

  it("start-up recovery gives back a job a dead process was holding", async () => {
    const dept = `${DEPT}-w8orph`;
    const taskId = await makeTask(dept);
    const orphan = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: "/tmp/w8-orphan.mp4" } });
    const goner = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: "/tmp/w8-goner.mp4" } });

    // exactly the state a killed lane leaves behind: claimed, running, no process
    await sql`UPDATE media_jobs SET status='running', claimed_by='a-lane-that-died', started_at=now()
               WHERE id IN (${orphan.id}::uuid, ${goner.id}::uuid)`.execute(db());
    // the second one was already on its way out when the process died
    await sql`UPDATE media_jobs SET cancel_requested = true WHERE id = ${goner.id}::uuid`.execute(db());

    const result = await recoverOrphanedMediaJobs(db());
    expect(result.requeued).toBeGreaterThanOrEqual(1);
    expect(result.cancelled).toBeGreaterThanOrEqual(1);

    const rows = await sql<{ id: string; status: string; claimed_by: string | null }>`
      SELECT id, status, claimed_by FROM media_jobs WHERE id IN (${orphan.id}::uuid, ${goner.id}::uuid)
    `.execute(db());
    const byId = new Map(rows.rows.map((r) => [r.id, r]));
    // ordered work comes back to the queue; work already being cancelled lands cancelled
    expect(byId.get(orphan.id)!.status).toBe("queued");
    expect(byId.get(orphan.id)!.claimed_by).toBeNull();
    expect(byId.get(goner.id)!.status).toBe("cancelled");

    const audit = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log WHERE action = 'media.recovered'
    `.execute(db());
    expect(audit.rows[0].n).toBeGreaterThanOrEqual(1);

    // and nothing is left 'running' for the next lane to trip over
    const left = await sql<{ n: number }>`SELECT count(*)::int AS n FROM media_jobs WHERE status='running'`.execute(db());
    expect(left.rows[0].n).toBe(0);
  });
});
