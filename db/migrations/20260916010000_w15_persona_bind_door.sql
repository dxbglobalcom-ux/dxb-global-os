-- 20260916010000_w15_persona_bind_door.sql — W15: personas are bound through a door, not by hand.
--
-- The gap (studio audit F056, CONFIRMED by the checker and re-measured here on 2026-09-16):
-- NO function in the company set `agents.persona_id`. Every binding the holding has — 213 of 219
-- agents — was written by a raw `UPDATE agents SET persona_id = …` from a shell script, which means
-- the one act that decides WHICH WRITTEN IDENTITY A LIVE EMPLOYEE SPEAKS WITH had no gate of its
-- own, left no audit row, and could silently disagree with `agents.persona_version`. The activation
-- trigger `enforce_persona_gate_on_activation` refuses to ACTIVATE an agent whose persona failed its
-- quality gate, but nothing stopped a bad persona being bound to an agent that was already active.
--
-- The door. `fn_persona_bind(agent, persona, actor)` is now the only way a persona is bound:
--   * it refuses a persona whose `quality_gate` is not 'passed' or whose author is not a v2 author
--     (the same rule the activation trigger enforces, applied at BIND time instead of afterwards);
--   * it refuses a persona that belongs to another employee, which a raw UPDATE could not see;
--   * it keeps `persona_version` true by copying it from the persona row in the same statement —
--     the drift the audit found between the version a page shows and the persona actually bound;
--   * it writes one `audit_log` row per bind and per unbind, so the act is visible afterwards;
--   * it is idempotent: binding what is already bound changes nothing and writes no audit row, so
--     the sync script may run twice without inventing history.
-- Unbinding (persona NULL) stays possible, because the demo-hire and bench scripts need it, but it
-- is refused for an ACTIVE employee — an active agent without a persona is exactly what the
-- activation gate exists to prevent.
--
-- NOT ONE EXISTING BINDING IS CHANGED BY THIS MIGRATION. It creates a function and nothing else;
-- the snapshot before and after is 213 bound / 219 agents / md5 1e2b5552947189574efcc386b8815358.

CREATE OR REPLACE FUNCTION public.fn_persona_bind(
  p_agent_id   uuid,
  p_persona_id uuid,
  p_actor      text DEFAULT 'sync'
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_old_persona  uuid;
  v_slug         text;
  v_employment   text;
  v_gate         text;
  v_author       text;
  v_version      integer;
  v_owner        uuid;
BEGIN
  SELECT persona_id, slug, employment_status
    INTO v_old_persona, v_slug, v_employment
    FROM public.agents WHERE id = p_agent_id;

  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'persona bind denied: no agent %', p_agent_id;
  END IF;

  -- idempotent: the same binding twice is not an event
  IF v_old_persona IS NOT DISTINCT FROM p_persona_id THEN
    RETURN p_persona_id;
  END IF;

  IF p_persona_id IS NULL THEN
    IF v_employment = 'active' THEN
      RAISE EXCEPTION 'persona unbind denied: agent % (%) is active — an active employee without a persona is what the activation gate forbids', v_slug, p_agent_id;
    END IF;
    UPDATE public.agents SET persona_id = NULL, updated_at = now() WHERE id = p_agent_id;
    INSERT INTO public.audit_log (actor, actor_type, action, payload)
    VALUES (p_actor, 'system', 'persona_unbind',
            jsonb_build_object('agent_id', p_agent_id, 'slug', v_slug, 'from_persona', v_old_persona));
    RETURN NULL;
  END IF;

  SELECT quality_gate, author, version, employee_id
    INTO v_gate, v_author, v_version, v_owner
    FROM public.personas WHERE id = p_persona_id;

  IF v_gate IS NULL THEN
    RAISE EXCEPTION 'persona bind denied: no persona %', p_persona_id;
  END IF;
  IF v_owner IS DISTINCT FROM p_agent_id THEN
    RAISE EXCEPTION 'persona bind denied: persona % belongs to employee %, not to % (%)', p_persona_id, v_owner, p_agent_id, v_slug;
  END IF;
  IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('opus-5','fable-5','hr-factory') THEN
    RAISE EXCEPTION 'persona bind denied: persona % has quality_gate=%, author=% (need passed + a v2 author)', p_persona_id, v_gate, v_author;
  END IF;

  UPDATE public.agents
     SET persona_id      = p_persona_id,
         persona_version = 'v' || v_version::text,
         updated_at      = now()
   WHERE id = p_agent_id;

  INSERT INTO public.audit_log (actor, actor_type, action, payload)
  VALUES (p_actor, 'system', 'persona_bind',
          jsonb_build_object('agent_id', p_agent_id, 'slug', v_slug,
                             'from_persona', v_old_persona, 'to_persona', p_persona_id,
                             'persona_version', 'v' || v_version::text));

  RETURN p_persona_id;
END;
$fn$;

COMMENT ON FUNCTION public.fn_persona_bind(uuid, uuid, text) IS
  'W15 / audit F056 — the only door onto agents.persona_id: gate-checked, ownership-checked, keeps persona_version true, writes one audit_log row per bind and unbind, idempotent.';
