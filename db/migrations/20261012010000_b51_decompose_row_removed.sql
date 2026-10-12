-- B51 — one row splits a job: the unread 'decompose' routing row goes; 'orchestration' stays.
-- His word, 2026-10-12 (ceo-approvals: decompose-row-removed-orchestration-stays-2026-10-12):
--   "ikisinden biri kaldırılsın … genel müdürse, general managersa … Hamza, o zaman orchestration kalsın."
--
-- Measured before this file (2026-10-12): decompose.ts routes its own drafting call through the 'orchestration'
-- row (route({ ...ci, task_class: "orchestration" })); no code, function or test reads a 'decompose' row. Both
-- were seeded on 2026-07-08 (3a90c4cd) and carry the same model and effort, so removing the unread one changes
-- no call the company makes. The row was also offered to the drafting model as a legal work class
-- (kernel policy.ts workClasses: every row without a role slot); removing it takes it out of that list too.
-- 0 tasks on the company carry task_class 'decompose'. No foreign key and no DELETE trigger on routing_rules
-- (pg_trigger read on the company: only trg_agents_brain_follows_routing, AFTER INSERT OR UPDATE).
--
-- The row is photographed whole in audit_log before it goes; the delete is guarded to exactly the rows read.
-- The routing seed loses the row in the same commit, so a fresh engine never gets it back (the importer only
-- inserts missing rows). 20261010080000 still names 'decompose' in its IN list; it reached the company and is
-- never edited — on a fresh chain it runs before this file and the row it touched is removed here.

DO $$
DECLARE
  v_rows jsonb;
  v_n int;
  v_deleted int;
BEGIN
  SELECT coalesce(jsonb_agg(to_jsonb(r) ORDER BY r.id), '[]'::jsonb), count(*)
    INTO v_rows, v_n
    FROM public.routing_rules r
   WHERE r.task_class = 'decompose';

  IF v_n = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES ('migration-b51', 'system', 'routing_rule.removed', jsonb_build_object(
    'task_class', 'decompose',
    'reason', 'one row splits a job: decompose.ts reads orchestration; the decompose row was read by no code',
    'authority', 'ceo-approvals:decompose-row-removed-orchestration-stays-2026-10-12',
    'kept', 'orchestration',
    'rows', v_rows));

  DELETE FROM public.routing_rules WHERE task_class = 'decompose';
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted <> v_n THEN
    RAISE EXCEPTION 'decompose row removal: read % row(s), deleted %', v_n, v_deleted;
  END IF;
END
$$;
