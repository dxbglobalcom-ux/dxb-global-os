-- memory_embeddings: semantic store behind memory_index (pgvector).
-- SQL core below is LOCKED (master-plan PHASE-06 §3 "0009_memory_embeddings.sql", byte-faithful).
-- ADAPT (recorded, 06-03): logical slot 0009 was consumed by 20260708000009_routing_and_deps.sql;
-- repo uses Supabase CLI timestamp naming — filename advances to slot 10, SQL content unchanged.
-- RLS: enabled with NO policies (anon/authenticated default-deny; service_role/backend only),
-- same posture as parent memory_index.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE memory_embeddings (
  index_id  uuid PRIMARY KEY REFERENCES memory_index(id),
  body      text NOT NULL,
  embedding vector(1536)  -- dimension pinned by study-cards/litellm.md Embeddings section (06-01)
);
CREATE INDEX ON memory_embeddings USING hnsw (embedding vector_cosine_ops);
ALTER TABLE memory_embeddings ENABLE ROW LEVEL SECURITY;
