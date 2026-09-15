-- 20260915010000_w10_brain_truth.sql — W10: THE BRAIN THE CEO READS IS THE BRAIN THAT RUNS.
--
-- His word 2026-09-15 ("başla") on the four-line understanding report; audit findings F032 and F035
-- of STUDIO_AUDIT_HANDOFF §7. Measured on both engines BEFORE this file was written (2026-09-15):
--
--   company      media.creative: fable-5|false|40 ; fable-5.1|true|50    seats brain <> enabled: 14
--   construction media.creative: fable-5|true|50  ; fable-5.1|false|40   seats brain <> enabled: 14
--
-- Two separate lies behind those two lines:
--
-- F032 — his ruling of 2026-09-05 (the studio's creative brain is Claude Fable 5.1; the Opus row
--        rests) was made by hand on the company engine and never written into the chain. Every
--        machine built from the migrations therefore comes up with the brain he retired. The
--        construction engine above is that machine, and it has been wrong for ten days.
-- F035 — `agents.brain` of the 14 studio seats still says `fable-5`. The runtime routes through
--        `routing_rules` (worker-shim → loadPolicy → the enabled media.creative row), so the seats
--        have been RUNNING on Fable 5.1 while the CEO's own employees and directors pages showed
--        him the other one. The card lied; the work did not.
--
-- This file makes the ruling part of the machine, brings the label onto the router, and — because a
-- label that is corrected once drifts again the next time he switches a brain — keeps it there with a
-- trigger, so the pages cannot go stale behind `fn_update_routing` (§4b's door, MODEL_ROUTING_SPEC).
-- The door itself is untouched; the trigger only follows what it writes.
--
-- Scope, deliberately narrow: ONLY `task_class = 'media.creative'` rows that name a department in
-- `match`, and ONLY seats whose `brain_source = 'slot'` (the tier law derived it; a `ceo_override`
-- brain is HIS act and is never overwritten by a router). A department runs many task classes;
-- media.creative is the one that defines the studio's creative brain, so nothing wider is implied.
-- Idempotent: every statement is a no-op on a database already in the ruled state.

BEGIN;

-- A) his 2026-09-05 ruling, written into the chain (F032)
UPDATE public.routing_rules
   SET enabled = false, priority = 40, updated_at = now()
 WHERE task_class = 'media.creative' AND model = 'fable-5'
   AND (enabled OR priority IS DISTINCT FROM 40);

UPDATE public.routing_rules
   SET enabled = true, priority = 50, model_id = coalesce(model_id, 'fable-5.1'), updated_at = now()
 WHERE task_class = 'media.creative' AND model = 'fable-5.1'
   AND (NOT enabled OR priority IS DISTINCT FROM 50 OR model_id IS NULL);

-- B) the label follows the router, once, for the seats that exist today (F035)
UPDATE public.agents a
   SET brain = r.brain, updated_at = now()
  FROM (SELECT rr.match->>'department' AS dept, coalesce(rr.model_id, rr.model) AS brain
          FROM public.routing_rules rr
         WHERE rr.task_class = 'media.creative' AND rr.enabled AND rr.match ? 'department') r
 WHERE a.department = r.dept
   AND a.brain_source = 'slot'
   AND a.employment_status <> 'archived'
   AND a.brain IS DISTINCT FROM r.brain;

-- C) and it STAYS true: the seats' brain follows the enabled creative row from now on
CREATE OR REPLACE FUNCTION public.fn_agents_brain_follows_routing()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- only the department-scoped creative row of a studio-shaped department, only when it is the one
  -- that routes, and only seats whose brain was DERIVED (brain_source='slot'). A ceo_override brain
  -- is the CEO's own choice and outranks the router (MODEL_ROUTING_SPEC §4b).
  IF NEW.task_class = 'media.creative' AND NEW.enabled AND NEW.match ? 'department' THEN
    UPDATE public.agents a
       SET brain = coalesce(NEW.model_id, NEW.model), updated_at = now()
     WHERE a.department = NEW.match->>'department'
       AND a.brain_source = 'slot'
       AND a.employment_status <> 'archived'
       AND a.brain IS DISTINCT FROM coalesce(NEW.model_id, NEW.model);
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.fn_agents_brain_follows_routing() IS
  'W10 (2026-09-15, audit F035): agents.brain of a department''s slot-derived seats follows the enabled department-scoped media.creative routing row, so the brain the CEO reads on his employees and directors pages is the brain the runtime actually calls. Never touches a ceo_override brain.';

DROP TRIGGER IF EXISTS trg_agents_brain_follows_routing ON public.routing_rules;
CREATE TRIGGER trg_agents_brain_follows_routing
  AFTER INSERT OR UPDATE ON public.routing_rules
  FOR EACH ROW EXECUTE FUNCTION public.fn_agents_brain_follows_routing();

-- D) the change is on the record where routing changes are read
INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'ceo', 'system', 'routing_change',
       jsonb_build_object(
         'reason', 'W10 brain truth: his 2026-09-05 ruling written into the chain (media.creative fable-5.1 enabled, fable-5 disabled); the studio seats'' agents.brain now follows the enabled row and is kept there by trg_agents_brain_follows_routing (audit F032, F035)',
         'seats', (SELECT count(*) FROM public.agents WHERE department = 'media-studio' AND employment_status <> 'archived'))
 WHERE NOT EXISTS (SELECT 1 FROM public.audit_log WHERE action = 'routing_change'
                    AND payload->>'reason' LIKE 'W10 brain truth%');

-- E) guardrails: the file either did its work or says so
DO $$
DECLARE v_enabled text; v_stale int;
BEGIN
  IF EXISTS (SELECT 1 FROM public.routing_rules WHERE task_class = 'media.creative') THEN
    IF (SELECT count(*) FROM public.routing_rules WHERE task_class = 'media.creative' AND enabled) <> 1 THEN
      RAISE EXCEPTION 'W10: exactly one enabled media.creative row expected, found %',
        (SELECT count(*) FROM public.routing_rules WHERE task_class = 'media.creative' AND enabled);
    END IF;
    SELECT coalesce(model_id, model) INTO v_enabled
      FROM public.routing_rules WHERE task_class = 'media.creative' AND enabled;
    IF v_enabled <> 'fable-5.1' THEN
      RAISE EXCEPTION 'W10: the studio creative brain must be fable-5.1 (his 2026-09-05 ruling), found %', v_enabled;
    END IF;
    SELECT count(*) INTO v_stale
      FROM public.agents a
     WHERE a.department = 'media-studio' AND a.brain_source = 'slot'
       AND a.employment_status <> 'archived' AND a.brain IS DISTINCT FROM v_enabled;
    IF v_stale > 0 THEN
      RAISE EXCEPTION 'W10: % media-studio seats still read a brain that is not the enabled one', v_stale;
    END IF;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_agents_brain_follows_routing' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'W10: the brain-follows-routing trigger is missing';
  END IF;
END $$;

COMMIT;
