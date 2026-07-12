-- 0027a (E6.5) — revenue ledger + daily P&L surface.
-- Source: CEO directive 2026-07-12 (evening, verbatim intent): "this
-- holding was built to run 24/7 and produce income — where are daily
-- costs vs earnings?" The OS is the digital twin of an EXISTING physical
-- company: money-IN must be first-class from day one, not deferred to the
-- store pilot (Phase 11).
--
-- Design decisions (recorded):
--   D1. revenue_ledger mirrors cost_ledger's append-only discipline
--       (UPDATE/DELETE/TRUNCATE revoked — corrections are reversal rows,
--       amount may be negative for refunds/chargebacks with a reason).
--   D2. engine enum = the four owned revenue engines (E5.7) + 'physical'
--       (the existing physical company's income, entered manually until
--       integrations land) + 'other'.
--   D3. Money-IN is approval-free by standing CEO rule (delegation rule:
--       para GİRİŞİ onaysız; only money-OUT gates) — fn_revenue_record
--       writes directly, audited + broadcast.
--   D4. NO seed rows: zero-fabrication DNA. The P&L page shows honest
--       zeros until real income is recorded.
--   D5. Daily P&L day boundary = Europe/Berlin, matching v_cost_breakdown.
--
-- Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS public.revenue_ledger (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_on date NOT NULL,
  engine text NOT NULL CHECK (engine IN
    ('social_selling','ecommerce','consultancy','venture','physical','other')),
  department text REFERENCES public.departments(slug),
  client text,
  description text NOT NULL,
  amount_eur numeric NOT NULL CHECK (amount_eur <> 0),
  source text NOT NULL DEFAULT 'manual' CHECK (source IN
    ('manual','woocommerce','stripe','bank','crm','system')),
  evidence_ref text,
  entered_by text NOT NULL,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Append-only (D1, 0008 precedent).
REVOKE UPDATE, DELETE, TRUNCATE ON public.revenue_ledger
  FROM PUBLIC, anon, authenticated, service_role;

ALTER TABLE public.revenue_ledger ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.revenue_ledger TO authenticated;
DROP POLICY IF EXISTS revenue_ledger_ceo_read ON public.revenue_ledger;
CREATE POLICY revenue_ledger_ceo_read ON public.revenue_ledger
  FOR SELECT TO authenticated USING (true);

CREATE INDEX IF NOT EXISTS revenue_ledger_day_idx ON public.revenue_ledger (occurred_on);
CREATE INDEX IF NOT EXISTS revenue_ledger_engine_idx ON public.revenue_ledger (engine, occurred_on);

-- ── fn_revenue_record — the single money-IN write seam ──────────────────

CREATE OR REPLACE FUNCTION public.fn_revenue_record(
  p_occurred_on date,
  p_engine text,
  p_amount_eur numeric,
  p_description text,
  p_idempotency_key text,
  p_client text DEFAULT NULL,
  p_department text DEFAULT NULL,
  p_source text DEFAULT 'manual',
  p_evidence_ref text DEFAULT NULL,
  p_meta jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor text;
  v_digest text;
  v_prev record;
  v_id bigint;
  v_resp jsonb;
BEGIN
  v_actor := CASE
    WHEN auth.uid() IS NOT NULL THEN 'ceo'
    WHEN current_user IN ('service_role', 'postgres') THEN 'system'
  END;
  IF v_actor IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'PERMISSION_DENIED');
  END IF;

  v_digest := md5(p_occurred_on::text || '|' || p_engine || '|' ||
                  p_amount_eur::text || '|' || p_description);
  SELECT request_digest, response INTO v_prev
    FROM control_idempotency WHERE key = p_idempotency_key;
  IF FOUND THEN
    IF v_prev.request_digest <> v_digest THEN
      RETURN jsonb_build_object('ok', false, 'error', 'IDEMPOTENCY_MISMATCH');
    END IF;
    RETURN v_prev.response;
  END IF;

  IF length(trim(p_description)) < 3 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'description required (min 3 chars) — every euro carries its story');
  END IF;
  -- Negative amounts are legitimate reversals (refund/chargeback/correction)
  -- and MUST say so (D1): append-only ledger corrects forward, never edits.
  IF p_amount_eur < 0 AND p_description !~* 'refund|chargeback|reversal|correction|iade|ters' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'negative amount requires a reversal reason in the description (refund/chargeback/correction)');
  END IF;
  IF p_department IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM departments WHERE slug = p_department) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown department slug');
  END IF;

  INSERT INTO revenue_ledger
    (occurred_on, engine, department, client, description, amount_eur,
     source, evidence_ref, entered_by, meta)
  VALUES
    (p_occurred_on, p_engine, p_department, p_client, trim(p_description),
     p_amount_eur, p_source, p_evidence_ref, v_actor, p_meta)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.record',
          jsonb_build_object('engine', p_engine, 'amount_eur', p_amount_eur,
                             'occurred_on', p_occurred_on, 'client', p_client,
                             'source', p_source),
          jsonb_build_object('revenue_ledger_id', v_id));

  PERFORM notify_broadcast('finance', 'revenue.recorded',
    jsonb_build_object('id', v_id, 'engine', p_engine,
                       'amount_eur', p_amount_eur, 'occurred_on', p_occurred_on));

  v_resp := jsonb_build_object('ok', true, 'revenue_id', v_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, jsonb) TO authenticated, service_role;

-- ── P&L views (D5: Europe/Berlin day, matching v_cost_breakdown) ─────────

DROP VIEW IF EXISTS public.v_pnl_daily;
CREATE VIEW public.v_pnl_daily AS
SELECT
  COALESCE(r.day, c.day)                       AS day,
  COALESCE(r.revenue_eur, 0)::numeric(12,2)    AS revenue_eur,
  COALESCE(c.cost_eur, 0)::numeric(12,4)       AS cost_eur,
  (COALESCE(r.revenue_eur, 0) - COALESCE(c.cost_eur, 0))::numeric(12,2) AS net_eur
FROM
  (SELECT occurred_on AS day, sum(amount_eur) AS revenue_eur
     FROM public.revenue_ledger GROUP BY occurred_on) r
FULL OUTER JOIN
  (SELECT ((created_at AT TIME ZONE 'Europe/Berlin'))::date AS day,
          sum(cost_eur) AS cost_eur
     FROM public.cost_ledger GROUP BY 1) c
  USING (day);

DROP VIEW IF EXISTS public.v_pnl_engine;
CREATE VIEW public.v_pnl_engine AS
SELECT engine,
       occurred_on AS day,
       sum(amount_eur)::numeric(12,2) AS revenue_eur,
       count(*)::int AS entries
  FROM public.revenue_ledger
 GROUP BY engine, occurred_on;

GRANT SELECT ON public.v_pnl_daily, public.v_pnl_engine TO authenticated;

COMMENT ON TABLE public.revenue_ledger is
  '0027a (E6.5, CEO directive 2026-07-12): append-only money-IN ledger — the earnings half of the daily P&L; corrections are forward reversal rows, never edits.';
COMMENT ON VIEW public.v_pnl_daily is
  '0027a (E6.5): daily P&L — revenue_ledger vs cost_ledger per Europe/Berlin day; net_eur = revenue - cost.';

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_pnl_engine;
--   DROP VIEW IF EXISTS public.v_pnl_daily;
--   DROP FUNCTION IF EXISTS public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, jsonb);
--   DROP TABLE IF EXISTS public.revenue_ledger;
