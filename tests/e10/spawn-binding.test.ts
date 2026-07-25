import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
// "@dxb/shared" (dist alias) — ONE getDb pool shared with the hook package and
// the orchestrator binding (E10.1 lesson: two module instances silently test
// the wrong pool).
import { closeDb, getDb, createListenClient, EventEnvelope } from "@dxb/shared";
import { currentRunScope } from "@dxb/observability";
import { runWorkerOnce } from "../../packages/orchestrator/src/worker-shim.js";
import { CURRENT_HOOK_VERSION } from "../../packages/orchestrator/src/hook-binding.js";

// E10.2 verification — FABLE_5_HOOK_SPEC §3/§9/§14/§21/§22/§27 + roadmap
// acceptance: spawn → agents.hook_version dolu.
//   1. Compliant spawn: pre-gate PASS → employee stamped (NULL → v1), run born
//      with hook_version, post-gate PASS → run succeeded + hook_result.
//   2. Pre-gate block REJECT → the run is NEVER born, task failed(policy),
//      violation row recorded (§6).
//   3. Evidence-less done → REVISE re-execution rounds (feedback rides the
//      re-run) → exhaustion ESCALATE → run failed, hook_result carries the
//      chain + approval (§19/§7).
//   4. Flag off (§22) → old path flows + 'hook:disabled' attention alert.
//   5. ops:live terminal envelope carries payload.hook_result (§9).
//   6. §21 SQL: zero active employees with NULL hook_version.
// Suite deletes ONLY what it creates (id watermarks; E9.3 incident rule).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const M = "e102t";

let baseViolationId = 0;
let baseDecisionId = 0;
let employeeId: string;
let personaId: string;
let realProjectId: string | null = null;
const probeTaskIds: string[] = [];
const probeRunIds: string[] = [];

async function setHookFlag(on: boolean): Promise<void> {
  await sql`UPDATE settings_values SET value = ${on ? "true" : "false"}::jsonb
     WHERE key = 'hook.enabled' AND scope = 'global'`.execute(db());
}

let seq = 0;
/** One queued task in a suite-unique department (claim isolation). */
async function makeTask(overrides: Record<string, unknown> = {}): Promise<{ id: string; department: string }> {
  seq += 1;
  const department = `${M}-d${seq}`;
  const row = await db()
    .insertInto("tasks")
    .values({
      department,
      objective: `${M} spawn-binding probe ${seq}: verify the dispatch gate`,
      output_contract: "one line of probe text, evidenced",
      model_tier: "L4",
      approval_class: "none",
      budget_max_tokens: 1000,
      priority: 5,
      status: "queued",
      agent_id: employeeId,
      project_id: realProjectId,
      ...overrides,
    } as never)
    .returning(["id", "department"])
    .executeTakeFirstOrThrow();
  probeTaskIds.push(row.id);
  return row;
}

async function runFor(department: string, execute: Parameters<typeof runWorkerOnce>[0]["execute"]) {
  return runWorkerOnce({ workerId: `${M}-worker`, departments: [department], execute });
}

/** The run row a task produced (if any). */
async function runRow(taskId: string) {
  const res = await sql<{
    id: string;
    status: string;
    hook_version: string | null;
    hook_result: Record<string, unknown> | null;
  }>`SELECT id, status, hook_version, hook_result
       FROM agent_runs WHERE task_id = ${taskId}::uuid`.execute(db());
  if (res.rows[0]) probeRunIds.push(res.rows[0].id);
  return res.rows;
}

/** An executor result that PASSES the mechanical post-gate: verification
 *  evidence anchored to a REAL tool_calls row of the live run (std 15
 *  tool_call_proof) + a non-shallow acceptance map (std 2/4/16). */
async function evidencedResult(text: string) {
  const scope = currentRunScope();
  const tc = await db()
    .insertInto("tool_calls")
    .values({ run_id: scope!.runId, tool: `${M}.verify`, ok: true })
    .returning("id")
    .executeTakeFirstOrThrow();
  return {
    result: {
      text,
      evidence: [{ kind: "verification", toolCallId: tc.id, note: "vitest probe assertion ran" }],
      acceptance_map: {
        "one line of probe text": "probe text delivered and checked in the suite assertion",
      },
    },
    confidence: 0.9,
  };
}

beforeAll(async () => {
  const v = await sql<{ mx: number | null }>`SELECT max(id)::int AS mx FROM hook_violations`.execute(db());
  baseViolationId = v.rows[0]?.mx ?? 0;
  const d = await sql<{ mx: number | null }>`SELECT max(id)::int AS mx FROM decision_log`.execute(db());
  baseDecisionId = d.rows[0]?.mx ?? 0;
  const m = await sql<{ project_id: string }>`SELECT project_id FROM project_milestones LIMIT 1`.execute(db());
  realProjectId = m.rows[0]?.project_id ?? null;

  // Crash-residue sweep (2026-07-17 laptop-freeze lesson): a killed session
  // skips afterAll, so a leftover fixture agent breaks the next run on
  // agents_slug_key. Idempotent re-entry, FK-ordered — deletes ONLY this
  // suite's fixture slug (same archive-first idiom as the R2.3 cleanup).
  const stale = await sql<{ id: string; persona_id: string | null }>`
    SELECT id, persona_id FROM agents WHERE slug = ${`${M}-worker-agent`}
  `.execute(db());
  for (const row of stale.rows) {
    await sql`DELETE FROM task_events WHERE task_id IN (SELECT id FROM tasks WHERE agent_id = ${row.id}::uuid)`.execute(db());
    await sql`DELETE FROM tool_calls WHERE run_id IN (SELECT id FROM agent_runs WHERE employee_id = ${row.id}::uuid)`.execute(db());
    await sql`DELETE FROM alerts WHERE run_id IN (SELECT id FROM agent_runs WHERE employee_id = ${row.id}::uuid)`.execute(db());
    await sql`DELETE FROM agent_runs WHERE employee_id = ${row.id}::uuid`.execute(db());
    await sql`DELETE FROM tasks WHERE agent_id = ${row.id}::uuid`.execute(db());
    await sql`UPDATE agents SET persona_id = NULL WHERE id = ${row.id}::uuid`.execute(db());
    if (row.persona_id) {
      await sql`DELETE FROM personas WHERE id = ${row.persona_id}::uuid`.execute(db());
    }
    await sql`DELETE FROM agents WHERE id = ${row.id}::uuid`.execute(db());
  }

  // Fixture employee: real department (agents.department FK), MCP profile set,
  // persona quality-gated 'passed' — hook_version deliberately NULL so the
  // stamp is provable. employment_status 'active' also proves §21 end-state.
  const emp = await db()
    .insertInto("agents")
    .values({
      slug: `${M}-worker-agent`,
      department: "engineering",
      role: "worker",
      role_level: "ops_agent",
      employment_status: "draft", // activation gate: persona first, then active
      mcp_profile: "engineering",
      hook_version: null,
      persona_path: `personas/engineering/${M}-worker-agent.md`,
      persona_version: "v2.0-fable",
      status: "dormant",
    } as never)
    .returning("id")
    .executeTakeFirstOrThrow();
  employeeId = emp.id;
  const p = await db()
    .insertInto("personas")
    .values({
      employee_id: employeeId,
      version: 1,
      author: "fable-5",
      body_md: `${M} fixture persona`,
      quality_gate: "passed",
    })
    .returning("id")
    .executeTakeFirstOrThrow();
  personaId = p.id;
  await db()
    .updateTable("agents")
    .set({ persona_id: personaId, employment_status: "active" } as never)
    .where("id", "=", employeeId)
    .execute();

  await setHookFlag(true); // production state (E10.2 migration flip)
});

afterAll(async () => {
  await setHookFlag(true); // leave the DB in the production state, whatever ran
  await sql`DELETE FROM alerts WHERE dedup_key = 'hook:disabled' AND resolved_at IS NULL`.execute(db());
  await sql`DELETE FROM alerts WHERE source = 'hook' AND at > now() - interval '1 hour'
             AND (run_id = ANY(${probeRunIds}::uuid[]) OR run_id IS NULL)`.execute(db());
  await sql`DELETE FROM approvals WHERE action_type = 'hook_escalation'
             AND created_at > now() - interval '1 hour'`.execute(db());
  await sql`DELETE FROM hook_violations WHERE id > ${baseViolationId}`.execute(db());
  await sql`DELETE FROM decision_log WHERE id > ${baseDecisionId}
             AND decision IN ('hook_reject', 'hook_escalation')`.execute(db());
  // The worker leg also writes run-less employee-selection rows under the
  // fixture worker name — outside the decision-kind filter above (2026-07-25
  // residue triage). decided_by is fixture-unique, so no watermark needed.
  await sql`DELETE FROM decision_log WHERE decided_by = 'e102t-worker'`.execute(db());
  if (probeRunIds.length > 0) {
    await sql`DELETE FROM tool_calls WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM alerts WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM agent_runs WHERE id = ANY(${probeRunIds}::uuid[])`.execute(db());
  }
  if (probeTaskIds.length > 0) {
    await sql`DELETE FROM task_events WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM agent_runs WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM tasks WHERE id = ANY(${probeTaskIds}::uuid[])`.execute(db());
  }
  await sql`UPDATE agents SET persona_id = NULL, employment_status = 'draft'
             WHERE id = ${employeeId}::uuid`.execute(db());
  await sql`DELETE FROM personas WHERE id = ${personaId}::uuid`.execute(db());
  await sql`DELETE FROM agents WHERE id = ${employeeId}::uuid`.execute(db());
  await closeDb();
});

describe("E10.2 spawn binding — ROADMAP acceptance", () => {
  it("compliant spawn: pre-gate PASS → hook_version stamped NULL→v1, run born with the version, post-gate PASS → succeeded + hook_result", async () => {
    const before = await sql<{ hv: string | null }>`
      SELECT hook_version AS hv FROM agents WHERE id = ${employeeId}::uuid`.execute(db());
    expect(before.rows[0].hv).toBeNull();

    const task = await makeTask();
    const result = await runFor(task.department, () => evidencedResult("probe delivered"));
    expect(result).toMatchObject({ claimed: true, taskId: task.id, status: "review" });

    // ROADMAP E10.2: spawn → agents.hook_version dolu.
    const after = await sql<{ hv: string | null }>`
      SELECT hook_version AS hv FROM agents WHERE id = ${employeeId}::uuid`.execute(db());
    expect(after.rows[0].hv).toBe(CURRENT_HOOK_VERSION);

    const runs = await runRow(task.id);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("succeeded"); // std 9: PASS is the only door
    expect(runs[0].hook_version).toBe(CURRENT_HOOK_VERSION); // §27 starting version
    const hr = runs[0].hook_result as {
      hook_version: string;
      pre: { verdict: string };
      post: { verdict: string; rounds: number };
    };
    expect(hr.hook_version).toBe(CURRENT_HOOK_VERSION);
    expect(hr.pre.verdict).toBe("PASS");
    expect(hr.post.verdict).toBe("PASS");
    expect(hr.post.rounds).toBe(0);
  });

  it("§21 SQL proof: zero active employees with a NULL hook_version", async () => {
    // R4.3: parallel live-DB suites (r23/e10 own fixtures) hold an ACTIVE
    // fixture agent for a moment before their run stamps it — exclude
    // fixture-prefixed slugs so the proof measures the REAL workforce only
    // (interleave race measured 2026-07-18: r23t fixture mid-window).
    const res = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM agents
       WHERE employment_status = 'active' AND hook_version IS NULL
         AND slug NOT LIKE 'r23t-%' AND slug NOT LIKE 'e102t%'`.execute(db());
    expect(res.rows[0].n).toBe(0);
  });
});

describe("E10.2 pre-gate REJECT — the run is never born (§6)", () => {
  it("task without an employee: block violation → task failed(policy), zero agent_runs rows, violation recorded", async () => {
    const task = await makeTask({ agent_id: null, project_id: null });
    let executed = false;
    const result = await runFor(task.department, async () => {
      executed = true;
      return { result: { text: "never" }, confidence: 1 };
    });

    expect(executed).toBe(false); // the executor never ran
    expect(result.claimed).toBe(true);
    if (result.claimed && result.status === "failed") {
      expect(result.error).toMatch(/^policy: /);
    } else {
      throw new Error(`expected failed, got ${JSON.stringify(result)}`);
    }

    const runs = await runRow(task.id);
    expect(runs).toHaveLength(0); // §6: run never born

    const t = await sql<{ status: string }>`
      SELECT status FROM tasks WHERE id = ${task.id}::uuid`.execute(db());
    expect(t.rows[0].status).toBe("failed");

    const ev = await sql<{ actor: string; payload: { hook_gate?: string } }>`
      SELECT actor, payload FROM task_events
       WHERE task_id = ${task.id}::uuid AND to_status = 'failed'`.execute(db());
    expect(ev.rows[0].actor).toBe("hook");
    expect(ev.rows[0].payload.hook_gate).toBe("pre");

    const viol = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM hook_violations
       WHERE id > ${baseViolationId} AND policy_id = 'std.permission_bounds'
         AND action_taken = 'rejected'`.execute(db());
    expect(viol.rows[0].n).toBeGreaterThanOrEqual(1);
  });
});

describe("E10.2 post-gate loop — REVISE rounds then ESCALATE (§19/§7)", () => {
  it("evidence-less done: re-executes with feedback max_revision_rounds times, then ESCALATE fails the run with the chain in hook_result", async () => {
    const roundsSetting = await sql<{ v: number }>`
      SELECT (resolve_setting('orchestration.max_revision_rounds'))::int AS v`.execute(db());
    const maxRounds = roundsSetting.rows[0]?.v ?? 2;

    const task = await makeTask();
    const feedbackSeen: Array<string | null> = [];
    const result = await runFor(task.department, async (t) => {
      feedbackSeen.push((t as { feedback?: string | null }).feedback ?? null);
      return { result: { text: "done, trust me" }, confidence: 0.9 }; // no evidence
    });

    // initial + one re-execution per revision round
    expect(feedbackSeen).toHaveLength(maxRounds + 1);
    expect(feedbackSeen[0]).toBeNull();
    expect(feedbackSeen[1]).toMatch(/unverified_done|evidence/);

    expect(result.claimed).toBe(true);
    if (result.claimed && result.status === "failed") {
      expect(result.error).toContain("ESCALATE");
    } else {
      throw new Error(`expected failed, got ${JSON.stringify(result)}`);
    }

    const runs = await runRow(task.id);
    expect(runs).toHaveLength(1);
    expect(runs[0].status).toBe("failed"); // std 9: no PASS → never succeeded
    const hr = runs[0].hook_result as {
      post: { verdict: string; rounds: number; chain: string[]; approval_id: string | null };
    };
    expect(hr.post.verdict).toBe("ESCALATE");
    expect(hr.post.rounds).toBe(maxRounds);
    expect(hr.post.chain.length).toBeGreaterThanOrEqual(1);
    expect(hr.post.approval_id).toBeTruthy(); // §7 CEO rung approval item

    const esc = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM decision_log
       WHERE id > ${baseDecisionId} AND decision = 'hook_escalation'`.execute(db());
    expect(esc.rows[0].n).toBeGreaterThanOrEqual(1);
  });
});

describe("E10.2 §22 flag — off = old path, loudly", () => {
  it("hook.enabled=false: non-compliant task flows the pre-hook path AND the hook:disabled attention alert is raised", async () => {
    await setHookFlag(false);
    try {
      const task = await makeTask({ agent_id: null, project_id: null });
      const result = await runFor(task.department, async () => ({
        result: { text: "old path" },
        confidence: 0.8,
      }));
      expect(result).toMatchObject({ claimed: true, status: "review" });

      const runs = await runRow(task.id);
      expect(runs).toHaveLength(1);
      expect(runs[0].hook_version).toBeNull(); // unbound run, honestly recorded
      expect(runs[0].hook_result).toBeNull();

      const alert = await sql<{ n: number }>`
        SELECT count(*)::int AS n FROM alerts
         WHERE dedup_key = 'hook:disabled' AND resolved_at IS NULL
           AND level = 'attention'`.execute(db());
      expect(alert.rows[0].n).toBe(1);
    } finally {
      await setHookFlag(true);
      await sql`DELETE FROM alerts WHERE dedup_key = 'hook:disabled' AND resolved_at IS NULL`.execute(db());
    }
  });
});

describe("E10.2 §9 — ops:live terminal envelope carries hook_result", () => {
  it("run.succeeded NOTIFY payload exposes hook_result.hook_version", async () => {
    const client = await createListenClient();
    const received: EventEnvelope[] = [];
    client.on("notification", (msg) => {
      if (msg.channel === "dxb_ops_live" && msg.payload) {
        received.push(EventEnvelope.parse(JSON.parse(msg.payload)));
      }
    });
    await client.query("LISTEN dxb_ops_live");
    try {
      const task = await makeTask();
      await runFor(task.department, () => evidencedResult("envelope probe"));
      const runs = await runRow(task.id);
      expect(runs).toHaveLength(1);

      const deadline = Date.now() + 4000;
      let hit: EventEnvelope | undefined;
      while (!hit && Date.now() < deadline) {
        hit = received.find(
          (e) =>
            e.type === "run.succeeded" &&
            (e.payload as { run_id?: string }).run_id === runs[0].id,
        );
        if (!hit) await new Promise((r) => setTimeout(r, 100));
      }
      expect(hit, "run.succeeded envelope not observed").toBeDefined();
      const hr = hit!.payload.hook_result as { hook_version: string } | null;
      expect(hr?.hook_version).toBe(CURRENT_HOOK_VERSION);
    } finally {
      await client.end();
    }
  });
});
