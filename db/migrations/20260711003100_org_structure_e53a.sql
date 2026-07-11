-- 20260711003100_org_structure_e53a.sql — E5.3a: hedef org iskeleti (WORKFORCE-GAP-MATRIX §1)
-- CEO onaylı hedef: 18 departman + 5 pod. Bu migration yeni departman satırlarını açar
-- ve orkestratörü ceo departmanına taşır. specialized/testing/support KAPATILMAZ —
-- içlerindeki ajanlar kendi v2 yazım dalgasında taşınır (kayıt-dışı toplu taşıma yok);
-- boşalan departmanların kapanışı ayrı CEO-onaylı migration'dır (matris §5.3).
-- İdempotent; dosya sonunda ROLLBACK bloğu.

INSERT INTO public.departments (slug, display_name, mcp_profile, status, company_id)
SELECT v.slug, v.display_name, 'default-deny', 'dormant',
       (SELECT id FROM public.companies WHERE slug = 'dxb-global')
FROM (VALUES
  ('people-hr',        'People / HR / Talent Operations'),
  ('strategy',         'Corporate Strategy & Business Operations'),
  ('legal',            'Legal, Compliance & Corporate Governance'),
  ('risk-audit',       'Risk, Internal Audit & Assurance'),
  ('security',         'Security, Trust & Safety'),
  ('data-ai',          'Data, AI Platform & Evaluation'),
  ('platform',         'Platform, Infrastructure & Reliability'),
  ('revops',           'Revenue Operations & Commercial Excellence'),
  ('customer-success', 'Customer Success & Professional Services'),
  ('quality',          'Quality Management & Operational Excellence')
) AS v(slug, display_name)
ON CONFLICT (slug) DO NOTHING;

-- legal-de mevcut departmanı legal'in pod'u olur (matris: legal, legal-de'yi yutar)
UPDATE public.departments
   SET parent_id = (SELECT id FROM public.departments WHERE slug = 'legal')
 WHERE slug = 'legal-de' AND parent_id IS NULL;

-- orkestratör ceo departmanına (matris §2: agents-orchestrator → ceo-office)
UPDATE public.agents
   SET department = 'ceo'
 WHERE slug = 'agents-orchestrator' AND department <> 'ceo';

-- ROLLBACK:
-- UPDATE public.agents SET department='specialized' WHERE slug='agents-orchestrator';
-- UPDATE public.departments SET parent_id=NULL WHERE slug='legal-de';
-- DELETE FROM public.departments WHERE slug IN ('people-hr','strategy','legal','risk-audit',
--   'security','data-ai','platform','revops','customer-success','quality')
--   AND director_id IS NULL AND slug NOT IN (SELECT DISTINCT department FROM public.agents);
