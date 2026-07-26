-- W2.3b — the capital ceiling as ONE readable row (REVENUE_ENGINE_SPEC §7).
--
-- The board must state the ceiling the gate enforces AND name where it came
-- from. Two separate reads would mean two sources for "which objective governs"
-- — the number from `fn_revenue_capital_limit()` and the name from a query that
-- re-implements its selection rule. They would agree today and drift the first
-- time the rule changes, and the CEO would read a ceiling attributed to the
-- wrong objective.
--
-- One view, one row, always: the number comes from the function (U32 keeps it
-- the single source) and the identity comes from the same selection beside it.
-- A projection read, so the dashboard stays a projection (DASH-05) — no rpc
-- seam, no allowlist entry, nothing to weaken.

BEGIN;

CREATE OR REPLACE VIEW public.v_revenue_capital_ceiling AS
SELECT
  fn_revenue_capital_limit() AS limit_eur,
  (SELECT o.id FROM objectives o
    WHERE o.status = 'active' ORDER BY o.created_at DESC LIMIT 1) AS objective_id,
  (SELECT o.title FROM objectives o
    WHERE o.status = 'active' ORDER BY o.created_at DESC LIMIT 1) AS objective_title;

COMMENT ON VIEW public.v_revenue_capital_ceiling IS
  'W2.3b — the active capital ceiling and the objective it comes from, in one row. '
  'Always returns exactly one row; objective_* are NULL when no objective is active '
  '(the ceiling is then 0 and only zero-capital work can advance).';

GRANT SELECT ON public.v_revenue_capital_ceiling TO authenticated, service_role;

COMMIT;

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_revenue_capital_ceiling;
