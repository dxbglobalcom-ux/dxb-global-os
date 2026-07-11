-- 0024x (E4.2) — knowledge family: library_items (directive item 13
-- inventory: skills, plugins, tools, MCPs, personas, policies, SOPs, ...)
-- + library_grants (who may use what — CEO-configured).
-- Normative source: DATA_MODEL §4.5. owner_dept targets departments(id) —
-- the uuid identity added in 0020x (recorded adaptation there).
-- Writes arrive via control_library_* fns (E9) — schema only.
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.library_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN (
    'skill','plugin','tool','mcp','prompt_template','persona','policy',
    'governance_rule','workflow','sop','framework','code_component',
    'design_system','research','report','project_doc','training',
    'memory_source','best_practice','lesson_learned')),
  name text NOT NULL,
  version text,
  owner_dept uuid REFERENCES public.departments(id),
  usage_notes text,
  dependencies text[],
  quality_score numeric,
  review_status text,
  last_used_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, name, version)
);

CREATE TABLE IF NOT EXISTS public.library_grants (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_id uuid NOT NULL REFERENCES public.library_items(id) ON DELETE CASCADE,
  grantee_kind text NOT NULL CHECK (grantee_kind IN ('department','employee','role_level')),
  grantee_id text NOT NULL,
  granted_by text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (item_id, grantee_kind, grantee_id)
);

CREATE INDEX IF NOT EXISTS idx_library_items_kind ON public.library_items (kind);
CREATE INDEX IF NOT EXISTS idx_library_grants_grantee ON public.library_grants (grantee_kind, grantee_id);

REVOKE TRUNCATE ON public.library_items, public.library_grants
  FROM PUBLIC, anon, authenticated, service_role;

-- RLS + read surface (DATA_MODEL §11: agents read their own grants via the
-- gateway query — that path is service-side; the CEO sees everything).
ALTER TABLE public.library_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_grants ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.library_items, public.library_grants TO authenticated;

DROP POLICY IF EXISTS library_items_ceo_read ON public.library_items;
CREATE POLICY library_items_ceo_read ON public.library_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS library_grants_ceo_read ON public.library_grants;
CREATE POLICY library_grants_ceo_read ON public.library_grants FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.library_items is
  '0024x knowledge family: holding-wide inventory (directive item 13); tool_pins bridges to this family for version pinning.';
COMMENT ON TABLE public.library_grants is
  '0024x knowledge family: who may use which item (department/employee/role_level) — CEO-configured, gateway-enforced.';

-- ROLLBACK:
--   DROP TABLE IF EXISTS public.library_grants;
--   DROP TABLE IF EXISTS public.library_items;
