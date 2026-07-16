-- R1.2b — Objective Contract + Opportunity pipeline + portfolio allocations
-- + control fn family. Spec: REVENUE_ENGINE_SPEC §8/§10/§11/§13/§22 (0028b).
-- Actor seam: fn_org_actor() ('ceo' via auth.uid, 'system' via service role).
-- Separation of duties (§13): halal verdict = CEO, or a risk-audit director
-- named via p_verdict_by who is NEVER the proposer (G-rule).

-- ── 1. objectives (the Objective Contract) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.objectives (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL,
  amount_eur           numeric NOT NULL CHECK (amount_eur > 0),
  metric               text NOT NULL DEFAULT 'net_profit'
                         CHECK (metric IN ('net_profit','revenue')),
  period               daterange,
  revenue_floor_eur    numeric,
  min_gross_margin_pct numeric,
  cash_floor_eur       numeric,
  capital_limit_eur    numeric NOT NULL DEFAULT 0,
  risk_limit_eur       numeric,
  max_loss_eur         numeric,
  status               text NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','proposed','active','achieved','missed','closed')),
  proposed_by          text,
  evidence_refs        jsonb NOT NULL DEFAULT '[]'::jsonb,
  boundaries_ack       boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.objectives IS
  'REVENUE_ENGINE_SPEC §11 — the Objective Contract. The objective is fixed, the Islamic boundaries are fixed, the solution is the Holding''s responsibility (Talep §2). State machine §10; activate/close CEO-only.';

-- ── 2. opportunities (12-dim scoring + halal gate) ──────────────────────────
CREATE TABLE IF NOT EXISTS public.opportunities (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL,
  engine_slug          text NOT NULL REFERENCES public.revenue_engines(slug),
  region               text,
  channel              text,
  capital_required_eur numeric NOT NULL DEFAULT 0,
  state                text NOT NULL DEFAULT 'discovered'
                         CHECK (state IN ('discovered','scored','shortlisted','piloting','scaling','retired','rejected')),
  rejected_cause       text CHECK (rejected_cause IN ('halal','score','ceo')),
  halal_verdict        text NOT NULL DEFAULT 'pending'
                         CHECK (halal_verdict IN ('pending','halal','haram','review')),
  halal_reason         text,
  halal_verdict_by     text,
  score                numeric,
  score_dims           jsonb,
  research_refs        jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by           text,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rejected_needs_cause CHECK
    ((state = 'rejected') = (rejected_cause IS NOT NULL))
);

COMMENT ON TABLE public.opportunities IS
  'REVENUE_ENGINE_SPEC §11 — opportunity pipeline. G2: piloting+ REQUIRES halal_verdict=halal (fn-enforced). score_dims carries the 12 canonical keys (§11).';

-- ── 3. portfolio_allocations ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.portfolio_allocations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id     uuid NOT NULL REFERENCES public.objectives(id),
  opportunity_id   uuid NOT NULL REFERENCES public.opportunities(id),
  expected_net_eur numeric,
  committed_at     timestamptz NOT NULL DEFAULT now(),
  stopped_at       timestamptz,
  stop_reason      text,
  realized_link    text
);

-- Control seam only (P4).
REVOKE ALL ON public.objectives, public.opportunities, public.portfolio_allocations
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.objectives, public.opportunities, public.portfolio_allocations
  TO authenticated;
ALTER TABLE public.objectives            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS objectives_read ON public.objectives;
CREATE POLICY objectives_read ON public.objectives FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS opportunities_read ON public.opportunities;
CREATE POLICY opportunities_read ON public.opportunities FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS portfolio_read ON public.portfolio_allocations;
CREATE POLICY portfolio_read ON public.portfolio_allocations FOR SELECT TO authenticated USING (true);

-- ── 4. helper: audit + idempotency wrapper pieces are inlined per fn (org
--       family pattern) ─────────────────────────────────────────────────────

-- 4.1 control_objective_create — CEO any status draft|proposed; system only 'proposed' (Hamza path, §10)
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
                             'proposed_by', p_proposed_by))
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

-- 4.2 control_objective_activate — CEO-ONLY; draft|proposed → active; period required
CREATE OR REPLACE FUNCTION public.control_objective_activate(
  p_id uuid, p_period_start date DEFAULT NULL, p_period_end date DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('objective_activate|' || p_id::text);
  v_prev record; v_row objectives%ROWTYPE; v_audit bigint; v_resp jsonb;
  v_period daterange;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'only the CEO activates objectives (§13)');
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
  SELECT * INTO v_row FROM objectives WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_row.status NOT IN ('draft','proposed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', v_row.status || ' → active is not a legal transition (§10)');
  END IF;
  v_period := CASE WHEN p_period_start IS NOT NULL AND p_period_end IS NOT NULL
                   THEN daterange(p_period_start, p_period_end, '[]')
                   ELSE v_row.period END;
  IF v_period IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'an active objective requires a period');
  END IF;

  UPDATE objectives SET status = 'active', period = v_period, updated_at = now()
   WHERE id = p_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.objective.activated',
          jsonb_build_object('objective_id', p_id, 'period', v_period::text))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'objective.activated',
    jsonb_build_object('id', p_id,
      'summary_en', 'Objective activated', 'summary_tr', 'Hedef aktifleştirildi'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 4.3 control_objective_close — CEO-ONLY; active → achieved|missed|closed
CREATE OR REPLACE FUNCTION public.control_objective_close(
  p_id uuid, p_outcome text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('objective_close|' || p_id::text || '|' || p_outcome);
  v_prev record; v_status text; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_outcome NOT IN ('achieved','missed','closed') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'outcome must be achieved|missed|closed');
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
  SELECT status INTO v_status FROM objectives WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_status <> 'active' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', v_status || ' → ' || p_outcome || ' is not legal (§10: only active closes)');
  END IF;

  UPDATE objectives SET status = p_outcome, updated_at = now() WHERE id = p_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.objective.closed',
          jsonb_build_object('objective_id', p_id, 'outcome', p_outcome))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'objective.closed',
    jsonb_build_object('id', p_id, 'outcome', p_outcome,
      'summary_en', 'Objective closed: ' || p_outcome,
      'summary_tr', 'Hedef kapandı: ' || p_outcome));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 4.4 control_engine_create / control_engine_update_lifecycle (ceo|system, audited)
CREATE OR REPLACE FUNCTION public.control_engine_create(
  p_slug text, p_title text, p_title_tr text, p_thesis text DEFAULT NULL,
  p_owner_department text DEFAULT NULL, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('engine_create|' || p_slug);
  v_prev record; v_audit bigint; v_resp jsonb;
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
  IF EXISTS (SELECT 1 FROM revenue_engines WHERE slug = p_slug) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'engine slug exists');
  END IF;
  IF p_owner_department IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM departments WHERE slug = p_owner_department) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown owner_department');
  END IF;

  INSERT INTO revenue_engines (slug, title, title_tr, thesis, owner_department, created_from)
  VALUES (p_slug, p_title, p_title_tr, p_thesis, p_owner_department, v_actor);

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.engine.created',
          jsonb_build_object('slug', p_slug, 'title', p_title))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'engine.created',
    jsonb_build_object('slug', p_slug,
      'summary_en', 'Revenue engine ' || p_title || ' registered',
      'summary_tr', p_title_tr || ' gelir motoru kaydedildi'));

  v_resp := jsonb_build_object('ok', true, 'slug', p_slug, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

CREATE OR REPLACE FUNCTION public.control_engine_update_lifecycle(
  p_slug text, p_lifecycle text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('engine_lifecycle|' || p_slug || '|' || p_lifecycle);
  v_prev record; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_lifecycle NOT IN ('candidate','pilot','scale','sunset') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED');
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
  UPDATE revenue_engines SET lifecycle = p_lifecycle, updated_at = now()
   WHERE slug = p_slug;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.engine.lifecycle', jsonb_build_object('slug', p_slug, 'lifecycle', p_lifecycle))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'engine.lifecycle',
    jsonb_build_object('slug', p_slug, 'lifecycle', p_lifecycle,
      'summary_en', 'Engine ' || p_slug || ' → ' || p_lifecycle,
      'summary_tr', p_slug || ' motoru → ' || p_lifecycle));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 4.5 control_opportunity_register — ceo|system; state 'discovered'
CREATE OR REPLACE FUNCTION public.control_opportunity_register(
  p_title text, p_engine_slug text, p_region text DEFAULT NULL,
  p_channel text DEFAULT NULL, p_capital_required_eur numeric DEFAULT 0,
  p_research_refs jsonb DEFAULT '[]'::jsonb, p_created_by text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_register|' || p_title || '|' || p_engine_slug);
  v_prev record; v_id uuid; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM revenue_engines WHERE slug = p_engine_slug) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED', 'detail', 'unknown engine');
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

  INSERT INTO opportunities (title, engine_slug, region, channel,
                             capital_required_eur, research_refs, created_by)
  VALUES (p_title, p_engine_slug, p_region, p_channel,
          COALESCE(p_capital_required_eur, 0), p_research_refs,
          COALESCE(p_created_by, v_actor))
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.opportunity.registered',
          jsonb_build_object('opportunity_id', v_id, 'title', p_title, 'engine', p_engine_slug))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'opportunity.registered',
    jsonb_build_object('id', v_id,
      'summary_en', 'Opportunity registered: ' || p_title,
      'summary_tr', 'Fırsat kaydedildi: ' || p_title));

  v_resp := jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 4.6 control_opportunity_score — validates the 12 canonical dims; weighted
--     by settings 'revenue.score_weights' when present, equal weights
--     otherwise (R1.3 seeds the weights; fallback documented §17-19).
CREATE OR REPLACE FUNCTION public.control_opportunity_score(
  p_id uuid, p_score_dims jsonb, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_score|' || p_id::text || '|' || p_score_dims::text);
  v_prev record; v_state text; v_audit bigint; v_resp jsonb;
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
  SELECT state INTO v_state FROM opportunities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_state NOT IN ('discovered','scored') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', 'scoring is legal only from discovered|scored (§10)');
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

-- 4.7 control_opportunity_set_halal_verdict — separation of duties (§13):
--     CEO directly; system only with p_verdict_by = a risk-audit director
--     who is NOT the proposer. haram → state 'rejected'(halal) (G2).
CREATE OR REPLACE FUNCTION public.control_opportunity_set_halal_verdict(
  p_id uuid, p_verdict text, p_reason text DEFAULT NULL,
  p_verdict_by text DEFAULT NULL, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_halal|' || p_id::text || '|' || p_verdict);
  v_prev record; v_row opportunities%ROWTYPE; v_audit bigint; v_resp jsonb;
  v_by text;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_verdict NOT IN ('halal','haram','review') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'verdict must be halal|haram|review');
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

  IF v_actor = 'ceo' THEN
    v_by := 'ceo';
  ELSE
    -- system path: verdict_by must be a risk-audit director and never the proposer
    IF p_verdict_by IS NULL THEN
      RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
        'detail', 'halal verdict needs the CEO or a named risk-audit director (§13)');
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM agents
       WHERE slug = p_verdict_by AND department = 'risk-audit' AND role_level = 'director'
    ) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
        'detail', 'verdict_by must be a risk-audit director (§13 separation of duties)');
    END IF;
    IF v_row.created_by IS NOT DISTINCT FROM p_verdict_by THEN
      RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
        'detail', 'the proposer may NEVER issue the halal verdict (§13)');
    END IF;
    v_by := p_verdict_by;
  END IF;

  UPDATE opportunities
     SET halal_verdict = p_verdict, halal_reason = p_reason,
         halal_verdict_by = v_by,
         state = CASE WHEN p_verdict = 'haram' THEN 'rejected' ELSE state END,
         rejected_cause = CASE WHEN p_verdict = 'haram' THEN 'halal' ELSE rejected_cause END,
         updated_at = now()
   WHERE id = p_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.opportunity.halal_verdict',
          jsonb_build_object('opportunity_id', p_id, 'verdict', p_verdict,
                             'verdict_by', v_by, 'reason', p_reason))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'opportunity.halal_verdict',
    jsonb_build_object('id', p_id, 'verdict', p_verdict,
      'summary_en', 'Halal verdict: ' || p_verdict,
      'summary_tr', 'Helal hükmü: ' || p_verdict));

  v_resp := jsonb_build_object('ok', true, 'verdict', p_verdict, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 4.8 control_opportunity_advance — §10 legal transitions; G2: piloting+
--     REQUIRES halal_verdict='halal'. THE red-path fn.
CREATE OR REPLACE FUNCTION public.control_opportunity_advance(
  p_id uuid, p_to_state text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_advance|' || p_id::text || '|' || p_to_state);
  v_prev record; v_row opportunities%ROWTYPE; v_audit bigint; v_resp jsonb;
  v_legal boolean;
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

-- 4.9 control_opportunity_reject — any live state → rejected(cause)
CREATE OR REPLACE FUNCTION public.control_opportunity_reject(
  p_id uuid, p_cause text, p_reason text DEFAULT NULL, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('opp_reject|' || p_id::text || '|' || p_cause);
  v_prev record; v_state text; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;
  IF p_cause NOT IN ('halal','score','ceo') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED');
  END IF;
  IF p_cause = 'ceo' AND v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'cause=ceo is reserved for the CEO actor');
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
  SELECT state INTO v_state FROM opportunities WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_state IN ('rejected','retired') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', v_state || ' is terminal');
  END IF;

  UPDATE opportunities
     SET state = 'rejected', rejected_cause = p_cause,
         halal_reason = CASE WHEN p_cause = 'halal' THEN COALESCE(p_reason, halal_reason) ELSE halal_reason END,
         updated_at = now()
   WHERE id = p_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (v_actor, CASE WHEN v_actor = 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.opportunity.rejected',
          jsonb_build_object('opportunity_id', p_id, 'cause', p_cause, 'reason', p_reason))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'opportunity.rejected',
    jsonb_build_object('id', p_id, 'cause', p_cause,
      'summary_en', 'Opportunity rejected (' || p_cause || ')',
      'summary_tr', 'Fırsat reddedildi (' || p_cause || ')'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- 4.10 control_portfolio_allocate / stop / rotate — CEO-ONLY (§13)
CREATE OR REPLACE FUNCTION public.control_portfolio_allocate(
  p_objective_id uuid, p_opportunity_id uuid, p_expected_net_eur numeric DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('portfolio_allocate|' || p_objective_id::text || '|' || p_opportunity_id::text);
  v_prev record; v_opp opportunities%ROWTYPE; v_id uuid; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED',
      'detail', 'portfolio allocation is CEO-only (§13)');
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
  IF NOT EXISTS (SELECT 1 FROM objectives WHERE id = p_objective_id AND status = 'active') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'allocation requires an ACTIVE objective');
  END IF;
  SELECT * INTO v_opp FROM opportunities WHERE id = p_opportunity_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;
  IF v_opp.halal_verdict <> 'halal' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'HALAL_GATE',
      'detail', 'allocation requires halal_verdict=halal (G2)');
  END IF;
  IF v_opp.state NOT IN ('shortlisted','piloting','scaling') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'ILLEGAL_TRANSITION',
      'detail', 'allocation is legal from shortlisted|piloting|scaling');
  END IF;

  INSERT INTO portfolio_allocations (objective_id, opportunity_id, expected_net_eur)
  VALUES (p_objective_id, p_opportunity_id, p_expected_net_eur)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.portfolio.allocated',
          jsonb_build_object('allocation_id', v_id, 'objective_id', p_objective_id,
                             'opportunity_id', p_opportunity_id))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'portfolio.allocated',
    jsonb_build_object('id', v_id,
      'summary_en', 'Portfolio allocation committed',
      'summary_tr', 'Portföy tahsisi yapıldı'));

  v_resp := jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

CREATE OR REPLACE FUNCTION public.control_portfolio_stop(
  p_allocation_id uuid, p_reason text, p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('portfolio_stop|' || p_allocation_id::text);
  v_prev record; v_audit bigint; v_resp jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
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
  UPDATE portfolio_allocations
     SET stopped_at = now(), stop_reason = p_reason
   WHERE id = p_allocation_id AND stopped_at IS NULL;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND',
      'detail', 'allocation missing or already stopped');
  END IF;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES ('ceo', 'ceo', 'revenue.portfolio.stopped',
          jsonb_build_object('allocation_id', p_allocation_id, 'reason', p_reason))
  RETURNING id INTO v_audit;

  PERFORM notify_broadcast('revenue', 'portfolio.stopped',
    jsonb_build_object('id', p_allocation_id,
      'summary_en', 'Allocation stopped', 'summary_tr', 'Tahsis durduruldu'));

  v_resp := jsonb_build_object('ok', true, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

CREATE OR REPLACE FUNCTION public.control_portfolio_rotate(
  p_allocation_id uuid, p_new_opportunity_id uuid, p_reason text DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text := fn_org_actor();
  v_digest text := md5('portfolio_rotate|' || p_allocation_id::text || '|' || p_new_opportunity_id::text);
  v_prev record; v_old portfolio_allocations%ROWTYPE; v_resp jsonb; v_new jsonb;
BEGIN
  IF v_actor IS DISTINCT FROM 'ceo' THEN
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
  SELECT * INTO v_old FROM portfolio_allocations WHERE id = p_allocation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'NOT_FOUND');
  END IF;

  PERFORM control_portfolio_stop(p_allocation_id, COALESCE(p_reason, 'rotated'));
  v_new := control_portfolio_allocate(v_old.objective_id, p_new_opportunity_id, v_old.expected_net_eur);
  IF NOT (v_new ->> 'ok')::boolean THEN
    RAISE EXCEPTION 'rotate failed on allocate leg: %', v_new ->> 'detail';
  END IF;

  v_resp := jsonb_build_object('ok', true, 'stopped', p_allocation_id,
                               'new_allocation', v_new -> 'id');
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END $$;

-- ── 5. Grants: control fns are service-role/authenticated seam like siblings ─
REVOKE ALL ON FUNCTION
  public.control_objective_create(text, numeric, text, text, text, jsonb, date, date, numeric, text),
  public.control_objective_activate(uuid, date, date, text),
  public.control_objective_close(uuid, text, text),
  public.control_engine_create(text, text, text, text, text, text),
  public.control_engine_update_lifecycle(text, text, text),
  public.control_opportunity_register(text, text, text, text, numeric, jsonb, text, text),
  public.control_opportunity_score(uuid, jsonb, text),
  public.control_opportunity_set_halal_verdict(uuid, text, text, text, text),
  public.control_opportunity_advance(uuid, text, text),
  public.control_opportunity_reject(uuid, text, text, text),
  public.control_portfolio_allocate(uuid, uuid, numeric, text),
  public.control_portfolio_stop(uuid, text, text),
  public.control_portfolio_rotate(uuid, uuid, text, text)
  FROM PUBLIC, anon;

-- ── 6. Objective seed (§24.6): the CEO's first binding target as DRAFT ──────
INSERT INTO public.objectives (title, amount_eur, metric, status, proposed_by, evidence_refs)
SELECT 'First net profit objective — €50 after full system test (CEO D2, 2026-07-17)',
       50, 'net_profit', 'draft', 'ceo',
       '["00-CEO-DIRECTIVE-REVENUE-FIRST.md §3 D2"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.objectives WHERE amount_eur = 50 AND metric = 'net_profit');
