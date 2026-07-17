# EXECUTION TICKET — R4.2 Library enrichment wave

**Spec pointer:** `HOLDING-OS-MASTER-PLAN/HOLDING_LIBRARY_SPEC.md` (G1-G4, §13, §21, Registered adaptations A1-A8)
**Roadmap row:** `IMPLEMENTATION_ROADMAP.md` R4.2 — three axes: depth (metadata fill + review pass + core grant set), breadth (department need-matrix + intake list), knowledge-shelf rule ("no research without report, no report without registration" — control_library_action hook, kind=research)
**Gate (row-verbatim):** grants>0 + review>0 measurements, gap-matrix report, knowledge-shelf hook evidence
**Design authority:** zero new design here — deviations land as Registered adaptations in HOLDING_LIBRARY_SPEC (A9 planned: knowledge-shelf gate mechanics).

## Measured baseline (2026-07-17 ~22:42, live DB)

- library_items 438 · library_grants 0 · quality_score filled 0 · review real 0 (423 NULL + 15 archived) · owner_employee 15 · owner_dept 208 (personas only) · usage_notes 438/438
- kinds: persona 214, training 75, project_doc 38, skill 23, tool 21, plugin 18, code_component 12, research 9, governance_rule 8, mcp 8, memory_source 5, policy 2, report 2, sop 2, design_system 1
- 21 departments; ALL 21 dept profiles = identical dxb-mcp 21 pinned tools (arrays, no wildcards, no foreign servers) — 8 mcp group items cover exactly the 21 pinned tools (3+2+2+1+1+2+6+4)
- `_skills` consumed NOWHERE at runtime (grep orchestrator+runtime-profile = 0) — empty `_skills` emission is honest record, zero behavior change
- persona SİCİL field 21 points at `library_grants kind='skill'` ("kopya tutulmaz") — grants close that pointer
- hook post-gate = policy-table driven (`std.*` rows, rule.check dispatch); `requiresMemory` precedent shows dormant flags never fire — knowledge-shelf check MUST live-fire in evidence

## Steps (evidence contract per step)

1. `scripts/library/enrich.mjs` (intake.mjs idiom clone: CEO-context control-fn writes, --dry-run/--apply):
   owner_dept NULL-fill by documented custody map · quality_score by measured formula (source-verified 40 / owner 20 / notes 20 / live-link 20) · review_status approved(≥80+source)/needs_review, archived untouched · 21 dept × 8 dxb-mcp group grants (identity mirror of live surface).
   Evidence: apply exit 0; re-measured counts grants_live=168, review>0, quality>0; audit_log + change_log deltas.
2. Profile identity proof: post-recompile diff — `_tools` byte-identical per dept, only `_skills`/hash/stamp keys new. Evidence: diff output quoted.
3. `.planning/research/R4.2-LIBRARY-GAP-MATRIX.md` (need-matrix + intake list incl. the 5 roadmap priority gaps) + self-registration through control fn (kind=report — dogfood).
4. Knowledge-shelf hook: migration (hook_policies row `std.knowledge_shelf`, gate=post, check=library_registration, block) + post-task.ts case (research task marker → require report artifact evidence → auto-register kind=research via control fn under A8 CEO-standing-order context) + spec adaptation A9 text.
   Evidence: tests/r42 suite green (silent-pass, no-report REVISE, auto-register PASS + change_log, idempotent re-fire) + live-fire probe row.
5. Battery: pnpm build exit 0 · vitest tests/r42 + tests/e9/library + tests/e10 + tests/r23 · gitleaks clean.
6. Bookkeeping: roadmap R4.2 ✓ w/ evidence · STATE sync · SUMMARY.md · memory note · atomic commits by concern.

## Boundaries

- NO per-department tool NARROWING (grants mirror the live enforced surface; real least-privilege differentiation = policy-file decision, CEO-visible follow-up in gap report).
- NO persona-item grants (custody ≠ capability grant; reasoning recorded in report).
- U15/U16 untouched (voice + design deferrals). F-11 closure claim only to the measured extent.
