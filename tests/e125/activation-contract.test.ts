import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { watchLedgers } from "../helpers/suite-scope.js";

// E12.5 activation contract (CEO rulings D10/D11 2026-07-18, directive §3-bis,
// adaptation U17; migrations 20260718090000/091000). Live-DB, state-independent:
// mutation tests ride a throwaway fixture agent (created dormant, deleted in
// afterAll, FK-ordered) — the workforce-gate suite's hygiene assertions only
// judge pre-suite rows, so the transient fixture cannot flake the battery.

const db = () => getDb();

// Its own footprints in audit_log / decision_log, swept in afterAll below.
const ledgerScope = watchLedgers(db);
const FIXTURE_SLUG = "e125t-activation-fixture";
let fixtureId = "";

beforeAll(async () => {
  // dormant fixture in an existing department (pre-machine stock shape)
  const born = await sql<{ id: string }>`
    INSERT INTO agents (slug, department, role, role_level, brain, employment_status, status,
                        persona_path, manager_id)
    VALUES (${FIXTURE_SLUG}, 'people-hr', 'worker', 'specialist', 'glm-5.2', 'dormant', 'dormant',
            'personas/_fixtures/e125t.md',
            (SELECT id FROM agents WHERE department='people-hr' AND role='head' LIMIT 1))
    RETURNING id
  `.execute(db());
  fixtureId = born.rows[0].id;
});

afterAll(async () => {
  // 2026-09-21: and the two append-only ledgers too. Measured by running
  // every sandboxed file alone: this one left the rows named below, which
  // no FK chain reaches. Watermark AND signature — never the watermark alone.
  await ledgerScope.sweep({ audit: [{ actor: "e125t-test" }] });
  await sql`DELETE FROM settings_values WHERE scope = ${"employee:" + fixtureId}`.execute(db());
  await sql`DELETE FROM tasks WHERE agent_id = ${fixtureId}::uuid`.execute(db());
  await sql`DELETE FROM agents WHERE id = ${fixtureId}::uuid`.execute(db());
  await closeDb();
});

describe("E12.5 activation contract — D10 economic frame", () => {
  it("(1) tasks.due_at exists, NOT NULL, and the default SLA populates it", async () => {
    const col = await sql<{ is_nullable: string; column_default: string | null }>`
      SELECT is_nullable, column_default FROM information_schema.columns
       WHERE table_schema='public' AND table_name='tasks' AND column_name='due_at'
    `.execute(db());
    expect(col.rows).toHaveLength(1);
    expect(col.rows[0].is_nullable).toBe("NO");
    expect(col.rows[0].column_default).toBeTruthy();

    const t = await sql<{ id: string; ok: boolean }>`
      INSERT INTO tasks (department, objective, output_contract, model_tier, approval_class, status)
      VALUES ('people-hr', 'e125t fixture: due_at default probe', 'deleted in afterAll', 'L1', 'none', 'done')
      RETURNING id, (due_at > created_at) AS ok
    `.execute(db());
    expect(t.rows[0].ok).toBe(true);
    await sql`DELETE FROM tasks WHERE id = ${t.rows[0].id}::uuid`.execute(db());
  });

  it("(2) the frame is mandatory: objective / output_contract / budgets reject NULL", async () => {
    await expect(
      sql`INSERT INTO tasks (department, objective, output_contract, model_tier, approval_class, status)
          VALUES ('people-hr', NULL, 'x', 'L1', 'none', 'done')`.execute(db()),
    ).rejects.toThrow(/null value|not-null/i);
  });

  it("(3) due_at CHECK rejects a deadline at/before creation", async () => {
    await expect(
      sql`INSERT INTO tasks (department, objective, output_contract, model_tier, approval_class, status, due_at)
          VALUES ('people-hr', 'e125t check probe', 'never lands', 'L1', 'none', 'done', now() - interval '1 hour')`.execute(db()),
    ).rejects.toThrow(/tasks_due_after_creation/);
  });
});

describe("E12.5 activation contract — machine intake (U17)", () => {
  it("(4) dormant fixture: intake writes the three equipment rows and moves to draft", async () => {
    await sql`SELECT fn_hr_machine_intake(${fixtureId}::uuid, 'e125t-test')`.execute(db());
    const state = await sql<{ employment_status: string; rows: number }>`
      SELECT a.employment_status,
             (SELECT count(*)::int FROM settings_values sv
               WHERE sv.scope = 'employee:' || a.id::text
                 AND sv.key IN ('hr.grant_package','hr.litellm_key_alias','hr.employee_budget')) AS rows
        FROM agents a WHERE a.id = ${fixtureId}::uuid
    `.execute(db());
    expect(state.rows[0].employment_status).toBe("draft");
    expect(state.rows[0].rows).toBe(3);
  });

  it("(5) re-entry on a fully-equipped draft is a caller bug (raises, mutates nothing)", async () => {
    await expect(
      sql`SELECT fn_hr_machine_intake(${fixtureId}::uuid, 'e125t-test')`.execute(db()),
    ).rejects.toThrow(/complete equipment — nothing to do/);
  });

  it("(6) probation gate still demands a READY key (e5) — text-only intake cannot shortcut it", async () => {
    await expect(
      sql`SELECT fn_hr_assign_probation_task(${fixtureId}::uuid, 'e125t early', 'must fail', 'e125t-test')`.execute(db()),
    ).rejects.toThrow(/e5_litellm_key|persona passed: f/);
  });

  it("(7) live invariant: every draft/probation employee carries the full equipment row set", async () => {
    const gap = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM agents a
       WHERE a.employment_status IN ('draft','probation')
         AND a.slug <> ${FIXTURE_SLUG}
         AND 3 <> (SELECT count(*)::int FROM settings_values sv
                    WHERE sv.scope = 'employee:' || a.id::text
                      AND sv.key IN ('hr.grant_package','hr.litellm_key_alias','hr.employee_budget'))
    `.execute(db());
    expect(gap.rows[0].n).toBe(0);
  });

  it("(8) named exclusion: agents-orchestrator stays outside the machine", async () => {
    // The U17(5) contract is about the ACTIVATION PIPELINE, not the status
    // column: the orchestrator never rides the HR machine (no LiteLLM key /
    // grant package / budget rows are minted for him). His employment_status
    // was corrected dormant→active on 2026-07-25 (audit org.status.corrected)
    // because 'dormant' was the pipeline exclusion leaking onto the CEO
    // surface as a false "inactive" — he works daily. Asserting 'dormant'
    // here would re-freeze that lie; assert the real exclusion instead.
    const script = await import("node:fs/promises").then((fs) =>
      fs.readFile("scripts/hr/activate-workforce.sh", "utf8"),
    );
    expect(script).toMatch(/EXCLUDED_SLUGS[^\n]*agents-orchestrator/);

    const equipped = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM settings_values sv
       WHERE sv.scope = 'employee:' ||
             (SELECT id::text FROM agents WHERE slug = 'agents-orchestrator')
         AND sv.key IN ('hr.grant_package','hr.litellm_key_alias','hr.employee_budget')
    `.execute(db());
    expect(equipped.rows[0].n).toBe(0);
  });
});
