// packages/outbox-executor/src/index.ts
// TEK yan-etki süreci. Dışa dönük credential'lar YALNIZ bu sürecin env'inde.
//
// ⛔ LOCKED core loop — transcribed verbatim from master-plan PHASE-04 §3 with
// exactly the adaptations mandated by 04-03 Task 1, each marked [ADAPT-x]:
//   [ADAPT-a] `import { db } from "@dxb/shared/db"` → getDb() — the real export
//             (single-client rule, Phase-3 precedent).
//   [ADAPT-b] "audit.append her dalda" comment → implemented as audit_log INSERT
//             inside the SAME transaction, actor 'system:outbox'. The select list
//             gains `approvals.task_id` solely so audit rows join the task's
//             causal chain (audit.trace, COST-01) — no behavioral change.
//   [ADAPT-c] `executed_at: new Date()` → sql`now()` — DB-side time, LOCKED
//             architecture decision ("hep now() DB-tarafı").
// Any other change to this loop requires a recorded ⛔ FABLE-ONLY decision.
import { sql, type Kysely, type Transaction } from "kysely";
import { getDb, PACKAGE, type DB } from "@dxb/shared";
import { handlers } from "./actions/index.js";

export const OWNER = "outbox-executor" as const;
export { PACKAGE };
export { handlers };

async function appendAudit(
  trx: Kysely<DB> | Transaction<DB>,
  action: string,
  taskId: string | null,
  payload: unknown,
): Promise<void> {
  await trx
    .insertInto("audit_log")
    .values({
      actor: "system:outbox",
      actor_type: "system",
      action,
      task_id: taskId,
      payload: JSON.stringify(payload),
    })
    .execute();
}

export async function tick(): Promise<void> {
  const db = getDb(); // [ADAPT-a]
  await db.transaction().execute(async (trx) => {
    const row = await trx
      .selectFrom("outbox")
      .innerJoin("approvals", "approvals.id", "outbox.approval_id")
      .selectAll("outbox")
      .select([
        "approvals.action_type",
        "approvals.payload",
        "approvals.status as approval_status",
        "approvals.task_id as approval_task_id", // [ADAPT-b] causal chain only
      ])
      .where("outbox.status", "=", "ready")
      .forUpdate()
      .skipLocked()
      .limit(1)
      .executeTakeFirst();
    if (!row) return;

    // Yürütme-anı yeniden-denetim (TOCTOU koruması)
    if (row.approval_status !== "approved") {
      await trx
        .updateTable("outbox")
        .set({ status: "failed", last_error: "approval not in approved state at execution time" })
        .where("id", "=", row.id)
        .execute();
      await appendAudit(trx, "outbox.execute_failed_recheck", row.approval_task_id, {
        outbox_id: row.id,
        approval_status: row.approval_status,
      }); // [ADAPT-b]
      return;
    }
    await trx
      .updateTable("outbox")
      .set({ status: "executing", attempts: row.attempts + 1 })
      .where("id", "=", row.id)
      .execute();

    const handler = handlers[row.action_type];
    if (!handler) throw new Error(`no handler for ${row.action_type}`);
    try {
      const result = await handler(row.payload, row.idempotency_key); // idempotency_key handler'a da geçer
      await trx
        .updateTable("outbox")
        .set({
          status: "executed",
          executed_at: sql`now()`, // [ADAPT-c]
          execution_result: JSON.stringify(result),
        })
        .where("id", "=", row.id)
        .execute();
      await appendAudit(trx, "outbox.executed", row.approval_task_id, {
        outbox_id: row.id,
        action_type: row.action_type,
      }); // [ADAPT-b]
    } catch (e) {
      await trx
        .updateTable("outbox")
        .set({ status: "failed", last_error: String(e) })
        .where("id", "=", row.id)
        .execute();
      await appendAudit(trx, "outbox.execute_failed", row.approval_task_id, {
        outbox_id: row.id,
        action_type: row.action_type,
        error: String(e).slice(0, 300),
      }); // [ADAPT-b]
    }
  });
}
// pg-boss cron (04-04): her 15sn tick(); attempts>=3 failed satır CEO inbox'ına alarm

// Test/ops entrypoint: run exactly one tick.
export async function runOnce(): Promise<void> {
  await tick();
}
