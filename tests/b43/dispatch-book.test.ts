// B43 plan ② (CEO 2026-09-05, "plan2 olan sevk defteri"): THE DISPATCH BOOK.
//
// Pure (no engine):
//   1. deps point only at earlier seats; a backward or repeated dependency is refused
//   2. levels: [engineer] → [five reviewers together] → [verdict] — the graph, not a line
//   3. a seat's standing prompt carries its identity line and its persona WHOLE, never the
//      dossier table; SDK isolation is on by default and DXB_WORKER_ISOLATION=0 rolls it back
// On the construction engine (its own cluster, tests/construction-engine.ts):
//   4. queue_dispatch writes one staffed task per seat under the author's project, with
//      depends_on resolved, parent_task_id = the author, labels in both locales, and tells
//      each dependant which tasks to read
//   5. claim_next_task hands out the engineer alone; once it is done, the five reviewers are
//      claimable at once; the verdict only after all five
//   6. a sheet naming an unknown seat, a seat of another department or a backward dependency
//      writes ZERO rows; the same (author, code) twice returns the same sheet
//   7. queue_create_task born staffed and under a project (the brief door)
//   8. measured on the first film (02:22): a seat cannot move a task another hand holds, an
//      employee cannot claim as if it were a lane, and the hands the company needs count the
//      work already in flight, not only the queue
import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { createDxbMcpServer } from "../../packages/dxb-mcp/src/index.js";
import {
  assertForwardDeps,
  groupByLevel,
  inputsParagraph,
  sheetLevels,
} from "../../packages/dxb-mcp/src/dispatch-book.js";
import { composeSeatPrompt } from "../../packages/orchestrator/src/worker-shim.js";
import { workerIsolation } from "../../packages/orchestrator/src/sdk-isolation.js";
import { pinHookOff, sweepByDepartment } from "../helpers/suite-scope.js";
import { dispatchLanes } from "../../packages/outbox-executor/src/scheduler.js";

const db = () => getDb();
const M = `b43d-${randomUUID().slice(0, 6)}`;
const DEPT = `${M}-studio`;
const OTHER = `${M}-other`;
const SEATS = ["director", "engineer", "qc", "identity", "product", "continuity", "sound"] as const;

pinHookOff(db);

let client: Client;
let projectId: string;
const agentIds = new Map<string, string>();
const personaIds: string[] = [];

async function call(name: string, args: Record<string, unknown>): Promise<any> {
  const res = await client.callTool({ name, arguments: args });
  if (res.isError) throw new Error((res.content as Array<{ text: string }>)[0]?.text ?? "tool error");
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

/** an ACTIVE employee: the activation trigger needs a passed persona by a v2 author */
async function makeActiveAgent(slug: string, department: string): Promise<string> {
  const agent = await db()
    .insertInto("agents")
    .values({
      slug,
      department,
      role: slug.endsWith("director") ? "head" : "specialist",
      role_level: slug.endsWith("director") ? "director" : "specialist",
      persona_path: `personas/${slug}.md`,
      mcp_profile: "inherit",
      employment_status: "dormant",
      status: "dormant",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  const persona = await db()
    .insertInto("personas")
    .values({ employee_id: agent.id, version: 1, author: "fable-5", body_md: `${M} fixture persona`, quality_gate: "passed" })
    .returning("id")
    .executeTakeFirstOrThrow();
  personaIds.push(persona.id);
  await db()
    .updateTable("agents")
    .set({ persona_id: persona.id, employment_status: "active" } as never)
    .where("id", "=", agent.id)
    .execute();
  agentIds.set(slug, agent.id);
  return agent.id;
}

async function authorTask(status = "running"): Promise<string> {
  const row = await db()
    .insertInto("tasks")
    .values({
      department: DEPT,
      agent_id: agentIds.get(`${M}-director`)!,
      objective: `${M} the director's plan for the sheet`,
      output_contract: "the sheet written",
      model_tier: "L1",
      approval_class: "none",
      budget_max_tokens: 123_456,
      priority: 7,
      status,
      project_id: projectId,
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

function seat(slug: string, deps: number[] = []) {
  return {
    seat: `${M}-${slug}`,
    objective: `${M} ${slug}: do the ${slug} work of this job, whole`,
    output_contract: `${slug} deliverable as the sheet asks`,
    label: `${slug} · sheet`,
    label_tr: `${slug} · sevk`,
    deps,
  };
}

const sevenSeatSheet = () => [
  seat("engineer"),
  seat("qc", [0]),
  seat("identity", [0]),
  seat("product", [0]),
  seat("continuity", [0]),
  seat("sound", [0]),
  seat("director", [1, 2, 3, 4, 5]),
];

beforeAll(async () => {
  const server = createDxbMcpServer();
  client = new Client({ name: "b43-dispatch-test", version: "0.0.0" });
  const [ct, st] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(st), client.connect(ct)]);
  await sweepByDepartment(db(), M);
  // agents.department is a foreign key to departments(slug): the fixture departments first
  await sql`INSERT INTO departments (slug, display_name, display_name_tr, status)
            VALUES (${DEPT}, ${`${M} studio`}, ${`${M} stüdyo`}, 'active'), (${OTHER}, ${`${M} other`}, ${`${M} diğer`}, 'active')
            ON CONFLICT (slug) DO NOTHING`.execute(db());
  const project = await db()
    .insertInto("projects")
    .values({ slug: `${M}-film`, name: `${M} film`, purpose: `${M} the sheet's project`, status: "active", name_tr: `${M} film`, purpose_tr: `${M} projenin amacı` } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  projectId = project.id;
  for (const s of SEATS) await makeActiveAgent(`${M}-${s}`, DEPT);
  await makeActiveAgent(`${M}-stranger`, OTHER);
});

afterAll(async () => {
  await sql`DELETE FROM decision_log WHERE decided_by LIKE ${M + "%"} OR rationale LIKE ${"%" + M + "%"}`.execute(db()).catch(() => {});
  await sql`DELETE FROM audit_log WHERE payload::text LIKE ${"%" + M + "%"} OR actor LIKE ${M + "%"}`.execute(db()).catch(() => {});
  await sweepByDepartment(db(), M);
  await sql`UPDATE agents SET persona_id = NULL, employment_status = 'dormant' WHERE slug LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM personas WHERE id = ANY(${personaIds}::uuid[])`.execute(db());
  await sql`DELETE FROM agents WHERE slug LIKE ${M + "%"}`.execute(db());
  await sql`DELETE FROM projects WHERE id = ${projectId}::uuid`.execute(db());
  await sql`DELETE FROM departments WHERE slug LIKE ${M + "%"}`.execute(db());
  await client.close();
  await closeDb();
});

describe("B43 plan ② · the dispatch book — pure", () => {
  it("refuses a dependency on a later or the same seat, and a repeated one", () => {
    expect(() => assertForwardDeps([{ deps: [] }, { deps: [0] }])).not.toThrow();
    expect(() => assertForwardDeps([{ deps: [0] }])).toThrow(/EARLIER/);
    expect(() => assertForwardDeps([{ deps: [] }, { deps: [1] }])).toThrow(/EARLIER/);
    expect(() => assertForwardDeps([{ deps: [] }, { deps: [2] }])).toThrow(/EARLIER/);
    expect(() => assertForwardDeps([{ deps: [] }, { deps: [0, 0] }])).toThrow(/twice/);
  });

  it("reads the seven-seat sheet as three levels: engineer → five reviewers together → verdict", () => {
    const levels = sheetLevels(sevenSeatSheet());
    expect(levels).toEqual([0, 1, 1, 1, 1, 1, 2]);
    expect(groupByLevel(levels)).toEqual([[0], [1, 2, 3, 4, 5], [6]]);
  });

  it("tells a dependant which tasks to read, by id and seat", () => {
    const p = inputsParagraph("DXB-V-EYW-004", [{ task_id: "aaaa", seat: "media-ai-video-engineer", label: "the take" }]);
    expect(p).toContain("queue_get");
    expect(p).toContain("task aaaa — media-ai-video-engineer: the take");
  });

  it("a seat's standing prompt carries its identity and the persona WHOLE, never the dossier", () => {
    const body = "# PERSONA — Creative Director\n\n## 1. Role identity\nThe idea before the instrument.\n\n## 12. Discipline DNA\nConstitutional.";
    const p = composeSeatPrompt({ slug: "media-creative-director", department: "media-studio", role_level: "director" }, body);
    expect(p).toContain("You are media-creative-director, director of the media-studio department");
    expect(p).toContain("Your persona (authoritative identity, follow it):");
    expect(p).toContain("## 12. Discipline DNA");
    expect(p).toContain("artifact language");
    expect(p).toContain("approval class");
    expect(p).toContain("ONE task from the company's queue");
    expect(p).not.toContain("DOSSIER");
    // an unwritten persona: identity and laws only, no placeholder block
    const bare = composeSeatPrompt({ slug: "x", department: "y" }, "");
    expect(bare).not.toContain("Your persona");
  });

  it("runs seats in SDK isolation unless DXB_WORKER_ISOLATION=0", () => {
    expect(workerIsolation({ DXB_REPO_ROOT: "/r" } as NodeJS.ProcessEnv)).toEqual({ settingSources: [], cwd: "/r" });
    expect(workerIsolation({ DXB_WORKER_ISOLATION: "0" } as NodeJS.ProcessEnv)).toBeNull();
  });
});

describe("B43 plan ② · the dispatch book — on the construction engine", () => {
  it("writes one staffed task per seat under the author's project, dependencies resolved, dependants told what to read", async () => {
    const author = await authorTask();
    const r = await call("queue_dispatch", { task_id: author, code: `${M}-SHEET`, seats: sevenSeatSheet() });
    expect(r.already_dispatched).toBe(false);
    expect(r.tasks).toHaveLength(7);
    expect(r.levels).toEqual([[0], [1, 2, 3, 4, 5], [6]]);
    const rows = await db()
      .selectFrom("tasks")
      .select(["id", "agent_id", "project_id", "parent_task_id", "depends_on", "objective", "label", "label_tr", "status", "priority", "budget_max_tokens", "model_tier"])
      .where("parent_task_id", "=", author)
      .execute();
    expect(rows).toHaveLength(7);
    const byId = new Map(rows.map((x) => [x.id, x]));
    for (const t of r.tasks) {
      const row = byId.get(t.task_id)!;
      expect(row.agent_id).toBe(agentIds.get(t.seat));
      expect(row.project_id).toBe(projectId);
      expect(row.status).toBe("queued");
      expect(row.priority).toBe(7); // inherited from the author
      expect(row.budget_max_tokens).toBe(123_456);
      expect(row.model_tier).toBe("L1");
      expect(row.label).toBe(`${t.seat.slice(M.length + 1)} · sheet`);
      expect(row.label_tr).toBe(`${t.seat.slice(M.length + 1)} · sevk`);
      expect(row.depends_on).toEqual(t.depends_on);
    }
    const engineerId = r.tasks[0].task_id;
    const qc = byId.get(r.tasks[1].task_id)!;
    expect(qc.depends_on).toEqual([engineerId]);
    expect(qc.objective).toContain(`task ${engineerId} — ${M}-engineer`);
    expect(qc.objective).toContain("queue_get");
    const verdict = byId.get(r.tasks[6].task_id)!;
    expect(verdict.depends_on).toHaveLength(5);
    // the record: one created event per task, the sheet on the author's audit row, the graph in decision_log
    const events = await sql<{ n: number }>`SELECT count(*)::int AS n FROM task_events WHERE task_id = ANY(${r.tasks.map((t: any) => t.task_id)}::uuid[]) AND event = 'created'`.execute(db());
    expect(events.rows[0].n).toBe(7);
    const audit = await sql<{ n: number }>`SELECT count(*)::int AS n FROM audit_log WHERE action = 'queue.dispatch' AND task_id = ${author}::uuid`.execute(db());
    expect(audit.rows[0].n).toBe(1);
    const decision = await sql<{ rationale: string }>`SELECT rationale FROM decision_log WHERE decision = 'call_sheet' AND decided_by = ${`${M}-director`} ORDER BY created_at DESC LIMIT 1`.execute(db());
    expect(decision.rows[0]?.rationale).toContain("7 seat(s) in 3 level(s)");
  });

  it("claim order follows the graph: the engineer alone, then the five reviewers at once, then the verdict", async () => {
    const author = await authorTask();
    const r = await call("queue_dispatch", { task_id: author, code: `${M}-ORDER`, seats: sevenSeatSheet() });
    const ids: string[] = r.tasks.map((t: any) => t.task_id);
    // only this sheet's tasks may be claimable in DEPT: the previous test's rows are moved aside
    await sql`UPDATE tasks SET status = 'done' WHERE department = ${DEPT} AND status = 'queued' AND id <> ALL(${ids}::uuid[])`.execute(db());
    const claim = async () => (await sql<{ id: string }>`SELECT id FROM claim_next_task(${`${M}-lane`}, ${[DEPT]}::text[], 60)`.execute(db())).rows[0]?.id ?? null;
    const first = await claim();
    expect(first).toBe(ids[0]); // the engineer
    expect(await claim()).toBeNull(); // nobody else until the engineer is done
    await sql`UPDATE tasks SET status = 'done' WHERE id = ${ids[0]}::uuid`.execute(db());
    const reviewers = new Set<string>();
    for (let i = 0; i < 5; i++) reviewers.add((await claim())!);
    expect([...reviewers].sort()).toEqual(ids.slice(1, 6).sort()); // all five, in one pass
    expect(await claim()).toBeNull(); // the verdict waits for the five
    await sql`UPDATE tasks SET status = 'done' WHERE id = ANY(${ids.slice(1, 6)}::uuid[])`.execute(db());
    expect(await claim()).toBe(ids[6]);
  });

  it("a sheet with a bad seat, a stranger's seat or a backward dependency writes ZERO rows", async () => {
    const author = await authorTask();
    const before = (await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${author}::uuid`.execute(db())).rows[0].n;
    await expect(call("queue_dispatch", { task_id: author, code: `${M}-BAD1`, seats: [seat("engineer"), { ...seat("qc", [0]), seat: `${M}-nobody` }] })).rejects.toThrow(/not found/);
    await expect(call("queue_dispatch", { task_id: author, code: `${M}-BAD2`, seats: [seat("engineer"), { ...seat("qc", [0]), seat: `${M}-stranger` }] })).rejects.toThrow(/belongs to/);
    await expect(call("queue_dispatch", { task_id: author, code: `${M}-BAD3`, seats: [seat("engineer", [1]), seat("qc")] })).rejects.toThrow(/EARLIER/);
    const after = (await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${author}::uuid`.execute(db())).rows[0].n;
    expect(after).toBe(before);
  });

  it("the same (author, code) twice returns the sheet already born — no second crew", async () => {
    const author = await authorTask();
    const a = await call("queue_dispatch", { task_id: author, code: `${M}-TWICE`, seats: [seat("engineer"), seat("qc", [0])] });
    const b = await call("queue_dispatch", { task_id: author, code: `${M}-TWICE`, seats: [seat("engineer"), seat("qc", [0])] });
    expect(b.already_dispatched).toBe(true);
    expect(b.tasks.map((t: any) => t.task_id)).toEqual(a.tasks.map((t: any) => t.task_id));
    const n = (await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks WHERE parent_task_id = ${author}::uuid`.execute(db())).rows[0].n;
    expect(n).toBe(2);
  });

  it("a closed author task cannot dispatch", async () => {
    const author = await authorTask("done");
    await expect(call("queue_dispatch", { task_id: author, code: `${M}-CLOSED`, seats: [seat("engineer")] })).rejects.toThrow(/closed task/);
  });

  it("a task held by a lane is moved only by that lane; a seat cannot move its own task", async () => {
    const author = await authorTask();
    const r = await call("queue_dispatch", { task_id: author, code: `${M}-HOLD`, seats: [seat("engineer")] });
    const id: string = r.tasks[0].task_id;
    await sql`UPDATE tasks SET status = 'done' WHERE department = ${DEPT} AND status = 'queued' AND id <> ${id}::uuid`.execute(db());
    const claimed = await call("queue_claim", { worker_id: `${M}-lane`, departments: [DEPT] });
    expect(claimed.id).toBe(id);
    await call("queue_transition", { task_id: id, to_status: "running", actor: `${M}-lane` });
    // the seat, from inside its run, tries to deliver by moving the row — refused
    await expect(call("queue_transition", { task_id: id, to_status: "review", actor: `${M}-engineer` })).rejects.toThrow(/held by/);
    expect((await sql<{ status: string }>`SELECT status FROM tasks WHERE id = ${id}::uuid`.execute(db())).rows[0].status).toBe("running");
    // the hand that holds it moves it
    const moved = await call("queue_transition", { task_id: id, to_status: "review", actor: `${M}-lane` });
    expect(moved.status).toBe("review");
  });

  it("an employee is not a lane: queue_claim refuses an employee slug as worker id", async () => {
    await expect(call("queue_claim", { worker_id: `${M}-qc`, departments: [DEPT] })).rejects.toThrow(/not a lane/);
  });

  it("the hands the company needs count every piece of work that still needs one — in flight, at the gate, on the ladder", async () => {
    await sql`UPDATE tasks SET status = 'done' WHERE department = ${DEPT} AND status IN ('queued','claimed','running','review','failed')`.execute(db());
    // the hour's budget bound is another suite's subject (b39) and its rows may still sit in the
    // window: lift the ceiling for this case so only the COUNT is under test, then put it back
    const cap = (await sql<{ v: string | null }>`SELECT value::text AS v FROM settings_values WHERE key = 'orchestrator.subscription_tokens_per_hour' AND scope = 'global'`.execute(db())).rows[0]?.v ?? null;
    await sql`UPDATE settings_values SET value = '100000000'::jsonb WHERE key = 'orchestrator.subscription_tokens_per_hour' AND scope = 'global'`.execute(db());
    // the same predicate the decision uses, measured before the fixtures go in: the decision
    // is max(1, min(work, machine, hour)) — an empty book already gets ONE listening hand
    const baseline = (await sql<{ n: number }>`SELECT count(*)::int AS n FROM tasks t
      WHERE t.status IN ('queued', 'review')
         OR (t.status IN ('claimed', 'running') AND t.claimed_by LIKE 'resident-worker%')
         OR (t.status = 'failed' AND NOT EXISTS (SELECT 1 FROM audit_log a WHERE a.task_id = t.id AND a.action = 'task.blocked'))`.execute(db())).rows[0].n;
    const ids: string[] = [];
    const shapes: Array<{ status: string; claimed_by: string | null }> = [
      { status: "running", claimed_by: "resident-worker-91" }, // held by a resident lane
      { status: "review", claimed_by: "resident-worker-92" }, // waiting for the QA gate
      { status: "failed", claimed_by: null }, // on the ladder
    ];
    for (const [i, sh] of shapes.entries()) {
      const row = await db()
        .insertInto("tasks")
        .values({ department: DEPT, objective: `${M} work still needing a hand ${i} (${sh.status})`, output_contract: "counted by the lane decision", model_tier: "L4", approval_class: "none", budget_max_tokens: 1000, priority: 1, status: sh.status, claimed_by: sh.claimed_by } as never)
        .returning("id")
        .executeTakeFirstOrThrow();
      ids.push(row.id);
    }
    const after = await dispatchLanes();
    await sql`UPDATE tasks SET status = 'done', claimed_by = NULL WHERE id = ANY(${ids}::uuid[])`.execute(db());
    if (cap !== null) await sql`UPDATE settings_values SET value = ${cap}::jsonb WHERE key = 'orchestrator.subscription_tokens_per_hour' AND scope = 'global'`.execute(db());
    expect(after).toBe(Math.max(1, Math.min(8, baseline + 3)));
  });

  it("queue_create_task births a task staffed and under a project — the brief door", async () => {
    const t = await call("queue_create_task", {
      department: DEPT,
      objective: `${M} a brief handed to the director through the door`,
      output_contract: "the sheet written through queue_dispatch",
      model_tier: "L1",
      agent_slug: `${M}-director`,
      project_id: projectId,
      label: "Brief to the director",
      label_tr: "Yönetmene brief",
    });
    expect(t.agent_id).toBe(agentIds.get(`${M}-director`));
    expect(t.project_id).toBe(projectId);
    expect(t.label_tr).toBe("Yönetmene brief");
    await expect(
      call("queue_create_task", { department: DEPT, objective: `${M} a brief to a stranger, refused at the door`, output_contract: "nothing is written", model_tier: "L1", agent_slug: `${M}-stranger` }),
    ).rejects.toThrow(/belongs to/);
  });
});
