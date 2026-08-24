// W2.4 — AN APPROVED ALLOCATION PRODUCES REAL WORK (REVENUE_ENGINE_SPEC §3
// "ESTABLISH PROJECTS → ALLOCATE", §5, §12).
//
// Measured before writing (2026-07-26): all six engines carried
// owner_department = NULL, `portfolio_allocations` held 0 rows, and
// control_portfolio_allocate wrote its row and stopped — no project, no task,
// nobody responsible. The CEO's approval produced a ledger entry and silence.
//
// Every case runs inside a rolled-back transaction with the CEO jwt
// impersonated (allocation is CEO-only, §13), so the live pipeline is never
// touched by a test that has to walk an opportunity all the way to committed.
import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

const SEED = `c9-alloc-${randomUUID().slice(0, 8)}`;
const ROLLBACK = new Error("rollback-sentinel");
const CEO_JWT = JSON.stringify({
  sub: "00000000-0000-0000-0000-000000000001",
  email: "ceo-test",
});
const FULL_DIMS = {
  market: 8, trend: 7, demand: 8, competition: 5, price_gap: 6,
  logistics: 7, platform_fees: 6, tax_constraints: 7, ad_cost: 5,
  est_margin: 7, time_to_revenue_days: 8, scalability: 6,
};

type Out = { ok: boolean; id?: string; error?: string; detail?: string;
             project_id?: string; task_id?: string; owner_department?: string };

afterAll(async () => {
  await closeDb();
});

const inTrx = async (fn: (trx: never) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx as never);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

/** Walk an opportunity from birth to `shortlisted` + `halal` — the only state
 *  from which the CEO may commit it (§10, G2). Every step through its own door. */
async function committableOpportunity(trx: never, engine: string, title: string): Promise<string> {
  const reg = await sql<{ out: Out }>`
    select control_opportunity_register(${title}, ${engine}, 'EU', 'marketplace',
                                        0::numeric, '[]'::jsonb, ${SEED}, null,
                                        ${`${title} (TR)`}) as out
  `.execute(trx);
  const id = reg.rows[0].out.id as string;
  await sql`select control_opportunity_score(${id}::uuid, ${JSON.stringify(FULL_DIMS)}::jsonb)`.execute(trx);
  await sql`select control_opportunity_set_halal_verdict(${id}::uuid, 'halal', ${SEED}, 'ceo')`.execute(trx);
  await sql`select control_opportunity_advance(${id}::uuid, 'shortlisted')`.execute(trx);
  return id;
}

async function activeObjective(trx: never, capitalLimit = 1000): Promise<string> {
  const res = await sql<{ id: string }>`
    insert into objectives (title, amount_eur, metric, status, period, capital_limit_eur)
    values (${`${SEED} objective`}, 500, 'net_profit', 'active',
            daterange(current_date, current_date + 30, '[]'), ${capitalLimit}::numeric)
    returning id
  `.execute(trx);
  return res.rows[0].id;
}

describe("W2.4 — engine ownership is answerable", () => {
  it("every engine names the department responsible for it", async () => {
    const res = await sql<{ slug: string; owner_department: string | null }>`
      select slug, owner_department from revenue_engines order by slug
    `.execute(getDb());
    expect(res.rows.length).toBeGreaterThanOrEqual(6);
    for (const row of res.rows) {
      expect(row.owner_department, `engine ${row.slug} has no owner`).not.toBeNull();
    }
  });
});

describe("W2.4 — an approved allocation produces real work", () => {
  it("allocation establishes a project and opens a staffed kickoff task in the owning department", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      const objective = await activeObjective(trx);
      const opportunity = await committableOpportunity(trx, "ecommerce", `${SEED} storefront`);

      const res = await sql<{ out: Out }>`
        select control_portfolio_allocate(${objective}::uuid, ${opportunity}::uuid, 250) as out
      `.execute(trx);
      const out = res.rows[0].out;
      expect(out.ok).toBe(true);
      expect(out.project_id).toBeTruthy();
      expect(out.task_id).toBeTruthy();

      // the project: pointer back to the allocation (§12 seam), CEO-readable
      // in both languages, owned by a real employee
      const project = await sql<{
        status: string; links: Record<string, string>; purpose_tr: string | null;
        owner_employee_id: string | null;
      }>`
        select status, links, purpose_tr, owner_employee_id
          from projects where id = ${out.project_id}::uuid
      `.execute(trx);
      expect(project.rows[0].status).toBe("active");
      expect(project.rows[0].links.allocation_id).toBe(out.id);
      expect(project.rows[0].links.opportunity_id).toBe(opportunity);
      expect(project.rows[0].purpose_tr).toBeTruthy();
      expect(project.rows[0].owner_employee_id).toBeTruthy();

      // the task: in the OWNING department, staffed (an agent-less task runs
      // tool-less), headline in both languages (U29), judgment tier (U21)
      const task = await sql<{
        department: string; status: string; agent_id: string | null;
        label: string | null; label_tr: string | null; model_tier: string;
        project_id: string | null; objective: string;
      }>`
        select department, status, agent_id, label, label_tr, model_tier, project_id, objective
          from tasks where id = ${out.task_id}::uuid
      `.execute(trx);
      expect(task.rows[0].department).toBe("commerce");
      expect(task.rows[0].status).toBe("queued");
      expect(task.rows[0].agent_id).toBeTruthy();
      expect(task.rows[0].label).toBeTruthy();
      expect(task.rows[0].label_tr).toBeTruthy();
      expect(task.rows[0].model_tier).toBe("L1");
      expect(task.rows[0].project_id).toBe(out.project_id);
      // the brief must carry the money frame, or the department is guessing
      expect(task.rows[0].objective).toContain("€");

      const audit = await sql<{ n: string }>`
        select count(*)::text as n from audit_log
         where action = 'revenue.portfolio.work_established'
           and payload->>'allocation_id' = ${out.id}
      `.execute(trx);
      expect(Number(audit.rows[0].n)).toBe(1);
    });
  });

  it("the kickoff task is claimable by the owning department — the work actually dispatches", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      const objective = await activeObjective(trx);
      const opportunity = await committableOpportunity(trx, "ecommerce", `${SEED} claimable`);
      const alloc = await sql<{ out: Out }>`
        select control_portfolio_allocate(${objective}::uuid, ${opportunity}::uuid, 100) as out
      `.execute(trx);
      expect(alloc.rows[0].out.ok).toBe(true);
      expect(alloc.rows[0].out.task_id).toBeTruthy();

      // clear the field so the claim can only return OUR task
      await sql`update tasks set status = 'inbox'
                 where department = 'commerce' and status = 'queued'
                   and id <> ${alloc.rows[0].out.task_id}::uuid`.execute(trx);

      const claim = await sql<{ id: string }>`
        select id from claim_next_task(${`${SEED}-worker`}, ARRAY['commerce']::text[], 60)
      `.execute(trx);
      expect(claim.rows[0]?.id).toBe(alloc.rows[0].out.task_id);
    });
  });

  it("stopping the allocation stops the work: the project pauses and its queue no longer dispatches", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      const objective = await activeObjective(trx);
      const opportunity = await committableOpportunity(trx, "ecommerce", `${SEED} stopped bet`);
      const alloc = await sql<{ out: Out }>`
        select control_portfolio_allocate(${objective}::uuid, ${opportunity}::uuid, 100) as out
      `.execute(trx);
      const out = alloc.rows[0].out;

      const stop = await sql<{ out: Out }>`
        select control_portfolio_stop(${out.id}::uuid, ${`${SEED} not pursuing`}) as out
      `.execute(trx);
      expect(stop.rows[0].out.ok).toBe(true);

      const project = await sql<{ status: string }>`
        select status from projects where id = ${out.project_id}::uuid
      `.execute(trx);
      expect(project.rows[0].status).toBe("paused");

      await sql`update tasks set status = 'inbox'
                 where department = 'commerce' and status = 'queued'
                   and id <> ${out.task_id}::uuid`.execute(trx);
      const claim = await sql<{ id: string }>`
        select id from claim_next_task(${`${SEED}-worker2`}, ARRAY['commerce']::text[], 60)
      `.execute(trx);
      expect(claim.rows.length).toBe(0);
    });
  });

  it("an engine with nobody responsible refuses the work rather than orphaning it", async () => {
    await inTrx(async (trx) => {
      await sql`select set_config('request.jwt.claims', ${CEO_JWT}, true)`.execute(trx);
      await sql`insert into revenue_engines (slug, title, title_tr, thesis, lifecycle)
                values (${`${SEED}-orphan`}, 'Orphan engine', 'Sahipsiz motor',
                        'no owner on purpose', 'candidate')`.execute(trx);
      const objective = await activeObjective(trx);
      const opportunity = await committableOpportunity(trx, `${SEED}-orphan`, `${SEED} orphan work`);

      const res = await sql<{ out: Out }>`
        select control_portfolio_allocate(${objective}::uuid, ${opportunity}::uuid, 100) as out
      `.execute(trx);
      expect(res.rows[0].out.ok).toBe(false);
      expect(res.rows[0].out.error).toBe("NO_OWNER");

      const allocations = await sql<{ n: string }>`
        select count(*)::text as n from portfolio_allocations where objective_id = ${objective}::uuid
      `.execute(trx);
      expect(Number(allocations.rows[0].n)).toBe(0);
    });
  });
});

describe("W2.4 — a paused project does not dispatch (the mechanism the stop relies on)", () => {
  it("claim_next_task skips tasks whose project is paused, and returns them once it is active again", async () => {
    await inTrx(async (trx) => {
      const project = await sql<{ id: string }>`
        insert into projects (slug, name, purpose, status)
        values (${`${SEED}-pause`}, ${`${SEED} pause probe`}, 'claim-gate probe', 'paused')
        returning id
      `.execute(trx);
      const agent = await sql<{ id: string }>`
        select id from agents where department = 'commerce' and employment_status = 'active' limit 1
      `.execute(trx);
      const task = await sql<{ id: string }>`
        insert into tasks (department, agent_id, project_id, objective, output_contract,
                           label, label_tr, model_tier, approval_class, status, priority)
        values ('commerce', ${agent.rows[0].id}::uuid, ${project.rows[0].id}::uuid,
                'probe objective', 'one line of plain text', 'probe', 'sonda',
                'L3', 'none', 'queued', 9)
        returning id
      `.execute(trx);
      await sql`update tasks set status = 'inbox'
                 where department = 'commerce' and status = 'queued'
                   and id <> ${task.rows[0].id}::uuid`.execute(trx);

      const blocked = await sql<{ id: string }>`
        select id from claim_next_task(${`${SEED}-w3`}, ARRAY['commerce']::text[], 60)
      `.execute(trx);
      expect(blocked.rows.length).toBe(0);

      await sql`update projects set status = 'active' where id = ${project.rows[0].id}::uuid`.execute(trx);
      const allowed = await sql<{ id: string }>`
        select id from claim_next_task(${`${SEED}-w4`}, ARRAY['commerce']::text[], 60)
      `.execute(trx);
      expect(allowed.rows[0]?.id).toBe(task.rows[0].id);
    });
  });
});
