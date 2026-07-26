-- W1.5 follow-up, caught by the RULE #0 design pass in the same turn: the
-- conversation strip rendered with only the "new conversation" button and the
-- board came up empty, even though a thread with 72 messages existed.
--
-- Root cause: `chat_sessions` shipped without RLS or grants, so the dashboard's
-- authenticated role could not see a single row. The page then resolved
-- `activeSessionId` to null and, correctly, showed nothing. A new table is
-- invisible by default here — it must be given the same seat `chat_messages`
-- already has (RLS on, authenticated SELECT, writes through the API's own role).

BEGIN;

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.chat_sessions TO authenticated;

DROP POLICY IF EXISTS chat_sessions_ceo_read ON public.chat_sessions;
CREATE POLICY chat_sessions_ceo_read ON public.chat_sessions
  FOR SELECT TO authenticated
  USING (true);

-- The board writes sessions only through fn_chat_session_for_new_message, which
-- the API calls as the authenticated user, so the function owns the insert.
ALTER FUNCTION public.fn_chat_session_for_new_message(text, boolean, int)
  SECURITY DEFINER SET search_path TO 'public';

GRANT EXECUTE ON FUNCTION public.fn_chat_session_for_new_message(text, boolean, int)
  TO authenticated;

COMMIT;

-- ROLLBACK:
--   DROP POLICY IF EXISTS chat_sessions_ceo_read ON public.chat_sessions;
--   ALTER TABLE public.chat_sessions DISABLE ROW LEVEL SECURITY;
--   REVOKE SELECT ON public.chat_sessions FROM authenticated;
