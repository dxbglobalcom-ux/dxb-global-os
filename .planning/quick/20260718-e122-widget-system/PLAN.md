---
task: E12.2 Widget system — layout persist + add/remove/move
spec_pointer: HOLDING-OS-MASTER-PLAN/CEO_COMMAND_CENTER_SPEC.md R8 + §5 (WidgetGrid/WidgetFrame/registry) + §10 (layout schema, verbatim) + §11 (registry source rule) + §17 (widget error boundary) + madde 2B (drillHref mandatory); roadmap row E12.2
started: 2026-07-18T01:55:00+02:00
---

# PLAN — E12.2 Widget system (execution ticket)

Execution ticket ONLY — all design decisions are spec text:
- Layout lives in `settings_values(scope='ceo_dashboard', key='layout')`, NOT
  localStorage (R8). JSON schema VERBATIM §10:
  `{dashboards:[{id,name,default,widgets:[{type,x,y,w,h,filters}]}]}`.
- Writes go through the control seam: `/api/control/layout` → Zod validate →
  existing `control_settings_set` SECURITY DEFINER fn (audit + change_log +
  undo + Broadcast — §6 single pattern; SETTINGS spec owns the fn).
- `widgets/registry` single file: widget type → source view binding; a
  sourceless type CANNOT register (§11). v1 catalog = the 9 real-sourced
  blocks already living on Executive Overview (all `v_exec_overview`).
- `WidgetFrame`: mandatory drillHref (madde 2B lint rule), per-widget error
  containment (§17). `WidgetGrid`: client island; RSC renders widget content
  server-side, island only arranges (§ "RSC-first; client adaları").
- Edit interactions v1: add (from registry catalog), remove, move (order
  swap), width toggle — deterministic, Playwright-testable. Pointer drag-drop
  polish = recorded boundary (design slot, U16 companion), not silent.

## Evidence contract (row gate)

1. Save layout → NEW browser context (fresh session) → identical layout
   (Playwright proof, spec §24 acceptance (d)).
2. settings_values row scope='ceo_dashboard' measured; change_log + undo
   round-trip test green.
3. Zod rejects unknown widget type / malformed layout (API 400).
4. Registry completeness test: every widget type carries a source view +
   drill target.
5. tsc 0 · vitest regression green · i18n purity PASS · RULE #0 pass on
   /overview EN+TR × ≥2 widths (clipped 0, overflow 0).
6. Atomic commits, gitleaks clean.
