<!-- GSD:project-start source:PROJECT.md -->

## ⛔ RULE #0 — MANDATORY DESIGN VERIFICATION (CEO directive 2026-07-13, SEVEREST TIER)

**No visual work is "done" until a Design Verification Pass runs and is evidenced.** Render every touched route in the real browser, BOTH locales (EN+TR), ≥2 widths; walk `references/design-bank/CHECKLIST.md` (overlap, alignment, cut-off, scroll sanity, language purity, honest zero-states, token discipline); compare against the baselines in `references/design-bank/`; run `scripts/i18n-purity-check.sh`. The CEO is NOT the QA layer — catchable visual defects reaching the CEO's eye = governance violation (RET + recorded). Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-DESIGN-VERIFICATION.md`. Applies to every author and every session until project end.

## Project

**DXB Global OS**

DXB Global OS is an AI-native company operating system for **DXB Global Technology Consultancy AI-Native OS Company** — a digital replica of a world-class tech company: departments, manager agents, specialist agents, sub-agent/swarm teams, skills, MCP tools, persistent memory, and QA, running 24/7 with minimal human intervention. The sole human is the CEO, who gives intent and approvals through a dashboard/CRM cockpit and a JARVIS voice layer; the OS decides which agents, skills, and tools fire. Master source of truth: the CEO's architecture notes document, extracted and approved at `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` (mirrored in `.planning/` context).

**Core Value:** **Anti-baby-sitting**: the CEO states intent once; the company executes end-to-end autonomously, with hard approval gates only where actions face outward (money, contracts, emails, ad spend). If everything else fails, intent → autonomous, quality-gated execution must work.

### Language rule (BINDING — CEO directive 2026-07-12)

**Every project artifact is written in ENGLISH** — personas, specs, migrations, code comments, commit messages, planning docs, reports, evidence records. **Single exception: conversational chat replies to the CEO stay Turkish.** Applies to all authors (Fable, Opus, GPT 5.6, runtime agents) until the project ends. Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-LANGUAGE.md`. Pre-directive Turkish content stays; translation pass = optional CEO-scheduled follow-up.

### Constraints

- **Budget**: €50–150/month OS operating cost (VPS + API tokens); Claude/Codex subscriptions separate — Cost Monitor enforces (alert 70%, hard-stop non-critical at 100%)
- **Hardware**: ThinkPad X230 8GB = control terminal only; 24/7 work happens on EU VPS (Hetzner-class ~€20/mo)
- **Security**: least-privilege MCP profiles per department; approval gates on all outward actions; secrets only via vault/.env; no plaintext credentials in repo or prompts
- **Token discipline**: skills/plugins/MCPs fire only when needed, only for the responsible agent; compression layers (headroom, caveman) mandatory; but quality may never drop — if quality is at risk, don't cut cost
- **Process**: "no guessing" — unknowns researched before action; every doc-listed tool studied before install; tools installed at the START of the phase that uses them (dual-role principle)
- **Sequencing**: holding built completely first; Outleteuro executed by the holding's own departments, never directly by the builder

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack (condensed — full research: .planning/research/STACK.md)

**Core:** Claude Code + @anthropic-ai/claude-agent-sdk 0.3.x (orchestration; no LangChain-class framework on top) · Supabase self-hosted Postgres 15+ (single state store, pgvector included) · pg-boss 12.x (job queue on same Postgres; no Redis) · Next.js 16.2.x dashboard (React 19, @supabase/ssr) · @modelcontextprotocol/sdk 1.29 TS (8 DXB MCPs, one monorepo package each over shared schema) · LiteLLM proxy 1.91 (virtual keys per department, budget hard-stop) · Docker Compose on Hetzner 8GB VPS + Caddy · hermes-agent (24/7 resident) · Speaches CPU image (JARVIS STT/TTS).

**Support:** Tailwind v4, shadcn/ui + Aceternity, Vercel AI SDK (dashboard only), Zod 4, drizzle/kysely (pick in P2), pnpm workspaces monorepo, Supabase CLI migrations.

**Hard rules:** no Redis/BullMQ, no dedicated vector DB, no Kubernetes/Coolify, no LangChain/CrewAI orchestration, no raw provider keys in agent configs (LiteLLM virtual keys only), Realtime Broadcast not postgres_changes.

**READ `.planning/research/STACK.md` BEFORE:** installing/upgrading any package (Version Compatibility table — e.g. pg-boss needs session-mode 5432, no transaction pooling), choosing an alternative tool (Alternatives Considered), planning Phase 7 VPS deploy (RAM budget, Stack Patterns) or Phase 8 dashboard (Broadcast notes). Sources + rationale live there too.

<!-- CONDENSED 2026-07-08 (token-diet): tables moved to .planning/research/STACK.md; do not re-inline on GSD sync -->

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

## Evidence-Before-Done (binding — orchestrator and ALL subagents)

A task may be reported as complete ONLY with executed verification evidence. No exceptions.

1. **Every "done" claim must cite the verification that was actually run** — the command and its decisive output line. No verification executed = the claim is forbidden.
2. **Claims outside terminal observability** (GUI rendering, external dashboards, third-party service state) can NEVER be reported as "done". They MUST be labeled `⚠ UNVERIFIED — requires human-eye confirmation` and listed separately from verified results.
3. **Two-tier reporting is mandatory:** `✓ VERIFIED (evidence: <command → output>)` vs `⚠ UNVERIFIED (reason it cannot be machine-checked)`. Mixing tiers in one claim is a violation.
4. **Prediction ≠ result.** "This should work / will appear" is a hypothesis; state it as one. Only tested outcomes use past tense ("works", "appears").
5. Subagents inherit this rule verbatim; orchestrator spot-checks subagent completion claims against disk/git state before relaying them.

## Knowledge Graph & Session Efficiency

The repo root is a persistent knowledge substrate. All agents and subagents follow these rules to cut token waste and keep navigation grounded in current project state:

1. **Graph-first reads.** Before any broad repo reading, query `.planning/graphs/` and the `.planning/` docs (STATE.md, phase SUMMARYs) first — only fall back to scanning source files when those don't answer the question.
2. **Phase-completion refresh.** The graph is refreshed at phase completion by running `/gsd-graphify build` after each phase's verify step.
3. **Obsidian wiki-links.** The repo root is an Obsidian vault, so human-facing docs may use `[[wiki-links]]` to cross-reference other notes.
4. **Stale-graph rebuild.** If graph metadata is older than the current HEAD by more than one phase, rebuild before trusting it.
5. **Compact cadence.** At every plan closure (SUMMARY committed, STATE updated) suggest `/compact` to the CEO; 100k context is the hard ceiling — never keep working past it without compacting. Resume after restart = read STATE.md only.

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

⛔ **PLAN.md ≠ a plan (CEO ruling 2026-07-13).** The project plan exists ONCE: `HOLDING-OS-MASTER-PLAN/` (31-spec corpus + IMPLEMENTATION_ROADMAP). Quick/phase `PLAN.md` files are execution tickets only — spec pointer + roadmap row + evidence contract, ZERO new design decisions. Deviations go into the SPEC as registered adaptations (CEO-visible), never invented inside a PLAN.md. Successor authors (Opus after Fable) execute the corpus; they do not re-plan it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
