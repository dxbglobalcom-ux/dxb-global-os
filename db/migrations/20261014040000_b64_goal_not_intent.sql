-- B64 plan step 1 (CEO-approved plan, 2026-10-14) — HE GIVES A GOAL, NOT AN INTENT.
--
-- His words (b64-opened-goal-not-intent-and-hamza-2026-10-12): "Niyet değil, hedef. Verilecek hedef,
-- holdinge verilecek iş." What he gives the holding is a goal — a broad brief written the way a task is
-- written for an engineer: what is wanted, how, its properties (DATA_MODEL B64 A1, AGENT_ORCHESTRATION A26).
-- `intents` (0016) is where it enters today, and its text was capped at 500 characters
-- (20260710000016_intents_intake.sql:13) — a one-line "intent". The cap goes.
--
-- The new bound, 20000 characters, is a sanity limit and not a product limit: a few pages of brief fit with
-- room to spare, while a pasted document or a runaway client cannot fill the intake row the kernel reads
-- whole into classify. It must equal GOAL_MAX_CHARS in apps/dashboard/src/lib/intent-body.ts (the route's
-- zod schema). The empty text is still refused.
--
-- Nothing else changes: the table keeps its name until the build renames it; the statuses, grants and
-- policies are 0016's. The 51 July voice rows (source='voice', status='received') stay as they are — the
-- intake skips spoken rows by design (packages/orchestrator/src/intent-intake.ts) and this file does not
-- touch any row.
--
-- Idempotent: safe to run 2×.

BEGIN;

ALTER TABLE public.intents DROP CONSTRAINT IF EXISTS intents_text_check;
ALTER TABLE public.intents
  ADD CONSTRAINT intents_text_check CHECK (char_length(text) BETWEEN 1 AND 20000);

COMMIT;
