// B51 step 3 · P4 — the first succession, through the door (db/migrations/20261010040000_b51_p4_first_succession.sql).
// The plan he approved on 2026-10-09: "İlk geçiş sizin istediğiniz: Opus 5'ten 5.5'e, Sonnet 5'ten 5.5'e." and the
// old gate judge retired on his word of that night ("şuan solo 6.1 e çıktı gpt5.5 eskidi artık").
// What must hold on every engine the canonical chain builds — read only.
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

describe("P4 — Opus 5 → 5.5, Sonnet 5 → 5.5, the old judge retired", () => {
  it("the old rows are retired, never deleted; the successors are active", async () => {
    const r = await sql<{ id: string; status: string }>`
      SELECT id, status FROM model_catalog
       WHERE id IN ('fable-5', 'claude-sonnet-5', 'codex-5.6', 'claude-opus-5-5', 'claude-sonnet-5-5')`.execute(db());
    expect(Object.fromEntries(r.rows.map((x) => [x.id, x.status]))).toEqual({
      "fable-5": "retired",
      "claude-sonnet-5": "retired",
      "codex-5.6": "retired",
      "claude-opus-5-5": "active",
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

  it("each move is on record under the word that really says it", async () => {
    const r = await sql<{ old: string; new: string; authority: string; actor: string }>`
      SELECT payload->>'old' AS old, payload->>'new' AS new, payload->>'authority' AS authority, actor
        FROM audit_log
       WHERE action = 'routing.succession' AND payload->>'old' IN ('fable-5', 'claude-sonnet-5', 'codex-5.6')
       ORDER BY id`.execute(db());
    expect(r.rows).toEqual([
      { old: "fable-5", new: "claude-opus-5-5", authority: "ceo-approvals:b51-plan-approved-2026-10-09", actor: "system" },
      { old: "claude-sonnet-5", new: "claude-sonnet-5-5", authority: "ceo-approvals:b51-plan-approved-2026-10-09", actor: "system" },
      { old: "codex-5.6", new: "gpt-6.1-sol", authority: "ceo-approvals:all-brains-stay-current-gate-judges-2026-10-09", actor: "system" },
    ]);
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
