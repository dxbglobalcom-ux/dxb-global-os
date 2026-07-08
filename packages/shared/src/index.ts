export const PACKAGE = "@dxb/shared" as const;

export { TaskEnvelope } from "./envelope.js";
export { getDb, closeDb } from "./db.js";
export {
  LITELLM_SCHEMA,
  LITELLM_SPEND_TABLE,
  LITELLM_KEYS_TABLE,
  DXB_KEY_ALIAS_PREFIX,
  LiteLLMError,
  litellmBaseUrl,
  departmentKeyEnvVar,
  llmCall,
  keyGenerate,
  keyUpdate,
  keyInfo,
  keyDelete,
  listDxbKeys,
} from "./litellm.js";
export type { LlmMessage, LlmCallArgs, LlmCallResult, KeyGenerateArgs } from "./litellm.js";
export type { DB } from "./db-types.js";
export type {
  TasksTable,
  RoutingRulesTable,
  TaskEventsTable,
  DepartmentsTable,
  AgentsTable,
  ApprovalsTable,
  OutboxTable,
  CostLedgerTable,
  AuditLogTable,
  BudgetStateTable,
  MemoryIndexTable,
  CrmClientsTable,
  CrmContactsTable,
  CrmRequestsTable,
  CrmDealsTable,
} from "./db-types.js";
