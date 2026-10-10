// B51 step 3 · P6 — Hamza is the holding's general manager (plan approved 2026-10-09,
// b51-plan-approved-2026-10-09: "Seviyesi: Genel Müdür. Sizin niyetinizi alır, işi bölümlere dağıtır, sonucu kontrol
// eder ve size raporlar. … İş dağıtan koltuklar (orkestrasyon ve işi bölme) için önerimiz Fable 5.1 … Konuşma
// koltukları Opus 5.5 olur. Kritik karar koltukları Fable 5.1'de, xhigh seviyesinde çalışır. Sesli cevap … şimdilik
// low'da kalır."). What must hold on every engine the canonical chain builds — read only.
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { HAMZA_SLUG, identityLine } from "../../packages/voice/src/prompt-core.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const db = () => getDb();

afterAll(async () => {
  await closeDb();
});

const DISPATCH = ["orchestration", "decompose"];
const CRITICAL = ["strategy", "architecture", "final-approval", "slot.critical_decision"];
const TALKING = ["chat.answer", "chat.brief", "chat.strategy", "voice.answer"];

describe("P6 — Hamza, the general manager", () => {
  // His role is the chain's own: 20260711006900 inserts him on every engine, 20261010080000 makes him the
  // general manager. His title is the company's (evidence/company-migration-p6.txt) — on the construction bench
  // the seed invents every title (tests/b36/seed-is-fiction), so no title is pinned here.
  it("he is the general manager, and the only one", async () => {
    const r = await sql<{ role: string; role_level: string }>`
      SELECT role, role_level FROM agents WHERE slug = ${HAMZA_SLUG}`.execute(db());
    expect(r.rows[0]).toEqual({ role: "general_manager", role_level: "orchestrator" });
    const n = await sql<{ n: number }>`SELECT count(*)::int AS n FROM agents WHERE role = 'general_manager'`.execute(db());
    expect(n.rows[0].n).toBe(1);
  });

  it("the role exists in the law: general_manager is accepted, nothing else new is", async () => {
    const ROLLBACK = new Error("rollback-sentinel");
    await getDb()
      .transaction()
      .execute(async (trx) => {
        await sql`UPDATE agents SET role = 'general_manager' WHERE slug = ${HAMZA_SLUG}`.execute(trx);
        await sql`UPDATE agents SET role = 'worker' WHERE slug = ${HAMZA_SLUG}`.execute(trx);
        await sql`UPDATE agents SET role = 'general_manager' WHERE slug = ${HAMZA_SLUG}`.execute(trx);
        await expect(sql`UPDATE agents SET role = 'ceo' WHERE slug = ${HAMZA_SLUG}`.execute(trx)).rejects.toThrow(/agents_role_check/);
        throw ROLLBACK;
      })
      .catch((e) => {
        if (e !== ROLLBACK) throw e;
      });
  });

  it("he knows it on every lane: the one identity line names the general manager", () => {
    const line = identityLine({ slug: HAMZA_SLUG });
    expect(line).toMatch(/You are Hamza, the general manager of DXB Global/);
    expect(line).toMatch(/never claim to be someone else/);
  });

  it("the seats that hand out work and the critical decisions run on Fable 5.1; critical ones at xhigh", async () => {
    const r = await sql<{ task_class: string; model: string; model_id: string; effort: string }>`
      SELECT task_class, model, model_id, effort FROM routing_rules
       WHERE department_id IS NULL AND enabled AND task_class = ANY (${[...DISPATCH, ...CRITICAL]})`.execute(db());
    const by = Object.fromEntries(r.rows.map((x) => [x.task_class, x]));
    for (const c of [...DISPATCH, ...CRITICAL]) {
      expect(by[c], c).toMatchObject({ model: "fable-5.1", model_id: "fable-5.1" });
    }
    for (const c of CRITICAL) expect(by[c].effort, c).toBe("xhigh");
    // the seat's registered default says what the seat runs (E7.1)
    const d = await sql<{ d: unknown }>`
      SELECT value_schema->'default' AS d FROM settings_registry WHERE key = 'orchestrator.critical_decision_model'`.execute(db());
    expect(d.rows[0].d).toBe("fable-5.1");
  });

  it("his talking seats stay on Opus 5.5; the spoken answer stays low", async () => {
    const r = await sql<{ task_class: string; model: string; effort: string }>`
      SELECT task_class, model, effort FROM routing_rules
       WHERE department_id IS NULL AND enabled AND task_class = ANY (${TALKING})`.execute(db());
    const by = Object.fromEntries(r.rows.map((x) => [x.task_class, x]));
    for (const c of TALKING) expect(by[c].model, c).toBe("claude-opus-5-5");
    expect(by["voice.answer"].effort).toBe("low");
  });

  it("the routing seed names the same models for the rows it carries", async () => {
    const seed = JSON.parse(await readFile(join(REPO_ROOT, "packages/kernel/policy/routing-seed.json"), "utf8")) as Array<{
      task_class: string;
      model: string;
    }>;
    for (const row of seed.filter((x) => [...DISPATCH, ...CRITICAL].includes(x.task_class))) {
      expect(row.model, row.task_class).toBe("fable-5.1");
    }
  });
});

describe("P6 — a dossier names no model (SİCİL field 8)", () => {
  it("no persona dossier copies a brain: field 8 points at the live database", async () => {
    const root = join(REPO_ROOT, "personas");
    const stale: string[] = [];
    for (const dept of await readdir(root, { withFileTypes: true })) {
      if (!dept.isDirectory()) continue;
      for (const f of await readdir(join(root, dept.name))) {
        if (!f.endsWith(".md")) continue;
        const text = await readFile(join(root, dept.name, f), "utf8");
        const row = /^\| 8 \| Kullanılan model \| (.*) \|$/m.exec(text);
        if (row && !row[1].startsWith("kaynak: canlı DB")) stale.push(`${dept.name}/${f}: ${row[1]}`);
      }
    }
    expect(stale).toEqual([]);
  });

  it("the dossier generator writes the same pointer, never a model", async () => {
    const gen = await readFile(join(REPO_ROOT, "scripts/gen-workforce-dossiers.sh"), "utf8");
    const line = /^\| 8 \| Kullanılan model \| (.*) \|$/m.exec(gen);
    expect(line?.[1]).toMatch(/^kaynak: canlı DB/);
    expect(line?.[1]).not.toMatch(/\$\{brain\}/);
  });
});
