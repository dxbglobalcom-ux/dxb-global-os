-- Same defect as 010000, one surface further in: the 07:00 briefing.
--
-- v_morning_briefing (0018) built its two human lists with `left(objective, 80)`
-- — a HARD CUT at 80 characters, mid-word, which the Intelligence page then
-- renders inside a `truncate` class, producing exactly the visible "…" the CEO
-- banned (ruling 2026-07-18: shorten at the source, never with an ellipsis).
-- With scout briefs in the table those 80 characters are the opening clause of
-- a 1700-character instruction, which is worse than useless on a briefing line.
--
-- Now that a task carries a real headline (010000), both lists read it, in both
-- languages, with the same fallback chain v_live_ops uses. Nothing is cut.

BEGIN;

CREATE OR REPLACE VIEW public.v_morning_briefing
WITH (security_invoker = true) AS
WITH overnight AS (
  SELECT (((now() AT TIME ZONE 'Europe/Berlin')::date - 1)
          + time '19:00') AT TIME ZONE 'Europe/Berlin' AS start_ts
),
work_counts AS (
  SELECT coalesce(jsonb_object_agg(s.to_status, s.cnt), '{}'::jsonb) AS by_status,
         coalesce(sum(s.cnt), 0)::int AS total_events
  FROM (
    SELECT e.to_status, count(*)::int AS cnt
    FROM public.task_events e, overnight o
    WHERE e.created_at >= o.start_ts AND e.to_status IS NOT NULL
    GROUP BY e.to_status
  ) s
),
work_done AS (
  SELECT coalesce(
           jsonb_agg(jsonb_build_object(
             'label', coalesce(t.label, nullif(btrim(split_part(t.objective, E'\n', 1)), '')),
             'label_tr', coalesce(t.label_tr, t.label,
                                  nullif(btrim(split_part(t.objective, E'\n', 1)), '')),
             'department', t.department
           ) ORDER BY d.last_at DESC),
           '[]'::jsonb
         ) AS recent_done
  FROM (
    SELECT e.task_id, max(e.created_at) AS last_at
    FROM public.task_events e, overnight o
    WHERE e.created_at >= o.start_ts AND e.to_status = 'done'
    GROUP BY e.task_id
    ORDER BY max(e.created_at) DESC
    LIMIT 5
  ) d
  JOIN public.tasks t ON t.id = d.task_id
),
appr_counts AS (
  SELECT coalesce(jsonb_object_agg(r.risk_class, r.cnt), '{}'::jsonb) AS by_risk,
         coalesce(sum(r.cnt), 0)::int AS pending_total
  FROM (
    SELECT a.risk_class, count(*)::int AS cnt
    FROM public.approvals a
    WHERE a.status = 'pending'
    GROUP BY a.risk_class
  ) r
),
appr_oldest AS (
  SELECT coalesce(
           jsonb_agg(jsonb_build_object(
             'action_type', p.action_type,
             'label', p.label,
             'label_tr', p.label_tr,
             'risk_class', p.risk_class,
             'waiting_since', p.created_at
           ) ORDER BY p.created_at ASC),
           '[]'::jsonb
         ) AS oldest
  FROM (
    SELECT a.action_type, a.risk_class, a.created_at,
           coalesce(t.label, nullif(btrim(split_part(t.objective, E'\n', 1)), '')) AS label,
           coalesce(t.label_tr, t.label,
                    nullif(btrim(split_part(t.objective, E'\n', 1)), '')) AS label_tr
    FROM public.approvals a
    JOIN public.tasks t ON t.id = a.task_id
    WHERE a.status = 'pending'
    ORDER BY a.created_at ASC
    LIMIT 5
  ) p
),
cost_by_dept AS (
  SELECT coalesce(c.department, '—') AS dept,
         sum(c.cost_eur)::numeric(12, 6) AS total_eur
  FROM public.cost_ledger c
  WHERE c.created_at >= now() - interval '24 hours'
  GROUP BY 1
),
cost_block AS (
  SELECT coalesce(sum(total_eur), 0)::numeric(12, 6) AS total_24h,
         coalesce(
           (SELECT jsonb_agg(jsonb_build_object('department', d.dept, 'total_eur', d.total_eur)
                             ORDER BY d.total_eur DESC)
            FROM (SELECT dept, total_eur FROM cost_by_dept ORDER BY total_eur DESC LIMIT 3) d),
           '[]'::jsonb
         ) AS top_departments
  FROM cost_by_dept
)
SELECT 1 AS sort,
       'overnight_work' AS block,
       jsonb_build_object(
         'window_start', (SELECT start_ts FROM overnight),
         'total_events', (SELECT total_events FROM work_counts),
         'by_status', (SELECT by_status FROM work_counts),
         'recent_done', (SELECT recent_done FROM work_done)
       ) AS payload
UNION ALL
SELECT 2,
       'approvals',
       jsonb_build_object(
         'pending_total', (SELECT pending_total FROM appr_counts),
         'by_risk', (SELECT by_risk FROM appr_counts),
         'oldest', (SELECT oldest FROM appr_oldest)
       )
UNION ALL
SELECT 3,
       'cost_24h',
       jsonb_build_object(
         'total_eur', (SELECT total_24h FROM cost_block),
         'top_departments', (SELECT top_departments FROM cost_block)
       );

COMMENT ON VIEW public.v_morning_briefing IS
  'Phase 9 morning briefing single source (3 blocks, fixed sort). LLM rewords rows only — never invents content. Human lists carry task headlines (label/label_tr), never truncated objectives.';

GRANT SELECT ON public.v_morning_briefing TO authenticated;
GRANT SELECT ON public.v_morning_briefing TO service_role;

COMMIT;

-- ROLLBACK: re-run db/migrations/20260710000018_briefing_view.sql
