---
type: quick
slug: e84-audit-surface
closed: 2026-07-13
author: fable-5 (inline, K1)
roadmap: E8.4
---

# Summary — E8.4: Audit page (Governance) — unified stream + detail_ref drill + Decision Logs

## Delivered

1. **Migration `20260713070000_e84_audit_surface.sql`** (applied 2× idempotent):
   `v_audit_trail` (audit_log ⋈ detail_ref in ONE query per spec §8 —
   normalizes BOTH ref shapes: canonical §4 `{"table","id"}` AND the legacy
   writer keys `{"<table>_id": N}` from E6.1/E6.5/E7.1 fns; append-only rows
   never rewritten — registered adaptation, ticket §1) · `v_decision_log`
   (8 directive fields + run→employee/task context) ·
   `control_audit_mark_reviewed` (THE single audit-family mutation:
   file_changes.review_status via fn only, idempotency, canonical-ref audit
   row, `reviewed_flagged` → `alert.raised` on `alerts` — the ONLY log write
   that broadcasts, §9) · routing_rules authenticated SELECT policy + GRANT
   (grant alone was the missing gate — security_invoker views fail whole-query
   without it).
2. **`/api/control/audit`** — mark_reviewed seam, models-route idiom
   (session + Zod shape only; rules in the fn).
3. **`/gov/audit`** — unified time-stream (filters actor/entity/date/risk §7,
   row → payload + family-record drill), **`/gov/audit/[id]`** full record
   (CCC drill-map row), **`/gov/decisions`** — the 8 questions of madde 10.2
   as column headers VERBATIM (§7 "8 sütun birebir"; table-fixed, wide table
   scrolls in own container at 1280), GovTabs shared header (tab = link, both
   IA routes stay real — recorded interpretation 2).
4. i18n `command.audit` + `command.decisions` EN/TR (parity 786 = 786).

## Evidence (all executed)

- Spec §24 sequence: `\d file_changes` → review_status + reverted_by ·
  `UPDATE decision_log … as authenticated` → `ERROR: permission denied for
  table decision_log` · `jsonb_typeof(detail_ref)` → object.
- `tests/e8/audit-surface.test.ts` **8/8**: legacy-shape resolution on live
  rows · canonical-shape + ref_risk filter column · v_decision_log answers
  8/8 questions in one query · mark_reviewed happy path drills back through
  v_audit_trail · idempotent replay + IDEMPOTENCY_MISMATCH · flagged →
  alert.raised on dxb:alerts with corr chain · validation refusals + anon
  holds NO execute grant · append-only wall re-proof (decision_log +
  file_changes.review_status fn-only).
- Full regression e7+e8+phase5+phase6: **16 files, 98 passed / 0 failed** ·
  `tsc -b` 0 · dashboard `tsc --noEmit` 0 · i18n purity PASS.
- Roadmap acceptance in-browser: audit row click → payload + linked family
  record (audit 2895 → routing rule 812b57ce…) + `/gov/audit/2895` full page.
- RULE #0 pass: /gov/audit + /gov/decisions EN+TR × 1280+1920, real browser;
  fixed in-pass: 1280 column crush (nowrap/truncate/table-fixed), CEO badge
  duplication, TR header collision, empty-alternatives dash; baselines
  `gov-audit-*.png` + `gov-decisions-*.png` in INDEX (PENDING CEO eye).

## Fixed in-pass (rule 5 / broken = fix now)

- **Stray E8.3 dev collector** (left running for the /live eye test)
  duplicated ops:live publishes and flaked the E8.3 debounce regression —
  swept (`pkill -f ops-live-collector.mjs`), suite green again. Same lesson
  as memory `eye-test-mutation-hygiene`; the /live stream now needs a
  collector start at next eye-test (dev script, Phase-7 worker adopts).

## Question→column audit (spec §21: 8+6+9)

- 10.2 (8): decision_log fields verbatim on /gov/decisions headers — who /
  rationale / data_used / alternatives / confidence / risk / approval_id /
  outcome ✓ (test asserts all 8 in one v_decision_log row).
- 10.3 (6): tool / params_digest / run→employee / ok / duration_ms / error —
  tool_calls columns (E8.1); surfaced per-run via run drill; audit stream
  reaches them through corr/task links. ✓ columns exist + tested in E8.1.
- 10.4 (9): path / op×4 (read create modify delete) / diff_summary / run→
  employee+task / commit_sha / review (review_status + mark_reviewed fn) /
  rollback (reverted_by chain) — file_changes columns ✓; review mutation
  live this row.

## Boundaries recorded (future rows, not gaps)

- Retention/prune `retention.*` pg-boss jobs + damıtma dry-run → Phase 7
  (resident worker; spec §4 discipline unchanged).
- `/alerts` center (ack/escalate/resolved UI consuming alert.raised) → E8.4b.
- tool_calls/file_changes per-run browsing surface → run drawer rows (E8/E12).
- v_global_search audit_log leg → CCC search row.
