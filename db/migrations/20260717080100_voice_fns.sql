-- 20260717080100_voice_fns.sql — R3.1 voice v1 (VOICE_INTERACTION_SPEC §8,
-- family 0029b): the control seam. V1 voice-identity law + the ONLY write
-- path into voice_calls. Hamza identity seed is NOT here — it lands after
-- the CEO ear-gate approves a clone (spec §24 step 3, human gate).

BEGIN;

-- 1. control_voice_identity_upsert — V1 law: executive voices belong ONLY to
--    department directors (role_level='director') or the orchestrator (Hamza).
CREATE OR REPLACE FUNCTION public.control_voice_identity_upsert(
  p_agent_slug text, p_engine text, p_profile_ref text,
  p_locale text DEFAULT 'tr', p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('voice_identity_upsert|' || p_agent_slug || '|' || p_engine || '|' || p_profile_ref);
  v_prev record; v_agent record; v_id uuid; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
    IF FOUND THEN
      IF v_prev.request_digest <> v_digest THEN
        RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
      END IF;
      RETURN v_prev.response;
    END IF;
  END IF;

  SELECT id, slug, role_level INTO v_agent FROM agents
   WHERE slug = p_agent_slug AND employment_status <> 'archived';
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND',
      'detail', 'agent ' || p_agent_slug || ' not found or archived');
  END IF;
  -- V1 law (Talep §5.2): director or the orchestrator — nobody else, ever.
  IF v_agent.role_level IS DISTINCT FROM 'director' AND v_agent.slug <> 'agents-orchestrator' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VOICE_IDENTITY_LAW',
      'detail', 'V1: voice identities are for department directors or the orchestrator only (got role_level=' || coalesce(v_agent.role_level, 'NULL') || ')');
  END IF;

  INSERT INTO voice_identities (agent_id, engine, profile_ref, locale, status)
  VALUES (v_agent.id, p_engine, p_profile_ref, p_locale, 'active')
  ON CONFLICT (agent_id) DO UPDATE
    SET engine = EXCLUDED.engine, profile_ref = EXCLUDED.profile_ref,
        locale = EXCLUDED.locale, status = 'active'
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'voice.identity.upserted',
          jsonb_build_object('agent_slug', p_agent_slug, 'engine', p_engine,
                             'profile_ref', p_profile_ref, 'locale', p_locale))
  RETURNING id INTO v_audit;

  v_resp := jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 2. control_voice_identity_retire
CREATE OR REPLACE FUNCTION public.control_voice_identity_retire(p_agent_slug text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_id uuid; v_audit bigint;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  UPDATE voice_identities vi SET status = 'retired'
   FROM agents a
   WHERE a.id = vi.agent_id AND a.slug = p_agent_slug AND vi.status = 'active'
  RETURNING vi.id INTO v_id;
  IF v_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND',
      'detail', 'no active voice identity for ' || p_agent_slug);
  END IF;
  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'voice.identity.retired', jsonb_build_object('agent_slug', p_agent_slug))
  RETURNING id INTO v_audit;
  RETURN jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit);
END $$;

-- 3. control_voice_call_log — the ONLY write path into voice_calls (V10).
--    Upsert by id: the call service logs the row at start and finalizes it at
--    end (status/timings/transcript) through the same seam.
CREATE OR REPLACE FUNCTION public.control_voice_call_log(p_call jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_id uuid; v_status text := coalesce(p_call->>'status', 'listening');
  v_target uuid;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF v_status NOT IN ('listening','transcribing','routing','answering','speaking','ended','failed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'illegal call status ' || v_status);
  END IF;
  IF p_call ? 'target_agent_slug' THEN
    SELECT id INTO v_target FROM agents WHERE slug = p_call->>'target_agent_slug';
  END IF;

  INSERT INTO voice_calls (id, status, target_agent_id, transcript, timeline,
                           stt_ms, answer_ms, tts_ms, degraded, cost_eur, ended_at)
  VALUES (coalesce((p_call->>'id')::uuid, gen_random_uuid()), v_status, v_target,
          coalesce(p_call->'transcript', '[]'::jsonb),
          coalesce(p_call->'timeline', '[]'::jsonb),
          (p_call->>'stt_ms')::int, (p_call->>'answer_ms')::int, (p_call->>'tts_ms')::int,
          coalesce((p_call->>'degraded')::boolean, false),
          coalesce((p_call->>'cost_eur')::numeric, 0),
          CASE WHEN v_status IN ('ended','failed') THEN now() END)
  ON CONFLICT (id) DO UPDATE
    SET status = EXCLUDED.status,
        target_agent_id = coalesce(EXCLUDED.target_agent_id, voice_calls.target_agent_id),
        transcript = EXCLUDED.transcript,
        timeline = EXCLUDED.timeline,
        stt_ms = coalesce(EXCLUDED.stt_ms, voice_calls.stt_ms),
        answer_ms = coalesce(EXCLUDED.answer_ms, voice_calls.answer_ms),
        tts_ms = coalesce(EXCLUDED.tts_ms, voice_calls.tts_ms),
        degraded = EXCLUDED.degraded,
        cost_eur = EXCLUDED.cost_eur,
        ended_at = CASE WHEN EXCLUDED.status IN ('ended','failed') THEN now() ELSE voice_calls.ended_at END
  RETURNING id INTO v_id;

  PERFORM notify_broadcast('voice',
    CASE v_status
      WHEN 'ended' THEN 'call.ended' WHEN 'failed' THEN 'call.failed'
      WHEN 'speaking' THEN 'call.answer_ready' ELSE 'call.started' END,
    jsonb_build_object('id', v_id, 'status', v_status,
      'target_agent_id', v_target, 'degraded', coalesce((p_call->>'degraded')::boolean, false)));

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END $$;

COMMIT;

-- ROLLBACK: DROP FUNCTION public.control_voice_identity_upsert(text,text,text,text,text);
--   DROP FUNCTION public.control_voice_identity_retire(text);
--   DROP FUNCTION public.control_voice_call_log(jsonb);
