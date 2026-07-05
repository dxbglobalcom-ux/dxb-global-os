# Feature Research

**Domain:** AI-native company operating system (multi-agent business OS on Claude Code; non-technical CEO commands an agent company via dashboard + voice)
**Researched:** 2026-07-05
**Confidence:** MEDIUM (cross-checked web sources per classify-confidence seam; Project Vend lessons corroborated by Anthropic's own published research)

## Market Context

No shipping product today is exactly "an AI company that runs a real business for one CEO." The feature landscape is assembled from four adjacent product classes that together define expectations:

1. **Orchestration frameworks** (LangGraph, CrewAI, AutoGen/AG2, claude-flow/Ruflo, Claude Code Agent Teams) — define what an orchestration core must have.
2. **AI-employee platforms** (Lindy, Relevance AI) — define what a non-technical operator expects: no-code triggers, 500+ integrations, built-in approvals, agents that hold context and coordinate.
3. **Agent observability platforms** (Langfuse, AgentOps, LangSmith) — define the cost/audit/tracing baseline for anything running in production.
4. **Agent mission-control dashboards** (OpenClaw Mission Control, builderz mission-control, MeisnerDan mission-control) — define the cockpit UX: kanban task boards (inbox → assigned → in progress → review → done), live agent roster, department/org hierarchy views, morning briefs, approval inboxes.

Cautionary evidence class: **agent-company simulators** (MetaGPT, ChatDev — brittle linear SOP pipelines, >$10/task communication overhead) and **Anthropic's Project Vend** (Claudius hallucinated payment details, was socially engineered into loss-making sales, ordered a PS5 and a live fish). These define the anti-features.

## Feature Landscape

### Table Stakes (Users Expect These)

Every serious agent-orchestration product has these. For DXB, "user" = the CEO; missing any of these breaks the anti-baby-sitting creed or breaks trust.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Agent registry with roles + hierarchy | Every framework has role definition (CrewAI crews, claude-flow queens/workers, mission-control org charts). Dept → head → specialist → worker mirrors how dashboards already render fleets | MEDIUM | 367 personas exist on disk; registry = metadata + activation, not new content. Lazy activation is mandatory (see anti-features) |
| Task queue / job system with status | Mission-control products universally use a kanban lifecycle (inbox → assigned → in-progress → review → done). Without it there is no visibility and no dispatch | MEDIUM | Persist in Supabase/Postgres; status transitions drive dashboard in real time |
| Orchestrator: decomposition + dispatch | The defining feature of the category (LangGraph graphs, CrewAI processes, claude-flow orchestrator). CEO states intent; someone must break it into tasks | HIGH | Claude Code Agent Teams / Task system gives this natively — build on it, don't reinvent |
| Durable state / checkpointing | LangGraph's checkpointing is why it dominates production. A 24/7 company that loses state on crash is a toy | MEDIUM | Task state in Postgres + `.planning/`-style persistent files; resumability per task |
| Approval gate engine (HITL) | Built into Lindy/Relevance ("approvals built in"); universal enterprise pattern: serialize proposed action → queue → notify → suspend | MEDIUM | Standard pattern: request shows what/why/risk + approve/deny/request-changes/escalate. **Batch review inbox from day one**, not per-action popups |
| Cost tracking + budget enforcement | Langfuse-class token-level cost per model/session/department is the production baseline. DXB's €50–150/mo envelope makes it existential, not optional | MEDIUM | Every call tagged (model, tokens, dept, task, mode: subscription/api/free-tier); alert 70%, hard-stop non-critical at 100%. Hard stops must live OUTSIDE the model (Project Vend lesson) |
| Audit log / full action tracing | Agent observability = tracing the causal chain (every prompt, tool call, decision), not prompt/response pairs. Mission-control tools show "the entire journey an agent took" | MEDIUM | Append-only log; feeds both cost monitor and dashboard drill-down. Langfuse (self-hosted, open source) is the reference implementation |
| Persistent cross-session memory | Lindy markets "agents hold context across sessions" as core; Mem0/Zep/Letta made persistent memory a commodity expectation | HIGH | DXB's multi-store design (Obsidian + Graphify graph + open-notebook + claude-mem + router) is more ambitious than market norm — see dependencies |
| CEO dashboard (mission control) | The entire fleet-management category exists because "when you have a fleet you need a command center": live agent roster, task board, drill-down into any run | HIGH | Non-technical framing is the differentiating twist on a table-stakes feature |
| Tool/integration access for agents | Lindy's 500+ integrations set the expectation; MCP is the Claude-native answer | MEDIUM | Phased rollout (core → company ops → business automation) matches doc |
| Escalation / retry ladder | HITL literature: agents escalate low-confidence or repeatedly-failing work upward. CrewAI's weak error recovery is cited as its production gap | MEDIUM | Worker fails 2× → specialist → head → Fable; already specified in plan §10 |
| Scheduled + triggered execution (24/7) | AI-employee platforms run on triggers/cron; social/ops departments need always-on presence | MEDIUM | VPS + Hermes resident agent covers this |

### Differentiators (Competitive Advantage)

Aligned with Core Value (anti-baby-sitting for a non-technical CEO). These are where DXB exceeds the market — don't dilute them.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Intent-only kernel (CEO never selects tools) | Every framework makes the human choose agents/workflows. A kernel that classifies intent → policy → routing removes the operator skill requirement entirely — the product's thesis | HIGH | This is the single most differentiating feature. Everything else exists to make it safe |
| Least-privilege MCP Gateway (dept-scoped profiles) | No mainstream orchestrator ships per-department tool allowlists with explicit denials (CEO: no code MCPs; workers never see Stripe). Serious security posture is rare in this category | HIGH | Also the enforcement point for approval gates on Stripe/DocuSign. Genuine moat vs "give every agent every tool" norm |
| Tiered model routing with cost/quality policy | Frameworks let you set a model per agent; a policy engine that routes by task class (Fable 5 for irreversible, GLM/Kimi/DeepSeek for bulk) with auto effort-modes is beyond market norm and is what makes €50–150/mo feasible | HIGH | Depends on cost monitor + audit log for feedback |
| Custom CRM inside the cockpit | "Whole company in one pane" — clients, tasks, agents, emails, approvals in one Supabase-backed UI that agents read/write natively via MCP. External CRMs break this | HIGH | Differentiator only if it stays thin: CRM = tables + views inside dashboard, not a HubSpot clone |
| JARVIS voice layer (briefings + spoken commands) | Voice pipelines (Whisper STT + TTS) are commodity open source; wiring voice → intent kernel → agent company is not. For a non-technical CEO this is a real interface, not a gimmick. Morning-brief pattern already proven in mission-control products | MEDIUM | Hard part is intent routing, which the kernel already does — voice is a second client of the same kernel |
| Multi-model council at critical gates | Judgment diversity (N cheap models + judge) only at irreversible decisions. Market has LLM-as-judge evals; almost nobody gates business actions on a council | LOW-MEDIUM | Simple to own (parallel OpenRouter calls + judge). Keep it gate-only — N+1 cost per invocation |
| Video-learning module (drop a YouTube link) | No orchestration product ingests "watch this and learn." For a CEO whose knowledge intake is video, this converts intent-source directly into company memory | MEDIUM | yt-dlp + transcript + summarize → memory router. Batch/async, never inline in task flow |
| Loop-engineering / autoresearch on business assets | Self-improvement (mutable asset + locked scorer + git commit/revert) applied to ads/emails/listings. Market's "self-improvement" is mostly marketing; a locked-scorer loop is a disciplined, ownable version | HIGH | Locked scorer is the safety property — without it this becomes an anti-feature |
| HR digital-worker factory (persona v2.0 pipeline) | Systematic creation/upgrade of agents by agents. Market ships static agent templates; a factory that maintains 367+ personas is organizational scale nobody else has | MEDIUM | Content pipeline, not infrastructure; runs after skeleton exists |
| Progressive autonomy per agent/action class | HITL best practice ("start approving everything, widen with track record") implemented as policy: autonomy levels earned per department/action type, adjustable from the dashboard | MEDIUM | Turns approval gates from a bottleneck into a trust dial; strong fit for anti-baby-sitting |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Autonomous outward actions (money, contracts, emails, ad spend) | "Fully autonomous company" is the fantasy | Project Vend: Claudius hallucinated a Venmo account, was socially engineered into loss-making sales, went effectively bankrupt. Helpfulness training conflicts with business discipline | Hard approval gates, always DRAFT-first (already locked). Budget caps enforced in code outside the model |
| Free-form conversational agent-to-agent chat (AutoGen-style GroupChat) | Feels emergent and "alive" | Scales poorly past ~5 agents (turn count explodes); MetaGPT-class costs exceeded $10/task on serial messages; nondeterministic and unauditable | Structured handoffs: task queue + typed artifacts (MetaGPT's documents-not-dialogue insight), orchestrator-mediated |
| All 367 personas live simultaneously | "The whole company is running!" | Token bloat, context rot, cost explosion; violates the doc's own token-discipline rule | Registry with lazy activation: personas are dormant metadata until a task requires them |
| Real-time everything in the dashboard | Transparency mandate suggests live-stream all agent output | WebSocket-everything complexity, rendering overload, cost of streaming traces; CEO needs signal, not firehose | Real-time for task status + approvals inbox + cost meter; drill-down traces load on demand |
| Per-action approval popups | Simplest HITL implementation | An overnight agent producing 100 actions = 100 interruptions; CEO becomes the babysitter the creed forbids | Batch approval inbox with risk grouping + morning voice/dashboard brief summarizing the queue |
| Adopting an external CRM (HubSpot etc.) | Mature, feature-rich | Breaks single-cockpit requirement; agents need native read/write; per-seat pricing vs €150/mo budget | Custom thin CRM on Supabase (already locked decision) |
| Simulation as decision engine (MiroFish et al.) | "Predict outcomes before acting" | Simulations ungrounded in live data produce confident nonsense; doc itself flags this | Sandbox-only; final decisions require live-web grounding + premium-model review |
| Unrestricted self-modification ("agents improve themselves") | Ultimate autonomy story | Unscored mutation degrades assets silently; no rollback = compounding damage | Karpathy autoresearch pattern: one mutable asset, locked scorer, git commit winners / revert losers |
| Building a custom LLM gateway from scratch | Control over routing | Reimplements OpenRouter for zero gain; maintenance burden on a one-CEO company | OpenRouter as gateway (locked); kernel owns only the routing *policy* |
| Linear SOP pipelines with no feedback loops | MetaGPT-style assembly line is easy to reason about | Brittle: no mechanism for a downstream agent to push back ("requirement ambiguous") triggers rework-blindness | Queue supports task rejection/return-to-sender; escalation ladder doubles as feedback channel |

## Feature Dependencies

```
Audit Log (tracing)
    └──required by──> Cost Monitor ──required by──> Tiered Model Routing (policy feedback)
    └──required by──> Dashboard drill-down
    └──required by──> Progressive Autonomy (track record = audit data)

Task Queue
    └──required by──> Orchestrator dispatch
    └──required by──> Approval Gate engine (gates are queue states)
    └──required by──> Dashboard task board

Agent Registry ──required by──> Orchestrator (who can do what)
    └──required by──> MCP Gateway (profiles attach to registry entries)
    └──required by──> HR factory (factory writes registry entries)

OS Kernel (intent → policy → routing)
    └──required by──> JARVIS voice (voice is a 2nd client of the kernel)
    └──required by──> Dashboard command bar (1st client)

Memory Router ──required by──> Video-learning (output lands in memory)
    └──required by──> Department activation (agents need read/write memory)

Dashboard ──required by──> Approval inbox UX ──required by──> any outward-facing department (marketing/sales/finance)

Approval Gates + Cost Monitor ──required by──> Outleteuro pilot (P7 gates Stripe/ads)

Multi-model council ──enhances──> Approval Gates (pre-gate QA)
Loop-engineering ──requires──> Audit log + git discipline + a live asset (Outleteuro)
Free-form agent chat ──conflicts──> Token discipline + auditability
```

### Dependency Notes

- **Audit log is the root dependency.** Cost enforcement, progressive autonomy, dashboard drill-down, and loop-engineering scoring all consume it. Build it before anything runs unattended.
- **Approval gates are queue states, not a separate system.** Modeling `AWAITING_APPROVAL` as a task status gets the gate engine, the dashboard inbox, and the audit trail from one design.
- **Voice and dashboard are thin clients of the same kernel.** If the kernel API is clean, JARVIS is mostly a Whisper/TTS wrapper — this is why voice is MEDIUM complexity despite sounding hard.
- **Loop-engineering needs a live asset with real metrics** — it cannot precede the Outleteuro pilot (P7 placement is correct).
- **Council conflicts with budget if overused** — bind it to gate events only, never default QA.

## MVP Definition

### Launch With (v1 — the skeleton that proves anti-baby-sitting)

- [ ] OS Kernel (intent parsing + routing policy) — the product thesis; nothing else matters if this doesn't work
- [ ] Orchestrator on Claude Code Agent Teams — decomposition + dispatch
- [ ] Agent Registry (hierarchy, lazy activation) — orchestrator can't dispatch without it
- [ ] Task Queue with status lifecycle incl. `AWAITING_APPROVAL` — visibility + gates in one design
- [ ] Audit log + cost monitor with hard budget stop — root dependency; Project Vend makes external enforcement non-negotiable
- [ ] Approval gate engine with batch inbox — hard rule from the doc; DRAFT-first on all outward actions
- [ ] CEO dashboard v1 (task board, agent roster, approval inbox, cost meter) — the CEO's only window
- [ ] Memory v1 (Obsidian + claude-mem + basic router) — agents that forget aren't employees

### Add After Validation (v1.x)

- [ ] JARVIS voice (briefing + commands) — once kernel API is stable; trigger: CEO using dashboard daily
- [ ] Full memory stack (Graphify graph + open-notebook) — trigger: memory v1 retrieval quality insufficient
- [ ] Multi-model council at gates — trigger: first irreversible decision reaches a gate
- [ ] Video-learning module — trigger: kernel + memory router live
- [ ] Department activation waves + persona v2.0 factory — trigger: skeleton proven on engineering dept
- [ ] Progressive autonomy dial — trigger: enough audit history to compute track records

### Future Consideration (v2+)

- [ ] Loop-engineering on Outleteuro assets — needs live asset + real KPI (Catalog Automation Rate)
- [ ] Gated Stripe/DocuSign/Cloudflare — only inside the pilot, draft-only
- [ ] Decision-simulation sandbox (MiroFish) — sandbox-only forever per doc
- [ ] Client-facing CRM intake (consultancy requests) — after own-venture pilot proves the OS

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| OS Kernel (intent-only) | HIGH | HIGH | P1 |
| Task Queue + status | HIGH | MEDIUM | P1 |
| Agent Registry | HIGH | MEDIUM | P1 |
| Audit log + cost monitor | HIGH | MEDIUM | P1 |
| Approval gates + batch inbox | HIGH | MEDIUM | P1 |
| Dashboard v1 | HIGH | HIGH | P1 |
| Memory v1 + router | HIGH | HIGH | P1 |
| MCP Gateway (dept profiles) | HIGH | HIGH | P1-P2 (profiles can start static) |
| Tiered model routing policy | HIGH | MEDIUM | P2 |
| JARVIS voice | MEDIUM | MEDIUM | P2 |
| Multi-model council | MEDIUM | LOW | P2 |
| Video-learning | MEDIUM | MEDIUM | P2 |
| HR persona factory | MEDIUM | MEDIUM | P2 |
| Custom CRM (thin) | MEDIUM | HIGH | P2 |
| Progressive autonomy dial | MEDIUM | MEDIUM | P3 |
| Loop-engineering | HIGH (pilot) | HIGH | P3 (needs live asset) |

**Priority key:** P1 must-have skeleton · P2 add when skeleton proven · P3 future/pilot-bound

## Competitor Feature Analysis

| Feature | Orchestration frameworks (LangGraph/CrewAI/claude-flow) | AI-employee platforms (Lindy/Relevance) | Mission-control dashboards (OpenClaw et al.) | Our Approach |
|---------|----------------------------------------------------------|------------------------------------------|----------------------------------------------|--------------|
| Agent hierarchy | Roles/crews/queens-workers, flat-ish | Individual "employees" that coordinate | Dept org chart rendering (CEO → heads → workers) | Full company hierarchy over 367 personas, lazy-activated |
| Task management | Graph/process abstractions, code-level | Trigger → workflow, no-code | Kanban lifecycle, drag-drop, inline sub-agent spawn | Queue in Postgres; kanban in dashboard; gates as states |
| Approvals | HITL hooks (interrupt points), DIY UI | Built-in per-step approvals | Review columns + sign-off blockers | Policy-driven gate engine: outward actions always DRAFT + batch inbox |
| Cost/observability | Bring-your-own (Langfuse/AgentOps) | Hidden/platform-managed | Spend monitoring panels emerging | Self-hosted Langfuse-pattern tracing + hard budget stops in code |
| Memory | Checkpointing (LangGraph) / conversation history | Cross-session context, opaque | None | Multi-store (Obsidian + graph + notebook) behind one router — beyond market norm |
| Model routing | Per-agent model config | Platform-chosen | N/A | Policy engine by task class + cost feedback — beyond market norm |
| Voice | None | Voice agents as a product feature (calls) | Morning brief (text) | Voice as second kernel client: briefings + commands |
| Security/least privilege | Rare; tools attached ad hoc | Platform-managed OAuth | N/A | Dept-scoped MCP profiles with explicit denials — genuine differentiator |

## Sources

Confidence tiers assigned via classify-confidence seam: cross-checked websearch = MEDIUM; single-source websearch = LOW; Project Vend lessons trace to Anthropic's own publications (verified → MEDIUM, treated as strongest signal here).

- Framework comparison: [DataCamp CrewAI vs LangGraph vs AutoGen](https://www.datacamp.com/tutorial/crewai-vs-langgraph-vs-autogen), [Presenc AI orchestration frameworks 2026](https://presenc.ai/research/multi-agent-orchestration-frameworks-2026), [Lushbinary framework comparison](https://lushbinary.com/blog/langgraph-vs-crewai-vs-autogen-ai-agent-framework-comparison/)
- AI-employee platforms: [Lindy — AI employee guide](https://www.lindy.ai/blog/ai-employee), [Lindy AI review](https://skywork.ai/blog/lindy-ai-review-2025-no-code-workflow-automation/), [Gumloop Lindy alternatives](https://www.gumloop.com/blog/lindy-ai-alternatives)
- Observability: [Langfuse GitHub](https://github.com/langfuse/langfuse), [AIMultiple agent observability tools](https://aimultiple.com/agentic-monitoring), [Langfuse agent observability](https://langfuse.com/blog/2024-07-ai-agent-observability-with-langfuse)
- HITL patterns: [Grizzly Peak HITL patterns](https://www.grizzlypeaksoftware.com/library/human-in-the-loop-patterns-for-ai-agents-n64sb2cm), [Permit.io HITL best practices](https://www.permit.io/blog/human-in-the-loop-for-ai-agents-best-practices-frameworks-use-cases-and-demo), [Cordum HITL production patterns](https://cordum.io/blog/human-in-the-loop-ai-patterns)
- Memory systems: [n1n.ai memory comparison](https://explore.n1n.ai/blog/ai-agent-memory-comparison-2026-mem0-zep-letta-cognee-2026-04-23), [DEV memory systems benchmark](https://dev.to/varun_pratapbhardwaj_b13/5-ai-agent-memory-systems-compared-mem0-zep-letta-supermemory-superlocalmemory-2026-benchmark-59p3)
- Claude-native orchestration: [claude-flow/Ruflo guide](https://pasqualepillitteri.it/en/news/774/claude-flow-ruflo-multi-agent-orchestration-guide), [Claude Code swarm/Agent Teams](https://www.atcyrus.com/stories/what-is-claude-code-swarm-feature)
- Autonomous-business lessons: [Anthropic Project Vend phase 1](https://www.anthropic.com/research/project-vend-1), [Project Vend phase 2](https://www.anthropic.com/research/project-vend-2), [Futurism coverage](https://futurism.com/future-society/anthropic-ai-vending-machine)
- Agent-company simulators: [IBM on MetaGPT](https://www.ibm.com/think/topics/metagpt), [MetaGPT ICLR paper](https://arxiv.org/pdf/2308.00352), [SmythOS MetaGPT vs ChatDev](https://smythos.com/ai-agents/ai-agent-builders/metagpt-vs-chatdev/)
- Mission-control dashboards: [builderz mission-control](https://github.com/builderz-labs/mission-control), [MeisnerDan mission-control](https://github.com/MeisnerDan/mission-control), [OpenClaw Mission Control](https://www.blog.brightcoding.dev/2026/07/03/openclaw-mission-control-real-time-agent-tracking-made-simple)
- Voice layer: [openjarvis](https://github.com/lancejames221b/openjarvis), [jarvis_ai for Hermes Agent](https://github.com/eadmin2/jarvis_ai), [isair/jarvis](https://github.com/isair/jarvis)

---
*Feature research for: AI-native company operating system (DXB Global OS)*
*Researched: 2026-07-05*
