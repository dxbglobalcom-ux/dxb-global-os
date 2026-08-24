import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { intakeIntentOnce } from "../../packages/orchestrator/src/intent-intake.js";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import { deriveChainStatus } from "../../apps/dashboard/src/lib/intents.js";

// 08-05 E2E (DB level): TR intent row → intake worker → task chain queued →
// 'created' event broadcast in the shape the board consumes → intent row
// carries the chain. LLM stages are injected (classify/decompose are
// Phase-5-proven and live-gated); dispatch is REAL — the queue rows, the
// transaction and the broadcast trigger all execute against the database.

const TR_FIXTURE = "Outleteuro için hafta sonu kampanya taslağı hazırla ve maliyet özetini çıkar";

const createdIntents: string[] = [];
const createdTasks: string[] = [];

async function submitIntent(text: string): Promise<string> {
  // Same write shape the dashboard route produces (0016 column grants force
  // status='received' — asserted in the privilege test below).
  const res = await sql<{ id: string }>`
    insert into intents (text, lang, source, actor)
    values (${text}, 'tr', 'dashboard', 'ceo')
    returning id
  `.execute(getDb());
  createdIntents.push(res.rows[0].id);
  return res.rows[0].id;
}

const fakeClassify = async () => ({
  intent_summary: "Prepare a weekend campaign draft for Outleteuro with a cost summary",
  task_class: "content.outbound",
  departments: ["marketing"],
  approval_class: "none" as const,
  complexity: "single" as const,
});

const fakeDecompose = async () => [
  {
    ...TaskEnvelope.parse({
      department: "marketing",
      objective: "Prepare a weekend campaign draft for Outleteuro with a cost summary",
      output_contract: "One self-contained campaign draft document",
      model_tier: "L3",
      approval_class: "none",
    }),
    deps: [],
  },
];

afterAll(async () => {
  const db = getDb();
  if (createdTasks.length > 0) {
    await sql`delete from task_events where task_id = any(${createdTasks}::uuid[])`.execute(db);
    await sql`delete from tasks where id = any(${createdTasks}::uuid[])`.execute(db);
  }
  if (createdIntents.length > 0) {
    await sql`delete from intents where id = any(${createdIntents}::uuid[])`.execute(db);
  }
  await closeDb();
});

describe("command-bar intent seam — intent → chain → event (DB E2E)", () => {
  it("TR intent dispatches: tasks queued, intent carries task_ids, board event broadcast", async () => {
    const intentId = await submitIntent(TR_FIXTURE);

    const result = await intakeIntentOnce({
      classifyFn: fakeClassify,
      decomposeFn: fakeDecompose,
    });
    expect(result.processed).toBe(true);
    if (!result.processed || result.status !== "dispatched") {
      throw new Error(`expected dispatched, got ${JSON.stringify(result)}`);
    }
    expect(result.intentId).toBe(intentId);
    expect(result.taskIds).toHaveLength(1);
    createdTasks.push(...result.taskIds);

    // (a) intents row: dispatched + chain recorded
    const intent = await sql<{ status: string; task_ids: string[] }>`
      select status, task_ids from intents where id = ${intentId}::uuid
    `.execute(getDb());
    expect(intent.rows[0].status).toBe("dispatched");
    expect(intent.rows[0].task_ids).toEqual(result.taskIds);

    // (b) queue row exists, queued
    const task = await sql<{ status: string; department: string }>`
      select status, department from tasks where id = ${result.taskIds[0]}::uuid
    `.execute(getDb());
    expect(task.rows[0]).toEqual({ status: "queued", department: "marketing" });

    // (c) 'created' transition event broadcast in the exact shape the board reads
    const message = await sql<{ payload: Record<string, unknown> }>`
      select payload from realtime.messages
      where topic = 'dxb:task_events' and extension = 'broadcast'
        and payload->'record'->>'task_id' = ${result.taskIds[0]}
      order by inserted_at desc limit 1
    `.execute(getDb());
    expect(message.rows.length).toBe(1);
    const record = message.rows[0].payload.record as Record<string, unknown>;
    expect(record.to_status).toBe("queued");
    expect(record.event).toBe("created");

    // (d) chip derivation the IntentStrip renders
    expect(deriveChainStatus("dispatched", ["queued"])).toBe("queued");
    expect(deriveChainStatus("dispatched", ["running"])).toBe("running");
    expect(deriveChainStatus("dispatched", ["done"])).toBe("done");
  });

  it("kernel failure → failed_dispatch recorded on the row, zero tasks", async () => {
    const intentId = await submitIntent("Bu niyet bilerek patlar");
    const result = await intakeIntentOnce({
      classifyFn: async () => {
        throw new Error("kernel unreachable (probe)");
      },
    });
    expect(result).toMatchObject({
      processed: true,
      intentId,
      status: "failed_dispatch",
      error: "kernel unreachable (probe)",
    });
    const row = await sql<{ status: string; error: string; task_ids: string[] }>`
      select status, error, task_ids from intents where id = ${intentId}::uuid
    `.execute(getDb());
    expect(row.rows[0].status).toBe("failed_dispatch");
    expect(row.rows[0].task_ids).toEqual([]);
  });

  it("nothing to do → processed:false (idle tick is cheap)", async () => {
    const result = await intakeIntentOnce({ classifyFn: fakeClassify });
    expect(result).toEqual({ processed: false });
  });

  it("privilege wall: dashboard may write ONLY text/lang/source/actor; anon nothing", async () => {
    const res = await sql<{
      text_ins: boolean;
      status_ins: boolean;
      task_ids_ins: boolean;
      anon_ins: boolean;
      authed_sel: boolean;
    }>`
      select
        has_column_privilege('authenticated','intents','text','insert') as text_ins,
        has_column_privilege('authenticated','intents','status','insert') as status_ins,
        has_column_privilege('authenticated','intents','task_ids','insert') as task_ids_ins,
        has_table_privilege('anon','intents','insert') as anon_ins,
        has_table_privilege('authenticated','intents','select') as authed_sel
    `.execute(getDb());
    expect(res.rows[0]).toEqual({
      text_ins: true,
      status_ins: false,
      task_ids_ins: false,
      anon_ins: false,
      authed_sel: true,
    });
  });
});
