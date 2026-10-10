import { afterAll, describe, expect, it } from "vitest";
import { lstatSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  ModelRefusedError,
  modeOfLane,
  resolveModel,
  sdkModelId,
} from "../../packages/kernel/src/index.js";
import {
  loadGateSeats,
  runCriticalGate,
  seatsFrom,
  type ChallengerRunner,
} from "../../packages/orchestrator/src/index.js";
import { watchLedgers } from "../helpers/suite-scope.js";

// B51 step 3 · P1 (CEO 2026-10-09: "holding içindeki modeller her zaman güncellenmeye müsait olmalı …
// 'hey opus 6 çıkmış ey hamza' dediğimde cart diye modeller güncellenmeli"). Every model id the company
// calls lives in ONE place, the catalogue: routing rows and brains name catalogue ids, the catalogue
// carries the name each lane is called with, and the critical gate's two judges are a setting that names
// catalogue ids — so the succession door (P2) has one place to move, and nothing waits for a code change.

const ledgerScope = watchLedgers(() => getDb());
const db = () => getDb();
const startedAt = new Date();

afterAll(async () => {
  await sql`DELETE FROM alerts WHERE source = 'critical_gate' AND dedup_key LIKE 'gate-seat:%' AND at >= ${startedAt}`.execute(db());
  await ledgerScope.sweep({ decisions: [{ decidedBy: "orchestrator", decision: "critical_gate" }] });
  await closeDb();
});

const LIVE = ["active", "testing"];

describe("P1 — the catalogue is the one place", () => {
  it("(a) every live routing row and every live brain names a live catalogue id, never an alias", async () => {
    const rules = await sql<{ model: string; model_id: string | null; status: string | null; alias_of: string | null }>`
      SELECT r.model, r.model_id, c.status,
             (SELECT a.id FROM model_catalog a WHERE r.model = ANY (a.aliases) LIMIT 1) AS alias_of
        FROM routing_rules r LEFT JOIN model_catalog c ON c.id = r.model
       WHERE r.enabled
    `.execute(db());
    expect(rules.rows.length).toBeGreaterThan(0);
    for (const r of rules.rows) {
      expect(r.alias_of, `${r.model} is an alias`).toBeNull();
      expect(LIVE, `${r.model}`).toContain(r.status);
      expect(r.model_id, `${r.model}`).toBe(r.model);
    }
    const brains = await sql<{ brain: string; status: string | null; alias_of: string | null }>`
      SELECT DISTINCT a.brain, c.status,
             (SELECT x.id FROM model_catalog x WHERE a.brain = ANY (x.aliases) LIMIT 1) AS alias_of
        FROM agents a LEFT JOIN model_catalog c ON c.id = a.brain
       WHERE a.employment_status <> 'archived'
    `.execute(db());
    for (const b of brains.rows) {
      expect(b.alias_of, `${b.brain} is an alias`).toBeNull();
      expect(LIVE, `${b.brain}`).toContain(b.status);
    }
  });

  it("(a) agents.brain is held by a foreign key, and a new employee's default brain is live", async () => {
    const fk = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM pg_constraint
       WHERE conrelid = 'public.agents'::regclass AND contype = 'f' AND conname = 'agents_brain_fkey'
    `.execute(db());
    expect(fk.rows[0].n).toBe(1);
    const def = await sql<{ status: string }>`
      SELECT c.status FROM model_catalog c WHERE c.id = fn_default_brain()
    `.execute(db());
    expect(def.rows[0]?.status).toBe("active");
  });

  it("(b) every active model the company can call carries its lane and the name it is called with", async () => {
    const bad = await sql<{ id: string }>`
      SELECT id FROM model_catalog
       WHERE status = 'active' AND (lane IS NULL OR (lane <> 'local' AND api_model_id IS NULL))
    `.execute(db());
    expect(bad.rows.map((r) => r.id)).toEqual([]);
  });

  it("(b) the day's models are catalogued; Sonnet 5.5 took its seats (P4), Opus 5.5 waits for the SDK", async () => {
    const rows = await sql<{ id: string; status: string; lane: string; api_model_id: string; mechanical_only: boolean; display_name: string }>`
      SELECT id, status, lane, api_model_id, mechanical_only, display_name FROM model_catalog
       WHERE id IN ('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'gpt-6.1-sol', 'gpt-6-astra')
       ORDER BY id
    `.execute(db());
    const by = Object.fromEntries(rows.rows.map((r) => [r.id, r]));
    expect(by["claude-opus-5-5"]).toMatchObject({ status: "testing", lane: "agent-sdk", api_model_id: "claude-opus-5-5" });
    expect(by["claude-sonnet-5-5"]).toMatchObject({ status: "active", lane: "agent-sdk", api_model_id: "claude-sonnet-5-5" });
    expect(by["claude-haiku-5-5"]).toMatchObject({ status: "testing", mechanical_only: true });
    expect(by["gpt-6.1-sol"]).toMatchObject({ status: "active", lane: "codex-cli", display_name: "Sol 6.1" });
    expect(by["gpt-6-astra"]).toMatchObject({ status: "active", lane: "codex-cli", display_name: "Astra 6" });
  });

  it("(d) resolveModel resolves an alias to its row and refuses what may not be called", async () => {
    // an alias resolves to the row that carries it; a retired row is refused by its own name (the door writes
    // no alias: an old spelling never slides onto the successor — Sonnet 5 retired in P4)
    await expect(resolveModel(db(), "sonnet-5")).rejects.toThrow(/claude-sonnet-5 is retired/);
    expect((await resolveModel(db(), "opus-5")).apiModelId).toBe("claude-opus-5");
    expect(await resolveModel(db(), "claude-sonnet-5-5")).toMatchObject({
      id: "claude-sonnet-5-5", apiModelId: "claude-sonnet-5-5", lane: "agent-sdk", mode: "subscription",
    });
    await expect(resolveModel(db(), "glm-5.2")).rejects.toBeInstanceOf(ModelRefusedError); // retired + banned
    await expect(resolveModel(db(), "no-such-model")).rejects.toThrow(/not in the model catalogue/);
    await expect(sdkModelId(db(), "gpt-6.1-sol")).rejects.toThrow(/codex-cli lane/);
    expect(await sdkModelId(db(), "fable-5.1")).toBe("claude-fable-5-1");
  });

  it("(e) the mode comes from the lane: the subscriptions are agent-sdk and codex-cli", async () => {
    expect(modeOfLane("agent-sdk")).toBe("subscription");
    expect(modeOfLane("codex-cli")).toBe("subscription");
    expect(modeOfLane("litellm")).toBe("api");
    expect((await resolveModel(db(), "deepseek-v4-pro")).mode).toBe("api");
  });

  it("no model-name map is left in the source", () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        // dot-files (.env.local is a symlink the battery's sandbox leaves dangling) and links are not source
        if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
        const p = join(dir, name);
        const st = lstatSync(p);
        if (st.isSymbolicLink()) continue;
        if (st.isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(name)) {
          const text = readFileSync(p, "utf8");
          if (/SDK_MODEL_IDS\s*[[:=]|CRITICAL_GATE_CONFIG/.test(text)) hits.push(p);
        }
      }
    };
    for (const root of ["packages", "apps", "tools"]) walk(join(process.cwd(), root));
    expect(hits).toEqual([]);
  });
});

describe("P1.4 — the gate's two judges are one setting", () => {
  it("(c) gate.challengers holds two seats; the gate reads model, label and effort from it", async () => {
    const seats = await loadGateSeats();
    expect(seats).toEqual([
      { seat: 1, model: "gpt-6.1-sol", label: "Sol 6.1", apiModelId: "gpt-6.1-sol", effort: "high" },
      { seat: 2, model: "gpt-6-astra", label: "Astra 6", apiModelId: "gpt-6-astra", effort: "high" },
    ]);
    const seen: { model: string; effort: string }[] = [];
    const runner: ChallengerRunner = async ({ model, effort }) => {
      seen.push({ model, effort });
      return { ok: true, raw: JSON.stringify({ verdict: "sound", objections: [] }) };
    };
    const res = await runCriticalGate({ subject: "p1 probe", answer: "a" }, { runner, log: false });
    expect(res.status).toBe("clean");
    expect(seen).toEqual([
      { model: "gpt-6.1-sol", effort: "high" },
      { model: "gpt-6-astra", effort: "high" },
    ]);
    expect(res.challengers.map((c) => c.label)).toEqual(["Sol 6.1", "Astra 6"]);
  });

  it("(c) a wrong value cannot be written: a third seat, one model twice, a retired, a non-Codex model, a bad effort", async () => {
    const write = (value: unknown) =>
      sql`UPDATE settings_values SET value = ${JSON.stringify(value)}::jsonb
           WHERE key = 'gate.challengers' AND scope = 'global'`.execute(db());
    const sol = { model: "gpt-6.1-sol", effort: "high" };
    const astra = { model: "gpt-6-astra", effort: "high" };
    await expect(write([sol, astra, sol])).rejects.toThrow(/exactly two seats/);
    await expect(write([sol, sol])).rejects.toThrow(/two different models/);
    await expect(write([sol, { model: "codex-5.5", effort: "high" }])).rejects.toThrow(/not an active Codex-lane model/);
    await expect(write([sol, { model: "fable-5", effort: "high" }])).rejects.toThrow(/not an active Codex-lane model/);
    await expect(write([sol, { model: "gpt-6-astra", effort: "ultra" }])).rejects.toThrow(/effort/);
    await expect(write([sol, { model: "gpt-9", effort: "high" }])).rejects.toThrow(/not a catalogue id/);
    expect((await loadGateSeats()).map((s) => s.model)).toEqual(["gpt-6.1-sol", "gpt-6-astra"]);
  });

  it("fail-closed per seat: a seat whose model stopped being callable is unavailable, raised, and the work runs on", async () => {
    const seats = seatsFrom(
      [{ model: "gpt-6.1-sol", effort: "high" }, { model: "codex-5.5", effort: "high" }],
      [
        { id: "gpt-6.1-sol", api_model_id: "gpt-6.1-sol", display_name: "Sol 6.1", status: "active", banned: false, lane: "codex-cli" },
        { id: "codex-5.5", api_model_id: null, display_name: "Codex 5.5", status: "retired", banned: false, lane: "codex-cli" },
      ],
    );
    expect(seats[1].unavailable).toMatch(/seat 2: codex-5.5 is retired/);
    const called: string[] = [];
    const runner: ChallengerRunner = async ({ model }) => {
      called.push(model);
      return { ok: true, raw: JSON.stringify({ verdict: "sound", objections: [] }) };
    };
    const res = await runCriticalGate({ subject: "p1 seat probe", answer: "a" }, { runner, seats });
    expect(called).toEqual(["gpt-6.1-sol"]);
    expect(res.status).toBe("clean");
    expect(res.challengers[1]).toMatchObject({ ok: false, error: expect.stringMatching(/retired/) });
    const alert = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM alerts
       WHERE dedup_key = 'gate-seat:2' AND source = 'critical_gate' AND resolved_at IS NULL
    `.execute(db());
    expect(alert.rows[0].n).toBe(1);
    expect(seatsFrom(null, [])).toHaveLength(2);
    expect(seatsFrom(null, [])[0].unavailable).toMatch(/not two seats/);
  });
});
