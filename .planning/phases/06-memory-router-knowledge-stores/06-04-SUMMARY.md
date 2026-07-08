---
phase: 06-memory-router-knowledge-stores
plan: 04
status: complete
completed: 2026-07-09
duration: ~35min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-04): single write door — write-policy LOCKED rules, memory_commit, dxb promote"
---

# 06-04 SUMMARY — write-policy + memory.commit + CLI-only promote

**Executed inline by Fable 5 (governance v5 — no subagent).** Master steps 4+6: one door into memory with quarantine and contradiction teeth; promotion physically absent from the agent tool surface.

## What closed

- **`write-policy.ts`** — `commitMemory()` enforcing the LOCKED rule order 1→2→4(+5 data): origin ∈ {web,email,video} → quarantined without exception; facts embed → cosine ≥0.85 vs trusted → cheap-model "contradicts?" (model from `routing_rules memory.classify`, no literal) → flag; ONE transaction = memory_index row + physical store write + audit. `KIND_STORE` = spike-confirmed composition (fact→pgvector, relation→graphify, artifact→obsidian, procedure→notebook). graphify/notebook → `StoreNotWiredError` BEFORE any row (no silent success; wired 06-06).
- **`adapters/obsidian.ts`** — `memory-store/<kind>/<indexId>.md`, card frontmatter contract (id/kind/trust_tier/provenance/created_at), JSON-serialized values (YAML-safe), uuid-validated path join, `wx` no-overwrite. `memory-store/` gitignored.
- **`memory_commit` MCP tool** — real, `CommitInput.shape` verbatim; `memory_route` stub retired; **no memory_promote tool** (grep: only the deliberate absence comments). Phase-3 stub probe moved to `dashboard_feed` (stub until Phase 8); 8-group + ≥17-tool assertions still true.
- **`dxb promote <index-id>`** — CLI-only (rule 3, LOCKED): judgment model from `routing_rules memory.promote` row (L2 sonnet-5 subscription high — seeded, importer run), SDK pattern from classify.ts (SDK_MODEL_IDS, json_schema output, maxTurns 4, subscription-mode guard); supersede → old.`superseded_by`=new + new trusted + meta resolved + audit `memory_promoted`; decline → audit `memory_promotion_declined`, stays quarantined. NEVER deletes.

## Decisive evidence (executed)

- ✓ Door: `pnpm build` + export check → `DOOR_OK` (and raw writers NOT exported from index — T-06-12 guard in the same check)
- ✓ Routing row: importer `inserted 1 / total 22`; SQL count memory.promote=sonnet-5 enabled → `1`
- ✓ CLI: `node tools/dxb-cli/dist/index.js` usage → `promote <index-id>`; MCP grep → `NO_MCP_PROMOTE`
- ✓ Phase-3 lifecycle suite (probe on dashboard_): `5 passed (5)`
- ✓ Write-side tests: `poisoning 5 passed` + `contradiction 3 passed | 1 skipped` — poisoning commit (`sk-FAKE-POISON`, origin web, confidence 1.0) lands **quarantined** with audit; obsidian note frontmatter carries `trust_tier: "quarantined"`; StoreNotWired negative; atomicity negative (failing adapter → zero orphan rows, zero orphan bodies)
- ✓ Contradiction chain end-to-end deterministic: flagged (quarantined + `provenance.meta.contradicts=<old>` + audit `contradiction_flagged`) → promote → `old.superseded_by=new`, new trusted, meta resolved, audit `memory_promoted`; decline path + trusted-row rejection asserted
- ✓ **LIVE recorded run** (`DXB_LIVE_SDK=1`, real embed-small + real glm-5.2 judge): "budget ceiling 150 EUR" vs "900 EUR" → `trust_tier: "quarantined"`, `contradicts: caec2da0…` — `4 passed (4)`, 14.6s
- ✓ Full regression: `pnpm vitest run` → `19 passed (19)`, `84 passed | 12 skipped`

## Schema diff (CommitInput/RecallInput vs master §3)

Runtime introspection: top keys `facts,artifact,provenance`; facts item `body,kind,confidence`; provenance `agent,task_id,origin,source`; origin enum `agent|ceo|web|email|video` — **field-for-field identical, zero diff**. RecallInput carried verbatim (consumed at 06-05).

## MCP surface before/after

| | before | after |
|---|---|---|
| memory group | `memory_route` (stub, errors cleanly) | `memory_commit` (real, single write door) |
| promote | — | **deliberately absent** (CLI-only, T-06-11) |
| stub probe (phase-3 suite) | memory_route | `dashboard_feed` (stub until Phase 8) |
| invariants | 8 groups, ≥17 tools | unchanged (swap is 1-for-1) |

## Design decisions recorded (Fable, CEO-visible)

1. **meta placement:** LOCKED memory_index schema has no `meta` column — contradiction markers ride inside the `provenance` jsonb under a reserved `meta` key (`{contradicts}` → promote rewrites to `{contradicts_resolved}`). No schema change, no migration churn.
2. **`memory-store/` gitignored:** router-written notes are runtime data — vault-visible locally, never auto-committed (GSD commit discipline stays clean); durability = disk + memory_index + audit; VPS backup at Phase 7. STACK's "git-versioned vault" stays true for authored notes.
3. **Judge fail-closed:** unparseable "contradicts?" output counts as contradicts=true → content stays quarantined (T-06-10 direction).
4. **artifact.path** is preserved as `provenance.artifact_path` (physical location is the card's fixed `memory-store/artifact/<id>.md` contract).
5. **Rules 1+2 run BEFORE the transaction** (LLM calls must not hold a tx open); rule 4's transaction covers index+store+audit exactly.

## Downstream contracts armed

- `RecallInput` + `liveMemoryFilter` + quarantine fixtures → **06-05** recall (poisoning recall-half extends `poisoning.test.ts`)
- `StoreNotWiredError` seams → **06-06** replaces graphify/notebook registry entries with real adapters
- TTL data half written (fact 180d) → **06-08** compaction cron marks expired rows superseded
