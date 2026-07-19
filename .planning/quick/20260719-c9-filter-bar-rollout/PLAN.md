# C9 Filter-Bar Standard — Tokens + Costs (quick ticket)

> INLINE execution only (model-routing v6: Fable authors every line in person; subagent authorship banned).

**Spec pointer (no new design decisions):** `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` — standing order 5 (list-page standard: filter + select + bulk action + plain language + hover help EN+TR) and the C9 closure row ("full filter-bar standard: dept/model/date driving whole page").

**Measured defect (2026-07-19 11:05):** ledger C9 closure row claims the filter-bar standard was "delivered on Tokens" — `apps/dashboard/src/app/(command)/fin/tokens/page.tsx` (231 lines) contains NO filter control, only drill links to /fin/costs. /fin/costs has URL-driven `range`+`day` only; no dept/model filter. The ledger line overstates delivery and must be corrected (RULE #0-A: ledger is a truth surface).

## Tasks

- [ ] 1. `FilterBar` primitive (`components/primitives/filter-bar.tsx`, client): URL-param-driven groups — `select` kind (many options, native select, progressive disclosure per registered CEO preference) and `chips` kind (few options, e.g. range). Group param semantics: default value deletes the param; clear-all button when any non-default filter active. Export from primitives index.
- [ ] 2. i18n: `command.filters` block EN+TR (department, model, allDepartments, allModels, clear, rangeToday, range7d, range30d).
- [ ] 3. `/fin/tokens`: read `range|dept|model` searchParams (validated against data); FilterBar under heading; KPI cards, byModel, byDepartment, daily panels ALL narrowed by dept/model; byModel/byDept window = selected range. Construction panel stays separate (C24 truth separation).
- [ ] 4. `lib/costs.ts`: optional `filters {department?, model?}` on `postgrestCostSource` (COST-04 SQL-equality test untouched — parameter optional, default = today's behavior).
- [ ] 5. `/fin/costs`: FilterBar at top (range chips + dept/model selects + day ✕ chip); filters drive KPIs, breakdown panels, ledger query; remove now-duplicate range chips from ledger panel. Option lists from unfiltered 30d distincts.
- [ ] 6. Correct ledger C9 closure row to the truth (built now on Tokens+Costs; remaining list pages = open leg, enumerated).

**Evidence contract:** `pnpm build` green; RULE #0 pass per surface — EN+TR, ≥2 widths (~1366 windowed + 1920), scrollWidth === clientWidth, filters exercised live (dept select narrows all panels), `scripts/i18n-purity-check.sh`; Evidence-Before-Done two-tier report; one commit.

**Boundary (future rows, not this ticket):** filter-bar rollout to remaining list pages (ops/tasks, gov/decisions, org/employees, alerts…) stays an open leg in the C-ledger; select+bulk-action legs of standing order 5 already delivered separately (250dbe4).
