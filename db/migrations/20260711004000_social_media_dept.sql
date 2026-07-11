-- E5.6 öncüsü: Social Media Department kuruluşu (CEO direktifi 2026-07-11)
-- Kaynak: HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md
-- 12 rol ADD (WORKFORCE-GAP-MATRIX §3 aile 16); personalar Fable-yazımı bekler (K2),
-- aktivasyon persona gate'i geçmeden imkânsız (trg_agents_persona_passed + G3).
-- İdempotent: tekrar koşulabilir.

INSERT INTO public.departments (slug, display_name)
VALUES ('social-media', 'Social Media')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.agents (slug, department, role, brain, persona_path, persona_version)
SELECT v.slug, 'social-media', v.role, 'glm-5.2',
       'HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-SOCIAL-MEDIA-DEPT.md', 'v0-add'
FROM (VALUES
  ('social-media-orchestrator',  'head'),
  ('social-account-connector',   'worker'),
  ('social-content-strategist',  'worker'),
  ('social-copywriter',          'worker'),
  ('social-creative-asset',      'worker'),
  ('social-scheduler-publisher', 'worker'),
  ('social-inbox-agent',         'worker'),
  ('social-analytics-agent',     'worker'),
  ('social-reporting-agent',     'worker'),
  ('social-approval-workflow',   'worker'),
  ('social-client-workspace',    'worker'),
  ('social-mcp-api-agent',       'worker')
) AS v(slug, role)
WHERE NOT EXISTS (SELECT 1 FROM public.agents a WHERE a.slug = v.slug);
