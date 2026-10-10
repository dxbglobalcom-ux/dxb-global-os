import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// B51 step 3 · P2 (CEO 2026-10-09: "'hey opus 6 çıkmış ey hamza' dediğimde cart diye modeller
// güncellenmeli"). ONE audited door moves every seat a model holds to its successor in one transaction —
// routing rows, employees' brains (his own choices too: a seat left on a retired model could never run
// again), model settings and their registered defaults, the gate's judges, the fallback chain — retires
// the old row, and one call undoes it all.
//
// Every probe runs inside a rolled-back transaction: the resident scheduler is live against this engine
// and must never see a probe model or a moved brain.

const SEED = "b51-succ";
const ROLLBACK = new Error("rollback-sentinel");

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

afterAll(async () => {
  await closeDb();
});

type Resp = {
  ok: boolean;
  error?: string;
  detail?: string;
  audit_id?: number;
  moved?: Record<string, number>;
  price?: { old: { cost_in: number | null }; new: { cost_in: number | null }; price_known: boolean; price_rises: boolean };
  restored?: Record<string, number>;
  skipped?: number;
};

const succeed = async (trx: never, oldId: string, newId: string, key: string, authority = "policy:b51-probe") =>
  (
    await sql<{ r: Resp }>`SELECT fn_succeed_model(${oldId}, ${newId}, 'probe succession', ${authority}, ${key}) AS r`.execute(trx)
  ).rows[0].r;

const undo = async (trx: never, auditId: number, key: string) =>
  (await sql<{ r: Resp }>`SELECT fn_undo_succession(${auditId}, ${key}) AS r`.execute(trx)).rows[0].r;

const one = async <T>(trx: never, q: ReturnType<typeof sql<T>>) => (await q.execute(trx)).rows[0];

/** Two probe models on one lane, the old one with a fallback; returns nothing — ids are SEED-derived. */
async function probeModels(trx: never, lane: "agent-sdk" | "codex-cli", newStatus = "testing") {
  await sql`
    INSERT INTO model_catalog (id, provider, status, display_name, banned, mechanical_only, tier_floor,
                               api_model_id, lane, family, fallback_of)
    VALUES (${`${SEED}-old`}, 'anthropic', 'active', 'Probe Old', false, false, 'L1',
            ${`${SEED}-old`}, ${lane}, 'probe', 'claude-sonnet-5'),
           (${`${SEED}-new`}, 'anthropic', ${newStatus}, 'Probe New', false, false, 'L1',
            ${`${SEED}-new`}, ${lane}, 'probe', NULL),
           (${`${SEED}-child`}, 'anthropic', 'active', 'Probe Child', false, false, 'L1',
            ${`${SEED}-child`}, ${lane}, 'probe', ${`${SEED}-old`})
  `.execute(trx);
  // the successor has answered its live call (B2) — the door's other laws are what these probes test
  await sql`UPDATE model_catalog SET smoke_ok_at = now(), smoke_cli = 'probe' WHERE id = ${`${SEED}-new`}`.execute(trx);
}

async function probeAgent(trx: never, suffix: string, brain: string, brainSource: string) {
  return (
    await sql<{ id: string }>`
      INSERT INTO agents (slug, role, department, role_level, persona_path, brain, brain_source)
      VALUES (${`${SEED}-${suffix}`}, 'specialist', 'risk-audit', 'specialist',
              ${`personas/risk-audit/${SEED}-${suffix}.md`}, ${brain}, ${brainSource})
      RETURNING id
    `.execute(trx)
  ).rows[0].id;
}

describe("P2 — the succession door", () => {
  it("moves every seat of the old model to the new one, retires the old, and undo puts it all back", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      const ruleOn = (
        await sql<{ id: string }>`
          INSERT INTO routing_rules (task_class, match, model_tier, model, model_id, mode, effort, priority, enabled)
          VALUES (${`${SEED}.on`}, '{}', 'L4', ${`${SEED}-old`}, ${`${SEED}-old`}, 'subscription', 'low', -50, true),
                 (${`${SEED}.off`}, '{}', 'L4', ${`${SEED}-old`}, ${`${SEED}-old`}, 'subscription', 'low', -50, false)
          RETURNING id
        `.execute(trx)
      ).rows.map((r) => r.id);
      const slotSeat = await probeAgent(trx, "slot", `${SEED}-old`, "slot");
      const ceoSeat = await probeAgent(trx, "ceo", `${SEED}-old`, "ceo_override");
      const bystander = await probeAgent(trx, "other", "claude-sonnet-5", "slot");
      await sql`
        INSERT INTO settings_registry (key, category, value_schema, risk, requires_approval, cost_impact,
                                       affected_areas, description_en, description_tr, locked, scope_types, delegate)
        VALUES (${`${SEED}.model`}, 'models', ${JSON.stringify({ type: "model_ref", default: `${SEED}-old` })}::jsonb,
                'low', false, 'neutral', '{probe}', 'probe', 'probe', false, '{global,employee}', NULL)
      `.execute(trx);
      await sql`
        INSERT INTO settings_values (key, scope, value, updated_by)
        VALUES (${`${SEED}.model`}, ${`employee:${slotSeat}`}, ${JSON.stringify(`${SEED}-old`)}::jsonb, 'probe')
      `.execute(trx);

      const r = await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k1`);
      expect(r).toMatchObject({ ok: true });
      expect(r.moved).toMatchObject({ routing: 2, agents: 2, ceo_override: 1, settings: 1, registry: 1, fallbacks: 2 });

      const cat = await sql<{ id: string; status: string; succeeds: string | null; fallback_of: string | null }>`
        SELECT id, status, succeeds, fallback_of FROM model_catalog WHERE id LIKE ${`${SEED}-%`} ORDER BY id
      `.execute(trx);
      const by = Object.fromEntries(cat.rows.map((c) => [c.id, c]));
      expect(by[`${SEED}-old`].status).toBe("retired");
      expect(by[`${SEED}-new`]).toMatchObject({ status: "active", succeeds: `${SEED}-old`, fallback_of: "claude-sonnet-5" });
      expect(by[`${SEED}-child`].fallback_of).toBe(`${SEED}-new`);

      const rules = await sql<{ model: string; model_id: string }>`
        SELECT model, model_id FROM routing_rules WHERE id = ANY (${ruleOn}::uuid[])
      `.execute(trx);
      expect(rules.rows.every((x) => x.model === `${SEED}-new` && x.model_id === `${SEED}-new`)).toBe(true);
      const brains = await sql<{ id: string; brain: string; brain_source: string }>`
        SELECT id, brain, brain_source FROM agents WHERE id = ANY (${[slotSeat, ceoSeat, bystander]}::uuid[])
      `.execute(trx);
      const b = Object.fromEntries(brains.rows.map((x) => [x.id, x]));
      expect(b[slotSeat]).toMatchObject({ brain: `${SEED}-new`, brain_source: "slot" });
      expect(b[ceoSeat]).toMatchObject({ brain: `${SEED}-new`, brain_source: "ceo_override" });
      expect(b[bystander].brain).toBe("claude-sonnet-5");
      expect(
        (await one(trx, sql<{ v: unknown }>`SELECT value AS v FROM settings_values WHERE key = ${`${SEED}.model`}`)).v,
      ).toBe(`${SEED}-new`);
      expect(
        (await one(trx, sql<{ d: unknown }>`SELECT value_schema->'default' AS d FROM settings_registry WHERE key = ${`${SEED}.model`}`)).d,
      ).toBe(`${SEED}-new`);
      const log = await one(
        trx,
        sql<{ n: number }>`SELECT count(*)::int AS n FROM settings_change_log
                            WHERE key = ${`${SEED}.model`} AND change_source = 'succession'`,
      );
      expect(log.n).toBe(1);
      const decided = await one(
        trx,
        sql<{ n: number }>`SELECT count(*)::int AS n FROM decision_log
                            WHERE decision = 'model_succession' AND rationale LIKE ${`%${SEED}-old%`}`,
      );
      expect(decided.n).toBe(1);

      // the same key again: the stored answer, nothing moves twice
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k1`)).toEqual(r);

      const u = await undo(trx, r.audit_id!, `${SEED}-u1`);
      expect(u).toMatchObject({ ok: true, skipped: 0 });
      const after = await sql<{ id: string; status: string; succeeds: string | null; fallback_of: string | null }>`
        SELECT id, status, succeeds, fallback_of FROM model_catalog WHERE id LIKE ${`${SEED}-%`} ORDER BY id
      `.execute(trx);
      const a = Object.fromEntries(after.rows.map((c) => [c.id, c]));
      expect(a[`${SEED}-old`]).toMatchObject({ status: "active", fallback_of: "claude-sonnet-5" });
      expect(a[`${SEED}-new`]).toMatchObject({ status: "testing", succeeds: null, fallback_of: null });
      expect(a[`${SEED}-child`].fallback_of).toBe(`${SEED}-old`);
      const back = await sql<{ brain: string; brain_source: string }>`
        SELECT brain, brain_source FROM agents WHERE id = ANY (${[slotSeat, ceoSeat]}::uuid[])
      `.execute(trx);
      expect(back.rows.every((x) => x.brain === `${SEED}-old`)).toBe(true);
      const rulesBack = await sql<{ model: string }>`SELECT model FROM routing_rules WHERE id = ANY (${ruleOn}::uuid[])`.execute(trx);
      expect(rulesBack.rows.every((x) => x.model === `${SEED}-old`)).toBe(true);
      expect(
        (await one(trx, sql<{ v: unknown }>`SELECT value AS v FROM settings_values WHERE key = ${`${SEED}.model`}`)).v,
      ).toBe(`${SEED}-old`);
      expect(
        (await one(trx, sql<{ d: unknown }>`SELECT value_schema->'default' AS d FROM settings_registry WHERE key = ${`${SEED}.model`}`)).d,
      ).toBe(`${SEED}-old`);

      // a second undo changes nothing
      expect((await undo(trx, r.audit_id!, `${SEED}-u2`)).restored).toMatchObject({ routing: 0, agents: 0 });

      // and after an undo the same succession can be made again, as a new record
      const again = await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k1b`);
      expect(again).toMatchObject({ ok: true, moved: { routing: 2, agents: 2 } });
      expect(again.audit_id).not.toBe(r.audit_id);
    });
  });

  it("undo leaves alone a seat someone moved again after the succession, and says so", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      const seat = await probeAgent(trx, "moved", `${SEED}-old`, "slot");
      const r = await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k2`);
      expect(r.ok).toBe(true);
      await sql`UPDATE agents SET brain = 'claude-sonnet-5' WHERE id = ${seat}`.execute(trx);
      const u = await undo(trx, r.audit_id!, `${SEED}-u3`);
      expect(u).toMatchObject({ ok: true, skipped: 1 });
      expect((await one(trx, sql<{ brain: string }>`SELECT brain FROM agents WHERE id = ${seat}`)).brain).toBe("claude-sonnet-5");
    });
  });

  it("the gate's judges move with a Codex-lane succession", async () => {
    await inTrx(async (trx) => {
      await sql`
        INSERT INTO model_catalog (id, provider, status, display_name, banned, mechanical_only, tier_floor, api_model_id, lane, family, smoke_ok_at, smoke_cli)
        VALUES (${`${SEED}-astra7`}, 'openai', 'testing', 'Astra 7', false, false, 'L1', ${`${SEED}-astra7`}, 'codex-cli', 'gpt-astra', now(), 'probe')
      `.execute(trx);
      const r = await succeed(trx, "gpt-6-astra", `${SEED}-astra7`, `${SEED}-k3`);
      expect(r).toMatchObject({ ok: true, moved: { gate_seats: 1 } });
      const seats = await one(
        trx,
        sql<{ v: { model: string; effort: string }[] }>`SELECT value AS v FROM settings_values WHERE key = 'gate.challengers' AND scope = 'global'`,
      );
      expect(seats.v).toEqual([
        { model: "gpt-6.1-sol", effort: "high" },
        { model: `${SEED}-astra7`, effort: "high" },
      ]);
      const u = await undo(trx, r.audit_id!, `${SEED}-u4`);
      expect(u.ok).toBe(true);
      const restored = await one(
        trx,
        sql<{ v: { model: string }[] }>`SELECT value AS v FROM settings_values WHERE key = 'gate.challengers' AND scope = 'global'`,
      );
      expect(restored.v.map((s) => s.model)).toEqual(["gpt-6.1-sol", "gpt-6-astra"]);
    });
  });

  it("refuses what would leave a seat unable to run: another lane, a retired or banned successor, itself", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      expect(await succeed(trx, `${SEED}-old`, "gpt-6.1-sol", `${SEED}-k4`)).toMatchObject({ ok: false, error: "LANE_MISMATCH" });
      expect(await succeed(trx, `${SEED}-old`, "claude-opus-4-8", `${SEED}-k5`)).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-old`, `${SEED}-k6`)).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      expect(await succeed(trx, "no-such-model", `${SEED}-new`, `${SEED}-k7`)).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      // the laws the routing keeps are not bypassed: R2 (mechanical-only never takes verdict seats) and the floor
      await sql`
        INSERT INTO model_catalog (id, provider, status, display_name, banned, mechanical_only, tier_floor, api_model_id, lane, family)
        VALUES (${`${SEED}-mech`}, 'anthropic', 'testing', 'Probe Mechanical', false, true, 'L4', ${`${SEED}-mech`}, 'agent-sdk', 'probe'),
               (${`${SEED}-l2`}, 'anthropic', 'testing', 'Probe L2', false, false, 'L2', ${`${SEED}-l2`}, 'agent-sdk', 'probe'),
               (${`${SEED}-deg`}, 'anthropic', 'degraded', 'Probe Degraded', false, false, 'L1', ${`${SEED}-deg`}, 'agent-sdk', 'probe')
      `.execute(trx);
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-mech`, `${SEED}-k14`)).toMatchObject({ ok: false, error: "MECHANICAL_ONLY" });
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-l2`, `${SEED}-k15`)).toMatchObject({ ok: false, error: "TIER_FLOOR" });
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-deg`, `${SEED}-k16`)).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      // a successor without the name its lane is called with could never run
      await sql`UPDATE model_catalog SET api_model_id = NULL WHERE id = ${`${SEED}-new`}`.execute(trx);
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k9`)).toMatchObject({
        ok: false, error: "VALIDATION_FAILED", detail: expect.stringMatching(/no API name/),
      });
    });
  });

  it("names whose word moves the seats; the system moves them only on his word or a written policy", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k10`, "")).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k11`, "because")).toMatchObject({ ok: false, error: "PERMISSION_DENIED" });
      const r = await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k12`, "ceo-approvals:probe");
      expect(r.ok).toBe(true);
      const row = await one(trx, sql<{ a: string }>`SELECT payload->>'authority' AS a FROM audit_log WHERE id = ${r.audit_id!}`);
      expect(row.a).toBe("ceo-approvals:probe");
    });
  });

  it("says what the successor costs beside the old one; it does not decide", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      await sql`UPDATE model_catalog SET cost_in_per_mtok = 5, cost_out_per_mtok = 25 WHERE id = ${`${SEED}-old`}`.execute(trx);
      await sql`UPDATE model_catalog SET cost_in_per_mtok = 4, cost_out_per_mtok = 20 WHERE id = ${`${SEED}-new`}`.execute(trx);
      const r = await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-k13`);
      expect(r.price).toMatchObject({ price_known: true, price_rises: false });
      expect(Number(r.price!.old.cost_in)).toBe(5);
      expect(Number(r.price!.new.cost_in)).toBe(4);
      // an unpriced pair says it does not know, rather than "the same"
      await sql`
        INSERT INTO model_catalog (id, provider, status, display_name, banned, mechanical_only, tier_floor, api_model_id, lane, family, smoke_ok_at, smoke_cli)
        VALUES (${`${SEED}-unpriced`}, 'anthropic', 'testing', 'Probe Unpriced', false, false, 'L1', ${`${SEED}-unpriced`}, 'agent-sdk', 'probe', now(), 'probe')
      `.execute(trx);
      const u = await succeed(trx, `${SEED}-new`, `${SEED}-unpriced`, `${SEED}-k17`);
      expect(u.price).toMatchObject({ price_known: false });
    });
  });

  it("nobody but the CEO and the company's own system may call it", async () => {
    await inTrx(async (trx) => {
      await sql`SET LOCAL ROLE anon`.execute(trx);
      await expect(succeed(trx, "fable-5", "claude-opus-5-5", `${SEED}-k8`)).rejects.toThrow(/permission denied/);
    });
    const acl = await sql<{ anon: boolean; pub: boolean }>`
      SELECT has_function_privilege('anon', 'fn_succeed_model(text,text,text,text,text)', 'EXECUTE') AS anon,
             has_function_privilege('anon', 'fn_undo_succession(bigint,text)', 'EXECUTE') AS pub
    `.execute(getDb());
    expect(acl.rows[0]).toEqual({ anon: false, pub: false });
  });
});

describe("B2 — a successor answers one live call before the door moves a seat onto it", () => {
  it("refuses a successor that never answered, and moves nothing", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      await sql`UPDATE model_catalog SET smoke_ok_at = NULL, smoke_cli = NULL WHERE id = ${`${SEED}-new`}`.execute(trx);
      const seat = await probeAgent(trx, "smoke", `${SEED}-old`, "slot");
      expect(await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-s1`)).toMatchObject({
        ok: false, error: "SMOKE_REQUIRED", detail: expect.stringMatching(/scripts\/models\/smoke\.mjs/),
      });
      const after = await one(trx, sql<{ brain: string; old: string; neu: string }>`
        SELECT (SELECT brain FROM agents WHERE id = ${seat}) AS brain,
               (SELECT status FROM model_catalog WHERE id = ${`${SEED}-old`}) AS old,
               (SELECT status FROM model_catalog WHERE id = ${`${SEED}-new`}) AS neu`);
      expect(after).toEqual({ brain: `${SEED}-old`, old: "active", neu: "testing" });
    });
  });

  it("the company's own system stamps a passing call, with its CLI and an audit row; the door then opens", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      await sql`UPDATE model_catalog SET smoke_ok_at = NULL, smoke_cli = NULL WHERE id = ${`${SEED}-new`}`.execute(trx);
      const s = (
        await sql<{ r: { ok: boolean; audit_id: number } }>`
          SELECT fn_model_smoke_passed(${`${SEED}-new`}, '2.1.296', '{"served":"probe"}'::jsonb) AS r`.execute(trx)
      ).rows[0].r;
      expect(s.ok).toBe(true);
      const row = await one(trx, sql<{ cli: string; stamped: boolean; action: string; actor: string; before: unknown }>`
        SELECT c.smoke_cli AS cli, c.smoke_ok_at IS NOT NULL AS stamped, a.action, a.actor, a.payload->'before'->'smoke_ok_at' AS before
          FROM model_catalog c, audit_log a WHERE c.id = ${`${SEED}-new`} AND a.id = ${s.audit_id}`);
      expect(row).toEqual({ cli: "2.1.296", stamped: true, action: "model.smoke", actor: "system", before: null });
      expect((await succeed(trx, `${SEED}-old`, `${SEED}-new`, `${SEED}-s2`)).ok).toBe(true);
      // a retired or unknown model is not stamped
      const r = (await sql<{ r: { ok: boolean; error: string } }>`SELECT fn_model_smoke_passed(${`${SEED}-old`}, '2.1.296', NULL) AS r`.execute(trx)).rows[0].r;
      expect(r).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      const c = (await sql<{ r: { ok: boolean; error: string } }>`SELECT fn_model_smoke_passed(${`${SEED}-new`}, '', NULL) AS r`.execute(trx)).rows[0].r;
      expect(c).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
      // a stamp from a recorded call carries that call's time, never the stamping's — and never a time to come
      const at = "2026-10-10T01:05:50Z";
      expect((await sql<{ r: { ok: boolean } }>`SELECT fn_model_smoke_passed(${`${SEED}-new`}, '2.1.296', '{"recorded":"probe"}'::jsonb, ${at}::timestamptz) AS r`.execute(trx)).rows[0].r.ok).toBe(true);
      const t = await one(trx, sql<{ same: boolean }>`SELECT smoke_ok_at = ${at}::timestamptz AS same FROM model_catalog WHERE id = ${`${SEED}-new`}`);
      expect(t.same).toBe(true);
      const f = (await sql<{ r: { ok: boolean; error: string } }>`SELECT fn_model_smoke_passed(${`${SEED}-new`}, '2.1.296', NULL, now() + interval '1 hour') AS r`.execute(trx)).rows[0].r;
      expect(f).toMatchObject({ ok: false, error: "VALIDATION_FAILED" });
    });
  });

  it("a dashboard session cannot attest a call that did not happen; anon and authenticated hold no EXECUTE", async () => {
    await inTrx(async (trx) => {
      await probeModels(trx, "agent-sdk");
      await sql`SELECT set_config('request.jwt.claims', '{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001"}', true)`.execute(trx);
      const r = (await sql<{ r: { ok: boolean; error: string } }>`SELECT fn_model_smoke_passed(${`${SEED}-new`}, '2.1.296', NULL) AS r`.execute(trx)).rows[0].r;
      expect(r).toMatchObject({ ok: false, error: "PERMISSION_DENIED" });
    });
    const acl = await sql<{ anon: boolean; authn: boolean; svc: boolean }>`
      SELECT has_function_privilege('anon', 'fn_model_smoke_passed(text,text,jsonb,timestamptz)', 'EXECUTE') AS anon,
             has_function_privilege('authenticated', 'fn_model_smoke_passed(text,text,jsonb,timestamptz)', 'EXECUTE') AS authn,
             has_function_privilege('service_role', 'fn_model_smoke_passed(text,text,jsonb,timestamptz)', 'EXECUTE') AS svc
    `.execute(getDb());
    expect(acl.rows[0]).toEqual({ anon: false, authn: false, svc: true });
  });
});
