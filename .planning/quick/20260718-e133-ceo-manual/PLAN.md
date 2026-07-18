---
ticket: E13.3 CEO Operating Manual (U13)
spec: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md row E13.3 (:161) —
  single source HOLDING-OS-MASTER-PLAN/CEO_OPERATING_MANUAL.md; TR primary +
  EN canonical mirror (U13 language exception); order clause satisfied
  (E12.3 route gate closed 2026-07-18 ~02:35, screens final)
status: in-progress
---

# Execution ticket — E13.3 (zero new design decisions)

Row contract: manual covers daily routine (07:00 briefing → intelligence →
approvals), 7 nav groups, drill-down map, approval-flow rules (money-out
never bulk; when delegate/reanalyze), alert levels + correct response,
hard-stop behavior (release is CEO's), Control Mode capabilities (model
badge, budget keys), eye-test/design-bank loop, emergency Global Pause;
reachable from the dashboard (kind=sop intake → Knowledge surface).

Measured sources (this session): command-nav.ts 7 groups/46 routes · alert
levels {informational, attention, high, critical} (live enum) · approval
actions {approve, reject, approve_with_modifications, delegate, request_info,
reanalyze, change_policy} (control route Zod) + batch decide_approvals
(approve/reject only) · settings_registry keys incl. os.global_pause,
os.maintenance_mode, approvals.money_out_gate, orchestrator.*, department.
budget_eur · v_morning_briefing view · sop naming precedent
(i18n-purity-check, design-verification-checklist).

Evidence contract: manual file exists (TR+EN, English-artifact rule
satisfied by U13 exception being CEO-registered) · library sop row via
control_library_action (A8) · dashboard access proof on /ai/library?kind=sop
(both locales) · battery + gitleaks · roadmap row ✓ with evidence.
