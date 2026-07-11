-- 0021x (E4.1) — settings/control family: settings_registry (what is
-- configurable), settings_values (current values per scope),
-- settings_change_log (append-only history + undo chain), model_catalog
-- (LiteLLM alias registry with acyclic fallback chain), routing_rules
-- extension (model_id FK + role_slot).
-- Normative source: DATA_MODEL §4.2. Writes arrive via control_settings_*
-- SECURITY DEFINER fns at E6.1 — no direct write grants here.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.settings_registry (
  key text PRIMARY KEY,
  category text NOT NULL,
  value_schema jsonb NOT NULL,
  risk text NOT NULL DEFAULT 'low' CHECK (risk IN ('low','medium','high','critical')),
  requires_approval boolean NOT NULL DEFAULT false,
  cost_impact text,
  affected_areas text[],
  description_en text NOT NULL,
  description_tr text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings_values (
  key text NOT NULL REFERENCES public.settings_registry(key),
  scope text NOT NULL DEFAULT 'global',
  value jsonb NOT NULL,
  updated_by text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, scope)
);

CREATE TABLE IF NOT EXISTS public.settings_change_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  key text NOT NULL,
  scope text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by text NOT NULL,
  change_source text NOT NULL CHECK (change_source IN ('ui','api','system','undo')),
  undo_of bigint REFERENCES public.settings_change_log(id),
  changed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.model_catalog (
  id text PRIMARY KEY,
  provider text NOT NULL,
  context_window int,
  cost_in_per_mtok numeric,
  cost_out_per_mtok numeric,
  speed_score int,
  quality_score int,
  reliability numeric,
  fallback_of text REFERENCES public.model_catalog(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','degraded','retired'))
);

ALTER TABLE public.routing_rules
  ADD COLUMN IF NOT EXISTS model_id text REFERENCES public.model_catalog(id),
  ADD COLUMN IF NOT EXISTS role_slot text;

-- Fallback chain is cycle-protected (DATA_MODEL §17: no self-reference, no loop).
CREATE OR REPLACE FUNCTION public.enforce_model_fallback_acyclic()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  cur text;
  depth int := 0;
BEGIN
  IF NEW.fallback_of IS NULL THEN
    RETURN NEW;
  END IF;
  IF NEW.fallback_of = NEW.id THEN
    RAISE EXCEPTION 'fallback cycle denied: model % cannot fall back to itself', NEW.id;
  END IF;
  cur := NEW.fallback_of;
  WHILE cur IS NOT NULL LOOP
    depth := depth + 1;
    IF cur = NEW.id OR depth > 32 THEN
      RAISE EXCEPTION 'fallback cycle denied: chain from % loops back or exceeds depth 32', NEW.id;
    END IF;
    SELECT fallback_of INTO cur FROM public.model_catalog WHERE id = cur;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_model_catalog_fallback_acyclic ON public.model_catalog;
CREATE TRIGGER trg_model_catalog_fallback_acyclic
  BEFORE INSERT OR UPDATE OF fallback_of ON public.model_catalog
  FOR EACH ROW EXECUTE FUNCTION public.enforce_model_fallback_acyclic();

-- Append-only (DATA_MODEL §12): change log takes no UPDATE/DELETE from any
-- API-reachable role; TRUNCATE revoked per 0008 precedent.
REVOKE UPDATE, DELETE, TRUNCATE ON public.settings_change_log
  FROM PUBLIC, anon, authenticated, service_role;

-- RLS + CEO read surface.
ALTER TABLE public.settings_registry   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_values     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_catalog       ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.settings_registry, public.settings_values,
  public.settings_change_log, public.model_catalog TO authenticated;

DROP POLICY IF EXISTS settings_registry_ceo_read ON public.settings_registry;
CREATE POLICY settings_registry_ceo_read ON public.settings_registry FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS settings_values_ceo_read ON public.settings_values;
CREATE POLICY settings_values_ceo_read ON public.settings_values FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS settings_change_log_ceo_read ON public.settings_change_log;
CREATE POLICY settings_change_log_ceo_read ON public.settings_change_log FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS model_catalog_ceo_read ON public.model_catalog;
CREATE POLICY model_catalog_ceo_read ON public.model_catalog FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.settings_registry is
  '0021x control family: catalog of what is configurable (SETTINGS_AND_CONTROL §18 categories); value_schema is JSON Schema validated in control fns.';
COMMENT ON TABLE public.settings_change_log is
  '0021x control family: append-only settings history; undo_of chains one-click undo (change_source=undo).';
COMMENT ON TABLE public.model_catalog is
  '0021x control family: LiteLLM alias registry; fallback_of is trigger-protected against cycles.';

-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_model_catalog_fallback_acyclic ON public.model_catalog;
--   DROP FUNCTION IF EXISTS public.enforce_model_fallback_acyclic();
--   ALTER TABLE public.routing_rules DROP COLUMN IF EXISTS model_id, DROP COLUMN IF EXISTS role_slot;
--   DROP TABLE IF EXISTS public.model_catalog;
--   DROP TABLE IF EXISTS public.settings_change_log;
--   DROP TABLE IF EXISTS public.settings_values;
--   DROP TABLE IF EXISTS public.settings_registry;
