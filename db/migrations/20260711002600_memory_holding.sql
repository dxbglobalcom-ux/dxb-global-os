-- 0026x (E4.3) — memory bridges to the holding schema.
-- Normative source: MEMORY_ARCHITECTURE §22 (recorded additions): 2 ADD
-- COLUMNs on memory_index — run_id (which agent run produced the memory,
-- bridges to 0022x) and scope ('holding' default = everyone reads;
-- 'dept:<id>' = department-internal, gateway-matched). Backfill: the NOT NULL
-- DEFAULT 'holding' stamps every existing row on ADD.
-- The 4-store composition (fact→pgvector · relation→graphify ·
-- artifact→obsidian · procedure→notebook) is LOCKED — untouched here.
-- Idempotent: safe to re-run.

ALTER TABLE public.memory_index
  ADD COLUMN IF NOT EXISTS run_id uuid REFERENCES public.agent_runs(id),
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'holding';

CREATE INDEX IF NOT EXISTS idx_memory_index_scope ON public.memory_index (scope);

COMMENT ON COLUMN public.memory_index.run_id is
  '0026x bridge: agent run that produced this memory (drill-down to agent_runs).';
COMMENT ON COLUMN public.memory_index.scope is
  '0026x scope: holding (default, all read) | dept:<id> (department-internal; gateway matches agent profile; out-of-profile reads return empty, not error).';

-- ROLLBACK:
--   ALTER TABLE public.memory_index DROP COLUMN IF EXISTS run_id, DROP COLUMN IF EXISTS scope;
