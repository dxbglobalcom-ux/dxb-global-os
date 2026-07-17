-- R4.2 — knowledge-shelf rule as a post-gate policy (HOLDING_LIBRARY A9).
-- Roadmap row R4.2 third axis: "no research without report, no report without
-- registration" — every research task output drops through the
-- control_library_action door as a kind='research' row (hook + evidence).
--
-- Design notes:
--   * Filed under standard_no 16 ("output matches request — a mapped delivery
--     must actually exist"): a research delivery that is not on the shelf is
--     an incomplete delivery. The 1..17 CHECK constraint stays untouched
--     (const.halal_screen precedent: file under the deepest-fitting standard).
--   * Identification is contract-based (rule.match_field/pattern): the task's
--     output_contract declaring research (EN/TR) marks it. When orchestration
--     later carries task_class end-to-end, the pattern evolves by policy edit
--     (fn_hook_set_policy), no code change.
--   * Enforcement + registration live in packages/hook/src/post-task.ts
--     ('library_registration' check) + knowledge-shelf.ts (A8 CEO
--     standing-order registrar). severity 'block' → REVISE loop until the
--     report artifact exists; the registration itself is done BY the gate.

INSERT INTO public.hook_policies
  (id, standard_no, gate, severity, rule, title_en, title_tr)
VALUES
  ('std.knowledge_shelf', 16, 'post', 'block',
   jsonb_build_object(
     'check', 'library_registration',
     'source', 'IMPLEMENTATION_ROADMAP R4.2 + HOLDING_LIBRARY_SPEC A9',
     'match_field', 'output_contract',
     -- No trailing \b: Turkish suffixed forms (araştırması, araştırmalar)
     -- must match; JS \b is ASCII and a trailing boundary would reject them.
     'pattern', '\b(research|araştırma)'
   ),
   'No research without a report; no report without registration',
   'Raporsuz araştırma yok; kayıtsız rapor yok')
ON CONFLICT (id) DO NOTHING;
