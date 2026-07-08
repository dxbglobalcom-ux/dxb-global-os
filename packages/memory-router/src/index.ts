import { PACKAGE } from "@dxb/shared";

export const OWNER = "memory-router" as const;
export { PACKAGE };

// The door (06-04). Raw store writers (writeEmbedding, writeNote) are NOT
// re-exported — physical writes are reachable only through commitMemory's
// registry (T-06-12). The read side (cosineSearch + the shared filter) stays
// public: it is 06-05 recall's contract.
export {
  CommitInput,
  RecallInput,
  KIND_STORE,
  StoreNotWiredError,
  commitMemory,
} from "./write-policy.js";
export type { CommitDeps, CommittedMemory, MemoryKind, MemoryStore } from "./write-policy.js";

export { cosineSearch, liveMemoryFilter } from "./adapters/pgvector.js";
export type { CosineSearchArgs, CosineSearchHit, MemoryFilterOpts } from "./adapters/pgvector.js";
