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
   is what actually crowds a session. Measured 2026-08-27: `superpowers` injected **3,530 bytes**
   of instruction text at every session start, re-establishing the Standing Order 11 he DELETED on
   2026-08-10 (*"sil"*). Named to him in the same report — **and he ruled on it within the hour.**

1-ter. **THE METHODOLOGY CLASS IS OUT OF THIS HOLDING — CEO order, 2026-08-27.** His words:
   *"superpowers, gsd, ruflo, gstack vb pluginler holdingimize girmeyecek kaldırılabilir research
   alanından da silinsin."* Executed the same hour and measured: `superpowers` and `ruflo`
   uninstalled with their marketplaces removed from the machine (folders gone,
   `known_marketplaces` **13 → 11**), GSD and gstack already off disk, and the four study cards
   deleted from `.planning/research/study-cards/`. `INTEGRATION-TRACKER.md` keeps **one** line
   naming the exclusion so no future session studies them again. Nothing in the running system
   depended on them — measured: **0 references** across `*.ts`, `*.mjs`, `*.sh`.

   **The class this excludes, so the rule can be applied and not just obeyed:** a plugin whose
   product is a WAY OF WORKING — a method, a discipline, a set of gates it imposes on the session
   author. This holding already has its own: the always-on core, the eight `dxb-*` doors, the
   standing orders and the record gates. A second methodology on top of them does not add rigour,
   it adds a competing voice. **A capability that does a JOB — reads the web, drives a browser,
   builds a page, reads a document — is judged on its own merits and is not touched by this rule.**

1-quater. **CODEX: THE PLUGIN IS OFF, THE COUNCIL IS UNTOUCHED — CEO order, 2026-08-27.** His
   words: *"codex eklentisinin kancasına gerek yok her oturumda aktif olmalı değil. ama holding
   tarafında mimari nasıl kurulduysa öyle kalsın."* The plugin is **disabled** (not uninstalled),
   so its `SessionStart` hook no longer runs in a construction session. **The holding's adversarial
   council is unaffected and was verified the same minute:** `packages/orchestrator/src/critical-gate.ts`
   spawns the `codex` **binary** directly (`~/.local/bin/codex`, `codex-cli 0.149.1`, subscription
   lane via `~/.codex/auth.json`), and the audit-twin door runs `codex exec -s read-only`. Neither
   path goes through the plugin. Nothing about the U36 audit twin changes.

1-quinquies. **claude-mem MAY FEED THE HOLDING'S OWN BRAIN — CEO permission, 2026-08-27, not an
   instruction.** His words: *"claude-mem holdingin hafıza kararında da kullanılabilir içindeki
   sistemden faydalanılacak şeyler varsa alınabilir tabi bu artık planı mimariyi ve kodu yazacak
   olan Opus 5'lere bağlı."* The holding's memory is still the one he approved on 2026-08-01 —
   ONE brain with three abilities, **written by us** — and claude-mem is now an allowed SOURCE OF
   PARTS AND IDEAS for it, at the architect's judgement. It does not become the holding's memory,
   and this permission grants no install anywhere near the company.
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
| media | **5 (`media_submit` · `media_status` · `media_wait` · `media_probe` · `media_cancel`) — added 2026-09-03, B43, on the CEO's approved plan (ceo-approvals.json `studio-hands-build-plan-approved-2026-09-03`)** | the studio's HANDS: an expert births a `media_jobs` row (still · shoot · upscale · assemble · probe — and `voice`, which is edge-tts and CANCELLED for production by `tts-cancelled-engine-voice-only-2026-09-04`: the engine's own voice is the voice; the kind was still callable in code for eleven days after that ruling — **removed 2026-09-15 on his word "kaldır"**, W7 <!-- CEO-OK: w7-voice-hand-removed-2026-09-15 -->: it is gone from the job book's CHECK on both engines, from `media_submit` and from the lane; a seat can no longer ask. A film's voice is the take's own — the spoken lines ride in the `shoot` prompt. The five historical voice rows stay, and W12 owns their removal), the resident scheduler runs it as LANES — one GPU lane and three CPU lanes, each its own loop (A18, `hands-lanes-plan-approved-2026-09-05`; `DXB_MEDIA_CPU_LANES=0` rolls back to one) — a GPU job under a 26 GiB scope (the 2026-09-03 "one at a time" corrected 2026-09-15, W4, audit F008), `media_wait` renews the task lease while it waits, `media_probe` puts frames into the expert's own eye. Granted to `media-studio` through the library (item `mcp/dxb-mcp/media`, migrations 20260903190000/191000) and, since 2026-09-15 (W9, CEO "onay" <!-- CEO-OK: w9-assigned-seats-plan-approved-2026-09-15 -->), to the department's TWO ASSIGNED seats as `grantee_kind='employee'` — `design-image-prompt-engineer` and `marketing-short-video-editing-coach`, who belong to design and marketing and serve studio seats (`agent_assignments`, migration 20260915002000). Measured after the compile: each of the two overlays is its HOME kit plus exactly these five tools (23 → 28, nothing else added, nothing removed), and `design.mcp.json` / `marketing.mcp.json` still emit 0 `media_*` — nobody else in either department gained a hand. No paid hand rides here. |

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

## 11. VIDEO AND IMAGE ENGINES — the studio's own drawer (opened 2026-09-01)

Board **B43** owes the CEO a table with **both roads in the same row — the free way with its true
cost, and the paid way with its price.** This is the ENGINE drawer for the media engines — per engine, in English — and every free
number below was measured on DXB-Center (RTX 5060 Ti, 16,311 MiB), not read off a website. **It is NOT the table he asked to read:** the per-job-type table carrying both roads (feasibility and true cost of the free way, feasibility and price of the paid way) is a CEO-facing artefact still owed and on no leg yet (audit F036; a planning item, W14). Rows below corrected 2026-09-15 (W4, audit F008) to his September rulings; the 2026-09-03 wording is quoted where it was replaced.

| Engine | Where it runs | What it is for | Measured cost here | Paid alternative |
|---|---|---|---|---|
| **MiniMax H3** (FL2VA + REF2VA) | our card, ComfyUI | video with native sound; the road comes from the BRIEF — text-to-video the default, image-to-video open (`road-comes-from-the-brief-t2v-default-2026-09-04`); FL2VA and REF2VA are the engine's two checkpoints, not a rule (the 2026-09-03 "REF2VA for people, FL2VA for products" superseded); on this station no drawn still is handed in, faces are born in the engine (`flux-local-engine-only-everything-made-here-2026-09-14`) | 15.08 s shot at 1152×640 = **620 s** card time · **$0.00** | MiniMax API; Veo 3.1 at $0.40/$0.12/$0.08 per second (§8) |
| **FLUX.1-Krea-dev** | our card, ComfyUI | stills, panels and first frames made HERE for an EXTERNAL engine's take only — no part in a take the local engine shoots (`flux-local-engine-only-everything-made-here-2026-09-14`; the 2026-09-03 "hero frames and reference sets — B43 step ③" superseded); it drew the 2026-09-01/02 presenters, four of them retired 2026-09-13 | 1152×640, 28 steps = **25.5 s** · **$0.00** | ChatGPT Image (held, Plus) · Nano Banana 2 Lite $0.0336/image (§8) |
| **ComfyUI** | our card | the bench both of the above run inside | — | — |
| **RealESRGAN ×4** (Vulkan) | our card | the 2026-09-01 enlarger — SUPERSEDED by SeedVR2 (below) as the studio's enlarger on 2026-09-03; kept for its measured figure; any enlargement only after his eye accepts the native draft, on his word (LAW D) | **2.09 s per frame** — 428 frames = 893 s | any paid upscaler |
| **edge-tts** | processor only | **CANCELLED 2026-09-04** — the engine's own voice is the voice, measured by WER against the script (`tts-cancelled-engine-voice-only-2026-09-04`); the 2026-09-03 role "the spoken line in a talking advertisement" is history; the hand's `voice` kind still exists in code (W7); not in STACK.md | seconds, **$0.00** (unused) | — (no paid voice either: no recorded, cloned or synthesised voice) |
| **FFmpeg** | processor only | cut, grade, type, sound, delivery | free, no card | DaVinci / Remotion |
| **SeedVR2** (3B / 7B-sharp INT8, ComfyUI 0.34 native nodes) | our card, a second ComfyUI on :8189 started per job | enlargement to delivery size with temporal consistency (the Topaz-equivalent chosen 2026-09-03, study card `seedvr2-topaz-equivalent.md`) | 3B → 1080-class: **4.1–4.25 s per frame** at 15.8 GB peak, 5-frame chunks (2026-09-03, 640×1152 clips); 3B → 2K **7.5 s per frame**; 7B-sharp → 2K **5.64 s per frame** — faster than 3B at 2K and faithful to the face where 3B redraws it (2026-09-03, B43 amendment (j), `/home/dxb/tools/h3/upscale/results/`) · **$0.00** | Topaz Video (no Linux build) |

**LAW D — draft first, upscale last (CEO 2026-09-03 21:47, his word *"BU KANUN OLSUN"*; registered `law-d-draft-first-upscale-last-2026-09-03`).** Every production is made and judged at the engine's native draft resolution (the 768-class frame: 640×1152 vertical, 864×480 horizontal on this station) and nothing is upscaled before the CEO has accepted the draft. SeedVR2 — and any enlarger after it — is a finishing step on accepted work only. Measured the minute it was made: a draft film (since deleted — CEO 2026-09-05) was in its upscale phase at 7B/1080 (one shot done, 322.6 s, 4.199 s per frame); the remaining three were cancelled and the film cut at native resolution.

**Since 2026-09-03 this drawer is CALLABLE by the studio's own employees, not only by a session at a terminal:** the dxb-mcp `media` group (§9) is the one door — `media_submit` writes the job book, the resident media lane runs the driver above (`tools/h3/run.py`, `img.py`, `upscale/seedvr2_graph.py`, edge-tts, ffmpeg) and writes wall clock, peak VRAM/RAM and the output path back on the row. Two station facts are built into the lane because they were measured the same day: every GPU job runs in its own transient systemd scope (`MemoryMax=26G`, `MemorySwapMax=8G`) after a bench started from an interactive shell died at a 16 GiB scope, and the lane refuses to start a GPU job while the card holds >3 GB, the RAM has <12 GiB available or the swap is <25 % free, after a 1440p run drove the machine to earlyoom at 18:05.

**Three numbers from the same day that decide the economics, and they are not in any vendor table:**

- **A finished second costs 2–5 minutes of this machine**, drawing and post included.
- **Cutting costs card time.** One continuous shot = **41.1 s of card per finished second**; the
  same footage as eight shots = **56.4 s, +37 %**. Every cut restarts the engine, so a shot list is
  a financial decision here, not only a creative one.
- **Post is NOT free of the card on this station.** The ×4 enlargement runs on the same GPU and was
  **37 %** of one film's whole clock. Any plan that says "steps 6-9 need no card" is wrong here.

**The standing ban on one supplier is now actually satisfied for the image step.** Until 2026-09-01
every storyboard photograph came from an outside service, and on that day its daily quota stopped
production dead at 12:29. The local lane removes that single point of failure. Cards:
`study-cards/minimax-h3.md` · `study-cards/flux-krea-dev.md` · `study-cards/comfyui.md`.
