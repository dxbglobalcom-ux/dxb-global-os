import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { sql, type Kysely, type Transaction } from "kysely";
import { z } from "zod";
import { TaskEnvelope, getDb, type DB } from "@dxb/shared";
import { assertTransition } from "../transitions.js";
import {
  CallSheet,
  SEAT_SLUG,
  assertForwardDeps,
  groupByLevel,
  inputsParagraph,
  sheetLevels,
  type SheetRecord,
  type SheetTaskRecord,
} from "../dispatch-book.js";

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

/** An open project, or null for a project-less task. Throws on a closed or unknown one:
 *  claim_next_task would never hand the task out (a halted project halts its queue). */
async function assertProjectOpen(db: Kysely<DB>, projectId: string | null): Promise<void> {
  if (!projectId) return;
  // projects is not in the shared DB type map (PROJECT_OS owns it through control fns) — raw read
  const p = (await sql<{ status: string }>`SELECT status FROM projects WHERE id = ${projectId}::uuid`.execute(db)).rows[0];
  if (!p) throw new Error(`project ${projectId} not found`);
  if (p.status !== "draft" && p.status !== "active") {
    throw new Error(`project ${projectId} is '${p.status}' — only a draft or active project takes new tasks`);
  }
}

// B43 plan ② (2026-09-05): a task may be born FOR a named seat and UNDER a project — the
// brief door. Mirrors orchestrator dispatch's DispatchOpts: the TaskEnvelope contract
// itself stays LOCKED (no project, no staffing field); these ride beside it.
const CreateTaskExtras = {
  project_id: z.string().uuid().optional(),
  agent_slug: SEAT_SLUG.optional(),
  label: z.string().min(1).max(120).optional(),
  label_tr: z.string().min(1).max(120).optional(),
};

export function registerQueue(server: McpServer): void {
  server.registerTool(
    "queue_create_task",
    {
      title: "Create task (queue.create_task)",
      description:
        "Validate a TaskEnvelope and enqueue it (inbox→queued birth, evented). Optional: agent_slug (an active employee of the envelope's department — the task is born staffed), project_id (an open project), label / label_tr (one line for the CEO's feed).",
      inputSchema: { ...TaskEnvelope.shape, ...CreateTaskExtras },
    },
    async (input) => {
      const env = TaskEnvelope.parse(input);
      const extras = z.object(CreateTaskExtras).parse(input);
      const db = getDb();
      await assertProjectOpen(db, extras.project_id ?? null);
      let agentId: string | null = null;
      if (extras.agent_slug) {
        const seat = await db
          .selectFrom("agents")
          .select(["id", "department", "employment_status"])
          .where("slug", "=", extras.agent_slug)
          .executeTakeFirst();
        if (!seat) throw new Error(`queue_create_task: employee '${extras.agent_slug}' not found`);
        if (seat.department !== env.department) {
          throw new Error(`queue_create_task: '${extras.agent_slug}' belongs to '${seat.department}', not '${env.department}'`);
        }
        if (seat.employment_status !== "active") {
          throw new Error(`queue_create_task: '${extras.agent_slug}' is '${seat.employment_status}', not active`);
        }
        agentId = seat.id;
      }
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
            agent_id: agentId,
            project_id: extras.project_id ?? null,
            label: extras.label ?? null,
            label_tr: extras.label_tr ?? null,
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
        await appendAudit(trx, env.department, "queue.create_task", row.id, {
          model_tier: env.model_tier,
          ...(extras.agent_slug ? { agent_slug: extras.agent_slug } : {}),
          ...(extras.project_id ? { project_id: extras.project_id } : {}),
        });
        return row;
      });
      return ok(task);
    },
  );

  // B43 plan ② — THE DISPATCH BOOK (dispatch-book.ts carries the why). A seat that holds a
  // plan writes it here as ONE TASK PER NAMED SEAT of its own department, with forward-only
  // dependencies, under the author's project, in one transaction: a bad seat, a backward
  // dependency or a closed project writes zero rows. The same (author task, code) asked
  // twice returns the sheet already born — a revision round of the author's run must not
  // double the crew. The record: one 'created' event per task, one 'queue.dispatch' audit
  // row on the author's task carrying the whole sheet, one decision_log row with the graph.
  server.registerTool(
    "queue_dispatch",
    {
      title: "Dispatch a call sheet (queue.dispatch)",
      description:
        "Turn a plan into one task per named seat of YOUR department, born under your task's project with dependencies (deps = indices of earlier seats on the sheet). Seats with the same dependencies run at the same time in separate lanes; name only the seats the job needs. Each seat gets objective, output_contract, label (EN) and label_tr (TR). Dependants are told which tasks to read (queue_get) before they start. Idempotent per (your task, code).",
      inputSchema: CallSheet.shape,
    },
    async (input) => {
      const sheet = CallSheet.parse(input);
      assertForwardDeps(sheet.seats);
      const levels = sheetLevels(sheet.seats);
      const db = getDb();

      const author = await db
        .selectFrom("tasks")
        .select([
          "id",
          "department",
          "agent_id",
          "project_id",
          "model_tier",
          "priority",
          "budget_max_tokens",
          "budget_max_cost_eur",
          "status",
        ])
        .where("id", "=", sheet.task_id)
        .executeTakeFirst();
      if (!author) throw new Error(`queue_dispatch: task ${sheet.task_id} not found`);
      if (author.status === "done" || author.status === "failed") {
        throw new Error(`queue_dispatch: task ${sheet.task_id} is '${author.status}' — a closed task cannot dispatch`);
      }
      const authorSeat = author.agent_id
        ? await db.selectFrom("agents").select(["slug"]).where("id", "=", author.agent_id).executeTakeFirst()
        : null;
      const actor = authorSeat?.slug ?? author.department;

      // idempotency: the sheet already born for this (author, code) is returned unchanged
      const prior = await db
        .selectFrom("audit_log")
        .select(["payload"])
        .where("action", "=", "queue.dispatch")
        .where("task_id", "=", author.id)
        .where(sql`payload ->> 'code'`, "=", sheet.code)
        .orderBy("created_at")
        .executeTakeFirst();
      if (prior) {
        const record = (typeof prior.payload === "string" ? JSON.parse(prior.payload) : prior.payload) as SheetRecord;
        return ok({ ...record, already_dispatched: true });
      }

      await assertProjectOpen(db, author.project_id ?? null);

      const slugs = [...new Set(sheet.seats.map((s) => s.seat))];
      const staff = await db
        .selectFrom("agents")
        .select(["id", "slug", "department", "employment_status"])
        .where("slug", "in", slugs)
        .execute();
      const bySlug = new Map(staff.map((a) => [a.slug, a]));
      const refused: string[] = [];
      for (const slug of slugs) {
        const a = bySlug.get(slug);
        if (!a) refused.push(`${slug}: not found`);
        else if (a.department !== author.department) refused.push(`${slug}: belongs to '${a.department}', not '${author.department}'`);
        else if (a.employment_status !== "active") refused.push(`${slug}: is '${a.employment_status}', not active`);
      }
      if (refused.length > 0) {
        throw new Error(`queue_dispatch: the sheet names seats that cannot take it — ${refused.join("; ")}`);
      }

      const record = await db.transaction().execute(async (trx): Promise<SheetRecord> => {
        // first pass: every seat's task, queued, staffed, under the author's project
        const ids: string[] = [];
        for (const seat of sheet.seats) {
          const row = await trx
            .insertInto("tasks")
            .values({
              department: author.department,
              agent_id: bySlug.get(seat.seat)!.id,
              objective: seat.objective,
              output_contract: seat.output_contract,
              model_tier: author.model_tier,
              approval_class: seat.approval_class,
              budget_max_tokens: seat.budget_max_tokens ?? author.budget_max_tokens,
              budget_max_cost_eur: author.budget_max_cost_eur,
              priority: seat.priority ?? author.priority,
              parent_task_id: author.id,
              project_id: author.project_id ?? null,
              label: seat.label,
              label_tr: seat.label_tr,
              status: "queued",
            })
            .returning("id")
            .executeTakeFirstOrThrow();
          ids.push(row.id);
        }
        // second pass: resolve the local indices to uuids and tell each dependant what to read
        const tasks: SheetTaskRecord[] = [];
        for (let i = 0; i < sheet.seats.length; i++) {
          const seat = sheet.seats[i];
          const dependsOn = seat.deps.map((d) => ids[d]);
          if (dependsOn.length > 0) {
            const upstream = seat.deps.map((d) => ({ task_id: ids[d], seat: sheet.seats[d].seat, label: sheet.seats[d].label }));
            await trx
              .updateTable("tasks")
              .set({
                depends_on: dependsOn,
                objective: seat.objective + "\n" + inputsParagraph(sheet.code, upstream),
                updated_at: sql`now()`,
              })
              .where("id", "=", ids[i])
              .execute();
          }
          tasks.push({ index: i, seat: seat.seat, task_id: ids[i], depends_on: dependsOn, level: levels[i], label: seat.label });
        }
        await trx
          .insertInto("task_events")
          .values(
            tasks.map((t) => ({
              task_id: t.task_id,
              event: "created",
              from_status: "inbox",
              to_status: "queued",
              actor,
              payload: JSON.stringify({ sheet: sheet.code, index: t.index, seat: t.seat, deps: sheet.seats[t.index].deps, level: t.level }),
            })),
          )
          .execute();
        const rec: SheetRecord = {
          code: sheet.code,
          author_task_id: author.id,
          project_id: author.project_id ?? null,
          tasks,
          levels: groupByLevel(levels),
        };
        await appendAudit(trx, actor, "queue.dispatch", author.id, rec);
        // §10 "görev atama": the plan as a decision record, in the same transaction as the
        // rows it describes (a rolled-back sheet leaves no decision).
        await trx
          .insertInto("decision_log")
          .values({
            run_id: null,
            decided_by: actor,
            decision: "call_sheet",
            rationale:
              `sheet ${sheet.code}: ${tasks.length} seat(s) in ${rec.levels.length} level(s) — ` +
              rec.levels.map((g, l) => `L${l}: ${g.map((i) => sheet.seats[i].seat).join(" · ")}`).join(" → "),
            data_used: ["tasks", "agents", "projects", "task_events"],
            alternatives: JSON.stringify({ dependency_graph: sheet.seats.map((s, i) => ({ index: i, seat: s.seat, deps: s.deps })) }),
            confidence: null,
            risk: null,
          })
          .execute();
        return rec;
      });
      return ok({ ...record, already_dispatched: false });
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
      // B43 plan ②: an employee is not a lane. A seat holding this tool could otherwise claim a
      // sibling's task under its own name and run two seats in one head.
      const isEmployee = await db.selectFrom("agents").select("id").where("slug", "=", worker_id).executeTakeFirst();
      if (isEmployee) {
        throw new Error(`queue_claim: '${worker_id}' is an employee, not a lane — tasks are claimed by the resident worker, never by a seat`);
      }
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
          .select(["id", "status", "claimed_by"])
          .where("id", "=", task_id)
          .forUpdate()
          .executeTakeFirst();
        if (!current) throw new Error(`task ${task_id} not found`);
        assertTransition(current.status, to_status);
        // B43 plan ② (measured 2026-09-05 02:22 on DXB-V-EYW-004): the engineer seat moved its
        // OWN task running→review from inside its run; the QA gate then judged a row with no
        // result, failed it, the ladder requeued it and a second lane re-shot the take. A task
        // in claimed/running belongs to the hand that holds it — the resident lane moves it when
        // the run answers. A seat's answer IS its delivery; nobody else touches the row.
        if ((current.status === "claimed" || current.status === "running") && current.claimed_by && actor !== current.claimed_by) {
          throw new Error(
            `task ${task_id} is held by '${current.claimed_by}' (${current.status}) — only the hand that holds it moves it; ` +
              "a seat never moves its own task, its answer is the delivery",
          );
        }
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
