-- W2.2 follow-up, caught by the RULE #0 design pass on the first real data:
-- the five opportunities the scout found rendered on the CEO's TURKISH
-- Fırsatlar page with English titles.
--
-- DB text is an i18n surface here — the same law that gave `agents.title_tr`,
-- `departments.display_name_tr` and (already, in this very view)
-- `engine_title_tr`. An opportunity title is not a proper noun: it is a
-- sentence describing what the work is, and the man who reads it reads Turkish.
--
-- The scout writes both legs — it has the source page in front of it, which is
-- where a translation is most accurate. Nothing here translates after the fact.

BEGIN;

ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS title_tr text;

-- The door gains the Turkish leg. Appended last with a default so nothing that
-- calls the old positional shape breaks.
DROP FUNCTION IF EXISTS public.control_opportunity_register(text, text, text, text, numeric, jsonb, text, text);

CREATE OR REPLACE FUNCTION public.control_opportunity_register(
  p_title                text,
  p_engine_slug          text,
  p_region               text    DEFAULT NULL,
  p_channel              text    DEFAULT NULL,
  p_capital_required_eur numeric DEFAULT 0,
  p_research_refs        jsonb   DEFAULT '[]'::jsonb,
  p_created_by           text    DEFAULT NULL,
  p_idempotency_key      text    DEFAULT NULL,
  p_title_tr             text    DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

  INSERT INTO opportunities (title, title_tr, engine_slug, region, channel,
                             capital_required_eur, research_refs, created_by)
  VALUES (p_title, NULLIF(btrim(COALESCE(p_title_tr, '')), ''), p_engine_slug, p_region, p_channel,
          COALESCE(p_capital_required_eur, 0), COALESCE(p_research_refs, '[]'::jsonb),
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
      'summary_tr', 'Fırsat kaydedildi: ' || COALESCE(NULLIF(btrim(COALESCE(p_title_tr,'')),''), p_title)));

  v_resp := jsonb_build_object('ok', true, 'id', v_id, 'audit_id', v_audit);
  IF p_idempotency_key IS NOT NULL THEN
    INSERT INTO control_idempotency (key, request_digest, response)
    VALUES (p_idempotency_key, v_digest, v_resp);
  END IF;
  RETURN v_resp;
END
$$;

-- The pipeline view carries the Turkish leg the same way it already carries the
-- engine's (v_opportunity_pipeline is rebuilt, not patched, so its column order
-- stays readable).
DROP VIEW IF EXISTS public.v_opportunity_pipeline;
CREATE VIEW public.v_opportunity_pipeline AS
SELECT op.id,
       op.title,
       op.title_tr,
       op.state,
       op.halal_verdict,
       op.score,
       op.score_dims,
       op.capital_required_eur,
       op.region,
       op.channel,
       op.engine_slug,
       e.title AS engine_title,
       e.title_tr AS engine_title_tr,
       e.lifecycle AS engine_lifecycle,
       op.created_by,
       op.created_at,
       op.updated_at
  FROM opportunities op
  JOIN revenue_engines e ON e.slug = op.engine_slug
 ORDER BY op.score DESC NULLS LAST, op.created_at DESC;

GRANT SELECT ON public.v_opportunity_pipeline TO authenticated;

COMMIT;

-- ROLLBACK:
--   (recreate the 8-arg control_opportunity_register from 0028b and the prior view;
--    ALTER TABLE public.opportunities DROP COLUMN title_tr;)
