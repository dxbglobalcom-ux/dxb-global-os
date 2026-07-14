-- E12.1 wave F — /ops/automations read surface: the 9 live pg-boss
-- schedules (lease-reaper, velocity-breaker, memory-compaction, hr.*, …)
-- are the holding's REAL recurring automations, but pgboss lives outside
-- the PostgREST-exposed schema. This view is a deliberate DEFINER-style
-- projection (NOT security_invoker — authenticated has no pgboss usage):
-- read-only, name/cron/timezone/timestamps only, no job payloads.

CREATE OR REPLACE VIEW public.v_automation_schedules AS
SELECT s.name, s.cron, s.timezone, s.created_on, s.updated_on
FROM pgboss.schedule s;

GRANT SELECT ON public.v_automation_schedules TO authenticated, service_role;

COMMENT ON VIEW public.v_automation_schedules IS
  'E12.1: read-only projection of pgboss.schedule for the Automations page (definer semantics on purpose; no payload columns).';

-- ROLLBACK:
--   DROP VIEW IF EXISTS public.v_automation_schedules;
