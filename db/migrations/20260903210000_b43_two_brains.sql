-- B43 — THE TWO-BRAIN TRIAL (CEO 2026-09-03 evening: "O uzmanlar kim opus 5 mi fable 5.1 mi kim?
-- iki beyinlede denemek lazım." → click "İki beyinle aynı iş" → click "Şimdi deneme koşusu";
-- registered as two-brain-trial-run-approved-2026-09-03).
--
-- Measured before this file (company engine, 2026-09-03 20:3x):
--   model_catalog: 'fable-5' = "Claude Opus 5" (L1, the U20-frozen id); no Fable 5.1 row
--   routing_rules: ONE media.creative row — media-studio · L1 · fable-5 · xhigh · priority 50 · enabled
--   worker-shim resolves the studio's employee to that row and calls SDK_MODEL_IDS[rule.model]
--
-- A) the second brain enters the catalogue under its own id (display name is what the CEO sees).
-- B) a SECOND department-scoped studio row, model 'fable-5.1', DISABLED. The trial flips `enabled`
--    between the two rows around run B (one card, runs are serial) and restores the Opus row after;
--    loadPolicy() reads only enabled rows, so at any moment exactly one studio brain routes.
-- Both statements self-skip where the studio does not exist (a bare construction engine).

INSERT INTO public.model_catalog
  (id, provider, context_window, speed_score, fallback_of, status, display_name, banned, mechanical_only, tier_floor)
SELECT 'fable-5.1', 'anthropic', 1000000, 40, 'fable-5', 'active', 'Claude Fable 5.1', false, false, 'L1'
 WHERE NOT EXISTS (SELECT 1 FROM public.model_catalog WHERE id = 'fable-5.1');

INSERT INTO public.routing_rules
  (task_class, match, model_tier, model, model_id, mode, effort, priority, enabled, department_id)
SELECT 'media.creative', jsonb_build_object('department', 'media-studio'),
       'L1', 'fable-5.1', 'fable-5.1', 'subscription', 'xhigh', 40, false, d.id
  FROM public.departments d
 WHERE d.slug = 'media-studio'
   AND NOT EXISTS (SELECT 1 FROM public.routing_rules WHERE task_class = 'media.creative' AND model = 'fable-5.1');

INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'ceo', 'system', 'routing_change',
       jsonb_build_object('reason', 'B43 two-brain trial: Claude Fable 5.1 catalogued; second studio creative row L1/xhigh, disabled until run B (CEO 2026-09-03 evening)')
 WHERE NOT EXISTS (SELECT 1 FROM public.audit_log WHERE action = 'routing_change'
                    AND payload->>'reason' LIKE 'B43 two-brain trial%');

-- guardrails: the file either did its work or says so
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.model_catalog WHERE id = 'fable-5.1' AND tier_floor = 'L1' AND status = 'active') THEN
    RAISE EXCEPTION 'B43 two brains: catalogue row fable-5.1 missing';
  END IF;
  IF EXISTS (SELECT 1 FROM public.departments WHERE slug = 'media-studio') THEN
    IF (SELECT count(*) FROM public.routing_rules WHERE task_class = 'media.creative' AND enabled) <> 1 THEN
      RAISE EXCEPTION 'B43 two brains: exactly one enabled studio creative row expected';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.routing_rules WHERE task_class = 'media.creative' AND model = 'fable-5.1' AND NOT enabled) THEN
      RAISE EXCEPTION 'B43 two brains: the disabled fable-5.1 studio row is missing';
    END IF;
  END IF;
END $$;
