-- ============================================================================
-- E8.4b — Notification/Alert center (GAP-10; OBSERVABILITY_SPEC §3/§4/§8/§9,
-- COST_CONTROL R4, MODEL_ROUTING §9/§17, CC-SPEC §4 v_alerts_active)
--
-- 1. alerts + system_health_snapshots tables (0022x family completion).
--    Registered adaptations (ticket 20260713-e84b-alert-center, mirrored in
--    OBSERVABILITY_SPEC adaptation note): dedup_key (storm dedup §26),
--    run_id/task_id/source_ref (§12 loose link made concrete: corr + drill),
--    escalated_at/escalated_from (GAP-10 escalation), muted_until
--    (API_CONTRACTS `mute` op).
-- 2. ONE broadcast producer: alerts-table trigger → alert.raised /
--    acknowledged / resolved / escalated on `alerts` channel (§9; envelope
--    EVENT_MODEL §9a; failure never blocks the source write — E8.3 §15).
-- 3. Real alarm sources: agent_runs failed · cost thresholds 70/90/100
--    (COST R4, directive constants) · budget hard-stop/breaker ·
--    fn_model_fallback ≥2 hops High / exhausted Critical (ROUTING §9/§17) ·
--    reviewed_flagged (mark_reviewed refit: INSERT row, trigger broadcasts).
-- 4. fn_alerts_evaluate() — time-based checks (queue age, heartbeat loss,
--    escalation sweep). Phase-7 pg-boss 'alert-evaluate' job adopts it (R3:
--    no new resident service now).
-- 5. control_alerts_action (ack/resolve/assign/mute; §13 ceo-only lifecycle;
--    idempotent; audit row with canonical detail_ref — roadmap acceptance).
-- 6. v_alerts_active (alerts ∪ pending critical approvals, severity order) +
--    v_audit_trail alerts family branch.
-- ============================================================================

BEGIN;

-- ── 1a. alerts table (OBSERVABILITY §4 + registered adaptations) ────────────
CREATE TABLE IF NOT EXISTS public.alerts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  at                   timestamptz NOT NULL DEFAULT now(),
  level                text NOT NULL CHECK (level IN
    ('informational','attention','high','critical','emergency')),
  source               text NOT NULL,
  title                text NOT NULL,
  affected_area        text,
  probable_cause       text,
  suggested_action     text,
  responsible_employee uuid REFERENCES public.agents(id),
  mitigation           text,
  acknowledged_at      timestamptz,
  resolved_at          timestamptz,
  ceo_action           text,
  -- adaptations (ticket §interp 1):
  dedup_key            text,
  run_id               uuid REFERENCES public.agent_runs(id),
  task_id              uuid REFERENCES public.tasks(id),
  source_ref           jsonb NOT NULL DEFAULT '{}'::jsonb,
  escalated_at         timestamptz,
  escalated_from       text,
  muted_until          timestamptz
);
-- Storm dedup: one ACTIVE alert per dedup_key; resolving frees the key.
CREATE UNIQUE INDEX IF NOT EXISTS idx_alerts_dedup_active
  ON public.alerts (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_active
  ON public.alerts (at DESC) WHERE resolved_at IS NULL;

ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY alerts_ceo_read ON public.alerts
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
-- Table-level grant is the first gate (E8.4 lesson). Lifecycle writes go
-- through control_alerts_action ONLY; service_role may INSERT (obs spill
-- alert, Phase-7 jobs) but never UPDATE/DELETE — alerts are kept (§22).
GRANT SELECT ON public.alerts TO authenticated;
GRANT SELECT, INSERT ON public.alerts TO service_role;
REVOKE ALL ON public.alerts FROM anon;

-- ── 1b. system_health_snapshots (OBSERVABILITY §4; heartbeat source) ────────
-- Probe job = Phase 7 (R3). Created now so heartbeat-loss has its real
-- source; empty table = probe never started → no alert (honest state).
CREATE TABLE IF NOT EXISTS public.system_health_snapshots (
  at                 timestamptz PRIMARY KEY DEFAULT now(),
  provider_status    jsonb,
  db_health          jsonb,
  queue_depth        jsonb,
  agent_runtime      jsonb,
  api_health         jsonb,
  memory_health      jsonb,
  vector_health      jsonb,
  plugin_health      jsonb,
  integration_health jsonb,
  error_rate         numeric,
  p95_latency_ms     int,
  cpu                numeric,
  ram                numeric,
  disk               numeric
);
ALTER TABLE public.system_health_snapshots ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY health_snapshots_ceo_read ON public.system_health_snapshots
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
GRANT SELECT ON public.system_health_snapshots TO authenticated;
GRANT SELECT, INSERT ON public.system_health_snapshots TO service_role;
REVOKE ALL ON public.system_health_snapshots FROM anon;

-- ── 2. broadcast trigger — THE single alerts-channel producer ───────────────
CREATE OR REPLACE FUNCTION public.fn_alerts_broadcast()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_type  text;
  v_actor text;
  v_corr  record;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_type := 'alert.raised';
  ELSIF NEW.resolved_at IS NOT NULL AND OLD.resolved_at IS NULL THEN
    v_type := 'alert.resolved';
  ELSIF NEW.acknowledged_at IS NOT NULL AND OLD.acknowledged_at IS NULL THEN
    v_type := 'alert.acknowledged';
  ELSIF NEW.escalated_at IS NOT NULL AND OLD.escalated_at IS DISTINCT FROM NEW.escalated_at THEN
    v_type := 'alert.escalated';
  ELSE
    RETURN NEW;  -- assign/mute etc: state change without a channel event
  END IF;

  v_actor := CASE WHEN auth.uid() IS NOT NULL THEN 'ceo' ELSE 'system' END;
  SELECT COALESCE(NEW.task_id, r.task_id) AS task_id,
         r.workflow_run_id, t.project_id
    INTO v_corr
    FROM (SELECT NEW.run_id AS rid) x
    LEFT JOIN agent_runs r ON r.id = x.rid
    LEFT JOIN tasks t      ON t.id = COALESCE(NEW.task_id, r.task_id);

  -- §15 (E8.3 precedent): broadcast failure never blocks the source write.
  BEGIN
    PERFORM public.notify_broadcast('alerts', v_type, jsonb_build_object(
      'actor', v_actor,
      'entity', jsonb_build_object('kind', 'alert', 'id', NEW.id::text),
      'corr', jsonb_build_object(
        'task_id', v_corr.task_id, 'run_id', NEW.run_id,
        'workflow_run_id', v_corr.workflow_run_id,
        'project_id', v_corr.project_id),
      'payload', jsonb_build_object(
        'alert_id', NEW.id, 'level', NEW.level,
        'title', NEW.title, 'source', NEW.source)));
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'fn_alerts_broadcast: % (alert % kept)', SQLERRM, NEW.id;
  END;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_alerts_broadcast ON public.alerts;
CREATE TRIGGER trg_alerts_broadcast
  AFTER INSERT OR UPDATE ON public.alerts
  FOR EACH ROW EXECUTE FUNCTION public.fn_alerts_broadcast();

-- ── 3a. source: agent run failure (OBSERVABILITY §3) ────────────────────────
CREATE OR REPLACE FUNCTION public.fn_alert_on_run_failed()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                      suggested_action, responsible_employee, run_id, task_id,
                      source_ref)
  SELECT 'high', 'agent_run',
         'Agent run failed' || COALESCE(': ' || ag.slug, ''),
         COALESCE(ag.slug, 'unknown agent'),
         left(NEW.error, 300),
         'Inspect the run and retry the task if transient',
         NEW.employee_id, NEW.id, NEW.task_id,
         jsonb_build_object('table', 'agent_runs', 'id', NEW.id)
  FROM (SELECT 1) one
  LEFT JOIN agents ag ON ag.id = NEW.employee_id;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_alert_run_failed ON public.agent_runs;
CREATE TRIGGER trg_alert_run_failed
  AFTER UPDATE ON public.agent_runs
  FOR EACH ROW
  WHEN (NEW.status = 'failed' AND OLD.status IS DISTINCT FROM 'failed')
  EXECUTE FUNCTION public.fn_alert_on_run_failed();

-- ── 3b. source: cost thresholds (COST_CONTROL R4 — directive constants) ─────
-- 70% Attention · 90% High · 100% Critical, against budget_state monthly cap,
-- month-to-date. Dedup: one alert per month+threshold (ON CONFLICT eats the
-- storm). Full guard/rollup jobs land in Phase 7; the threshold WATCH is live
-- from every ledger write.
CREATE OR REPLACE FUNCTION public.fn_alert_on_cost_threshold()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cap   numeric;
  v_spent numeric;
  v_pct   numeric;
  v_month text := to_char(now(), 'YYYYMM');
BEGIN
  SELECT monthly_cap_eur INTO v_cap FROM budget_state WHERE id = true;
  IF v_cap IS NULL OR v_cap = 0 THEN RETURN NEW; END IF;
  SELECT COALESCE(sum(cost_eur), 0) INTO v_spent
    FROM cost_ledger WHERE created_at >= date_trunc('month', now());
  v_pct := round(v_spent / v_cap * 100, 1);

  IF v_pct >= 100 THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('critical', 'cost',
            'Monthly budget reached 100% (' || v_spent || ' / ' || v_cap || ' EUR)',
            'monthly budget', 'spend ' || v_pct || '% of cap',
            'Non-critical work hard-stops; review /fin/costs and raise cap or wait',
            'cost-' || v_month || '-100')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  END IF;
  IF v_pct >= 90 THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('high', 'cost',
            'Monthly budget passed 90% (' || v_spent || ' / ' || v_cap || ' EUR)',
            'monthly budget', 'spend ' || v_pct || '% of cap',
            'Review burn rate on /fin/costs before the hard-stop threshold',
            'cost-' || v_month || '-90')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  END IF;
  IF v_pct >= 70 THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('attention', 'cost',
            'Monthly budget passed 70% (' || v_spent || ' / ' || v_cap || ' EUR)',
            'monthly budget', 'spend ' || v_pct || '% of cap',
            'Watch burn rate; consider deferring non-critical batch work',
            'cost-' || v_month || '-70')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_alert_cost_threshold ON public.cost_ledger;
CREATE TRIGGER trg_alert_cost_threshold
  AFTER INSERT ON public.cost_ledger
  FOR EACH ROW EXECUTE FUNCTION public.fn_alert_on_cost_threshold();

-- ── 3c. source: budget hard-stop / velocity breaker (COST §9) ────────────────
CREATE OR REPLACE FUNCTION public.fn_alert_on_budget_stop()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.hard_stopped AND NOT OLD.hard_stopped THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('critical', 'cost', 'Budget hard-stop engaged',
            'kernel task intake', 'monthly cap reached',
            'Non-critical intake stopped; running work finishes. Decide: raise cap or wait',
            'budget-hard-stop')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  END IF;
  IF NEW.breaker_tripped AND NOT OLD.breaker_tripped THEN
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, dedup_key)
    VALUES ('critical', 'cost', 'Spend velocity breaker tripped',
            'kernel task intake',
            'hourly spend exceeded ' || NEW.velocity_cap_eur_per_hour || ' EUR/h',
            'Inspect runaway agents on /live; breaker reset is a CEO action',
            'budget-breaker')
    ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
    DO NOTHING;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_alert_budget_stop ON public.budget_state;
CREATE TRIGGER trg_alert_budget_stop
  AFTER UPDATE ON public.budget_state
  FOR EACH ROW EXECUTE FUNCTION public.fn_alert_on_budget_stop();

-- ── 3d. fn_model_fallback refit (ROUTING §9: ≥2 hops High; §17: exhausted
--        Critical). Body unchanged from 20260713040000 except alert inserts. ─
CREATE OR REPLACE FUNCTION fn_model_fallback(
  p_failed_model text,
  p_role_slot    text,
  p_reason       text    DEFAULT NULL,
  p_run_id       uuid    DEFAULT NULL,
  p_log          boolean DEFAULT true
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_cur text := p_failed_model;
  v_next record;
  v_depth int := 0;
  v_skipped jsonb := '[]'::jsonb;
  v_decision_id bigint;
BEGIN
  IF NOT (p_role_slot = ANY (fn_routing_slots())) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown role_slot ' || p_role_slot);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM model_catalog WHERE id = p_failed_model) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown model ' || p_failed_model);
  END IF;

  LOOP
    v_depth := v_depth + 1;
    EXIT WHEN v_depth > 4;  -- spec §12: fn-level depth ≤4

    SELECT m.id, m.status, m.banned, m.mechanical_only INTO v_next
      FROM model_catalog f
      JOIN model_catalog m ON m.id = f.fallback_of
     WHERE f.id = v_cur;
    EXIT WHEN NOT FOUND;

    IF v_next.status = 'active' AND NOT v_next.banned
       AND (NOT v_next.mechanical_only
            OR p_role_slot = ANY (fn_routing_mechanical_slots())) THEN
      IF p_log THEN
        INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                                  alternatives, outcome)
        VALUES (p_run_id, 'orchestrator', 'routing_fallback',
                'slot=' || p_role_slot || '; ' || p_failed_model || ' → ' || v_next.id
                || COALESCE('; reason=' || p_reason, ''),
                v_skipped, 'selected')
        RETURNING id INTO v_decision_id;
      END IF;
      -- ROUTING §9: two consecutive falls (selected model ≥2 hops away) → High
      IF v_depth >= 2 THEN
        INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                            suggested_action, run_id, dedup_key, source_ref)
        VALUES ('high', 'routing',
                'Model fallback depth ' || v_depth || ' on slot ' || p_role_slot,
                'slot ' || p_role_slot,
                p_failed_model || ' unavailable'
                || COALESCE('; reason=' || p_reason, ''),
                'Check provider health on /ai/models; consider re-routing the slot',
                p_run_id, 'fallback-' || p_role_slot,
                jsonb_build_object('table', 'decision_log', 'id', v_decision_id))
        ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
        DO NOTHING;
      END IF;
      RETURN jsonb_build_object('ok', true, 'model_id', v_next.id,
        'decision_id', v_decision_id, 'skipped', v_skipped);
    END IF;

    v_skipped := v_skipped || jsonb_build_object('model_id', v_next.id,
      'reason', CASE WHEN v_next.status <> 'active' THEN 'status ' || v_next.status
                     WHEN v_next.banned THEN 'banned'
                     ELSE 'mechanical_only on verdict-capable slot' END);
    v_cur := v_next.id;
  END LOOP;

  IF p_log THEN
    INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                              alternatives, outcome)
    VALUES (p_run_id, 'orchestrator', 'routing_fallback',
            'slot=' || p_role_slot || '; chain from ' || p_failed_model || ' exhausted'
            || COALESCE('; reason=' || p_reason, ''),
            v_skipped, 'blocked_no_model')
    RETURNING id INTO v_decision_id;
  END IF;
  -- ROUTING §17: exhausted chain = operational failure → Critical
  INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                      suggested_action, run_id, dedup_key, source_ref)
  VALUES ('critical', 'routing',
          'Model fallback chain exhausted on slot ' || p_role_slot,
          'slot ' || p_role_slot,
          'no active, permitted model reachable from ' || p_failed_model
          || COALESCE('; reason=' || p_reason, ''),
          'Task class is blocked_no_model — onboard or re-activate a model on /ai/models',
          p_run_id, 'chain-exhausted-' || p_role_slot,
          jsonb_build_object('table', 'decision_log', 'id', v_decision_id))
  ON CONFLICT (dedup_key) WHERE resolved_at IS NULL AND dedup_key IS NOT NULL
  DO NOTHING;
  RETURN jsonb_build_object('ok', false, 'error', 'CHAIN_EXHAUSTED',
    'decision_id', v_decision_id, 'skipped', v_skipped);
END $$;

-- ── 3e. control_audit_mark_reviewed refit (ticket interp 5) ─────────────────
-- reviewed_flagged now INSERTs an alerts row; the alerts trigger is the ONE
-- broadcast producer (AUDIT §9 wording preserved: flagged review → alert.raised).
CREATE OR REPLACE FUNCTION public.control_audit_mark_reviewed(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor    text;
  v_digest   text;
  v_prev     record;
  v_id       bigint;
  v_status   text;
  v_note     text;
  v_fc       record;
  v_task     uuid;
  v_audit_id bigint;
  v_alert_id uuid;
  v_resp     jsonb;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  v_digest := md5('mark_reviewed|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_id     := (p_payload->>'file_change_id')::bigint;
  v_status := p_payload->>'status';
  v_note   := left(p_payload->>'note', 500);
  IF v_id IS NULL OR v_status NOT IN ('reviewed_ok', 'reviewed_flagged') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'file_change_id + status(reviewed_ok|reviewed_flagged) required');
  END IF;

  SELECT id, path, run_id, review_status INTO v_fc
    FROM file_changes WHERE id = v_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'file_change ' || v_id || ' not found');
  END IF;

  UPDATE file_changes SET review_status = v_status WHERE id = v_id;

  -- Canonical §4 detail_ref shape — new writers use it from this row on.
  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'audit.mark_reviewed',
          jsonb_build_object('file_change_id', v_id, 'path', v_fc.path,
            'old_status', v_fc.review_status, 'new_status', v_status,
            'note', v_note),
          jsonb_build_object('table', 'file_changes', 'id', v_id))
  RETURNING id INTO v_audit_id;

  -- §9: reviewed_flagged is the ONLY log write that raises an alert (E8.4b:
  -- alerts row; trg_alerts_broadcast emits alert.raised — single producer).
  IF v_status = 'reviewed_flagged' THEN
    SELECT r.task_id INTO v_task FROM agent_runs r WHERE r.id = v_fc.run_id;
    INSERT INTO alerts (level, source, title, affected_area, probable_cause,
                        suggested_action, run_id, task_id, source_ref)
    VALUES ('attention', 'file_review',
            'File change flagged in review: ' || v_fc.path,
            v_fc.path, v_note,
            'Inspect the flagged change; revert via its commit if wrong',
            v_fc.run_id, v_task,
            jsonb_build_object('table', 'file_changes', 'id', v_id))
    RETURNING id INTO v_alert_id;
  END IF;

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit_id,
    'review_status', v_status, 'alert_id', v_alert_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

-- ── 4. settings keys (OBSERVABILITY §6: thresholds live in settings) ────────
INSERT INTO settings_registry (key, category, value_schema, risk,
  description_en, description_tr, scope_types)
VALUES
  ('alerts.queue_age_max_minutes', 'global_os',
   '{"type":"number","minimum":1}', 'low',
   'A queued task older than this many minutes raises an attention alert',
   'Bu dakikadan eski kuyruk görevi attention alarmı üretir', '{global}'),
  ('alerts.heartbeat_max_seconds', 'global_os',
   '{"type":"number","minimum":30}', 'low',
   'Newest health snapshot older than this many seconds raises a high alert (heartbeat loss)',
   'En yeni sağlık anlık görüntüsü bu saniyeden eskiyse high alarm üretir (heartbeat kaybı)', '{global}'),
  ('alerts.escalate_after_minutes', 'global_os',
   '{"type":"object"}', 'low',
   'Per-level acknowledge deadlines in minutes; unacknowledged alerts escalate one level',
   'Seviye başına acknowledge süresi (dakika); süresi geçen alarm bir seviye yükselir', '{global}')
ON CONFLICT (key) DO NOTHING;

INSERT INTO settings_values (key, scope, value, updated_by)
VALUES
  ('alerts.queue_age_max_minutes', 'global', '30'::jsonb, 'system'),
  ('alerts.heartbeat_max_seconds', 'global', '300'::jsonb, 'system'),
  ('alerts.escalate_after_minutes', 'global',
   '{"attention":240,"high":60,"critical":15}'::jsonb, 'system')
ON CONFLICT (key, scope) DO NOTHING;

-- ── 5. fn_alerts_evaluate — time-based checks (queue age, heartbeat,
--       escalation sweep). Phase-7 pg-boss 'alert-evaluate' adopts (R3). ─────
CREATE OR REPLACE FUNCTION public.fn_alerts_evaluate()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

REVOKE ALL ON FUNCTION public.fn_alerts_evaluate() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fn_alerts_evaluate() TO service_role;

-- ── 6. control_alerts_action (API_CONTRACTS `control_alerts_*`; OBS §8/§13) ─
-- Payload: {"op":"ack"|"resolve"|"assign"|"mute", "alert_id":uuid,
--           "note"?, "mitigation"?, "employee_id"?, "minutes"?}
CREATE OR REPLACE FUNCTION public.control_alerts_action(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor    text;
  v_digest   text;
  v_prev     record;
  v_op       text;
  v_id       uuid;
  v_alert    record;
  v_note     text;
  v_minutes  int;
  v_emp      uuid;
  v_audit_id bigint;
  v_resp     jsonb;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  v_digest := md5('alerts|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_op := p_payload->>'op';
  v_id := (p_payload->>'alert_id')::uuid;
  IF v_op IS NULL OR v_id IS NULL
     OR v_op NOT IN ('ack', 'resolve', 'assign', 'mute') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'op(ack|resolve|assign|mute) + alert_id required');
  END IF;

  SELECT * INTO v_alert FROM alerts WHERE id = v_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'alert ' || v_id || ' not found');
  END IF;
  IF v_alert.resolved_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'alert already resolved');
  END IF;

  v_note := left(p_payload->>'note', 500);

  IF v_op = 'ack' THEN
    IF v_alert.acknowledged_at IS NOT NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'alert already acknowledged');
    END IF;
    UPDATE alerts SET acknowledged_at = now(),
                      ceo_action = COALESCE(v_note, ceo_action)
     WHERE id = v_id;

  ELSIF v_op = 'resolve' THEN
    UPDATE alerts SET resolved_at = now(),
                      acknowledged_at = COALESCE(acknowledged_at, now()),
                      mitigation = left(p_payload->>'mitigation', 500),
                      ceo_action = COALESCE(v_note, ceo_action)
     WHERE id = v_id;

  ELSIF v_op = 'assign' THEN
    v_emp := (p_payload->>'employee_id')::uuid;
    IF v_emp IS NULL OR NOT EXISTS (SELECT 1 FROM agents WHERE id = v_emp) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'employee_id must reference an existing agent');
    END IF;
    UPDATE alerts SET responsible_employee = v_emp WHERE id = v_id;

  ELSIF v_op = 'mute' THEN
    v_minutes := COALESCE((p_payload->>'minutes')::int, 60);
    IF v_minutes < 1 OR v_minutes > 10080 THEN  -- ≤7 days
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'minutes must be 1..10080');
    END IF;
    UPDATE alerts SET muted_until = now() + make_interval(mins => v_minutes)
     WHERE id = v_id;
  END IF;

  -- Roadmap acceptance: ack → audit satırı (canonical detail_ref).
  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref, task_id)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'alert.' || v_op,
          jsonb_build_object('alert_id', v_id, 'level', v_alert.level,
            'title', v_alert.title, 'source', v_alert.source,
            'note', v_note) || CASE WHEN v_op = 'mute'
              THEN jsonb_build_object('minutes', v_minutes)
              WHEN v_op = 'assign'
              THEN jsonb_build_object('employee_id', v_emp)
              ELSE '{}'::jsonb END,
          jsonb_build_object('table', 'alerts', 'id', v_id),
          v_alert.task_id)
  RETURNING id INTO v_audit_id;

  v_resp := jsonb_build_object('ok', true, 'op', v_op, 'alert_id', v_id,
    'audit_id', v_audit_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.control_alerts_action(jsonb, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.control_alerts_action(jsonb, text)
  TO authenticated, service_role;

-- ── 7. v_alerts_active (CC-SPEC §4: alerts ∪ pending critical approvals) ────
DROP VIEW IF EXISTS public.v_alerts_active;
CREATE VIEW public.v_alerts_active
WITH (security_invoker = true) AS
SELECT * FROM (
  SELECT 'alert'::text AS kind, a.id::text AS id, a.level, a.title, a.source,
         a.at, a.acknowledged_at, a.responsible_employee, ag.slug AS responsible_slug,
         a.affected_area, a.escalated_at, a.run_id, a.task_id, a.source_ref,
         CASE a.level WHEN 'emergency' THEN 0 WHEN 'critical' THEN 1
                      WHEN 'high' THEN 2 WHEN 'attention' THEN 3 ELSE 4 END AS severity_rank
    FROM alerts a
    LEFT JOIN agents ag ON ag.id = a.responsible_employee
   WHERE a.resolved_at IS NULL
     AND (a.muted_until IS NULL OR a.muted_until < now())
  UNION ALL
  SELECT 'approval', p.id::text, 'critical', COALESCE(p.payload->>'title', p.action_type),
         'approval', p.created_at, NULL, NULL, NULL,
         p.action_type, NULL, NULL, p.task_id,
         jsonb_build_object('table', 'approvals', 'id', p.id), 1
    FROM approvals p
   WHERE p.status = 'pending' AND p.risk_class = 'critical'
) u
ORDER BY u.severity_rank, (u.acknowledged_at IS NOT NULL), u.at;

GRANT SELECT ON public.v_alerts_active TO authenticated;
REVOKE ALL ON public.v_alerts_active FROM anon;

-- ── 8. v_audit_trail + alerts family branch (additive) ──────────────────────
DROP VIEW IF EXISTS public.v_audit_trail;
CREATE VIEW public.v_audit_trail
WITH (security_invoker = true) AS
WITH base AS (
  SELECT
    a.id, a.actor, a.actor_type, a.action, a.task_id, a.payload, a.created_at,
    CASE
      WHEN a.detail_ref ? 'table'                  THEN a.detail_ref->>'table'
      WHEN a.detail_ref ? 'settings_change_log_id' THEN 'settings_change_log'
      WHEN a.detail_ref ? 'routing_rule_id'        THEN 'routing_rules'
      WHEN a.detail_ref ? 'revenue_ledger_id'      THEN 'revenue_ledger'
      WHEN a.detail_ref ? 'library_change_log_id'  THEN 'library_change_log'
      WHEN a.detail_ref ? 'decision_log_id'        THEN 'decision_log'
      WHEN a.detail_ref ? 'file_change_id'         THEN 'file_changes'
    END AS ref_table,
    COALESCE(
      a.detail_ref->>'id',
      a.detail_ref->>'settings_change_log_id',
      a.detail_ref->>'routing_rule_id',
      a.detail_ref->>'revenue_ledger_id',
      a.detail_ref->>'library_change_log_id',
      a.detail_ref->>'decision_log_id',
      a.detail_ref->>'file_change_id'
    ) AS ref_id
  FROM audit_log a
)
SELECT
  b.*,
  CASE
    WHEN b.ref_table = 'decision_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'decided_by', d.decided_by, 'decision', left(d.decision, 300),
         'rationale', left(d.rationale, 300), 'risk', d.risk,
         'confidence', d.confidence, 'outcome', d.outcome,
         'run_id', d.run_id, 'approval_id', d.approval_id)
       FROM decision_log d WHERE d.id = b.ref_id::bigint)
    WHEN b.ref_table = 'settings_change_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'key', s.key, 'scope', s.scope, 'old_value', s.old_value,
         'new_value', s.new_value, 'changed_by', s.changed_by,
         'change_source', s.change_source, 'undo_of', s.undo_of)
       FROM settings_change_log s WHERE s.id = b.ref_id::bigint)
    WHEN b.ref_table = 'library_change_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'item_id', l.item_id, 'changed_by', l.changed_by,
         'change', l.change, 'changed_at', l.changed_at)
       FROM library_change_log l WHERE l.id = b.ref_id::bigint)
    WHEN b.ref_table = 'file_changes' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT jsonb_build_object(
         'path', f.path, 'op', f.op, 'diff_summary', left(f.diff_summary, 300),
         'commit_sha', f.commit_sha, 'review_status', f.review_status,
         'reverted_by', f.reverted_by, 'run_id', f.run_id)
       FROM file_changes f WHERE f.id = b.ref_id::bigint)
    WHEN b.ref_table = 'routing_rules' THEN
      (SELECT jsonb_build_object(
         'role_slot', r.role_slot, 'model_id', r.model_id,
         'department_id', r.department_id, 'priority', r.priority,
         'enabled', r.enabled, 'updated_at', r.updated_at)
       FROM routing_rules r WHERE r.id::text = b.ref_id)
    WHEN b.ref_table = 'revenue_ledger' THEN
      (SELECT jsonb_build_object(
         'occurred_on', v.occurred_on, 'engine', v.engine,
         'department', v.department, 'client', v.client,
         'amount_eur', v.amount_eur, 'source', v.source)
       FROM revenue_ledger v WHERE v.id::text = b.ref_id)
    WHEN b.ref_table = 'alerts' THEN
      (SELECT jsonb_build_object(
         'level', al.level, 'title', left(al.title, 300),
         'source', al.source, 'affected_area', al.affected_area,
         'acknowledged_at', al.acknowledged_at, 'resolved_at', al.resolved_at,
         'responsible_employee', al.responsible_employee,
         'escalated_from', al.escalated_from)
       FROM alerts al WHERE al.id::text = b.ref_id)
  END AS ref_summary,
  CASE
    WHEN b.ref_table = 'decision_log' AND b.ref_id ~ '^[0-9]+$' THEN
      (SELECT d.risk FROM decision_log d WHERE d.id = b.ref_id::bigint)
  END AS ref_risk
FROM base b;

GRANT SELECT ON public.v_audit_trail TO authenticated;
REVOKE ALL ON public.v_audit_trail FROM anon;

COMMIT;

-- ROLLBACK PLAN:
--   DROP VIEW IF EXISTS public.v_alerts_active;
--   DROP FUNCTION IF EXISTS public.control_alerts_action(jsonb, text);
--   DROP FUNCTION IF EXISTS public.fn_alerts_evaluate();
--   DROP TRIGGER IF EXISTS trg_alert_budget_stop ON public.budget_state;
--   DROP TRIGGER IF EXISTS trg_alert_cost_threshold ON public.cost_ledger;
--   DROP TRIGGER IF EXISTS trg_alert_run_failed ON public.agent_runs;
--   DROP TRIGGER IF EXISTS trg_alerts_broadcast ON public.alerts;
--   DROP FUNCTION IF EXISTS public.fn_alert_on_budget_stop();
--   DROP FUNCTION IF EXISTS public.fn_alert_on_cost_threshold();
--   DROP FUNCTION IF EXISTS public.fn_alert_on_run_failed();
--   DROP FUNCTION IF EXISTS public.fn_alerts_broadcast();
--   re-apply 20260713070000 §2 (v_audit_trail) + §4 (mark_reviewed) and
--   20260713040000 §5 (fn_model_fallback) to restore pre-E8.4b bodies;
--   DROP TABLE IF EXISTS public.system_health_snapshots;
--   DROP TABLE IF EXISTS public.alerts;  -- observation family: only as full
--   E8.4b rollback; alerts rows are otherwise kept (§22 SİLİNMEZ).
