-- E4.4 seed — holding core rows (idempotent, re-runnable):
--   1. companies: dxb-global (the holding itself)
--   2. existing departments bound to the holding company
--   3. first project: DXB Global OS (dogfood — the OS builds itself as its
--      own first project record; owner = orchestrator)
--   4. library inventory bridge: 4 memory_source rows, one per LOCKED memory
--      store (MEMORY_ARCHITECTURE §31: fact→pgvector · relation→graphify ·
--      artifact→obsidian · procedure→notebook)
-- Spec: IMPLEMENTATION_ROADMAP E4.4; evidence commands at file end.

INSERT INTO public.companies (slug, name, mission, status)
VALUES (
  'dxb-global',
  'DXB Global',
  'AI-native technology consultancy holding: the CEO states intent once; the company executes end-to-end autonomously, with hard approval gates only where actions face outward.',
  'active'
)
ON CONFLICT (slug) DO NOTHING;

UPDATE public.departments
SET company_id = (SELECT id FROM public.companies WHERE slug = 'dxb-global')
WHERE company_id IS NULL;

INSERT INTO public.projects
  (slug, name, purpose, strategy_link, owner_employee_id, company_id, status, links)
SELECT
  'dxb-global-os',
  'DXB Global OS',
  'The holding''s own operating system — departments, manager agents, specialist agents, skills, MCP tools, persistent memory and QA running 24/7 with minimal human intervention. First project record is the OS itself (dogfood).',
  'HOLDING-OS-MASTER-PLAN/MASTER_PLAN.md',
  (SELECT id FROM public.agents WHERE slug = 'agents-orchestrator'),
  c.id,
  'active',
  '{"repos":["DxB Global OS (repo root)"],"docs":["HOLDING-OS-MASTER-PLAN/00-INDEX.md",".planning/STATE.md"],"deploys":[],"versions":["v2.0"]}'::jsonb
FROM public.companies c
WHERE c.slug = 'dxb-global'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.library_items (kind, name, version, usage_notes)
VALUES
  ('memory_source', 'pgvector',  'v1', 'fact store — memory_index + memory_embeddings (Supabase pgvector); kind=fact, LOCKED composition'),
  ('memory_source', 'graphify',  'v1', 'relation store — memory-store/relation/*.md + graph output; kind=relation, LOCKED composition'),
  ('memory_source', 'obsidian',  'v1', 'artifact store — memory-store/artifact/*.md (repo vault); kind=artifact, LOCKED composition'),
  ('memory_source', 'notebook',  'v1', 'procedure store — memory-store/procedure/*.md (open-notebook line); kind=procedure, LOCKED composition')
ON CONFLICT (kind, name, version) DO NOTHING;

-- Evidence (E4.4):
--   SELECT count(*) FROM companies;                                        -- → 1
--   SELECT count(*) FROM departments WHERE company_id IS NULL;             -- → 0
--   SELECT slug, tasks_total, member_count FROM v_project_command;        -- → dxb-global-os row
--   SELECT count(*) FROM library_items WHERE kind = 'memory_source';       -- → 4
