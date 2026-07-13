---
type: quick
slug: sicil-backfill
status: complete
completed: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E5.3 (spec-gap closure) + governance rule 5
spec: HOLDING-OS-MASTER-PLAN/HR_OPERATING_SYSTEM_SPEC.md §6 (employee_records)
---

# Summary — spec-gap ruling (rule 5) + its first application: sicil backfill

## Part 1 — Governance: "spec-gap = your defect" (CEO ruling 2026-07-13 ~03:55)

CEO ruling after the madde-5.3 incident (Fable diagnosed a skipped spec item,
CEO had to ORDER the fix): a discovered spec gap inside a ✓-closed roadmap row
is the author's defect and is fixed IMMEDIATELY, same session, no CEO order.
Items belonging to FUTURE rows stay recorded boundaries (step-by-step directive
intact).

- Codified as **rule 5** in `.claude/hooks/spec-bootstrap.sh` (SessionStart —
  injected into every future session, every author).
- Memory: `spec-gap-aninda-fix.md` + MEMORY.md index.

## Part 2 — First application: employee_records (sicil) 0 → 199

**The gap:** roadmap row E5.3's own evidence contract lists `employee_records`;
row marked ✓ 2026-07-11; table had **0 rows** (found during E6.3 wave 3c,
then only recorded). Rule-5 case: fix now.

**The fix (file-first, zero fabrication):** `scripts/sync-employee-records.py`
parses every dossier's EMPLOYEE_PERSONA_STANDARD §5 sicil table by ROW NUMBER
(stable across the TR/EN label eras): 10→responsibilities, 11→authority_limits,
12→decision_scope, 13→expertise, 15→methodology, 17→reporting_standard,
18→quality_standard, 20→escalation_rules, 26→kpis (`[{"ref":…}]`),
31→version_history (`[{"note":…}]`) — dossier text copied VERBATIM, no
authorship in the script. Operational columns (performance_history,
error_history, review_results, training_needs) untouched — they fill with real
operation. Archived agents guarded out (`WHERE EXISTS … <> 'archived'`).
Upsert by employee_id → re-runnable after any dossier edit.

## Evidence (executed)

- Generator: `199 dossiers parsed, 199 upserts, 0 skipped`.
- Apply: `INSERT 0 1` × **199**; coverage query: live_agents **199** = with_record **199**.
- Verbatim spot-check: cmo row `responsibilities[1]='persona §1, §3'`, `decision_scope='persona §4'` — exact dossier text.
- `v_org_node_detail.has_employee_record` → **t** for cmo / agents-orchestrator / accounts-payable-agent (org panel's "No employment record yet" zero-state now honestly flips; no UI code change needed).
- Rerun: still 199 rows, no duplicates (PK upsert) — idempotent.
- Hook rerun: `bash .claude/hooks/spec-bootstrap.sh` → exit 0, rule 5 in output.

## Boundaries

- KPI STRUCTURING (measurable list extraction from persona §6 into structured
  jsonb) is HR-engine work (fn_hr_evaluate consumers) — the ref-pointer form is
  the spec-faithful skeleton ("sorumluluk/yetki alanları parametreden").
- `v_hr_equipment_check` 7/7 gate unaffected (records now EXIST — one more item
  of the equipment chain real).
