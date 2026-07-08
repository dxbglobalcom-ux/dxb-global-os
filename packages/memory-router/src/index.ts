import { PACKAGE } from "@dxb/shared";

export const OWNER = "memory-router" as const;
export { PACKAGE };

export {
  cosineSearch,
  liveMemoryFilter,
  vectorLiteral,
  writeEmbedding,
} from "./adapters/pgvector.js";
export type {
  CosineSearchArgs,
  CosineSearchHit,
  MemoryFilterOpts,
  WriteEmbeddingArgs,
} from "./adapters/pgvector.js";
