// B39 — THE TWO BRAKES THE DISPATCH LINE NEVER HAD.
//
// THE QUESTION THE CEO ASKED, 2026-08-25: "NEDEN 1 İŞÇİ TÜM ŞİRKETİN 214 AJANIN
// GÖREVİNİ ÜSTLENMİŞ ARKADAŞIM. HERKES KENDİ İŞİNİ YAPMALI DEĞİL Mİ?" — and
// then whether the single line was a leftover of the old 8 GB rented box.
//
// The answer to the question as asked is no: `claimed_by` is the company's own
// dispatcher and `agent_id` is 199 different employees. But the measurement it
// forced found two things that make MULTIPLYING that line unsafe, and this file
// is what makes both of them impossible to un-fix silently.
//
// ⚠ THE EMPTY COST BOOK IS NOT A DEFECT — the CEO corrected this framing the
// same day: "tabiki çalışmayan şirkette masraf defteri 0 olur … ŞİRKET HENÜZ
// KURULMADI." The holding is still being BUILT and the earning machine is off by
// his own decision, so zero cost rows is the expected state. What these cases
// pin is the missing WRITER and the missing CEILING — the two things that would
// still be missing on the day the company starts trading.
//
// MEASURED IN THE COMPANY'S OWN DATABASE, 2026-08-25 (SELECT only) — and these
// are CONSTRUCTION-ERA figures, building the factory, not the holding trading:
//   agent_runs   378 runs · 1,032,526 tokens · SUM(cost_eur) = 0
//   cost_ledger  0 rows (expected)
//   settings_registry  112 keys, `employee.max_concurrent_runs` not among them
//
// H1 — the main working path spends where no brake can see. Anthropic models
//      bypass the LiteLLM proxy (CEO order 2026-07-19, C2), and both money
//      brakes read cost_ledger + that proxy's spend tables.
// H2 — no per-employee ceiling. `assignEmployee` only PREFERRED an idle
//      employee, so two lines could stack two jobs on one person.
//
// These cases are about the BRAKES, not about throughput: a second line is a
// decision for the measurement in scripts/bench/drain-throughput.mjs to inform.
// Suite deletes only what it creates (E9.3 rule) — marker department `b39t`.
import { afterAll, afterEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "kysely";
import { closeDb, getDb } from "@dxb/shared";
import { drainTasks } from "../../packages/orchestrator/src/worker-loop.js";
import { dispatchLanes } from "../../packages/outbox-executor/src/scheduler.js";
import {
  checkSubscriptionWindow,
  recordSubscriptionSpend,
  SUBSCRIPTION_CAP_KEY,
  SUBSCRIPTION_SPEND_SOURCE,
} from "../../packages/orchestrator/src/subscription-cap.js";
import type { Executor } from "../../packages/orchestrator/src/worker-shim.js";
import { pinHookOff, sweepByDepartment } from "../helpers/suite-scope.js";

const db = () => getDb();
const REPO_ROOT = join(import.meta.dirname, "..", "..");
const M = "b39t";
const WORKER = `${M}-resident`;
const CAP_KEY = "employee.max_concurrent_runs";

pinHookOff(db);

let seq = 0;

async function makeTask(department: string, status = "queued"): Promise<string> {
  seq += 1;
  const row = await db()
    .insertInto("tasks")
    .values({
      department,
      objective: `${M} brake probe ${seq}`,
      output_contract: "one line of probe text",
      model_tier: "L4",
      approval_class: "none",
      budget_max_tokens: 1000,
      priority: 5,
      status,
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  return row.id;
}

/** agents.department is a foreign key: a person needs a department to belong to. */
async function makeDepartment(slug: string): Promise<void> {
  await sql`
    INSERT INTO departments (slug, display_name, display_name_tr, status)
    VALUES (${slug}, ${`B39 probe ${slug}`}, ${`B39 deneme ${slug}`}, 'active')
    ON CONFLICT (slug) DO NOTHING`.execute(db());
}

// An employee is born dormant, is given a persona, and only then activates —
// the company refuses any other order (trg_agents_activation_gate: "activation
// denied: agent has no persona"). The fixture obeys the real gate rather than
// working around it, because a fixture that bypasses a rule proves nothing
// about the system that enforces it.
async function makeEmployee(department: string, slug: string): Promise<string> {
  const row = await db()
    .insertInto("agents")
    .values({
      slug,
      department,
      role: "specialist",
      role_level: "specialist",
      persona_path: `personas/${slug}.md`,
      mcp_profile: "inherit",
      employment_status: "dormant",
      status: "dormant",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();

  const persona = await sql<{ id: string }>`
    INSERT INTO personas (employee_id, version, author, body_md, quality_gate)
    VALUES (${row.id}::uuid, 1, 'hr-factory', ${`# PERSONA — ${slug}\n\n## 1. Role\nProbe specialist.`}, 'passed')
    RETURNING id`.execute(db());

  await sql`UPDATE agents
     SET persona_id = ${persona.rows[0].id}::uuid, employment_status = 'active', status = 'active'
     WHERE id = ${row.id}::uuid`.execute(db());
  return row.id;
}

/** An employee who is already working — the state a ceiling is about. */
async function openRun(employeeId: string): Promise<string> {
  const row = await sql<{ id: string }>`
    INSERT INTO agent_runs (employee_id, status) VALUES (${employeeId}::uuid, 'running')
    RETURNING id`.execute(db());
  return row.rows[0].id;
}

async function setSetting(key: string, value: string): Promise<void> {
  await sql`
    INSERT INTO settings_values (key, scope, value, updated_by)
    VALUES (${key}, 'global', ${value}::jsonb, ${M})
    ON CONFLICT (key, scope) DO UPDATE SET value = EXCLUDED.value`.execute(db());
}

async function taskRow(id: string): Promise<{ status: string; claimed_by: string | null; agent_id: string | null }> {
  const r = await sql<{ status: string; claimed_by: string | null; agent_id: string | null }>`
    SELECT status, claimed_by, agent_id FROM tasks WHERE id = ${id}::uuid`.execute(db());
  return r.rows[0];
}

const okExecutor: Executor = async () => ({
  result: { text: "probe deliverable" },
  confidence: 0.92,
});

// TEST HYGIENE, on his auditor's note, 2026-08-26. One case pins
// `orchestration.dispatch_lanes` to 2 so its answer does not depend on how much
// work happens to be queued. When that case is deliberately failed — which is
// how the two scheduler predicates are proven necessary — its own restore line
// never runs, the dial stays at 2, and the NEXT case fails as well. A mutation
// must produce exactly one red, or the evidence stops being readable. So the
// dial goes back after EVERY case, not after the file.
afterEach(async () => {
  await setSetting("orchestration.dispatch_lanes", "0");
});

afterAll(async () => {
  await sweepByDepartment(db(), M);
  await sql`DELETE FROM agent_runs WHERE employee_id IN
    (SELECT id FROM agents WHERE department LIKE ${`${M}%`})`.execute(db());
  await sql`DELETE FROM cost_ledger WHERE department LIKE ${`${M}%`}`.execute(db());
  // Order matters and the company enforces it: an ACTIVE employee may not have
  // his persona taken away (trg_agents_activation_gate). He is stood down first —
  // the same sequence a real departure would follow.
  await sql`UPDATE agents SET employment_status = 'dormant', status = 'dormant'
    WHERE department LIKE ${`${M}%`}`.execute(db());
  await sql`UPDATE agents SET persona_id = NULL WHERE department LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM personas WHERE employee_id IN
    (SELECT id FROM agents WHERE department LIKE ${`${M}%`})`.execute(db());
  await sql`DELETE FROM agents WHERE department LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM departments WHERE slug LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM alerts WHERE dedup_key = 'orchestrator:subscription-cap'
    AND resolved_at IS NULL`.execute(db());
  await sql`DELETE FROM decision_log WHERE decision = 'employee-selection'
    AND rationale LIKE ${`%${M}-%`}`.execute(db());
  // The ceilings are the CEO's settings — put both back where the migration left them.
  await setSetting(CAP_KEY, "1");
  await setSetting(SUBSCRIPTION_CAP_KEY, "500000");
  await closeDb();
});

describe("B39 · H1 — the subscription path spends where a brake can see it", () => {
  it("the ceiling is a real setting, and the window reads it", async () => {
    // The whole defect was that this key did not exist. If the migration is ever
    // rolled back, this is the case that says so.
    const reg = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM settings_registry WHERE key = ${SUBSCRIPTION_CAP_KEY}
    `.execute(db());
    expect(reg.rows[0].n, `${SUBSCRIPTION_CAP_KEY} is not registered`).toBe(1);

    await setSetting(SUBSCRIPTION_CAP_KEY, "500000");
    const w = await checkSubscriptionWindow();
    expect(w.cap).toBe(500_000);
    expect(w.open).toBe(true);
  });

  it("the CONSTRUCTION's own session accounting cannot shut the company's line", async () => {
    // Regression, measured 2026-08-25. The window used to sum every
    // mode='subscription' row in the hour. A SessionEnd hook was writing rows
    // with source='hook' — this repository's own coding sessions — and three of
    // them landed carrying 487,924,277 tokens, which shut a 500,000 ceiling for
    // an hour and turned this file red for reasons that had nothing to do with
    // the company. The CEO ended that practice the same evening ("artık
    // yazılmasın") and the hook is gone; this case stays because the rule
    // outlives the hook — only the company's own line governs the company's own
    // line, whoever else writes into the book.
    const department = `${M}-hookrow`;
    const taskId = await makeTask(department);
    await setSetting(SUBSCRIPTION_CAP_KEY, "500000");

    await sql`
      INSERT INTO cost_ledger (task_id, department, model, mode, prompt_tokens,
                               completion_tokens, cost_eur, source)
      VALUES (${taskId}::uuid, ${department}, 'claude-opus-5', 'subscription',
              487924277, 0, 0, 'hook')`.execute(db());

    const w = await checkSubscriptionWindow();
    expect(w.open, "a coding session's own tokens closed the company's line").toBe(true);
    expect(w.tokens, "the window counted rows it does not govern").toBeLessThan(500_000);

    await sql`DELETE FROM cost_ledger WHERE task_id = ${taskId}::uuid`.execute(db());
  });

  it("a subscription run leaves a row a brake can count — with no euro in it", async () => {
    const department = `${M}-spend`;
    const taskId = await makeTask(department);

    await recordSubscriptionSpend({
      taskId,
      agentId: null,
      department,
      model: "opus-5",
      tokensIn: 1_000,
      tokensOut: 2_000,
    });

    const row = await sql<{
      mode: string; source: string; prompt_tokens: number;
      completion_tokens: number; cost_eur: string;
    }>`
      SELECT mode, source, prompt_tokens, completion_tokens, cost_eur
      FROM cost_ledger WHERE task_id = ${taskId}::uuid`.execute(db());

    expect(row.rows.length, "the subscription path wrote no ledger row").toBe(1);
    expect(row.rows[0].mode).toBe("subscription");
    expect(row.rows[0].source).toBe("worker");
    expect(row.rows[0].prompt_tokens).toBe(1_000);
    expect(row.rows[0].completion_tokens).toBe(2_000);
    // The single-source cost rule (litellm.ts LOCKED): tokens yes, euro never.
    expect(Number(row.rows[0].cost_eur)).toBe(0);
  });

  it("crossing the hourly ceiling HOLDS the execution leg — and only that leg", async () => {
    const department = `${M}-held`;
    const held = await makeTask(department, "queued");

    // A review-stage task proves the hold is surgical: grading finished work is
    // pure code, costs nothing, and a full queue is no reason to stop it.
    const reviewing = await makeTask(department, "review");
    await sql`UPDATE tasks SET result = ${JSON.stringify({ text: "done", confidence: 0.9 })}::jsonb
      WHERE id = ${reviewing}::uuid`.execute(db());

    // Fill the hour: one row above the ceiling.
    await setSetting(SUBSCRIPTION_CAP_KEY, "1000");
    await recordSubscriptionSpend({
      taskId: held,
      agentId: null,
      department,
      model: "opus-5",
      tokensIn: 900,
      tokensOut: 900,
    });

    const w = await checkSubscriptionWindow();
    expect(w.open, `window should be shut: ${w.tokens} of ${w.cap}`).toBe(false);

    const res = await drainTasks({
      workerId: WORKER,
      departments: [department],
      execute: okExecutor,
      evaluate: async () => ({ pass: true, confidence: 0.95, notes: "contract met" }),
    });

    expect(res.executed, "the execution leg claimed work with the ceiling full").toBe(0);
    expect((await taskRow(held)).status, "a held task must stay queued").toBe("queued");
    expect(res.reviewed, "review is pure code and must keep running").toBe(1);

    // The CEO is told, once, why his line went quiet.
    const alert = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts
      WHERE dedup_key = 'orchestrator:subscription-cap' AND resolved_at IS NULL`.execute(db());
    expect(alert.rows[0].n).toBe(1);

    await setSetting(SUBSCRIPTION_CAP_KEY, "500000");
  });

  it("with the ceiling raised again the same queue moves", async () => {
    const department = `${M}-open`;
    const t = await makeTask(department);
    await setSetting(SUBSCRIPTION_CAP_KEY, "500000");

    const res = await drainTasks({
      workerId: WORKER,
      departments: [department],
      execute: okExecutor,
      reviewCap: 0,
    });

    expect(res.executed).toBe(1);
    expect((await taskRow(t)).status).toBe("review");
  });
});

describe("B39 · the decision — the company works out its own hands, the CEO sets no dial", () => {
  it("the REAL lane decision ignores spending that is not the company's own — both halves of it", async () => {
    // AUDIT FINDING, 2026-08-25: the case below this one holds a COPY of the
    // scheduler's query and tests the copy. A predicate could be deleted in
    // packages/outbox-executor/src/scheduler.ts and the suite would stay green.
    // This case calls dispatchLanes() itself, and it is built so that removing
    // EITHER `source = ${SUBSCRIPTION_SPEND_SOURCE}` predicate — the one on
    // `spent` or the one on `avg_cost` — fails it on its own:
    //
    //   both present   spent 1,000 · avg 500  → room 4 → lanes 2   (this case)
    //   drop `spent`   spent 1,001,000 > cap  → room 0 → lanes 1   (fails)
    //   drop `avg`     avg 333,666            → room 0 → lanes 1   (fails)
    const department = `${M}-lanes`;
    await sql`DELETE FROM cost_ledger WHERE department LIKE ${`${M}%`}`.execute(db());

    // Pin the count so the answer does not depend on how much work happens to be
    // queued while this runs; the machine ceiling on this bench is 8.
    await setSetting("orchestration.dispatch_lanes", "2");
    await setSetting(SUBSCRIPTION_CAP_KEY, "3000");

    // The company's own two runs: 1,000 spent, 500 a job.
    for (let i = 0; i < 2; i++) {
      const t = await makeTask(department);
      await recordSubscriptionSpend({
        taskId: t, agentId: null, department, model: "opus-5", tokensIn: 250, tokensOut: 250,
      });
    }
    expect(await dispatchLanes(), "a clean book should afford the pinned two hands").toBe(2);

    // Somebody else's million tokens, in the same window and the same book.
    const foreign = await makeTask(department);
    await sql`
      INSERT INTO cost_ledger (task_id, department, model, mode, prompt_tokens,
                               completion_tokens, cost_eur, source)
      VALUES (${foreign}::uuid, ${department}, 'claude-opus-5', 'subscription',
              1000000, 0, 0, 'manual')`.execute(db());

    expect(
      await dispatchLanes(),
      "spending the company did not do collapsed the company's own hands",
    ).toBe(2);

    await sql`DELETE FROM cost_ledger WHERE department LIKE ${`${M}%`}`.execute(db());
  });

  it("the lane count is registered, bounded, and seeded to DECIDE FOR ITSELF", async () => {
    const reg = await sql<{ schema: string }>`
      SELECT value_schema::text AS schema FROM settings_registry
       WHERE key = 'orchestration.dispatch_lanes'`.execute(db());
    expect(reg.rows.length, "orchestration.dispatch_lanes is not registered").toBe(1);
    // The upper bound matters: an unbounded lane count is how one bad row
    // becomes eighty parallel model calls with the CEO asleep.
    expect(reg.rows[0].schema).toContain('"maximum": 8');
    // The LOWER bound is 0, and 0 is not "off" — it is "decide for yourself".
    // The CEO's own correction, 2026-08-25: "bak ben ayar mayar anlamam ki!"
    expect(reg.rows[0].schema).toContain('"minimum": 0');

    const live = await sql<{ n: number }>`
      SELECT fn_setting_numeric('orchestration.dispatch_lanes', 99)::int AS n`.execute(db());
    expect(live.rows[0].n, "the seeded value must be 0 — automatic, not a dial he maintains").toBe(0);
  });

  it("both languages of that setting say the same thing to him", async () => {
    // A CEO surface is 100% one locale, both locales at parity. A settings row
    // whose Turkish half still described a dial would be a lie on his screen.
    const d = await sql<{ en: string; tr: string }>`
      SELECT description_en AS en, description_tr AS tr FROM settings_registry
       WHERE key = 'orchestration.dispatch_lanes'`.execute(db());
    expect(d.rows[0].en).toContain("decides for itself");
    expect(d.rows[0].tr).toContain("kendi karar verir");
    expect(d.rows[0].tr).toContain("dokunması gerekmez");
    expect(d.rows[0].tr).not.toMatch(/\b(lanes|queue|default)\b/);
  });

  // The ceiling is restored even when a case fails. Measured the hard way: an
  // assertion that failed before its own restore line left the brake shut, and
  // every later case in the file died claiming nothing — four red tests, one
  // cause, and the cause was the test file's own hygiene.
  afterEach(async () => {
    await setSetting(SUBSCRIPTION_CAP_KEY, "500000");
    await setSetting(CAP_KEY, "1");
  });

  it("it will not open more hands than the hour's remaining allowance can pay for", async () => {
    // THE GAP THIS CLOSES, found by the perfection gate rather than by a failure:
    // the brake stops the execution leg AFTER the ceiling is crossed. Eight lanes
    // opened against a nearly-spent hour would each claim a job and overshoot
    // before the next tick could refuse — so the room left in the hour bounds the
    // lane count too, using what this company's own runs have actually cost.
    const department = `${M}-room`;
    await makeDepartment(department);

    // ISOLATION, and the lack of it is what this suite paid for twice. First: the
    // earlier cases in this file leave real spend rows behind. Second, and worse:
    // the construction engine carries 13 SEEDED rows of 83 million tokens each,
    // and averaging all history against them said a single job costs 83M — the
    // line would have throttled itself to one lane for ever on evidence from
    // another era. Both the code and this case now measure the SAME 60-minute
    // window the ceiling governs. Only this suite's own rows are cleared (E9.3).
    await sql`DELETE FROM cost_ledger WHERE department LIKE ${`${M}%`}`.execute(db());

    // Two finished runs establish the average cost of a job: 1000 units each.
    for (let i = 0; i < 2; i++) {
      const t = await makeTask(department);
      await recordSubscriptionSpend({
        taskId: t, agentId: null, department, model: "opus-5", tokensIn: 500, tokensOut: 500,
      });
    }

    // Ceiling 3000, spent 2000 → 1000 left → room for exactly one more job.
    await setSetting(SUBSCRIPTION_CAP_KEY, "3000");
    const room = await sql<{ room: number }>`
      SELECT (SELECT CASE
                WHEN avg_cost IS NULL OR avg_cost <= 0 THEN 8
                ELSE GREATEST(FLOOR(GREATEST(cap - spent, 0) / avg_cost), 0)
              END
         FROM (
           SELECT fn_setting_numeric('orchestrator.subscription_tokens_per_hour', 500000) AS cap,
                  COALESCE((SELECT SUM(prompt_tokens + completion_tokens) FROM cost_ledger
                             WHERE mode = 'subscription'
                               AND source = ${SUBSCRIPTION_SPEND_SOURCE}
                               AND created_at > now() - interval '60 minutes'), 0)        AS spent,
                  (SELECT AVG(prompt_tokens + completion_tokens) FROM cost_ledger
                    WHERE mode = 'subscription'
                      AND source = ${SUBSCRIPTION_SPEND_SOURCE}
                      AND created_at > now() - interval '60 minutes')                     AS avg_cost
         ) b)::int AS room`.execute(db());
    expect(room.rows[0].room, "one job's worth of allowance is left, so one hand").toBe(1);

    // Spend the rest: no room at all — and the answer is 0, not a negative number
    // and not a fallback that quietly lets eight hands through.
    const t = await makeTask(department);
    await recordSubscriptionSpend({
      taskId: t, agentId: null, department, model: "opus-5", tokensIn: 600, tokensOut: 600,
    });
    const none = await sql<{ room: number }>`
      SELECT (SELECT CASE
                WHEN avg_cost IS NULL OR avg_cost <= 0 THEN 8
                ELSE GREATEST(FLOOR(GREATEST(cap - spent, 0) / avg_cost), 0)
              END
         FROM (
           SELECT fn_setting_numeric('orchestrator.subscription_tokens_per_hour', 500000) AS cap,
                  COALESCE((SELECT SUM(prompt_tokens + completion_tokens) FROM cost_ledger
                             WHERE mode = 'subscription'
                               AND source = ${SUBSCRIPTION_SPEND_SOURCE}
                               AND created_at > now() - interval '60 minutes'), 0)        AS spent,
                  (SELECT AVG(prompt_tokens + completion_tokens) FROM cost_ledger
                    WHERE mode = 'subscription'
                      AND source = ${SUBSCRIPTION_SPEND_SOURCE}
                      AND created_at > now() - interval '60 minutes')                     AS avg_cost
         ) b)::int AS room`.execute(db());
    expect(none.rows[0].room, "a spent hour buys no extra hands").toBe(0);
  });

  it("the scheduler decides from the QUEUE, the MACHINE and the HOUR — not from a number he types", async () => {
    // A source scan, deliberately: the alternative is booting pg-boss inside the
    // suite, and what must never silently regress is the WIRING — a future edit
    // that went back to a bare drainTasks() would restore the single line, and
    // one that went back to a fixed setting would hand him the dial again.
    const src = await readFile(
      join(REPO_ROOT, "packages/outbox-executor/src/scheduler.ts"), "utf8");
    expect(src).toContain("orchestration.dispatch_lanes");
    expect(src).toMatch(/const lanes = await dispatchLanes\(\)/);
    // It counts the work that still needs a hand — waiting, in a resident hand, at the
    // gate, on the ladder (B43 plan ②, 2026-09-05: the queue-only count let the lanes
    // stand down while five reviewers ran and four reviews waited for one lane's QA)…
    expect(src).toMatch(/FROM tasks t\s+WHERE t\.status IN \('queued', 'review'\)/);
    expect(src).toMatch(/t\.status IN \('claimed', 'running'\) AND t\.claimed_by LIKE/);
    // …it asks the machine what it can carry, leaving room for the database…
    expect(src).toMatch(/cpus\(\)\.length - 2/);
    // …and it will not open hands the hour cannot pay for.
    expect(src).toContain("orchestrator.subscription_tokens_per_hour");
    expect(src).toMatch(/budgetBound/);
    // Lane 1 keeps the historical identity, or every record that reads
    // claimed_by = 'resident-worker' changes meaning on a single-lane install.
    expect(src).toContain("RESIDENT_WORKER_ID");
    // And the decision is SAID OUT LOUD when it changes. A number that moves
    // itself and is visible nowhere is not an alive system (V2's first law);
    // a line every ten seconds is noise, so it speaks only on a change.
    expect(src).toMatch(/the company is working with \$\{lanes\} hand/);
    expect(src).toMatch(/if \(lanes !== lastLanes\)/);
  });
});

describe("B39 · H2 — one employee, one job", () => {
  it("an employee already at the ceiling is not handed a second task", async () => {
    const department = `${M}-busy`;
    await makeDepartment(department);
    const employee = await makeEmployee(department, `${M}-busy-one`);
    await openRun(employee); // he is working
    await setSetting(CAP_KEY, "1");

    const t = await makeTask(department);
    const res = await drainTasks({
      workerId: WORKER,
      departments: [department],
      execute: okExecutor,
      reviewCap: 0,
    });

    expect(res.executed, "a busy employee was given a second job").toBe(0);
    const row = await taskRow(t);
    // Busy is not broken: the task goes back exactly as it was found.
    expect(row.status).toBe("queued");
    expect(row.claimed_by).toBeNull();
    expect(row.agent_id).toBeNull();

    // decision_log carries no task_id (the column does not exist — measured); the
    // department marker is unique to this case, so the rationale is found by it.
    const why = await sql<{ rationale: string }>`
      SELECT rationale FROM decision_log
      WHERE decision = 'employee-selection' AND rationale LIKE ${`%${department}%`}
      ORDER BY created_at DESC LIMIT 1`.execute(db());
    expect(why.rows[0]?.rationale).toContain("concurrency ceiling");
  });

  it("raising the ceiling lets the same employee take the same task", async () => {
    const department = `${M}-raised`;
    await makeDepartment(department);
    const employee = await makeEmployee(department, `${M}-raised-one`);
    await openRun(employee);
    await setSetting(CAP_KEY, "2");

    const t = await makeTask(department);
    const res = await drainTasks({
      workerId: WORKER,
      departments: [department],
      execute: okExecutor,
      reviewCap: 0,
    });

    expect(res.executed).toBe(1);
    expect((await taskRow(t)).agent_id).toBe(employee);
    await setSetting(CAP_KEY, "1");
  });

  it("an idle colleague is chosen over the busy one — nobody waits for a person", async () => {
    const department = `${M}-pair`;
    await makeDepartment(department);
    const busy = await makeEmployee(department, `${M}-pair-busy`);
    const idle = await makeEmployee(department, `${M}-pair-idle`);
    await openRun(busy);
    await setSetting(CAP_KEY, "1");

    const t = await makeTask(department);
    const res = await drainTasks({
      workerId: WORKER,
      departments: [department],
      execute: okExecutor,
      reviewCap: 0,
    });

    expect(res.executed).toBe(1);
    expect((await taskRow(t)).agent_id, "the idle colleague should have taken it").toBe(idle);
  });

  it("losing the race on the hand-back costs the tick nothing", async () => {
    // Two lanes can hit the same full department in the same instant, and the
    // lease reaper can requeue a row underneath either of them. The hand-back is
    // a guarded move, so exactly one of them wins it — and the loser must NOT
    // take the whole drain down with it, because that would cost every other
    // lane its work in the same tick over an outcome that costs nothing.
    const department = `${M}-race`;
    await makeDepartment(department);
    const employee = await makeEmployee(department, `${M}-race-one`);
    await openRun(employee); // the only person here is working
    await setSetting(CAP_KEY, "1");

    const t = await makeTask(department);

    // Two lanes drain the same department at the same moment.
    const [a, b] = await Promise.all([
      drainTasks({ workerId: `${WORKER}-a`, departments: [department], execute: okExecutor, reviewCap: 0 }),
      drainTasks({ workerId: `${WORKER}-b`, departments: [department], execute: okExecutor, reviewCap: 0 }),
    ]);

    // Neither ran anything (the one employee is busy), and neither threw.
    expect(a.executed).toBe(0);
    expect(b.executed).toBe(0);

    // The task is back where it started, claimed by nobody — not lost, not stuck
    // in 'running', and not handed to the person who was already working.
    const row = await taskRow(t);
    expect(row.status).toBe("queued");
    expect(row.claimed_by).toBeNull();
    expect(row.agent_id).toBeNull();
  });

  it("an unstaffed department still fails LOUDLY — busy and empty are not the same", async () => {
    // The distinction this case pins: 'everybody is busy' is a healthy company
    // at full stretch and must never be reported as a missing workforce.
    const department = `${M}-empty`;
    const t = await makeTask(department);

    const res = await drainTasks({
      workerId: WORKER,
      departments: [department],
      execute: okExecutor,
      reviewCap: 0,
    });

    // No employee exists at all: unchanged pre-B39 path — the task is worked
    // agent-less and the pre-gate is what speaks about it.
    expect(res.executed).toBe(1);
    const row = await taskRow(t);
    expect(row.agent_id).toBeNull();

    const why = await sql<{ rationale: string }>`
      SELECT rationale FROM decision_log
      WHERE decision = 'employee-selection' AND rationale LIKE ${`%${department}%`}
      ORDER BY created_at DESC LIMIT 1`.execute(db());
    expect(why.rows[0]?.rationale).toContain("no active employee");
  });
});
