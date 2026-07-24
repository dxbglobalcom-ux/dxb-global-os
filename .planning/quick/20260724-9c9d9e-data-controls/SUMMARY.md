# SUMMARY — ledger 9c/9d/9e data controls (2026-07-24 evening)

**Outcome:** all three ledger rows closed with evidence; one C25 spec-gap fixed on sight.

| Item | What shipped | Evidence |
|---|---|---|
| 9c reset door | `control_cost_reset(p_before date, p_rationale)` — deletes cost_ledger strictly before Berlin midnight of the day, SECURITY DEFINER, one `audit_log` `costs.reset` row per call; rejects null/future cutoff. UI: `CostResetControl` on /fin/costs (progressive disclosure → date → count preview → explicit confirm) via `/api/control/cost-reset` (session + zod; preview = count only). | TDD red→green `tests/c9/data-controls.test.ts` (transaction-rollback protected) 9/9; live UI proof: 2 seeded pre-2026-07-05 rows removed, audit row `before=2026-07-05 purged=2 actor=dxbglobalcom@gmail.com`, real ledger untouched (`min(created_at)` = 2026-07-14 before and after) |
| 9c decision aging | Machine `decision_log` rows auto-withdraw from /gov/decisions after 14 days (`DECISION_MACHINE_AGING_DAYS`, `decisionAgingOrFilter` — `decided_by.eq.ceo,created_at.gte.cutoff`); CEO rows never age; table keeps everything (manual purge door from 20260723001000 unchanged). Help text EN+TR updated (also fixed stale "medium/high risk" description). | Unit tests green; E2E probe: 34-day-old machine row absent from page HTML, fresh machine row present; probes cleaned after |
| 9d project filter | Migration 20260724002000: `project_slug`/`project` appended to `v_workforce_tokens` + `v_cost_breakdown`, new `v_cost_entries` (cost_ledger + tasks→projects, security_invoker). `CostFilters.project` switches the source to the view; /fin/costs (KPIs, breakdowns, daily, ledger) and /fin/tokens (all panels) narrow; filters survive drills. | View-column + join tests green; COST-04 SQL-equality gate untouched (`tests/phase8/cost-view.test.ts` 5/5); E2E `?project=dxb-global-os` active on both pages |
| 9e real calendar | FilterBar `kind:"date"` (native date input, min = first data day, max = today Berlin). On costs: chosen day narrows breakdowns (until-seam + `costBreakdownSince`) and ledger, retitles panels; on tokens: day narrows panels, daily rows drive the tokens page itself (was: jump to costs). | E2E `?day=2026-07-23`: 6 day-scoped hits on costs, 2 on tokens; battery green |
| C25 spec-gap (on sight) | `<synthetic>` construction label + zero-cost rows removed from costs breakdown panels, ledger rows and the model filter options. | Final battery includes `synth:false` on all 12 route-locale-width cells |

**Verification battery (final build):** 12/12 render checks (3 routes × EN+TR × 1366/1920: scrollWidth===clientWidth, 0 "…", 0 clipped truncate, 0 `<synthetic>`), functional 5/5, vitest 14/14, i18n purity PASS (parity 2290=2290), haram-vocab grep on touched files 0. Screenshots in session scratchpad `shots/`.

**Boundaries (recorded, not dropped):**
- Native date input's placeholder FORMAT follows the browser locale (CEO's TR Chrome renders TR format) — browser chrome, not app copy.
- Tokens page has no reset door: its rows live in `agent_runs` (operational task history) — deleting them would break run/task records; cost reset covers the spend ledger only.
- Aging window fixed at 14 days in code; a settings-page knob is a possible future refinement.
- FilterBar rollout to remaining list pages + decisions-page FilterBar = existing open queue item (unchanged).

**Ops lesson:** root-owned ghost `next-server` (pid 3776, 6 days) is unkillable from this user and does NOT own :3000; `pgrep -f "next-server"` matches the calling shell itself (kills the session, exit 144) — restart by `ss` port-owner pid.
