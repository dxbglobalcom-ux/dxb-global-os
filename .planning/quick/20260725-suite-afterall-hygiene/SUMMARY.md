---
ticket: 20260725-suite-afterall-hygiene
status: complete
completed: 2026-07-25
---

# SUMMARY — e8/e10 suite afterAll hygiene (ledger open debt closed)

Ledger debt: "e8 log-decision, e10 escalation class still leave terminal probe rows on ticker after a full-suite run." Systematic-debugging pass found THREE residue classes and fixed each at source.

## Root causes (measured, Phase-1 evidence)

| Class | Mechanism | Rows/run |
|---|---|---|
| 1. Worker/dispatch decision rows | `runWorkerOnce`/`dispatch` write run-less `employee-selection` + `task_plan` decision_log rows under fixture worker names (`e8-test-worker`, `e83-test-worker`, `e8-2-worker`, `e102t-worker`, dispatch probe rationales). Every suite's afterAll swept by run_id / decision-kind / rationale patterns that never match these. | ~17 |
| 2. (verified absent) | agent_runs / hook_violations / alerts / tasks / approvals / outbox counts identical before vs after runs — no residue in any other ticker-feeding table. | 0 |
| 3. RESIDENT-daemon race | `makeRun` helpers in `tests/e8/audit-surface.test.ts` + `tests/e8/alerts.test.ts` inserted PERSISTENT `status='queued'` engineering tasks as FK anchors. The live guarded scheduler's drain tick claimed them mid-suite (measured: decision rows at exactly 02:23, 05:43, 05:47 Berlin = test windows) → real-actor rows (`resident-worker` selection + `hook` project_alignment reject) on the CEO ticker. Likely also the observed once-only suite flake (1 failed on first run, unreproducible after fix — hypothesis, not measured). | 1-2 per race |

## Fixes (all at source)

- `tests/e8/obs-wrapper.test.ts`, `tests/e8/ops-live.test.ts`, `tests/e8/log-decision.test.ts`, `tests/e10/spawn-binding.test.ts`: afterAll gains a scoped decision_log sweep keyed on fixture-unique `decided_by` names (+ dispatch probe-rationale patterns). Scope safety measured first: those actor names occur ONLY in fixture rows; 14 real `orchestrator:dispatch` rows untouched by the rationale patterns.
- `tests/e8/audit-surface.test.ts`, `tests/e8/alerts.test.ts`: probe FK-anchor tasks now born `status='inbox'` — a status no worker-loop leg reads (measured: legs consume queued/review/failed only; zero 'inbox' consumers in packages/) — the daemon race is structurally impossible.
- Backlog artifacts purged via the audited door: `control_decision_purge([17259,17270,18000,18234,18235])` as CEO → `{ok:true, purged:5}` + `records.purge` audit row with C22 close-out rationale.

## Evidence

- Red: baseline decision_log 162 → 196 after two pre-fix runs (+34 fixture rows listed by id).
- Green: post-fix `pnpm vitest run tests/e8 tests/e10` → **82/82**, twice; fixture-scope query returns **0 rows**; two further runs at 05:50 added **zero** new rows (max id unchanged).
- Full suite re-run after all changes: see verification line below.
- Post-purge: `decided_by='resident-worker' AND created_at > '2026-07-25'` → 0.

Full-suite verification (measured after the background run): 70 files — 68 passed + tests/r32 carrying this session's 3 deliberately-red U15 tests (later green 39/39) + `tests/phase4/velocity.test.ts` measured as a LOAD FLAKE (pg-boss registration 5s timeout while 3 concurrent vitest processes + a next build shared the X230; solo re-run 6/6 GREEN — not a defect, recorded).

## Addendum — probe-alert incident (CEO morning screenshot 2026-07-25 ~11:54)

Two unresolved hook alerts reached the CEO's Alerts page (halal_screen "kumar" 05:59 + knowledge_shelf 06:00). Measured root: full-suite run 2 (05:57-06:01) — the halal row is the firewall's own regression probe being REJECTED at the pre-gate (violation 6556, run-less, task fail-closed; standing-order-10 permitted class). NO real haram content, NO policy breach — the alert documents the firewall WORKING on a test sentence. Leak mechanism: sequential suite — files running after the owning suite re-raise ':no-run' probe alerts with nobody left to sweep. Fixes: both alerts resolved via `control_alerts_action` with C22 notes (audit 41956/41957); NEW global vitest teardown `tests/global-teardown.ts` (registered in vitest.config) owns the ':no-run' class — proof: seeded probe alert swept (`[global-teardown] swept 1`, count 0). Also fixed on sight: the new r31 stale-takeover test now registers its intent text for the suite's intent sweep (orphan intent measured + removed).
