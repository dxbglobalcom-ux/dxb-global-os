-- B51 step 3 · P6 — HAMZA IS THE GENERAL MANAGER; the seats that hand out work and the critical decisions run on
-- Fable 5.1. Plan approved 2026-10-09 (b51-plan-approved-2026-10-09): "Seviyesi: Genel Müdür. Sizin niyetinizi
-- alır, işi bölümlere dağıtır, sonucu kontrol eder ve size raporlar. … İş dağıtan koltuklar (orkestrasyon ve işi
-- bölme) için önerimiz Fable 5.1 … Konuşma koltukları Opus 5.5 olur. Kritik karar koltukları Fable 5.1'de, xhigh
-- seviyesinde çalışır. Sesli cevap … şimdilik low'da kalır." His 2026-07 master directive names the role:
-- "Hamza is the persistent general manager and central operating intelligence of the holding".
--
-- Measured before this file (company, read-only, 2026-10-10): agents-orchestrator is role 'worker', role_level
-- 'orchestrator', titled 'Holding Orchestrator' / 'Holding Orkestratörü'; agents.role allows head|specialist|worker
-- only. orchestration and decompose (high), strategy / architecture / final-approval / slot.critical_decision
-- (xhigh) are department-less rows on claude-opus-5-5. The talking seats are already on Opus 5.5 (20261010070000)
-- and voice.answer stays low — untouched here; chat.strategy keeps the max of 20260726003000 (a talking seat).
-- The brain-follows-routing trigger moves only the studio's media.creative seats, so no employee brain moves with
-- these rows; a run takes its class row's model (P3). The critical-decision seat's registered default
-- (orchestrator.critical_decision_model) follows its row; no settings value overrides it on the company.
-- Every engine the chain builds holds Hamza before this file runs (20260711006900 inserts agents-orchestrator,
-- role worker), so this file writes his role everywhere. On the construction bench the seed then invents every
-- title (db/seed/build-seed.ts, tests/b36/seed-is-fiction) and its persona importer leaves an existing role
-- alone (ON CONFLICT DO NOTHING): a fresh bench holds role general_manager under an invented title. Titles of the Turkish-era dossiers are written by
-- migration (20260713010000) — the sync carries a title only from an English "Title" field.
-- Written on his word, not in his name: audit rows actor migration-b51, actor_type system.

ALTER TABLE public.agents DROP CONSTRAINT IF EXISTS agents_role_check;
ALTER TABLE public.agents ADD CONSTRAINT agents_role_check
  CHECK (role IN ('head', 'specialist', 'worker', 'general_manager'));

DO $$
DECLARE
  v_authority constant text := 'ceo-approvals:b51-plan-approved-2026-10-09';
  v_before jsonb;
  v_rows jsonb;
BEGIN
  -- 1. his row
  SELECT jsonb_build_object('role', role, 'title', title, 'title_tr', title_tr) INTO v_before
    FROM public.agents WHERE slug = 'agents-orchestrator';
  IF v_before IS NULL THEN
    RAISE EXCEPTION 'B51 P6: agents-orchestrator is not on this engine';
  END IF;
  IF v_before->>'role' IS DISTINCT FROM 'general_manager' THEN
    UPDATE public.agents
       SET role = 'general_manager', title = 'General Manager', title_tr = 'Genel Müdür', updated_at = now()
     WHERE slug = 'agents-orchestrator';
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b51', 'system', 'agent_role_change', jsonb_build_object(
      'reason', 'B51 P6: Hamza is the holding''s general manager',
      'authority', v_authority, 'slug', 'agents-orchestrator',
      'before', v_before,
      'after', jsonb_build_object('role', 'general_manager', 'title', 'General Manager', 'title_tr', 'Genel Müdür')));
  END IF;

  -- 2. the seats that hand out work and the critical decisions → Fable 5.1; efforts kept
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'task_class', task_class, 'old', model, 'old_id', model_id,
                                               'new', 'fable-5.1', 'effort', effort) ORDER BY task_class), '[]'::jsonb)
    INTO v_rows
    FROM public.routing_rules
   WHERE department_id IS NULL
     AND task_class IN ('orchestration', 'decompose', 'strategy', 'architecture', 'final-approval', 'slot.critical_decision')
     AND (model IS DISTINCT FROM 'fable-5.1' OR model_id IS DISTINCT FROM 'fable-5.1');

  UPDATE public.routing_rules r SET model = 'fable-5.1', model_id = 'fable-5.1'
    FROM jsonb_array_elements(v_rows) e
   WHERE r.id = (e->>'id')::uuid;

  IF jsonb_array_length(v_rows) > 0 THEN
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b51', 'system', 'routing_change', jsonb_build_object(
      'reason', 'B51 P6: orchestration and decompose on Fable 5.1; critical decisions on Fable 5.1 at xhigh',
      'authority', v_authority, 'rows', v_rows));
  END IF;

  -- 3. the critical-decision seat's registered default follows its row (E7.1: every role slot resolves to its
  --    registry default — the setting the CEO reads for that seat says what the seat runs)
  SELECT value_schema->'default' INTO v_before
    FROM public.settings_registry WHERE key = 'orchestrator.critical_decision_model';
  IF v_before IS DISTINCT FROM to_jsonb('fable-5.1'::text) THEN
    UPDATE public.settings_registry
       SET value_schema = jsonb_set(value_schema, '{default}', to_jsonb('fable-5.1'::text))
     WHERE key = 'orchestrator.critical_decision_model';
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b51', 'system', 'settings_registry_change', jsonb_build_object(
      'reason', 'B51 P6: the critical-decision seat''s default follows its routing row to Fable 5.1',
      'authority', v_authority, 'key', 'orchestrator.critical_decision_model',
      'before', jsonb_build_object('default', v_before),
      'after', jsonb_build_object('default', 'fable-5.1')));
  END IF;
  IF EXISTS (SELECT 1 FROM public.settings_values
              WHERE key = 'orchestrator.critical_decision_model' AND value IS DISTINCT FROM to_jsonb('fable-5.1'::text)) THEN
    RAISE EXCEPTION 'B51 P6: orchestrator.critical_decision_model carries a value of its own — decide it, do not overwrite it';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.routing_rules
              WHERE department_id IS NULL AND enabled
                AND task_class IN ('orchestration', 'decompose', 'strategy', 'architecture', 'final-approval', 'slot.critical_decision')
                AND (model <> 'fable-5.1' OR model_id IS DISTINCT FROM 'fable-5.1')) THEN
    RAISE EXCEPTION 'B51 P6: a dispatch or critical-decision row is not on fable-5.1';
  END IF;
  IF EXISTS (SELECT 1 FROM public.routing_rules
              WHERE department_id IS NULL AND enabled
                AND task_class IN ('strategy', 'architecture', 'final-approval', 'slot.critical_decision')
                AND effort <> 'xhigh') THEN
    RAISE EXCEPTION 'B51 P6: a critical-decision row is not at xhigh';
  END IF;
END $$;
