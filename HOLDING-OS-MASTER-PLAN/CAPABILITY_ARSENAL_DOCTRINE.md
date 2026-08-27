# Capability Arsenal Doctrine

**Status:** BINDING (roadmap row R4.3 deliverable (a)) · **Author:** Fable 5 · **Date:** 2026-07-18
**CEO orders codified here (verbatim):**
- 2026-07-18 00:20 — *"8 MCP az değil mi; önemli alet edevatın HEPSİ sisteme nakşedilsin"* — the arsenal expansion order.
- 2026-07-18 00:30 — *"ücretliler de olabilir ama yedekte dursunlar önerilmek için. fakat en iyi ücretsiz aletlerin en mükemmel şekilde kurulmasını istiyorum"* — paid tools = **proposal bench only**; free tools installed **to perfection**.

This doctrine is the single map of the holding's tool hands: what is installed, what each
department is targeted to hold, what waits on a credential, what is money-locked, and what <!-- HISTORY -->
sits on the paid bench. Its standing invariant: **kurulumsuz-blind = 0** — no server may be
declared (in `packages/gateway/policy/grants.json` grants) without a *named disposition* in §6.
A granted-but-uncatalogued server with no disposition row here is a governance defect.

## 1. Principles

1. **D1 free-first law:** free tools are installed and mastered first; paid tools are NEVER
   installed or paid for — they live on the bench (§8) and surface as CEO proposals when
   profit funds them.
1-bis. **D1-bis — THE QUALITY TIER (CEO ruling, 2026-08-27; amends D1 without weakening it).**
   His words: *"ücretsizler seçilirken aynı anda bunun ücretli ve çok daha mükemmel kalitede olanı
   da kontrol edilmeli… dünya yarışmalarında birinci olacak seviyede e-commerce web siteleri
   yapılacaksa müşteri iyi para veriyorsa en iyi malzemeler, normal olanlar için ise bedava olanlar
   kullanılabilir."* **Free-first still governs what gets INSTALLED. D1-bis governs what gets
   CONSIDERED.** At the moment a job is scoped, the free hand and the best paid hand for that exact
   job are named together, and the choice follows the job's own tier:

   | Job tier | Rule |
   |---|---|
   | Ordinary internal or routine client work | the free hand, used to perfection (D1 unchanged) |
   | Work that must win — a paying client, an outward face of the holding, a "first place in a world competition" deliverable | the paid twin is named with its price beside the free one, and surfaces to the CEO as ONE proposal before the work is priced |

   His own example is a video advertisement and he supplied the shelf himself: our own card
   (LTX-Video) beside Runway Gen-4 Turbo, Hailuo 2.3 (1080p), Sora 2 Standard, Seedance 2.5 and
   Sora 2 Pro. **Nothing in D1-bis lets anything be bought without him** — §8 still holds: the bench
   proposes, it never buys. What changes is WHEN the bench is read: at the job, not only at a phase
   gate. Every §8 row therefore needs its capability DOMAIN and its free counterpart named, which is
   board row **B31**; the request that reaches the bench at job time is board row **B41**.

2. **Study before install (INTEG-01):** every tool has a study card
   (`.planning/research/study-cards/`) BEFORE install; third-party code passes the
   SkillSpector gate (static scan, archived report, findings TRIAGED not auto-accepted —
   `.planning/research/skillspector/`).
3. **Pin at approval, quarantine on drift (MCP-03):** every tool's description+schema is
   sha256-pinned in `tool_pins` at install (`scripts/gateway/pin-arsenal.mjs`); the daily
   scheduler drift-check quarantines silent mutations. Quarantine is sticky; release is a
   human decision.
4. **Kayıt-yetki-uygulama chain (HOLDING_LIBRARY G3):** every server is a library `mcp` item;
   every department capability is a `library_grants` row written through
   `control_library_action` (CEO-only door); the compiled profile is the ONLY thing a worker
   session mounts. Absent from the record = unusable, by construction.
5. **Least privilege, narrowest cut (PERMISSION_MODEL G2):** grants are per-department;
   denials override grants; dangerous tools are dot-denied even inside granted servers
   (measured examples: `playwright.browser_run_code_unsafe`, `playwright.browser_file_upload`,
   git write tools during construction — `policy/denials.json` R4.3 note).
6. **Untrusted-input rule:** browser pages, scraped content, and external docs returned by
   these hands are UNTRUSTED input. They never directly trigger gated actions, memory
   writes, or config changes. (Study-card pitfall discipline; memory quarantine tier applies.)
7. **Outward-action gates unchanged:** none of the free tranche can move money, sign, or
   send. Anything outward-facing stays behind the approval engine regardless of which hand
   touches it.
8. **Evidence per install:** an install is DONE only with a live `tools/call` round-trip
   proof (`scripts/gateway/probe-arsenal.mjs`) and, for worker-facing hands, an end-to-end
   task exercising the tool through the runtime chain (`tool_calls` row).

## 2. Capability classes

| Class | Definition | Gate |
|---|---|---|
| **house bus** | `dxb-mcp` internal company tools (queue, registry, approval, audit, cost, memory, crm, dashboard) | in-repo, pinned |
| **external read hands** | credential-less free servers: browse, read repo, read docs, scrape | this doctrine + pins + library grants |
| **credential hands** | free servers needing a secret (PAT, OAuth) | CEO hands the secret personally; vault/.env only; never in repo or prompts |
| **money/contract hands** | stripe, revolut, wise, docusign, WooCommerce write paths | **Phase-11 LOCKED** (roadmap R6.1); approval engine mandatory |
| **paid bench** | best paid options, studied + priced | PROPOSAL ONLY — §8 |

## 3. Enforced surface (measured 2026-07-18, post-R4.3 install)

| Server | Version (pinned) | Tools | Granted to | Denied inside |
|---|---|---|---|---|
| dxb-mcp | in-repo | 21 | all 21 departments (8 group items, identity mirror) | — |
| git | mcp-server-git==2026.7.10 (uvx, repo-pinned `--repository ./`) | 12 pinned / **7 emitted** | engineering | git_commit, git_add, git_reset, git_checkout, git_create_branch (K1 construction rule) |
| context7 | @upstash/context7-mcp@3.2.4 (workspace dep) | 2 | engineering | — |
| playwright | @playwright/mcp@0.0.78 (workspace dep, `--headless --isolated`) | 24 pinned / **22 emitted** | engineering, quality | browser_run_code_unsafe, browser_file_upload (exfiltration surface) |
| scrapling | scrapling 0.4.10 venv bridge (`~/scrapling-env`, camoufox v152.0.4-beta.27, StealthyFetcher live-verified) | 10 | strategy | — |

Corpus: **69 pinned tools across 5 live servers** (was 21 across 1). Live-call proof per
server recorded in roadmap row R4.3 evidence.

## 4. Per-department target arsenal

Current = §3. **Target** = what the department SHOULD hold when its activation wave fires;
additions land through the §9 per-install checklist, never silently. Sources: R4.2
need-matrix (`.planning/research/R4.2-LIBRARY-GAP-MATRIX.md` §6), 75 study cards, audit F-07.

| Department | Today | Target additions (trigger) |
|---|---|---|
| engineering | house bus + git(read) + context7 + playwright | github PAT hand (§7, when CEO hands secret); git WRITE class (when holding-owned product repos get their write policy); sentry-class error lane (free tier, Phase-10 eng wave) |
| quality | house bus + playwright | — (browser QA hand delivered; test SOP rows are library intake G-list, not tools) |
| strategy | house bus + scrapling | context7 docs lane (research citations, Phase-10 strategy wave) |
| design | house bus | stitch (§7 credential hand); playwright (visual QA, Phase-10 design wave) |
| marketing / social-media | house bus | playwright + scrapling READ hands (content research, Phase-10 waves; posting APIs are outward = approval-gated credential hands per platform) |
| sales / revops / customer-success | house bus | crm growth tools (§9); no external hands until Phase-10 activation defines outward channels |
| commerce | house bus | WooCommerce toolset — **Phase-11 LOCKED** (R6.1: read lanes first, write paths behind approval engine) |
| finance | house bus | stripe/revolut/wise — **Phase-11 LOCKED** (R6.1) |
| legal | house bus | docusign — **Phase-11 LOCKED** (R6.1) |
| paid-media | house bus | ad-platform hands are SPEND hands = Phase-11 class + hard budget gates (claude-ads card R4.1) |
| data-ai | house bus | supabase-mcp read lane (free, self-hosted — Phase-10 data wave); memory_source canonical refs first (G-6) |
| people-hr, platform, ceo, product, project-management, risk-audit, security | house bus | platform is custodian of all arsenal records; security owns runbooks intake (G-5); no external hands needed until their waves |

## 5. Free tranche — installed this wave (R4.3 deliverable (b))

All four: catalog entry + `tool_pins` schema-hash + library `mcp` item + department grant +
SkillSpector scan archived + live tools/call proof. Details in §3. Install quality bar per
CEO: *"en mükemmel şekilde"* — each hand answered a REAL call before being called done.

## 5b. Skill hands — installed as skills, not as MCP servers (opened 2026-08-27)

A capability that arrives as a Claude Code **skill** is not a server: it declares no tools, takes
no grant, and carries no schema hash, so §3's pin table cannot hold it. It is still third-party
code entering the machine, so INTEG-01 binds it in full — study card, SkillSpector scan archived,
findings triaged at source, and a live end-to-end proof before it is called installed. Two further
rules apply to this class and only to this class:

1. **PLUGINS ARE OPEN — his live order of 2026-08-27 replaces the order of 2026-08-09, and the
   old sentence is deleted rather than kept beside it (LAW A).** What stood here — *"the CEO's
   order of 2026-08-09 leaves every plugin disabled except claude-mem and context7… the
   marketplace/plugin route is not used"* — is spent. **His words:** *"eklentiler açılsın.
   eklentiler holding OS sisteminde açık olacak çalışanlar istedikleri zaman gerekli olanı ve en
   iyi olanı ölçüp çağıracak tembellik etmeden."* Executed the same hour: **18 of 18 enabled**
   (`claude plugin enable … -s user`, verified `enabledPlugins` → AÇIK 18 · KAPALI 0). The
   measurement that made it safe: an enabled plugin costs only its skills' one-line descriptions
   — **~10,743 tok for all eighteen together**, skill bodies load on invoke, MCP tool schemas are
   resolved at runtime and hooks carry no model-context cost of their own.
   **What is still true, and is now the ONLY reason to prefer a skill:** a skill cannot install a
   HOOK that runs by itself, and cannot mount an MCP server. A plugin can do both. So a capability
   that only carries a written procedure is still installed as a skill under `~/.claude/skills/`;
   a plugin is opened deliberately, knowing its hooks come with it, and **its SessionStart /
   UserPromptSubmit hooks are measured before it is enabled** — that hook output, not the plugin,
   is what actually crowds a session. Measured 2026-08-27: `superpowers` injects **3,530 bytes**
   of instruction text at every session start, which re-establishes the Standing Order 11 he
   DELETED on 2026-08-10 (*"sil"*). Named to him in the same report; his call, not the author's.
2. **The holding keeps its own copy.** The skill is vendored under `tools/<slug>/`, pinned to an
   upstream commit, and INSTALLED FROM that copy by the slug's own `install.sh`, which proves by
   sha256 that the installed tree is byte-identical to the repository's. Upstream can vanish or
   change; the holding's copy does not. Adaptations for our boundaries are made in our copy and
   commented there (doctrine D6: scan AND adapt).

| Skill | Pinned | Vendored | Scan | Live proof | Money |
|---|---|---|---|---|---|
| **scrollcraft** — outward-facing scroll-driven websites for the holding's own companies and for client work | upstream `e957985` (2026-08-23), MIT | `tools/scrollcraft/` → `bash tools/scrollcraft/install.sh` | `.planning/research/skillspector/scrollcraft-e957985.txt` — CRITICAL headline, 15 issues, every one triaged at source in the study card; one REAL finding fixed in our copy (the `.env` walk) | 2026-08-27 proof build: page served, 47 frames shot, `no dead scroll detected`, contact sheet read by eye | free. `kie.ai` image generation is the only paid path and is shut: no key is set, and house rule 2 in our copy of `SKILL.md` puts every generation call behind a registered CEO approval |

Card: `.planning/research/study-cards/scrollcraft.md`. Build workspace `var/scrollcraft/`
(gitignored, outside the pnpm workspace globs), resolved through the repo-root `.scrollcraft.json`.

## 6. Ghost-server dispositions (audit F-07 closure; was: 9 declared, 8 uncatalogued)

| Declared server | Disposition (named, CEO-visible) |
|---|---|
| dxb-mcp | LIVE (house bus) |
| git | **INSTALLED 2026-07-18** (read set; write class deferred to product-repo policy) |
| context7 | **INSTALLED 2026-07-18** |
| github | **CREDENTIAL TRANCHE §7** — waits for CEO-handed PAT; grant already scoped to engineering |
| stitch | **CREDENTIAL TRANCHE §7** — Google auth; design dept; re-study at design wave |
| stripe | **PHASE-11 LOCKED** → roadmap R6.1 (money-touching) |
| revolut | **PHASE-11 LOCKED** → R6.1 |
| wise | **PHASE-11 LOCKED** → R6.1 |
| docusign | **PHASE-11 LOCKED** → R6.1 (contract-touching) |

Plus two servers ADDED this wave without prior declaration: playwright, scrapling (§3).
**kurulumsuz-blind = 0 verified:** every `pendingInstall` name in the compiled manifests
appears above with a disposition.

## 7. Credential tranche (deliverable (c)) — named, waiting on the CEO's hand

| Hand | Secret needed | Scope when live | Rule |
|---|---|---|---|
| github | Personal Access Token (fine-grained, least-scope: repo read + PR) | engineering | CEO creates + hands the token personally; vault/.env only; never typed into chat/prompt; rotation on schedule (security runbook G-5) |
| stitch | Google account auth | design | same handling; re-verify tool surface at install (hash-pin) |

No credential is requested from the CEO until the consuming wave actually fires
(dual-role principle: install at the START of the phase that uses it).

## 8. PAID PROPOSAL BENCH (deliverable (c2) — CEO ruling verbatim above)

**Rule:** rows below are STUDIED and PRICED but NEVER installed, keyed, or paid. Each has a
trigger; when the trigger fires AND profit funds it, it surfaces to the CEO as a proposal
with cost projection. Free-first alternatives noted — the bench never replaces a free hand
that suffices.

| Bench tool | Price class (studied) | Would serve | Trigger for proposal | Free alternative today |
|---|---|---|---|---|
| Apify actors | usage-based, ~$49/mo starter | marketing/strategy scraping at scale | scrapling volume ceiling measured (blocked targets, >10k pages/mo) | scrapling + camoufox |
| Composio tool cloud | free tier → $99/mo team | many SaaS integrations in one hand | ≥3 SaaS integrations needed simultaneously in Phase-10 | per-service free MCPs |
| HeyGen | ~$24–72/mo | social-media video avatars | social wave ships + video content contract signed | none (defer content type) |
| Seedance 2.5 / z-image gen | per-generation credits | design/marketing visuals | paying client work requires gen assets | design dept manual + free tiers |
| Gemini omni-video API | per-minute API cost | video analysis lanes | a revenue task needs video understanding | yt-dlp + frame sampling (free, slower) |
| LiteLLM paid models via API | per-token | worker model diversity | subscription tiers saturated (cost monitor data) | subscription models (current) |
| **SocialForge** (open-source engine, PAID PROVIDERS) | engine MIT/free; its providers are not — **Vertex AI Nano Banana Pro** (images) + **WaveSpeed Kling v3.0 Pro** (video), both usage-priced | the social-media department's whole production line: brief → per-platform copy (7 platforms) → asset-first imagery → review gallery → approval ledger → delivery audit, with C2PA AI-disclosure signing for EU markets | **the agency seat (B28) takes its first brand client** — the line is what delivers the month | the engine itself is free and installs on Claude Code; **the image half is already replaced** by the CEO's Google AI Pro subscription through Antigravity at $0.00 (B31, measured 2026-08-26), so only the video provider is genuinely paid |

Bench maintenance: at every phase gate, rows re-checked — price drift updates the row;
a fired trigger produces a CEO proposal, never an install.

The SocialForge row was placed here by the CEO, 2026-08-26 — *"ücretliler başlığının altında"*. <!-- CEO-OK: gemini-subscription-connected-antigravity-2026-08-26 --> Studied, not installed. Card: `.planning/research/study-cards/socialforge.md`.

## 9. dxb-mcp internal growth list (deliverable (e))

The house bus is deliberately minimal today. Measured need list (owning spec decides the
design; this list only registers the need — no silent tool additions):

| Group | Today | Needed (source) |
|---|---|---|
| crm | 1 tool (`crm_get`) | lead upsert, interaction log, pipeline view — **sales wave prerequisite** (need-matrix G-1: "crm_get is the ONLY crm tool"); write tools ride the approval-class model (CRM_SPEC / E12.4 idiom) |
| queue | 6 | sufficient (audit F-02/F-03 closed) |
| memory | 2 | memory write door stays single (MEMORY_ARCHITECTURE); no growth until quarantine tier ships |
| dashboard | 1 | widget/data tools follow E12.x as specs demand |
| hr | 0 (registry carries org) | HR factory tools when HR_OS activation wave fires |

Per-install checklist (every future hand, no exceptions): study card → SkillSpector scan
(third-party) → catalog entry → `pin-arsenal.mjs` (pins) → library item + grants (control
fn) → recompile verify → `probe-arsenal.mjs` live call → roadmap/evidence row.

## 10. Placement notes

- X230 = control terminal; the 24/7 home is the EU VPS (Phase 7 deploy). At VPS placement:
  re-provision `~/scrapling-env` (venv is host-local), re-run `pin-arsenal.mjs` (hashes must
  match or quarantine fires — that is the design working), install playwright browsers only
  where a consumer runs (study-card note), and update the scrapling catalog path in
  `grants.json` (its `_schema` carries the reminder).
- RAM budget: browser hands (playwright, scrapling stealth) are the heavy class — VPS 8GB
  plan already accounts for one browser at a time (STACK.md); never grant browser hands to
  departments without a measured need.
