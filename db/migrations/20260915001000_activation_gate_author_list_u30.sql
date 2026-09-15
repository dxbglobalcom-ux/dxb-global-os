-- 20260915001000 — the activation gate's author list aligned with U30 (B08 step 0)
--
-- WHY: on 2026-07-28, `20260728001000_persona_author_u30.sql` widened
-- `personas_author_check` to ('opus-5','fable-5','hr-factory') because U30 (CEO 2026-07-26)
-- made Opus 5 and Fable 5 equally authorized construction authors. One sibling was missed in
-- that turn: `enforce_persona_gate_on_activation()` — the BEFORE trigger on public.agents —
-- carries its OWN copy of the list and still read ('fable-5','hr-factory'). Measured today
-- (2026-09-15) on both engines, the function's md5 identical:
--   b21b62c7a5f74a6163dd8eab96f3d592, list = NOT IN ('fable-5','hr-factory')
-- The consequence was live: all 16 media-studio seats plus Hamza (`agents-orchestrator`) stood
-- bound to their older fable-5 persona versions while their newest quality_gate='passed'
-- versions are authored 'opus-5'; the trigger fires on UPDATE OF persona_id, so re-binding them
-- to the accepted writing was physically refused —
--   activation denied: persona ... author=opus-5 (need passed + v2 author)
-- The constraint said one thing and the gate said another. This migration makes the gate quote
-- the constraint.
--
-- WHAT: the author list inside the function becomes the SAME set `personas_author_check` uses —
-- ('opus-5','fable-5','hr-factory'). Nothing else in the function changes: the NULL-persona
-- branch, the quality_gate='passed' condition, the two RAISE texts and their placeholders are
-- byte-identical to the 2026-07-11 body (`20260711002000_org_family.sql` §"Activation gate").
-- The trigger itself (`trg_agents_activation_gate`) is not redefined — CREATE OR REPLACE
-- FUNCTION keeps every existing binding.
--
-- WHY IT CANNOT BREAK WHAT STANDS ON IT: the change only WIDENS a whitelist. Every (gate,
-- author) pair that passed before still passes; no pair that failed before becomes required.
-- Measured before the change: 213 of 213 bound personas are authored 'fable-5' — not one bound
-- row depends on the narrower list, so no active employee can be invalidated by this.
-- The second trigger on the same column, `trg_agents_persona_passed`
-- (`enforce_persona_id_passed`, 20260711003000), checks quality_gate only and is untouched: a
-- persona that is not 'passed' is still refused by it, whoever wrote it.
--
-- NOT DONE ON PURPOSE: no persona row is relabelled, no version is re-authored, no agent is
-- bound here. The bind is a separate, measured step recorded in
-- EVIDENCE-B08-step0-2026-09-15.md. Historical authorship stays untouched (U20 boundary).
--
-- ROLLBACK (the previous body, verbatim from pg_get_functiondef taken BEFORE this change on
-- both engines — company `supabase_db_DxB_Global_OS` and construction `supabase_db_DxB_Build`,
-- md5 b21b62c7a5f74a6163dd8eab96f3d592):
--
--   CREATE OR REPLACE FUNCTION public.enforce_persona_gate_on_activation()
--   RETURNS trigger LANGUAGE plpgsql AS $$
--   DECLARE
--     v_gate text;
--     v_author text;
--   BEGIN
--     IF NEW.employment_status = 'active' THEN
--       IF NEW.persona_id IS NULL THEN
--         RAISE EXCEPTION 'activation denied: agent % has no persona (v2 persona with passed quality gate required)', NEW.id;
--       END IF;
--       SELECT quality_gate, author INTO v_gate, v_author
--         FROM public.personas WHERE id = NEW.persona_id;
--       IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('fable-5','hr-factory') THEN
--         RAISE EXCEPTION 'activation denied: persona % has quality_gate=%, author=% (need passed + v2 author)',
--           NEW.persona_id, v_gate, v_author;
--       END IF;
--     END IF;
--     RETURN NEW;
--   END $$;
--
--   Rolling back the function alone is not enough once the seats are bound: any agent bound to
--   an 'opus-5' persona would then fail its next activation-touching UPDATE. Re-bind those rows
--   to their newest 'fable-5' passed version FIRST, then replace the function.

BEGIN;

CREATE OR REPLACE FUNCTION public.enforce_persona_gate_on_activation()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  v_gate text;
  v_author text;
BEGIN
  IF NEW.employment_status = 'active' THEN
    IF NEW.persona_id IS NULL THEN
      RAISE EXCEPTION 'activation denied: agent % has no persona (v2 persona with passed quality gate required)', NEW.id;
    END IF;
    SELECT quality_gate, author INTO v_gate, v_author
      FROM public.personas WHERE id = NEW.persona_id;
    IF v_gate IS DISTINCT FROM 'passed' OR v_author NOT IN ('opus-5','fable-5','hr-factory') THEN
      RAISE EXCEPTION 'activation denied: persona % has quality_gate=%, author=% (need passed + v2 author)',
        NEW.persona_id, v_gate, v_author;
    END IF;
  END IF;
  RETURN NEW;
END $$;

COMMENT ON FUNCTION public.enforce_persona_gate_on_activation() IS
  'Activation gate (org family 0020x): an active employee needs a bound persona whose '
  'quality_gate = passed and whose author is an authorized construction author. The author set '
  'is the same one personas_author_check carries — opus-5 | fable-5 | hr-factory — aligned with '
  'U30 (CEO 2026-07-26) on 2026-09-15, B08 step (0).';

COMMIT;
