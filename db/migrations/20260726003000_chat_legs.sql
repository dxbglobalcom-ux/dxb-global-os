-- W1.4 — Hamza's two legs (CEO directive 2026-07-25, verbatim: "2 ayak var:
-- 1- para kazanma planları projeleri konusu konuşulması  2- gündelik rapor
-- özetler şirket nasıl ilerliyor sohbeti").
--
-- Until now one `chat.answer` row served both, so a money decision and a status
-- question got the same treatment and the same context. They are different
-- jobs: one thinks with the CEO, the other reports measured numbers back to him.
--
-- BOTH are L1. §4d is explicit — anything the CEO reads is Opus 5 — so this is
-- not a quality split, it is a behaviour split:
--   chat.strategy : effort max, takes a position, no turn pressure
--   chat.brief    : effort medium, and the leg hands the model a live snapshot
--                   so it answers from measurements instead of memory
--
-- The safety rule is one-directional (CEO 2026-07-25): anything smelling of
-- money or planning goes UP, never down. `classifyLeg` therefore defaults to
-- strategy and only routes to brief on an explicit report/status marker.
--
-- `chat.answer` STAYS as the fallback row: a deployment that has not shipped the
-- new code must keep answering the CEO.

BEGIN;

INSERT INTO public.routing_rules
  (task_class, match, model_tier, model, mode, effort, needs_council, priority, enabled)
VALUES
  ('chat.strategy', '{}'::jsonb, 'L1', 'fable-5', 'subscription', 'max',    false, 0, true),
  ('chat.brief',    '{}'::jsonb, 'L1', 'fable-5', 'subscription', 'medium', false, 0, true)
ON CONFLICT DO NOTHING;

COMMIT;

-- ROLLBACK:
--   DELETE FROM public.routing_rules WHERE task_class IN ('chat.strategy', 'chat.brief');
