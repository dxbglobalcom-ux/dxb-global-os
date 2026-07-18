-- E12.5 mid-wave activation repair (U18 sub-item 5): L3 worker model resolution.
-- MEASURED defect (2026-07-18, live activation wave): worker-shim defaultExecutor
-- resolves the execution model as the highest-priority enabled routing_rules row
-- for the task's tier (loadPolicy order: priority DESC, updated_at DESC) —
-- task_class is NOT consulted on this path. L3's winning row was
-- code.bulk/kimi-2.7-code (priority 10, later updated_at than
-- code.standard/codex-5.5), so every L3 task ran kimi first. Live probation
-- evidence: kimi-2.7-code 4/52 runs succeeded vs sonnet-5 21/38 (first-pass;
-- converges through the revise loop), and 177 of the 180 queued probation
-- tasks are L3 — the dead rung would burn ~2 failed runs per task before the
-- escalation ladder moved on (5+ failures = blocked).
-- Repair: raise the L3 sonnet-5 row to priority 20 so L3 resolves to sonnet-5
-- (subscription mode — also removes per-token API spend from the L3 lane).
-- kimi-2.7-code stays enabled at priority 10 as the next rung; retiring it (or
-- making resolution task_class-aware) is a post-wave decision, not this repair.
-- MODEL_ROUTING_SPEC §4b: Sonnet is unrestricted as a runtime agent brain.
UPDATE public.routing_rules
   SET priority = 20, updated_at = now()
 WHERE model_tier = 'L3' AND model = 'sonnet-5' AND task_class = 'code.standard'
   AND priority < 20;
