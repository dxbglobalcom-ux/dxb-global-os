-- 20260712002001_fix_identity_graph_operator_persona_path.sql
-- Corrective single-row data-fix (idempotent).
--
-- identity-graph-operator was rewritten to v2 in the D3 wave; its file lives at
-- personas/data-ai/identity-graph-operator.md. The D3 migration
-- (20260712001000_d3_wave_e55.sql) repointed persona_path for its 7 data-ai siblings
-- but MISSED this one row, which still stored the archived
-- 'agency-agents/specialized/identity-graph-operator.md' path. The agency-agents/ tree
-- was archived to ~/dxb-archive/agency-agents-20260711.tar.gz and no longer exists in-repo,
-- so the stored path dangled — violating the "file tree = DB one-to-one" rule.
--
-- Only persona_path is corrected. persona_version ('v1.0-legacy') and employment_status
-- ('dormant') are left untouched: they match all 7 data-ai siblings (that is the wave
-- convention, not drift). Guarded WHERE makes re-runs a no-op.

UPDATE public.agents
   SET persona_path = 'personas/data-ai/identity-graph-operator.md',
       updated_at   = now()
 WHERE slug = 'identity-graph-operator'
   AND persona_path = 'agency-agents/specialized/identity-graph-operator.md';

-- ROLLBACK:
--   UPDATE public.agents
--      SET persona_path = 'agency-agents/specialized/identity-graph-operator.md'
--    WHERE slug = 'identity-graph-operator';
