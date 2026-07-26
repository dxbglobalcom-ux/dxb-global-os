-- U21 (CEO order 2026-07-26): QUALITY TIER LAW.
--
-- CEO in chat, verbatim: "ana hedef KALİTE!!! her işte!!! zeka!!!" and
-- "sonnet şuanlık kritik işlerde asla olmamalı ... sadece angarya işlerinde".
-- Preceded by the roster order of 2026-07-25: main roster = Opus 5 high,
-- Codex 5.6 Solo high, GPT 5.x high, Sonnet high, plus a local model for very
-- simple work; haiku 4.5, DeepSeek Flash, Kimi 2.7 and Opus 4.8 are dismissed.
--
-- THE LAW (normative text: MODEL_ROUTING_SPEC §4d):
--   Judgment, decision, money and every output a human (CEO or customer) reads
--   is produced by Opus 5. A lower tier's output is never a finished product --
--   it is the higher tier's input.
--
--   tier | meaning                                  | model today
--   -----+------------------------------------------+------------------------
--   L1   | judgment, taste, structure, and anything  | fable-5
--        | a human sees: strategy, decisions, site   | (display 'Claude Opus 5')
--        | and store build, design, video direction, |
--        | feature code, the CEO conversation        |
--   L2   | mechanical backend code with no visual or | sonnet-5
--        | structural judgment in it (bulk plumbing) |
--   L3   | grunt text work: gathering, drafting,     | sonnet-5
--        | summarising -- never a finished product   |
--   L4   | mechanical/clerical (local-pending)       | sonnet-5, effort low,
--        | classify, extract, transcribe, subtitle   | until the local model
--        |                                           | exam runs on the new PC
--
-- CEO refinement the same turn, verbatim: "site mağaza kurulumunu sen
-- yapacaksın tasarım vs ... basit ve göze hitap etmeyen backend işleri vs
-- bunlar diğer modeller ... videolarda alt yazı başka model ama videoların
-- tasarımı vs sen". So the split is NOT "expensive vs cheap" and NOT "code vs
-- text" -- it is: does the work carry taste, structure or a human-visible
-- result? Those never leave Opus 5, permanently. A Codex/GPT lane, when it is
-- built, competes for L2 mechanical work only -- never for the design lane.
--
-- Measured before this migration (this session, live DB):
--   routing_rules            42 rows; model column carries the slug (model_id
--                            NULL on 29 of 42 -- the resolver reads `model`,
--                            packages/kernel/src/policy.ts:66)
--   Sonnet on critical rows: chat.answer, voice.answer, research.synthesis,
--                            dept-head.planning, content.outbound (x2),
--                            memory.promote
--   dismissed models still routed: glm-5.2 (code.bulk, memory.classify,
--                            video.classify), kimi-2.7-code (code.bulk),
--                            deepseek-v4-flash (ingest, research.fanout,
--                            summarize), qwen3.6-flash (research.fanout),
--                            minimax-m3 (ingest, summarize),
--                            claude-haiku-4-5 (slot.fast_task, slot.low_cost,
--                            voice.classify)
--   tasks in flight:         0 queued/running/blocked -- no live task carries a
--                            tier whose model changes under it
--   agents:                  205 rows, brain='glm-5.2', brain_source='default'
--                            on every one (never assigned, and glm is dismissed)
--   settings_registry:       orchestrator.fast_task_model and
--                            orchestrator.low_cost_model default to
--                            claude-haiku-4-5; settings_values has NO override
--                            on either key (nothing CEO-set is overwritten)
--
-- Second, independent reason the dismissed models had to go: they are all
-- `mode='api'` rows served through OpenRouter, whose balance is exhausted
-- (total_credits 5 / total_usage 5.1955, measured 2026-07-26). Those rows could
-- not have executed at all. This migration does not lose a working capability.
--
-- Determinism side-effect, deliberate: packages/orchestrator/src/worker-shim.ts:153
-- picks a task's model by matching model_tier ALONE (first enabled row at that
-- tier). Before this migration L3 could resolve to glm-5.2, kimi-2.7-code,
-- sonnet-5 or codex-5.5 depending on priority/updated_at ordering. After it,
-- every tier is model-homogeneous, so tier match == model match.
--
-- Catalog rows are RETIRED + BANNED, never deleted: agent_runs and cost_ledger
-- history references them (same rule as U20). `banned=true` is the migration-only
-- guard from MODEL_ROUTING_SPEC R2 -- fn_update_agent_brain and the §4c onboard
-- flow both refuse a banned model, so no dashboard action can re-hire one.

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Dismissal. Seven models leave the assignable pool.
-- ---------------------------------------------------------------------------
UPDATE public.model_catalog
   SET status = 'retired',
       banned = true
 WHERE id IN (
   'claude-haiku-4-5',   -- CEO 2026-07-25: "haiku yok ... şirketten kovuyorum"
   'deepseek-v4-flash',
   'kimi-2.7-code',
   'kimi-3',             -- never left `testing`; not in the CEO's roster
   'glm-5.2',
   'qwen3.6-flash',
   'minimax-m3',
   'codex-5.5'           -- superseded by codex-5.6 Solo in the CEO's roster
 );

-- deepseek-v4-pro stays active but may never produce a verdict: it exists only
-- for bulk reads too large for the local tier (1M context). mechanical_only is
-- the enforced form of "no judgment".
UPDATE public.model_catalog
   SET mechanical_only = true
 WHERE id = 'deepseek-v4-pro';

-- ---------------------------------------------------------------------------
-- 2. Critical work leaves Sonnet. Everything a human reads is Opus 5 now.
-- ---------------------------------------------------------------------------

-- The CEO conversation itself -- written chat and the voice lane.
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'high'
 WHERE task_class = 'chat.answer';

-- Voice keeps effort='low' as a ROW value, not as a code constant: the lane is
-- latency-critical (registered adaptation 2026-07-17, a 104s measured wall on
-- the L1 'orchestration' row). Opus 5 at low effort outranks Sonnet at medium
-- on quality while staying in the fast lane; the hardcoded "low" in
-- packages/voice/src/answer.ts is removed in the same commit so this row is
-- what actually governs.
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'low'
 WHERE task_class = 'voice.answer';

-- Research judgment. The company's most important leg (CEO 2026-07-26):
-- gathering may be cheap, deciding what the findings MEAN may not.
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'high'
 WHERE task_class = 'research.synthesis';

-- Department head planning: decides what a whole department does next.
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'high'
 WHERE task_class = 'dept-head.planning';

-- Outbound content: the customer/public reads this verbatim.
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'high'
 WHERE task_class = 'content.outbound';

-- Memory promotion writes durable company knowledge -- a bad promotion poisons
-- every later answer, so it is judgment, not clerical work.
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'medium'
 WHERE task_class = 'memory.promote';

-- Feature code, site and store build, integrations that shape a product the
-- customer will actually use. This is a DESIGN lane, not a typing lane, so it
-- is L1 permanently -- not "L1 until a cheaper coder model is wired up".
UPDATE public.routing_rules
   SET model = 'fable-5', model_tier = 'L1', mode = 'subscription', effort = 'high'
 WHERE task_class = 'code.standard';

-- ---------------------------------------------------------------------------
-- 3a. Mechanical backend code (L2) -- Sonnet. Bulk plumbing with no visual or
--     structural judgment in it. L2 must stay populated: worker-shim throws on
--     a tier with no enabled row.
-- ---------------------------------------------------------------------------
UPDATE public.routing_rules
   SET model = 'sonnet-5', model_tier = 'L2', mode = 'subscription', effort = 'medium'
 WHERE task_class = 'code.bulk';

-- ---------------------------------------------------------------------------
-- 3b. Grunt text work (L3) -- Sonnet, and only Sonnet. Gathering and drafting;
--     the output is raw material for L1, never a finished product.
-- ---------------------------------------------------------------------------
UPDATE public.routing_rules
   SET model = 'sonnet-5', model_tier = 'L3', mode = 'subscription', effort = 'medium'
 WHERE task_class IN ('research.fanout', 'video.summarize');

-- ---------------------------------------------------------------------------
-- 4. Mechanical work (L4) -- local model's future home. Sonnet at low effort
--    holds the slot until the local-model exam runs on the new PC.
-- ---------------------------------------------------------------------------
UPDATE public.routing_rules
   SET model = 'sonnet-5', model_tier = 'L4', mode = 'subscription', effort = 'low'
 WHERE task_class IN (
   'ingest', 'summarize', 'memory.classify', 'video.classify', 'voice.classify',
   'slot.fast_task', 'slot.low_cost'
 );

-- 4b. The 13 role-slot rows carry BOTH columns: `model` (slug vocabulary, read
--     by packages/kernel/src/policy.ts) and `model_id` (catalog FK, read by
--     fn_select_model). Updating only `model` would leave the slot resolver
--     still pointing at a banned catalog row — caught by tests/e7/routing-slots
--     before this migration was committed. Keep the two columns in agreement.
UPDATE public.routing_rules
   SET model_id = 'claude-sonnet-5'
 WHERE role_slot IS NOT NULL
   AND model_id IN ('claude-haiku-4-5', 'glm-5.2', 'deepseek-v4-flash',
                    'kimi-2.7-code', 'kimi-3', 'qwen3.6-flash', 'minimax-m3',
                    'codex-5.5');

-- ---------------------------------------------------------------------------
-- 5. Duplicate rows collapse. content.outbound and video.explain each had two
--    identical-model rows differing only in priority; research.fanout, ingest,
--    summarize, code.bulk had two rows that now resolve to the same model.
--    Keeping both would leave a dead lower-priority twin that can never win.
-- ---------------------------------------------------------------------------
DELETE FROM public.routing_rules a
 USING public.routing_rules b
 WHERE a.task_class = b.task_class
   AND a.model = b.model
   AND a.model_tier = b.model_tier
   AND a.effort = b.effort
   AND coalesce(a.role_slot, '') = coalesce(b.role_slot, '')
   AND a.priority < b.priority;

-- ---------------------------------------------------------------------------
-- 6. Role-slot defaults in settings: the two haiku slots follow the L4 rule.
--    No settings_values override exists on either key (measured), so this
--    changes the effective value, not just the default.
-- ---------------------------------------------------------------------------
UPDATE public.settings_registry
   SET value_schema = jsonb_set(value_schema, '{default}', '"claude-sonnet-5"')
 WHERE key IN ('orchestrator.fast_task_model', 'orchestrator.low_cost_model');

-- ---------------------------------------------------------------------------
-- 7. Employee brains. All 205 agents carried brain='glm-5.2' with
--    brain_source='default' -- the column DEFAULT showing through, never an
--    assignment (MODEL_ROUTING_SPEC §4b calls this the known placeholder and
--    names this migration the "routing assignment pass"). glm is now banned, so
--    leaving it would display a fired model as every employee's brain.
--    Mapping follows the tier law by role level; brain_source='slot' marks it
--    as derived, so a later slot-rule change re-resolves it while any future
--    'ceo_override' stays untouched.
-- ---------------------------------------------------------------------------
UPDATE public.agents
   SET brain = 'fable-5', brain_source = 'slot'
 WHERE brain_source = 'default'
   AND role_level IN ('orchestrator', 'director');

UPDATE public.agents
   SET brain = 'claude-sonnet-5', brain_source = 'slot'
 WHERE brain_source = 'default';

-- ---------------------------------------------------------------------------
-- 8. Governance trail. The tier law is a CEO decision, so it is readable from
--    the decision log, not only from this file.
-- ---------------------------------------------------------------------------
INSERT INTO public.decision_log (decided_by, decision, rationale, risk, data_used)
VALUES (
  'ceo',
  'U21 quality tier law: judgment and every human-read output routes to Opus 5; Sonnet is grunt-only; haiku 4.5, DeepSeek Flash, Kimi 2.7, Kimi 3, GLM 5.2, Qwen 3.6, MiniMax M3 and Codex 5.5 are retired and banned',
  'CEO order 2026-07-26 in chat: quality is the goal in every job, and Sonnet must never sit on critical work -- only on grunt work such as the gathering half of research. Dismissed models were additionally unreachable: every one of them was an OpenRouter api-mode row and that balance is exhausted.',
  'low',
  ARRAY['routing_rules', 'model_catalog', 'settings_registry', 'agents']
);

COMMIT;

-- ROLLBACK (restores the pre-U21 state measured above):
--   UPDATE public.model_catalog SET status='active', banned=false
--     WHERE id IN ('claude-haiku-4-5','deepseek-v4-flash','kimi-2.7-code','glm-5.2',
--                  'qwen3.6-flash','minimax-m3','codex-5.5');
--   UPDATE public.model_catalog SET status='testing', banned=false WHERE id='kimi-3';
--   UPDATE public.model_catalog SET mechanical_only=false WHERE id='deepseek-v4-pro';
--   UPDATE public.routing_rules SET model='sonnet-5', model_tier='L2', effort='medium'
--     WHERE task_class IN ('chat.answer','voice.answer','research.synthesis','dept-head.planning');
--   UPDATE public.routing_rules SET model='sonnet-5', model_tier='L4', effort='medium' WHERE task_class='content.outbound';
--   UPDATE public.routing_rules SET model='sonnet-5', model_tier='L2', effort='high'   WHERE task_class='memory.promote';
--   UPDATE public.routing_rules SET model='sonnet-5', model_tier='L3', effort='medium' WHERE task_class='code.standard';
--   UPDATE public.routing_rules SET model='deepseek-v4-flash', model_tier='L4', mode='api' WHERE task_class='research.fanout';
--   UPDATE public.routing_rules SET model='glm-5.2', model_tier='L3', mode='api' WHERE task_class='code.bulk';
--   UPDATE public.routing_rules SET model='minimax-m3', model_tier='L4', mode='api' WHERE task_class IN ('ingest','summarize');
--   UPDATE public.routing_rules SET model='glm-5.2', model_tier='L4', mode='api' WHERE task_class IN ('memory.classify','video.classify');
--   UPDATE public.routing_rules SET model='claude-haiku-4-5', model_tier='L4', mode='subscription'
--     WHERE task_class IN ('voice.classify','slot.fast_task','slot.low_cost');
--   UPDATE public.routing_rules SET model='sonnet-5', model_tier='L2' WHERE task_class='video.summarize';
--   UPDATE public.settings_registry SET value_schema=jsonb_set(value_schema,'{default}','"claude-haiku-4-5"')
--     WHERE key IN ('orchestrator.fast_task_model','orchestrator.low_cost_model');
--   UPDATE public.agents SET brain='glm-5.2', brain_source='default' WHERE brain_source='slot';
--   (deleted duplicate rows are NOT restored by this rollback -- they were dead twins)
