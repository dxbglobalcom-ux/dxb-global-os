-- W2.3 — THE TWO WRITTEN GATES FIRE (REVENUE_ENGINE_SPEC §2 G3 + G4).
--
-- Measured 2026-07-26 before writing a line: `capital_required_eur` was
-- compared NOWHERE and `evidence_refs` was validated NOWHERE. Both rules had
-- been binding spec text since 2026-07-17 (G3 "a proposal without opportunity
-- citations is gate-rejected"; G4 "while capital_limit=0, scoring hard-filters
-- capital_required_eur=0 opportunities") and neither existed in the machine.
-- A rule the system does not enforce is a rule the system does not have.
--
-- THREE DECISIONS, each taken from the spec rather than invented here:
--
-- 1. ONE source for the limit. `fn_revenue_capital_limit()` reads the most
--    recent ACTIVE objective's `capital_limit_eur`, else 0 — the safe end
--    (§7bis: "a new target arrives unable to spend anything until the CEO
--    raises it"). This is the exact selection `packages/revenue/src/
--    discovery.ts` already uses to write the scout brief, so the ask and the
--    gate cannot drift apart into two truths.
--
-- 2. Over-limit is REFUSED, never auto-rejected. Capital raises are CEO-only
--    (G4). A row he could unlock by raising the limit must still be sitting
--    there when he does; deleting his future options is not a gate's job.
--    The refusal is audited (`revenue.opportunity.capital_filtered`) because
--    "found nothing" and "quietly dropped something" must never look alike.
--
-- 3. The check lives at BOTH doors that move an opportunity forward. Scoring
--    alone would leave a row that was scored under a higher limit free to walk
--    into `piloting` after the CEO lowers it — the gate must hold at the moment
--    of commitment, not only at the moment of judgement.
--
-- G3 validates the shape §6 names — "evidence_refs jsonb (opportunity ids +
-- research task ids)": at least one cited opportunity that EXISTS, and no
-- citation pointing at something that does not. `draft` is untouched: the CEO's
-- own door creates drafts, and G3 is about what the machine proposes to him.

BEGIN;

-- ── 1. the governing capital limit, in one place ──────────────────────────
CREATE OR REPLACE FUNCTION public.fn_revenue_capital_limit()
RETURNS numeric LANGUAGE sql STABLE SET search_path = public AS $$
  SELECT COALESCE((SELECT capital_limit_eur FROM objectives
                    WHERE status = 'active'
                    ORDER BY created_at DESC LIMIT 1), 0)::numeric;
$$;

COMMENT ON FUNCTION public.fn_revenue_capital_limit() IS
  'G4 zero-capital-first: the active objective''s capital ceiling, 0 when none is active.';

-- ── 2. G4 at the scoring door ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.control_opportunity_score(
  p_id uuid, p_score_dims jsonb, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_score|' || p_id::text || '|' || p_score_dims::text);
  v_prev record; v_state text; v_audit bigint; v_resp jsonb;
  v_capital numeric; v_limit numeric;
  v_dims text[] := ARRAY['market','trend','demand','competition','price_gap',
                         'logistics','platform_fees','tax_constraints','ad_cost',
                         'est_margin','time_to_revenue_days','scalability'];
  v_key text; v_val numeric; v_weights jsonb; v_w numeric;
  v_sum numeric := 0; v_wsum numeric := 0; v_score numeric;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
    IF FOUND THEN
      IF v_prev.request_digest <> v_digest THEN
        RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
      END IF;
      RETURN v_prev.response;
    END IF;
  END IF;
  SELECT state, COALESCE(capital_required_eur, 0)
    INTO v_state, v_capital
    FROM opportunities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_state NOT IN ('discovered','scored') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', 'scoring is legal only from discovered|scored (§10)');
  END IF;

  -- G4 — free-first. The row survives: capital raises are the CEO's (§2 G4).
  v_limit := fn_revenue_capital_limit();
  IF v_capital > v_limit THEN
    INSERT INTO audit_log (actor, actor_type, action, payload)
    VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
            'revenue.opportunity.capital_filtered',
            jsonb_build_object('opportunity_id', p_id, 'at', 'score',
                               'capital_required_eur', v_capital,
                               'capital_limit_eur', v_limit));
    RETURN jsonb_build_object('ok', false, 'error', 'CAPITAL_LIMIT',
      'detail', 'needs €' || v_capital::text || ' capital; the active limit is €'
                || v_limit::text || ' — raising it is the CEO''s call (G4)');
  END IF;

  -- all 12 keys present, numeric, 0..10 (time_to_revenue_days normalized by caller)
  FOREACH v_key IN ARRAY v_dims LOOP
    IF NOT (p_score_dims ? v_key) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'missing score dim: ' || v_key);
    END IF;
    BEGIN
      v_val := (p_score_dims ->> v_key)::numeric;
    EXCEPTION WHEN others THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'dim ' || v_key || ' is not numeric');
    END;
    IF v_val < 0 OR v_val > 10 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
        'detail', 'dim ' || v_key || ' out of 0..10');
    END IF;
  END LOOP;

  BEGIN
    v_weights := resolve_setting('revenue.score_weights');
  EXCEPTION WHEN others THEN
    v_weights := NULL;
  END;
  FOREACH v_key IN ARRAY v_dims LOOP
    v_val := (p_score_dims ->> v_key)::numeric;
    v_w := COALESCE((v_weights ->> v_key)::numeric, 1);
    v_sum := v_sum + v_val * v_w;
    v_wsum := v_wsum + v_w;
  END LOOP;
  v_score := round(v_sum / NULLIF(v_wsum, 0), 2);

  UPDATE opportunities
     SET score = v_score, score_dims = p_score_dims, state = 'scored', updated_at = now()
   WHERE id = p_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.opportunity.scored',
          jsonb_build_object('opportunity_id', p_id, 'score', v_score))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'opportunity.scored',
    jsonb_build_object('id', p_id, 'score', v_score,
      'summary_en', 'Opportunity scored ' || v_score,
      'summary_tr', 'Fırsat skorlandı: ' || v_score));

  v_resp := jsonb_build_object('ok', true, 'score', v_score, 'dims', p_score_dims, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ── 3. G4 at the commitment door ──────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.control_opportunity_advance(
  p_id uuid, p_to_state text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_advance|' || p_id::text || '|' || p_to_state);
  v_prev record; v_row opportunities%ROWTYPE; v_audit bigint; v_resp jsonb;
  v_legal boolean; v_limit numeric;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_idempotency_key IS NOT NULL THEN
    SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
    IF FOUND THEN
      IF v_prev.request_digest <> v_digest THEN
        RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
      END IF;
      RETURN v_prev.response;
    END IF;
  END IF;
  SELECT * INTO v_row FROM opportunities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  v_legal := (v_row.state, p_to_state) IN
    (('scored','shortlisted'), ('shortlisted','piloting'),
     ('piloting','scaling'), ('piloting','retired'), ('scaling','retired'));
  IF NOT v_legal THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', v_row.state || ' → ' || p_to_state || ' is not legal (§10)');
  END IF;
  -- G2: the Islamic gate — no pilot/scale without an explicit halal verdict.
  IF p_to_state IN ('piloting','scaling') AND v_row.halal_verdict <> 'halal' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'HALAL_GATE',
      'detail', 'piloting+ requires halal_verdict=halal (G2); current: ' || v_row.halal_verdict);
  END IF;
  -- G4: a forward step is a commitment. Retreat (retired) is always allowed.
  IF p_to_state IN ('shortlisted','piloting','scaling') THEN
    v_limit := fn_revenue_capital_limit();
    IF COALESCE(v_row.capital_required_eur, 0) > v_limit THEN
      INSERT INTO audit_log (actor, actor_type, action, payload)
      VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
              'revenue.opportunity.capital_filtered',
              jsonb_build_object('opportunity_id', p_id, 'at', 'advance',
                                 'to', p_to_state,
                                 'capital_required_eur', COALESCE(v_row.capital_required_eur, 0),
                                 'capital_limit_eur', v_limit));
      RETURN jsonb_build_object('ok', false, 'error', 'CAPITAL_LIMIT',
        'detail', 'needs €' || COALESCE(v_row.capital_required_eur, 0)::text
                  || ' capital; the active limit is €' || v_limit::text
                  || ' — raising it is the CEO''s call (G4)');
    END IF;
  END IF;

  UPDATE opportunities SET state = p_to_state, updated_at = now() WHERE id = p_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.opportunity.advanced',
          jsonb_build_object('opportunity_id', p_id, 'from', v_row.state, 'to', p_to_state))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'opportunity.advanced',
    jsonb_build_object('id', p_id, 'to', p_to_state,
      'summary_en', 'Opportunity → ' || p_to_state,
      'summary_tr', 'Fırsat → ' || p_to_state));

  v_resp := jsonb_build_object('ok', true, 'state', p_to_state, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ── 4. G3 at the proposal door ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.control_objective_create(
  p_title text, p_amount_eur numeric, p_metric text DEFAULT 'net_profit',
  p_status text DEFAULT 'draft', p_proposed_by text DEFAULT NULL,
  p_evidence_refs jsonb DEFAULT '[]'::jsonb,
  p_period_start date DEFAULT NULL, p_period_end date DEFAULT NULL,
  p_capital_limit_eur numeric DEFAULT 0,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('objective_create|' || p_title || '|' || p_amount_eur::text || '|' || p_status);
  v_prev record; v_id uuid; v_audit bigint; v_resp jsonb;
  v_el jsonb; v_ref text; v_task text; v_cited int := 0;
  c_uuid constant text := '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_status NOT IN ('draft','proposed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'create accepts only draft|proposed');
  END IF;
  IF v_actor = 'system' AND p_status <> 'proposed' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'system (Hamza path) may only PROPOSE objectives — the CEO decides (D4)');
  END IF;
  IF p_status = 'proposed' AND COALESCE(trim(p_proposed_by), '') = '' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'proposed objective must name proposed_by');
  END IF;

  -- G3 — anti-laziness. A proposal is a claim about the world; it must point at
  -- the research that produced it (§6: opportunity ids + research task ids).
  IF p_status = 'proposed' THEN
    IF jsonb_typeof(COALESCE(p_evidence_refs, 'null'::jsonb)) <> 'array'
       OR jsonb_array_length(p_evidence_refs) = 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'EVIDENCE_GATE',
        'detail', 'a proposed objective must cite the opportunities behind it (G3)');
    END IF;
    FOR v_el IN SELECT * FROM jsonb_array_elements(p_evidence_refs) LOOP
      v_ref := CASE jsonb_typeof(v_el)
                 WHEN 'string' THEN v_el #>> '{}'
                 WHEN 'object' THEN COALESCE(v_el ->> 'opportunity_id', v_el ->> 'id')
               END;
      v_task := CASE WHEN jsonb_typeof(v_el) = 'object' THEN v_el ->> 'task_id' END;
      IF v_ref IS NULL AND v_task IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'EVIDENCE_GATE',
          'detail', 'evidence entry cites nothing: ' || v_el::text);
      END IF;
      IF v_ref IS NOT NULL THEN
        IF v_ref !~* c_uuid THEN
          RETURN jsonb_build_object('ok', false, 'error', 'EVIDENCE_GATE',
            'detail', 'evidence citation is not an opportunity id: ' || v_ref);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM opportunities WHERE id = v_ref::uuid) THEN
          RETURN jsonb_build_object('ok', false, 'error', 'EVIDENCE_GATE',
            'detail', 'evidence cites an opportunity that does not exist: ' || v_ref);
        END IF;
        v_cited := v_cited + 1;
      END IF;
      IF v_task IS NOT NULL THEN
        IF v_task !~* c_uuid OR NOT EXISTS (SELECT 1 FROM tasks WHERE id = v_task::uuid) THEN
          RETURN jsonb_build_object('ok', false, 'error', 'EVIDENCE_GATE',
            'detail', 'evidence cites a research task that does not exist: ' || v_task);
        END IF;
      END IF;
    END LOOP;
    IF v_cited = 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'EVIDENCE_GATE',
        'detail', 'evidence names research but no opportunity — a proposal must cite what it found (G3)');
    END IF;
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT request_digest, response INTO v_prev FROM control_idempotency WHERE key = p_idempotency_key;
    IF FOUND THEN
      IF v_prev.request_digest <> v_digest THEN
        RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
      END IF;
      RETURN v_prev.response;
    END IF;
  END IF;

  INSERT INTO objectives (title, amount_eur, metric, status, proposed_by, evidence_refs,
                          period, capital_limit_eur)
  VALUES (p_title, p_amount_eur, p_metric, p_status, p_proposed_by, p_evidence_refs,
          CASE WHEN p_period_start IS NOT NULL AND p_period_end IS NOT NULL
               THEN daterange(p_period_start, p_period_end, '[]') END,
          COALESCE(p_capital_limit_eur, 0))
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.objective.created',
          jsonb_build_object('objective_id', v_id, 'title', p_title,
                             'amount_eur', p_amount_eur, 'status', p_status,
                             'proposed_by', p_proposed_by,
                             'evidence_count', CASE WHEN p_status = 'proposed'
                                                    THEN v_cited ELSE NULL END))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'objective.created',
    jsonb_build_object('id', v_id, 'status', p_status, 'amount_eur', p_amount_eur,
      'summary_en', 'Objective "' || p_title || '" created (' || p_status || ')',
      'summary_tr', '"' || p_title || '" hedefi oluşturuldu (' || p_status || ')'));

  v_resp := jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

COMMIT;

-- ROLLBACK: re-apply the pre-W2.3 bodies of control_opportunity_score,
-- control_opportunity_advance and control_objective_create from
-- db/migrations/20260717020100_r12b_objectives_opportunities.sql (§4.1, §4.6,
-- §4.8 — same signatures, so CREATE OR REPLACE restores them and grants are
-- untouched), then DROP FUNCTION IF EXISTS public.fn_revenue_capital_limit();
