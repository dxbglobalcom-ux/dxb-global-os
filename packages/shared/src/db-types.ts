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
  created_at: Timestamptz;
  updated_at: Timestamptz;
}

export interface ApprovalsTable {
  id: Generated<string>;
  task_id: string;
  action_type: string;
  payload: JsonbRequired;
  risk_class: Generated<string>;
  status: Generated<string>;
  decided_by: string | null;
  decided_at: Date | null;
  decision_note: string | null;
  created_at: Timestamptz;
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

export interface DB {
  tasks: TasksTable;
  tool_pins: ToolPinsTable;
  task_events: TaskEventsTable;
  departments: DepartmentsTable;
  agents: AgentsTable;
  approvals: ApprovalsTable;
  outbox: OutboxTable;
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
}
