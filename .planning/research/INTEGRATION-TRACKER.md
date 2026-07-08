# DXB Integration Tracker (INTEG-01 / INTEG-02)

Single source of truth for every master-plan §8B item's integration lifecycle. A row is INTEG-01-compliant only when it reaches EMBED; the tracker holds each row until then. No doc-mandated tool may be skipped or installed without its study card ("no blind installs").

**Status legend.** Valid Status tokens are the five bare words: STUDY, INSTALL, ADOPT, EMBED, EXCLUDED. One word, no parentheses — qualifiers live in Notes. A row advances only left-to-right (STUDY then INSTALL then ADOPT then EMBED). EXCLUDED is terminal unless a dated CEO sign-off entry in the Re-admission Log below supersedes it.

**Column schema** (in order): Item, Category, Status, Target Phase, Owner (dept/tier), Trigger, Study Card, Notes. Trigger vocabulary mirrors §8B: hook (auto/background), skill (slash/auto-invoked), mcp-profile (department allowlist), ref (reference only, no install), service (standalone service), mode (session mode), lib (pnpm runtime library). Target Phase uses the locked Phase 1–11 renumbering (P0→1, P1→2, P2→3/4/5, P3→6, P4→7, P5→8/9, P6→10, P7→11); rows whose old "P2" tag was ambiguous are marked [ASSUMED] in Notes for CEO confirmation at that phase's discuss step.

## Main Tracking Table

| Item | Category | Status | Target Phase | Owner (dept/tier) | Trigger | Study Card | Notes |
|------|----------|--------|--------------|-------------------|---------|------------|-------|
| superpowers | Claude Code ecosystem | STUDY | 2 | All engineering-grade agents | skill | study-cards/superpowers.md | Already installed — retroactive study card owed (Pitfall 5); target: wiring |
| GSD (gsd-core suite) | Claude Code ecosystem | STUDY | 2 | Orchestrator / project discipline | skill | study-cards/gsd.md | Already installed, driving this very build; retroactive card owed |
| gstack | Claude Code ecosystem | STUDY | 2 | QA gates (review/spec/ship/qa) | skill | study-cards/gstack.md | Already installed; retroactive card owed; used Phase 2 onward |
| ruflo | Claude Code ecosystem | STUDY | 5 | Swarm/hooks/memory — evaluate overlap with kernel | mcp-profile | study-cards/ruflo.md | [ASSUMED — kernel-overlap eval fits orchestrator core loop]; already installed; explicit "study — evaluate overlap" per source; trigger also hook |
| claude-mem | Claude Code ecosystem | ADOPT | 6 | Cross-session memory, all agents | hook | study-cards/claude-mem.md | Retroactive card COMPLETED 2026-07-08 (06-01): storage layout (~/.claude-mem/claude-mem.db, observations schema) + pointer-sync read surface recorded; LOCKED outside router write path. EMBED = 06-06 syncClaudeMem + 06-08 hourly schedule |
| caveman | Claude Code ecosystem | STUDY | 2 | Token compression, inter-agent comms | mode | study-cards/caveman.md | Already installed and ACTIVE now; retroactive card owed |
| headroom | Claude Code ecosystem | ADOPT | 6 | Token-compression, harness session layer | hook | study-cards/headroom.md | Scope RESOLVED 2026-07-08 (06-01, card): adopted as SESSION-layer compression only (plugin enabled, settings.json evidence); does NOT cover MEM-04 OS context budget — that lands 06-07 in kernel. Not in the DXB LiteLLM chain; trigger also proxy |
| codex-plugin-cc | Claude Code ecosystem | STUDY | 5 | Engineering second brain (Codex 5.5) | skill | study-cards/codex-plugin-cc.md | [ASSUMED — engineering worker tier]; already installed; trigger also subagent |
| claudex | Claude Code ecosystem | STUDY | 5 | Model-switching pattern reference only | ref | study-cards/claudex.md | [ASSUMED — model-routing reference for kernel]; near-dormant, reference only |
| awesome-claude-code, system_prompts_leaks, llm-wiki | Claude Code ecosystem | STUDY | 2 | R&D + HR persona factory reference | ref | study-cards/awesome-claude-code-system-prompts-leaks-llm-wiki.md | Reference material, no install action; target: docs |
| humanizer | Claude Code ecosystem | STUDY | 10 | Marketing/Sales outbound agents | skill | study-cards/humanizer.md | Mandatory in outbound pipeline before approval gate (DEPT-04); auto in pipeline |
| knowledge-work-plugins (Anthropic) | Claude Code ecosystem | STUDY | 10 | Per-department (eng/mkt/legal/fin/product-design/productivity) | mcp-profile | study-cards/knowledge-work-plugins.md | Wave-based install at Phase 10 |
| vercel skills / agent-skills | Claude Code ecosystem | STUDY | 10 | Eng agents | skill | study-cards/vercel-skills-agent-skills.md | |
| Design bundle: impeccable + taste-skill + open-design + Google Stitch | Design | STUDY | 8 | Design dept + dashboard build | skill | study-cards/design-bundle.md | Must be installed & studied BEFORE any dashboard design work; trigger also mcp-profile (Stitch) |
| Higgsfield MCP, Figma plugin | Design | STUDY | 10 | Design/Creative | mcp-profile | study-cards/higgsfield-mcp-figma-plugin.md | |
| Aceternity/Refero/Mobbin/Godly | Design | STUDY | 8 | Dashboard design sources | ref | study-cards/aceternity-refero-mobbin-godly.md | Reference only |
| Obsidian stack (obsidian-mind, kepano/obsidian-skills, second-brain, claude-obsidian) | Memory/knowledge | ADOPT | 6 | Memory system | hook | study-cards/obsidian-stack.md | Combination PICKED 2026-07-08 (06-01, card): fs write path to `memory-store/` vault subtree + frontmatter contract; kepano/obsidian-skills ADOPT read-side; other 3 EXCLUDED from runtime. No install artifact (vault live since 260706-h26). EMBED = 06-04 adapter |
| Graphify | Memory/knowledge | ADOPT | 6 | Memory — knowledge graph | skill | study-cards/graphify.md | Retroactive card COMPLETED 2026-07-08 (06-01): adapter contract = graph.json JSON read + execFile `--update` write; 06-02 spike gates composition. EMBED = 06-06 adapter; trigger also mcp |
| open-notebook | Memory/knowledge | INSTALL | 6 | Memory — research brain (replaces NotebookLM) | service | study-cards/open-notebook.md | Card filled + verdict OK 2026-07-08 (35.2k stars re-verified); LOCAL install same day: compose.local.yml (pinned 1.10.0 + surrealdb v2.6.5), `/health` healthy, 620MiB idle measured (Phase-7 RAM input). VPS placement = Phase 7. ADOPT = 06-06 adapter |
| supabase | Memory/knowledge (state) | INSTALL | 3 | Kernel state + CRM + dashboard DB | mcp-profile | study-cards/supabase.md | PHASE-3-TOOLSET — study card required before Phase 3 install (success criterion 3); core |
| Research stack (open_deep_research, gpt-researcher, gptr-mcp, browser-use) | Research | STUDY | 10 | Research dept foundation | skill | study-cards/research-stack.md | Wave 1 of Phase 10; trigger also mcp-profile |
| last30days, ScrapeGraphAI | Research | STUDY | 10 | Research dept | skill | study-cards/last30days-scrapegraphai.md | |
| Agent-Reach | Research | STUDY | 10 | Research/Social — behind approval gate only | mcp-profile | study-cards/agent-reach.md | Conditional; 51k stars; ToS risk flagged in source; gated |
| Apify | Research | STUDY | 10 | Research/Data scraping | mcp-profile | study-cards/apify.md | Conditional; token exists — rotate first per Phase 1 discipline; env-secret |
| MiroFish (+ mirofish-cli) | Research | STUDY | 11+ | Decision-simulation layer — sandbox only | skill | study-cards/mirofish.md | Never final decisions (V2-05); gated |
| yt-dlp + video-use | Media/content | STUDY | 7 | Video-learning module | skill | study-cards/yt-dlp-video-use.md | Auto on video link |
| OpenMontage, opencut | Media/content | STUDY | 10 | Creative/Social video production | skill | study-cards/openmontage-opencut.md | |
| MoneyPrinterTurbo | Media/content | STUDY | 10 | Social media dept | skill | study-cards/moneyprinterturbo.md | Already installed; retroactive card owed |
| voicebox | Media/content | STUDY | 9 | JARVIS voice layer | service | study-cards/voicebox.md | Already installed; retroactive card owed; 9+ |
| Gemini Omni video API | Media/content | STUDY | 10 | Creative — budget-gated | ref | study-cards/gemini-omni-video-api.md | Conditional; $0.10/sec preview API — cost-monitor tagging required; gated tool |
| Whisperflow (clone) | Media/content | STUDY | 9 | JARVIS input | service | study-cards/whisperflow-clone.md | Build clone: voicebox + whisper on VPS, not the paid product; 9+ |
| hermes-agent | Coding agents | STUDY | 7 | 24/7 VPS resident agent | service | study-cards/hermes-agent.md | 209k stars; locked decision per CLAUDE.md; VPS phase |
| jcode, oh-my-pi | Coding agents | STUDY | 5 | Eng — study pass, adopt only if beats current harness | ref | study-cards/jcode-oh-my-pi.md | [ASSUMED]; ref then skill if adopted |
| free-claude-code | Coding agents | STUDY | 5 | Worker-model routing alternative to OpenRouter | ref | study-cards/free-claude-code.md | [ASSUMED]; verified clean; optional |
| freellmapi, 9router | Coding agents | STUDY | 5 | ToS gray zones — use clean parts only | ref | study-cards/freellmapi-9router.md | [ASSUMED]; 9router RTK compression pattern as ref only; OpenRouter stays primary; bypass usage is EXCLUDED (see register) |
| playwright-mcp | Ops MCPs | STUDY | 3 | Eng/QA + browser automation | mcp-profile | study-cards/playwright-mcp.md | PHASE-3-TOOLSET — study card required before Phase 3 (success criterion 3); core |
| Context7 | Ops MCPs | STUDY | 3 | Eng — live library docs, reduces hallucination | mcp-profile | study-cards/context7.md | PHASE-3-TOOLSET — already available as GSD-integrated MCP this session; formal study card still owed |
| Sentry MCP | Ops MCPs | STUDY | 10 | Eng error tracking | mcp-profile | study-cards/sentry-mcp.md | |
| Stripe MCP | Ops MCPs | STUDY | 11 | Finance — draft-only, approval-gated | mcp-profile | study-cards/stripe-mcp.md | Gated (PILOT-04); credentials only in outbox executor |
| DocuSign MCP | Ops MCPs | STUDY | 11 | Legal — draft-only, approval-gated | mcp-profile | study-cards/docusign-mcp.md | Gated (PILOT-04); credentials only in outbox executor |
| Composio | Ops MCPs | STUDY | 10+ | Orchestrator scale-out connector | mcp-profile | study-cards/composio.md | |
| Cloudflare MCP | Ops MCPs | STUDY | 10 | Eng/Security — outleteuro zone | mcp-profile | study-cards/cloudflare-mcp.md | Tokens exist — rotate first |
| autoresearch (karpathy) | Other | STUDY | 11 | Loop-engineering module | skill | study-cards/autoresearch.md | 89.8k stars; Outleteuro assets, locked scorer |
| huggingface | Other | STUDY | as needed | Model/dataset source | ref | study-cards/huggingface.md | |
| Notion/Granola/Composio AI-stack | Other | STUDY | 10+ | Ops — only if free tiers suffice | mcp-profile | study-cards/notion-granola-composio-stack.md | Evaluate |
| claude-agent-sdk (@anthropic-ai/claude-agent-sdk) | Locked stack (runtime lib) | INSTALL | 3 | Kernel/Orchestrator | lib | study-cards/claude-agent-sdk.md | PHASE-5 05-01: installed 0.3.201 exact (catalog) at kernel+orchestrator only, CEO-approved 2026-07-08 (05-01-legitimacy-approval.md); live latest 0.3.204 noted, pin unchanged |
| mcp-sdk (@modelcontextprotocol/sdk) | Locked stack (runtime lib) | EMBED | 3 | State Layer / dxb-mcp | lib | study-cards/mcp-sdk.md | PHASE-3-TOOLSET; pinned 1.29.0 |
| litellm (proxy) | Locked stack (infra container) | EMBED | 4 | Cost Monitor / model routing | service | study-cards/litellm.md | Pinned ghcr.io/berriai/litellm:main-stable; installed 2026-07-07 (04-01, CEO checkpoint); 02-05 stub card was absent on disk — FULL card created in 04-01 (deviation recorded); virtual keys + breaker wiring in 04-04; EMBED 2026-07-08 (04-05): packages/shared/src/litellm.ts imported by dxb-mcp cost group + budget/velocity tests (grep-proven), proxy live + hard-stop enforcing |
| pg-boss | Locked stack (runtime lib) | EMBED | 3 | State Layer / system-job queue | lib | study-cards/pg-boss.md | PHASE-3-TOOLSET; pinned 12.25.1; installed 2026-07-07 in Phase 4 (04-01, CEO checkpoint 04-01-legitimacy-approval.md) ONLY in packages/outbox-executor — single scheduler process decision; EMBED 2026-07-08 (04-05): imported at packages/outbox-executor/src/scheduler.ts:8 (grep-proven), drives tick/reaper/breaker routines |
| supabase-js (@supabase/supabase-js) | Locked stack (runtime lib) | INSTALL | 3 | State Layer / API-Backend | lib | study-cards/supabase-js.md | PHASE-3-TOOLSET; pinned 2.110.0 |
| supabase-cli | Locked stack (dev tool) | ADOPT | 3 | State Layer / migrations | lib | study-cards/supabase-cli.md | PHASE-3-TOOLSET; pinned 2.109.0; schema-only local workflow (Pitfall 1) |
| zod | Locked stack (runtime lib) | EMBED | 3 | All boundary payloads | lib | study-cards/zod.md | PHASE-3-TOOLSET; pinned 4.4.3; MCP SDK 1.29 supports zod v4 as peer dep |
| kysely | Locked stack (runtime lib) | EMBED | 3 | @dxb/shared db layer | lib | study-cards/kysely.md | PHASE-3-TOOLSET; pinned 0.29.3; chosen over drizzle (PHASE-03 §5 LOCKED, revision FABLE-ONLY) |
| pg | Locked stack (runtime lib) | EMBED | 3 | @dxb/shared db layer (driver under kysely) | lib | study-cards/pg.md | PHASE-3-TOOLSET; pinned 8.22.0; session-mode direct connection only |
| kickbacks.ai | Excluded | EXCLUDED | - | - | - | - | Adware: Marketplace removal + adverse audit; re-admission requires CEO sign-off entry below |
| automaton | Excluded | EXCLUDED | - | - | - | - | Crypto-token project, safety criticism; re-admission requires CEO sign-off entry below |
| llm-council (as dependency) | Excluded | EXCLUDED | - | - | - | - | Dead repo since Nov 2025; pattern reimplemented in-house (CNCL-01) |
| ToS-gray systems (free-tier stacking, multi-account rotation; freellmapi/9router beyond clean ref parts) | Excluded | EXCLUDED | - | - | - | - | ToS risk; doc's own rule forbids bypass systems; re-admission per instance |

## Excluded Items (INTEG-02)

Detailed exclusion register. These items remain excluded absent an explicit, dated CEO sign-off entry in the Re-admission Log.

| Item | Reason | Re-admission Requirement |
|------|--------|---------------------------|
| kickbacks.ai | Adware (Marketplace removal + adverse audit) | Explicit CEO sign-off entry in the Re-admission Log, with the adware finding addressed |
| automaton | Crypto-token project, safety criticism | Explicit CEO sign-off entry in the Re-admission Log required |
| llm-council (as a dependency) | Dead repo since Nov 2025 — pattern reimplemented in-house (CNCL-01, §10) | Not re-admissible as a dependency; the pattern is already adopted independently |
| ToS-gray systems: free-claude-code-adjacent free-tier stacking, multi-account rotation, freellmapi/9router (beyond clean reference parts) | ToS risk; the doc's own rule forbids bypass systems | Explicit CEO sign-off entry in the Re-admission Log required per instance |

## Re-admission Log

Machine rule: a main-table row with Status EXCLUDED may only change status if a dated CEO-sign-off entry appears in this section naming the item and the approval. No entries yet.
