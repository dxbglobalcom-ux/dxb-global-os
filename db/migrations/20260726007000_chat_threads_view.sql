-- CEO order 2026-07-26 ("eski konuşmalar nerede... design'ı da düzeltin"): the
-- conversation list needed a real home, and the list had nothing honest to show.
--
-- Two measured gaps behind that complaint:
--   1. The oldest thread — the CEO's entire history, 100 messages — rendered as
--      "Başlıksız konuşma". Correct at the time (a system-authored English title
--      had leaked onto the Turkish board and was nulled, migration 004200), but a
--      generic label is not a name. The thread already contains its own name: the
--      CEO's first sentence in it. Deriving beats both a NULL and a translation,
--      because his own words need neither.
--   2. The strip could show a date and nothing else. "How long was that
--      conversation" is the first question anyone asks of a list of chats, and
--      the answer sat one join away.
--
-- The view derives; it never writes. A stored title still wins when there is one,
-- so a thread the CEO renames later keeps his name for it.

BEGIN;

CREATE OR REPLACE VIEW public.v_chat_threads AS
SELECT
  s.id,
  COALESCE(
    NULLIF(btrim(s.title), ''),
    (
      SELECT CASE
               WHEN length(btrim(split_part(m.content, E'\n', 1))) > 60
                 THEN left(btrim(split_part(m.content, E'\n', 1)), 57) || '...'
               ELSE NULLIF(btrim(split_part(m.content, E'\n', 1)), '')
             END
        FROM public.chat_messages m
       WHERE m.session_id = s.id AND m.role = 'ceo'
       ORDER BY m.created_at ASC
       LIMIT 1
    )
  )                                                   AS title,
  s.created_at,
  s.last_message_at,
  (SELECT count(*) FROM public.chat_messages m WHERE m.session_id = s.id)        AS messages,
  (SELECT count(*) FROM public.chat_messages m
    WHERE m.session_id = s.id AND m.role = 'ceo')                                AS ceo_turns,
  (SELECT bool_or(m.source = 'voice') FROM public.chat_messages m
    WHERE m.session_id = s.id)                                                   AS has_voice
  FROM public.chat_sessions s;

GRANT SELECT ON public.v_chat_threads TO authenticated;

COMMIT;

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_chat_threads;
