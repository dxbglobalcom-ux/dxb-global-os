---
name: e12-gates-night
description: "2026-07-18 gecesi E12.2/3/4 ✓ + E12.5 taban ölçümü — widget layout settings seam'de (scope 'ceo_dashboard:default' — motor class:<id> ister), boundary katmanı doğdu (ham 404/crash her rotadaydı), CRM /revenue/crm'de company_id duvarıyla (yalnız crm_clients'ta; çocuklar join'le); E12.5 aktivasyonu Fable-persona + AÇIK CEO MUSTS kararlarına bağlı"
metadata:
  node_type: memory
  type: project
  originSessionId: 68a93e2d-1cbf-4f4c-bfb6-1626ea78cfca
---

**2026-07-18 night, five waves:** R4.3 + E12.2 + E12.3 + E12.4 shipped ✓;
E12.5 baseline measured (row OPEN). Progress 72/79 = 91%.

**Live-state facts:**
- Widget layout: `settings_values(scope='ceo_dashboard:default', key='dashboard.layout')`
  via `/api/control/layout` → `control_settings_set`. The settings engine
  REQUIRES `class:<id>` on scoped writes (CC-SPEC adaptation A1) and treats a
  value identical to the stored row as a NO-OP (no change row) — tests must
  write unique values.
- (command) boundary layer EXISTS now: error.tsx / loading.tsx / not-found.tsx
  + ROOT not-found (unknown top-level URLs bypass route groups — only a root
  boundary catches them).
- CRM: `/revenue/crm/*` (old /crm → 308). `company_id` ONLY on crm_clients
  (`fn_default_company_id()` STABLE default — never a uuid literal, companies
  rows are runtime-born); children isolate through client_id inner join.
  Company context = `dxb-company` cookie.
- Workforce (E12.5 ◐ 2026-07-18 ~05:00, commit ce80018): MACHINE GATES ALL
  CLOSED — sweep scripts/org/workforce-gate.mjs 9/9 PASS (promise ledger
  67 slugs frozen in scripts/org/promise-ledger.json); hygiene migration
  20260718030000 deleted r23t fixture chain, repointed 21 stale paths,
  restored persona_version v2.0-fable on 175 rows; tests/e125 7/7; coverage
  30/30 (shelf 1a56f36d). Set-diff came out 0 — NO missing ADD personas
  (baseline hypothesis wrong). Remaining leg: HR machine draft→probation→
  active (dormant=pre-machine stock, NO status shortcut) — blocked on CEO's
  OPEN MUSTS-Talep decisions. R4.3's staffed-hands proof waits on this.
  legal-de pod retirement was GOVERNED (migration 20260717060000) — 21 depts
  is truth; all 21 depts status='dormant'.

**Lessons:**
- Locale-pinned `Intl.DateTimeFormat("en-GB")` in shared components leaks EN
  month names into TR ("18 Jul") — thread the locale, never pin.
- `A && B && C &` backgrounds the WHOLE chain: the post-`&` status check reads
  the OLD server. Wait with an `until curl` loop on the NEW pid.
- X230: `next dev` alongside prod server dropped free RAM to 185MB — kill dev,
  use a prod-build probe cycle for boundary render proofs (probe route in,
  build, screenshot, probe out, rebuild).
- Ghost pid 3985 (portless next-server) resurfaced after R4.2's kill — check
  `ps -eo pid,rss,cmd | grep next-server` at session start, not just :3000.

Related: [[r43-capability-arsenal]], [[r42-library-enrichment-lessons]],
[[musts-talep-audit-2026-07-16]], [[design-verification-rule0]].
