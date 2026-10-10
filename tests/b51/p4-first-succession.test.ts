// B51 step 3 · P4 — the first succession, through the door (db/migrations/20261010040000_b51_p4_first_succession.sql).
// The plan he approved on 2026-10-09: "İlk geçiş sizin istediğiniz: Opus 5'ten 5.5'e, Sonnet 5'ten 5.5'e." and the
// old gate judge retired on his word of that night ("şuan solo 6.1 e çıktı gpt5.5 eskidi artık").
// What must hold on every engine the canonical chain builds — read only.
//
// Opus 5.5 WAITS FOR THE SDK (20261010050000): measured live the same night, the CLI inside the company's
// Agent SDK (2.1.259) refuses claude-opus-5-5 ("version 2.1.280 or newer is required"), returned as a result of
// subtype success with is_error true — so the Opus move was undone through the door's own undo and the row went
// back to 'testing'. Sonnet 5.5 answered OK (evidence/live-probe-p4-2026-10-10.txt).
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const db = () => getDb();

afterAll(async () => {
  await closeDb();
});

describe("P4 — Sonnet 5 → 5.5 and the old judge retired; Opus 5.5 waits for the SDK", () => {
  it("the moved rows are retired, never deleted; Opus 5 keeps its seats", async () => {
    const r = await sql<{ id: string; status: string }>`
      SELECT id, status FROM model_catalog
       WHERE id IN ('fable-5', 'claude-sonnet-5', 'codex-5.6', 'claude-opus-5-5', 'claude-sonnet-5-5')`.execute(db());
    expect(Object.fromEntries(r.rows.map((x) => [x.id, x.status]))).toEqual({
      "fable-5": "active",
      "claude-sonnet-5": "retired",
      "codex-5.6": "retired",
      "claude-opus-5-5": "testing",
      "claude-sonnet-5-5": "active",
    });
  });

  it("no routing row, brain or model setting still names a retired model", async () => {
    const rules = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM routing_rules r JOIN model_catalog m ON m.id = r.model
       WHERE m.status = 'retired'`.execute(db());
    expect(rules.rows[0].n).toBe(0);
    const brains = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM agents a JOIN model_catalog m ON m.id = a.brain
       WHERE m.status = 'retired' AND a.employment_status <> 'archived'`.execute(db());
    expect(brains.rows[0].n).toBe(0);
  });

  it("each move is on record under the word that really says it, and the Opus move's undo beside it", async () => {
    const r = await sql<{ action: string; old: string; new: string; authority: string | null; actor: string }>`
      SELECT action, payload->>'old' AS old, payload->>'new' AS new, payload->>'authority' AS authority, actor
        FROM audit_log
       WHERE action IN ('routing.succession', 'routing.succession.undo')
         AND payload->>'old' IN ('fable-5', 'claude-sonnet-5', 'codex-5.6')
       ORDER BY id`.execute(db());
    const plan = "ceo-approvals:b51-plan-approved-2026-10-09";
    expect(r.rows.map((x) => [x.action, x.old, x.new, x.actor])).toEqual([
      ["routing.succession", "fable-5", "claude-opus-5-5", "system"],
      ["routing.succession", "claude-sonnet-5", "claude-sonnet-5-5", "system"],
      ["routing.succession", "codex-5.6", "gpt-6.1-sol", "system"],
      ["routing.succession.undo", "fable-5", "claude-opus-5-5", "system"],
    ]);
    expect(r.rows.slice(0, 3).map((x) => x.authority)).toEqual([
      plan,
      plan,
      "ceo-approvals:all-brains-stay-current-gate-judges-2026-10-09",
    ]);
  });

  it("no seat names Opus 5.5 while the SDK cannot call it", async () => {
    const r = await sql<{ rules: number; brains: number }>`
      SELECT (SELECT count(*)::int FROM routing_rules WHERE model = 'claude-opus-5-5') AS rules,
             (SELECT count(*)::int FROM agents WHERE brain = 'claude-opus-5-5') AS brains`.execute(db());
    expect(r.rows[0]).toEqual({ rules: 0, brains: 0 });
  });

  it("the routing seed names no model a fresh bootstrap would resurrect (MODEL_ROUTING_SPEC §4e)", async () => {
    const seed = JSON.parse(
      await readFile(join(REPO_ROOT, "packages/kernel/policy/routing-seed.json"), "utf8"),
    ) as Array<{ model: string }>;
    const models = [...new Set(seed.map((x) => x.model))].sort();
    const live = await sql<{ id: string }>`
      SELECT id FROM model_catalog WHERE id = ANY (${models}) AND status = 'active' AND NOT banned`.execute(db());
    expect(live.rows.map((x) => x.id).sort()).toEqual(models);
  });
});
