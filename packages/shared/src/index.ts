export const PACKAGE = "@dxb/shared" as const;

export { TaskEnvelope } from "./envelope.js";
export { getDb, closeDb, createListenClient } from "./db.js";
export type { ListenClient } from "./db.js";
export {
  DXB_CHANNELS,
  EntityKind,
  EventType,
  EventEnvelope,
  OpsLiveBatchPayload,
  OpsLiveMessage,
  OPS_LIVE_TYPES,
} from "./contracts/events.js";
export type { DxbChannel, OpsLiveType } from "./contracts/events.js";
export {
  STEP_KINDS,
  STEP_CONFIG_SCHEMAS,
  AgentStepConfig,
  ApprovalStepConfig,
  ReviewStepConfig,
  RetryStepConfig,
  FallbackStepConfig,
  WorkflowStep,
  StepsSnapshot,
  WORKFLOW_RUN_STATUSES,
  parseStepConfig,
} from "./contracts/workflow-steps.js";
export type { StepKind, WorkflowRunStatus } from "./contracts/workflow-steps.js";
export {
  LITELLM_SCHEMA,
  LITELLM_SPEND_TABLE,
  LITELLM_KEYS_TABLE,
  DXB_KEY_ALIAS_PREFIX,
  LiteLLMError,
  litellmBaseUrl,
  departmentKeyEnvVar,
  llmCall,
  llmEmbed,
  keyGenerate,
  keyUpdate,
  keyInfo,
  keyDelete,
  listDxbKeys,
} from "./litellm.js";
export type {
  LlmMessage,
  LlmCallArgs,
  LlmCallResult,
  LlmEmbedArgs,
  LlmEmbedResult,
  KeyGenerateArgs,
} from "./litellm.js";
export type { DB } from "./db-types.js";
export type {
  TasksTable,
  MediaJobsTable,
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
  MemoryEmbeddingsTable,
  CrmClientsTable,
  CrmContactsTable,
  CrmRequestsTable,
  CrmDealsTable,
} from "./db-types.js";
export { probeMedia, extractFrames, resolveMediaBinary } from "./media-probe.js";
export type { MediaProbeSummary } from "./media-probe.js";
