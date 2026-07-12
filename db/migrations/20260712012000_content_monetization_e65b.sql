-- 0027b (E6.5b) — content monetization revenue class + platform dimension.
-- Source: CEO directive 2026-07-12 (evening #2, verbatim intent): "one of
-- the most important income streams will be producing social media
-- content and earning from it — earnings must flow from YouTube,
-- Instagram, TikTok and the like."
--
-- What this adds (recorded decisions):
--   D1. engine 'content_monetization' — the holding's OWN content earning
--       platform payouts (ad revenue share, creator funds, bonuses). This
--       is distinct from 'social_selling' (R1 — commerce attributed to
--       social) : payouts come FROM platforms, not from customers.
--   D2. platform text column (nullable) — which surface paid: the CEO
--       asked for per-platform earnings visibility, so it is a structured
--       column with a CHECK, not a meta key.
--   D3. fn_revenue_record gains p_platform; the old signature is DROPPED
--       (no overload ambiguity for PostgREST rpc).
--   D4. v_pnl_platform — per-platform revenue per day.
--
-- Idempotent: safe to re-run.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.revenue_ledger'::regclass
      AND conname = 'revenue_ledger_engine_check'
      AND pg_get_constraintdef(oid) NOT LIKE '%content_monetization%'
  ) THEN
    ALTER TABLE public.revenue_ledger DROP CONSTRAINT revenue_ledger_engine_check;
    ALTER TABLE public.revenue_ledger ADD CONSTRAINT revenue_ledger_engine_check
      CHECK (engine IN ('social_selling','content_monetization','ecommerce',
                        'consultancy','venture','physical','other'));
  END IF;
END $$;

ALTER TABLE public.revenue_ledger
  ADD COLUMN IF NOT EXISTS platform text
    CHECK (platform IN ('youtube','instagram','tiktok','x','facebook',
                        'linkedin','twitch','pinterest','other'));

CREATE INDEX IF NOT EXISTS revenue_ledger_platform_idx
  ON public.revenue_ledger (platform, occurred_on) WHERE platform IS NOT NULL;

-- D3: single canonical signature — drop the E6.5 one, recreate with platform.
DROP FUNCTION IF EXISTS public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, jsonb);

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
  p_platform text DEFAULT NULL,
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
                  p_amount_eur::text || '|' || p_description || '|' ||
                  COALESCE(p_platform, '-'));
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
  IF p_amount_eur < 0 AND p_description !~* 'refund|chargeback|reversal|correction|iade|ters' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'negative amount requires a reversal reason in the description (refund/chargeback/correction)');
  END IF;
  IF p_department IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM departments WHERE slug = p_department) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown department slug');
  END IF;
  -- Content monetization is per-platform by definition (D1/D2): a payout
  -- that cannot name its platform cannot be reconciled to a channel.
  IF p_engine = 'content_monetization' AND p_platform IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'content_monetization requires a platform');
  END IF;
  IF p_platform IS NOT NULL AND p_platform NOT IN
     ('youtube','instagram','tiktok','x','facebook','linkedin','twitch','pinterest','other') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'VALIDATION_FAILED',
      'detail', 'unknown platform (use other for unlisted surfaces)');
  END IF;

  INSERT INTO revenue_ledger
    (occurred_on, engine, department, client, description, amount_eur,
     source, evidence_ref, platform, entered_by, meta)
  VALUES
    (p_occurred_on, p_engine, p_department, p_client, trim(p_description),
     p_amount_eur, p_source, p_evidence_ref, p_platform, v_actor, p_meta)
  RETURNING id INTO v_id;

  INSERT INTO audit_log (actor, actor_type, action, payload, detail_ref)
  VALUES (v_actor, CASE v_actor WHEN 'ceo' THEN 'ceo' ELSE 'system' END,
          'revenue.record',
          jsonb_build_object('engine', p_engine, 'amount_eur', p_amount_eur,
                             'occurred_on', p_occurred_on, 'client', p_client,
                             'platform', p_platform, 'source', p_source),
          jsonb_build_object('revenue_ledger_id', v_id));

  PERFORM notify_broadcast('finance', 'revenue.recorded',
    jsonb_build_object('id', v_id, 'engine', p_engine, 'platform', p_platform,
                       'amount_eur', p_amount_eur, 'occurred_on', p_occurred_on));

  v_resp := jsonb_build_object('ok', true, 'revenue_id', v_id);
  INSERT INTO control_idempotency (key, request_digest, response)
  VALUES (p_idempotency_key, v_digest, v_resp);
  RETURN v_resp;
END $$;

REVOKE ALL ON FUNCTION public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, text, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, text, jsonb) TO authenticated, service_role;

-- D4: per-platform earnings per day.
DROP VIEW IF EXISTS public.v_pnl_platform;
CREATE VIEW public.v_pnl_platform AS
SELECT platform,
       occurred_on AS day,
       sum(amount_eur)::numeric(12,2) AS revenue_eur,
       count(*)::int AS entries
  FROM public.revenue_ledger
 WHERE platform IS NOT NULL
 GROUP BY platform, occurred_on;

GRANT SELECT ON public.v_pnl_platform TO authenticated;

COMMENT ON COLUMN public.revenue_ledger.platform is
  '0027b (E6.5b, CEO directive 2026-07-12): which platform paid — structured for per-platform earnings visibility (YouTube/Instagram/TikTok/...).';

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_pnl_platform;
--   DROP FUNCTION IF EXISTS public.fn_revenue_record(date, text, numeric, text, text, text, text, text, text, text, jsonb);
--   (recreate the E6.5 signature from 20260712011000)
--   DROP INDEX IF EXISTS revenue_ledger_platform_idx;
--   ALTER TABLE public.revenue_ledger DROP COLUMN IF EXISTS platform;
--   ALTER TABLE public.revenue_ledger DROP CONSTRAINT revenue_ledger_engine_check;
--   ALTER TABLE public.revenue_ledger ADD CONSTRAINT revenue_ledger_engine_check
--     CHECK (engine IN ('social_selling','ecommerce','consultancy','venture','physical','other'));
