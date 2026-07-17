-- R2.5 org parity backfill (audit F-08 gap migration #2, 2026-07-17): the
-- E5.3b closure re-roled three people-hr agents to 'worker' whose manager
-- binding on the LIVE database came from an out-of-band control-fn mutation —
-- the fresh chain reaches 20260711006000's orphan guardrail with unmanaged
-- workers and correctly refuses. This file replays exactly the live binding
-- (worker → chro), idempotently, BEFORE that guardrail runs. No-op on live.
UPDATE public.agents a
   SET manager_id = m.id, updated_at = now()
  FROM public.agents m
 WHERE m.slug = 'chro'
   AND a.department = 'people-hr'
   AND a.role = 'worker'
   AND a.manager_id IS NULL
   AND a.slug IN ('corporate-training-designer', 'hr-onboarding', 'recruitment-specialist');
