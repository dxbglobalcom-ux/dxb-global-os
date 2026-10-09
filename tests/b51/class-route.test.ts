import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { resolveExecutionRoute, type ClaimedTask } from "../../packages/orchestrator/src/index.js";

// B51 step 3 · P3. Until now a worker chose its model and effort by the task's TIER: among the department-less
// rows of that tier, the first by priority. The class the task was routed as (tasks.task_class, B51 step 2)
// only switched the gate — so the efforts written per class (move 3) could never reach a run, and any new
// department-less row with a high priority would take a whole tier. Now the class row leads; the tier is the
// fallback, and the fallback picks a SEAT (a role_slot row) before any other row of the tier.

const P = "b51p3";
const ids: string[] = [];

async function rule(row: {
  task_class: string;
  model_tier: string;
  model: string;
  effort: string;
  priority: number;
  role_slot?: string | null;
}): Promise<string> {
  const r = await sql<{ id: string }>`
    INSERT INTO routing_rules (task_class, match, model_tier, model, model_id, mode, effort, priority, enabled, role_slot)
    VALUES (${row.task_class}, '{}', ${row.model_tier}, ${row.model}, ${row.model}, 'subscription', ${row.effort},
            ${row.priority}, true, ${row.role_slot ?? null})
    RETURNING id
  `.execute(getDb());
  ids.push(r.rows[0].id);
  return r.rows[0].id;
}

const task = (over: Partial<ClaimedTask>): ClaimedTask => ({
  id: "00000000-0000-0000-0000-000000000000",
  department: "engineering",
  objective: "b51 p3 route probe — never executed",
  output_contract: "nothing",
  model_tier: "L2",
  approval_class: "internal",
  budget_max_tokens: 1000,
  priority: 0,
  status: "queued",
  agent_id: null,
  task_class: null,
  ...over,
});

let classRow = "";
let opusSeat: string | null = null;

beforeAll(async () => {
  classRow = await rule({ task_class: `${P}.work`, model_tier: "L2", model: "claude-sonnet-5", effort: "xhigh", priority: -100 });
  // an employee whose brain raises an L2 task to L1 (§4f floor)
  const a = await sql<{ id: string }>`
    SELECT id FROM agents WHERE brain = 'fable-5' AND employment_status <> 'archived' LIMIT 1
  `.execute(getDb());
  opusSeat = a.rows[0]?.id ?? null;
});

afterAll(async () => {
  if (ids.length) await sql`DELETE FROM routing_rules WHERE id = ANY (${ids}::uuid[])`.execute(getDb());
  await closeDb();
});

describe("P3 — the class leads, the tier is the fallback", () => {
  it("a task routed as a class runs on that class's row — its model and its effort — whatever wins the tier", async () => {
    const r = await resolveExecutionRoute(task({ task_class: `${P}.work`, model_tier: "L2" }));
    expect(r.rule.id).toBe(classRow);
    expect(r.rule.effort).toBe("xhigh");
  });

  it("a task with no class, or a class with no row, falls to its tier", async () => {
    const none = await resolveExecutionRoute(task({ task_class: null, model_tier: "L2" }));
    const unknown = await resolveExecutionRoute(task({ task_class: `${P}.nothing`, model_tier: "L2" }));
    expect(none.rule.id).not.toBe(classRow);
    expect(none.rule.model_tier).toBe("L2");
    expect(unknown.rule.id).toBe(none.rule.id);
  });

  it("a class row below the employee's brain floor is passed over: the floor is never lowered", async () => {
    expect(opusSeat, "the construction engine holds an employee with an Opus brain").not.toBeNull();
    const r = await resolveExecutionRoute(task({ task_class: `${P}.work`, model_tier: "L2", agent_id: opusSeat }));
    expect(r.effectiveTier).toBe("L1");
    expect(r.rule.id).not.toBe(classRow);
    expect(r.rule.model_tier).toBe("L1");
  });

  it("a new department-less row, however high its priority, cannot take a tier from its seat", async () => {
    const before = await resolveExecutionRoute(task({ task_class: null, model_tier: "L1" }));
    expect(before.rule.role_slot).toBe("primary"); // the primary seat, never the alphabet's first (backup)
    const hijack = await rule({ task_class: `${P}.loud`, model_tier: "L1", model: "claude-sonnet-5", effort: "low", priority: 10_000 });
    const after = await resolveExecutionRoute(task({ task_class: null, model_tier: "L1" }));
    expect(after.rule.id).not.toBe(hijack);
    expect(after.rule.id).toBe(before.rule.id);
    // but a task OF that class gets it — that is what the row is for
    const own = await resolveExecutionRoute(task({ task_class: `${P}.loud`, model_tier: "L1" }));
    expect(own.rule.id).toBe(hijack);
  });

  it("inside a department: its class row leads, and its own tier row still beats a department-less class row (B43)", async () => {
    // a department with no department rows of its own, and one of its employees whose brain keeps L2 at L2
    const seat = await sql<{ id: string; dept: string }>`
      SELECT a.id, d.id AS dept FROM agents a JOIN departments d ON d.slug = a.department
       WHERE a.brain = 'claude-sonnet-5' AND a.employment_status <> 'archived'
         AND NOT EXISTS (SELECT 1 FROM routing_rules r WHERE r.department_id = d.id)
       LIMIT 1
    `.execute(getDb());
    expect(seat.rows[0], "an L2 employee in a department without rows of its own").toBeDefined();
    const { id: agent, dept } = seat.rows[0];
    const deptRow = async (taskClass: string) => {
      const r = await sql<{ id: string }>`
        INSERT INTO routing_rules (task_class, match, model_tier, model, model_id, mode, effort, priority, enabled, department_id)
        VALUES (${taskClass}, '{}', 'L2', 'claude-sonnet-5', 'claude-sonnet-5', 'subscription', 'high', -100, true, ${dept}::uuid)
        RETURNING id
      `.execute(getDb());
      ids.push(r.rows[0].id);
      return r.rows[0].id;
    };
    const deptClass = await deptRow(`${P}.deptclass`);
    const globalClass = await rule({ task_class: `${P}.global`, model_tier: "L2", model: "claude-sonnet-5", effort: "medium", priority: -100 });
    // (1) the department's row of the task's class
    expect((await resolveExecutionRoute(task({ task_class: `${P}.deptclass`, model_tier: "L2", agent_id: agent }))).rule.id).toBe(deptClass);
    // (2) beats (3): the department's own tier row takes the department's work of every class
    const deptTier = await deptRow(`${P}.depttier`);
    const r = await resolveExecutionRoute(task({ task_class: `${P}.global`, model_tier: "L2", agent_id: agent }));
    expect([deptClass, deptTier]).toContain(r.rule.id);
    expect(r.rule.id).not.toBe(globalClass);
    // (3) an employee outside that department gets the department-less class row
    expect((await resolveExecutionRoute(task({ task_class: `${P}.global`, model_tier: "L2" }))).rule.id).toBe(globalClass);
  });
});
