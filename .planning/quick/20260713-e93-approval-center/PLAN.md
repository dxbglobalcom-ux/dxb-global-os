---
type: quick
slug: e93-approval-center
created: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E9.3
---

# Execution ticket — E9.3: Approval Center expansion (§21 full page, decision history, policy binding) — existing decision path STAYS

**Spec pointers (no new design decisions here):**
- APPROVAL_ENGINE_SPEC (whole spec = the pointed section; 27 headings read
  this session). Binding hard lines: R1 B7b UNTOUCHABLE (money_out reaches
  outbox only through the decision fn; DB-grant proof), R2 madde 4 (NO new
  mandatory gate class; fail-closed default for unknown ops), R3 §21 card +
  detail field sets verbatim, R4 all 7 CEO actions, R5 no raw JSON in CEO
  view (readable-payload work STAYS and generalizes), R6 fatigue guard,
  R7 every decision → decision_log + linked release.
- §4 data model: approvals extend (nullable only) + approval_rules + no
  fatigue table (view). §6 fns. §8 API seam + idempotency. §9 deadline /
  money_out>24h alerts. §10 no optimistic update; bulk = per-approval fn
  calls; money_out NEVER bulk. §13 decisions CEO-only; system INSERT
  pending + reanalysis append only. §22 rollback = nullable drops. §24
  execution order 1-5. §26 stale marker 7d+, single-level delegation.
- API_CONTRACTS row `approvals`: decide via existing 0015 fn KALIR — para-
  çıkışı kapısı DOKUNULMAZ; error dictionary + Idempotency-Key retry.
- Roadmap E9.3 acceptance: "mevcut approval testleri yeşil + yeni center
  rotası".

**Verified live baseline (this session):**
- approvals table: severity risk_class (low/medium/high/critical CHECK),
  status draft/pending/approved/rejected, guard + outbox-enqueue (0003) +
  broadcast (0013) triggers live. decide_approvals (0015) LOCKED, green in
  tests/phase4 + tests/phase8/approval-inbox.
- outbox: NO INSERT/UPDATE grant to authenticated/anon (B7b DB-level
  already holds — proof query planned). BROKEN GRANT FOUND: anon +
  authenticated hold TRUNCATE on approvals/outbox — fixed in this
  migration (CEO standing order: broken found = fixed now; B7b infra is
  the explicit exception to the security-hardening deferral).
- decision_log has approval_id FK (E8.4); settings_change_log live;
  control_idempotency + control_* fn idiom live (alerts/workflows);
  fn_alerts_evaluate() sweep fn live (E8.4b); kernel workflow approval
  step inserts pending approvals; isMoneyOut prefix badge in dashboard lib.

**Recorded interpretations (registered in spec as adaptations, CEO-visible):**
1. Spec §4 lists `risk_class` (money_out|contract|identity|high_cost|other)
   but the live column already holds severity values consumed by inbox
   grouping + v_alerts_active. New nullable column `operation_class` carries
   the classification domain; approvals.risk_class stays severity. B7b rule
   keys on operation_class='money_out' OR legacy action_type prefix.
2. Spec §6 "money_out outbox INSERT inside the fn": realized as the 0003
   enqueue trigger firing INSIDE the decision fn's transaction (single
   transaction holds), duplicated INSERT would violate outbox UNIQUE.
   Grant-proof unchanged: no direct outbox write path exists for
   authenticated.
3. Fn name follows the established control seam idiom:
   `control_approvals_action(p_payload, p_idempotency_key)` (alerts/
   workflows twin) implementing spec's fn_decide_approval contract; 0015
   decide_approvals untouched beside it.
4. §9 deadline/money_out alert sweeps land as additive checks inside
   fn_alerts_evaluate (E8.4b single sweep door) — existing checks intact.
5. Reanalyze/delegate produce analysis TASKS (tasks table); resident worker
   pickup is P7 — tests drive the system-append path directly.
6. approve_with_modifications: effective payload = payload || modifications
   written back to payload (executor reads one field); modifications column
   keeps the delta; audit carries original payload_hash.

**Deliverables (spec §24 order):**
1. Migration 20260713110000_approval_center.sql — approvals ALTER (§4
   nullable set), approval_rules + locked seed (money_out/contract/identity),
   TRUNCATE revoke fix, fn_classify_operation (fail-closed), 
   control_approvals_action (7 actions + idempotency + CEO wall + system
   lanes), v_approvals_center, v_approval_fatigue, fn_alerts_evaluate
   additive checks, grants.
2. Kernel: classify-operation wrapper + workflow approval step stamps
   operation/operation_class via fn (risk_class behavior unchanged).
3. /api/control/approvals route (alerts idiom).
4. UI: approval-center.tsx (filters, bulk minus money_out, fatigue banner,
   card reuse) + /approvals page RSC on v_approvals_center + /approvals/[id]
   detail (R3 detail set + 7 actions + decision history) + IntelligenceRail
   pending/oldest/money_out summary. i18n command.approvals EN+TR.
5. tests/e9/approval-center.test.ts — §20 list: classification priority ·
   unknown→gated · locked rule change reject · decide idempotency replay +
   MISMATCH · direct outbox INSERT permission denied · 7 actions · money_out
   fn-only release · fatigue view rows · stale/deadline sweep alerts · anon
   zero grant · TRUNCATE revoked.

**Evidence contract:**
- §24 psql probes: locked rules ≥1 · unknown op → 'gated' · direct outbox
  INSERT → permission denied · v_approval_fatigue returns rows.
- mevcut approval testleri yeşil: tests/phase4/approval-flow +
  tests/phase8/approval-inbox rerun green (0015 path untouched).
- Full regression + tsc -b 0 + dashboard tsc 0.
- RULE #0: /approvals + /approvals/[id] EN+TR × 1280+1920, CHECKLIST walk,
  i18n purity PASS, baselines approvals-*.png → design-bank (PENDING CEO
  eye). In-browser: pending card → detail → approve-with-modifications →
  diff summary → decided; re-analyze flow; money_out excluded from bulk.
- Eye-test mutation hygiene: demo approvals/rules/tasks swept after pass.

**Boundaries:** resident worker executing analysis tasks → P7; MCP approval
tool group adopting classify-fn at submit_draft → gateway row (E13.x);
mobile monitoring view (§29) → CC-SPEC mobile row; fatigue-driven automatic
policy suggestions beyond banner counters (system proposal rows) → recorded
follow-up with fatigue view as its data source.
