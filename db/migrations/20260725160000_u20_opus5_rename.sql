-- U20 (CEO order 2026-07-25): construction authorship moved Fable 5 -> Opus 5,
-- and the "4.8" model generation is retired in favour of 5.
--
-- CEO scope decisions taken the same turn (00-INDEX.md U20, MODEL_ROUTING_SPEC
-- A-2026-07-25):
--   (1) history is NOT rewritten  -> applied migrations, persona `Created by`
--       rows and `persona_version='v2.0-fable'` stay exactly as they are;
--   (2) internal technical IDs are NOT renamed -> `model_catalog.id='fable-5'`,
--       `orchestrator.fable_review_required`, the `fable-final` ladder rung and
--       `FABLE_5_HOOK_SPEC.md` keep their keys, because renaming them would
--       break the live FK chain (codex-5.6.fallback_of), the settings undo
--       chain and the 196-persona section gate for zero CEO-visible benefit.
--       Every CEO-VISIBLE label becomes Opus 5 -- carried by display_name and
--       the i18n message values, never by the keys.
--   (3) the backup-model layer is removed for construction authorship.
--
-- Measured before this migration (this session, live DB):
--   model_catalog: fable-5 (display 'Claude Fable 5', fallback_of=claude-opus-4-8),
--                  claude-opus-4-8 (display 'Claude Opus 4.8', fallback_of=claude-sonnet-5)
--   routing_rules: 10 rows model='claude-opus-4-8', 4 rows model='opus-4.8'
--   settings_registry: 11 model_ref defaults = 'claude-opus-4-8',
--                      orchestrator.fallback_order default = ["fable-5","claude-opus-4-8"]
--   settings_values: ZERO rows referencing either (no CEO override to preserve)
--   agents.brain: 205 rows, all 'glm-5.2' -- untouched by this migration
--
-- Real model behind the slug: packages/kernel/src/classify.ts SDK_MODEL_IDS now
-- maps 'fable-5' -> 'claude-opus-5' (was 'claude-fable-5'). Cost direction is
-- DOWN, not up: Opus 5 is $5/$25 per Mtok vs Fable 5 $10/$50, and identical to
-- Opus 4.8's $5/$25 -- so no budget row changes.

BEGIN;

-- 1. CEO-visible label. The key stays 'fable-5' (decision 2); the Models page,
--    Settings model pickers and every dashboard surface read display_name.
UPDATE public.model_catalog
   SET display_name = 'Claude Opus 5'
 WHERE id = 'fable-5';

-- 2. Anything that pointed at the 4.8 row now points at the Opus 5 row.
--    fable-5.fallback_of was 'claude-opus-4-8'; the rung below it was already
--    'claude-sonnet-5', so the runtime resilience chain keeps its next hop
--    instead of losing it silently.
UPDATE public.model_catalog
   SET fallback_of = 'claude-sonnet-5'
 WHERE fallback_of = 'claude-opus-4-8';

UPDATE public.routing_rules
   SET model = 'fable-5'
 WHERE model IN ('claude-opus-4-8', 'opus-4.8');

UPDATE public.settings_registry
   SET value_schema = jsonb_set(value_schema, '{default}', '"fable-5"')
 WHERE value_schema->>'default' = 'claude-opus-4-8';

-- 3. Backup layer removed (decision 3): the fallback order is a single element.
--    On error/timeout/rate-limit there is no silent downgrade -- the work
--    surfaces to the CEO as a `blocked` report.
UPDATE public.settings_registry
   SET value_schema = jsonb_set(value_schema, '{default}', '["fable-5"]'::jsonb)
 WHERE key = 'orchestrator.fallback_order';

-- 4. The 4.8 generation leaves the assignable pool. The row is RETIRED, not
--    deleted: agent_runs/cost_ledger history still references the id, and
--    deleting it would rewrite the past (decision 1).
UPDATE public.model_catalog
   SET status = 'retired'
 WHERE id = 'claude-opus-4-8';

-- 5. CEO-visible settings copy: the review gate is an Opus 5 gate now. The KEY
--    stays `orchestrator.fable_review_required` (decision 2) -- only the
--    bilingual labels the CEO actually reads change.
UPDATE public.settings_registry
   SET description_en = 'Whether the Opus 5-quality review gate is mandatory before task completion',
       description_tr = 'Görev kapanışı öncesi Opus 5-kalite review kapısı zorunlu mu'
 WHERE key = 'orchestrator.fable_review_required';

COMMIT;

-- ROLLBACK:
--   UPDATE public.model_catalog SET display_name = 'Claude Fable 5' WHERE id = 'fable-5';
--   UPDATE public.model_catalog SET status = 'active' WHERE id = 'claude-opus-4-8';
--   UPDATE public.model_catalog SET fallback_of = 'claude-opus-4-8' WHERE id = 'fable-5';
--   UPDATE public.routing_rules SET model = 'claude-opus-4-8' WHERE model = 'fable-5';  -- NOTE: over-broad, 5 rows were fable-5 before
--   UPDATE public.settings_registry SET value_schema = jsonb_set(value_schema,'{default}','"claude-opus-4-8"')
--     WHERE key IN ('orchestrator.execution_model','orchestrator.review_model','orchestrator.critical_decision_model',
--                   'orchestrator.research_model','orchestrator.coding_model','orchestrator.design_model',
--                   'orchestrator.qa_model','orchestrator.backup_model','orchestrator.planning_model',
--                   'orchestrator.hr_model');
--   UPDATE public.settings_registry SET value_schema = jsonb_set(value_schema,'{default}','["fable-5","claude-opus-4-8"]'::jsonb)
--     WHERE key = 'orchestrator.fallback_order';
--   UPDATE public.settings_registry SET description_en = 'Whether the Fable-quality review gate is mandatory before task completion',
--          description_tr = 'Görev kapanışı öncesi Fable-kalite review kapısı zorunlu mu'
--     WHERE key = 'orchestrator.fable_review_required';
