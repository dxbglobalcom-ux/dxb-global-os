# 34 — cognee: the memory that draws the graph, sells the graph store, and gives the method away

> **THE PLAN FOR THIS ALREADY EXISTS ON THE BOARD. THIS REPORT DOES NOT WRITE A SECOND ONE.**
> `00-BOARD-OPEN-WORK.md` carries the CEO-approved decision **"V2 memory — one brain, three
> abilities, written by us (2026-08-01)"** — marker `v2-memory-brain-2026-08-01`, his words
> *"tamam onaylıyorum, bunu da not al v2 için"*. That decision already fixes the three abilities,
> already names the measured cause (facts with no links), and already sets the boundary:
> **cognee is read for its METHOD under Apache-2.0 and is NOT installed — no second brain, no
> second database.** This report supplies the one thing that decision left open: **the mechanism.**
> Every finding in §5 is filed under the ability it serves. **The board is not touched**
> (CEO order, 2026-08-19).

## WHY IT MATTERS TO THIS HOLDING

The CEO put this source on the queue himself, into the DOCX on 2026-08-01 17:45:
*"Önemli Memory Repo: … study it carefully and craft it if you find it correctly for real usefull."*

He was aiming at a gap that is still open, and it was re-measured this session, 2026-08-19, against
the live company database:

| Measured now | Value |
|---|---|
| `memory_index` rows | **13,919** — fact 13,882 · artifact 32 · procedure 5 |
| `memory_embeddings` rows | **37** |
| Relation rows anywhere in the company database | **none — no relation table exists** |
| `memory-store/relation/` | **0 files** (`memory-store/artifact/`: 32 files) |
| `v_org_graph` | **221 nodes**, joined only by `parent_node_id` — a tree, not a graph |

Thirteen thousand nine hundred remembered things and **not one link between them**. A holding that
cannot say *this decision came from that opportunity, which came from that employee's work* cannot
draw itself, and a system that cannot draw itself cannot be alive. cognee is the queue's only source
whose entire product is that missing half.

---

## 1. Source identity

| | |
|---|---|
| Address | https://github.com/topoteretes/cognee |
| Operator | Topoteretes UG (haftungsbeschränkt), Schönhauser Allee 163, Berlin |

---

## 2. The record — module by module, as it stands on disk

Read at version **1.4.1**, working tree dated **2026-08-01**, whose newest commit is
`ci: Backport nightly perf suite to main (v1.4.1 follow-up) (#4300)` — the pull-request number is
itself the size signal: **4,300 PRs**. 2,858 files, 159 MB, 23 top-level directories. Shallow clone,
so contributor history is not on disk.

| Path | What it is | What it proves |
|---|---|---|
| `README.md` | 443 lines | The product is stated as **"the open-source AI memory platform for AI Agents"**, not a database |
| `LICENSE` · `NOTICE.md` | Apache-2.0, Topoteretes UG Berlin | The METHOD is legally readable by us — the boundary the CEO's decision already set |
| `cognee/api/v1/{remember,recall,forget,improve}` | Four verb endpoints | The whole surface is **four words**, not an API catalogue |
| `cognee/api/v1/{search,datasets,memify,prune,users,ui,sync,serve}` | The rest of the HTTP surface | Datasets, not documents, are the unit of ownership |
| `cognee/pipelines/` | `types.py` only | The pipeline is a **type contract**; the steps live as tasks |
| `cognee/tasks/` | 17 groups: chunks · cleanup · code_graph · codingagents · completion · documents · entity_completion · graph · ingestion · memify · schema · storage · summarization · temporal_awareness · temporal_graph · translation · web_scraper | Memory is assembled from **replaceable steps**, not one monolithic ingest |
| `cognee/memify_pipelines/` | 8 files: `apply_feedback_weights` · `apply_frequency_weights` · `consolidate_entity_descriptions` · `create_triplet_embeddings` · `global_context_index` · `persist_agent_trace_feedbacks_in_knowledge_graph` · `persist_sessions_in_knowledge_graph` · `memify_default_tasks` | **`improve` is a real pipeline, not a slogan** — weights, consolidation, and agent traces written back as graph |
| `cognee/memify_pipelines/memify_default_tasks.py` | 25 lines | The default improve pass is deliberately **tiny**: triplet extraction (batch 100) + re-index (batch 100). Session cognification is a separate pair `(extract_user_sessions, cognify_session)` |
| `cognee/tasks/memify/` | 16 files incl. `extract_agent_trace_feedbacks`, `cognify_agent_trace_feedback`, `extract_feedback_qas`, `extract_subgraph` | The agent's **own trace** is a first-class memory input |
| `cognee/modules/` | 30 groups incl. `agent_memory` · `session_lifecycle` · `session_distillation` · `truth_subspace` · `ontology` · `recall` · `retrieval` · `visualization` · `sync` · `cloud` | Sessions, ontology and drawing are **modules of the memory**, not add-ons |
| `cognee/modules/truth_subspace/{build,align,centroids}.py` | Docstring: *"Build centroid-slot truth coordinates for a dataset's session learnings. The `session_learnings` node set is replayed on every build into up to `DEFAULT_K` deterministic centroid slots."* | What the system has LEARNED gets its own coordinate space, **replayed deterministically** — learning is a rebuildable artefact, not drift |
| `cognee/tasks/temporal_awareness/` · `temporal_graph/` | `build_graph_with_temporal_awareness`, `extract_events_and_entities`, `enrich_events` | **Time is a graph citizen**: events carry entities, entities carry events |
| `cognee/memory/entries.py` · `infrastructure/session/` | Session cache with `CACHING=true` | A **two-speed memory**: fast session cache in front, permanent graph behind |
| `cognee/api/v1/remember/remember.py` | 1,274 lines; kwargs include `run_in_background`, `temporal_cognify`, `graph_model`, `chunks_per_batch` | One verb hides add + cognify + improve, and can be told to **run without waiting** |
| `cognee/skill.md` | **610 lines**, YAML frontmatter `name: cognee` + `description:` | The repository **ships its own agent skill** — the same file shape this holding uses for its doors |
| `cognee-frontend/` | 44 MB — the largest thing in the repo | The interface is not an afterthought; it outweighs the engine on disk (core `cognee/` is 21 MB) |
| `cognee-frontend/src/app/(app)/` | 13 routes: dashboard · search · datasets · sessions · knowledge-graph · graph-models · skills · integrations · connections · api-keys · settings · schema · link-slack | Route groups `(app)` `(auth)` `(setup)` `(graph)` `(waitlist)` — **a waitlist route ships in the open-source tree** |
| `cognee-frontend/src/modules/` | 20 modules incl. `billing`, `tenant`, `instances`, `analytics`, `notebooks`, `chat`, `skills` | The open product carries the **shape** of the commercial one |
| `cognee-frontend/src/modules/billing/getCreditsOverview.ts` | Its whole body: *"Open-source stub — credit overview requires the cloud billing backend. Always returns null so the dashboard banner is simply not shown in OSS mode."* | **The money mechanism, in the open repo's own words** |
| `cognee-frontend/src/ui/theme/tokens.ts` | The design token file | Colour is a **named scale**, not per-screen hexes |
| `cognee-frontend/src/app/(app)/dashboard/hooks/useGraphSummary.ts` | `RECHECK_AFTER_COMPLETION_MS = 15_000`, `IDLE_FALLBACK_POLL_MS = 2*60*1000` | The surface has **two clocks** — see Aliveness |
| `cognee-frontend/src/app/(app)/dashboard/hooks/useDashboardTelemetry.ts` | `TELEMETRY_POLL_INTERVAL_MS = 15_000` | The dashboard's own heartbeat |
| `cognee-frontend/src/modules/datasets/useDatasetStatuses.ts` | `refetchInterval: 5000` | The fastest beat is reserved for work in flight |
| `docker-compose.yml` | Profiles `ui`, `mcp`, `postgres`, `neo4j` | One file, four shapes of the same product |
| `distributed/deploy/` | Modal · Railway · Fly.io · Render · Daytona · Islo scripts | Six one-click landing places, plus the managed cloud |
| `cognee/eval_framework/beam/REPORT.md` | The BEAM benchmark write-up | The claim is published **with its caveats**, not as marketing |

---

## 3. Capabilities — the mechanism, measured

**The whole product is four verbs.** `remember` · `recall` · `forget` · `improve`. `remember` runs
add + cognify + improve behind one call; give it a `session_id` and it writes to a fast cache
instead, which **syncs to the graph in the background**. `recall` auto-routes: it picks the search
strategy rather than making the caller choose, and with a `session_id` it reads session memory first
and falls through to the graph. That is the entire vocabulary a builder has to learn.

**The graph is built by replaceable tasks, not one importer.** Seventeen task groups feed it —
chunking, documents, ingestion, summarisation, entity completion, translation, web scraping, code
graph — and each is a `Task` object with its own batch size. A pipeline is assembled from them, so a
holding can add a step (its own document type, its own entity kind) without touching the engine.

**`improve` is where the memory learns, and it is a pipeline like any other.** The default pass is
deliberately small: extract triplet datapoints in batches of 100, re-index in batches of 100. The
real weight sits in the other memify pipelines — **feedback weights** and **frequency weights**
applied to graph elements, **entity description consolidation**, a **global context index**, and two
that matter most here: `persist_sessions_in_knowledge_graph` and
`persist_agent_trace_feedbacks_in_knowledge_graph`. **The agent's own working trace becomes memory.**

**Learning is given a coordinate space instead of being left to drift.** `truth_subspace` replays
the `session_learnings` node set into up to `DEFAULT_K` deterministic centroid slots on every build
and projects document chunks onto them, persisting the centroid epoch used. Rebuildable, versioned
learning — the opposite of a vector store that quietly rots.

**Time is modelled, not stamped.** `temporal_graph` extracts events and entities, enriches events,
and builds a knowledge graph *from events*; `temporal_awareness` builds and searches the graph with
time as a dimension. A question like *what did we believe last month* is a graph traversal, not a
`created_at` filter.

**One store instead of four.** cognee 1.0's headline is that the whole memory layer runs on a single
Postgres: relationships in its Postgres graph backend, embeddings in pgvector, sessions in a SQL
session cache, metadata in the same database. Their own CI measured **Postgres search ~10 % faster**
than the split graph-plus-vector stack. Local development runs fully embedded — SQLite, LanceDB,
Kuzu — with no services to stand up.

**It hands itself to agents in the shape agents already read.** `cognee/skill.md` is a 610-line
agent skill with the same frontmatter contract this holding's own doors use, covering add, build,
search, NodeSet scoping, DataPoints, custom pipelines, SearchType selection, and a long section on
**agentic workflows and feedback-driven improvement** — short-term versus long-term feedback, the
general agent loop, and the minimal pattern. Alongside it: an MCP server, a CLI, a Rust client, a
TypeScript client, an OpenClaw plugin, and a Claude Code plugin whose hooks are named in the README —
`SessionStart` sets identity, `UserPromptSubmit` injects dataset-scoped context, `PostToolUse`
captures tool traces, `Stop` writes the answer, `PreCompact` preserves memory across context resets,
`SessionEnd` syncs into the permanent graph.

### The design — one product, a token scale, and a status alphabet

Colour stops at the rule. **Brand accent violet `#6510F4`** with hover `#5A0ED6` and pressed
`#4A0BAF`; **lavender `#BC9BFF`** is the single CTA accent reserved for dark surfaces, paired with
near-black text `#1E1E1C` and published with four fixed tints (10 / 20 / 35 / 60 %); **status is a
three-word alphabet** — processing `#FFD500`, success `#53FF24`, error `#FF5024`; text is one Zinc
ramp from `#18181B` (page titles) down to `#D4D4D8` (disabled); page ground `#F4F4F4`, cards white,
one selected-state violet `#F0EDFF`. **Every token carries the role in its name** — `bgSelected`,
`textPlaceholder`, `borderFocus` — so a screen cannot invent a colour, only choose a role. This is
what a two-theme product looks like before the themes exist.

The screen list is the second half of the design statement: **dashboard, search, datasets, sessions,
knowledge-graph, graph-models, skills, integrations, connections, api-keys, settings, schema** — and
separate route groups for auth, setup/onboarding, the graph itself, and a waitlist. `graph-models`
carries a schema editor with a live preview; `sessions` carries a graph-enrichment view. The memory
is not presented as storage. **It is presented as a company you can look at.**

### Aliveness — what cognee shows about how it is built to live

**1. What runs on its own clock, and by what machinery.** `remember(session_id=…)` writes to a fast
session cache and **syncs to the graph in the background** — the README says so and
`memify_default_tasks.get_session_memify_tasks()` is the pair that does it
(`extract_user_sessions` → `cognify_session`). `remember()` accepts `run_in_background`, so ingestion
is not bound to a caller waiting. Graph metrics are computed asynchronously on the backend *after*
cognify finishes — the frontend code comments on this by name. `SyncOperation` is a persisted model,
so a sync is a tracked object with a life, not a fire-and-forget call. And in the Claude Code
plugin, the permanent write happens on `SessionEnd`: **the memory finishes its work after the human
has left.**

**2. What makes the surface breathe — the screen's own movement, TIMED.** Four clocks, all read from
the source:

| Motion | Period | Where |
|---|---|---|
| Dataset statuses refetch | **5,000 ms** | `useDatasetStatuses.ts` — the fastest beat, reserved for work in flight |
| Dashboard telemetry poll | **15,000 ms** | `useDashboardTelemetry.ts` |
| Re-check after a run completes | **15,000 ms** | `useGraphSummary.ts` — a second look, because the count lands late |
| Idle fallback poll | **120,000 ms** | `useGraphSummary.ts` |
| Loading indicator rotation | **2.0 s**, `linear infinite` | `LoadingIndicator.module.css` |
| Onboarding pulse | **1.4 s**, `ease-in-out infinite` | `AgentOnboarding.tsx` |

**The motion encodes the state.** Nothing on this surface moves at one speed: 5 s while a dataset is
processing, 15 s as the resting telemetry beat, **120 s when there is nothing to watch** — a
24-fold slowdown that is itself a status report. And the reason the 120 s clock exists is written in
the code as a comment, not inferred: it is *"a safety net for pipeline runs this tab's telemetry poll
never saw transition (started elsewhere — **another tab, an agent, a direct API call**)"*. **The
surface is built on the assumption that the system works when nobody is watching it**, and it goes
looking for what happened while it was not looking. That is anti-babysitting written as a polling
constant.

**3. How it answers the human, and how fast.** `recall()` auto-routes the search strategy, so the
human asks in one form and the system chooses between meaning and structure. The same answer is
reachable from four doors — Python SDK, `cognee-cli recall`, the MCP server, and the search screen —
and from inside Claude Code the answer arrives without being asked for at all: the plugin injects
dataset-scoped context on **every** `UserPromptSubmit`. Where the source states a speed it is a
throughput claim, not a latency one (Postgres search ~10 % faster than the split stack in their CI);
**a response-time figure is not published in this repository — UNREADABLE from the source.**

**4. What DXB takes.** Named in §5, each item filed under the ability the board's approved decision
already defined.

---

## 4. What DXB has today — measured 2026-08-19

| | DXB, measured this session | cognee, measured in the source |
|---|---|---|
| Remembered things | `memory_index` **13,919** (fact 13,882 · artifact 32 · procedure 5) | Datasets of DataPoints, unbounded |
| Links between them | **0** — no relation table; `memory-store/relation/` holds **0 files** | The graph IS the product |
| Embeddings | `memory_embeddings` **37** | pgvector / LanceDB / Kuzu, embedded by default |
| Company map | `v_org_graph` **221 nodes**, joined only `parent_node_id` — a tree | Entities and events, many-to-many, time-aware |
| Learning from its own work | none — agent traces are not written back as memory | `persist_agent_trace_feedbacks_in_knowledge_graph`, feedback + frequency weights |
| Memory's own surface | none in V2 (V1's Bellek page is dead with V1) | 13 routes, a graph screen, a schema editor |
| Agents | **205** written | — |
| Opportunities | **5** | — |
| Lifetime revenue | **€0.00** (`v_ceo_briefing.revenue_lifetime_eur`) | — |

---

## 5. The build project

**Read §5 alone if you read nothing else.** The plan is not here — it is on the board, approved,
as `v2-memory-brain-2026-08-01`. What follows is the **mechanism** that decision needs, filed under
its own three abilities, taken from a source we may legally read (Apache-2.0) and **may not install**.

**Ability 1 — every remembered thing stays a plain readable file, so the holding's memory survives
our software.** cognee does not model this; its persistence is databases. **Take nothing here.** The
one transferable idea is the *dataset* as the unit of ownership and permission rather than the
document — it is what makes `forget(dataset=…)` a single call, and our files can carry the same
grouping.

**Ability 2 — the COMPANY's live map, redrawn as things change.** This is where the whole yield is.
Four mechanisms, in the order they must be built:

1. **The link is extracted, never typed.** cognee's entity/relationship extraction runs as ordinary
   tasks over ordinary content, with an ontology grounding the vocabulary. Our 13,919 facts already
   exist; **the edges must be derived from them and from the work that produced them**, not entered
   by hand. This is the "feeding is the real fix" line of the approved decision, made concrete.
2. **Events are graph citizens.** `temporal_graph` extracts events and entities and builds the graph
   *from events*. A holding's real map is event-shaped — a decision, an approval, a payment, a task
   closing. This is the single design choice that turns our audit log from a list into a map.
3. **The agent's own trace is a memory input.** `extract_agent_trace_feedbacks` +
   `cognify_agent_trace_feedback`. We run 205 agents that currently forget everything they do. This
   is the cheapest large gain available to us.
4. **Ownership and isolation are in the model from the start** — datasets, tenants, users, NodeSets
   for scoping retrieval. Our holding is multi-company by definition; retrofitting this later is the
   expensive path.

**Ability 3 — stays alive and answers across meaning and connections.** Three mechanisms:

5. **Two-speed memory.** A fast session cache in front, the permanent graph behind, and a background
   sync between them. Hamza answers from the cache; the graph is written after. This is how a chat
   stays fast while the company still learns.
6. **`improve` as a scheduled pipeline, small by default.** Feedback weights, frequency weights,
   description consolidation, re-indexing. Our resident scheduler already exists to run exactly this
   kind of pass — it is the natural home when the services come back.
7. **Learning gets a rebuildable coordinate space** (`truth_subspace`), so what the holding has
   learned can be re-derived rather than trusted blindly. The deterministic-replay idea is the part
   worth copying; the centroid mathematics is not required for a first build.

**And the surface, filed under the CEO's first law.** Two clocks and a rest state:
**5,000 ms while work is in flight · 15,000 ms as the resting beat · 120,000 ms when idle** — plus
the reason the idle clock exists, which is that **work happens with nobody watching**. Our command
surface should carry the same three speeds and the same assumption. A value that has arrived stops;
zero is a real answer; the beat itself reports that the link is live.

### What must NOT be copied, and why

- **cognee itself must not be installed.** The CEO's approved decision says so in as many words:
  method only, no second brain, no second database. Our Postgres already holds the company.
- **Neo4j, Kuzu, Redis, LanceDB, Qdrant** — every extra store cognee supports is a store we refuse.
  Their own 1.0 headline is that all of it collapses onto Postgres; we start where they arrived.
- **The four-verb API surface should not be cloned as an API.** We are not selling a memory product.
  The verbs are useful as an *internal* vocabulary, nothing more.
- **The Postgres graph backend is a demo feature in their own warning**, with production behind a
  licence. Our edges live in ordinary tables we design; nothing about their graph store transfers.
- **Their benchmark numbers are not our evidence.** BEAM measures long-conversation recall, not a
  holding's map.

---

## 6. Verdict

**What this source PRODUCES, measured.** A shipped product at **v1.4.1** whose own newest commit
references **pull request #4300**; prebuilt images published to Docker Hub on every push to `main`
(`cognee/cognee`, `cognee/cognee-mcp`); official clients in **Rust** and **TypeScript**; plugins for
**Claude Code** and **OpenClaw**; one-click deployment to **six** platforms plus a managed
**Cognee Cloud**; a peer-reviewable research paper (**arXiv 2505.24478**, Markovic et al., 2025); and
a published benchmark against BEAM where it reports **0.79 at 100K tokens against a previous state of
the art of 0.735**, and **0.67 at 10M against 0.641** — with a RAG baseline around 0.33 — released
together with its own caveats file rather than as a claim.

**How it earns, in the repository's own words.** The engine is Apache-2.0 and genuinely free. The
money sits in two places the open tree admits to itself:
`cognee-frontend/src/modules/billing/getCreditsOverview.ts` is *"an open-source stub — credit
overview requires the cloud billing backend"* and returns null so the billing banner never renders in
open-source mode; and the README's own warning says running the graph on Postgres is *"released as a
demo feature. The production ready feature is available as a licenced product … Book a call with our
sales team."* **The give-away is the method and the engine; the sale is the managed cloud, the
credits, and the production graph store.** A waitlist route ships in the open repository.

**Against DXB, on the only measure that decides.** cognee runs, ships, benchmarks, and sells. DXB
has **205 written agents, 5 opportunities, and €0.00 of lifetime revenue** — measured this session
from the company database. On does-it-work-and-does-it-earn we are behind it, and the gap this
particular source exposes is the sharpest one on the queue: **13,919 remembered facts and zero links
between them.** Their whole product is the half we do not have.

**What this changes on the board: nothing, and that is the point.** The decision was already taken
and approved on 2026-08-01. This report does not reopen it, does not widen it, and adds no row. It
converts an approved sentence — *"one memory that draws the COMPANY's live map"* — into seven named
mechanisms, four measured clocks, and an explicit list of what must not be copied. The next session
building V2's memory does not need to read this repository again.

---

## What was read

`README.md` (443 lines, in full) · `LICENSE` · `NOTICE.md` · `pyproject.toml` (version) ·
`docker-compose.yml` · `cognee/` tree (api, pipelines, 17 task groups, 8 memify pipelines, 30
modules) · `cognee/memify_pipelines/memify_default_tasks.py` (25 lines, in full) ·
`cognee/modules/truth_subspace/build.py` (docstring) · `cognee/tasks/memify/apply_feedback_weights.py`
· `cognee/api/v1/remember/remember.py` (structure, 1,274 lines) · `cognee/skill.md` (frontmatter +
30 headings) · `cognee-frontend/src/` (routes, 20 modules, theme tokens in full) ·
`useGraphSummary.ts`, `useDashboardTelemetry.ts`, `useDatasetStatuses.ts`,
`LoadingIndicator.module.css`, `AgentOnboarding.tsx` (timings) · `CONTRIBUTORS.md`.

**Fingerprint of what was studied:** working tree at commit `38eece5bbb0cb9f5706fed908abd16dba0f5505e`, version 1.4.1, dated 2026-08-01 — 2,858 files, 159 MB, 23 top-level directories.
Own side measured live against the company database (`memory_index`, `memory_embeddings`,
`v_org_graph`, `agents`, `opportunities`, `v_ceo_briefing`) and `memory-store/`, SELECT only.
Not read: `evals/`, `notebooks/`, `assets/`, `cognee-starter-kit/`, `kuzu/`, `tests/` — none carries
design, mechanism or money (ledger law 12).
