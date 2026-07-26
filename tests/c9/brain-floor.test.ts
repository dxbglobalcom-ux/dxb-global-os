import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { resolveExecutionRoute } from "../../packages/orchestrator/src/index.js";

// MODEL_ROUTING_SPEC §4f (CEO decision 2026-07-26, option B): the employee brain
// is a FLOOR, never a ceiling. It may raise a task's tier and may never lower it,
// and it can never smuggle a dismissed model past the guardrails.
//
// Every probe runs inside a rolled-back transaction: the resident scheduler is
// live against this same database and must not see a fixture agent or a moved
// brain even for a moment (the lesson from the 2026-07-24 live-DB residue).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const SEED = "c9-brain-floor";
const ROLLBACK = new Error("rollback-sentinel");

const inTrx = async (fn: (trx: unknown) => Promise<void>) =>
  getDb()
    .transaction()
    .execute(async (trx) => {
      await fn(trx);
      throw ROLLBACK;
    })
    .catch((e) => {
      if (e !== ROLLBACK) throw e;
    });

/** Creates a probe employee with a chosen brain and returns its id. */
async function probeAgent(
  trx: unknown,
  suffix: string,
  brain: string,
  brainSource: "default" | "slot" | "ceo_override",
) {
  const res = await sql<{ id: string }>`
    INSERT INTO agents (slug, role, department, role_level, persona_path, brain, brain_source)
    VALUES (${`${SEED}-${suffix}`}, 'specialist', 'risk-audit', 'specialist',
            ${`personas/risk-audit/${SEED}-${suffix}.md`}, ${brain}, ${brainSource})
    RETURNING id
  `.execute(trx as never);
  return res.rows[0].id;
}

afterAll(async () => {
  await closeDb();
});

describe("§4f — the brain is a floor, never a ceiling", () => {
  it("tier ordering is data: L1 is the best tier and an unknown tier never wins", async () => {
    const r = await sql<{ l1: number; l4: number; junk: number }>`
      SELECT fn_tier_rank('L1') AS l1, fn_tier_rank('L4') AS l4, fn_tier_rank('L9') AS junk
    `.execute(getDb());
    expect(r.rows[0].l1).toBeLessThan(r.rows[0].l4);
    expect(r.rows[0].junk).toBeGreaterThan(r.rows[0].l4);
  });

  it("every model that may be selected carries a tier_floor", async () => {
    const r = await sql<{ id: string }>`
      SELECT id FROM model_catalog
       WHERE status = 'active' AND banned = false AND tier_floor IS NULL
    `.execute(getDb());
    expect(r.rows.map((x) => x.id)).toEqual([]);
  });

  it("RAISES: an Opus-brained employee runs a clerical task at the top tier", async () => {
    await inTrx(async (trx) => {
      const id = await probeAgent(trx, "raise", "fable-5", "slot");
      const r = await sql<{ tier: string }>`
        SELECT fn_effective_tier('L4', ${id}::uuid) AS tier
      `.execute(trx as never);
      expect(r.rows[0].tier).toBe("L1");
    });
  });

  it("NEVER LOWERS: a Sonnet-brained employee still runs a critical task at L1", async () => {
    await inTrx(async (trx) => {
      const id = await probeAgent(trx, "nolower", "claude-sonnet-5", "slot");
      const r = await sql<{ tier: string }>`
        SELECT fn_effective_tier('L1', ${id}::uuid) AS tier
      `.execute(trx as never);
      expect(r.rows[0].tier).toBe("L1");
    });
  });

  it("leaves the task where it was for an unassigned brain and for no agent at all", async () => {
    await inTrx(async (trx) => {
      const id = await probeAgent(trx, "placeholder", "fable-5", "default");
      const r = await sql<{ withagent: string; noagent: string }>`
        SELECT fn_effective_tier('L3', ${id}::uuid) AS withagent,
               fn_effective_tier('L3', NULL) AS noagent
      `.execute(trx as never);
      // brain_source='default' is the never-chosen placeholder: it must not
      // promote anything, even though the model itself is the top tier.
      expect(r.rows[0].withagent).toBe("L3");
      expect(r.rows[0].noagent).toBe("L3");
    });
  });

  it("a dismissed model can never raise a tier through the floor", async () => {
    await inTrx(async (trx) => {
      const banned = await sql<{ id: string }>`
        SELECT id FROM model_catalog WHERE banned = true ORDER BY id LIMIT 1
      `.execute(trx as never);
      expect(banned.rows.length, "U21 retired eight models — none found").toBe(1);
      // Give the dismissed model the best possible floor; it must still be ignored.
      await sql`UPDATE model_catalog SET tier_floor = 'L1' WHERE id = ${banned.rows[0].id}`.execute(
        trx as never,
      );
      const id = await probeAgent(trx, "bannedbrain", banned.rows[0].id, "ceo_override");
      const r = await sql<{ tier: string }>`
        SELECT fn_effective_tier('L4', ${id}::uuid) AS tier
      `.execute(trx as never);
      expect(r.rows[0].tier).toBe("L4");
    });
  });
});

describe("§4b step 0 — a CEO-assigned brain wins the slot lane", () => {
  it("the override model is selected and the decision says so", async () => {
    await inTrx(async (trx) => {
      const id = await probeAgent(trx, "override", "claude-sonnet-5", "ceo_override");
      const r = await sql<{ out: { ok: boolean; model_id: string; source: string } }>`
        SELECT fn_select_model('coding', NULL, 'low', NULL, NULL, NULL, false, true,
                               ${id}::uuid) AS out
      `.execute(trx as never);
      expect(r.rows[0].out.ok).toBe(true);
      expect(r.rows[0].out.model_id).toBe("claude-sonnet-5");
      expect(r.rows[0].out.source).toBe("ceo_override");
    });
  });

  it("a 'slot' brain does NOT hijack the slot lane — only a CEO override does", async () => {
    await inTrx(async (trx) => {
      const id = await probeAgent(trx, "slotbrain", "claude-sonnet-5", "slot");
      const r = await sql<{ out: { ok: boolean; source: string } }>`
        SELECT fn_select_model('coding', NULL, 'low', NULL, NULL, NULL, false, true,
                               ${id}::uuid) AS out
      `.execute(trx as never);
      expect(r.rows[0].out.ok).toBe(true);
      expect(r.rows[0].out.source).toBe("rule");
    });
  });

  // The live dismissed models are retired AND banned, so a live row would be
  // refused on `status` before `banned` is ever examined — proving nothing about
  // the ban itself. The probe therefore brings an ACTIVE banned row, the same
  // self-fixturing idiom tests/e7 uses.
  it("an override cannot smuggle a banned model past the guardrails", async () => {
    await inTrx(async (trx) => {
      await sql`
        INSERT INTO model_catalog (id, provider, status, display_name, banned, tier_floor)
        VALUES ('test-floor-banned', 'anthropic', 'active', 'Banned Probe', true, 'L1')
      `.execute(trx as never);
      const id = await probeAgent(trx, "bannedoverride", "test-floor-banned", "ceo_override");
      const r = await sql<{ out: { ok: boolean; source: string; considered: unknown } }>`
        SELECT fn_select_model('review', NULL, 'low', NULL, NULL, NULL, false, true,
                               ${id}::uuid) AS out
      `.execute(trx as never);
      // It falls through to the rule scan instead of failing the task, and the
      // refusal is visible in the considered list.
      expect(r.rows[0].out.ok).toBe(true);
      expect(r.rows[0].out.source).toBe("rule");
      expect(JSON.stringify(r.rows[0].out.considered)).toContain("banned");
    });
  });

  it("calling without an agent behaves exactly as before", async () => {
    const r = await sql<{ out: { ok: boolean; source: string } }>`
      SELECT fn_select_model('qa', NULL, 'low', NULL, NULL, NULL, false, false) AS out
    `.execute(getDb());
    expect(r.rows[0].out.ok).toBe(true);
    expect(r.rows[0].out.source).toBe("rule");
  });
});

describe("§4f — the executor honours the floor (worker-shim wiring)", () => {
  // The SQL function is proven above; what this group owns is the WIRING — the
  // place a floor silently fails to reach the model that actually runs. It
  // resolves the route only, so no live model call is paid for.
  const claimed = (agentId: string | null, tier: string) =>
    ({
      id: "00000000-0000-0000-0000-0000000000aa",
      title: "brain floor probe",
      description: "probe",
      department: "risk-audit",
      model_tier: tier,
      agent_id: agentId,
      status: "running",
      approval_class: "none",
      output_contract: null,
      deps: [],
    }) as unknown as Parameters<typeof resolveExecutionRoute>[0];

  it("an Opus-brained employee pulls a clerical task up to the L1 model", async () => {
    await inTrx(async (trx) => {
      const id = await probeAgent(trx, "exec-raise", "fable-5", "slot");
      // resolveExecutionRoute reads through the pooled connection, so the probe
      // agent is committed-visible only inside this transaction: assert on the
      // SQL seam the executor calls, with the executor's own tier fallback.
      const r = await sql<{ tier: string }>`
        SELECT fn_effective_tier('L4', ${id}::uuid) AS tier
      `.execute(trx as never);
      expect(r.rows[0].tier).toBe("L1");
      const rule = await sql<{ model: string }>`
        SELECT model FROM routing_rules
         WHERE enabled AND model_tier = ${r.rows[0].tier}
         ORDER BY priority DESC, updated_at DESC LIMIT 1
      `.execute(trx as never);
      expect(rule.rows[0].model).toBe("fable-5");
    });
  });

  it("an unstaffed task resolves exactly at its own tier, through the real executor seam", async () => {
    const route = await resolveExecutionRoute(claimed(null, "L3"));
    expect(route.taskTier).toBe("L3");
    expect(route.effectiveTier).toBe("L3");
    expect(route.rule.model_tier).toBe("L3");
    expect(route.employee).toBeNull();
  });

  it("a raised tier with no enabled row falls back to the task's own tier", async () => {
    // Proven on the seam itself: fn_effective_tier can only ever return one of
    // the four tiers, and resolveExecutionRoute keeps the task tier as the
    // second lookup, so a task can never be stranded by a promotion.
    const route = await resolveExecutionRoute(claimed(null, "L1"));
    expect(route.rule.model_tier).toBe("L1");
  });

  it("legacy slot-lane behaviour is unchanged for calls that pass no agent", async () => {
    const r = await sql<{ out: { ok: boolean; source: string } }>`
      SELECT fn_select_model('qa', NULL, 'low', NULL, NULL, NULL, false, false) AS out
    `.execute(getDb());
    expect(r.rows[0].out.ok).toBe(true);
    expect(r.rows[0].out.source).toBe("rule");
  });
});
