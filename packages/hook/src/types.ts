// FABLE_5_HOOK_SPEC §8 — hook library types. Pure-function contracts: the
// hook holds NO state of its own (state lives in the DB, §10); a HookCtx is
// assembled by the caller (dispatch/runner in E10.2, tests today).

/** hook_policies row (§4). */
export interface HookPolicyRow {
  id: string;
  standard_no: number;
  gate: "pre" | "runtime" | "post";
  rule: Record<string, unknown>;
  severity: "block" | "warn";
  enabled: boolean;
  version: number;
  title_en: string;
  title_tr: string;
}

/** Result of a policy load: valid rows + rows whose rule JSON is broken.
 *  A broken policy is NEVER silently skipped — its gate rejects (§17). */
export interface PolicyLoad {
  rows: HookPolicyRow[];
  invalid: HookPolicyRow[];
  /** Conflicting pairs resolved to the most restrictive severity (§27). */
  conflicts: Array<{ check: string; gate: string; policyIds: string[] }>;
}

export interface HookEmployeeCtx {
  /** agents.id — null only in synthetic test contexts. */
  id: string | null;
  slug?: string | null;
  department?: string | null;
  mcpProfile?: string | null;
  managerId?: string | null;
  /** personas.quality_gate — when omitted the pre-gate looks it up by id. */
  personaGate?: string | null;
}

export interface HookTaskCtx {
  id?: string | null;
  objective?: string | null;
  outputContract?: string | null;
  budgetMaxTokens?: number | null;
  budgetMaxCostEur?: number | null;
  /** E9.4 chain: tasks.milestone_id → project_milestones.project_id (A7). */
  milestoneId?: string | null;
  planRequired?: boolean;
  requiresMemory?: boolean;
}

export interface HookCtx {
  employee: HookEmployeeCtx;
  task: HookTaskCtx;
  /** Explicit project link (std 11) — alternative to task.milestoneId. */
  project?: { id: string; purpose?: string | null } | null;
  /** Resolved allowed tool surface (profile ∩ grants, PERMISSION_MODEL). */
  grants?: string[] | null;
  requestedTools?: string[] | null;
  /** decision_log id proving the plan step (std 3, when planRequired). */
  planDecisionId?: string | null;
  budget?: { remainingEur?: number | null; hardStop?: boolean } | null;
  runId?: string | null;
  spawnDepth?: number;
  spawnRationale?: string | null;
  /** §27: the CEO is never blocked — block violations degrade to warn+audit. */
  actor?: "system" | "ceo";
  /** Completed post-gate REVISE rounds so far (ORCHESTRATION §19). */
  revisionRound?: number;
}

export interface EvidenceItem {
  /** 'verification' | 'command' | 'file' | 'memory' | free-form. */
  kind: string;
  note?: string;
  /** tool_calls.id — std 15 proof ("doğrulama komutu koşuldu mu"). */
  toolCallId?: string | null;
  ref?: string | null;
}

/** §6 post-gate evidence package: {output, evidence[], acceptance_map}. */
export interface PostTaskResult {
  output: unknown;
  evidence: EvidenceItem[];
  /** acceptance criterion → what in the output answers it. */
  acceptanceMap: Record<string, string>;
  /** How many §10-important decisions the agent claims it made (std 14). */
  decisionsClaimed?: number;
  memoryWritten?: boolean;
}

export interface ViolationNote {
  policyId: string;
  detail: string;
  severity: "block" | "warn";
}

export type PreVerdict =
  | {
      verdict: "PASS";
      warnings: ViolationNote[];
      /** std 11: "proje amacı enjekte edilir". */
      inject: { projectId: string | null; projectPurpose: string | null };
    }
  | { verdict: "REJECT"; reason: string; violations: ViolationNote[] };

export type PostVerdict =
  | { verdict: "PASS"; warnings: ViolationNote[] }
  | { verdict: "REVISE"; feedback: string[]; violations: ViolationNote[] }
  | {
      verdict: "ESCALATE";
      chain: string[];
      approvalId: string | null;
      feedback: string[];
      violations: ViolationNote[];
    };

/** §6 runtime rules: the hook MONITORS these; the runner is the single kill
 *  authority (no second brain). */
export interface RuntimeLimits {
  enabled: boolean;
  tokenBudget: number;
  maxSpawnDepth: number;
  requireSpawnRationale: boolean;
  contextSummaryThreshold: number;
  escalationConfidenceThreshold: number;
  escalationChain: string[];
  maxRevisionRounds: number;
}
