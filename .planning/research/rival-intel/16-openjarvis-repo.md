# SOURCE 16 — `open-jarvis/OpenJarvis`: "Personal AI, On Personal Devices"

> ## ⛔ SCOPE CORRECTION — CEO ruling 2026-07-28, binding on this report
>
> **What was measured here is the RECORDING. What was NOT measured is the SYSTEM.**
> A frame-by-frame reading proves what a 15–100 second video showed. It proves nothing about what
> that system does when the camera is off, what it earns, how long it has run, or whether its
> owner is satisfied with it. **I have never used any of these systems.**
>
> The CEO knows several of these systems and their owners personally. His words, 2026-07-28:
> *"BEN O SİSTEMLERİ VİDEODAN DEĞİL, HEPSİNİ TANIYORUM — ARKADAŞLARIM — VE MİLYONLARCA DOLAR
> KAZANIYOR VE HEPSİ GERÇEK, HEPSİ CANLI."*
>
> **His testimony outranks this reading.** Every verdict below is therefore scoped to the
> recording, never to the company behind it, and where his account and this reading disagree,
> **his is the evidence and this is the guess.** Sentences that judged a system rather than a
> video were a RULE #0-A violation by the session author and have been corrected in place, with
> the correction recorded rather than quietly overwritten.


> The CEO's note on this row: **"JARVIS REPOSU"**.
>
> It was studied once on 2026-07-27 in a session that died before its work reached the
> repo. That study is not on disk, so nothing is inherited here — it is redone from the
> source.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://github.com/open-jarvis/OpenJarvis |
| Kind | Monorepo, Python ≥ 3.10 (+ a Rust extension), Apache 2.0 |
| On disk | `.planning/research/rival-intel/repos/openjarvis` (146 MB, shallow clone) |
| **HEAD commit** | `93fc7b9e7759717bdc618097debe7cd0c4abf6ef` — `2026-07-28 08:29:18 +0000` |
| Age of that commit | **this morning** |
| Stars | 8,065 (measured 2026-07-28 via the GitHub API) |
| Provenance | Stanford — Hazy Research + the Scaling Intelligence Lab at Stanford SAIL. Paper: arXiv **2605.17172**. Part of the *Intelligence Per Watt* research initiative. |
| Shape | 37 connectors · 25 agent modules · 30 subsystem packages (`engine, scheduler, channels, memory, skills, traces, learning, evals, security, sandbox, mcp, sessions, telemetry, a2a, intelligence, bench, mining, operators, recipes, workflow, analytics, …`) |

This is not a competitor company. It is a **research stack**, and that is precisely why it is
useful: it publishes the *how*, with numbers, under a permissive licence.

---

## 2. File-by-file and claim-by-claim record

### 2.1 The thesis, quoted from `README.md`

> *"Personal AI agents are exploding in popularity, but nearly all of them still route
> intelligence through cloud APIs. Your 'personal' AI continues to depend on someone else's
> server. … our Intelligence Per Watt research showed that **local language models already
> handle 88.7 % of single-turn chat and reasoning queries**, with intelligence efficiency
> improving **5.3× from 2023 to 2025**."*

And the design principle:

> *"evaluations that treat **energy, FLOPs, latency, and dollar cost as first-class
> constraints alongside accuracy**; and a learning loop that improves models using local
> trace data."*

This is the same rule the CEO already wrote into DXB's charter — €50–150/month, quality may
never drop — except here it is measured per watt and per FLOP, not per invoice.

### 2.2 The eight built-in agents, three execution modes

| Agent | Mode | What it does |
|---|---|---|
| `morning_digest` | **Scheduled** | Daily briefing from email, calendar, health, news — **with TTS audio** |
| `deep_research` | On-demand | Multi-hop research with citations across web and local docs |
| `monitor_operative` | **Continuous** | Long-horizon monitoring with memory, compression and retrieval |
| `orchestrator` | On-demand | Multi-turn reasoning with automatic tool selection |
| `native_react` | On-demand | ReAct (Thought–Action–Observation) loop |
| `operative` | **Continuous** | Persistent autonomous agent with state management |
| `native_openhands` | On-demand | CodeAct — generates and executes Python |
| `simple` | On-demand | Single-turn chat, no tools |

`src/openjarvis/agents/` also carries `proactive_agent.py`, `channel_agent.py`,
`loop_guard.py`, `research_loop.py`, `manager.py` — **proactivity and loop-safety are named
modules, not afterthoughts.**

### 2.3 `configs/openjarvis/examples/morning-digest-linux.toml` — the briefing, as configuration

```toml
[tools]
enabled = ["code_interpreter","web_search","file_read","shell_exec","digest_collect","text_to_speech"]

[digest]
enabled     = true
schedule    = "0 7 * * *"
timezone    = "America/New_York"
persona     = "jarvis"
honorific   = "sir"
tts_backend = "openai"
voice_id    = "onyx"
voice_speed = 1.1
sections    = ["health", "messages", "calendar", "world"]

[digest.messages] sources = ["gmail", "google_tasks", "slack"]
[digest.calendar] sources = ["gcalendar"]
[digest.world]    sources = ["hackernews", "news_rss", "weather"]
```

Two lines deserve to be read twice. **`schedule = "0 7 * * *"`** is DXB's own U37 briefing
hour. **`honorific = "sir"`** is a configuration key — the form of address is a first-class
setting, which for us is `"CEO Bey"` and is currently a rule enforced by hand.

### 2.4 `src/openjarvis/agents/morning_digest.py` (251 lines) — the four-step pipeline

Read line by line, `run()` does exactly four things:

1. **Collect, deterministically.** A single `digest_collect` tool call over the resolved
   source list with `hours_back: 24`. The system prompt then says, verbatim:
   > *"You receive structured data from the user's connected services. The data has ALREADY
   > been collected — it appears in the user message. **You do NOT fetch anything yourself.**"*
   One model call, zero tool-wandering, bounded cost.
2. **Synthesise.** One generation over the collected blob.
3. **Self-evaluate, and regenerate if it is not good enough.** `DigestEvaluator` returns a
   score and feedback; **if `quality_score < 7.0` the briefing is regenerated with that
   feedback appended**, then the failure of the evaluator itself is swallowed so it can never
   block delivery.
4. **Speak, then store.** Markdown is stripped with three regexes before TTS (headers,
   bullets, emphasis), audio is produced, and a `DigestArtifact` is persisted carrying
   `text, audio_path, sources_used, generated_at, model_used, voice_used, quality_score,
   evaluator_feedback`.

### 2.5 The briefing prompt, quoted in full structure — the most reusable text in all 16 sources

Order is **decreasing importance**, and each section has a rule:

| # | Section | The rule it carries |
|---|---|---|
| 1 | **GREETING + PRIORITIES** | Open with the honorific and *immediately* state what needs attention. **Connect related items** — the example given: *"Your rebuttals are overdue and you have a dinner at 6, so I'd tackle those first."* |
| 2 | **SCHEDULE** | Events with time context — *"You have 3 hours before your next meeting."* Skip past events. |
| 3 | **MESSAGES** | Triage in three tiers: first, real people needing a **reply or decision**; second, anything carrying a deadline or action item; last, a one-line acknowledgement of casual threads. **Skip automated mail, newsletters and marketing entirely.** Quote message text when it helps. |
| 4 | **HEALTH** | *"Interpret trends, not raw numbers."* |
| 5 | **WORLD** | Weather, top news. **Skip if no data.** |
| 6 | **CLOSING** | One forward-looking sentence with the honorific. |

And the **ABSOLUTE RULES** block, quoted:

```
- ONLY facts from the data. Zero hallucination.
- NEVER mention disconnected or unavailable sources.
- NEVER state raw health numbers … Interpret, never enumerate.
- NEVER describe actions you are taking.
- Acknowledge every source that returned data, even briefly.
- No markdown, emojis, bullets, or headers.
- STRICT LIMIT: 200 words. Be concise.
```

Plus, in the user message: *"Use the honorific ONLY 2-3 times total"*, *"Do NOT repeat the
greeting in your closing"*, *"Do NOT invent reasons"*, *"Skip notifications from the user
themselves."*

Two of those are already DXB law under a different name. *"ONLY facts from the data. Zero
hallucination"* is RULE #0-A. *"NEVER mention disconnected or unavailable sources"* is the
CEO's ban on info-free fields. The rest is craft we do not yet have written down anywhere.

### 2.6 Skills — an open standard, and 13,700 of them

```bash
jarvis skill install hermes:arxiv
jarvis skill sync hermes --category research
jarvis optimize skills --policy dspy     # optimise skills from your own trace history
jarvis bench skills --max-samples 5 --seeds 42
```

Skills follow the **agentskills.io** open specification, and can be imported from Hermes
Agent (~150), OpenClaw (~13,700 community skills) or any GitHub repo. Every skill is a tool;
agents discover them from a catalog and invoke them on demand. Crucially, `optimize` and
`bench` mean **a skill's value is measured, not asserted**.

### 2.7 Connectors — 37 of them, by filename

```
gmail · gmail_imap · gcalendar · gcontacts · gdrive · google_tasks · google_auth · oauth
outlook · slack_connector · whatsapp · imessage · github_notifications · notion · obsidian
dropbox · granola · spotify · apple_music · apple_notes · apple_contacts · apple_health
oura · strava · weather · hackernews · news_rss
embeddings · embedding_store · chunker · retriever · hybrid_search · store · sync_engine
pipeline · scheduler · attachment_store
```

One OAuth (`jarvis connect gdrive`) covers Gmail, Calendar and Tasks.

### 2.8 The showcase, quoted — what it is worth in money and privacy

From `docs/showcase/morning-brief.md`:

> *"**Costs me nothing per month.** It runs on a Mac mini in my closet. Same prompt-volume on
> the OpenAI API would be `~$18/month`…"*
> *"**Nothing leaves my house.** My inbox, my Slack DMs, my calendar — Jarvis reads them
> locally and writes the digest locally. The only network call is the Discord webhook…"*
> *"**It learns my taste.** Over a few weeks Jarvis figured out that PR titles starting with
> `chore:` aren't worth surfacing… The summarizer has a `MEMORY.md` it updates when I react
> with 👎 to a bullet."*

The last one is the important one: **a thumbs-down on a line of the briefing edits the
briefing's own memory file.** The feedback loop is one gesture long.

---

## 3. Capabilities

| ID | Capability | What the repo proves |
|---|---|---|
| **CAP-16-A** | **Scheduled spoken briefing as a shipped agent** | `morning_digest`, `schedule = "0 7 * * *"`, TTS audio, stored artifact |
| **CAP-16-B** | **Collect deterministically, narrate once** | `digest_collect` runs first; the model is told it may not fetch. One generation, bounded cost |
| **CAP-16-C** | **Self-evaluating output with automatic retry** | `DigestEvaluator`; `< 7.0` triggers one regeneration with the feedback; evaluator failure never blocks delivery |
| **CAP-16-D** | **The briefing is stored as an auditable artifact** | `DigestArtifact(text, audio_path, sources_used, generated_at, model_used, voice_used, quality_score, evaluator_feedback)` |
| **CAP-16-E** | **Priority-first narrative with explicit triage rules** | the six-section prompt + the ABSOLUTE RULES block |
| **CAP-16-F** | **Honorific and persona as configuration** | `persona = "jarvis"`, `honorific = "sir"`, persona loaded from a markdown file |
| **CAP-16-G** | **Speech hygiene before TTS** | three regexes strip headers, bullets and emphasis so the voice never reads markdown aloud |
| **CAP-16-H** | **Three execution modes, including *continuous*** | on-demand · scheduled · **continuous** (`operative`, `monitor_operative`) |
| **CAP-16-I** | **Loop safety as a named module** | `agents/loop_guard.py` |
| **CAP-16-J** | **Skills measured, not asserted** | `jarvis optimize skills --policy dspy`, `jarvis bench skills` |
| **CAP-16-K** | **Open skill standard + a 13,700-skill supply** | agentskills.io; Hermes ~150; OpenClaw ~13,700 |
| **CAP-16-L** | **37 first-party connectors to the real world** | the connector list above |
| **CAP-16-M** | **Local-first economics, published** | 88.7 % of single-turn queries handled locally; 5.3× efficiency gain 2023→2025; `$0` vs `~$18/month` on the same volume |
| **CAP-16-N** | **Cost/energy/latency as first-class eval axes** | the `evals` and `bench` packages |
| **CAP-16-O** | **One-gesture feedback that edits memory** | 👎 on a bullet updates the summariser's `MEMORY.md` |
| **CAP-16-P** | **Delivery to a channel the human already lives in** | Discord / Slack / Telegram / email channel adapters |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-16-A** scheduled briefing | **PARTIAL — data yes, voice not established** | `public.v_morning_briefing` and `public.v_ceo_briefing` are live views (`sort, block, payload jsonb`), day boundary computed in `Europe/Berlin`, reading `task_events`/`tasks`. That it is ever *spoken* is not measured and is not claimed here. |
| **CAP-16-B** collect then narrate | **HAVE the collection, MISSING the narration** | U37 was deliberately built with **zero model calls** — one SQL view, rendered. That makes it cheap and honest, and it also makes it a template rather than a briefing. Their design adds exactly one model call on top of the same discipline. |
| **CAP-16-C** self-evaluation | **NO** | Nothing measured scores the briefing or regenerates it. |
| **CAP-16-D** stored artifact | **PARTIAL** | Voice calls persist (`voice_calls`: transcript, timeline, stt_ms, answer_ms, tts_ms, degraded, cost_eur, topic, session_id). No briefing artifact with a quality score. |
| **CAP-16-E** priority-first triage rules | **NO** | Not written down anywhere measured. This is craft DXB is missing and can adopt verbatim in a day. |
| **CAP-16-F** honorific as config | **NO — it is a hand-enforced rule** | "CEO Bey / Muhittin Bey, never a bare first name" lives in the persona and in governance memory, not in a settings key. |
| **CAP-16-G** speech hygiene | **UNKNOWN** | Not measured; recorded as an open check rather than claimed. |
| **CAP-16-H** continuous mode | **PARTIAL** | The wake daemon is continuous (`dxb-jarvis` active since 01:44:09 today) and the scheduler is resident; a *continuous agent with state* is not measured. |
| **CAP-16-I** loop guard | **PARTIAL** | Budget hard-stop at 100 % is charter law; a per-agent loop guard is not measured. |
| **CAP-16-J/K** skills measured, open standard | **PARTIAL** | `std.knowledge_shelf` is live (R4.2) and 199 personas are file-first. No `optimize`/`bench` loop, no agentskills.io import path. |
| **CAP-16-L** connectors | **NO — this is the gap that matters** | Measured: no mailbox, no calendar, no analytics, no ad platform is connected. `grep -rln "inbox\|email_thread\|customer_email"` returns only the internal approvals/outbox machinery. |
| **CAP-16-M/N** local-first economics | **HAVE, and it is already doctrine** | Speaches runs in our own container; V9 forbids audio leaving our hardware; the €50–150/month ceiling with a 70 %/100 % Cost Monitor is charter law. We reached their conclusion first, for a different reason. |
| **CAP-16-O** one-gesture feedback | **NO** | Nothing measured lets the CEO mark a line of a briefing as useless and have that change the next one. |
| **CAP-16-P** channel delivery | **PARTIAL** | The dashboard and the voice line are the two surfaces; there is no push to a channel he already lives in. |

---

## 5. The build project

This repo is Apache 2.0 and **Python**, while DXB is TypeScript on Postgres. Installing it
wholesale would add a second runtime, a second scheduler and a second agent registry for one
feature — a bad trade. The valuable part is portable without the code: **the pipeline shape
and the prompt.**

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P16-1** | **Hamza's briefing gets a voice and a spine** (CAP-16-A, -B, -E, -G) | Keep U37's deterministic collection exactly as it is (one SQL view, no tool-wandering), add **one** model call on top with a briefing prompt built on their six-section skeleton — priorities first with items *connected*, then schedule, then messages triaged in three tiers, closing sentence — plus the ABSOLUTE RULES block rewritten in DXB's own law (RULE #0-A instead of "zero hallucination"; the ban on info-free fields instead of "never mention disconnected sources"). Strip markdown before TTS. | `VOICE_INTERACTION_SPEC` + the U37 adaptation | One recorded call: the CEO says the wake phrase, hears a ≤250-word briefing that opens with priorities, connects two related items, names who did what, and closes with a question — and the same text appears in chat. |
| **P16-2** | **The briefing grades itself** (CAP-16-C, -D) | A second, cheap pass scores the briefing against a written rubric (did it lead with priorities? did it invent anything? did it name a disconnected source? is it under the word ceiling?). Below threshold → one regeneration with the feedback. The evaluator may never block delivery. Persist a briefing artifact with `quality_score` and `evaluator_feedback`. | `VOICE_INTERACTION_SPEC` | A deliberately bad briefing is caught by the evaluator, regenerated, and both versions plus the score are in the artifact row. |
| **P16-3** | **The honorific becomes a setting** (CAP-16-F) | `honorific`, `persona` and `language` move out of prose and into a settings row Hamza reads. The CEO can change how he is addressed without an author touching code. | `ORCHESTRATOR` / Hamza persona §13 | Changing the setting changes the spoken and written address on the next turn. |
| **P16-4** | **One gesture that teaches** (CAP-16-O) | Thumbs-down on any line of the briefing or any chat answer writes a durable preference the next briefing obeys. | `CEO_COMMAND_CENTER_SPEC` | A down-voted line stops appearing, and the stored preference names why. |
| **P16-5** | **The outside world, cheaply** (CAP-16-L) | Their connector list is the shopping list. **Procurement decision belongs to the CEO** — which accounts exist and may be connected. Build order by value to him: mailbox → calendar → product analytics → ad spend. Read-only first; anything outward-facing keeps the approvals gate. | `CAPABILITY_ARSENAL_DOCTRINE` (registered adaptation) + `INTEGRATION-TRACKER` rows | Each connector lands rows in a DXB table and one briefing quotes a number that came from it. |
| **P16-6** | **Skills stop being asserted** (CAP-16-J, -K) | A bench/optimise loop for `std.knowledge_shelf` entries, and an import path for the agentskills.io standard so the 13,700-skill supply is reachable instead of rewritten. | `CAPABILITY_ARSENAL_DOCTRINE` | A skill's measured before/after appears in the tracker row that claims it. |
| **P16-7** | **Read the paper, not just the code** (no code) | arXiv 2605.17172 + the *Intelligence Per Watt* leaderboard carry the local-vs-cloud numbers that justify our own model-routing law (U21). Mine them for the routing thresholds we currently set by judgement. | `MODEL_ROUTING_SPEC` | Each threshold in the routing law either cites a measurement or is marked as judgement. |

---

## 6. Verdict

**`daha iyisi` on doctrine — `eşit` on the briefing pipeline until we build it — `reddedildi`
on adopting the code.**

- **Rejected as a dependency.** Python + a second scheduler + a second agent registry, for a
  feature we can express in our own stack in one pipeline. The licence permits it; the
  architecture does not deserve it.
- **Equal, and honestly behind in practice, on the briefing.** They ship a scheduled spoken
  briefing that collects deterministically, narrates once, **grades itself**, regenerates when
  it is weak, speaks, and files the artifact with its own quality score. DXB has the
  collection and none of the rest.
- **Ahead on doctrine, and it was not copied.** Local-first, cost as a first-class constraint,
  nothing leaving the owner's hardware — they argue it from watts and FLOPs; the CEO ruled it
  from sovereignty and a €150 ceiling months ago. Two roads, same place. That agreement is
  the strongest evidence so far that DXB's foundations are right.
- **The single most valuable line in the repo** is not code. It is
  *"The data has ALREADY been collected — you do NOT fetch anything yourself."* That one rule
  is what makes a briefing cheap, fast and impossible to hallucinate into — and it is exactly
  how U37 was already built. We add the voice on top; we do not undo it.
