-- B39 — THE TWO BRAKES THE DISPATCH LINE NEVER HAD.
--
-- WHY THIS EXISTS. The CEO asked on 2026-08-25 why one worker appeared to be
-- doing 214 agents' work, and whether the single line was a leftover of the 8 GB
-- rented box. The answer to the question as asked is that nobody did anybody
-- else's work — `claimed_by` is the company's own dispatcher and `agent_id` is
-- 199 different employees. But the measurement that followed found something he
-- did not ask about and would have paid for: the line cannot safely be doubled,
-- and the reason is not RAM.
--
-- MEASURED IN THE COMPANY'S OWN DATABASE, 2026-08-25:
--   · agent_runs        378 runs · 276,736 in + 755,790 out = 1,032,526 tokens
--   · agent_runs.cost_eur                                     SUM = 0
--   · cost_ledger                                             0 rows, total
--   · settings_registry 112 keys, and `employee.max_concurrent_runs` is NOT one
--
-- So the company has done a million tokens of work and its cost book has never
-- held a single line. Both brakes that exist — the 60-minute velocity breaker
-- (breaker.ts) and the monthly cap (monthly-cap.ts) — read cost_ledger plus the
-- LiteLLM proxy's spend tables, and Anthropic models bypass that proxy entirely
-- on the CEO's own order of 2026-07-19 (C2). Neither brake can see the main
-- working path at all. Doubling the line would double an expense nothing counts.
--
-- WHAT THIS MIGRATION ADDS — three settings, all three in the CEO's hand:
--   1. employee.max_concurrent_runs — the per-employee ceiling the orchestration
--      spec has demanded since day one (AGENT_ORCHESTRATION_SPEC §6, A2) and
--      which has never been seeded. Until now `assignEmployee` only PREFERRED
--      the least-loaded employee, so two dispatch lines could put two jobs on
--      one person — the exact opposite of "herkes kendi işini yapmalı".
--   2. orchestrator.subscription_tokens_per_hour — the brake that can actually
--      stop the subscription path, because the only lever that reaches it is
--      refusing to claim more work. The breaker's lever (blocking a LiteLLM
--      virtual key) touches nothing on this path.
--   3. orchestration.dispatch_lanes — how many tasks the company works on at
--      once. R5 (SYSTEM_ARCHITECTURE:79) writes its OWN reopening condition —
--      "ancak ölçüm kanıtıyla (latency/lock) ve CEO onayıyla" — and that
--      measurement had never been taken. It has now, and it is in
--      scripts/bench/drain-throughput.mjs: 24 tasks, real drains, real database.
--        1 lane  36.6s   2,362 tasks/h   median 1520 ms   0 collisions  0 lock waits
--        2 lanes 18.3s   4,712 tasks/h   median 1523 ms   0 collisions  0 lock waits
--        4 lanes  9.2s   9,379 tasks/h   median 1532 ms   0 collisions  0 lock waits
--        8 lanes  4.7s  18,430 tasks/h   median 1560 ms   0 collisions  0 lock waits
--      7.80x on eight lanes, and the memory cost of all eight was 4.5 MB. The
--      RAM premise R5 rests on does not survive that measurement — but R5's
--      DISCIPLINE does, so lanes are raised INSIDE the existing scheduler job
--      and no new resident service is opened. The default stays 1: the company
--      has an empty queue today (last task 2026-07-28, by the CEO's own design —
--      "ben bilerek henüz aktif para üretme mekanizmasını başlatmadım"), and a
--      ceiling raised before there is work to do would be a guess.
--
-- THE SINGLE-SOURCE COST RULE IS NOT BROKEN BY THIS (litellm.ts LOCKED header,
-- 04-04): that rule forbids a SECOND writer of API-mode cost, because LiteLLM's
-- own spend tables already hold it. The subscription path is not in those tables
-- and never was, so writing its TOKENS to cost_ledger with cost_eur = 0 adds no
-- second source of anything — it fills a hole. council.ts has written exactly
-- this shape since Phase 4 (cost_eur: 0, "api EUR lives in LiteLLM spend logs").
--
-- CEILING VALUES, and why these numbers. Both are ceilings, not targets, and the
-- CEO can move either from his own settings screen.
--   · max_concurrent_runs = 1 — one employee, one job at a time. It binds
--     NOTHING today (one line can only run one task), which is the point: the
--     rule is in place BEFORE the line is multiplied, not after.
--   · subscription_tokens_per_hour = 500,000 — measured basis: 1,032,526 tokens
--     over 378 runs = 2,732 tokens per run. A single line at a realistic two
--     minutes per task does ~26 runs/hour ≈ 71,000 tokens; four lines ≈ 284,000.
--     500,000 leaves a full line of headroom above four, and a runaway retry
--     loop crosses it in minutes rather than at month-end.
--
-- Spec: AGENT_ORCHESTRATION_SPEC §6 (A2 closes) · SYSTEM_ARCHITECTURE R5
-- (registered adaptation: raising concurrency INSIDE an existing service is not
-- opening a new resident service).

BEGIN;

INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('employee.max_concurrent_runs', 'employees',
   '{"type":"integer","default":1,"minimum":1,"maximum":8}',
   'high', false, 'raises', '{orchestration,employees}',
   'How many tasks one employee may have running at the same moment. The dispatcher will not hand a second job to an employee already at this ceiling.',
   'Bir çalışanın aynı anda kaç işi birden yürütebileceği. Bu tavana ulaşmış bir çalışana dağıtım ikinci bir iş vermez.',
   false, '{global,department}', NULL),
  ('orchestrator.subscription_tokens_per_hour', 'orchestrator',
   '{"type":"integer","default":500000,"minimum":10000}',
   'critical', false, 'raises', '{orchestration,cost}',
   'Hourly ceiling on tokens spent by the subscription path. That path does not go through the cost proxy, so neither money brake can see it; when this ceiling is crossed the dispatch line stops claiming new work until the hour rolls off.',
   'Abonelik yolunun bir saatte harcayabileceği en fazla token. Bu yol masraf vekilinden geçmediği için iki para freni de onu göremiyor; tavan aşılınca dağıtım hattı, saat geçene kadar yeni iş almayı durdurur.',
   false, '{global}', NULL),
  ('orchestration.dispatch_lanes', 'orchestration',
   '{"type":"integer","default":1,"minimum":1,"maximum":8}',
   'high', false, 'raises', '{orchestration}',
   'How many tasks the company may work on at the same moment. Measured 2026-08-25 on the construction engine: 8 lanes drained the same queue 7.80x faster than 1, with zero double-claims, zero lock waits and 4.5 MB more memory. Default stays 1 — the machinery is proven, the decision to use it is the CEO''s.',
   'Şirketin aynı anda kaç işi birden yürütebileceği. 2026-08-25''te ölçüldü: 8 hat aynı kuyruğu tek hattan 7,80 kat hızlı bitirdi; hiç çakışma olmadı, hiç bekleme olmadı, bellek 4,5 MB arttı. Varsayılan 1 kalıyor — makine hazır, kullanma kararı CEO''nundur.',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('employee.max_concurrent_runs', 'global', '1'::jsonb, 'migration-b39'),
  ('orchestrator.subscription_tokens_per_hour', 'global', '500000'::jsonb, 'migration-b39'),
  ('orchestration.dispatch_lanes', 'global', '1'::jsonb, 'migration-b39')
ON CONFLICT DO NOTHING;

-- The subscription path's own ledger rows carry this source. It is NOT
-- 'litellm' (that path never touched the proxy) and it is NOT 'manual' (no
-- human wrote it): it is the worker recording its own consumption.
ALTER TABLE public.cost_ledger DROP CONSTRAINT IF EXISTS cost_ledger_source_check;
ALTER TABLE public.cost_ledger
  ADD CONSTRAINT cost_ledger_source_check
  CHECK (source = ANY (ARRAY['litellm'::text, 'hook'::text, 'manual'::text, 'worker'::text]));

COMMENT ON CONSTRAINT cost_ledger_source_check ON public.cost_ledger IS
  'B39 (2026-08-25): ''worker'' added for the subscription execution path, which bypasses the LiteLLM proxy on the CEO''s order of 2026-07-19 and therefore appears in no spend table. Its rows carry real token counts and cost_eur = 0 — the single-source rule (litellm.ts LOCKED) forbids a second writer of API-mode EUR, and this writes none.';

-- The hourly window the brake reads. A plain index on the column the window
-- filters: without it the check is a sequential scan on every claim.
CREATE INDEX IF NOT EXISTS cost_ledger_created_at_mode_idx
  ON public.cost_ledger (created_at DESC, mode);

COMMIT;

-- ROLLBACK (never run automatically — the CEO's settings are his):
--   DELETE FROM public.settings_values WHERE key IN
--     ('employee.max_concurrent_runs','orchestrator.subscription_tokens_per_hour');
--   DELETE FROM public.settings_registry WHERE key IN
--     ('employee.max_concurrent_runs','orchestrator.subscription_tokens_per_hour');
--   DROP INDEX IF EXISTS public.cost_ledger_created_at_mode_idx;
