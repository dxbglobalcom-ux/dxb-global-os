---
task: E12.4 Holding/CRM Integration Gate (GAP-05)
spec_pointer: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md row E12.4 + GAP-AUDIT GAP-05 + 00-CEO-DIRECTIVE-GAP-AUDIT (company switch/context, drill-down, isolation); CC-SPEC §7 route table gains the CRM rows (registered edit)
started: 2026-07-18T02:45:00+02:00
---

# PLAN — E12.4 CRM Integration Gate (execution ticket)

Measured base: CRM = 4 legacy (cockpit) routes over entity-form/table/view
(582 lines, OLD design tokens); crm tables have NO company scoping
(crm_clients 0 rows, companies 1 = dxb-global, runtime-born id).

- Migration: `company_id` on **crm_clients only** (contacts/deals/requests
  scope through their client_id join — no denormalized drift);
  `fn_default_company_id()` STABLE default (bootstrap-parity safe: no uuid
  literal — R2.5 lesson).
- Company context: `dxb-company` cookie (slug), switcher in CRM chrome;
  every CRM query filters by the active company (children via inner join).
- New `(command)/crm` routes (nav group) reskinned to command tokens/Panel
  idiom; entity registry (lib/crm.ts) stays the single source.
- Drill-down: company → departments → employees → projects links live on
  /org/companies (company context rides the links).
- Old cockpit CRM dies SAME COMMIT: permanent redirects (308) /crm/* →
  /crm in the new shell.
- Isolation proof: seed a second test company + client rows per company →
  switch → only the active company's rows render (Playwright + SQL) → sweep.

## Evidence contract

1. Old /crm URLs → 308 to (command) CRM (curl -I quoted) — same commit.
2. Company switch → data isolated (browser proof + tests/e124 suite).
3. Migration ledger n=n; fn_default_company_id parity-safe.
4. Battery: tsc 0 · build 0 · full vitest green · purity PASS · RULE #0
   EN+TR × 1280/1920 on new CRM surfaces (clipped 0).
5. CC-SPEC §7 table + nav registered; atomic commits, gitleaks clean.
