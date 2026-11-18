# k3-d — second reading of k3-12, k3-13, k3-14 (tab "Kasım 3-4 web linkleri")

Reader: Opus 5.5, 2026-11-18. No video was watched, downloaded or transcribed; the sources on disk were read.
Pages fetched for this reading are in `$J/rows/k3-d-src/`.

## k3-12 (d01) — a six-slide list post (wesso.hall): "5 MCPs" — Shopify, Higgsfield, AdAdvisor, Google Drive, Google Analytics

- Opened: all six slides (`.planning/quick/20261103-web-ders/carousel/d01/slide01-06.png`), the old row, the
  earlier readers (`reader-opus.md:35,74`, `reader-fable.md:26,49`, `MERGE.md:22`), track
  `tracks/4-reklam-olcum.md` §5 (lines 178-219), `quick/20261103-web-studio-kesif/research/PLATFORMS.md:26,60`.
  Fetched today: `gh api` for googleanalytics/google-analytics-mcp (README, releases), Shopify/Shopify-AI-Toolkit
  (README, tree, releases), pipeboard-co/meta-ads-mcp, googleads/google-ads-mcp, wide-trace/open-higgsfield,
  RajeshAmb/adadvisor-mcp; adadvisor.ai/mcp and /pricing (curl → text); a web search for Meta's Ads MCP docs.
  Meta's own tool reference page was not opened (search snippets only). The "Comment CLAUDE" setup guide is a DM gate: not read.
- His note: none.
- What is in it: five slides of four bullets each, no setup, no numbers, no business example; slide 6 hides the
  "setup guide + links" behind "COMMENT CLAUDE". Item by item, measured today:
  - Shopify MCP → Shopify AI Toolkit, https://github.com/Shopify/Shopify-AI-Toolkit — MIT, 650★, last push
    2026-11-17, v2.4.0. Docs and API-schema search, GraphQL/Liquid/UI-extension validation, store management through
    the Shopify CLI's "store execute"; 18 skills (marketplace text). It is listed in the official Claude marketplace
    already on this machine (`~/.claude/plugins/marketplaces/claude-plugins-official/.claude-plugin/marketplace.json`,
    entry `shopify-ai-toolkit`) — not installed. It also ships a Hermes plugin (`.hermes-plugin/`). Its README says
    its scripts and a PostToolUse hook send telemetry to `shopify.dev/mcp/usage`, on Claude Code including the
    user's latest prompt verbatim (up to 2,000 chars).
  - Higgsfield MCP — the paid Higgsfield subscription reached over MCP.
  - AdAdvisor MCP, https://adadvisor.ai/mcp — a hosted Meta Ads MCP. Prices changed since 3 Nov: Free $0 with 20 MCP
    calls a month; MCP-only plans from $19.99/mo; "Nova" $199/mo per business = an agent crew (Nova media buyer, Iris
    creative, Luna video) with 500 video + 200 image credits. Onboarding reads the business's AOV, break-even ROAS
    and target CPL "so the AI starts with context"; every change comes back as a draft to approve; audit log.
    The GitHub repo RajeshAmb/adadvisor-mcp (0★, last push 2026-03-29, no licence) is not shown to be theirs.
  - Google Drive MCP — Claude's own Google Drive/Docs/Sheets connector.
  - Google Analytics MCP → https://github.com/googleanalytics/google-analytics-mcp — Google's own, Apache-2.0,
    3,816★, last push 2026-11-16, v1.1.0 (2026-11-06). Tools: account/property summaries, Google Ads links, key
    events, `run_report`, `run_funnel_report`, `run_conversions_report` (ad costs, conversions, ROAS, attribution),
    `run_realtime_report`; writes (annotations, custom dimensions, key events) only with `--allow-write` and the edit
    scope. Runs local or as a remote multi-tenant server.
  - Not in the post, the real door the old reading named: Meta's official Ads MCP, `https://mcp.facebook.com/ads`
    (beta since 2026-04-29 per secondary sources; `claude mcp add --transport http --client-id <META_APP_ID> meta-ads
    https://mcp.facebook.com/ads` per Meta's get-started page in the search result). Open twin: pipeboard-co/meta-ads-mcp
    (1,377★, push 2026-10-20, licence NOASSERTION, hosted with a free plan). Google's own googleads/google-ads-mcp
    (Apache-2.0, 1,189★, push 2026-11-17) is the Google Ads counterpart.
- What we have:
  - Shopify: not installed; listed in the local official marketplace (path above); PLATFORMS.md:26/38 names it.
    B84 rank item 4 (`B84.md:131`) names only the WordPress/WooCommerce kit.
  - Higgsfield MCP: **identical placement — already on the board at `.planning/board-rows/B43.md:215-220`** (R30 paid
    fallback, priced 2026-11-17, and it records that the plans' unlimited generations do not work through the MCP).
    Eliminated.
  - Google Drive: **identical — Claude's own connector, skill at
    `~/.claude/skills/synced/22dbc686-…/google-workspace/SKILL.md`.** Eliminated.
  - Meta Ads MCP / AdAdvisor / google-analytics-mcp / google-ads-mcp: none installed (`~/.claude.json` MCP list:
    Docs, plugin, playwright, context7, scrapling). B28 holds `claude-ads` (export audit, `B28.md:53-64`, not
    installed) and says only "reading a live account through a platform's own MCP is an identity step" (`B28.md:62`).
    B84 lists "GA4" and "Search Console (mcp-gsc)" in its core (`B84.md:89`) — the GA4 *product*, not an agent hand
    for it. **The 3 Nov track already chose these hands ("ortak MCP, yalnız `ads_read`", `tracks/4-reklam-olcum.md:183-185,219`)
    but that choice never reached a board row: `grep` of `.planning/board-rows/` and the board for `ads_read`,
    `analytics-mcp`, `google-ads-mcp` returns nothing.**
  - Paid twins already in the local marketplace (not installed): `windsor-ai` (325+ sources); the plugin directory
    cache also lists hosted ad-MCP products (Admaxxer, Trackian, Kampalo) — names only, not read.
- What it has that we do not: a live-read eye on an ad account and on analytics (ours audits only an export);
  AdAdvisor's onboarding method — the client's unit economics (AOV, break-even ROAS, target CPL) written into the
  account's profile before any agent reads the numbers — and its draft-first + audit-log shape; Shopify's own
  validator for a Shopify job.
- Board:
  - **Meta Ads MCP (official)** · B28 · stands now: claude-ads (export audit) and nothing for a live account ·
    `new` · the agency seat's live eye: read-only (`ads_read`) reporting, creative fatigue, signal diagnosis on the
    client's account after the claude-ads audit wins the client; stage 2 drafts, never budget/bid/launch (track 4
    §5 "Kapı") · first trial: on the holding's own first ad account (B28's ad-factory trial, `B28.md:71`), the MCP
    reads the same week claude-ads audits from the export; compared on what each finds and how many numbers match
    the export · CEO: the Meta developer app + business verification (identity), any client account access (identity),
    any write (money out).
  - **AdAdvisor MCP** · B28 · official Meta Ads MCP (above) · `second` (paid fallback beside the official server) ·
    used if the official server's raw tools prove too thin for a media buyer's week · trial: the free plan (20
    calls) on the same account and the same five questions as the official server · CEO: account sign-up and
    OAuth (identity); paid plan (money out). Its unit-economics onboarding is a `method` for B28: written into the
    client's ad profile whichever server wins.
  - **google-analytics-mcp** · B84 (monthly report of the care/SEO package, `B84.md:63`); B28's Monday report reads
    the same hand · stands now: "GA4" named as a product, no agent hand · `new` · the monthly report's numbers
    (funnel, conversions, ROAS by channel) pulled by the agent with its source query beside each figure; read-only
    scope · first trial: Google's public GA4 demo property, the agent's `run_funnel_report` / `run_conversions_report`
    against the same figures read by hand in the GA4 screen · CEO: a Google Cloud project + OAuth consent (his click).
  - **google-ads-mcp (Google's own; not in the post, from track 4)** · B84 (Google Ads API Basic access already
    prepared up to his click, `B84.md:89`) and B28 · `new` · read-only GAQL reporting beside the keyword-planning use ·
    trial with the same Ads account when it exists · CEO: the Ads account and developer access (identity).
  - **Shopify AI Toolkit** · B84 (e-commerce, decision 8; rank item 4) · stands now: WooCommerce MCP + WP kit, no
    Shopify hand · `new` · the platform specialist's hand on a Shopify job: schema search and Liquid/GraphQL
    validation before a theme or app change ships · first trial: one theme section built on a free Shopify
    development store with and without the toolkit's validator, errors counted · CEO: a Shopify Partner account
    (identity). Note for the lead: its telemetry hook sends the prompt to Shopify — scan and decide before install.
- The old verdict and reason: partly — the direction (official Meta first, AdAdvisor as paid fallback, GA4 MCP)
  holds, but it put everything on B28 (GA4 and Shopify belong to B84), its AdAdvisor prices are out of date, and it
  never wrote the placement, so the 3 Nov choice is still on no board row.
- Reader's first reading: **Dene** (official Meta Ads MCP and google-analytics-mcp, read-only; AdAdvisor İkinci;
  Shopify toolkit Dene at B84; Higgsfield and Drive Zaten kurulu/eliminated).

## k3-13 (d02) — an eight-slide "7 days to learn performance marketing" plan (nextgensearchengine)

- Opened: all eight slides (`carousel/d02/slide01-08.png`), the old row, `MERGE.md:33`, `reader-fable.md:27`,
  `tracks/4-reklam-olcum.md` (1-20, 176-240), `personas/paid-media/` (7 files, 992 lines; grep for CAPI/event_id/
  consent/MCP), `B28.md` whole. Nothing could not be read.
- His note: "Google Ads, Meta Ads, dönüşüm takibi, yeniden pazarlama".
- What is in it: Day 1 goal, persona table, competitor research (Meta Ads Library, Google Ads Transparency Center,
  Similarweb, Ubersuggest), funnel TOFU Meta / MOFU Google Search / BOFU retargeting. Day 2 GA4, GTM, Google Ads;
  Meta Business Manager, Pixel, Conversions API; events (form, click, purchase, add-to-cart, scroll, calls, WhatsApp).
  Day 3 landing page (hero, problem, solution, social proof, CTA; sticky CTA, exit-intent, speed, mobile, WhatsApp;
  Unbounce, Elementor, Hotjar). Day 4 Google campaign types, keyword match types, ad-copy chain, budget split
  Search 50 / Retargeting 20 / PMax 20 / Testing 10. Day 5 Meta structure, objectives, cold/warm/hot audiences,
  creative types, "Hook→Problem→Solution→CTA", an example ad claiming "ROI by 300%". Day 6 KPIs, checklists, scaling
  "20-30% every 2 days". Day 7 dashboard (Looker Studio, Supermetrics), automated rules/scripts, Advantage+, an
  8-item deliverable checklist, resources (Skillshop, Blueprint, CXL, MeasureSchool). No source, no account, no numbers.
- What we have: `.planning/quick/20261103-web-ders/tracks/4-reklam-olcum.md` (event contract with `event_id`,
  Consent Mode thresholds, Enhanced Conversions, Data Manager API, ±10 % reconciliation gate, staged agent gate,
  tools table) and seven paid-media personas `personas/paid-media/*.md` (tracking specialist carries CAPI/event_id
  terms 11 times; paid-social strategist has the funnel prospecting → engagement → retargeting → retention). B28
  holds the ad factory module and claude-ads (`B28.md:57-71`). Track 4's own "missing" list (`:236`) — Data Manager
  API absent from the tracking persona, no MCP or claude-ads in any of the seven — is still open, and track 4 itself
  is on no board row (grep: no hit in `.planning/board-rows/`).
- What it has that we do not: nothing in knowledge (its weak points are listed in the old row: no event_id, no
  consent, an unsourced budget split and scaling rule, a fake "300 % ROI" example). One thing in form: an
  8-line client-facing deliverable list for a paid-ads setup (funnel strategy · tracking · landing page · Google Ads ·
  Meta Ads · retargeting · optimisation · reporting dashboard) — B28 sells video production, the audit and the ad
  factory but has no packaged "ad account setup" offer.
- Board: B28 · stands now: the ad factory module and the claude-ads audit; the knowledge sits in track 4 and the
  paid-media personas · `method` · B28 gains a "paid-ads setup sprint" offer whose deliverable list is the post's
  eight lines, each filled from track 4 (account ownership in the client's name, event contract, consent, ±10 %
  reconciliation before any spend), done by the seven paid-media seats; his four topics are the sprint's spine ·
  first trial: the sprint written for the holding's own first campaign (the ad-factory trial), its checklist ticked
  by the auditor persona · CEO: ad spend (money out), connecting an ad account (identity).
- The old verdict and reason: partly — "nothing to learn from the post" holds, but his note names four capabilities
  the board does not carry anywhere: the deeper knowledge exists only in a 3 Nov job folder, unplaced.
- Reader's first reading: **Yöntem** (the deliverable list into B28; content from track 4, not from the post).

## k3-14 (d03) — Google Pomelli, Google Labs' free on-brand campaign maker (26-second reel)

- Opened: transcript `.planning/quick/20261103-web-ders/transcripts/d03-DRUbY-3D7ef.txt` whole (8 lines, 26 s);
  all four frame sheets `frames/d03-DRUbY-3D7ef-all/sheet01-04.jpg`; the old row; `MERGE.md:24`,
  `reader-opus.md:38,78`, `reader-fable.md:35,53`. Fetched today: `labs.google/pomelli` (alive, "Easily generate
  on-brand content for your business", sign-in with a Google account); one web search on Pomelli's 2026 features
  (secondary sources only; Google's own blog not opened today). The video file itself was not opened (order).
- His note: "Ücretsiz yapay zekâ pazarlama ajanı".
- What is in it: the reel says paste a URL and Pomelli scans the site's visuals and voice and generates campaign
  ideas with captions and editable visuals. Frames show: "Add Business URL" (eatbanza.com), "Generating your Business
  DNA", a brand card (logo, two fonts, six colour swatches with hex, images, tagline/brand values boxes), a
  "Campaign" screen with three creatives, product photos re-staged on new backgrounds, and an "Edit anything" panel
  (image, headline, colours, description, CTA). The "comment marketing → DM" gate hides only the address.
  Since the reel (secondary sources): Photoshoot (Feb 2026, one product photo → studio and lifestyle shots on
  Business DNA + Nano Banana), Product Catalog, and at I/O 2026-05-19 Pomelli Agent (builds the Business DNA from
  words or materials), Brand Books and Websites; one source reports direct Instagram publishing (June 2026). No API
  or developer access found. Old row: ~200 countries incl. Turkey, UAE, Saudi Arabia; 18+; English only; Labs, may close.
  The "automates your entire marketing stack" claim is hollow: it makes content, it does not run or measure ads.
- What we have: not installed, not on the board (grep of repo research, board rows, skills, `~/tools`, `~/.hermes`:
  no "Pomelli", no "Business DNA"). Nearest: the studio makes images (B43); B28's "style file per client" is written
  from reference *reels* on five video axes (`B28.md:80`); B84's job starts with the client's link, logo and photos and
  REA tears down the *reference* site (`B84.md:58,117-118`); B43's client loop (10) has an intake door and per-platform
  delivery profiles, no brand profile (`B43.md:152`).
- What it has that we do not: the step "client URL → a brand profile (logo, fonts, hex palette, image style, tone,
  values)" that every later asset reads; and a free, instant on-brand static-post generator usable before a client signs.
- Board: B28 (leg "social-media team as a service", `B28.md:70`: "the week's videos, carousels and captions in the
  brand's voice") · stands now: the studio (B43) and the social-media department, with no brand-profile step ·
  `second` for the tool (beside our studio for static posts and a pre-sale sample) and `method` for the Business DNA
  step (into the same leg, read also by B84's job step 1 and its firm-specific demo, decision 9) · use: on a prospect's
  URL, Pomelli gives a three-post sample for the first message; our own intake writes the same brand profile
  (REA + page scrape: fonts, palette, logo, tone) into the client record for every later job · first trial: one
  public site of the holding's own lines (no client name) through Pomelli and through our studio from the same URL;
  compared on brand fidelity (palette/fonts match), minutes, and his eye · CEO: a Google account sign-in (his click);
  every person it generates must pass his cast rule and the halal screen before anything leaves.
- The old verdict and reason: partly — "Dene" holds, but B84 is the weaker home: what Pomelli makes is social posts,
  which B28's social-media service sells; and the trial against ours was never named.
- Reader's first reading: **İkinci** (beside the studio for static posts and pre-sale samples) + **Yöntem** (Business DNA step).

## Commands run

- `ls`/`cat` of `$J/old/k3-1{2,3,4}.json`, `$J/src/…`, `$J/items.tsv`, `$J/twins.tsv` (no twin for these rows), `$J/inv/k3a.tsv`.
- Read: 6 + 8 slides, 4 frame sheets, transcript, `B28.md` whole, `B84.md` 46-160, `B43.md` 150-153 and 215-220,
  `tracks/4-reklam-olcum.md` 1-20 and 176-240, `context.md`.
- `grep` over `.planning/board-rows/`, the board, `.planning/research`, `.claude/skills`, `~/.claude/skills`,
  `~/.local/share/dxb`, `~/tools`, `~/.hermes`, `personas/paid-media/`; python over the local official marketplace.json
  and `installed_plugins.json`.
- `gh api repos/<7 repos>`, READMEs and releases of google-analytics-mcp and Shopify-AI-Toolkit.
- `fetch.py https://labs.google/pomelli`; `fetch.py` + `curl` of adadvisor.ai/mcp and /pricing; WebSearch ×2.
