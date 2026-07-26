-- W2.2 follow-up, found by the FIRST live run failing (2026-07-26 07:04).
--
-- The commissioned research task was rejected five times by the pre-task hook —
-- `missing_project_link: task has neither project ctx nor milestone` — and the
-- escalation ladder blocked it. The hook was RIGHT: "do not conflict with
-- holding goals" is enforced by requiring every task to hang off a project, and
-- a market scan with no home in the portfolio is exactly the kind of orphan work
-- that rule exists to stop. The defect was mine, in the commissioning code.
--
-- Weakening the gate for a system job was never an option (§13 wall: agents and
-- jobs may not soften a policy). Creating the project at runtime was also not an
-- option: `control_project_action` create is CEO-only (PROJECT_OS §13), and it
-- is right that a job cannot invent a project. So the standing home ships as
-- data, the same way the six revenue engines and the department roster do —
-- authored here, once, by the construction author.

BEGIN;

INSERT INTO public.projects (slug, name, purpose, strategy_link, owner_employee_id, status)
SELECT
  'revenue-discovery',
  'Revenue Discovery',
  'The standing home for market scanning: every research run that looks for revenue opportunities hangs here, so a scan is always answerable to the holding goal it serves rather than being orphan work. Findings become rows in opportunities through the audited door; the decisions about them stay with the CEO and the risk-audit head.',
  'HOLDING-OS-MASTER-PLAN/REVENUE_ENGINE_SPEC.md',
  (SELECT id FROM public.agents WHERE slug = 'head-of-strategy' LIMIT 1),
  'active'
WHERE NOT EXISTS (SELECT 1 FROM public.projects WHERE slug = 'revenue-discovery');

COMMIT;

-- ROLLBACK:
--   DELETE FROM public.projects WHERE slug = 'revenue-discovery';
