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
-- ⚠ READ THIS BEFORE THE NUMBERS — THE CEO CORRECTED THE FRAME, 2026-08-25:
-- "tabiki çalışmayan şirkette masraf defteri 0 olur … ŞİRKET HENÜZ KURULMADI."
-- THE EMPTY COST BOOK IS NOT A DEFECT AND IS NOT WHAT THIS MIGRATION IS ABOUT.
-- The holding is still being BUILT; he has deliberately not started the earning
-- machine (00-NOTE-FACTORY-COMPLETION-ROADMAP-2026-07-26:16), so zero cost rows
-- is the EXPECTED state and any report that calls it a failure is wrong.
--
-- THE ACTUAL HOLE IS THE MISSING WRITER, NOT THE EMPTY TABLE. Even on the day
-- the company starts earning, the main working path would still write nothing:
-- Anthropic models bypass the LiteLLM proxy on the CEO's own order of 2026-07-19
-- (C2), and both brakes — the 60-minute velocity breaker (breaker.ts) and the
-- monthly cap (monthly-cap.ts) — read cost_ledger plus that proxy's spend tables.
-- Neither can see that path AT ALL. The brake is fitted now, while the queue is
-- empty and fitting it costs nothing, rather than on the day it is needed.
--
-- MEASURED IN THE COMPANY'S OWN DATABASE, 2026-08-25 — and these figures are
-- CONSTRUCTION-ERA work (building the factory), not the holding trading:
--   · agent_runs        378 runs · 276,736 in + 755,790 out = 1,032,526 tokens
--   · agent_runs.cost_eur                                     SUM = 0
--   · cost_ledger                                             0 rows (expected)
--   · settings_registry 112 keys, and `employee.max_concurrent_runs` is NOT one
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
--      once, and IT DECIDES THIS ITSELF. The CEO's correction of 2026-08-25:
--      "bak ben ayar mayar anlamam ki! … ben hedefi söylerim yönetim kurulu
--      başkanı olarak." A dial handed to the owner is the babysitting this
--      product exists to end. 0 (the seeded value) means: every ten seconds,
--      open as many hands as there is work waiting, bounded by what the machine
--      can carry — cores - 2, capped at 8. On his workstation that is 8; on the
--      rented 4-core box the same code decides 2, configured nowhere.
--      R5 (SYSTEM_ARCHITECTURE:79) writes its OWN reopening condition —
--      "ancak ölçüm kanıtıyla (latency/lock) ve CEO onayıyla" — and that
--      measurement had never been taken. It has now — 16 tasks per level, real
--      drains, a real department with real staff through the real activation
--      gate, a real project, and the quality gates ON:
--        1 lane   97.4s     591 tasks/h   line cost  87 ms   0 collisions  0 locks
--        2 lanes  48.8s   1,179 tasks/h   line cost 110 ms   0 collisions  0 locks
--        4 lanes  24.6s   2,343 tasks/h   line cost 156 ms   0 collisions  0 locks
--        8 lanes  12.4s   4,655 tasks/h   line cost 169 ms   0 collisions  0 locks
--      7.88x on eight lanes — 98.5% of perfect — and the line's OWN cost does not
--      grow with the work: 144 ms at a 30s turn, 170 ms at 60s, 156 ms at 120s.
--      The RAM premise R5 rests on does not survive that; R5's DISCIPLINE does,
--      so concurrency is raised INSIDE the existing scheduler job.
--      READING TRAP, and the first reading fell into it: a simulated turn can
--      never pass the quality gate (A4), so the bench repeats every task
--      max_revision_rounds times — 3.00 model runs per task, the company's WORST
--      case. The real company measured 1.71 runs per task, with 154 of 217 tasks
--      (71%) passing first time.
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
--     NOTHING while a single lane runs, which is the point: the rule is in place
--     BEFORE the hands are multiplied, not after.
--   · dispatch_lanes = 0 — decide for yourself. Not a number the CEO maintains.
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
   '{"type":"integer","default":0,"minimum":0,"maximum":8}',
   'high', false, 'raises', '{orchestration}',
   '0 = the company decides for itself, and this is the normal setting. Every ten seconds it opens as many hands as there is work waiting, up to what the machine can carry (cores - 2, capped at 8) — no queue, one hand; three jobs waiting, three hands. A number from 1 to 8 pins it instead, still clamped to the machine. The CEO never has to touch this.',
   '0 = şirket kendi karar verir, normal ayar budur. Her on saniyede bir, bekleyen iş kadar el açar; üst sınırı makinenin gücüdür (çekirdek sayısı eksi 2, en fazla 8). Kuyruk boşsa tek el, üç iş bekliyorsa üç el. 1-8 arası bir sayı yazılırsa o sabitlenir. CEO''nun bu ayara hiç dokunması gerekmez.',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES
  ('employee.max_concurrent_runs', 'global', '1'::jsonb, 'migration-b39'),
  ('orchestrator.subscription_tokens_per_hour', 'global', '500000'::jsonb, 'migration-b39'),
  ('orchestration.dispatch_lanes', 'global', '0'::jsonb, 'migration-b39')
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
