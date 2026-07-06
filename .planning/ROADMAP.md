# Roadmap: DXB Global OS

## Overview

The holding is built completely first, then its own employees run the pilot. The journey starts from a verified-clean security posture (rotated credentials, vault, clean repo scans), scaffolds the monorepo and the study→install→adopt→embed integration program, then lays the root dependency: the Supabase schema with dxb-mcp as the only door to state. Safety rails (approval gates, outbox executor, cost hard-stops, circuit breakers, append-only audit) land before any loop runs, then the kernel + orchestrator prove one repeatable intent→result vertical slice. From that proven core the OS widens: memory router with quarantine discipline, least-privilege MCP gateway plus 24/7 VPS runtime, the CEO cockpit with embedded CRM, the JARVIS voice layer, and gated department activation waves with the HR persona factory. Finally the holding's own departments execute the Outleteuro pilot, optimizing Catalog Automation Rate across 73 brands.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

**CEO decision (2026-07-05, locked):** Canonical numbering is **Phase 1–11**. The master plan's P0–P7 labels are historical/research shorthand only; all future docs, agents, and plans use Phase 1–11. Mapping: P0→1, P1→2, P2→3+4+5, P3→6, P4→7, P5→8+9, P6→10, P7→11.

**CEO decision (2026-07-05, locked) — Phase 1 hard gate:** Phase 2 (and any build/monorepo/code work) MUST NOT start until: old credential/key/password/token values verifiably return 401/access-denied, 2FA is confirmed, the source ODT is sanitized, the vault pattern is in place, and the secret scan passes clean.

- [ ] **Phase 1: Security Baseline & Credential Remediation** - Rotate every leaked credential (verified dead), vault pattern, secret scanning, sanitized source doc — blocks everything else
- [ ] **Phase 2: Foundation & Integration Program** - pnpm monorepo skeleton mirroring the full architecture + study→install→adopt→embed tracking for every §8B item
- [ ] **Phase 3: State Layer & dxb-mcp Core** - Full Supabase schema (tasks, agents, approvals, outbox, cost, audit, memory index, CRM) + task queue + registry behind one dxb-mcp server
- [ ] **Phase 4: Safety Rails — Gates, Cost, Audit** - Code-level approval gates, outbox executor, LiteLLM budget enforcement, velocity breakers, append-only audit — before anything runs unattended
- [ ] **Phase 5: Kernel & Orchestrator Core Loop** - Intent → classification → decomposition → tiered dispatch → escalation → council; exit gate: 10/10 vertical slice runs
- [ ] **Phase 6: Memory Router & Knowledge Stores** - Single write path with provenance/quarantine/contradiction policy over Obsidian, claude-mem, Graphify, open-notebook, pgvector
- [ ] **Phase 7: MCP Gateway & 24/7 VPS Runtime** - Department-scoped tool visibility, hash pinning, EU VPS compose stack, Hermes resident agent, video-learning module
- [ ] **Phase 8: CEO Dashboard & CRM** - Design bundle first, then the cockpit: live task board, batch approval inbox, cost meter, command bar, drill-down audit, embedded CRM
- [ ] **Phase 9: JARVIS Voice Layer** - Morning voice briefings and spoken commands as a thin second client of the same kernel
- [ ] **Phase 10: Department Activation Waves & Persona Factory** - Golden-task battery + sampling audit live first, then wave-by-wave activation, HR persona v2.0 factory, progressive autonomy dial
- [ ] **Phase 11: Outleteuro Pilot** - The holding's departments run the store; Catalog Automation Rate measured; autoresearch loops; outward integrations draft-only behind the outbox

## Phase Details

### Phase 1: Security Baseline & Credential Remediation

**Goal**: The project starts from a verified-clean security posture — leaked credentials are dead, secrets live only in the vault, and the repo proves itself clean automatically
**Depends on**: Nothing (first phase — hard gate, blocks all other phases)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04
**Success Criteria** (what must be TRUE):

  1. Every credential listed in the source doc has been rotated and each old key verifiably fails (401/access-denied evidence recorded per item on the CEO checklist, not just ticked)
  2. 2FA is enabled on Gmail, Cloudflare, Namecheap, and hosting at minimum (CEO-confirmed)
  3. No plaintext secret exists anywhere in the repo, prompts, or agent-visible config — all secrets load through the `.env` vault pattern
  4. Automated secret scan (pre-commit + CI) runs on every commit and passes clean
  5. The source .odt's credentials section is stripped; a sanitized copy lives in project docs and the original stays out of git and cloud sync

**Plans**: 3/6 plans executed

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Secret scanning foundation: gitleaks + fail-closed pre-commit hook (canary-proven) + full-history scan + CI wiring (SEC-03)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Vault scaffold: .gitignore rules, .env.example name registry, agent deny rules (SEC-02)
- [x] 01-03-PLAN.md — CEO deliverables: bilingual rotation checklist, 21-row evidence template, ODT sanitization procedure (SEC-01/SEC-04 prep)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-04-PLAN.md — CEO performs all rotations + 2FA + probes; evidence machine-verified and committed (SEC-01, checkpoint)

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 01-05-PLAN.md — CEO sanitizes ODT; sanitized markdown verified at two levels and committed; original swept (SEC-04, checkpoint)

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 01-06-PLAN.md — Hard-gate closure: trufflehog verified sweep + live gate report + CEO sign-off (SEC-01..04, checkpoint)

### Phase 2: Foundation & Integration Program

**Goal**: The company has a build-ready home — a monorepo skeleton reflecting the full approved architecture, and a tracking program that guarantees no doc-mandated tool is skipped or installed blind
**Depends on**: Phase 1
**Requirements**: INTEG-01, INTEG-02
**Success Criteria** (what must be TRUE):

  1. The pnpm monorepo skeleton mirrors the approved architecture (`db/`, `packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}`, `apps/{dashboard,jarvis}`) and installs and builds clean
  2. Every master-plan §8B item has a tracking row (study → install → adopt → embed) with a study card destination in `.planning/research/` — the checklist holds each row until EMBED is done
  3. Study cards exist for the Phase 3 toolset before anything is installed — the "tools installed at the START of the phase that uses them" rule is demonstrated, not just documented
  4. Excluded items (kickbacks.ai, automaton, llm-council dependency, ToS-gray systems) are recorded as excluded with reasons; re-admitting any requires an explicit CEO sign-off entry

**Plans**: 5 plans

Plans:
**Wave 1**

- [ ] 02-01-PLAN.md — Monorepo scaffold: pnpm workspace root (catalog) + 9 buildable TS projects mirroring the architecture, no Phase-3+ deps (INTEG-01)
- [ ] 02-04-PLAN.md — Integration tracker: INTEGRATION-TRACKER.md (all §8B rows + excluded + re-admission log) + 9 full Phase-3-toolset study cards (INTEG-01, INTEG-02)

**Wave 2** *(blocked on Wave 1)*

- [ ] 02-02-PLAN.md — Package-legitimacy human-verify checkpoint for vitest + @types/node before install (INTEG-01, checkpoint)
- [ ] 02-05-PLAN.md — Retroactive + stub study cards (full coverage) + machine-checkable tracker-integrity validator (INTEG-01, INTEG-02)

**Wave 3** *(blocked on Wave 2)*

- [ ] 02-03-PLAN.md — Corepack pnpm activation + install + `tsc --build` + vitest smoke: skeleton installs and builds clean (INTEG-01)

### Phase 3: State Layer & dxb-mcp Core

**Goal**: Supabase Postgres is the OS's bus and single source of truth — every operational table exists, and agents reach state only through the dxb-mcp server, never raw SQL
**Depends on**: Phase 2
**Requirements**: QUEUE-01, QUEUE-02, QUEUE-03, REG-01, REG-02, REG-03, MCP-01
**Success Criteria** (what must be TRUE):

  1. The full operational schema exists as Supabase migrations — tasks, task_events, agents, approvals, outbox, cost_ledger, audit_log, memory_index, CRM tables — and applies cleanly to a fresh database
  2. A task moves through the complete lifecycle (inbox → assigned → in-progress → review → AWAITING_APPROVAL → done/failed) with `FOR UPDATE SKIP LOCKED` claims, and can be rejected/returned to sender with feedback — entirely through dxb-mcp queue tools
  3. Killing any client mid-task loses no state: the task remains visible and reclaimable after restart (durability demonstrated by a crash test)
  4. All 367 personas exist in the registry as dormant v1.0 entries with per-agent metadata (brain, MCP profile, skills, autonomy level); a persona loads only when a task requires it; a new department can be created through registry tools
  5. dxb-mcp runs as a single server exposing the 8 tool groups over the shared schema — queue, registry, audit, and cost groups fully functional now; memory-router, dashboard, CRM, and approval-gate faces present and extended in their own phases

**Plans**: TBD

### Phase 4: Safety Rails — Gates, Cost, Audit

**Goal**: Nothing can act outward, spend money, or burn budget without code-level enforcement — gates, caps, breakers, and the audit trail all work before any autonomous loop exists
**Depends on**: Phase 3
**Requirements**: GATE-01, GATE-02, GATE-04, COST-01, COST-02, COST-03, KERN-03
**Success Criteria** (what must be TRUE):

  1. Any outward action created by any agent lands as a DRAFT row; only a recorded CEO approval allows execution — enforced by the Postgres state machine, not by prompt text
  2. The outbox executor is the only process holding outward credentials and executes approved rows exactly once (a double-fire test proves idempotency) — verified end-to-end on a harmless action, with CLI approval (`dxb approve <id>`) until the dashboard exists
  3. A CI canary attempting an outward action without approval (including an "urgent, pre-approved" prompt injection) fails visibly and blocks the pipeline
  4. All API model calls flow through LiteLLM with per-department virtual keys: the 70% alert fires and the 100% hard-stop blocks non-critical calls in a forced test, and the velocity circuit breaker trips on a simulated retry storm before budget exhaustion — 24/7, including unattended hours
  5. Every prompt, tool call, and decision lands in the append-only audit log tagged with mode (`subscription`/`api`/`free-tier`), model, tokens, department, and task — a task's full causal chain is reconstructable, including subscription-mode calls tagged via Agent SDK hooks

**Plans**: TBD

### Phase 5: Kernel & Orchestrator Core Loop

**Goal**: The CEO states intent once and the machine runs it to a recorded result — classification, decomposition, tiered dispatch, escalation, and council all work repeatably
**Depends on**: Phase 4
**Requirements**: KERN-01, KERN-02, ORCH-01, ORCH-02, ORCH-03, ORCH-04, CNCL-01
**Success Criteria** (what must be TRUE):

  1. The CEO states an intent (CLI for now) and the kernel classifies it and selects departments/agents/skills — the CEO never names a tool
  2. Routing policy is editable data (rules per the §10 brain-architecture map): changing a rule changes routing without touching code
  3. The orchestrator decomposes an intent into dependent TaskEnvelopes on the queue and dispatches them to department heads; sub-agents work in isolation — no free-form agent-to-agent chat, queue + typed artifacts only
  4. Model tier per task class matches the brain map, the escalation ladder works (worker fails 2× or low confidence → specialist retry → head review → Fable final), and the in-house council (parallel cheap models + one strong judge) fires only at critical gates with judge strength validated against producers on a golden set
  5. Exit gate: one intent → kernel → worker → QA → approval → recorded-result vertical slice passes 10 out of 10 repeated runs

**Plans**: TBD

### Phase 6: Memory Router & Knowledge Stores

**Goal**: The company remembers safely — one write path with provenance and quarantine, agents touch memory only through router tools, and long-running work stays inside clean contexts
**Depends on**: Phase 5 (pure client of the Phase 3 schema; parallel-safe with Phase 8 per research)
**Requirements**: MEM-01, MEM-02, MEM-03, MEM-04
**Success Criteria** (what must be TRUE):

  1. Every memory write goes through the router's single write path — provenance recorded, untrusted-origin content quarantined, contradictions flagged before promotion; a deliberate poisoning attempt stays in quarantine
  2. Agents read and write memory only via memory-router MCP tools (`memory.recall` / `memory.commit`), with the Obsidian vault + claude-mem wired behind them
  3. Graphify knowledge graph and open-notebook research brain are integrated after their study passes, and a known-fact retrieval test validates routing quality across the store composition
  4. A long-running task stays inside a clean context via compression (headroom), summaries, and memory offloading — demonstrated against a context-rot scenario

**Plans**: TBD

### Phase 7: MCP Gateway & 24/7 VPS Runtime

**Goal**: Least privilege is enforced before anyone works unattended — departments only see their allowlisted tools, and the company runs 24/7 on the EU VPS within budget, with a watchdog and a kill switch
**Depends on**: Phase 6 (video learning files through the memory router; profiles read the Phase 3 registry) — hard-precedes department activation
**Requirements**: MCP-02, MCP-03, VPS-01, VPS-02, VID-01
**Success Criteria** (what must be TRUE):

  1. Each department's MCP profile filters `tools/list`: a worker agent cannot even see Stripe/DocuSign, the CEO agent sees no code MCPs — explicit denials verified against the doc's per-department MCP maps
  2. A changed upstream tool description quarantines that tool until re-approved (hash pinning demonstrated on a live description change)
  3. The compose stack (Postgres/Supabase, LiteLLM, dxb-mcp, Speaches, open-notebook) runs on the EU VPS within the 8GB budget and comes back healthy after a reboot
  4. Hermes (GLM 5.2 brain) runs bounded scheduled jobs with watchdog and kill switch, and overnight output lands in a morning review queue — nothing runs unattended without the Phase 4 rails live
  5. The CEO drops a video link → the system downloads, transcribes, summarizes, and files it through the memory router asynchronously with a quarantine tier

**Plans**: TBD

### Phase 8: CEO Dashboard & CRM

**Goal**: The CEO runs the whole company from one cockpit — live, transparent, non-technical-friendly, from anywhere — as a pure projection of the operational tables
**Depends on**: Phase 5 (kernel client) and Phase 4 (approval/cost data); parallel-safe with Phase 6 per research
**Requirements**: DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, DASH-06, DASH-07, GATE-03, COST-04
**Success Criteria** (what must be TRUE):

  1. The design bundle (taste, impeccable, open-design, Stitch) is installed and studied at phase START — before any design work — and the cockpit is built under its discipline
  2. The CEO sees a live cockpit: task board, agent roster, batch approval inbox grouped by risk (never per-action popups), and a cost meter broken down per department/model/mode — real-time via Broadcast-from-DB triggers
  3. The CEO types intent in Turkish or English in the command bar and the kernel handles it end to end (the dashboard is the first kernel client)
  4. Any task drills down to its full audit trace on demand (no firehose streaming); the dashboard is a pure projection of operational tables — no agent ever "updates the dashboard"
  5. The thin CRM (clients, requests, contacts, deals) lives inside the cockpit with agents reading/writing via CRM MCP tools, and the whole cockpit is usable by a non-technical CEO from a phone anywhere (responsive, remote-accessible, Turkish-friendly labels)

**Plans**: TBD
**UI hint**: yes

### Phase 9: JARVIS Voice Layer

**Goal**: The CEO can hear the company and speak to it — voice is a thin second client of the same kernel, with zero extra capability
**Depends on**: Phase 8 (briefing reads cockpit data; confirmations land in the approval inbox)
**Requirements**: VOICE-01, VOICE-02
**Success Criteria** (what must be TRUE):

  1. The CEO hears a morning briefing: spoken summary of overnight work, the approval queue, and costs (Speaches TTS)
  2. A spoken command travels STT → kernel intent path and produces the same result as typing it in the command bar (voice = second kernel client)
  3. Voice-initiated gated actions still require explicit confirmation through the approval inbox — voice alone can never execute an outward action

**Plans**: TBD

### Phase 10: Department Activation Waves & Persona Factory

**Goal**: The company widens from proven skeleton to staffed departments without quality collapse — every wave is gated by golden tasks, sampling audits, and gateway re-audits
**Depends on**: Phase 7 (hard precedence: gateway profiles + VPS before any activation) and Phase 8 (autonomy dial lives in the dashboard)
**Requirements**: DEPT-01, DEPT-02, DEPT-03, DEPT-04, DEPT-05
**Success Criteria** (what must be TRUE):

  1. The golden-task battery and the strong-model sampling audit (5–10% of cheap-tier output) are live BEFORE the first wave activates
  2. Each department wave installs its plugins/MCPs at wave start and passes its golden tasks plus a gateway profile re-audit before going live
  3. Legal (DE/TR), HR factory, and Research departments exist in the registry and are staffed with working agents (research-department writes gated through memory quarantine)
  4. The HR digital-worker factory rewrites personas to v2.0 (globalized, per-agent skills) systematically — demonstrated on at least one full department — and the humanizer skill runs in every outbound content pipeline before the approval gate
  5. Approval strictness relaxes per department/action class based on audited track record, adjustable by the CEO from the dashboard

**Plans**: TBD
**UI hint**: yes

### Phase 11: Outleteuro Pilot

**Goal**: The holding's own departments run a real store autonomously — the OS proves anti-baby-sitting on revenue-adjacent work with hard gates on everything outward
**Depends on**: Phase 10
**Requirements**: PILOT-01, PILOT-02, PILOT-03, PILOT-04
**Success Criteria** (what must be TRUE):

  1. Catalog work on outleteuro.com is dispatched by the orchestrator to the holding's departments — neither the builder nor the CEO operates the store directly
  2. Catalog Automation Rate (% of 73 brands with live, complete, correct listings maintained autonomously) is measured continuously and visible in the cockpit
  3. An autoresearch loop runs on at least one Outleteuro asset with a locked scorer and git commit/revert discipline
  4. Stripe, DocuSign, and Cloudflare actions exist only as drafts behind the outbox executor with restricted keys — staging-first for WooCommerce writes

**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
(Research note: Phase 6 and Phase 8 are parallel-safe after Phase 5's exit gate; Phase 7 → Phase 10 is hard-ordered.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security Baseline & Credential Remediation | 3/6 | In Progress|  |
| 2. Foundation & Integration Program | 0/5 | Not started | - |
| 3. State Layer & dxb-mcp Core | 0/TBD | Not started | - |
| 4. Safety Rails — Gates, Cost, Audit | 0/TBD | Not started | - |
| 5. Kernel & Orchestrator Core Loop | 0/TBD | Not started | - |
| 6. Memory Router & Knowledge Stores | 0/TBD | Not started | - |
| 7. MCP Gateway & 24/7 VPS Runtime | 0/TBD | Not started | - |
| 8. CEO Dashboard & CRM | 0/TBD | Not started | - |
| 9. JARVIS Voice Layer | 0/TBD | Not started | - |
| 10. Department Activation Waves & Persona Factory | 0/TBD | Not started | - |
| 11. Outleteuro Pilot | 0/TBD | Not started | - |

## Coverage

All 56 v1 requirements map to exactly one phase (traceability table in REQUIREMENTS.md). No orphans, no duplicates.
