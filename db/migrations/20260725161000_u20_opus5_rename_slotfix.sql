-- U20 follow-up — defect in 20260725160000 found by tests/e7 on the same run.
--
-- Root cause (systematic-debugging, standing order 11): routing_rules carries
-- TWO model columns. `model` is the free-text kernel slug lane (classify.ts
-- SDK_MODEL_IDS); `model_id` is the E7.1 role-slot lane, an FK into
-- model_catalog that fn_select_model actually reads
-- (db/migrations/20260713040000_e71_routing_slots.sql:160). The first migration
-- rewrote only `model`, so 10 role-slot rows stayed on 'claude-opus-4-8' —
-- which the same migration had just RETIRED. fn_select_model then eliminated
-- every candidate with "model status retired" and returned NO_MODEL_AVAILABLE
-- for backup/coding/critical_decision/design/execution/hr/planning/qa/
-- research/review. MEASURED before this fix:
--   select model_id, role_slot, count(*) from routing_rules group by 1,2
--     -> claude-opus-4-8 x 10 slot rows, fable-5 x primary, haiku x 2
--   tests/e7/routing-slots: 7/8 failing, 5 of them NO_MODEL_AVAILABLE
--
-- The parent migration is already recorded in schema_migrations, so this is a
-- forward fix rather than an edit to an applied file (governance: applied
-- migrations are history and are never rewritten -- U20 decision 1).

BEGIN;

UPDATE public.routing_rules
   SET model_id = 'fable-5'
 WHERE model_id = 'claude-opus-4-8';

COMMIT;

-- ROLLBACK:
--   UPDATE public.routing_rules SET model_id = 'claude-opus-4-8'
--    WHERE model_id = 'fable-5' AND role_slot <> 'primary';
