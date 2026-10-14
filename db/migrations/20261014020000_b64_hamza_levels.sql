-- B64 decision 3 — Hamza's levels in written chat. His yes, 2026-10-14
-- (b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14), on his page: "Hamza normal sohbette ve brifingde
-- Opus 5.5 medium'dadır. Plan, mimari ya da strateji konuşulunca xhigh'a geçer ve söyler: 'Plan konuşuyoruz,
-- xhigh'a geçtim; isterseniz max.' 'Max'a geç' ya da 'high'a in' dediğinizde konu bitene kadar o seviyede
-- kalır. … Bugün durum sorusu dışındaki her mesaj max'a gidiyor; bu düzelir."
-- Contract: VOICE_INTERACTION_SPEC §24ter and §24sexies 2; MODEL_ROUTING_SPEC B64 item 2.
--
-- Measured before this file (construction engine, 2026-10-14): chat.strategy max, chat.brief medium,
-- chat.answer high, all claude-opus-5-5; classifyLeg defaulted to strategy, so every message but a status
-- question ran at max.
--
--   1. The normal leg (the new default in classifyLeg) answers on the existing `chat.answer` row — the plain
--      "CEO chat board answer" class the board ran on before the legs existed — re-set to medium.
--   2. chat.strategy goes from max to xhigh: max is a default nowhere; his "Max'a geç" opens it.
--   3. chat_sessions carries his held level and the conversation's last leg (the notice is said once,
--      when a conversation moves onto the strategy leg).
-- Models are untouched (Opus 5.5 stays); voice.answer is untouched (its move waits on the 20-sentence trial).
-- updated_at is left alone (loadPolicy orders by it).

ALTER TABLE public.chat_sessions
  ADD COLUMN IF NOT EXISTS effort_override text,
  ADD COLUMN IF NOT EXISTS effort_override_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_leg text;

ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_effort_override_check;
ALTER TABLE public.chat_sessions
  ADD CONSTRAINT chat_sessions_effort_override_check
  CHECK (effort_override IS NULL OR effort_override IN ('medium', 'high', 'xhigh', 'max'));

ALTER TABLE public.chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_last_leg_check;
ALTER TABLE public.chat_sessions
  ADD CONSTRAINT chat_sessions_last_leg_check
  CHECK (last_leg IS NULL OR last_leg IN ('normal', 'strategy', 'brief'));

COMMENT ON COLUMN public.chat_sessions.effort_override IS
  'B64 decision 3: the level the CEO named in this conversation ("Max''a geç", "High''a in"). Holds until he names another, says "normale dön", or 30 minutes pass without a message from him here. Effort only; the model stays the routing row''s.';
COMMENT ON COLUMN public.chat_sessions.effort_override_at IS
  'B64 decision 3: his last message in this conversation while effort_override holds; 30 minutes past it the hold ends.';
COMMENT ON COLUMN public.chat_sessions.last_leg IS
  'B64 decision 3: the leg that answered the last turn here, so "Plan konuşuyoruz, xhigh''a geçtim; isterseniz max." is said once, when the conversation moves onto the strategy leg.';

DO $$
DECLARE
  v_rows jsonb;
BEGIN
  -- the photograph first: which rows move, from what to what
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'task_class', task_class, 'old', effort, 'new', target)
                            ORDER BY task_class), '[]'::jsonb)
    INTO v_rows
    FROM (SELECT id, task_class, effort,
                 CASE task_class WHEN 'chat.strategy' THEN 'xhigh' ELSE 'medium' END AS target
            FROM public.routing_rules
           WHERE department_id IS NULL
             AND task_class IN ('chat.answer', 'chat.strategy')) x
   WHERE effort IS DISTINCT FROM target;

  UPDATE public.routing_rules r SET effort = e->>'new'
    FROM jsonb_array_elements(v_rows) e
   WHERE r.id = (e->>'id')::uuid;

  -- written on his word, not in his name
  IF jsonb_array_length(v_rows) > 0 THEN
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b64', 'system', 'routing_change',
            jsonb_build_object('reason', 'B64 decision 3: Hamza talks at medium (normal leg on chat.answer), plan talk at xhigh; max only on his word',
                               'authority', 'ceo-approvals:b64-decisions-1-5-8-9-11-12-16-his-yes-2026-10-14',
                               'rows', v_rows));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.routing_rules
              WHERE department_id IS NULL AND enabled AND task_class LIKE 'chat.%' AND effort = 'max') THEN
    RAISE EXCEPTION 'B64 decision 3: a department-less chat row is still at max';
  END IF;
END $$;

-- ROLLBACK:
--   UPDATE public.routing_rules SET effort = 'max'  WHERE department_id IS NULL AND task_class = 'chat.strategy';
--   UPDATE public.routing_rules SET effort = 'high' WHERE department_id IS NULL AND task_class = 'chat.answer';
--   ALTER TABLE public.chat_sessions DROP COLUMN IF EXISTS effort_override,
--     DROP COLUMN IF EXISTS effort_override_at, DROP COLUMN IF EXISTS last_leg;
