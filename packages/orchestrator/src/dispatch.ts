// Orchestrator dispatch — the ONLY doorway from envelopes into work.
// Writes TaskEnvelopes as queued tasks rows in ONE transaction: a Zod-invalid
// or structurally broken batch inserts ZERO rows. Head notification IS the
// queue row + its 'created' event (LOCKED: sub-agents isolated — queue + typed
// artifacts, no chat channel; nothing else is built here).
// deps are local forward-only indices resolved to uuids inside the same
// transaction — cycles impossible by construction.
import { sql } from "kysely";
import { getDb, TaskEnvelope } from "@dxb/shared";
import type { DecomposedEnvelope } from "./decompose.js";

export async function dispatch(
  envelopes: DecomposedEnvelope[],
): Promise<{ taskIds: string[] }> {
  if (envelopes.length === 0) throw new Error("dispatch: empty envelope batch");

  // Validate the WHOLE batch before touching the DB — one bad envelope
  // aborts the batch with zero rows written.
  const valid = envelopes.map((e, i) => {
    const parsed = TaskEnvelope.parse(e);
    for (const dep of e.deps) {
      if (!Number.isInteger(dep) || dep < 0 || dep >= i) {
        throw new Error(
          `dispatch: envelope[${i}] deps must be indices of EARLIER batch items, got ${dep}`,
        );
      }
    }
    return { ...parsed, deps: e.deps };
  });

  const db = getDb();
  return db.transaction().execute(async (trx) => {
    // First pass: insert every row 'queued', collecting uuids in input order.
    const taskIds: string[] = [];
    for (const env of valid) {
      const row = await trx
        .insertInto("tasks")
        .values({
          department: env.department,
          objective: env.objective,
          output_contract: env.output_contract,
          model_tier: env.model_tier,
          approval_class: env.approval_class,
          budget_max_tokens: env.budget.max_tokens,
          budget_max_cost_eur: env.budget.max_cost_eur,
          priority: env.priority,
          parent_task_id: env.parent_task_id,
          status: "queued",
        })
        .returning("id")
        .executeTakeFirstOrThrow();
      taskIds.push(row.id);
    }

    // Second pass: resolve local deps indices to uuids (indices only point at
    // earlier items, so every referenced uuid already exists).
    for (let i = 0; i < valid.length; i++) {
      if (valid[i].deps.length === 0) continue;
      const depIds = valid[i].deps.map((d) => taskIds[d]);
      await trx
        .updateTable("tasks")
        .set({ depends_on: depIds, updated_at: sql`now()` })
        .where("id", "=", taskIds[i])
        .execute();
    }

    // One 'created' event per task — this event + the queued row ARE the head
    // notification (no other channel exists).
    await trx
      .insertInto("task_events")
      .values(
        taskIds.map((id, i) => ({
          task_id: id,
          event: "created",
          from_status: "inbox",
          to_status: "queued",
          actor: "orchestrator:dispatch",
          payload: JSON.stringify({ envelope_index: i, deps: valid[i].deps }),
        })),
      )
      .execute();

    return { taskIds };
  });
}
