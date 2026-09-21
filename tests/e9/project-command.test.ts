import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/index.js";
import { sweepByDepartment, watchLedgers } from "../helpers/suite-scope.js";

// E9.4 verification — PROJECT_OPERATING_SYSTEM_SPEC §10/§13/§16/§17/§20/§27:
//   project_health_breakdown: every §10 component exercised in isolation
//   (critical risk, high-risk cap at 2, late-milestone ratio, 7-day failed-run
//   ratio, blockers, budget burn, 0-100 clamp),
//   control_project_action: CEO wall (§13), 7 ops, idempotency replay +
//   MISMATCH, links credential regex gate (§16), archive-with-running-workflow
//   reject (§27), milestone seq CONFLICT_STALE (§17), dependency cycle →
//   VALIDATION_FAILED with the cycle path (§17),
//   milestone.reached automation (§9): last done task stamps reached_at.
// Suite deletes ONLY what it creates (tests/helpers rule, E9.3 incident).

const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);
const M = "e94t"; // suite marker: slugs, departments, idempotency keys

// ── helpers ──────────────────────────────────────────────────────────────────

async function ceoActionKeyed(
  payload: Record<string, unknown>,
  key: string,
): Promise<Record<string, unknown>> {
  return db()
    .transaction()
    .execute(async (trx) => {
      await sql`SELECT set_config('request.jwt.claims',
        '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}', true)`.execute(trx);
      const res = await sql<{ resp: Record<string, unknown> }>`
        SELECT control_project_action(${JSON.stringify(payload)}::jsonb, ${key}) AS resp
      `.execute(trx);
      return res.rows[0].resp;
    });
}

async function ceoAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  return ceoActionKeyed(payload, `${M}-${randomUUID()}`);
}

/** system-context call (postgres session → actor 'system'). */
async function systemAction(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  const res = await sql<{ resp: Record<string, unknown> }>`
    SELECT control_project_action(${JSON.stringify(payload)}::jsonb, ${`${M}-${randomUUID()}`}) AS resp
  `.execute(db());
  return res.rows[0].resp;
}

async function makeProject(over: Record<string, unknown> = {}): Promise<string> {
  const slug = `${M}-${randomUUID().slice(0, 8)}`;
  const resp = await ceoAction({
    action: "create",
    slug,
    name: `E9.4 probe ${slug}`,
    purpose: "health formula probe",
    ...over,
  });
  expect(resp.ok).toBe(true);
  probeProjects.push(resp.project_id as string);
  return resp.project_id as string;
}

async function makeTask(projectId: string | null, status = "queued", milestoneId?: string) {
  const row = await sql<{ id: string }>`
    INSERT INTO tasks (department, objective, output_contract, model_tier,
                       status, project_id, milestone_id)
    VALUES (${`${M}-dept`}, 'e94 probe task', 'none', 'L1',
            ${status}, ${projectId}, ${milestoneId ?? null})
    RETURNING id
  `.execute(db());
  return row.rows[0].id;
}

async function health(projectId: string) {
  const res = await sql<{
    health_score: number;
    pen_critical_risk: number;
    pen_high_risks: number;
    pen_late_milestones: number;
    pen_failed_runs: number;
    pen_blockers: number;
    pen_budget_burn: number;
  }>`SELECT * FROM project_health_breakdown(${projectId}::uuid)`.execute(db());
  return res.rows[0];
}

const probeProjects: string[] = [];

async function sweep() {
  await sweepByDepartment(db(), M);
  // project cascade removes members/milestones/risks; workflows detach first.
  await sql`DELETE FROM workflow_runs WHERE workflow_id IN
    (SELECT id FROM workflows WHERE slug LIKE ${`${M}%`})`.execute(db());
  await sql`DELETE FROM workflows WHERE slug LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM projects WHERE slug LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM audit_log WHERE action LIKE 'project.%'
    AND payload->>'slug' LIKE ${`${M}%`}`.execute(db());
  await sql`DELETE FROM control_idempotency WHERE key LIKE ${`${M}-%`}`.execute(db());
}

beforeAll(sweep);
afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "ceo", action: "project.set_dependency" }] });
  await sweep();
  await closeDb();
});

// ── §13 CEO wall ─────────────────────────────────────────────────────────────

describe("control_project_action authz (§13)", () => {
  it("rejects every op for the system actor — project mutations are CEO-only", async () => {
    const resp = await systemAction({
      action: "create",
      slug: `${M}-sys`,
      name: "x",
      purpose: "x",
    });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("PERMISSION_DENIED");
  });

  it("rejects unknown actions", async () => {
    const resp = await ceoAction({ action: "drop_everything" });
    expect(resp.ok).toBe(false);
    expect(resp.error).toBe("VALIDATION_FAILED");
  });
});

// ── create / idempotency / links gate ───────────────────────────────────────

describe("create + idempotency twin + §16 links gate", () => {
  it("creates a project, audits it, and replays idempotently", async () => {
    const slug = `${M}-idem`;
    const key = `${M}-${randomUUID()}`;
    const payload = { action: "create", slug, name: "Idem probe", purpose: "p" };
    const first = await ceoActionKeyed(payload, key);
    expect(first.ok).toBe(true);
    probeProjects.push(first.project_id as string);

    const audit = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM audit_log
      WHERE action = 'project.create' AND payload->>'slug' = ${slug}
    `.execute(db());
    expect(audit.rows[0].n).toBe(1);

    const replay = await ceoActionKeyed(payload, key);
    expect(replay).toEqual(first); // same key + same digest → stored response

    const mismatch = await ceoActionKeyed({ ...payload, name: "Другое" }, key);
    expect(mismatch.error).toBe("IDEMPOTENCY_MISMATCH");

    const dup = await ceoAction(payload);
    expect(dup.error).toBe("CONFLICT_STALE"); // slug taken
  });

  it("refuses links that embed credentials (§16)", async () => {
    const bad = await ceoAction({
      action: "create",
      slug: `${M}-cred`,
      name: "x",
      purpose: "x",
      links: { repos: ["https://user:hunter2@evil.example/repo.git"] },
    });
    expect(bad.ok).toBe(false);
    expect(bad.error).toBe("VALIDATION_FAILED");
    expect(String(bad.detail)).toContain("§16");

    const projectId = await makeProject();
    const badUpdate = await ceoAction({
      action: "update",
      project_id: projectId,
      links: { docs: ["postgres://ceo:secret@db.internal/x"] },
    });
    expect(badUpdate.error).toBe("VALIDATION_FAILED");

    const goodUpdate = await ceoAction({
      action: "update",
      project_id: projectId,
      links: { repos: ["https://github.com/dxb/os"], budget_eur: "100" },
    });
    expect(goodUpdate.ok).toBe(true);
  });
});

// ── §10 health formula, component by component ──────────────────────────────

describe("project_health_breakdown (§10 — binding formula)", () => {
  it("fresh project scores 100 with all penalties 0", async () => {
    const p = await makeProject();
    const h = await health(p);
    expect(h.health_score).toBe(100);
    expect(h.pen_critical_risk).toBe(0);
    expect(h.pen_budget_burn).toBe(0);
  });

  it("open critical risk costs 25; high risks cost 15 each, capped at 2", async () => {
    const p = await makeProject();
    await ceoAction({ action: "log_risk", project_id: p, title: "crit", severity: "critical" });
    expect((await health(p)).pen_critical_risk).toBe(25);

    for (const t of ["h1", "h2", "h3"]) {
      await ceoAction({ action: "log_risk", project_id: p, title: t, severity: "high" });
    }
    const h = await health(p);
    expect(h.pen_high_risks).toBe(30); // 3 open high risks, only 2 counted
    expect(h.health_score).toBe(100 - 25 - 30);
  });

  it("closing a risk via log_risk{risk_id,status} lifts its penalty (§14)", async () => {
    const p = await makeProject();
    const r = await ceoAction({
      action: "log_risk",
      project_id: p,
      title: "crit",
      severity: "critical",
    });
    expect((await health(p)).pen_critical_risk).toBe(25);
    const upd = await ceoAction({ action: "log_risk", risk_id: r.risk_id, status: "mitigated" });
    expect(upd.ok).toBe(true);
    expect((await health(p)).pen_critical_risk).toBe(0);
  });

  it("late milestone ratio: 1 of 2 late → 10 of 20", async () => {
    const p = await makeProject();
    await ceoAction({
      action: "add_milestone",
      project_id: p,
      seq: 1,
      title: "late",
      due_at: "2026-07-01T00:00:00Z",
    });
    await ceoAction({
      action: "add_milestone",
      project_id: p,
      seq: 2,
      title: "future",
      due_at: "2027-01-01T00:00:00Z",
    });
    const h = await health(p);
    expect(h.pen_late_milestones).toBe(10);
  });

  it("failed-run ratio last 7 days: 1 failed of 2 finished → 10 of 20", async () => {
    const p = await makeProject();
    const t = await makeTask(p);
    await sql`INSERT INTO agent_runs (task_id, status, started_at, ended_at)
      VALUES (${t}, 'failed', now() - interval '1 hour', now()),
             (${t}, 'succeeded', now() - interval '1 hour', now())`.execute(db());
    const h = await health(p);
    expect(h.pen_failed_runs).toBe(10);
  });

  it("an unfinished dependency inside the project costs the 10-point blocker penalty", async () => {
    const p = await makeProject();
    const blocked = await makeTask(p);
    const upstream = await makeTask(p, "running");
    const dep = await ceoAction({ action: "set_dependency", task_id: blocked, depends_on: upstream });
    expect(dep.ok).toBe(true);
    const h = await health(p);
    expect(h.pen_blockers).toBe(10);

    // finishing the upstream task clears the blocker (computed, never stored)
    await sql`UPDATE tasks SET status = 'done' WHERE id = ${upstream}`.execute(db());
    expect((await health(p)).pen_blockers).toBe(0);
  });

  it("budget burn: spend at 50% of links.budget_eur → 5 of 10; unset budget → 0", async () => {
    const p = await makeProject();
    const t = await makeTask(p);
    await sql`INSERT INTO cost_ledger (task_id, department, model, mode, cost_eur)
      VALUES (${t}, ${`${M}-dept`}, 'glm-5.2', 'api', 5.00)`.execute(db());
    expect((await health(p)).pen_budget_burn).toBe(0); // no allocation yet
    await ceoAction({ action: "update", project_id: p, links: { budget_eur: "10" } });
    expect((await health(p)).pen_budget_burn).toBe(5);
  });

  it("score clamps at 0 when penalties exceed 100", async () => {
    const p = await makeProject();
    await ceoAction({ action: "log_risk", project_id: p, title: "c", severity: "critical" });
    await ceoAction({ action: "log_risk", project_id: p, title: "h1", severity: "high" });
    await ceoAction({ action: "log_risk", project_id: p, title: "h2", severity: "high" });
    await ceoAction({
      action: "add_milestone",
      project_id: p,
      seq: 1,
      title: "late",
      due_at: "2026-01-01T00:00:00Z",
    });
    const t = await makeTask(p);
    await sql`INSERT INTO agent_runs (task_id, status, started_at, ended_at)
      VALUES (${t}, 'failed', now() - interval '1 hour', now())`.execute(db());
    const blocked = await makeTask(p);
    await ceoAction({ action: "set_dependency", task_id: blocked, depends_on: t });
    await ceoAction({ action: "update", project_id: p, links: { budget_eur: "1" } });
    await sql`INSERT INTO cost_ledger (task_id, department, model, mode, cost_eur)
      VALUES (${t}, ${`${M}-dept`}, 'glm-5.2', 'api', 9.99)`.execute(db());
    const h = await health(p);
    // 25 + 30 + 20 + 20 + 10 + 10 = 115 → clamped
    expect(h.health_score).toBe(0);
  });
});

// ── §17 dependency cycle + milestone seq conflict ───────────────────────────

describe("failure modes (§17)", () => {
  it("rejects a dependency cycle with the cycle path in the message", async () => {
    const p = await makeProject();
    const a = await makeTask(p);
    const b = await makeTask(p);
    const c = await makeTask(p);
    expect((await ceoAction({ action: "set_dependency", task_id: a, depends_on: b })).ok).toBe(true);
    expect((await ceoAction({ action: "set_dependency", task_id: b, depends_on: c })).ok).toBe(true);
    const cycle = await ceoAction({ action: "set_dependency", task_id: c, depends_on: a });
    expect(cycle.ok).toBe(false);
    expect(cycle.error).toBe("VALIDATION_FAILED");
    expect(String(cycle.detail)).toContain("cycle");

    const self = await ceoAction({ action: "set_dependency", task_id: a, depends_on: a });
    expect(self.ok).toBe(false);
  });

  it("milestone seq collision → CONFLICT_STALE", async () => {
    const p = await makeProject();
    expect(
      (await ceoAction({ action: "add_milestone", project_id: p, seq: 1, title: "one" })).ok,
    ).toBe(true);
    const clash = await ceoAction({ action: "add_milestone", project_id: p, seq: 1, title: "two" });
    expect(clash.error).toBe("CONFLICT_STALE");
  });
});

// ── §27 archive guard ────────────────────────────────────────────────────────

describe("set_status (§27 archive guard)", () => {
  it("refuses to archive while a project workflow run is live, allows after", async () => {
    const p = await makeProject();
    const wf = await sql<{ id: string }>`
      INSERT INTO workflows (slug, name, trigger, project_id, enabled)
      VALUES (${`${M}-wf-${randomUUID().slice(0, 8)}`}, 'e94 probe wf',
              '{"kind":"manual"}'::jsonb, ${p}, true)
      RETURNING id
    `.execute(db());
    const run = await sql<{ id: string }>`
      INSERT INTO workflow_runs (workflow_id, triggered_by, status)
      VALUES (${wf.rows[0].id}, 'manual', 'running') RETURNING id
    `.execute(db());

    const refused = await ceoAction({ action: "set_status", project_id: p, status: "archived" });
    expect(refused.ok).toBe(false);
    expect(String(refused.detail)).toContain("running workflow");

    await sql`UPDATE workflow_runs SET status = 'cancelled', ended_at = now()
      WHERE id = ${run.rows[0].id}`.execute(db());
    const ok = await ceoAction({ action: "set_status", project_id: p, status: "archived" });
    expect(ok.ok).toBe(true);

    const bad = await ceoAction({ action: "set_status", project_id: p, status: "exploded" });
    expect(bad.error).toBe("VALIDATION_FAILED");
  });
});

// ── §9 milestone.reached automation ──────────────────────────────────────────

describe("milestone.reached automation (§9)", () => {
  it("stamps reached_at only when the LAST open task of the milestone is done", async () => {
    const p = await makeProject();
    const ms = await ceoAction({ action: "add_milestone", project_id: p, seq: 1, title: "m" });
    const msId = ms.milestone_id as string;
    const t1 = await makeTask(p, "queued", msId);
    const t2 = await makeTask(p, "queued", msId);

    await sql`UPDATE tasks SET status = 'done' WHERE id = ${t1}`.execute(db());
    let row = await sql<{ reached_at: string | null }>`
      SELECT reached_at FROM project_milestones WHERE id = ${msId}`.execute(db());
    expect(row.rows[0].reached_at).toBeNull(); // t2 still open

    await sql`UPDATE tasks SET status = 'done' WHERE id = ${t2}`.execute(db());
    row = await sql<{ reached_at: string | null }>`
      SELECT reached_at FROM project_milestones WHERE id = ${msId}`.execute(db());
    expect(row.rows[0].reached_at).not.toBeNull();
  });
});

// ── add_member + view surface ────────────────────────────────────────────────

describe("add_member + v_project_command surface (§8)", () => {
  it("upserts membership and the view exposes the 19-field counters", async () => {
    const p = await makeProject();
    const emp = await sql<{ id: string }>`
      INSERT INTO agents (slug, department, role, persona_path, persona_version,
                          status, employment_status)
      VALUES (${`${M}-emp-${randomUUID().slice(0, 8)}`}, 'engineering', 'worker',
              'personas/test/probe.md', 'v2.0-test', 'dormant', 'dormant')
      RETURNING id
    `.execute(db());
    try {
      const add = await ceoAction({ action: "add_member", project_id: p, employee_id: emp.rows[0].id });
      expect(add.ok).toBe(true);
      const promote = await ceoAction({
        action: "add_member",
        project_id: p,
        employee_id: emp.rows[0].id,
        role: "director",
      });
      expect(promote.ok).toBe(true);

      const badRole = await ceoAction({
        action: "add_member",
        project_id: p,
        employee_id: emp.rows[0].id,
        role: "king",
      });
      expect(badRole.error).toBe("VALIDATION_FAILED");

      const view = await sql<Record<string, unknown>>`
        SELECT * FROM v_project_command WHERE id = ${p}`.execute(db());
      const v = view.rows[0];
      expect(v.member_count).toBe(1);
      expect(v.departments_count).toBe(1);
      expect(v.health_live).toBe(100);
      // breakdown columns present (CEO "why 62?" answer surface)
      for (const col of [
        "pen_critical_risk",
        "pen_high_risks",
        "pen_late_milestones",
        "pen_failed_runs",
        "pen_blockers",
        "pen_budget_burn",
        "blockers_count",
        "tokens_in",
        "tokens_out",
        "decisions_count",
        "approvals_pending",
        "current_phase",
      ]) {
        expect(col in v).toBe(true);
      }
    } finally {
      await sql`DELETE FROM project_members WHERE employee_id = ${emp.rows[0].id}`.execute(db());
      await sql`DELETE FROM agents WHERE id = ${emp.rows[0].id}`.execute(db());
    }
  });
});
