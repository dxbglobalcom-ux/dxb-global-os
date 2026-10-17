// One copy of the agent audit append (dxb-mcp queue group, memory-router write door): a row in
// audit_log on the caller's own transaction, so the audit lands or rolls back with the write.
import type { Kysely, Transaction } from "kysely";
import type { DB } from "./db-types.js";

export async function appendAudit(
  trx: Kysely<DB> | Transaction<DB>,
  actor: string,
  action: string,
  taskId: string | null,
  payload: unknown,
): Promise<void> {
  await trx
    .insertInto("audit_log")
    .values({ actor, actor_type: "agent", action, task_id: taskId, payload: JSON.stringify(payload) })
    .execute();
}
