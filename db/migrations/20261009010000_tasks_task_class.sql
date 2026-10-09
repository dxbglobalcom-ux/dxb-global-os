-- 20261009010000_tasks_task_class.sql — a task remembers the class it was routed as.
--
-- B51 step 2 (CEO 2026-10-09, "düzeltmeyi ve gereken neyse onu yap"). The critical gate (MODEL_ROUTING_SPEC
-- §4e) is switched by routing_rules.needs_council for a task CLASS — strategy, architecture, final-approval,
-- content.outbound. Measured that day: decompose knew the class and routed it, but the task row kept only its
-- tier, and the worker read needs_council off whichever row won the tier — on the company the slot.* rows,
-- priority 100, needs_council false. The gate could not fire on any task; decision_log held 0 critical_gate rows.
--
-- decompose writes the class here (orchestrator dispatch); the worker reads the switch by it
-- (worker-shim gateNeededFor). NULL = a task born outside decompose (revenue discovery, the pin check, the
-- dxb-mcp queue): no class, no gate — exactly today's behaviour for those rows. No FK: routing_rules holds
-- several rows per class, and a class retired from the table must not orphan the tasks that ran under it.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_class text;

COMMENT ON COLUMN tasks.task_class IS
  'The routing_rules.task_class decompose routed this task as; NULL when born outside decompose. The worker reads the critical gate''s switch (needs_council) by it.';
