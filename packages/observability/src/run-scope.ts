// runScope — the Claude Agent SDK wrapper seam (OBSERVABILITY_SPEC §3/§6,
// roadmap E8.1). One call wraps one agent run:
//
//   opening : agent_runs INSERT (status 'running')
//   during  : tool_calls through a batch buffer (20 rows / 2s flush — §3),
//             file_changes buffered on the same machinery, usage accumulation
//   closing : agent_runs UPDATE (the R2 append-only exception: closure
//             columns only) + final buffer drain
//
// ⛔ architecture-critical (§3): observation never blocks the agent path.
// record*() calls are synchronous queue pushes; flushing is async; a flush
// that fails 3 attempts spills to disk (spill.ts) and the run continues.
// The executor reaches its scope through AsyncLocalStorage — the certified
// Phase-5 Executor signature stays untouched.
import { AsyncLocalStorage } from "node:async_hooks";
import { getDb } from "@dxb/shared";
import { restoreSpill, spill, type SpillRow } from "./spill.js";

export interface RunContext {
  taskId?: string | null;
  employeeId?: string | null;
  workflowRunId?: string | null;
  parentRunId?: string | null;
  modelId?: string | null;
  /** E10.2 (FABLE_5_HOOK §27): the hook version the run is born under. */
  hookVersion?: string | null;
}

export interface ToolCallEvent {
  tool: string;
  paramsDigest?: unknown;
  durationMs?: number;
  ok?: boolean;
  error?: string;
}

export interface FileChangeEvent {
  path: string;
  op: "read" | "create" | "modify" | "delete";
  diffSummary?: string;
  commitSha?: string;
}

export interface RunUsage {
  tokensIn?: number;
  tokensOut?: number;
  costEur?: number;
}

const FLUSH_MAX_ROWS = 20; // spec §3: 20 kayıt
const FLUSH_MAX_MS = 2_000; // spec §3: 2 sn
const FLUSH_ATTEMPTS = 3; // spec §17: 3 deneme → spill

type InsertFn = (rows: SpillRow[]) => Promise<void>;

async function defaultInsert(rows: SpillRow[]): Promise<void> {
  const db = getDb();
  const tools = rows.filter((r) => r.table === "tool_calls").map((r) => r.row);
  const files = rows.filter((r) => r.table === "file_changes").map((r) => r.row);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (tools.length > 0) await db.insertInto("tool_calls").values(tools as any).execute();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (files.length > 0) await db.insertInto("file_changes").values(files as any).execute();
}

export class RunScope {
  readonly runId: string;
  private queue: SpillRow[] = [];
  private timer: NodeJS.Timeout | null = null;
  private flushing: Promise<void> = Promise.resolve();
  private usage = { tokensIn: 0, tokensOut: 0, costEur: 0 };
  private model: string | null;
  private progress: number | null = null;
  private hookResult: unknown = null;
  private readonly insert: InsertFn;

  constructor(runId: string, modelId: string | null, insert: InsertFn = defaultInsert) {
    this.runId = runId;
    this.model = modelId;
    this.insert = insert;
  }

  recordToolCall(e: ToolCallEvent): void {
    this.enqueue({
      table: "tool_calls",
      row: {
        run_id: this.runId,
        tool: e.tool,
        params_digest: e.paramsDigest === undefined ? null : JSON.stringify(e.paramsDigest),
        duration_ms: e.durationMs ?? null,
        ok: e.ok ?? null,
        error: e.error ?? null,
      },
    });
  }

  recordFileChange(e: FileChangeEvent): void {
    this.enqueue({
      table: "file_changes",
      row: {
        run_id: this.runId,
        path: e.path,
        op: e.op,
        diff_summary: e.diffSummary ?? null,
        commit_sha: e.commitSha ?? null,
      },
    });
  }

  addUsage(u: RunUsage): void {
    this.usage.tokensIn += u.tokensIn ?? 0;
    this.usage.tokensOut += u.tokensOut ?? 0;
    this.usage.costEur += u.costEur ?? 0;
  }

  setModel(modelId: string): void {
    this.model = modelId;
  }

  setProgress(pct: number): void {
    this.progress = Math.max(0, Math.min(100, Math.round(pct)));
  }

  /** E10.2 (FABLE_5_HOOK §14): the gate summary the closure UPDATE persists —
   *  set by the hook binding before the run closes; ops:live terminal events
   *  surface it as the run.finished hook_result payload field (§9). */
  setHookResult(result: unknown): void {
    this.hookResult = result;
  }

  currentHookResult(): unknown {
    return this.hookResult;
  }

  /** R2.2 — drain the pending buffer NOW and wait for it. The evidence
   *  resolver (worker-shim) needs the run's tool_calls rows queryable before
   *  the post-gate checks std 15 (tool_call_proof). Same never-throws
   *  contract as flush(); a spill still resolves. */
  settle(): Promise<void> {
    return this.flush();
  }

  private enqueue(row: SpillRow): void {
    this.queue.push(row);
    if (this.queue.length >= FLUSH_MAX_ROWS) {
      void this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), FLUSH_MAX_MS);
      this.timer.unref?.();
    }
  }

  // Serialised flush: never throws, never blocks the caller. 3 failed
  // attempts send the batch to the disk spill.
  private flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const batch = this.queue;
    if (batch.length === 0) return this.flushing;
    this.queue = [];
    this.flushing = this.flushing.then(async () => {
      for (let attempt = 1; attempt <= FLUSH_ATTEMPTS; attempt++) {
        try {
          await this.insert(batch);
          return;
        } catch (err) {
          if (attempt === FLUSH_ATTEMPTS) {
            console.error(
              `[obs] flush failed ${FLUSH_ATTEMPTS}x for run ${this.runId} — spilling ${batch.length} rows:`,
              err,
            );
            spill(batch);
            await this.raiseSpillAlert(batch.length, err);
          }
        }
      }
    });
    return this.flushing;
  }

  // §17: the spill itself raises a High alert (E8.4b alerts table) —
  // best-effort: the flush just failed, so this insert may fail too; it
  // logs and moves on (observation never blocks). dedup_key keeps one
  // active alert per spill condition.
  private async raiseSpillAlert(rowCount: number, cause: unknown): Promise<void> {
    try {
      const db = getDb();
      await db
        .insertInto("alerts")
        .values({
          level: "high",
          source: "observability",
          title: `Observation flush failed — ${rowCount} rows spilled to disk`,
          affected_area: "observability buffer",
          probable_cause: String(cause).slice(0, 300),
          suggested_action:
            "Check DB connectivity; spilled rows replay at next run scope open",
          run_id: this.runId,
          dedup_key: "obs-spill",
          source_ref: JSON.stringify({ table: "agent_runs", id: this.runId }),
        })
        .execute();
    } catch (err: unknown) {
      // unique violation = an active spill alert already exists — fine.
      if ((err as { code?: string })?.code !== "23505") {
        console.error("[obs] spill alert insert failed (spill file kept):", err);
      }
    }
  }

  /** Final drain — awaited by runScope closure only, never by the agent path. */
  async drain(): Promise<void> {
    await this.flush();
  }

  snapshotUsage(): { tokensIn: number; tokensOut: number; costEur: number } {
    return { ...this.usage };
  }

  currentModel(): string | null {
    return this.model;
  }

  currentProgress(): number | null {
    return this.progress;
  }
}

const als = new AsyncLocalStorage<RunScope>();

/** The scope of the run currently executing on this async path, if any. */
export function currentRunScope(): RunScope | undefined {
  return als.getStore();
}

export interface RunScopeOptions {
  /** Test seam: replaces the batch inserter (defaults to the shared db path). */
  insert?: InsertFn;
  /** Skip the opening spill replay (tests). */
  skipSpillRestore?: boolean;
}

export interface RunResult<T> {
  runId: string;
  value: T;
}

// Wraps one agent run. fn resolves → closure UPDATE 'succeeded'; fn throws →
// closure 'failed' + error text, and the error is rethrown untouched after
// the buffers drained (evidence first, then the failure propagates).
export async function runScope<T>(
  ctx: RunContext,
  fn: (scope: RunScope) => Promise<T>,
  opts: RunScopeOptions = {},
): Promise<RunResult<T>> {
  const db = getDb();
  const insert = opts.insert ?? defaultInsert;

  if (!opts.skipSpillRestore) {
    // Earlier crashes may have left evidence on disk — replay before new work.
    await restoreSpill(insert).catch(() => undefined);
  }

  let opened: { id: string };
  try {
    opened = await db
      .insertInto("agent_runs")
      .values({
        task_id: ctx.taskId ?? null,
        employee_id: ctx.employeeId ?? null,
        workflow_run_id: ctx.workflowRunId ?? null,
        parent_run_id: ctx.parentRunId ?? null,
        model_id: ctx.modelId ?? null,
        hook_version: ctx.hookVersion ?? null,
        status: "running",
      })
      .returning("id")
      .executeTakeFirstOrThrow();
  } catch (err) {
    // ⛔ §3: observation never blocks the agent path — a failed opening INSERT
    // degrades to an unrecorded run (loud), it does not stop the work.
    console.error("[obs] agent_runs opening INSERT failed — run proceeds UNRECORDED:", err);
    const value = await fn(new RunScope("00000000-0000-0000-0000-000000000000", ctx.modelId ?? null, async () => undefined));
    return { runId: "unrecorded", value };
  }

  const scope = new RunScope(opened.id, ctx.modelId ?? null, insert);

  const close = async (status: "succeeded" | "failed", error?: string) => {
    await scope.drain();
    const u = scope.snapshotUsage();
    try {
      await db
        .updateTable("agent_runs")
        .set({
          status,
          ended_at: new Date(),
          tokens_in: String(u.tokensIn),
          tokens_out: String(u.tokensOut),
          cost_eur: u.costEur,
          model_id: scope.currentModel(),
          progress_pct: status === "succeeded" ? 100 : scope.currentProgress(),
          error: error ?? null,
          hook_result:
            scope.currentHookResult() == null
              ? null
              : JSON.stringify(scope.currentHookResult()),
        })
        .where("id", "=", scope.runId)
        .execute();
    } catch (err) {
      // The run record stays 'running' — visible as an orphan (AUDIT edge:
      // yetim tespiti). Never mask the agent's own outcome with a log error.
      console.error(`[obs] closure UPDATE failed for run ${scope.runId}:`, err);
    }
  };

  try {
    const value = await als.run(scope, () => fn(scope));
    await close("succeeded");
    return { runId: scope.runId, value };
  } catch (err) {
    await close("failed", err instanceof Error ? err.message : String(err));
    throw err;
  }
}
