import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// E12.5 Workforce Completeness Gate — machine-gate invariants as permanent
// regression. Read-only against the live registry, but for case (6)'s one
// throwaway row, deleted in the same case; the frozen 67-slug promise
// ledger is the single source shared with scripts/org/workforce-gate.mjs
// (WORKFORCE-MUST-EXPANSION-PLAN §11.4). Activation waves (draft→probation→
// active through the HR machine) are the row's remaining leg, blocked on the
// CEO's open MUSTS-Talep decisions — NOT asserted here.

const REPO = join(__dirname, "../..");
const { promised } = JSON.parse(
  readFileSync(join(REPO, "scripts/org/promise-ledger.json"), "utf8"),
) as { promised: string[] };

const GATE_SCRIPT = join(REPO, "scripts/org/workforce-gate.mjs");
const FIXTURE_SLUG = "e125t-gate-fixture";

const db = () => getDb();

/** Run the real gate on the engine this suite works on; its verdict line per gate, by gate name. */
function runGate(): Promise<{ output: string; verdicts: Map<string, string> }> {
  return new Promise((resolve) => {
    execFile("node", [GATE_SCRIPT], { cwd: REPO }, (_error, stdout, stderr) => {
      const output = stdout + stderr;
      const verdicts = new Map<string, string>();
      for (const [, verdict, name] of output.matchAll(/^(PASS|FAIL)  (\S+)  /gm)) verdicts.set(name, verdict);
      resolve({ output, verdicts });
    });
  });
}

// Suite-interleave guard: r23/e10 suites create transient fixture agents
// mid-battery. Registry-hygiene assertions only judge rows that existed
// BEFORE this suite started — persistent debris fails, in-flight fixtures
// of concurrently running suites do not.
let suiteStart = "";

beforeAll(async () => {
  const clock = await sql<{ t: string }>`SELECT localtimestamp::text AS t`.execute(db());
  suiteStart = clock.rows[0].t;
});

afterAll(async () => {
  await closeDb();
});

describe("E12.5 workforce completeness — machine gates", () => {
  it("(1) promise ledger holds exactly 67 slugs (53 matrix §3 + 14 plan §4)", () => {
    expect(promised).toHaveLength(81); // 67 (E12.5) + 14 (B43 studio, 2026-09-03)
    expect(new Set(promised).size).toBe(81);
  });

  it("(2) promised-ADD absent = 0: every promised role is live", async () => {
    const res = await sql<{ slug: string }>`
      SELECT slug FROM agents WHERE employment_status != 'archived'
    `.execute(db());
    const live = new Set(res.rows.map((r) => r.slug));
    expect(promised.filter((s) => !live.has(s))).toEqual([]);
  });

  it("(3) unpromised-role = 0: every live row is legacy import, promised ADD, or orchestrator", async () => {
    const res = await sql<{ slug: string }>`
      SELECT slug FROM agents
       WHERE employment_status != 'archived'
         AND created_at >= '2026-07-09'
         AND created_at < ${suiteStart}::timestamp
         AND slug != 'agents-orchestrator'
    `.execute(db());
    const promisedSet = new Set(promised);
    expect(res.rows.map((r) => r.slug).filter((s) => !promisedSet.has(s))).toEqual([]);
  });

  it("(4) org structure: no headless dept, no orphan worker, no fixture debris", async () => {
    const res = await sql<{ headless: number; orphans: number; debris: number }>`
      SELECT (SELECT count(*)::int FROM departments WHERE director_id IS NULL) AS headless,
             (SELECT count(*)::int FROM agents
               WHERE employment_status != 'archived' AND manager_id IS NULL
                 AND role_level NOT IN ('orchestrator', 'director')
                 AND created_at < ${suiteStart}::timestamp) AS orphans,
             (SELECT count(*)::int FROM agents
               WHERE (slug LIKE 'r23t-%' OR slug LIKE 'e102t%'
                  OR slug LIKE 'e124t-%' OR slug LIKE 'e125t-%')
                 AND created_at < ${suiteStart}::timestamp) AS debris
    `.execute(db());
    expect(res.rows[0]).toEqual({ headless: 0, orphans: 0, debris: 0 });
  });

  it("(5) every live row has an MCP profile", async () => {
    const res = await sql<{ no_mcp: number }>`
      SELECT count(*)::int AS no_mcp FROM agents
       WHERE employment_status != 'archived' AND mcp_profile IS NULL
         AND created_at < ${suiteStart}::timestamp
    `.execute(db());
    expect(res.rows[0].no_mcp).toBe(0);
  });

  // CEO order 2026-11-22: a worker is an agent in a seat. The gate script is run
  // itself here, on a registry that holds a live row the old gate convicted: no
  // bound character file, and the column default instead of the v2 tag.
  it("(6) the gate script fails no live row for a missing character file or its tag", async () => {
    await sql`
      INSERT INTO agents (slug, department, role, role_level, brain, employment_status, status,
                          persona_path, manager_id)
      VALUES (${FIXTURE_SLUG}, 'people-hr', 'worker', 'specialist', 'glm-5.2', 'dormant', 'dormant',
              'personas/_fixtures/e125t.md',
              (SELECT id FROM agents WHERE department='people-hr' AND role='head' LIMIT 1))
    `.execute(db());
    try {
      const { output, verdicts } = await runGate();

      // The script saw the row: its slug prefix is what the debris gate convicts.
      expect(verdicts.get("fixture-debris")).toBe("FAIL");
      expect(verdicts.get("promised-ADD-absent")).toBe("PASS");
      expect(verdicts.get("mcp-profile")).toBe("PASS");
      expect([...verdicts.keys()]).toEqual([
        "promised-ADD-absent", "unpromised-role", "headless-active-dept", "orphan-worker",
        "mcp-profile", "fixture-debris", "deputy-failover-map",
      ]);
      expect(output).not.toMatch(/persona/i);
    } finally {
      await sql`DELETE FROM agents WHERE slug = ${FIXTURE_SLUG}`.execute(db());
    }
  });

  it("(7) the gate script reads nothing of the removed character files", () => {
    expect(readFileSync(GATE_SCRIPT, "utf8")).not.toMatch(/persona/i);
  });

  it("(8) deputy-failover map covers the SPOF officer set and every dept head", async () => {
    const map = readFileSync(join(REPO, "HOLDING-OS-MASTER-PLAN/DEPUTY-FAILOVER-MAP.md"), "utf8");
    const spof = [
      "privacy-dpo", "backup-dr-officer", "iam-secrets-officer",
      "payroll-manager", "ai-observability-finops-analyst", "board-decision-secretary",
    ];
    expect(spof.filter((s) => !map.includes(s))).toEqual([]);

    const heads = await sql<{ slug: string }>`
      SELECT a.slug FROM departments d JOIN agents a ON a.id = d.director_id
    `.execute(db());
    expect(heads.rows.length).toBeGreaterThanOrEqual(21);
    expect(heads.rows.map((r) => r.slug).filter((s) => !map.includes(s))).toEqual([]);
  });
});
