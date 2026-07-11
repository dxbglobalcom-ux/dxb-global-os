-- 20260711008000_d2_wave_e55.sql — E5.5 D2 dalgası org hazırlığı (legal + risk-audit + security)
-- WORKFORCE-GAP-MATRIX §3 aile 4/5/6 + §5.2 backfill kuralları. D1 emsali: 20260711007000.
-- (1) slug taşımaları — matris §2 rol adlarına (support-/engineering- önekleri kalkar;
--     legal-document-review matris hükmüyle Commercial Contracts rolüne dönüşür),
-- (2) ADD 8 worker satırı (4 legal + 2 risk-audit + 2 security),
-- (3) legal-de pod sahipliği: departments(legal-de).director_id = legal-de-counsel
--     (matris §1: legal, legal-de'yi POD olarak yutar — kadro legal'de yaşar, pod satırı
--      sahiplik işaretini taşır; head sayısı 19'da sabit kalır, pod lead role='worker'),
-- (4) manager zincirleri (legal→GC, risk-audit→ERM, security→CISO),
-- (5) bütünlük korkulukları. İdempotent: koşullu UPDATE + ON CONFLICT DO NOTHING.

BEGIN;

-- A) SLUG TAŞIMALARI (dosya ağacı = DB birebir kuralı; matris §2 adları)
UPDATE public.agents SET slug='commercial-contracts-manager',
       persona_path='personas/legal/commercial-contracts-manager.md', updated_at=now()
 WHERE slug='legal-document-review';
UPDATE public.agents SET slug='legal-compliance-checker',
       persona_path='personas/legal/legal-compliance-checker.md', updated_at=now()
 WHERE slug='support-legal-compliance-checker';
UPDATE public.agents SET slug='security-engineer',
       persona_path='personas/security/security-engineer.md', updated_at=now()
 WHERE slug='engineering-security-engineer';
UPDATE public.agents SET slug='threat-detection-engineer',
       persona_path='personas/security/threat-detection-engineer.md', updated_at=now()
 WHERE slug='engineering-threat-detection-engineer';

-- B) ADD 8 worker satırı (E5.4a/D1 idiomu; role_level dalga-yazımı kararları)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, v.dept, 'worker', v.lvl, 'draft',
       'personas/' || v.dept || '/' || v.slug || '.md', 'v0-add', 'dormant'
FROM (VALUES
  ('legal-de-counsel',        'legal',      'senior_specialist'),
  ('legal-tr-counsel',        'legal',      'specialist'),
  ('privacy-dpo',             'legal',      'senior_specialist'),
  ('policy-writer',           'legal',      'specialist'),
  ('internal-auditor',        'risk-audit', 'senior_specialist'),
  ('ai-model-risk-officer',   'risk-audit', 'specialist'),
  ('iam-secrets-officer',     'security',   'senior_specialist'),
  ('ai-safety-red-team-lead', 'security',   'senior_specialist')
) AS v(slug, dept, lvl)
ON CONFLICT (slug) DO NOTHING;

-- C) LEGAL-DE POD SAHİPLİĞİ (E5.3 notu: "legal-de pod→ADD'de" — burada dolar)
UPDATE public.departments SET director_id=(SELECT id FROM public.agents WHERE slug='legal-de-counsel')
 WHERE slug='legal-de'
   AND director_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='legal-de-counsel');

-- D) MANAGER ZİNCİRLERİ (üç departmanın arşiv-dışı worker'ları kendi müdürüne)
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='general-counsel'), updated_at=now()
 WHERE department='legal' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='general-counsel');
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='enterprise-risk-manager'), updated_at=now()
 WHERE department='risk-audit' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='enterprise-risk-manager');
UPDATE public.agents SET manager_id=(SELECT id FROM public.agents WHERE slug='ciso'), updated_at=now()
 WHERE department='security' AND role='worker' AND employment_status<>'archived'
   AND manager_id IS DISTINCT FROM (SELECT id FROM public.agents WHERE slug='ciso');

-- E) KORKULUKLAR: üç departmanda arşiv-dışı yetim worker 0 + legal-de pod sahipli + role_level NULL 0
DO $$
DECLARE v_orphan integer; v_dir uuid; v_null_lvl integer;
BEGIN
  SELECT count(*) INTO v_orphan
    FROM public.agents
   WHERE department IN ('legal','risk-audit','security') AND role='worker'
     AND employment_status<>'archived' AND manager_id IS NULL;
  IF v_orphan > 0 THEN
    RAISE EXCEPTION 'D2: yetim worker sayısı % (beklenen 0)', v_orphan;
  END IF;
  SELECT director_id INTO v_dir FROM public.departments WHERE slug='legal-de';
  IF v_dir IS NULL THEN
    RAISE EXCEPTION 'D2: legal-de pod director_id boş kaldı';
  END IF;
  SELECT count(*) INTO v_null_lvl
    FROM public.agents
   WHERE department IN ('legal','risk-audit','security')
     AND employment_status<>'archived' AND role_level IS NULL;
  IF v_null_lvl > 0 THEN
    RAISE EXCEPTION 'D2: role_level NULL sayısı % (beklenen 0)', v_null_lvl;
  END IF;
END $$;

COMMIT;

-- ROLLBACK:
-- 1. UPDATE departments SET director_id=NULL WHERE slug='legal-de';
-- 2. UPDATE agents SET slug='legal-document-review',
--      persona_path='personas/legal/legal-document-review.md' WHERE slug='commercial-contracts-manager';
--    UPDATE agents SET slug='support-legal-compliance-checker',
--      persona_path='personas/legal/support-legal-compliance-checker.md' WHERE slug='legal-compliance-checker';
--    UPDATE agents SET slug='engineering-security-engineer',
--      persona_path='personas/security/engineering-security-engineer.md' WHERE slug='security-engineer';
--    UPDATE agents SET slug='engineering-threat-detection-engineer',
--      persona_path='personas/security/engineering-threat-detection-engineer.md' WHERE slug='threat-detection-engineer';
-- 3. DELETE FROM agents WHERE slug IN ('legal-de-counsel','legal-tr-counsel','privacy-dpo','policy-writer',
--      'internal-auditor','ai-model-risk-officer','iam-secrets-officer','ai-safety-red-team-lead')
--      AND persona_id IS NULL;
-- 4. Manager zincirleri: E5.3 head-backfill değerleri (GC/ERM/CISO id'leri — bu dosyanın git kaydı).
