-- Call topic (CEO order 2026-07-19): every finished call carries a 2-4
-- word topic ("what was this about") produced by the answering brain and
-- shown on the Ses Hatti history list. Column + the ONE write door learns
-- the field; older rows stay null (list falls back to the first sentence).

alter table voice_calls add column if not exists topic text;

create or replace function control_voice_call_log(p_call jsonb) returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
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
                           stt_ms, answer_ms, tts_ms, degraded, cost_eur, ended_at, topic)
  VALUES (coalesce((p_call->>'id')::uuid, gen_random_uuid()), v_status, v_target,
          coalesce(p_call->'transcript', '[]'::jsonb),
          coalesce(p_call->'timeline', '[]'::jsonb),
          (p_call->>'stt_ms')::int, (p_call->>'answer_ms')::int, (p_call->>'tts_ms')::int,
          coalesce((p_call->>'degraded')::boolean, false),
          coalesce((p_call->>'cost_eur')::numeric, 0),
          CASE WHEN v_status IN ('ended','failed') THEN now() END,
          p_call->>'topic')
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
        topic = coalesce(EXCLUDED.topic, voice_calls.topic),
        ended_at = CASE WHEN EXCLUDED.status IN ('ended','failed') THEN now() ELSE voice_calls.ended_at END
  RETURNING id INTO v_id;

  PERFORM notify_broadcast('voice',
    CASE v_status
      WHEN 'ended' THEN 'call.ended' WHEN 'failed' THEN 'call.failed'
      WHEN 'speaking' THEN 'call.answer_ready' ELSE 'call.started' END,
    jsonb_build_object('id', v_id, 'status', v_status,
      'target_agent_id', v_target, 'degraded', coalesce((p_call->>'degraded')::boolean, false)));

  RETURN jsonb_build_object('ok', true, 'id', v_id);
END
$fn$;
