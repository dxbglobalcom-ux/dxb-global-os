// Hand-written Kysely table types. The SQL migrations under db/migrations/ are the
// schema authority (LOCKED) — these interfaces mirror them 1:1; no codegen.
// Conventions: pg returns numeric as string and int8 identity as string;
// jsonb stays `unknown` at this layer (Zod refines at the MCP boundary).
import type { ColumnType, Generated } from "kysely";

type Timestamptz = Generated<Date>;
type Jsonb = ColumnType<unknown, unknown | undefined, unknown>;
type JsonbRequired = ColumnType<unknown, unknown, unknown>;
type Numeric = ColumnType<string, number | string | undefined, number | string>;
type NumericNullable = ColumnType<string | null, number | string | null | undefined, number | string | null>;

export interface TasksTable {
  id: Generated<string>;
  parent_task_id: string | null;
  department: string;
  agent_id: string | null;
  objective: string;
  output_contract: string;
  model_tier: string;
  approval_class: Generated<string>;
  budget_max_tokens: Generated<number>;
  budget_max_cost_eur: Numeric;
  priority: Generated<number>;
  status: Generated<string>;
  claimed_by: string | null;
  claimed_at: Date | null;
  lease_expires_at: Date | null;
  result: Jsonb | null;
  feedback: string | null;
  depends_on: Generated<string[]>;
  // std 11 (project link) and B10 (the CEO's one-line headline, both locales). Declared
  // Generated — every one is nullable with a default — so no existing insert has to name
  // them; until 2026-09-05 dispatch.ts wrote them through an untyped spread.
  project_id: Generated<string | null>;
  milestone_id: Generated<string | null>;
  label: Generated<string | null>;
  label_tr: Generated<string | null>;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface RoutingRulesTable {
  id: Generated<string>;
  task_class: string;
  match: Jsonb;
  model_tier: string;
  model: string;
  mode: string;
  effort: Generated<string>;
  needs_council: Generated<boolean>;
  priority: Generated<number>;
  enabled: Generated<boolean>;
  updated_at: Timestamptz;
  // Live columns measured on the company engine 2026-09-03 (MODEL_ROUTING_SPEC §3
  // E6.1 delta, applied): a rule may be scoped to one department — B43's studio
  // row is the first such row (L1 / xhigh for media-studio).
  model_id: string | null;
  role_slot: string | null;
  department_id: string | null;
  risk_max: string | null;
  min_context: number | null;
  cost_cap_per_task: number | string | null;
}

export interface TaskEventsTable {
  id: Generated<string>;
  task_id: string;
  event: string;
  from_status: string | null;
  to_status: string | null;
  actor: string;
  payload: Jsonb;
  created_at: Timestamptz;
}

export interface DepartmentsTable {
  slug: string;
  display_name: string;
  mcp_profile: Generated<string>;
  status: Generated<string>;
  created_at: Timestamptz;
  id: Generated<string>;
  company_id: string | null;
  parent_id: string | null;
  director_id: string | null;
}

export interface AgentsTable {
  id: Generated<string>;
  slug: string;
  department: string;
  role: string;
  brain: Generated<string>;
  mcp_profile: Generated<string>;
  skills: Jsonb;
  autonomy_level: Generated<number>;
  persona_path: string;
  persona_version: Generated<string>;
  status: Generated<string>;
  // HR family (E5.4/E6.3 — live since 20260711006000; mirror was stale)
  role_level: string | null;
  manager_id: string | null;
  employment_status: Generated<string>;
  persona_id: string | null;
  hook_version: string | null;
  title: string | null;
  title_tr: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface ApprovalsTable {
  id: Generated<string>;
  task_id: string | null; // nullable in live schema — workflow approval steps carry no task
  action_type: string;
  payload: JsonbRequired;
  risk_class: Generated<string>;
  status: Generated<string>;
  decided_by: string | null;
  decided_at: Date | null;
  decision_note: string | null;
  created_at: Timestamptz;
  // E9.3 §21 extension (20260713110000) — all nullable
  requester_employee_id: string | null;
  department_id: string | null;
  project_id: string | null;
  operation: string | null;
  purpose: string | null;
  operation_class: string | null; // money_out|contract|identity|high_cost|other (A1: risk_class stays severity)
  cost_estimate: number | null;
  deadline: Date | null;
  model_to_use: string | null;
  affected_systems: string[] | null;
  affected_files: string[] | null;
  recommended_action: string | null;
  reasoning_summary: string | null;
  alternatives: Jsonb | null;
  previous_reviews: Jsonb | null;
  decided_action: string | null;
  modifications: Jsonb | null;
  delegated_to: string | null;
  reanalysis_run_id: string | null;
  policy_change_id: number | null;
}

export interface ApprovalRulesTable {
  id: Generated<string>;
  operation_pattern: string;
  risk_class: string;
  gate: string;
  locked: Generated<boolean>;
  enabled: Generated<boolean>;
  priority: Generated<number>;
  updated_by: string | null;
  updated_at: Timestamptz;
}

export interface OutboxTable {
  id: Generated<string>;
  approval_id: string;
  idempotency_key: string;
  status: Generated<string>;
  attempts: Generated<number>;
  last_error: string | null;
  executed_at: Date | null;
  execution_result: Jsonb | null;
}

/** B43 — the Media Studio's job book (db/migrations/20260903190000_b43_media_hands.sql).
 *  One row per engine job an expert submits through dxb-mcp `media_*`; the resident
 *  scheduler's media lane executes them one at a time on the holding's own card. */
export interface MediaJobsTable {
  id: Generated<string>;
  task_id: string | null;
  employee_id: string | null;
  department: string | null;
  kind: "still" | "shoot" | "upscale" | "voice" | "assemble" | "probe";
  params: Jsonb;
  note: string | null;
  status: Generated<"queued" | "running" | "done" | "failed" | "cancelled">;
  cancel_requested: Generated<boolean>;
  claimed_by: string | null;
  started_at: Date | null;
  ended_at: Date | null;
  wall_seconds: number | string | null;
  peak_vram_mib: number | null;
  peak_ram_gib: number | string | null;
  output_path: string | null;
  result: Jsonb | null;
  error: string | null;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface CostLedgerTable {
  id: Generated<string>;
  task_id: string | null;
  agent_id: string | null;
  department: string | null;
  model: string;
  mode: string;
  prompt_tokens: Generated<number>;
  completion_tokens: Generated<number>;
  cost_eur: Numeric;
  source: Generated<string>;
  meta: Jsonb;
  created_at: Timestamptz;
}

export interface AuditLogTable {
  id: Generated<string>;
  actor: string;
  actor_type: string;
  action: string;
  task_id: string | null;
  payload: Jsonb;
  created_at: Timestamptz;
}

export interface BudgetStateTable {
  id: Generated<boolean>;
  monthly_cap_eur: Numeric;
  hard_stopped: Generated<boolean>;
  velocity_cap_eur_per_hour: Numeric;
  breaker_tripped: Generated<boolean>;
  breaker_tripped_at: Date | null;
  updated_at: Timestamptz;
}

export interface MemoryIndexTable {
  id: Generated<string>;
  kind: string;
  store: string;
  ref: string;
  provenance: JsonbRequired;
  trust_tier: Generated<string>;
  confidence: Numeric;
  superseded_by: string | null;
  created_at: Timestamptz;
  expires_at: Date | null;
}

export interface MemoryEmbeddingsTable {
  index_id: string;
  body: string;
  // pgvector transports as string through kysely/pg ('[v1,v2,...]'); adapters cast ::vector
  embedding: string | null;
}

export interface CrmClientsTable {
  id: Generated<string>;
  name: string;
  status: Generated<string>;
  meta: Jsonb;
  created_at: Timestamptz;
}

export interface CrmContactsTable {
  id: Generated<string>;
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  created_at: Timestamptz;
}

export interface CrmRequestsTable {
  id: Generated<string>;
  client_id: string | null;
  task_id: string | null;
  summary: string;
  status: Generated<string>;
  created_at: Timestamptz;
}

export interface CrmDealsTable {
  id: Generated<string>;
  client_id: string;
  title: string;
  value_eur: NumericNullable;
  stage: Generated<string>;
  created_at: Timestamptz;
}

export interface ToolPinsTable {
  id: Generated<string>;
  server: string;
  tool: string;
  schema_hash: string;
  quarantined: Generated<boolean>;
  pinned_at: Timestamptz;
  last_checked: Date | null;
}

export interface IntentsTable {
  id: Generated<string>;
  text: string;
  lang: Generated<string>;
  source: Generated<string>;
  actor: Generated<string>;
  status: Generated<string>;
  error: string | null;
  task_ids: Generated<string[]>;
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

// Observability family (0022x — OBSERVABILITY_SPEC §4). Append-only evidence
// tables; the ONLY sanctioned UPDATE is the agent_runs closure (R2 exception).
export interface AgentRunsTable {
  id: Generated<string>;
  employee_id: string | null;
  task_id: string | null;
  workflow_run_id: string | null;
  parent_run_id: string | null;
  model_id: string | null;
  status: Generated<string>;
  started_at: Timestamptz;
  ended_at: Date | null;
  tokens_in: Generated<string>;
  tokens_out: Generated<string>;
  cost_eur: Numeric;
  progress_pct: number | null;
  error: string | null;
  // E10.2 (FABLE_5_HOOK §27/§14): starting hook version + close-time gate summary.
  hook_version: string | null;
  hook_result: Jsonb | null;
}

export interface ToolCallsTable {
  id: Generated<string>;
  run_id: string | null;
  tool: string;
  params_digest: Jsonb | null;
  duration_ms: number | null;
  ok: boolean | null;
  error: string | null;
  created_at: Timestamptz;
}

export interface FileChangesTable {
  id: Generated<string>;
  run_id: string | null;
  path: string;
  op: string;
  diff_summary: string | null;
  commit_sha: string | null;
  created_at: Timestamptz;
  review_status: Generated<string>;
  reverted_by: string | null;
}

export interface DecisionLogTable {
  id: Generated<string>;
  run_id: string | null;
  decided_by: string;
  decision: string;
  rationale: string;
  data_used: string[] | null;
  alternatives: Jsonb | null;
  confidence: NumericNullable;
  risk: string | null;
  approval_id: string | null;
  outcome: string | null;
  created_at: Timestamptz;
}

// alerts (E8.4b — OBSERVABILITY §4 + registered adaptations: dedup_key,
// run_id/task_id/source_ref, escalation, mute). Lifecycle writes go through
// control_alerts_action; code INSERTs only (obs spill alert, Phase-7 jobs).
export interface AlertsTable {
  id: Generated<string>;
  at: Timestamptz;
  level: string;
  source: string;
  title: string;
  affected_area: string | null;
  probable_cause: string | null;
  suggested_action: string | null;
  responsible_employee: string | null;
  mitigation: string | null;
  acknowledged_at: Date | null;
  resolved_at: Date | null;
  ceo_action: string | null;
  dedup_key: string | null;
  run_id: string | null;
  task_id: string | null;
  source_ref: Jsonb | null;
  escalated_at: Date | null;
  escalated_from: string | null;
  muted_until: Date | null;
}

// hook family (E10.1 — FABLE_5_HOOK_SPEC §4; policies edited ONLY through
// fn_hook_set_policy, violations append-only).
export interface HookPoliciesTable {
  id: string;
  standard_no: number;
  gate: string;
  rule: JsonbRequired;
  severity: Generated<string>;
  enabled: Generated<boolean>;
  version: Generated<number>;
  title_en: string;
  title_tr: string;
}

export interface HookViolationsTable {
  id: Generated<string>;
  run_id: string | null;
  policy_id: string;
  gate: string;
  detail: string;
  action_taken: string;
  created_at: Timestamptz;
}

// 0023x work family (E9.1 — DATA_MODEL 4.4; steps_snapshot = WORKFLOW §10
// versioning: a run executes its frozen step set, never the live tables).
export interface WorkflowsTable {
  id: Generated<string>;
  slug: string;
  name: string;
  owner_employee_id: string | null;
  trigger: Jsonb;
  enabled: Generated<boolean>;
  budget_eur: NumericNullable;
  token_limit: number | null;
  timeout_s: number | null;
  risk: Generated<string>;
  logging_level: Generated<string>;
  output_standard: string | null;
  version: Generated<number>;
}

export interface WorkflowStepsTable {
  id: Generated<string>;
  workflow_id: string;
  seq: number;
  kind: string;
  config: Jsonb;
}

export interface WorkflowRunsTable {
  id: Generated<string>;
  workflow_id: string;
  status: Generated<string>;
  triggered_by: string;
  current_step: number | null;
  steps_snapshot: Jsonb;
  started_at: Timestamptz;
  ended_at: Date | null;
}

export interface VoiceIdentitiesTable {
  id: Generated<string>;
  agent_id: string;
  engine: string;
  profile_ref: string;
  locale: Generated<string>;
  status: Generated<string>;
  created_at: Timestamptz;
}

export interface VoiceCallsTable {
  id: Generated<string>;
  started_at: Timestamptz;
  ended_at: Date | null;
  status: Generated<string>;
  target_agent_id: string | null;
  transcript: Jsonb;
  timeline: Jsonb;
  stt_ms: number | null;
  answer_ms: number | null;
  tts_ms: number | null;
  degraded: Generated<boolean>;
  cost_eur: Generated<string>;
  topic: string | null;
  // U15 D13 (migration 20260725005000): wake-session conversation thread id
  session_id: string | null;
}

// U15 D12 (migration 20260725005000): the ONE persisted JARVIS mic switch —
// the daemon polls it; chat commands / panel toggle / spoken hard-off write
// it through control_voice_daemon_set_state.
export interface VoiceDaemonStateTable {
  id: Generated<number>;
  state: Generated<"listening" | "muted">;
  updated_by: Generated<string>;
  updated_at: Timestamptz;
  note: string | null;
}

// CEO Chat Board with Hamza (C1/C7/C10, migration 20260719004000)
export interface ChatMessagesTable {
  id: Generated<string>;
  role: "ceo" | "hamza";
  content: string;
  mode: Generated<"normal" | "plan">;
  status: Generated<"pending" | "answered" | "failed">;
  error: string | null;
  intent_id: string | null;
  // U15 D12 (migration 20260725005000): which lane produced the turn —
  // voice turns mirror onto the board tagged 'voice' (one conversation law)
  source: Generated<"chat" | "voice">;
  // W1.5 (migration 20260726004000): which conversation this turn belongs to.
  // Scopes both the board thread and Hamza's context window.
  session_id: string | null;
  created_at: Timestamptz;
}

/** One CEO chat conversation (W1.5). */
export interface ChatSessionsTable {
  id: Generated<string>;
  title: string | null;
  created_at: Generated<Timestamptz>;
  last_message_at: Generated<Timestamptz>;
}

export interface DB {
  workflows: WorkflowsTable;
  workflow_steps: WorkflowStepsTable;
  workflow_runs: WorkflowRunsTable;
  tasks: TasksTable;
  agent_runs: AgentRunsTable;
  tool_calls: ToolCallsTable;
  file_changes: FileChangesTable;
  decision_log: DecisionLogTable;
  alerts: AlertsTable;
  tool_pins: ToolPinsTable;
  task_events: TaskEventsTable;
  departments: DepartmentsTable;
  agents: AgentsTable;
  intents: IntentsTable;
  approvals: ApprovalsTable;
  approval_rules: ApprovalRulesTable;
  outbox: OutboxTable;
  media_jobs: MediaJobsTable;
  cost_ledger: CostLedgerTable;
  audit_log: AuditLogTable;
  budget_state: BudgetStateTable;
  memory_index: MemoryIndexTable;
  memory_embeddings: MemoryEmbeddingsTable;
  crm_clients: CrmClientsTable;
  crm_contacts: CrmContactsTable;
  crm_requests: CrmRequestsTable;
  crm_deals: CrmDealsTable;
  routing_rules: RoutingRulesTable;
  hook_policies: HookPoliciesTable;
  hook_violations: HookViolationsTable;
  voice_identities: VoiceIdentitiesTable;
  voice_calls: VoiceCallsTable;
  chat_messages: ChatMessagesTable;
  chat_sessions: ChatSessionsTable;
  voice_daemon_state: VoiceDaemonStateTable;
}
