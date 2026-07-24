# Execution ticket — ledger items 9c / 9d / 9e (data controls on data pages)

**Spec pointers (no new design decisions here):**
- Complaint ledger `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` completeness-audit rows:
  - 9c — cost data delete/reset mechanism (C9 atomic: "How is it deleted/reset?"). CEO addition 2026-07-24 (in-chat): includes DECISION AGING — old machine decision records auto-withdraw from the CEO's view.
  - 9d — PROJECT filter on data pages (FilterBar gains `project`).
  - 9e — real DATE PICKER (calendar input) driving the page (standing order 5: filter drives EVERY panel).
- Standing order 5 (list-page standard), standing order 8 (zero ellipsis), RULE #0/#0-A/#0-B, Evidence-Before-Done.
- C4 precedent: every destructive door = audited SECURITY DEFINER fn + audit_log row (`control_records_purge`, `control_decision_purge`).

**Scope (measured this session):**
- `cost_ledger` (1386 rows) has `task_id` but no project; `v_workforce_tokens` / `v_cost_breakdown` carry no project column. → migration: append project (slug+name via tasks→projects) to both views + new `v_cost_entries` view for filtered page queries.
- No period-close/reset door exists. → migration: `control_cost_reset(p_before date, p_rationale)` — deletes cost_ledger rows strictly before Berlin midnight of p_before, audited (`costs.reset`); UI on /fin/costs behind progressive disclosure with row-count preview + explicit confirm; API route validates shape only.
- `decision_log` = 6 CEO rows + ~97 machine rows. → aging: /gov/decisions server query keeps CEO rows forever, machine rows only for the last 14 days (`decided_by=ceo OR created_at >= now-14d`); archive table keeps everything.
- FilterBar has select/chips only. → new `kind: "date"` (native date input, min/max, clear-all integration); wired to `day` on /fin/costs (narrows breakdown panels via until-seam in lib/costs) and new `day` on /fin/tokens (narrows panels client-side).

**Discipline:** standing order 11 — TDD (red before green) for fn + lib seams; systematic-debugging on any surprise; verification-before-completion before "done".

**Evidence contract:**
- DB tests: cost-reset fn (old deleted / new kept / audit row / future-date rejected), project-view columns, decision-aging cutoff helper. Red run recorded before implementation, green after.
- RULE #0 battery: /fin/costs, /fin/tokens, /gov/decisions × EN+TR × 1366/1920 — scrollWidth===clientWidth, zero "…", screenshots; i18n purity script PASS.
- Live proof: reset door executed against a seeded throwaway row-set (not CEO data) with audit row cited; project filter + calendar narrowing shown with URL params in screenshots.
- Close: commit + STATE.md + ledger rows 9c/9d/9e ✓ with evidence anchors.
