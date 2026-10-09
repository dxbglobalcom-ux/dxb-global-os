-- B51 move 3 — EFFORT BY THE KIND OF WORK. Plan approved 2026-10-09 (b51-plan-approved-2026-10-09):
-- "Düşünme seviyesi (hamle 3): kritik kararlar medium'dan xhigh'a, kod yazımı high'a çıkar; ucuz işler low'da kalır."
--
-- Measured before this file (both engines, 2026-10-10): runs took their effort from the row that won the
-- TIER — on the company the L1 seat rows at 'medium' — so the class rows' values never reached a run;
-- strategy / architecture / final-approval read 'max', a level nothing in the plan runs at. P3 (73854771)
-- makes the class lead the route, so from now on the class row's effort IS the run's effort. This file sets
-- it; the resident scheduler restarts after it, so P3 and these efforts go live together.
-- Talking seats (chat.*, voice.*) are P6's and are untouched. updated_at is left alone (loadPolicy orders
-- by it). Every row written is department-less; the studio's own row is not touched.

DO $$
DECLARE
  v_rows jsonb;
BEGIN
  -- the photograph first: which rows move, from what to what
  SELECT coalesce(jsonb_agg(jsonb_build_object('id', id, 'task_class', task_class, 'old', effort, 'new', target)
                            ORDER BY task_class), '[]'::jsonb)
    INTO v_rows
    FROM (SELECT id, task_class, effort,
                 CASE WHEN task_class IN ('strategy', 'architecture', 'final-approval', 'slot.critical_decision')
                      THEN 'xhigh' ELSE 'high' END AS target
            FROM public.routing_rules
           WHERE department_id IS NULL
             AND task_class IN ('strategy', 'architecture', 'final-approval', 'slot.critical_decision',
                                'code.standard', 'code.bulk', 'slot.coding')) x
   WHERE effort IS DISTINCT FROM target;

  UPDATE public.routing_rules r SET effort = e->>'new'
    FROM jsonb_array_elements(v_rows) e
   WHERE r.id = (e->>'id')::uuid;

  -- written on his word, not in his name
  IF jsonb_array_length(v_rows) > 0 THEN
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES ('migration-b51', 'system', 'routing_change',
            jsonb_build_object('reason', 'B51 move 3 efforts: critical decisions at xhigh, code at high, cheap work stays low',
                               'authority', 'ceo-approvals:b51-plan-approved-2026-10-09',
                               'rows', v_rows));
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.routing_rules
              WHERE department_id IS NULL AND enabled AND effort = 'max' AND task_class NOT LIKE 'chat.%') THEN
    RAISE EXCEPTION 'B51 move 3: a department-less non-chat row is still at max';
  END IF;
END $$;
