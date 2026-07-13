import { afterAll, describe, expect, it } from "vitest";
import { mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { sql } from "kysely";
import { closeDb, getDb } from "../../packages/shared/src/db.js";
import {
  currentRunScope,
  restoreSpill,
  runScope,
  type SpillRow,
} from "../../packages/observability/src/index.js";
import { runWorkerOnce } from "../../packages/orchestrator/src/worker-shim.js";
import { dispatch } from "../../packages/orchestrator/src/dispatch.js";

// E8.1 verification (roadmap: "AUDIT §24: mock koşu N çağrı → N satır").
// Pure DB against the local Supabase stack; probe rows cleaned in afterAll
// (agent_runs/tool_calls/file_changes are append-only evidence — probe rows
// are removed by run id, the same idiom as every E6/E7 battery).
process.env.DXB_DATABASE_URL ??= "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
// Spill goes to a throwaway dir — never the real /var/lib path from a test.
process.env.OBS_SPILL_DIR = mkdtempSync(join(tmpdir(), "obs-spill-test-"));

const db = () => getDb();
const probeRunIds: string[] = [];
const probeTaskIds: string[] = [];

afterAll(async () => {
  if (probeRunIds.length > 0) {
    await sql`DELETE FROM tool_calls WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM file_changes WHERE run_id = ANY(${probeRunIds}::uuid[])`.execute(db());
    await sql`DELETE FROM agent_runs WHERE id = ANY(${probeRunIds}::uuid[])`.execute(db());
  }
  if (probeTaskIds.length > 0) {
    await sql`DELETE FROM task_events WHERE task_id = ANY(${probeTaskIds}::uuid[])`.execute(db());
    await sql`DELETE FROM tasks WHERE id = ANY(${probeTaskIds}::uuid[])`.execute(db());
  }
  await closeDb();
});

describe("E8.1 runScope — agent_runs open/close", () => {
  it("opens running, closes succeeded with usage", async () => {
    const { runId } = await runScope({ modelId: "test-e8-model" }, async (scope) => {
      scope.addUsage({ tokensIn: 120, tokensOut: 45 });
      scope.setProgress(60);
      const during = await sql<{ status: string }>`
        SELECT status FROM agent_runs WHERE id = ${scope.runId}::uuid
      `.execute(db());
      expect(during.rows[0].status).toBe("running");
      return "ok";
    });
    probeRunIds.push(runId);

    const row = await sql<{
      status: string;
      tokens_in: string;
      tokens_out: string;
      progress_pct: number;
      ended: boolean;
    }>`
      SELECT status, tokens_in, tokens_out, progress_pct, ended_at IS NOT NULL AS ended
        FROM agent_runs WHERE id = ${runId}::uuid
    `.execute(db());
    expect(row.rows[0]).toMatchObject({
      status: "succeeded",
      tokens_in: "120",
      tokens_out: "45",
      progress_pct: 100,
      ended: true,
    });
  });

  it("closes failed with the error text and rethrows untouched", async () => {
    let caughtRunId = "";
    await expect(
      runScope({}, async (scope) => {
        caughtRunId = scope.runId;
        throw new Error("executor exploded");
      }),
    ).rejects.toThrow("executor exploded");
    probeRunIds.push(caughtRunId);

    const row = await sql<{ status: string; error: string }>`
      SELECT status, error FROM agent_runs WHERE id = ${caughtRunId}::uuid
    `.execute(db());
    expect(row.rows[0]).toMatchObject({ status: "failed", error: "executor exploded" });
  });
});

describe("E8.1 tool_calls buffer — N calls → N rows", () => {
  it("writes exactly N rows for N recorded calls (drain on close)", async () => {
    const N = 7;
    const { runId } = await runScope({}, async (scope) => {
      for (let i = 0; i < N; i++) {
        scope.recordToolCall({ tool: `mock_tool_${i}`, durationMs: i * 10, ok: true });
      }
      return null;
    });
    probeRunIds.push(runId);

    const count = await sql<{ n: string }>`
      SELECT count(*) AS n FROM tool_calls WHERE run_id = ${runId}::uuid
    `.execute(db());
    expect(Number(count.rows[0].n)).toBe(N);
  });

  it("size-flushes at 20 before the run closes", async () => {
    const { runId } = await runScope({}, async (scope) => {
      for (let i = 0; i < 20; i++) scope.recordToolCall({ tool: "bulk", ok: true });
      // 20th push triggers an async flush — give it one tick, then look.
      await new Promise((r) => setTimeout(r, 300));
      const mid = await sql<{ n: string }>`
        SELECT count(*) AS n FROM tool_calls WHERE run_id = ${scope.runId}::uuid
      `.execute(db());
      expect(Number(mid.rows[0].n)).toBe(20);
      return null;
    });
    probeRunIds.push(runId);
  });

  it("records file changes with diff summary", async () => {
    const { runId } = await runScope({}, async (scope) => {
      scope.recordFileChange({ path: "src/x.ts", op: "modify", diffSummary: "+3 −1 tweak" });
      scope.recordFileChange({ path: "src/y.ts", op: "create", diffSummary: "+40 new module" });
      return null;
    });
    probeRunIds.push(runId);

    const rows = await sql<{ path: string; op: string; review_status: string }>`
      SELECT path, op, review_status FROM file_changes WHERE run_id = ${runId}::uuid ORDER BY path
    `.execute(db());
    expect(rows.rows).toEqual([
      { path: "src/x.ts", op: "modify", review_status: "unreviewed" },
      { path: "src/y.ts", op: "create", review_status: "unreviewed" },
    ]);
  });
});

describe("E8.1 spill — flush failure never blocks, evidence survives", () => {
  it("3 failed attempts spill to disk; restoreSpill replays them", async () => {
    let failures = 0;
    const failingInsert = async () => {
      failures += 1;
      throw new Error("sink down");
    };

    const { runId } = await runScope(
      {},
      async (scope) => {
        scope.recordToolCall({ tool: "doomed", ok: false, error: "n/a" });
        return "still fine"; // the agent path never saw the sink failure
      },
      { insert: failingInsert, skipSpillRestore: true },
    );
    probeRunIds.push(runId);
    expect(failures).toBe(3);

    const spilled = readdirSync(process.env.OBS_SPILL_DIR!).filter((f) => f.endsWith(".jsonl"));
    expect(spilled.length).toBeGreaterThan(0);

    // Replay through the real inserter — the row lands in tool_calls.
    const restored = await restoreSpill(async (rows: SpillRow[]) => {
      for (const r of rows) {
        await sql`
          INSERT INTO tool_calls (run_id, tool, ok, error)
          VALUES (${r.row.run_id}::uuid, ${r.row.tool}, ${r.row.ok}, ${r.row.error})
        `.execute(db());
      }
    });
    expect(restored.rows).toBeGreaterThan(0);

    const count = await sql<{ n: string }>`
      SELECT count(*) AS n FROM tool_calls WHERE run_id = ${runId}::uuid
    `.execute(db());
    expect(Number(count.rows[0].n)).toBe(1);
    expect(readdirSync(process.env.OBS_SPILL_DIR!).filter((f) => f.endsWith(".jsonl"))).toEqual([]);
  });

  it("a corrupt spill file is kept, not deleted (no evidence loss)", async () => {
    const bad = join(process.env.OBS_SPILL_DIR!, "obs-spill-corrupt.jsonl");
    writeFileSync(bad, "{not json\n");
    const restored = await restoreSpill(async () => undefined);
    expect(restored.files).toBe(0);
    expect(readdirSync(process.env.OBS_SPILL_DIR!)).toContain("obs-spill-corrupt.jsonl");
  });
});

describe("E8.1 worker-shim integration — real claim path", () => {
  it("runWorkerOnce wraps the executor: agent_runs + tool_calls land, task reaches review", async () => {
    const { taskIds } = await dispatch([
      {
        department: "engineering",
        objective: "E8.1 observability probe task: verify the wrapper",
        output_contract: "single line of probe text",
        model_tier: "L4",
        approval_class: "none",
        budget: { max_tokens: 1000, max_cost_eur: 0.1 },
        priority: 5,
        parent_task_id: null,
        deps: [],
      } as never,
    ]);
    probeTaskIds.push(...taskIds);

    const result = await runWorkerOnce({
      workerId: "e8-test-worker",
      departments: ["engineering"],
      execute: async () => {
        const scope = currentRunScope();
        expect(scope).toBeDefined();
        scope!.setModel("test-e8-model");
        scope!.recordToolCall({ tool: "grep", durationMs: 12, ok: true });
        scope!.recordToolCall({ tool: "read_file", durationMs: 7, ok: true });
        scope!.recordToolCall({ tool: "edit_file", durationMs: 31, ok: true });
        scope!.recordFileChange({ path: "a.ts", op: "modify", diffSummary: "+1 −1" });
        scope!.addUsage({ tokensIn: 500, tokensOut: 200 });
        return { result: { text: "done" }, confidence: 0.9 };
      },
    });

    expect(result).toMatchObject({ claimed: true, status: "review" });

    const run = await sql<{
      id: string;
      status: string;
      model_id: string;
      tokens_in: string;
      tool_n: string;
      file_n: string;
    }>`
      SELECT r.id, r.status, r.model_id, r.tokens_in,
             (SELECT count(*) FROM tool_calls t WHERE t.run_id = r.id) AS tool_n,
             (SELECT count(*) FROM file_changes f WHERE f.run_id = r.id) AS file_n
        FROM agent_runs r WHERE r.task_id = ${taskIds[0]}::uuid
    `.execute(db());
    probeRunIds.push(run.rows[0].id);

    expect(run.rows[0]).toMatchObject({
      status: "succeeded",
      model_id: "test-e8-model",
      tokens_in: "500",
      tool_n: "3",
      file_n: "1",
    });
  });

  it("a throwing executor fails BOTH the task and the run record", async () => {
    const { taskIds } = await dispatch([
      {
        department: "engineering",
        objective: "E8.1 observability failing probe: verify failure path",
        output_contract: "single line of probe text",
        model_tier: "L4",
        approval_class: "none",
        budget: { max_tokens: 1000, max_cost_eur: 0.1 },
        priority: 5,
        parent_task_id: null,
        deps: [],
      } as never,
    ]);
    probeTaskIds.push(...taskIds);

    const result = await runWorkerOnce({
      workerId: "e8-test-worker",
      departments: ["engineering"],
      execute: async () => {
        throw new Error("probe blew up");
      },
    });
    expect(result).toMatchObject({ claimed: true, status: "failed", error: "probe blew up" });

    const run = await sql<{ id: string; status: string; error: string }>`
      SELECT id, status, error FROM agent_runs WHERE task_id = ${taskIds[0]}::uuid
    `.execute(db());
    probeRunIds.push(run.rows[0].id);
    expect(run.rows[0]).toMatchObject({ status: "failed", error: "probe blew up" });
  });
});
