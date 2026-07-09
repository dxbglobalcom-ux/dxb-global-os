# DXB Global OS

## What This Is

DXB Global OS is an AI-native company operating system for **DXB Global Technology Consultancy AI-Native OS Company** — a digital replica of a world-class tech company: departments, manager agents, specialist agents, sub-agent/swarm teams, skills, MCP tools, persistent memory, and QA, running 24/7 with minimal human intervention. The sole human is the CEO, who gives intent and approvals through a dashboard/CRM cockpit and a JARVIS voice layer; the OS decides which agents, skills, and tools fire. Master source of truth: the CEO's architecture notes document, extracted and approved at `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` (mirrored in `.planning/` context).

## Core Value

**Anti-baby-sitting**: the CEO states intent once; the company executes end-to-end autonomously, with hard approval gates only where actions face outward (money, contracts, emails, ad spend). If everything else fails, intent → autonomous, quality-gated execution must work.

## Business Context

- **Customer**: The CEO/founder (sole operator); later: consultancy clients + own e-commerce ventures (outleteuro.com → techshopeuro.com → social-media company)
- **Revenue model**: Consultancy/execution for clients + autonomous own ventures + self-marketing of DXB services; long-term venture factory
- **Success metric**: Pilot (P7): **Catalog Automation Rate** — % of outleteuro's 73 brands with live, complete, correct product listings maintained autonomously. Full OS later gets a KPI tree: operations → quality → SEO/traffic → revenue → company automation
- **Strategy notes**: Approved master plan at `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` (source extraction, locked decisions, brain architecture, integration map)

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] OS Kernel — intent parsing, policy, routing; CEO never selects tools
- [ ] Orchestrator — task decomposition, department dispatch, model-tier selection (Fable 5/Opus 4.8 top; Sonnet 5 heads; Codex 5.5 engineering; Chinese models via OpenRouter as workers)
- [ ] Agent Registry — department → head → specialist → worker hierarchy over the 367 existing personas (+ new Legal DE/TR, HR digital-worker factory, Research departments)
- [ ] Task Queue / job system with status, dispatch, worker triggering
- [ ] Memory system — Obsidian vault + Graphify knowledge graph + open-notebook + claude-mem + memory router; context-rot prevention
- [ ] CEO Dashboard + custom CRM (Supabase/Postgres) — transparent, real-time, non-technical-friendly, remote from anywhere
- [ ] QA / Audit / Cost Control — token/cost monitor with €50–150/month API envelope enforcement, audit log, quality gates
- [ ] Approval Gate engine — money/contracts/emails/ads always DRAFT + written CEO approval
- [ ] DXB MCP Gateway — department-scoped MCP profiles, least privilege + 8 custom DXB MCPs (registry, queue, memory router, dashboard, CRM, approval gate, cost monitor, audit log)
- [ ] Multi-model council (in-house) at critical gates — parallel cheap models + one judge
- [ ] JARVIS voice layer — morning briefings, spoken commands (voicebox + whisper)
- [ ] Video-learning module — CEO drops a YouTube link, system watches and learns (yt-dlp + video-use)
- [ ] Loop-engineering / autoresearch module — program.md + mutable asset + locked scorer, git commit/revert
- [ ] 24/7 EU VPS runtime + Hermes resident agent (GLM 5.2 brain) for always-on departments
- [ ] Integration program — every doc-listed repo/skill/plugin/MCP tracked study → install → adopt → embed (see plan §8B map)
- [ ] Persona v2.0 program — HR factory globalizes and rewrites all 367 personas after skeleton
- [ ] Outleteuro pilot executed BY the holding's departments (P7) — Catalog Automation Rate as optimization KPI

### Out of Scope

- kickbacks.ai — adware (pulled from VS Code Marketplace, adverse security audit)
- automaton (Conway-Research) — crypto-token project with credibility/safety criticism
- karpathy/llm-council as dependency — dead repo; its pattern is reimplemented in-house
- Anthropic-limit bypass schemes of any kind — subscription/API/free-tier modes always tagged and honest; free-tier stacking (freellmapi) and multi-account round-robin (9router) gray zones excluded, clean patterns only as reference
- NotebookLM as memory brain — subscription ends October 2026; open-notebook replaces it
- Adopting an external CRM (HubSpot etc.) — breaks "whole company in one cockpit" requirement; custom CRM on Supabase instead
- techshopeuro.com + social-media subsidiary builds — after Outleteuro pilot proves the OS (explicit sequencing)

## Context

- **Assets on disk**: `agency-agents/` (367 persona .md files, 18 departments, v1.0 quality, China-market flavored); empty Obsidian vault `DXB GLOBAL OS/`; source .odt (contains plaintext credentials — excluded from git via .gitignore until sanitized)
- **Verified tooling** (research round 2026-07-05): Google Stitch SDK + Gemini Omni video API real; NVIDIA Build free tier confirmed (~40 RPM, dev only); hermes-agent/graphify/headroom/open-design/open-notebook active and healthy
- **Already installed locally**: superpowers, GSD, gstack, ruflo, claude-mem, caveman, codex plugin, karpathy-skills, MoneyPrinterTurbo, voicebox
- **outleteuro.com**: existing WooCommerce/WordPress store, 73 brands, hosting live — the pilot target
- **CEO**: non-technical, Turkish-speaking; conversations in Turkish, project docs in English
- **Security debt**: all credentials in the source doc must be rotated (CEO holds checklist duty); vault pattern mandatory from Phase 0

## Constraints

- **Budget**: €50–150/month OS operating cost (VPS + API tokens); Claude/Codex subscriptions separate — Cost Monitor enforces (alert 70%, hard-stop non-critical at 100%)
- **Hardware**: ThinkPad X230 8GB = control terminal only; 24/7 work happens on EU VPS (Hetzner-class ~€20/mo)
- **Security**: least-privilege MCP profiles per department; approval gates on all outward actions; secrets only via vault/.env; no plaintext credentials in repo or prompts
- **Token discipline**: skills/plugins/MCPs fire only when needed, only for the responsible agent; compression layers (headroom, caveman) mandatory; but quality may never drop — if quality is at risk, don't cut cost
- **Process**: "no guessing" — unknowns researched before action; every doc-listed tool studied before install; tools installed at the START of the phase that uses them (dual-role principle)
- **Sequencing**: holding built completely first; Outleteuro executed by the holding's own departments, never directly by the builder

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full architecture first (not MVP slice) | CEO directive: real holding structure from day one, skeleton expandable per department | — Pending |
| EU VPS + laptop hybrid runtime | X230 8GB can't run 24/7 multi-agent; VPS ~€20/mo cheapest reliable always-on | — Pending |
| OpenRouter as worker-model gateway | One key, all Chinese models, pay-per-token; NVIDIA Build free tier for dev | — Pending |
| Orchestrator brain: Fable 5 critical / Opus 4.8 routine | Highest intelligence reserved for irreversible decisions; cost control on loops | — Pending |
| Hermes VPS agent with GLM 5.2 brain (not Codex 5.5) | Codex subscription doesn't cover headless VPS; API per-token would break budget | — Pending |
| In-house council instead of Fusion/llm-council | Fusion is OpenRouter's paid product (doc conflated it with 9router); llm-council dead; pattern is simple to own | — Pending |
| Custom CRM inside dashboard on Supabase | "Whole company in one cockpit" requirement; agents read/write natively via MCP | — Pending |
| Personas v2.0 after skeleton, by HR factory | Factory rewrites 367 personas systematically instead of months of manual pre-work | — Pending |
| Pilot KPI: Catalog Automation Rate | Measurable day one, traffic-independent, proves autonomous ops; KPI tree comes later | — Pending |
| Credential rotation + vault before any build | Source doc leaked plaintext secrets; likely pasted into third-party AI chats | — Pending |
| [CEO 2026-07-09, B7b] GATE-01 approval scope revision: money-IN = NO approval (autonomous, dashboard-visible, post-hoc audit); money-OUT = CEO approval always; routine outward comms autonomous within versioned dept policy; approval inbox = money-out + contracts + CEO-flagged only; single channel from Phase 8 (dashboard inbox + JARVIS confirm) | CEO is approve/reject authority, not task executor — anti-babysitting core value; recorded master-plan change (external audit directive), not silent deviation | REQUIREMENTS.md GATE-01 revised 2026-07-09 |
| [CEO 2026-07-09, B1] Generic loop-engine module precedes Outleteuro asset (locked-scorer template, dept-instantiable) | One reusable optimization engine instead of one-off pilot hack; scorer agent-immutable | ROADMAP Phase-11 criterion 3 revised |
| [CEO 2026-07-09, B8] Support dept full activation + dedicated policy-writer expert in Legal (versioned policies in docs/policies/ bound support-responder autonomy) | Autonomous support needs written policy boundary; customer side cannot stay unowned | PHASE-10 master plan updated |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-07-05 after initialization*
