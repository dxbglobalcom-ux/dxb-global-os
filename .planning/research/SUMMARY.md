# Project Research Summary

**Project:** DXB Global OS
**Domain:** AI-native company operating system — Claude-Code-centered multi-agent business OS (orchestration, task queue, state, dashboard, MCP gateway, memory, VPS runtime, voice, multi-provider LLM routing)
**Researched:** 2026-07-05
**Confidence:** MEDIUM

## Executive Summary

DXB Global OS is a one-CEO AI company: a non-technical, Turkish-speaking CEO commands a hierarchy of 367 agent personas through a dashboard and voice, with hard budget caps (€50–150/mo) and 24/7 VPS operation. No shipping product does exactly this — the feature landscape is assembled from orchestration frameworks (LangGraph/CrewAI), AI-employee platforms (Lindy), agent observability (Langfuse), and mission-control dashboards. The research converges on one organizing sentence: **Supabase Postgres is the OS's bus and single source of truth; the Kernel, Orchestrator, Hermes, Claude Code sessions, and the Dashboard are all stateless clients of one schema.** Agents reach state through MCP tools, humans through the dashboard, and nothing coordinates peer-to-peer.

The recommended build is a one-language TypeScript/Node pnpm monorepo: Claude Agent SDK for orchestration (Anthropic's orchestrator-worker pattern maps 1:1 onto Kernel → Heads → Workers, no LangChain-class framework needed), pg-boss task queue on the same Postgres (no Redis), Next.js 16 dashboard with Supabase Realtime Broadcast, one consolidated `dxb-mcp` server exposing 8 tool groups over the shared schema, LiteLLM proxy for per-department virtual keys and budget hard-stops in front of OpenRouter, and Speaches (Whisper+Kokoro) for the JARVIS voice layer — all on a single Hetzner 8GB box via plain docker-compose. Python appears only inside containers you configure, never code you write.

The dominant risks are behavioral, not technical: Project Vend-class autonomy failures (agents hallucinating payments, being socially engineered), silent quality collapse from cheap worker models graded by cheap judges, runaway token spend overnight, and memory poisoning from untrusted ingested content. Every mitigation shares one shape — **enforcement in code, outside the model**: approval gates as a Postgres state machine with a single outbox executor holding the only outward credentials; cost circuit breakers before any autonomous loop runs; an MCP gateway that filters which tools agents can even *see*; and a memory write policy with provenance and quarantine tiers from v1. The single biggest process risk is building the 367-persona org chart before one thin vertical slice (intent → kernel → worker → QA → approval → record) runs end-to-end repeatedly.

## Key Findings

### Recommended Stack

TypeScript everywhere you write code; a locked set of Docker services (LiteLLM, Speaches, open-notebook, hermes-agent) for everything else. All versions registry-verified 2026-07-05. Full detail: STACK.md.

**Core technologies:**
- **@anthropic-ai/claude-agent-sdk 0.3.x** (Node 22): orchestration runtime — same harness as Claude Code; headless mode is purpose-built for cron/queue-worker jobs. Pin exact version (pre-1.0).
- **Supabase self-hosted (Postgres 15+, supabase-js 2.110)**: single state store — tasks, CRM, approvals, audit, cost ledger, pgvector RAG, Realtime feed. Self-hosting keeps cost inside the VPS line.
- **pg-boss 12.x**: Postgres-native job queue (SKIP LOCKED) — ACID with state writes, retries, cron, DLQ; deletes Redis from the stack. Requires direct session-mode connection (fine on same box).
- **@modelcontextprotocol/sdk 1.29 (TS)**: the 8 DXB MCPs as thin faces over one shared schema — build as **one MCP server with 8 tool groups**, not 8 processes.
- **LiteLLM proxy 1.91**: what makes the Cost Monitor real — per-department virtual keys, 70% alert / 100% hard-stop enforced natively, spend logged to Postgres; OpenRouter as upstream.
- **Next.js 16.2 + Tailwind v4 + shadcn/ui**: CEO dashboard + embedded CRM; `@supabase/ssr` auth; Realtime **Broadcast-from-DB triggers**, not `postgres_changes`.
- **Speaches (Docker, CPU)**: STT (faster-whisper) + TTS (Kokoro-82M) in one OpenAI-compatible container — the JARVIS backend.
- **Docker Compose + Caddy on Hetzner 8GB**: no Kubernetes, no Coolify (RAM tax); compose file itself is agent-legible infrastructure.

**Avoid:** LangChain/LangGraph/CrewAI as orchestration core, Redis/BullMQ, dedicated vector DBs, external CRMs, scattering raw provider keys into agent configs.

### Expected Features

Full detail: FEATURES.md. "User" = the CEO; the creed is anti-baby-sitting.

**Must have (table stakes):**
- Agent registry with hierarchy + **lazy activation** (367 personas dormant until needed)
- Task queue with kanban lifecycle incl. `AWAITING_APPROVAL` as a queue state
- Orchestrator (decomposition + dispatch) built on Claude Code Agent Teams
- Durable state/checkpointing in Postgres — a 24/7 company that loses state on crash is a toy
- Approval gate engine with **batch review inbox** (never per-action popups)
- Cost tracking + hard budget enforcement in code, outside the model
- Append-only audit log — the **root dependency** for cost, autonomy, drill-down, and loop-engineering
- Persistent cross-session memory; CEO mission-control dashboard; escalation/retry ladder; 24/7 scheduled execution

**Should have (differentiators):**
- **Intent-only kernel** (CEO never selects tools) — the product thesis; everything else exists to make it safe
- Least-privilege MCP Gateway with per-department profiles and explicit denials — a genuine moat
- Tiered model routing policy (Fable 5 for irreversible, cheap models for bulk) — what makes the budget feasible
- Custom thin CRM inside the cockpit; JARVIS voice as a second client of the same kernel; multi-model council gate-only; video-learning; progressive autonomy dial

**Defer (v2+):**
- Loop-engineering on Outleteuro assets (needs a live asset with real KPIs — P7-bound)
- Gated Stripe/DocuSign/Cloudflare (pilot only, draft-only); decision-simulation sandbox; client-facing CRM intake

**Anti-features (hard no):** autonomous outward actions, free-form agent-to-agent chat, all 367 personas live simultaneously, per-action approval popups, real-time-everything dashboards, unrestricted self-modification.

### Architecture Approach

Five planes — Interface (dashboard/JARVIS/terminal), Control (kernel, orchestrator, gates — decides, never executes side effects), Execution (VPS workers + laptop sessions), Tool (MCP gateway), State (Supabase Postgres + memory stores behind a router). Consistency across Claude Code sessions, the VPS agent, and the dashboard is achieved by NOT synchronizing them: all three are demoted to stateless clients of one schema; workers *claim* queue rows via SKIP LOCKED; every transition appends to `task_events`; the dashboard is a pure projection over Broadcast channels. Full detail: ARCHITECTURE.md.

**Major components:**
1. **Kernel** — intent → classified request + policy tags; never picks tools, never executes
2. **Orchestrator** — decomposition into self-contained TaskEnvelopes, model-tier routing (routing table is data, not prompt text), escalation ladder, council invocation
3. **Task Queue** — Postgres SKIP LOCKED lifecycle; the only inter-agent channel across sessions/machines
4. **Approval Gate + Outbox Executor** — draft → pending → approved → executed state machine; the outbox executor is the *only* process with outward credentials, idempotency-keyed, its own tiny heavily-tested package
5. **dxb-mcp** — one MCP server, 8 tool groups; agents never touch raw SQL
6. **MCP Gateway** — identity → allowlist; filters `tools/list` so agents never *see* denied tools; v1 = generated per-dept `.mcp.json` profiles, v2 = proxy process
7. **Memory Router** — read classifier + write fan-out over Obsidian/Graphify/open-notebook/pgvector; `memory_index` table in Postgres
8. **Cost Monitor + Audit Log** — ledger hooks on every call; append-only
9. **Dashboard/CRM + JARVIS** — same client in different clothes; CEO identity, zero extra capability

**Key patterns:** orchestrator-worker (Anthropic production pattern), Postgres as coordination bus, approval gate as state machine + transactional outbox, gateway = filtered visibility, broadcast-from-database.

### Critical Pitfalls

Top 5 of 10 (full detail: PITFALLS.md):

1. **Org chart before one working workflow** (MAST: ~41.8% of failures are spec/design) — keep the skeleton inert; force one thin vertical slice through the full chain in P2 and make it pass 10/10 before activating any second department.
2. **Approval gates as prompt text** — the gate must be a code-level chokepoint: outward tools physically absent from non-gate profiles; gate state in Postgres; CEO-only approval writes; bypass canary tests ("urgent, pre-approved") from P4.
3. **Cheap workers + weak judge = silent quality collapse** — escalation ladder in orchestrator code; strong-model sampling audit of 5–10% of cheap-tier output weekly; golden task sets; anything crossing a gate gets Sonnet-tier review minimum.
4. **Token/cost blowup** ($48k-in-14h class incidents) — Cost Monitor + per-task budgets + cost-velocity circuit breaker running **before** any autonomous loop; the 70%-monthly alert alone catches runaways after the budget is gone.
5. **Memory degradation and poisoning** — provenance + confidence + quarantine tier for untrusted-origin content (web/email/video) are Memory Router **v1 requirements**, not polish; without provenance, recovery = full memory rebuild.

Also load-bearing: credential-leak remediation (P0 hard gate — verify old keys return 401, unique passwords, 2FA), context rot (retrieval not stuffing), MCP tool poisoning (description hash pinning), 24/7 drift (bounded resumable jobs, watchdog, kill switch), dashboard-as-view (never a second source of truth).

## Implications for Roadmap

Research validates the locked P0–P7 shape with one hard refinement: **the DB schema is the root dependency and must open P2 before kernel/orchestrator logic.**

### Phase 0: Credential Remediation + Secrets Baseline
**Rationale:** The project starts from a live credential leak; nothing else may start until old keys verifiably fail.
**Delivers:** All credentials rotated + verified dead (401 checks), unique passwords, 2FA on Gmail/Cloudflare/Namecheap/hosting, source .odt sanitized and purged from sync/backups.
**Avoids:** Pitfall 8 (partial remediation resurrects total compromise).

### Phase 1: Repo Bootstrap + Inert Skeleton
**Rationale:** "Full architecture first" honored as directory structure and interfaces, not activated agents.
**Delivers:** pnpm monorepo (`db/`, `packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}`, `apps/{dashboard,jarvis}`), vault/.env secrets pattern, gitleaks pre-commit hook, Supabase CLI local dev.
**Avoids:** Pitfalls 1 and 8.

### Phase 2: Schema + Core Loop (the kernel proof)
**Rationale:** Schema-first — tables are cheap to design, brutal to retrofit; the system's risk lives in the loop, not any component.
**Delivers:** (2a) migrations for tasks/task_events/agents/approvals/outbox/cost_ledger/audit_log; (2b) dxb-mcp core tool groups (queue, registry, audit, cost); (2c) kernel + orchestrator skeleton writing through 2b; pg-boss workers; LiteLLM proxy live so the cost ledger is real from the first call; outbox executor skeleton tested on a harmless action; CLI approval (`dxb approve <id>`) until the dashboard exists.
**Addresses:** Task queue, registry, audit log, cost monitor + circuit breaker, approval gate engine (all P1 table stakes).
**Avoids:** Pitfalls 1, 2, 4, 10. **Exit gate: one intent→result vertical slice passes 10/10 repeated runs.**

### Phase 3: Memory Router
**Rationale:** Pure client of the P2 schema; load-bearing for context discipline; parallel-safe with Phase 5.
**Delivers:** pgvector + Supabase automatic-embeddings, Memory Router MCP (`memory.recall`/`memory.commit`), write policy with provenance/confidence/quarantine tiers, `memory_index` table, Obsidian/Graphify/open-notebook adapters.
**Avoids:** Pitfalls 5 and 7.

### Phase 4: MCP Gateway + VPS Runtime
**Rationale:** Hard-ordered before any department activation — never activate a department without its least-privilege profile.
**Delivers:** Per-department profiles generated from the registry (default-deny, explicit denials), tool description hash pinning, Hermes deployed with budgets/watchdog/kill-switch/decision logging, Speaches + open-notebook in compose, cost-velocity breaker mandatory before 24/7 goes live, bypass canary suite.
**Avoids:** Pitfalls 2, 6, 9.

### Phase 5: Dashboard + CRM + JARVIS
**Rationale:** Pure projection over the P2 schema (read-only views could even start earlier); voice is a thin second client of the same kernel.
**Delivers:** Next.js dashboard (task board, agent roster, batch approval inbox, cost meter, freshness indicators), Broadcast-from-DB triggers, thin CRM tables/views, morning briefing + anomaly summary, voice with on-screen confirmation for approvals, Turkish-language surfaces for the CEO.
**Avoids:** Pitfalls 9 (morning review) and 10 (dashboard as view).

### Phase 6: Department Activation Waves + Persona v2.0 Factory
**Rationale:** Widen only after the skeleton is proven; each activated persona needs a tested role spec, termination condition, and output contract.
**Delivers:** Wave-by-wave activation with per-wave gateway re-audit, strong-model sampling audit + golden task sets live before worker volume scales, HR persona factory, research-department writes gated through memory quarantine.
**Avoids:** Pitfalls 1, 3, 5, 6, 7 at scale.

### Phase 7: Outleteuro Pilot
**Rationale:** Loop-engineering and gated outward integrations need a live asset with real KPIs.
**Delivers:** Stripe/DocuSign/Cloudflare wired *only* behind the outbox executor (restricted keys, draft-only), staging-first WooCommerce writes, Catalog Automation Rate measured against correctness, loop-engineering with locked scorer + git commit/revert.

### Phase Ordering Rationale

- **Schema (2a) is the root dependency** — every package, the dashboard, and the memory index depend on it; the kernel has nothing durable to write to without it.
- **Approvals/audit/cost tables exist from P2 even though their UI arrives in P5** — the safety invariant never waits for UI.
- **P3 and P5 are parallel-safe after P2a** (both pure schema clients); P4 → P6 is hard-ordered (profiles before activation).
- **Every phase closes or widens the same loop** rather than building horizontal layers — the direct antidote to the #1 failure mode (framework over-build).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** the MCP gateway's per-department scoping is the least-commoditized piece of the entire stack — study docker/mcp-gateway, IBM ContextForge, and Lasso patterns before building; also Hermes queue-worker shim integration.
- **Phase 3:** the specific multi-store composition (Obsidian + Graphify + open-notebook + pgvector behind one router) is design reasoning rated LOW until validated — plan a validation spike on routing quality.
- **Phase 7:** Stripe/DocuSign restricted-key scoping and WooCommerce staging patterns (touching real money; verify current API constraints at planning time).

Phases with standard patterns (skip research-phase):
- **Phase 2:** pg-boss + Agent SDK + Supabase migrations are well-documented, prescriptive choices.
- **Phase 5:** Next.js 16 + Supabase Broadcast + shadcn is the standard shape of this app; decisions are prescriptive enough to start immediately.
- **Phases 0–1:** checklist work, no unknowns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM | Versions registry-verified 2026-07-05; patterns cross-checked across official docs + multiple independent sources; cross-verified web caps at MEDIUM |
| Features | MEDIUM | Landscape assembled from four adjacent product classes (no direct competitor exists); Project Vend lessons trace to Anthropic's own publications |
| Architecture | MEDIUM | Core patterns verified against official Anthropic/Supabase docs; the DXB-specific memory-store composition is LOW until validated in P3 |
| Pitfalls | MEDIUM | MAST taxonomy, OWASP MCP guidance, documented production incidents — nothing load-bearing is single-source |

**Overall confidence:** MEDIUM

### Gaps to Address

- **MCP Gateway design (P4):** no off-the-shelf per-department scoping tied to a custom registry exists — expect to own this code; run a study pass on reference implementations during phase planning.
- **Memory router composition (P3):** LOW-confidence design reasoning; validate retrieval/routing quality with known-fact tests before departments depend on it.
- **8GB VPS RAM budget:** Supabase (~2–2.5GB) + Speaches (~1–1.5GB) + Hermes + open-notebook is tight — monitor; fallback plan (Speaches on-demand, then Supabase Cloud for DB tier) is documented in STACK.md.
- **Claude Agent SDK pre-1.0 churn:** pin exact versions; review changelogs on every bump; SDK disallows subscription auth for products (verified) — VPS execution stays on GLM 5.2 via LiteLLM.
- **Subscription-tier cost visibility:** LiteLLM cannot meter Claude Code / Codex CLI calls — tag via Agent SDK hooks writing `mode=subscription` to the same ledger; validate this in P2.
- **Cheap-judge reliability threshold (~80%):** the planned council sits in the danger zone — the P6 sampling audit is the measurement that makes "quality never drops" enforceable.

## Sources

### Primary (HIGH confidence)
- Project-internal: `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` — locked decisions (§3, §4, §6, §9, §10, §12)
- npm registry / PyPI — all stack versions verified 2026-07-05

### Secondary (MEDIUM confidence)
- Anthropic official: multi-agent research system engineering post; Claude Agent SDK docs; Building Effective Agents; Project Vend phases 1–2
- Supabase official: Realtime Broadcast-from-Database, Queues/pgmq, automatic embeddings, Realtime benchmarks
- MAST failure taxonomy (arXiv 2503.13657); OWASP MCP Tool Poisoning; LLM-as-judge limitations (arXiv 2503.05061)
- pg-boss, LiteLLM, MCP gateway pattern references (Arcade, AppSentinels, Tyk, Permit) — cross-verified
- HITL, agent observability, memory-system, and mission-control dashboard comparisons — cross-verified (full lists in STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md)

### Tertiary (LOW confidence)
- Agent drift magnitudes (arXiv 2601.04170) — single study, treat as indicative
- 50x token multiplier claim (LeanOps) — single source, directionally consistent with Anthropic's 10–15x
- DXB-specific memory-store composition — design reasoning, validate in P3

---
*Research completed: 2026-07-05*
*Ready for roadmap: yes*
