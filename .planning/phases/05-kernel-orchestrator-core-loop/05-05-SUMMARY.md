---
phase: 05-kernel-orchestrator-core-loop
plan: 05
status: complete
completed: 2026-07-08
tasks_completed: 3/3
commits:
  - "44e3870 feat(05-05): decompose.ts — ClassifiedIntent to dependent TaskEnvelopes (LLM boxed in one Zod-gated call)"
  - "315664f feat(05-05): dispatch.ts — envelopes to queued tasks + created events in one transaction"
  - "9fb88e8 feat(05-05): worker-shim.ts + decompose-dispatch e2e — claim to done with full event chain"
---

# 05-05 SUMMARY — orchestrator spine: decompose + dispatch + worker shim

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan PHASE-05 §4 steps 4+5: a ClassifiedIntent becomes dependent
TaskEnvelopes (LLM only inside one Zod-gated drafting call — control flow in
TypeScript, LOCKED), envelopes become queued tasks rows with `depends_on`
uuids, and a worker claims + runs one to done with a complete task_events
chain. ORCH-01 + ORCH-04 hold structurally and observably.

## Modules

1. **decompose.ts** — `single`: one envelope from ci, zero LLM calls. `multi`:
   one Agent SDK drafting call, model/effort from the `orchestration` routing
   row (data). Guards in code, post-parse: self-contained lint (yukarıda/
   önceki/above/previous step/as mentioned → reject), hop-depth ≤ 3 (LOCKED),
   batch cap 10 (T-05-12), forward-only deps indices. One regeneration attempt
   with the failure quoted, then throw. `model_tier` per envelope from
   `route()` by draft task_class — never from LLM output (T-05-11);
   approval_class raised-only from ci (T-05-10).
2. **dispatch.ts** — one transaction: whole-batch Zod + deps validation before
   any insert; pass 1 inserts queued rows collecting uuids in input order,
   pass 2 resolves deps indices → `depends_on` uuids; one `created` event per
   task (actor `orchestrator:dispatch`). Head notification = queue row + event;
   no other channel built.
3. **worker-shim.ts** — `runWorkerOnce`: `claim_next_task` (dependency-aware
   SQL) → `claimed` event → `claimed→running` → injectable `execute(task)` →
   `running→review` with confidence in result jsonb + event payload (surfaced
   for 05-06 ladder; judged THERE) | throw → `running→failed` with error
   evented. Default executor resolves model from routing_rules by tier:
   subscription = Agent SDK, api = LiteLLM department virtual key. The shim
   touches only its claimed row — ORCH-04 by construction.

## Evidence (✓ VERIFIED — executed)

**Deterministic suite:** `pnpm vitest run tests/phase5/decompose-dispatch.test.ts`
→ `9 passed | 1 skipped` (live gate off).

**Live run (recorded, master-plan step 4):** `DXB_LIVE_SDK=1` same file →
**`10 passed (10)`**, live decompose 109s on the `orchestration` routing row.
Multi summer-sale intent produced **4 envelopes**, all `TaskEnvelope.parse`-valid,
forward-only deps, chain depth ≤ 3, final consolidation envelope:
`deps: [1, 2]`, `model_tier: L2`, `approval_class: internal` (propagated, not
lowered), objective fully self-contained (restates both input packages).

**E2E event chain (master-plan step 5 — pasted verbatim from test stdout):**
```
created:    inbox → queued    actor orchestrator:dispatch
claimed:    queued → claimed  actor worker-e2e-1
transition: claimed → running actor worker-e2e-1
transition: running → review  actor worker-e2e-1   (payload {confidence: 0.95})
transition: review → done     actor test:head-review
```
5 events, ordered, ≥ 4 required. `tasks.result` = `{text:'ok', confidence:0.95}`.

**Dependency order observed live:** 2-task chain queued → first claim takes the
independent task; while it sits in `review` the dependent task is **unclaimable**
(`{claimed: false}`); after `done`, next claim returns the dependent task.

**Atomicity:** batch with one Zod-invalid envelope → throws, task count
unchanged (zero rows inserted).

**Failure path:** executor throw → task `failed`, error text in the
`to_status='failed'` event payload.

**Full suite:** `pnpm test` → **Test Files 14 passed (14), Tests 59 passed |
9 skipped (68)** — Phase 3/4 suites unaffected.

## Deviations (recorded, CEO-visible)

- **ADAPT-6 — `SDK_MODEL_IDS` exported from kernel.** Task 1 acceptance says
  "no fenced model name in decompose.ts"; duplicating the classify.ts
  translation map would have put model-name literals there. The existing map
  is now `export`ed from `packages/kernel/src/classify.ts` (+ index re-export)
  and reused by decompose + worker-shim. Kernel files were not in the plan's
  files_modified list — 2-line additive change, no behavior change.
- **Lint regex fix (in-plan):** ASCII `\b` never matches at the edge of
  `önceki`/`yukarıda` (non-ASCII letters) — caught by the unit test, replaced
  with Unicode lookarounds `(?<![\p{L}\p{N}])…(?![\p{N}\p{L}])`.
- **`claimed` event added in shim** (plan listed running/review events):
  operational_core requires every transition evented ("her geçiş append-only
  olay"); claim IS a transition. Chain evidence above includes it.

## Key links honored

- decompose output = LOCKED `TaskEnvelope` (`.parse` on every envelope; schema untouched).
- dispatch `depends_on` uuids ↔ `claim_next_task` dependency clause — proven live (blocked/unblocked claim).
- worker-shim model ↔ routing data by envelope tier (ORCH-02 at execution time; default executor has no model literal).
