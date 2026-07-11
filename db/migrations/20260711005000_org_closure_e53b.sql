-- 20260711005000_org_closure_e53b.sql — E5.3b: hedef org kapanışı (WORKFORCE-GAP-MATRIX §2 + §5.3)
-- CEO ONAYI: 2026-07-11 ~17:35 — matris §6 üç kalem birden onaylandı:
--   (1) retire→library 15 persona (silme değil arşiv), (2) research kapanışı,
--   (3) hedef org 19 dept + 5 pod / 179 kadro. Kayıt: STATE.md E5.3b bloğu.
-- Kapsam:
--   A. move: dept değişiklikleri uygulanır (v2 yazımı kendi dalgasında kalır — K2)
--   B. merge 6: rol ölür → satır hedef departmana taşınıp 'archived' (append-only geçmiş)
--   C. transform: sales-data-extraction-agent → revenue-reporting-agent (3 dosya 1 rol, revops)
--   D. retire 15: people-hr şablon havuzuna 'archived' + library_items kind='persona' kaydı
--   E. ADD 14 head satırı (draft; social-media-orchestrator zaten E5.2c'de açıldı → toplam 19 head)
--   F. promote 4: role='head' + role_level='director'
--   G. boşalan specialized/testing/support/research departman satırları silinir
-- KAYITLI UYARLAMA: matristeki "ceo-office" hedefi mevcut PK 'ceo' slug'ına uygulanır
--   (departments PK=slug; slug değişimi FK zincirini kırar; display_name zaten 'CEO Office').
-- İdempotent — 2× koşu kanıtı zorunlu. Dosya sonunda ROLLBACK bloğu.

BEGIN;

-- A) MOVE — WORKFORCE-GAP-MATRIX §2 karar satırları
UPDATE public.agents SET department='data-ai', updated_at=now()
 WHERE slug IN ('engineering-ai-engineer','engineering-data-engineer','support-analytics-reporter',
                'specialized-mcp-builder','specialized-workflow-architect','specialized-model-qa',
                'zk-steward','identity-graph-operator')
   AND department <> 'data-ai';

UPDATE public.agents SET department='platform', updated_at=now()
 WHERE slug IN ('engineering-database-optimizer','engineering-sre',
                'engineering-incident-response-commander','support-infrastructure-maintainer')
   AND department <> 'platform';

UPDATE public.agents SET department='security', updated_at=now()
 WHERE slug IN ('engineering-security-engineer','engineering-threat-detection-engineer',
                'agentic-identity-trust','blockchain-security-auditor','compliance-auditor')
   AND department <> 'security';

UPDATE public.agents SET department='legal', updated_at=now()
 WHERE slug IN ('support-legal-compliance-checker','legal-document-review')
   AND department <> 'legal';

UPDATE public.agents SET department='ceo', updated_at=now()
 WHERE slug IN ('support-executive-summary-generator','specialized-chief-of-staff',
                'specialized-document-generator')
   AND department <> 'ceo';

UPDATE public.agents SET department='people-hr', updated_at=now()
 WHERE slug IN ('corporate-training-designer','recruitment-specialist','hr-onboarding')
   AND department <> 'people-hr';

UPDATE public.agents SET department='marketing', updated_at=now()
 WHERE slug='specialized-developer-advocate' AND department <> 'marketing';

UPDATE public.agents SET department='design', updated_at=now()
 WHERE slug='specialized-cultural-intelligence-strategist' AND department <> 'design';

UPDATE public.agents SET department='risk-audit', updated_at=now()
 WHERE slug='automation-governance-architect' AND department <> 'risk-audit';

UPDATE public.agents SET department='finance', updated_at=now()
 WHERE slug IN ('accounts-payable-agent','supply-chain-strategist')
   AND department <> 'finance';

UPDATE public.agents SET department='engineering', updated_at=now()
 WHERE slug='lsp-index-engineer' AND department <> 'engineering';

UPDATE public.agents SET department='customer-success', updated_at=now()
 WHERE slug IN ('sales-account-strategist','support-support-responder')
   AND department <> 'customer-success';

UPDATE public.agents SET department='revops', updated_at=now()
 WHERE slug='sales-pipeline-analyst' AND department <> 'revops';

-- testing → quality (departman "genişler": tüm quality kadrosu taşınır)
UPDATE public.agents SET department='quality', updated_at=now()
 WHERE department='testing';

-- B) MERGE 6 — rol ölür, satır emici departmanda arşivlenir (geri izlenebilir)
UPDATE public.agents SET employment_status='archived', updated_at=now()
 WHERE slug='project-manager-senior' AND employment_status <> 'archived';  -- → project-shepherd

UPDATE public.agents SET department='finance', employment_status='archived', updated_at=now()
 WHERE slug='support-finance-tracker'
   AND (department <> 'finance' OR employment_status <> 'archived');       -- → fpa-analyst

UPDATE public.agents SET department='customer-success', employment_status='archived', updated_at=now()
 WHERE slug='customer-service'
   AND (department <> 'customer-success' OR employment_status <> 'archived'); -- → support-responder

UPDATE public.agents SET department='sales', employment_status='archived', updated_at=now()
 WHERE slug='sales-outreach' AND employment_status <> 'archived';          -- → outbound-strategist

UPDATE public.agents SET department='revops', employment_status='archived', updated_at=now()
 WHERE slug IN ('data-consolidation-agent','report-distribution-agent')
   AND (department <> 'revops' OR employment_status <> 'archived');        -- → revenue-reporting-agent

-- C) TRANSFORM — 3 dosya 1 rol: pipeline'ın taşıyıcı satırı yeni rol adını alır
UPDATE public.agents
   SET slug='revenue-reporting-agent', department='revops', updated_at=now()
 WHERE slug='sales-data-extraction-agent';

-- D) RETIRE 15 → people-hr şablon havuzu (archived) + library_items kaydı
UPDATE public.agents SET department='people-hr', employment_status='archived', role_level=NULL, updated_at=now()
 WHERE slug IN ('specialized-civil-engineer','government-digital-presales-consultant',
                'healthcare-customer-service','healthcare-marketing-compliance',
                'hospitality-guest-services','retail-customer-returns','real-estate-buyer-seller',
                'loan-officer-assistant','study-abroad-advisor','legal-billing-time-tracking',
                'legal-client-intake','language-translator','specialized-french-consulting-market',
                'specialized-korean-business-navigator','specialized-salesforce-architect')
   AND (department <> 'people-hr' OR employment_status <> 'archived');

INSERT INTO public.library_items (kind, name, version, owner_dept, usage_notes, review_status, owner_employee_id)
SELECT 'persona', a.slug, a.persona_version,
       (SELECT d.id FROM public.departments d WHERE d.slug='people-hr'),
       'client-vertical şablon (retire→library — WORKFORCE-GAP-MATRIX §2, CEO onayı 2026-07-11). '
       || 'Ham madde: ' || a.persona_path || '. Müşteri projesi gelince HR + ilgili head v2''ye çevirip aktive eder.',
       'archived', a.id
  FROM public.agents a
 WHERE a.slug IN ('specialized-civil-engineer','government-digital-presales-consultant',
                'healthcare-customer-service','healthcare-marketing-compliance',
                'hospitality-guest-services','retail-customer-returns','real-estate-buyer-seller',
                'loan-officer-assistant','study-abroad-advisor','legal-billing-time-tracking',
                'legal-client-intake','language-translator','specialized-french-consulting-market',
                'specialized-korean-business-navigator','specialized-salesforce-architect')
   AND NOT EXISTS (SELECT 1 FROM public.library_items li WHERE li.kind='persona' AND li.name=a.slug);

-- E) ADD 14 head satırı (matris §1 — social-media-orchestrator E5.2c'de açıldı; toplam 19 head)
INSERT INTO public.agents (slug, department, role, role_level, employment_status,
                           persona_path, persona_version, status)
SELECT v.slug, v.dept, 'head', 'director', 'draft',
       'HOLDING-OS-MASTER-PLAN/WORKFORCE-GAP-MATRIX.md', 'v0-add', 'dormant'
FROM (VALUES
  ('head-of-strategy',        'strategy'),
  ('chro',                    'people-hr'),
  ('general-counsel',         'legal'),
  ('enterprise-risk-manager', 'risk-audit'),
  ('ciso',                    'security'),
  ('chief-ai-officer',        'data-ai'),
  ('platform-head',           'platform'),
  ('head-of-design',          'design'),
  ('cmo',                     'marketing'),
  ('head-of-sales',           'sales'),
  ('revops-head',             'revops'),
  ('head-of-customer-success','customer-success'),
  ('cfo',                     'finance'),
  ('quality-head',            'quality')
) AS v(slug, dept)
ON CONFLICT (slug) DO NOTHING;

-- F) PROMOTE 4 → head (matris §1; persona v2 + director_id ataması E5.3 yazımında)
UPDATE public.agents SET role='head', role_level='director', updated_at=now()
 WHERE slug IN ('engineering-software-architect','product-manager',
                'paid-media-ppc-strategist','project-management-studio-producer')
   AND (role <> 'head' OR role_level IS DISTINCT FROM 'director');

-- Sosyal medya orkestratörü de head/director işaretlenir (E5.2c satırı vardı, seviye boştu)
UPDATE public.agents SET role='head', role_level='director', updated_at=now()
 WHERE slug='social-media-orchestrator'
   AND (role <> 'head' OR role_level IS DISTINCT FROM 'director');

-- Orkestratör role_level güvencesi (E5.2'de işlendi; idempotent tekrar)
UPDATE public.agents SET role_level='orchestrator', updated_at=now()
 WHERE slug='agents-orchestrator' AND role_level IS DISTINCT FROM 'orchestrator';

-- G) Boşalan departman satırları silinir (yalnız gerçekten boşsa — güvenlik korkuluğu)
DELETE FROM public.departments d
 WHERE d.slug IN ('specialized','testing','support','research')
   AND NOT EXISTS (SELECT 1 FROM public.agents a WHERE a.department = d.slug);

COMMIT;

-- ROLLBACK planı (elle, sırayla):
-- 1. INSERT INTO departments (slug, display_name, status) VALUES
--    ('specialized','Specialized','dormant'),('testing','Testing','dormant'),
--    ('support','Support','dormant'),('research','Research','dormant');
-- 2. DELETE FROM agents WHERE slug IN ('head-of-strategy','chro','general-counsel',
--    'enterprise-risk-manager','ciso','chief-ai-officer','platform-head','head-of-design',
--    'cmo','head-of-sales','revops-head','head-of-customer-success','cfo','quality-head')
--    AND persona_id IS NULL;
-- 3. UPDATE agents SET slug='sales-data-extraction-agent', department='specialized'
--    WHERE slug='revenue-reporting-agent';
-- 4. DELETE FROM library_items WHERE kind='persona' AND review_status='archived'
--    AND name IN (yukarıdaki 15 slug);
-- 5. Kalan department/employment_status/role alanları için git'teki bu dosyanın A-F
--    bloklarını tersine uygula (eski değerler matris §2 tablolarında kayıtlı).
