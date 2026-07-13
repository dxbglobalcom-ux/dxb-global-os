-- E9.1 — Workflow engine control surface (WORKFLOW_ENGINE_SPEC).
-- Tables are LIVE since 20260711002300 (0023x family, incl. steps_snapshot).
-- This migration adds:
--   1. control_workflow_action — API_CONTRACTS 8b `workflows` row: create /
--      update / copy / enable / disable / run_now / cancel_run / resume_run.
--      §13 authz wall (CRUD = CEO only; run_now/resume_run = CEO or system),
--      idempotency (0025x control_idempotency), audit rows with canonical
--      detail_ref, §10 versioning (update bumps version; run_now FREEZES
--      steps_snapshot), §16 B7b guard (high/critical workflow with an
--      outbox-bound agent step and no earlier approval step = REJECTED),
--      §25 singleton concurrency (active run → logged + skipped).
--   2. broadcast_opslive_workflow_runs — spec §9: run.* envelopes on ops:live
--      with entity kind 'workflow_run' and corr.workflow_run_id (E8.3 idiom,
--      §15 log+continue: a broadcast error never breaks the write).
--
-- ROLLBACK (spec §23): DROP TRIGGER trg_broadcast_opslive_workflow_runs ON
-- workflow_runs; DROP FUNCTION broadcast_opslive_workflow_runs,
-- control_workflow_action. Tables stay (0023x family owns them); existing
-- code-defined pg-boss jobs keep living — the engine layer detaches cleanly.

-- ── 1. control_workflow_action ──────────────────────────────────────────────
-- Payload: {"action": "create"|"update"|"copy"|"enable"|"disable"|"run_now"
--                     |"cancel_run"|"resume_run", ...}
--   create:    {slug,name,trigger:{kind:'cron'|'event'|'manual',...},
--               steps:[{kind,config},...], owner_employee_id?, budget_eur?,
--               token_limit?, timeout_s?, risk?, logging_level?,
--               output_standard?}
--   update:    {slug|workflow_id, name?, trigger?, steps?, budget_eur?,
--               token_limit?, timeout_s?, risk?, logging_level?,
--               output_standard?, owner_employee_id?}   → version + 1
--   copy:      {slug}                     → '<slug>-copy-n', enabled=false
--   enable / disable: {slug|workflow_id}
--   run_now:   {slug|workflow_id, triggered_by?}        → run_id | skipped
--   cancel_run / resume_run: {run_id}
CREATE OR REPLACE FUNCTION public.control_workflow_action(
  p_payload         jsonb,
  p_idempotency_key text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor    text;
  v_digest   text;
  v_prev     record;
  v_action   text;
  v_wf       record;
  v_run      record;
  v_steps    jsonb;
  v_step     jsonb;
  v_kind     text;
  v_cfg      jsonb;
  v_emp      record;
  v_i        int;
  v_seq      int;
  v_slug     text;
  v_new_slug text;
  v_n        int;
  v_wf_id    uuid;
  v_run_id   uuid;
  v_version  int;
  v_risk     text;
  v_snapshot jsonb;
  v_audit_id bigint;
  v_resp     jsonb;
  v_approval_seen boolean;
  v_key      text;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  -- The API seam sends absent fields as json null; presence checks (?) and
  -- COALESCE(->) must treat those as "not sent" — strip them once here.
  -- Digest is taken AFTER the strip so {a:1,b:null} and {a:1} replay equal.
  p_payload := jsonb_strip_nulls(p_payload);

  v_digest := md5('workflows|' || p_payload::text);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  v_action := p_payload->>'action';
  IF v_action IS NULL OR v_action NOT IN
     ('create','update','copy','enable','disable','run_now','cancel_run','resume_run') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'action must be create|update|copy|enable|disable|run_now|cancel_run|resume_run');
  END IF;

  -- §13: workflow definitions are CEO-only; system (cron/event/scheduler)
  -- may only fire runs and resume parked ones. Agents reach neither: the
  -- gateway profiles carry no workflow write fn and anon/authenticated get
  -- no direct table writes.
  IF v_action NOT IN ('run_now','resume_run') AND v_actor <> 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'workflow ' || v_action || ' is CEO-only');
  END IF;

  -- ── resolve target workflow for actions that address one ────────────────
  IF v_action IN ('update','copy','enable','disable','run_now') THEN
    v_slug  := p_payload->>'slug';
    v_wf_id := (p_payload->>'workflow_id')::uuid;
    SELECT * INTO v_wf FROM workflows w
     WHERE (v_slug IS NOT NULL AND w.slug = v_slug)
        OR (v_wf_id IS NOT NULL AND w.id = v_wf_id);
    IF NOT FOUND THEN
      IF v_action <> 'create' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'workflow not found (slug/workflow_id)');
      END IF;
    END IF;
  END IF;

  -- ── create / update: validate definition ────────────────────────────────
  IF v_action IN ('create','update') THEN
    v_steps := p_payload->'steps';
    -- (two-branch assign: plpgsql binds EVERY variable in an expression, so a
    -- v_wf.risk reference would error on the create path where v_wf is unset)
    IF v_action = 'update' THEN
      v_risk := COALESCE(p_payload->>'risk', v_wf.risk);
    ELSE
      v_risk := COALESCE(p_payload->>'risk', 'low');
    END IF;
    IF v_risk NOT IN ('low','medium','high','critical') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'risk must be low|medium|high|critical');
    END IF;
    IF p_payload ? 'logging_level' AND p_payload->>'logging_level' NOT IN
       ('minimal','normal','verbose') THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'logging_level must be minimal|normal|verbose');
    END IF;
    IF p_payload ? 'trigger' THEN
      IF p_payload->'trigger'->>'kind' NOT IN ('cron','event','manual') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'trigger.kind must be cron|event|manual');
      END IF;
      IF p_payload->'trigger'->>'kind' = 'cron'
         AND COALESCE(p_payload->'trigger'->>'cron','') = '' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'cron trigger needs trigger.cron');
      END IF;
      IF p_payload->'trigger'->>'kind' = 'event'
         AND (p_payload->'trigger'->'match' IS NULL
              OR jsonb_typeof(p_payload->'trigger'->'match') <> 'object') THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'event trigger needs trigger.match object');
      END IF;
    END IF;

    -- steps: required on create, optional (full replacement) on update
    IF v_action = 'create' OR v_steps IS NOT NULL THEN
      IF v_steps IS NULL OR jsonb_typeof(v_steps) <> 'array'
         OR jsonb_array_length(v_steps) = 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'steps must be a non-empty array');
      END IF;

      v_approval_seen := false;
      FOR v_i IN 0 .. jsonb_array_length(v_steps) - 1 LOOP
        v_step := v_steps->v_i;
        v_kind := v_step->>'kind';
        v_cfg  := COALESCE(v_step->'config', '{}'::jsonb);
        v_seq  := v_i + 1;
        IF v_kind IS NULL OR v_kind NOT IN ('agent','approval','review','retry','fallback') THEN
          RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
            'detail', 'step ' || v_seq || ': kind must be agent|approval|review|retry|fallback');
        END IF;

        -- §16: no secret may have a field to live in (config key scan; the
        -- TS Zod .strict() schemas are the primary wall, this is the DB copy).
        FOR v_key IN SELECT jsonb_object_keys(v_cfg) LOOP
          IF v_key ~* '(secret|password|api_key|credential)' THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ': config may not carry credential fields (' || v_key || ')');
          END IF;
        END LOOP;

        IF v_kind IN ('agent','review') THEN
          IF (v_cfg->>'employee_id') IS NULL THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (' || v_kind || '): employee_id required');
          END IF;
          -- HR gate (spec §2 "aktif + persona v2 kapısı fn'de denetlenir"):
          -- archived employees and pre-v2 personas cannot be assigned.
          SELECT id, employment_status, persona_version INTO v_emp
            FROM agents WHERE id = (v_cfg->>'employee_id')::uuid;
          IF NOT FOUND THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ': employee does not exist');
          END IF;
          IF v_emp.employment_status = 'archived'
             OR COALESCE(v_emp.persona_version, '') NOT LIKE 'v2%' THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ': employee must be non-archived with persona v2');
          END IF;
          IF v_kind = 'agent' AND COALESCE(v_cfg->>'objective','') = '' THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (agent): objective required');
          END IF;
          IF v_kind = 'agent' AND COALESCE(v_cfg->>'model_role_slot','') = ''
             AND COALESCE(v_cfg->>'model_id','') = '' THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (agent): model_role_slot (default) or model_id required');
          END IF;
          IF v_kind = 'review' AND COALESCE(v_cfg->>'criteria','') = '' THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (review): criteria required');
          END IF;
        ELSIF v_kind = 'approval' THEN
          IF COALESCE(v_cfg->>'action_type','') = '' OR COALESCE(v_cfg->>'summary','') = '' THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (approval): action_type + summary required');
          END IF;
          v_approval_seen := true;
        ELSIF v_kind = 'retry' THEN
          IF v_seq = 1 THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step 1 cannot be retry (no previous step)');
          END IF;
          IF COALESCE((v_cfg->>'max_attempts')::int, 0) NOT BETWEEN 1 AND 10 THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (retry): max_attempts must be 1..10');
          END IF;
        ELSIF v_kind = 'fallback' THEN
          IF v_cfg->'alternate_steps' IS NULL
             OR jsonb_typeof(v_cfg->'alternate_steps') <> 'array'
             OR jsonb_array_length(v_cfg->'alternate_steps') = 0 THEN
            RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
              'detail', 'step ' || v_seq || ' (fallback): alternate_steps non-empty array required');
          END IF;
        END IF;

        -- §16 B7b: an outbox-bound agent step in a high/critical workflow
        -- must sit BEHIND an approval step — otherwise the definition is
        -- rejected at write time (money-out can never enter a workflow
        -- without a human gate in front of it).
        IF v_kind = 'agent' AND v_cfg ? 'outbox_action'
           AND v_risk IN ('high','critical') AND NOT v_approval_seen THEN
          RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
            'detail', 'B7b: step ' || v_seq || ' carries outbox_action ('
              || (v_cfg->>'outbox_action') || ') with no approval step before it — '
              || 'high/critical workflows must gate outward actions');
        END IF;
      END LOOP;
    END IF;

    -- B7b must also hold when an UPDATE raises risk WITHOUT resending steps:
    -- the existing step set is re-scanned against the new risk.
    IF v_action = 'update' AND v_steps IS NULL AND v_risk IN ('high','critical') THEN
      v_approval_seen := false;
      FOR v_step IN
        SELECT jsonb_build_object('kind', kind, 'config', config, 'seq', seq)
          FROM workflow_steps WHERE workflow_id = v_wf.id ORDER BY seq
      LOOP
        IF v_step->>'kind' = 'approval' THEN
          v_approval_seen := true;
        ELSIF v_step->>'kind' = 'agent' AND (v_step->'config') ? 'outbox_action'
              AND NOT v_approval_seen THEN
          RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
            'detail', 'B7b: existing step ' || (v_step->>'seq') || ' carries outbox_action '
              || 'with no approval step before it — cannot raise risk to ' || v_risk);
        END IF;
      END LOOP;
    END IF;
  END IF;

  -- ── execute ──────────────────────────────────────────────────────────────
  IF v_action = 'create' THEN
    v_slug := p_payload->>'slug';
    IF v_slug IS NULL OR v_slug !~ '^[a-z0-9][a-z0-9-]{1,62}$' THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'slug must be kebab-case (^[a-z0-9][a-z0-9-]{1,62}$)');
    END IF;
    IF EXISTS (SELECT 1 FROM workflows WHERE slug = v_slug) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'slug already exists');
    END IF;
    IF COALESCE(p_payload->>'name','') = '' OR p_payload->'trigger' IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'name + trigger required');
    END IF;

    INSERT INTO workflows (slug, name, owner_employee_id, trigger, enabled,
                           budget_eur, token_limit, timeout_s, risk,
                           logging_level, output_standard, version)
    VALUES (v_slug, p_payload->>'name',
            (p_payload->>'owner_employee_id')::uuid,
            p_payload->'trigger',
            COALESCE((p_payload->>'enabled')::boolean, true),
            (p_payload->>'budget_eur')::numeric,
            (p_payload->>'token_limit')::bigint,
            (p_payload->>'timeout_s')::int,
            v_risk,
            COALESCE(p_payload->>'logging_level', 'normal'),
            p_payload->>'output_standard', 1)
    RETURNING id INTO v_wf_id;

    FOR v_i IN 0 .. jsonb_array_length(v_steps) - 1 LOOP
      INSERT INTO workflow_steps (workflow_id, seq, kind, config)
      VALUES (v_wf_id, v_i + 1, v_steps->v_i->>'kind',
              COALESCE(v_steps->v_i->'config', '{}'::jsonb));
    END LOOP;
    v_version := 1;

  ELSIF v_action = 'update' THEN
    UPDATE workflows SET
      name              = COALESCE(p_payload->>'name', name),
      trigger           = COALESCE(p_payload->'trigger', trigger),
      owner_employee_id = CASE WHEN p_payload ? 'owner_employee_id'
                            THEN (p_payload->>'owner_employee_id')::uuid
                            ELSE owner_employee_id END,
      budget_eur        = CASE WHEN p_payload ? 'budget_eur'
                            THEN (p_payload->>'budget_eur')::numeric ELSE budget_eur END,
      token_limit       = CASE WHEN p_payload ? 'token_limit'
                            THEN (p_payload->>'token_limit')::bigint ELSE token_limit END,
      timeout_s         = CASE WHEN p_payload ? 'timeout_s'
                            THEN (p_payload->>'timeout_s')::int ELSE timeout_s END,
      risk              = v_risk,
      logging_level     = COALESCE(p_payload->>'logging_level', logging_level),
      output_standard   = COALESCE(p_payload->>'output_standard', output_standard),
      version           = version + 1
    WHERE id = v_wf.id
    RETURNING id, version INTO v_wf_id, v_version;

    IF v_steps IS NOT NULL THEN
      DELETE FROM workflow_steps WHERE workflow_id = v_wf.id;
      FOR v_i IN 0 .. jsonb_array_length(v_steps) - 1 LOOP
        INSERT INTO workflow_steps (workflow_id, seq, kind, config)
        VALUES (v_wf.id, v_i + 1, v_steps->v_i->>'kind',
                COALESCE(v_steps->v_i->'config', '{}'::jsonb));
      END LOOP;
    END IF;

  ELSIF v_action = 'copy' THEN
    v_n := 1;
    LOOP
      v_new_slug := v_wf.slug || '-copy-' || v_n;
      EXIT WHEN NOT EXISTS (SELECT 1 FROM workflows WHERE slug = v_new_slug);
      v_n := v_n + 1;
    END LOOP;
    -- §8: copies start DISABLED — no accidental double cron.
    INSERT INTO workflows (slug, name, owner_employee_id, trigger, enabled,
                           budget_eur, token_limit, timeout_s, risk,
                           logging_level, output_standard, version)
    SELECT v_new_slug, v_wf.name || ' (copy)', owner_employee_id, trigger,
           false, budget_eur, token_limit, timeout_s, risk, logging_level,
           output_standard, 1
      FROM workflows WHERE id = v_wf.id
    RETURNING id INTO v_wf_id;
    INSERT INTO workflow_steps (workflow_id, seq, kind, config)
    SELECT v_wf_id, seq, kind, config FROM workflow_steps
     WHERE workflow_id = v_wf.id;
    v_version := 1;
    v_slug := v_new_slug;

  ELSIF v_action IN ('enable','disable') THEN
    UPDATE workflows SET enabled = (v_action = 'enable')
     WHERE id = v_wf.id RETURNING id, version INTO v_wf_id, v_version;

  ELSIF v_action = 'run_now' THEN
    v_wf_id := v_wf.id;
    -- §25 edge: trigger on a disabled workflow → skip, note in the ledger
    -- (audit row below; task_events needs a task row, which does not exist).
    IF NOT v_wf.enabled THEN
      v_resp := jsonb_build_object('ok', true, 'action', v_action,
        'workflow_id', v_wf_id, 'skipped', true, 'reason', 'disabled');
    -- §26 singleton default: a run in flight → logged + skipped
    -- ('queue' is opt-in via trigger.concurrency and lands with the P7 worker).
    ELSIF COALESCE(v_wf.trigger->>'concurrency','singleton') <> 'queue'
       AND EXISTS (SELECT 1 FROM workflow_runs
                    WHERE workflow_id = v_wf.id
                      AND status IN ('running','waiting_approval')) THEN
      v_resp := jsonb_build_object('ok', true, 'action', v_action,
        'workflow_id', v_wf_id, 'skipped', true, 'reason', 'singleton');
    ELSE
      -- §10: the step set is FROZEN into the run — editing a workflow never
      -- changes a run already in flight.
      SELECT jsonb_agg(jsonb_build_object('seq', seq, 'kind', kind, 'config', config)
                       ORDER BY seq)
        INTO v_snapshot FROM workflow_steps WHERE workflow_id = v_wf.id;
      IF v_snapshot IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
          'detail', 'workflow has no steps');
      END IF;
      INSERT INTO workflow_runs (workflow_id, status, triggered_by,
                                 current_step, steps_snapshot)
      VALUES (v_wf.id, 'running',
              COALESCE(p_payload->>'triggered_by', v_actor), NULL, v_snapshot)
      RETURNING id INTO v_run_id;
      v_resp := jsonb_build_object('ok', true, 'action', v_action,
        'workflow_id', v_wf_id, 'run_id', v_run_id);
    END IF;

  ELSIF v_action IN ('cancel_run','resume_run') THEN
    v_run_id := (p_payload->>'run_id')::uuid;
    IF v_run_id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'run_id required');
    END IF;
    IF v_action = 'cancel_run' THEN
      UPDATE workflow_runs SET status = 'cancelled', ended_at = now()
       WHERE id = v_run_id AND status IN ('running','waiting_approval')
       RETURNING id, workflow_id INTO v_run;
    ELSE
      -- CEO/system resume of a PARKED run; the kernel drain continues from
      -- current_step + 1 (§10 resume semantics).
      UPDATE workflow_runs SET status = 'running'
       WHERE id = v_run_id AND status = 'waiting_approval'
       RETURNING id, workflow_id INTO v_run;
    END IF;
    IF v_run.id IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', v_action || ': run not found or not in a compatible status');
    END IF;
    v_wf_id := v_run.workflow_id;
  END IF;

  -- ── audit (API_CONTRACTS §14: every B-class call writes its own row) ─────
  IF v_slug IS NULL AND v_wf_id IS NOT NULL THEN
    SELECT slug INTO v_slug FROM workflows WHERE id = v_wf_id;
  END IF;
  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          CASE WHEN v_resp ? 'skipped' THEN 'workflow.run_skipped'
               ELSE 'workflow.' || v_action END,
          jsonb_build_object('workflow_id', v_wf_id, 'run_id', v_run_id,
            'slug', v_slug, 'version', v_version)
            || CASE WHEN v_resp ? 'skipped'
                 THEN jsonb_build_object('reason', v_resp->>'reason') ELSE '{}'::jsonb END,
          CASE WHEN v_run_id IS NOT NULL
               THEN jsonb_build_object('table', 'workflow_runs', 'id', v_run_id)
               ELSE jsonb_build_object('table', 'workflows', 'id', v_wf_id) END)
  RETURNING id INTO v_audit_id;

  v_resp := COALESCE(v_resp, jsonb_build_object('ok', true, 'action', v_action,
    'workflow_id', v_wf_id, 'version', v_version))
    || jsonb_build_object('audit_id', v_audit_id);
  IF v_run_id IS NOT NULL AND NOT v_resp ? 'run_id' THEN
    v_resp := v_resp || jsonb_build_object('run_id', v_run_id);
  END IF;

  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.control_workflow_action(jsonb, text)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.control_workflow_action(jsonb, text)
  TO authenticated, service_role;

-- ── 2. workflow_runs → ops:live run.* (spec §9; E8.3 envelope idiom) ────────
CREATE OR REPLACE FUNCTION public.broadcast_opslive_workflow_runs()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_type text;
  v_slug text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_type := 'run.started';
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    v_type := CASE NEW.status
      WHEN 'succeeded'        THEN 'run.succeeded'
      WHEN 'failed'           THEN 'run.failed'
      WHEN 'waiting_approval' THEN 'run.waiting_approval'
      WHEN 'cancelled'        THEN 'run.cancelled'
      ELSE 'run.progressed'   -- waiting_approval → running (resume)
    END;
  ELSE
    v_type := 'run.progressed'; -- current_step advanced, status unchanged
  END IF;

  SELECT w.slug INTO v_slug FROM public.workflows w WHERE w.id = NEW.workflow_id;

  PERFORM public.fn_opslive_notify(jsonb_build_object(
    'event_id', gen_random_uuid(),
    'ts', now(),
    'type', v_type,
    'actor', 'system',
    'entity', jsonb_build_object('kind', 'workflow_run', 'id', NEW.id::text),
    'corr', jsonb_build_object(
      'task_id', NULL,
      'run_id', NULL,
      'workflow_run_id', NEW.id,
      'project_id', NULL),
    'payload', jsonb_build_object(
      'workflow_run_id', NEW.id,
      'workflow_id', NEW.workflow_id,
      'workflow', v_slug,
      'status', NEW.status,
      'current_step', NEW.current_step,
      'triggered_by', NEW.triggered_by)
  ));
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'ops:live trigger error swallowed (%.%): %', TG_TABLE_NAME, TG_OP, SQLERRM;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_broadcast_opslive_workflow_runs ON public.workflow_runs;
CREATE TRIGGER trg_broadcast_opslive_workflow_runs
  AFTER INSERT OR UPDATE ON public.workflow_runs
  FOR EACH ROW EXECUTE FUNCTION public.broadcast_opslive_workflow_runs();

COMMENT ON FUNCTION public.control_workflow_action(jsonb, text) IS
  'E9.1 WORKFLOW_ENGINE §8/§13/§16: the single write door for workflow definitions and run lifecycle. CRUD CEO-only; run_now/resume also system. B7b: high/critical + outbox_action step without an earlier approval step = rejected.';
