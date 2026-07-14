-- E12.1 wave B — /org/hr read surface: the three HR views (E5.4b family)
-- were reachable from psql/MCP contexts only; the CEO dashboard session
-- (authenticated) needs SELECT to render the HR board. security_invoker
-- views — underlying agents/personas/tasks grants already exist.

GRANT SELECT ON public.v_hr_roster, public.v_hr_probation_queue,
  public.v_hr_equipment_check TO authenticated;

-- ROLLBACK:
--   REVOKE SELECT ON public.v_hr_roster, public.v_hr_probation_queue,
--     public.v_hr_equipment_check FROM authenticated;
