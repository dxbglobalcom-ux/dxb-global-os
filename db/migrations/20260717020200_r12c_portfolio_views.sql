-- R1.2c — portfolio/progress/SNEV views. Spec: REVENUE_ENGINE_SPEC §11/§22
-- (0028c). Honest-state rules (§17-19): no cost rows in period →
-- net_unverified=true (never fake profit); SNEV components exposed raw so the
-- dashboard can show WHY the number is what it is.

-- Numeric setting resolver with default (views cannot carry EXCEPTION blocks).
CREATE OR REPLACE FUNCTION public.fn_setting_numeric(p_key text, p_default numeric)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE v numeric;
BEGIN
  BEGIN
    v := (resolve_setting(p_key))::text::numeric;
  EXCEPTION WHEN others THEN
    v := NULL;
  END;
  RETURN COALESCE(v, p_default);
END $$;

-- ── v_objective_progress ────────────────────────────────────────────────────
DROP VIEW IF EXISTS public.v_objective_progress;
CREATE VIEW public.v_objective_progress AS
SELECT
  o.id,
  o.title,
  o.metric,
  o.amount_eur                                   AS target_eur,
  o.status,
  o.period,
  rev.total                                      AS realized_revenue_eur,
  cost.total                                     AS realized_cost_eur,
  round(rev.total - cost.total, 2)               AS realized_net_eur,
  round(o.amount_eur - CASE WHEN o.metric = 'revenue'
                            THEN rev.total ELSE rev.total - cost.total END, 2)
                                                 AS gap_eur,
  CASE WHEN o.period IS NOT NULL
       THEN GREATEST(upper(o.period) - CURRENT_DATE, 0) END
                                                 AS days_left,
  CASE WHEN o.period IS NOT NULL
        AND CURRENT_DATE >= lower(o.period)
       THEN round((rev.total - cost.total)
            / GREATEST(CURRENT_DATE - lower(o.period) + 1, 1), 2) END
                                                 AS run_rate_eur_per_day,
  (cost.n = 0)                                   AS net_unverified
FROM public.objectives o
CROSS JOIN LATERAL (
  SELECT COALESCE(sum(r.amount_eur), 0) AS total, count(*) AS n
    FROM public.revenue_ledger r
   WHERE o.period IS NULL OR r.occurred_on <@ o.period
) rev
CROSS JOIN LATERAL (
  SELECT COALESCE(sum(c.cost_eur), 0) AS total, count(*) AS n
    FROM public.cost_ledger c
   WHERE o.period IS NULL OR c.created_at::date <@ o.period
) cost;

COMMENT ON VIEW public.v_objective_progress IS
  'REVENUE_ENGINE_SPEC §11 — realized net = Σrevenue_ledger − Σcost_ledger in period, NEVER projections. net_unverified=true when the period has zero cost rows (§17-19 honest-state).';

-- ── v_opportunity_pipeline ──────────────────────────────────────────────────
DROP VIEW IF EXISTS public.v_opportunity_pipeline;
CREATE VIEW public.v_opportunity_pipeline AS
SELECT
  op.id, op.title, op.state, op.halal_verdict, op.score, op.score_dims,
  op.capital_required_eur, op.region, op.channel,
  op.engine_slug, e.title AS engine_title, e.title_tr AS engine_title_tr,
  e.lifecycle AS engine_lifecycle,
  op.created_by, op.created_at, op.updated_at
FROM public.opportunities op
JOIN public.revenue_engines e ON e.slug = op.engine_slug
ORDER BY op.score DESC NULLS LAST, op.created_at DESC;

-- ── v_snev (Sustainable Net Enterprise Value KPI) ───────────────────────────
-- Formula (spec §11): trailing-90d net × recurring_share − concentration
-- penalty. v1 recurring marker: revenue_ledger.meta->>'recurring' = 'true'
-- (rows without the marker count as non-recurring — honest floor).
-- Constants: settings revenue.snev.concentration_penalty_factor (default 0.2).
DROP VIEW IF EXISTS public.v_snev;
CREATE VIEW public.v_snev AS
WITH rev90 AS (
  SELECT COALESCE(sum(amount_eur), 0) AS revenue_90d,
         COALESCE(sum(amount_eur) FILTER (WHERE meta ->> 'recurring' = 'true'), 0)
           AS recurring_revenue_90d
    FROM public.revenue_ledger
   WHERE occurred_on >= CURRENT_DATE - 90
), by_client AS (
  SELECT COALESCE(max(client_total), 0) AS top_client_total
    FROM (SELECT sum(amount_eur) AS client_total
            FROM public.revenue_ledger
           WHERE occurred_on >= CURRENT_DATE - 90
           GROUP BY client) t
), cost90 AS (
  SELECT COALESCE(sum(cost_eur), 0) AS cost_90d
    FROM public.cost_ledger
   WHERE created_at >= now() - interval '90 days'
)
SELECT
  rev90.revenue_90d,
  cost90.cost_90d,
  round(rev90.revenue_90d - cost90.cost_90d, 2)   AS net_90d,
  CASE WHEN rev90.revenue_90d > 0
       THEN round(rev90.recurring_revenue_90d / rev90.revenue_90d, 4)
       ELSE 0 END                                 AS recurring_share,
  CASE WHEN rev90.revenue_90d > 0
       THEN round(by_client.top_client_total / rev90.revenue_90d, 4)
       ELSE 0 END                                 AS max_client_share,
  round(
    (rev90.revenue_90d - cost90.cost_90d)
    * CASE WHEN rev90.revenue_90d > 0
           THEN rev90.recurring_revenue_90d / rev90.revenue_90d ELSE 0 END
    - (rev90.revenue_90d - cost90.cost_90d)
      * CASE WHEN rev90.revenue_90d > 0
             THEN by_client.top_client_total / rev90.revenue_90d ELSE 0 END
      * fn_setting_numeric('revenue.snev.concentration_penalty_factor', 0.2)
  , 2)                                            AS snev_eur
FROM rev90, by_client, cost90;

GRANT SELECT ON public.v_objective_progress, public.v_opportunity_pipeline, public.v_snev
  TO authenticated;
