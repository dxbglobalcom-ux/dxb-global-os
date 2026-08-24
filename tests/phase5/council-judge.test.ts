import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import { pinHookOff } from "../helpers/suite-scope.js";
import { TaskEnvelope } from "../../packages/shared/src/envelope.js";
import {
  departmentKeyEnvVar,
  keyGenerate,
  LITELLM_KEYS_TABLE,
  LITELLM_SCHEMA,
} from "../../packages/shared/src/litellm.js";
import {
  COUNCIL_CONFIG,
  council,
  dispatch,
  escalate,
  judgeCandidates,
  qa,
  runWorkerOnce,
  shouldCouncil,
  type DecomposedEnvelope,
} from "../../packages/orchestrator/src/index.js";

// Master-plan step 7 verification (05-08, CNCL-01 + ORCH-02). Groups:
//   (t) shouldCouncil truth table — deterministic
//   (q) qa wiring with injectable evaluators — deterministic (pass→done/
//       awaiting_approval per approval_class; fail→failed feeding the ladder)
//   (n) NEGATIVE proof: a normal internal/L3 task through the full
//       worker→qa path triggers ZERO council calls — deterministic, never skipped
//   (g) golden set: REAL judge >= 8/10 correct picks — DXB_LIVE_SDK=1 gated;
//       < 8/10 → judge escalates to COUNCIL_CONFIG.judgeEscalation and re-runs
//       (LOCKED procedure), final asserted state >= 8/10
//   (c) live council run: 3 producers + judge on an outward task → 4
//       cost_ledger rows meta.council=true — needs SDK + LiteLLM master key

const LIVE_SDK = process.env.DXB_LIVE_SDK === "1";
const LIVE_LITELLM = Boolean(process.env.LITELLM_MASTER_KEY);

const COUNCIL_TEST_DEPT = "orch-council-live";
const COUNCIL_KEY_ALIAS = "dxb-test-council";

const createdTaskIds: string[] = [];

function envelope(over: Partial<DecomposedEnvelope> = {}): DecomposedEnvelope {
  return {
    ...TaskEnvelope.parse({
      department: "orch-test-qa",
      objective: "write a two-line company motto draft for the DXB water bottle brand",
      output_contract: "plain text, two lines, done when stored",
      model_tier: "L3",
      approval_class: "none",
    }),
    deps: [],
    ...over,
  };
}

async function trackDispatch(envelopes: DecomposedEnvelope[]): Promise<string[]> {
  const { taskIds } = await dispatch(envelopes);
  createdTaskIds.push(...taskIds);
  return taskIds;
}

/** dispatch → worker(review) with a canned confident result; returns taskId. */
async function taskInReview(dept: string, over: Partial<DecomposedEnvelope> = {}): Promise<string> {
  const [taskId] = await trackDispatch([envelope({ department: dept, ...over })]);
  const run = await runWorkerOnce({
    workerId: `worker-${dept}`,
    departments: [dept],
    execute: async () => ({ result: { text: "draft v1" }, confidence: 0.9 }),
  });
  expect(run).toMatchObject({ claimed: true, taskId, status: "review" });
  return taskId;
}

interface GoldenFixture {
  name: string;
  objective: string;
  output_contract: string;
  candidates: { A: string; B: string; C: string };
  correct: "A" | "B" | "C";
}

function loadGolden(): GoldenFixture[] {
  const dir = fileURLToPath(new URL("golden", import.meta.url));
  return readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as GoldenFixture);
}

afterAll(async () => {
  const db = getDb();
  if (createdTaskIds.length > 0) {
    await db.deleteFrom("cost_ledger").where("task_id", "in", createdTaskIds).execute();
    await db
      .deleteFrom("tool_calls")
      .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    await db
      .deleteFrom("file_changes")
      .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    // E8.4b: failed probe runs raise alerts rows (FK) — sweep before the runs.
    await db
      .deleteFrom("alerts")
      .where("run_id", "in", db.selectFrom("agent_runs").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    await db.deleteFrom("alerts").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("agent_runs").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("task_events").where("task_id", "in", createdTaskIds).execute();
    // The awaiting_approval bridge trigger opens gates for orch-qa-appr/noc
    // probes — sweep the approval chain or the task delete dies on the FK
    // (root cause of the 2026-07-19 + 2026-07-24 stuck-probe residue).
    await db
      .deleteFrom("outbox")
      .where("approval_id", "in", db.selectFrom("approvals").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    await db
      .updateTable("decision_log")
      .set({ approval_id: null })
      .where("approval_id", "in", db.selectFrom("approvals").select("id").where("task_id", "in", createdTaskIds))
      .execute();
    await db.deleteFrom("approvals").where("task_id", "in", createdTaskIds).execute();
    await db.deleteFrom("tasks").where("id", "in", createdTaskIds).execute();
  }
  if (LIVE_LITELLM) {
    // test alias only — never touches the real dxb-<dept> keys
    await sql`
      DELETE FROM ${sql.raw(`${LITELLM_SCHEMA}."${LITELLM_KEYS_TABLE}"`)}
      WHERE key_alias = ${COUNCIL_KEY_ALIAS}
    `.execute(db);
  }
  await closeDb();
});

// E10.2: this suite predates the hook — pin the §22 flag off for its
// lifetime (restored + alert swept in the helper afterAll).
pinHookOff(() => getDb());

describe("shouldCouncil — LOCKED trigger truth table (deterministic)", () => {
  it("outward OR L1 fires; everything else is silent", () => {
    expect(shouldCouncil({ approval_class: "outward", model_tier: "L4" })).toBe(true);
    expect(shouldCouncil({ approval_class: "none", model_tier: "L1" })).toBe(true);
    expect(shouldCouncil({ approval_class: "outward", model_tier: "L1" })).toBe(true);
    expect(shouldCouncil({ approval_class: "internal", model_tier: "L3" })).toBe(false);
    expect(shouldCouncil({ approval_class: "none", model_tier: "L2" })).toBe(false);
  });
});

describe("qa wiring — injectable evaluator (deterministic)", () => {
  it("qa fail → review→failed with reason 'qa-fail', and the 05-06 ladder engages", async () => {
    const taskId = await taskInReview("orch-qa-fail");
    const out = await qa(taskId, async () => ({
      pass: false,
      confidence: 0.3,
      notes: "contract requires two lines, result has one",
    }));
    expect(out.toStatus).toBe("failed");

    const failEvent = await getDb()
      .selectFrom("task_events")
      .select(["actor", "payload"])
      .where("task_id", "=", taskId)
      .where("to_status", "=", "failed")
      .executeTakeFirstOrThrow();
    expect(failEvent.actor).toBe("orchestrator:qa");
    expect(failEvent.payload).toMatchObject({ reason: "qa-fail" });

    // ladder link: exactly the 05-06 machinery picks the qa-fail up
    const esc = await escalate(getDb(), taskId);
    expect(esc).toEqual({ action: "requeued", ladder: "retry-same-tier", failCount: 1, modelTier: "L3" });
  });

  it("qa pass + approval_class 'none' → done", async () => {
    const taskId = await taskInReview("orch-qa-done");
    const out = await qa(taskId, async () => ({ pass: true, confidence: 0.95, notes: "meets contract" }));
    expect(out.toStatus).toBe("done");
    const row = await getDb()
      .selectFrom("tasks").select("status").where("id", "=", taskId).executeTakeFirstOrThrow();
    expect(row.status).toBe("done");
  });

  it("qa pass + approval_class 'internal' → awaiting_approval (Phase-4 flow takes over)", async () => {
    const taskId = await taskInReview("orch-qa-appr", { approval_class: "internal" });
    const out = await qa(taskId, async () => ({ pass: true, confidence: 0.9, notes: "ok" }));
    expect(out.toStatus).toBe("awaiting_approval");
    const row = await getDb()
      .selectFrom("tasks").select("status").where("id", "=", taskId).executeTakeFirstOrThrow();
    expect(row.status).toBe("awaiting_approval");
  });

  it("malformed verdict twice → throws, task stays in review (retry-once rule)", async () => {
    const taskId = await taskInReview("orch-qa-mal");
    let calls = 0;
    await expect(
      qa(taskId, async () => {
        calls++;
        return "not a verdict at all";
      }),
    ).rejects.toThrow(/malformed twice/);
    expect(calls).toBe(2);
    const row = await getDb()
      .selectFrom("tasks").select("status").where("id", "=", taskId).executeTakeFirstOrThrow();
    expect(row.status).toBe("review");
  });
});

describe("council NEGATIVE proof — normal task, zero council calls (master-plan step 7)", () => {
  it("internal/L3 task runs worker→qa→done with shouldCouncil=false and no meta.council rows", async () => {
    const taskId = await taskInReview("orch-qa-noc", { approval_class: "internal" });
    const row = await getDb()
      .selectFrom("tasks")
      .select(["approval_class", "model_tier"])
      .where("id", "=", taskId)
      .executeTakeFirstOrThrow();
    expect(shouldCouncil(row)).toBe(false);

    const out = await qa(taskId, async () => ({ pass: true, confidence: 0.9, notes: "fine" }));
    expect(out.toStatus).toBe("awaiting_approval");

    const councilRows = await getDb()
      .selectFrom("cost_ledger")
      .select(({ fn }) => fn.countAll<string>().as("n"))
      .where("task_id", "=", taskId)
      .where(sql<boolean>`meta->>'council' = 'true'`)
      .executeTakeFirstOrThrow();
    expect(Number(councilRows.n)).toBe(0); // council provably silent off the gates
  });
});

describe.skipIf(!LIVE_SDK)("golden set — judge strength >= 8/10 (LOCKED validation)", () => {
  it(
    "the real judge picks the known-correct candidate on >= 8/10 fixtures",
    async () => {
      const fixtures = loadGolden();
      expect(fixtures).toHaveLength(10);

      async function runRound(judgeModel: string): Promise<{ correct: number; table: string[] }> {
        const table: string[] = [];
        let correct = 0;
        for (const f of fixtures) {
          // serial on purpose: paces spend so Phase-4 velocity rails stay calm
          const verdict = await judgeCandidates(
            f.objective,
            f.output_contract,
            [f.candidates.A, f.candidates.B, f.candidates.C],
            judgeModel,
          );
          const hit = verdict.winner === f.correct;
          if (hit) correct++;
          table.push(`${f.name}: picked ${verdict.winner}, expected ${f.correct} ${hit ? "✓" : "✗"}`);
        }
        return { correct, table };
      }

      let judgeModel: string = COUNCIL_CONFIG.judge.model;
      let round = await runRound(judgeModel);
      // eslint-disable-next-line no-console
      console.log(`golden picks (${judgeModel}):\n${round.table.join("\n")}\nscore ${round.correct}/10`);
      if (round.correct < 8) {
        // LOCKED rule: this escalation IS the procedure — judge up, re-run.
        judgeModel = COUNCIL_CONFIG.judgeEscalation;
        round = await runRound(judgeModel);
        // eslint-disable-next-line no-console
        console.log(`golden picks (${judgeModel}):\n${round.table.join("\n")}\nscore ${round.correct}/10`);
      }
      // eslint-disable-next-line no-console
      console.log(`final judge model: ${judgeModel} — ${round.correct}/10`);
      expect(round.correct).toBeGreaterThanOrEqual(8);
    },
    1_200_000,
  );
});

describe.skipIf(!LIVE_SDK || !LIVE_LITELLM)("live council run — 4 cost rows meta.council=true", () => {
  it(
    "outward task → 3 parallel producers + 1 judge, all cost-tagged",
    async () => {
      // department virtual key for the test dept (test alias, budget-capped)
      const { key } = await keyGenerate({ key_alias: COUNCIL_KEY_ALIAS, max_budget: 1 });
      process.env[departmentKeyEnvVar(COUNCIL_TEST_DEPT)] = key;

      const [taskId] = await trackDispatch([
        envelope({
          department: COUNCIL_TEST_DEPT,
          objective: "draft a 3-sentence outbound product announcement for the DXB steel bottle",
          output_contract: "3 sentences, plain text, brand-safe",
          approval_class: "outward",
        }),
      ]);
      const task = await getDb()
        .selectFrom("tasks")
        .select(["id", "department", "objective", "output_contract", "approval_class", "model_tier"])
        .where("id", "=", taskId)
        .executeTakeFirstOrThrow();
      expect(shouldCouncil(task)).toBe(true);

      const result = await council(task);
      // eslint-disable-next-line no-console
      console.log(
        `council winner: ${result.winner.label} (${result.winner.model}) — ${result.judgeRationale}`,
      );
      expect(["A", "B", "C"]).toContain(result.winner.label);
      expect(result.producerOutputs).toHaveLength(3);

      const rows = await getDb()
        .selectFrom("cost_ledger")
        .select(["model", "mode", "meta"])
        .where("task_id", "=", taskId)
        .where(sql<boolean>`meta->>'council' = 'true'`)
        .execute();
      expect(rows).toHaveLength(4); // 3 producers + 1 judge
      expect(rows.filter((r) => r.mode === "api")).toHaveLength(3);
      expect(rows.filter((r) => r.mode === "subscription")).toHaveLength(1);
    },
    600_000,
  );
});
