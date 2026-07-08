---
phase: 06-memory-router-knowledge-stores
plan: 07
status: complete
completed: 2026-07-09
duration: ~20min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-07): context-rot defeated — band-held 50-step demo, door-committed offload, evented compression"
---

# 06-07 SUMMARY — context-budget: compression + summaries + memory offload (MEM-04)

**Executed inline by Fable 5 (governance v5 — no subagent; plan's "Opus may execute" line superseded by CEO 2026-07-08 directive).** Master step 9: context-rot demonstrated AND defeated. MEM-04's three moves map 1:1 — compression (oldest-60% slice summarized), summaries (compact block with recall handles left in place), memory offload (facts committed through the router's single write door, never a side channel).

## What closed

- **`packages/orchestrator/src/context-budget.ts`** — `estimateTokens` (chars/4, documented estimate; band sized with margin), `CONTEXT_BAND = { softLimit: 12_000, hardLimit: 16_000 }` (plan constant — changing it later is ⛔ FABLE-ONLY), `checkContextBudget` (under soft → pass-through + measurement; over soft → `summarizeAndOffload`), `summarizeAndOffload` (extract durable facts from oldest 60% → `commitMemory` with provenance `{agent: workerId, task_id, origin:'agent', source:'context-offload'}` → replace slice with a compact summary block carrying the memory ids). Over hard AFTER compression → loud throw. Production fact extractor = routing_rules `summarize` row (L4 deepseek-v4-flash seeded; fail-closed if missing; unparseable output THROWS — evicting history uncaptured is the T-06-21 amnesia this module forbids).
- **`packages/orchestrator/src/worker-shim.ts`** — `makeSteppedExecutor({workerId, steps, contextBudget?, budgetDeps?, onMeasurement?})`: the step loop runs the budget check after each step (default ON for multi-step); each compression appends `task_event 'context_compressed'` `{step, before, after, offloaded_count}` with `from=to='running'` (in-flight observation — the 10/10-gate transition chain stays contiguous). `runWorkerOnce`'s single-shot Executor signature is UNTOUCHED.
- **`tests/phase6/context-rot.test.ts`** + **`tests/phase6/context-rot.log`** — the 50-step demo (~800 est. tokens/step, facts planted at steps 10/25/40) through the REAL worker shim (dispatch → claim → event trail), plus the hard-breach negative and one live run.

## Decisive evidence (executed)

- ✓ Exports: `node -e` over dist → `BUDGET_OK {"softLimit":12000,"hardLimit":16000}`
- ✓ Offload has no side channel: grep insertInto/updateTable/write* in context-budget.ts → `NO_DIRECT_WRITE`; commitMemory referenced 3× (import + call + comments)
- ✓ CONTROL run (budget off): final context **37,018 tokens > 16,000** — the rot is real; zero `context_compressed` events
- ✓ MANAGED run: 50/50 measurements ≤ hardLimit; post-compression points ≤ softLimit; **4 compressions at steps 17/28/38/48** (≥2 required); event count == compression count, payloads byte-match measurements; chain `created → claimed → running → [4× context_compressed running→running] → review` contiguous
- ✓ Offload is memory, not amnesia: all 3 planted facts evicted from live context, **exactly 3 offload rows** (no double-commit), each recalls back via `recallMemory` (kind given, fixture embed); final live context carries `[recall handles: <uuid>...]`
- ✓ Ölçüm logu: `tests/phase6/context-rot.log` committed — 51 lines (header + 50 rows); `awk` over col 2 → `BAND_HELD`
- ✓ Hard-breach negative: incompressible 17.5k-token entry in the newest 40% → `rejects.toThrow(/hard band breach/)`
- ✓ Live run (DXB_LIVE_SDK=1, real deepseek-v4-flash summarizer + real embed + real recall): 4 compressions (before ~12.5–12.6k → after ~4.5–5.2k), 3 offload rows, planted marker `737373` recalled back; summarizer carried planted FACT lines near-verbatim (one legitimate rewording observed: "The cost ledger hard-stop fires at 100 percent of budget.") — **4/4 tests green in 19.2s**
- ✓ Phase-5 regression (Task 2 gate): `4 passed (4)`, `26 passed | 8 skipped` — certified loop untouched
- ✓ Full regression: `22 passed (22)`, `102 passed | 14 skipped (116)` (06-06: 21 files, 99|13; +3 deterministic +1 live-gated)

## Deviations recorded (Fable, CEO-visible)

1. **Live-test department = 'os':** `defaultExtractFacts` attributes summarizer spend to the task's department (COST-02). The synthetic `ctx-rot-live-*` department has no LiteLLM virtual key → first live run failed with the key-missing error (fail-closed worked as designed). Live task now dispatches under `os` (dxb-os key, where router spend already lands). Production departments get their own keys at Phase-7 provisioning.
2. **Budget check runs after EVERY step, not strictly "between" steps:** the plan's log needs 50 measurement rows; checking after the final step also protects the task's closing context. Behaviorally a superset of "between steps".
3. **Measurement tap `onMeasurement(m, compressed)`:** plan named no seam for the log; the demo builds its CSV from this tap rather than parsing events (events remain the durable record).
4. **`WorkingContext.department` added:** cost attribution for the production summarizer needs the department; ClaimedTask already carries it.
5. **orchestrator → @dxb/memory-router dependency added** (package.json + tsconfig reference): the offload key_link requires the door; dependency direction is orchestrator→router (no cycle — router never imports orchestrator).

## Downstream contracts armed

- `context-rot.log` → 06-08 cites it as MEM-04 evidence in 06-VERIFICATION (key_link)
- `makeSteppedExecutor` + `'context_compressed'` events → Phase 8 dashboard can render compression history per task
- `OFFLOAD_SOURCE = 'context-offload'` provenance marker → audit queries can isolate eviction-committed memory
