-- 20260712001000_d3_wave_e55.sql — E5.5 D3 dalgası org hazırlığı (data-ai + platform)
-- WORKFORCE-GAP-MATRIX §3 aile 7/8 + §5.2 backfill kuralları. Emsal: 20260711008000 (D2).
-- (1) slug taşımaları — matris §2 rol adlarına (engineering-/specialized-/support- önekleri kalkar;
--     specialized-model-qa matris hükmüyle Model Evaluation Lead, zk-steward Knowledge Architect olur),
-- (2) ADD 3 worker satırı (2 data-ai + 1 platform),
-- (3) KAYITLI SEVİYE KARARI: model-evaluation-lead specialist→senior_specialist (matris "Lead" unvanı +
--     eval verdict otoritesi; D1 emsali market-intelligence-lead=senior_specialist — sessiz değil, bu kayıt),
-- (4) manager zincirleri (data-ai→Chief AI Officer, platform→Platform Head),
-- (5) bütünlük korkulukları. İdempotent: koşullu UPDATE + ON CONFLICT DO NOTHING.

BEGIN;

-- A) SLUG TAŞIMALARI (dosya ağacı = DB birebir kuralı; matris §2 adları)
UPDATE public.agents SET slug='ai-engineer',
       persona_path='personas/data-ai/ai-engineer.md', updated_at=now()
 WHERE slug='engineering-ai-engineer';
UPDATE public.agents SET slug='data-engineer',
       persona_path='personas/data-ai/data-engineer.md', updated_at=now()
 WHERE slug='engineering-data-engineer';
UPDATE public.agents SET slug='analytics-reporter',
       persona_path='personas/data-ai/analytics-reporter.md', updated_at=now()
 WHERE slug='support-analytics-reporter';
UPDATE public.agents SET slug='mcp-builder',
       persona_path='personas/data-ai/mcp-builder.md', updated_at=now()
 WHERE slug='specialized-mcp-builder';
UPDATE public.agents SET slug='workflow-architect',
       persona_path='personas/data-ai/workflow-architect.md', updated_at=now()
 WHERE slug='specialized-workflow-architect';
UPDATE public.agents SET slug='model-evaluation-lead',
       persona_path='personas/data-ai/model-evaluation-lead.md', updated_at=now()
 WHERE slug='specialized-model-qa';
UPDATE public.agents SET slug='knowledge-architect',
       persona_path='personas/data-ai/knowledge-architect.md', updated_at=now()
 WHERE slug='zk-steward';
UPDATE public.agents SET slug='database-optimizer',
       persona_path='personas/platform/database-optimizer.md', updated_at=now()
 WHERE slug='engineering-database-optimizer';
UPDATE public.agents SET slug='sre',
       persona_path='personas/platform/sre.md', updated_at=now()
 WHERE slug='engineering-sre';
UPDATE public.agents SET slug='incident-response-commander',
       persona_path='personas/platform/incident-response-commander.md', updated_at=now()
 WHERE slug='engineering-incident-response-commander';
UPDATE public.agents SET slug='infrastructure-maintainer',
       persona_path='personas/platform/infrastructure-maintainer.md', updated_at=now()
 WHERE slug='support-infrastructure-maintainer';

-- B) ADD 3 worker satırı (D1/D2 idiomu; role_level dalga-yazımı kararları)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, v.dept, 'worker', v.lvl, 'draft',
       'personas/' || v.dept || '/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('prompt-context-engineer',         'data-ai',  'senior_specialist'),
  ('ai-observability-finops-analyst', 'data-ai',  'specialist'),
  ('backup-dr-officer',               'platform', 'senior_specialist')
) AS v(slug, dept, lvl)
ON CONFLICT (slug) DO NOTHING;

-- C) KAYITLI SEVİYE KARARI (madde 3 üstte)
UPDATE public.agents SET role_level='senior_specialist', updated_at=now()
 WHERE slug='model-evaluation-lead' AND role_level='specialist';

-- D) MANAGER ZİNCİRLERİ (iki departmanın arşiv-dışı worker'ları kendi müdürüne)
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='chief-ai-officer'), updated_at=now()
 WHERE department='data-ai' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='chief-ai-officer');
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='platform-head'), updated_at=now()
 WHERE department='platform' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='platform-head');

-- E) KORKULUKLAR: iki departmanda arşiv-dışı yetim worker 0 + role_level NULL 0 + kadro sayımı
DO $$
DECLARE v_orphan integer; v_null_lvl integer; v_cnt integer;
BEGIN
  SELECT count(*) INTO v_orphan
    FROM public.agents
   WHERE department IN ('data-ai','platform') AND role='worker'
     AND employment_status<>'archived' AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'D3: yetim worker sayısı % (beklenen 0)', v_orphan;
  END IF;
  SELECT count(*) INTO v_null_lvl
    FROM public.agents
   WHERE department IN ('data-ai','platform')
     AND employment_status<>'archived' AND role_level IS NULL;
  IF v_null_lvl > 0 THEN
    RAISE EXCEPTION 'D3: role_level NULL sayısı % (beklenen 0)', v_null_lvl;
  END IF;
  SELECT count(*) INTO v_cnt
    FROM public.agents
   WHERE department IN ('data-ai','platform') AND employment_status<>'archived';
  IF v_cnt <> 17 THEN
    RAISE EXCEPTION 'D3: data-ai+platform arşiv-dışı kadro % (beklenen 17 = 2 head + 15 worker)', v_cnt;
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- 1. UPDATE agents SET role_level='specialist' WHERE slug='model-evaluation-lead';
-- 2. Slug taşımaları A bloğunun tersi (eski slug + eski persona_path — bu dosyanın git kaydı).
-- 3. DELETE FROM agents WHERE slug IN ('prompt-context-engineer','ai-observability-finops-analyst',
--      'backup-dr-officer') AND persona_id IS NULL;
-- 4. Manager zincirleri: E5.3 head-backfill değerleri (CAIO/Platform Head id'leri).
