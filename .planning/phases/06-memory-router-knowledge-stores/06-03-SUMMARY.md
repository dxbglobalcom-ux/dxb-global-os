---
phase: 06-memory-router-knowledge-stores
plan: 03
status: complete
completed: 2026-07-09
duration: ~25min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-03): memory_embeddings + llmEmbed + pgvector adapter — live round-trip green"
---

# 06-03 SUMMARY — memory_embeddings migration + llmEmbed + pgvector adapter

**Executed inline by Fable 5 (governance v5 — no subagent).** Master PHASE-06 step 3: the semantic store is real — schema, the ONE embedding surface, and the adapter 06-04/06-05 stand on.

## What closed

- **Migration `20260709000010_memory_embeddings.sql`** — vector extension + `memory_embeddings` (FK `index_id → memory_index.id`) + hnsw cosine index + RLS enabled (no policies, parent posture). SQL core byte-faithful to master §3.
- **`MemoryEmbeddingsTable`** registered in db-types (pgvector transports as string through kysely/pg).
- **`llmEmbed()` in shared/litellm.ts** — `/embeddings` via proxyFetch + department virtual key; defensive parse (count match, index-ordered, loud LiteLLMError); batch bounds 64 items / 8k chars (T-06-09). No cost_ledger reference (LOCKED single-source cost rule intact — `/embeddings` appears ONLY in litellm.ts, grep NONE elsewhere).
- **`adapters/pgvector.ts`** — `writeEmbedding(trx, …)` (vector literal from Number()-validated floats only, T-06-07) + `cosineSearch(db, …)` ordered by `<=>`, joined to memory_index through **`liveMemoryFilter`** — the shared WHERE contract (superseded IS NULL, expires NULL-or-future, trust default `'trusted'`; explicit `null` opts out for 06-05's include-quarantined path). Written ONCE, exported for 06-04/06-05.

## Decisive evidence (executed)

- ✓ Reset replays clean: `supabase db reset` → `Applying migration 20260709000010_memory_embeddings.sql … Finished`
- ✓ hnsw index: `SELECT count(*) FROM pg_indexes WHERE tablename='memory_embeddings' AND indexdef ILIKE '%hnsw%'` → `1`
- ✓ **Dimension pair** (one source): card `litellm.md:70` "**VECTOR DIMENSION: 1536**" ↔ migration `vector(1536)`; live column `atttypmod` → `1536`
- ✓ Embed surface: `pnpm build` + require check → `EMBED_SURFACE_OK`
- ✓ Live round-trip: `pnpm vitest run tests/phase6/pgvector.test.ts` → `5 passed (5)` — insert→cosine returns the right row first; **FK negative** (`violates foreign key constraint`) and **trusted-filter negative** (quarantined excluded by default, returned only with explicit `trustTier: null`) both asserted; expired-row exclusion asserted (same shared filter)
- ✓ Full suite regression: `pnpm vitest run` → `17 passed (17)`, `76 passed | 11 skipped`

## Post-reset chain (litellm.md card duty — executed)

1. Seed order re-applied: `import-personas` (153/11), `apply-persona-v2` (5/5, missing []), `import-routing-rules` (21/21) — `memory.classify` row back: SQL count → `1`
2. `docker restart dxb_litellm` → `/health/readiness` → `{"status":"healthy","db":"connected"}` (~70s, Prisma schema rebuild)
3. **dxb-os re-minted** (reset wipes virtual keys): keyGenerate 25 EUR/30d, `metadata.department="os"` → `MINT_OK aliases: dxb-os`; value written to gitignored root `.env` only (replace-in-place, never displayed — A8 flow, 06-01 precedent)

## Deviations

1. **[ADAPT — plan-anticipated]** Master names `0009_memory_embeddings.sql`; slot 0009 was consumed by `20260708000009_routing_and_deps.sql`. Filename advances to timestamp slot 10; SQL content unchanged. Numbering-only.
2. **[LOCKED-interpretation — CEO-visible, plan-anticipated]** Master cites the Supabase automatic-embeddings kalıbı (async trigger+queue). Write-policy rule 2 needs the embedding BEFORE the insert decision (contradiction check gates the write), so embedding is computed synchronously inside commitMemory (06-04) via `llmEmbed`. Kalıbın niyeti korunur: embedding mevcut makine içinde, harcama LiteLLM ledger'ında. Documented adaptation, not silent deviation.
3. **[TOOLING]** `supabase` not on PATH → workspace CLI `./node_modules/.bin/supabase`. `pnpm --filter … build` script yok → root `pnpm build` (tsc --build) — plan verify komutlarının eşdeğeri, çıktılar yukarıda.
4. **[ENV]** `LITELLM_MASTER_KEY` root `.env`'de değil, vaulted `vps/litellm/.env`'de — mint script'i runtime'da ikinci `--env-file` ile yükledi (tool-read yok, A8 uyumlu).

## Downstream contracts armed

- `liveMemoryFilter` + `cosineSearch` → **06-04** contradiction check (cosine ≥0.85 candidate lookup) and **06-05** recall reuse the SAME WHERE contract — do not re-write it inline
- `llmEmbed` = the only embedding path; callers pass alias `embed-small` from config, surface stays model-agnostic
- Post-reset sequence (seeds + litellm restart + re-mint) now proven end-to-end — 06-08 compaction/battery inherits it
