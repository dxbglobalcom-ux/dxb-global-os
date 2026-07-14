-- ============================================================================
-- E10.1 — FABLE 5 HOOK ENGINE storage (FABLE_5_HOOK_SPEC §4/§13/§9)
--
-- hook_policies: machine-readable rule set for the 17 standards of madde 7
--   (§2 normative mapping). hook_violations: append-only violation record —
--   the automatic feed of the HR error history (§4 note) and of /gov/violations.
--
-- Registered adaptations (mirrored in FABLE_5_HOOK_SPEC at row close):
--   A1  fn_hook_set_policy keeps the spec §13 name but adopts the sibling
--       control-seam payload idiom (p_payload + p_idempotency_key, CEO wall,
--       idempotency twin, audit row, settings-channel cache-drop broadcast §10).
--       Downgrading a 'block' policy (severity→warn OR enabled→false) is a
--       high-risk change (§13) — stamped risk='high' in the audit payload.
--   A2  title_en/title_tr columns — §14 "insan-okur TR/EN" + the bilingual
--       purity directive (DB text is an i18n surface); §4 DDL had no
--       human-readable field.
--   A3  Seed severities: 'block' everywhere except std 5 token budget (warn —
--       hard-stop authority stays with COST_CONTROL, §2 row 5) and std 10
--       context integrity (warn — monitor-and-reload semantic, §2 row 10).
--   A4  §9 "ihlaller alerts kanalına severity eşlemesiyle" left the mapping
--       open: escalated→high (§7), rejected→attention, revised/warned→
--       informational; dedup_key hook:<policy>:<run|no-run> (storm guard,
--       E8.4b idiom). Alert write never fails the violation insert (swallow).
--   A7  std 11 project link reads tasks.milestone_id → project_milestones
--       (E9.4 chain) or explicit ctx.project — live schema has no
--       tasks.project_id column.
--   (A5/A6/A8 are package-side — see FABLE_5_HOOK_SPEC adaptation note.)
--
-- Idempotent: 2× apply is a no-op (IF NOT EXISTS / ON CONFLICT / OR REPLACE).
-- ============================================================================

BEGIN;

-- ── 1. hook_policies (§4 DDL + A2) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hook_policies (
  id          text PRIMARY KEY,                  -- e.g. 'std.no_unverified_done'
  standard_no int  NOT NULL CHECK (standard_no BETWEEN 1 AND 17),
  gate        text NOT NULL CHECK (gate IN ('pre','runtime','post')),
  rule        jsonb NOT NULL,                    -- machine-readable parameters
  severity    text NOT NULL DEFAULT 'block' CHECK (severity IN ('block','warn')),
  enabled     boolean NOT NULL DEFAULT true,
  version     int NOT NULL DEFAULT 1,
  title_en    text NOT NULL,                     -- A2 (human-readable, UI)
  title_tr    text NOT NULL
);

COMMENT ON TABLE public.hook_policies IS
  'FABLE_5_HOOK_SPEC §4 — the central working standard every agent binds to. Edited ONLY through fn_hook_set_policy (CEO). Per-employee opt-out does not exist (§13).';

-- ── 2. hook_violations (§4 DDL, append-only) ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hook_violations (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id       uuid REFERENCES public.agent_runs(id),
  policy_id    text NOT NULL REFERENCES public.hook_policies(id),
  gate         text NOT NULL,
  detail       text NOT NULL,                    -- human-readable (§14, TR/EN)
  action_taken text NOT NULL CHECK (action_taken IN ('rejected','revised','escalated','warned')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hook_violations_run     ON public.hook_violations (run_id);
CREATE INDEX IF NOT EXISTS idx_hook_violations_created ON public.hook_violations (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hook_violations_policy  ON public.hook_violations (policy_id);

COMMENT ON TABLE public.hook_violations IS
  'FABLE_5_HOOK_SPEC §4 — append-only; automatic input of the HR performance/error record (daily HR derivation job, not double-write).';

-- RLS + append-only surface: CEO dashboard reads; nobody rewrites history.
ALTER TABLE public.hook_policies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hook_violations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS hook_policies_read ON public.hook_policies;
CREATE POLICY hook_policies_read ON public.hook_policies
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS hook_violations_read ON public.hook_violations;
CREATE POLICY hook_violations_read ON public.hook_violations
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.hook_policies, public.hook_violations
  TO authenticated, service_role;
REVOKE INSERT, UPDATE, DELETE ON public.hook_policies   FROM authenticated, anon;
REVOKE UPDATE, DELETE         ON public.hook_violations FROM authenticated, anon;
REVOKE INSERT                 ON public.hook_violations FROM authenticated, anon;
GRANT INSERT ON public.hook_violations TO service_role;
GRANT USAGE ON SEQUENCE public.hook_violations_id_seq TO service_role;

-- ── 3. Seed — 17 standards × default rules (§2 normative mapping, A3) ───────
-- 19 rows: std 5 appears at BOTH gates (§6 pre-gate budget fit + §2 runtime
-- counter) and std 12 carries a second row for the persona quality gate
-- (§6 pre-gate order: "persona kalite kapısı passed değilse spawn RED" —
-- EMPLOYEE_PERSONA rule, filed under standard 12 spawn-eligibility).
INSERT INTO public.hook_policies
  (id, standard_no, gate, severity, rule, title_en, title_tr)
VALUES
  -- pre-gate (§6 order: permission → completeness → budget → project → persona)
  ('std.permission_bounds', 12, 'pre', 'block',
   '{"check":"permission_bounds","require_mcp_profile":true,"tools_within_grants":true}',
   'Do not violate permission bounds', 'Yetki sınırlarını ihlal etme'),
  ('std.persona_gate', 12, 'pre', 'block',
   '{"check":"persona_gate","require":"passed"}',
   'Only quality-gated personas may run', 'Yalnız kalite kapısı geçmiş persona koşabilir'),
  ('std.task_completeness', 1, 'pre', 'block',
   '{"check":"task_completeness","require":["objective","output_contract"],"reject_code":"missing_acceptance"}',
   'Understand the task fully before starting', 'Görevi tam anlamadan başlama'),
  ('std.plan_evidence', 3, 'pre', 'block',
   '{"check":"plan_evidence","when":"plan_required","decision_kind":"task_plan"}',
   'No incomplete planning', 'Eksik plan yapma'),
  ('std.budget_fit', 5, 'pre', 'block',
   '{"check":"budget_fit","source":"cost_ledger","respect_hard_stop":true}',
   'Task must fit the remaining budget', 'Görev kalan bütçeye sığmalı'),
  ('std.project_alignment', 11, 'pre', 'block',
   '{"check":"project_link","source":["task.milestone_id","ctx.project"],"reject_code":"missing_project_link"}',
   'Do not conflict with holding goals', 'Holding hedefleriyle çelişme'),
  -- runtime (hook MONITORS; the runner is the single kill authority — §6)
  ('std.token_budget', 5, 'runtime', 'warn',
   '{"check":"token_budget","source":"task.budget_max_tokens","fallback_setting":"hook.run_token_budget_default"}',
   'Do not waste tokens', 'Gereksiz token tüketme'),
  ('std.spawn_discipline', 6, 'runtime', 'block',
   '{"check":"spawn","require_rationale":true,"max_depth_setting":"orchestration.max_spawn_depth"}',
   'No hand-off without a reason', 'Sebepsiz devir yapma'),
  ('std.context_integrity', 10, 'runtime', 'warn',
   '{"check":"context","threshold_setting":"hook.context_summary_threshold","reload_from":"memory-router"}',
   'Do not lose task context', 'Görev bağlamını kaybetme'),
  ('std.escalation_required', 13, 'runtime', 'block',
   '{"check":"escalation","confidence_threshold_setting":"hook.escalation_confidence_threshold","chain_setting":"hook.escalation_chain"}',
   'Escalate when required', 'Gerekli escalation''ı yap'),
  -- post-gate (§6 evidence package: {output, evidence[], acceptance_map})
  ('std.no_shallow_output', 2, 'post', 'block',
   '{"check":"acceptance_coverage","direction":"depth"}',
   'No superficial answers', 'Yüzeysel cevap verme'),
  ('std.acceptance_coverage', 4, 'post', 'block',
   '{"check":"acceptance_coverage","direction":"criteria"}',
   'Every acceptance criterion answered', 'Kabul kriterlerinin her maddesine karşılık'),
  ('std.no_unverified_done', 7, 'post', 'block',
   '{"check":"evidence_present","min_evidence":1,"reject_code":"unverified_done"}',
   'No result without evidence', 'Kanıtsız sonuç üretme'),
  ('std.output_schema', 8, 'post', 'block',
   '{"check":"output_schema","by_task_type":true}',
   'No incomplete delivery', 'Eksik teslim yapma'),
  ('std.gate_before_success', 9, 'post', 'block',
   '{"check":"gate_lock","enforced_by":"runner"}',
   'No success without the quality gate', 'Kalite kapısız tamam sayma'),
  ('std.decision_rationale', 14, 'post', 'block',
   '{"check":"decision_rationale","enforced_by":"schema","verify_rows_when_claimed":true}',
   'Record the rationale of important decisions', 'Önemli karar gerekçesini kaydet'),
  ('std.verification_executed', 15, 'post', 'block',
   '{"check":"verification_evidence","evidence_kind":"verification","tool_call_proof":true}',
   'Verify the work you did', 'Yapılan işi doğrula'),
  ('std.output_matches_request', 16, 'post', 'block',
   '{"check":"acceptance_coverage","direction":"output"}',
   'Output must match what was asked', 'Çıktı-talep uygunluğunu denetle'),
  ('std.memory_write', 17, 'post', 'block',
   '{"check":"memory_evidence","when":"task_requires_memory"}',
   'Record correctly into system memory', 'Sistem hafızasına doğru kayıt yap')
ON CONFLICT (id) DO NOTHING;

-- ── 4. Violation → alert (A4; §9 severity mapping; E8.4b single-producer) ───
CREATE OR REPLACE FUNCTION public.fn_hook_violation_alert()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_level text;
  v_title text;
BEGIN
  BEGIN
    v_level := CASE NEW.action_taken
      WHEN 'escalated' THEN 'high'          -- §7: escalation reaches the CEO wall
      WHEN 'rejected'  THEN 'attention'
      ELSE 'informational'                  -- revised / warned
    END;
    SELECT title_en INTO v_title FROM hook_policies WHERE id = NEW.policy_id;
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, run_id, dedup_key, source_ref)
    VALUES (v_level, 'hook',
            'Hook violation: ' || COALESCE(v_title, NEW.policy_id),
            NEW.gate || '-gate',
            left(NEW.detail, 300),
            'Review the violation on /gov/violations; repeated violations feed the HR error record',
            NEW.run_id,
            -- action in the key: an early 'revised' (informational) must never
            -- mask the later 'escalated' (high) for the same policy+run.
            'hook:' || NEW.policy_id || ':' || NEW.action_taken || ':'
              || COALESCE(NEW.run_id::text, 'no-run'),
            jsonb_build_object('table', 'hook_violations', 'id', NEW.id))
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- The alert is a projection; losing it must never fail the violation record.
    RAISE WARNING 'hook violation alert swallowed: %', SQLERRM;
  END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_hook_violation_alert ON public.hook_violations;
CREATE TRIGGER trg_hook_violation_alert
  AFTER INSERT ON public.hook_violations
  FOR EACH ROW EXECUTE FUNCTION public.fn_hook_violation_alert();

-- ── 5. fn_hook_set_policy — the ONLY policy mutation door (§13, A1) ─────────
CREATE OR REPLACE FUNCTION public.fn_hook_set_policy(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor     text;
  v_digest    text;
  v_prev      record;
  v_policy    record;
  v_id        text;
  v_severity  text;
  v_enabled   boolean;
  v_rule      jsonb;
  v_title_en  text;
  v_title_tr  text;
  v_risk      text := 'medium';
  v_changes   jsonb := '{}'::jsonb;
  v_audit_id  bigint;
  v_resp      jsonb;
BEGIN
  -- §13: policy editing is CEO-ONLY — the system actor is rejected too.
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'hook policies are edited only by the CEO');
  END IF;
  v_actor := 'ceo';

  p_payload := jsonb_strip_nulls(p_payload);

  v_digest := md5('hook|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  IF p_payload->>'action' IS DISTINCT FROM 'set_policy' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'action must be set_policy');
  END IF;

  v_id := p_payload->>'policy_id';
  SELECT * INTO v_policy FROM hook_policies WHERE id = v_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND',
      'detail', 'unknown policy_id ' || COALESCE(v_id, '(null)'));
  END IF;

  v_severity := COALESCE(p_payload->>'severity', v_policy.severity);
  IF v_severity NOT IN ('block','warn') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'severity must be block|warn');
  END IF;
  v_enabled := COALESCE((p_payload->>'enabled')::boolean, v_policy.enabled);
  v_rule := COALESCE(p_payload->'rule', v_policy.rule);
  IF jsonb_typeof(v_rule) <> 'object' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'rule must be a JSON object');
  END IF;
  v_title_en := COALESCE(p_payload->>'title_en', v_policy.title_en);
  v_title_tr := COALESCE(p_payload->>'title_tr', v_policy.title_tr);

  IF v_severity  = v_policy.severity AND v_enabled = v_policy.enabled
     AND v_rule  = v_policy.rule
     AND v_title_en = v_policy.title_en AND v_title_tr = v_policy.title_tr THEN
    v_resp := jsonb_build_object('ok', true, 'policy_id', v_id,
                'version', v_policy.version, 'no_change', true);
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
    RETURN v_resp;
  END IF;

  -- §13/A1: weakening a block policy is a HIGH-risk governance change.
  IF v_policy.severity = 'block'
     AND (v_severity = 'warn' OR (v_policy.enabled AND NOT v_enabled)) THEN
    v_risk := 'high';
  END IF;

  v_changes := jsonb_build_object(
    'severity', CASE WHEN v_severity <> v_policy.severity
                     THEN jsonb_build_object('old', v_policy.severity, 'new', v_severity) END,
    'enabled',  CASE WHEN v_enabled <> v_policy.enabled
                     THEN jsonb_build_object('old', v_policy.enabled, 'new', v_enabled) END,
    'rule',     CASE WHEN v_rule <> v_policy.rule
                     THEN jsonb_build_object('old', v_policy.rule, 'new', v_rule) END,
    'title',    CASE WHEN v_title_en <> v_policy.title_en OR v_title_tr <> v_policy.title_tr
                     THEN jsonb_build_object('old', v_policy.title_en, 'new', v_title_en) END);
  v_changes := jsonb_strip_nulls(v_changes);

  UPDATE hook_policies
     SET severity = v_severity, enabled = v_enabled, rule = v_rule,
         title_en = v_title_en, title_tr = v_title_tr,
         version = version + 1
   WHERE id = v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, 'ceo', 'hook.set_policy',
          jsonb_build_object('policy_id', v_id, 'changes', v_changes, 'risk', v_risk),
          jsonb_build_object('table', 'hook_policies', 'id', v_id))
  RETURNING id INTO v_audit_id;

  -- §10: cache drop — the settings channel is the invalidation carrier.
  BEGIN
    PERFORM notify_broadcast('settings', 'hook_policy.changed',
      jsonb_build_object('policy_id', v_id, 'version', v_policy.version + 1));
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'hook_policy.changed broadcast swallowed: %', SQLERRM; -- §15
  END;

  v_resp := jsonb_build_object('ok', true, 'policy_id', v_id,
              'version', v_policy.version + 1, 'risk', v_risk,
              'audit_id', v_audit_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.fn_hook_set_policy(jsonb, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_hook_set_policy(jsonb, text)
  TO authenticated, service_role;

-- ── 6. Settings keys the gates read (§8-10, §22 flag family) ────────────────
INSERT INTO settings_registry (key, category, value_schema, risk,
  description_en, description_tr, scope_types)
VALUES
  ('hook.enabled', 'global_os',
   '{"type":"boolean"}', 'high',
   'Master switch binding the Fable 5 hook to the spawn path; OFF is a temporary, alerted state (§23)',
   'Fable 5 hook''unun spawn yoluna bağlanma anahtarı; KAPALI durum geçicidir ve alarmlıdır (§23)', '{global}'),
  ('hook.escalation_chain', 'global_os',
   '{"type":"object"}', 'medium',
   'Escalation chain per department; default employee → manager → orchestrator → CEO (§7)',
   'Departman bazında escalation zinciri; varsayılan çalışan → müdür → orchestrator → CEO (§7)', '{global}'),
  ('hook.context_summary_threshold', 'global_os',
   '{"type":"number","minimum":0,"maximum":1}', 'low',
   'Context-usage ratio above which the runtime rule demands a summary/reload (std 10)',
   'Bu bağlam-kullanım oranı aşılınca runtime kuralı özet/yeniden yükleme ister (std 10)', '{global}'),
  ('hook.escalation_confidence_threshold', 'global_os',
   '{"type":"number","minimum":0,"maximum":1}', 'low',
   'Self-assessed confidence below this value must escalate (std 13)',
   'Bu değerin altındaki öz-güven skoru escalation zorunlu kılar (std 13)', '{global}'),
  ('hook.run_token_budget_default', 'global_os',
   '{"type":"number","minimum":1000}', 'low',
   'Fallback per-run token budget when the task carries none (std 5 monitor)',
   'Görev bütçe taşımıyorsa koşu başına varsayılan token bütçesi (std 5 izleme)', '{global}'),
  ('orchestration.max_spawn_depth', 'global_os',
   '{"type":"number","minimum":1,"maximum":10}', 'medium',
   'Maximum sub-agent spawn depth; beyond it the spawn is a policy rejection (ORCHESTRATION §6)',
   'Azami sub-agent spawn derinliği; aşımı policy reddidir (ORCHESTRATION §6)', '{global}'),
  ('orchestration.max_revision_rounds', 'global_os',
   '{"type":"number","minimum":0,"maximum":5}', 'medium',
   'Post-gate REVISE rounds before escalation (ORCHESTRATION §19)',
   'Escalation öncesi post-gate REVISE turu sayısı (ORCHESTRATION §19)', '{global}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings_values (key, scope, value, updated_by)
VALUES
  ('hook.enabled', 'global', 'false'::jsonb, 'system'),  -- E10.2 flips after binding
  ('hook.escalation_chain', 'global',
   '{"default":["manager","orchestrator","ceo"]}'::jsonb, 'system'),
  ('hook.context_summary_threshold', 'global', '0.8'::jsonb, 'system'),
  ('hook.escalation_confidence_threshold', 'global', '0.4'::jsonb, 'system'),
  ('hook.run_token_budget_default', 'global', '200000'::jsonb, 'system'),
  ('orchestration.max_spawn_depth', 'global', '3'::jsonb, 'system'),
  ('orchestration.max_revision_rounds', 'global', '2'::jsonb, 'system')
ON CONFLICT (key, scope) DO NOTHING;

-- ── 7. fn_alerts_evaluate — additive hook check (FABLE_5_HOOK_SPEC §7):
--       "açık escalation 24s cevapsız kalırsa alert critical". Full replace
--       of the E9.3 body (copied verbatim from the live definition) + ONE new
--       block; scheduler adoption unchanged (E8.4b R3). ──────────────────────
CREATE OR REPLACE FUNCTION public.fn_alerts_evaluate()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $function$
DECLARE
  v_queue_max  int;
  v_hb_max     int;
  v_esc        jsonb;
  v_n          int;
  v_oldest     timestamptz;
  v_last_hb    timestamptz;
  v_raised     int := 0;
  v_escalated  int := 0;
BEGIN
  SELECT COALESCE((SELECT (value #>> '{}')::int FROM settings_values
                    WHERE key = 'alerts.queue_age_max_minutes' AND scope = 'global'), 30)
    INTO v_queue_max;
  SELECT COALESCE((SELECT (value #>> '{}')::int FROM settings_values
                    WHERE key = 'alerts.heartbeat_max_seconds' AND scope = 'global'), 300)
    INTO v_hb_max;
  SELECT COALESCE((SELECT value FROM settings_values
                    WHERE key = 'alerts.escalate_after_minutes' AND scope = 'global'),
                  '{"attention":240,"high":60,"critical":15}'::jsonb)
    INTO v_esc;

  -- queue age
  SELECT count(*), min(created_at) INTO v_n, v_oldest
    FROM tasks
   WHERE status = 'queued'
     AND created_at < now() - make_interval(mins => v_queue_max);
  IF v_n > 0 THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('attention', 'queue',
            v_n || ' task(s) queued longer than ' || v_queue_max || ' min',
            'task queue',
            'oldest queued since ' || to_char(v_oldest, 'YYYY-MM-DD HH24:MI') || ' UTC',
            'Check worker liveness and queue depth on /live',
            'queue-age')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
    IF FOUND THEN v_raised := v_raised + 1; END IF;
  END IF;

  -- heartbeat loss (empty snapshot table = probe never started → honest skip)
  SELECT max(at) INTO v_last_hb FROM system_health_snapshots;
  IF v_last_hb IS NOT NULL
     AND v_last_hb < now() - make_interval(secs => v_hb_max) THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('high', 'heartbeat',
            'Health probe heartbeat lost (last snapshot '
            || to_char(v_last_hb, 'YYYY-MM-DD HH24:MI') || ' UTC)',
            'health probe',
            'no system_health_snapshots row within ' || v_hb_max || 's',
            'Check the worker process and pg-boss health-probe job',
            'heartbeat-loss')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
    IF FOUND THEN v_raised := v_raised + 1; END IF;
  END IF;

  -- E9.3 §9a: pending approval inside the last 25% of its deadline window,
  -- or already past it (§26: expired = marker + alert, NEVER auto-cancel).
  -- One dedup key per approval covers both phases; the escalation sweep
  -- below raises unacknowledged ones.
  WITH raised AS (
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key, source_ref)
    SELECT CASE WHEN now() > a.deadline THEN 'high' ELSE 'attention' END,
           'approvals',
           CASE WHEN now() > a.deadline THEN 'Approval deadline EXPIRED: '
                ELSE 'Approval nearing deadline: ' END
             || COALESCE(a.operation, a.action_type),
           'approval gate',
           'deadline ' || to_char(a.deadline, 'YYYY-MM-DD HH24:MI')
             || ' UTC (created ' || to_char(a.created_at, 'YYYY-MM-DD HH24:MI') || ' UTC)',
           'Decide it on /approvals/' || a.id,
           'approval-deadline-' || a.id,
           jsonb_build_object('table', 'approvals', 'id', a.id)
      FROM approvals a
     WHERE a.status = 'pending' AND a.deadline IS NOT NULL
       AND now() > a.deadline - (a.deadline - a.created_at) * 0.25
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING
    RETURNING 1)
  SELECT v_raised + count(*) INTO v_raised FROM raised;

  -- E9.3 §9b: money_out pending >24h → High. Money flow must not sit —
  -- but auto-approval NEVER (the alert is the only automation).
  WITH raised AS (
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key, source_ref)
    SELECT 'high', 'approvals',
           'money-out approval pending >24h: ' || COALESCE(a.operation, a.action_type),
           'approval gate (B7b)',
           'pending since ' || to_char(a.created_at, 'YYYY-MM-DD HH24:MI') || ' UTC',
           'Decide it on /approvals/' || a.id,
           'approval-moneyout-' || a.id,
           jsonb_build_object('table', 'approvals', 'id', a.id)
      FROM approvals a
     WHERE a.status = 'pending'
       AND fn_is_money_out(a.operation_class, a.action_type)
       AND a.created_at < now() - interval '24 hours'
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING
    RETURNING 1)
  SELECT v_raised + count(*) INTO v_raised FROM raised;

  -- E10.1 (FABLE_5_HOOK_SPEC §7): an OPEN escalation must produce a result —
  -- a hook escalation whose CEO approval item is still pending after 24h
  -- raises critical (lost responsibility is itself a violation).
  WITH raised AS (
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, run_id, dedup_key, source_ref)
    SELECT 'critical', 'hook',
           'Hook escalation unanswered >24h: ' || hv.policy_id,
           'hook escalation chain',
           'escalated at ' || to_char(hv.created_at, 'YYYY-MM-DD HH24:MI')
             || ' UTC, no decision yet',
           'Decide the escalation approval on /approvals/' || a.id,
           hv.run_id,
           'hook-escalation-stale-' || hv.id,
           jsonb_build_object('table', 'hook_violations', 'id', hv.id)
      FROM hook_violations hv
      JOIN approvals a ON a.action_type = 'hook_escalation'
                      AND a.status = 'pending'
                      AND (a.payload ->> 'violation_id') = hv.id::text
     WHERE hv.action_taken = 'escalated'
       AND hv.created_at < now() - interval '24 hours'
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING
    RETURNING 1)
  SELECT v_raised + count(*) INTO v_raised FROM raised;

  -- escalation sweep (GAP-10; ticket interp 2): unacknowledged past deadline
  -- → one level up, once per alert; muted alerts wait out their snooze.
  WITH bumped AS (
    UPDATE alerts a
       SET level = CASE a.level WHEN 'attention' THEN 'high'
                                WHEN 'high' THEN 'critical'
                                WHEN 'critical' THEN 'emergency' END,
           escalated_from = a.level,
           escalated_at   = now()
     WHERE a.resolved_at IS NULL
       AND a.acknowledged_at IS NULL
       AND a.escalated_at IS NULL
       AND (a.muted_until IS NULL OR a.muted_until < now())
       AND a.level IN ('attention', 'high', 'critical')
       AND a.at < now() - make_interval(mins => COALESCE((v_esc ->> a.level)::int, 240))
    RETURNING 1)
  SELECT count(*) INTO v_escalated FROM bumped;

  RETURN jsonb_build_object('ok', true, 'raised', v_raised,
                            'escalated', v_escalated);
END $function$;

COMMIT;

-- Rollback plan (§23): DROP TRIGGER trg_hook_violation_alert; DROP FUNCTION
-- fn_hook_violation_alert, fn_hook_set_policy; DROP TABLE hook_violations,
-- hook_policies. Package call sites live behind settings 'hook.enabled'
-- (flag-off period is temporary and alerted — §23).
