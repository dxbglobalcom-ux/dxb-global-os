# E11.1 — v_cost_breakdown + Cost page (breakdowns) + threshold alarms — SUMMARY

**Roadmap row:** E11.1 ✓ 2026-07-14 (K1 Fable in person). Acceptance met: **UI'da gün/dept/model kırılımı gerçek cost_ledger verisiyle** — day breakdown added (the missing leg), dept/model verified live.

## What shipped

- **`/fin/costs` "By day · 30 days" panel** — fed by `v_cost_breakdown` (the view the row names; the page previously never touched it): Berlin calendar days, per-day cost + token totals, champagne width-bars (COST-04 idiom).
- **Spec §7 drill:** day card → `?day=YYYY-MM-DD` → ledger table narrowed to that Berlin day (`berlinDayRangeISO` DST-safe `[start,end)` instants) + clear chip; drill state fully in URL (§10).
- **costs.ts (COST-04 single-source) additions:** `dailyBreakdown`, `postgrestDailySource` (PostgREST aliased aggregates over the view), `berlinDay`, `berlinDayRangeISO`; KPI module untouched (equality gate intact).
- **Verified pre-shipped legs:** `v_cost_breakdown` (0025x migration `20260711002500`) and `cost`-channel threshold alarms (`fn_alert_on_cost_threshold` 70/90/100, E8.4b).
- **In-pass fix (broken = fix now):** dashboard eslint had 4 pre-existing "rule not found" errors — `@typescript-eslint/no-explicit-any` registered in `eslint.config.mjs`; two dead `react-hooks/exhaustive-deps` directives (plugin never installed) inert-commented.
- **Adaptations A1–A4** registered in COST_CONTROL_SPEC (CEO-visible): row scope vs full spec (P7 boundaries stand), trigger-based thresholds until P7 guard job, live-view day grain (no rollups yet), pnl-precedent window.

## Evidence (✓ VERIFIED)

| Claim | Evidence |
|---|---|
| View day grain correct | tests/e11/cost-view-daily 7/7 — byte-equal vs independent Berlin-day raw SQL over cost_ledger |
| Berlin midnight boundary | 23:59/00:01 pair lands on different view days |
| Page code path correct | dailyBreakdown vs raw SQL at rendered precision + tokens + order/ratio + 30d window |
| DST safety | berlinDayRangeISO pins: UTC+2/+1 offsets, 23h/25h transition days |
| Threshold alarms `cost` channel | 70% probe fires attention alert source='cost' (rolled-back tx, zero residue) |
| UI on real data | Real browser: day panel renders 2026-07-14 · 198.3M tokens; drill title/chip; ?day=2026-07-13 → honest empty ledger |
| Regression | 49 files **349/0** |
| Types/lint/purity | tsc -b 0 root+dashboard · eslint 0 · i18n purity PASS 1269=1269 |
| Residue | seeds 0 · budget cap 100.00 intact · alerts = 1 genuine queue-age |

## ⚠ UNVERIFIED (human eye)

5 baselines `e111-costs-*.png` in references/design-bank (INDEX PENDING CEO eye). In-pass RULE #0 catch fixed: 3-col day cards at 1280 wrapped the date → 2-col until 2xl + nowrap.

## Boundaries (recorded, CEO-visible)

Rollup/guard/anomaly pg-boss jobs, `budgets`/`cost_rollups` tables, LiteLLM `/key/update` sync, R2 10-chart set, R6 forecast → P7 (E8.4b boundary records stand). Overview cost widget → E12.2.
