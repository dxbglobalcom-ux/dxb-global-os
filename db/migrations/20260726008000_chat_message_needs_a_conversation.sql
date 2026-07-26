-- W1.5 REPAIR #2 — a message without a conversation is not a message anyone can
-- read, so the database now refuses to store one.
--
-- MEASURED 2026-07-26 06:20, by the suite's own invariant ("no message is
-- orphaned") going red on live data: two of Hamza's answers carried
-- `session_id = NULL`. Root cause was NOT the code — every writer sets the
-- session (chat door, drain, voice mirror). The resident scheduler had been
-- running since 2026-07-25 17:16 and W1.5 shipped at 03:56 on the 26th, so the
-- process was still executing the PRE-SESSION drain from memory. Restarting it
-- (06:26) fixed the behaviour; the two orphans were probe answers of my own and
-- were purged with an audit row.
--
-- The lesson is the reason for this migration: the invariant lived only in a
-- test, and a test cannot stop a stale process from writing. Now the column
-- carries it. Any writer that forgets a conversation fails loudly at the insert
-- instead of quietly producing a message the CEO will never see.
--
-- Safe by construction: measured 0 rows with a NULL session at write time, and
-- the FK is already ON DELETE CASCADE, so deleting a conversation still removes
-- its messages rather than orphaning them.

BEGIN;

-- Fail early and readably if anything orphaned slipped in between the
-- measurement and this run — never silently drop a row the CEO might own.
DO $$
DECLARE n int;
BEGIN
  SELECT count(*) INTO n FROM public.chat_messages WHERE session_id IS NULL;
  IF n > 0 THEN
    RAISE EXCEPTION 'refusing to set NOT NULL: % chat message(s) still have no conversation', n;
  END IF;
END $$;

ALTER TABLE public.chat_messages ALTER COLUMN session_id SET NOT NULL;

COMMIT;

-- ROLLBACK:
--   ALTER TABLE public.chat_messages ALTER COLUMN session_id DROP NOT NULL;
