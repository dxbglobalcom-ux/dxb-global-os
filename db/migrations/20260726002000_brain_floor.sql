-- W1.2 (CEO decision 2026-07-26, option B): the employee brain becomes a real
-- FLOOR instead of a decoration.
--
-- Measured before this migration:
--   fn_select_model      -> prosrc does NOT contain 'brain' (the §4b step-0
--                           contract was specified 2026-07-12 and never built)
--   TypeScript routers   -> zero non-test reads of agents.brain
--   worker-shim:153      -> resolves the model from task.model_tier ALONE
--   quality_score        -> NULL on fable-5 AND claude-sonnet-5 (only
--                           deepseek-v4-pro carries 100), so the existing score
--                           column cannot rank the roster
--   205 agent rows       -> brain_source='slot' after U21, so the column now
--                           displays a model that decides nothing
--
-- The CEO caught exactly this ("183 sonnet nedir?"): the workforce page shows a
-- brain per employee while the real choice is made per task class. Option A was
-- to make the column honest ("task-based"); the CEO chose option B — make the
-- column actually mean something.
--
-- THE RULE (MODEL_ROUTING_SPEC §4f): the brain is a FLOOR, never a ceiling.
--   * it may RAISE a task's tier  (a director's routine gathering runs on Opus 5)
--   * it may NEVER lower one      (a Sonnet-brained specialist writing outbound
--                                  content still runs on Opus 5 — the class wins)
-- Ranking lives in ONE place: model_catalog.tier_floor, the best tier a model is
-- allowed to serve. L1 < L2 < L3 < L4, lower is better.
--
-- Guardrails are absolute and a floor cannot bypass them: banned models are never
-- selected, mechanical_only models never serve a verdict-capable slot, and the
-- budget hard-stop still cuts every non-critical selection.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Where a model is allowed to sit. NULL = "not rated", which behaves as no
--    floor at all rather than as a silent promotion.
-- ---------------------------------------------------------------------------
ALTER TABLE public.model_catalog
  ADD COLUMN IF NOT EXISTS tier_floor text
    CHECK (tier_floor IS NULL OR tier_floor IN ('L1', 'L2', 'L3', 'L4'));

COMMENT ON COLUMN public.model_catalog.tier_floor IS
  'Best tier this model may serve (L1 best). Source of the quality ordering used by the §4f brain floor; NULL = unrated, no floor.';

UPDATE public.model_catalog SET tier_floor = 'L1' WHERE id = 'fable-5';
UPDATE public.model_catalog SET tier_floor = 'L2' WHERE id IN ('claude-sonnet-5', 'codex-5.6');
-- deepseek-v4-pro is mechanical_only: bulk reads, never a verdict, so its best
-- seat is the clerical tier no matter how large its context is.
UPDATE public.model_catalog SET tier_floor = 'L4' WHERE id = 'deepseek-v4-pro';
-- Dismissed models stay unrated: a retired row must never be able to raise or
-- lower anything if it is somehow still referenced.

-- ---------------------------------------------------------------------------
-- 2. The ordering, as data. 99 for anything unknown so a typo can never win a
--    comparison by accident.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_tier_rank(p_tier text)
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_tier
           WHEN 'L1' THEN 1
           WHEN 'L2' THEN 2
           WHEN 'L3' THEN 3
           WHEN 'L4' THEN 4
           ELSE 99
         END
$$;

COMMENT ON FUNCTION public.fn_tier_rank(text) IS
  'Quality ordering of the routing tiers: lower is better (L1=1 .. L4=4, unknown=99).';

-- ---------------------------------------------------------------------------
-- 3. The floor itself. Returns the tier a task should ACTUALLY run at once the
--    assigned employee's brain is taken into account.
--
--    Deliberately fail-open toward the task's own tier: an unassigned task, an
--    unassigned brain (brain_source='default' — the never-chosen placeholder),
--    an unrated model, or a dismissed one all leave the task exactly where the
--    routing table put it. A floor is an upgrade path, never a new failure mode.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_effective_tier(p_task_tier text, p_agent_id uuid)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (SELECT CASE
              WHEN fn_tier_rank(m.tier_floor) < fn_tier_rank(p_task_tier)
                THEN m.tier_floor
              ELSE p_task_tier
            END
       FROM agents a
       JOIN model_catalog m ON m.id = a.brain
      WHERE a.id = p_agent_id
        AND a.brain_source <> 'default'   -- placeholder never raises anything
        AND m.status = 'active'
        AND m.banned = false
        AND m.tier_floor IS NOT NULL),
    p_task_tier);
$$;

COMMENT ON FUNCTION public.fn_effective_tier(text, uuid) IS
  'MODEL_ROUTING_SPEC §4f: an employee brain raises a task tier, never lowers it. Falls back to the task tier for unassigned/unrated/dismissed brains.';

-- ---------------------------------------------------------------------------
-- 4. §4b step-0, finally built. The slot lane has no tiers, so the brain enters
--    it the way the spec always said it should: a CEO override on an employee
--    wins the selection outright — but only after the same guardrails every
--    other candidate faces.
--
--    DROP + CREATE rather than CREATE OR REPLACE: adding a parameter would
--    otherwise leave two overloads behind and make an 8-argument call ambiguous.
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.fn_select_model(text, uuid, text, integer, numeric, uuid, boolean, boolean);

CREATE FUNCTION public.fn_select_model(
  p_role_slot text,
  p_department_id uuid DEFAULT NULL::uuid,
  p_risk text DEFAULT 'low'::text,
  p_min_context integer DEFAULT NULL::integer,
  p_est_cost numeric DEFAULT NULL::numeric,
  p_run_id uuid DEFAULT NULL::uuid,
  p_critical boolean DEFAULT false,
  p_log boolean DEFAULT true,
  p_agent_id uuid DEFAULT NULL::uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_cand record;
  v_chosen_model text;
  v_chosen_rule uuid;
  v_eliminated jsonb := '[]'::jsonb;
  v_decision_id bigint;
  v_override record;
BEGIN
  IF NOT (p_role_slot = ANY (fn_routing_slots())) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown role_slot ' || p_role_slot);
  END IF;
  IF p_risk NOT IN ('low','medium','high','critical') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown risk ' || p_risk);
  END IF;

  -- Budget hard-stop gate (COST spec: applied at intake, critical class
  -- exempt — approvals/outbox/health/backup keep running).
  IF NOT p_critical AND EXISTS (SELECT 1 FROM budget_state WHERE hard_stopped) THEN
    IF p_log THEN
      INSERT INTO decision_log (run_id, decided_by, decision, rationale, risk, outcome)
      VALUES (p_run_id, 'orchestrator', 'routing_decision',
              'slot=' || p_role_slot || '; refused: budget hard-stop active, task not critical-class',
              p_risk, 'refused_budget_hard_stop')
      RETURNING id INTO v_decision_id;
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'BUDGET_HARD_STOP',
                              'decision_id', v_decision_id);
  END IF;

  -- Step 0 (§4b): a CEO-assigned brain wins before the rule scan — but the
  -- guardrails still apply, so an override can never smuggle a banned model in
  -- or put a mechanical-only model on a slot that produces a verdict.
  IF p_agent_id IS NOT NULL THEN
    SELECT a.brain, m.status, m.banned, m.mechanical_only
      INTO v_override
      FROM agents a
      JOIN model_catalog m ON m.id = a.brain
     WHERE a.id = p_agent_id
       AND a.brain_source = 'ceo_override';

    IF FOUND THEN
      IF v_override.status <> 'active' THEN
        v_eliminated := v_eliminated || jsonb_build_object('model_id', v_override.brain,
          'reason', 'ceo_override model status ' || v_override.status);
      ELSIF v_override.banned THEN
        v_eliminated := v_eliminated || jsonb_build_object('model_id', v_override.brain,
          'reason', 'ceo_override model banned');
      ELSIF v_override.mechanical_only
            AND NOT (p_role_slot = ANY (fn_routing_mechanical_slots())) THEN
        v_eliminated := v_eliminated || jsonb_build_object('model_id', v_override.brain,
          'reason', 'ceo_override mechanical_only model on verdict-capable slot');
      ELSE
        IF p_log THEN
          INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                                    alternatives, risk, outcome)
          VALUES (p_run_id, 'orchestrator', 'routing_decision',
                  'slot=' || p_role_slot || '; agent=' || p_agent_id
                    || '; model=' || v_override.brain || '; ceo_override brain wins (§4b step 0)',
                  v_eliminated, p_risk, 'selected_ceo_override')
          RETURNING id INTO v_decision_id;
        END IF;
        RETURN jsonb_build_object('ok', true, 'model_id', v_override.brain,
          'rule_id', NULL, 'decision_id', v_decision_id,
          'source', 'ceo_override', 'considered', v_eliminated);
      END IF;
    END IF;
  END IF;

  -- Rule scan: department-specific beats global, then priority DESC (same
  -- direction as the legacy kernel policy — higher priority wins).
  FOR v_cand IN
    SELECT r.id AS rule_id, r.model_id, r.risk_max, r.min_context,
           r.cost_cap_per_task, r.department_id,
           m.status, m.banned, m.mechanical_only, m.context_window
      FROM routing_rules r
      JOIN model_catalog m ON m.id = r.model_id
     WHERE r.enabled
       AND r.role_slot = p_role_slot
       AND (r.department_id IS NULL OR r.department_id = p_department_id)
     ORDER BY (r.department_id IS NOT NULL) DESC, r.priority DESC, r.updated_at DESC
  LOOP
    IF v_cand.risk_max IS NOT NULL AND fn_risk_rank(p_risk) > fn_risk_rank(v_cand.risk_max) THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'risk above rule risk_max');
    ELSIF v_cand.min_context IS NOT NULL AND COALESCE(p_min_context, 0) < v_cand.min_context THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'task context below rule min_context');
    ELSIF v_cand.cost_cap_per_task IS NOT NULL AND p_est_cost IS NOT NULL
          AND p_est_cost > v_cand.cost_cap_per_task THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'estimated cost above rule cap');
    ELSIF v_cand.status <> 'active' THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'model status ' || v_cand.status);
    ELSIF v_cand.banned THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'model banned');
    ELSIF v_cand.mechanical_only
          AND NOT (p_role_slot = ANY (fn_routing_mechanical_slots())) THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'mechanical_only model on verdict-capable slot');
    ELSIF v_cand.context_window IS NOT NULL AND p_min_context IS NOT NULL
          AND v_cand.context_window < p_min_context THEN
      v_eliminated := v_eliminated || jsonb_build_object('rule_id', v_cand.rule_id,
        'model_id', v_cand.model_id, 'reason', 'model context_window below task need');
    ELSE
      v_chosen_model := v_cand.model_id;
      v_chosen_rule  := v_cand.rule_id;
      EXIT;
    END IF;
  END LOOP;

  IF v_chosen_model IS NULL THEN
    IF p_log THEN
      INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                                alternatives, risk, outcome)
      VALUES (p_run_id, 'orchestrator', 'routing_decision',
              'slot=' || p_role_slot || '; no usable candidate',
              v_eliminated, p_risk, 'blocked_no_model')
      RETURNING id INTO v_decision_id;
    END IF;
    RETURN jsonb_build_object('ok', false, 'error', 'NO_MODEL_AVAILABLE',
      'decision_id', v_decision_id, 'considered', v_eliminated);
  END IF;

  IF p_log THEN
    INSERT INTO decision_log (run_id, decided_by, decision, rationale,
                              alternatives, risk, outcome)
    VALUES (p_run_id, 'orchestrator', 'routing_decision',
            'slot=' || p_role_slot || '; rule=' || v_chosen_rule || '; model=' || v_chosen_model,
            v_eliminated, p_risk, 'selected')
    RETURNING id INTO v_decision_id;
  END IF;

  RETURN jsonb_build_object('ok', true, 'model_id', v_chosen_model,
    'rule_id', v_chosen_rule, 'decision_id', v_decision_id,
    'source', 'rule', 'considered', v_eliminated);
END $function$;

COMMIT;

-- ROLLBACK:
--   DROP FUNCTION IF EXISTS public.fn_select_model(text,uuid,text,integer,numeric,uuid,boolean,boolean,uuid);
--   (then re-create the pre-U21.2 8-argument body from migration 20260713040000)
--   DROP FUNCTION IF EXISTS public.fn_effective_tier(text, uuid);
--   DROP FUNCTION IF EXISTS public.fn_tier_rank(text);
--   ALTER TABLE public.model_catalog DROP COLUMN IF EXISTS tier_floor;
