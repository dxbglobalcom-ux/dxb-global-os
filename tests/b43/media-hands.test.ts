// B43 verification — THE STUDIO'S HANDS (CEO 2026-09-03: "Önce elleri kur, sonra
// stüdyo kendisi yapsın" → plan approved "Onaylıyorum, başla"):
//   1. dxb-mcp `media` group: submit validates per kind and births a job row +
//      audit; status reads it; cancel flips queued→cancelled; wait times out
//      honestly AND renews the calling task's lease; probe returns an ffprobe
//      summary plus frame IMAGES and refuses files outside the studio's folders
//   2. the media lane: claims one queued job (SKIP LOCKED), runs the kind's
//      engine, writes wall/peaks/output/result on the row + audit; a failing
//      engine lands in 'failed' with the error; a busy machine leaves the job
//      queued; cancel_requested reaches a running engine; the real probe engine
//      writes frames
//   3. routing: a department-scoped routing_rules row at effort 'xhigh' (the
//      CEO's ruling) wins for that department's employee and never for another
//   4. the lease heartbeat: a run longer than its lease is NOT reaped
//   5. grant → profile: media_* tools are pinned, and the media-studio profile
//      compiled from the record carries them
//   6. the two-brain trial (CEO 2026-09-03 evening): Fable 5.1 is a brain the SDK
//      map knows; a seat holding the hands gets the 40-turn budget; two department
//      rows for one tier route by `enabled`, so flipping them flips the brain
// Suite deletes ONLY what it creates (marker b43t-…, E9.3 rule). Construction
// engine only — vitest.config.ts injects the address.
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
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
import { assertProbeAllowed, parseMediaParams } from "../../packages/dxb-mcp/src/groups/media.js";
import { runMediaLaneOnce, type EngineRunner } from "../../packages/outbox-executor/src/media-lane.js";
import { resolveExecutionRoute, runWorkerOnce, turnBudgetFor } from "../../packages/orchestrator/src/worker-shim.js";
import { SDK_MODEL_IDS } from "../../packages/kernel/src/index.js";
import { compileLibraryProfiles, pinAll, readDxbMcpInventory, readLibraryLayer } from "../../packages/gateway/src/index.js";
import { pinHookOff, sweepByDepartment, watchLedgers } from "../helpers/suite-scope.js";

const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);
const M = `b43t-${randomUUID().slice(0, 6)}`;
const DEPT = `${M}-studio`;
const OTHER = `${M}-other`;

pinHookOff(db);

let client: Client;
let workRoot: string;
let clip: string;
const jobIds: string[] = [];
const ruleIds: string[] = [];
const agentIds: string[] = [];

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return res;
}
async function callJson(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await call(name, args);
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

async function makeTask(department: string, agentId: string | null = null): Promise<string> {
  const row = await db()
    .insertInto("tasks")
    .values({
      department,
      agent_id: agentId,
      objective: `${M} media probe task`,
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

async function makeAgent(slug: string, department: string): Promise<string> {
  const row = await db()
    .insertInto("agents")
    .values({
      slug,
      department,
      role: "specialist",
      role_level: "specialist",
      persona_path: `personas/${slug}.md`,
      mcp_profile: "inherit",
      // dormant on purpose: 'active' trips the persona gate (fn_persona_gate), and the
      // routing leg only needs the department link, not an employable seat
      employment_status: "dormant",
      status: "dormant",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  agentIds.push(row.id);
  return row.id;
}

beforeAll(async () => {
  workRoot = mkdtempSync(join(tmpdir(), "b43-media-"));
  process.env.DXB_MEDIA_WORK_ROOT = workRoot;
  process.env.DXB_MEDIA_PROBE_ROOTS = workRoot;
  process.env.DXB_MEDIA_WAIT_POLL_MS = "200";
  // a one-second test pattern, 24 fps, 320x180 — the smallest real video ffprobe can measure
  clip = join(workRoot, "pattern.mp4");
  execFileSync(resolveMediaBinary("ffmpeg"), [
    "-y", "-v", "error", "-f", "lavfi", "-i", "testsrc=size=320x180:rate=24:duration=1",
    "-pix_fmt", "yuv420p", "-c:v", "libx264", clip,
  ]);
  const server = createDxbMcpServer();
  client = new Client({ name: "b43-media-test", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  await sweepByDepartment(db(), M);
  await sql`DELETE FROM media_jobs WHERE department LIKE 'b43t-%'`.execute(db()); // earlier runs of this family
  // departments for the routing leg (the profile compiler emits only live slugs)
  await sql`INSERT INTO departments (slug, display_name, display_name_tr) VALUES (${DEPT}, ${DEPT}, ${DEPT}), (${OTHER}, ${OTHER}, ${OTHER}) ON CONFLICT (slug) DO NOTHING`.execute(db());
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ decidedByLike: ["b43t-%"] });
  if (jobIds.length) await db().deleteFrom("media_jobs").where("id", "in", jobIds).execute();
  await sql`DELETE FROM media_jobs WHERE department LIKE ${M + "%"}`.execute(db());
  if (ruleIds.length) await db().deleteFrom("routing_rules").where("id", "in", ruleIds).execute();
  await sweepByDepartment(db(), M);
  if (agentIds.length) await sql`DELETE FROM agents WHERE id = ANY(${agentIds}::uuid[])`.execute(db());
  await sql`DELETE FROM library_grants WHERE grantee_id LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM departments WHERE slug LIKE ${M + "%"}`.execute(db());
  await client.close();
  rmSync(workRoot, { recursive: true, force: true });
  await closeDb();
});

describe("1. the media tool group", () => {
  it("submit validates per kind and births a job row with an audit line", async () => {
    const taskId = await makeTask(DEPT);
    await expect(callJson("media_submit", { task_id: taskId, kind: "shoot", params: { prompt: "x" } })).rejects.toThrow();
    await expect(callJson("media_submit", { task_id: taskId, kind: "still", params: { prompt: "x", out: "../escape.png" } })).rejects.toThrow();
    const job = await callJson("media_submit", {
      task_id: taskId, kind: "probe", params: { file: clip, at_seconds: [0, 0.5] }, note: "b43 probe",
    });
    jobIds.push(job.id);
    expect(job).toMatchObject({ task_id: taskId, kind: "probe", status: "queued", department: DEPT });
    const audit = await sql<{ n: number }>`SELECT count(*)::int AS n FROM audit_log WHERE action='media.submit' AND task_id=${taskId}::uuid`.execute(db());
    expect(audit.rows[0].n).toBe(1);
    const status = await callJson("media_status", { job_id: job.id });
    expect(status.id).toBe(job.id);
  });

  it("cancel flips a queued job; wait times out honestly and renews the task lease", { timeout: 30_000 }, async () => {
    const taskId = await makeTask(DEPT);
    await sql`UPDATE tasks SET status='running', claimed_by='b43-w', lease_expires_at = now() + interval '5 seconds' WHERE id=${taskId}::uuid`.execute(db());
    // W7 (CEO 2026-09-15, "kaldır"): this case needs ANY cheap kind the job book accepts —
    // it never runs, it only has to be born queued. It used the voice kind until that kind
    // was retired; probe carries the same weight here.
    const job = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: "/tmp/w7-lease-probe.mp4" } });
    jobIds.push(job.id);
    const before = await sql<{ t: Date }>`SELECT lease_expires_at AS t FROM tasks WHERE id=${taskId}::uuid`.execute(db());
    const waited = await callJson("media_wait", { job_id: job.id, max_seconds: 5 });
    expect(waited.timed_out).toBe(true);
    expect(waited.status).toBe("queued");
    const after = await sql<{ t: Date }>`SELECT lease_expires_at AS t FROM tasks WHERE id=${taskId}::uuid`.execute(db());
    expect(after.rows[0].t.getTime()).toBeGreaterThan(before.rows[0].t.getTime() + 100_000);
    const cancelled = await callJson("media_cancel", { job_id: job.id, reason: "test" });
    expect(cancelled.status).toBe("cancelled");
    const audit = await sql<{ n: number }>`SELECT count(*)::int AS n FROM audit_log WHERE action='media.cancel' AND task_id=${taskId}::uuid`.execute(db());
    expect(audit.rows[0].n).toBe(1);
  });

  it("probe returns the summary and frame images; files outside the studio are refused", async () => {
    const res = await call("media_probe", { file: clip, at_seconds: [0, 0.5] });
    const content = res.content as Array<{ type: string; text?: string; data?: string; mimeType?: string }>;
    const summary = JSON.parse(content[0].text!);
    expect(summary.video).toMatchObject({ width: 320, height: 180, fps: 24 });
    expect(summary.frames).toHaveLength(2);
    expect(content.filter((c) => c.type === "image" && c.mimeType === "image/png")).toHaveLength(2);
    expect(() => assertProbeAllowed("/etc/passwd")).toThrow(/outside/);
    await expect(call("media_probe", { file: "/etc/passwd" })).rejects.toThrow(/outside/);
    expect(parseMediaParams("upscale", { file: clip, model: "3b", target: 1080 })).toMatchObject({ model: "3b" });
  });
});

describe("2. the media lane", () => {
  // one department per leg: the lane claims the OLDEST queued job of its scope, so a
  // leg's job must be alone in its scope (the task worker's departments idiom)
  let leg = 0;
  const laneOpts = (dept: string) => ({ db: db(), laneId: `${M}-lane`, workRoot, departments: [dept], resourceCheck: async () => ({ ok: true }) });
  const legDept = () => `${DEPT}-l${++leg}`;

  it("claims one job, runs its engine, records wall/output/result and audits", { timeout: 30_000 }, async () => {
    const dept = legDept();
    const taskId = await makeTask(dept);
    const job = await callJson("media_submit", { task_id: taskId, kind: "shoot", params: { prompt: "p", seconds: 3, width: 640, height: 384, prefix: "b43" } });
    jobIds.push(job.id);
    const fake: EngineRunner = async (ctx) => {
      ctx.log("fake engine ran");
      return { output_path: join(ctx.workDir, "fake.mp4"), result: { frames: 73 } };
    };
    const out = await runMediaLaneOnce({ ...laneOpts(dept), engines: { shoot: fake } });
    expect(out).toMatchObject({ claimed: true, jobId: job.id, status: "done" });
    const row = await callJson("media_status", { job_id: job.id });
    expect(row.status).toBe("done");
    expect(row.claimed_by).toBe(`${M}-lane`);
    expect(row.result).toMatchObject({ frames: 73 });
    expect(Number(row.wall_seconds)).toBeGreaterThanOrEqual(0);
    expect(existsSync(join(workRoot, job.id, "lane.log"))).toBe(true);
    const audit = await sql<{ n: number }>`SELECT count(*)::int AS n FROM audit_log WHERE action='media.done' AND task_id=${taskId}::uuid`.execute(db());
    expect(audit.rows[0].n).toBe(1);
  });

  it("a failing engine lands in failed with its error; a busy machine leaves the job queued", { timeout: 30_000 }, async () => {
    const dept = legDept();
    const taskId = await makeTask(dept);
    const job = await callJson("media_submit", { task_id: taskId, kind: "still", params: { prompt: "p", out: "a.png" } });
    jobIds.push(job.id);
    const busy = await runMediaLaneOnce({ ...laneOpts(dept), resourceCheck: async () => ({ ok: false, reason: "card busy: test" }) });
    expect(busy).toMatchObject({ claimed: false, skipped: "card busy: test" });
    expect((await callJson("media_status", { job_id: job.id })).status).toBe("queued");
    const boom: EngineRunner = async () => { throw new Error("engine exploded"); };
    const out = await runMediaLaneOnce({ ...laneOpts(dept), engines: { still: boom } });
    expect(out).toMatchObject({ claimed: true, jobId: job.id, status: "failed" });
    const row = await callJson("media_status", { job_id: job.id });
    expect(row.error).toContain("engine exploded");
    const audit = await sql<{ n: number }>`SELECT count(*)::int AS n FROM audit_log WHERE action='media.failed' AND task_id=${taskId}::uuid`.execute(db());
    expect(audit.rows[0].n).toBe(1);
  });

  it("cancel_requested reaches a running engine", { timeout: 30_000 }, async () => {
    const dept = legDept();
    const taskId = await makeTask(dept);
    // W7: the kind here is a vehicle for the cancel path, not the subject of the case —
    // the engine below is a stub either way. It was the voice kind until 2026-09-15.
    const job = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: "/tmp/w7-cancel-probe.mp4" } });
    jobIds.push(job.id);
    const slow: EngineRunner = async (ctx) => {
      for (let i = 0; i < 50; i++) {
        if (await ctx.cancelled()) throw new Error("cancelled");
        await new Promise((r) => setTimeout(r, 100));
      }
      return { output_path: null, result: {} };
    };
    const running = runMediaLaneOnce({ ...laneOpts(dept), engines: { probe: slow } });
    await new Promise((r) => setTimeout(r, 400));
    const c = await callJson("media_cancel", { job_id: job.id });
    expect(c.cancel_requested).toBe(true);
    const out = await running;
    expect(out).toMatchObject({ claimed: true, status: "cancelled" });
  });

  it("the real probe engine writes frames into the job's folder", { timeout: 60_000 }, async () => {
    const dept = legDept();
    const taskId = await makeTask(dept);
    const job = await callJson("media_submit", { task_id: taskId, kind: "probe", params: { file: clip, at_seconds: [0.25] } });
    jobIds.push(job.id);
    const out = await runMediaLaneOnce(laneOpts(dept));
    expect(out).toMatchObject({ claimed: true, jobId: job.id, status: "done" });
    const row = await callJson("media_status", { job_id: job.id });
    expect(row.output_path).toBe(clip);
    expect(row.result.frames).toHaveLength(1);
    expect(existsSync(row.result.frames[0])).toBe(true);
  });
});

describe("3. department-scoped routing at effort xhigh", () => {
  it("the studio's employee gets the department row; another department never does", async () => {
    const deptId = (await sql<{ id: string }>`SELECT id FROM departments WHERE slug=${DEPT}`.execute(db())).rows[0].id;
    const rule = await db()
      .insertInto("routing_rules")
      .values({ task_class: `${M}.creative`, match: JSON.stringify({}), model_tier: "L4", model: "sonnet-5", mode: "subscription", effort: "xhigh", priority: 99, enabled: true, department_id: deptId } as never)
      .returning("id")
      .executeTakeFirstOrThrow();
    ruleIds.push(rule.id);
    const insider = await makeAgent(`${M}-insider`, DEPT);
    const outsider = await makeAgent(`${M}-outsider`, OTHER);
    const t1 = await makeTask(DEPT, insider);
    const t2 = await makeTask(OTHER, outsider);
    const task = async (id: string) => (await db().selectFrom("tasks").selectAll().where("id", "=", id).executeTakeFirstOrThrow()) as never;
    const r1 = await resolveExecutionRoute(await task(t1));
    expect(r1.rule.id).toBe(rule.id);
    expect(r1.rule.effort).toBe("xhigh");
    const r2 = await resolveExecutionRoute(await task(t2));
    expect(r2.rule.id).not.toBe(rule.id);
    expect(r2.rule.department_id).toBeNull();
  });
});

describe("4. the lease heartbeat", () => {
  it("a run longer than its lease is not reaped while the worker is alive", { timeout: 60_000 }, async () => {
    const dept = `${M}-hb`;
    const taskId = await makeTask(dept);
    const worker = `${M}-hbw`;
    const run = runWorkerOnce({
      workerId: worker,
      departments: [dept],
      leaseSeconds: 3,
      execute: async () => {
        await new Promise((r) => setTimeout(r, 4500));
        return { result: { text: "slow but alive" }, confidence: 0.9 };
      },
    });
    await new Promise((r) => setTimeout(r, 3600)); // past the original 3 s lease
    await sql`SELECT reap_expired_leases()`.execute(db());
    const mid = await sql<{ status: string; claimed_by: string | null }>`SELECT status, claimed_by FROM tasks WHERE id=${taskId}::uuid`.execute(db());
    expect(mid.rows[0]).toMatchObject({ status: "running", claimed_by: worker });
    const out = await run;
    expect(out).toMatchObject({ claimed: true, taskId, status: "review" });
  });
});

describe("5. grant → pins → compiled profile", () => {
  it("media_* tools are pinned; the record expands a dxb-mcp/media grant; the studio's compiled profile carries the hands", { timeout: 60_000 }, async () => {
    const inv = await readDxbMcpInventory();
    expect(inv.filter((e) => e.tool.startsWith("media_")).map((e) => e.tool).sort()).toEqual(
      ["media_cancel", "media_probe", "media_status", "media_submit", "media_wait"],
    );
    await pinAll(db(), inv);
    const item = (await sql<{ id: string }>`SELECT id FROM library_items WHERE kind='mcp' AND name='dxb-mcp/media'`.execute(db())).rows[0];
    expect(item).toBeTruthy();
    // the RECORD layer: a marker department granted only dxb-mcp/media expands to exactly the five hands
    await sql`INSERT INTO library_grants (item_id, grantee_kind, grantee_id, granted_by) VALUES (${item.id}::uuid, 'department', ${DEPT}, 'b43-test') ON CONFLICT DO NOTHING`.execute(db());
    const layer = await readLibraryLayer(db());
    expect((layer.departments[DEPT]?.tools ?? []).sort()).toEqual(
      ["dxb-mcp.media_cancel", "dxb-mcp.media_probe", "dxb-mcp.media_status", "dxb-mcp.media_submit", "dxb-mcp.media_wait"],
    );
    // the COMPILED profile of the real studio (policy entry + the migrations' grants): the hands and the house kit
    const outDir = mkdtempSync(join(tmpdir(), "b43-profiles-"));
    try {
      await compileLibraryProfiles(db(), { outDir });
      const file = join(outDir, "media-studio.mcp.json");
      expect(existsSync(file)).toBe(true);
      const profile = JSON.parse(readFileSync(file, "utf8"));
      const tools: string[] = profile._tools?.["dxb-mcp"] ?? [];
      expect(tools).toEqual(expect.arrayContaining(["media_submit", "media_wait", "media_probe", "media_status", "media_cancel", "queue_create_task", "approval_list_pending"]));
      expect(Object.keys(profile.mcpServers ?? {})).toContain("dxb-mcp");
    } finally {
      rmSync(outDir, { recursive: true, force: true });
    }
  });
});

describe("6. the two-brain trial (CEO 2026-09-03 evening)", () => {
  it("Fable 5.1 is a brain the SDK map knows; a seat with the hands gets the longer turn budget", () => {
    expect(SDK_MODEL_IDS["fable-5.1"]).toBe("claude-fable-5-1");
    expect(SDK_MODEL_IDS["fable-5"]).toBe("claude-opus-5"); // U20 freeze untouched
    expect(turnBudgetFor(["mcp__dxb-mcp__queue_get"])).toBe(12);
    expect(turnBudgetFor(["mcp__dxb-mcp__queue_get", "mcp__dxb-mcp__media_submit"])).toBe(40);
  });

  it("two department rows for one tier: only the enabled one routes, and flipping them flips the brain", async () => {
    const deptId = (await sql<{ id: string }>`SELECT id FROM departments WHERE slug=${DEPT}`.execute(db())).rows[0].id;
    const mk = async (model: string, priority: number, enabled: boolean) => {
      const r = await db()
        .insertInto("routing_rules")
        .values({ task_class: `${M}.twobrain`, match: JSON.stringify({}), model_tier: "L4", model, mode: "subscription", effort: "xhigh", priority, enabled, department_id: deptId } as never)
        .returning("id")
        .executeTakeFirstOrThrow();
      ruleIds.push(r.id);
      return r.id;
    };
    // §3 leaves its own enabled row for this department at priority 99 (swept in afterAll), so the
    // trial pair sits above it — the worker's department lookup ignores task_class, as in production.
    const opus = await mk("fable-5", 300, true);
    const fable = await mk("fable-5.1", 290, false);
    const seat = await makeAgent(`${M}-twobrain`, DEPT);
    const taskId = await makeTask(DEPT, seat);
    const task = async () => (await db().selectFrom("tasks").selectAll().where("id", "=", taskId).executeTakeFirstOrThrow()) as never;
    const before = await resolveExecutionRoute(await task());
    expect(before.rule.id).toBe(opus);
    expect(before.rule.model).toBe("fable-5");
    // the flip the trial makes between run A and run B
    await db().updateTable("routing_rules").set({ enabled: false }).where("id", "=", opus).execute();
    await db().updateTable("routing_rules").set({ enabled: true }).where("id", "=", fable).execute();
    const after = await resolveExecutionRoute(await task());
    expect(after.rule.id).toBe(fable);
    expect(after.rule.model).toBe("fable-5.1");
    expect(after.rule.effort).toBe("xhigh");
    expect(SDK_MODEL_IDS[after.rule.model]).toBe("claude-fable-5-1");
  });
});
