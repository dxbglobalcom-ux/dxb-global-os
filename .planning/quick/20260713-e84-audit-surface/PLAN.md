---
type: quick
slug: e84-audit-surface
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E8.4
---

# Execution Ticket — E8.4: Audit page (Governance) — unified stream + detail_ref drill + Decision Logs

**Spec pointers (the plan lives there, not here):**
- AUDIT_AND_LOGGING_SPEC §2 (question→column map 8+6+9), §4 (detail_ref bridge,
  review/rollback columns), §7 (frontend: unified time-stream on audit_log →
  detail_ref drill to family record; filters actor/entity/date/risk; Decision
  Logs tab with the 8 directive questions as headers), §8 (v_audit_trail read;
  single mutation `control_audit_mark_reviewed`, API_CONTRACTS row 77), §9
  (reviewed_flagged → `alert.raised` on `alerts` channel — the ONLY broadcast
  from log writes), §13 (append-only grants), §21 (acceptance).
- CEO_COMMAND_CENTER_SPEC §IA (`/gov/audit`, `/gov/decisions`), drill map row
  "Audit satırı → /gov/audit/[id] tam kayıt".
- EVENT_MODEL §9a envelope, §9b `alerts` channel (`alert.raised`, no debounce).
- Roadmap row E8.4 acceptance: "UI'da audit satırı → aile kaydına iniş".

**Verified live baseline (2026-07-13):**
- 0022x-b ALTERs ALREADY APPLIED: `audit_log.detail_ref`,
  `file_changes.review_status/reverted_by` live (migration 20260711002250).
- `v_audit_trail` does NOT exist; `control_audit_mark_reviewed` does NOT exist;
  `/gov/audit` + `/gov/decisions` are ModuleWaiting placeholders.
- audit_log 615 rows, 25 with detail_ref — writers used legacy key shape
  `{"<table>_id": N}` (settings_change_log_id, routing_rule_id,
  revenue_ledger_id), spec §4 canonical is `{"table":"…","id":N}`.
- routing_rules: RLS on, ZERO select policy (readable only via definer paths).

**Recorded interpretations (spec-gap handling, zero new design):**
1. detail_ref legacy shape = spec-gap in closed rows (E6.1/E6.5/E7.1 writers).
   audit_log is append-only/KALICI — rewriting old rows is forbidden by the
   stronger rule. Fix: `v_audit_trail` normalizes BOTH shapes to
   (ref_table, ref_id); NEW writers from this row on use the canonical §4
   shape (`control_audit_mark_reviewed` does). Registered adaptation, this
   file + SUMMARY.
2. "Decision Logs ayrı sekme" (§7) + separate `/gov/decisions` route (CCC IA):
   implemented as a shared tab header over two routes — tab = link, both
   routes real. Satisfies both texts without inventing a third layout.
3. `control_audit_mark_reviewed` actors: ceo (jwt) or system (service_role) —
   mirror of fn_update_routing actor wall; spec is silent on the reviewer
   identity, review by QA workers (service_role) must stay possible.
4. Risk filter (§7) applies via decision_log join — non-decision rows have no
   risk; selecting a risk value narrows to decision-linked rows (honest).
5. routing_rules gets a plain `authenticated` SELECT policy so the
   security_invoker view can resolve routing refs (same read class as every
   other family table — all already ceo_read).

**Deliverables:**
- Migration `20260713070000_e84_audit_surface.sql`: `v_audit_trail` +
  `v_decision_log` (security_invoker views) · routing_rules read policy ·
  `control_audit_mark_reviewed(p_payload,p_idempotency_key)` (SECURITY DEFINER,
  idempotency, audit row with canonical detail_ref, reviewed_flagged →
  notify_broadcast('alerts','alert.raised', §9a envelope)). Applied 2×.
- `/api/control/audit/route.ts` (models-route idiom).
- `/gov/audit` page + `components/gov/audit-trail.tsx` (filters
  actor/entity/date/risk, expandable drill, link to detail) ·
  `/gov/audit/[id]` full-record page · `/gov/decisions` +
  `components/gov/decision-logs.tsx` (8 question-headers, 10.2 order).
- i18n `command.audit` + `command.decisions` EN/TR.
- `tests/e8/audit-surface.test.ts`.

**Evidence contract (§21 + roadmap acceptance):**
1. §24 sequence: `\d file_changes` shows review columns · `UPDATE decision_log
   … WHERE false` → permission denied · `jsonb_typeof(detail_ref)` live.
2. v_audit_trail resolves BOTH detail_ref shapes to a family record (test).
3. mark_reviewed: reviewed_ok row + audit row with canonical ref · replay
   idempotent · reviewed_flagged → `alert.raised` row in realtime.messages ·
   non-actor refusal.
4. 10.2's 8 / 10.3's 6 / 10.4's 9 questions each answerable as a column/field
   on the surface (question→column table re-checked in SUMMARY).
5. UI drill: audit row click → family record visible (RULE #0 browser pass,
   EN+TR × 1280+1920, baselines gov-audit-*/gov-decisions-*).
6. Full regression + tsc + i18n purity + gitleaks.

**Boundaries (future rows, no work here):**
- Retention/prune pg-boss `retention.*` jobs → Phase 7 (resident worker).
- Alerts CENTER page (`/alerts` real module, ack/escalate) → E8.4b — this row
  only produces the `alert.raised` event.
- `/gov/risks|policies|permissions|security` → their own rows.
- Run drill `/ops/tasks/[id]` → E12.1 (links use existing routes).
