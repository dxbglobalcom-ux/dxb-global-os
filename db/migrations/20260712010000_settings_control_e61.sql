-- 0021i (E6.1) — settings control seam: registry governance columns,
-- control_settings_set / control_settings_undo / resolve_setting fns, and
-- the §18 registry seed (SETTINGS_AND_CONTROL_SPEC §4-§8, API_CONTRACTS
-- settings contract, BEKLENTILER directive madde 6.1-6.4).
--
-- REGISTERED ADAPTATIONS (not silent):
--   A1. Live 0021x tables (E4.1) are the schema authority — spec §4's
--       draft columns map as: section→category · risk_class→risk ·
--       approval_required→requires_approval · description_i18n→
--       description_en/tr · value_type/enum_values/default_value→
--       value_schema jsonb ({"type","enum","minimum","maximum","default",
--       "allow_mechanical"}). No version column exists on settings_values;
--       optimistic concurrency is implemented as p_expected_current value
--       comparison (CONFLICT_STALE on mismatch) instead of an int version.
--   A2. Registry gains three governance columns here: locked (B7b
--       code-level constants — fn rejects unconditionally, CEO included),
--       scope_types (deterministic scope grammar per key), delegate
--       ('org'|'grants': the value's source of truth is the org table or
--       library_grants — double source FORBIDDEN, spec §8; fn rejects with
--       a pointer to the owning seam, wired at E6.3).
--   A3. Scope grammar (single text column, live shape): 'global' |
--       'department:<slug>' | 'employee:<uuid>' | 'workflow:<uuid>'.
--       resolve_setting walks employee → department → global →
--       value_schema.default.
--   A4. Madde 6.4 lists 17 workflow items; 4 of them (create/edit/copy/
--       disable) are workflow CRUD capabilities, not per-workflow settings
--       — they live in the workflow engine seam (E6.3/E10), so 13 keys
--       seed here.
--   A5. requires_approval=true keys convert the mutation into an approvals
--       row (APPROVAL_REQUIRED + approval_id, per API_CONTRACTS error
--       dictionary). Execute-on-approve wiring lands with the approval
--       engine step; until then the row is visible on the approvals
--       surface. The money-out gate key itself is locked (B7b) — approval
--       can never re-open it from settings.
--   A6. Live approvals table (early-phase shape) required task_id NOT NULL
--       and capped risk_class at 'high'. Settings-origin approvals carry
--       no task, and registry risk includes 'critical' — task_id goes
--       nullable and the CHECK gains 'critical' (both align with the
--       APPROVAL_ENGINE direction: approvals attach to any outward action,
--       not only tasks).
--
-- Idempotent: safe to re-run (seed is ON CONFLICT DO UPDATE).

-- ── approvals shape for non-task approvals (A6) ─────────────────────────

ALTER TABLE public.approvals ALTER COLUMN task_id DROP NOT NULL;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.approvals'::regclass
      AND conname = 'approvals_risk_class_check'
      AND pg_get_constraintdef(oid) NOT LIKE '%critical%'
  ) THEN
    ALTER TABLE public.approvals DROP CONSTRAINT approvals_risk_class_check;
    ALTER TABLE public.approvals ADD CONSTRAINT approvals_risk_class_check
      CHECK (risk_class IN ('low','medium','high','critical'));
  END IF;
END $$;

-- ── Registry governance columns (A2) ────────────────────────────────────

ALTER TABLE public.settings_registry
  ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS scope_types text[] NOT NULL DEFAULT '{global}',
  ADD COLUMN IF NOT EXISTS delegate text
    CHECK (delegate IN ('org','grants'));

-- HR keys (E5.4b seed) get their scope surface widened where the HR fns
-- already read per-employee overrides.
UPDATE public.settings_registry
   SET scope_types = '{global,employee}'
 WHERE key IN ('hr.employee_budget','hr.litellm_key_alias')
   AND scope_types = '{global}';

-- ── resolve_setting ──────────────────────────────────────────────────────
-- Deterministic chain: employee:<uuid> → department:<slug> → global →
-- registry default (value_schema->'default'). Kernel/orchestrator use this
-- on every read (30s cache invalidated by the 'settings' Broadcast).

CREATE OR REPLACE FUNCTION public.resolve_setting(p_key text, p_agent uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_val jsonb;
  v_dept text;
BEGIN
  IF p_agent IS NOT NULL THEN
    SELECT value INTO v_val FROM settings_values
     WHERE key = p_key AND scope = 'employee:' || p_agent::text;
    IF FOUND THEN RETURN v_val; END IF;

    SELECT department INTO v_dept FROM agents WHERE id = p_agent;
    IF v_dept IS NOT NULL THEN
      SELECT value INTO v_val FROM settings_values
       WHERE key = p_key AND scope = 'department:' || v_dept;
      IF FOUND THEN RETURN v_val; END IF;
    END IF;
  END IF;

  SELECT value INTO v_val FROM settings_values
   WHERE key = p_key AND scope = 'global';
  IF FOUND THEN RETURN v_val; END IF;

  RETURN (SELECT value_schema -> 'default' FROM settings_registry WHERE key = p_key);
END $$;

-- ── shared validation ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.fn_settings_validate_value(p_schema jsonb, p_value jsonb)
RETURNS text  -- NULL = valid, otherwise human-readable reason
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_type text := p_schema ->> 'type';
  v_num numeric;
  v_cat record;
BEGIN
  CASE v_type
    WHEN 'boolean' THEN
      IF jsonb_typeof(p_value) <> 'boolean' THEN RETURN 'expected boolean'; END IF;
    WHEN 'string' THEN
      IF jsonb_typeof(p_value) <> 'string' THEN RETURN 'expected string'; END IF;
    WHEN 'number', 'integer', 'duration' THEN
      IF jsonb_typeof(p_value) <> 'number' THEN RETURN 'expected number'; END IF;
      v_num := (p_value #>> '{}')::numeric;
      IF v_type = 'integer' AND v_num <> trunc(v_num) THEN RETURN 'expected integer'; END IF;
      IF v_type = 'duration' AND v_num < 0 THEN RETURN 'duration must be >= 0 seconds'; END IF;
      IF p_schema ? 'minimum' AND v_num < (p_schema ->> 'minimum')::numeric THEN
        RETURN 'below minimum ' || (p_schema ->> 'minimum');
      END IF;
      IF p_schema ? 'maximum' AND v_num > (p_schema ->> 'maximum')::numeric THEN
        RETURN 'above maximum ' || (p_schema ->> 'maximum');
      END IF;
    WHEN 'enum' THEN
      IF NOT (p_schema -> 'enum') @> jsonb_build_array(p_value) THEN
        RETURN 'not in enum ' || (p_schema ->> 'enum');
      END IF;
    WHEN 'json' THEN
      NULL;  -- any shape; structure is the consumer's contract
    WHEN 'model_ref' THEN
      IF jsonb_typeof(p_value) <> 'string' THEN RETURN 'expected model id string'; END IF;
      SELECT * INTO v_cat FROM model_catalog WHERE id = p_value #>> '{}';
      IF NOT FOUND THEN RETURN 'unknown model id (not in model_catalog)'; END IF;
      IF v_cat.banned THEN RETURN 'model is banned (migration-only flag)'; END IF;
      IF v_cat.status <> 'active' THEN
        RETURN 'model status is ' || v_cat.status || ' (only active models are assignable)';
      END IF;
      IF v_cat.mechanical_only AND COALESCE(p_schema ->> 'allow_mechanical', 'false') <> 'true' THEN
        RETURN 'mechanical_only model cannot hold this slot (no verdict/approval authority)';
      END IF;
    ELSE
      RETURN 'registry value_schema has unknown type ' || COALESCE(v_type, '(null)');
  END CASE;
  RETURN NULL;
END $$;

-- ── control_settings_set ─────────────────────────────────────────────────
-- Single write seam (SYSTEM_ARCHITECTURE R3): registry validation →
-- optimistic value check → values upsert + change_log + audit_log +
-- Broadcast, one transaction. Policy failures return {ok:false, error}
-- (API_CONTRACTS error dictionary) — the handler maps them to HTTP.

CREATE OR REPLACE FUNCTION public.control_settings_set(
  p_key text,
  p_scope text,
  p_value jsonb,
  p_idempotency_key text,
  p_expected_current jsonb DEFAULT NULL,
  p_source text DEFAULT 'api',
  p_rationale text DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text;
  v_reg record;
  v_digest text;
  v_prev record;
  v_old jsonb;
  v_reason text;
  v_scope_class text;
  v_change_id bigint;
  v_approval_id uuid;
  v_resp jsonb;
BEGIN
  -- Single-human OS (API_CONTRACTS §13): any authenticated session is the
  -- CEO; service_role/postgres = kernel ('system' writer, own key set).
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_source NOT IN ('ui', 'api', 'system') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'source must be ui|api|system');
  END IF;

  -- Spec §26 edge (system writer must never override the CEO): the
  -- 'system' actor may only touch its own runtime-flag key set — the CEO's
  -- policy values are out of its reach. HR runtime keys are included: the
  -- fn_hr_* family owns them operationally (E5.4b).
  IF v_actor = 'system' AND p_key NOT IN
      ('os.global_pause', 'os.maintenance_mode',
       'hr.probation_pass_score', 'hr.probation_max_days') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'system writer is whitelisted to runtime flags only');
  END IF;

  -- Idempotency (control_idempotency, E4): same key + same body → cached
  -- response verbatim, no second change_log row; same key + different body
  -- → IDEMPOTENCY_MISMATCH.
  v_digest := md5(p_key || '|' || p_scope || '|' || p_value::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  SELECT * INTO v_reg FROM settings_registry WHERE key = p_key;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown settings key (not in registry)');
  END IF;

  -- B7b: locked keys are code-level constants. Unconditional refusal (CEO
  -- included), and the attempt itself is audited.
  IF v_reg.locked THEN
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
            'settings.set.denied_locked',
            jsonb_build_object('key', p_key, 'scope', p_scope, 'value', p_value));
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'locked policy key (B7b) — fixed in code, cannot be changed from settings');
  END IF;

  -- Single source of truth (spec §8): delegated fields are read here but
  -- written only through their owning seam.
  IF v_reg.delegate IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'delegated to the ' || v_reg.delegate ||
                ' seam — source of truth lives there (double source forbidden)');
  END IF;

  v_scope_class := split_part(p_scope, ':', 1);
  IF NOT (v_scope_class = ANY (v_reg.scope_types)) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'scope ' || v_scope_class || ' not allowed for this key (allowed: '
                || array_to_string(v_reg.scope_types, ',') || ')');
  END IF;
  IF v_scope_class <> 'global' AND split_part(p_scope, ':', 2) = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'scoped write needs an id: ' || v_scope_class || ':<id>');
  END IF;

  v_reason := fn_settings_validate_value(v_reg.value_schema, p_value);
  IF v_reason IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', v_reason);
  END IF;

  -- A5: approval-required keys become an approvals row instead of a write.
  IF v_reg.requires_approval AND v_actor = 'ceo' THEN
    INSERT INTO approvals (action_type, payload, risk_class, status)
    VALUES ('settings.set',
            jsonb_build_object('key', p_key, 'scope', p_scope, 'value', p_value,
                               'rationale', p_rationale),
            v_reg.risk, 'pending')
    RETURNING id INTO v_approval_id;
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES ('ceo', 'ceo', 'settings.set.approval_required',
            jsonb_build_object('key', p_key, 'scope', p_scope, 'approval_id', v_approval_id));
    v_resp := jsonb_build_object('ok', false, 'error', 'APPROVAL_REQUIRED',
                                 'approval_id', v_approval_id);
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
    RETURN v_resp;
  END IF;

  SELECT value INTO v_old FROM settings_values WHERE key = p_key AND scope = p_scope;

  -- Optimistic concurrency (A1): caller states what it believes the
  -- current value is; a mismatch means another session moved it — no
  -- silent overwrite (spec §10).
  IF p_expected_current IS NOT NULL AND v_old IS DISTINCT FROM p_expected_current THEN
    RETURN jsonb_build_object('ok', false, 'error', 'CONFLICT_STALE',
      'current', COALESCE(v_old, 'null'::jsonb));
  END IF;

  -- Loud no-op (API_CONTRACTS §21: nothing may silently no-op): value
  -- already equal → explicit noop response, no change_log pollution.
  IF v_old IS NOT DISTINCT FROM p_value THEN
    v_resp := jsonb_build_object('ok', true, 'change_id', NULL, 'noop', true);
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
    RETURN v_resp;
  END IF;

  INSERT INTO settings_values (key, scope, value, updated_by)
  VALUES (p_key, p_scope, p_value, v_actor)
  ON CONFLICT (key, scope)
  DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now();

  INSERT INTO settings_change_log (key, scope, old_value, new_value, changed_by, change_source)
  VALUES (p_key, p_scope, v_old, p_value, v_actor, p_source)
  RETURNING id INTO v_change_id;

  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'settings.set',
          jsonb_build_object('key', p_key, 'scope', p_scope,
                             'old', v_old, 'new', p_value, 'rationale', p_rationale),
          jsonb_build_object('settings_change_log_id', v_change_id));

  PERFORM notify_broadcast('settings', 'settings.changed',
    jsonb_build_object('key', p_key, 'scope', p_scope, 'change_id', v_change_id));

  v_resp := jsonb_build_object('ok', true, 'change_id', v_change_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

-- ── control_settings_undo ────────────────────────────────────────────────
-- Undo is first-class (R4): applying old_value as a NEW change — history
-- is never rewritten, the revert itself is a logged change (undo_of chain,
-- change_source='undo'). First-set undo (old_value NULL) removes the
-- value row: resolution falls back down the scope chain / default.

CREATE OR REPLACE FUNCTION public.control_settings_undo(
  p_change_id bigint,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text;
  v_log record;
  v_digest text;
  v_prev record;
  v_current jsonb;
  v_change_id bigint;
  v_resp jsonb;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  v_digest := md5('undo|' || p_change_id::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  SELECT * INTO v_log FROM settings_change_log WHERE id = p_change_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown change_id');
  END IF;

  SELECT value INTO v_current FROM settings_values
   WHERE key = v_log.key AND scope = v_log.scope;

  IF v_current IS NOT DISTINCT FROM v_log.old_value THEN
    v_resp := jsonb_build_object('ok', true, 'change_id', NULL, 'noop', true);
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
    RETURN v_resp;
  END IF;

  IF v_log.old_value IS NULL THEN
    DELETE FROM settings_values WHERE key = v_log.key AND scope = v_log.scope;
  ELSE
    INSERT INTO settings_values (key, scope, value, updated_by)
    VALUES (v_log.key, v_log.scope, v_log.old_value, v_actor)
    ON CONFLICT (key, scope)
    DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = now();
  END IF;

  INSERT INTO settings_change_log (key, scope, old_value, new_value, changed_by, change_source, undo_of)
  VALUES (v_log.key, v_log.scope, v_current,
          COALESCE(v_log.old_value, 'null'::jsonb), v_actor, 'undo', p_change_id)
  RETURNING id INTO v_change_id;

  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'settings.undo',
          jsonb_build_object('key', v_log.key, 'scope', v_log.scope,
                             'undo_of', p_change_id, 'restored', v_log.old_value),
          jsonb_build_object('settings_change_log_id', v_change_id));

  PERFORM notify_broadcast('settings', 'settings.changed',
    jsonb_build_object('key', v_log.key, 'scope', v_log.scope,
                       'change_id', v_change_id, 'undo_of', p_change_id));

  v_resp := jsonb_build_object('ok', true, 'change_id', v_change_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

-- ── grants ───────────────────────────────────────────────────────────────
-- Security boundary is in the DB (API_CONTRACTS §13): handler checks only
-- that a session exists; the fns derive actor from auth.uid().

REVOKE ALL ON FUNCTION public.control_settings_set(text, text, jsonb, text, jsonb, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.control_settings_undo(bigint, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.resolve_setting(text, uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.fn_settings_validate_value(jsonb, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.control_settings_set(text, text, jsonb, text, jsonb, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.control_settings_undo(bigint, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.resolve_setting(text, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_settings_validate_value(jsonb, jsonb) TO service_role;

-- ── §18 registry seed ────────────────────────────────────────────────────
-- 83 keys: 6.1 model slots 13 (category 'models') + 6.1 orchestrator
-- policies 10 + global OS 4 + 6.2 departments 15 + 6.3 employees 28 +
-- 6.4 workflows 13 (A4). ON CONFLICT DO UPDATE keeps the seed re-runnable
-- and lets later migrations refine descriptions without churn.

INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  -- 6.1 model role slots (§18 Models) — value space = model_catalog
  ('orchestrator.primary_model',           'models', '{"type":"model_ref","default":"fable-5"}',          'critical', false, 'structural', '{orchestrator,routing,all_tasks}', 'Primary orchestrator model', 'Ana orkestratör modeli', false, '{global}', NULL),
  ('orchestrator.backup_model',            'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'high',     false, 'structural', '{orchestrator,routing}',           'Backup orchestrator model', 'Yedek orkestratör modeli', false, '{global}', NULL),
  ('orchestrator.planning_model',          'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'high',     false, 'per_task',   '{planning,routing}',               'Planning model slot', 'Planlama modeli', false, '{global,department}', NULL),
  ('orchestrator.execution_model',         'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'medium',   false, 'per_task',   '{execution,routing}',              'Execution model slot', 'Execution modeli', false, '{global,department}', NULL),
  ('orchestrator.review_model',            'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'high',     false, 'per_task',   '{review,quality,routing}',         'Review model slot', 'Review modeli', false, '{global,department}', NULL),
  ('orchestrator.critical_decision_model', 'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'critical', false, 'per_task',   '{decisions,routing}',              'Critical-decision model slot', 'Kritik karar modeli', false, '{global}', NULL),
  ('orchestrator.fast_task_model',         'models', '{"type":"model_ref","default":"claude-haiku-4-5","allow_mechanical":true}', 'low', false, 'per_task', '{routing,fast_tasks}', 'Fast-task model slot (mechanical-only models allowed; no verdict authority)', 'Hızlı görev modeli (mekanik modeller atanabilir; verdict yetkisi yok)', false, '{global,department}', NULL),
  ('orchestrator.low_cost_model',          'models', '{"type":"model_ref","default":"claude-haiku-4-5","allow_mechanical":true}', 'low', false, 'per_task', '{routing,cost}',       'Low-cost task model slot (mechanical-only models allowed)', 'Düşük maliyetli görev modeli (mekanik modeller atanabilir)', false, '{global,department}', NULL),
  ('orchestrator.research_model',          'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'medium',   false, 'per_task',   '{research,routing}',               'Research model slot', 'Araştırma modeli', false, '{global,department}', NULL),
  ('orchestrator.coding_model',            'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'high',     false, 'per_task',   '{engineering,routing}',            'Coding model slot', 'Kodlama modeli', false, '{global,department}', NULL),
  ('orchestrator.design_model',            'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'medium',   false, 'per_task',   '{design,routing}',                 'Design model slot', 'Tasarım modeli', false, '{global,department}', NULL),
  ('orchestrator.qa_model',                'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'high',     false, 'per_task',   '{quality,routing}',                'QA model slot', 'QA modeli', false, '{global,department}', NULL),
  ('orchestrator.hr_model',                'models', '{"type":"model_ref","default":"claude-opus-4-8"}',  'high',     false, 'per_task',   '{hr,routing}',                     'HR model slot', 'HR modeli', false, '{global}', NULL),

  -- 6.1 orchestrator policies (§18 Orchestrator)
  ('orchestrator.fallback_order',          'orchestrator', '{"type":"json","default":["fable-5","claude-opus-4-8"]}', 'high', false, 'structural', '{routing,resilience}', 'Model fallback order (array of model ids, walked on error/timeout/rate-limit)', 'Model fallback sırası (hata/timeout/rate-limit''te sırayla denenir)', false, '{global}', NULL),
  ('orchestrator.timeout_seconds',         'orchestrator', '{"type":"duration","default":300,"minimum":10,"maximum":3600}', 'medium', false, 'none', '{orchestrator,tasks}', 'Per-call model timeout in seconds', 'Model çağrısı zaman aşımı (saniye)', false, '{global,department}', NULL),
  ('orchestrator.max_tokens',              'orchestrator', '{"type":"integer","default":16384,"minimum":256}', 'medium', false, 'per_task', '{cost,tasks}', 'Maximum output tokens per model call', 'Çağrı başına maksimum token', false, '{global,department}', NULL),
  ('orchestrator.max_cost_per_task_eur',   'orchestrator', '{"type":"number","default":2.0,"minimum":0}', 'high', false, 'per_task', '{cost,budget}', 'Hard cost cap per task in EUR (COST_CONTROL enforces)', 'Görev başına sert maliyet tavanı (EUR — COST_CONTROL uygular)', false, '{global,department}', NULL),
  ('orchestrator.context_limit',           'orchestrator', '{"type":"integer","default":100000,"minimum":1000}', 'medium', false, 'per_task', '{orchestrator,memory}', 'Context window budget per task before compaction', 'Görev başına context tavanı (compaction öncesi)', false, '{global}', NULL),
  ('orchestrator.retry_policy',            'orchestrator', '{"type":"json","default":{"max_retries":2,"backoff_seconds":30}}', 'medium', false, 'per_task', '{resilience,cost}', 'Retry policy for failed model calls', 'Başarısız çağrılar için retry politikası', false, '{global,department}', NULL),
  ('orchestrator.confidence_threshold',    'orchestrator', '{"type":"number","default":0.75,"minimum":0,"maximum":1}', 'high', false, 'none', '{quality,escalation}', 'Below this self-reported confidence the task escalates instead of completing', 'Bu güven eşiğinin altında görev tamamlanmaz, escalate edilir', false, '{global,department}', NULL),
  ('orchestrator.escalation_policy',       'orchestrator', '{"type":"json","default":{"chain":["manager","director","ceo"],"on":["low_confidence","budget","risk"]}}', 'high', false, 'none', '{escalation,org}', 'Escalation chain and triggers', 'Escalation zinciri ve tetikleyicileri', false, '{global,department}', NULL),
  ('orchestrator.human_approval_threshold','orchestrator', '{"type":"enum","enum":["low","medium","high","critical"],"default":"high"}', 'critical', false, 'none', '{approvals,risk}', 'Risk class at/above which a task requires CEO approval', 'Bu risk sınıfı ve üzeri görevler CEO onayına düşer', false, '{global}', NULL),
  ('orchestrator.fable_review_required',   'orchestrator', '{"type":"boolean","default":true}', 'high', false, 'per_task', '{quality,review}', 'Whether the Fable-quality review gate is mandatory before task completion', 'Görev kapanışı öncesi Fable-kalite review kapısı zorunlu mu', false, '{global,department}', NULL),

  -- Global OS (§18 Global OS) — includes the B7b locked constant
  ('os.timezone',                          'global_os', '{"type":"string","default":"UTC"}', 'low', false, 'none', '{scheduling,reports}', 'OS-wide timezone for schedules and reports', 'OS geneli saat dilimi (zamanlama ve raporlar)', false, '{global}', NULL),
  ('os.global_pause',                      'global_os', '{"type":"boolean","default":false}', 'critical', false, 'structural', '{all_agents,all_workflows}', 'Global pause: no new task starts while true (kill-switch surface)', 'Global duraklatma: true iken yeni görev başlamaz (kill-switch yüzeyi)', false, '{global}', NULL),
  ('os.maintenance_mode',                  'global_os', '{"type":"boolean","default":false}', 'high', false, 'none', '{dashboard,agents}', 'Maintenance mode: agents drain, dashboard shows banner', 'Bakım modu: ajanlar boşalır, dashboard banner gösterir', false, '{global}', NULL),
  ('approvals.money_out_gate',             'global_os', '{"type":"boolean","default":true}', 'critical', true, 'none', '{approvals,payments,contracts}', 'Money-out approval gate — code-level constant (B7b): every outward payment/contract requires CEO approval; cannot be disabled from settings', 'Para-çıkışı onay kapısı — kod seviyesinde sabit (B7b): her dışa ödeme/sözleşme CEO onayı ister; settings''ten kapatılamaz', true, '{global}', NULL),

  -- 6.2 department settings (§18 Departments)
  ('department.director',                  'departments', '{"type":"string"}', 'high', false, 'none', '{org,department}', 'Department director (org table is the source of truth — change via org seam)', 'Departman müdürü (kaynak-gerçek org tablosu — org seam''den değişir)', false, '{department}', 'org'),
  ('department.director_model',            'departments', '{"type":"model_ref"}', 'high', false, 'per_task', '{org,routing}', 'Director agent brain (org table is the source of truth)', 'Müdür ajan beyni (kaynak-gerçek org tablosu)', false, '{department}', 'org'),
  ('department.director_persona',          'departments', '{"type":"string"}', 'high', false, 'none', '{org,personas}', 'Director persona binding (org/persona seam owns it)', 'Müdür persona bağı (org/persona seam sahibi)', false, '{department}', 'org'),
  ('department.director_authority',        'departments', '{"type":"json","default":{"approve_tasks":true,"assign_agents":true,"money_out":false}}', 'critical', false, 'none', '{org,approvals}', 'Director authority limits', 'Müdür yetki sınırları', false, '{department}', NULL),
  ('department.budget_eur',                'departments', '{"type":"number","minimum":0,"default":25}', 'high', false, 'per_day', '{cost,budget}', 'Department budget (EUR, monthly envelope — Cost Monitor enforces)', 'Departman bütçesi (EUR, aylık zarf — Cost Monitor uygular)', false, '{department}', NULL),
  ('department.token_limit',               'departments', '{"type":"integer","minimum":0,"default":5000000}', 'medium', false, 'per_day', '{cost}', 'Department token limit per month', 'Departman aylık token limiti', false, '{department}', NULL),
  ('department.approval_level',            'departments', '{"type":"enum","enum":["low","medium","high","critical"],"default":"high"}', 'high', false, 'none', '{approvals,risk}', 'Risk class at/above which department tasks need approval', 'Departman görevlerinin onaya düştüğü risk sınıfı', false, '{department}', NULL),
  ('department.workflow_rules',            'departments', '{"type":"json","default":{}}', 'medium', false, 'none', '{workflows}', 'Department-scoped workflow rules', 'Departman workflow kuralları', false, '{department}', NULL),
  ('department.goals',                     'departments', '{"type":"json","default":[]}', 'low', false, 'none', '{strategy,reports}', 'Department goals', 'Departman hedefleri', false, '{department}', NULL),
  ('department.kpis',                      'departments', '{"type":"json","default":[]}', 'low', false, 'none', '{strategy,reports}', 'Department KPIs', 'Departman KPI''ları', false, '{department}', NULL),
  ('department.skill_access',              'departments', '{"type":"json"}', 'high', false, 'none', '{grants,skills}', 'Skill access (library_grants is the source of truth)', 'Skill erişimleri (kaynak-gerçek library_grants)', false, '{department}', 'grants'),
  ('department.plugin_access',             'departments', '{"type":"json"}', 'high', false, 'none', '{grants,plugins}', 'Plugin access (library_grants is the source of truth)', 'Plugin erişimleri (kaynak-gerçek library_grants)', false, '{department}', 'grants'),
  ('department.knowledge_sources',         'departments', '{"type":"json","default":[]}', 'medium', false, 'none', '{memory,library}', 'Knowledge sources available to the department', 'Departmanın bilgi kaynakları', false, '{department}', NULL),
  ('department.reporting_schedule',        'departments', '{"type":"json","default":{"cadence":"weekly"}}', 'low', false, 'none', '{reports}', 'Reporting cadence and format', 'Raporlama düzeni', false, '{department}', NULL),
  ('department.escalation_chain',          'departments', '{"type":"json","default":["director","ceo"]}', 'high', false, 'none', '{escalation,org}', 'Department escalation chain', 'Departman escalation zinciri', false, '{department}', NULL),

  -- 6.3 employee settings (§18 Employees) — org/grants fields are
  -- delegated (single source of truth), the rest live in settings_values
  ('employee.name',                        'employees', '{"type":"string"}', 'low', false, 'none', '{org}', 'Display name (agents table owns it)', 'İsim (kaynak-gerçek agents tablosu)', false, '{employee}', 'org'),
  ('employee.title',                       'employees', '{"type":"string"}', 'low', false, 'none', '{org}', 'Title (agents table owns it)', 'Unvan (kaynak-gerçek agents tablosu)', false, '{employee}', 'org'),
  ('employee.department',                  'employees', '{"type":"string"}', 'high', false, 'none', '{org}', 'Department (agents table owns it — move via org seam)', 'Departman (kaynak-gerçek agents; taşıma org seam''den)', false, '{employee}', 'org'),
  ('employee.manager',                     'employees', '{"type":"string"}', 'medium', false, 'none', '{org}', 'Manager (agents table owns it)', 'Yönetici (kaynak-gerçek agents tablosu)', false, '{employee}', 'org'),
  ('employee.model',                       'employees', '{"type":"model_ref"}', 'high', false, 'per_task', '{org,routing}', 'Agent brain (agents.brain — change only via fn_update_agent_brain, §4b)', 'Ajan beyni (agents.brain — yalnız fn_update_agent_brain ile, §4b)', false, '{employee}', 'org'),
  ('employee.model_version',               'employees', '{"type":"string"}', 'medium', false, 'none', '{org,routing}', 'Model version pin (org/routing seam owns it)', 'Model versiyonu (org/routing seam sahibi)', false, '{employee}', 'org'),
  ('employee.persona',                     'employees', '{"type":"string"}', 'high', false, 'none', '{org,personas}', 'Persona binding (persona seam owns it)', 'Persona bağı (persona seam sahibi)', false, '{employee}', 'org'),
  ('employee.role_definition',             'employees', '{"type":"string"}', 'medium', false, 'none', '{org,personas}', 'Role definition (persona §1 owns it)', 'Rol tanımı (persona §1 sahibi)', false, '{employee}', 'org'),
  ('employee.task_scope',                  'employees', '{"type":"string"}', 'medium', false, 'none', '{org,personas}', 'Task scope (persona §3 owns it)', 'Görev kapsamı (persona §3 sahibi)', false, '{employee}', 'org'),
  ('employee.authority_level',             'employees', '{"type":"integer"}', 'high', false, 'none', '{org,approvals}', 'Authority level (agents.autonomy_level owns it)', 'Yetki seviyesi (kaynak-gerçek agents.autonomy_level)', false, '{employee}', 'org'),
  ('employee.fallback_model',              'employees', '{"type":"model_ref"}', 'medium', false, 'per_task', '{routing}', 'Per-agent fallback model (routing seam owns it)', 'Ajan fallback modeli (routing seam sahibi)', false, '{employee}', 'org'),
  ('employee.tools_access',                'employees', '{"type":"json"}', 'high', false, 'none', '{grants,mcp}', 'Tool access (library_grants/MCP profile is the source of truth)', 'Araç erişimi (kaynak-gerçek library_grants/MCP profili)', false, '{employee}', 'grants'),
  ('employee.skills_access',               'employees', '{"type":"json"}', 'high', false, 'none', '{grants,skills}', 'Skill access (library_grants is the source of truth)', 'Skill erişimi (kaynak-gerçek library_grants)', false, '{employee}', 'grants'),
  ('employee.plugin_access',               'employees', '{"type":"json"}', 'high', false, 'none', '{grants,plugins}', 'Plugin access (library_grants is the source of truth)', 'Plugin erişimi (kaynak-gerçek library_grants)', false, '{employee}', 'grants'),
  ('employee.memory_access',               'employees', '{"type":"json"}', 'high', false, 'none', '{grants,memory}', 'Memory access (grants seam owns it)', 'Memory erişimi (grants seam sahibi)', false, '{employee}', 'grants'),
  ('employee.file_access',                 'employees', '{"type":"json"}', 'high', false, 'none', '{grants,files}', 'File access (grants seam owns it)', 'Dosya erişimi (grants seam sahibi)', false, '{employee}', 'grants'),
  ('employee.repo_access',                 'employees', '{"type":"json"}', 'high', false, 'none', '{grants,repos}', 'Repository access (grants seam owns it)', 'Repository erişimi (grants seam sahibi)', false, '{employee}', 'grants'),
  ('employee.budget_limit_eur',            'employees', '{"type":"number","minimum":0,"default":5}', 'high', false, 'per_day', '{cost,budget}', 'Per-employee budget limit (EUR, monthly)', 'Çalışan bütçe limiti (EUR, aylık)', false, '{employee,global}', NULL),
  ('employee.token_limit',                 'employees', '{"type":"integer","minimum":0,"default":1000000}', 'medium', false, 'per_day', '{cost}', 'Per-employee token limit (monthly)', 'Çalışan token limiti (aylık)', false, '{employee,global}', NULL),
  ('employee.daily_task_limit',            'employees', '{"type":"integer","minimum":0,"default":50}', 'low', false, 'none', '{tasks}', 'Max tasks per day', 'Günlük görev limiti', false, '{employee,global}', NULL),
  ('employee.approval_required',           'employees', '{"type":"boolean","default":false}', 'high', false, 'none', '{approvals}', 'Every task by this employee requires approval', 'Bu çalışanın her görevi onaya düşer', false, '{employee}', NULL),
  ('employee.risk_level',                  'employees', '{"type":"enum","enum":["low","medium","high","critical"],"default":"medium"}', 'high', false, 'none', '{risk,approvals}', 'Risk classification of the employee''s work', 'Çalışanın iş risk sınıfı', false, '{employee}', NULL),
  ('employee.review_required',             'employees', '{"type":"boolean","default":true}', 'medium', false, 'per_task', '{quality,review}', 'Output requires review before delivery', 'Çıktı teslim öncesi review ister', false, '{employee,global}', NULL),
  ('employee.work_discipline',             'employees', '{"type":"json","default":{}}', 'low', false, 'none', '{personas,quality}', 'Work discipline overrides (persona §5 is the base)', 'Çalışma disiplini override''ları (taban persona §5)', false, '{employee}', NULL),
  ('employee.reporting_format',            'employees', '{"type":"json","default":{}}', 'low', false, 'none', '{reports}', 'Reporting format overrides', 'Raporlama formatı override''ları', false, '{employee}', NULL),
  ('employee.quality_standard',            'employees', '{"type":"json","default":{}}', 'medium', false, 'none', '{quality}', 'Quality standard overrides (persona §6 is the base)', 'Kalite standardı override''ları (taban persona §6)', false, '{employee}', NULL),
  ('employee.banned_behaviors',            'employees', '{"type":"json","default":[]}', 'high', false, 'none', '{risk,personas}', 'Banned behaviors additions (persona §10 is the base)', 'Yasaklanan davranış ekleri (taban persona §10)', false, '{employee}', NULL),
  ('employee.escalation_rules',            'employees', '{"type":"json","default":{}}', 'medium', false, 'none', '{escalation}', 'Escalation rule overrides', 'Escalation kuralı override''ları', false, '{employee}', NULL),

  -- 6.4 workflow settings (§18 Workflows) — 13 keys (A4: 4 CRUD
  -- capabilities live in the workflow engine seam, not the registry)
  ('workflow.trigger',                     'workflows', '{"type":"json","default":{}}', 'medium', false, 'none', '{workflows,scheduling}', 'Workflow trigger definition (cron/event/manual)', 'Workflow tetikleyicisi (cron/olay/manuel)', false, '{workflow}', NULL),
  ('workflow.model',                       'workflows', '{"type":"model_ref"}', 'medium', false, 'per_task', '{workflows,routing}', 'Model assigned to workflow steps', 'Workflow adımlarına atanan model', false, '{workflow}', NULL),
  ('workflow.assignees',                   'workflows', '{"type":"json","default":[]}', 'medium', false, 'none', '{workflows,org}', 'Agents assigned to the workflow', 'Workflow''a atanan çalışanlar', false, '{workflow}', NULL),
  ('workflow.approval_step_required',      'workflows', '{"type":"boolean","default":false}', 'high', false, 'none', '{workflows,approvals}', 'Workflow includes a CEO approval step', 'Workflow''da CEO onay adımı var', false, '{workflow}', NULL),
  ('workflow.review_step_required',        'workflows', '{"type":"boolean","default":true}', 'medium', false, 'per_task', '{workflows,quality}', 'Workflow includes a review step', 'Workflow''da review adımı var', false, '{workflow}', NULL),
  ('workflow.retry_step',                  'workflows', '{"type":"json","default":{"max_retries":2}}', 'low', false, 'none', '{workflows,resilience}', 'Retry step configuration', 'Retry adımı ayarı', false, '{workflow}', NULL),
  ('workflow.fallback_step',               'workflows', '{"type":"json","default":{}}', 'medium', false, 'none', '{workflows,resilience}', 'Fallback step configuration', 'Fallback adımı ayarı', false, '{workflow}', NULL),
  ('workflow.budget_limit_eur',            'workflows', '{"type":"number","minimum":0,"default":1}', 'high', false, 'per_task', '{cost,budget}', 'Budget cap per workflow run (EUR)', 'Workflow koşusu başına bütçe tavanı (EUR)', false, '{workflow}', NULL),
  ('workflow.token_limit',                 'workflows', '{"type":"integer","minimum":0,"default":200000}', 'medium', false, 'per_task', '{cost}', 'Token cap per workflow run', 'Workflow koşusu başına token tavanı', false, '{workflow}', NULL),
  ('workflow.timeout_seconds',             'workflows', '{"type":"duration","default":1800,"minimum":10}', 'low', false, 'none', '{workflows}', 'Workflow run timeout (seconds)', 'Workflow zaman aşımı (saniye)', false, '{workflow}', NULL),
  ('workflow.risk_level',                  'workflows', '{"type":"enum","enum":["low","medium","high","critical"],"default":"medium"}', 'high', false, 'none', '{risk,approvals}', 'Workflow risk classification', 'Workflow risk sınıfı', false, '{workflow}', NULL),
  ('workflow.logging_level',               'workflows', '{"type":"enum","enum":["minimal","standard","verbose"],"default":"standard"}', 'low', false, 'none', '{observability}', 'Logging verbosity for workflow runs', 'Workflow koşusu log seviyesi', false, '{workflow}', NULL),
  ('workflow.output_standard',             'workflows', '{"type":"json","default":{}}', 'medium', false, 'none', '{quality,workflows}', 'Output standard contract for the workflow', 'Workflow çıktı standardı sözleşmesi', false, '{workflow}', NULL)
ON CONFLICT (key) DO UPDATE SET
  category        = EXCLUDED.category,
  value_schema    = EXCLUDED.value_schema,
  risk            = EXCLUDED.risk,
  requires_approval = EXCLUDED.requires_approval,
  cost_impact     = EXCLUDED.cost_impact,
  affected_areas  = EXCLUDED.affected_areas,
  description_en  = EXCLUDED.description_en,
  description_tr  = EXCLUDED.description_tr,
  locked          = EXCLUDED.locked,
  scope_types     = EXCLUDED.scope_types,
  delegate        = EXCLUDED.delegate;

COMMENT ON FUNCTION public.control_settings_set(text, text, jsonb, text, jsonb, text, text) is
  '0021i (E6.1): single settings write seam — registry validation, B7b locked refusal, delegate refusal, optimistic p_expected_current, idempotent via control_idempotency; writes values+change_log+audit_log+Broadcast in one transaction.';
COMMENT ON FUNCTION public.control_settings_undo(bigint, text) is
  '0021i (E6.1): first-class undo — applies old_value as a NEW logged change (change_source=undo, undo_of chain); history is never rewritten.';
COMMENT ON FUNCTION public.resolve_setting(text, uuid) is
  '0021i (E6.1): deterministic scope resolution employee → department → global → registry default.';

-- ROLLBACK:
--   DELETE FROM public.settings_registry WHERE category IN
--     ('models','orchestrator','global_os','departments','employees','workflows');
--   REVOKE-then-DROP FUNCTION public.control_settings_set(text,text,jsonb,text,jsonb,text,text);
--   DROP FUNCTION IF EXISTS public.control_settings_undo(bigint,text);
--   DROP FUNCTION IF EXISTS public.resolve_setting(text,uuid);
--   DROP FUNCTION IF EXISTS public.fn_settings_validate_value(jsonb,jsonb);
--   ALTER TABLE public.settings_registry
--     DROP COLUMN IF EXISTS delegate, DROP COLUMN IF EXISTS scope_types,
--     DROP COLUMN IF EXISTS locked;
