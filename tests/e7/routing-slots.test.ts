import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  ROLE_SLOTS,
  RoutingRefusedError,
  fallbackModel,
  selectModel,
} from "../../packages/orchestrator/src/select-model.js";

// E7.1 verification (roadmap: "routing testi: slot → beklenen model; fallback
// zinciri decision_log'a"). Pure DB, runs against the local Supabase stack.
// Every mutation this file makes is restored in afterAll — the suite stays
// pollution-free (decision_log rows are append-only and stay, same rule as
// audit_log in every E6 battery).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();

// Seed truth (migration 20260713040000): primary=fable-5, fast/low-cost=haiku,
// the other ten slots=opus. The test reads EXPECTED from the live settings
// registry defaults so a future CEO reassignment fails loudly here instead of
// silently diverging from the registry (single-source proof).
let registryDefaults: Record<string, string> = {};

beforeAll(async () => {
  const rows = await sql<{ key: string; def: string }>`
    SELECT key, value_schema->>'default' AS def
      FROM settings_registry WHERE category = 'models'
  `.execute(db());
  registryDefaults = Object.fromEntries(
    rows.rows.map((r) => [r.key.replace(/^orchestrator\./, "").replace(/_model$/, ""), r.def]),
  );
});

afterAll(async () => {
  // Belt-and-braces: remove any probe rows even if an assertion aborted early.
  await sql`DELETE FROM routing_rules WHERE model_id LIKE 'test-e7-%' OR (role_slot IS NOT NULL AND priority = 9900)`.execute(db());
  await sql`DELETE FROM model_catalog WHERE id LIKE 'test-e7-%'`.execute(db());
  await sql`UPDATE budget_state SET hard_stopped = false`.execute(db());
  // E8.4b: the hard-stop toggle + fallback probes raise real alerts rows —
  // sweep the suite-induced ones so regression runs never pollute /alerts.
  await sql`DELETE FROM alerts WHERE resolved_at IS NULL AND (
      dedup_key IN ('budget-hard-stop', 'budget-breaker')
      OR dedup_key LIKE 'fallback-%' OR dedup_key LIKE 'chain-exhausted-%')`.execute(db());
  await closeDb();
});

describe("E7.1 — slot resolution (table-driven, no model name in code)", () => {
  it("resolves all 13 role slots to the registry-default model", async () => {
    expect(Object.keys(registryDefaults)).toHaveLength(13);
    for (const slot of ROLE_SLOTS) {
      const sel = await selectModel(db(), { roleSlot: slot });
      expect(sel.modelId, `slot ${slot}`).toBe(registryDefaults[slot]);
      expect(sel.ruleId).toBeTruthy();
    }
  });

  // U20 (2026-07-25): the execution slot's registry default moved off the
  // retired 'claude-opus-4-8' row onto 'fable-5' (display name "Claude Opus 5"
  // — the id is a frozen technical key, CEO decision). Asserting the LIVE
  // catalog row instead of a literal keeps this smoke honest across future
  // CEO reassignments: it proves the slot resolves to an ACTIVE, verdict-capable
  // Anthropic model, not that one particular string survived.
  it("spec §24 smoke: execution slot resolves to the active default model", async () => {
    const sel = await selectModel(db(), { roleSlot: "execution" });
    expect(sel.modelId).toBe(registryDefaults.execution);
    const row = await sql<{ status: string; banned: boolean; mechanical_only: boolean }>`
      SELECT status, banned, mechanical_only FROM model_catalog WHERE id = ${sel.modelId}
    `.execute(db());
    expect(row.rows[0]).toMatchObject({ status: "active", banned: false, mechanical_only: false });
  });

  it("writes a routing_decision row per selection (decision_log)", async () => {
    const before = await sql<{ n: string }>`
      SELECT count(*) AS n FROM decision_log WHERE decision = 'routing_decision'
    `.execute(db());
    const sel = await selectModel(db(), { roleSlot: "qa" });
    expect(sel.decisionId).toBeGreaterThan(0);
    const after = await sql<{ n: string }>`
      SELECT count(*) AS n FROM decision_log WHERE decision = 'routing_decision'
    `.execute(db());
    expect(Number(after.rows[0].n)).toBe(Number(before.rows[0].n) + 1);
    const row = await sql<{ decided_by: string; outcome: string; rationale: string }>`
      SELECT decided_by, outcome, rationale FROM decision_log WHERE id = ${sel.decisionId}
    `.execute(db());
    expect(row.rows[0]).toMatchObject({ decided_by: "orchestrator", outcome: "selected" });
    expect(row.rows[0].rationale).toContain("slot=qa");
  });

  it("eliminates a mechanical_only model on a verdict-capable slot (R2)", async () => {
    await sql`
      INSERT INTO routing_rules (task_class, match, model_tier, model, mode, effort,
        needs_council, priority, enabled, model_id, role_slot)
      VALUES ('slot.review', '{}'::jsonb, 'L4', 'claude-haiku-4-5', 'subscription',
              'medium', false, 9900, true, 'claude-haiku-4-5', 'review')
    `.execute(db());
    try {
      const sel = await selectModel(db(), { roleSlot: "review" });
      expect(sel.modelId).toBe(registryDefaults.review); // haiku skipped
      expect(JSON.stringify(sel.considered)).toContain("mechanical_only");
    } finally {
      await sql`DELETE FROM routing_rules WHERE role_slot = 'review' AND priority = 9900`.execute(db());
    }
  });

  it("banned flag eliminates a candidate (mechanism proof — Sonnet stays free)", async () => {
    await sql`
      INSERT INTO model_catalog (id, provider, status, display_name, banned)
      VALUES ('test-e7-banned', 'anthropic', 'active', 'Banned Probe', true)
    `.execute(db());
    await sql`
      INSERT INTO routing_rules (task_class, match, model_tier, model, mode, effort,
        needs_council, priority, enabled, model_id, role_slot)
      VALUES ('slot.coding', '{}'::jsonb, 'L1', 'test-e7-banned', 'subscription',
              'medium', false, 9900, true, 'test-e7-banned', 'coding')
    `.execute(db());
    try {
      const sel = await selectModel(db(), { roleSlot: "coding" });
      expect(sel.modelId).toBe(registryDefaults.coding);
      expect(JSON.stringify(sel.considered)).toContain("banned");
      // Sonnet itself is NOT banned (CEO decision 2026-07-12):
      const sonnet = await sql<{ banned: boolean }>`
        SELECT banned FROM model_catalog WHERE id = 'claude-sonnet-5'
      `.execute(db());
      expect(sonnet.rows[0].banned).toBe(false);
    } finally {
      await sql`DELETE FROM routing_rules WHERE model_id = 'test-e7-banned'`.execute(db());
      await sql`DELETE FROM model_catalog WHERE id = 'test-e7-banned'`.execute(db());
    }
  });
});

describe("E7.1 — fallback chain (R4: deterministic, logged)", () => {
  // U20 (2026-07-25): the 'claude-opus-4-8' rung was retired, so fable-5's
  // next hop is now whatever model_catalog.fallback_of actually points at. The
  // assertion reads that pointer instead of a literal — the mechanism (walk one
  // rung, log routing_fallback, name both ends in the rationale) is what this
  // test owns; WHICH model is next is a CEO/catalog decision, not test truth.
  it("fable-5 failure on critical_decision walks one catalog rung, logs routing_fallback", async () => {
    const next = await sql<{ fallback_of: string }>`
      SELECT fallback_of FROM model_catalog WHERE id = 'fable-5'
    `.execute(db());
    const expected = next.rows[0].fallback_of;
    expect(expected, "fable-5 must still declare a next rung").toBeTruthy();
    const fb = await fallbackModel(db(), {
      failedModelId: "fable-5",
      roleSlot: "critical_decision",
      reason: "test: simulated timeout",
    });
    expect(fb.modelId).toBe(expected);
    const row = await sql<{ decision: string; outcome: string; rationale: string }>`
      SELECT decision, outcome, rationale FROM decision_log WHERE id = ${fb.decisionId}
    `.execute(db());
    expect(row.rows[0]).toMatchObject({ decision: "routing_fallback", outcome: "selected" });
    expect(row.rows[0].rationale).toContain(`fable-5 → ${expected}`);
  });

  it("chain exhaustion is a loud CHAIN_EXHAUSTED, logged blocked_no_model", async () => {
    await expect(
      fallbackModel(db(), { failedModelId: "claude-sonnet-5", roleSlot: "review" }),
    ).rejects.toThrowError(RoutingRefusedError);
    const row = await sql<{ n: string }>`
      SELECT count(*) AS n FROM decision_log
       WHERE decision = 'routing_fallback' AND outcome = 'blocked_no_model'
    `.execute(db());
    expect(Number(row.rows[0].n)).toBeGreaterThan(0);
  });
});

describe("E7.1 — budget hard-stop gate (COST intersection)", () => {
  it("refuses non-critical selection under hard-stop; critical class passes", async () => {
    await sql`UPDATE budget_state SET hard_stopped = true`.execute(db());
    try {
      await expect(selectModel(db(), { roleSlot: "execution" })).rejects.toMatchObject({
        code: "BUDGET_HARD_STOP",
      });
      const critical = await selectModel(db(), { roleSlot: "execution", critical: true });
      expect(critical.modelId).toBe(registryDefaults.execution);
    } finally {
      await sql`UPDATE budget_state SET hard_stopped = false`.execute(db());
    }
  });
});
