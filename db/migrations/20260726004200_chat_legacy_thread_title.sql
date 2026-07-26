-- W1.5 follow-up #2, caught by the same RULE #0 pass: the adopted legacy thread
-- carried the literal English title 'Earlier conversation', which then rendered
-- on the TURKISH board. DB text is an i18n surface (ui-bilingual-purity-gate) —
-- a system-authored label may not be a hardcoded English string.
--
-- Fix: the system authors NO title. A thread with no title falls back to the
-- localised label in the UI. Titles the CEO's own opening line produces need no
-- translation, because they are already in the language he was writing in.
BEGIN;
UPDATE public.chat_sessions SET title = NULL WHERE title = 'Earlier conversation';
COMMIT;
-- ROLLBACK: (none needed — an untitled thread is the intended resting state)
