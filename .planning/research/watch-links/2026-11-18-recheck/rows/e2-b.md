# e2-b — second reading, tab "Ekim 15-21 linkleri" (rows e2-03, e2-04, e2-16)

## e2-03 (EK11) — Mert Durmazer's video: he clones Umami from 5 screenshots, adds an "AI-assistant visitors" channel, narrows it to small businesses and agencies, then has Claude write the marketing
- Opened: the Turkish transcript on disk, `~/.cache/link-watch/EK11-ZJj4_egB30Q.tr.vtt`, read whole after de-duplicating the rolling captions (520 lines, 00:00-20:28). The 3:50-10:00 stretch the old row called broken reads cleanly in this file. No frames were re-made (his order). Repository: `gh api repos/umami-software/umami`, its latest release, `src/lib/constants.ts`, `gh search code` for `LLM_DOMAINS`, the commit history of `getChannelMetrics.ts`, and `packages/mcp/README.md`. Ours: board rows B17, B83, B84; `REVENUE-OPPORTUNITIES.md` §D #21, #23, #26; the Web Studio deep study `~/Desktop/DxB Global Web-Studio/opus ile konuşulan stratejiler/9 - Web işi derin çalışma 2026-11-04.md` (lines 418-423, 484, 1090-1101); `.planning/quick/20261108-seo-aletleri/landscape.md`.
- His note: "Linkini değil, dizüstündeki videonun telefonla çekilmiş fotoğrafını attınız: \"Viral Olan 'Her Şeyi Tersine Mühendislik' Skill'ini Test Ettim\" (Mert Durmazer)."
- What is in it (from the transcript):
  - The copy. He gives Opus 5.5 one prompt and five screenshots of Umami's public demo (MIT, "39,000 stars"). The prompt asks for the tracker, the database, the panel and demo data, then for the agent to screenshot its own build, compare it with the original and fix the three most obvious differences. The build took 13 min, 1,442 lines and 3.60 $ at API price. A second run at lower effort took 5 min 42 s. Of the 19 parts he counted, 13 matched. Missing: the browser/log view, country detection by IP (it guesses from browser language), and automatic filtering. He says REA is "the thinking system, not the thing doing the work"; Claude Code does the work.
  - The difference. Prompt: "we teach businesses and agencies to be visible in AI answers; propose three directions for this app and pick one" (80 s). The three directions: (1) a separate channel for visitors sent by AI assistants (chosen); (2) a tool that shows which pages AI bots read; (3) a visibility report card for agencies. The result is "Site Flow" (10 min, 3.42 $):
    - a card that counts assistant-referred visitors and filters the whole panel to them when clicked;
    - a table of which page each assistant sent people to;
    - demo data for a small Istanbul dental clinic;
    - a note on the card that apps which send no referrer are not counted, so the real number is higher.
    The first referrer test failed because the referrer is stripped from HTTPS to HTTP, and the agent fixed its own test. Faked ChatGPT and Perplexity visits were attributed correctly. Real assistant traffic was not tested.
  - The marketing (5 min, 1.62 $). The prompt asks for positioning, a one-page landing page, launch texts and a 30-day plan for the first 10 users, under the rule "no invented numbers, no fake reviews, no fake logos".
    - The output puts a warning on the launch file: "use these texts once the product can be tried". The landing page has a "what we can't see yet" section.
    - The X hook comes from a real observation: chatgpt.com was 6th among referrers, under Reddit, on Umami's own demo.
    - The Product Hunt line: "See the visitors AI assistants sent to your website."
    - The first-10-users plan: existing clients, then agencies, then open channels. One offer to all: 30 days free, we install it, and we review the traffic with them at month end.
  - The name check. Claude says it did not check domains or trademarks. One name was found to be taken by a similar tool. Rivals cost 29-99 $ a month; one, "Ask Trail", tags Shopify orders by AI source. A second round of 8 names ended on "Answer Hope" (as heard).
  - His thesis: code is cheap. What earns is whose problem you solve, one feature the original lacks, and the right sentence to the right person. Take a proven market to a narrower audience, and don't enter an untested one.
- What we have:
  - Umami itself is in no board row (`grep umami .planning/board-rows/` gives 0 hits). It is in the Web Studio deep study, file 9, lines 1090-1101: "Umami | 0, 20, 200 $ | MIT, 39.901 | çerezsiz". That file's recommendation is that a client who runs ads must have GA4, with Plausible or Umami beside it for the consent-free total.
  - The AI-traffic measurement method is in file 9 line 484: the Search Console generative-AI report, Bing AI Performance, a GA4 custom channel rule above Referral, `utm_source`, the server log, and "how did you find us" on the form.
  - B84.md:89 lists the installed core: GA4, Clarity, Search Console, among others. B84.md:91 (5) and landscape.md:65 put AI visibility in answers on Elmo, OpenSEO with DataForSEO, and Peec/Profound (paid). That measures mentions in answers, not visitors.
  - The service already sits in REVENUE-OPPORTUNITIES §D #21 (H5) as "Yapay zekâ görünürlük denetimi ve aylık ölçüm: 1.500–5.000 $ bir kerelik, aylık 3.000 $'dan".
  - The "own SaaS" road is in §D #26, "Yapay zekâ ile uygulama / SaaS" (the later list).
- What it has that we do not:
  - Measured at the source today: **upstream Umami already has the video's differentiator.**
    - `LLM_DOMAINS` (chatgpt.com, claude.ai, copilot.microsoft.com, gemini.google.com, meta.ai, perplexity.ai) drives an `'llm'` channel in `getChannelMetrics.ts`, `getChannelExpandedMetrics.ts` and `revenue/getRevenueMetrics.ts`. The commit is "add LLM channel logic", 2026-05-11.
    - Umami v3.5.0 is from 2026-11-12. The repo has 40,214★, is MIT, and was last pushed 2026-11-18.
    - Umami ships `@umami/mcp`, 23 read-only tools: stats, channels, referrers, funnels, attribution, revenue, Core Web Vitals.
    - So the holding does not need to build the clone. It can self-host Umami and let our agents read it through MCP, for the client's monthly report with an AI-assistant line in it.
  - What the video adds that we do not have written:
    - the prompt chain itself: copy from screenshots, then a self-compare loop that fixes three differences;
    - "three directions, pick one" for your own line of business;
    - the marketing prompt with the no-invented-numbers rule and its "use once it can be tried" warning;
    - the "what we can't see yet" section as a trust device;
    - the first-10-users offer: 30 days free, we install, a month-end review.
  - A caution from our own study, file 9 line 421: across 95 sites, AI referral traffic is 2.6 % of organic, and 3.2 conversions per 100 organic. A standalone "AI traffic analytics" SaaS is a thin market. As one line of the monthly report it is cheap and true.
- Board:
  - **Umami → B84** (the measurement leg of the office's monthly report, H5 #21).
    - Stands now: GA4 + Clarity, installed core (B84.md:89). File 9 names Umami or Plausible beside GA4, but the row does not carry it.
    - Relation: `second`, beside GA4 (and Plausible).
    - Use: self-hosted Umami in its own box, tracking script on the bench site. Its `llm` channel plus `@umami/mcp` feed the agent that writes the client's monthly report, which then carries an "AI-assistant visitors" line as a lower bound.
    - First trial: Umami and GA4 (custom AI channel rule) on the same bench site, with scripted visits carrying chatgpt.com/perplexity.ai referrers and with none. Measured: correct attribution, the gap between consent-free and consent-gated totals, and whether the MCP report agent writes the line unaided.
    - Stops at the CEO: nothing for the bench. A server or domain for client hosting is money out.
  - **The clone → one difference → narrow audience → honest marketing flow → REVENUE-OPPORTUNITIES §D #26 "Yapay zekâ ile uygulama / SaaS" (B83).**
    - Stands now: the #26 entry, with no recipe.
    - Relation: `method`.
    - Use: written into #26 as the recipe:
      - only permissively licensed open-source originals;
      - screenshots plus a self-compare loop;
      - three directions from our own business;
      - a no-invented-numbers marketing prompt;
      - a first-10-users offer of 30 days free with installation and a month-end review.
      The same marketing prompt and its "use once it can be tried" warning also serve H5's AI-visibility audit offer.
    - First trial: when #26 opens, one MIT tool cloned and narrowed on the bench. Measured: time, cost, parts matched.
    - Stops at the CEO: a domain, a trademark check, launch ads (money out); publishing outward.
- The old verdict and reason: partly holds. The method reading is right, but "yapay zekâ trafiği ölçen ürün yok" does not hold. Upstream Umami has carried an LLM channel since 2026-05-11, and our own file 9 already writes the GA4 rule. B17 is the wrong home: B84 owns the tool, and §D #21/#26 own the method.
- Reader's first reading: İkinci (Umami beside GA4 in B84) + Yöntem (#26).

## e2-04 (EK12) — Is Agentic (is-agentic.com): Vercel's free 0-100 agent-readiness scanner, scored by Ora
- Opened: with `fetch.py --no-browser`, is-agentic.com/, /docs and /methodology (all 3 read). Also `/.well-known/agent-skills/index.json` by curl, `npm view is-agentic`, `gh api repos/vercel-labs/is-agentic` (404), and github.com/vercel-labs/is-agentic (HTTP 404). Ours: B84.md:181, `REVENUE-OPPORTUNITIES.md:198, 234`, file 9 line 423.
- His note: none.
- What is in it:
  - The scoring and the report: Essential checks 80 points, Recommended 20, an Emerging bonus up to 5. Checks that do not apply are excluded. Recommended checks turn on only when an API, OAuth, GraphQL, MCP or commerce surface is detected. Each report has evidence per finding, a "Prompt to fix" brief, and an observed agent journey that is shown but not scored.
  - The site-type meta tag (`is-agentic-site-type`: content, business, app, store) changes the view but not the score.
  - Three free, read-only surfaces with no key:
    - the JSON API `GET /api/v1/report?url=` (120 requests per IP per minute; RFC 9457 errors);
    - the CLI `npx is-agentic <domain> [--json]`, npm `is-agentic@1.0.1` (2026-08-20, ISC), which starts a scan when no report exists;
    - an MCP server at `https://is-agentic.com/mcp` with three tools (`is_agentic_get_report`, `_get_methodology`, `_get_developer_docs`) and an MCP Apps score card.
  - An official agent skill: SKILL.md at `/.well-known/agent-skills/is-agentic/SKILL.md`, sha256 `41cacbc9…b997d`. The GitHub path the docs link to returns 404; the repository is not public.
  - "Currently free, no paid plans."
  - Its own limits: one public URL at a point in time, false positives and negatives possible, no certification.
  - Featured scores today: vercel.com 96, stripe.com 72, openrouter.com 36, hellyhansen.com 16.
- What we have: the same product is already placed, not installed, at B84.md:181, "Agent readiness — is-agentic (w033, \"Dene\")", in the release gate. That entry has the trial "first bench site and two reference sites scanned, each failure checked by hand once". It is also half of B83's secret-shopper prospect audit (REVENUE §D #23, line 234). `npm ls -g is-agentic` is empty.
- What it has that we do not have written:
  - The B84 entry names only the CLI. The MCP server, the JSON API (an agent can read a report without npx) and the official SKILL.md are new facts for the same line.
  - The site is itself a worked example of an agent-ready surface:
    - Markdown content negotiation with `Vary: Accept`;
    - RFC 9457 problem+json for every error;
    - an RFC 9727 `/.well-known/api-catalog`;
    - an MCP server card and `/.well-known/ai-catalog.json`;
    - an agent-skills index.
    This is a checklist for the holding's own site (Y11) and for client sites that offer an API.
  - The limit our own study sets: file 9 line 423 says "llms.txt arama görünürlüğü için boştur", and §D #21 says llms.txt is not sold as its own item. The scan is a diagnostic, not a line to sell.
- Board: **B84**, release gate, w033.
  - Stands now: is-agentic itself (B84.md:181).
  - Relation: `identical` (the same product is already placed; nothing new to place).
  - Use: add to that line that the report agent reads via `https://is-agentic.com/mcp` or `/api/v1/report` instead of npx, and that the official SKILL.md is scanned before it goes on the shelf. The office's own-site leg (Y11, B84.md:154) takes is-agentic.com's own surface as a reference.
  - First trial: the one B84 already writes.
  - Stops at the CEO: nothing. It is free and needs no account; only public sites are given to it.
- The old verdict and reason: partly holds. "Dene" holds and is now on the board. "Bizde yok" was true then. B28/B17 was the wrong row: B84 owns it, with B83's prospect audit second.
- Reader's first reading: Dene (already placed in B84; add the MCP/API/skill facts).

## e2-16 (EK24) — an Instagram reel listing 9 open-source "SaaS killers" plus REA; the same list as w052, which was re-read on 2026-11-17
- Opened: no transcript or frames are on disk for this reel. `~/.cache/link-watch/` holds only `EK24-Derv5JKxwPs.mp4` plus an empty `.err` and `.lock`. The old row's "transcript 103 s, 14 frames, SHEET" is not on disk, and the video was not re-processed (his order). The list was taken from the old row and from yesterday's reader of the same list, `.planning/research/watch-links/2026-11-16-whatsapp/recheck/h1.md` §w052 (reel De7DFk0IQkj). The on-screen star counts match within about 1 %. All 11 repositories were re-read today with `gh api repos/O/R`. Ours: B25, B43, B83, B84 row files, `~/tools/VoiceStudio` (git remote and last commit, `du`, no venv/node_modules), `~/.local/share/dxb/skills/openseo/SOURCE.md`, `~/.local/share/dxb/skills/reverse-engineer-anything/`, `rea-agents --version`, `docker ps -a`.
- His note: none.
- What is in it (gh api, 2026-11-18):
  1. Open Higgsfield — github.com/wide-trace/open-higgsfield — a studio UI with one prompt bar over paid image and video models. 6,281★, no licence field, last push 2026-09-17.
  2. VoiceStudio — github.com/debpalash/VoiceStudio — a local ElevenLabs alternative: cloning, voice design, dubbing, dictation, 646 languages. AGPL-3.0, 113,105★, last push 2026-11-18.
  3. OpenSEO — github.com/every-app/open-seo — a Semrush/Ahrefs alternative. MIT, 28,141★, last push 2026-11-18.
  4. WeKnora — github.com/Tencent/WeKnora — RAG, an agent and a wiki over documents, with an embed widget and MCP. NOASSERTION, 37,715★, last push 2026-11-18.
  5. OpenWhispr — github.com/OpenWhispr/openwhispr — local dictation. MIT, 11,793★, last push 2026-11-18.
  6. OpenProject — github.com/opf/openproject — project management. GPL-3.0, 17,495★, last push 2026-11-18.
  7. Cal.com — now calcom/cal.diy — scheduling. MIT, 50,154★, last push 2026-11-13.
  8. Chatwoot — github.com/chatwoot/chatwoot — an omni-channel inbox. NOASSERTION (MIT outside `enterprise/`), 40,079★, last push 2026-11-18.
  9. Cap — github.com/CapSoftware/Cap — a Loom alternative. NOASSERTION, 25,205★, last push 2026-11-18.
  10. REA — github.com/morluto/rea — agent reverse engineering. MIT, 467,076★, last push 2026-11-18.
- What we have, per item:
  - Open Higgsfield: its job is held by B43.md:175 (Open-Generative-AI) and B43.md:176 (Freefield).
  - VoiceStudio: **cloned at `/home/dxb/tools/VoiceStudio`** (origin debpalash/VoiceStudio, commit 4ca7dc6 of 2026-11-12, 325 MB). It is source only, with no `.venv`, `node_modules` or models, so it is not built. It is placed as the engine in B43.md:56,63 (R23/R25) and B12.md:38 (H8 dubbing). Yesterday's h1.md said "not found" because it did not look in `~/tools`.
  - OpenSEO: product skills on the shelf at `~/.local/share/dxb/skills/openseo/` (commit d7ea78524806). The install recipe and blind trial are at B84.md:88-91. No container is running.
  - WeKnora: B84.md:233 and B83.md:89 (w052, with a trial).
  - OpenWhispr: B25.md:36,43, measured beside Kelam and Handy.
  - OpenProject: B84.md:231 (w082, the client's project room).
  - Cal.com/cal.diy: B83.md:72 (w083).
  - Chatwoot: B83.md:71 (w084).
  - Cap: in no row.
  - REA: **identical, installed** at `/home/dxb/.npm-global/bin/rea-agents` 6.7.0, with the skill at `~/.local/share/dxb/skills/reverse-engineer-anything/`.
- What it has that we do not:
  - Open Higgsfield: only a design pattern, the one h1.md also names. Its catalog is the source of truth (each model declares its own settings and media roles and the UI renders exactly that), and its README principles say "Motion conveys state… nothing loops decoratively". It is a paid-key front end, so there is nothing to install. The pattern is written in no row (grep gives 0).
  - Cap: a human screen recorder with auto-zoom. Our videos are made by agents, so nothing found.
  - The rest: nothing beyond what their rows already hold.
- Board:
  - **VoiceStudio → B43 (R23/R25) and B12 (H8).**
    - Stands now: VoiceStudio itself, placed.
    - Relation: `identical`, cloned as source and not built.
    - Use: the rows should say it is already cloned at `~/tools/VoiceStudio`, so the builder starts from `git pull` and builds there, not from a fresh clone.
    - First trial: the one H8 already writes (a blind listen of both studios' engines in Turkish, Gulf Arabic and English).
    - Stops at the CEO: K8 (the voice ruling, asked at setup); a client's voice needs written consent.
  - **Open Higgsfield pattern → B43, the studio surface (drawn under B32).**
    - Stands now: Open-Generative-AI and Freefield as candidate surfaces, with no written settings model.
    - Relation: `method`.
    - Use: the studio surface's model panel is generated from a per-model catalog (settings and media roles declared once).
    - First trial: none on its own; it is read into the surface's design when B32 draws the Media Studio screen.
    - Stops at the CEO: nothing (his eye on the design, as for every V2 screen).
  - Every other item already sits in its row, as listed above.
- The old verdict and reason: partly holds. "Only the useful ones are read in their own rows" is now done: all nine are placed except Cap, and Cap is hollow for us. But "Chatwoot, OpenProject, OpenWhispr, Cap, REA depoda geçmiyor" is outdated, and VoiceStudio is cloned on this machine, not just "known".
- Reader's first reading: Zaten kurulu / already placed. REA is installed; VoiceStudio is cloned and placed; the rest are placed. Gerek yok for Cap. Yöntem for the Open Higgsfield settings pattern.

## Commands run (decisive)
- `python3 -I` VTT de-duplication of `~/.cache/link-watch/EK11-ZJj4_egB30Q.tr.vtt` → 520 lines, read whole.
- `gh api repos/<11 repos>`; `gh api repos/umami-software/umami/releases/latest` → v3.5.0, 2026-11-12; `gh search code LLM_DOMAINS --repo umami-software/umami`; `gh api .../commits?path=src/queries/sql/getChannelMetrics.ts` → "add LLM channel logic", 2026-05-11; `gh api .../contents/packages/mcp/README.md`.
- `fetch.py --batch` (is-agentic.com /, /docs, /methodology) → 3/3; `curl /.well-known/agent-skills/index.json`; `npm view is-agentic`; `gh api repos/vercel-labs/is-agentic` → 404.
- `git -C ~/tools/VoiceStudio remote -v / log -1`, `du -sh`, checks for venv and node_modules; `docker ps -a` (no seo/voice/umami/chatwoot containers); greps over `.planning/board-rows/`, `00-BOARD-OPEN-WORK.md`, `STACK.md`, `REVENUE-OPPORTUNITIES.md`, `20261108-seo-aletleri/`, Web Studio file 9.

## Could not read
- e2-16: no transcript or frame sheet is on disk (only the mp4). The list comes from the old row and from h1.md's reading of the same list; the video was not re-processed.
- e2-03: the frames the old row mentions are not on disk, but the transcript is whole. Umami's demo screenshots and the "Site Flow / Answer Hope" product are not published, so they could not be checked. "Ask Trail" and "Answer Hope" are as heard in the transcript and their spelling is not confirmed.
- e2-04: the GitHub skill path the docs point to returns 404. The SKILL.md was found only through the site's well-known index and was not opened.
