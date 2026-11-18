# Reader b — rows W005 W008 W010 W018 W035 W044 W059 W066 W070 W071 W082 W087 W099 W106 W107 W108 W117 W120 W125

Read 2026-11-18. Nothing installed, nothing in the repository changed. `R` = `/home/dxb/DxB Global OS`; `C` = `~/.cache/link-watch/2026-10-08-whatsapp/transcripts`. Transcripts already on disk were read; no video was watched, downloaded or transcribed.

## W005 — Open Generative AI reel (a MuAPI front-end sold as a free Higgsfield rival); his note asks for OpenMontage; a frame's README points to AI-Youtube-Shorts-Generator
- **Opened:** `C/W005-DZdAXn7gHPs.txt` (35 s, whole); `gh api repos/Anil-matcha/Open-Generative-AI`; `gh api repos/SamurAIGPT/AI-Youtube-Shorts-Generator` (now redirects to `Anil-matcha/AI-Youtube-Shorts-Generator`), its README and last five commits; `gh api repos/mutonby/openshorts`; `R/.planning/board-rows/B43.md:175`, `B28.md:21,95-96`, `B83.md:108`; `today's rows/k1-g.md:120-160`; `/home/dxb/tools/OpenMontage/pipeline_defs/clip-factory.yaml` (exists).
- **Why it was eliminated:** second round 1/Gerek yok ("only an interface"); the revenue and turbo rounds lifted it to Dene for the Shorts-Generator. At the source the elimination holds, for different reasons.
- **His note:** "openmontage for studio — süper higgsfield e alternatif bedava repo"
- **What is in it:** Open-Generative-AI: 35,298★, MIT, pushed 2026-11-18; its description says "No content filters"; it runs paid models through a MuAPI key. AI-Youtube-Shorts-Generator: 6,249★, MIT, pushed 2026-11-12. Its last five commits (2026-11-03 → 11-12) only edit README video links. Default `--mode api` needs a MuAPI key. `--mode local` uses yt-dlp, faster-whisper and OpenCV face crop, and for the highlight step an OpenAI or Gemini key. The README's feature list names no burned-in captions, no MCP or API server and no editor.
- **What we have:** OpenMontage is installed at `/home/dxb/tools/OpenMontage` (`B28.md:21`), which is identical to his note. Open-Generative-AI is already placed as a studio-surface trial at `B43.md:175` (2026-11-17). For the long video → shorts job, OpenShorts (`mutonby/openshorts`, 9,127★, MIT core, pushed 2026-11-18) stands beside OpenMontage `clip-factory` at `B28.md:95`, with Opus Clip as the paid twin at `B28.md:96`. The same cutter serves H4 at `B83.md:108`.
- **What it has that we do not:** nothing found. The Shorts-Generator does less than OpenShorts, which has word-level captions, SPLIT and SCREENCAST layouts, an MCP and REST server and a clip editor (`k1-g.md`). The Shorts-Generator is also MuAPI-first.
- **Board:** B28 (H6) · OpenShorts beside clip-factory, Opus Clip as paid twin (`B28.md:95-96`) · **none** · — · — · nothing.
- **The elimination:** holds. OpenMontage is installed, Open-Generative-AI is placed in B43, and Higgsfield is out by his order. The Shorts-Generator is weaker than the OpenShorts already on the row.
- **Reader's first reading:** Gerek yok (OpenMontage: Zaten kurulu).

## W008 — Sebastian Hardy carousel: ten GitHub repos
- **Opened:** the October row; its 12 slides were read in October (`~/.cache/link-watch/2026-10-08-whatsapp/carousel/W008-DZF8UxhDM9d`) and were not re-read. `gh api` for all ten repos (2026-11-18). Stirling-PDF's LICENSE and latest release. `R/.planning/research/STACK.md:27,111,125`; `B30.md:16`; `B83.md:138`; the B27 board line (`00-BOARD-OPEN-WORK.md:134`); `which pdftotext gs libreoffice`.
- **Why it was eliminated:** 1/Gerek yok, and it was never in Öncelikli. The old reasons were that our crawlers cover it, that the frameworks are forbidden, and that STACK rejects Coolify. All three hold at the source.
- **His note:** none.
- **What is in it, item by item:**
  - **browser-use** (121,433★, MIT) and **Crawl4AI** (87,526★, Apache-2.0): both are approved in B30's arsenal (`B30.md:16`, CEO-OK open-source-arsenal-2026-08-19) and not yet installed. B30 already owns them, so they are **identical**.
  - **OpenHands** (93,758★), **Dify** (161,439★), **Langflow** (156,747★): each is a second agent framework or job runtime, which STACK forbids. No part of them was found that we lack.
  - **Open WebUI** (159,038★, its own licence): a multi-model chat UI. As a client service it is the same road as LibreChat on the later list (`B83.md:138`). For the holding, the dashboard and Hamza do this job.
  - **Maxun** (18,514★, AGPL-3.0, "turn any website into a structured API … monitor"): the same job as Firecrawl, Crawl4AI and changedetection.io, all already approved at `B30.md:16`. **none**.
  - **Coolify** (66,225★): rejected by `STACK.md:125` (about 1.2 GB idle on this box). Dokploy is the choice if a PaaS UI is ever wanted (`STACK.md:111`).
  - **Supabase**: our stack, so **identical**.
  - **Stirling-PDF** (96,942★, MIT outside its proprietary folders, v3.3.0 of 2026-11-05): a PDF toolbox server. We have pdftotext, ghostscript and LibreOffice, and no row has an unowned PDF job. The nearest row is B27: the official document skills cannot be installed, and "His choice is open: keep what already works, or name a route the licence allows". If he ever names a route for the PDF part, Stirling is a licence-clean candidate. It is not proposed now.
- **What we have / what it has that we do not:** see the items. Nothing found.
- **Board:** B30 (browser-use, Crawl4AI are already there) · **identical / none** · nothing.
- **The elimination:** holds. Each item is either already on B30, forbidden by STACK, or our own stack.
- **Reader's first reading:** Gerek yok.

## W010 — Manthan, "stop prompting, write loops": /loop polling and dynamic loops, a trend scraper, a carousel loop
- **Opened:** `C/W010-8LHvQTF-Meo.txt`, read whole (00:00-14:00). `gh api repos/agentskills/agentskills` and its README. `B43.md:157`, `B28.md:70,76-80`, `B30.md:68`, `B84.md:259`, `REVENUE-OPPORTUNITIES.md:231`. `~/.claude/skills/dxb-motion-graphics/references/craft.md:54` and `R/tools/motion-graphics/lib/check.mjs:117-122,282`.
- **Why it was eliminated:** second round 1/Gerek yok; the revenue and turbo rounds gave Dene for the scraper and carousel loops. It partly holds.
- **His note:** "Agentskills repo."
- **What is in it:**
  - A polling loop: `/loop` every 2 minutes reads GitHub issues → fix → build and lint until green → PR → merge → close (04:47-08:46). The done condition is written into the issue (06:00).
  - A dynamic loop with three inner loops (09:21-13:21): code review until zero findings → build and lint until green → browser verification. For the browser step he uses Vercel's agent-browser, "much more context or token efficient" than Playwright MCP (12:29).
  - An Instagram reel scraper on a 2-minute loop that scores outliers and rewrites the top reel's script "in my brand voice" (01:02-01:26).
  - A carousel loop that picks topic and angle itself and verifies that "every single text block sits inside the save zone, nothing is overlapping" before committing (01:26-01:58).
  - The word "agentskills" never occurs in the transcript (grep: 0).
- **What we have:**
  - The loop pattern: dxb-team3 and dxb-verify (lead, checker, evidence before done). `B84.md:259` already chose one pg-boss job per URL over `/loop`.
  - agent-browser is placed at `B30.md:68`.
  - Outlier scoring is SIGNAL (`B43.md:157`) and §D #22's format research (`REVENUE-OPPORTUNITIES.md:231`), with Nichle as the paid twin (B43, 2026-11-18 leg).
  - Rewriting another creator's viral script is not taken: our style file is "inspiration, never a copy" (`B28.md:76-80`).
  - The Agent Skills spec (`agentskills/agentskills`, 27,430★, Apache-2.0, a folder with a `SKILL.md`) is the format our skills already use. It is **identical**.
- **What it has that we do not:** one small thing: an automatic check that each carousel slide's text blocks sit inside the platform's safe zone and do not overlap. What we have instead: `craft.md:54` tells the maker to keep words clear of the interface, and `mg check in-frame` measures a film's subject against a margin (`check.mjs:117-122`). Nothing measures text boxes on stills or carousels.
- **Board:** B28, the social-media-team leg (`B28.md:70`: "the week's videos, carousels and captions").
  - What stands there now: nothing checks where carousel text sits.
  - Relation: **method**.
  - Use: every slide is rendered as HTML at the platform size, and a script checks it before the approval queue: each text box's bounding box lies inside the platform safe zone, and no two boxes intersect.
  - First trial: one 5-slide carousel for a holding line with two planted faults (an overflowing line, a box under the profile strip). Decided by whether both are caught and whether there is any false alarm.
  - Stops at the CEO: nothing.
- **The elimination:** partly holds. The loop lesson and the scraper are already ours; the safe-zone check is small and missing.
- **Reader's first reading:** Yöntem (small).

## W018 — two web-design tutorials: Metics Media "Build $10,000 Websites using Claude Code" (26 min) and Yıldız Dikme "Claude ile Premium Web Siteleri Yapmanın Sırrı" (11 min)
- **Opened:** YouTube oEmbed for both titles. `C/W018-VMvZuhcDdnw.txt` holds only "TRANSCRIBE_FAILED". **The 7-minute transcription the October reader made is not on disk** (searched `~/.cache/link-watch` and `R/.planning`), and p9pPveeSOCQ was never on disk. So only the October readers' summaries were read (`rows/1-batch1.jsonl`, `gelir-turu/rows/g2.jsonl`); the content is **UNVERIFIED at the source**. Also read: `B84.md:57,61,62,119`; `REVENUE-OPPORTUNITIES.md:196-216`.
- **Why it was eliminated:** 1/Gerek yok, later Dene ("the tools are in hand, the price is measured, only a portfolio is missing"). It holds.
- **His note:** "claude webçileri"
- **What is in it (per the October readers):** UI UX Pro Max, frontend-design and 21st.dev; one prompt with "ask clarifying questions"; eight things that separate a $10k site from a template (point of view, type, colour, hierarchy, imagery, motion, mobile, the invisible things); a good brief names the brand, palette, type, audience and tech. "$10,000" is the title's slogan.
- **What we have:** B84 DxB Web Studio has all of this and more: a build brief with every decision made (`B84.md:57`), a creative director who writes three directions (`B84.md:61,119`), the shared design cupboard (`B84.md:62`), and H5 prices from the 2026-11-04 deep study (`REVENUE-OPPORTUNITIES.md:203-216`).
- **What it has that we do not:** nothing found in what could be read.
- **Board:** B84 · build brief, director, design cupboard · **none** · — · — · nothing.
- **The elimination:** holds. B84 has gone well past these lessons since 3 November.
- **Reader's first reading:** Gerek yok.

## W035 — Justyn Berkovits: a Claude Cowork set-up (global instructions, about-me, memory, writing rules, connectors, skills)
- **Opened:** `C/W035-DYxkUorPZ-T.txt` (37 s, whole); `B84.md:299`; `B28.md:107`.
- **Why it was eliminated:** 0/Gerek yok, then Dene for the writing rules taken from Wikipedia's "Signs of AI writing". It holds.
- **His note:** none.
- **What is in it:** a step-by-step paste set-up and "writing rules so you don't get AI slop" (00:23-00:33). The full guide is behind a comment.
- **What we have:** the same Wikipedia page is the source of humanizer (`blader/humanizer` v4.0.0, 26 patterns), placed beside stop-slop in B84's copy step (`B84.md:299`). `about-me.md` and `voice.md` per brand are placed at `B28.md:107`. CLAUDE.md and the memory files cover global instructions and memory.
- **What it has that we do not:** nothing.
- **Board:** B84 copy step · stop-slop + humanizer · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Zaten kurulu (placed).

## W044 — Scroll World skill (oso95/scroll-world and the cth9191 fork): a Higgsfield-made "fly through the world" scroll page
- **Opened:**
  - `gh api` for oso95/scroll-world (11,057★, MIT, last push 2026-07-29) and cth9191/scroll-world (569★, MIT, last push 2026-07-09), and the fork's README.
  - Our copy at `R/tools/scrollcraft/skill` (grep): `references/worldflight.md:177-186,306`, `references/assets.md:46,142-154`, and `engine/scrollcraft.js` (Low Power, saveData, blob, device tiering).
  - `C/W044-KBH8P0z2AL8.txt` skimmed for the method and figures; `REVENUE-OPPORTUNITIES.md:204`.
- **Why it was eliminated:** 2/Gerek yok ("we have the mechanics"); the revenue round gave Dene (sell 3D scroll pages for 1,500-8,000 $). It holds.
- **His note:** none.
- **What is in it:** beyond Higgsfield, the fork adds:
  - connector clips made from the neighbours' actual encoded frames;
  - an automated SSIM seam gate;
  - a previz draft pass and budget tiers;
  - an iOS Low Power Mode fallback, device-class tiering, data-saver handling and blob-URL loading;
  - a crawlable SEO block.
  
  The narrator's run took 4 scenes, 10 generations and 32 minutes, and his complaint was hard cuts between scenes (06:02-07:30).
- **What we have:** scrollcraft's worldflight already holds most of this:
  - "Seam frames come from the encoded mp4" (`worldflight.md:306`) and a PSNR seam check (`assets.md:46`).
  - Low Power, saveData, blob loading and device tiering in `scrollcraft.js`.
  - An SEO block (`assets.md`, `worldflight.md`).
  - The draft-first pass is the holding's Law D.
  
  The revenue road is already in H5: a 3D campaign microsite, and as its first trial a 3D hero section on the holding's own site (`REVENUE-OPPORTUNITIES.md:204`).
- **What it has that we do not:** nothing. SSIM against PSNR is the same check by another measure.
- **Board:** B84 / H5 · scrollcraft (installed) · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Zaten kurulu.

## W059 — Bennett Spooner's 37-agent set-up (paperclip + Hermes + headless Claude Code) and his note on jcode
- **Opened:**
  - `C/W059-DbsM7RMBSzo.txt` (72 s, whole).
  - `R/.planning/research/rival-intel/35-dbsm7rmbszo.md` (header) and `08-paperclip-repo.md` (exists).
  - `gh api` for 1jehuang/jcode (21,889★, MIT, pushed 2026-11-18, release v1.0.1 the same day) and its README: the RAM table at lines 60-70, OAuth at lines 112-114.
  - `gh api` for paperclipai/paperclip (114,793★, MIT).
  - `free -g` (30 GB on this machine) and the B62 board line.
- **Why it was eliminated:** never taken into Öncelikli (Araştır). It holds.
- **His note:** "jcode harness very light harness"
- **What is in it:** jcode's README table "RAM per additional session (headless)": jcode about 3.3 MB, Claude Code about 169.3 MB (the author's bench, `scripts/bench_headless_memory.py`). It "Supports … Claude OAuth and OpenAI Codex OAuth". The README carries a YC S26 badge. Bennett's set-up and paperclip are covered by rival report 35 and source 08.
- **What we have:** Claude Code and the Agent SDK as the only harness; our hooks, doors, prompt gate and effort settings are all Claude Code's.
- **What it has that we do not:** less RAM per session, by the author's figures. By that table, ten extra headless sessions would save about 1.7 GB on a 30 GB machine. Memory pressure has been real here (B62: an OOM kill on 2026-09-26). But that RAM, not the subscription quota, limits how many sessions run in parallel was not measured (**UNVERIFIED**). Whether Anthropic's terms let a subscription's OAuth run in a third-party harness was not read today (**UNVERIFIED**).
- **Board:** no row; the nearest are B51 (harness and cost) and B62 · relation **none** · nothing.
- **The elimination:** holds. jcode would be a second harness, and our hooks and doors would be left behind, for a RAM saving we have not shown we need. His question answered: jcode is real, light and MIT.
- **Reader's first reading:** Gerek yok.

## W066 — two revenue reels: (1) selling Exelo AI receptionists to local businesses; (2) a Viblo "ranking" compilation channel built from TikTok clips
- **Opened:** both transcripts whole (`C/W066-Db1W0XYSKzb.txt`, `C/W066-DZtimcOOUdb.txt`); exelo.ai and viblo.ai home pages (fetch.py, 2026-11-18); `REVENUE-OPPORTUNITIES.md:201,208,237,244,247,302,309`; `B83.md:102-104`; the R5 file (path under W108).
- **Why it was eliminated:** 1/Gerek yok; revenue and turbo gave Araştır. It holds.
- **His note:** "kanaldan para kazanma"
- **What is in it:**
  - **Exelo** (Db1W0XYSKzb), the flow: city + trade search → an "x-ray" of the business, which shows "losing $42,000 a month" → deploy the AI receptionist → a test call → an auto-written proposal e-mailed to the owner (00:28-01:52). The speaker charges "$3,000 a month". exelo.ai today: "Sell AI receptionists to local businesses … You sell it. Exelo runs it."; $27 for the first 14 days; the renewal price is not shown.
  - **Viblo** (DZtimcOOUdb): ranking compilations of other people's TikTok clips, added "without a watermark" (00:48-00:55), one Short a day. The speaker's figures: 3.3 B views, 19 M hours, +1.4 M subscribers, $260,000 profit, "$5,000 this week" (00:04-01:03).
- **What we have:**
  - **Exelo's road is ours already.** H7's receptionist is at `REVENUE-OPPORTUNITIES.md:237`, with Dialzara and GoHighLevel as paid twins (`B83.md:102,104`).
  - The find → audit → demo → offer flow is in §D: #21's outreach machine (`:201`), #23's secret-shopper audit (`:244`) and the live demo as the first contact (`:247`).
  - A scare "loss" figure is refused by the honest-marketing prompt (`:208`) and by the October Islamic-boundary note.
- **Viblo is closed three ways:**
  - his İ1: Shorts ads, no (`REVENUE-OPPORTUNITIES.md:302`);
  - the clip marketplace is in "Geçmeyenler" (`:309`);
  - YouTube's own inauthentic/re-used content rules in the R5 file.
  
  Taking others' clips without the watermark is also kul hakkı.
- **His note answered:** the channel line is H4 (#20, B83), and it earns from long-form ads only (İ1).
- **What it has that we do not:** nothing.
- **Board:** B83 H7 · desk + Dialzara/GHL · **none** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Gerek yok.

## W070 — Akın Yılmaz: DeepSeek V4 against Claude, "116×" cheaper on the same job, a "12-point" quality gap
- **Opened:**
  - `C/W070-DblSUttoWjg.txt` (37 s, whole).
  - DeepSeek's pricing page `api-docs.deepseek.com/quick_start/pricing` (curl, 2026-11-18).
  - OpenRouter's `/api/v1/models` (2026-11-18).
  - In the repository: `HOLDING-OS-MASTER-PLAN/MODEL_ROUTING_SPEC.md:142,148`; `R/vps/litellm/config.yaml:15-16,25,30-31`; `STACK.md:57,127`; `B51.md:16,101`; `B34.md:16`.
- **Why it was eliminated:** 1/Gerek yok; the revenue round gave Dene ("route mechanical work to Flash, off-peak"). It holds, because the October premise changed.
- **His note:** none. **The lead's order:** no raw provider keys (STACK).
- **What is in it:**
  - The video shows no task and no metric for "116×" or "12 points"; those are the speaker's figures. Its real point: a cheap model that burns more tokens loses the saving, so count retries, total use and quality (00:19-00:30).
  - DeepSeek's official prices today, per 1M tokens:
    - deepseek-flash (V4.1-Flash-1017), off-peak: $0.15 in, $0.003 cache hit, $0.60 out.
    - V4-Pro, off-peak: $0.66 in, $0.022 cache hit, $1.98 out.
    - Peak is double: 01-04 and 06-10 UTC on weekdays.
    - The legacy name `deepseek-v4-flash` is now served by V4.1-Flash.
- **What we have:**
  - L4 mechanical work goes to Jev first, Sonnet 5.5 medium on doubt, with the local model's seat reserved (`MODEL_ROUTING_SPEC.md:142`). DeepSeek V4 Pro is held `mechanical_only` for bulk reads; DeepSeek V4 Flash is `retired` and `banned` (`:148`). **The October premise, "deepseek-v4-flash is active", is no longer true.**
  - The video's lesson, total cost per accepted result rather than token price, is already our standing measure: "cost per accepted change" (`B34.md:16`, `B51.md:101`).
  - Keys: DeepSeek reaches us only through LiteLLM → OpenRouter, with the key in LiteLLM's environment (`config.yaml:30-31`, `STACK.md:57,127`). No agent holds a provider key, and none is needed for any trial.
- **Found while measuring (for B51 move 2, "turn the meter on"):**
  - `config.yaml:25` records `deepseek-v4-pro` at $0.435 in / $0.87 out per M (July). OpenRouter lists `deepseek/deepseek-v4-pro` today at $0.90 in / $1.50 out.
  - DeepSeek's off-peak half price is for its own API. OpenRouter instead lists separate `:batch` variants (for Flash). Whether off-peak pricing applies through OpenRouter: **UNVERIFIED**.
  - `config.yaml:15-16` still routes `deepseek-v4-flash` although the roster bans it.
- **What it has that we do not:** nothing.
- **Board:** B51 · the L4 roster and the cost-per-accepted measure · **identical** (method) · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Gerek yok.

## W071 — "six free replacements for Higgsfield": Wan2GP, Remotion, HyperFrames, Open-Sora 2.0, HunyuanVideo, LTX-2
- **Opened:** `C/W071-DcAT9zPD0Cn.txt` (43 s, whole); `gh api repos/deepbeepmeep/WanGP` (12,010★, licence NOASSERTION, pushed 2026-11-17); `R/.planning/research/study-cards/wan2gp.md` (lines 1-12); `B33.md:16`; `B28.md:17`; `B43.md:175`; the dxb-motion-graphics skill.
- **Why it was eliminated:** 2/Gerek yok ("all already recorded"); the revenue round gave Dene ("Wan2GP not installed"). It holds.
- **His note:** "local higgsfield"
- **What is in it:** six names and a paste-in prompt ("check my system, install, download the right model for my GPU").
- **What we have:** this very reel is rival-intel source 37. The Wan2GP study card was filled from it on 2026-08-19 (`wan2gp.md:3`, Status STUDY), and all six names are placed:
  - HyperFrames is the engine of dxb-motion-graphics, installed.
  - Remotion is kept as the fallback engine (B43, row w089 bullet).
  - Wan2GP, LTX, HunyuanVideo and Open-Sora are B33's unmeasured local engines (`B33.md:16`) and are among B28's five-candidate exam (`B28.md:17`).
  - Wan2GP is also Open-Generative-AI's local engine (`B43.md:175`).
  
  His "local Higgsfield" is answered in B43: ComfyUI + MiniMax H3 on our card, with Open-Generative-AI, Freefield and InvokeAI as surfaces to try.
- **What it has that we do not:** nothing. The only thing missing is the exam that is already on the board.
- **Board:** B33 · the local-engine exam not yet run · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Zaten kurulu (placed).

## W082 — Harry Sanders, "my SEO tool stack"
- **Opened:** `C/W082-DbSfnc9TZ7q.txt` (32 s, whole); `B84.md:88-96`; trustindex.io `/pricing/` and `/prices/`, freesov.com `welcome.php` and seogets.com (all via fetch.py, 2026-11-18); `gh search repos freesov` (no repo).
- **Why it was eliminated:** 2/Araştır, then İzle ("a tool list"); never in Öncelikli. The list holds; one item does not.
- **His note:** none.
- **What is in it:** backlinks with Ahrefs/Semrush · heat maps with Clarity · keyword research with DataForSEO · reviews with Trustindex · search performance with Search Console or SEO Gets · content briefs with Claude plus a custom skill · site crawl with Screaming Frog · schema from Schema.org · AI search visibility with Peec or Free SOV · GA4 · "I would not give a flying f*** about my page speed".
- **What we have:** B84's core: Screaming Frog, DataForSEO, Search Console (mcp-gsc), GA4, Clarity, Ahrefs Free, the schema gate and OpenSEO (`B84.md:89`). Ahrefs/Semrush and Peec/Profound are the paid options (`B84.md:94`). The AI-visibility arm tries Elmo against OpenSEO + DataForSEO (`B84.md:91`). Speed is checked by CrUX and Lighthouse CI.
- **What it has that we do not:**
  - **Trustindex.** Review widgets from 130+ platforms (Google, Booking.com, Tripadvisor, Yelp …). Prices read 2026-11-18: a free plan; $65 / $125 / $349 a year, the last with unlimited companies (agency); AI auto-replies at $29 per source per year. Nothing of ours shows a client's reviews on the client's site; `maps.py` reads only the rating and the count.
  - **SEO Gets** (GSC + GA4 analytics with an MCP): **none**, because mcp-gsc and the OpenSEO panel do the job.
  - **Free SOV:** a closed, hosted site that takes your own DataForSEO and LLM keys. It tracks mentions, citations, query fan-out and sentiment across ChatGPT, Claude, Gemini, Perplexity and AI Overviews. Handing our keys to a third-party site breaks `STACK.md:127`, and B84's AI-visibility arm already owns the job, so **none**.
- **Board (Trustindex):** B84 (H5 client sites; also H1's lead sites).
  - What stands there now: nothing.
  - Relation: **new**.
  - Use: a reviews section on a local client's site, fed from the client's own Google Business Profile (B84 already plans GBP access). Trustindex's free plan is the twin for the platforms GBP does not cover (Booking, Tripadvisor).
  - First trial: one demo page for a holding line, with our own section built from the GBP reviews API beside Trustindex's free widget. Measured: freshness, page weight and Lighthouse score, fit with the house style, then his eye.
  - Stops at the CEO: the Trustindex account (identity) and any paid plan (money out); the client's GBP access needs the client's consent.
  - That the GBP API's reviews endpoint is available today: **UNVERIFIED**.
- **The elimination:** partly holds. The list is ours already; one gap remains (reviews on the client's site).
- **Reader's first reading:** Gerek yok for the list · Trustindex: Dene (small).

## W087 — David Feldman, "five free SEO tools I use every day"
- **Opened:**
  - `C/W087-DcewaU1NSPB.txt` (36 s, whole).
  - linkgap.io (fetch.py): a lead-magnet form by HeyTony, "Analyzing 500+ backlinks per site", report sent by e-mail.
  - gmbspy.com: **not read**, the curl timed out (exit 28). AnswerThePublic was not fetched.
  - `R/.claude/skills/dxb-research/scripts/maps.py:116-140`; `B84.md:89-96,284`; `B83.md:112-114`.
- **Why it was eliminated:** 1/Gerek yok, then İzle. It partly holds.
- **His note:** none.
- **What is in it:** linkgap (a competitor's backlinks) · AnswerThePublic (the questions people ask) · Search Console · GMBspy (a competitor's Google Business Profile, "how they're optimizing for local SEO") · a fifth tool held back behind a comment.
- **What we have:**
  - Links: the Common Crawl domain graph against DataForSEO (`B84.md:91`).
  - Questions: Trends, Suggest and ChampSignal (`B84.md:96`).
  - GSC: mcp-gsc (`B84.md:89`).
  - GBP: `maps.py` returns a single category, `category = _at(p, 13, 0)` (`maps.py:131`).
- **What it has that we do not:** a competitor's full category list, primary plus secondary. That list is the usual evidence for "why is the rival above you on the map". `maps.py` keeps only element 0 of `p[13]`. Whether `p[13]` holds the secondary categories is **UNVERIFIED**; it was not run.
- **Board:** B84 (the 1-10 outreach audit, `B84.md:284`) and H1's discovery (`B83.md:112`).
  - What stands there now: `maps.py` with one category.
  - Relation: **method**.
  - Use: `maps.py` returns the whole category list, and the audit compares the prospect's categories with the top three in the map pack.
  - First trial: 5 known businesses in one niche; `maps.py` output against each business's profile read by hand. Do all the categories come back?
  - Stops at the CEO: nothing.
- **The elimination:** partly holds.
- **Reader's first reading:** Yöntem (small).

## W099 — Chase AI: an "agentic OS" in Claude Code (domains → skills → automations, Obsidian memory, a dashboard of buttons)
- **Opened:** `C/W099-DX8W-VIJVip.txt` (98 s, whole); `REVENUE-OPPORTUNITIES.md:264-281` (H9).
- **Why it was eliminated:** 1/Gerek yok, then İzle ("buttons for clients" touches REV #8/#9). It holds.
- **His note:** none.
- **What is in it:** daily and business tasks split into domains → each task becomes a skill → each skill an automation. Memory is an Obsidian vault in raw / wiki / outputs ("Karpathy's set-up"). Skills become "buttons on a dashboard that anyone can use … team … or even clients", with an observability panel.
- **What we have:** the holding is this at company scale: departments and personas, skills, the scheduler, the dashboard, and one plain-file memory (V2 memory, board §2d). graphify is installed. Selling the same thing to clients is H9 (#25) and REV #8/#9.
- **What it has that we do not:** nothing.
- **Board:** B83 H9 · identical · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Gerek yok.

## W106 — three revenue reels: Holo ad maker · a high-ticket affiliate Instagram account · Viblo clips from a MrBeast video
- **Opened:** all three transcripts whole (`C/W106-Dazpl3_s-Hl.txt`, `C/W106-DaEzZ1Tv-2C.txt`, `C/W106-DdP5sFmuvMe.txt`); tryholo.ai/pricing (fetch.py, 2026-11-18); `REVENUE-OPPORTUNITIES.md:152,174,302,309`; `B28.md:72,76-80,99`; a grep across the four 2026-11 link folders and the board for an affiliate-account method (0 hits).
- **Why it was eliminated:** 1/Gerek yok; revenue and turbo gave Araştır. The leader's question about clipping stayed open. It partly holds.
- **His note:** "revenue idea / revenue example check"
- **What is in it:**
  - **(a) Holo** (Dazpl3_s-Hl): paste a URL → it reads logo, colours, product and tone → ads, posts and e-mails, "a fresh batch every single day". Today: Starter $20.33/month (125 creations, 3 brand workspaces) and Scale $48.33/month (325 creations, 5 workspaces), lower on 6-month billing.
  - **(b) High-ticket affiliate account** (DaEzZ1Tv-2C), the system:
    1. a new Instagram account → pick a niche (00:05-00:21);
    2. sign up to an affiliate marketplace and pick a product paying "$500 to $1,000 per commission" (00:23-00:34);
    3. the link in the bio (00:36);
    4. faceless 5-7 second reels about the product, modelled on posts already proven to work (00:40-01:01);
    5. the speaker's figures: five sales a month "$5,000", ten "$10,000" (01:03-01:14).
    
    The reel ends in a "comment ready" DM funnel.
  - **(c) Viblo auto-clip of a MrBeast video** (DdP5sFmuvMe): 13.9 M views, +3,600 subscribers, "$2,000 in profit" in eight days (the speaker's screen, 00:39-00:48).
- **What we have:**
  - (a) Pomelli, the free URL → on-brand posts maker (`B28.md:99`); the brand-profile step (B28, 2026-11-18 leg); the ad factory (`B28.md:72`). Holo adds nothing, so **none**.
  - (b) In §D today, affiliate appears only as İ3 inside H2's directory (`:152`) and H3's store referral (`:174`). No account is built to earn from it. The comment-keyword → DM step already stands at `B28.md:76-80`.
  - (c) Closed: his İ1 says no to Shorts ads (`:302`); it uses someone else's video (kul hakkı); the clip marketplace is in "Geçmeyenler" (`:309`).
- **What it has that we do not:** (b), the affiliate account as a working income road.
- **Board (b):** B83, H4 revenue side (§D #20).
  - What stands there now: no affiliate road in H4.
  - Relation: **method**.
  - Use: the flow above, written into §D #20 with its video and minute. Content comes from the studio, and posting from the holding's own account at the key turn.
  - First trial: a desk test, 0 $. Ten halal candidate products from two affiliate marketplaces, with the commission, refund terms and the product's own page read, put before him for İ3.
  - Stops at the CEO: each product (İ3, his one-by-one approval); the Instagram account and each marketplace account (identity).
- **The elimination:** partly holds. Holo and the clip road stay out; the affiliate account is a runnable road under İ3.
- **Reader's first reading:** Yöntem (affiliate account) · Holo and Viblo: Gerek yok.

## W107 — Chase AI: GPT-6 Astra driving After Effects through Higgsfield's plugin (storyboard → beat prompt → revision)
- **Opened:** `C/W107-C8dWdic-oK4.txt` (516 s, whole). `gh api` for cth9191/after-effects-motion-prompts (32★, no licence, pushed 2026-09-13) and its file tree (`PROMPT-TEMPLATE.md`, `examples/*/build-prompt.md`, `examples/kite/history/01-04`, `examples/chase-ai/references/cadence.md`). From `~/.claude/skills/dxb-motion-graphics`: `SKILL.md:54`, `references/brief.md:16`, `references/storyboard.md`, `references/craft.md:134-139`.
- **Why it was eliminated:** never taken into Öncelikli (İzle). It holds.
- **His note:** none.
- **What is in it:**
  - Storyboard first, with images (01:50-02:27).
  - A detailed beat-by-beat prompt built from the storyboard and from reference films (04:12-05:48).
  - Revisions made by specific prompts, "two or three total iterations" (06:26-06:52).
  - Beats linger at 2.5-3 s unless the pacing is set (06:52-07:14).
  - A 15-second piece took 22:56.
  - Creative work is not left to a loop; keep a human in it (07:22-07:43).
  
  The After Effects bridge is Higgsfield's plugin, which is out by his order; After Effects has no Linux build.
- **What we have:** dxb-motion-graphics (2026-11-12) holds the same method:
  - a brief that takes reference films "with what is wanted from each — the pacing" (`brief.md:16`);
  - the storyboard step (`storyboard.md`);
  - every beat time in one `FILM.BEATS` block (`SKILL.md:54`);
  - pacing, "a beat every one to two seconds" (`craft.md:139`);
  - rounds to his eye.
  
  B43's 2026-11-17 and 11-18 legs add the effect vocabulary, Lemo-Opuscar and mg-styles-15.
- **What it has that we do not:** nothing found.
- **Board:** B43 · dxb-motion-graphics · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Zaten kurulu (method).

## W108 — Candi Grzegorczyk, what YouTube AdSense really pays
- **Opened:** `C/W108-DbYWpLMxFmk.txt` (162 s, whole); `R/.planning/quick/20261017-studio-platform-hub/R5-youtube-ai-rules-and-risks.md` (lines 1-20, YouTube's own pages read 2026-10-17); `REVENUE-OPPORTUNITIES.md:180-194`.
- **Why it was eliminated:** 1/Gerek yok, then Kur ("the channel line's budget model"). It holds.
- **His note:** "revenue"
- **What is in it (the speaker's figures):**
  - 12 M views paid $10,800, while a video of about 6 M views paid $12,500: watch time beats views.
  - 55/45 split; 1,000 subscribers + 4,000 hours; over 100 videos before monetisation.
  - Lifetime RPM $2.90, the best-paid video $2.10.
  - 508 M views, 3,200 videos, about $1.5 M. A family channel.
- **What we have:** R5 holds the same rules from YouTube's own pages, and more: 55 % on long-form against 45 % on Shorts; from 2027-02-01, 8,000 watch hours to enter the programme; a monthly Shorts minimum; the inauthentic-content rules. H4's line cites it (`REVENUE-OPPORTUNITIES.md:192`).
- **Found:** `REVENUE-OPPORTUNITIES.md:192` points to `.planning/research/R5-youtube-ai-rules-and-risks.md`, which does not exist. The file is at `.planning/quick/20261017-studio-platform-hub/R5-youtube-ai-rules-and-risks.md` (`find`).
- **What it has that we do not:** one creator's real RPM in a family niche ($2.10-2.90): a data point, not a target.
- **Board:** B83 H4 · R5 · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Gerek yok.

## W117 — ReStructure Brief, "the AI social media team that runs on one person"
- **Opened:** the same URL is row w008 of the 24 Sep - 16 Nov tab (`R/.planning/research/watch-links/2026-11-16-whatsapp/items.tsv:11`), which was read and placed then. Not re-fetched.
- **Why it was eliminated:** 2/Gerek yok, then Dene. It holds: the row is placed.
- **His note:** none.
- **What is in it:** research → weekly content in the brand's voice → approval queue → scheduling and replies → the one who asks the price is tagged as a lead → a morning report.
- **What we have:** `B28.md:70`, "The social-media team as a service (w008, w093-18, "Dene")", with this flow and its trial; also `REVENUE-OPPORTUNITIES.md:248`.
- **What it has that we do not:** nothing.
- **Board:** B28 · placed · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Zaten kurulu (placed; twin of w008).

## W120 — Alex Xu, "9 places to use Jev" + totec448-spec/chat-on-steroids
- **Opened:** twin rows i012 and i011 of the 16 Nov tab (`2026-11-16-whatsapp/items.tsv:36,100`). i011 was judged in `2026-11-16-whatsapp/recheck/h4.md:76-121`. `gh api` for chat-on-steroids (5,196★, MIT, pushed 2026-11-17). `STACK.md:28`; `HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md:355-361`; `B64.md:151`.
- **Why it was eliminated:** 1/Gerek yok, then İzle. It holds: both items are already settled.
- **His note:** none.
- **What is in it:** Jev, a typed decision model, used for routing, guardrails, triage and the like. chat-on-steroids: an Electron app, Chrome extension and local MCP that turns ChatGPT's web UI into a coding agent.
- **What we have:**
  - Jev is in `STACK.md:28` and in the doctrine (B64 decision 7; measured 69/70 at 0.3 s on 2026-10-13). It is L4's first hand (`MODEL_ROUTING_SPEC.md:142`) and the customer desk's sorter (`REVENUE-OPPORTUNITIES.md:245`).
  - chat-on-steroids: the app is not taken. Its handover prompt, finish marker and reviewer contract are placed at `B64.md:151`. A clone sits at `/home/dxb/tools/chat-on-steroids` (commit 8a1352b, 2026-10-10).
- **What it has that we do not:** nothing.
- **Board:** B64 / B51 · placed · **identical** · nothing.
- **The elimination:** holds.
- **Reader's first reading:** Zaten kurulu.

## W125 — marfinxx on X: "a Stanford group made Opus 5.5 the search manager and GPT-6.1 Sol the candidate generator"
- **Opened:** an arXiv API search (`abs:AtCoder AND abs:heuristic`, newest first); the arXiv HTML of 2610.05334 (fetched 2026-11-18); `gh api repos/mhdfb/AgentDiscover` (11★, no licence, pushed 2026-10-06) and its README. The X thread was read in October and not reopened.
- **Why it was eliminated:** 0-1/İzle ("no source"). It holds.
- **His note:** none.
- **What is in it, the probable source:** "AgentDiscover: Autonomous Discovery with Minimal Search Scaffolding", arXiv 2610.05334, dated 2026-10-04, by Texas A&M University.
  - **Matches the post:** "would have placed first among human competitors in seven past AtCoder heuristic contests"; the agent promoted "from proposer to planner"; lower model spend; reward-hackable evaluators found and corrected.
  - **Does not match:** the authors are at Texas A&M, not Stanford ("Stanford": 0 hits in the paper). Each task runs on one model: GPT-6 Sol at $10 per task for kernels and biology, Claude Opus 5 at $100 for algorithms and maths. The meta-agent experiment uses Opus 4.6 over Haiku 4.5. There is no Opus 5.5 manager / GPT-6.1 Sol generator pair, and no "3.2×" was found (the "3.2" hits are section numbers).
  - That this is the post's source: **UNVERIFIED** (inferred from the matches).
- **What we have:** a lead with a blind checker (dxb-team3, Sol); B51 (who does the work, who checks it).
- **What it has that we do not:** a discovery-search method (a graph database of ideas and candidates, an evaluator that steers) for score-optimisation problems; the holding runs no such search job. Its appendix on evaluator vulnerabilities was not read.
- **Board:** no row; the nearest is B51 · **none** · nothing.
- **The elimination:** holds. The paper exists, but the post misstates it, and it does no job of ours.
- **Reader's first reading:** Gerek yok.

## What I could not read
- W018: both videos' content (no transcript on disk; the October 7-minute transcription is missing). Judged on the October summaries.
- W087: gmbspy.com (curl timed out, exit 28); AnswerThePublic not fetched.
- W125: the X thread was not reopened; the paper's appendix on evaluator vulnerabilities was not read.
- W008: the carousel slides were not re-read (the names come from the October row and from `gh api`).
- Not established: GBP API reviews availability (W082); whether `maps.py`'s `p[13]` holds the secondary categories (W087); DeepSeek off-peak pricing through OpenRouter (W070); Anthropic's terms for subscription OAuth in a third-party harness (W059).
