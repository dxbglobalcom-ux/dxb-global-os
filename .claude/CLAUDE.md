<!-- GSD:project-start source:PROJECT.md -->

## Project

**DXB Global OS**

DXB Global OS is an AI-native company operating system for **DXB Global Technology Consultancy AI-Native OS Company** — a digital replica of a world-class tech company: departments, manager agents, specialist agents, sub-agent/swarm teams, skills, MCP tools, persistent memory, and QA, running 24/7 with minimal human intervention. The sole human is the CEO, who gives intent and approvals through a dashboard/CRM cockpit and a JARVIS voice layer; the OS decides which agents, skills, and tools fire. Master source of truth: the CEO's architecture notes document, extracted and approved at `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` (mirrored in `.planning/` context).

**Core Value:** **Anti-baby-sitting**: the CEO states intent once; the company executes end-to-end autonomously, with hard approval gates only where actions face outward (money, contracts, emails, ad spend). If everything else fails, intent → autonomous, quality-gated execution must work.

### Constraints

- **Budget**: €50–150/month OS operating cost (VPS + API tokens); Claude/Codex subscriptions separate — Cost Monitor enforces (alert 70%, hard-stop non-critical at 100%)
- **Hardware**: ThinkPad X230 8GB = control terminal only; 24/7 work happens on EU VPS (Hetzner-class ~€20/mo)
- **Security**: least-privilege MCP profiles per department; approval gates on all outward actions; secrets only via vault/.env; no plaintext credentials in repo or prompts
- **Token discipline**: skills/plugins/MCPs fire only when needed, only for the responsible agent; compression layers (headroom, caveman) mandatory; but quality may never drop — if quality is at risk, don't cut cost
- **Process**: "no guessing" — unknowns researched before action; every doc-listed tool studied before install; tools installed at the START of the phase that uses them (dual-role principle)
- **Sequencing**: holding built completely first; Outleteuro executed by the holding's own departments, never directly by the builder

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Headline Recommendation

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Claude Code + **@anthropic-ai/claude-agent-sdk** (TS) | 0.3.201 | Orchestration runtime — kernel/orchestrator run as Agent SDK programs; interactive Claude Code for CEO-terminal work | It IS the same harness that powers Claude Code (renamed from Claude Code SDK, Sep 2025): tool loop, subagents with isolated context, sessions, hooks, first-class MCP client. Anthropic's production multi-agent pattern (orchestrator-worker: lead agent decomposes, spawns parallel subagents) maps 1:1 onto Kernel → Heads → Specialists. Headless mode is explicitly designed for cron/event-driven resident jobs — exactly the queue-worker and scheduled-department use case. No framework (LangGraph etc.) needed on top. |
| **Supabase** (self-hosted, Postgres 15+) | supabase-js 2.110.0 | Single state store: kernel state, task queue tables, CRM, audit log, cost ledger, pgvector RAG, Realtime feed to dashboard | Locked decision, and the right one: one Postgres holds everything, so approval gates, audit, and cost tracking are transactional with the work itself. Self-host the Supabase docker-compose stack on the VPS — keeps recurring cost inside the €20/mo VPS line instead of $25+/mo cloud Pro, keeps company data sovereign, and still gives Auth + Realtime + Storage + Studio + pgvector out of the box. |
| **pg-boss** | 12.25.1 | Task Queue / job system on the same Supabase Postgres | Postgres-native (`SELECT … FOR UPDATE SKIP LOCKED`), ACID with your state writes, retries with backoff, cron scheduling, priorities, pub/sub, dead-letter — with zero extra infrastructure. At DXB scale (tens of jobs/sec at most) it deletes Redis from the stack entirely. Workers are Node processes that pull a job and invoke the Agent SDK — the cleanest possible "queue triggers agent" seam. Requires a direct (session-mode) Postgres connection — trivial when Supabase is self-hosted on the same box. |
| **Next.js** | 16.2.10 | CEO Dashboard + embedded CRM cockpit | Current stable major; App Router + React Server Components is the standard for exactly this shape of app (auth-gated realtime dashboard). Pairs natively with supabase-js and Supabase Auth (`@supabase/ssr`). Matches the plan's own blueprint proposal (Next.js + Supabase realtime + Tailwind). |
| **@modelcontextprotocol/sdk** (TypeScript) | 1.29.0 | Framework for the 8 custom DXB MCPs (registry, queue, memory router, dashboard, CRM, approval gate, cost monitor, audit log) | Official SDK, stdio + Streamable HTTP transports. The 8 DXB MCPs are thin MCP faces over the same Postgres — writing them in TS lets them share one db/model layer with the kernel and dashboard in the monorepo. FastMCP (Python 3.4.2) is the alternative only if a Python-side tool must be wrapped. |
| **LiteLLM proxy** (Docker) | 1.91.0 | Multi-provider routing + cost enforcement in front of OpenRouter + NVIDIA Build + (optionally) Anthropic API | This is the piece that makes the Cost Monitor real instead of aspirational: one OpenAI-compatible endpoint; **virtual keys per department** with real-time budget enforcement (alert thresholds, hard-stop) — natively implementing the plan's "alert 70%, hard-stop non-critical at 100%" rule; per-key/team/model spend logged to Postgres; OpenRouter configured as an upstream provider so DXB keeps OpenRouter's model breadth while owning the audit trail and the department-level budget caps locally. The Cost Monitor MCP becomes largely a read-model over LiteLLM's spend tables plus subscription-call tagging. |
| **Docker Compose on Hetzner** | Compose v2; Hetzner CX42/CPX31-class (8GB+) | 24/7 VPS runtime for the whole service stack | Plain docker-compose + systemd unit is the leanest, most transparent, and most agent-legible deployment for a budget-capped stack (a PaaS layer like Coolify idles at ~1.2GB RAM you'd rather give to Supabase). One `docker-compose.yml` is itself an artifact agents can read and modify under approval. Caddy as reverse proxy for TLS. |
| **hermes-agent** | latest upstream (locked) | 24/7 resident agent on VPS (social/ops routines), GLM 5.2 brain via LiteLLM→OpenRouter | Locked decision. Point its OpenAI-compatible endpoint at the local LiteLLM proxy so even the resident agent's spend is inside the budget envelope. |
| **Speaches** (Docker) | latest image (bundles faster-whisper 1.2.1 + Kokoro-82M + Piper) | JARVIS voice layer: STT + TTS as one OpenAI-compatible audio server | One container exposes `/v1/audio/transcriptions` (faster-whisper; small model ≈4× realtime on CPU with int8) and `/v1/audio/speech` (Kokoro-82M: 327MB, 54 voices, fast on CPU; Piper as ultra-light fallback). CPU-only image fits the no-GPU Hetzner box. This is the "Whisperflow clone" the plan mandates — voicebox on the laptop stays the local client, Speaches on the VPS is the always-on backend for morning briefings and spoken commands. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Tailwind CSS | v4.x | Dashboard styling | From first dashboard commit (plan's design-bundle discipline applies on top) |
| shadcn/ui + Aceternity UI | current | Dashboard components | shadcn as the base component system; Aceternity for the plan's referenced showcase components |
| `ai` (Vercel AI SDK) | 7.0.15 | Streaming chat/agent UI in the dashboard (talk-to-any-worker panel) | Only in the dashboard; not for orchestration — orchestration is Agent SDK territory |
| `@supabase/ssr` | current | Supabase Auth in Next.js App Router | Dashboard auth (CEO login from anywhere) |
| pgvector (Supabase extension) | bundled | Vector RAG store for the memory router | Embeddings for vault/notebook content; no external vector DB |
| Zod | 4.x | Schema validation for MCP tool inputs, queue payloads, approval-gate payloads | Everywhere a payload crosses a boundary; MCP SDK uses it natively |
| zh (drizzle-orm or kysely) | current | Typed SQL layer shared by MCPs, workers, dashboard | Pick one in P2; drizzle has the larger ecosystem momentum |
| openWakeWord / voicebox hotkey | current | Wake-word / push-to-talk on the laptop client | JARVIS input capture, local only |
| yt-dlp + video-use | current (locked) | Video-learning module | P4 per plan |
| FastMCP (Python) | 3.4.2 | Alternative MCP framework | Only for wrapping Python-native tools (e.g., an open-notebook MCP face) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| pnpm workspaces monorepo | One repo: `packages/{kernel,mcps/*,workers,dashboard,shared}` | Shared db schema + types across all 8 MCPs and the kernel |
| Supabase CLI | Local dev + migrations | `supabase db diff` migrations checked into git — schema is auditable company memory |
| Docker + Compose v2 | Local parity with VPS | Same compose file family dev/prod with env overrides |
| Caddy | TLS + reverse proxy on VPS | Auto-HTTPS; simpler than Traefik/nginx for a single box |
| direnv / dotenv + `.gitignore` vault pattern | Secrets (P0 locked) | LiteLLM virtual keys mean most agents never see a real provider key at all |

## Architecture Fit (how the pieces click)

## Installation

# Monorepo core (Node 22 LTS, pnpm)

# VPS services (docker-compose.yml)

#   supabase/*        — self-hosted Supabase stack (official compose)

#   ghcr.io/berriai/litellm:main-stable      — LiteLLM proxy (+ its Postgres schema in Supabase)

#   ghcr.io/speaches-ai/speaches:latest-cpu  — STT/TTS

#   open-notebook     — research brain

#   hermes-agent      — 24/7 resident

#   caddy             — TLS reverse proxy

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| pg-boss | **Supabase Queues (pgmq)** | If you want queue ops visible in Supabase Studio and consumed via PostgREST/edge functions. It's native and durable (exactly-once within visibility window, archive for audit), but consumers poll via RPC — pg-boss gives real Node worker semantics (retry policies, cron, teams) that a job system for agents needs. Revisit if you move dashboard-triggered micro-jobs into edge functions. |
| pg-boss | Graphile Worker 0.17.2 | Slightly lower latency (<5ms claim), but lower-level API and smaller feature set (pg-boss's cron + retention + dead-letter come free). Same SKIP LOCKED ceiling. |
| pg-boss | BullMQ 5.79 + Redis | Only if throughput ever reaches thousands of jobs/sec — it won't in this OS. Not worth a second stateful service. |
| Claude Agent SDK orchestration | Temporal / Inngest durable execution | If long-running multi-day workflows with replay semantics become a real pain point (e.g., week-long client projects with many suspend/resume points). Heavyweight; defer unless queue + state-machine tables prove insufficient. |
| Self-hosted Supabase on VPS | Supabase Cloud (Pro $25/mo) | If self-hosting ops burden bites (backups, upgrades) or the VPS gets RAM-starved. Migration is straightforward (it's just Postgres + the same client libs). Budget-wise it trades ~€23/mo of the API envelope. |
| Plain docker-compose | **Dokploy** | If a deploy UI is wanted: lightest PaaS (~0.8GB idle), stays closest to raw compose, Traefik auto-routing. Choose it over Coolify (heavier, ~1.2GB idle, wants 8GB for itself). Reasonable to adopt later without rework since it deploys compose files. |
| LiteLLM proxy | Direct OpenRouter SDK calls | For quick dev spikes only. You lose per-department virtual keys, budget hard-stops, and the unified spend ledger — the exact features the Cost Monitor requirement demands. |
| Speaches | whisper.cpp + standalone Piper | If VPS RAM is critically tight; more glue code, no OpenAI-compatible API surface. |
| MCP SDK (TS) for DXB MCPs | FastMCP (Python 3.4.2) | Only for MCP faces over Python-native tools (open-notebook, research stack). Core 8 stay TS for the shared db layer. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| LangChain / LangGraph / CrewAI / AutoGen as orchestration core | Redundant abstraction layer over what Claude Code + Agent SDK already do (tool loop, subagents, MCP, sessions); adds a second agent mental model your 367 personas don't speak; churn-heavy APIs | Claude Agent SDK orchestrator-worker pattern + pg-boss dispatch |
| Redis / BullMQ / Celery | Second stateful service to run, back up, and secure on a budget box, for throughput you'll never need | pg-boss on the existing Postgres |
| Dedicated vector DB (Pinecone, Weaviate, Qdrant) | Extra service + cost; your corpus (vault + notebook + decisions) is well within pgvector scale | pgvector in Supabase |
| `postgres_changes` as the primary dashboard feed | Logical-replication latency + per-event auth checks; Supabase itself now steers to Broadcast | Realtime Broadcast from DB triggers |
| Kubernetes / k3s / Nomad | Massive ops tax for one box; compose is agent-readable and sufficient | docker-compose + systemd (+Dokploy later if desired) |
| Coolify (on this box) | ~1.2GB idle RAM and wants 8GB for itself — RAM that Supabase + Speaches + hermes need | Plain compose; Dokploy if PaaS UI wanted |
| External CRM (HubSpot etc.), NotebookLM, llm-council, kickbacks.ai, automaton, free-tier-stacking routers | All excluded by locked decisions (cockpit unity; sub ends Oct 2026; dead repo; adware; crypto; ToS) | Custom CRM on Supabase; open-notebook; in-house council; OpenRouter via LiteLLM |
| Scattering raw provider API keys into agent configs | Untraceable spend, unrotatable leaks — the exact failure mode of the source .odt | LiteLLM virtual keys per department; real keys live only in the LiteLLM container env |
| Writing the 8 DXB MCPs as 8 separate repos/stacks | Duplicated db logic, drift between registry/queue/audit views of the same tables | One monorepo package per MCP over one shared schema package |

## Stack Patterns by Variant

- Run: Supabase stack (trimmed: drop Storage/Imgproxy if unused), LiteLLM, Speaches (CPU), hermes, open-notebook, Caddy, Node workers.
- Use Whisper `small` int8 and Kokoro; skip larger STT models.
- This fits, but monitor: Supabase stack ~2–2.5GB, Speaches ~1–1.5GB under load.
- First move Speaches to on-demand start (systemd socket activation or compose profile) — voice is bursty.
- Second option: Supabase Cloud for the DB tier, keep everything else on the VPS.
- Wrap it in FastMCP 3.4.2 behind the gateway rather than porting; the gateway makes language invisible to agents.
- LiteLLM can't meter them (they don't pass through it). Tag them via Agent SDK hooks writing to the same cost ledger table with `mode=subscription`, per the plan's tagging rule.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| @anthropic-ai/claude-agent-sdk 0.3.x | Node ≥ 20 (use 22 LTS) | Pre-1.0: pin exact version, review changelogs on bump; API has been evolving fast since the Sep 2025 rename |
| @modelcontextprotocol/sdk 1.29.0 | Zod v4, Node ≥ 20 | Streamable HTTP is the current remote transport; SSE transport is legacy — don't build new servers on it |
| pg-boss 12.x | Postgres ≥ 13; needs session-mode connection | Do NOT connect through PgBouncer/Supavisor transaction pooling; use the direct 5432 connection (fine on self-hosted same-box) |
| next 16.2.x | React 19, Node ≥ 20 | Use `@supabase/ssr` (not the deprecated auth-helpers) for App Router auth |
| supabase-js 2.110 | Realtime Broadcast v2 channels | Broadcast-from-database requires the `realtime.broadcast_changes` trigger helper (present in current self-hosted images) |
| LiteLLM 1.91 | Postgres for spend/keys; Redis optional | Point its DB at a dedicated schema in the same Supabase Postgres; Redis only needed for multi-instance proxy (not this scale) |
| Speaches (CPU image) | x86-64, AVX2 | Hetzner CX/CPX lines qualify; int8 quantization default on CPU |

## Implications for Roadmap Phases

- **P2 (kernel skeleton):** monorepo + Agent SDK + Supabase (local CLI) + pg-boss are the only load-bearing installs. LiteLLM can come in P2 too — the earlier every API call flows through it, the earlier the cost ledger is real.
- **P3 (memory):** pgvector + automatic-embeddings pattern + Memory Router MCP; no new infrastructure beyond what P2 installed.
- **P4 (gateway + VPS):** this is the phase with real research risk — the MCP gateway per-department scoping is the least-commoditized piece of the whole stack (flag for deeper phase research: evaluate docker/mcp-gateway, ContextForge, Lasso patterns before building).
- **P5 (dashboard + JARVIS):** Next.js 16 + Broadcast + Speaches; all decisions above are prescriptive enough to start immediately after the design-bundle study pass.

## Sources

- npm registry (`registry.npmjs.org`) — versions for @anthropic-ai/claude-agent-sdk, @modelcontextprotocol/sdk, next, pg-boss, graphile-worker, bullmq, @supabase/supabase-js, ai — verified 2026-07-05 (registry-verified)
- PyPI (`pypi.org`) — fastmcp 3.4.2, litellm 1.91.0, faster-whisper 1.2.1, kokoro 0.9.4, mcp 1.28.1 — verified 2026-07-05 (registry-verified)
- [Claude Code Docs — Subagents in the SDK](https://code.claude.com/docs/en/agent-sdk/subagents); [Claude Platform Docs — Multi-agent sessions](https://platform.claude.com/docs/en/managed-agents/multi-agent) — MEDIUM (official, cross-checked)
- [pg-boss GitHub](https://github.com/timgit/pg-boss); [pg-boss production tutorial](https://nerdleveltech.com/pg-boss-postgres-job-queue-node-typescript-production-tutorial); [Graphile Worker performance docs](https://worker.graphile.org/docs/performance); [PostgreSQL-for-queues analysis](https://dev.to/aws-builders/i-removed-redis-from-my-stack-and-used-postgresql-for-job-queues-instead-2lp5) — MEDIUM (cross-verified)
- [Supabase Queues docs](https://supabase.com/docs/guides/queues); [pgmq extension docs](https://supabase.com/docs/guides/database/extensions/pgmq); [Automatic embeddings](https://supabase.com/docs/guides/ai/automatic-embeddings) — MEDIUM (official)
- [Supabase Realtime — Postgres Changes limits](https://supabase.com/docs/guides/realtime/postgres-changes); [Broadcast from Database](https://supabase.com/blog/realtime-broadcast-from-database); [Realtime benchmarks](https://supabase.com/docs/guides/realtime/benchmarks) — MEDIUM (official, cross-checked)
- [LiteLLM GitHub](https://github.com/BerriAI/litellm); [LiteLLM budget routing docs](https://docs.litellm.ai/docs/proxy/provider_budget_routing); [OpenRouter vs LiteLLM (OpenRouter blog)](https://openrouter.ai/blog/insights/openrouter-vs-litellm/); [TrueFoundry comparison](https://www.truefoundry.com/blog/litellm-vs-openrouter); [Merge.dev comparison](https://www.merge.dev/blog/litellm-vs-openrouter) — MEDIUM (cross-verified incl. both vendors)
- [Speaches on Railway (capabilities)](https://railway.com/deploy/speaches); [Kokoro TTS local setup](https://localaimaster.com/blog/kokoro-tts-local-setup); [Piper TTS setup](https://localaimaster.com/blog/piper-tts-setup-guide); [Self-hosted voice stack writeup](https://brainsteam.co.uk/2025/4/6/adding-voice-to-selfhosted-ai/) — MEDIUM (cross-verified)
- [MCP security best practices (official)](https://modelcontextprotocol.io/docs/tutorials/security/security_best_practices); [MCP gateway pattern (Arcade)](https://www.arcade.dev/blog/mcp-gateway-pattern/); [MCP access control / least privilege (AppSentinels)](https://appsentinels.ai/blog/mcp-access-control-how-to-enforce-least-privilege-across-ai-agent-tool-chains/); [Tyk MCP gateway architecture](https://tyk.io/learning-center/mcp-gateway-architecture-technical-guide/) — MEDIUM (cross-verified)
- [Dokploy vs Coolify (LogRocket)](https://blog.logrocket.com/dokploy-vs-coolify-production/); [Dreams of Code comparison](https://blog.dreamsofcode.io/coolify-vs-dokploy-why-i-decided-to-use-one-over-the-other); [srvrlss cost analysis](https://www.srvrlss.io/blog/coolify-v-dokploy-v-digitalocean/) — MEDIUM (cross-verified)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
