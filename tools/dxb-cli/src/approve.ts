import { z } from "zod";
import { getDb } from "@dxb/shared";

// Human-only decision path (GATE-01). These functions exist ONLY in the CLI
// package — dxb-mcp exposes no tool that can reach them. decided_by is the
// recorded CEO identity; the 0003 trigger enforces one-way pending→decision
// underneath, and trg_outbox_enqueue births the single execution record.

const Uuid = z.string().uuid();

export class DecisionError extends Error {}

function readable(e: unknown, id: string): DecisionError {
  const msg = e instanceof Error ? e.message : String(e);
  if (/yasak|karar değiştirilemez/.test(msg)) {
    return new DecisionError(
      `approval ${id} is not in 'pending' — only pending rows can be decided (db guard: ${msg.split("\n")[0]})`,
    );
  }
  return new DecisionError(msg);
}

export async function approve(id: string): Promise<{ id: string; status: string }> {
  Uuid.parse(id);
  const db = getDb();
  try {
    return await db.transaction().execute(async (trx) => {
      const row = await trx
        .updateTable("approvals")
        .set({ status: "approved", decided_by: "ceo:cli", decided_at: new Date() })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();
      if (!row) throw new DecisionError(`approval ${id} not found`);
      await trx
        .insertInto("audit_log")
        .values({
          actor: "ceo:cli",
          actor_type: "ceo",
          action: "approval.approve",
          task_id: row.task_id,
          payload: JSON.stringify({ approval_id: id, action_type: row.action_type }),
        })
        .execute();
      return { id: row.id, status: row.status };
    });
  } catch (e) {
    if (e instanceof DecisionError) throw e;
    throw readable(e, id);
  }
}

export async function reject(id: string, note: string): Promise<{ id: string; status: string }> {
  Uuid.parse(id);
  const parsedNote = z.string().min(1, "reject requires --note <text>").parse(note);
  const db = getDb();
  try {
    return await db.transaction().execute(async (trx) => {
      const row = await trx
        .updateTable("approvals")
        .set({ status: "rejected", decided_by: "ceo:cli", decided_at: new Date(), decision_note: parsedNote })
        .where("id", "=", id)
        .returningAll()
        .executeTakeFirst();
      if (!row) throw new DecisionError(`approval ${id} not found`);
      await trx
        .insertInto("audit_log")
        .values({
          actor: "ceo:cli",
          actor_type: "ceo",
          action: "approval.reject",
          task_id: row.task_id,
          payload: JSON.stringify({ approval_id: id, note: parsedNote.slice(0, 200) }),
        })
        .execute();
      return { id: row.id, status: row.status };
    });
  } catch (e) {
    if (e instanceof DecisionError) throw e;
    throw readable(e, id);
  }
}
