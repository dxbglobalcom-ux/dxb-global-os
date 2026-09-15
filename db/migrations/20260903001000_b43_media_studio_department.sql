-- 20260903001000_b43_media_studio_department.sql — B43: the DxB Media Studio department is founded.
-- CEO order 2026-09-03 (this session, on the AskUserQuestion "16 uzman persona ... ve 'DxB Media Studio'
-- departmanı açılsın mı?" → "Evet, başla"), on top of his 2026-08-31 ruling on B43 that the studio is a
-- DEPARTMENT with named seats and that a seat the roster cannot cover is opened by HR through the
-- holding's own persona pipeline. His 16-expertise list (2026-09-03 directive §8) is applied to the
-- letter: 14 new employees here; 2 existing experts (design-image-prompt-engineer → Prompt/Model seat,
-- marketing-short-video-editing-coach → Editor seat) are ASSIGNED to the studio by their persona text,
-- not transferred — "the agency is a room they work in, not a second payroll" (B43).
-- Brain: L1 (`fable-5`) for every seat — MODEL_ROUTING_SPEC §4d puts "design and video direction" and
-- every output a human sees at L1; brain_source='slot' (derived from the tier law, not a dashboard act).
-- The CEO's effort ruling for the creative brain ("max gerek yok, xhigh olsun", 2026-09-03) is recorded
-- on B43 as routing data for the studio's task rows; no persona file carries a model name (§4b).
-- Governed path: fn_hr_create_employee (E5.4b — 7-step atomic birth), actor 'ceo'. All draft/dormant;
-- activation only after each persona passes fn_persona_gate (G3). Idempotent.

BEGIN;

-- A) department row (bilingual — UI purity gate)
-- W10 CORRECTION (2026-09-15, audit F032, measured before it was touched): this INSERT read
-- `SELECT … FROM public.companies WHERE slug = 'dxb-global'` — a SET-RETURNING select, which inserts
-- NOTHING when the holding company row does not exist yet. The company is born in
-- db/seed/20260711_holding_core.sql, and the seed runs AFTER the whole migration chain, so from an
-- EMPTY database this department was never created and (B) below died on agents_department_fkey:
-- `[bootstrap] applying 20260903001000_…` → `Key (department)=(media-studio) is not present in table
-- "departments"`. The canonical chain has therefore been broken from zero since 2026-09-03.
-- The house idiom is a SCALAR subquery (20260712014000_org_mutations_e63.sql does exactly this for the
-- other departments): the row is born with company_id NULL on a bare chain, and the seed's own
-- `UPDATE departments SET company_id = … WHERE company_id IS NULL` binds it to the holding afterwards.
-- Both live engines recorded this version on 2026-09-03 and skip the file by version (bootstrap-db.sh
-- compares versions, never contents), so this correction changes nothing that has already run.
INSERT INTO public.departments (slug, display_name, display_name_tr, company_id)
VALUES ('media-studio', 'DxB Media Studio', 'DxB Medya Stüdyosu',
        (SELECT id FROM public.companies WHERE slug = 'dxb-global'))
ON CONFLICT (slug) DO NOTHING;

-- B) head — Creative Director (B43 seat: director of the studio; department director)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.agents WHERE slug = 'media-creative-director') THEN
    PERFORM public.fn_hr_create_employee(
      'media-creative-director', 'media-studio', 'head', 'director', NULL, 'fable-5',
      ARRAY['creative direction of every piece the studio produces — idea, hook, concept, visual metaphor, the standard it is judged by',
            'department direction: seats, assignment of the roster to jobs, the production line of B43 (script → reference set → frame → motion → master → enlargement → grade → sound → cut)',
            'the accept/reject pipeline toward the CEO (LAW B): nothing leaves the studio without his eye'],
      ARRAY['no money out, no contract, no outward publication without the CEO gate',
            'no engine, tool or supplier decision without a measurement on this station or a priced proposal (B41 D1-bis)',
            'may refuse work against the Islamic boundaries; may never widen or narrow them'],
      'ceo');
  END IF;
END $$;

UPDATE public.agents a
   SET manager_id = m.id, updated_at = now()
  FROM public.agents m
 WHERE a.slug = 'media-creative-director' AND m.slug = 'agents-orchestrator'
   AND a.manager_id IS DISTINCT FROM m.id;

UPDATE public.departments d
   SET director_id = a.id
  FROM public.agents a
 WHERE d.slug = 'media-studio' AND a.slug = 'media-creative-director'
   AND d.director_id IS DISTINCT FROM a.id;

-- C) 13 experts (the CEO's list, verbatim order; two of the sixteen are assignments of existing staff)
DO $$
DECLARE r record;
BEGIN
  FOR r IN SELECT * FROM (VALUES
    ('media-advertising-director',       'senior_specialist', ARRAY['commercial and advertising direction: the brief, the selling idea, the campaign shape, the client-facing cut'],            ARRAY['creative direction is the Creative Director''s; client money and contracts stop at the CEO']),
    ('media-film-director',              'senior_specialist', ARRAY['film direction of every shot: performance, blocking, camera, rhythm; the shot list as a director''s document'],              ARRAY['may not skip the master reference set or the approved frame (B43 production law)']),
    ('media-cinematographer',            'senior_specialist', ARRAY['the lens and light language of every shot; camera moves written as a cinematographer writes them; the look'],              ARRAY['lighting and lens decisions serve the director''s intent; no shot without a written camera line']),
    ('media-screenwriter',               'specialist',        ARRAY['scripts, spoken lines, hooks, the beat sheet; every word a presenter says is written before a frame is generated'],         ARRAY['no invented brand claims; lines sized to the shot length; language of the brief only']),
    ('media-storyboard-previz',          'specialist',        ARRAY['storyboards and previsualisation: every shot drawn and approved as a still before motion is asked for'],                    ARRAY['no shot enters motion without an approved storyboard frame']),
    ('media-ai-video-engineer',          'senior_specialist', ARRAY['operation of the generation engines and the bench they run on; recipes, settings, measured card time per shot'],           ARRAY['no engine or node enters the line without an isolated install, a study card and a measured A/B']),
    ('media-character-identity',         'specialist',        ARRAY['the identity of every human on screen: real reference photographs, cast sheets, identity binding, drift detection'],       ARRAY['a drawn human is scrap for a client-facing face; real photograph + reference conditioning only']),
    ('media-product-brand-consistency',  'specialist',        ARRAY['the product and the brand mark hold their shape, colour and lettering across every shot; product references; overlays'],   ARRAY['engine-drawn lettering never ships; brand marks come from the real file or the real photograph']),
    ('media-continuity',                 'specialist',        ARRAY['continuity across shots: wardrobe, location, light direction, props, time of day; the reference set as an asset'],        ARRAY['may stop a shot list that breaks continuity; may not change the creative intent']),
    ('media-vfx-post',                   'specialist',        ARRAY['post-production and VFX: enlargement, colour grade, film grain, compositing, overlays, the finish that reads as footage'], ARRAY['enhancement is the last layer, never make-up over a bad generation']),
    ('media-sound-music',                'specialist',        ARRAY['voice, music, ambience, mix and loudness; one voice source per shot; the audio that carries the film'],                    ARRAY['no engine track mixed under a voice line; licensed music only; halal boundaries on content']),
    ('media-delivery-qc',                'specialist',        ARRAY['final delivery and the light final check: format, code, catalogue entry, showcase card, the CEO''s accept/reject'],      ARRAY['may not accept on the CEO''s behalf (LAW B); may refuse a delivery that fails the final check']),
    ('media-failure-analysis',           'specialist',        ARRAY['root cause of every defect the studio produces; the cure installed at the step that produced it; the error registry'],   ARRAY['a defect is closed only with a rule at its source; no QA bureaucracy — prevention over inspection'])
  ) AS v(slug, role_level, resp, auth)
  LOOP
    IF NOT EXISTS (SELECT 1 FROM public.agents WHERE slug = r.slug) THEN
      PERFORM public.fn_hr_create_employee(r.slug, 'media-studio', 'worker', r.role_level,
                                           'media-creative-director', 'fable-5', r.resp, r.auth, 'ceo');
    END IF;
  END LOOP;
END $$;

-- D) bilingual titles (UI purity gate: every CEO-visible label in both locales)
UPDATE public.agents a SET title = t.en, title_tr = t.tr, updated_at = now()
FROM (VALUES
  ('media-creative-director',          'Creative Director',                          'Kreatif Direktör'),
  ('media-advertising-director',       'Advertising / Commercial Director',          'Reklam Yönetmeni'),
  ('media-film-director',              'Film Director',                              'Film Yönetmeni'),
  ('media-cinematographer',            'Cinematographer / Director of Photography',  'Görüntü Yönetmeni'),
  ('media-screenwriter',               'Screenwriter / Creative Writer',             'Senarist / Kreatif Yazar'),
  ('media-storyboard-previz',          'Storyboard / Previz Specialist',             'Storyboard / Ön Görselleştirme Uzmanı'),
  ('media-ai-video-engineer',          'AI Video Generation Engineer',               'AI Video Üretim Mühendisi'),
  ('media-character-identity',         'Character / Identity Specialist',            'Karakter / Kimlik Uzmanı'),
  ('media-product-brand-consistency',  'Product & Brand Consistency Specialist',     'Ürün ve Marka Süreklilik Uzmanı'),
  ('media-continuity',                 'Continuity Specialist',                      'Süreklilik Uzmanı'),
  ('media-vfx-post',                   'VFX / Post-Production Specialist',           'VFX / Post-Prodüksiyon Uzmanı'),
  ('media-sound-music',                'Sound / Music Specialist',                   'Ses / Müzik Uzmanı'),
  ('media-delivery-qc',                'Final Delivery / QC Specialist',             'Teslim / Kalite Kontrol Uzmanı'),
  ('media-failure-analysis',           'Failure Analysis / Optimization Specialist', 'Hata Analizi / Optimizasyon Uzmanı')
) AS t(slug, en, tr)
WHERE a.slug = t.slug AND (a.title IS DISTINCT FROM t.en OR a.title_tr IS DISTINCT FROM t.tr);

-- E) brain provenance: L1 by the tier law (§4d "design and video direction"), not a placeholder
UPDATE public.agents SET brain_source = 'slot', updated_at = now()
 WHERE department = 'media-studio' AND brain = 'fable-5' AND brain_source = 'default';

INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'ceo', 'system', 'routing_change',
       jsonb_build_object('reason', 'B43 media-studio founding: L1 brain by MODEL_ROUTING_SPEC §4d (video direction)',
                          'employees', (SELECT count(*) FROM public.agents WHERE department = 'media-studio'))
WHERE NOT EXISTS (SELECT 1 FROM public.audit_log WHERE action = 'routing_change'
                   AND payload->>'reason' LIKE 'B43 media-studio founding%');

-- F) guardrails: headcount exactly 14, zero orphan workers, director set, department bilingual
DO $$
DECLARE v_count integer; v_orphan integer; v_dir uuid; v_tr text;
BEGIN
  SELECT count(*) INTO v_count FROM public.agents
   WHERE department = 'media-studio' AND employment_status <> 'archived';
  IF v_count <> 14 THEN RAISE EXCEPTION 'B43: media-studio headcount % (expected 14)', v_count; END IF;

  SELECT count(*) INTO v_orphan FROM public.agents
   WHERE department = 'media-studio' AND role = 'worker' AND manager_id IS NULL;
  IF v_orphan > 0 THEN RAISE EXCEPTION 'B43: % orphan workers in media-studio', v_orphan; END IF;

  SELECT director_id, display_name_tr INTO v_dir, v_tr FROM public.departments WHERE slug = 'media-studio';
  IF v_dir IS NULL THEN RAISE EXCEPTION 'B43: media-studio has no director'; END IF;
  IF v_tr IS NULL OR v_tr = '' THEN RAISE EXCEPTION 'B43: media-studio has no Turkish name'; END IF;
END $$;

COMMIT;
