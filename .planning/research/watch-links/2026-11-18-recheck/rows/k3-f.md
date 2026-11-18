# Rows k3-19, k3-20 — second reading (tab "Kasım 3-4 web linkleri")

Repository facts below were read with `gh api` on 2026-11-18 (stars, last push, licence, README). READMEs saved under
`$J/rows/k3-f-src/`. Neither rid is in `$J/twins.tsv`; three items of k3-19 were nevertheless already placed on
2026-11-17 through row w098 of the 24 Sep - 16 Nov tab, and that is said where it applies.

## k3-19 (d09) — an Instagram carousel listing ten GitHub repos ("10 GitHub repos so good they shouldn't be free")

- **Opened:** `$J/old/k3-19.json`; slides `.planning/quick/20261103-web-ders/carousel/d09/slide01,02,05,06,07,08,09,11.png`
  viewed as images (cover, #1 AutoHedge, #4 LibreChat, #5 Open Higgsfield, #6 Open LLM VTuber, #7 Claude Ads, #8 Agentic
  Inbox, #10 Hyperframes). Slides 03, 04 and 10 (#2 Vibe-Trading, #3 FinceptTerminal, #9 Camofox) were not viewed as images;
  their names come from the old row and were confirmed at the repositories. `gh api repos/…` for all ten; READMEs read for
  claude-ads, LibreChat, Open-Generative-AI, Open-LLM-VTuber, agentic-inbox. Earlier readers: `reader-opus.md:13,33,93`,
  `reader-fable.md:26,46,51`, `MERGE.md:18`, `tracks/7-aletler.md:179`, `tracks/4-reklam-olcum.md:16,186,236`. Board files
  read: B28.md:53-90, B43.md:170-213, B30.md:34-57, B83.md:67-76, B12.md:1-40. No video involved.
- **His note:** none.
- **What is in it** (one slide per repo, a slogan each; caption "Comment SEND"):
  1. AutoHedge — github.com/The-Swarm-Corporation/AutoHedge — four agents that research, risk-check and execute trades.
     6,712★, last push 2026-05-11, MIT.
  2. Vibe-Trading — github.com/HKUDS/Vibe-Trading — a personal trading agent. 38,471★, 2026-11-18, MIT.
  3. FinceptTerminal — github.com/Fincept-Corporation/FinceptTerminal — a market-analytics and investment-research
     terminal. 33,947★, 2026-11-18, AGPL-3.0.
  4. LibreChat — github.com/LibreChat-AI/LibreChat (moved from danny-avila) — self-hosted multi-model chat app: agents, MCP,
     skills, artifacts, multi-user auth. 47,307★, 2026-11-17, MIT.
  5. "Open Higgsfield AI" — github.com/Anil-matcha/Open-Generative-AI — image/video studio UI over MuAPI models plus local
     engines; README now says 800+ models and "no content filters". 35,224★, 2026-11-17, MIT.
  6. Open-LLM-VTuber — github.com/Open-LLM-VTuber/Open-LLM-VTuber — offline voice companion with a Live2D avatar; voice
     interruption without headphones (it does not hear itself), screen/camera sight, proactive speaking, many ASR/TTS/LLM
     back-ends. 14,757★, last push 2026-05-15, own licence (API: NOASSERTION); README announces a v2.0 rewrite in planning.
  7. Claude Ads — github.com/AgriciDaniel/claude-ads — ad-account audit skill for 12 platforms from an export. 11,125★, last
     push 2026-11-01, release v2.1.0 (2026-10-16), MIT. The slide's "one Ads Health Score" and "190 checks" are outdated:
     README lines 98, 223, 308 say every health-scoring profile is disabled; account changes stay drafts unless a full
     mutation gate passes (README:227, 288).
  8. Agentic Inbox — github.com/cloudflare/agentic-inbox — a self-hosted mail client on Cloudflare Workers (Email Routing in,
     Email Service out, one Durable Object + R2 per mailbox) with an agent side panel of 9 mail tools, a system prompt per
     mailbox, and auto-drafted replies that are never sent without explicit confirmation; agent model Workers AI
     `kimi-k2.5`; Cloudflare Access required in production. 8,791★, last push 2026-04-23, Apache-2.0.
  9. Camofox Browser — github.com/jo-inc/camofox-browser. 12,361★, 2026-11-10, MIT.
  10. Hyperframes — github.com/heygen-com/hyperframes — HTML → MP4. 86,197★, 2026-11-18, Apache-2.0.
- **What we have:**
  - Camofox: **identical, installed** at `~/tools/camofox-browser` (+ `~/tools/camofox-cli`, `~/.local/bin/camofox`),
    recorded at B30.md:34-49. Eliminated.
  - Hyperframes: **identical, installed** — it is the render engine of the global skill `dxb-motion-graphics`
    (`~/.claude/skills/dxb-motion-graphics/SKILL.md:8`, version guard `mg hf status|update`, SKILL.md:159); B43.md:210 says
    "HyperFrames is our engine". Eliminated. (The old row still called it a candidate.)
  - Claude Ads: not installed; already placed at **B28.md:53-64** (2026-11-17, row w098): what it is, the export-only audit,
    recipe, trial, its disabled scores, paid twins Ad-Superpowers and Adspirer. The placement is correct against today's README.
  - Open-Generative-AI: not installed; already placed at **B43.md:175** (2026-11-17, row w098) with its trial beside ComfyUI
    and MuAPI White Label as a revenue candidate. Nothing to add.
  - LibreChat: not found as a tool. Our counterpart for "one chat with every model" is the dashboard + Hamza and B08's
    per-employee brain switch.
  - Open-LLM-VTuber: not found. Voice stack is B12's (Speaches/faster-whisper/Kokoro, Voice Studio); `grep -i
    "interrupt|barge|echo"` over B12.md and B03.md finds nothing — talking over Hamza is not written anywhere.
  - Agentic Inbox: not found. Counterparts: B83.md:71 Chatwoot (the desk's omnichannel inbox, "Dene"); B05 (Gmail send);
    `~/.hermes/skills/email/email-inbox-triage` (Hermes skill v0.1.0, "draft replies safely") on disk.
  - AutoHedge, Vibe-Trading, FinceptTerminal: not found.
- **What it has that we do not:**
  - Open-LLM-VTuber: the barge-in technique (the user interrupts the spoken answer without headphones, with self-echo
    suppressed) — B12 has no line for it. Its code was not read past the README; which VAD/AEC it uses is unknown.
  - Agentic Inbox: a mailbox-per-domain mail client that costs no server of ours (Workers), with auto-draft + confirm. Chatwoot
    is heavier (rails, sidekiq, Postgres, Redis, 4 GB RAM — B83.md:71) and is the chat/WhatsApp desk; this is mail only.
  - LibreChat: nothing for the machine. One road it could carry, the reader's inference, not the post's: "a private,
    company-owned AI chat installed and run for a client" sold beside care and hosting — the same shape B84.md:231 already
    wrote for OpenProject.
  - claude-ads placement lacks only the paid twins the 3 Nov readers named (Optmyzr, Adalysis — `4-reklam-olcum.md:186`;
    Madgicx — `7-aletler.md:179`), prices not read.
- **Board:**
  - Agentic Inbox · **B83** (the inbox leg, B83.md:71) · there now: Chatwoot community edition · **second** (for the e-mail
    channel only) · each of the holding's own domains (its 25-30 sites, B84.md:75) gets `hello@`-type mailboxes whose inbound
    mail is drafted by an agent and confirmed before sending · first trial: deployed on one test domain, 20 real-shaped
    inbound mails, the same mails through Chatwoot's mail inbox; measured: draft quality read by the lead, setup minutes,
    monthly cost · stops at CEO: a Cloudflare account (identity) and a domain (money out); outbound routine mail does not.
    Note for the lead: its agent runs on Workers AI inside Cloudflare — a boxed product like Chatwoot/OpenSEO, not our engine.
  - Open-LLM-VTuber · **B12** · there now: nothing for interruption · **method** · its interruption path read and, if sound,
    written into B12's voice line (the CEO speaks over Hamza, Hamza stops) · first trial: read the repo's VAD/interrupt code;
    then on the bench, Hamza speaking through the room speaker while the CEO says "dur" — does it stop, how fast, does it hear
    itself · stops at CEO: nothing (his ear closes B12 anyway).
  - LibreChat · **no row**; nearest **B83** (revenue lines; the H5 web office's monthly packages, B84 decision 8) · there
    now: nothing · **new** (a revenue road, not a tool for us) · installed per client with the client's own keys, run as a
    monthly service · first trial: none until the road is weighed — measure demand first (Araştır) · stops at CEO: opening a
    new line is his word; a client contract.
  - claude-ads · **B28** (B28.md:53-64) · already placed · nothing to change but the two-three paid twins above.
  - AutoHedge, Vibe-Trading, FinceptTerminal: forbidden subject (financial trading / stock markets) — named, not explored.
- **The old verdict and reason:** partly — "Kur, only claude-ads" was right that claude-ads was the strongest piece, but
  Hyperframes was already our engine (not a candidate), camofox has since been installed on his word, claude-ads is now placed
  (not installed) at B28, and LibreChat, Open-LLM-VTuber and Agentic Inbox were dismissed without their READMEs being read.
- **Reader's first reading:** Araştır — nothing new to install from this row; its strong items are already installed
  (camofox, HyperFrames) or placed (claude-ads B28, Open-Generative-AI B43); Agentic Inbox İkinci at B83, Open-LLM-VTuber's
  interruption Araştır for B12, LibreChat Araştır as a revenue road.

## k3-20 (d10) — an Instagram carousel "21 things to install in Claude": 7 plugins, 7 skills, 7 MCP servers

- **Opened:** `$J/old/k3-20.json`; all five slides `carousel/d10/slide01-05.png` viewed as images (the caption: "Comment
  List" for the full list). `$J/src/k3-20.txt` also lists ~240 files under another session's `audit.5X7wbs/.../d10/` — they
  are generated test files of an unrelated job that share the folder name "d10", not this post; not used. `gh api` for every
  named repo; READMEs read for marketingskills, claude-seo, claude-for-legal, financial-services, alirezarezvani/claude-skills
  (+ its `engineering/agent-run-forensics/README.md`), repomix, caveman, humanizer, social-media-skills, ai-second-brain,
  agent-browser, zapier/mcp, notion-mcp-server, perplexity MCP. The three repos the slides name without an owner were
  searched (`gh api search/repositories`). Board files read: B84.md (whole), B28.md:53-90, B41.md:16-60, B30.md:34-57,
  B51.md headings; LITERATURE.md:13-46; study card humanizer.md; `~/.hermes/skills`.
- **His note:** none.
- **What is in it** (stars as printed on the slides are stale and inconsistent — claude-ads 21.4k on slide 1, 59.2k on slide
  5, real 11.1k):
  - Plugins
    1. marketingskills — github.com/coreyhaines31/marketingskills — 54 marketing skills (CRO, copywriting, copy-editing, SEO
       audit, ai-seo, schema, programmatic SEO, site architecture, ads, ad-creative, ab-testing, analytics, conversion
       tracking, emails, cold-email, prospecting, offers, pricing, launch, PR, social, video …); every skill first reads one
       shared `product-marketing.md` context file; 54 `evals.json` files in the tree. 61,113★, 2026-11-18, MIT. Funded by
       "Verified Partners" (Converly, Ploy, AIsa, Omnia, Livestorm) listed beside neutral options.
    2. claude-for-legal — github.com/anthropics/claude-for-legal — Anthropic's legal plugins: ~50 named agents (Vendor
       Agreement Reviewer, NDA Triager, Renewal Watcher, DPA Reviewer, Marketing Claims Checker, Trademark Clearance, OSS
       Compliance, AI-use triage …), a cold-start interview that writes a practice profile every skill reads. 10,034★,
       2026-11-16, Apache-2.0. Every output is a draft for attorney review.
    3. claude-skills — most likely github.com/alirezarezvani/claude-skills (the slide names no owner; "263+ skills, 5.2k★"
       matches its size in June) — now 428 skills in role bundles (engineering, marketing, product, C-level, compliance,
       finance), 824 stdlib Python scripts. 30,032★, 2026-11-17, MIT. Notable inside: `agent-run-forensics` (checks an
       agent's completion claims against the Claude Code transcript: SUPPORTED / STALE — edited after the green run /
       PARTIAL — exit 0 of a pipe's last command / CONTRADICTED; read-only, no network, secrets redacted), `skill-retro`,
       `human-gate`, `i18n-localization`.
    4. financial-services — github.com/anthropics/financial-services — investment banking, equity research, private equity,
       wealth management agents (Pitch Agent, Model Builder DCF/LBO, KYC …) plus fund-admin agents (GL Reconciler, Month-End
       Closer). 41,376★, 2026-11-12, Apache-2.0.
    5. superpowers and 6. gstack — excluded by his order of 2026-08-27 (LITERATURE.md:13: "holdingimize girmeyecek…"); not
       evaluated, as that order stands.
    7. repomix — github.com/yamadashy/repomix — packs a repository (local or `--remote owner/repo`) into one AI-ready file;
       token counts, Secretlint secret exclusion, `--compress` (Tree-sitter keeps signatures/structure). 29,310★, 2026-11-18,
       MIT.
  - Skills
    1. claude-ads — see k3-19 (placed at B28.md:53-64).
    2. caveman — github.com/JuliusBrussee/caveman — now six "rocks": short answers, tool-output shrinking (33.2 % fewer input
       tokens, its own synthetic test), Auto model/effort picker, code-mode Blocks, cache-warm fixes, compressed browsing.
       121,159★, v4.1.0 2026-11-08, Apache-2.0.
    3. humanizer — github.com/blader/humanizer — removes 26 patterns of AI writing (built on Wikipedia's "Signs of AI
       writing"); says it edits for readers, not to beat detectors. 70,547★, v4.0.0 2026-11-10, MIT.
    4. social-media-skills — most likely github.com/charlie947/social-media-skills (Charlie Hills; the same author's
       ai-second-brain is item 6) — 17 skills: `voice-builder` (an interview + 3-5 writing samples → `about-me.md` and
       `voice.md` that every other skill reads), post-writer, post-scorer, hook-generator (6 angles from supplied facts),
       content-matrix (pillars × 8 formats), niche-research (≤20 dated stories of the last 7 days with source coverage),
       reels-scripting (a reference Reel analysed through Apify + Gemini 2.5 Flash), carousel/infographic prompts, a LinkedIn
       analytics dashboard. 4,729★, last push 2026-10-18, MIT. LinkedIn-centred.
    5. claude-seo — github.com/AgriciDaniel/claude-seo — 29 sub-skills and 20 agents (technical, content/E-E-A-T, schema,
       sitemap, GEO, agentic readiness, local, maps, backlinks, hreflang, programmatic, Shopify, e-commerce, `seo-drift`:
       baseline → compare → history of a page's SEO-critical elements after a deploy), Markdown/PDF/JSON reports, optional
       DataForSEO and other paid-data extensions. 30,499★, 2026-11-16, MIT. A paid Skool tier exists beside the MIT release.
    6. ai-second-brain — most likely github.com/charlie947/ai-second-brain — a guided Karpathy-style LLM wiki from one's
       ChatGPT/Claude exports into Obsidian, plus iMessage access (Mac). 244★, 2026-10-24, MIT.
    7. frontend-design — Anthropic's plugin.
  - MCP servers
    1. instagram-mcp — owner not named; `gh` search finds only small unrelated servers (trypeggy/instagram_dm_mcp 191★,
       adelaidasofia/instagram-mcp 18★ …). Unidentified.
    2. google-drive — Claude's own connector. 3. perplexity — github.com/perplexityai/modelcontextprotocol, the official
       server for the paid Perplexity API (2,638★, 2026-10-21, MIT). 4. zapier — github.com/zapier/mcp, the hosted Zapier MCP
       (460★). 5. agent-browser — github.com/vercel-labs/agent-browser — Rust CLI; a page read as an accessibility tree with
       `@e1` refs, act on a ref, a click fails instead of lying when the target is covered; ships skills matched to its
       version; Chrome for Testing or attach to a running Chrome over CDP. 52,487★, 2026-11-18, Apache-2.0. 6. slack — no
       owner named. 7. notion — github.com/makenotion/notion-mcp-server (4,714★, 2026-10-29, MIT).
- **What we have:**
  - caveman: **identical, installed** — plugin `~/.claude/plugins/cache/caveman/caveman/4.0.1` (disabled per
    `$J/context.md`; upstream is 4.1.0). Eliminated. (LITERATURE.md:14 still says "KURULU … aktif her session" — the plugin
    list says disabled; a record conflict for the lead, not a reason to re-judge.)
  - frontend-design: **identical, installed** — `~/.claude/plugins/cache/claude-plugins-official/frontend-design`
    (disabled). Eliminated.
  - google-drive: the Claude account's `google-workspace` skill is synced at
    `~/.claude/skills/synced/*/google-workspace/SKILL.md`; same product. Eliminated.
  - superpowers, gstack: excluded by his order (LITERATURE.md:13).
  - claude-ads: placed at B28.md:53-64.
  - claude-seo: not installed. Counterpart: OpenSEO, shelved at `~/.local/share/dxb/skills/openseo` (12 skills: seo-audit,
    keyword-research, keyword-clustering, competitor-analysis, local-seo, link-prospecting, ai-visibility-audit, seo-report …)
    and named the office's SEO panel at B84.md:88-91; `is-agentic` at B84.md:181 for agent readiness; the page-by-page audit
    comparison at B84.md:232. Nothing for SEO drift after a deploy.
  - marketingskills: not installed. LITERATURE.md:28 "PLANLI (10)". Counterparts are identities, not workflows:
    `personas/marketing/` (33 persona files, e.g. marketing-seo-specialist, marketing-growth-hacker), B84's copywriter seat
    (B84.md:61), B84's build brief (decision 2, B84.md:57) as the per-job context file.
  - humanizer: not installed for the sessions. Study card `.planning/research/study-cards/humanizer.md` (STUDY); an older
    port of the very same skill (v2.5.1) sits in Hermes' skills at `~/.hermes/skills/creative/humanizer/SKILL.md`. B84's copy
    step already places **stop-slop** for the same job (B84.md:166-173).
  - social-media-skills: not installed. Counterparts: `personas/social-media/` (13 personas incl. social-copywriter,
    social-content-strategist), B28's social-team leg (B28.md:70) and "a style file per client" for video (B28.md:80).
    Nothing builds a written-voice file.
  - ai-second-brain: same job held by claude-mem (enabled plugin), graphify (global skill), the Obsidian set (LITERATURE.md:18)
    and Hermes' `~/.hermes/skills/research/llm-wiki` (v2.1.0, "Karpathy's LLM Wiki"). Nothing it adds.
  - claude-for-legal: not installed. `personas/legal/` holds 7 identities (general-counsel, commercial-contracts-manager,
    privacy-dpo, legal-tr-counsel, legal-de-counsel, policy-writer, legal-compliance-checker); no board row owns legal work.
  - agent-run-forensics (inside claude-skills): nothing of ours checks a session's completion claims against its transcript.
    `scripts/governance/ledger-truth.mjs` + `claims.json` re-measure STATE's numbers against the database; `dxb-verify` asks
    for the command and its output; Sol audits the diff. None reads the transcript.
  - repomix: not found. Repos are read with `gh api` trees and READMEs (as in this job); REA reads sites and binaries.
  - agent-browser: not found. Counterparts: playwright MCP (`~/.local/share/dxb/tools/playwright-mcp`, plugin), camofox
    (installed), `operator`, the research door's `hidden.py`.
  - perplexity MCP: not found; the research door's web row has exa, tavily, parallel, youcom, firecrawl
    (`.claude/skills/dxb-research/SKILL.md:56`).
  - instagram-mcp: reading Instagram is in the research door (SKILL.md:62: opencli + hidden.py); publishing waits on B28's
    account connection.
  - zapier, slack, notion: not used; Zapier would be a second job runtime (`STACK.md` refuses it; n8n was refused the same way).
  - financial-services: not found.
- **What it has that we do not:**
  - claude-seo: `seo-drift` (an SEO baseline per page and a diff after every deploy — the monthly SEO service's regression
    check), local/maps geo-grid, Shopify, hreflang, and a 20-agent parallel audit in 10-15 min by its own word; OpenSEO's
    audit samples two pages per family (B84.md:232).
  - marketingskills: written workflows for CRO, copywriting, copy-editing, offers, pricing, ab-testing, conversion tracking,
    programmatic SEO, cold-email and prospecting, each with evals — the seats exist, their working method does not.
  - social-media-skills: the `voice.md` method (a brand's written voice built from an interview and 3-5 samples, read by every
    writing step) and hook-generator / post-scorer / content-matrix as prompts.
  - humanizer v4.0.0: 26 named patterns, a 16/16 blind preference test (its issue #229); a direct rival of stop-slop.
  - agent-run-forensics: STALE and PARTIAL detection (green run before the last edit; `| tail` hiding a failing exit code).
  - agent-browser: ref-based snapshots and honest click failure, for a holding agent that has no browser today (B35.md:45).
  - repomix: one-file packing of a rival repository with `--compress` for a reader's single pass.
  - claude-for-legal: ready legal workflows (NDA triage, DPA review, marketing-claims check, OSS licence check) for the legal
    personas — no row owns them.
  - perplexity: a paid answer engine beside the five free/paid search engines of the research door.
- **Board:**
  - claude-seo · **B84** (SEO tools, B84.md:88-91; the audit comparison B84.md:232) · there now: OpenSEO (shelved, the office's
    panel) + the page-by-page method · **second** · tried beside OpenSEO in the panel trial (6) and the audit comparison; the
    winner is the office's default audit, the other the fallback; `seo-drift` is used after every deploy of a client site in
    the monthly SEO package · first trial: the first bench site with planted errors (the method of trial (1)), `/seo audit`
    vs OpenSEO `seo-audit` vs the page-by-page queue; scored on planted errors found, false findings, minutes and tokens · stops
    at CEO: nothing (its paid-data extensions use DataForSEO, whose loading is already his at B84.md:89).
  - marketingskills · **B84** (copywriter seat and the conversion-improvement monthly package, B84.md:61,63); second owner
    **B28** for `ads`/`ad-creative` · there now: personas only · **method** (skill files taken into the shared cupboard,
    B84 decision 7) · copywriting, copy-editing, cro, offers, ai-seo, schema read by the seats on a job · first trial: one bench
    landing page written by the master with copywriting + cro + copy-editing and once without, both read blind by the lead,
    then his eye; tokens counted · stops at CEO: nothing (the partners' paid tools are not taken).
  - humanizer · **B84** (the copy step, B84.md:166-173) · there now: stop-slop · **second** · the same three texts (landing page,
    blog piece, ad set) through both, before/after side by side; the winner the default, the other the fallback · first trial:
    exactly B84's stop-slop trial with humanizer as the second arm; the Hermes copy (2.5.1) is not used, v4.0.0 is · stops at
    CEO: nothing.
  - social-media-skills · **B28** (the social-media team as a service, B28.md:70) · there now: social personas + the video
    style file (B28.md:80) · **method** · `voice-builder` gives every client brand (and each of the holding's own lines) a
    `voice.md` the social copywriter reads; hook-generator and post-scorer as its prompts · first trial: one week of posts for
    one of the holding's own lines with and without `voice.md`, inside B28's own bench trial; read by the lead, then his eye ·
    stops at CEO: nothing for the method; reels-scripting's Apify past the free plan is money out (already his at B84.md:158).
  - agent-run-forensics · **B51** (who checks the work) · there now: Sol's blind audit, `dxb-verify`, `ledger-truth.mjs` —
    none reads the transcript · **new** · `claim_checker.py` run over a finished session's transcript before a completion
    report reaches the lead or the CEO · first trial: three finished sessions of this week whose reports are known, the checker
    run on each; does it find a STALE or CONTRADICTED claim the lead would have missed; scanned first like every third-party
    skill · stops at CEO: nothing.
  - agent-browser · **B30** (the agents' hands and eyes) · there now: playwright MCP, camofox, hidden Chrome · **second** ·
    the browser hand given to a holding agent through B41's grant · first trial: the same five tasks (read a table, fill a
    form, a consent-banner page, a login-kept page, a 200-row list) with playwright MCP and with agent-browser; tokens per
    snapshot and tasks finished · stops at CEO: nothing.
  - repomix · **B22** (reading rival systems; door `dxb-rival-intel`) · there now: `gh api` reads, REA · **new** · `npx repomix
    --remote <owner/repo> --compress` gives a reader the whole code of a rival repo in one file · first trial: one rival repo
    read both ways (pack vs `gh api` file-by-file) on five fixed questions; correctness and tokens · stops at CEO: nothing.
  - perplexity MCP · **B30** (intelligence, the research door) · there now: exa, tavily, parallel, youcom, firecrawl · **second**
    (paid) · a sixth engine for questions the five answer badly · first trial: ten past research questions with known answers,
    Sonar vs the door's current chain · stops at CEO: the Perplexity API key (money out).
  - claude-for-legal · **no row**; nearest **B05** (contracts and signing) and **B41** (the shelf a worker asks from) ·
    business line: the holding's own legal department (7 legal personas) and every client contract · **new** · NDA triage, DPA
    review, marketing-claims check on outgoing copy, OSS licence check · first trial: one real contract of the holding and one
    of our own outgoing ads through NDA/DPA review and marketing-claims review; read by the lead · stops at CEO: nothing for a
    draft; every contract stays his (approval gate).
  - financial-services: its banking, equity-research, private-equity and wealth parts are the forbidden subject (banking /
    stock markets) — named, not explored. Its GL Reconciler and Month-End Closer are plain bookkeeping; no row owns the
    holding's books (nearest B83's G5 net-profit ledger) — Gerek yok now.
  - ai-second-brain, zapier, slack, notion, instagram-mcp (unidentified), caveman, frontend-design, google-drive: none / eliminated.
- **The old verdict and reason:** partly — marketingskills and claude-seo against OpenSEO were the right core, but "one is
  kept, not both on the shelf" contradicts his 2026-11-17 rule (the winner becomes the default, the other stays as the
  fallback, B84.md:229); the three "not found" repos were findable (alirezarezvani/claude-skills, charlie947/social-media-skills,
  charlie947/ai-second-brain); humanizer's counterpart stop-slop, agent-browser, agent-run-forensics and repomix were never
  placed; caveman and frontend-design "installed, closed" holds.
- **Reader's first reading:** Dene — claude-seo İkinci beside OpenSEO (B84), humanizer İkinci beside stop-slop (B84),
  marketingskills Yöntem (B84/B28), social-media-skills' voice file Yöntem (B28), agent-run-forensics Dene (B51),
  agent-browser İkinci (B30), repomix Dene (B22), perplexity İkinci (B30), claude-for-legal Araştır (no row).
