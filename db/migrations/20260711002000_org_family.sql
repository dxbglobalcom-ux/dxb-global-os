-- 0020x (E4.1) — org family: companies, org hierarchy on departments,
-- employee evolution on agents, versioned personas, employee_records.
-- Normative source: DATA_MODEL §4.1 (column names + constraints binding).
-- Rule (arch §11): NO breaking change to the existing 18 tables — extension
-- is nullable ADD COLUMN or new table + FK only. `agents` is NOT renamed to
-- employees (⛔ DATA_MODEL §26: alias only, strongest-model + CEO decision).
-- Activation gate (CEO 2026-07-07): employment_status='active' requires a
-- persona with quality_gate='passed' and a v2 author stamp — trigger below.
-- Idempotent: safe to re-run (IF NOT EXISTS / OR REPLACE / drop-then-create).

CREATE TABLE IF NOT EXISTS public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  mission text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','dormant','archived')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RECORDED ADAPTATION (E4.1, visible — not a silent deviation): the live
-- departments table is keyed by slug (text); the DATA_MODEL §4.1 draft assumed
-- a uuid id. The family needs a uuid identity anyway (parent_id here,
-- library_items.owner_dept in 0024x), so a non-breaking UNIQUE uuid id column
-- is added and FKs target it. slug stays the primary key — no breaking change.
ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS id uuid NOT NULL DEFAULT gen_random_uuid();
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'departments_id_key') THEN
    ALTER TABLE public.departments ADD CONSTRAINT departments_id_key UNIQUE (id);
  END IF;
END $$;

ALTER TABLE public.departments
  ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS parent_id  uuid REFERENCES public.departments(id),
  ADD COLUMN IF NOT EXISTS director_id uuid REFERENCES public.agents(id);  -- assignment via HR fn (E5/E6)

ALTER TABLE public.agents
  ADD COLUMN IF NOT EXISTS role_level text
    CHECK (role_level IN ('orchestrator','director','senior_specialist',
                          'specialist','ops_agent','sub_agent')),
  ADD COLUMN IF NOT EXISTS manager_id uuid REFERENCES public.agents(id),
  ADD COLUMN IF NOT EXISTS employment_status text NOT NULL DEFAULT 'dormant'
    CHECK (employment_status IN ('draft','probation','active',
                                 'suspended','archived','dormant')),
  ADD COLUMN IF NOT EXISTS persona_id uuid,  -- FK added after personas exists (circular pair)
  ADD COLUMN IF NOT EXISTS hook_version text;

CREATE TABLE IF NOT EXISTS public.personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.agents(id),
  version int NOT NULL,
  author text NOT NULL CHECK (author IN ('fable-5','hr-factory')),
  body_md text NOT NULL,
  quality_gate text NOT NULL DEFAULT 'pending'
    CHECK (quality_gate IN ('pending','passed','failed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (employee_id, version)
);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'agents_persona_id_fkey') THEN
    ALTER TABLE public.agents
      ADD CONSTRAINT agents_persona_id_fkey FOREIGN KEY (persona_id) REFERENCES public.personas(id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.employee_records (
  employee_id uuid PRIMARY KEY REFERENCES public.agents(id),
  responsibilities text[],
  authority_limits text[],
  decision_scope text,
  expertise text[],
  methodology text,
  reporting_standard text,
  quality_standard text,
  escalation_rules text,
  kpis jsonb NOT NULL DEFAULT '[]',
  performance_history jsonb NOT NULL DEFAULT '[]',
  error_history jsonb NOT NULL DEFAULT '[]',
  review_results jsonb NOT NULL DEFAULT '[]',
  training_needs text[],
  version_history jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Activation gate: active employment requires a passed, v2-stamped persona.
CREATE OR REPLACE FUNCTION public.enforce_persona_gate_on_activation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_gate text;
  v_author text;
BEGIN
  IF NEW.employment_status = 'active' THEN
    IF NEW.persona_id IS NULL THEN
      RAISE EXCEPTION 'activation denied: agent % has no persona (v2 persona with passed quality gate required)', NEW.id;
    END IF;
    SELECT quality_gate, author INTO v_gate, v_author
      FROM public.personas WHERE id = NEW.persona_id;
    IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('fable-5','hr-factory') THEN
      RAISE EXCEPTION 'activation denied: persona % has quality_gate=%, author=% (need passed + v2 author)',
        NEW.persona_id, v_gate, v_author;
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_agents_activation_gate ON public.agents;
CREATE TRIGGER trg_agents_activation_gate
  BEFORE INSERT OR UPDATE OF employment_status, persona_id ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.enforce_persona_gate_on_activation();

-- RLS (DATA_MODEL §11): enabled on every new table; CEO (authenticated) read;
-- writes only via SECURITY DEFINER fns (arrive with E5/E6 control seam).
ALTER TABLE public.companies        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personas         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_records ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.companies, public.personas, public.employee_records TO authenticated;

DROP POLICY IF EXISTS companies_ceo_read ON public.companies;
CREATE POLICY companies_ceo_read ON public.companies FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS personas_ceo_read ON public.personas;
CREATE POLICY personas_ceo_read ON public.personas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS employee_records_ceo_read ON public.employee_records;
CREATE POLICY employee_records_ceo_read ON public.employee_records FOR SELECT TO authenticated USING (true);

COMMENT ON TABLE public.companies is
  '0020x org family: holding companies (dxb-global first; sub-OS companies later, e.g. Outleteuro).';
COMMENT ON TABLE public.personas is
  '0020x org family: versioned employee personas; quality_gate + author enforce the v2 activation rule (CEO 2026-07-07).';
COMMENT ON TABLE public.employee_records is
  '0020x org family: corporate record per employee (directive item 8 list).';

-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_agents_activation_gate ON public.agents;
--   DROP FUNCTION IF EXISTS public.enforce_persona_gate_on_activation();
--   ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_persona_id_fkey;
--   DROP TABLE IF EXISTS public.employee_records;
--   DROP TABLE IF EXISTS public.personas;
--   ALTER TABLE public.agents DROP COLUMN IF EXISTS role_level,
--     DROP COLUMN IF EXISTS manager_id, DROP COLUMN IF EXISTS employment_status,
--     DROP COLUMN IF EXISTS persona_id, DROP COLUMN IF EXISTS hook_version;
--   ALTER TABLE public.departments DROP COLUMN IF EXISTS company_id,
--     DROP COLUMN IF EXISTS parent_id, DROP COLUMN IF EXISTS director_id;
--   DROP TABLE IF EXISTS public.companies;
