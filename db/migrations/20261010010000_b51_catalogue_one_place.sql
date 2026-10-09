-- B51 step 3 · P1 — THE CATALOGUE IS THE ONE PLACE EVERY MODEL ID LIVES.
-- CEO 2026-10-09: "holding içindeki modeller her zaman güncellenmeye müsait olmalı … 'hey opus 6 çıkmış
-- ey hamza' dediğimde cart diye modeller güncellenmeli" (registered all-brains-stay-current-gate-judges-
-- 2026-10-09). Spec agreed at the table: .planning/quick/20261009-masa-b51/step3-spec.md §P1.
--
-- Measured before this file (both engines, 2026-10-09/10):
--   model_catalog had no lane, no API name, no family, no succession link; the kernel's SDK_MODEL_IDS map
--     (classify.ts) carried the API names and decided subscription-vs-api by map membership.
--   routing_rules.model held two spellings for one model: 'sonnet-5' (10 rows) and 'claude-sonnet-5';
--     model_id (the only FK) was NULL on 25 of 39 rows and read only by SQL (fn_select_model & co.).
--   agents.brain carried no FK and defaulted to 'glm-5.2' (retired).
--   The critical gate's two judges were a code constant (CRITICAL_GATE_CONFIG). As routing slot rows
--     they would collide: fn_routing_slots() is a fixed list, and a department-less L1 row at priority
--     ≥ 100 would win every L1 task's route. They become a settings key instead (P1.4, decided at the
--     table 2026-10-10).
--   Prices: platform.claude.com/docs/en/about-claude/pricing and …/models/overview, read 2026-10-10
--     (base input/output per MTok; Haiku 5.5 at its ≤100k-token tier). Codex lane:
--     ~/.codex/models_cache.json fetched 2026-10-09T22:42Z lists gpt-6.1-sol, gpt-6-astra and
--     gpt-5.6-sol (the catalogue's 'codex-5.6', display "Codex 5.6 Solo").
--
-- Sections: A catalogue columns · B existing rows filled · C new rows · D one id space on live rows ·
-- E agents.brain FK and default · F the judges' settings key and its validator · H guardrails.
-- (No models.version key: the kernel reads the catalogue per call, uncached, like loadPolicy — a
-- succession reaches the next call without a restart and without a version to bump.)

-- ── A. catalogue columns ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.model_catalog
  ADD COLUMN IF NOT EXISTS api_model_id    text,
  ADD COLUMN IF NOT EXISTS lane            text,
  ADD COLUMN IF NOT EXISTS family          text,
  ADD COLUMN IF NOT EXISTS succeeds        text REFERENCES public.model_catalog(id),
  ADD COLUMN IF NOT EXISTS released_at     date,
  ADD COLUMN IF NOT EXISTS last_checked_at timestamptz,
  ADD COLUMN IF NOT EXISTS aliases         text[] NOT NULL DEFAULT '{}';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.model_catalog'::regclass
                  AND conname = 'model_catalog_lane_check') THEN
    ALTER TABLE public.model_catalog ADD CONSTRAINT model_catalog_lane_check
      CHECK (lane IS NULL OR lane IN ('agent-sdk', 'codex-cli', 'litellm', 'local'));
  END IF;
END $$;

COMMENT ON COLUMN public.model_catalog.api_model_id IS
  'B51 P1: the name the lane is called with — agent-sdk: the Claude API id; codex-cli: the codex -m slug; litellm: the LiteLLM model name; local: NULL.';
COMMENT ON COLUMN public.model_catalog.lane IS
  'B51 P1: how the model is reached. agent-sdk and codex-cli run on the subscriptions (no API key); litellm and local do not.';
COMMENT ON COLUMN public.model_catalog.succeeds IS
  'B51 P1: the model this one replaces in a succession (P2 fn_succeed_model moves every seat from it).';
COMMENT ON COLUMN public.model_catalog.aliases IS
  'B51 P1: retired spellings that still resolve to this row (old routing rows, undo chains, evidence). A LIVE row never carries one.';
COMMENT ON COLUMN public.model_catalog.last_checked_at IS
  'B51 P1: when the price and the status were last read from the vendor''s own page.';

-- ── B. existing rows: lane, API name, family, aliases ────────────────────────────────────────────────
-- 'fable-5' keeps its id (the core's gotcha: internal keys still say fable-5; the CEO sees Opus 5).
-- Its aliases are the U20 map's keys; 'sonnet-5' becomes an alias of 'claude-sonnet-5' (section D).
UPDATE public.model_catalog SET lane = 'agent-sdk', family = 'opus', api_model_id = 'claude-opus-5',
       aliases = ARRAY['opus-5', 'opus-4.8'], last_checked_at = '2026-10-10T00:00:00Z'
 WHERE id = 'fable-5';
UPDATE public.model_catalog SET lane = 'agent-sdk', family = 'fable', api_model_id = 'claude-fable-5-1',
       last_checked_at = '2026-10-10T00:00:00Z'
 WHERE id = 'fable-5.1';
UPDATE public.model_catalog SET lane = 'agent-sdk', family = 'sonnet', api_model_id = 'claude-sonnet-5',
       aliases = ARRAY['sonnet-5'], last_checked_at = '2026-10-10T00:00:00Z'
 WHERE id = 'claude-sonnet-5';
UPDATE public.model_catalog SET lane = 'agent-sdk', family = 'opus',   api_model_id = 'claude-opus-4-8'  WHERE id = 'claude-opus-4-8';
UPDATE public.model_catalog SET lane = 'agent-sdk', family = 'haiku',  api_model_id = 'claude-haiku-4-5' WHERE id = 'claude-haiku-4-5';
-- Solo 5.6 was the gate's first challenger, called as `codex -m gpt-5.6-sol` (critical-gate.ts history).
UPDATE public.model_catalog SET lane = 'codex-cli', family = 'gpt-sol', api_model_id = 'gpt-5.6-sol' WHERE id = 'codex-5.6';
UPDATE public.model_catalog SET lane = 'codex-cli', family = 'codex' WHERE id = 'codex-5.5';
UPDATE public.model_catalog SET lane = 'litellm'
 WHERE id IN ('deepseek-v4-pro', 'deepseek-v4-flash', 'glm-5.2', 'kimi-2.7-code', 'kimi-3', 'minimax-m3', 'qwen3.6-flash');
-- llmCall sends the model name to LiteLLM unchanged; vps/litellm/config.yaml names it 'deepseek-v4-pro'.
UPDATE public.model_catalog SET api_model_id = 'deepseek-v4-pro' WHERE id = 'deepseek-v4-pro';

-- ── C. new rows ──────────────────────────────────────────────────────────────────────────────────────
-- The day's Claude brains enter as 'testing'; P4's succession (Opus 5 → 5.5, Sonnet 5 → 5.5) activates
-- them through the audited door, never here. Haiku 5.5 is born for P7's side-by-side test only: it is
-- not activated without the CEO's word (B51: "Haiku never returns" stands until he speaks).
-- The gate's judges are 'active': both answered the gate's own codex call on 2026-10-09 (live gate runs
-- 5-7) — a registered adaptation of MODEL_ROUTING_SPEC §4c: the smoke test runs on the model's own lane.
-- OpenAI publishes no per-token price for the subscription lane's slugs; their cost columns stay NULL.
INSERT INTO public.model_catalog
  (id, provider, context_window, cost_in_per_mtok, cost_out_per_mtok, status, display_name, banned,
   mechanical_only, tier_floor, api_model_id, lane, family, succeeds, last_checked_at)
VALUES
  ('claude-opus-5-5',   'anthropic', 1000000, 4,    20,   'testing', 'Claude Opus 5.5',   false, false, 'L1',
   'claude-opus-5-5',   'agent-sdk', 'opus',      'fable-5',         '2026-10-10T00:00:00Z'),
  ('claude-sonnet-5-5', 'anthropic', 1000000, 2,    10,   'testing', 'Claude Sonnet 5.5', false, false, 'L2',
   'claude-sonnet-5-5', 'agent-sdk', 'sonnet',    'claude-sonnet-5', '2026-10-10T00:00:00Z'),
  ('claude-haiku-5-5',  'anthropic', 1000000, 0.10, 0.50, 'testing', 'Claude Haiku 5.5',  false, true,  'L4',
   'claude-haiku-5-5',  'agent-sdk', 'haiku',     'claude-haiku-4-5', '2026-10-10T00:00:00Z'),
  ('gpt-6.1-sol',       'openai',     272000, NULL, NULL, 'active',  'Sol 6.1',           false, false, 'L1',
   'gpt-6.1-sol',       'codex-cli', 'gpt-sol',   'codex-5.6',       '2026-10-10T00:00:00Z'),
  ('gpt-6-astra',       'openai',     272000, NULL, NULL, 'active',  'Astra 6',           false, false, 'L1',
   'gpt-6-astra',       'codex-cli', 'gpt-astra', NULL,              '2026-10-10T00:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- Every active model the company can call carries the name it is called with.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.model_catalog'::regclass
                  AND conname = 'model_catalog_active_has_api_name') THEN
    ALTER TABLE public.model_catalog ADD CONSTRAINT model_catalog_active_has_api_name
      CHECK (status <> 'active' OR lane = 'local' OR (lane IS NOT NULL AND api_model_id IS NOT NULL));
  END IF;
END $$;

-- ── D. one id space on the live rows ─────────────────────────────────────────────────────────────────
-- Every routing row names its model by catalogue id; model_id is set equal in the same breath so the SQL
-- readers (fn_select_model, v_role_slots, v_model_stats) and the TS readers (routing_rules.model) agree.
-- The FK moves to `model` and model_id is dropped later, once the SQL readers read `model` (not P1).
-- updated_at is left alone on purpose: loadPolicy orders by it, and a spelling fix must not reorder routes.
-- Only rows that change are written, so trg_agents_brain_follows_routing fires on nothing it would act on
-- (it acts on the enabled studio row, whose model is already a catalogue id).
UPDATE public.routing_rules r
   SET model = c.id
  FROM public.model_catalog c
 WHERE r.model = ANY (c.aliases);

UPDATE public.routing_rules
   SET model_id = model
 WHERE model_id IS DISTINCT FROM model;

UPDATE public.agents a
   SET brain = c.id, updated_at = now()
  FROM public.model_catalog c
 WHERE a.brain = ANY (c.aliases);

-- ── E. agents.brain is a catalogue id ────────────────────────────────────────────────────────────────
-- The column defaulted to 'glm-5.2' — retired and banned — so an employee created without a brain was
-- born on a model the company may not call (fn_hr_create_employee carried the same default). The default
-- now follows the low_cost seat's routing row: a succession that moves that row moves the default with it.
CREATE OR REPLACE FUNCTION public.fn_default_brain()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT coalesce(
    (SELECT model FROM public.routing_rules
      WHERE role_slot = 'low_cost' AND enabled
      ORDER BY priority DESC, updated_at DESC LIMIT 1),
    'claude-sonnet-5')
$$;
COMMENT ON FUNCTION public.fn_default_brain() IS
  'B51 P1: the brain a new employee gets when none is named — the low_cost seat''s model (catalogue id).';

ALTER TABLE public.agents ALTER COLUMN brain SET DEFAULT public.fn_default_brain();

-- The same default on the HR factory's parameter. Its body is not repeated here (4 kB, unchanged): the
-- live definition is re-created with only the default replaced, and the guardrail below proves it.
DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef(p.oid) INTO v_def
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE n.nspname = 'public' AND p.proname = 'fn_hr_create_employee';
  IF v_def IS NOT NULL AND position('p_brain text DEFAULT ''glm-5.2''::text' IN v_def) > 0 THEN
    EXECUTE replace(v_def, 'p_brain text DEFAULT ''glm-5.2''::text',
                           'p_brain text DEFAULT public.fn_default_brain()');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid = 'public.agents'::regclass
                  AND conname = 'agents_brain_fkey') THEN
    ALTER TABLE public.agents ADD CONSTRAINT agents_brain_fkey
      FOREIGN KEY (brain) REFERENCES public.model_catalog(id);
  END IF;
END $$;

-- ── F. the critical gate's two judges: one settings key ──────────────────────────────────────────────
-- Decided at the table 2026-10-10 (P1.4): not routing slot rows (they would collide, see the header), not
-- a code constant. The seats are the CEO's (MODEL_ROUTING_SPEC §4e): he sees and changes them on
-- /sys/settings (category 'orchestrator'), and the setter keeps the change log and its undo.
-- Effort: the values both subscription lanes accept — Claude's low…max and codex's
-- supported_reasoning_levels (models_cache.json: low, medium, high, xhigh, max, ultra; 'ultra' is codex's
-- alone and stays out, so a seat's effort means the same on either lane).
INSERT INTO public.settings_registry
  (key, category, value_schema, risk, requires_approval, cost_impact, affected_areas,
   description_en, description_tr, locked, scope_types, delegate)
VALUES
  ('gate.challengers', 'orchestrator',
   '{"type":"json","default":[{"model":"gpt-6.1-sol","effort":"high"},{"model":"gpt-6-astra","effort":"high"}]}',
   'high', false, 'raises', '{critical_gate,orchestration}',
   'The critical gate''s two challengers: the models that try to refute a critical deliverable before it reaches you, and how hard each one thinks. Exactly two, two different models, each an active model of the Codex lane — a challenger from the author''s own family would not be independent.',
   'Kontrol kapısının iki hakemi: kritik bir işi size ulaşmadan önce çürütmeye çalışan modeller ve her birinin ne kadar derin düşüneceği. Tam iki, birbirinden farklı, Codex şeridinde etkin iki model — yazarın kendi ailesinden bir hakem bağımsız olmaz.',
   false, '{global}', NULL)
ON CONFLICT (key) DO NOTHING;

-- Integrity at write time, on every path (the setter, a migration, the succession door): a trigger, not
-- only the setter's validator, because the succession door writes the value itself.
CREATE OR REPLACE FUNCTION public.fn_gate_challengers_check()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_seat jsonb;
  v_model text;
  v_row record;
BEGIN
  IF NEW.key <> 'gate.challengers' THEN
    RETURN NEW;
  END IF;
  IF jsonb_typeof(NEW.value) <> 'array' OR jsonb_array_length(NEW.value) <> 2 THEN
    RAISE EXCEPTION 'gate.challengers: exactly two seats are required, got %', NEW.value
      USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.value->0->>'model' IS NOT DISTINCT FROM NEW.value->1->>'model' THEN
    RAISE EXCEPTION 'gate.challengers: the two seats must hold two different models'
      USING ERRCODE = 'check_violation';
  END IF;
  FOR v_seat IN SELECT * FROM jsonb_array_elements(NEW.value) LOOP
    v_model := v_seat->>'model';
    IF v_model IS NULL OR coalesce(v_seat->>'effort', '') NOT IN ('low', 'medium', 'high', 'xhigh', 'max') THEN
      RAISE EXCEPTION 'gate.challengers: each seat is {"model": <catalogue id>, "effort": low|medium|high|xhigh|max}, got %', v_seat
        USING ERRCODE = 'check_violation';
    END IF;
    SELECT id, status, banned, lane INTO v_row FROM public.model_catalog WHERE id = v_model;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'gate.challengers: % is not a catalogue id', v_model USING ERRCODE = 'check_violation';
    END IF;
    IF v_row.status <> 'active' OR v_row.banned OR v_row.lane IS DISTINCT FROM 'codex-cli' THEN
      RAISE EXCEPTION 'gate.challengers: % is not an active Codex-lane model (status %, banned %, lane %)',
        v_model, v_row.status, v_row.banned, v_row.lane USING ERRCODE = 'check_violation';
    END IF;
  END LOOP;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_gate_challengers_check ON public.settings_values;
CREATE TRIGGER trg_gate_challengers_check
  BEFORE INSERT OR UPDATE ON public.settings_values
  FOR EACH ROW EXECUTE FUNCTION public.fn_gate_challengers_check();

INSERT INTO public.settings_values (key, scope, value, updated_by)
VALUES ('gate.challengers', 'global',
        '[{"model":"gpt-6.1-sol","effort":"high"},{"model":"gpt-6-astra","effort":"high"}]'::jsonb,
        'migration-b51')
ON CONFLICT DO NOTHING;

-- ── H. guardrails: the file either did its work or says so ───────────────────────────────────────────
DO $$
DECLARE
  v_bad text;
BEGIN
  SELECT string_agg(DISTINCT r.model, ', ') INTO v_bad
    FROM public.routing_rules r
    LEFT JOIN public.model_catalog c ON c.id = r.model
   WHERE r.enabled AND (c.id IS NULL OR c.status NOT IN ('active', 'testing'));
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'B51 P1: live routing rows name models that are not live catalogue ids: %', v_bad;
  END IF;
  IF EXISTS (SELECT 1 FROM public.routing_rules WHERE model_id IS DISTINCT FROM model) THEN
    RAISE EXCEPTION 'B51 P1: routing_rules.model_id differs from model';
  END IF;
  SELECT string_agg(DISTINCT a.brain, ', ') INTO v_bad
    FROM public.agents a JOIN public.model_catalog c ON c.id = a.brain
   WHERE a.employment_status <> 'archived' AND c.status NOT IN ('active', 'testing');
  IF v_bad IS NOT NULL THEN
    RAISE EXCEPTION 'B51 P1: live employees carry brains that are not live catalogue ids: %', v_bad;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.settings_values WHERE key = 'gate.challengers' AND scope = 'global') THEN
    RAISE EXCEPTION 'B51 P1: gate.challengers has no value';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'fn_hr_create_employee'
              AND pg_get_function_arguments(oid) LIKE '%glm-5.2%') THEN
    RAISE EXCEPTION 'B51 P1: fn_hr_create_employee still defaults to glm-5.2';
  END IF;
  IF (SELECT count(*) FROM public.model_catalog
       WHERE id IN ('claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'gpt-6.1-sol', 'gpt-6-astra')) <> 5 THEN
    RAISE EXCEPTION 'B51 P1: the five new catalogue rows are not all present';
  END IF;
END $$;
