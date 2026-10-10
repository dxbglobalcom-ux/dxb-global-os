// B51 step 3 · P5b — code bundle 3 of the prompt audit (.planning/quick/20261004-his-list/item3-report.md),
// under the plan he approved on 2026-10-09 ("tmm. dxbteam2 ile devam et sen. gerekli olanı yapın. düzgün.").
//   C2-3  a workflow step runs at the effort of the routing row that chose its model, not the SDK default;
//   C2-4  a workflow step runs as its seat — the seat's standing prompt is the system prompt of the run;
//   C2-9  Hamza's standing layer is the system prompt of his chat and voice answers (cached), the per-turn
//         memory, figures and conversation ride the turn;
//   C2-12 an Agent SDK call carries the catalogue's fallback model (model_catalog.fallback_of).
// Database probes that change a row run inside a rolled-back transaction: the scheduler is live.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { sdkModel, seatedExecutor, type AgentWork } from "../../packages/kernel/src/index.js";
import { resolveStepModel } from "../../packages/kernel/src/workflow/steps/agent.js";
import { answerLayers, standingPrompt } from "../../packages/voice/src/prompt-core.js";
import { watchLedgers } from "../helpers/suite-scope.js";

const REPO_ROOT = join(import.meta.dirname, "..", "..");
const db = () => getDb();
const ledger = watchLedgers(db); // fn_select_model writes a decision_log row per step resolution

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
  await ledger.sweep({ decisions: [{ decidedBy: "orchestrator", decision: "routing_decision" }] });
  await closeDb();
});

async function slotEffort(slot: string): Promise<string> {
  const r = await sql<{ effort: string }>`
    SELECT effort FROM routing_rules
     WHERE role_slot = ${slot} AND enabled AND department_id IS NULL
     ORDER BY priority DESC, updated_at DESC LIMIT 1`.execute(db());
  return r.rows[0].effort;
}

describe("C2-3 — a workflow step carries its routing row's effort", () => {
  it("a slot step takes the effort of the row fn_select_model chose", async () => {
    for (const slot of ["critical_decision", "coding", "fast_task"]) {
      const sel = await sql<{ out: { rule_id: string; model_id: string } }>`
        SELECT fn_select_model(${slot}, NULL, 'low', NULL, NULL, NULL, false, false) AS out`.execute(db());
      const row = await sql<{ effort: string }>`
        SELECT effort FROM routing_rules WHERE id = ${sel.rows[0].out.rule_id}::uuid`.execute(db());
      const got = await resolveStepModel({ model_role_slot: slot }, "low");
      expect(got.model).toBe(sel.rows[0].out.model_id);
      expect(got.effort).toBe(row.rows[0].effort);
    }
    // move 3 reaches workflows: the critical-decision seat runs at xhigh, not at the SDK default
    expect((await resolveStepModel({ model_role_slot: "critical_decision" }, "low")).effort).toBe("xhigh");
  });

  it("a pinned model keeps its slot's effort; a pin without a slot takes the model's own top row", async () => {
    const pinned = await resolveStepModel({ model_role_slot: "coding", model_id: "claude-sonnet-5-5" }, "low");
    expect(pinned).toEqual({ model: "claude-sonnet-5-5", effort: await slotEffort("coding") });

    const top = await sql<{ effort: string }>`
      SELECT effort FROM routing_rules WHERE model = 'claude-sonnet-5-5' AND enabled
       ORDER BY priority DESC LIMIT 1`.execute(db());
    const bare = await resolveStepModel({ model_id: "claude-sonnet-5-5" }, "low");
    expect(bare).toEqual({ model: "claude-sonnet-5-5", effort: top.rows[0].effort });

    expect(await resolveStepModel({ model_id: "no-such-routed-model" }, "low")).toEqual({
      model: "no-such-routed-model",
      effort: undefined,
    });
  });

  it("the executor hands the effort, the seat prompt and the fallback to query()", async () => {
    const src = await readFile(join(REPO_ROOT, "packages/kernel/src/workflow/executor.ts"), "utf8");
    expect(src).toContain("const sdk = await sdkModel(getDb(), work.model);");
    expect(src).toContain("...(work.effort ? { effort: work.effort } : {})");
    expect(src).toContain("...(work.systemPrompt ? { systemPrompt: work.systemPrompt } : {})");
  });
});

describe("C2-4 — a workflow step runs as its seat", () => {
  const work: AgentWork = {
    employeeId: "00000000-0000-4000-8000-000000000001",
    employeeSlug: "finance-controller",
    department: "finance",
    model: "claude-sonnet-5-5",
    objective: "o",
    outputContract: "c",
    seat: { slug: "finance-controller", department: "finance", role_level: "director", persona_path: "p.md" },
  };

  it("the composition point's seat prompt becomes the run's system prompt", async () => {
    const seen: AgentWork[] = [];
    const asked: unknown[] = [];
    const ex = seatedExecutor(
      async (w) => {
        seen.push(w);
        return { output: "ok", confidence: 1 };
      },
      async (seat) => {
        asked.push(seat);
        return `STANDING for ${seat.slug}`;
      },
    );
    await ex(work);
    expect(asked).toEqual([work.seat]);
    expect(seen[0].systemPrompt).toBe("STANDING for finance-controller");
  });

  it("no seat prompt dependency, or none built → the work goes through unchanged", async () => {
    const base = async (w: AgentWork) => ({ output: w.systemPrompt ?? "none", confidence: 1 });
    expect(seatedExecutor(base)).toBe(base);
    expect((await seatedExecutor(base, async () => null)(work)).output).toBe("none");
  });

  it("the scheduler hands in the orchestrator's one definition", async () => {
    const src = await readFile(join(REPO_ROOT, "packages/outbox-executor/src/scheduler.ts"), "utf8");
    expect(src).toContain("drainWorkflowRuns({ seatPrompt: (seat) => seatStandingPrompt(seat) })");
  });
});

describe("C2-9 — Hamza's standing layer is the cached system prompt", () => {
  const input = {
    agent: { slug: "agents-orchestrator" },
    personaBody: "PERSONA BODY",
    memoryLines: ["the board met on Monday"],
    lang: "tr" as const,
    lane: "chat" as const,
  };

  it("the system layer is the standing layer without the turn's memory, identical whatever matched", () => {
    const a = answerLayers(input, ["LANE LINE"]);
    const b = answerLayers({ ...input, memoryLines: ["something else entirely"] }, ["LANE LINE"]);
    const c = answerLayers({ ...input, memoryLines: [], memoryUnreachable: true }, ["LANE LINE"]);
    expect(a.system).toBe(b.system);
    expect(a.system).toBe(c.system);
    expect(a.system).toBe(
      [...standingPrompt({ ...input, memoryLines: [] }), "LANE LINE"].join("\n\n"),
    );
    expect(a.system).toContain("HE IS TALKING TO YOU, Hamza");
    expect(a.system).toContain("PERSONA BODY");
    expect(a.system).not.toContain("Relevant company memory");
    expect(a.memory).toContain("the board met on Monday");
    expect(c.memory).toContain("could not be read");
  });

  it("both answer lanes send it as systemPrompt and keep only the turn in the user message", async () => {
    for (const f of ["packages/orchestrator/src/chat-drain.ts", "packages/voice/src/answer.ts"]) {
      const src = await readFile(join(REPO_ROOT, f), "utf8");
      expect(src).toContain("answerLayers(");
      expect(src).toContain("systemPrompt: system,");
      expect(src).not.toContain("prompt: `${sys}");
    }
  });
});

describe("C2-12 — an Agent SDK call carries the catalogue's fallback", () => {
  it("follows fallback_of to the first live agent-sdk hop at or above the primary's tier floor", async () => {
    await inTrx(async (trx) => {
      // the catalogue after P4: fable-5.1 (L1) → fable-5 (L1) → claude-sonnet-5-5 (L2)
      expect(await sdkModel(trx, "fable-5.1")).toEqual({ model: "claude-fable-5-1", fallbackModel: "claude-opus-5" });
      // second eye's B1: an L1 Opus run never falls silently to Sonnet (L2) — no fallback rather than a lower one
      expect(await sdkModel(trx, "fable-5")).toEqual({ model: "claude-opus-5" });
      expect(await sdkModel(trx, "claude-sonnet-5-5")).toEqual({ model: "claude-sonnet-5-5" });
      // a retired primary is refused before any chain is read
      await expect(sdkModel(trx, "claude-sonnet-5")).rejects.toThrow(/claude-sonnet-5 is retired/);
      // falling UP is allowed: Sonnet (L2) to an L1 model (the chain is cut first — the catalogue refuses a cycle)
      await sql`UPDATE model_catalog SET fallback_of = NULL WHERE id = 'fable-5'`.execute(trx);
      await sql`UPDATE model_catalog SET fallback_of = 'fable-5' WHERE id = 'claude-sonnet-5-5'`.execute(trx);
      expect(await sdkModel(trx, "claude-sonnet-5-5")).toEqual({
        model: "claude-sonnet-5-5",
        fallbackModel: "claude-opus-5",
      });
      // an alias resolves to its row, and the row's chain is used
      expect(await sdkModel(trx, "opus-5")).toEqual({ model: "claude-opus-5" });
      await sql`UPDATE model_catalog SET aliases = aliases || '{p5b-probe-alias}' WHERE id = 'fable-5.1'`.execute(trx);
      expect(await sdkModel(trx, "p5b-probe-alias")).toEqual({ model: "claude-fable-5-1", fallbackModel: "claude-opus-5" });
    });
  });

  it("passes over a retired, a Codex and a mechanical-only hop; four hops at most", async () => {
    await inTrx(async (trx) => {
      // fable-5.1 → claude-opus-4-8 (retired) → gpt-6.1-sol (codex) → claude-haiku-5-5 (mechanical) → fable-5
      await sql`UPDATE model_catalog SET fallback_of = 'claude-opus-4-8' WHERE id = 'fable-5.1'`.execute(trx);
      await sql`UPDATE model_catalog SET fallback_of = 'gpt-6.1-sol' WHERE id = 'claude-opus-4-8'`.execute(trx);
      await sql`UPDATE model_catalog SET fallback_of = 'claude-haiku-5-5' WHERE id = 'gpt-6.1-sol'`.execute(trx);
      await sql`UPDATE model_catalog SET status = 'active' WHERE id = 'claude-haiku-5-5'`.execute(trx);
      await sql`UPDATE model_catalog SET fallback_of = 'fable-5' WHERE id = 'claude-haiku-5-5'`.execute(trx);
      expect(await sdkModel(trx, "fable-5.1")).toEqual({ model: "claude-fable-5-1", fallbackModel: "claude-opus-5" });
      // one dead hop more in front (the retired claude-haiku-4-5) and the live model sits at hop 5: out of reach
      await sql`UPDATE model_catalog SET fallback_of = 'claude-opus-4-8' WHERE id = 'claude-haiku-4-5'`.execute(trx);
      await sql`UPDATE model_catalog SET fallback_of = 'claude-haiku-4-5' WHERE id = 'fable-5.1'`.execute(trx);
      expect(await sdkModel(trx, "fable-5.1")).toEqual({ model: "claude-fable-5-1" });
    });
  });

  it("refuses a model that is not on the agent-sdk lane, like sdkModelId", async () => {
    await expect(sdkModel(db(), "gpt-6.1-sol")).rejects.toThrow(/codex-cli lane/);
  });

  it("all eight SDK call sites take the model through sdkModel", async () => {
    const sites = [
      "packages/voice/src/answer.ts",
      "packages/orchestrator/src/qa.ts",
      "packages/orchestrator/src/chat-drain.ts",
      "packages/orchestrator/src/decompose.ts",
      "packages/orchestrator/src/worker-shim.ts",
      "packages/kernel/src/classify.ts",
      "packages/kernel/src/workflow/executor.ts",
      "tools/dxb-cli/src/promote.ts",
    ];
    for (const f of sites) {
      const src = await readFile(join(REPO_ROOT, f), "utf8");
      expect(src, f).toMatch(/const sdk = await sdkModel\(/);
      expect(src, f).toContain("...(sdk.fallbackModel ? { fallbackModel: sdk.fallbackModel } : {})");
      expect(src, f).not.toContain("model: await sdkModelId(");
    }
  });
});
