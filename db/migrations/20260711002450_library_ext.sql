-- 0024x-b (E4.2) — library extensions.
-- Normative source: HOLDING_LIBRARY_SPEC §4 (recorded additions): item owner
-- (owner_employee_id), usage history (library_usage_log, append-only),
-- change history (library_change_log, append-only).
-- Idempotent: safe to re-run.

ALTER TABLE public.library_items
  ADD COLUMN IF NOT EXISTS owner_employee_id uuid REFERENCES public.agents(id);

CREATE TABLE IF NOT EXISTS public.library_usage_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.library_items(id) ON DELETE CASCADE,
  used_by uuid REFERENCES public.agents(id),
  run_id uuid REFERENCES public.agent_runs(id),
  used_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.library_change_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.library_items(id) ON DELETE CASCADE,
  changed_by text NOT NULL,
  change jsonb NOT NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_library_usage_log_item ON public.library_usage_log (item_id, used_at DESC);
CREATE INDEX IF NOT EXISTS idx_library_change_log_item ON public.library_change_log (item_id, changed_at DESC);

-- Append-only per DATA_MODEL §12 / HOLDING_LIBRARY §4.
REVOKE UPDATE, DELETE, TRUNCATE ON public.library_usage_log, public.library_change_log
  FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE public.library_usage_log  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_change_log ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.library_usage_log, public.library_change_log TO authenticated;

DROP POLICY IF EXISTS library_usage_log_ceo_read ON public.library_usage_log;
CREATE POLICY library_usage_log_ceo_read ON public.library_usage_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS library_change_log_ceo_read ON public.library_change_log;
CREATE POLICY library_change_log_ceo_read ON public.library_change_log FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.library_usage_log is
  '0024x-b: append-only usage history (who used which item in which run).';
COMMENT ON TABLE public.library_change_log is
  '0024x-b: append-only change history ({field, old, new} list per change).';

-- ROLLBACK:
--   DROP TABLE IF EXISTS public.library_change_log;
--   DROP TABLE IF EXISTS public.library_usage_log;
--   ALTER TABLE public.library_items DROP COLUMN IF EXISTS owner_employee_id;
