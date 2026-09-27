# Jev / TypeSafe AI — Community GitHub Ecosystem

- Source type: COMMUNITY (Tier 3), with some entries qualifying as **independent implementations** (Tier 2)
- Fetched: 2026-09-23 via `gh api search/repositories -q "jev typesafe"`
- Context: TypeSafe AI's public launch appears to be very recent (~2026-09-15/16 per multiple sources); this ecosystem — dozens of repos, several with hundreds to thousands of stars — formed within roughly one week, indicating rapid community uptake. **Star counts are a snapshot at fetch time, not validated for authenticity (no bot/star-farming check was performed).**

## Curated "awesome-jev" lists (≥9 independent, competing lists found)

A striking pattern: at least nine different people independently created "awesome-jev"-style curated lists within days of launch — a strong (if informal) signal of real developer interest, but also fragmentation (no single canonical community resource yet).

| Repo | Stars | Note |
|---|---|---|
| `Anil-matcha/awesome-jev-by-typesafe` | 817 | "Evidence-backed use cases, patterns, prompts, starter code" |
| `AbdelStark/awesome-typesafe-jev` | 493 | "Source-backed field guide... independent evaluations" |
| `yibie/awesome-jev` | 1,449 | Highest-starred general list |
| `valentynkit/awesome-jev-typesafe` | 131 | |
| `AnotiaWang/awesome-jev` | 327 | |
| `cobanov/awesome-jev` | 368 | |
| `heyjunpenn/awesome-jev` | 741 | Claims "verified, community-maintained catalog of 834 open-source projects" |
| `hellogumbo/awesome-jev` | 163 | |
| `fatwang2/awesome-jev` | 201 | Includes "a reusable Jev-only GitHub review workflow" |
| `v-modal/awesome-jev-tools` | 680 | Tools-focused variant |
| `kraayenjon/awesome-jev` | 123 | |

**DXB note:** `heyjunpenn/awesome-jev`'s claimed count of 834 projects (if accurate) would make this one of the fastest-growing developer ecosystems around a single model launch observed in this research pass — but the claim itself is UNVERIFIED (not independently recounted in this pass).

## Independent open-source reproductions / competitors ("is Jev replicable without TypeSafe?")

This is the single most DXB-relevant category — it directly answers "does DXB need TypeSafe specifically, or can the same capability be self-hosted?"

| Repo | Stars | Description | Classification |
|---|---|---|---|
| `TheoLeeCJ/SemIf-OpenJev` | 4,046 | "Semantic ifs from open models, on a 3090 at home. Independent; not affiliated with Jev or TypeSafe." | Independent reproduction — **highest-starred single repo found in this entire corpus**, exceeding TypeSafe's own `skills` repo (1,986★) |
| `wfzyx/von` | 553 | "The open-source System One decision model. Sub-15ms, non-autoregressive, local drop-in alternative to TypeSafe Jev." | Independent reproduction, explicit latency claim (sub-15ms local vs. Jev's own stated 70-500ms cloud) |
| `Heman10x-NGU/openJev-verdict-2.0` | 276 | "Calibrated 151M Non-Autoregressive Decision Engine beating TypeSafe Jev & Laya on LocalLLaMA/typed-decisions (77.10% acc, 0.0636 Brier, 0.0144 ECE)" | Independent reproduction with a **published quantitative benchmark claim** (Brier score, ECE — proper calibration metrics) — highest-value independent benchmark found; **not yet independently reproduced by a third party in this corpus — treat as COMMUNITY CLAIM pending cross-check** |
| `r-ms/mini-jev` | — (see negative-evidence file) | "TypeSafe's Jev implemented on top of an LLM locally" | Independent reproduction (LLM-wrapper approach, not a from-scratch model) |
| `ikermoel/open-alternative-jev` | — | "Open alternative to TypeSafe's Jev, running locally on your own GPU" | Independent reproduction |
| `zefan-cai.github.io/open-jev` (site, not a plain repo) | — | Referenced in `videos/` notes as a Qwen-based reproduction | Independent reproduction |
| `huggingface.co/AlexWortega/openjev` | — | Hugging Face model reproduction | Independent reproduction |
| **"Laya"** (see `04_CONFLICTS.md` and video V9) | — | Original developer's own prior solution, open-sourced in response to Jev's launch, claimed to predate Jev by ~1 year | Prior-art / prior-work, now open — **the single most important negative/competitive data point in this corpus** |

**Reading across these ~7 independent reproduction efforts**: the recurring pattern is (a) small/frozen open models (Qwen-4B class) reading option log-probabilities in a single forward pass, requiring no new training, runnable on a single consumer GPU (RTX 3090 mentioned twice); (b) explicit "local, not cloud" and "not affiliated with TypeSafe" framing in nearly every README; (c) at least one (`openJev-verdict-2.0`) makes a specific superiority benchmark claim against both Jev and Laya. This is a strong, multi-source signal that Jev's core capability — constrained/typed decisions with calibrated confidence from small models — is **not architecturally exclusive to TypeSafe**, though none of these have TypeSafe's scale, training investment, or (claimed) calibration quality independently verified against them.

## Production / integration examples (real-world usage signals, Tier 3 unless noted)

| Repo | Description |
|---|---|
| `jkudish/jev-mcp` | "Fast, cheap, typed judgments from TypeSafe's Jev model, as MCP tools" — direct relevance to DXB's own MCP-based architecture |
| `itsmostafa/typesafe-mcp` | Another MCP connector for Jev |
| `jkudish/jev-browser` | Browser-use agent powered by Jev |
| `moritzkremb/jev-voice-browser` | Voice-controlled browser automation, Jev decides intent+target in ~300ms per spoken word |
| `0xNatoshi/jev-codex-router` | Per-turn model/reasoning-depth router for Codex, driven by Jev — **directly analogous to DXB's own model-routing needs** |
| `devagrawal09/jev-review` | Staged code-review workflow + local dashboard |
| `superagents-lab/jev-search` | Web search: source selection, query understanding, relevance ranking |
| `realZachi/pg-jev` | PostgreSQL extension — natural-language queries over tables |
| `RomanSlack/jev-drone` | Camera-only autonomous drone control loop at 2.5Hz using Jev as the judgment model |
| `fhshaik/typesafe-mario` | Jev agent playing Super Mario Bros. from structured emulator state |
| `jexp/neo4jev` | Neo4j graph navigation via Jev classification over neighboring relationships |
| `mrnugget/jev-shell-history` | Zsh history autosuggestions ranked by Jev |
| `kevinbadi/jev-voice` | Local voice-to-macOS-automation pipeline, one Jev call per command |
| `thruwire/foreman` | "Software factory foreman" built on Jev |
| `aowang-ai/jev-trade` | Live Jev-driven trading bot on Hyperliquid (a crypto derivatives exchange) — **notable production risk signal**: real-money automated trading built on a ~1-week-old early-access model within days of launch |

**DXB relevance:** the router (`jev-codex-router`) and MCP (`jev-mcp`, `typesafe-mcp`) repos are the closest existing analogues to DXB's own likely integration shape (agent/model routing via MCP tools) — see `06_DXB_RELEVANCE_MAP.md`.
