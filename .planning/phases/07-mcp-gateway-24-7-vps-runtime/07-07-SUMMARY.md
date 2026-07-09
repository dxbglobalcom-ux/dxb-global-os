# 07-07 SUMMARY — video-learn ingest (VID-01, master step 10)

**Status:** COMPLETE — deterministic battery + LIVE e2e + CLI both commands, all executed 2026-07-09.
**Executor:** Fable 5, inline (no subagents). Plan approved with 6 CEO additional requirements at the approval round; all six landed (table below).
**Commits:** `886bb0c` (pipeline + tests + seed + aliases), + this closure commit.

## What shipped

`tools/video-learn` (@dxb/video-learn): `ingestVideo(url, opts, deps)` — yt-dlp (card-verbatim argv) → Speaches STT → dept classify → structured generate → mode-based CEO explanation → one `commitMemory` artifact row PER SECTION, origin 'video' (write-policy rule 1 quarantines everything). CLI: `pnpm video-learn ingest <url> [--department] [--mode]` and `pnpm video-learn ask <video_id> "<q>"`. Routing seed +4 rows (`video.classify` glm-5.2 L4, `video.summarize` sonnet-5 L2, `video.explain` **fable-5 L1** + opus-4.8 fallback). LiteLLM aliases `sonnet-5`/`opus-4.8`/`fable-5` (OpenRouter slugs live-verified).

## CEO requirements (approval round) — all ✓

| Req | Where |
|---|---|
| 1. Multiple artifacts (transcript, prose summary, executive, detailed explanation, concepts, actions, metadata) | separate `commitMemory` calls: `video/<id>/{transcript,summary,executive,explanation-<mode>,concepts,actions}.md`; metadata in front-matter of every body |
| 2. Output modes short/detailed/eli5/examples/action | `MODE_PROMPTS` in generate.ts; `--mode` flag; proven live with `examples` and in tests with `eli5` |
| 3. Dept inferred from content, unsure→research, NEVER ops | `classifyDepartment` fixed set + fail-open-to-research; test proves garbage/unknown → research; live: "Me at the zoo" → research ✓ |
| 4. Highest tier for CEO-facing explanation | **finding: `anthropic/claude-fable-5` IS live on OpenRouter** — `video.explain` routes to fable-5 (L1); live run used it (SpendLogs) |
| 5. Raw transcript stored separately from explanations | transcript.md row ≠ explanation row (test asserts different index ids); `ask` reads exact transcript evidence |
| 6. Ergonomic CLI | both commands live-proven below |

## Evidence (executed)

- **Deterministic battery:** `pnpm vitest run tests/phase7/video-ingest.test.ts` → **6/6** (quarantine excluded by trusted recall / found by include-quarantined; dead-STT → ZERO rows; unparseable generator → loud reject; URL single-argv + guard flags; dept fallback; eli5 path). Full regression **28 files / 136 passed**.
- **LIVE e2e (real chain):** `LIVE_INGEST_OK jNQXAC9IVRw research transcript:2986725f summary:9a3b9fa7 executive:b33f6acd explanation-detailed:93f5b4fd concepts:9183c0ba concepts:83eb6517` — 7/7 incl. live (56s).
- **CLI live:** `INGESTED jNQXAC9IVRw — "Me at the zoo" / department: research / mode: examples` + 7 quarantined rows (persisted — first real video in company memory); `ask jNQXAC9IVRw "Bu videoyu örneklerle anlat"` → Turkish examples-based answer with the mandatory `⚠ kaynak karantinalı` caveat, grounded in stored transcript.
- **Speaches on-demand + RAM (master table):** VPS voice profile started for the run; real STT 15s for the 19s video; `docker stats` peak **1.373GiB / 1.5GiB** (expectation 1–1.5GB ✓); profile **stopped** after (`dxb-speaches-1 Stopped`), VPS back to 2.7/7.75GB.
- **Model spend (SpendLogs, run window):** fable-5 3 calls €0.156, sonnet-5 2 calls €0.011, glm-5.2 2 calls €0.001, embeddings ~0. ≈ €0.06–0.08 per video at this length class; explain stage dominates (CEO chose quality over cost for req 4).
- **Secrets discipline:** live runs used ephemeral virtual keys (`dxb-os-live0707{,b,c}`, max_budget 2, value never displayed) — minted for the run, **deleted after** (`DELETED` ×3). No .env was read (A8 deny respected; classifier denials honored, no bypass).

## Deviations / findings (recorded, visible)

1. Routing seed real path `packages/kernel/policy/routing-seed.json` (plan frontmatter said `db/seeds/`).
2. sonnet-5 / opus-4.8 / fable-5 ride mode `api` via OpenRouter — subscription path unreachable from pipeline code; master's model classes preserved.
3. **Plan assumption overturned in CEO's favor:** Fable IS reachable via API (`anthropic/claude-fable-5` on OpenRouter) — `video.explain` primary = fable-5, not the planned opus-4.8 (which stays as priority-5 fallback row).
4. STT model default `Systran/faster-whisper-small` verified against live speaches `/v1/registry` (470 models).
5. Scope grew by CEO instruction at approval (single-summary → multi-artifact + modes + dept routing + CLI); this SUMMARY records it.
6. `concepts` emits 1 artifact + N fact rows (one per key concept) from the same commit call — fact rows land in pgvector for later recall, also quarantined.
7. Live e2e ran under the 'os' attribution fallback (dept virtual keys for the 9 routing departments don't exist yet — key inventory pinned at 07-06 for 07-08/Phase 8); fallback printed loudly by CLI.

## ⚠ UNVERIFIED / carried

| Item | Why | Unblock |
|---|---|---|
| VPS-side ingest entry | yt-dlp binary not on VPS; v1 runs on laptop / Phase-8 dashboard decides the entry point | Phase 8 |
| Long-video behavior at low OpenRouter credit | 19s video fits under the 16k prompt cap; a 30-min video's transcript may 402 | CEO credit top-up (existing open item) |

## Requirement

**VID-01: PROVEN LIVE.** CEO drops a link → downloaded, transcribed (on-demand Speaches within RAM budget), classified, summarized, explained (fable-5), filed as separate quarantined provenance-tagged rows through the single door — and queryable back (`ask`) with exact-transcript grounding.
