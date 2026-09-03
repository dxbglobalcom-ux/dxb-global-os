// Worker shim — ORCH-04 by construction: one call claims ONE task through
// claim_next_task (dependency-aware, FOR UPDATE SKIP LOCKED), works it, and
// moves it along the LOCKED status chain with an event per transition.
// The worker sees ONLY its claimed task row (typed envelope fields); results
// land in tasks.result — there is no channel to any other worker or task in
// this module, and none may be added.
//
// The executor is injectable (tests, specialised workers). The default
// executor resolves the model from routing_rules data by the task's tier:
// subscription rows ride the Agent SDK on local Claude auth; api rows go
// through the @dxb/shared LiteLLM client with the department's virtual key —
// raw provider keys never appear on either path.
// Confidence is SURFACED, not judged: it is written into tasks.result and the
// review-transition payload for 05-06's escalation ladder to consume
// (<0.6 counts as a fail THERE, not here).
import { sql } from "kysely";
import { z } from "zod";
import { query } from "@anthropic-ai/claude-agent-sdk";
import { getDb, llmCall } from "@dxb/shared";
import {
  currentRunScope,
  logDecision,
  resolveEvidenceToolCalls,
  runScope,
} from "@dxb/observability";
import {
  buildSdkToolOptions,
  mcpToolName,
  readDxbMcpInventory,
  resolveRuntimeProfile,
  type SdkToolOptions,
} from "@dxb/gateway";
import { loadPolicy, SDK_MODEL_IDS, type RoutingRule } from "@dxb/kernel";
import { recordSubscriptionSpend } from "./subscription-cap.js";

// R2.3: the R2.2 pieces moved to their dependency-clean homes so the workflow
// agent step (kernel) shares ONE implementation — re-exported here verbatim
// for API stability (tests/r21-r22 and any caller keep importing from us).
export { buildSdkToolOptions, resolveEvidenceToolCalls };
export type { SdkToolOptions };
import {
  checkConfidence,
  monitorTokens,
  postTask,
  preTask,
  type HookCtx,
  type PreVerdict,
} from "@dxb/hook";
import {
  alertHookDisabled,
  assembleHookCtx,
  buildHookResult,
  CURRENT_HOOK_VERSION,
  extractEvidencePackage,
  hookEnabled,
  stampHookVersion,
} from "./hook-binding.js";
import {
  checkContextBudget,
  contextText,
  estimateTokens,
  type CompressionMeasurement,
  type ContextBudgetDeps,
  type WorkingContext,
} from "./context-budget.js";
import { runCriticalGate } from "./critical-gate.js";

export interface ClaimedTask {
  id: string;
  department: string;
  objective: string;
  output_contract: string;
  model_tier: string;
  approval_class: string;
  budget_max_tokens: number;
  priority: number;
  status: string;
  // E10.2 — claim_next_task returns SETOF tasks; the hook binding reads the
  // real columns (optional: pre-hook fixtures construct the narrow shape).
  agent_id?: string | null;
  project_id?: string | null;
  milestone_id?: string | null;
  budget_max_cost_eur?: number | string | null;
  feedback?: string | null;
}

/** E10.2: what the binding hands the executor — the claimed row plus the
 *  std 11 project-purpose injection (§6 "proje amacı enjekte edilir"). The
 *  certified Executor signature is untouched; the extras flow structurally. */
export interface HookedClaimedTask extends ClaimedTask {
  hook_project_purpose?: string | null;
}

export interface WorkerOutput {
  result: unknown;
  confidence: number; // 0-1 self-report — escalation input, never dropped
  /** Measured by the executor, never model-declared: true when the run had a
   *  mounted tool surface (subscription path with a non-empty compiled
   *  profile). Toolless runs (api path, or empty profile) cannot produce
   *  tool_calls rows, so std 15's anchor is waived for them — the
   *  verification-kind evidence requirement itself stays. */
  toolSurfaceMounted?: boolean;
}

export type Executor = (task: ClaimedTask) => Promise<WorkerOutput>;

export interface RunWorkerArgs {
  workerId: string;
  departments: string[];
  execute?: Executor;
  leaseSeconds?: number;
}

export type RunWorkerResult =
  | { claimed: false }
  | { claimed: true; taskId: string; status: "review"; confidence: number }
  | { claimed: true; taskId: string; status: "failed"; error: string };

// R2.2 — the worker self-declares its evidence package (FABLE_5_HOOK A10:
// executor-declared keys, the binding never fabricates). `tool` names the MCP
// tool whose REAL tool_calls row anchors a verification item; the binding
// resolves it to a row id after the observability buffer settles (std 15
// tool_call_proof). acceptance_map answers the output contract (std 4/2/16).
const WorkerEvidence = z.object({
  kind: z.string().min(1), // 'verification' | 'command' | 'file' | free-form
  tool: z.string().min(1).optional(), // MCP tool name used (e.g. mcp__dxb-mcp__queue_get)
  // ROOT CAUSE of the "knowledge-shelf loop" recorded as an open runtime item on
  // 2026-07-24 and re-measured live on 2026-07-26: the post-gate accepts a
  // file-kind evidence entry ONLY with a `ref` (post-task library_registration),
  // and this schema did not carry the field — so Zod stripped it silently and
  // NO worker in this company could ever satisfy the rule. Six live runs
  // produced a contract-perfect research deliverable and were failed on a field
  // that was being deleted before the gate could see it.
  ref: z.string().min(1).optional(),
  note: z.string().min(1),
});
const WorkerJson = z.object({
  result: z.string(),
  confidence: z.number().min(0).max(1),
  evidence: z.array(WorkerEvidence).default([]),
  acceptance_map: z.record(z.string(), z.string()).default({}),
});

// R2.2 — tool surface cache (audit F-02/F-04): the dxb-mcp inventory is one
// in-memory server boot; cache it per process. Profile files are re-read per
// run (the 30s library recompile chain may swap them between runs — F-04
// step 7: a revoked grant must not survive in a stale cache).
let inventoryToolNames: string[] | null = null;

async function dxbInventoryNames(): Promise<string[]> {
  if (!inventoryToolNames) {
    const inv = await readDxbMcpInventory();
    inventoryToolNames = inv.map((e) => mcpToolName(e.server, e.tool));
  }
  return inventoryToolNames;
}

/**
 * What this task will actually execute with. Exported so the routing decision
 * can be proven in a test WITHOUT paying for a live model call — the wiring is
 * exactly where a silent mistake would hide.
 */
export interface ExecutionRoute {
  /** The tier the routing table asked for, straight off the task envelope. */
  taskTier: string;
  /** The tier after the employee's brain floor was applied (§4f). */
  effectiveTier: string;
  /** The routing row that won, and therefore the model. */
  rule: RoutingRule;
  /** The employee, when the task is staffed — the tool surface rides on this. */
  employee: { slug: string; department: string } | null;
}

/**
 * Resolves tier -> model for one task. The model is a routing_rules lookup (no
 * model name lives in this file, ORCH-02), and §4f lets the assigned employee's
 * brain RAISE that tier — never lower it.
 */
export async function resolveExecutionRoute(task: ClaimedTask): Promise<ExecutionRoute> {
  const rules = await loadPolicy(getDb()); // already priority-ordered

  // One read serves both jobs: the employee's compiled tool surface (R2.2,
  // audit F-02/F-04) and the brain floor. fn_effective_tier owns the comparison
  // so the quality ordering lives in one place (model_catalog.tier_floor)
  // instead of being re-derived here.
  let effectiveTier = task.model_tier;
  let employee: { slug: string; department: string } | null = null;
  let departmentId: string | null = null;
  if (task.agent_id) {
    const emp = await sql<{ slug: string; department: string; department_id: string | null; effective_tier: string }>`
      SELECT a.slug, a.department, d.id AS department_id,
             fn_effective_tier(${task.model_tier}, a.id) AS effective_tier
        FROM agents a
        LEFT JOIN departments d ON d.slug = a.department
       WHERE a.id = ${task.agent_id}::uuid
    `.execute(getDb());
    if (emp.rows[0]) {
      effectiveTier = emp.rows[0].effective_tier ?? effectiveTier;
      employee = { slug: emp.rows[0].slug, department: emp.rows[0].department };
      departmentId = emp.rows[0].department_id ?? null;
    }
  }

  // B43 (2026-09-03) — MODEL_ROUTING_SPEC §3 step 2 reads "kural taraması:
  // routing_rules (rol, departman, …)": a rule scoped to the employee's own
  // department wins at the same tier (the studio's creative row is L1 at
  // effort xhigh, the CEO's ruling of that day); a department-scoped row is
  // NEVER picked for another department, whatever its priority.
  // A raised tier with no enabled row would silently strand the task, so the
  // task's own tier stays the fallback: the floor is an upgrade path, never a
  // new failure mode.
  const rule: RoutingRule | undefined =
    (departmentId
      ? rules.find((r) => r.department_id === departmentId && r.model_tier === effectiveTier)
      : undefined) ??
    rules.find((r) => r.department_id == null && r.model_tier === effectiveTier) ??
    rules.find((r) => r.department_id == null && r.model_tier === task.model_tier);
  if (!rule) {
    throw new Error(`worker-shim: no enabled routing_rules row for tier '${task.model_tier}'`);
  }
  return { taskTier: task.model_tier, effectiveTier, rule, employee };
}

// Default executor: routing decided above; this function owns the SDK call.
async function defaultExecutor(task: ClaimedTask): Promise<WorkerOutput> {
  const { rule, employee } = await resolveExecutionRoute(task);

  // tools:[] is DEAD on the staffed path; an unstaffed task (no agent) or an
  // empty profile runs tool-less by default-deny, never by silent design.
  let toolOpts: SdkToolOptions | null = null;
  if (employee) {
    const surface = resolveRuntimeProfile(employee);
    if (surface.allowedTools.length > 0) {
      toolOpts = buildSdkToolOptions(surface, await dxbInventoryNames());
    }
  }

  const hooked = task as HookedClaimedTask;
  const prompt = [
    "You are a DXB Global OS worker agent. Complete the task below and answer",
    "as strict JSON only:",
    '{"result": "<deliverable text>", "confidence": <0..1>,',
    ' "evidence": [{"kind": "verification", "tool": "<mcp tool you called>", "note": "<what you checked>"}],',
    ' "acceptance_map": {"<each requirement of the output contract>": "<how the deliverable meets it, specific>"}}',
    "confidence is your honest self-assessment that the deliverable meets the contract.",
    // 2026-07-26: the gate has always required `ref` on a file-kind evidence
    // entry (post-task library_registration), but this prompt never showed the
    // shape — so a research task could satisfy every word of its contract and
    // still fail five times running on a field nobody had told the worker about.
    // That is the deterministic loop recorded as an open runtime item on
    // 2026-07-24. An evidence entry may carry `ref`, and when the contract asks
    // for a file entry it MUST.
    'An evidence entry may also be {"kind": "file", "ref": "<the exact ref your output',
    'contract names>", "note": "<what this artifact is>"} — when the contract asks for a',
    "file entry, copy its ref EXACTLY. A file entry without ref is rejected by the gate.",
    ...(toolOpts
      ? [
          "",
          "You have real MCP tools. VERIFY your work with at least one relevant tool",
          "call before answering (e.g. read back the record you touched), and list",
          "that call in evidence with kind 'verification' and the exact tool name.",
          "Never claim evidence for a tool you did not call.",
          `Your own task row id is ${task.id} (department ${task.department}) —`,
          "reading it back (e.g. queue_get) is a valid minimal verification.",
        ]
      : []),
    "",
    `Objective: ${task.objective}`,
    `Output contract: ${task.output_contract}`,
    // E10.2 std 11: the pre-gate injects the project purpose into the run.
    ...(hooked.hook_project_purpose
      ? ["", `Project purpose (holding alignment): ${hooked.hook_project_purpose}`]
      : []),
    // E10.2 §19: post-gate REVISE feedback rides the re-execution.
    ...(hooked.feedback
      ? ["", "Quality-gate revision feedback — address EVERY point:", hooked.feedback]
      : []),
  ].join("\n");

  // Observability tap (E8.1): the run scope travels on AsyncLocalStorage so
  // this certified Executor signature stays untouched.
  const obs = currentRunScope();
  obs?.setModel(rule.model);

  let raw: unknown;
  if (rule.mode === "subscription") {
    const q = query({
      prompt,
      options: {
        model: SDK_MODEL_IDS[rule.model] ?? rule.model,
        effort: rule.effort as "low" | "medium" | "high" | "xhigh" | "max",
        // R2.2: built-ins stay OFF (least privilege); the MCP surface is the
        // compiled gateway profile — allowed set mounted, everything else in
        // the inventory stripped from context, session pinned to these
        // servers only. Tool-less tasks keep the old empty surface.
        tools: [],
        ...(toolOpts
          ? {
              mcpServers: toolOpts.mcpServers,
              allowedTools: toolOpts.allowedTools,
              disallowedTools: toolOpts.disallowedTools,
              strictMcpConfig: toolOpts.strictMcpConfig,
              maxTurns: 12, // verification tool loops need turns
            }
          : { maxTurns: 4 }),
        outputFormat: { type: "json_schema", schema: z.toJSONSchema(WorkerJson) },
      },
    });
    for await (const msg of q) {
      // SDK tool traffic → tool_calls (params digest only, §16: no raw content).
      if (msg.type === "assistant") {
        const blocks = (msg as { message?: { content?: unknown } }).message?.content;
        if (Array.isArray(blocks)) {
          for (const b of blocks) {
            if (b && typeof b === "object" && (b as { type?: string }).type === "tool_use") {
              const tu = b as { name?: string; input?: unknown };
              obs?.recordToolCall({
                tool: tu.name ?? "unknown",
                paramsDigest: tu.input && typeof tu.input === "object"
                  ? { keys: Object.keys(tu.input as object) }
                  : null,
              });
            }
          }
        }
      }
      if (msg.type === "result") {
        if (msg.subtype !== "success") {
          throw new Error(`worker-shim: agent-sdk result error (${msg.subtype})`);
        }
        const usage = (msg as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
        const tokensIn = usage?.input_tokens ?? 0;
        const tokensOut = usage?.output_tokens ?? 0;
        obs?.addUsage({
          tokensIn,
          tokensOut,
          // costEur stays 0 on the subscription path: no marginal cost, and the
          // single-source cost rule (litellm.ts LOCKED header) forbids a second
          // cost writer. API-mode cost lands with the Phase-7 LiteLLM wiring.
        });
        // B39: the same figures, written where a BRAKE can read them. agent_runs
        // records what a run consumed; only cost_ledger is read by the money
        // brakes, and until 2026-08-25 this path wrote to neither of them. The
        // empty cost book is NOT the defect (the holding is still being built and
        // the earning machine is deliberately off) — the defect is that nothing
        // would fill it on the day it matters. Still no EUR here, so the
        // single-source rule above is untouched.
        await recordSubscriptionSpend({
          taskId: task.id,
          agentId: task.agent_id ?? null,
          department: task.department,
          model: rule.model,
          tokensIn,
          tokensOut,
        });
        raw = msg.structured_output ?? msg.result;
        break;
      }
    }
  } else {
    // api / free-tier rows: LiteLLM virtual key per department — never raw keys.
    const res = await llmCall({
      department: task.department,
      model: rule.model,
      messages: [{ role: "user", content: prompt }],
      maxTokens: Math.min(task.budget_max_tokens, 8192),
    });
    obs?.addUsage({
      tokensIn: res.usage.prompt_tokens,
      tokensOut: res.usage.completion_tokens,
    });
    raw = res.content;
  }

  if (typeof raw === "string") {
    const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    try {
      raw = JSON.parse((fenced ? fenced[1] : raw).trim());
    } catch {
      // R2.2: a tool-using session may close with prose instead of the JSON
      // envelope (structured_output absent). That is a QUALITY failure, not a
      // fatal one — surface it as an evidence-less package so the post-gate
      // REVISEs with feedback instead of the run dying before any gate.
      raw = { result: String(raw), confidence: 0.3, evidence: [], acceptance_map: {} };
    }
  }
  const parsed = WorkerJson.parse(raw);
  // Evidence keys ride result verbatim (A10 executor-declared carrier);
  // resolveEvidenceToolCalls anchors verification items to real tool_calls
  // rows after the observability buffer settles.
  return {
    result: {
      text: parsed.result,
      evidence: parsed.evidence,
      acceptance_map: parsed.acceptance_map,
    },
    confidence: parsed.confidence,
    toolSurfaceMounted: rule.mode === "subscription" && toolOpts !== null,
  };
}

// -- stepped execution + context budget (MEM-04, 06-07) ------------------------
//
// runWorkerOnce's single-shot Executor signature is UNTOUCHED (the certified
// Phase-5 slice). Multi-step work opts in by building its executor with
// makeSteppedExecutor: the loop runs the steps, and after each one the
// context-budget hook measures the working context — past the soft limit it
// compresses + offloads through the memory router's write door, and the
// compression is appended to the task's event trail as 'context_compressed'
// (from=to='running': an in-flight observation, not a status change — the
// 10/10-gate transition chain stays contiguous).

export interface StepOutcome {
  output: string;
  /** Optional running self-assessment; the LAST step's value is surfaced. */
  confidence?: number;
}

export type TaskStep = (
  task: ClaimedTask,
  ctx: WorkingContext,
  stepIndex: number,
) => Promise<StepOutcome>;

export interface SteppedExecutorArgs {
  workerId: string;
  steps: TaskStep[];
  /** Default ON for multi-step tasks; single-step tasks never pay the check. */
  contextBudget?: boolean;
  budgetDeps?: ContextBudgetDeps;
  /** Measurement tap (per step) — the 50-step demo builds its ölçüm logu here. */
  onMeasurement?: (m: CompressionMeasurement, compressed: boolean) => void;
}

export function makeSteppedExecutor(args: SteppedExecutorArgs): Executor {
  const { workerId, steps, budgetDeps, onMeasurement } = args;
  if (steps.length === 0) throw new Error("worker-shim: makeSteppedExecutor needs >= 1 step");
  const budgetEnabled = args.contextBudget ?? steps.length > 1;

  return async (task) => {
    const db = getDb();
    let ctx: WorkingContext = {
      taskId: task.id,
      workerId,
      department: task.department,
      entries: [],
    };
    let confidence = 0.5;

    for (let i = 0; i < steps.length; i++) {
      const out = await steps[i](task, ctx, i);
      ctx.entries.push({ step: i + 1, kind: "work", text: out.output });
      if (out.confidence !== undefined) confidence = out.confidence;

      if (!budgetEnabled) continue;
      const check = await checkContextBudget(ctx, budgetDeps);
      ctx = check.ctx;
      onMeasurement?.(check.measurement, check.compressed);
      if (check.compressed) {
        await db
          .insertInto("task_events")
          .values({
            task_id: task.id,
            event: "context_compressed",
            from_status: "running",
            to_status: "running",
            actor: workerId,
            payload: JSON.stringify(check.measurement),
          })
          .execute();
      }
    }

    return {
      result: {
        text: ctx.entries[ctx.entries.length - 1].text,
        steps: steps.length,
        context: contextText(ctx),
        context_tokens: estimateTokens(contextText(ctx)),
      },
      confidence,
    };
  };
}

// R2.1 — AGENT_ORCHESTRATION §3 step 1 / §6: intent-born tasks arrive
// agent-less (the Phase-5 dispatch writes envelopes, not staffing). Before
// the hook gates run, the claim assigns the least-loaded eligible employee:
// task department + employment_status='active' + an MCP profile (the
// std.permission_bounds pre-gate demands one), workload = open running runs.
//
// B39 (2026-08-25) — THE CEILING IS FINALLY IN FORCE. The spec has demanded
// `employee.max_concurrent_runs` since §6 was written, and it was never seeded:
// least-loaded ordering only PREFERRED an idle employee, it never refused a
// busy one. With one dispatch line that difference is invisible, because one
// line runs one task. With two lines it is the CEO's own sentence being broken —
// "HERKES KENDİ İŞİNİ YAPMALI" — two jobs landing on one person while the rest
// of the department sits idle. The setting is seeded by migration
// 20260825001000_b39_dispatch_brakes and closes A2.
//
// TWO KINDS OF "NOBODY", and they must not be confused:
//   · nobody EXISTS — the department has no activated workforce. Unchanged
//     behaviour: the task proceeds agent-less and the pre-gate rejects it loudly
//     (violation + ladder + blocked report = the CEO-visible signal).
//   · everybody is BUSY — a healthy department at full stretch. That is not a
//     defect and must never be reported as one, so the task goes back on the
//     queue untouched and the next tick places it. Ten seconds later somebody
//     is free.
const MAX_CONCURRENT_KEY = "employee.max_concurrent_runs";

/** Signals whether the claim survives: false = the task was returned to the queue. */
async function assignEmployee(task: ClaimedTask, workerId: string): Promise<boolean> {
  if (task.agent_id) return true; // dispatch or a prior round already staffed it
  const db = getDb();
  const pick = await sql<{
    id: string;
    slug: string;
    open_runs: number;
    cap: number;
    eligible: number;
  }>`
    WITH ceiling AS (
      SELECT GREATEST(fn_setting_numeric(${MAX_CONCURRENT_KEY}, 1), 1)::int AS cap
    ),
    staff AS (
      SELECT a.id, a.slug,
             (SELECT count(*)::int FROM agent_runs r
               WHERE r.employee_id = a.id AND r.status = 'running') AS open_runs
      FROM agents a
      WHERE a.department = ${task.department}
        AND a.employment_status = 'active'
        AND a.mcp_profile IS NOT NULL
    )
    SELECT s.id, s.slug, s.open_runs, c.cap,
           (SELECT count(*)::int FROM staff) AS eligible
    FROM staff s CROSS JOIN ceiling c
    WHERE s.open_runs < c.cap
    ORDER BY s.open_runs, s.slug
    LIMIT 1
  `.execute(db);
  const chosen = pick.rows[0];

  // The row above returns nothing in BOTH cases, so the two are told apart by a
  // second, cheap question: does the department have anybody at all?
  const staffed = chosen
    ? true
    : ((
        await sql<{ n: number }>`
          SELECT count(*)::int AS n FROM agents
          WHERE department = ${task.department}
            AND employment_status = 'active' AND mcp_profile IS NOT NULL
        `.execute(db)
      ).rows[0]?.n ?? 0) > 0;

  await logDecision(
    {
      runId: null,
      decidedBy: workerId,
      decision: "employee-selection",
      rationale: chosen
        ? `least-loaded active employee in '${task.department}': ${chosen.slug} (open runs ${chosen.open_runs} of ${chosen.cap})`
        : staffed
          ? `every active employee in '${task.department}' is at the concurrency ceiling — task returned to the queue, next tick places it`
          : `no active employee with an MCP profile in '${task.department}' — task proceeds agent-less, pre-gate will decide`,
      dataUsed: ["agents", "agent_runs", "settings_values"],
      alternatives: {
        rule: `AGENT_ORCHESTRATION §6 — department + active + least open runs, below ${MAX_CONCURRENT_KEY}`,
      },
      confidence: null,
      risk: chosen ? "low" : "medium",
    },
    { taskId: task.id },
  );

  if (chosen) {
    await db
      .updateTable("tasks")
      .set({ agent_id: chosen.id, updated_at: sql`now()` })
      .where("id", "=", task.id)
      .execute();
    task.agent_id = chosen.id; // the hook ctx downstream reads the claimed row
    return true;
  }

  if (!staffed) return true; // unchanged path: agent-less, the pre-gate speaks

  // Everybody busy — hand the task back exactly as it was found.
  //
  // LOSING THE RACE HERE IS A NORMAL OUTCOME, NOT AN ERROR. `transition` throws
  // when the row is no longer in the status it expected, which is the right
  // behaviour for a lifecycle move that MUST happen. This one is different: a
  // sibling lane may legitimately have moved this row in the same instant (the
  // lease reaper requeues it, an escalation fails it), and in every one of those
  // cases the task is already somewhere sane and this lane simply has nothing
  // left to do. Letting the throw escape would take down the whole drain — and
  // with it the other lanes' work in the same tick — over an outcome that costs
  // nothing. So the race is caught, named on the task's own trail, and the lane
  // reports "not claimed" exactly as it would have anyway.
  try {
    await transition(task.id, "running", "queued", workerId, {
      reason: "every eligible employee is at the concurrency ceiling",
      setting: MAX_CONCURRENT_KEY,
    });
  } catch (err) {
    console.warn(
      `[worker-shim] task ${task.id} moved on before it could be handed back (another lane or the reaper):`,
      err instanceof Error ? err.message : err,
    );
    return false;
  }
  // Only clear the claim if the row is still the one we just put back: the
  // status guard makes this a no-op if a sibling has already picked it up.
  await db
    .updateTable("tasks")
    .set({ claimed_by: null, updated_at: sql`now()` })
    .where("id", "=", task.id)
    .where("status", "=", "queued")
    .execute();
  return false;
}

// Guarded transition: UPDATE succeeds only from the expected status (race-safe),
// and every transition appends its event — the chain in task_events is the
// single source of truth escalation counts from.
async function transition(
  taskId: string,
  from: string,
  to: string,
  actor: string,
  payload: Record<string, unknown> = {},
  resultJson?: unknown,
): Promise<void> {
  const db = getDb();
  const updated = await db
    .updateTable("tasks")
    .set({
      status: to,
      updated_at: sql`now()`,
      ...(resultJson !== undefined ? { result: JSON.stringify(resultJson) } : {}),
    })
    .where("id", "=", taskId)
    .where("status", "=", from)
    .returning("id")
    .executeTakeFirst();
  if (!updated) {
    throw new Error(`worker-shim: transition ${from}→${to} lost a race on task ${taskId}`);
  }
  await db
    .insertInto("task_events")
    .values({
      task_id: taskId,
      event: "transition",
      from_status: from,
      to_status: to,
      actor,
      payload: JSON.stringify(payload),
    })
    .execute();
}

export async function runWorkerOnce(args: RunWorkerArgs): Promise<RunWorkerResult> {
  const { workerId, departments, execute = defaultExecutor, leaseSeconds = 900 } = args;
  const db = getDb();

  const claimedRows = await sql<ClaimedTask>`
    SELECT * FROM claim_next_task(${workerId}, ${departments}, ${leaseSeconds})
  `.execute(db);
  const task = claimedRows.rows[0];
  if (!task) return { claimed: false };

  // claim_next_task flips the row; the event trail must record it too.
  await db
    .insertInto("task_events")
    .values({
      task_id: task.id,
      event: "claimed",
      from_status: "queued",
      to_status: "claimed",
      actor: workerId,
      payload: JSON.stringify({ lease_seconds: leaseSeconds }),
    })
    .execute();

  await transition(task.id, "claimed", "running", workerId);

  // R2.1 — staff the task BEFORE the gates (spec §3: employee seç → preTask).
  // B39: a department at full stretch hands the task back rather than stacking
  // a second job on somebody already working. Reported as NOT claimed, because
  // that is what happened — no run was born and nothing was consumed.
  if (!(await assignEmployee(task, workerId))) return { claimed: false };

  // ── E10.2 hook binding (FABLE_5_HOOK §3) ──────────────────────────────────
  // Flag ON: preTask BEFORE the run is born (§6: a block rejection = the run
  // never exists, the task fails as policy), hook_version stamped on the
  // employee (roadmap acceptance), in-run monitors + post-gate inside the run
  // scope. Flag OFF: the pre-E10 path, loudly (§22 'hook:disabled' alert).
  const hookOn = await hookEnabled(task.agent_id ?? null);
  if (!hookOn) await alertHookDisabled();

  // §4e: does this task's class bind money, reputation or the company's
  // direction? The switch is the routing row's needs_council flag — the same
  // one CNCL-01 used, kept so the gate is CEO-configurable as data. A routing
  // failure here must not fail the task: no route resolved simply means no gate.
  let needsGate = false;
  try {
    needsGate = (await resolveExecutionRoute(task)).rule.needs_council === true;
  } catch {
    needsGate = false;
  }

  let hookCtx: HookCtx | null = null;
  let preVerdict: Extract<PreVerdict, { verdict: "PASS" }> | null = null;
  if (hookOn) {
    hookCtx = await assembleHookCtx(task);
    const pre = await preTask(hookCtx);
    if (pre.verdict === "REJECT") {
      const error = `policy: ${pre.reason}`;
      await transition(task.id, "running", "failed", "hook", {
        error,
        hook_gate: "pre",
        violations: pre.violations.map((v) => v.policyId),
      });
      return { claimed: true, taskId: task.id, status: "failed", error };
    }
    preVerdict = pre;
    // ROADMAP E10.2 acceptance: spawn → agents.hook_version dolu.
    if (task.agent_id) await stampHookVersion(task.agent_id);
  }

  // B43 (2026-09-03) — a running task RENEWS its lease while its worker is
  // alive. Measured that day: claim_next_task leases 900 s, reap_expired_leases
  // runs every 60 s, and nothing anywhere renewed — so any run longer than
  // fifteen minutes (a media render, a long gate) was handed back to the queue
  // mid-flight and run twice. The reaper exists for DEAD workers; a live one
  // says so on a cadence of a quarter lease (never faster than once a second,
  // never slower than once a minute).
  const heartbeat = setInterval(() => {
    void sql`
      UPDATE tasks SET lease_expires_at = now() + make_interval(secs => ${leaseSeconds}), updated_at = now()
       WHERE id = ${task.id}::uuid AND claimed_by = ${workerId} AND status IN ('claimed', 'running')
    `
      .execute(db)
      .catch((err) => console.error("[worker-shim] lease heartbeat:", err));
  }, Math.max(1_000, Math.min(60_000, leaseSeconds * 250)));
  heartbeat.unref?.();

  try {
    // E8.1: every execution runs inside an observability scope — agent_runs
    // open/close + buffered tool_calls/file_changes ride AsyncLocalStorage.
    // Observation never blocks this path (spec §3 ⛔): a dead observability
    // write spills to disk and the task outcome is decided by execute() alone.
    const { value: out } = await runScope(
      {
        taskId: task.id,
        employeeId: task.agent_id ?? null,
        hookVersion: hookOn ? CURRENT_HOOK_VERSION : null,
      },
      async (scope) => {
        if (!hookOn || !hookCtx || !preVerdict) return execute(task);

        // In-run rules (§6 runtime: the hook MONITORS, the runner decides) +
        // post-gate with the §19 revision loop. std 9: the run can only close
        // 'succeeded' through a post-gate PASS — REVISE re-executes with the
        // feedback, exhaustion ESCALATEs (§7 chain recorded by the gate) and
        // the run fails.
        const ctx: HookCtx = { ...hookCtx, runId: scope.runId };
        const monitors = {
          tokenBudgetExceeded: false,
          confidenceEscalationRequired: false,
        };
        const execTask: HookedClaimedTask = {
          ...task,
          hook_project_purpose: preVerdict.inject.projectPurpose,
        };
        let rounds = 0;
        let gateRounds = 0;
        for (;;) {
          const attempt = await execute(execTask);

          // R2.2: settle the observability buffer, then anchor declared
          // verification evidence to the run's real tool_calls rows BEFORE
          // the post-gate reads the package (std 15 tool_call_proof).
          await scope.settle();
          await resolveEvidenceToolCalls(attempt.result, scope.runId);

          if (!monitors.tokenBudgetExceeded) {
            const u = scope.snapshotUsage();
            const tok = await monitorTokens(ctx, u.tokensIn + u.tokensOut);
            monitors.tokenBudgetExceeded = tok.exceeded;
          }
          if (!monitors.confidenceEscalationRequired) {
            const conf = await checkConfidence(ctx, attempt.confidence);
            monitors.confidenceEscalationRequired = conf.escalationRequired;
          }

          const post = await postTask(
            // toollessRun only when the executor MEASURED the surface absent
            // (undefined = executor didn't declare — std 15 stays strict).
            {
              ...ctx,
              revisionRound: rounds,
              toollessRun: attempt.toolSurfaceMounted === false,
            },
            extractEvidencePackage(attempt.result),
          );
          scope.setHookResult(
            buildHookResult({ pre: preVerdict, post, rounds, monitors }),
          );
          if (post.verdict === "PASS") {
            // §4e critical gate. The QA hook says the deliverable meets its
            // contract; the gate asks a different question — is it WRONG?
            // Independent challengers try to refute it, and their objections
            // come back as one revision round, so the author (the L1 model)
            // revises and signs. Exactly one gate round: a second would let two
            // reviewers argue forever over one task.
            if (needsGate && gateRounds === 0) {
              const gate = await runCriticalGate({
                subject: task.objective,
                answer:
                  typeof attempt.result === "string"
                    ? attempt.result
                    : JSON.stringify(attempt.result),
                context: task.output_contract,
                taskId: task.id,
                runId: scope.runId,
              });
              if (gate.status === "objections") {
                gateRounds += 1;
                execTask.feedback = gate.feedback;
                continue;
              }
              // `clean` and `unavailable` both proceed. An unreachable panel is
              // recorded in decision_log as `unavailable` and stays visible —
              // it must never be able to halt the company on its own.
            }
            return attempt;
          }
          if (post.verdict === "REVISE") {
            rounds += 1;
            execTask.feedback = post.feedback.join("\n");
            continue;
          }
          throw new Error(
            `hook post-gate ESCALATE after ${rounds} revision round(s): ${post.feedback.join("; ")}`,
          );
        }
      },
    );
    await transition(
      task.id,
      "running",
      "review",
      workerId,
      { confidence: out.confidence },
      { ...(typeof out.result === "object" && out.result !== null ? out.result : { value: out.result }), confidence: out.confidence },
    );
    return { claimed: true, taskId: task.id, status: "review", confidence: out.confidence };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await transition(task.id, "running", "failed", workerId, { error: message });
    return { claimed: true, taskId: task.id, status: "failed", error: message };
  } finally {
    clearInterval(heartbeat);
  }
}
