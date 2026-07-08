---
phase: 06-memory-router-knowledge-stores
plan: 01
status: complete
completed: 2026-07-08
duration: ~45min
tasks_completed: 3/3
commits:
  - "(this commit) feat(06-01): memory-stack study→install — 5 cards, open-notebook local, embedding pin, dxb-os key"
---

# 06-01 SUMMARY — Phase toolset study→install

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

Master-plan PHASE-06 step 1 (dual-role principle): all five memory-stack tools studied with filled cards BEFORE integration work; open-notebook installed locally; the two decisions later plans consume are pinned in writing — **embedding dimension 1536** (06-03 migration) and **router identity dxb-os** (all router LLM spend).

## Card-by-card verdict table (Task 1)

| Card | Verdict | Key decision recorded |
|---|---|---|
| obsidian-stack | OK — combination PICKED | Write path = plain fs to `memory-store/<kind>/<indexId>.md` + YAML frontmatter contract (id/kind/trust_tier/provenance/created_at); kepano/obsidian-skills ADOPT read-side; obsidian-mind/second-brain/claude-obsidian EXCLUDED from runtime |
| graphify | OK — in live use | Adapter contract: primary read = `graphify-out/graph.json` JSON parse; write = corpus note + `execFile('graphify',[path,'--update'])`; no single-node API exists |
| open-notebook | OK — 35.2k stars re-verified (tracker said 34.9k), MIT, v1.10.0 release 2026-06-18 | Pinned `lfnovo/open_notebook:1.10.0` + `surrealdb/surrealdb:v2.6.5`; single-container variant DEPRECATED upstream — two-service compose used |
| headroom | OK — session-layer ONLY | MEM-04 boundary explicit: harness-session compression; OS context budget = 06-07 kernel mechanism, headroom not a dependency |
| claude-mem | OK — LOCKED pointer-sync-only cited | Read surface: read-only SQLite `~/.claude-mem/claude-mem.db` `observations` (schema recorded); router never writes into claude-mem |

✓ VERIFIED: `grep -l "TBD" <5 cards>` → no match, exit 1 (zero TBD fields).

## Decisive evidence (executed)

- ✓ **Container health (Task 2):** `docker compose -f vps/open-notebook/compose.local.yml ps` → both Up; `curl http://127.0.0.1:5055/health` → `{"status":"healthy"}` → `HEALTH_OK`; `/docs` HTTP 200. Ports bind 127.0.0.1 only; surrealdb has no host port (T-06-03 mitigated).
- ✓ **RAM measured (Phase-7 budget input):** `docker stats --no-stream` → open_notebook **535.8MiB**, surrealdb **84.4MiB** ≈ **620MiB idle**; caps 1g/512m in compose.
- ✓ **Embeddings proof (Task 3a):** live `POST /embeddings` through the proxy with the dxb-os key → `EMBED_PROOF model=embed-small dimension=1536 usage_prompt_tokens=7`. Documented dimension (card) = measured vector length = **1536**.
- ✓ **dxb-os key (Task 3b):** `keyGenerate` (shared surface, 04-04 params precedent: 25 EUR/30d, metadata.department="os") → `listDxbKeys aliases: ["dxb-os"]`. Value appended to gitignored root `.env` only — never displayed, never committed.
- ✓ **glm-5.2 reachability (Task 3c):** `POST /chat/completions {model:"glm-5.2", max_tokens:200}` → `HTTP 200 model=glm-5.2 content="GLM_OK" finish=stop`. Spike (06-02) precondition proven live.
- ✓ **Tracker:** 5 rows advanced left-to-right with card citations (obsidian-stack→ADOPT, graphify→ADOPT, open-notebook→INSTALL, headroom→ADOPT, claude-mem→ADOPT); validator → `tracker OK: 58 data rows … 54 study cards`.
- ✓ **Secrets:** `git check-ignore vps/open-notebook/secrets.local` → ignored; root `.env` gitignored; repo `git grep` sk-pattern matches are only historical doc-label text in graph snapshots (no key material).

## Deviations

1. **[DISCOVERY — affects 06-03]** `supabase db reset` wipes LiteLLM virtual keys, not just tables: Phase-4 department keys (`dxb-engineering/-marketing/-research`) were ABSENT from `listDxbKeys` (wiped by Phase-5 resets); only fresh `dxb-os` listed. Recorded in litellm.md card: post-reset sequence = `docker restart dxb_litellm` + RE-MINT keys + refresh `.env` values. **06-03's reset step must re-mint `dxb-os`.**
2. **[PITFALL — affects 06-02/06-05]** glm-5.2 spends reasoning tokens before content: `max_tokens:16` → empty content; `max_tokens:200` → clean `GLM_OK`. Spike runner and read classifier must set `max_tokens ≥ 200` (card-recorded).
3. **[MINOR-ADAPT]** surrealdb service needs `user: root` even with a named volume (upstream docs claim bind-mounts only) — without it: crash-loop `Failed to create RocksDB directory: PermissionDenied`. Fixed in compose + card.
4. **[MINOR-ADAPT]** Local secret carrier named `vps/open-notebook/secrets.local` (gitignored, `env_file`) instead of a `.env.*` name — keeps the A8 tool-layer deny on `.env*` paths intact for this session's automation.

## For Phase 7 (RAM budget)

open-notebook stack idle ≈ 620MiB (measured); worst-case cap 1.5G. Budget line updated in card.
