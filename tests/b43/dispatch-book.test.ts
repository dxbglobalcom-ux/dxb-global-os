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
// The clock (CEO 2026-09-13, budget-per-job-zero-idle-plan-approved):
//   9. pure: a seat's deadline is its budget on top of the latest deadline it waits for;
//      unbudgeted seats get none and add nothing; the sheet's budget is the longest chain
//  10. pure: the times table on a FIXED book — DXB-V-EYW-005's own timestamps (planning 3:31,
//      engine 625.3 s, total 22:45.4, non-engine 740.1 s, ratio 1.18) — and its lines
//  11. on the engine: budget_minutes → due_at along the chain, an unbudgeted seat keeps the
//      column's default, the created event and the decision carry the budget
//  12. on the engine: queue_sheet_times reads a sheet back from the book — events and one
//      media job written by hand — and names the seat over its budget
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
  mmss,
  sheetDeadlines,
  sheetLevels,
  sheetTimes,
  type BookEvent,
  type BookJob,
  type SheetRecord,
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
  await sql`DELETE FROM media_jobs WHERE note LIKE ${M + "%"}`.execute(db()).catch(() => {});
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

// ---------------------------------------------------------------------------------------
// THE CLOCK (CEO 2026-09-13)
// ---------------------------------------------------------------------------------------

/** DXB-V-EYW-005's book as it stands in the company's task_events / media_jobs (2026-09-05). */
function eyw005Book(): { record: SheetRecord; born: Date; events: BookEvent[]; jobs: BookJob[] } {
  const T = (s: string) => new Date(`2026-09-05T${s}Z`);
  const author = "author-005";
  const ids = ["engineer", "qc", "identity", "product", "continuity", "sound", "verdict"].map((x) => `t-${x}`);
  const seats = ["media-ai-video-engineer", "media-delivery-qc", "media-character-identity", "media-product-brand-consistency", "media-continuity", "media-sound-music", "media-creative-director"];
  const deps = [[], [0], [0], [0], [0], [0], [1, 2, 3, 4, 5]];
  const budgets = [12, 3, 3, 3, 3, 3, 4];
  const record: SheetRecord = {
    code: "DXB-V-EYW-005",
    author_task_id: author,
    project_id: null,
    tasks: ids.map((id, i) => ({ index: i, seat: seats[i], task_id: id, depends_on: deps[i].map((d) => ids[d]), level: i === 0 ? 0 : i === 6 ? 2 : 1, label: seats[i], budget_minutes: budgets[i], due_at: null })),
    levels: [[0], [1, 2, 3, 4, 5], [6]],
    budget_minutes_total: 19,
    budgeted: "all",
  };
  const ev = (task_id: string, event: string, from: string | null, to: string | null, at: string, payload: Record<string, unknown> = {}): BookEvent => ({ task_id, event, from_status: from, to_status: to, created_at: T(at), payload });
  const born = T("00:40:25.453");
  const events: BookEvent[] = [
    ev(author, "claimed", "queued", "claimed", "00:36:54.700"),
    ev(author, "transition", "claimed", "running", "00:36:54.704"),
    ev(author, "transition", "running", "review", "00:41:29.819"),
    ev(author, "transition", "review", "done", "00:41:46.041", { qa: "pass" }),
    // the engineer: claimed 17 ms after the sheet was born, the take on the card, answer + gate
    ev(ids[0], "claimed", "queued", "claimed", "00:40:25.470"),
    ev(ids[0], "transition", "claimed", "running", "00:40:25.474"),
    ev(ids[0], "transition", "running", "review", "00:52:18.511", { confidence: 0.93 }),
    ev(ids[0], "transition", "review", "done", "00:52:48.064", { qa: "pass", judge_ms: 29553 }),
    // five reviewers, claimed within 8 s of the engineer's done
    ev(ids[5], "claimed", "queued", "claimed", "00:52:48.067"),
    ev(ids[4], "claimed", "queued", "claimed", "00:52:48.071"),
    ev(ids[2], "claimed", "queued", "claimed", "00:52:55.448"),
    ev(ids[1], "claimed", "queued", "claimed", "00:52:55.492"),
    ev(ids[3], "claimed", "queued", "claimed", "00:52:55.615"),
    ev(ids[5], "transition", "review", "done", "00:54:52.403", { qa: "pass", judge_ms: 3563 }),
    ev(ids[4], "transition", "review", "done", "00:54:54.410", { qa: "pass", judge_ms: 23322 }),
    ev(ids[2], "transition", "review", "done", "00:55:05.667", { qa: "pass", judge_ms: 16826 }),
    ev(ids[3], "transition", "review", "done", "00:55:47.239", { qa: "pass", judge_ms: 27256 }),
    ev(ids[1], "transition", "review", "done", "00:55:47.436", { qa: "pass", judge_ms: 24406 }),
    // the verdict: claimed 1 ms after the fifth done
    ev(ids[6], "claimed", "queued", "claimed", "00:55:47.437"),
    ev(ids[6], "transition", "running", "review", "00:59:10.866", { confidence: 0.88 }),
    ev(ids[6], "transition", "review", "done", "00:59:40.068", { qa: "pass", judge_ms: 29201 }),
  ];
  const jobs: BookJob[] = [
    { task_id: ids[0], kind: "shoot", status: "done", created_at: T("00:40:43.379"), started_at: T("00:40:49.052"), ended_at: T("00:51:14.317"), wall_seconds: 625.3 },
  ];
  return { record, born, events, jobs };
}

describe("B43 · the clock — pure", () => {
  it("a seat's deadline is its budget on top of the latest deadline it waits for; the sheet's is the longest chain", () => {
    const seats = sevenSeatSheet().map((s, i) => ({ ...s, budget_minutes: [12, 3, 3, 3, 3, 3, 4][i] }));
    const d = sheetDeadlines(seats);
    expect(d.due_offset_minutes).toEqual([12, 15, 15, 15, 15, 15, 19]);
    expect(d.budget_minutes_total).toBe(19);
    expect(d.budgeted).toBe("all");
  });

  it("an unbudgeted seat gets no deadline and adds nothing to the chain; the record says 'some' or 'none'", () => {
    const some = sheetDeadlines([{ deps: [], budget_minutes: 12 }, { deps: [0] }, { deps: [1], budget_minutes: 4 }]);
    expect(some.due_offset_minutes).toEqual([12, null, 16]);
    expect(some.budget_minutes_total).toBe(16);
    expect(some.budgeted).toBe("some");
    const none = sheetDeadlines([{ deps: [] }, { deps: [0] }]);
    expect(none.due_offset_minutes).toEqual([null, null]);
    expect(none.budget_minutes_total).toBe(0);
    expect(none.budgeted).toBe("none");
    expect(sheetDeadlines([])).toEqual({ due_offset_minutes: [], budget_minutes_total: 0, budgeted: "none" });
  });

  it("the times table on DXB-V-EYW-005's own book reproduces the measured figures: planning 3:31, engine 625.3 s, total 22:45.4, ratio 1.18", () => {
    const { record, born, events, jobs } = eyw005Book();
    const t = sheetTimes({ record, sheet_born_at: born, events, jobs, now: new Date("2026-09-05T01:00:00Z") });
    expect(t.status).toBe("done");
    expect(t.planning_s).toBeCloseTo(210.8, 1);
    expect(t.total_s).toBeCloseTo(1365.4, 1);
    expect(t.engine_s).toBeCloseTo(625.3, 1);
    expect(t.non_engine_s).toBeCloseTo(740.1, 1);
    expect(t.ratio_non_engine_to_engine).toBe(1.18);
    expect(t.budget_minutes_total).toBe(19);
    expect(t.budgeted).toBe("all");
    expect(t.judge_ms_total).toBe(29553 + 3563 + 23322 + 16826 + 27256 + 24406 + 29201);
    // idle: the engineer 0.0 s, the reviewers 0.0 · 0.0 · 7.4 · 7.4 · 7.6, the verdict 0.0, the job's pick-up 5.7
    const eng = t.seats[0];
    expect(eng.idle_before_claim_s).toBeCloseTo(0, 1);
    expect(eng.actual_s).toBeCloseTo(742.6, 1);
    expect(eng.engine_s).toBe(625.3);
    expect(eng.job_pickup_s).toBeCloseTo(5.7, 1);
    expect(eng.judge_ms).toBe(29553);
    expect(eng.over_budget).toBe(true); // 742.6 s against 12 min: the book asks why (22.6 s over), it fails nothing
    expect(eng.over_budget_s).toBeCloseTo(22.6, 1);
    expect(t.seats[1].idle_before_claim_s).toBeCloseTo(7.4, 1); // qc claimed 7.4 s after the engineer's done
    expect(t.seats[5].idle_before_claim_s).toBeCloseTo(0, 1); // sound, at once
    expect(t.seats[6].idle_before_claim_s).toBeCloseTo(0, 1); // the verdict, 1 ms after the fifth review
    expect(t.seats[6].ready_at).toBe(new Date("2026-09-05T00:55:47.436Z").toISOString());
    expect(t.idle_s).toBeCloseTo(0.0 + 7.4 + 7.4 + 7.6 + 5.7, 0);
    expect(t.seats_over_budget).toEqual(["media-ai-video-engineer"]);
    expect(t.lines).toHaveLength(8);
    expect(t.lines[0]).toMatch(/^SHEET DXB-V-EYW-005: done · total 22:45 · engine 10:25 · non-engine 12:20 · ratio 1\.18 · idle 0:28 · judge 154\.1 s · planning 3:31 · budget 19 min on the longest chain \(all\)$/);
    expect(t.lines[1]).toContain("L0 media-ai-video-engineer: done · budget 12 min · idle 0.0 s · actual 12:23 · judge 29.6 s · engine 10:25 (1 job, pick-up 5.7 s) — OVER BUDGET by 0:23: write why");
    expect(t.lines[7]).toContain("L2 media-creative-director: done · budget 4 min · idle 0.0 s · actual 3:53 · judge 29.2 s · engine 0:00 — within budget (0:07 to spare)");
  });

  it("a sheet in flight measures to now, a seat not yet claimed is 'waiting' with no idle figure, and a book without budgets is read as unbudgeted", () => {
    const { record, born, events, jobs } = eyw005Book();
    const cut = events.filter((e) => e.created_at.getTime() <= new Date("2026-09-05T00:53:00Z").getTime());
    const bare: SheetRecord = { ...record, tasks: record.tasks.map((t) => ({ ...t, budget_minutes: undefined, due_at: undefined })), budget_minutes_total: undefined, budgeted: undefined };
    const t = sheetTimes({ record: bare, sheet_born_at: born, events: cut, jobs, now: new Date("2026-09-05T00:53:00Z") });
    expect(t.status).toBe("in_flight");
    expect(t.ended_at).toBeNull();
    expect(t.total_s).toBeCloseTo(965.3, 1); // 00:36:54.700 → 00:53:00
    expect(t.budgeted).toBe("none");
    expect(t.budget_minutes_total).toBe(0);
    expect(t.seats[0].status).toBe("done");
    expect(t.seats[1].status).toBe("in_flight");
    expect(t.seats[1].actual_s).toBeCloseTo(4.5, 1); // claimed 00:52:55.492 → now
    expect(t.seats[6].status).toBe("waiting");
    expect(t.seats[6].ready_at).toBeNull(); // its five upstream seats are not done
    expect(t.seats[6].idle_before_claim_s).toBeNull();
    expect(t.seats[0].over_budget_s).toBeNull();
    expect(t.seats_over_budget).toEqual([]);
    expect(t.lines[0]).toContain("in flight");
    expect(t.lines[0]).toContain("unbudgeted sheet");
    expect(mmss(null)).toBe("—");
    expect(mmss(1365.4)).toBe("22:45");
  });
});

describe("B43 · the clock — on the construction engine", () => {
  it("budget_minutes → due_at along the chain; an unbudgeted seat keeps the column's default; the event and the decision carry the budget", async () => {
    const author = await authorTask();
    const seats = sevenSeatSheet().map((s, i) => ({ ...s, budget_minutes: [12, 3, 3, 3, 3, 3, 4][i] }));
    const r = await call("queue_dispatch", { task_id: author, code: `${M}-CLOCK`, seats });
    expect(r.budget_minutes_total).toBe(19);
    expect(r.budgeted).toBe("all");
    expect(r.tasks.map((t: any) => t.budget_minutes)).toEqual([12, 3, 3, 3, 3, 3, 4]);
    const rows = await sql<{ id: string; minutes: number }>`
      SELECT id, round(extract(epoch FROM (due_at - created_at)) / 60, 2)::float AS minutes
      FROM tasks WHERE parent_task_id = ${author}::uuid`.execute(db());
    const byId = new Map(rows.rows.map((x) => [x.id, x.minutes]));
    expect(r.tasks.map((t: any) => byId.get(t.task_id))).toEqual([12, 15, 15, 15, 15, 15, 19]);
    for (const t of r.tasks) expect(new Date(t.due_at).getTime()).toBeGreaterThan(Date.now() - 60_000);
    const ev = await sql<{ payload: any }>`SELECT payload FROM task_events WHERE task_id = ${r.tasks[6].task_id}::uuid AND event = 'created'`.execute(db());
    const payload = typeof ev.rows[0].payload === "string" ? JSON.parse(ev.rows[0].payload) : ev.rows[0].payload;
    expect(payload.budget_minutes).toBe(4);
    expect(payload.due_offset_minutes).toBe(19);
    const decision = await sql<{ rationale: string }>`SELECT rationale FROM decision_log WHERE decision = 'call_sheet' AND decided_by = ${`${M}-director`} ORDER BY created_at DESC LIMIT 1`.execute(db());
    expect(decision.rows[0]?.rationale).toContain("budget 19 min on the longest chain (all seats budgeted)");

    // a sheet with one unbudgeted seat: that seat keeps the schema's default (7 days), the rest count from the chain
    const author2 = await authorTask();
    const mixed = [{ ...seat("engineer"), budget_minutes: 12 }, seat("qc", [0]), { ...seat("director", [1]), budget_minutes: 4 }];
    const r2 = await call("queue_dispatch", { task_id: author2, code: `${M}-MIXED`, seats: mixed });
    expect(r2.budgeted).toBe("some");
    expect(r2.budget_minutes_total).toBe(16);
    expect(r2.tasks[1].budget_minutes).toBeNull();
    expect(r2.tasks[1].due_at).toBeNull();
    const rows2 = await sql<{ id: string; minutes: number }>`
      SELECT id, round(extract(epoch FROM (due_at - created_at)) / 60, 2)::float AS minutes
      FROM tasks WHERE parent_task_id = ${author2}::uuid`.execute(db());
    const by2 = new Map(rows2.rows.map((x) => [x.id, x.minutes]));
    expect(by2.get(r2.tasks[0].task_id)).toBe(12);
    expect(by2.get(r2.tasks[1].task_id)).toBe(7 * 24 * 60);
    expect(by2.get(r2.tasks[2].task_id)).toBe(16);
    // an unbudgeted sheet is accepted and said so
    const author3 = await authorTask();
    const r3 = await call("queue_dispatch", { task_id: author3, code: `${M}-NOBUDGET`, seats: [seat("engineer"), seat("qc", [0])] });
    expect(r3.budgeted).toBe("none");
    expect(r3.budget_minutes_total).toBe(0);
    const d3 = await sql<{ rationale: string }>`SELECT rationale FROM decision_log WHERE decision = 'call_sheet' AND decided_by = ${`${M}-director`} ORDER BY created_at DESC LIMIT 1`.execute(db());
    expect(d3.rows[0]?.rationale).toContain("unbudgeted sheet");
  });

  it("queue_sheet_times reads a sheet back from the book and names the seat over its budget", async () => {
    const author = await authorTask();
    const seats = [{ ...seat("engineer"), budget_minutes: 12 }, { ...seat("qc", [0]), budget_minutes: 3 }, { ...seat("identity", [0]), budget_minutes: 3 }, { ...seat("director", [1, 2]), budget_minutes: 4 }];
    const r = await call("queue_dispatch", { task_id: author, code: `${M}-TIMES`, seats });
    const ids: string[] = r.tasks.map((t: any) => t.task_id);
    const bornRow = await sql<{ created_at: Date }>`SELECT created_at FROM audit_log WHERE action = 'queue.dispatch' AND task_id = ${author}::uuid`.execute(db());
    const born = new Date(bornRow.rows[0].created_at);
    const at = (s: number) => new Date(born.getTime() + s * 1000);
    const ev = (task_id: string, event: string, from: string, to: string, when: Date, payload: Record<string, unknown> = {}) =>
      db().insertInto("task_events").values({ task_id, event, from_status: from, to_status: to, actor: `${M}-lane`, payload: JSON.stringify(payload), created_at: when }).execute();
    // the author's planning: claimed 211 s before the sheet was born
    await ev(author, "claimed", "queued", "claimed", at(-211));
    // the engineer: claimed 0.5 s after birth, the take on the card, done at 700 s with the judge's 29 s — within 12 min
    await ev(ids[0], "claimed", "queued", "claimed", at(0.5));
    await ev(ids[0], "transition", "review", "done", at(700), { qa: "pass", judge_ms: 29000 });
    await db().insertInto("media_jobs").values({ task_id: ids[0], department: DEPT, kind: "shoot", params: JSON.stringify({}), note: `${M} the take`, status: "done", created_at: at(18), started_at: at(42), ended_at: at(667.3), wall_seconds: 625.3 } as never).execute();
    // qc: claimed 2 s after the engineer's done, 200 s → over its 3 min by 20 s; identity: 150 s, within
    await ev(ids[1], "claimed", "queued", "claimed", at(702));
    await ev(ids[1], "transition", "review", "done", at(902), { qa: "pass", judge_ms: 30000 });
    await ev(ids[2], "claimed", "queued", "claimed", at(702));
    await ev(ids[2], "transition", "review", "done", at(852), { qa: "pass", judge_ms: 20000 });
    // the verdict: claimed at once after the later review, 233 s → within 4 min
    await ev(ids[3], "claimed", "queued", "claimed", at(902));
    await ev(ids[3], "transition", "review", "done", at(1135), { qa: "pass", judge_ms: 28000 });

    const t = await call("queue_sheet_times", { code: `${M}-TIMES`, task_id: author });
    expect(t.status).toBe("done");
    expect(t.planning_s).toBeCloseTo(211, 0);
    expect(t.total_s).toBeCloseTo(1346, 0); // author claimed −211 → verdict done 1135
    expect(t.engine_s).toBe(625.3);
    expect(t.non_engine_s).toBeCloseTo(720.7, 0);
    expect(t.ratio_non_engine_to_engine).toBeCloseTo(1.15, 2);
    expect(t.judge_ms_total).toBe(29000 + 30000 + 20000 + 28000);
    expect(t.seats).toHaveLength(4);
    expect(t.seats[0].idle_before_claim_s).toBeCloseTo(0.5, 1);
    expect(t.seats[0].job_pickup_s).toBeCloseTo(24, 0);
    expect(t.seats[0].over_budget).toBe(false);
    expect(t.seats[1].idle_before_claim_s).toBeCloseTo(2, 0);
    expect(t.seats[1].over_budget).toBe(true);
    expect(t.seats[1].over_budget_s).toBeCloseTo(20, 0);
    expect(t.seats[3].ready_at).toBe(at(902).toISOString());
    expect(t.seats[3].idle_before_claim_s).toBeCloseTo(0, 1);
    expect(t.seats_over_budget).toEqual([`${M}-qc`]);
    expect(t.idle_s).toBeCloseTo(0.5 + 24 + 2 + 2 + 0, 0);
    expect(t.lines[2]).toContain(`L1 ${M}-qc: done · budget 3 min · idle 2.0 s · actual 3:20 · judge 30.0 s · engine 0:00 — OVER BUDGET by 0:20: write why`);
    // without the author's id the latest sheet of that code is read; an unknown code is refused
    const again = await call("queue_sheet_times", { code: `${M}-TIMES` });
    expect(again.author_task_id).toBe(author);
    await expect(call("queue_sheet_times", { code: `${M}-NOWHERE` })).rejects.toThrow(/no sheet/);
  });
});
