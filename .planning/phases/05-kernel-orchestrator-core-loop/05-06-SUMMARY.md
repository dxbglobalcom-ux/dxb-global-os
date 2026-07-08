---
phase: 05-kernel-orchestrator-core-loop
plan: 06
status: complete
completed: 2026-07-08
tasks_completed: 2/2
commits:
  - "4febf9e feat(05-06): escalate.ts — LOCKED ladder as pure code over task_events (fail count monotonic, hard stop at 5)"
  - "(this commit) feat(05-06): ladder.test.ts — 2× fail → third claim at higher tier + low-confidence conversion + hard stop"
---

# 05-06 SUMMARY — escalate.ts: the LOCKED ladder over the event log

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan step 6, ORCH-03: escalation is deterministic TypeScript over the
append-only `task_events` log — nothing for an LLM to decide. `fail_count`
derives ONLY from events (`event='transition' AND to_status='failed'`); no
counter table exists (migration count still 9). The LOCKED ladder
(0→first tier | 1→same-tier retry | 2→specialist +1 tier | 3→head review L2 |
4→Fable final L1 | beyond→blocked report) is a pure `(n) => LadderAction` map,
diffable line-for-line against PHASE-05 §3.

## Module

**escalate.ts** — `ladderAction(n)` + `bumpTier(tier)` pure (unit-tested, no
DB); `failCount(db, taskId)` counts the append-only log; `escalate(db, taskId)`:
low-confidence conversion first (review with payload confidence < 0.6 →
`review→failed` with `{reason:'low-confidence', confidence}` — count stays
event-derived, no shadow state), then one ladder step: requeue
(`failed→queued`, tier per rung, claim fields cleared) with the rung in the
event payload, or HARD STOP at n≥5 — no requeue ever, `tasks.feedback` =
human-readable blocked report (task id, objective, all 5 failure summaries),
one `audit_log` row (`orchestrator:escalate` / system / `task.blocked`) +
`blocked` event. Re-escalate after block = no-op (audit-row existence check).
All writes actor `orchestrator:escalate`.

## Evidence — all executed, deterministic (never skipped)

| İddia | Durum | Kanıt |
|---|---|---|
| Ladder map = PHASE-05 §3 birebir (0/1/2/3/4/beyond) | ✓ VERIFIED | `ladderAction` unit test, 6/6 içinde |
| 2× fail → ÜÇÜNCÜ claim üst tier'da (L4→retry L4→specialist L3) | ✓ VERIFIED | `worker-lad-2` executor'a gelen `task.model_tier === 'L3'`; requeue payload `model_tier: 'L3'` |
| Ladder hikayesi yalnız task_events'ten okunur | ✓ VERIFIED | 12 olaylık zincir (aşağıda) exact-match assert |
| confidence 0.4 review → failed(reason low-confidence) → requeue | ✓ VERIFIED | fail event `from_status='review'`, payload `{reason:'low-confidence', confidence:0.4}` |
| confidence 0.9 review → escalate no-op | ✓ VERIFIED | `{action:'none', failCount:0}`, status 'review' değişmedi |
| Hard stop: 5. fail → requeue YOK, blocked rapor + audit | ✓ VERIFIED | status 'failed', feedback "BLOCKED after 5 failures" + 5 özet; audit_log 1 satır `task.blocked`; 6. claim `{claimed:false}` |
| Re-escalate no-op (monotonik, sonsuz döngü yok) | ✓ VERIFIED | `alreadyBlocked:true`, audit hâlâ 1 satır, feedback değişmedi |
| Sayaç tablosu YOK | ✓ VERIFIED | `ls db/migrations \| wc -l` → 9 |
| Suite | ✓ VERIFIED | `pnpm vitest run tests/phase5/ladder.test.ts` → **6 passed (6)**; `pnpm test` → **15 files, 65 passed \| 9 skipped (74)** |

**Ladder event chain (test stdout, master-plan step 6 kanıtı):**
```
created:    inbox → queued     orchestrator:dispatch
claimed:    queued → claimed   worker-lad-1
transition: claimed → running  worker-lad-1
transition: running → failed   worker-lad-1        {error: "synthetic ladder failure: first attempt"}
transition: failed → queued    orchestrator:escalate {ladder: retry-same-tier, fail_count: 1, model_tier: L4}
claimed:    queued → claimed   worker-lad-1
transition: claimed → running  worker-lad-1
transition: running → failed   worker-lad-1        {error: "synthetic ladder failure: second attempt"}
transition: failed → queued    orchestrator:escalate {ladder: specialist, fail_count: 2, model_tier: L3}
claimed:    queued → claimed   worker-lad-2
transition: claimed → running  worker-lad-2
transition: running → review   worker-lad-2        {confidence: 0.9}
```

## Threats closed

- **T-05-13 (cost abuse):** fail_count monotonic from append-only events; hard
  stop at 5 asserted — post-block claim returns `{claimed:false}`.
- **T-05-14 (count reset):** task_events UPDATE/DELETE revoked (Phase 3) —
  count can rise, never fall; no code path deletes events.
- **T-05-15 (silent drop):** terminal path REQUIRES feedback report + audit row,
  both asserted; `blocked` event keeps the log complete.

## Deviations

| Sapma | Durum |
|---|---|
| `bumpTier` L2→L1 ve L1→L1 tavanı (plan yalnız L4→L3→L2 örnekledi; genel "bir üst tier" kuralının tamamlanması) | Uygulandı + unit test — kapalı |
| `blocked` event satırı eklendi (plan feedback+audit istedi; "her ladder aksiyonu event" ilkesi gereği log da tamamlanıyor) | Uygulandı + zincirde görünür — kapalı |

Açık sapma yok.
