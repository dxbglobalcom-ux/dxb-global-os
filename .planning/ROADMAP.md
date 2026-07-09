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

- [x] **Phase 1: Security Baseline & Credential Remediation** - Rotate every leaked credential (verified dead), vault pattern, secret scanning, sanitized source doc — blocks everything else — **COMPLETE 2026-07-06 (hard gate closed, CEO approved 16:21Z)**
- [x] **Phase 2: Foundation & Integration Program** - pnpm monorepo skeleton mirroring the full architecture + study→install→adopt→embed tracking for every §8B item — **COMPLETE 2026-07-06 (Fable closure verdict, 02-FABLE-REVIEW.md)**
- [x] **Phase 3: State Layer & dxb-mcp Core** - Full Supabase schema (tasks, agents, approvals, outbox, cost, audit, memory index, CRM) + task queue + registry behind one dxb-mcp server — **COMPLETE 2026-07-07 (Fable closure verdict, 03-FABLE-REVIEW.md)**
- [x] **Phase 4: Safety Rails — Gates, Cost, Audit** - Code-level approval gates, outbox executor, LiteLLM budget enforcement, velocity breakers, append-only audit — before anything runs unattended — **COMPLETE 2026-07-08 (Fable closure verdict, 04-FABLE-REVIEW.md)**
- [x] **Phase 5: Kernel & Orchestrator Core Loop** - Intent → classification → decomposition → tiered dispatch → escalation → council; exit gate: 10/10 vertical slice runs — PASSED 2026-07-08 (05-VERIFICATION.md, FABLE verdict)
- [x] **Phase 6: Memory Router & Knowledge Stores** - Single write path with provenance/quarantine/contradiction policy over Obsidian, claude-mem, Graphify, open-notebook, pgvector — PASSED 2026-07-09 (06-VERIFICATION.md, FABLE verdict; battery 19/20 live)
- [x] **Phase 7: MCP Gateway & 24/7 VPS Runtime** - Department-scoped tool visibility, hash pinning, EU VPS compose stack, Hermes resident agent, video-learning module
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

**Plans**: 6/6 plans executed — phase complete, hard gate closed with recorded CEO approval (evidence/PHASE-1-GATE-REPORT.md)

Plans:
**Wave 1**

- [x] 01-01-PLAN.md — Secret scanning foundation: gitleaks + fail-closed pre-commit hook (canary-proven) + full-history scan + CI wiring (SEC-03)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 01-02-PLAN.md — Vault scaffold: .gitignore rules, .env.example name registry, agent deny rules (SEC-02)
- [x] 01-03-PLAN.md — CEO deliverables: bilingual rotation checklist, 21-row evidence template, ODT sanitization procedure (SEC-01/SEC-04 prep)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 01-04-PLAN.md — CEO performs all rotations + 2FA + probes; evidence machine-verified and committed (SEC-01, checkpoint)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 01-05-PLAN.md — CEO sanitizes ODT; sanitized markdown verified at two levels and committed; original swept (SEC-04, checkpoint)

**Wave 5** *(blocked on Wave 4 completion)*

- [x] 01-06-PLAN.md — Hard-gate closure: trufflehog verified sweep + live gate report + CEO sign-off (SEC-01..04, checkpoint)

### Phase 2: Foundation & Integration Program

**Goal**: The company has a build-ready home — a monorepo skeleton reflecting the full approved architecture, and a tracking program that guarantees no doc-mandated tool is skipped or installed blind
**Depends on**: Phase 1
**Requirements**: INTEG-01, INTEG-02
**Success Criteria** (what must be TRUE):

  1. The pnpm monorepo skeleton mirrors the approved architecture (`db/`, `packages/{shared,dxb-mcp,gateway,kernel,orchestrator,memory-router,outbox-executor}`, `apps/{dashboard,jarvis}`) and installs and builds clean
  2. Every master-plan §8B item has a tracking row (study → install → adopt → embed) with a study card destination in `.planning/research/` — the checklist holds each row until EMBED is done
  3. Study cards exist for the Phase 3 toolset before anything is installed — the "tools installed at the START of the phase that uses them" rule is demonstrated, not just documented
  4. Excluded items (kickbacks.ai, automaton, llm-council dependency, ToS-gray systems) are recorded as excluded with reasons; re-admitting any requires an explicit CEO sign-off entry

**Plans**: 5/5 plans executed — phase complete (Fable closure verdict: 02-FABLE-REVIEW.md)

Plans:
**Wave 1**

- [x] 02-01-PLAN.md — Monorepo scaffold: pnpm workspace root (catalog) + 9 buildable TS projects mirroring the architecture, no Phase-3+ deps (INTEG-01)
- [x] 02-04-PLAN.md — Integration tracker: INTEGRATION-TRACKER.md (all §8B rows + excluded + re-admission log) + 9 full Phase-3-toolset study cards (INTEG-01, INTEG-02)

**Wave 2** *(blocked on Wave 1)*

- [x] 02-02-PLAN.md — Package-legitimacy human-verify checkpoint for vitest + @types/node before install (INTEG-01, checkpoint)
- [x] 02-05-PLAN.md — Retroactive + stub study cards (full coverage) + machine-checkable tracker-integrity validator (INTEG-01, INTEG-02)

**Wave 3** *(blocked on Wave 2)*

- [x] 02-03-PLAN.md — Corepack pnpm activation + install + `tsc --build` + vitest smoke: skeleton installs and builds clean (INTEG-01)

### Phase 3: State Layer & dxb-mcp Core

**Goal**: Supabase Postgres is the OS's bus and single source of truth — every operational table exists, and agents reach state only through the dxb-mcp server, never raw SQL
**Depends on**: Phase 2
**Requirements**: QUEUE-01, QUEUE-02, QUEUE-03, REG-01, REG-02, REG-03, MCP-01
**Success Criteria** (what must be TRUE):

  1. The full operational schema exists as Supabase migrations — tasks, task_events, agents, approvals, outbox, cost_ledger, audit_log, memory_index, CRM tables — and applies cleanly to a fresh database
  2. A task moves through the complete lifecycle (inbox → assigned → in-progress → review → AWAITING_APPROVAL → done/failed) with `FOR UPDATE SKIP LOCKED` claims, and can be rejected/returned to sender with feedback — entirely through dxb-mcp queue tools
  3. Killing any client mid-task loses no state: the task remains visible and reclaimable after restart (durability demonstrated by a crash test)
  4. All classified legacy personas (measured 153 at seed, 2026-07-07) exist in the registry as dormant v1.0-legacy entries with per-agent metadata (brain, MCP profile, skills, autonomy level) — count is evidence-based from the seed classifier, mismatch halts for Fable; a persona loads only when a task requires it; a new department can be created through registry tools
  5. dxb-mcp runs as a single server exposing the 8 tool groups over the shared schema — queue, registry, audit, and cost groups fully functional now; memory-router, dashboard, CRM, and approval-gate faces present and extended in their own phases

**Plans**: 5/5 executed — phase complete (Fable closure verdict: 03-FABLE-REVIEW.md)

Plans:
**Wave 1**
- [x] 03-01: Toolset study→approve→install gate (kysely+pg cards, CEO supply-chain checkpoint, pinned installs, tracker INSTALL)
**Wave 2**
- [x] 03-02: Supabase local stack + migrations 0001-0006 (LOCKED SQL) + 153-persona legacy seed (classifier-based)
- [x] 03-03: @dxb/shared contract layer — TaskEnvelope (LOCKED) + single Kysely client
**Wave 3**
- [x] 03-04: dxb-mcp server — queue/registry/audit/cost FULL + 4 stub faces + redaction
**Wave 4**
- [x] 03-05: Crash test (kill -9) + 10/10 lifecycle battery + tracker EMBED + VERIFICATION evidence

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

**Plans**: 3/5 executed — IN PROGRESS (Fable-authored, governance v4)

Plans:
**Wave 1**
- [x] 04-01: Toolset kapısı — litellm FULL card + CEO checkpoint (pg-boss npm + imaj + doğrulanmış slug'lar) + pg-boss→outbox-executor + LiteLLM container healthy (shared Postgres, schema litellm) — **COMPLETE 2026-07-07**
**Wave 2**
- [x] 04-02: 0007 budget_state + approval grubu TAM (draft/finalize/list — karar YOK) + tools/dxb-cli approve/reject — **COMPLETE 2026-07-07**
**Wave 3**
- [x] 04-03: Outbox executor (LOCKED çekirdek) + test.write_file + double-fire/TOCTOU testleri + 0008 REVOKE TRUNCATE — **COMPLETE 2026-07-08**
**Wave 4**
- [x] 04-04: Cost ailesi — CEO key checkpoint, virtual keys, hard-stop kanıtı, velocity breaker (pg-boss cron), subscription hook, dxb breaker reset — **COMPLETE 2026-07-08**
**Wave 5**
- [x] 04-05: CI gate-canary (3 LOCKED senaryo + negatif kontrol) + causal-chain kanıtı + 04-VERIFICATION — **COMPLETE 2026-07-08**

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

**Plans**: 9 plans

Plans:

**Wave 1**
- [ ] 05-01-PLAN.md — Agent SDK 0.3.201 study→CEO gate→pinned install at kernel+orchestrator (step 1)
- [ ] 05-02-PLAN.md — Migration routing_and_deps (LOCKED SQL) + brain-map seed + [BLOCKING] live schema push (step 2)

**Wave 2**
- [ ] 05-03-PLAN.md — Kernel: classify.ts (LOCKED ClassifiedIntent) + policy.ts + KERN-02 UPDATE proof (step 3)
- [ ] 05-04-PLAN.md — Persona v2 first batch: 5 product personas, Fable-authored, registry flipped (criterion 6)

**Wave 3**
- [ ] 05-05-PLAN.md — Orchestrator spine: decompose + dispatch + worker shim, e2e event chain (steps 4-5)

**Wave 4**
- [ ] 05-06-PLAN.md — Escalation ladder from task_events, hard stop + blocked report (step 6)
- [ ] 05-07-PLAN.md — `dxb intent` CLI + live queued-chain evidence (step 8)

**Wave 5**
- [ ] 05-08-PLAN.md — qa.ts + council.ts + golden set: judge >= 8/10 + council negative test (step 7)

**Wave 6**
- [ ] 05-09-PLAN.md — Vertical slice gate: slice-10of10.sh + 05-VERIFICATION.md + FABLE verdict (steps 9-10)

### Phase 6: Memory Router & Knowledge Stores

**Goal**: The company remembers safely — one write path with provenance and quarantine, agents touch memory only through router tools, and long-running work stays inside clean contexts
**Depends on**: Phase 5 (pure client of the Phase 3 schema; parallel-safe with Phase 8 per research)
**Requirements**: MEM-01, MEM-02, MEM-03, MEM-04
**Success Criteria** (what must be TRUE):

  1. Every memory write goes through the router's single write path — provenance recorded, untrusted-origin content quarantined, contradictions flagged before promotion; a deliberate poisoning attempt stays in quarantine
  2. Agents read and write memory only via memory-router MCP tools (`memory.recall` / `memory.commit`), with the Obsidian vault + claude-mem wired behind them
  3. Graphify knowledge graph and open-notebook research brain are integrated after their study passes, and a known-fact retrieval test validates routing quality across the store composition
  4. A long-running task stays inside a clean context via compression (headroom), summaries, and memory offloading — demonstrated against a context-rot scenario

**Plans**: 8 plans

Plans:

**Wave 1**
- [x] 06-01-PLAN.md — Toolset study→install: 5 cards filled, open-notebook local, embedding pin, dxb-os key, glm-5.2 proof (step 1)

**Wave 2**
- [x] 06-02-PLAN.md — Routing-quality spike: 20 known facts, >=16/20 gate, ⛔ FABLE composition decision on FAIL (step 2)

**Wave 3**
- [x] 06-03-PLAN.md — memory_embeddings migration [ADAPT 0009→0010] + llmEmbed + pgvector adapter round-trip (step 3)

**Wave 4**
- [x] 06-04-PLAN.md — write-policy LOCKED rules 1-5 + memory_commit + contradiction flag + dxb promote CLI-only (steps 4+6)

**Wave 5**
- [x] 06-05-PLAN.md — classify-read + memory_recall (trusted default, audited quarantine) + poisoning close (steps 5+7)

**Wave 6**
- [x] 06-06-PLAN.md — graphify/notebook adapters + claude-mem pointer sync + per-store round-trips (step 8)

**Wave 7**
- [x] 06-07-PLAN.md — Context-rot demo: 50-step band, summarize+offload through the door, measurement log (step 9)

**Wave 8**
- [x] 06-08-PLAN.md — Compaction cron + known-fact battery >=18/20 + 06-VERIFICATION + FABLE verdict (step 10)

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

**Plans**: 8 plans

Plans:

**Wave 1**
- [x] 07-01-PLAN.md — Toolset study→install: hermes/speaches/yt-dlp cards + hcloud/yt-dlp local (step-1 residue; gateway study pass landed at planning, b7dc785)
- [x] 07-02-PLAN.md — 0010_tool_pins + pin-check.ts: hash pin, sticky quarantine, audit, daily cron (step 2)

**Wave 2**
- [x] 07-03-PLAN.md — denials.json + generate-profiles.ts: registry-derived per-dept .mcp.json, quarantine excluded, red-grep tests (step 3)

**Wave 3**
- [x] 07-04-PLAN.md — Runtime "tool not found" proof + Hetzner provision/hardening/Caddy (CEO checkpoint: token+DNS) (steps 4–5; TLS live 2026-07-09: https://dxbglobal.online/health + www → ok, LE cert)

**Wave 4**
- [x] 07-05-PLAN.md — compose core deploy + migrations + RAM ≤7GB measured + reboot self-heal + backup/restore drill (steps 6–7)

**Wave 5** *(blocked on Wave 4 completion)*
- [x] 07-06-PLAN.md — hermes bounded jobs + watchdog + `dxb kill-switch` + night job → morning queue (steps 8–9)
- [x] 07-07-PLAN.md — video-learn ingest: yt-dlp → Speaches STT → routed summary → quarantined memory (step 10)

**Wave 6**
- [x] 07-08-PLAN.md — gitleaks-action SHA-pin + 07-VERIFICATION 5/5 + ⛔ FABLE closure verdict (steps 11–12; verdict 2026-07-09 23:20, CEO-ordered precondition change recorded)

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
  5. [CEO 2026-07-09] Revolut Business + Wise payment integrations (in + out) live BESIDE Stripe, finance-only, same draft-only/approval-gated class — in-house dxb-mcp payments tools (community MCPs rejected: approval-gate bypass; see study-cards/revolut-business-api.md + wise-api.md). Estimate: +2 plans (~5–6 tools each; auth = Revolut cert-OAuth, Wise token+SCA key; CEO checkpoint mints sandbox→prod creds)

**Plans**: TBD (+2 for Revolut/Wise payment tools per criterion 5)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
(Research note: Phase 6 and Phase 8 are parallel-safe after Phase 5's exit gate; Phase 7 → Phase 10 is hard-ordered.)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Security Baseline & Credential Remediation | 6/6 | Complete | 2026-07-06 |
| 2. Foundation & Integration Program | 5/5 | Complete | 2026-07-06 |
| 3. State Layer & dxb-mcp Core | 5/5 | Complete | 2026-07-07 |
| 4. Safety Rails — Gates, Cost, Audit | 5/5 | Complete | 2026-07-08 |
| 5. Kernel & Orchestrator Core Loop | 9/9 | Complete | 2026-07-08 |
| 6. Memory Router & Knowledge Stores | 8/8 | Complete | 2026-07-09 |
| 7. MCP Gateway & 24/7 VPS Runtime | 8/8 | Complete | 2026-07-09 |
| 8. CEO Dashboard & CRM | 0/TBD | Not started | - |
| 9. JARVIS Voice Layer | 0/TBD | Not started | - |
| 10. Department Activation Waves & Persona Factory | 0/TBD | Not started | - |
| 11. Outleteuro Pilot | 0/TBD | Not started | - |

## Coverage

All 56 v1 requirements map to exactly one phase (traceability table in REQUIREMENTS.md). No orphans, no duplicates.
