# 16 — `open-jarvis/OpenJarvis` · *"Personal AI, On Personal Devices"*

> **The CEO's own words for this row:** *"JARVIS REPOSU"*. He handed it over inside the sentence
> that orders this whole capability — `docs/source-architecture-notes-sanitized.md` line 17:
> *"mutlaka bir **JARVIS SISTEMI** kurulmasını istiyorum … Ör: sabah kalktığımda Jarvis bana şu
> konuda rapor ver dediğimde sesli bir şekilde …"* — with a video link beside it that had never
> owned a ledger row until he caught it himself on 2026-08-10 (now **row 36**).
>
> **What it is.** A **Stanford research framework** — Hazy Research and the Scaling Intelligence Lab
> at Stanford SAIL — for personal AI that runs on the owner's own hardware, with a published paper
> (arXiv 2605.17172) and a leaderboard. **273,577 lines of Python across 1,318 files**, and its
> **single largest component is not the agents — it is the measurement harness.**
>
> **How it was read.** The clone on disk was opened file by file: the tree mapped, every module's
> file count and line count counted, and the decisive files read in full — the morning-digest agent,
> the router, the complexity scorer, the scheduler, the run-trace type, the skills package and the
> connector list. Nothing here is quoted from the README that was not also found in the code, and
> every DXB number beside it was measured this session against the company database and this
> repository.

---

## 1. Source identity

| Field | Measured value |
|---|---|
| Address | `https://github.com/open-jarvis/OpenJarvis` |
| Clone on disk | `.planning/research/rival-intel/repos/openjarvis` — **146 MB**, **2,033 tracked files** |
| Commit read | **`93fc7b9e7759717bdc618097debe7cd0c4abf6ef`** — `chore: update clone traffic data [skip ci]`, 2026-07-28T08:29:18Z |
| **Drift, measured today** | The clone is **28 commits behind `main`** (GitHub compare API, `93fc7b9…main`: `ahead_by 28, behind_by 0`). The 28 are maintenance — a Windows daemon-detach fix, a `SessionStore` `:memory:` path fix, a dev WebSocket-proxy fix, docs on giving an agent OS-level access, and clone-traffic bot commits. **Nothing in this reading rests on a file those commits touched**, and the drift is recorded rather than hidden |
| Stars · forks · watchers · open issues | **8,492** · **1,938** · **133** · **95** (GitHub API, this session) |
| Licence · language · created · pushed | **Apache-2.0** · Python · **2026-02-15** · **2026-08-10T07:26:46Z** — pushed the morning of this reading |
| Home · paper | `openjarvis.stanford.edu` · arXiv **2605.17172** |
| Owners | Hazy Research + Scaling Intelligence Lab, Stanford SAIL. Sponsors printed in the README: Laude Institute, Stanford Marlowe, Google Cloud, Lambda Labs, Ollama, IBM Research, Stanford HAI |
| Top contributor | `jonsaadfalcon` — **504 contributions** |
| Releases | `1.0.0` 2026-05-15 · `1.0.1` 2026-05-17 · `1.0.2` 2026-05-24, then an open `[Unreleased]` section — tagged releases stopped in May while the pushes did not |
| Tests | **575 test files** |

---

## 2. File-by-file record — the tree as it is on disk, module by module

Counted, not estimated: every `.py` under each package, with its line total.

| Module | Files | Lines | What is in it, read from the code |
|---|---|---|---|
| `evals` | **147** | **37,178** | **The largest component in the framework.** 43 dataset adapters, 41 scorers (`swebench_harness`, `terminalbench_judge`, `morning_brief`, `email_triage`, `daily_digest`, `security_scanner`, `gaia_exact`, `hle_judge`…), backends, environments, trackers for Weights & Biases and Google Sheets, and `core/` holding the runner, the pricing table and the trace type |
| `agents` | 53 | 22,181 | The eight built-ins plus the machinery around them: `morning_digest`, `deep_research`, `monitor_operative`, `orchestrator`, `native_react`, `operative`, `native_openhands`, `simple`, and beside them `loop_guard`, `executor`, `manager`, `proactive_agent`, `research_loop`, `claude_code`, `opencode` |
| `cli` | 53 | 14,803 | 40+ commands. Among them `doctor`, `connect`, `digest`, `memory`, `optimize`, `bench`, `eval`, `mine`, `operators`, `gateway`, `daemon`, `channel`, `registry`, `feedback` |
| `learning` | 81 | 14,435 | The loop that improves the system from its own traces: `routing/` (complexity scorer, heuristic policy, learned router, reward), `optimize/` (DSPy-style optimiser, search space, trial runner, store, personal + feedback), `training/`, `spec_search/`, `learning_orchestrator.py` |
| `tools` | 54 | 12,067 | The tool layer the agents call |
| `connectors` | **39** | 11,784 | The outside world, one file each: `gmail`, `gmail_imap`, `gcalendar`, `gcontacts`, `gdrive`, `google_tasks`, `google_auth`, `oauth`, `outlook`, `notion`, `obsidian`, `dropbox`, `granola`, `apple_health`, `apple_notes`, `apple_music`, `apple_contacts`, `imessage`, `oura`, `github_notifications`, `hackernews`, `news_rss`, plus `embeddings`, `embedding_store`, `hybrid_search`, `retriever`, `chunker`, `pipeline`, `attachment_store` |
| `server` | 24 | 10,379 | The HTTP/WebSocket surface behind `jarvis serve` |
| `channels` | **34** | 5,960 | Where the assistant can be spoken to: `slack_daemon`, `discord_channel`, `signal_channel`, `matrix_channel`, `imessage_daemon`, `bluebubbles`, `sendblue`, `email_channel`, `gmail`, `google_chat`, `feishu`, `line_channel`, `mattermost`, `rocketchat`, `messenger_channel`, `mastodon_channel`, `nostr_channel`, `reddit_channel`, `irc_channel`, and a WhatsApp bridge |
| `engine` | 14 | 4,098 | The inference engines it can drive — Ollama, vLLM, llama.cpp, SGLang, MLX, Lemonade (read from `ModelSpec.supported_engines`) |
| `telemetry` | 19 | 3,764 | Power and energy sampling, correlated to runs |
| `core` | 8 | 3,292 | Registry and types — `ModelSpec`, `RoutingContext`, `Quantization` |
| `skills` | 18 | 2,834 | `parser`, `loader`, `importer`, `executor`, `manager`, `dependency`, `overlay`, `security`, `index`, `tool_adapter`, `tool_translator` |
| `mining` | 16 | 2,483 | Harvesting training signal out of local traces |
| `security` | 18 | 2,250 | `boundary`, `capabilities`, `guardrails`, `injection_scanner`, `taint`, `credential_stripper`, `file_policy`, `rate_limiter`, `signing`, `ssrf`, `subprocess_sandbox`, `severity_policy`, `audit` |
| `scheduler` | 4 | 875 | `cron` / `interval` / `once` tasks on **SQLite**, background polling thread |
| `memory` | 4 | 628 | `FactExtractor` + `FactStore` — durable facts pulled out of conversations in the background |
| `sandbox` · `sessions` · `a2a` · `mcp` · `speech` · `workflow` · `recipes` · `operators` · `prompt` · `analytics` · `bench` · `traces` · `system` | 4-19 each | 291-1,632 each | agent-to-agent messaging, MCP client, speech, workflow, recipe data, prompt assembly, analytics, benchmarks, trace storage |

### 2.1 The five files that decide what this framework is

**(a) `evals/core/trace.py` — what one run is required to record.** `QueryTrace` carries, per query
and per turn: `total_wall_clock_s`, input/output tokens, tool-call count, `cost_usd`,
**`query_gpu_energy_joules`**, **`query_cpu_energy_joules`**, **`query_gpu_power_avg_watts`**,
**`query_cpu_power_avg_watts`**, memory-bandwidth utilisation average and peak, `completed`,
`timed_out`, `is_resolved` — and two error fields with a comment that states the rule in the code
itself:

> *"``error_kind`` distinguishes infrastructure failures (`harness_error`: task env / Docker / tmux
> broke, or the agent never contacted the model) from agent failures (`agent_error`). Harness errors
> are excluded from resolve-rate by export/summary code so they are never silently counted as model
> misses."*

**(b) `agents/morning_digest.py` (251 lines) — the exact behaviour the CEO ordered.** The system
prompt is assembled from a persona file, today's date and time, and **the owner's preferred
honorific** (`sir` by default). It then fixes the briefing's shape: **six sections in decreasing
order of importance** — greeting + priorities, schedule, messages, health, world, closing — with
**explicit triage rules** (people needing a reply first, deadlines second, casual threads last,
*"SKIP automated emails, newsletters, and marketing entirely"*), and a set of absolute rules:

> *"ONLY facts from the data. Zero hallucination. NEVER mention disconnected or unavailable sources.
> NEVER state raw health numbers … Interpret, never enumerate. NEVER describe actions you are
> taking. Acknowledge every source that returned data, even briefly. No markdown, emojis, bullets,
> or headers. STRICT LIMIT: 200 words."*

The data is **collected before the model is called** — *"The data has ALREADY been collected … You do
NOT fetch anything yourself"* — from a source map wired to real connectors: `messages` ← gmail,
slack, google_tasks, imessage, github_notifications; `calendar` ← gcalendar; `health` ← oura,
apple_health; `world` ← weather, hackernews, news_rss.

**(c) `learning/routing/complexity.py` + `router.py` — how it decides how much machine to spend.**
A query is scored 0.0-1.0 by regular expressions over five signal families — code, mathematics,
reasoning, multi-step, creative — producing a tier and a **suggested token budget**, then adjusted
upward for models known to burn output tokens on internal thinking (`qwen3.5`, `qwq`, `deepseek-r1`,
`o1-`, `o3-`, `o4-`). The router picks a model from the registry against that context.

**(d) `scheduler/scheduler.py` — a scheduled task is four fields.** `prompt`, `schedule_type`
(`cron` | `interval` | `once`), `schedule_value`, and **`context_mode`, default `isolated`** — the
scheduled run is not allowed to inherit the chat's context unless it is told to.

**(e) `skills/` — a skill is a file, and a tool.** Markdown manifests parsed into `SkillManifest`
with steps, a dependency graph with cycle and depth checks, a **capability union** computed across
dependencies, an importer for outside catalogues, and a `SkillTool` adapter so a skill is discovered
and invoked like any other tool. The README names the pools it imports from: **Hermes Agent (~150
skills)** and **OpenClaw (~13,700 community skills)**, both under the **agentskills.io** open
standard.

---

## 3. Capabilities — measured against what it claims

### 3.1 What it produces

- **8,492 stars, 1,938 forks, 133 watchers, 95 open issues**, Apache-2.0, pushed **the morning of
  this reading** (2026-08-10T07:26:46Z). Its top contributor has **504 contributions** to it.
- **A published paper** (arXiv 2605.17172, fourteen named authors, Christopher Ré and Azalia
  Mirhoseini among them) and a **public leaderboard**, which is a form of output almost nothing else
  on this queue has: it invites the world to measure it.
- **Institutional backing that costs money:** Laude Institute, Stanford Marlowe, Google Cloud,
  Lambda Labs, Ollama, IBM Research, Stanford HAI.
- **A shipped product surface:** one-line installers for macOS/Linux/WSL2 and native Windows, and
  desktop builds as `.exe` / `.dmg` / `.deb` / `.rpm` / `.AppImage`.
- It does not sell anything, so it earns no revenue, and this report claims none. Its output is
  measured in adoption, published research and shipped installers.

### 3.2 The claim it makes, and where the claim lives in the code

The README's argument is that local models already handle **88.7 % of single-turn chat and reasoning
queries**, with intelligence efficiency improving **5.3× from 2023 to 2025**, so the missing piece
was never the model — it was the stack. **The code backs that with structure rather than with
adjectives:** `engine/` drives six local inference engines, `intelligence/model_catalog.py`
registers local models down to **Qwen3 0.6B** with parameter counts and context lengths, `telemetry/`
samples power, and `evals/` weighs energy and cost beside accuracy.

### 3.3 The one that matters most — the harness is bigger than the agents

`evals` is **37,178 lines against `agents`' 22,181**. A framework whose measurement code outweighs
its behaviour code by **1.7×** is making a statement about what it believes, and it is the same
sentence written into this holding's constitution: **measure, never guess.** Its 41 scorers include
one for a morning brief and one for email triage — the same two jobs this holding asks of Hamza,
scored rather than admired.

### Aliveness — the four clocks in this framework, and what DXB takes

**1 — What runs on its own clock.** Three execution modes are declared in the README and present in
the code: **on-demand**, **scheduled** and **continuous**. `monitor_operative` and `operative` are
the continuous pair — long-horizon agents with memory, compression and retrieval; `morning_digest`
is the scheduled one; the rest answer when asked. Under them `scheduler/scheduler.py` keeps
`cron` / `interval` / `once` tasks in SQLite with a background polling thread, and each task
declares its **`context_mode`** so a 07:00 run starts clean instead of dragging last night's chat
behind it.

**2 — What makes the surface breathe.** Two mechanisms carry a change from inside the system to the
owner. The first is the **memory service**, which runs in the background of `jarvis serve` /
`jarvis chat` and extracts durable facts out of conversations as they happen, so the next session
opens knowing more than the last one closed with. The second is **`channels/` — 34 files** — the
assistant reaches the human where the human already is: Slack, Discord, Signal, Matrix, iMessage,
e-mail, WhatsApp, and fourteen more.

**3 — How it answers the human.** The morning digest is the clearest specimen on this queue of the
behaviour the CEO described in his own sentence: data gathered first, then one spoken briefing of
**2-4 minutes under a 200-word ceiling**, opened with his honorific, ordered by importance, with
related items connected across sources (*"Your rebuttals are overdue and you have a dinner at 6, so
I'd tackle those first"*), and interpretation instead of enumeration (*"your sleep has improved three
nights running"*, never *"HRV 53"*). The router underneath decides how much machine each question
deserves before the answer is composed.

**4 — What DXB takes.** Four mechanisms, none of them requiring this framework to be installed:

- **Price the tokens we already count.** Their trace carries `cost_usd` per turn as a first-class
  field. Ours carries the column and never fills it: `cost_ledger` holds **1,590 rows and
  5,721,728,099 tokens** and the cost is **€0.0000 on every single row** (R, §4). **P16-1**.
- **Split the two kinds of failure.** Their `error_kind` separates a broken harness from a wrong
  agent. Ours has one `status`: **128 of 378 runs are `failed`**, and inside that number sit 18
  runs that failed because an API key was not set and 6 stale zombies — configuration and
  housekeeping counted as agent error (R, §4). **P16-2**.
- **The briefing contract.** Six sections in decreasing importance, a word ceiling, interpret rather
  than enumerate, connect related items, and never name a source that returned nothing. Our own
  briefing is deterministic and honest and has **none of these five rules** (R, §4). **P16-3**.
- **A standing benchmark for our own agents.** They score a morning brief and an email triage as
  datasets. We have **575 tests** of correctness on their side of the comparison and no scored
  measurement of whether an agent's *answer* is any good over time. **P16-5**.

---

## 4. What DXB has today — measured this session

| Lane | OpenJarvis, measured | **DXB, measured 2026-08-10** | Evidence |
|---|---|---|---|
| **Cost per run** | `cost_usd` on every turn and every query, with a pricing table in `evals/core/pricing.py` | **We count tokens and never price them.** `cost_ledger`: **1,590 rows**, **5,721,728,099 tokens**, **€0.0000 total** — across six models (`<synthetic>` 948, `claude-fable-5` 282, `claude-sonnet-5` 113, `claude-opus-4-8` 109, `claude-opus-5` 102, `claude-haiku-4-5` 36), **every one of them at zero**. On `agent_runs`, `cost_eur > 0` holds for **0 of 378** rows while 291 carry tokens | R — `psql`: `cost_ledger_rows=1590 · cost_ledger_eur=0.0000 · cost_ledger_tokens=5721728099`; `runs_with_cost=0` |
| **Energy** | GPU and CPU joules and average watts per query, sampled by `telemetry/` and correlated to the trace | **No energy metric exists anywhere in this repository** — a search for `joule`, `energy_j` or `power_w` across `apps/`, `packages/` and `db/` returns nothing. Correctly so: this holding rents a box and does not own the power bill, so energy is the one first-class metric of theirs that DXB should **not** copy | R — `grep -rl` over three trees → 0 hits |
| **Failure taxonomy** | `harness_error` vs `agent_error`, and harness errors are excluded from the resolve rate by the export code | **One `status` column, no taxonomy.** 128 of 378 runs are `failed` (**33.9 %**). Their reasons, grouped: **99** `hook post-gate ESCALATE after 2 revision round(s)` (a real agent failure), **16 + 2** `DXB_LITELLM_KEY_… is not set` (configuration), **6** `stale zombie run` (housekeeping), 2 `fetch failed`. **A quarter of our failure count is not the agent's fault and nothing in the record says so** | R — `psql` group-by on `agent_runs.error` |
| **Outside-world connectors** | **39 connector files** — Gmail, Calendar, Drive, Tasks, Outlook, Notion, Obsidian, Dropbox, iMessage, Apple Health, Oura, GitHub, Hacker News, RSS | **Zero.** A search for `gmail`, `calendar`, `slack`, `rss`, `weather` or `imap` across `packages/` and the dashboard library returns **two hits, both the word "calendar" inside a date-handling comment**. The holding cannot read one message, one appointment or one outside headline | R — `grep -rln` → `morning-briefing.ts:278`, `costs.ts:69` (both comments) |
| **Channels** | **34** — Slack, Discord, Signal, Matrix, iMessage, WhatsApp, e-mail and more | Two: the dashboard chat and the voice line. Outward e-mail exists only against a sandbox (source 15, §4) | R — repository |
| **Morning briefing** | A model composes from real gathered data under six ordering rules and a 200-word ceiling | **`packages/orchestrator/src/morning-briefing.ts` — 335 lines, and it is a deterministic template.** It reads a measured snapshot and prints fixed bilingual lines: what the holding opened overnight, what is running and queued, what waits on him, money in 24 h and this month against the cap, the revenue line. **Its strength is real and theirs cannot match it — every line is traceable to a query and hallucination is impossible by construction.** What it does not do: rank by importance, connect related items, interpret rather than enumerate, suppress a source that returned nothing, or hold a word budget. And it can only speak about **our own machine** — P16-3 carries this <!-- OPEN: B22 --> | R — file read in full this session |
| **Scheduled work** | SQLite scheduler, `cron`/`interval`/`once`, `context_mode` isolated by default | **Stronger on the runtime, absent on the contract.** pg-boss on the same Postgres holds **141,856 jobs**; the outbox ticks at 15 s, the lease reaper at 60 s. But a scheduled run here does not declare its context mode — that idea is theirs and is worth taking with P16-3 | R — `pgboss.job=141856`; `packages/outbox-executor/src/scheduler.ts` |
| **Skills** | Markdown manifests, dependency graph with cycle and depth checks, capability union, importers for ~150 + ~13,700 public skills under the agentskills.io standard | We run **8 doors of our own** (`.claude/skills/dxb-*`), written for this holding and installing nothing from outside. `library_items` holds 199 personas, 74 training items, 21 tools, 18 plugins, 12 MCP entries | R — `ls .claude/skills`; `psql` group-by on `library_items.kind` |
| **Model routing** | Complexity score 0-1 from five regex signal families → tier → token budget → model | We route by **quality tier and department key**, decided by governance rather than by the question's shape. Their signal-based budget is a different axis and is compatible with ours | R — repository, U21 tier law |

---

## 5. The build project

| # | Project | What it is | Install | Money | Gate |
|---|---|---|---|---|---|
| **P16-1** | **Put a price on the 5.72 billion tokens we have already spent** | `cost_ledger` counts tokens and writes `€0.0000` on every row, so this holding cannot say what a single run cost, what a department costs per month, or which model is worth its answer. The price table exists in the catalogue; applying it at write time and backfilling the 1,590 rows turns a counter into a cost. It also makes the CEO's monthly cap mean something — today the briefing prints a cost line computed from zeros | **none** | **€0** | none — internal |
| **P16-2** | **Two kinds of failure, told apart** | Add an error class to `agent_runs` on the model their comment describes: an infrastructure failure (missing key, dead container, zombie run) is not an agent miss, and must be excluded from any quality number. Measured need: **24 of our 128 failures are not the agent's fault** and nothing says so | **none** | **€0** | none — internal |
| **P16-3** | **The briefing contract — W2.6's missing five rules** | Keep our deterministic facts, add their ordering discipline: rank by what needs him first, connect related items across sections, interpret instead of enumerating, never name a source that returned nothing, hold a word ceiling, and let a scheduled run declare its **context mode**. This is a change to a surface the CEO reads every morning, so it goes through `dxb-surface` and RULE #0 | none | €0 | **surface change** — his eye |
| **P16-4** | **The first outside-world connector** | Their 39 against our zero is the widest single gap this queue has measured. The holding cannot see one appointment or one message. The first connector should be the one his own sentence names — a calendar and mail read — and it is **his identity, his account and his OAuth consent**, so it is his call, not the author's | account only | €0 at personal volume | **CEO** — identity and consent |
| **P16-5** | **A standing scorecard for our own agents** | They score a morning brief and an email triage as datasets, and their harness is 1.7× their agent code. We test correctness (575 of their tests, our own suites) and never score answer quality over time. A small scored set — briefing, approval summary, employee answer — run on a schedule and kept as a series, turns "the agent got worse" from an impression into a measurement | **none** | **€0** | none — internal |

**Refused, with the reason.** **Installing OpenJarvis itself is refused** and the refusal is ours,
not a judgement of theirs: it is a second agent framework and a second scheduler beside pg-boss, in
Python beside our TypeScript, with its own SQLite stores beside our Postgres —
`.planning/research/STACK.md` forbids exactly that shape, and K1 forbids handing authorship to
someone else's harness. **Its energy metric is also refused**: joules are the right first-class
metric for a project about personal devices and the wrong one for a holding that rents a box and
pays for tokens. We take the mechanisms and the discipline; we do not take the runtime.

---

## 6. Verdict

**What this source produces.** Adoption and published science rather than money: **8,492 stars,
1,938 forks, 133 watchers**, a paper with fourteen authors, a public leaderboard, one-line
installers on three platforms, desktop builds for five package formats, and a repository pushed the
morning it was read. Seven institutions pay for it. It sells nothing and this report claims no
revenue for it.

**What it is, in one sentence, and why it matters here.** It is the only source on this queue whose
**measurement code is larger than its behaviour code** — 37,178 lines of evaluation against 22,181
lines of agents. Everything else on the queue was filmed; this one can be read, and what it reads
back is a discipline this holding already wrote into its constitution and has not yet built <!-- OPEN: B22 -->
into its tables — the projects below carry that work.

**Where that leaves DXB, measured rather than argued.** Three counts from the company database this
session say it without adjectives. **We have spent 5,721,728,099 tokens and priced none of them —
€0.0000 on all 1,590 rows.** **A third of our agent runs failed (128 of 378) and the record cannot
say which of those failures were the agent's fault.** **We hold zero connectors to the outside
world, against their thirty-nine** — this holding cannot read one appointment or one message that
did not originate inside itself. Their morning digest speaks about the owner's real day; ours speaks
about our own machine, accurately.

**The one thing to take before anything else.** Not their framework — **P16-1**. A company whose
operating system counts 5.7 billion tokens and writes zero next to them cannot answer the CEO's
simplest question about his own machine: what did that cost. It needs no install, no account, no
money and no approval, and it makes the cost line in his morning briefing true for the first time.

### 6.1 The directive's §4 — the eight questions, answered one by one

| # | Question | Answer |
|---|---|---|
| 1 | What is directly visible over time? | A live repository: created 2026-02-15, pushed 2026-08-10, 28 commits added in the 13 days since our clone, three tagged releases in May and continuous pushes since (V/R) |
| 2 | What is stated in the source's own text? | That local models already serve 88.7 % of single-turn chat and reasoning, that efficiency improved 5.3× from 2023 to 2025, and that the missing piece was the software stack — with eight built-in agents, three execution modes, and skills under the agentskills.io standard imported from pools of ~150 and ~13,700 (V) |
| 3 | What has the CEO confirmed? | He handed this repository over himself as ***"JARVIS REPOSU"***, inside the sentence ordering the Jarvis system and the spoken morning report. He has given no verdict on its contents (C) |
| 4 | What is technically verified? | Everything numeric here: the commit hash and the 28-commit drift from the GitHub compare API; stars, forks, watchers, issues, licence and push time from the API; every module's file and line count from the clone; the trace fields, the digest prompt, the router, the scheduler and the skills package read in the source; and eleven DXB measurements from the company database and this repository (R) |
| 5 | What remains unverified? | **U-1:** whether the framework runs on this hardware at useful speed — never executed here, and it will not be, since installing it is refused. **U-2:** the 88.7 % and 5.3 × figures, which come from the authors' own paper and were not independently reproduced. **U-3:** what the 28 unread commits change beyond their subject lines |
| 6 | What does this system demonstrably do better than DXB today? | It **measures what a run costs and what it burns**, it **tells a broken harness apart from a wrong answer**, it **reaches thirty-nine outside services and thirty-four channels**, and its morning briefing is **about the owner's day** rather than about the machine that produced it |
| 7 | What capability, design principle or architecture should DXB adopt? | **Capability:** P16-1 (price the tokens), P16-2 (error taxonomy), P16-4 (the first connector). **Design principle:** the briefing contract of P16-3 — importance first, connect related items, interpret rather than enumerate, never name an empty source, hold a word ceiling. **Architecture:** P16-5 — a measurement harness that is allowed to be as large as the behaviour it judges, and a scheduled run that declares its own context mode |
| 8 | What should **not** be copied, and why? | **The framework itself** — a second agent runtime, a second scheduler and a second store in a second language, against our stack rules and against K1. **Its energy metric** — joules are first-class for personal devices and irrelevant to a rented box; for us the equivalent first-class metric is the euro, which is exactly what P16-1 fixes. **Its skill-pool imports** — pulling 13,700 community skills into a holding that runs eight audited doors would import a supply chain we cannot inspect, and our own standing gate already requires a static scan and an archived report before any third-party skill is installed |

---

## Change log

| Date | Change |
|---|---|
| 2026-08-10 | File opened from nothing and written in one pass. The clone at `93fc7b9` was read module by module — every package's file and line count counted, and `evals/core/trace.py`, `agents/morning_digest.py`, `learning/routing/complexity.py`, `learning/routing/router.py`, `scheduler/scheduler.py`, `skills/__init__.py`, `intelligence/model_catalog.py` and the connector and channel lists read in the source. The clone's 28-commit drift from `main` was measured against the GitHub compare API and recorded rather than hidden, and the live repository facts were measured the same day. Eleven DXB facts were measured against the company database (`SELECT` only) and this repository the same session. The CEO's own sentence that supplied this row was traced back to `docs/source-architecture-notes-sanitized.md` line 17, where the video beside it was found to own no ledger row — he ordered it added the same day as **row 36**. |
