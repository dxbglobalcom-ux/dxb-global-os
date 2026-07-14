-- E12.1 — Memory page read surface (MEMORY_ARCHITECTURE §8/§13)
-- memory_index had RLS enabled with ZERO policies and no SELECT grant: the
-- CEO dashboard (authenticated) could read nothing. §13: "CEO tümünü görür"
-- — the dashboard session is the CEO; agent-side dept-scope isolation lives
-- at the gateway/memory-router layer, not PostgREST.
--
-- Also fixes a broken grant found while wiring this (E9.3 precedent):
-- authenticated held TRUNCATE on memory_index — destructive privilege on an
-- append-only store, revoked.

GRANT SELECT ON public.memory_index TO authenticated;
REVOKE TRUNCATE ON public.memory_index FROM authenticated;

DROP POLICY IF EXISTS memory_index_ceo_read ON public.memory_index;
CREATE POLICY memory_index_ceo_read ON public.memory_index
  FOR SELECT TO authenticated USING (true);

-- ROLLBACK:
--   DROP POLICY IF EXISTS memory_index_ceo_read ON public.memory_index;
--   REVOKE SELECT ON public.memory_index FROM authenticated;
