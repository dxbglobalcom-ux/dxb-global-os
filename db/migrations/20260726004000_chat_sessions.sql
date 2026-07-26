-- W1.5 — the CEO chat board gets real conversations.
--
-- MEASURED before this migration: `chat_messages` had no session column at all.
-- The board was ONE flat list capped at 200 rows, and Hamza's context window was
-- the newest 20 messages regardless of subject — so a question about video
-- production carried the tail of a conversation about the budget. "New chat"
-- did not exist anywhere in the code. The CEO named this himself: JARVIS/chat
-- has "no new chat concept".
--
-- The voice lane already solved the same problem (U15 D13, `voice_calls
-- .session_id` — calls sharing a session are ONE thread on the board). This
-- brings the written lane to the same shape, deliberately: one conversation
-- model across both, because chat and voice are ONE conversation (U15 D12).
--
-- History is NOT discarded: every existing row is adopted by one legacy session
-- so the board keeps its past instead of starting clean.

BEGIN;

CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Derived from the opening CEO message. Deliberately not model-generated:
  -- a title is navigation, and paying for a model call to name a thread the CEO
  -- is about to read anyway is spend without a decision behind it.
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.chat_sessions IS
  'One CEO chat conversation. Threads the board and scopes Hamza''s context window (W1.5).';

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS session_id uuid REFERENCES public.chat_sessions(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS chat_messages_session_created_idx
  ON public.chat_messages (session_id, created_at);

-- Adopt the existing board into one legacy thread. Its timestamps come from the
-- rows themselves, so the thread sorts where the conversation actually happened
-- rather than at "now".
DO $$
DECLARE
  v_id uuid;
  v_first timestamptz;
  v_last timestamptz;
BEGIN
  IF EXISTS (SELECT 1 FROM public.chat_messages WHERE session_id IS NULL) THEN
    SELECT min(created_at), max(created_at) INTO v_first, v_last
      FROM public.chat_messages WHERE session_id IS NULL;
    -- No system-authored title: DB text is an i18n surface, so an English
    -- literal here would render on the Turkish board. An untitled thread falls
    -- back to the localised label in the UI.
    INSERT INTO public.chat_sessions (title, created_at, last_message_at)
    VALUES (NULL, COALESCE(v_first, now()), COALESCE(v_last, now()))
    RETURNING id INTO v_id;
    UPDATE public.chat_messages SET session_id = v_id WHERE session_id IS NULL;
  END IF;
END $$;

-- Keep the thread's ordering key honest without asking every caller to remember.
CREATE OR REPLACE FUNCTION public.fn_chat_touch_session()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE public.chat_sessions
       SET last_message_at = GREATEST(last_message_at, NEW.created_at)
     WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_chat_touch_session ON public.chat_messages;
CREATE TRIGGER trg_chat_touch_session
  AFTER INSERT ON public.chat_messages
  FOR EACH ROW EXECUTE FUNCTION public.fn_chat_touch_session();

/*
 * The session a new CEO message belongs to.
 *
 * `p_new = true` always opens a fresh thread (the "new conversation" button).
 * Otherwise the most recent thread continues — EXCEPT when it has gone quiet for
 * longer than p_idle_hours, because a message the next morning is a new
 * conversation in every sense that matters to the person having it.
 */
CREATE OR REPLACE FUNCTION public.fn_chat_session_for_new_message(
  p_first_message text DEFAULT NULL,
  p_new boolean DEFAULT false,
  p_idle_hours int DEFAULT 12
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
  v_id uuid;
  v_title text;
BEGIN
  IF NOT p_new THEN
    SELECT id INTO v_id FROM public.chat_sessions
     WHERE last_message_at > now() - make_interval(hours => p_idle_hours)
     ORDER BY last_message_at DESC
     LIMIT 1;
    IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  END IF;

  -- Title from the opening message: first line, trimmed to something readable.
  v_title := NULLIF(btrim(split_part(COALESCE(p_first_message, ''), E'\n', 1)), '');
  IF v_title IS NOT NULL AND length(v_title) > 60 THEN
    v_title := left(v_title, 57) || '...';
  END IF;

  INSERT INTO public.chat_sessions (title) VALUES (v_title) RETURNING id INTO v_id;
  RETURN v_id;
END $$;

COMMIT;

-- ROLLBACK:
--   DROP TRIGGER IF EXISTS trg_chat_touch_session ON public.chat_messages;
--   DROP FUNCTION IF EXISTS public.fn_chat_touch_session();
--   DROP FUNCTION IF EXISTS public.fn_chat_session_for_new_message(text, boolean, int);
--   ALTER TABLE public.chat_messages DROP COLUMN IF EXISTS session_id;
--   DROP TABLE IF EXISTS public.chat_sessions;
