-- E12.1 wave F — /sys/integrations outbox posture: the page only needs
-- per-status counts of the approval-gated outbox. The outbox table itself
-- stays closed to authenticated (execution_result may carry outward-action
-- payload results); this DEFINER-style projection exposes status alone,
-- same pattern as v_automation_schedules (20260714070000).

CREATE OR REPLACE VIEW public.v_outbox_status AS
SELECT o.id, o.status
FROM public.outbox o;

GRANT SELECT ON public.v_outbox_status TO authenticated, service_role;

COMMENT ON VIEW public.v_outbox_status IS
  'E12.1: status-only projection of outbox for the Integrations page (definer semantics on purpose; no payload/result columns).';

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_outbox_status;
