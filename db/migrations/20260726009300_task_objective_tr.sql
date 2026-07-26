-- CEO order 2026-07-26 10:45: "şu sağ tarafta rayda canlı akış içinde ingilizce
-- var. sadece canlı akış işleri bundan sonra türkçe sayfadayken türkçe olsun."
--
-- The live ticker's label is `tasks.objective`, and task objectives are written
-- in English by the binding language directive (every project artifact is
-- English; only the CEO's chat replies are Turkish). Both rules are right, and
-- they collide on exactly one surface: the rail he reads all day.
--
-- Earlier disposition (2026-07-24) was a CEO waiver for this leg. He has now
-- withdrawn it for the ticker, so the fix is the same shape the rest of the
-- system already uses for CEO-visible DB text: a second column, written by
-- whoever creates the row, rendered by locale with an honest fallback. The
-- artifact stays English; the CEO's screen speaks Turkish.

BEGIN;

ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS objective_tr text;

COMMENT ON COLUMN public.tasks.objective_tr IS
  'CEO-facing Turkish label for the live ticker. The objective itself stays English (language directive); this is the i18n surface. NULL falls back to objective.';

-- v_live_ops gains the Turkish leg beside the existing label. Rebuilt whole so
-- the union stays readable rather than patched in two places.
DROP VIEW IF EXISTS public.v_live_ops;
CREATE VIEW public.v_live_ops AS
 SELECT 'run'::text AS source,
    r.id::text AS source_id,
    r.started_at AS ts,
    r.status,
    r.task_id,
    r.workflow_run_id,
    COALESCE(a.slug, 'system'::text) AS actor,
    COALESCE(r.model_id, 'run'::text) AS event,
    COALESCE(t.objective, r.model_id) AS label,
    t.objective_tr AS label_tr
   FROM agent_runs r
     LEFT JOIN agents a ON a.id = r.employee_id
     LEFT JOIN tasks t ON t.id = r.task_id
  WHERE r.started_at >= (now() - '24:00:00'::interval)
     OR (r.status = ANY (ARRAY['running'::text, 'waiting_approval'::text]))
UNION ALL
 SELECT 'task_event'::text AS source,
    e.id::text AS source_id,
    e.created_at AS ts,
    COALESCE(e.to_status, e.event) AS status,
    e.task_id,
    NULL::uuid AS workflow_run_id,
    e.actor,
    e.event,
    t.objective AS label,
    t.objective_tr AS label_tr
   FROM task_events e
     LEFT JOIN tasks t ON t.id = e.task_id
  WHERE e.created_at >= (now() - '24:00:00'::interval);

GRANT SELECT ON public.v_live_ops TO authenticated;

COMMIT;

-- ROLLBACK:
--   (recreate v_live_ops without label_tr; ALTER TABLE public.tasks DROP COLUMN objective_tr;)
