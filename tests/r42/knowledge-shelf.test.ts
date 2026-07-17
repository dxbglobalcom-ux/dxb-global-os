import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
// Same module instance as the hook package (dist-resolved @dxb/shared) — one
// getDb singleton (e10 precedent).
import { closeDb, getDb } from "@dxb/shared";
import {
  postTask,
  type HookCtx,
  type PostTaskResult,
} from "../../packages/hook/src/index.js";

// R4.2 knowledge-shelf gate (HOLDING_LIBRARY A9, hook_policies row
// std.knowledge_shelf): research-marked tasks must carry a file-kind report
// artifact, and the gate itself registers the report as a kind='research'
// library row through control_library_action (CEO standing-order context).
// Coverage: non-research silent pass · research without report → REVISE ·
// research with report → PASS + row + change_log · idempotent re-fire (one
// row) · TR contract marker engages. Suite deletes only what it creates.
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";

const db = () => getDb();
const M = "r42t";
const REF_PREFIX = `.planning/research/${M}-`;

function goodCtx(overrides: Partial<HookCtx> = {}): HookCtx {
  return {
    employee: {
      id: null,
      slug: `${M}-employee`,
      department: "engineering",
      mcpProfile: "engineering",
      managerId: null,
      personaGate: "passed",
    },
    task: {
      id: null,
      objective: `${M} objective: deliver the assigned work`,
      outputContract: "a verified verdict with evidence",
      budgetMaxTokens: null,
      budgetMaxCostEur: null,
      milestoneId: null,
      planRequired: false,
      requiresMemory: false,
    },
    project: { id: randomUUID(), purpose: "test" },
    grants: null,
    requestedTools: null,
    budget: null,
    runId: null,
    actor: "system",
    ...overrides,
  };
}

function goodResult(overrides: Partial<PostTaskResult> = {}): PostTaskResult {
  return {
    output: "a complete delivery with substance",
    evidence: [{ kind: "verification", note: "vitest run green" }],
    acceptanceMap: { "verified verdict": "postTask returned PASS with recorded evidence" },
    decisionsClaimed: 0,
    memoryWritten: false,
    ...overrides,
  };
}

function researchCtx(contract = "a research report on the assigned market"): HookCtx {
  return goodCtx({
    task: { ...goodCtx().task, outputContract: contract },
  });
}

async function shelfRows(ref: string) {
  return (
    await sql<{ id: string; review_status: string | null; owner_dept: string | null }>`
      SELECT id, review_status, owner_dept::text FROM library_items
       WHERE kind = 'research' AND source_ref = ${ref}
    `.execute(db())
  ).rows;
}

async function sweep() {
  const items = await sql<{ id: string }>`
    SELECT id FROM library_items WHERE kind = 'research' AND source_ref LIKE ${`${REF_PREFIX}%`}
  `.execute(db());
  const ids = items.rows.map((r) => r.id);
  if (ids.length > 0) {
    await sql`DELETE FROM control_idempotency
      WHERE (response->>'item_id')::uuid = ANY(${ids}::uuid[])`.execute(db());
    await sql`DELETE FROM audit_log WHERE action LIKE 'library.%'
      AND (payload->>'item_id')::uuid = ANY(${ids}::uuid[])`.execute(db());
    await sql`DELETE FROM library_items WHERE id = ANY(${ids}::uuid[])`.execute(db());
  }
}

beforeAll(sweep);
afterAll(async () => {
  await sweep();
  await closeDb();
});

describe("R4.2 knowledge-shelf gate (std.knowledge_shelf)", () => {
  it("policy row is live (seed proof)", async () => {
    const rows = (
      await sql<{ gate: string; severity: string; enabled: boolean }>`
        SELECT gate, severity, enabled FROM hook_policies WHERE id = 'std.knowledge_shelf'
      `.execute(db())
    ).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ gate: "post", severity: "block", enabled: true });
  });

  it("non-research task: check stays silent — PASS, no shelf row", async () => {
    const ref = `${REF_PREFIX}${randomUUID()}.md`;
    const verdict = await postTask(
      goodCtx(),
      goodResult({ evidence: [...goodResult().evidence, { kind: "file", ref }] }),
    );
    expect(verdict.verdict).toBe("PASS");
    expect(await shelfRows(ref)).toHaveLength(0);
  });

  it("research task WITHOUT report artifact → REVISE (no research without report)", async () => {
    const verdict = await postTask(researchCtx(), goodResult());
    expect(verdict.verdict).toBe("REVISE");
    if (verdict.verdict !== "REVISE") return;
    expect(verdict.feedback.join(" ")).toContain("no research without report");
  });

  it("research task WITH report artifact → PASS + kind=research row + change_log", async () => {
    const ref = `${REF_PREFIX}${randomUUID()}.md`;
    const verdict = await postTask(
      researchCtx(),
      goodResult({ evidence: [...goodResult().evidence, { kind: "file", ref }] }),
    );
    expect(verdict.verdict).toBe("PASS");
    const rows = await shelfRows(ref);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.review_status).toBe("needs_review");
    expect(rows[0]!.owner_dept).not.toBeNull(); // engineering custody from ctx
    const changes = await sql<{ n: number }>`
      SELECT count(*)::int AS n FROM library_change_log WHERE item_id = ${rows[0]!.id}::uuid
    `.execute(db());
    expect(changes.rows[0]!.n).toBeGreaterThanOrEqual(1);
  });

  it("re-fired gate on the same report is idempotent — still ONE row", async () => {
    const ref = `${REF_PREFIX}${randomUUID()}.md`;
    const result = goodResult({
      evidence: [...goodResult().evidence, { kind: "file", ref }],
    });
    expect((await postTask(researchCtx(), result)).verdict).toBe("PASS");
    expect((await postTask(researchCtx(), result)).verdict).toBe("PASS");
    expect(await shelfRows(ref)).toHaveLength(1);
  });

  it("Turkish contract marker (araştırma) engages the gate", async () => {
    const verdict = await postTask(
      researchCtx("pazar araştırması raporu teslim edilir"),
      goodResult(),
    );
    expect(verdict.verdict).toBe("REVISE");
  });
});
