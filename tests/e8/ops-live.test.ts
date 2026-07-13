import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb, createListenClient, EventEnvelope } from "../../packages/shared/src/index.js";
import { startOpsLiveCollector } from "../../packages/orchestrator/src/ops-live-collector.js";
import { runWorkerOnce } from "../../packages/orchestrator/src/worker-shim.js";
import { dispatch } from "../../packages/orchestrator/src/dispatch.js";

// E8.3 verification — EVENT_MODEL §9/§18/§21/§24:
//   source write → e83 trigger → pg_notify('dxb_ops_live') envelope (§9a Zod)
//   → 1 s collector → ONE notify_broadcast('ops:live') publish per window
//   (10 rapid INSERTs → ≤2 publishes acceptance; single event verbatim).
// Pure DB against the local Supabase stack; probe rows cleaned in afterAll
// (same idiom as the E8.1/E8.2 batteries). realtime.messages rows are
// transient broadcast storage — left to Realtime's own retention.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const probeTaskIds: string[] = [];
const probeRunIds: string[] = [];
const probeDecisionIds: string[] = [];

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// Dedicated LISTEN tap on the raw NOTIFY firehose (pre-debounce layer).
async function openTap() {
  const client = await createListenClient();
  const received: EventEnvelope[] = [];
  client.on("notification", (msg) => {
    if (msg.channel === "dxb_ops_live" && msg.payload) {
      received.push(EventEnvelope.parse(JSON.parse(msg.payload)));
    }
  });
  await client.query("LISTEN dxb_ops_live");
  return {
    received,
    async waitFor(pred: (e: EventEnvelope) => boolean, timeoutMs = 4000): Promise<EventEnvelope> {
      const deadline = Date.now() + timeoutMs;
      for (;;) {
        const hit = received.find(pred);
        if (hit) return hit;
        if (Date.now() > deadline) throw new Error("NOTIFY tap timeout");
        await sleep(25);
      }
    },
    close: () => client.end(),
  };
}

async function makeTask(objective: string): Promise<string> {
  const row = await sql<{ id: string }>`
    INSERT INTO tasks (department, objective, output_contract, model_tier, status)
    VALUES ('engineering', ${objective}, 'probe output', 'L4', 'queued')
    RETURNING id
  `.execute(db());
  const id = row.rows[0].id;
  probeTaskIds.push(id);
  return id;
}

afterAll(async () => {
  if (probeDecisionIds.length > 0) {
    await sql`DELETE FROM decision_log WHERE id = ANY(${probeDecisionIds}::bigint[])`.execute(db());
  }
  if (probeTaskIds.length > 0) {
    await sql`DELETE FROM decision_log WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[]))`.execute(db());
    await sql`DELETE FROM tool_calls WHERE run_id IN (SELECT id FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[]))`.execute(db());
    await sql`DELETE FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
  }
  if (probeRunIds.length > 0) {
    await sql`DELETE FROM decision_log WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM agent_runs WHERE id = ANY(${probeRunIds}::uuid[])`.execute(db());
  }
  if (probeTaskIds.length > 0) {
    await sql`DELETE FROM task_events WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM tasks WHERE id = ANY(${probeTaskIds}::uuid[])`.execute(db());
  }
  await closeDb();
});

describe("E8.3 source triggers → §9a envelopes on the NOTIFY firehose", () => {
  it("task_events INSERT → task.event_appended with corr from row FKs", async () => {
    const tap = await openTap();
    try {
      const taskId = await makeTask("E8.3 probe: task event envelope");
      await sql`
        INSERT INTO task_events (task_id, event, from_status, to_status, actor)
        VALUES (${taskId}::uuid, 'probe', 'queued', 'running', 'e8.3-test')
      `.execute(db());

      const env = await tap.waitFor(
        (e) => e.type === "task.event_appended" && e.corr.task_id === taskId,
      );
      // Zod already validated the full §9a shape in the tap.
      expect(env.entity).toMatchObject({ kind: "task", id: taskId });
      expect(env.actor).toBe("e8.3-test");
      expect(env.payload).toMatchObject({
        event: "probe",
        from_status: "queued",
        to_status: "running",
      });
      expect(env.corr.run_id).toBeNull();
    } finally {
      await tap.close();
    }
  });

  it("agent_runs INSERT/UPDATE walk the run.* type map", async () => {
    const tap = await openTap();
    try {
      const taskId = await makeTask("E8.3 probe: run lifecycle envelopes");
      const run = await sql<{ id: string }>`
        INSERT INTO agent_runs (task_id, model_id, status)
        VALUES (${taskId}::uuid, 'test-e83-model', 'running')
        RETURNING id
      `.execute(db());
      const runId = run.rows[0].id;
      probeRunIds.push(runId);

      const started = await tap.waitFor((e) => e.type === "run.started" && e.corr.run_id === runId);
      expect(started.entity).toMatchObject({ kind: "run", id: runId });
      expect(started.actor).toBe("system"); // no employee_id on the row
      expect(started.payload).toMatchObject({ status: "running", model: "test-e83-model" });
      expect(started.corr.task_id).toBe(taskId);

      // tokens-only update (status unchanged) → run.progressed
      await sql`UPDATE agent_runs SET tokens_out = 42 WHERE id = ${runId}::uuid`.execute(db());
      await tap.waitFor((e) => e.type === "run.progressed" && e.corr.run_id === runId);

      await sql`UPDATE agent_runs SET status = 'waiting_approval' WHERE id = ${runId}::uuid`.execute(db());
      await tap.waitFor((e) => e.type === "run.waiting_approval" && e.corr.run_id === runId);

      await sql`UPDATE agent_runs SET status = 'succeeded', ended_at = now() WHERE id = ${runId}::uuid`.execute(db());
      const done = await tap.waitFor((e) => e.type === "run.succeeded" && e.corr.run_id === runId);
      expect(done.payload).toMatchObject({ status: "succeeded" });
    } finally {
      await tap.close();
    }
  });

  it("decision_log INSERT → decision.logged with corr filled through the run FK", async () => {
    const tap = await openTap();
    try {
      const taskId = await makeTask("E8.3 probe: decision envelope");
      const run = await sql<{ id: string }>`
        INSERT INTO agent_runs (task_id, status) VALUES (${taskId}::uuid, 'running') RETURNING id
      `.execute(db());
      const runId = run.rows[0].id;
      probeRunIds.push(runId);

      const dec = await sql<{ id: string }>`
        INSERT INTO decision_log (run_id, decided_by, decision, rationale)
        VALUES (${runId}::uuid, 'e8.3-test', 'workflow_branch', 'E8.3 probe decision')
        RETURNING id
      `.execute(db());
      probeDecisionIds.push(dec.rows[0].id);

      const env = await tap.waitFor(
        (e) => e.type === "decision.logged" && e.corr.run_id === runId,
      );
      expect(env.entity.kind).toBe("decision");
      expect(env.actor).toBe("e8.3-test");
      expect(env.corr.task_id).toBe(taskId); // resolved via agent_runs → tasks
      expect(env.payload).toMatchObject({ kind: "workflow_branch", actor: "e8.3-test" });
    } finally {
      await tap.close();
    }
  });
});

describe("E8.3 collector — 1 s debounce onto dxb:ops:live (§18/§21/§24)", () => {
  it("10 rapid INSERTs → ≤2 publishes, one envelope carrying payload.batch", async () => {
    const collector = await startOpsLiveCollector({ windowMs: 1000 });
    const since = new Date(Date.now() - 1000);
    try {
      const taskId = await makeTask("E8.3 probe: debounce burst");
      for (let i = 0; i < 10; i += 1) {
        await sql`
          INSERT INTO task_events (task_id, event, actor)
          VALUES (${taskId}::uuid, ${"burst-" + i}, 'e8.3-burst')
        `.execute(db());
      }
      await sleep(1800); // window (1 s) + margin

      // Parallel suites on the shared stack write task_events too — measure
      // debounce on THIS task's publishes only.
      const rows = await sql<{ payload: EventEnvelope }>`
        SELECT payload FROM realtime.messages
        WHERE topic = 'dxb:ops:live' AND extension = 'broadcast'
          AND inserted_at >= ${since.toISOString()}::timestamp
      `.execute(db());
      const publishesWithMine: EventEnvelope[][] = [];
      for (const r of rows.rows) {
        const env = EventEnvelope.parse(r.payload);
        const events = ((env.payload as { batch?: EventEnvelope[] }).batch ?? [env]).map((e) =>
          EventEnvelope.parse(e),
        );
        const mine = events.filter((e) => e.corr.task_id === taskId);
        if (mine.length > 0) publishesWithMine.push(mine);
      }
      // §21 acceptance: ardışık 10 INSERT → ≤2 yayın
      expect(publishesWithMine.length).toBeGreaterThanOrEqual(1);
      expect(publishesWithMine.length).toBeLessThanOrEqual(2);
      expect(collector.publishCount()).toBeGreaterThanOrEqual(publishesWithMine.length);

      // §18: same envelope, payload.batch carries every debounced event.
      const types = publishesWithMine.flat().map((e) => e.type);
      expect(types).toHaveLength(10);
      expect(new Set(types)).toEqual(new Set(["task.event_appended"]));
    } finally {
      await collector.stop();
    }
  });

  it("a single event publishes verbatim — the §24 probe contract", async () => {
    const collector = await startOpsLiveCollector({ windowMs: 300 });
    const since = new Date(Date.now() - 1000);
    try {
      const taskId = await makeTask("E8.3 probe: single verbatim");
      await sql`
        INSERT INTO task_events (task_id, event, actor)
        VALUES (${taskId}::uuid, 'probe', 'e8.3-single')
      `.execute(db());
      await sleep(900);

      // Filter to THIS task's publishes — a neighbouring test's flush may sit
      // inside the 1 s lookback window on a shared stack.
      const rows = await sql<{ payload: EventEnvelope }>`
        SELECT payload FROM realtime.messages
        WHERE topic = 'dxb:ops:live' AND extension = 'broadcast'
          AND inserted_at >= ${since.toISOString()}::timestamp
      `.execute(db());
      const mine = rows.rows
        .map((r) => EventEnvelope.parse(r.payload))
        .filter((e) => e.corr.task_id === taskId);
      expect(mine).toHaveLength(1); // one event → one publish
      const env = mine[0]!;
      expect(env.type).toBe("task.event_appended"); // §24 probe output line
      expect((env.payload as { batch?: unknown }).batch).toBeUndefined(); // verbatim, unwrapped
    } finally {
      await collector.stop();
    }
  });

  it("real claim path: dispatch → runWorkerOnce → run.started/run.succeeded reach the channel", async () => {
    const collector = await startOpsLiveCollector({ windowMs: 300 });
    const since = new Date(Date.now() - 1000);
    try {
      const { taskIds } = await dispatch([
        {
          department: "engineering",
          objective: "E8.3 probe task: live stream on the real claim path",
          output_contract: "single line of probe text",
          model_tier: "L4",
          approval_class: "none",
          budget: { max_tokens: 1000, max_cost_eur: 0.1 },
          priority: 5,
          parent_task_id: null,
          deps: [],
        } as never,
      ]);
      probeTaskIds.push(...taskIds);

      const result = await runWorkerOnce({
        workerId: "e83-test-worker",
        departments: ["engineering"],
        execute: async () => ({ result: { text: "done" }, confidence: 0.9 }),
      });
      expect(result).toMatchObject({ claimed: true });
      await sleep(900);

      const rows = await sql<{ payload: EventEnvelope }>`
        SELECT payload FROM realtime.messages
        WHERE topic = 'dxb:ops:live' AND extension = 'broadcast'
          AND inserted_at >= ${since.toISOString()}::timestamp
      `.execute(db());
      const all: EventEnvelope[] = [];
      for (const r of rows.rows) {
        const env = EventEnvelope.parse(r.payload);
        const batch = (env.payload as { batch?: EventEnvelope[] }).batch;
        all.push(...(batch ?? [env]));
      }
      const mine = all.filter((e) => e.corr.task_id && taskIds.includes(e.corr.task_id));
      const types = new Set(mine.map((e) => e.type));
      expect(types.has("run.started")).toBe(true);
      expect(types.has("run.succeeded")).toBe(true);
      expect(types.has("task.event_appended")).toBe(true); // kernel task events ride along
    } finally {
      await collector.stop();
    }
  });
});
