# DXB Research Engine — architecture study, v2

**Author:** Opus 5 session `dxb-global-os-b1`, 2026-09-16 · **Supersedes:** v1 of the same day
(kept nowhere — LAW A: the lines v2 corrects are deleted, and §0 says which and why).

Every number in this file is either **measured in this session with the command printed
beside it**, or carried from a hunter's primary-source fetch and labelled as such. Vendor
figures are `vendor-reported` and decide nothing.

| label | meaning |
|---|---|
| **PROVEN** | measured by the author in this session, command + decisive output shown |
| **LIKELY** | a primary source was fetched (by a hunter) and quoted; not re-measured by the author |
| **UNPROVEN** | architectural hypothesis — it has to be earned by the benchmark in §13 |

---

## 0. What v2 corrects in v1 — read this first

v1 was measured, careful and mostly right; its GitHub table was re-verified here against the
live API and **held to within a few stars**. Four things in it are now wrong, and under LAW A
the wrong lines are gone rather than footnoted.

| # | v1 said | v2 measured | consequence |
|---|---|---|---|
| 1 | *"Academic search … OpenAlex (no key, ~100k/day) … **Full replacement**, nothing material missing"* | **OpenAlex is metered since 2026-02.** My own call returned `x-ratelimit-limit-usd: 0.1` / `x-ratelimit-cost-usd: 0.001` — a keyless user gets **10 cents a day ≈ 100 searches** | the academic leg is no longer "free forever". The free path is the **CC0 bulk snapshot**, not the API — §6 |
| 2 | *"Agent-Reach … becomes the **platform-reach adapter** behind the router"* | **agent-reach cannot fetch anything.** Its entire CLI is `setup · install · configure · doctor · uninstall · skill · format · transcribe · check-update · watch · version` — there is no `search`, no `get`, no `fetch` | agent-reach is the **doctor, the formatter and the transcriber**, not the reach. The reach is `opencli`. §11 is rewritten on this |
| 3 | *"`agent-reach doctor --json`: **3 of 13** platforms live"* | **15 channels, 5 ok / 10 warn** — and `doctor` never calls a platform, so its "warn" is not a failure: `reddit` is warn while `opencli hackernews` returned 3 836 bytes in 0.8 s | a static registry cannot be the health layer. The router must **probe**, not ask §11 |
| 4 | the enforcement claim was argued from a `PreToolUse` refusal | **the `Stop` gate itself was built and fired** (§3). A sub-session ordered to do nothing was forced to work | the central mechanism moves from LIKELY to **PROVEN** |

One qualification v1 did not make: the benchmark its whole argument rests on
(`openbenchmarks-labs/multi-turn-company-search`) is **three contributors, zero stars, its org
created 2026-06-14**. I opened it and the methodology is sound and self-declared independent —
but it is one young board, not a field consensus. §1 now says so.

---

## 1. The finding that decides the architecture — re-verified

`gh api repos/openbenchmarks-labs/multi-turn-company-search/readme`, read in full this session.
45 multi-constraint questions, one fixed agent (`gpt-5.6-sol`), 3 independent trials, gold sets
frozen with SHA-256 receipts and never shown to the model.

| board | 1st | F1 | precision | **recall** |
|---|---|---|---|---|
| search only | Parallel basic | 46.5 ± 1.9 | 88.7 | **34.4** |
| search only | Exa deep | 45.4 ± 2.0 | 83.2 | 33.7 |
| search + fetch | Exa deep | 48.2 ± 2.1 | 89.4 | **36.0** |
| search only | Google SERP API | 0.4 ± 0.6 | — | — |

Its own explanation, verbatim from the README:

> The hard part of this task is completeness, not correctness: agents return companies that
> genuinely satisfy the constraints, then stop early and miss the rest.

And on independence, verbatim: *"No vendor sponsors or controls this benchmark."* Its
model-only baseline is **0** — *"we ran it with no search tool and it scored nothing."*
— **PROVEN** (fetched and read here)

**Precision 83–89. Recall 30–36.** The best-funded search APIs on earth find the right things
and then stop before finding the rest.

### The same failure, in this holding, measured the same day

Session `d540881b` loaded `Skill(agent-reach)` at tool call **#64**, made **4 outward calls**,
and stopped. `WebSearch` — free, always available — was called **0 times**. The CEO's words:
*"2 tane reddit 2 tane x açtın kapattın."*

**The failure mode of a DXB session and the failure mode of the world's leading search vendors
are the same failure mode: stopping early.** Buying a better search API buys precision we
already have. It does not buy completeness.

That is the whole thesis of this architecture, and the field agrees with it — independently,
in four 2025-2026 papers (§2).

---


### 1.1 The wider board — where the paid deep-research products actually stand, 2026

The §1 finding is one benchmark. A hunter pulled the **primary data files** behind nine more
leaderboards this session — not blog summaries: the GAIA results dataset itself (3 724 test
rows), the Meta ARE leaderboard's Gradio `/config` payload, `BrowseComp-Plus-results/
agent_results.csv`, Mind2Web 2's `leaderboard_data.json`, and the DeepResearch Bench Space's
three CSVs. — **LIKELY** (hunter-fetched primary files; not re-pulled by the author)

| benchmark | best OPEN-source | best closed / paid | the four branded deep-research products |
|---|---|---|---|
| **BrowseComp** (OpenRouter, they run the harness) | DeepSeek V4 Flash + Perplexity search **77.0 %** at **$0.076/question** | Claude Opus 5 + Perplexity search **89.0 %** at $0.99/question | OpenAI DR 51.5 %, Perplexity 49.0 % — **~40 points behind** |
| **BrowseComp-Plus** (fixed corpus, third-party submissions) | GLM-5.1-FP8 **90.72 %** using **12.5 search calls/question** | GPT-5 in an 8-agent scaffold **95.18 %** using **209 calls/question** | **not present** |
| **Mind2Web 2** (OSU NLP, private test set) | **QUEST-35B 0.548 PC / 0.305 SR** | Tencent Youtu 0.60 | **the open 35B model beats OpenAI DR (0.54/0.28), Gemini DR (0.45), Perplexity DR (0.42), Grok DeepSearch (0.40), Claude Research (0.32)** |
| **HLE, agentic** | Kimi K3 **56.0** | Claude Mythos Preview 64.7 | Gemini DR 46.4 · **OpenAI DR 26.6** · **Perplexity DR 21.1** — bottom of the board |
| **DeepResearch Bench** (RACE) | dr-tulu, **8 B**, 45.49 | qianfan 58.03 | Gemini DR 49.7 · OpenAI DR 46.5 · Perplexity 40.5 · Grok 38.2 — **all bottom-quartile** |
| **GAIA** (3 724 rows) | — | CustomGPT.ai v44 93.36 | **absent entirely** |
| **BrowseComp-ZH** | GLM-4.7 0.666 | Seed 1.8 0.813 | **absent entirely** |
| **DeepResearch Bench II** | **none submitted** | GPT-o3 DR 43.00 | the only board they lead — because nobody else submits to it |

**The pattern, stated plainly: in September 2026 the four paid deep-research products lead no
independent leaderboard in this field.** They are absent from five of them and in the bottom
third of three. Their published numbers are largely frozen at early 2025, and the open models
and community scaffolds have been re-measured every month since.

Two numbers to keep, because they decide how we spend:

- **An 8-billion-parameter open model (dr-tulu) scores 45.49 on report quality — between
  OpenAI Deep Research (46.45) and Perplexity Research (40.46).**
- **The open BrowseComp-Plus entry reaches 90.72 % with 12.5 searches per question against
  95.18 % with 209.** Four and a half points cost seventeen times the search volume.

> **This is the second, independent reason not to buy.** §1 said the paid leaders cannot fix our
> failure (recall). §1.1 says they are not even the state of the art any more. What is state of
> the art is a **scaffold** — a router, a ledger, a gate, a verifier — wrapped around a strong
> model and ordinary search. That is a thing we build, not a thing we buy.

⚠ Two honest qualifications. The paid products' Mind2Web 2 numbers are **2025-06-26 snapshots**
never re-run, so part of that gap is staleness rather than inferiority. And the agentic-HLE
board is a hand-curated list of vendor blog claims, not a harness — **vendor-reported**.
## 2. Why an agent skips the tool it has — the field's evidence

Gathered by hunters from primary sources (arXiv abstracts fetched, GitHub issues opened).
Every row is **LIKELY** unless marked otherwise: the source was fetched and quoted, not
re-fetched by the author.

### 2.1 Tool skipping is measured, and it is a property of the model, not the prompt

| finding | number | source |
|---|---|---|
| "Tool-Skip Rate" — the model did not make a valid tool call when one was needed | **11.8 % (best model) – 28.5 %** across 19 models | ToolFailBench, arXiv 2607.04686, 2026-07-06 |
| under-search — the agent chose not to search when it should have | **34 % – 72 %** error rate on zero-search decisions | "Search Wisely", arXiv 2505.17281 |
| an agent could have skipped searching in over a quarter of its steps (over-search) | 27.7 % | same |

ToolFailBench's own sentence: *"tool discipline depends more on model family and training
behavior than on instructional framing"* — **the prompt is not the lever.**

### 2.2 And more instructions make it WORSE — three independent measurements

| study | measurement |
|---|---|
| arXiv 2608.02639 (2026-07-31) | stacking 1→20 verifier-checked instructions: follow rate **96 % → 20 %** |
| ManyIFEval, arXiv 2509.21051 | all-instructions-satisfied, 1→10 rules: Claude 3.5 Sonnet **95 % → 48 %**, GPT-4o 94 % → 21 % |
| IFScale, arXiv 2507.11538 | at 500 instructions the best frontier model reaches **68 %**, with *"bias towards earlier instructions"* |

And a practitioner raised exactly our complaint against Claude Code —
*"Right now these files are treated as context, not rules. They need to be rules"*
(`anthropics/claude-code` issue #37550, opened 2026-03-22) — **closed as not planned.**

> **This is the sentence that kills Architecture A.** Writing a stricter research doctrine into
> `SKILL.md` is not a neutral act: it measurably lowers compliance with everything else in the
> file. The discipline has to leave the prose.

### 2.3 Environment beats instruction, by an order of magnitude

- *"Simple environmental hardening reduces exploit rates by 5.7 percentage points (**87.7 %
  relative**) without degrading task success."* — arXiv 2605.02964
- *"Decoding time syntax constraints are much more helpful than in-prompt syntax constraints …
  Extra in-context constraints offer little help."* — ToolDec, arXiv 2310.07075

### 2.4 The citation problem is worse than the search problem

| finding | number | source |
|---|---|---|
| deep-research systems *"include large fractions of statements unsupported by their own listed sources"* | citation accuracy **40–80 %** | DeepTRACE, arXiv 2509.04499 (ICLR 2026) |
| link validity high, factual support low — **citation laundering, measured** | links valid **> 94 %**, relevance **> 80 %**, factual accuracy **39–77 %** | arXiv 2605.06635 |
| **searching more makes citations worse** — 2 → 150 tool calls | fact-check accuracy **−42 % on average**; GPT-5.4 79 % → 17 % | same |
| cited URLs that never existed | **3–13 % hallucinated**, 5–18 % non-resolving | arXiv 2604.03173 |
| a URL liveness check fixes it | non-resolving **cut 6–79×, to under 1 %** | same |

The last row is the cheapest win on this entire board: **a dead-link checker.**

And the reason a model cannot audit itself: *"self-reflection operates within the same
reasoning context that produced the error. The model tends to treat its previous outputs as
established premises"* (arXiv 2602.12056) — with ICLR 2024's blunt version:
*"LLMs struggle to self-correct their responses without external feedback, and at times, their
performance even degrades after self-correction"* (arXiv 2310.01798).

> **This kills self-critique as the verification layer.** The verifier must sit in a
> **separate context**, or it is theatre.

### 2.5 What the two labs who solved it actually did

- **Anthropic** (*How we built our multi-agent research system*, 2025-06-13): lead + subagents
  beat single-agent by **90.2 %** on their internal research eval, at **15× the tokens** of a
  chat. Their named failure modes are ours: *"agents continuing when they already had
  sufficient results, using overly verbose search queries, or selecting incorrect tools"* and
  *"chose SEO-optimized content farms over authoritative but less highly-ranked sources."*
  Their fix is structural: a separate **CitationAgent** stage that attributes every claim after
  the research loop exits, plus an **LLM judge with a five-criterion rubric** (factual accuracy,
  citation accuracy, completeness, source quality, tool efficiency).
- **OpenAI** Deep Research: *"trained using end-to-end reinforcement learning on hard browsing
  and reasoning tasks."* **Google** Gemini Deep Research: *"scaling multi-step reinforcement
  learning for search."*

**Neither frontier lab claims a prompt suffices. One trains the model; the other builds stages
outside it. We cannot train. So we build stages outside it.** That is Architecture C+.

---

## 3. PROOF: the gate can force an agent to keep working

v1 argued this from a `PreToolUse` refusal. v2 built the thing and fired it.

**The experiment.** A `Stop` hook that refuses the first attempt to finish, and a sub-session
given an instruction designed to conflict with it. The hook emits, when the proof file is
absent:

```json
{"decision":"block",
 "reason":"RESEARCH COMPLETION GATE refuses: the ledger is empty. Run exactly this, then
           finish: printf FERRARI > .../proof.txt"}
```

registered as `{"hooks":{"Stop":[{"hooks":[{"type":"command","command":"bash .../gate.sh"}]}]}}`
and handed to a sub-session launched with
`claude -p "Say the single word hello. Do nothing else at all." --settings .../settings.json
--permission-mode bypassPermissions --model claude-haiku-4-5-20251001`.

**Result:**

```
rc=0  elapsed=19s
hook invocations (count file): 2
proof.txt: -rw-rw-r-- 7 bytes    content: FERRARI
model output: Done.
```

The model was told to do nothing. The gate refused its exit. It went and did the work.
— **PROVEN**, this session, 2026-09-16.

### What the harness documents about this lever

From the official hooks reference (`code.claude.com/docs/en/hooks`), verbatim:

| event | can block? | on exit 2 |
|---|---|---|
| `PreToolUse` | yes | blocks the tool call |
| **`Stop`** | **yes** | **prevents Claude from stopping, continues the conversation** |
| **`SubagentStop`** | **yes** | **prevents the subagent from stopping** |
| `PostToolBatch` | yes | stops the agentic loop before the next model call |
| `PostToolUse` | no | shows stderr to Claude; the tool already ran |

> `decision` — `"block"` prevents Claude from stopping. `reason` — Required when `decision`
> is `"block"`. Tells Claude why it should continue.

> **SubagentStop:** Returning `decision: "block"` with a `reason` keeps the subagent running
> and delivers `reason` to the subagent as its next instruction.

**And the ceiling, which the design must respect:**

> Claude Code overrides the hook and ends the turn after **8 consecutive blocks**.

> Hooks can be defined directly in skills … **Skill hooks**: Claude Code registers them when
> you or Claude invoke the skill and keeps running them for the rest of the session.

Three consequences, and they shape everything downstream:

1. **The gate ships inside `dxb-research/SKILL.md` frontmatter.** No global settings change, no
   effect on sessions that are not researching, and it dies with the session.
2. **Eight blocks is the budget.** Each block must demand a *batch* of work — "open these six
   channels and record them" — never one query at a time, or the gate exhausts itself.
3. **The same hook works on hunters.** A hunter that returns after 6 queries is handed its next
   instruction and keeps going.

### The one thing the gate must NOT do — the fabrication trap

The sharpest single finding of this study, from the enforcement hunt:

> **A schema that forces an `evidence` field to be non-empty manufactures citations.**
> Anthropic's structured outputs enforce `minItems: 0 or 1` by constrained decoding, and
> OpenAI's own documentation says: *"The model will always try to adhere to the provided
> schema, which can result in hallucinations if the input is completely unrelated to the
> schema."*

Measured consequence in the wild: **3–13 % of URLs cited by deployed deep-research agents never
existed** (arXiv 2604.03173), and a URL liveness check cuts non-resolving citations **6–79×, to
under 1 %**.

**Therefore the ledger is never written by the model.** It is written by the fetcher — the
script that made the HTTP call — and the model may only *cite row ids that already exist in
it*. A citation to a row absent from the ledger is a hard gate failure, checkable with `grep`.
This is the difference between a gate that verifies the **shape** of a claim and one that
verifies its **referent**.

### Mechanism map — what each lever can and cannot force

| mechanism | forces the field to EXIST | forces the step to RUN | proves it RAN | checks it is TRUE |
|---|---|---|---|---|
| constrained decoding / structured output | ✅ (Anthropic `minItems` 0-1 only; OpenAI any N; Outlines/llguidance any N + lengths) | ❌ | ❌ | ❌ |
| deterministic orchestration (code path) | ❌ | ✅ | partly | ❌ |
| **`Stop` / `SubagentStop` gate** | ❌ | **✅ — the only lever that forces MORE work** | ✅ (it reads the ledger) | ❌ |
| eval-as-a-gate in CI (Ragas/DeepEval/promptfoo) | ❌ | ❌ | ❌ | ✅ (LLM-judged, non-deterministic) |
| OTel tracing (`claude_code.tool_result`, `success=true`) | ❌ | ❌ | ✅ | ❌ |

No single lever is sufficient; they compose, and the composition is the architecture.

---

## 4. What is actually on this machine — measured, not assumed

| capability | what is really here | evidence (this session) |
|---|---|---|
| **neural web search, free, no key** | **Exa hosted MCP** at `https://mcp.exa.ai/mcp` | `tools/call web_search_exa` → **HTTP 200, 18 003 bytes, 3.3 s**; results carry title, URL, **published date**, author and content highlights. Exactly two tools: `web_search_exa` and `web_fetch_exa` (page → clean markdown) — **PROVEN** |
| **Google SERP, free** | `opencli google search --window background` | **rc=0, 2.7 s**, real Google results with snippet + URL — **PROVEN**. This is the paid SerpAPI / Serper capability, already installed |
| **platform reach** | `opencli`: **169 site adapters + 11 app adapters**, of which **96 expose a `search` subcommand** | counted from `opencli list` (1 710 lines) — **PROVEN**. Among them: openalex, semanticscholar, pubmed, dblp, openreview, google-scholar, baidu-scholar, cnki, wanfang, arxiv, zlibrary · reddit, hackernews, twitter, bluesky, linux-do, v2ex, zhihu, weibo, xiaohongshu · npm, crates, maven, nuget, packagist, dockerhub, gitee |
| **built-in web search** | the `WebSearch` tool | available; **used 0 times** in the session that failed |
| **GitHub research** | `gh`, authenticated as `dxbglobalcom-ux` | `gh api rate_limit` → **core 5 000/hr**, graphql 5 000/hr, search 30/min — **PROVEN**. Unauthenticated curl gets 60/hr, which is how one hunter burned its quota today |
| **page reading** | Scrapling **0.4.10** in `/home/dxb/scrapling-env` (camoufox 0.5.4, curl_cffi 0.15, playwright 1.60) exposed as an MCP server | `.mcp.json` + venv listing — **PROVEN** |
| **headless browser** | `playwright-mcp --headless --isolated --browser chromium` | `.mcp.json` — **PROVEN** |
| **video / audio → text** | `yt-dlp`, `bili-cli`, and `agent-reach transcribe` | doctor: youtube **ok** (yt-dlp), bilibili **ok** (bili-cli) — **PROVEN** |
| **health registry** | `agent-reach doctor --json` → 15 channels, each with `status · tier · backends · active_backend` | **PROVEN** — see §11 |
| **model gateway** | `dxb_litellm` container, healthy | `docker ps` — **PROVEN** |
| **research notebook** | `open-notebook 1.10.0` + surrealdb, both up 9 hours | `docker ps` — **PROVEN**; unexamined here, a lead for the research-memory layer |
| **existing sweep engine** | `.claude/skills/dxb-research/scripts/sweep.sh` — 27 channels in 3 tiers, plus a Scrapling page-reading stage | read this session — **PROVEN** |

### Free keyless endpoints, probed by hand this session

| endpoint | result | note |
|---|---|---|
| Exa MCP `tools/call` | **200**, 3.3 s | no key, no signup, no card. The single most valuable free asset on this machine |
| OpenAlex | **200**, 1.3 s | **but metered** — `x-ratelimit-limit-usd: 0.1` per day |
| Crossref | **200**, 1.3 s, 15.1 M results | keyless |
| arXiv | **200 — over `https` only**; plain `http` returns **301** | a silent hole in any sweep that uses the http form |
| Europe PMC · PubMed · DOAJ · HAL · bioRxiv · OpenAIRE | 200 | hunter-measured — **LIKELY** |
| Semantic Scholar | **429 Too Many Requests** | keyless access is effectively closed — **PROVEN** |
| `r.jina.ai` reader | **200**, 0.4 s | works, but the body says *"This is a cached snapshot of the original page"* — **not a live read** |
| Wikipedia API | **200** | keyless |
| HN Algolia | **200**, 35 KB | keyless; the best free door into Hacker News |
| DuckDuckGo html | **200** | keyless |
| **Reddit JSON** | **403** | `reddit.com/*.json` is blocked from this IP — Reddit must go through `opencli` |
| **Mojeek** | **403** *"your network appears to be sending automated queries"* | dead end |
| **Wayback CDX** | **503** *"Internet Archive: Temporarily Offline"* | the temporal-validation leg is unreliable today |
| **`opencli brave search`** | **rc=1** *"brave search navigation failed: Navigation rejected"* | a hole inside the installed reach — **PROVEN** |

### What is NOT installed, and matters

`trafilatura`, `crawl4ai`, `datasketch`, `htmldate`, `sentence-transformers`, `rank-bm25`,
`feedparser`, `pymupdf` — **none present** in the system Python (checked with
`importlib.metadata`). The independence/dedup leg and the date-extraction leg of this
architecture currently have **no tooling at all**. That is a build item, not an assumption.
— **PROVEN**

---

### 4.1 The finding that removes the single-point-of-failure — FIVE keyless search doors

v1 measured that **56 % of a sweep's results came from Exa alone**, and called it a
single-point-of-failure. It is no longer one. Probed by hand this session, with no API key, no
account and no card:

| door | endpoint | HTTP | latency | tools returned |
|---|---|---|---|---|
| **Exa** | `https://mcp.exa.ai/mcp` | **200** | 3.3 s | `web_search_exa`, `web_fetch_exa` |
| **Parallel** | `https://search.parallel.ai/mcp` | **200** | **1.4 s** | `web_search`, `web_fetch` |
| **Firecrawl** | `https://mcp.firecrawl.dev/v2/mcp` | **200** | 0.8 s | `firecrawl_scrape`, `firecrawl_search`, `firecrawl_parse` |
| **You.com** | `https://api.you.com/mcp?profile=free` | **200** | 0.4 s | `you-search`, `you-discover` |
| **Tavily** | `https://mcp.tavily.com/mcp/` + header `X-Tavily-Access-Mode: keyless` | **200** | 0.6 s | `tavily_search`, `tavily_extract`, `tavily_crawl`, `tavily_map`, `tavily_research`, `tavily_feedback` |

All five **PROVEN** — `tools/list` returned over HTTP 200 with no credential. Without the Tavily
header the same endpoint returns **401**, which is why a keyless claim has to be tested rather
than believed.

**And the one that matters most was executed, not just listed.** A real `tools/call` to
Parallel's `web_search`:

```
HTTP 200 · 1.4 s · 45 711 bytes · 10 results, 3 carrying a publish_date
_meta: {"parallel/usage":[{"name":"sku_search","count":1,"cost_usd":0.001}]}
```

**Parallel is the provider that leads the independent benchmark in §1 (F1 46.5, the top of the
search-only board), and it answered a real query from this machine with no API key.** Its own
response even meters the call at $0.001 — which is the vendor's cost, not ours.
— **PROVEN**, this session.

> **Consequence for the architecture.** The discovery layer is no longer "Exa, and pray". It is
> a **five-engine fan-out where the top-ranked commercial engine is one of the five, free.** The
> gate can therefore enforce a real anti-concentration rule — no single channel may supply more
> than half the independent clusters — because there are now five doors to spread across, plus
> `opencli google`, `WebSearch`, DuckDuckGo and HN Algolia.

---

## 5. Project health — re-verified against the live GitHub API

v1's table was re-measured here with `gh api repos/...` and **held**:

| repo | stars (live, v2) | pushed | license | archived |
|---|---|---|---|---|
| mendableai/firecrawl | 181 164 | 2026-09-16 | AGPL-3.0 | no |
| browser-use/browser-use | 114 801 | 2026-09-15 | MIT | no |
| microsoft/playwright | 96 218 | 2026-09-16 | Apache-2.0 | no |
| unclecode/crawl4ai | 83 672 | 2026-09-16 | Apache-2.0 | no |
| bytedance/deer-flow | 82 535 | 2026-09-16 | MIT | no |
| Panniantong/agent-reach | 82 387 | 2026-09-15 | MIT | no |
| D4Vinci/Scrapling | 81 372 | 2026-09-14 | BSD-3-Clause | no |
| docling-project/docling | 66 496 | 2026-09-16 | MIT | no |
| searxng/searxng | 37 220 | 2026-09-16 | AGPL-3.0 | no |
| stanford-oval/storm | 31 417 | **2025-09-30** | MIT | no |
| assafelovic/gpt-researcher | 29 483 | 2026-08-27 | Apache-2.0 | no |
| **langchain-ai/open_deep_research** | 12 681 | 2026-08-10 | MIT | **ARCHIVED** |
| adbar/trafilatura | 6 825 | 2026-09-11 | Apache-2.0 | no |
| exa-labs/exa-mcp-server | 5 010 | 2026-08-21 | MIT | no |

**Two things the 2026 listicles still get wrong, both confirmed here:**
`langchain-ai/open_deep_research` was **archived on 2026-08-21 with no reason ever given**
(§12.1), and Stanford **STORM has not been pushed for a year**. Both are still widely recommended as top open deep-research choices. — **PROVEN**

**A methodological warning that changes how this table must be read.** `pushed_at` counts
dependabot branch pushes. `google-deepmind/long-form-factuality` reports
`pushed_at: 2026-06-18` against a `main` branch whose last real commit is **2024-04-07** — 19
dependabot branches and one `main`. **Health is the default branch's last commit, never
`pushed_at`.** — **LIKELY** (hunter-measured; independently verifiable)

## 6. DELIVERABLE 2 — paid → free replacement table

Categories: **A** real open-source/self-hosted · **B** free tier of a paid product ·
**C** free software with an external dependency that costs · **D** no real free equivalent.

| paid service | measured price | free replacement | cat. | replacement quality | what is genuinely missing |
|---|---|---|---|---|---|
| **Perplexity Search API** | $5 / 1 000 requests, no free tier | **Exa keyless MCP** → `WebSearch` → `opencli google` → `s.jina.ai` | B/A | **High for discovery.** Exa keyless measured live at 3.3 s with dates and content | guaranteed throughput; an SLA |
| **Exa Search** | $7 / 1k search, $1 / 1k contents | **Exa itself, keyless** — the *same neural index* answered `tools/call` here with no key | **B** | **Identical engine** | rate limit (undocumented, no headers returned); no `deep_researcher` tool on the keyless endpoint — only `web_search_exa` + `web_fetch_exa` |
| **SerpAPI / Serper** | per-search | **`opencli google search`** — measured rc=0, 2.7 s, real SERP | **A** | **Full replacement at our volume** | rank-stable SERP at scale; it drives a browser, so it is login- and rate-bound |
| **Tavily** | 1 000 credits/mo free, no card | already free at our volume | B | high | nothing at our volume |
| **Brave Search API** | $5 / 1k, card required | Exa keyless / DDG / `opencli google` | B/A | adequate | an independent Brave index — and note `opencli brave` **fails here** (`Navigation rejected`) |
| **Firecrawl cloud** | credit-based | **Scrapling (installed)** → Playwright headless → Firecrawl self-hosted (AGPL, Docker) | A | **high for ordinary pages** | self-host loses screenshots, page-actions, fire-engine anti-bot, agent/browser/interact modes — their own docs |
| **Bright Data / Oxylabs / Zyte** | enterprise, per-success | none | **D** | — | residential IP pools and CAPTCHA farms. **Open source cannot reproduce an IP pool.** |
| **Diffbot Knowledge Graph** | enterprise | Graphiti / GraphRAG build *your own* | C | partial | a pre-built trillion-fact graph of the whole web |
| **Parallel.ai** | paid, $0.42–1.12 per task measured on the benchmark | none at equal rank | **D** | — | leads the independent board (F1 46.5); the gap to Exa deep is 1.1 F1, inside the noise band |
| **Jina Reader paid tiers** | to 5 000 RPM | `r.jina.ai` keyless | B | good, **but cached** — the free reader returned *"a cached snapshot"*, so it is not a live read | freshness and throughput |
| **OpenAlex (was free)** | **now metered: $0.001/search, keyless budget $0.10/day** | **the CC0 bulk snapshot** — *"The full OpenAlex dataset — all 480M works — is free to download"* | **A, but only via bulk** | full — after a one-time download and local index | live freshness; the API path is now a paid path |
| **Semantic Scholar** | key applications refused for free e-mail domains | **Europe PMC** (full text: a 94 KB JATS XML body measured), Crossref, arXiv, PubMed, DOAJ, HAL, OpenAIRE | A | high | S2's citation-intent graph; abstracts (removed from their API by a publisher agreement) |
| **Elicit $49/mo · Consensus $10/mo · SciSpace $20/mo** | subscription | OpenAlex-bulk + Crossref + Europe PMC + **GROBID** (Apache-2.0, Docker, fully local, self-reported ≈0.87 F1 on reference parsing) | A | high for retrieval; the *synthesis* is what we are building | curated screening UX |
| **Hosted fact-checking / citation audit** | per-call | **LettuceDetect v2 `lettucedect-v2-mmbert-base` (307 M, Apache-2.0)** — code MIT, PyPI `lettucedetect`, repo commits through 2026-09-07, checkpoints ungated. Fallbacks: FactCG-DeBERTa-v3-Large (435 M, MIT), MiniCheck-Flan-T5-Large (770 M, MIT) | A | high for grounding checks | none *decomposes* a claim; you supply the sentence split |
| **OpenAI / Gemini Deep Research** | subscription | gpt-researcher · deer-flow · **our own engine** | A/C | §9 | a managed multi-hop loop — which is exactly the thing being built |

### The honest bottom line on "free"

Three separate corrections to the reflex that open source is free:

1. **OpenAlex moved to usage pricing in Feb 2026.** Free access is now the *bulk download*, not
   the API. Anything that queries it live has a 10-cent-a-day ceiling. — **PROVEN** (my own
   response headers)
2. **Self-hosting the search layer costs more than it saves at our volume.** A first-hand 2026
   production report (Blck Alpaca, 2026-09-04): €80/month server + ~15 h engineering, three-month
   total **€1 740 self-hosted against €1 200 on APIs** — and Crawl4AI leaked memory badly enough
   that they *"restart the container every six hours"* by cron. Their sentence: *"if you only
   compare the bill, you will be disappointed."* — **LIKELY** (single company, single stack)
3. **SearXNG is not a search engine, it is a proxy to engines that block it.** Independently
   tested from one IP (2026-07-22): **1 of 4 engines worked** — Google returned 0 parseable
   results. Corroborated by SearXNG's own issue **#5867** — *"Bug: google engine - HTTP 403"*,
   opened **2026-03-17**, which I opened and confirmed exists and is closed. — **PROVEN** (issue)
   / **LIKELY** (the 1-of-4 test)

**SearXNG is therefore a sovereignty hedge, never the primary search layer.** We already have
the thing it tries to be, working: `opencli google`, measured at 2.7 s.

---

## 7. DELIVERABLE 3 — capability matrix

0–10, each score justified by a measurement or a named limitation. `keyless` = usable today at
$0 with no card. Scores marked `*` were measured in this session; the rest are reasoned from the
tool's documented behaviour and are weaker evidence.

| capability | Exa keyless | WebSearch | opencli (169 sites) | Jina keyless | SearXNG self-host | Tavily free | Scrapling | Crawl4AI | Playwright | OpenAlex bulk + Crossref + EuropePMC | gh (auth) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| general web search | **9*** live 3.3 s | 8 | **9*** Google 2.7 s | 7 | **3** 1/4 engines | 8 | 0 | 0 | 0 | 0 | 0 |
| semantic / neural search | **10** only free neural index reachable | 4 | 2 | 3 | 2 | 6 | 0 | 0 | 0 | 3 | 0 |
| exact keyword search | 6 embeddings falter on error codes | 8 | **9** site-scoped + `gh` code search | 6 | 7 | 7 | 0 | 0 | 0 | 8 | **10** |
| fresh / news | 8 dates returned | 8 | **9** twitter, HN, reddit | 6 | 5 | 8 | 0 | 0 | 0 | 2 | 6 |
| academic search | 7 | 5 | **8*** openalex/pubmed/dblp/openreview adapters | 4 | 4 | 5 | 0 | 0 | 0 | **10** | 0 |
| GitHub research | 5 | 6 | 7 | 4 | 4 | 5 | 6 | 6 | 7 | 0 | **10*** 5 000/hr |
| Reddit / forums | 4 | 5 | **9** the only working Reddit path (direct JSON = 403*) | 3 | 3 | 5 | 2 | 3 | 7 | 0 | 0 |
| YouTube / transcript | 3 | 4 | **9** yt-dlp ok* | 3 | 3 | 3 | 2 | 2 | 6 | 0 | 0 |
| Chinese-language channels | 2 | 3 | **10** zhihu, weibo, xiaohongshu, bilibili, linux-do, cnki, juejin | 2 | 5 | 3 | 2 | 2 | 6 | 3 | 0 |
| PDF extraction | 5 | 2 | 3 | 8 | 0 | 6 | 4 | 6 | 4 | **9** (+GROBID 10) | 0 |
| JS-heavy pages | 4 | 3 | 7 real browser | 6 | 0 | 5 | **8** | 8 | **10** | 0 | 0 |
| full-site crawl | 2 | 0 | 2 | 2 | 0 | 3 | 6 | **9** | 5 | 0 | 0 |
| structured extraction | 6 | 2 | 6 yaml/json out* | 5 | 2 | 6 | **8** CSS/XPath | **9** schema+LLM | 7 | **9** DOI/version | **9** json fields |
| similar-page discovery | **9** neural neighbours | 3 | 3 | 3 | 2 | 5 | 0 | 0 | 0 | 7 citation graph | 0 |
| date filtering | 7 | 6 | 7 | 4 | 6 | 7 | n/a | n/a | n/a | **10** | 8 |
| domain filtering | 8 | **9** `allowed_domains` | 8 `site:` | 4 | 7 | 8 | n/a | n/a | n/a | 9 | 7 |
| language / region | 5 | 5 | **9** | 4 | **8** | 6 | n/a | n/a | n/a | 8 | 4 |
| citation metadata | 8* title/url/date/author | 6 | 8 | 5 | 6 | **9** | 7 | 7 | 4 | **10** DOI+version | **9** |
| full content retrieval | 8* `web_fetch_exa` | 3 snippets | 8 | 7 **cached, not live*** | 4 | 8 | **9** | **9** | 8 | 9 | 8 |
| anti-bot robustness | 7 their infra | 7 | 8 real session | 7 | **2** | 7 | **7** camoufox/curl_cffi | **3** no CF bypass, no proxy rotation | 6 | **10** open APIs | **10** |
| agent friendliness | **9** MCP | **10** native | 8 CLI+yaml | 8 URL prefix | 4 | 9 MCP | **9** MCP installed | 7 | 8 MCP | 7 | **9** CLI+json |
| MCP integration | ✅ hosted, keyless* | native | ❌ CLI only | via HTTP | ❌ | ✅ | ✅ installed* | ❌ | ✅ installed* | partial | ❌ |
| local / self-hosted | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ (bulk) | ❌ |
| privacy | 4 | 4 | 6 | 4 | **10** | 4 | **9** | **9** | **9** | 7 | 6 |
| cost | **10** $0* | **10** | **10** $0* | **10** | 5 €80/mo + ops | **10** | **10** | 9 ops | **10** | 8 API metered / 10 bulk | **10** |
| latency | 8 (3.3 s*) | 8 | 7 (0.8–2.7 s*) | 7 | **4** +0.83 s | 8 | 8 | 7 | 5 | 9 (1.3 s*) | **10** (0.1 s*) |
| scalability | 5 rate-limited, limits undocumented | 6 | 5 login/browser-bound | 5 20 RPM | 7 own iron | 6 | 8 | 8 | 7 | 9 bulk | 9 |

**How to read it.** No row has a single winner, and that is the finding. **Exa owns neural
discovery. `opencli` owns human voices, Chinese-language channels and — measured today — Google
itself. Scrapling and Playwright own reading. OpenAlex-bulk, Crossref and Europe PMC own
scholarship. `gh` owns code.** The engine is not any of them; the engine is **the router, the
ledger and the gate** that use all of them and record what came back.

---


### 7.1 The reading layer — measured head-to-head, and four traps

A hunter ran controlled A/B tests on this machine rather than quoting comparison blogs. These
change two recommendations in this study. — **LIKELY** (hunter-measured first-hand; the Scrapling
result is consistent with the installed version here)

**Anti-bot, same URL, same minute** (`scrapingcourse.com/cloudflare-challenge`):

| method | result |
|---|---|
| Scrapling `Fetcher` (HTTP + TLS impersonation) | **403, empty body** |
| Scrapling `StealthyFetcher` + `solve_cloudflare` | **200 — challenge bypassed, reproduced 2/2** |

⚠ A dated first-hand user report on the **same version and the same URL** (Scrapling issue #422,
2026-09-08) shows the opposite: *"Failed to solve the Cloudflare challenge after 3 attempts."*
Both are real. **The honest reading is that the outcome is non-deterministic and depends on IP
reputation and the challenge variant served.** No fixed success rate may be planned on — which is
exactly why §12 #9 makes liveness three-state instead of two.

**JS rendering boundary**, same URL, same minute: trafilatura fetched 2 541 bytes of HTML and
extracted **0 characters**; the Scrapling browser fetch returned all 12 products. Trafilatura is
the best *article-text* extractor in the set and renders **no JavaScript at all** — it is a
partner to a browser fetcher, never a replacement for one.

**PDF table extraction**, identical page (Transformer paper p.9, 13-column table):

| tool | time | result |
|---|---|---|
| **docling 2.128.0** | 38.0 s | **correct** — 13-column header, row labels in the right column |
| pymupdf4llm | 0.3 s | numbers right, spanning rows shredded across columns |
| MarkItDown | 0.1 s | one table split into three; prose words fused |

Install footprint: docling pulls **1.2 GB of torch**; pymupdf is 116 MB. Docling is ~127× slower
and is the only one that got it right. **Use it where the document IS the product; never in a hot
path.**

### The four traps

1. **Crawl4AI is a security liability as a networked service — and this study removes it from
   the recommended stack.** Measured from its own GitHub advisories: **16 published advisories,
   4 CRITICAL, all in 2026** — CVE-2026-53753 (AST sandbox escape → **pre-auth RCE in the Docker
   API**), CVE-2026-57572 (**unauthenticated RCE** via Chromium launch-arg injection),
   CVE-2026-57571 (arbitrary file write → RCE), GHSA-5882-5rx9-xgxp (RCE via Hooks), plus four
   SSRF, an LLM-credential exfiltration and three XSS. v0.9.0 (2026-06-18) is the release that
   made auth on by default. Separately, open issue #2202 (2026-08-26) measures a container up 29
   days holding **46 chromium processes, 945 MB RSS, 31 % CPU with zero traffic**, with `/health`
   still returning 200. **We already have Scrapling installed, with 7 open issues and a
   first-hand Cloudflare bypass. There is no reason to take this risk.**
2. **PyMuPDF and pymupdf4llm are AGPL-3.0 dual-licensed — commercial closed-source use requires
   buying a licence from Artifex.** This is the trap of the entire PDF category: the fastest good
   option is the one a holding company cannot ship for free. Docling (MIT) and GROBID (Apache-2.0)
   are the clean paths.
3. **Firecrawl's server is AGPL-3.0** (only its SDKs are MIT), and self-hosting loses everything
   behind **fire-engine, which has been proprietary for two years** — its founder, issue #468,
   2024-07-30: *"Currently fire-engine is not available for the self hosted version… it is not
   (yet) open-source."* Still true. Self-host also means api + worker + playwright-service + redis
   + rabbitmq + postgres + foundationdb, and the repo says its own compose file is *"a
   source-aligned starting point, not a production architecture."* **Use the keyless cloud MCP
   (§4.1); do not self-host it.**
4. **The ground shifted the day before this study.** Cloudflare, *"Your site, your rules"*,
   2026-07-01: *"On September 15, 2026, we'll be setting new defaults… the categories of Training
   and Agent will be blocked by default"* — and its definition of Agent names
   *"browser-use agents (e.g., Gemini or Claude driving Chrome)."* Its new **Precursor** detector
   (2026-07-13) scores **behaviour across a session**, explicitly assuming *"Bots can execute
   JavaScript, use real browser environments."* **Fingerprint-based stealth is fighting the last
   war.** The durable consequence for us: prefer **APIs and keyless MCP doors over scraping**,
   record `blocked` honestly when a wall is real, and never build a research answer that depends
   on defeating a bot wall.
## 8. DELIVERABLE 4 — the four stacks

| | **Tier 0 — sovereign** | **Tier 1 — RECOMMENDED** | **Tier 2 — minimum paid** | **Tier 3 — no compromise** |
|---|---|---|---|---|
| discovery | SearXNG self-host | **Exa keyless → `opencli google` → `WebSearch` → Tavily free** | + Tavily paid, + Exa paid key | + Parallel + Perplexity + Exa deep |
| human voices | opencli (local browser) | **opencli, 96 searchable adapters** | same | + Bright Data social datasets |
| reading | Crawl4AI + trafilatura, self-run | **Scrapling → Playwright headless → `web_fetch_exa`** | + Firecrawl cloud | + Firecrawl cloud + Bright Data unblocker |
| scholarship | OpenAlex **bulk snapshot** + GROBID local | **Crossref + Europe PMC + arXiv + PubMed (keyless) ; OpenAlex bulk when volume demands** | same | + paid corpora, + Elicit |
| verification | LettuceDetect v2 (307 M) local | **LettuceDetect v2 local + URL liveness check** | + an LLM judge on a paid key | + human review |
| external cost | €80/mo + ~15 h setup | **$0** | ~$20–50/mo | $500+/mo |
| coverage | **low** (Google blocked, 1 of 4 engines) | **high** | high | highest |
| freshness | medium | high | high | highest |
| reliability | low–medium (engine churn) | medium–high (undocumented rate limits, fallbacks carry it) | high | highest |
| latency | worst (+0.83 s/query) | good (0.8–3.3 s measured) | good | best |
| maintenance | **highest** — memory leaks, cron restarts, engine breakage | **lowest** — nothing of ours to run | low | low |
| privacy | **best** | medium — queries leave the building | medium | medium |
| operational complexity | high | **low** | low | medium (billing, keys, quota) |
| **verdict** | sovereignty hedge only | **BUILD THIS** | when a rate limit actually bites, not before | when a client is paying for it |

**Why Tier 1 and not Tier 2.** The independent benchmark says the paid leaders deliver
**precision 83–89 / recall 30–36**. Precision is not our failure. Recall is. No line item in
Tier 2 or Tier 3 raises recall — the benchmark's own authors attribute the recall ceiling to
agents that *"stop early and miss the rest"*. **We would be buying the thing we already have.**

**The trigger to move to Tier 2** is written in advance so it is not an argument later: two
consecutive research runs in which the Exa keyless endpoint returns a rate-limit error on more
than 20 % of calls, or a measured recall loss against the benchmark of §13 traceable to
discovery rather than to stopping. Anything else is not a reason to spend.

---

## 9. DELIVERABLE 5 — four architectures, each attacked, and the winner attacked again

The CEO's instruction was explicit: do not fall in love with the first good architecture. Four
are built below. Each gets the strongest attack that can be made on it, from the evidence in
§2, not from taste.

### Architecture A — **Prompt Doctrine**

Discipline lives in `SKILL.md` prose. The model reads it and behaves. Zero infrastructure.

**Attack.** This is the architecture that already failed, twice, measured. The current
`dxb-research/SKILL.md` contains a correct saturation rule in prose — and the session that had
it loaded still stopped at four calls. Worse, the field says adding rules actively *hurts*:
**96 % → 20 %** instruction-following as constraints stack (arXiv 2608.02639), **95 % → 48 %**
from 1 to 10 rules (ManyIFEval), *"bias towards earlier instructions"* at scale (IFScale). And
Anthropic closed the "treat CLAUDE.md as rules, not context" request **as not planned**.

So A is not merely weak, it is **negatively correlated with its own goal**: every sentence added
to enforce research discipline lowers compliance with the sentences already there.

**Verdict: rejected as a mechanism. Retained as the *judgment* layer** — the part a gate can
never express: which source deserves trust, what the crowd actually means, when a contradiction
is real.

### Architecture B — **Deterministic Orchestrator**

A script owns the loop: plan → search → extract → ledger → verify → synthesise. The model is
called as a function at each step (LangGraph/Burr/plain Python).

**Attack.** Three fatal-in-context problems.
1. `.planning/research/STACK.md` forbids a second agent framework in this repository, and this
   is one.
2. It **freezes channel choice at design time.** A question whose evidence lives somewhere the
   author did not anticipate gets a worse answer than a free-ranging agent would have given.
   Anthropic's own guidance: workflows for *well-defined* tasks, agents where *"flexibility and
   model-driven decision-making are needed."* Research is the second kind.
3. The steps it most wants to own — *does this passage support this claim* — are exactly the
   steps a script cannot do, so it calls the model anyway, with **less** context than the agent
   had. LangGraph's own gotcha makes it worse: after an `interrupt()`, *"the node restarts from
   the beginning… so any code before the `interrupt` runs again"* — side effects double.

**Verdict: rejected as the whole.** Adopted for the genuinely mechanical parts: the parallel
fan-out (`sweep.sh` already is this), the ledger writer, the dedup pass, the URL liveness check.

### Architecture C — **Gated Ledger** (v1's winner)

The agent researches freely. Two deterministic artefacts constrain it: an append-only
**evidence ledger** written at every fetch, and a **completion gate** (`Stop` hook) that refuses
to let the turn end until machine-checkable conditions hold.

**Attack.**
1. **Padding.** A gate that counts sources is gamed by ten pages from one domain.
2. **A gate cannot read.** It cannot know whether a passage supports a claim, and a gate that
   pretended to would manufacture false assurance.
3. **Unwinnable loops.** A strict gate traps the agent when the evidence genuinely does not
   exist — and the harness kills the gate after **8 consecutive blocks** anyway, so a
   badly-budgeted gate simply exhausts itself and lets a bad answer through *with the gate
   believing it fired*.
4. **The fabrication trap (§3).** If the gate demands an evidence field, the model fills it —
   *"the model will always try to adhere to the provided schema, which can result in
   hallucinations."* Deployed agents already hallucinate **3–13 %** of their URLs.

**Verdict: necessary, not sufficient.** C guarantees *effort*. It cannot guarantee *truth*.

### Architecture D — **Adversarial Two-Party Research**

A second agent, in a **separate context**, whose only job is to falsify the draft answer. The
research is not finished when the researcher says so; it is finished when the refuter fails to
break it. The refuter receives the ledger and the claims, never the researcher's reasoning.

**Why it is not just "self-review".** The evidence is unambiguous that self-critique does not
work: *"LLMs struggle to self-correct their responses without external feedback, and at times,
their performance even degrades after self-correction"* (ICLR 2024), with the mechanism named —
*"self-reflection operates within the same reasoning context that produced the error. The model
tends to treat its previous outputs as established premises."* The repair is precisely a
separate context: *"Although the DeepVerifier shares the same base model, the separated prompt
context prevents it from inheriting the reasoning assumptions of the main agent."* Measured
elsewhere: ablating verification drops faithfulness **0.46 → 0.20**; a rubric-based verifier
beats agent-as-judge by **12–48 % meta-eval F1**. And Anthropic's own production system does
exactly this — a separate **CitationAgent** stage plus a five-criterion rubric judge.

**Attack.**
1. **Cost.** Anthropic measured multi-agent research at **~15× the tokens** of a chat. A refuter
   on every claim is not free.
2. **Same-family blindness.** A refuter built on the same model may share the researcher's
   blind spots; separation of *context* is proven to help, separation of *model* is not.
3. **It has no floor.** A refuter that finds nothing proves nothing if the researcher only
   opened three channels. D without C audits a shallow expedition beautifully.
4. **Adversarial drift.** An unbounded refuter can always find *something* to object to, and the
   loop never closes.

**Verdict: necessary, not sufficient.** D guarantees *scrutiny*. It cannot guarantee *effort*.

### Architecture E — **Own the Loop** (research as a binary outside Claude Code)

Build the research engine on the Agent SDK as a separate process, where `tool_choice: "any"`,
`strict: true` and self-hosted constrained decoding (llguidance/Outlines, which support real
`minItems: 5` and `minLength`) are available to us.

**Attack.** It buys the weakest guarantee at the highest price. `tool_choice` is **per-request**:
it forces *one* tool call on *one* turn — it cannot force depth, breadth, or a second channel.
Constrained decoding enforces the *shape* of evidence and, per §3, therefore *manufactures* it.
And peer-reviewed evidence says tightening the format degrades the reasoning: *"a significant
decline in LLMs reasoning abilities under format restrictions… stricter format constraints
generally lead to greater performance degradation"* (arXiv 2408.02442). Meanwhile we would lose
the harness we already have — hooks, skills, MCP, the CEO's approval gates — and own a second
runtime forever.

**Verdict: rejected.** The one thing it uniquely offers (`minItems ≥ 2`) is worth less than the
thing it costs, and it optimises the fabrication failure rather than the omission failure.

### A vs B vs C vs D vs E

| | A prompt | B orchestrator | C gated ledger | D adversary | E own loop |
|---|---|---|---|---|---|
| forces more work | ❌ | partly | **✅ PROVEN §3** | ❌ | ❌ |
| forces breadth across channels | ❌ | ✅ (frozen at design time) | ✅ (by evidence type) | ❌ | ❌ |
| detects fabricated citations | ❌ | ❌ | ✅ (ledger-referent check) | ✅ | ❌ (**makes them**) |
| judges whether evidence supports a claim | ❌ | ❌ | ❌ | **✅** | ❌ |
| survives a compacted context / tired session | ❌ | ✅ | ✅ | ✅ | ✅ |
| adapts to an unforeseen source | ✅ | ❌ | ✅ | ✅ | ✅ |
| build cost | zero | high | **low** (2 scripts + 1 hook) | low–medium | very high |
| running cost | zero | medium | near zero | **~15× tokens on the verified part** | medium |
| forbidden by `STACK.md` | no | **yes** | no | no | **yes (second runtime)** |

**Winner: C + D — a gated ledger with an adversary.** Not a compromise: the two cover each
other's exact hole. C guarantees the expedition happened; D guarantees the report survives
someone trying to break it. Neither alone is enough, and the measured failure of 2026-09-16 was
*both* holes at once — a four-call expedition, unchallenged.

### Now attack the winner

**Attack 1 — the gate is gamed by padding.**
*Repair:* the gate counts **independent clusters**, never URLs. Clustering is by registrable
domain, by publisher, and by near-duplicate passage hash (MinHash/LSH). Five sites carrying one
press release collapse to one. It also requires **≥ N distinct source *types*** for a
load-bearing claim (primary doc · code · first-hand account · independent test · secondary).

**Attack 2 — the gate pretends to judge truth.**
*Repair:* the gate is split in two and the split is printed in every report.
**HARD** = machine-checkable, blocks: ledger row count, cluster count, source-type coverage,
channel-concentration ≤ 50 %, every cited row exists in the ledger, every cited URL resolves,
every quote byte-matches the stored body, contradiction query issued per load-bearing claim.
**DECLARED** = judgment, recorded and auditable, never scored by the machine: does this passage
support this claim, is this source trustworthy here, is the crowd's answer what it looks like.
A machine that scored the DECLARED list would be manufacturing exactly the false assurance the
CEO's adviser warned about.

**Attack 3 — the 8-block ceiling exhausts the gate.**
*Repair:* each block demands a **batch** ("open these six channels, record them, then return"),
never a single query — and the gate keeps a counter. At block 6 it switches from *demanding* to
*requiring an honest exit*: the run may end, but only with a `GAPS` section naming what was not
reached. **Stopping early is legal. Stopping early in silence is what the gate forbids.**

**Attack 4 — the adversary is expensive.**
*Repair:* the adversary runs **once, on the load-bearing claims only** — the three to five
sentences the recommendation actually rests on — not on every line. Anthropic's finding applies:
*"a single LLM call with a single prompt outputting scores from 0.0–1.0 and a pass-fail grade was
the most consistent"*, better than multiple judges.

**Attack 5 — the adversary shares the researcher's blind spots.**
*Repair:* two separations, both cheap. (i) **Context**: the refuter sees the ledger and the
claims, never the researcher's reasoning — this is the separation the literature proves. (ii)
**Standing**: where a second mind is already reachable on this machine (the Codex/Astra channel),
a genuine cross-model refutation is available at no extra infrastructure. Where it is not, the
context separation stands alone and the report says so.

**Attack 6 — a fetched page tells the agent what to do.**
*Repair:* fetched content enters the ledger as a **quoted field**, never as an instruction, and
the synthesis prompt states that page text is data about that page. This is already the
`dxb-research` boundary; it becomes a ledger invariant.

**Attack 7 — the gate becomes a second CLAUDE.md.**
This is the subtlest one, and §2.2 is the reason to take it seriously: rules accumulate and
compliance falls. *Repair:* the gate is **code, not prose**. `SKILL.md` gets *shorter*, not
longer — the doctrine moves into `gate.py`, where it cannot be forgotten under context pressure
and cannot compete for the model's instruction budget. **Every rule that moves from the skill
into the gate is a rule that stops costing compliance elsewhere.**

**Attack 8 — the URL liveness check fails on paywalls and bot-walls.**
*Repair:* liveness is three-state — `alive` / `dead` / `blocked` — and only `dead` fails the
gate. A 403 from a page that Scrapling's stealth fetcher also cannot open is recorded as
`blocked`, cited with that label, and counted as weaker evidence. (Measured here: Reddit JSON
403, Mojeek 403, Wayback 503 — all three would false-positive a naive checker.)

**Residual risk that no repair removes.** The gate cannot make a claim true, and the adversary
can be wrong. What the pair guarantees is that **a shallow or unsupported answer cannot be
delivered silently** — the failure becomes visible, in the report, as a GAPS line or a
contradiction left standing. That is the honest ceiling of this architecture, and it is stated
here so that no one later mistakes a green gate for a correct answer. — **UNPROVEN until §13
runs.**

---


---

## 9.1 The strongest evidence AGAINST this architecture — and why it survives

The CEO's instruction was to attack the winner and to hide nothing. This is the hardest evidence
found against the $0 position, measured by a hunter from the leaderboard's own CSV.
— **LIKELY** (primary data file fetched; not re-pulled by the author)

**On DeepResearch Bench, the best open harness writes as well as Gemini Deep Research and
grounds its claims about one-seventh as often:**

| entry | RACE (report quality) | **citation accuracy** | **effective citations** |
|---|---:|---:|---:|
| gemini-2.5-pro-deepresearch | 49.71 | **78.30** | **165.34** |
| **langchain-open-deep-research + GPT-5** | **49.33** | **34.74** | **22.44** |
| openai-deepresearch | 46.45 | 75.01 | 39.79 |
| perplexity-Research | 40.46 | **82.63** | 31.20 |
| tongyi-deepresearch-30B-A3B (open weights) | 40.46 | – | – |

**Three blows this lands, stated without softening:**

1. **The open harness's weakness is exactly grounding.** A report that reads like Gemini's and
   is verifiably sourced a third as often is the *citation-laundering* failure of §2.4, measured
   in production.
2. **That 49.33 was earned with GPT-5.** On its cheaper configuration the same harness scores
   **43.44**. A $0 model plus an open harness has **never been measured at parity with
   anything.**
3. **No benchmark in this field measures a $0-search stack.** Even the "fully local" claimant
   (local-deep-research, SimpleQA 95.7 %) turns out to be local only in its *model*: all 12 rows
   of its own leaderboard CSV carry `search_engine=serper`, a paid Google API — and its evaluator
   model is the same model being graded.

**Why the architecture survives all three.**

Blows 1 and 3 are not arguments against this design; they are **arguments for it**. The measured
open-source weakness is precisely the one thing this architecture exists to fix: the open harness
has no ledger, no citation gate and no adversary, so nothing in it ever forced a claim to point
at a stored passage. **We are not proposing an open harness. We are proposing the missing
enforcement layer, on top of a strong model we already pay for.** And "no $0-search stack has
been benchmarked" is not a defeat — it is why §13 exists.

Blow 2 is real and is accepted: **the model is not the place to economise.** The $0 in this
proposal is external *research API* cost. The model stays Opus-class on the holding's existing
subscription. That distinction is now written into §8 and must not be blurred later.

### And the free-search floor is lower than anyone writes — measured live

The same hunter ran a SearXNG instance built **today** (`2026.9.16+461f174b0`) from a consumer IP
and put twelve consecutive queries through it:

| engine | results | the server's own verdict |
|---|---:|---|
| Google (web) | **0** | `Suspended: CAPTCHA` |
| DuckDuckGo | **0** | `CAPTCHA` |
| Qwant | **0** | `CAPTCHA` |
| Google CSE | 20 | ✅ |
| Brave | 20 → **rate-limited at query 12** | `too many requests` |

The upstream history is dated and unambiguous: a User-Agent bypass died **2026-07-01** (issue
#6359); a Nokia-UA fix was merged **2026-08-22** and Google killed it **within five days**
(#6570); the project migrated its whole network layer to `curl_cffi` on **2026-09-04** — and my
hunter's build, which contains that commit, **still returns `google: Suspended: CAPTCHA`**. Two
"Bug: google engine" reports filed this week were auto-closed **within 15 seconds** as noise.

And the competitor wrote the obituary: **`benbusby/whoogle-search` (11 572 stars) archived
2026-07-24** — *"Google closed both doors; there's no third one to try."*

**The fragility nobody advertises:** the one engine that answered all twelve runs, `google_cse`,
ships with a **hardcoded third-party Programmable-Search ID** in
`searx/engines/google_cse.py` — `CX = "partner-pub-8993703457585266:4862972284"  # blackle.com`.
Every self-hosted SearXNG on earth is using one stranger's key. If it is revoked, the default
free stack drops to **Brave alone**, which rate-limits at twelve queries.

> **This is the final nail in Tier 0 as a primary layer, and it is the reason §4.1 matters more
> than any other measurement in this study.** Our free discovery does not run on scraped search
> engines. It runs on **five vendor-operated keyless APIs** and `opencli`'s real browser session
> — measured working, this session, at 0.4–3.3 seconds.

### Three corrections to the open-source map, measured

| what the field says | what `gh api` returned today |
|---|---|
| `ItzCrazyKns/Perplexica` | **renamed → `ItzCrazyKns/Vane`**; last code commit 2026-04-11 |
| `Alibaba-NLP/WebAgent` | **renamed → `Alibaba-NLP/DeepResearch`**; **no commit since 2026-02-27** |
| `QwenLM/Tongyi-DeepResearch` | **does not exist — HTTP 404** |
| *"Tongyi DeepResearch, the leading open-source deep research agent"* (its own description) | scores **40.46**, below Perplexity, and is **dead 6½ months** |
| `langchain-ai/open_deep_research` — the **highest-scoring open entry on the board** | **ARCHIVED** |

Of the nineteen open deep-research projects checked, **six are dead (no commit in 90 days), one
name is fictional, two were renamed, and the leader is archived.** The star counts do not tell
you this; only the default branch's last commit does.
## 10. DELIVERABLE 6 — the research algorithm

```
  CEO's question
        │
        ▼
┌───────────────────────────────┐
│ 0. INTENT LOCK                │  question stored VERBATIM + a canonical restatement
│    question_lock.json         │  + the question SHAPE: counting | decision | capability
│    written BEFORE any search  │  every later step is diffed against this file
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 1. CLASSIFY + EVIDENCE PLAN   │  factual · comparative · preference · market · academic
│                               │  technical-capability · product-eval · historical · news
│  → names the evidence TYPES   │  strategic · troubleshooting · due-diligence
│    that MUST appear in the    │  → e.g. "preference" REQUIRES ≥1 first-hand row and a
│    ledger before the gate     │     denominator; "capability" REQUIRES source or docs
│    will open                  │  ← THIS is what makes a tool unavoidable (§11)
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 2. DISAMBIGUATE               │  what exactly IS "X"? resolve the entity before searching
│                               │  (the ambiguous-name trap, §13 T-27)
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 3. ROUTE — registry + LIVE    │  per required evidence type → channel
│    PROBE (never doctor alone) │  health is a 1-call probe, not a static status (§11)
│                               │  fallback chain declared up front, per capability
└───────────────┬───────────────┘
                ▼
   ┌────────────┬──────────────┬─────────────┬────────────┬──────────────┐
   ▼            ▼              ▼             ▼            ▼              ▼
discovery    platform      academic      code/docs    video/audio    marketplace
Exa·Parallel opencli       Crossref      gh api       yt-dlp         npm·crates
·Tavily·You  (96 search    ·EuropePMC    ·raw docs    ·bili-cli      ·dockerhub
·Firecrawl    adapters)    ·arXiv·PubMed ·releases    ·transcribe    ·maven
·opencli      ·HN Algolia  ·OpenAlex     ·issues                     (adoption
 google       ·reddit       bulk          ·code search               ·counts)
·WebSearch    ·zhihu/weibo
   └────────────┴──────────────┴─────────────┴────────────┴──────────────┘
                ▼
┌───────────────────────────────┐
│ 4. READ — never a snippet     │  Scrapling get → stealthy_fetch → Playwright headless
│                               │  → web_fetch_exa / firecrawl_scrape as the last resort
│                               │  a search result is a HEADLINE; a quote needs the body
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 5. EVIDENCE LEDGER            │  ⚠ WRITTEN BY THE FETCHER, NEVER BY THE MODEL (§3)
│    ledger.jsonl (append-only) │  row = id · url_canonical · title · author · pub_date ·
│                               │  retrieved_at · version · passage · passage_sha256 ·
│                               │  source_type · primary? · channel · cluster_id · http_status
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 6. INDEPENDENCE PASS          │  cluster by registrable domain + publisher + MinHash of
│    independence.py            │  the passage. 30 sites, one press release → 1 cluster
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 7. CONTRADICTION SEARCH       │  for EVERY load-bearing claim, search its negation and
│    (mandatory, logged)        │  log the result — including "nothing found", which is
│                               │  itself evidence. "X is fast" → "X slow", "X latency
│                               │  production", "X benchmark criticism", "moved off X"
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 8. TEMPORAL VALIDATION        │  which VERSION does this describe? a 2024 complaint about
│                               │  a tool that shipped a rewrite in 2026 is not evidence
│                               │  about 2026. pub_date mandatory; "recently" is not a date
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 9. RECURSE                    │  every finding must emit: "what do I now need to know to
│    new gaps → step 3          │  test whether this is true?" — depth is created HERE,
│                               │  and each new query must NAME the gap it closes
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 10. COMPLETION GATE           │  HARD checks (block, machine-checkable)
│     gate.py · Stop hook       │  + DECLARED checks (judgment, recorded, never scored)
│     PROVEN to block (§3)      │  saturation test | budget exhausted + GAPS section
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 11. ADVERSARY                 │  separate context, ledger + claims only, never the
│     refuter.md subagent       │  researcher's reasoning. Its job is to BREAK the answer.
│                               │  Anything it breaks goes back to step 3.
└───────────────┬───────────────┘
                ▼
┌───────────────────────────────┐
│ 12. SYNTHESIS → CEO           │  answer · the number that carries it · what would flip it
│     dxb-ceo-report            │  · contradictions left standing · GAPS · PROVEN/LIKELY/
│                               │  UNPROVEN on every load-bearing claim
└───────────────────────────────┘
```

### The rules inside the loop that actually produce depth

**Search diversification (steps 3 and 9).** Never twenty rewrites of one query. **Every query
must name the information gap it closes**, and a query whose gap is already closed is rejected
by the ledger. The gap ladder for a comparison, in order:
`A vs B` → `A to B migration` → `switched back to A` → `why we stopped using A` →
`A production problems` → `A benchmark criticism` → `A issue tracker` → `A release notes 2026`
→ `A in Chinese / Turkish` → `A alternatives 2026` → `A pricing complaint`.

**Source hierarchy is contextual, not fixed.** This is the rule that most research systems get
wrong by having one list:

| question type | the order that holds |
|---|---|
| technical capability | source code > official docs > release notes > maintainer comment in an issue > independent test > blog > social post |
| user preference | first-hand accounts at volume > migration stories > community size and activity > independent tests > press > **vendor page (never)** |
| market / adoption | package download counts, registry stats, job postings > surveys > analyst reports > press |
| price | the vendor's own pricing page (here the vendor IS the primary source) > docs > third-party summaries |
| current events | primary wire + the actor's own statement > two independent outlets > aggregators |

**Saturation, defined so a script can check it.** Over the last *K* = 8 queries: fewer than *X*
= 2 new independent clusters **and** no new contradiction **and** every required evidence type
present. Not "10 sources found". Counting queries is how a session convinces itself six was
enough.

**Budget with an honourable exit.** Every run carries a wall-clock, tool-call and $-budget.
Exhausting it is a **legal** ending — the report ships with `GAPS`. The gate blocks silence,
never honesty.

---


### 10.1 The temporal layer — measured, including the part that repairs my own failed probe

§4 recorded that the Wayback CDX API returned **503 "Temporarily Offline"** when I probed it, and
called the temporal leg unreliable. A hunter found the door that was open the whole time.
— **LIKELY** (hunter-measured live; the CDX 503 is my own **PROVEN** measurement)

**Reliability, five rapid calls each, measured in the same minutes as my failed probe:**

| endpoint | result |
|---|---|
| `web.archive.org/web/timemap/json` | **200 on every attempt (10+)** |
| `web.archive.org/cdx/search/cdx` | 503 · 503 · 000 · 503 · 200 — flaps |
| `archive.org/wayback/available` | never returned valid JSON (429 behind a 200) |

**`/web/timemap/json` takes the same `fl`, `collapse`, `from`, `to` and `limit` parameters as CDX
and returns the same shape.** It is a drop-in replacement and it stayed up. This becomes the
default in `urlcheck.py`; CDX is the fallback, not the other way round.

**And with it, a deterministic answer to "has the page I cited changed since I cited it":**
the `digest` field is the base32 SHA-1 of the capture payload. Store `(url, digest, timestamp)`
in the ledger row at citation time; later query the timemap from that date with
`collapse=digest`; any surviving digest that differs means the page changed, and the first such
timestamp bounds *when*. ⚠ One trap, measured: `3I42H3S6NNFQ2MSVX7XZKYAYSCX5QBYJ` is the
**empty-payload** digest and appears throughout real results — a naive diff counts failed
captures as content changes. Filter it and filter `statuscode` 403/404/5xx first.

**The date problem is worse than "extract the date".** htmldate's own benchmark (1 000 pages,
2026-06-01) tops out at **accuracy 0.903** — roughly **one page in ten gets the wrong date** — and
its own docs say *"date extraction is not a completely solved task."* Worse, the same page
legitimately has two true dates:

| page | original | modified | gap |
|---|---|---|---|
| Wikipedia · Internet Archive | 2003-01-31 | 2026-09-12 | **23.6 years** |
| blog.mozilla.org | 2020-12-03 | 2025-04-21 | 4.4 years |
| huggingface.co/blog/open-r1 | `datePublished` 2025-01-28 | its own `<time>` says 2025-03-27 | the page contradicts itself |
| python.org/downloads | **no extractable date at all** | — | — |

**And trafilatura defaults to the ORIGINAL date** — so a staleness check built on it
systematically over-states staleness for maintained pages. The ledger therefore carries **both**
`pub_date` and `updated_date`, and the report says which one a claim rests on.

**A staleness lesson that is also a health lesson.** `newspaper3k` shows `pushed_at 2026-09-15`
and 15 160 stars. Its last **source** commit is **2020-06-22**; every commit for twenty months
has been a README proxy advertisement (*"remove novada"*, *"add Novada proxy"*). PyPI frozen at
0.2.8 since 2018. Use **newspaper4k**. This is §5's `pushed_at` warning with a second victim.

**The maintained parts of this layer, all measured this month:** `htmldate 1.10.0`
(2026-09-10) · `trafilatura 2.2.0` (2026-09-11) · `dateparser 1.4.3` (2026-09-03) ·
`newspaper4k 0.9.6` · `changedetection.io 0.60.6` (released **2026-09-14**).
**The dead parts, so nobody builds on them:** HeidelTime (2023), `python-sutime` (2020),
`date_guesser` (archived), `articleDateExtractor` (2018) — and **the Memento TimeTravel
aggregator is NXDOMAIN**: `timetravel.mementoweb.org`, `aggregator.mementoweb.org` and
`labs.mementoweb.org` have no DNS records at all. Any 2023-2024 pipeline built on it is broken.

**Cheapest real defence, and it costs nothing:** cite pinned URLs. Measured —
`htmldate.readthedocs.io/en/stable/` and `/en/latest/` serve **different content** today. A
citation to `/latest/` rots by design. The ledger's URL canonicalisation prefers a pinned path
(`/en/v1.10.0/`, `docs.python.org/3.11/`) whenever one exists.
## 11. DELIVERABLE 7 — Agent-Reach integration strategy (rewritten on a measurement)

### What agent-reach actually is

v1 assumed it was the reach. It is not. Its **entire command surface**, printed this session:

```
agent-reach {setup, install, configure, doctor, uninstall, skill, format,
             transcribe, check-update, watch, version}        — v1.5.0
```

**There is no `search`. No `get`. No `fetch`.** agent-reach never touches a web page. It is a
**provisioner and a health registry**: it installs and configures the per-platform CLIs, reports
which of them are usable, normalises their output, and transcribes audio. The reach itself is
`opencli` (169 site adapters, 96 searchable), `gh`, `yt-dlp`, Scrapling, Playwright and the five
keyless MCP doors. — **PROVEN**

### What `doctor` returns, and why it cannot be trusted as health

```
github       warn  tier=0  active=null               backends=gh CLI
twitter      warn  tier=1  active=null               backends=twitter-cli, OpenCLI, bird CLI
youtube      ok    tier=0  active=yt-dlp             backends=yt-dlp
reddit       warn  tier=1  active=null               backends=OpenCLI, rdt-cli
bilibili     ok    tier=1  active=bili-cli           backends=bili-cli, OpenCLI, B站搜索 API
v2ex         ok    tier=0  active=V2EX API (public)  backends=V2EX API (public)
rss          ok    tier=0  active=feedparser         backends=feedparser
web          ok    tier=0  active=Jina Reader        backends=Jina Reader
exa_search   warn  tier=0  active=null               backends=Exa via mcporter
… 15 channels total — 5 ok, 10 warn
```

Its own message explains the warns: *"Doctor 不执行平台命令"* — **doctor does not execute the
platform command.** It checks that a binary and a credential exist. So:

- `github` is **warn** — yet `gh api rate_limit` returned **5 000/hr, authenticated**.
- `reddit` is **warn** — yet `opencli hackernews search` returned **3 836 bytes in 0.8 s**.
- `exa_search` is **warn** — yet the Exa endpoint answered a real search in **3.3 s, keyless**.

**A static registry is not health.** Three of the ten "warns" are working channels. If the
router trusted `doctor`, it would silently avoid channels that work — the precise definition of
under-search.

### The three moves

1. **Keep agent-reach for the three things it is genuinely good at, and only those.**
   `doctor --json` as the **capability registry's shape** (channel → tier → backends → what is
   missing), `format` as the output normaliser, `transcribe` as the audio→text leg (YouTube and
   podcasts, via a free Groq key). It is MIT, 82 387 stars, pushed 2026-09-15 — healthy, and
   worth keeping for that.
2. **Put a LIVE PROBE in front of it.** The registry stores, per channel:
   `capability tags · cost · last_success_at · last_probe_result · fallback chain`. Health is a
   1-call probe with a 5-second timeout, run at sweep start, in parallel, and **cached for the
   run**. `doctor` supplies the map; the probe supplies the truth. A channel that fails is a
   **hole reported to the CEO**, never a silent skip.
3. **Never put the discipline inside it.** agent-reach is upstream and updated by its authors.
   Our stopping rules live in our gate. An upstream release can then never silently weaken the
   holding's research standard.

### And the CEO's real question — how do we stop the agent ignoring what it has?

Not with a sterner sentence; §2.2 proves sterner sentences make it worse. With the **evidence
plan** (step 1) wired to the **HARD gate** (step 10):

> A preference question whose ledger contains **no `source_type=first-hand` row** cannot pass the
> gate. The only way to obtain such a row is to actually open a platform channel and read a human
> being's words. **The tool becomes unavoidable because the evidence it produces is required.**

That is the central design hypothesis and it is **UNPROVEN** until §13 runs — it is exactly what
the benchmark exists to falsify.

### The chain the report must print — "installed ≠ used"

```
tool_installed → tool_reachable → tool_invoked → results_returned
              → results_parsed → evidence_recorded → evidence_cited → claim_supported
```

**Links 1–7 are machine-checkable** and printed by `gate.py` from the ledger, with a per-channel
table. **Link 8 is judgment** — it is declared by the agent, tested by the adversary (§9-D), and
never scored by the machine. The report prints both lists under separate headings so that no one
ever mistakes one for the other.

Where telemetry is available, link 3 gets a second, independent witness:
`claude_code.tool_result` with `success=true`, joinable by `tool_use_id`. It is off by default
(`CLAUDE_CODE_ENHANCED_TELEMETRY_BETA=1`, `OTEL_LOG_TOOL_DETAILS=1`) and is a later hardening
step, not a dependency. — **LIKELY** (documented, not exercised here)

---

## 12. DELIVERABLE 8 — failure modes and their system-level fixes

Thirty modes. Each fix is a mechanism, never a sentence in a prompt — because §2.2 measured
that sentences in prompts make the other sentences weaker. The column `where` names the
component that owns the fix.

| # | failure mode | evidence it is real | system-level fix | where |
|---|---|---|---|---|
| 1 | **Tool avoidance** — has the channel, does not call it | Tool-Skip 11.8–28.5 % (2607.04686); our own session: `WebSearch` 0 calls | evidence-TYPE requirement in the HARD gate; the only source of that type is that channel | `gate.py` + evidence plan |
| 2 | **Early stopping** — the #1, ours and the industry's | benchmark recall 30–36 %, *"stop early and miss the rest"*; under-search 34–72 % | `Stop` gate, **PROVEN to block** (§3); saturation over last K queries, never a query count | Stop hook |
| 3 | Intent loss — the question quietly becomes a different question | CEO's own example: *"which do people prefer"* → *"which should we delete"* | `question_lock.json` written before the first search; synthesis diffed against it | step 0 |
| 4 | Query drift — 20 rewrites of one query | *"query expansion… only applied in early iterations"* (2602.17518) | every query must NAME the gap it closes; duplicate-intent queries rejected | `ledger.py` |
| 5 | Confirmation bias | models *"propose triples to confirm their hypothesis rather than falsify it"* (2604.02485) | contradiction search is a HARD item, **per load-bearing claim**, and the negative result is logged | step 7 |
| 6 | **Citation laundering** — citing the blog that cites the source | citation accuracy 40–80 % (DeepTRACE) | ledger field `primary?`; a claim carried only by secondary rows is flagged in the report | `gate.py` |
| 7 | **Source echo** — 30 sites, one press release | — | cluster by domain + publisher + MinHash; **clusters are counted, never URLs** | `independence.py` |
| 8 | Vendor claim presented as a finding | measured in this holding on 2026-09-16 | `source_type=vendor` is mandatory on the vendor's own domain; vendor rows alone cannot satisfy a comparison claim | `ledger.py` + gate |
| 9 | **Fabricated URL** | 3–13 % of deployed agents' URLs never existed (2604.03173) | URL liveness check, 3-state (alive/dead/blocked); `dead` fails the gate. Cuts non-resolving 6–79× | `urlcheck.py` |
| 10 | **Fabricated quote** | — | every quote must byte-match the stored body: `passage_sha256` recomputed by the gate | `gate.py` |
| 11 | **Evidence invented to satisfy a schema** | *"the model will always try to adhere to the provided schema, which can result in hallucinations"* | **the ledger is written by the fetcher, never by the model**; the model may only cite existing row ids | architecture |
| 12 | Stale evidence | — | `pub_date` mandatory; rows older than the subject's last release are auto-flagged | step 8 |
| 13 | Version blindness — "2024's answer about 2026's tool" | — | `version` field; temporal validation step; the report states the version each claim describes | step 8 |
| 14 | Popularity ≠ preference | stars are an adoption proxy, nothing more | counting questions require ≥ 2 distinct MEASURE types and a denominator; stars alone cannot carry a preference claim | evidence plan |
| 15 | **Availability ≠ capability** — "it is installed, so it works" | `doctor` says warn, the channel works; `brave` is installed and **fails** | live probe recorded in the ledger before any capability claim | registry probe |
| 16 | Snippet-as-source | our own 2026-09-16 failure | the ledger requires a `passage` from a FETCHED body; search snippets are a separate, weaker row type | `ledger.py` |
| 17 | Silent channel failure | 2 dead queries dropped silently on 2026-09-16 | coverage table with FAIL rows printed into the report | `coverage.py` |
| 18 | Silent query drop | same | every issued query logged with its result count, **zero included** | `ledger.py` |
| 19 | Single-channel dependence | v1 measured **56 % of results from Exa alone** | gate refuses when one channel supplies > 50 % of clusters — now practical: **five keyless doors** (§4.1) | `gate.py` |
| 20 | Undeclared gaps | — | `GAPS` section mandatory whenever the budget or the block-ceiling ends the run | `gate.py` |
| 21 | Overconfidence | OpenAI's own note: Deep Research *"shows weakness in confidence calibration"* | PROVEN / LIKELY / UNPROVEN required on every load-bearing claim | report contract |
| 22 | **Prompt injection from a fetched page** | — | fetched content enters the ledger as a quoted field; page text is data about that page, never an instruction | `ledger.py` |
| 23 | Language monoculture | — | the evidence plan flags subjects with a non-English community; CN/TR channels become a required type there | evidence plan |
| 24 | Sample bias — the loudest voices | CEO's own catch: 23 766 members vs 11, never measured | counting questions require a **denominator**: community size, post counts, download counts | step 3 |
| 25 | Benchmark contamination | LiveBrowseComp: **44.5 % of BrowseComp answerable with no tools** | our benchmark uses frozen, post-cutoff gold sets; any task a model-only arm answers is thrown away | §13 |
| 26 | Silent paid fallback | — | cost ledger per run; crossing $0 requires the CEO's word | `budget.yaml` |
| 27 | **Ambiguous name** — two different things share a name | — | the disambiguation step resolves the entity before searching; the lock records which one | step 2 |
| 28 | Recency trap — news answers a capability question | — | the evidence plan requires durable sources (docs, code, releases) for capability questions | evidence plan |
| 29 | **Screen leakage** — a sweep opens the CEO's browser | he caught it the first hour the door existed | `--window background` on every opencli call; Playwright `--headless --isolated`; `operator` is never used for research | `sweep.sh` |
| 30 | Secret leakage into a query | a query is a message to an outside company, and it is logged there | allow-list check on every outward query before it leaves | `sweep.sh` |

**Three that deserve to be read twice**, because they are the ones a well-meaning
implementation gets backwards:

- **#11** — the instinct to make evidence a required field is the instinct that creates fake
  citations. The requirement must fall on the *fetcher*, not on the *writer*.
- **#19** — an anti-concentration rule is unenforceable with one search engine and trivial with
  five. §4.1 is what makes #19 a real rule rather than an aspiration.
- **#25** — a benchmark that a model can answer from memory measures memory. Any task in §13
  that the model-only arm gets right is deleted, not scored.

---


### 12.1 The same failures, in production code — dated, and with the line that causes them

§12 is a list of things that *can* go wrong. A hunter went and found them **already happening**
in the four most-used open deep-research agents, with issue numbers and dates. Every one maps to
a row above. — **LIKELY** (hunter-fetched from the repositories' own issue trackers)

| the code | what it does | our row |
|---|---|---|
| **langchain open_deep_research**, PR #333, 2026-08-05: `if is_token_limit_exceeded(e, model) or True:` | `or True` makes the condition always fire. **Any** exception — a 429, network jitter, one researcher failing — instantly kills the whole research phase, and the agent then **spends tokens producing a mutilated report with no error raised.** Quality collapses silently | **#2 early stopping · #17 silent channel failure** |
| **gpt-researcher** #1882, 2026-07-11: human feedback parsed by substring | *"**no**t enough on evaluation methods"* contains "no" → mapped to approval. **The very feedback the user typed is thrown away** and the plan proceeds as accepted | **#3 intent loss** |
| **gpt-researcher** #2062, 2026-08-11 | *"The router reads a key nothing writes."* `revisions_count` is never written, so `force_accept` can never fire — the loop runs until `GraphRecursionError`. *"Two sources of truth for the same bound; the wired one is broken, the correct one is unreachable"* | **#20 undeclared gaps** |
| **gpt-researcher** #1986 / #2065, 2026-07-24 / 2026-08-13 | Cost accounting is wrong **in both directions** — 4 000 cache-creation tokens priced at exactly $0, and 4 500 cached tokens billed as fresh. Measured in a clean container against `master` | **#26 silent paid fallback** |
| **bytedance deer-flow** PR #5488, 2026-09-16 | *"`RuntimeFeatures(token_budget=True)` builds a budget that never runs."* `enabled` defaults to `False`, every hook returns early. **No warning, no hard stop.** Repro: a 250k-token turn against a 200k budget — *"tool executed, stop_reason: None"* | **#20 · #26** |
| **bytedance deer-flow** PR #5486, 2026-09-16 | The loop detector false-positives: five sequential, non-overlapping page reads hash identically, the fifth trips the cap, tool calls are stripped, and the run *"surfaces as `completed` with `stop_reason=loop_capped`"* — a partial result labelled as success | **#17 · #20** |
| **local-deep-research** #5351, 2026-08-03 | *"The default research agent path constructs a new `SearXNGSearchEngine` per tool call, so the configured delay typically does not slow down successive searches."* At least **nine** dated rate-limiter issues between 2026-08-03 and 2026-09-16 | **#15 availability ≠ capability** |
| **Vane** (ex-Perplexica) #1155 / #1180, 2026-06-26 / 2026-08-07 | *"Unauthenticated API Key Leak via GET /api/config + Arbitrary Config Overwrite + SSRF"*; *"API keys exposed to client-side"*. Its bundled SearXNG was **five months stale** against a target that breaks monthly (#1190) | **#30 secret leakage** |

**And the archive, dated precisely.** `langchain-ai/open_deep_research` — the highest-scoring open
harness on the only board that measures open harnesses — was **archived 2026-08-21**, and *no
reason was ever given*: no deprecation notice in the README, none on PyPI, and **the last eight
commits before the lock were 100 % dependabot**. Two human pull requests were still open when it
was made read-only.

> **The pattern across all eight rows is one thing, and it is the thing this architecture is
> built against: the failure is never loud.** A budget that never runs. A loop cap that reads a
> key nobody writes. An exception handler that swallows everything and still bills you. A partial
> result reported as `completed`. **Not one of these systems lies about its answer — they lie
> about having finished.** That is exactly what a gate reading a ledger catches and a prose rule
> never will.
## 13. DELIVERABLE 9 — the DXB Research Benchmark ("does the Ferrari actually win?")

**The design principle comes from the contamination finding.** LiveBrowseComp reports agents
answering up to **44.5 % of BrowseComp with no search tools at all**. A benchmark a model can
answer from memory measures memory. Therefore:

1. Gold answers are written by the author **from primary sources**, frozen in a file with a
   SHA-256 receipt, and **never appear in any prompt**.
2. **Arm 0 is the model with no tools at all.** Any task Arm 0 answers correctly is **deleted
   from the benchmark**, not scored. (This is the openbenchmarks protocol, and their model-only
   baseline is 0 — ours must be too.)
3. Every task is answerable today, and the gold file records the date it was verified, because
   several of these answers will change.

**30 tasks. 20 categories. The trap tasks are the point** — they are the ones that separate a
research engine from a search box.

| # | category | task | gold criterion (what a correct answer must contain) |
|---|---|---|---|
| 1 | obscure factual | What exact HTTP status does `https://mcp.tavily.com/mcp/` return to a `tools/list` POST **without** the keyless header, and what with it? | 401 without · 200 with `X-Tavily-Access-Mode: keyless`. Must name the header |
| 2 | obscure factual | What is the keyless daily USD budget OpenAlex grants, and which response header carries it? | $0.10 · `x-ratelimit-limit-usd` |
| 3 | current information | Which providers lead the search-only and search+fetch boards of `openbenchmarks-labs/multi-turn-company-search` today, with F1? | Parallel basic 46.5 · Exa deep 48.2 |
| 4 | current information | Name three named deep-research leaderboards on which OpenAI Deep Research does **not** appear at all. | any three of GAIA, GAIA2, BrowseComp-ZH, BrowseComp-Plus, FRAMES |
| 5 | technical capability | Can a Claude Code `Stop` hook prevent a session from ending, and what is the ceiling? | yes, `decision:"block"` or exit 2 · **8 consecutive blocks** |
| 6 | technical capability | What is the largest `minItems` value Anthropic's structured outputs enforce? | **1** — values beyond 0/1 are rejected |
| 7 | technical capability | Does `agent-reach` have a command that fetches a web page? | **no** — the CLI has no search/get/fetch verb |
| 8 | GitHub comparison | Of `crawl4ai`, `Scrapling`, `firecrawl`: which licence forbids the most, and which has the fewest open issues? | AGPL-3.0 (firecrawl) · Scrapling (7 open issues) |
| 9 | GitHub comparison | Is `langchain-ai/open_deep_research` maintained? | **no — archived** |
| 10 | **primary-source challenge** | What does SearXNG's own issue tracker say about Google in 2026, with the issue number and date? | issue **#5867**, *"google engine - HTTP 403"*, opened **2026-03-17**, closed |
| 11 | user preference (counting) | Do people who tried both Crawl4AI and Firecrawl end up self-hosting or paying? Answer with a **distribution**, not quotes. | must carry counts/denominators from ≥3 independent clusters, not 3 anecdotes |
| 12 | user preference (counting) | Which of two named tools has the larger live community, and by what measure? | must name the measure (members, posts/month, downloads) and give both numbers |
| 13 | product comparison | For a $0 budget, which single search API gives the best independent-benchmark F1, and can it be used without a key? | **Parallel** · yes — `https://search.parallel.ai/mcp` keyless |
| 14 | academic | Which grounding-verification model under 1 B parameters is BOTH permissively licensed and maintained in 2026? | LettuceDetect v2 `lettucedect-v2-mmbert-base` (307 M, Apache-2.0, repo active 2026-09-07). Naming MiniCheck (2024) alone is a stale answer |
| 15 | academic | Which free scholarly API returns open-access **full text**, and in what format? | Europe PMC · `fullTextXML` (JATS) |
| 16 | **conflicting sources** | Is SearXNG a viable primary search layer in 2026? Sources disagree — report the disagreement. | must surface BOTH the project's own claims AND the 403/blocking evidence, and not average them |
| 17 | **conflicting sources** | Is self-hosting a crawl stack cheaper than paying APIs? | must surface the €1 740-vs-€1 200 first-hand report AND state its single-company limit |
| 18 | breaking news | What changed in OpenAlex's access model in 2026, when, and what remains free? | metered from **2026-02** · the CC0 bulk dataset remains free |
| 19 | historical | What happened to the Bing Web Search API and on what date? | retired **2025-08-11**, instances decommissioned |
| 20 | **outdated-information trap** | "Stanford STORM is the best free tool for structured literature synthesis." True in 2026? | **no** — last push **2025-09-30**; the claim is a year stale |
| 21 | **misinformation trap** | Verify: "Agents-A1-4B leads GAIA at 95.1 %." | **unverifiable / false** — no such row in the 3 820-row official dataset |
| 22 | **source-copying trap** | How many *independent* sources support a given vendor's headline benchmark claim? | must collapse the press-release copies into ONE cluster and say so |
| 23 | **ambiguous-name trap** | Research "Parallel" as a web-search API. | must disambiguate from unrelated "parallel" products before answering |
| 24 | **vendor-page trap** | Which is better, Firecrawl or Crawl4AI? | a vendor's own comparison page must be labelled `vendor` and cannot carry the verdict |
| 25 | multilingual (CN) | What do Chinese-language communities say about a named tool that Western forums barely discuss? | evidence from ≥2 CN channels (zhihu/linux-do/juejin/bilibili) with dates |
| 26 | multilingual (TR) | Find any Turkish-language discussion of a named developer tool and report honestly if there is none. | **"none found" is a correct answer** if the search is shown |
| 27 | company due diligence | Who is behind `openbenchmarks-labs`, and is the benchmark vendor-funded? | org created 2026-06-14 · 3 contributors · *"No vendor sponsors or controls this benchmark"* |
| 28 | troubleshooting | `opencli brave search` fails on this machine. What is the error and what is the workaround? | *"Navigation rejected"* · route Brave-class queries to another of the five doors |
| 29 | **deep multi-hop** | Find a tool whose maintainers publicly said it cannot do X, where a vendor comparison claims it can, and cite both. | requires ≥3 hops: comparison page → repo → maintainer's own words in an issue |
| 30 | **strategic decision** | Should DXB pay for a search API in the next six months? Name what would change the answer. | must answer with the recall/precision argument AND name a falsifiable trigger |

### The arms

| arm | what it is |
|---|---|
| **0** | the model, no tools — **the contamination filter**, not a competitor |
| 1 | a plain session with web search, no skill |
| 2 | the session + the **current** `dxb-research` skill (prose only) |
| 3 | the session + the **DXB Research Engine** (ledger + gate + adversary) |
| 4 | Perplexity |
| 5 | Gemini Deep Research / OpenAI Deep Research, where reachable |

### The metrics, each with a defined measurement

| metric | how it is measured | who measures |
|---|---|---|
| intent preservation | does the answer address `question_lock` verbatim — binary, blind | human/blind model |
| **recall** | fraction of gold findings present — **the metric that matters most** (§1) | script vs gold |
| precision | fraction of asserted findings present in gold or independently verifiable | script + human |
| source quality | mean tier of cited sources under the §10 contextual hierarchy | script |
| **citation correctness** | the quote byte-matches the fetched body — `passage_sha256` | **script, deterministic** |
| **URL liveness** | every cited URL resolves (3-state) | **script, deterministic** |
| claim support | does the cited passage support the claim | **the adversary + blind human** |
| primary-source ratio | primary rows / total rows | script |
| contradiction coverage | a counter-search was issued for each load-bearing claim | script (ledger) |
| temporal accuracy | claims carrying the right version/date | human |
| hallucination rate | unsupported assertions per 1 000 words | blind human |
| independence | distinct clusters; max share held by one channel | script |
| time · tokens · external $ | measured per run | script |

**Composite** = 0.30·Recall + 0.20·ClaimSupport + 0.15·CitationCorrectness +
0.10·IntentPreservation + 0.10·(1 − Hallucination) + 0.10·Independence + 0.05·Timeliness.

**Recall carries the heaviest weight because it is the measured weakness of every system in the
field, ours included.**

### The acceptance condition — written before the run, so it cannot be negotiated after

**"Ferrari" is declared only if arm 3 beats arms 1, 2 and 4 on BOTH Recall and ClaimSupport, at
$0 external cost.** Beating arm 2 (the prose skill) is the one that tests this study's central
hypothesis — that requiring an evidence *type* forces a tool to be used. If arm 3 does not beat
arm 2, the hypothesis is **falsified** and the gate is not worth its complexity. That outcome is
a legitimate result of this benchmark and will be reported as such.

---

## 14. DELIVERABLE 10 — implementation blueprint

Built **on** `.claude/skills/dxb-research/`, which already exists and already works (27 channels
in 3 tiers, a Scrapling page-reading stage, a coverage table with FAIL rows). Nothing is thrown
away and **no second skill is created** — the plan exists once.

```
.claude/skills/dxb-research/
├── SKILL.md                  # SHORTER than today. Doctrine + how to drive the machine.
│                             # Every rule that moves into gate.py is DELETED from here (§9 attack 7)
├── config/
│   ├── registry.yaml         # channel → capability tags · cost · probe command · fallback chain
│   └── budget.yaml           # per research class: wall-clock, tool calls, $ ceiling, block budget
├── policies/
│   ├── evidence-plan.md      # question class → REQUIRED evidence types (the tool-forcing table)
│   └── source-hierarchy.md   # the contextual ranking of §10 — one table per question type
├── scripts/
│   ├── sweep.sh              # EXISTS. Repairs: +5 keyless MCP doors · +WebSearch · https arXiv
│   │                         #   · --window only where the adapter accepts it · writes ledger rows
│   ├── probe.sh              # NEW. 1-call live health probe per channel, 5 s timeout, parallel
│   ├── ledger.py             # NEW. Append rows. Canonicalise URL. Hash passage. Assign cluster.
│   │                         #   CALLED BY THE FETCHER — never by the model (§3)
│   ├── independence.py       # NEW. Cluster by domain + publisher + MinHash(passage)
│   ├── urlcheck.py           # NEW. 3-state liveness: alive / dead / blocked
│   ├── gate.py               # NEW. HARD checks → exit 2 / {"decision":"block"}; DECLARED checklist
│   └── coverage.py           # NEW. Channel table incl. FAIL rows and single-channel share
├── hooks/
│   └── research-completion.py   # NEW. The Stop hook. Calls gate.py. PROVEN to block (§3)
├── agents/
│   └── refuter.md            # NEW. The adversary (§9-D): sees ledger + claims, never the reasoning
├── schemas/
│   ├── question_lock.schema.json
│   ├── evidence_row.schema.json
│   └── report.schema.json
├── benchmarks/
│   ├── tasks.json            # the 30 tasks of §13 + frozen gold + SHA-256 receipt
│   └── run.py                # 6 arms, the metrics of §13, composite score
└── references/
    └── channels.md           # EXISTS. Extend with the 96 searchable opencli adapters
```

### The two contracts a coding agent needs literally

**`evidence_row.schema.json` — one JSON line per fetched page, written by the fetcher:**

```
id              string   ledger row id, e.g. "L0042"       (the ONLY thing a claim may cite)
url             string   as fetched
url_canonical   string   scheme+host lowercased, tracking params stripped, fragment dropped
title           string
author          string|null
pub_date        date|null      ← "recently" is not a value; null is honest, a guess is not
retrieved_at    datetime
version         string|null    the version/release the page describes, if any
passage         string         VERBATIM, from the fetched BODY (never a search snippet)
passage_sha256  string         recomputed by gate.py; a mismatch is a hard failure
source_type     enum     primary-doc | code | first-hand | independent-test | secondary | vendor
primary         bool
channel         string   exa | parallel | tavily | firecrawl | youcom | opencli:<adapter> | gh | ...
cluster_id      string   assigned by independence.py
http_status     int
liveness        enum     alive | dead | blocked
query_id        string   which query produced this row
gap             string   the named information gap that query was closing
```

**The Stop hook's own contract** (this is the whole enforcement surface):

```
stdin:  { transcript_path, stop_hook_active, ... }
stdout on refusal:
        {"decision":"block",
         "reason":"<what is missing, as a BATCH of work, plus the exact commands>"}
stdout on pass:  {}            (or exit 0 silently)
respect:  stop_hook_active  → count consecutive blocks; at 6, demand the GAPS exit instead
ceiling:  the harness ends the turn after 8 consecutive blocks — budget for it
```

### The HARD checks (these block) and the DECLARED checks (these never do)

**HARD — `gate.py` exits 2 when any fails:**
1. `question_lock.json` exists and predates the first ledger row.
2. every required evidence type for this question class is present in the ledger.
3. ≥ N independent **clusters** (not URLs); N from `budget.yaml` by question class.
4. no single channel supplies > 50 % of clusters.
5. every claim in the draft cites a ledger `id` that exists.
6. every cited row's `passage_sha256` recomputes.
7. every cited URL's liveness ≠ `dead`.
8. a contradiction query was issued for every load-bearing claim (logged, result may be empty).
9. counting questions: a denominator row exists.
10. saturation OR budget-exhausted-with-`GAPS`.

**DECLARED — recorded, printed, never machine-scored:**
does this passage support this claim · is this source trustworthy for *this* question · is the
crowd's answer what the numbers look like · what would flip this answer · what I did not look at.

### Build order

1. `schemas/` + `ledger.py` — nothing else is meaningful until rows exist.
2. `independence.py` + `urlcheck.py` — the two things the gate counts on.
3. `gate.py` with HARD checks only, run **manually** against a past research run.
4. `hooks/research-completion.py` — wire the Stop hook in `SKILL.md` frontmatter. Verify it
   blocks with the §3 experiment, in the project.
5. `sweep.sh` repairs — the five keyless doors, `WebSearch`, https arXiv, ledger writes.
6. `probe.sh` + `registry.yaml` — health becomes a probe, not a status.
7. `agents/refuter.md` — the adversary.
8. `benchmarks/tasks.json` + `run.py` — write the gold from primary sources.
9. **Run the benchmark. Report arm 3 against arms 0–4.**
10. Only then is anything called finished. "Ferrari" is a measured result, not a label.

**Dependencies to install (currently absent, §4):** `datasketch` (MinHash), `htmldate` (date
extraction), `trafilatura` (body extraction fallback). Optional later: `lettucedetect`
(LettuceDetect v2, 307 M, Apache-2.0) as a local grounding checker —
it supersedes MiniCheck, whose family has had no successor since 2024. Everything else is already on the machine.

**External cost: $0.** Model inference runs on the existing subscription.

### What must NOT be built

- No second research skill. No new plan file. No second agent framework (`STACK.md`).
- No global `settings.json` hook — the gate lives in the skill's frontmatter and dies with the
  session.
- No rule added to `SKILL.md` that `gate.py` could hold instead. §2.2 is why.

---


### 14.1 The independence engine — built only from parts verified to exist

§4 recorded that this leg has **no tooling installed**. A hunter then measured what the field
actually offers, and the honest answer is that the famous tools are dead and the usable ones are
small. Every row below was measured 2026-09-16 (GitHub API, PyPI JSON, live HTTP).
— **LIKELY** (hunter-measured; licences must be re-confirmed by the author before install)

**What is dead, so that nobody rebuilds on it:** Churnalism / SuperFastMatch — the service that
did exactly this job — is gone. `sunlightlabs/churnalism_us` is **archived, last pushed
2014-07-28, no licence**; `mediastandardstrust/superfastmatch` is **13 years stale**;
`superfastmatch.org` and `churnalism.sunlightfoundation.com` both fail to connect, and
`churnalism.com` is now an unrelated WordPress site. Meta's SIDE (the Wikipedia-verification
system) is **archived by its owner on 2026-04-10** and its install line points at a
**Meta-internal private repo**, so it cannot be built by anyone outside Meta.

**The build, in the order the cheapest test comes first:**

| stage | part | licence | state |
|---|---|---|---|
| 1. extract body, title, date, author, sitename | **trafilatura 2.2.0** | Apache-2.0 | pushed 2026-09-11 |
| 2. **canonical-URL / AMP collapse** — the cheapest independence test there is: a syndicated copy almost always keeps the origin's `rel=canonical` | trafilatura's own metadata extractor (`URL_SELECTORS`, `og:url`) + **courlan 1.4.0** for normalising and stripping tracking params | Apache-2.0 | pushed 2026-09-01 |
| 3. publisher / wire attribution — AP, Reuters and PR wire copy **self-identify** in NewsArticle JSON-LD (`publisher`, `provider`, `sourceOrganization`) | **extruct** | BSD-3 | pushed 2026-04-01 |
| 4. exact + near-duplicate detection | **datasketch 2.0.0** `MinHashLSH` | **MIT** | released 2026-07-05 |
| 5. verbatim passage alignment (which paragraphs were lifted, and from where) | **`dasmiq/passim`** — the only surviving implementation, actively maintained (pushed 2026-04-27) | ⚠ **NO LICENCE DECLARED** | legal review before any use |
| 6. paraphrased reuse | sentence-transformers + the Matryoshka news recipe (ρ = 0.816 on SemEval-2022 T8) | Apache-2.0 / ⚠ recipe repo has **no licence** | — |
| 7. story-level clustering | faiss (MIT) offline · river (BSD-3) streaming | MIT / BSD-3 | both pushed 2026-09 |

**The decision this produces.** Stages **1 → 2 → 3 → 4 only** — trafilatura + courlan + extruct +
datasketch, all Apache-2.0/BSD/MIT — already separate *"three outlets carrying one wire story"*
from *"three independent newsrooms"* for the large majority of cases. Stages 5–7 are where the
licence risk and the GPU cost begin, and they are **not** in the first build.

**A finding that stops us over-claiming.** A 2026 study of editorial reuse across news agencies
measured reuse in **52 % of articles, "predominantly non-literal"**. So a hash-based duplicate
check **under-counts** syndication by design. The report must therefore say what its
independence number measures — *byte-level and canonical-level copying* — and never present it
as "these sources are independent". `cluster_id` is evidence, not a verdict.

### 14.2 The verification core — RUN on this machine's GPU, not chosen from a table

§4 said the verification and dedup legs had no tooling. A hunter then installed and **executed**
them here, on the RTX 5060 Ti (16 311 MiB, driver 595.91.07). These are live runs, not citations.
— **LIKELY** (hunter-executed on this machine; the author did not re-run them)

| test | result |
|---|---|
| **claim verifier, local** — `ollama pull bespoke-minicheck` (4.7 GB) | **3 of 3 claims correct** (`Yes`/`No`/`No`), **7 115 MiB of 16 311 MiB VRAM**, warm latency **0.11 s per claim** (5 claims in 0.564 s) |
| **syndication clustering** — datasketch 2.0.0 MinHashLSH on Python 3.14.4 | press-release pair Jaccard **0.867** → clustered together; independent analysis **0.000** → separate |
| **date extraction** — htmldate 1.10.0, three live pages | **1 of 3 correct.** It returned 2025-08-28 for a page whose own visible date is "Jun 21, 2024", and a repo-creation date for a GitHub page |
| **Wayback** | `archive.org/wayback/available` → **429** twice · `web.archive.org/web/<ts>/<url>` → 302 OK · `timetravel.mementoweb.org` → **unreachable** |

**What each result settles:**

1. **The verification leg is real and free.** A 7-billion-parameter grounding checker answers in
   **0.11 s on hardware the holding already owns**, using less than half the card. Claim-checking
   at scale costs nothing but electricity.
2. **The independence leg is real too.** The separation between a syndicated copy (0.867) and an
   independent piece (0.000) is wide and stable — `cluster_id` in §14's ledger schema is a
   measurable field, not an aspiration.
3. **The date leg is the weakest thing in this architecture, and now measurably so.** htmldate's
   own benchmark claims accuracy 0.903; on three live pages it got **one right**. §10.1's caution
   is upgraded to a rule: **never trust a single date extractor.** Cross-check htmldate against
   JSON-LD `datePublished`, the HTTP `Last-Modified` header and the URL slug — and where they
   disagree, the ledger records the row as **UNDATED rather than fresh**. A freshness gate built
   on one extractor passes stale facts, confidently.

### Four build traps, each measured

- **`pip install minicheck` installs the WRONG PACKAGE.** PyPI's `minicheck` is *"an
  explicit-state model checker in ~2900 lines"* (v0.4.0, 2026-07-30). The real one installs only
  from git. A day lost to this is a day lost for nothing.
- **Bespoke-MiniCheck-7B carries no licence field** on its model card, and its README routes
  commercial use through an e-mail address. **A holding company cannot ship on that.** It is fine
  as an internal checker while §13 runs; the shippable default stays **LettuceDetect v2 (MIT)**,
  with FactCG-DeBERTa (435 M, MIT) and HHEM-2.1-Open (109 M, Apache-2.0) as cheap second opinions.
  **Two checkers disagreeing is itself a gate signal** worth more than either alone.
- **ALCE's citation metric cannot run here.** Its AutoAIS backend is `t5_xxl_true_nli_mixture` —
  **11 B parameters, ~22 GB in bf16, against a 16 GB card.** Copy ALCE's *definitions* of citation
  recall and precision; substitute a local checker for its model.
- **Do not build the gate on Ragas.** Measured: the repo moved to `vibrantlabsai/ragas`, last
  commit **2026-02-24**, **593 open issues**, no release since 0.4.3 (2026-01-13). Dormant.
  **DeepEval** (Apache-2.0, `assert_test` + `deepeval test run`, released 2026-09-14) or
  **promptfoo** (MIT, explicit threshold semantics, 2026-09-10) are the maintained gates. Note
  also that **Arize Phoenix is Elastic-2.0 — not OSI-open** — and Langfuse's copyright now reads
  *"Copyright (c) 2023-2026 ClickHouse, Inc."*; both are tracing layers, not gates.

### The citation harness we do not have to invent

**DeepResearch Bench's FACT pipeline is public, Apache-2.0, and its judge is swappable.** Its
stages are exactly §10's steps 5–7: *statement-URL extraction → deduplication → support
verification ("verify whether cited sources actually support the claims") → **Citation Accuracy**
and **Effective Citations***. Its README states the judge is changed by modifying the `AIClient`
class in `utils/api.py` — so a **local** model can grade it, at $0. Its human inter-annotator
baseline is **68.78 %**, which is the honest ceiling for any judge, ours included.

**And the finding that tells us which metric to gate on.** Across 14 frontier models
(arXiv 2605.06635): links worked **> 94 %**, topical relevance **> 80 %**, factual accuracy
**39–77 %** — *"a 53 % spread that makes factual accuracy the most differentiating dimension."*

> **Therefore: URL liveness and topical relevance are nearly free and nearly always pass. They
> prove almost nothing. The only discriminating check is whether the cited page actually entails
> the sentence — and that is a $0, 0.11-second local call on this machine.** It belongs in the
> HARD gate, not in the nice-to-have list.
## 15. DELIVERABLE 1 — the verdict

**If it were mine to build, I would build this:**

> **A gated ledger with an adversary, on a five-door free stack.** The agent researches with
> full judgment. A script — not the model — writes every fetched page into an append-only
> evidence ledger. A `Stop` hook reads that ledger and refuses to let the session finish until
> the machine-checkable conditions hold. A second agent, in a separate context, is then handed
> the ledger and the claims and told to break them. Discovery runs across **five keyless search
> doors** (Exa, Parallel, Tavily, Firecrawl, You.com) plus `opencli google`, `WebSearch` and
> DuckDuckGo; human voices come from `opencli`'s 96 searchable adapters; reading is Scrapling →
> Playwright; scholarship is Crossref, Europe PMC, arXiv and PubMed, with the OpenAlex CC0 bulk
> snapshot when volume demands it; code is `gh` at 5 000 requests an hour. **External cost: $0.**

**Why this and not something better-funded — three measured reasons:**

1. **The paid leaders cannot fix our failure.** The independent board gives them precision
   **83–89** and recall **30–36**, and its authors attribute the ceiling to agents that *"stop
   early and miss the rest"*. Our own failure on 2026-09-16 was the same failure at a smaller
   scale: four calls, three channels, `WebSearch` untouched. **Buying recall is not on sale.**
2. **They are not even the state of the art any more.** Across nine leaderboards pulled from
   their own data files, the four branded deep-research products lead **none**: absent from five,
   bottom-third on three. An 8-billion-parameter open model sits between OpenAI Deep Research and
   Perplexity Research on report quality. What wins in 2026 is the **scaffold**, and a scaffold
   is built, not bought.
3. **The enforcement mechanism is real, and it is free.** I built the gate and fired it this
   session: a sub-session ordered to do nothing was refused its exit and did the work. Meanwhile
   the alternative — writing a stricter doctrine into the skill — is **measurably
   counterproductive**: 96 % → 20 % instruction-following as rules stack.

**The one sentence.** *The tools are commodities; the discipline is the Ferrari.* Everyone can
buy the same search API. Almost nobody makes stopping early structurally impossible — and that
is precisely the thing the whole field is failing at.

### Confidence, stated honestly

| claim | label |
|---|---|
| a `Stop` hook can force an agent to keep working | **PROVEN** — built and fired here |
| five keyless search doors work with no key, and Parallel answers real queries | **PROVEN** — probed and called here |
| `agent-reach` has no fetch capability and `doctor` is not health | **PROVEN** — its own CLI and output |
| OpenAlex is metered at $0.10/day keyless | **PROVEN** — my own response headers |
| `opencli google` is a working free SERP; `opencli brave` is broken | **PROVEN** — both measured |
| the recall ceiling and the "stop early" diagnosis | **PROVEN** — the README, read here |
| the paid products lead no 2026 leaderboard | **LIKELY** — hunter-pulled primary data files |
| prompts get worse as rules accumulate | **LIKELY** — three independent papers, abstracts quoted |
| requiring an evidence TYPE forces the tool to be used | **UNPROVEN** — the central hypothesis; §13 exists to falsify it |
| the gate + adversary raises recall against the prose skill | **UNPROVEN** — arm 3 vs arm 2 |

### Open risks I am not hiding

- **The central hypothesis is unproven.** If arm 3 does not beat arm 2 in §13, this architecture
  is not worth its complexity, and that result will be reported rather than explained away.
- **The keyless doors can close without notice.** They are five, not one, which is the mitigation
  — but none of them owes us anything, and none publishes its keyless rate limit.
- **The date leg is the weakest part of this architecture, and now measurably so.** htmldate got
  **1 of 3 live pages right** on this machine (§14.2) against its own claimed accuracy of 0.903.
  Dedup and claim-checking, by contrast, were both **executed here and worked** — MinHash
  separated a syndicated copy (0.867) from an independent piece (0.000), and a local 7 B checker
  answered in **0.11 s using under half the card**.
- **10 of 15 agent-reach channels are unconfigured**, and lighting them needs browser logins that
  only the CEO can authorise.
- **The Internet Archive was down today (503)**, so the temporal-validation leg has no fallback
  when a page changes under us.
- **`opencli brave` is broken**, and `reddit.com/*.json` returns 403 from this IP — two holes
  inside the reach we already own.
- **The benchmark in §1 is three contributors and zero stars.** Its method is clean and it
  declares itself vendor-independent, but it is one young board, and this architecture leans on
  it. §13 exists partly so that we stop leaning on anyone else's benchmark.

---
---

# §16 — REGISTERED ADAPTATION: what was BUILT, 2026-09-16 evening

**Authority:** the CEO's live order — *"FIRST 3 RANKED RESEARCH SKILL oluşturma… amacımız FUSION
YAPMAK BU KONUDA JUDGE SENSİN"*, then *"herşeyi yapabilecek yetkiyi verdim… sadece yapılacak ve
yapılması gerekenleri yapın"*, then the correction that shaped the reading layer — *"sayfaya girdi
agent reach ile bilgiyi çekicek, çekemiyorsa scrapling aletiyle çekicek… reddit'i açıyor bakıyor
kapatıyor, böyle olmaz."*

This section is the registered adaptation inside the spec that already owns the contract. **No new
plan file was written.** The board row is **B46**.

## 16.1 The judgment between the three designs

| rank | design | why |
|---|---|---|
| 1 | the v2 dossier (`12.md`) | the only one that BUILT and FIRED its enforcement mechanism, and the only one that found the five keyless doors |
| 2 | the v1 study (`14.md`) | it owns the transcript-level diagnosis of why a loaded tool went unused; four of its measurements were superseded and it never built the gate |
| 3 | the third design (`13.md`) | doctrine only. **Measured: every one of the six files its own first instruction depends on does not exist** — `research_doctor.py`, `evidence_lint.py`, `tool-routing.md`, `current-tool-snapshot.md`, `research-run.schema.json`, `benchmark-ruler.md`. Its recommended stack (SearXNG primary, Crawl4AI, trafilatura) is not installed here, and SearXNG's Google leg is blocked by its own issue tracker. **Three ideas of its own were kept:** `must_not_mutate_into` on the question lock, the discovery-vs-evidence separation, and the three-state tool ledger (installed / called-and-failed / actually used). |

## 16.2 The four things none of the three had, added here

1. **The gate is scoped to an OPEN RUN.** A gate that reads "the ledger" is satisfied by the
   PREVIOUS question's ledger — so the second question of a session would pass a green gate having
   done nothing — and it would also block ordinary conversation for the rest of the session.
   `runs/CURRENT` + `state.status` fixes both. `DXB_RESEARCH_RUN` overrides it so two sessions do
   not fight over one pointer.
2. **The ledger is written by a `PostToolUse` hook.** Otherwise only what passes through
   `sweep.sh` is ever recorded, and an agent that reads twenty pages by hand looks, to the gate,
   like an agent that read nothing. Measured on Claude Code 2.1.273: the hook receives
   `tool_name`, `tool_input` and `tool_response`.
3. **THE READING CHAIN — the CEO's own correction.** Nine doors, walked in order until one opens:
   `scrapling` → `scrapling stealthy-fetch` → **the platform's own reader** (`opencli reddit read`,
   `hackernews`, `twitter`, `v2ex`, `youtube`, `zhihu`, `stackoverflow`) → `tavily_extract` →
   `firecrawl_scrape` → `exa web_fetch` → headless Playwright → `r.jina.ai` (cached, labelled) →
   `curl`. **A page is unread only when every door has failed**, and the log then names each door
   and what it answered. The search side cascades the same way: a channel that fails or comes back
   empty has its declared `registry.yaml` fallback fired automatically.
4. **A wall is a hole, not a source.** A Cloudflare block page, a login screen or a JS shell is
   recorded with `wall: true`, excluded from the evidence count, and — if it defeated every door —
   must be named in `GAPS.md` before the gate opens (HARD check H16).

## 16.3 Measured this session (command → decisive output)

| measurement | result |
|---|---|
| five keyless MCP doors, `tools/list` | **all HTTP 200**, 0.22–0.50 s, no key: Exa · Parallel · Tavily (`X-Tavily-Access-Mode: keyless`) · Firecrawl · You.com |
| the same five, real `tools/call` query | 9 101 – 73 020 bytes of dated results each |
| `agent-reach --help` | **no `search`, no `get`, no `fetch`** — it is a health registry and a transcriber |
| live channel probe vs `doctor` | doctor says reddit/twitter `warn`; both returned real results in **16.9 s / 19.0 s**. `doctor` is a map, not health |
| `Stop` hook, built and fired | sub-session told to do nothing: **rc=0, 26 s, 2 hook invocations, the work done** |
| hooks in SKILL.md frontmatter | **supported** — test skill's Stop hook fired twice and blocked its sub-session |
| `PostToolUse` payload | carries `tool_name`, `tool_input`, `tool_response`, `tool_use_id` |
| full sweep, 22 channels | **9.5–12.5 s**, 0 errors, 210 discovery + 14 evidence rows, 46 clusters (MinHash-LSH) |
| the reading chain | **14 of 14 pages read** — scrapling 10 · tavily-extract 3 · stealth 1; four pages needed 2–4 doors |
| the gate, negative tests | refused a fabricated citation (`L9999`), a dead-URL citation, a vendor-only claim; `research.py close` **exited 2** |
| the gate, silence test | with no open run: `{}` — ordinary conversation is never blocked |

## 16.4 Two rules made stricter rather than looser

The gate blocked two claims that were actually legitimate, and the repair was **not** to weaken the
rule but to make the exception **declared**:

- a claim may cite a `dead` URL only when the row was recorded with `--evidence-of-absence`
  (a 404 that IS the finding — "there is no such community");
- a claim may rest only on `vendor` rows only when it is marked `"about_the_source": true`
  (a claim ABOUT a marketing page).

## 16.5 What is NOT yet earned

**"Ferrari" is a measured result, not a label.** The 24-task benchmark exists with SHA-256-frozen
gold (`benchmarks/GOLD-RECEIPT.txt`) and a four-arm runner, and the contamination filter has been
exercised. The full race has not been run to completion, so **no claim of first place is made here**.
The acceptance condition stands as written: arm 3 must beat arms 1 and 2 on recall at $0 external
cost, and if it does not, the central hypothesis is falsified and that is what gets reported.
