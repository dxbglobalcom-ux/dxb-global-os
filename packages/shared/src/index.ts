export const PACKAGE = "@dxb/shared" as const;

export { TaskEnvelope } from "./envelope.js";
export { getDb, closeDb } from "./db.js";
export type { DB } from "./db-types.js";
export type {
  TasksTable,
  TaskEventsTable,
  DepartmentsTable,
  AgentsTable,
  ApprovalsTable,
  OutboxTable,
  CostLedgerTable,
  AuditLogTable,
  MemoryIndexTable,
  CrmClientsTable,
  CrmContactsTable,
  CrmRequestsTable,
  CrmDealsTable,
} from "./db-types.js";
