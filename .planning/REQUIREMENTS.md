# Requirements — DXB Global OS v1

v1 = the complete holding (P0–P7 roadmap shape): full architecture, expandable skeleton, all doc-mandated modules, Outleteuro pilot executed by the holding's own departments. Source: approved master plan + CEO locked decisions + `.planning/research/`.

## v1 Requirements

### Security (SEC)

- [x] **SEC-01**: CEO receives a credential-rotation checklist covering every secret in the source doc; completion is verified (old keys return 401/access-denied), not just ticked
- [x] **SEC-02**: Secrets vault pattern (`.env` + loader + `.gitignore`) — no plaintext secret ever appears in repo, prompts, or agent-visible config
- [x] **SEC-03**: Automated secret scan runs on the repo (pre-commit + CI) and passes clean
- [x] **SEC-04**: Source .odt credentials section stripped; sanitized copy stored in project docs

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
- [ ] **REG-02**: All classified legacy personas (measured 153 at seed time 2026-07-07; initial measure 159, spatial-computing removed in CEO corpus cleanup; "367" was a corrected myth) imported as dormant v1.0-legacy entries; every persona recreated by Fable at v2 quality before its department activates (staged by activation waves — see master-plan PHASE-03 "Persona v2 Programı"); lazy activation — a persona loads only when a task requires it
- [ ] **REG-03**: New departments creatable via registry (Legal DE/TR, HR factory, Research at minimum)

### Task Queue (QUEUE)

- [ ] **QUEUE-01**: Postgres-backed task lifecycle (inbox → assigned → in-progress → review → AWAITING_APPROVAL → done/failed) with `FOR UPDATE SKIP LOCKED` claims
- [ ] **QUEUE-02**: Durable/resumable: crash of any client (session, VPS agent, dashboard) loses no task state
- [ ] **QUEUE-03**: Tasks can be rejected/returned-to-sender (feedback channel, no rework-blindness)

### Approval Gates (GATE)

- [ ] **GATE-01** *(revised per CEO directive B7b, 2026-07-09 — recorded master-plan change, not a silent deviation)*: **Money-OUT** actions (transfers, payments, spending, ad budgets), **contract commitments**, and CEO-flagged topics are DRAFT-first; execution requires recorded CEO approval — enforced in code, not prompts. **Money-IN needs NO approval**: collections, incoming payments, sales revenue run autonomously by departments, dashboard-visible, post-hoc auditable. **Routine outward comms** (emails, social posts) run autonomously within versioned department policy (policy ownership: B8 policy-writer). The approval inbox carries ONLY money-out + contracts + CEO-flagged items (single channel from Phase 8: dashboard approval inbox + JARVIS voice confirm). CEO is an approve/reject authority — the company never sends the CEO tasks (permitted request classes: money-out approval, critical legal commitments, human-identity steps — always batched, copy-paste-ready, minute-estimated; automation alternative must be proven impossible first)
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
- [ ] **VOICE-02**: Spoken commands: STT → kernel intent path (voice = second kernel client). [CEO B2, 2026-07-09] Wake word is a runtime-configurable config value (openWakeWord; never hard-coded), default **"Selamünaleyküm ya Hamza"**. Verbatim clause binding on the Phase 9 spec: *"JARVIS, dashboard'a EŞİT tam komut kanalıdır — CEO'nun her sesli direktifi kernel intent yoluna iner ve ilgili departmana dağıtılır; asistan istenen işe itiraz etmez, risk ve faydayı bildirir, son karar CEO'nundur; outward aksiyonlar mevcut GATE-01 draft+onay akışından geçer."*

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

- [x] **INTEG-01**: Every master-plan §8B item tracked through study → install → adopt → embed with a study card in `.planning/research/`; tools installed at the START of the phase that uses them
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
- All-personas-live-at-once — token bloat; lazy activation instead (REG-02)
- Real-time-everything dashboard — signal over firehose (DASH-03)
- Per-action approval popups — batch inbox instead (GATE-03)
- Autonomous outward actions without gates — Project Vend lesson; never

## Traceability

Every v1 requirement maps to exactly one phase (56/56 mapped, no orphans, no duplicates). Phases in ROADMAP.md.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SEC-01 | Phase 1 | Complete |
| SEC-02 | Phase 1 | Complete |
| SEC-03 | Phase 1 | Complete |
| SEC-04 | Phase 1 | Complete |
| INTEG-01 | Phase 2 | Complete |
| INTEG-02 | Phase 2 | Pending |
| QUEUE-01 | Phase 3 | Pending |
| QUEUE-02 | Phase 3 | Pending |
| QUEUE-03 | Phase 3 | Pending |
| REG-01 | Phase 3 | Pending |
| REG-02 | Phase 3 | Pending |
| REG-03 | Phase 3 | Pending |
| MCP-01 | Phase 3 | Pending |
| GATE-01 | Phase 4 | Pending |
| GATE-02 | Phase 4 | Pending |
| GATE-04 | Phase 4 | Pending |
| COST-01 | Phase 4 | Pending |
| COST-02 | Phase 4 | Pending |
| COST-03 | Phase 4 | Pending |
| KERN-03 | Phase 4 | Pending |
| KERN-01 | Phase 5 | Pending |
| KERN-02 | Phase 5 | Pending |
| ORCH-01 | Phase 5 | Pending |
| ORCH-02 | Phase 5 | Pending |
| ORCH-03 | Phase 5 | Pending |
| ORCH-04 | Phase 5 | Pending |
| CNCL-01 | Phase 5 | Pending |
| MEM-01 | Phase 6 | Pending |
| MEM-02 | Phase 6 | Pending |
| MEM-03 | Phase 6 | Pending |
| MEM-04 | Phase 6 | Pending |
| MCP-02 | Phase 7 | Pending |
| MCP-03 | Phase 7 | Pending |
| VPS-01 | Phase 7 | Pending |
| VPS-02 | Phase 7 | Pending |
| VID-01 | Phase 7 | Pending |
| DASH-01 | Phase 8 | Pending |
| DASH-02 | Phase 8 | Pending |
| DASH-03 | Phase 8 | Pending |
| DASH-04 | Phase 8 | Pending |
| DASH-05 | Phase 8 | Pending |
| DASH-06 | Phase 8 | Pending |
| DASH-07 | Phase 8 | Pending |
| GATE-03 | Phase 8 | Pending |
| COST-04 | Phase 8 | Pending |
| VOICE-01 | Phase 9 | Pending |
| VOICE-02 | Phase 9 | Pending |
| DEPT-01 | Phase 10 | Pending |
| DEPT-02 | Phase 10 | Pending |
| DEPT-03 | Phase 10 | Pending |
| DEPT-04 | Phase 10 | Pending |
| DEPT-05 | Phase 10 | Pending |
| PILOT-01 | Phase 11 | Pending |
| PILOT-02 | Phase 11 | Pending |
| PILOT-03 | Phase 11 | Pending |
| PILOT-04 | Phase 11 | Pending |
