-- [ADAPT 07-03] Master PHASE-07 step 3 requires emitted profiles/ceo.mcp.json and
-- profiles/research.mcp.json, but the Phase-3 persona import seeded only the 12
-- on-disk agency-agents departments. The architecture doc itself mandates both:
-- "Research department — missing; must be created" (doc §5) and a CEO entry in the
-- per-department MCP maps (doc line 76). Data-only migration; idempotent.
INSERT INTO departments (slug, display_name)
VALUES ('ceo', 'CEO Office'), ('research', 'Research')
ON CONFLICT (slug) DO NOTHING;
