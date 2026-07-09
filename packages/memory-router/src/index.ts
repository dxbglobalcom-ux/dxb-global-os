import { PACKAGE } from "@dxb/shared";

export const OWNER = "memory-router" as const;
export { PACKAGE };

// The door (06-04). Raw store writers (writeEmbedding, writeNote,
// writeRelationNote, writeDoc) are NOT re-exported — physical writes are
// reachable only through commitMemory's registry (T-06-12). The read side
// (cosineSearch + the shared filter) stays public: it is 06-05 recall's contract.
export {
  CommitInput,
  RecallInput,
  KIND_STORE,
  commitMemory,
} from "./write-policy.js";
export type { CommitDeps, CommittedMemory, MemoryKind, MemoryStore } from "./write-policy.js";

export { cosineSearch, liveMemoryFilter } from "./adapters/pgvector.js";
export type { CosineSearchArgs, CosineSearchHit, MemoryFilterOpts } from "./adapters/pgvector.js";

// The read door (06-05): metadata-routed, trust-filtered recall + the
// spike-validated classifier. Trust semantics are LOCKED (⛔ FABLE-ONLY).
export { classifyQuery, recallMemory, ClassifyParseError } from "./classify-read.js";
export type { ClassifiedQuery, RecallDeps, RecallResult, RecalledMemory } from "./classify-read.js";

// 06-06 store surfaces: claude-mem pointer sync (LOCKED: sync only, the router
// never writes INTO claude-mem), graphify incremental ingest (06-08 schedules
// it), notebook read/typed-down error. All read-only or out-of-door ops.
export { compactExpired } from "./compaction.js";
export type { CompactExpiredResult } from "./compaction.js";
export { syncClaudeMem, readObservationByRef } from "./adapters/claude-mem.js";
export type { SyncClaudeMemOpts, SyncClaudeMemResult } from "./adapters/claude-mem.js";
export { updateGraphIncremental, readRelationByRef } from "./adapters/graphify.js";
export { NotebookDownError, readDoc, notebookBaseUrl } from "./adapters/notebook.js";
