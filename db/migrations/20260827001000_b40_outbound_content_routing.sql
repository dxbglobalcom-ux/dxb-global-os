-- B40 — THE ROUTING ROW THAT STILL BELONGED TO A CANCELLED PILOT.
--
-- WHY THIS EXISTS. On 2026-08-27 the CEO asked to watch a real job arrive at the
-- holding and be worked. The intent was his own sentence — "Holdingin yeni
-- kuracağı kahve markası için tanıtım web sitesi hazırlansın". The machine
-- understood it in 4.7 seconds: five departments (marketing, design, engineering,
-- product, commerce — 81 agents between them), approval_class 'outward' so it stops
-- at him, tier L1. It then hit two walls. The first was the dependency-hop cap,
-- which he raised from 3 to 5 the same hour (AGENT_ORCHESTRATION_SPEC A14). The
-- second is this one:
--
--   NoRouteError: no enabled routing_rules row matches task_class 'content.outbound'
--
-- THE ROW WAS THERE ALL ALONG. Measured in the company's own database that day:
--   id            4a9c1d9b-59c9-4cd2-b68d-86d7686f0103
--   task_class    content.outbound
--   match         {"keyword": "listeleme"}     <-- the whole defect
--   model/tier    fable-5 / L1 · needs_council true · priority 20 · enabled true
--   updated_at    2026-07-08 21:46:14 — untouched since the day it was seeded
--
-- `match` is a condition the router applies on top of the task class: this row
-- would only accept an outward-content task whose intent summary contained the
-- Turkish word "listeleme". That condition was written when the holding's only
-- planned outward content WAS product listing — PHASE-05 §2's vertical slice,
-- "tek marka ürün listeleme taslağı (Outleteuro P11 öncüsü)". The CEO then
-- CANCELLED Outleteuro in U19. The pilot went; the condition stayed.
--
-- So the machine has been contradicting itself ever since, silently: classify()
-- is handed the legal class list off this very table (packages/kernel/src/
-- classify.ts:100,125), legitimately answers 'content.outbound' for outward
-- content, and route() (packages/kernel/src/policy.ts:60) then refuses every
-- such task that is not a product listing. Nobody saw it because no intent had
-- reached that class until his test. It was the ONLY conditional row in the
-- table: 1 of 37 enabled rules carried a match at all.
--
-- HIS ORDER, 2026-08-27: "listeleme şartını kaldır."
--
-- WHAT THIS CHANGES, AND WHAT IT DELIBERATELY DOES NOT. The condition is cleared
-- so the class routes on its own name. Everything else about the row is left
-- exactly as it was — same model, same L1 tier, same priority, still
-- needs_council true, so outward content still goes through the council (several
-- models plus a judge) before anyone sees it. Nothing here touches the approval
-- gate: outward work still stops at the CEO, as it did before this row existed.
--
-- Idempotent: re-running finds no row with the keyword and changes nothing.
-- The repo's seed (packages/kernel/policy/routing-seed.json) was corrected in the
-- same commit, so a database built from scratch never gets the condition back.

BEGIN;

DO $$
DECLARE
  v_rule_id uuid;
BEGIN
  SELECT id INTO v_rule_id
    FROM routing_rules
   WHERE task_class = 'content.outbound'
     AND match ? 'keyword'
     AND match->>'keyword' = 'listeleme';

  IF v_rule_id IS NULL THEN
    RAISE NOTICE 'b40: no content.outbound rule carries the listeleme keyword — nothing to do';
    RETURN;
  END IF;

  UPDATE routing_rules
     SET match = '{}'::jsonb,
         updated_at = now()
   WHERE id = v_rule_id;

  INSERT INTO audit_log (actor, actor_type, action, payload)
  VALUES (
    'ceo', 'ceo', 'routing_rule.match_cleared',
    jsonb_build_object(
      'rule_id', v_rule_id,
      'task_class', 'content.outbound',
      'match_before', jsonb_build_object('keyword', 'listeleme'),
      'match_after', '{}'::jsonb,
      'unchanged', jsonb_build_object('model_tier', 'L1', 'needs_council', true, 'priority', 20),
      'order', 'listeleme şartını kaldır',
      'ordered_on', '2026-08-27',
      'reason', 'residue of the Outleteuro vertical slice cancelled in U19; the classifier could '
                || 'name content.outbound but the router refused every outward-content task that '
                || 'was not a product listing',
      'row', 'B40'
    )
  );

  RAISE NOTICE 'b40: content.outbound now routes on its own name (rule %)', v_rule_id;
END $$;

COMMIT;
