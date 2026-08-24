import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";

// E12.5 Workforce Completeness Gate — machine-gate invariants as permanent
// regression. Read-only against the live registry; the frozen 67-slug promise
// ledger is the single source shared with scripts/org/workforce-gate.mjs
// (WORKFORCE-MUST-EXPANSION-PLAN §11.4). Activation waves (draft→probation→
// active through the HR machine) are the row's remaining leg, blocked on the
// CEO's open MUSTS-Talep decisions — NOT asserted here.

const REPO = join(__dirname, "../..");
const { promised } = JSON.parse(
  readFileSync(join(REPO, "scripts/org/promise-ledger.json"), "utf8"),
) as { promised: string[] };

const db = () => getDb();

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
    expect(promised).toHaveLength(67);
    expect(new Set(promised).size).toBe(67);
  });

  it("(2) promised-ADD absent = 0: every promised role is live with a gate-passed persona", async () => {
    const res = await sql<{ slug: string }>`
      SELECT a.slug FROM agents a JOIN personas p ON p.id = a.persona_id
       WHERE a.employment_status != 'archived' AND p.quality_gate = 'passed'
    `.execute(db());
    const liveBound = new Set(res.rows.map((r) => r.slug));
    expect(promised.filter((s) => !liveBound.has(s))).toEqual([]);
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

  it("(4) stale persona_path = 0 and every stored path exists on disk", async () => {
    const stale = await sql<{ c: number }>`
      SELECT count(*)::int AS c FROM agents WHERE persona_path LIKE 'agency-agents/%'
    `.execute(db());
    expect(stale.rows[0].c).toBe(0);

    const paths = await sql<{ slug: string; persona_path: string }>`
      SELECT slug, persona_path FROM agents WHERE created_at < ${suiteStart}::timestamp
    `.execute(db());
    const ghosts = paths.rows.filter((r) => !existsSync(join(REPO, r.persona_path)));
    expect(ghosts).toEqual([]);
  });

  it("(5) org structure: no headless dept, no orphan worker, no fixture debris", async () => {
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

  it("(6) persona chain complete on every live row: bound+passed, mcp_profile, v2.0-fable tag", async () => {
    const res = await sql<{ unbound: number; no_mcp: number; stale_tag: number }>`
      SELECT count(*) FILTER (WHERE p.id IS NULL OR p.quality_gate != 'passed')::int AS unbound,
             count(*) FILTER (WHERE a.mcp_profile IS NULL)::int AS no_mcp,
             count(*) FILTER (WHERE a.persona_version IS DISTINCT FROM 'v2.0-fable')::int AS stale_tag
        FROM agents a LEFT JOIN personas p ON p.id = a.persona_id
       WHERE a.employment_status != 'archived'
         AND a.created_at < ${suiteStart}::timestamp
    `.execute(db());
    expect(res.rows[0]).toEqual({ unbound: 0, no_mcp: 0, stale_tag: 0 });
  });

  it("(7) deputy-failover map covers the SPOF officer set and every dept head", async () => {
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
