---
phase: 05-kernel-orchestrator-core-loop
plan: 03
status: complete
completed: 2026-07-08
duration: ~2 sessions (Tasks 1-2 prior session; Task 3 + fix this session)
tasks_completed: 3/3
commits:
  - "b6b7fff feat(05-03): kernel classify.ts (LOCKED ClassifiedIntent + agent-sdk headless call) + policy.ts routing engine"
  - "dbfa469 feat(05-03): routing-data.test.ts — 5-intent live KERN-01 run + KERN-02 UPDATE proof; classify structured-output fix"
  - "(summary commit) docs(05-03)"
---

# 05-03 SUMMARY — kernel classify.ts + policy.ts + executed routing-data verification

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan PHASE-05 §4 step 3: kernel classifies real CEO text into the LOCKED `ClassifiedIntent` schema (KERN-01) and routes purely from `routing_rules` data (KERN-02) — both halves verified with executed evidence.

## Decisive evidence (executed)

- ✓ `pnpm build` exit 0 (tsc --build clean after classify fix).
- ✓ LOCKED schema gate: `node -e` safeParse → `legal sample: true | illegal approval_class=urgent rejected: true`.
- ✓ **KERN-01 live run** (`DXB_LIVE_SDK=1 pnpm vitest run tests/phase5/routing-data.test.ts`): **10 passed (10)**, duration 56s. 5 intents through the live Agent SDK (opus-4.8 subscription, per the `orchestration` routing row — kernel's own model choice is data):

| # | Intent | task_class | departments | Assert |
|---|---|---|---|---|
| 1 | single-brand product listing draft (title/attributes/specs/catalog) | content.outbound | product | dept=product ✓ |
| 2 | fix failing unit test in shared TS package | code.standard | engineering | class+dept ✓ |
| 3 | Polish outlet market entry — strategic recommendation | strategy | sales, marketing, finance | class=strategy ✓ + route() → **model_tier L1** ✓ |
| 4 | summarize Q2 cost ledger into 5 bullets | summarize | finance | class=summarize ✓ |
| 5 | multi-channel summer sale campaign (email + paid ads) | orchestration | marketing, paid-media | complexity=**multi** ✓ (also approval_class=outward — outward marker honored) |

- ✓ **KERN-02 UPDATE proof** (pure DB, never skipped): `KERN-02 UPDATE proof: before=codex-5.5 after=sonnet-5 (row ee587740-b944-42cf-aa19-c629444b649b)` — same fixed intent, different model after one `UPDATE routing_rules SET model=…`, zero code changes, zero rebuild.
- ✓ Priority ordering asserted (priority-10 row beats priority-5); `enabled=false` row excluded (route falls to priority-5 row, restored after); no-match → typed `NoRouteError`; match-jsonb semantics unit-asserted (dept ∈ departments, keyword substring, unknown key fail-closed).
- ✓ Row restore verified post-run: `SELECT model, enabled … priority DESC` → `codex-5.5 | t` / `sonnet-5 | t`.
- ✓ Full suite: `pnpm test` → **Test Files 13 passed (13), Tests 50 passed | 8 skipped (58)** — no cross-file DB pollution.

## Deviations (recorded)

- **ADAPT-4 (classify.ts fix, this session):** first live run failed 4/5 intents with `expected object, received string` — on opus-4.8 `effort=high` with `maxTurns: 1`, the model answered inline (fenced JSON + prose) and the SDK could not retry its StructuredOutput tool call within a single turn (root cause isolated with a 3-variant probe; each single-variable change passed). Fix: `maxTurns: 4` + mechanical ``` fence unwrap before the JSON.parse fallback. **`ClassifiedIntent.parse` remains the sole decision gate — LOCKED schema untouched; no free-text fallback added.**
- **Test-text clarification (not code):** intent #1 phrased as explicit product-catalog work (title/attributes/specs); the earlier ambiguous phrasing classified to `marketing` — a defensible reading, not a schema failure.

## Discovery (operational)

- Live SDK tests gated by `DXB_LIVE_SDK=1` (repo `describe.skipIf` pattern); default `pnpm test` skips them, stays fast and CI-safe. Recorded live run is in this summary per master-plan step-3 requirement.
- `SDK_MODEL_IDS` in classify.ts translates brain-map row values (`opus-4.8`) to CLI ids (`claude-opus-4-8`) — mechanical rename map only; unknown values pass through so full CLI ids can ship as pure data.
