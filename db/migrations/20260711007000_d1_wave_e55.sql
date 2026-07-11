-- 20260711007000_d1_wave_e55.sql — E5.5 D1 dalgası org hazırlığı (ceo-office + strategy + finance)
-- WORKFORCE-GAP-MATRIX §3 aile 1/2/11/13/14 + §5.2 backfill kuralları.
-- (1) ceo-office slug taşımaları (specialized-* önekleri matris rol adlarına),
-- (2) Chief of Staff promote → head/director + departments.director_id (matris §6 onay notu: "ceo-office müdürü D1'de"),
-- (3) 9 ADD worker satırı (2 ceo + 5 strategy + 2 finance), manager zincirleri,
-- (4) bütünlük korkulukları. İdempotent: koşullu UPDATE + ON CONFLICT DO NOTHING.

BEGIN;

-- A) SLUG TAŞIMALARI (dosya ağacı = DB birebir kuralı; E5.3b revenue-reporting emsali)
UPDATE public.agents SET slug='chief-of-staff',
       persona_path='personas/ceo/chief-of-staff.md', updated_at=now()
 WHERE slug='specialized-chief-of-staff';
UPDATE public.agents SET slug='executive-summary-generator',
       persona_path='personas/ceo/executive-summary-generator.md', updated_at=now()
 WHERE slug='support-executive-summary-generator';
UPDATE public.agents SET slug='document-generator',
       persona_path='personas/ceo/document-generator.md', updated_at=now()
 WHERE slug='specialized-document-generator';

-- B) CoS PROMOTE → ceo-office müdürü (move+rewrite hükmü; rewrite D1 persona yazımında)
UPDATE public.agents SET role='head', role_level='director',
       manager_id=(SELECT id FROM public.agents WHERE slug='agents-orchestrator'),
       updated_at=now()
 WHERE slug='chief-of-staff'
   AND (role<>'head' OR role_level IS DISTINCT FROM 'director');
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug='chief-of-staff')
 WHERE slug='ceo'
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='chief-of-staff');

-- C) ADD 9 worker satırı (E5.4a idiomu; role_level dalga-yazımı kararları)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, v.dept, 'worker', v.lvl, 'draft',
       'personas/' || v.dept || '/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('executive-operations-manager',  'ceo',      'senior_specialist'),
  ('board-decision-secretary',      'ceo',      'specialist'),
  ('corporate-development-analyst', 'strategy', 'specialist'),
  ('market-intelligence-lead',      'strategy', 'senior_specialist'),
  ('okr-performance-manager',       'strategy', 'specialist'),
  ('partnerships-ecosystem-lead',   'strategy', 'senior_specialist'),
  ('global-expansion-lead',         'strategy', 'senior_specialist'),
  ('treasury-ar-manager',           'finance',  'senior_specialist'),
  ('payroll-manager',               'finance',  'specialist')
) AS v(slug, dept, lvl)
ON CONFLICT (slug) DO NOTHING;

-- D) MANAGER ZİNCİRLERİ
-- ceo-office worker'ları (orkestratör HARİÇ — o role_level='orchestrator', zinciri ayrı) → CoS
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='chief-of-staff'), updated_at=now()
 WHERE department='ceo' AND role='worker' AND employment_status<>'archived'
   AND slug<>'agents-orchestrator'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='chief-of-staff');
-- strategy ADD'leri (pod lead'ler dahil — pod, departman içi açık sahiplik) → Head of Strategy
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='head-of-strategy'), updated_at=now()
 WHERE department='strategy' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='head-of-strategy');
-- finance ADD'leri → CFO
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='cfo'), updated_at=now()
 WHERE department='finance' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='cfo');

-- E) KORKULUKLAR: üç departmanda arşiv-dışı yetim worker 0 + ceo director dolu
DO $$
DECLARE v_orphan integer; v_dir uuid;
BEGIN
  SELECT count(*) INTO v_orphan
    FROM public.agents
   WHERE department IN ('ceo','strategy','finance') AND role='worker'
     AND employment_status<>'archived' AND slug<>'agents-orchestrator'
     AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'D1: yetim worker sayısı % (beklenen 0)', v_orphan;
  END IF;
  SELECT director_id INTO v_dir FROM public.departments WHERE slug='ceo';
  IF v_dir IS NULL THEN
    RAISE EXCEPTION 'D1: ceo departmanı director_id boş kaldı';
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- 1. UPDATE departments SET director_id=NULL WHERE slug='ceo';
-- 2. UPDATE agents SET slug='specialized-chief-of-staff', role='worker', role_level='specialist',
--      persona_path='personas/ceo/specialized-chief-of-staff.md' WHERE slug='chief-of-staff';
--    UPDATE agents SET slug='support-executive-summary-generator',
--      persona_path='personas/ceo/support-executive-summary-generator.md' WHERE slug='executive-summary-generator';
--    UPDATE agents SET slug='specialized-document-generator',
--      persona_path='personas/ceo/specialized-document-generator.md' WHERE slug='document-generator';
-- 3. DELETE FROM agents WHERE slug IN ('executive-operations-manager','board-decision-secretary',
--      'corporate-development-analyst','market-intelligence-lead','okr-performance-manager',
--      'partnerships-ecosystem-lead','global-expansion-lead','treasury-ar-manager','payroll-manager')
--      AND persona_id IS NULL;
-- 4. Manager zincirleri: E5.3 head-backfill değerlerine döner (orkestratör id'si — git'teki bu dosya kaydı).
