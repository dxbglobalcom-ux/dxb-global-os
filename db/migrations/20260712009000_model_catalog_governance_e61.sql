-- 0021h (E6.1) — model catalog governance delta (MODEL_ROUTING_SPEC §4,
-- "E6.1 ALTER delta", spec-aligned 2026-07-12).
--
-- Adds the governance columns §4b/§4c functions depend on:
--   model_catalog: display_name · banned (R2 migration-only ban mechanism —
--     no true row today; Sonnet free per CEO decision 2026-07-12) ·
--     mechanical_only (haiku family: no verdicts, output is raw input) ·
--     status CHECK extended with 'testing' (§4c onboarding mandatory step)
--     and 'disabled' (CEO temporary off; 'retired' = decommissioned, never
--     deleted).
--   routing_rules: department_id (null = all departments) · risk_max
--     (highest risk class this rule accepts — same enum as
--     settings_registry.risk) · min_context · cost_cap_per_task ·
--     UNIQUE(role_slot, priority, department_id) NULLS NOT DISTINCT for
--     slot-resolution determinism (partial: legacy task_class rows keep
--     role_slot NULL and stay outside the constraint).
--
-- Bootstrap catalog rows (REGISTERED ADAPTATION, not silent): the roadmap
-- puts the full model_catalog seed at E7.1, but the E6.1 DoD runs the
-- API_CONTRACTS §24 contract command verbatim, which sets
-- orchestrator.primary_model to 'fable-5' — a model_ref that must validate
-- against the catalog. Four bootstrap rows (ids only, per §4 defaults
-- table) ship here; E7.1 completes metadata + slot assignments.
--
-- Idempotent: safe to re-run.

ALTER TABLE public.model_catalog
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS banned boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mechanical_only boolean NOT NULL DEFAULT false;

-- status CHECK: ('active','degraded','retired') → +'testing' +'disabled'.
-- Constraint is dropped and re-created under its original name so \d shows
-- one authoritative definition; DO-block keeps the re-run idempotent.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.model_catalog'::regclass
      AND conname = 'model_catalog_status_check'
      AND pg_get_constraintdef(oid) NOT LIKE '%testing%'
  ) THEN
    ALTER TABLE public.model_catalog DROP CONSTRAINT model_catalog_status_check;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.model_catalog'::regclass
      AND conname = 'model_catalog_status_check'
  ) THEN
    ALTER TABLE public.model_catalog ADD CONSTRAINT model_catalog_status_check
      CHECK (status IN ('active','testing','degraded','disabled','retired'));
  END IF;
END $$;

ALTER TABLE public.routing_rules
  ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id),
  ADD COLUMN IF NOT EXISTS risk_max text
    CHECK (risk_max IN ('low','medium','high','critical')),
  ADD COLUMN IF NOT EXISTS min_context int,
  ADD COLUMN IF NOT EXISTS cost_cap_per_task numeric;

-- Slot-resolution determinism: one rule per (role_slot, priority,
-- department_id), department NULL treated as a value (PG15 NULLS NOT
-- DISTINCT) so two "all departments" rules cannot collide on a priority.
CREATE UNIQUE INDEX IF NOT EXISTS routing_rules_slot_priority_dept_key
  ON public.routing_rules (role_slot, priority, department_id)
  NULLS NOT DISTINCT
  WHERE role_slot IS NOT NULL;

-- E6.1 bootstrap catalog rows (see header). banned/mechanical_only are
-- migration-only flags (MODEL_ROUTING_SPEC §13): no runtime writer exists.
INSERT INTO public.model_catalog (id, provider, display_name, status, mechanical_only)
VALUES
  ('fable-5',         'anthropic', 'Claude Fable 5',   'active', false),
  ('claude-opus-4-8', 'anthropic', 'Claude Opus 4.8',  'active', false),
  ('claude-sonnet-5', 'anthropic', 'Claude Sonnet 5',  'active', false),
  ('claude-haiku-4-5','anthropic', 'Claude Haiku 4.5', 'active', true)
ON CONFLICT (id) DO NOTHING;

COMMENT ON COLUMN public.model_catalog.banned is
  '0021h: migration-only ban mechanism (MODEL_ROUTING_SPEC R2/§13) — no runtime writer; empty true-set today (Sonnet free, CEO 2026-07-12).';
COMMENT ON COLUMN public.model_catalog.mechanical_only is
  '0021h: haiku-family restriction — assignable only to mechanical task-class roles; can never produce verdicts/approvals.';

-- ROLLBACK:
--   DROP INDEX IF EXISTS routing_rules_slot_priority_dept_key;
--   ALTER TABLE public.routing_rules
--     DROP COLUMN IF EXISTS cost_cap_per_task, DROP COLUMN IF EXISTS min_context,
--     DROP COLUMN IF EXISTS risk_max, DROP COLUMN IF EXISTS department_id;
--   DELETE FROM public.model_catalog WHERE id IN ('fable-5','claude-opus-4-8','claude-sonnet-5','claude-haiku-4-5');
--   ALTER TABLE public.model_catalog DROP CONSTRAINT model_catalog_status_check;
--   ALTER TABLE public.model_catalog ADD CONSTRAINT model_catalog_status_check
--     CHECK (status IN ('active','degraded','retired'));
--   ALTER TABLE public.model_catalog
--     DROP COLUMN IF EXISTS mechanical_only, DROP COLUMN IF EXISTS banned,
--     DROP COLUMN IF EXISTS display_name;
