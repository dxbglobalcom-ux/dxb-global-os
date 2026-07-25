-- U15 round 2 (ticket 20260725-u15-voice-round2, CEO live verdict 2026-07-25):
-- (1) voice_daemon_state — the ONE persisted mute switch for the JARVIS mic.
--     The CEO's "kapan" (spoken hard-off, chat command, or panel toggle) must
--     actually HOLD: the daemon polls this row and ignores the microphone
--     entirely while muted. Single-row table, audited door writes only.
-- (2) chat_messages.source — chat and the voice line are ONE conversation
--     (CEO order: "chat, voice ve jarvis üçü de aynı olmalı"). Voice turns
--     mirror onto the board tagged 'voice'.
-- (3) voice_calls.session_id — one wake session = one conversation thread
--     (CEO order: history must group "konu konu", not per utterance).

-- (1) daemon state -----------------------------------------------------------
create table if not exists voice_daemon_state (
  id smallint primary key default 1 check (id = 1),
  state text not null default 'listening' check (state in ('listening','muted')),
  updated_by text not null default 'system',
  updated_at timestamptz not null default now(),
  note text
);

-- Seed honoring the STANDING CEO order of 2026-07-25 ("kapan dedim
-- kapanmadı"): the mic starts MUTED until the CEO reopens it himself.
insert into voice_daemon_state (id, state, updated_by, note)
values (1, 'muted', 'ceo', 'CEO order 2026-07-25: stay silent until reopened')
on conflict (id) do nothing;

alter table voice_daemon_state enable row level security;
grant select on voice_daemon_state to authenticated;
create policy voice_daemon_state_read on voice_daemon_state
  for select to authenticated using (true);

-- The audited door: daemon (spoken hard-off), chat drain (typed command) and
-- the dashboard toggle all write through here; every flip lands in audit_log.
create or replace function control_voice_daemon_set_state(
  p_state text, p_actor text default null, p_note text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
DECLARE
  v_actor text := coalesce(p_actor, fn_org_actor());
  v_old text;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_state NOT IN ('listening','muted') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'illegal daemon state ' || coalesce(p_state, '<null>'));
  END IF;

  SELECT state INTO v_old FROM voice_daemon_state WHERE id = 1;
  INSERT INTO voice_daemon_state (id, state, updated_by, updated_at, note)
  VALUES (1, p_state, v_actor, now(), p_note)
  ON CONFLICT (id) DO UPDATE
    SET state = EXCLUDED.state, updated_by = EXCLUDED.updated_by,
        updated_at = now(), note = EXCLUDED.note;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor,
          CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'voice.daemon_state',
          jsonb_build_object('from', v_old, 'to', p_state, 'note', p_note));

  RETURN jsonb_build_object('ok', true, 'state', p_state);
END
$fn$;

grant execute on function control_voice_daemon_set_state(text, text, text) to authenticated;

-- (2) one conversation -------------------------------------------------------
alter table chat_messages add column if not exists source text not null default 'chat'
  check (source in ('chat','voice'));

-- (3) session threads --------------------------------------------------------
alter table voice_calls add column if not exists session_id uuid;
create index if not exists idx_voice_calls_session on voice_calls (session_id)
  where session_id is not null;

-- The ONE write door learns session_id (upsert keeps an existing value when
-- a later status write omits it).
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
                           stt_ms, answer_ms, tts_ms, degraded, cost_eur, ended_at, topic, session_id)
  VALUES (coalesce((p_call->>'id')::uuid, gen_random_uuid()), v_status, v_target,
          coalesce(p_call->'transcript', '[]'::jsonb),
          coalesce(p_call->'timeline', '[]'::jsonb),
          (p_call->>'stt_ms')::int, (p_call->>'answer_ms')::int, (p_call->>'tts_ms')::int,
          coalesce((p_call->>'degraded')::boolean, false),
          coalesce((p_call->>'cost_eur')::numeric, 0),
          CASE WHEN v_status IN ('ended','failed') THEN now() END,
          p_call->>'topic',
          (p_call->>'session_id')::uuid)
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
        session_id = coalesce(EXCLUDED.session_id, voice_calls.session_id),
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
