-- CEO catch 2026-07-26 11:10 (screenshot of Canlı Operasyonlar + the rail):
-- "canlı türkçe değil hala ingilizce."
--
-- Two defects behind one symptom, and the second is the ugly one.
--
-- (1) 009300 gave tasks a Turkish leg but only the RAIL was taught to read it;
--     the Live Operations page and the Intelligence tail still render `label`.
--     That is a code fix (this migration only carries the schema for it).
--
-- (2) The real disgrace: `label` IS the task objective, and a scout task's
--     objective is the ENTIRE 1682-character brief. The CEO's one-line feed row
--     was rendering a full page of instructions — in English, because a brief is
--     an artifact and artifacts are English (language directive). No amount of
--     translation fixes that; a brief is not a label.
--
-- So the shape becomes what the CEO's mental model already is: a task has a
-- SHORT HEADLINE in both languages, and separately the long instruction it was
-- given. The row shows the headline; clicking it opens the instruction.
--
--   tasks.label     — short English headline (artifact language)
--   tasks.label_tr  — short Turkish headline (the CEO's screen)
--   tasks.objective — unchanged: the instruction the worker executes
--
-- `objective_tr` (born 30 minutes ago in 009300, no consumer outside this
-- session) is renamed rather than duplicated: `label` / `label_tr` is a pair,
-- `label` / `objective_tr` was a name that lied about its own job.

BEGIN;

ALTER TABLE public.tasks RENAME COLUMN objective_tr TO label_tr;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS label text;

COMMENT ON COLUMN public.tasks.label IS
  'Short English headline for CEO-facing feeds. NULL falls back to the first line of objective — never an ellipsis (CEO ruling: shorten at the source).';
COMMENT ON COLUMN public.tasks.label_tr IS
  'Short Turkish headline for CEO-facing feeds. NULL falls back to label, then to the first line of objective.';

-- Backfill. The English leg is each task''s OWN first line — a real sentence it
-- already contains, not a truncation and not an invention. The Turkish leg is
-- filled only for the two families whose text is known here; everything else
-- stays NULL and falls back honestly rather than being machine-translated.
UPDATE public.tasks
   SET label = NULLIF(btrim(split_part(objective, E'\n', 1)), '')
 WHERE label IS NULL;

UPDATE public.tasks
   SET label    = 'Market scan for live revenue opportunities',
       label_tr = 'Piyasa taraması: canlı gelir fırsatları'
 WHERE objective LIKE 'Market scan:%';

UPDATE public.tasks
   SET label    = 'Halt the discovery engine''s scheduled run',
       label_tr = 'Keşif motorunun zamanlanmış koşusunu durdur'
 WHERE objective LIKE 'Stop the discovery engine%';

-- v_live_ops rebuilt whole (same reason as 009300: the union stays readable).
-- The fallback chain lives HERE so every consumer — page, rail, tail — gets the
-- same answer without repeating the rule in three components.
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
    COALESCE(t.label, NULLIF(btrim(split_part(t.objective, E'\n', 1)), ''), r.model_id) AS label,
    COALESCE(t.label_tr, t.label, NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS label_tr
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
    COALESCE(t.label, NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS label,
    COALESCE(t.label_tr, t.label, NULLIF(btrim(split_part(t.objective, E'\n', 1)), '')) AS label_tr
   FROM task_events e
     LEFT JOIN tasks t ON t.id = e.task_id
  WHERE e.created_at >= (now() - '24:00:00'::interval);

GRANT SELECT ON public.v_live_ops TO authenticated;

COMMIT;

-- ROLLBACK:
--   ALTER TABLE public.tasks DROP COLUMN label;
--   ALTER TABLE public.tasks RENAME COLUMN label_tr TO objective_tr;
--   (recreate v_live_ops from 20260726009300)
