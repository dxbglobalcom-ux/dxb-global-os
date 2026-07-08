---
phase: 06-memory-router-knowledge-stores
plan: 05
status: complete
completed: 2026-07-09
duration: ~12min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-05): read door — classify-read spike prompt verbatim, memory_recall, poisoning closed end-to-end"
---

# 06-05 SUMMARY — classify-read + memory.recall + poisoning end-to-end close

**Executed inline by Fable 5 (governance v5 — no subagent).** Master steps 5+7: the read path. Reads route on metadata + the spike-validated classifier, trust filtering happens at the SQL layer in ONE place, and what 06-04 quarantined provably cannot reach a gated task's context through default recall.

## What closed

- **`classify-read.ts`** — `classifyQuery()`: routing_rules `memory.classify` lookup (enabled, priority desc — missing row throws fail-closed, kernel policy discipline, T-06-16) → `llmCall` with the spike prompt VERBATIM (department `os`, maxTokens 400 per litellm.md pitfall) → strict-JSON parse; any non-strict output, unknown store/kind, or a store/kind pair off the LOCKED `KIND_STORE` composition throws `ClassifyParseError` — no silent fallback store. `recallMemory()`: kind given → `KIND_STORE[kind]`, classifier skipped entirely; store readers registry (pgvector → `llmEmbed(query)` + `cosineSearch`; obsidian → `liveMemoryFilter` index query + existence-checked file read, broken ref = loud error + audit `memory_ref_broken`; graphify/notebook → `StoreNotWiredError` until 06-06 — loud, never silently empty); trust default `trusted` excluded at the SQL layer via the 06-03 shared filter builder (`trustTier: null` widens for include-quarantined); limit clamp 1..20 via `RecallInput.parse`; `include-quarantined` appends audit `quarantined_recall` `{query, returned_ids, caller}` in the same call.
- **`memory_recall` MCP tool** — `RecallInput.shape` verbatim (trusted default visible in the tool schema), response = rows + `classifier_used` boolean (observability: did the cheap model fire). Agent memory surface now EXACTLY two tools: `memory_recall` + `memory_commit` (MEM-02 complete); promote still deliberately absent; stores never addressed directly.
- **`recall.test.ts`** — behaviors (a)–(f) all asserted deterministically (injected classifier/embedder/judges): (a) kind given → classifier spy zero calls; (b) trusted default hides the quarantined row; (c) include-quarantined returns both tiers + audit row with exact `returned_ids`; (d) superseded + expired rows excluded from BOTH modes; (e) routing row disabled inside a rolled-back transaction → `classifyQuery` throws fail-closed; (f) contradiction follow-through: X=A trusted → X=B flagged → `dxb promote` → recall returns **eu-central-1, not eu-west-1** (master step 6 retrieval clause closed).
- **`poisoning.test.ts` recall half** — default recall aimed straight at the poison's own vector returns zero poisoned ids; a worker-style context assembly (runWorkerOnce prompt-build mirror + recalled trusted memory concatenated) proven string-level to NOT contain `sk-FAKE-POISON`; include-quarantined path shows the row IS reachable explicitly and leaves the `quarantined_recall` audit trail — the quarantine is a gate, not a black hole. Gate criterion 1 closed end-to-end (write half 06-04 + read half here).

## Prompt byte-diff proof (verbatim-lift contract)

sha256 of the `CLASSIFY_SYSTEM_PROMPT` template-literal content, extracted from both files by the same regex:

```
spike  : 2eeccfde17360711e46a0c6c96ba181b1c6bc852fb69e9500159eb5a8cda7290
lifted : 2eeccfde17360711e46a0c6c96ba181b1c6bc852fb69e9500159eb5a8cda7290
PROMPT_BYTE_IDENTICAL
```

Matches the pinned hash in `spikes/06-routing.md` ("Prompt version") — 06-02 lifted, not re-invented.

## Decisive evidence (executed)

- ✓ Build + exports: `pnpm build` (tsc --build) clean → `READ_OK` (classifyQuery + recallMemory functions on dist index)
- ✓ No model literal on the read path: `! grep -qn "glm" classify-read.ts` → `NO_MODEL_LITERAL`
- ✓ Tool surface: `grep -c "registerTool" groups/memory.ts` → exactly `2` → `SURFACE_2_TOOLS`
- ✓ Deterministic suites: `vitest run recall.test.ts poisoning.test.ts` → `Tests 14 passed | 1 skipped (15)` (recall 7|1 live-skipped, poisoning 8 — 5 write-half + 3 recall-half)
- ✓ **LIVE recorded run** (`DXB_LIVE_SDK=1`, real glm-5.2 classifier + real embed-small): seeded fact "recall spike marker … is 424242" → `classifier_used: true`, row id `39ce66f6-e3ad-4a36-b738-0817b70846a1` returned — `1 passed`, 3.5s
- ✓ Full regression: `pnpm vitest run` → `Test Files 20 passed (20)`, `Tests 93 passed | 13 skipped (106)` (was 84|12 at 06-04 — +9 new passing, +1 gated live)

## Live recall sample (recorded)

```
live recall result: {
 "classifier_used": true,
 "rows": [
  { "id": "39ce66f6-e3ad-4a36-b738-0817b70846a1",
    "body": "the recall spike marker for recall-test-f5aff917 is 424242" }
 ]
}
```

## Design decisions recorded (Fable, CEO-visible)

1. **Classifier pair-consistency check:** the spike scored `store` only; production additionally rejects a `{store, kind}` pair that disagrees with the LOCKED `KIND_STORE` composition — an inconsistent pair is a strict-parse failure (loud), never a coin-flip between the two fields.
2. **`caller` rides in deps, not RecallInput:** the LOCKED master §3 RecallInput schema has no caller field, but the audit rows need an actor — `recallMemory(db, input, {caller})`, MCP surface passes `mcp:memory_recall`, default `memory-router`. Schema untouched.
3. **Quarantined-recall audit uses the returned ids, post-fetch:** the audit row records exactly what left the door (`returned_ids`), written in the same call, actor = caller.
4. **Obsidian recall is metadata-ordered (created_at desc), not semantic** — artifacts have no embeddings until/unless a later phase adds them; the card contract (whole-note retrieval) is honored as-is.

## Downstream contracts armed

- `STORE_READERS` graphify/notebook seams → **06-06** replaces with real readByRef adapters (same registry shape as the write side)
- `classifier_used` observability field → Phase 8 dashboard can plot classifier fire-rate vs kind-given calls
- `memory_ref_broken` audit action → 06-08 compaction/hygiene can sweep broken refs
