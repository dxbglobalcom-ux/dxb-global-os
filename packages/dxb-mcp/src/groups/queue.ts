import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sql, type Kysely, type Transaction } from "kysely";
import { z } from "zod";
import { TaskEnvelope, getDb, type DB } from "@dxb/shared";
import { assertTransition } from "../transitions.js";

// Logical (master-plan) names are dotted: queue.create_task, queue.claim, ...
// Registered names use underscores — MCP tool-name grammar in several clients
// rejects dots. The mapping is mechanical: '.' → '_'.

const ok = (data: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(data) }],
});

async function appendAudit(
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

export function registerQueue(server: McpServer): void {
  server.registerTool(
    "queue_create_task",
    {
      title: "Create task (queue.create_task)",
      description: "Validate a TaskEnvelope and enqueue it (inbox→queued birth, evented).",
      inputSchema: TaskEnvelope.shape,
    },
    async (input) => {
      const env = TaskEnvelope.parse(input);
      const db = getDb();
      const task = await db.transaction().execute(async (trx) => {
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
            status: "queued", // birth is inbox→queued in one atomic insert; the event records it
          })
          .returningAll()
          .executeTakeFirstOrThrow();
        await trx
          .insertInto("task_events")
          .values({
            task_id: row.id,
            event: "created",
            from_status: "inbox",
            to_status: "queued",
            actor: env.department,
            payload: JSON.stringify({ objective: env.objective.slice(0, 120) }),
          })
          .execute();
        await appendAudit(trx, env.department, "queue.create_task", row.id, { model_tier: env.model_tier });
        return row;
      });
      return ok(task);
    },
  );

  server.registerTool(
    "queue_claim",
    {
      title: "Claim next task (queue.claim)",
      description: "Atomically claim the next queued task for a worker (SKIP LOCKED lease).",
      inputSchema: {
        worker_id: z.string().min(1),
        departments: z.array(z.string().min(1)).min(1),
        lease_seconds: z.number().int().positive().optional(),
      },
    },
    async ({ worker_id, departments, lease_seconds }) => {
      const db = getDb();
      const claimed = await db.transaction().execute(async (trx) => {
        const { rows } = await sql<Record<string, unknown>>`
          SELECT * FROM claim_next_task(${worker_id}, ${sql.val(departments)}::text[], ${lease_seconds ?? 900})
        `.execute(trx);
        const row = rows[0] ?? null;
        if (row) {
          await trx
            .insertInto("task_events")
            .values({
              task_id: row.id as string,
              event: "claimed",
              from_status: "queued",
              to_status: "claimed",
              actor: worker_id,
              payload: JSON.stringify({ lease_seconds: lease_seconds ?? 900 }),
            })
            .execute();
          await appendAudit(trx, worker_id, "queue.claim", row.id as string, { departments });
        }
        return row;
      });
      return ok(claimed);
    },
  );

  server.registerTool(
    "queue_transition",
    {
      title: "Transition task status (queue.transition)",
      description:
        "Move a task along the LOCKED lifecycle map. Transition to 'returned' requires feedback.",
      inputSchema: {
        task_id: z.string().uuid(),
        to_status: z.string().min(1),
        actor: z.string().min(1),
        feedback: z.string().min(1).optional(),
        payload: z.record(z.string(), z.unknown()).optional(),
      },
    },
    async ({ task_id, to_status, actor, feedback, payload }) => {
      if (to_status === "returned" && !feedback) {
        throw new Error("transition to 'returned' requires feedback (QUEUE-03)");
      }
      const db = getDb();
      const updated = await db.transaction().execute(async (trx) => {
        const current = await trx
          .selectFrom("tasks")
          .select(["id", "status"])
          .where("id", "=", task_id)
          .forUpdate()
          .executeTakeFirst();
        if (!current) throw new Error(`task ${task_id} not found`);
        assertTransition(current.status, to_status);
        const row = await trx
          .updateTable("tasks")
          .set({
            status: to_status,
            updated_at: sql`now()`,
            ...(to_status === "returned" ? { feedback: feedback! } : {}),
          })
          .where("id", "=", task_id)
          .returningAll()
          .executeTakeFirstOrThrow();
        await trx
          .insertInto("task_events")
          .values({
            task_id,
            event: to_status === "returned" ? "returned" : "transition",
            from_status: current.status,
            to_status,
            actor,
            payload: JSON.stringify(payload ?? {}),
          })
          .execute();
        await appendAudit(trx, actor, "queue.transition", task_id, { from: current.status, to: to_status });
        return row;
      });
      return ok(updated);
    },
  );

  server.registerTool(
    "queue_return",
    {
      title: "Return task with feedback (queue.return)",
      description: "review→returned with mandatory feedback (QUEUE-03 no-rework-blindness).",
      inputSchema: {
        task_id: z.string().uuid(),
        feedback: z.string().min(1),
        actor: z.string().min(1),
      },
    },
    async ({ task_id, feedback, actor }) => {
      const db = getDb();
      const updated = await db.transaction().execute(async (trx) => {
        const current = await trx
          .selectFrom("tasks")
          .select(["id", "status"])
          .where("id", "=", task_id)
          .forUpdate()
          .executeTakeFirst();
        if (!current) throw new Error(`task ${task_id} not found`);
        assertTransition(current.status, "returned"); // only review→returned is legal
        const row = await trx
          .updateTable("tasks")
          .set({ status: "returned", feedback, updated_at: sql`now()` })
          .where("id", "=", task_id)
          .returningAll()
          .executeTakeFirstOrThrow();
        await trx
          .insertInto("task_events")
          .values({
            task_id,
            event: "returned",
            from_status: current.status,
            to_status: "returned",
            actor,
            payload: JSON.stringify({ feedback: feedback.slice(0, 200) }),
          })
          .execute();
        await appendAudit(trx, actor, "queue.return", task_id, {});
        return row;
      });
      return ok(updated);
    },
  );

  server.registerTool(
    "queue_get",
    {
      title: "Get task (queue.get)",
      description: "Fetch one task by id.",
      inputSchema: { task_id: z.string().uuid() },
    },
    async ({ task_id }) => {
      const row = await getDb().selectFrom("tasks").selectAll().where("id", "=", task_id).executeTakeFirst();
      return ok(row ?? null);
    },
  );

  server.registerTool(
    "queue_list",
    {
      title: "List tasks (queue.list)",
      description: "List tasks, optionally filtered by department and/or status.",
      inputSchema: {
        department: z.string().optional(),
        status: z.string().optional(),
      },
    },
    async ({ department, status }) => {
      let q = getDb().selectFrom("tasks").selectAll();
      if (department) q = q.where("department", "=", department);
      if (status) q = q.where("status", "=", status);
      const rows = await q.orderBy("priority", "desc").orderBy("created_at").execute();
      return ok(rows);
    },
  );
}
