# Requirements — DXB Global OS v1

v1 = the complete holding (P0–P7 roadmap shape): full architecture, expandable skeleton, all doc-mandated modules, Outleteuro pilot executed by the holding's own departments. Source: approved master plan + CEO locked decisions + `.planning/research/`.

## v1 Requirements

### Security (SEC)

- [ ] **SEC-01**: CEO receives a credential-rotation checklist covering every secret in the source doc; completion is verified (old keys return 401/access-denied), not just ticked
- [ ] **SEC-02**: Secrets vault pattern (`.env` + loader + `.gitignore`) — no plaintext secret ever appears in repo, prompts, or agent-visible config
- [ ] **SEC-03**: Automated secret scan runs on the repo (pre-commit + CI) and passes clean
- [ ] **SEC-04**: Source .odt credentials section stripped; sanitized copy stored in project docs

### OS Kernel (KERN)

- [ ] **KERN-01**: CEO states intent (dashboard command bar, CLI, or voice); kernel classifies it and selects departments/agents/skills without the CEO naming tools
- [ ] **KERN-02**: Kernel routing policy is data (editable rules), not hardcoded — routes by task class per brain-architecture map (§10 of master plan)
- [ ] **KERN-03**: Every model call is tagged with mode (`subscription` / `api` / `free-tier`), model, tokens, department, task

### Orchestrator (ORCH)

- [ ] **ORCH-01**: Orchestrator decomposes intent into tasks with dependencies and dispatches them to department heads via the task queue
- [ ] **ORCH-02**: Model-tier selection per task class (Fable 5 irreversible/architecture; Opus routine orchestration; Sonnet heads; Codex engineering; GLM/Kimi/MiniMax/Qwen/DeepSeek workers via OpenRouter)
- [ ] **ORCH-03**: Escalation ladder: worker fails 2× or low confidence → specialist retry → head review → Fable final
- [ ] **ORCH-04**: Sub-agents work in isolation (task envelopes); no free-form agent-to-agent chat — queue + typed artifacts only

### Agent Registry (REG)

- [ ] **REG-01**: Registry stores department → head → specialist → worker hierarchy with per-agent metadata (brain, MCP profile, skills, autonomy level)
- [ ] **REG-02**: 367 existing personas imported as dormant v1.0 entries; lazy activation — a persona loads only when a task requires it
- [ ] **REG-03**: New departments creatable via registry (Legal DE/TR, HR factory, Research at minimum)

### Task Queue (QUEUE)

- [ ] **QUEUE-01**: Postgres-backed task lifecycle (inbox → assigned → in-progress → review → AWAITING_APPROVAL → done/failed) with `FOR UPDATE SKIP LOCKED` claims
- [ ] **QUEUE-02**: Durable/resumable: crash of any client (session, VPS agent, dashboard) loses no task state
- [ ] **QUEUE-03**: Tasks can be rejected/returned-to-sender (feedback channel, no rework-blindness)

### Approval Gates (GATE)

- [ ] **GATE-01**: All outward actions (money, contracts, real emails, ad spend) are DRAFT-first; execution requires recorded CEO approval — enforced in code, not prompts
- [ ] **GATE-02**: Single outbox-executor process holds the only outward credentials and executes only `approved` rows, exactly once (idempotency keys)
- [ ] **GATE-03**: Batch approval inbox with risk grouping — never per-action popups
- [ ] **GATE-04**: Gate-bypass canary tests run in CI (attempt outward action without approval → must fail)

### Cost & Audit (COST)

- [ ] **COST-01**: Append-only audit log traces every prompt, tool call, and decision (causal chain per task)
- [ ] **COST-02**: LiteLLM proxy with per-department virtual keys in front of OpenRouter/NVIDIA Build; alert at 70%, hard-stop non-critical API calls at 100% of €50–150/mo envelope
- [ ] **COST-03**: Velocity circuit breakers — spend-rate spikes (retry storms, context accumulation) trip before budget exhaustion, 24/7 including unattended hours
- [ ] **COST-04**: Cost dashboard view per department/model/mode from tagged call data

### MCP Layer (MCP)

- [ ] **MCP-01**: One `dxb-mcp` server exposing the 8 custom tool groups (registry, queue, memory router, dashboard, CRM, approval gate, cost monitor, audit log) over the shared schema
- [ ] **MCP-02**: Department-scoped MCP profiles: agents only see allowlisted tools (`tools/list` filtered); explicit denials honored (CEO agent: no code MCPs; workers never see Stripe/DocuSign)
- [ ] **MCP-03**: Tool-description hash pinning — changed upstream tool descriptions quarantine the tool until re-approved (anti rug-pull)

### Memory (MEM)

- [ ] **MEM-01**: Memory router with single write path: provenance recorded, untrusted content quarantined, contradiction detection before promotion
- [ ] **MEM-02**: Obsidian vault + claude-mem wired as core memory; agents read/write via memory-router MCP tools only
- [ ] **MEM-03**: Graphify knowledge graph + open-notebook research brain integrated (full stack per study pass)
- [ ] **MEM-04**: Context-rot prevention: compression (headroom), summaries, and memory offloading keep long-running work inside clean contexts

### Dashboard & CRM (DASH)

- [ ] **DASH-01**: CEO cockpit v1: live task board, agent roster, approval inbox, cost meter — real-time via Supabase Broadcast triggers
- [ ] **DASH-02**: Command bar: CEO types intent in Turkish or English; kernel handles it (first kernel client)
- [ ] **DASH-03**: Drill-down: any task opens its full audit trace on demand (no firehose streaming)
- [ ] **DASH-04**: Custom thin CRM (clients, requests, contacts, deals) as Supabase tables rendered in the cockpit; agents read/write via CRM MCP tools
- [ ] **DASH-05**: Dashboard is a pure projection of operational tables — agents never "update the dashboard"
- [ ] **DASH-06**: Usable by a non-technical CEO from anywhere (responsive, remote-accessible, Turkish-friendly labels)
- [ ] **DASH-07**: Built under the design-bundle discipline (taste, impeccable, open-design, Stitch installed and studied BEFORE design work)

### JARVIS Voice (VOICE)

- [ ] **VOICE-01**: Morning voice briefing: spoken summary of overnight work, approval queue, costs (Speaches TTS)
- [ ] **VOICE-02**: Spoken commands: STT → kernel intent path (voice = second kernel client)

### Video Learning (VID)

- [ ] **VID-01**: CEO drops a video link → system downloads, transcribes, summarizes, and files it through the memory router (async, quarantine-tiered)

### Council (CNCL)

- [ ] **CNCL-01**: In-house multi-model council (parallel cheap models + one strong judge) invoked only at critical gates; judge strength validated against producers

### 24/7 Runtime (VPS)

- [ ] **VPS-01**: EU VPS runs the compose stack (Supabase or Postgres, LiteLLM, dxb-mcp, dashboard, Speaches, open-notebook) within 8GB budget
- [ ] **VPS-02**: Hermes resident agent (GLM 5.2 brain) runs bounded scheduled jobs with watchdog, kill switch, and morning review queue

### Departments & Personas (DEPT)

- [ ] **DEPT-01**: Department activation waves — each wave installs its plugins/MCPs at wave start, passes golden-task battery + strong-model sampling audit before going live
- [ ] **DEPT-02**: HR digital-worker factory rewrites personas to v2.0 (globalized, per-agent skills) systematically
- [ ] **DEPT-03**: Legal (DE/TR), HR, and Research departments created and staffed
- [ ] **DEPT-04**: Humanizer skill mandatory in all outbound content pipelines before approval gate
- [ ] **DEPT-05**: Progressive autonomy dial: approval requirements relax per department/action class based on audit track record, adjustable from dashboard

### Integration Program (INTEG)

- [ ] **INTEG-01**: Every master-plan §8B item tracked through study → install → adopt → embed with a study card in `.planning/research/`; tools installed at the START of the phase that uses them
- [ ] **INTEG-02**: Excluded items (kickbacks.ai, automaton, llm-council dependency, ToS-gray systems) remain excluded; exceptions require CEO sign-off

### Outleteuro Pilot (PILOT)

- [ ] **PILOT-01**: Pilot executed BY the holding's departments via orchestrator dispatch — builder never operates the store directly
- [ ] **PILOT-02**: Catalog Automation Rate measured continuously: % of 73 brands with live, complete, correct listings maintained autonomously
- [ ] **PILOT-03**: Autoresearch loop live on at least one Outleteuro asset (locked scorer, git commit/revert discipline)
- [ ] **PILOT-04**: Stripe/DocuSign/Cloudflare integrations draft-only behind the outbox executor

## v2 Requirements (deferred)

- **V2-01**: techshopeuro.com onboarded as second venture — after pilot proves the OS
- **V2-02**: Social-media subsidiary — after pilot
- **V2-03**: Client-facing consultancy intake via CRM — after own-venture pilot
- **V2-04**: Full KPI tree automation (operations → quality → SEO/traffic → revenue → company automation)
- **V2-05**: MiroFish decision-simulation sandbox integration

## Out of Scope

- kickbacks.ai — adware (Marketplace removal + adverse audit)
- automaton — crypto-token project, safety criticism
- llm-council as dependency — dead repo; pattern owned in-house (CNCL-01)
- Anthropic-limit bypass / free-tier stacking / multi-account rotation — ToS; modes stay tagged and honest
- External CRM adoption — breaks single-cockpit requirement
- Free-form agent-to-agent chat — cost/audit anti-feature (research-confirmed)
- All-367-personas-live — token bloat; lazy activation instead (REG-02)
- Real-time-everything dashboard — signal over firehose (DASH-03)
- Per-action approval popups — batch inbox instead (GATE-03)
- Autonomous outward actions without gates — Project Vend lesson; never

## Traceability

(Filled by roadmap creation — every v1 REQ-ID maps to exactly one phase.)
