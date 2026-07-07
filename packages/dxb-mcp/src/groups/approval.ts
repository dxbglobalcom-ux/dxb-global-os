import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getDb } from "@dxb/shared";

// FULL group (Phase 4 / GATE-01). Agents get exactly three doors:
//   approval_submit_draft   — birth an outward action as a DRAFT row
//   approval_finalize_draft — hand the finished draft over (draft→pending)
//   approval_list_pending   — read the decision queue
// There is deliberately NO approve/reject tool here: decisions are human-only
// (`dxb approve|reject` CLI). An agent cannot bypass a door that doesn't exist,
// and the 0003 trigger keeps the state machine one-way underneath.

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

export function registerApproval(server: McpServer): void {
  server.registerTool(
    "approval_submit_draft",
    {
      title: "Submit draft approval (approval.submit_draft)",
      description:
        "Create a DRAFT approvals row for an outward action. Payload is frozen at draft time and executed as-is after CEO approval.",
      inputSchema: {
        task_id: z.string().uuid(),
        action_type: z.string().min(1),
        payload: z.record(z.string(), z.unknown()),
        risk_class: z.enum(["low", "medium", "high"]).default("high"),
      },
    },
    async ({ task_id, action_type, payload, risk_class }) => {
      // Payload stays execution-faithful — NO redaction pass here. By design,
      // secrets never belong in approval payloads (the executor holds outward
      // credentials in its own env; payloads carry only action parameters).
      const db = getDb();
      const row = await db.transaction().execute(async (trx) => {
        const draft = await trx
          .insertInto("approvals")
          .values({ task_id, action_type, payload: JSON.stringify(payload), risk_class })
          .returningAll()
          .executeTakeFirstOrThrow();
        await trx
          .insertInto("audit_log")
          .values({
            actor: task_id,
            actor_type: "agent",
            action: "approval.submit_draft",
            task_id,
            payload: JSON.stringify({ approval_id: draft.id, action_type, risk_class }),
          })
          .execute();
        return draft;
      });
      return ok(row);
    },
  );

  server.registerTool(
    "approval_finalize_draft",
    {
      title: "Finalize draft (approval.finalize_draft)",
      description:
        "Move a finished draft to 'pending' — the CEO decision queue. Agents can hand over; only the human CLI decides.",
      inputSchema: {
        approval_id: z.string().uuid(),
        actor: z.string().min(1),
      },
    },
    async ({ approval_id, actor }) => {
      const db = getDb();
      const row = await db.transaction().execute(async (trx) => {
        const updated = await trx
          .updateTable("approvals")
          .set({ status: "pending" })
          .where("id", "=", approval_id)
          .where("status", "=", "draft")
          .returningAll()
          .executeTakeFirst();
        if (!updated) {
          throw new Error(`approval ${approval_id} not found in 'draft' (finalize is draft→pending only)`);
        }
        await trx
          .insertInto("audit_log")
          .values({
            actor,
            actor_type: "agent",
            action: "approval.finalize_draft",
            task_id: updated.task_id,
            payload: JSON.stringify({ approval_id }),
          })
          .execute();
        return updated;
      });
      return ok(row);
    },
  );

  server.registerTool(
    "approval_list_pending",
    {
      title: "List pending approvals (approval.list_pending)",
      description: "List approvals awaiting the CEO decision, oldest first; optional risk_class filter.",
      inputSchema: {
        risk_class: z.enum(["low", "medium", "high"]).optional(),
      },
    },
    async ({ risk_class }) => {
      let q = getDb().selectFrom("approvals").selectAll().where("status", "=", "pending");
      if (risk_class) q = q.where("risk_class", "=", risk_class);
      const rows = await q.orderBy("created_at").execute();
      return ok(rows);
    },
  );
}
