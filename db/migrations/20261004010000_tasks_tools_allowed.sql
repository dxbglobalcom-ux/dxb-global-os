-- 20261004010000_tasks_tools_allowed.sql — a task may run with no tools at all.
--
-- His list item 2 (his yes of 2026-10-04, PLAN-locked-tool.md): a tool the pin check locks goes to the
-- security engineer as a review task. That task carries the locked tool's old and new text — text an
-- outside server wrote, possibly to steer whoever reads it. The seat that reads it must hold no hand a
-- poisoned description could try to use, so the review runs with this flag false and the worker
-- (packages/orchestrator/src/worker-shim.ts) mounts no MCP server for it.
--
-- NOT NULL DEFAULT true: every existing row and every existing insert keeps today's behaviour.

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tools_allowed boolean NOT NULL DEFAULT true;

COMMENT ON COLUMN tasks.tools_allowed IS
  'false = the worker mounts no MCP server and no tool for this task (the locked-tool review reads untrusted text).';
