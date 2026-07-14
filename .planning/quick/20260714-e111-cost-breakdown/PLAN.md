# E11.1 — v_cost_breakdown + Cost page (breakdowns) + threshold alarms — EXECUTION TICKET

**Roadmap row:** E11.1 — "`v_cost_breakdown` + Cost sayfası (kırılımlar) + eşik alarmları (`cost` kanalı)".
**Acceptance:** UI'da **gün**/dept/model kırılımı gerçek `cost_ledger` verisiyle.
**Spec:** HOLDING-OS-MASTER-PLAN/COST_CONTROL_SPEC.md — §5 (`CostIntelligencePanel` `/fin/costs`), §7 (drill-down: chart segmenti → satır seviyesi ledger), §20/§21 kabul.
**Zero new design decisions** — established idioms only (BreakdownList champagne bars, COST-04 single-source, Berlin-day = P&L D5 precedent).

## Already-shipped parts of this row (verify, don't rebuild)

- `v_cost_breakdown` view — migration `20260711002500` (day×dept×model×mode×agent grain, Europe/Berlin day, security_invoker).
- `/fin/costs` page — dept/model/mode breakdowns + KPIs + ledger table (COST-04 module, pulled forward).
- Threshold alarms `cost` channel — `fn_alert_on_cost_threshold` trigger (70 Attention / 90 High / 100 Critical, per-month dedup), shipped+tested at E8.4b (`tests/e8/alerts.test.ts`).

## Gap to close (this ticket)

1. **Day breakdown in UI** — new "Daily" panel on `/fin/costs`, fed by `v_cost_breakdown` (the view the row names; page currently never touches it): last-30-Berlin-days per-day cost + tokens, champagne width-bars.
2. **Drill-down** (spec §7): day row click → same page `?day=YYYY-MM-DD` → ledger table filters to that Berlin day (row-level `cost_ledger`).
3. **Evidence:** new `tests/e11/cost-view-daily.test.ts` — view-vs-raw-SQL equality on seeded set (incl. Berlin midnight boundary pair), daily module vs raw SQL, Berlin day-range helper DST pins, `cost` threshold trigger fire probe (rolled back).

## Evidence contract

- vitest e11 suite green + full regression green.
- tsc -b 0 (root + dashboard), eslint 0, i18n purity PASS (EN=TR key parity).
- RULE #0: /fin/costs EN+TR × 1280+1920 + drill state, design-bank baselines, console 0 error.
- Roadmap row ✓ + STATE.md + SUMMARY.md.

## Boundaries (recorded, NOT this ticket)

Rollups/guard/anomaly pg-boss jobs, budgets table + LiteLLM `/key/update` sync, 10-chart R2 set, forecast → P7 (E8.4b boundary records stand). Overview cost widget → E12.2.
