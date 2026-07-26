-- W1.5 REPAIR — the CEO's chat board could not accept a single message.
--
-- REPORTED BY THE CEO (2026-07-26 ~05:40): "yeni chat 'yeni konuşma' basıyorum
-- çalışmıyor". MEASURED: three `chat_sessions` rows created at 03:50 with the
-- titles "selam" / "selam" / "selmal" and ZERO messages between them, and a live
-- POST to /api/chat answering `500 {"error":"permission denied for table
-- chat_messages"}`.
--
-- ROOT CAUSE (two faults, one visible symptom):
--   1. The 2026-07-19 board migration granted INSERT per COLUMN —
--      `grant insert (role, content, mode) on chat_messages to authenticated`.
--      W1.5 added `session_id` to the insert payload and never widened that
--      grant, so the browser's role lost the write it had had since July 19.
--      The RLS policy was fine; the table grant was not. `information_schema.
--      role_table_grants` shows no INSERT row for the table at all, which is why
--      a table-level reading of the grants looked "as designed".
--   2. The write was TWO statements — mint the session, then insert the message.
--      When the second failed, the first stayed. That is where the CEO's three
--      empty "selam" threads came from: every attempt left a ghost conversation
--      and lost his words.
--
-- THE FIX IS THE SHAPE, NOT THE GRANT: one door, one statement. A conversation
-- may not exist before the message that starts it, so both writes live in one
-- function and fail together. Widening the column grant would have restored the
-- send and left fault 2 alive, plus the same trap for the next column anyone
-- adds to this table.

BEGIN;

CREATE OR REPLACE FUNCTION public.fn_chat_post_message(
  p_text       text,
  p_mode       text    DEFAULT 'normal',
  p_session_id uuid    DEFAULT NULL,
  p_new        boolean DEFAULT false
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_session uuid;
  v_id      uuid;
  v_text    text := btrim(COALESCE(p_text, ''));
BEGIN
  -- Nothing about an empty message is worth a row, a thread or an answer.
  IF v_text = '' THEN
    RAISE EXCEPTION 'chat message is empty' USING ERRCODE = '22023';
  END IF;
  IF p_mode IS NULL OR p_mode NOT IN ('normal', 'plan') THEN
    RAISE EXCEPTION 'unknown chat mode: %', p_mode USING ERRCODE = '22023';
  END IF;

  -- An explicit thread is honoured; otherwise the resolver decides — a fresh
  -- one when the CEO asked for one, the live one when he simply kept talking,
  -- and a fresh one anyway after a long silence (fn_chat_session_for_new_message).
  v_session := COALESCE(
    p_session_id,
    public.fn_chat_session_for_new_message(v_text, COALESCE(p_new, false))
  );

  INSERT INTO public.chat_messages (role, content, mode, session_id)
  VALUES ('ceo', v_text, p_mode, v_session)
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('message_id', v_id, 'session_id', v_session);
END
$$;

GRANT EXECUTE ON FUNCTION public.fn_chat_post_message(text, text, uuid, boolean)
  TO authenticated;

-- One door only (control-seam law, REVENUE/PERMISSION §P4): with the function in
-- place, a direct table insert by the browser role is closed — so the next column
-- added here can never silently break the CEO's chat again. The policy goes with
-- it: a policy that can never be reached reads like a permission that exists.
REVOKE INSERT ON public.chat_messages FROM authenticated;
DROP POLICY IF EXISTS chat_ceo_write ON public.chat_messages;

-- The CEO's three lost attempts left three empty threads on his board. They were
-- never conversations; they are the wreckage of this defect, and they are the
-- only rows this migration deletes (a thread that holds a single message is
-- history and is never touched).
DELETE FROM public.chat_sessions s
 WHERE NOT EXISTS (SELECT 1 FROM public.chat_messages m WHERE m.session_id = s.id);

COMMIT;

-- ROLLBACK:
--   GRANT INSERT (role, content, mode, session_id) ON public.chat_messages TO authenticated;
--   CREATE POLICY chat_ceo_write ON public.chat_messages FOR INSERT TO authenticated
--     WITH CHECK (role = 'ceo');
--   DROP FUNCTION IF EXISTS public.fn_chat_post_message(text, text, uuid, boolean);
