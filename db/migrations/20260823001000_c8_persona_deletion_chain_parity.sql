-- C8 persona deletion — CHAIN PARITY (B36 Block 2).
--
-- WHY THIS FILE EXISTS. On 2026-07-19 the CEO gave a one-word order — "C8 sil."
-- — and 15 dormant personas were deleted: their files under personas/_library/,
-- their archived `agents` rows, and their persona mirrors in library_items, in
-- one transaction with an audit_log `persona.delete` row. Commit 3ae5ac95.
--
-- The act was carried out DIRECTLY on the company database and was never
-- written into the migration chain. So the chain and the company disagreed, and
-- the disagreement was silent for five weeks: 20260718030000 still repoints
-- those 15 slugs at `personas/_library/<slug>.md`, files that commit 3ae5ac95
-- removed from the repository. A database built from the chain therefore
-- RESURRECTS 15 employees the CEO had ordered deleted, each pointing at a file
-- that does not exist.
--
-- Measured 2026-08-23 on a database built from the canonical chain into a fresh
-- engine (scripts/bootstrap-db.sh, 154 migrations, exit 0): 220 agents against
-- the company's 205; the 15 extra rows are exactly the C8 list; and
-- tests/e125/workforce-gate.test.ts case (4) — "every stored path exists on
-- disk" — failed with those 15. On the company the same test is green, because
-- there the rows are gone.
--
-- This restores the CEO's order to the chain. On the company it is a no-op (the
-- rows left on 2026-07-19); on every fresh environment — a new machine, a
-- disaster-recovery restore, the construction site's own engine — it performs
-- the deletion he ordered.
--
-- Children measured before writing this, on the fresh chain: 15 agents rows,
-- and ZERO rows in every one of the 17 tables that carry a foreign key to
-- `agents` (agent_runs, tasks, cost_ledger, approvals, alerts, personas,
-- employee_records, departments.director_id, projects, project_members,
-- library_items, library_usage_log, voice_calls, voice_identities, workflows,
-- agents.manager_id). Same finding the original deletion recorded. Nothing is
-- cascaded and nothing else can be reached from here.

BEGIN;

CREATE TEMP TABLE _c8_deleted ON COMMIT DROP AS
  SELECT id, slug FROM public.agents
   WHERE employment_status = 'archived'
     AND slug IN (
       'government-digital-presales-consultant','healthcare-customer-service',
       'healthcare-marketing-compliance','hospitality-guest-services',
       'language-translator','legal-billing-time-tracking','legal-client-intake',
       'loan-officer-assistant','real-estate-buyer-seller','retail-customer-returns',
       'specialized-civil-engineer','specialized-french-consulting-market',
       'specialized-korean-business-navigator','specialized-salesforce-architect',
       'study-abroad-advisor'
     );

-- The persona mirrors the original deletion also removed. Matched by the file
-- path they were registered from, which is the tree commit 3ae5ac95 emptied.
DELETE FROM public.library_items
 WHERE kind = 'persona'
   AND source_ref LIKE 'personas/_library/%'
   AND EXISTS (SELECT 1 FROM _c8_deleted d WHERE source_ref = 'personas/_library/' || d.slug || '.md');

DELETE FROM public.personas WHERE employee_id IN (SELECT id FROM _c8_deleted);
DELETE FROM public.agents   WHERE id          IN (SELECT id FROM _c8_deleted);

-- The record says what happened and on whose word, exactly as the direct act
-- did in 2026-07-19. On the company this inserts nothing: there is nothing to
-- report.
INSERT INTO public.audit_log (actor, actor_type, action, payload)
SELECT 'migration:20260823001000', 'system', 'persona.delete',
       jsonb_build_object(
         'reason', 'C8 — CEO order 2026-07-19 "C8 sil."; executed directly at the time (commit 3ae5ac95) and never written into the migration chain',
         'slugs', (SELECT jsonb_agg(slug ORDER BY slug) FROM _c8_deleted),
         'count', (SELECT count(*) FROM _c8_deleted))
 WHERE EXISTS (SELECT 1 FROM _c8_deleted);

COMMIT;

-- ROLLBACK: none. The rows carry no children and the CEO ordered them gone;
-- restoring them would re-open a decision he closed with one word.
