import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { sql } from "kysely";
import { afterAll, describe, expect, it } from "vitest";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { pinHookOff } from "../helpers/suite-scope.js";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import {
  CONTEXT_BAND,
  OFFLOAD_SOURCE,
  checkContextBudget,
  dispatch,
  estimateTokens,
  makeSteppedExecutor,
  runWorkerOnce,
  type CompressionMeasurement,
  type DecomposedEnvelope,
  type TaskStep,
  type WorkingContext,
} from "../../packages/orchestrator/src/index.js";
import { recallMemory } from "../../packages/memory-router/src/index.js";

// Master step 9 (06-07): context-rot demonstrated AND defeated. A 50-step
// synthetic task (~800 estimated tokens/step) runs twice through the real
// worker shim: CONTROL (budget off) provably exceeds the hard band — the rot
// is real; MANAGED (budget on, deterministic summarizer seam) stays inside
// the band, its compressions are evented, and mid-task facts evicted from the
// live context recall back through the read door (offload is memory, not
// amnesia). Per-step measurements land in tests/phase6/context-rot.log — the
// master step-9 ölçüm logu 06-08's verification cites. One DXB_LIVE_SDK=1 run
// exercises the real summarize-class model end-to-end.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const DIM = 1536;
const LIVE = process.env.DXB_LIVE_SDK === "1";
const RUN = randomUUID().slice(0, 8);
const MANAGED_WORKER = `ctx-rot-managed-${RUN}`;
const CONTROL_WORKER = `ctx-rot-control-${RUN}`;
const LIVE_WORKER = `ctx-rot-live-${RUN}`;
const WORKERS = [MANAGED_WORKER, CONTROL_WORKER, LIVE_WORKER];
const LOG_PATH = "tests/phase6/context-rot.log";

function vec(axis: number): number[] {
  const v = new Array<number>(DIM).fill(0);
  v[axis] = 1;
  return v;
}

// Distinctive mid-task facts planted at steps 10/25/40 (plan). Axes are
// fixture-embedding coordinates far from other phase-6 suites' fixtures.
const PLANTED = [
  { step: 10, axis: 80, body: "the DXB spike gate threshold is 16/20", query: "what is the DXB spike gate threshold" },
  { step: 25, axis: 81, body: "the hermes heartbeat interval is 45 seconds", query: "what is the hermes heartbeat interval" },
  { step: 40, axis: 82, body: "the cost ledger hard-stop fires at 100 percent of budget", query: "when does the cost ledger hard-stop fire" },
];

/** ~3200 chars => ~800 estimated tokens of synthetic work product per step. */
function filler(step: number): string {
  return `synthetic work product for step ${step}; the worker inspects inputs and drafts output. `.repeat(36);
}

function makeSteps(): TaskStep[] {
  return Array.from({ length: 50 }, (_, i): TaskStep => {
    const step = i + 1;
    const planted = PLANTED.find((p) => p.step === step);
    return async () => ({
      output: [`## step ${step}`, filler(step), ...(planted ? [`FACT: ${planted.body}`] : [])].join("\n"),
      confidence: 0.9,
    });
  });
}

/** Deterministic summarizer seam: durable facts are exactly the FACT: lines. */
const plantedExtract = async (text: string): Promise<string[]> =>
  (text.match(/^FACT: .+$/gm) ?? []).map((l) => l.slice("FACT: ".length));

/** Deterministic embedding: planted facts get their fixture axis. */
const fixtureEmbed = async (body: string): Promise<number[]> => {
  const p = PLANTED.find((x) => body.includes(x.body));
  return vec(p ? p.axis : 90);
};

const createdTaskIds: string[] = [];

function envelope(department: string): DecomposedEnvelope {
  return {
    ...TaskEnvelope.parse({
      department,
      objective: "run the 50-step synthetic long-task and keep its working context inside the band",
      output_contract: "final step text stored; context token estimate reported per step",
      model_tier: "L3",
      approval_class: "none",
    }),
    deps: [],
  };
}

async function dispatchOne(department: string): Promise<string> {
  const { taskIds } = await dispatch([envelope(department)]);
  createdTaskIds.push(...taskIds);
  return taskIds[0];
}

afterAll(async () => {
  const db = getDb();
  const offloaded = await db
    .selectFrom("memory_index")
    .select("id")
    .where(sql<string>`provenance->>'agent'`, "in", WORKERS)
    .execute();
  const ids = offloaded.map((r) => r.id);
  if (ids.length > 0) {
    await db.deleteFrom("memory_embeddings").where("index_id", "in", ids).execute();
    await db.deleteFrom("memory_index").where("id", "in", ids).execute();
  }
  await db.deleteFrom("audit_log").where("actor", "in", WORKERS).execute();
  if (createdTaskIds.length > 0) {
    await db
      .deleteFrom("tool_calls")
      .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    await db
      .deleteFrom("file_changes")
      .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    // E8.4b: failed probe runs raise alerts rows (FK) — sweep before the runs.
    await db
      .deleteFrom("alerts")
      .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    await db.deleteFrom("alerts").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("agent_runs").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("task_events").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("tasks").where("id", "in", createdTaskIds).execute();
  }
  await closeDb();
});

// E10.2: this suite predates the hook — pin the §22 flag off for its
// lifetime (restored + alert swept in the helper afterAll).
pinHookOff(() => getDb());

describe("context-rot — 50-step control vs managed (master step 9)", () => {
  it("CONTROL: budget disabled → the same 50 steps provably exceed the hard band", async () => {
    const taskId = await dispatchOne(`ctx-rot-control-${RUN}`);
    const run = await runWorkerOnce({
      workerId: CONTROL_WORKER,
      departments: [`ctx-rot-control-${RUN}`],
      execute: makeSteppedExecutor({ workerId: CONTROL_WORKER, steps: makeSteps(), contextBudget: false }),
    });
    expect(run).toMatchObject({ claimed: true, taskId, status: "review" });

    const row = await getDb()
      .selectFrom("tasks")
      .select("result")
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    const result = row.result as { context_tokens: number };
    // eslint-disable-next-line no-console
    console.log(`control final context estimate: ${result.context_tokens} tokens (hard ${CONTEXT_BAND.hardLimit})`);
    expect(result.context_tokens).toBeGreaterThan(CONTEXT_BAND.hardLimit); // the rot is real

    // and no compression ever fired, no offload ever happened
    const events = await getDb()
      .selectFrom("task_events")
      .select("event")
      .where("task_id", "=", taskId)
      .where("event", "=", "context_compressed")
      .execute();
    expect(events).toHaveLength(0);
  });

  it("MANAGED: band held per step, compressions evented, evicted facts recall back, log written", async () => {
    const db = getDb();
    const dept = `ctx-rot-managed-${RUN}`;
    const taskId = await dispatchOne(dept);

    const measurements: Array<CompressionMeasurement & { compressed: boolean }> = [];
    const run = await runWorkerOnce({
      workerId: MANAGED_WORKER,
      departments: [dept],
      execute: makeSteppedExecutor({
        workerId: MANAGED_WORKER,
        steps: makeSteps(),
        budgetDeps: {
          extractFacts: plantedExtract,
          commit: { embed: fixtureEmbed, judgeContradiction: async () => false },
        },
        onMeasurement: (m, compressed) => measurements.push({ ...m, compressed }),
      }),
    });
    expect(run).toMatchObject({ claimed: true, taskId, status: "review" });

    // (4) the master step-9 ölçüm logu — one CSV row per step, committed
    expect(measurements).toHaveLength(50);
    writeFileSync(
      LOG_PATH,
      ["step,tokens,event", ...measurements.map((m) => `${m.step},${m.after},${m.compressed ? "context_compressed" : ""}`)].join("\n") + "\n",
    );

    // (1) band held: every point <= hard; every post-compression point <= soft
    for (const m of measurements) {
      expect(m.after).toBeLessThanOrEqual(CONTEXT_BAND.hardLimit);
      if (m.compressed) {
        expect(m.before).toBeGreaterThan(CONTEXT_BAND.softLimit);
        expect(m.after).toBeLessThanOrEqual(CONTEXT_BAND.softLimit);
      }
    }

    // (2) >= 2 compressions, each evented in the task trail with the measurement payload
    const compressions = measurements.filter((m) => m.compressed);
    // eslint-disable-next-line no-console
    console.log(
      `managed: ${compressions.length} compressions at steps [${compressions.map((m) => m.step).join(", ")}]`,
    );
    expect(compressions.length).toBeGreaterThanOrEqual(2);
    const events = await db
      .selectFrom("task_events")
      .select(["payload"])
      .where("task_id", "=", taskId)
      .where("event", "=", "context_compressed")
      .orderBy("id")
      .execute();
    expect(events).toHaveLength(compressions.length);
    events.forEach((ev, i) => {
      expect(ev.payload).toMatchObject({
        step: compressions[i].step,
        before: compressions[i].before,
        after: compressions[i].after,
        offloaded_count: compressions[i].offloaded_count,
      });
    });

    // status chain stays contiguous around the in-flight events
    const chain = await db
      .selectFrom("task_events")
      .select(["event", "from_status", "to_status"])
      .where("task_id", "=", taskId)
      .orderBy("id")
      .execute();
    expect(chain[0]).toMatchObject({ event: "created" });
    expect(chain[chain.length - 1]).toMatchObject({ event: "transition", to_status: "review" });
    for (const ev of chain.filter((e) => e.event === "context_compressed")) {
      expect(ev).toMatchObject({ from_status: "running", to_status: "running" });
    }

    // (3) offload is memory, not amnesia: facts evicted from the live context
    // were committed through the door and recall back through the read door.
    const row = await db.selectFrom("tasks").select("result").where("id", "=", taskId).executeTakeFirstOrThrow();
    const result = row.result as { context: string; context_tokens: number };
    expect(result.context_tokens).toBeLessThanOrEqual(CONTEXT_BAND.softLimit);
    expect(result.context).toMatch(/\[recall handles: [0-9a-f-]{36}/); // summary block carries memory ids

    const offloadRows = await db
      .selectFrom("memory_index")
      .select(["id", "trust_tier"])
      .where(sql<string>`provenance->>'agent'`, "=", MANAGED_WORKER)
      .where(sql<string>`provenance->>'source'`, "=", OFFLOAD_SOURCE)
      .execute();

    const evicted = PLANTED.filter((p) => !result.context.includes(p.body));
    // eslint-disable-next-line no-console
    console.log(`evicted planted facts: ${evicted.map((p) => p.step).join(", ")} — offload rows: ${offloadRows.length}`);
    expect(evicted.length).toBeGreaterThanOrEqual(2);
    expect(offloadRows).toHaveLength(evicted.length); // exactly the evicted facts, no double-commit

    for (const p of evicted) {
      const res = await recallMemory(
        db,
        { query: p.query, kind: "fact" },
        { embed: async () => vec(p.axis), caller: MANAGED_WORKER },
      );
      expect(res.rows.map((r) => r.body)).toContain(p.body);
    }
  });

  it("hard-limit breach AFTER compression throws loudly (band breach is a bug)", async () => {
    // Newest 40% holds an incompressible ~17.5k-token entry: the oldest-60%
    // summarize move cannot bring the context under the hard limit.
    const ctx: WorkingContext = {
      taskId: null,
      workerId: MANAGED_WORKER,
      department: "os",
      entries: [
        { step: 1, kind: "work", text: "small note one" },
        { step: 2, kind: "work", text: "small note two" },
        { step: 3, kind: "work", text: "small note three" },
        { step: 4, kind: "work", text: "small note four" },
        { step: 5, kind: "work", text: "X".repeat(70_000) },
      ],
    };
    expect(estimateTokens("X".repeat(70_000))).toBeGreaterThan(CONTEXT_BAND.hardLimit);
    await expect(
      checkContextBudget(ctx, { extractFacts: async () => [] }),
    ).rejects.toThrow(/hard band breach/);
  });
});

describe.skipIf(!LIVE)("live managed run (DXB_LIVE_SDK=1 — real summarize-class model)", () => {
  it(
    "50 steps with the real summarizer: band held, facts offloaded, marker recalls back",
    async () => {
      const db = getDb();
      // The real summarizer attributes spend to the task's department (COST-02),
      // so the live task runs under 'os' — the department whose virtual key exists.
      const dept = "os";
      const taskId = await dispatchOne(dept);
      const marker = `the DXB context demo marker for ${LIVE_WORKER} is 737373`;

      const steps = makeSteps();
      steps[9] = async () => ({
        output: [`## step 10`, filler(10), `FACT: ${marker}`].join("\n"),
        confidence: 0.9,
      });

      const measurements: Array<CompressionMeasurement & { compressed: boolean }> = [];
      const run = await runWorkerOnce({
        workerId: LIVE_WORKER,
        departments: [dept],
        execute: makeSteppedExecutor({
          workerId: LIVE_WORKER,
          steps,
          // no seams: real summarize-row extractFacts, real embed, real judge
          onMeasurement: (m, compressed) => measurements.push({ ...m, compressed }),
        }),
      });
      expect(run).toMatchObject({ claimed: true, taskId, status: "review" });

      const compressions = measurements.filter((m) => m.compressed);
      for (const m of measurements) expect(m.after).toBeLessThanOrEqual(CONTEXT_BAND.hardLimit);
      expect(compressions.length).toBeGreaterThanOrEqual(2);

      const offloadRows = await db
        .selectFrom("memory_index")
        .select("id")
        .where(sql<string>`provenance->>'agent'`, "=", LIVE_WORKER)
        .where(sql<string>`provenance->>'source'`, "=", OFFLOAD_SOURCE)
        .execute();
      expect(offloadRows.length).toBeGreaterThanOrEqual(1);

      const res = await recallMemory(
        db,
        { query: `What is the DXB context demo marker for ${LIVE_WORKER}?`, kind: "fact" },
        { caller: LIVE_WORKER },
      );
      // eslint-disable-next-line no-console
      console.log(
        "live context-rot run:",
        JSON.stringify(
          {
            compressions: compressions.map((m) => ({ step: m.step, before: m.before, after: m.after, offloaded: m.offloaded_count })),
            offload_rows: offloadRows.length,
            recall_bodies: res.rows.map((r) => r.body),
          },
          null,
          1,
        ),
      );
      expect(res.rows.map((r) => r.body).join("\n")).toContain("737373");
    },
    600_000,
  );
});
