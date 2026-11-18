# Reader a — 22 rows (tools and infrastructure), read 2026-11-18

Sources fetched today live in `$J/a-src/` (the READMEs pulled with `gh api …/readme`, plus the pages read through `fetch.py`).
No video was watched. Nothing was installed or signed into.
Paths: `R=/home/dxb/DxB Global OS`.

## W004 — Graphify (graphify knowledge graph, now Graphify-Labs/graphify) as a token saver for the construction sessions
- Opened: `$J/old/W004.json`; `gh api repos/safishamsi/graphify` (it redirects to `Graphify-Labs/graphify`); the README (542 lines) and its releases; the installed package `~/.local/share/uv/tools/graphifyy/…/graphify/` (`benchmark.py`, `install.py`, `querylog.py`, `affected.py`); `graphify --help`; `uv tool list`; `$R/.planning/graphs/BUILD.json`; MCP configs (server names only); `.claude/settings.json` grep. Not read: the reel (no video watching, by the brief).
- Why it was eliminated: the second round said "Gerek yok" because the tool is installed. The turbo round said "Dene" (a before/after token measurement) and the item never went into 'Öncelikli'. At the source this holds only half: the tool is installed, but the habit the reel sells ("query the graph before you open files") is not wired here, and graphify now ships the hook that wires it.
- His note: "token indirimi"
- What is in it: 150,120★, Apache-2.0, pushed 2026-11-17, latest release v0.9.112 (2026-11-17). `graphify claude install [--project] [--strict]` writes a graphify section into CLAUDE.md and a PreToolUse hook. Before Read/Glob/Grep (and cat/head/sed in Bash), the hook steers the agent to `graphify query` first. `--strict` denies the first raw read in a session until a graph query has been made (README l.259, l.303-311; the installed `install.py:288-307` already has it). The query log is opt-in (`querylog.py:16-30`). "Cut agent token spend by 80%" is a line advertising the paid Graphify Cloud (README l.33).
- What we have: graphifyy **v0.9.50** installed (`uv tool list`). The skill at `~/.claude/skills/graphify` is from **0.9.6**: every graphify call prints "skill is from graphify 0.9.6, package is 0.9.50". The repository graph `$R/.planning/graphs/` is code-only, 34,441 nodes and 59,873 edges, built 2026-11-11 at df766e8a (BUILD.json), and kept fresh by `pnpm graph:refresh` (closed row B23, board l.377). The `graphify-mcp` binary exists in `~/.local/bin`, but no MCP config registers it: global has playwright and context7, the project `.mcp.json` has scrapling and playwright. There is no graphify hook, only the permission `Bash(graphify *)` at `$R/.claude/settings.json:8`. `~/.cache/graphify-queries.log` does not exist, so how often sessions query the graph cannot be measured.
- What it has that we do not: (1) the query-first hook, which turns his "token indirimi" into a mechanism and not a habit; (2) the skill text is 0.9.6 against package 0.9.50 against upstream 0.9.112, so sessions are told about an older tool than the one installed. A caution on the numbers, measured in the installed `benchmark.py:85-120`: `graphify benchmark` estimates the corpus as nodes × 50 words and compares it with one query's subgraph. "75x"-type figures therefore compare the graph against reading the whole repository, which no session does. They are not a session saving.
- Board: **B51** (move 7, cost down; its 2026-11-18 leg already files the construction's own cost tools there because "this row owns what the work costs") · stands now: nothing steers sessions to the graph; the graph is built and refreshed (B23 closed) · **method + second** (the hook beside today's free reading) · use: `graphify claude install --project` on a scratch worktree only, never on the live repository first · first trial: five construction questions with known answers, e.g. "who reads the Agent SDK result without checking `is_error`" (B65 names eight readers by hand, board l.143). A fresh Opus 5.5 session answers each question with the hook and without it. Compare input+output tokens from the transcript `usage`, minutes, and answers right out of 8. The hook stays only if tokens fall and recall does not. Second home **B42**: the skill/package/upstream version gap. · stops at the CEO: the hook writes a CLAUDE.md section and a hook that every session loads, which is a standing change to the opening layer, so it needs his word. The trial on a worktree needs only his word to start the work.
- The elimination: partly. "Installed, nothing new" is true for the tool and false for his note: the token-saving mechanism exists upstream and is not wired here.
- Reader's first reading: Dene

## W011 — Oh My Pi (can1357/oh-my-pi): a coding-agent harness tuned for non-Claude models
- Opened: `$J/old/W011.json`; `gh api repos/can1357/oh-my-pi`, releases; the README (725 lines: §"Every tool, benchmaxxed", §02 LSP, §06 advisor, §10 review, §11 hashline, the provider list); `$R/.planning/board-rows/B51.md:60-111`; the October dispute line `turbo/ihtilaf-fable.md:6`.
- Why it was eliminated: "İzle". The gains are claimed for cheap models editing code, and the machine sends no code to cheap models. This holds at the source.
- His note: "Oh My Pi 100x claude — çok önemli"
- What is in it: 39,405★, MIT, pushed 2026-11-18, v18.22.2 (2026-11-18), about 80,000 lines of Rust. The README's measured table covers the edit format on Grok Code Fast 1 (6.7 % → 68.3 %), Gemini 3 Flash (+5 pp over str_replace), Grok 4 Fast (−61 % tokens) and MiniMax (2.1×), all the author's own runs on non-Claude models. "100x" appears nowhere in the README (grep count 0). Also: LSP on every write, a debugger, an "advisor" second model reading every turn (§06), P0-P3 review (§10), 60+ providers.
- What we have: Claude Code with Opus 5.5 and Fable 5.2 writes the code (STACK.md l.21). Claude's own edit tool is the one the table beats only for other vendors' models. The advisor idea is already on the board as Anthropic's official advisor tool `advisor_20260301` (`B51.md:106`, "To look into"). The review is Sol plus `dxb-verify`.
- What it has that we do not: nothing that serves a Claude-written codebase. Its gains belong to a cheap-model coding lane that no row plans. B51 move 7 is about cheap models for cheap *work*; code stays at high (B51.md:51).
- Board: no row takes it. Nearest is B51 (the advisor idea is already at B51.md:106) · Claude Code · none · — · — · nothing.
- The elimination: holds. A second coding harness for models we do not code with; "100x Claude" is not the repository's claim and should be told to him as such.
- Reader's first reading: Gerek yok

## W016 — Google AI Studio "Build" mode: an app from a sentence (React/Node web, Kotlin/Compose Android)
- Opened: `$J/old/W016.json`; today's reading of AI Studio as a builder `$R/.planning/research/watch-links/2026-11-18-recheck/rows/k3-g.md:43-62` (k3-24); `k1-d.md:34` (Google AI Pro cancelled 2026-10-18); `~/.local/share/dxb/skills/expo/SOURCE.md`; `REVENUE-OPPORTUNITIES.md:288`. Not re-fetched: the AI Studio doc. Today's k3-24 had read the product side, and nothing in this row depends on a new fact from it.
- Why it was eliminated: "İzle". We already build with Claude Code, and the only gain is demo speed. It holds.
- His note: "googlestudionun yeni özelliği app yapabilirsin"
- What is in it: as the October row read it from the official doc: React+Node or Kotlin/Jetpack Compose, one-click Cloud Run.
- What we have: today's reading already judged Google AI Studio and Antigravity as builders → **none** for B84 (`k3-g.md:59`), with Antigravity installed at `~/.local/bin/agy` (1.5.0). For mobile apps the Expo skill set is shelved at `~/.local/share/dxb/skills/expo` ("Mobile apps: board B17 idea 22", SOURCE.md), and the app/SaaS revenue line is `REVENUE-OPPORTUNITIES.md:288`. The October's "Google AI Pro account (we have it)" is no longer true: it was cancelled 2026-10-18 (`k1-d.md:34`).
- What it has that we do not: nothing found. A native Kotlin output is the one difference, and no row needs native Android over Expo.
- Board: B84 / B17 idea 22 · Claude Code seats + shelved Expo skills · none · — · — · nothing.
- The elimination: holds. Already judged "none" today in k3-24.
- Reader's first reading: Gerek yok

## W017 — UI UX Pro Max skill + 21st.dev Magic MCP (now "21st MCP")
- Opened: `$J/old/W017.json`; `ls ~/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/` (2.13.0, 2.15.0); `gh api …/ui-ux-pro-max-skill` and releases; `recheck/eliminated-identical.txt` (k3-15) and `inv/k3a.tsv:84`; `gh api repos/21st-dev/magic-mcp` and its README; `https://21st.dev/pricing` through `fetch.py`; `$R/.planning/board-rows/B84.md` (grep component/template/cupboard, l.30, l.236, l.270); `study-cards/aceternity-refero-mobbin-godly.md` (a STUB, inspiration galleries).
- Why it was eliminated: the second round said "Gerek yok" because our own design rules govern the CEO's surfaces. That reason was about the OS's own screens, not client sites.
- His note: "21devtool"
- What is in it: UI UX Pro Max: 151,300★, MIT, v2.15.0 (2026-08-13). **21st MCP**: magic-mcp (6,589★, ISC, pushed 2026-09-09) is now a compatibility proxy. The live server is `https://21st.dev/api/mcp` with an `x-api-key`, and old Magic keys were reset. Tools: catalog search over components, themes and templates; `get_component`; logo search. `generate` only with the paid AI add-on (README "AI access"). The repo calls it 10,000+ React/Tailwind components. Prices read today: free accounts copy **2 components a day** (web, MCP and CLI alike); Builder is **$6 a month billed yearly ($72)** for unlimited copies; 21st AI is extra.
- What we have: UI UX Pro Max **identical, installed at `~/.claude/plugins/cache/ui-ux-pro-max-skill/ui-ux-pro-max/2.15.0`** (disabled), the same version as upstream's latest release. Today's tab marked it identical (k3-15). For components, B84 has the style cupboard (`.planning/quick/20261102-tarz-dolabi/DESIGN.md`, B84.md:30), open-design's 151 design systems to try (B84.md:236), the taste-skill inspector (B84.md:193) and the frontend-design plugin. No catalog of ready interactive components is wired anywhere (grep for 21st/shadcn/magicui in board-rows, web-cupboard, study-cards: only the inspiration STUB).
- What it has that we do not: an agent-searchable catalog of community-made, ready interactive sections (heroes, pricing, testimonials, motion), pulled into the build by MCP. Our seats write every component from a blank page against the cupboard.
- Board: **B84** · stands now: style cupboard + taste-skill + open-design material (to try), no component catalog · **new** · use: in a B84 build, the builder searches 21st for the section type, takes one component, and adapts it to the client's cupboard tokens · first trial: on the first bench site, two sections (hero, pricing) built (a) from scratch by our seat and (b) from a 21st component adapted to the cupboard. Judge by the taste-skill inspector's findings, minutes, and his eye on the two side by side. Two components a day on the free account is enough for the trial. · stops at the CEO: a 21st account (identity step); the $6/month Builder plan only if the trial wins (money out).
- The elimination: does not hold for 21st; holds for UI UX Pro Max (identical, installed).
- Reader's first reading: Dene (21st MCP) · Zaten kurulu (UI UX Pro Max)

## W024 — NotebookLM + two Chrome extensions: analyse a whole YouTube channel's hooks and topics
- Opened: `$J/old/W024.json`; `STACK.md:126` (NotebookLM excluded), `STACK.md:83` (open-notebook replaces NotebookLM); `docker ps` (container `open-notebook-open_notebook-1`, lfnovo/open_notebook:1.10.0, running); `$R/.planning/board-rows/B43.md:157` (SIGNAL), `B43.md:236` (Nichle).
- Why it was eliminated: "Gerek yok" in the second round, because the extensions are not needed. The lead's note said the method is needed. Both are right, and the method is already planned.
- His note: none.
- What is in it: a reel method: Grabbit collects a channel's video URLs, WebSync imports them into NotebookLM, then you ask about the hooks.
- What we have: the same method as a planned engine, **SIGNAL**, at `B43.md:157`: it "reads the latest short videos of the accounts in a chosen field, transcribes and scores them … hooks, topics, outliers". `yt-dlp` is at `~/.local/bin/yt-dlp`, Agent-Reach is installed, and open-notebook is running in its own container. NotebookLM is excluded by STACK.md:126.
- What it has that we do not: nothing found.
- Board: B43 (SIGNAL) · SIGNAL, planned · identical · — · — · nothing.
- The elimination: holds. The method is SIGNAL's own, and the tools are excluded or replaced.
- Reader's first reading: Gerek yok

## W025 — A name list: context7, excalidraw, agent-browser, karpathy skills, claude-mem, hyperframes, mcp-builder, SkillUI, gstack, Rowboat, HeyGen, open-design
- Opened: `$J/old/W025.json`; `gh api` for every repo named (results in the jsonl); `gh search repos SkillUI` → `amaancoderx/skillui` and its README; `~/.claude.json` MCP names; `~/.claude/skills/archify/SKILL.md` head; `~/.claude/skills/dxb-motion-graphics/SKILL.md` (5 HyperFrames mentions); plugin cache list; `B41.md` (gstack order); `B30.md:68`; `B84.md:236`; `B43.md:64,79,215,328`; the Rowboat README head.
- Why it was eliminated: the second round said "Gerek yok" with an eye only on construction tools. The October money case (HyperFrames, Open Design) has since been built or placed.
- His note: "Open-Design.ai bedava laptopa indir."
- What is in it, item by item (read on its own):
  - context7: **identical**, configured as a global MCP server (`~/.claude.json`), also listed by the session.
  - claude-mem: **identical**, plugin enabled; binary `~/.local/bin/claude-mem`.
  - karpathy skills (now `multica-ai/andrej-karpathy-skills`, 234,251★, last push 2026-04-20): **identical**, installed at `~/.claude/plugins/cache/karpathy-skills`, disabled.
  - hyperframes (86,477★, Apache-2.0): **identical**, the studio's motion engine inside `dxb-motion-graphics`.
  - open-design (108,316★): **already placed**: the "installed" record was wrong (a shim, `od` is octal-dump); its 151 design systems are at B84.md:236 and its 11 HyperFrames templates at B43.md:215. His note "bedava laptopa indir" is answered there; nothing is missing.
  - agent-browser (52,623★): **already placed** at `B30.md:68` (second, 2026-11-18).
  - excalidraw: none. Diagrams are made by the `archify` skill (`~/.claude/skills/archify`, v3.2: architecture, workflow, ERD…, HTML/SVG/WebM export).
  - mcp-builder (inside `anthropics/skills`): none. Not installed; we build skills with `skill-creator`, and no row asks for a new MCP server.
  - SkillUI (`amaancoderx/skillui`, 268★, last push 2026-04-14): none. It reverse-engineers a site's design system into a `.skill` file. The same job is held by Firecrawl's `branding` read (B43.md:328, placed today) and the reverse-engineer-anything skill (`~/.local/share/dxb/skills/reverse-engineer-anything`), and it is seven months idle.
  - gstack: **excluded by his order**: "superpowers, gsd, ruflo, gstack vb pluginler holdingimize girmeyecek" (B41.md, the methodology-class leg).
  - Rowboat (18,296★, "your agent team, in one group chat"): none. It is a second agent framework (STACK.md:120).
  - HeyGen (paid avatars): none. The studio's cast law (B43 R9-R10), its local lip sync (LatentSync 1.5, B43.md:64) and the paid lip-sync fallback (sync.so, B43.md:79) hold the job.
- What we have: per item above.
- What it has that we do not: nothing found beyond what is already placed.
- Board: per item in the jsonl; nothing new to place.
- The elimination: holds for the list as it stands today. The two money items were taken in other rows after October.
- Reader's first reading: Zaten kurulu (list) · nothing new

## W026 — A name list: yt-dlp, Plausible, Node.js, Gemini CLI ("1,000 free requests a day"), graphify + Obsidian
- Opened: `$J/old/W026.json`; `gh api` for plausible/analytics, google-gemini/gemini-cli, yt-dlp; the gemini-cli README (l.8-24, the status box); `geminicli.com/docs/resources/quota-and-pricing/` through `fetch.py` (it returned only the navigation, not the table); `~/.local/bin/agy --version`; `B84.md:255`; `e2-b.md:67-92` (today's Umami reading).
- Why it was eliminated: "Araştır", never taken. Plausible waits for the web line; Gemini CLI overlaps B34.
- His note: "yt dlp download any social media video / Plausible analytics alternative to google analytics / gemini cli 1000 request free"
- What is in it: **Gemini CLI no longer has a free tier.** Its own README, read today: "No free tier or Google AI plans: Free individual access and Google AI Pro / Ultra moved to Antigravity CLI on June 18, 2026". The repo is now for Gemini Code Assist Standard/Enterprise. Plausible: 29,882★, AGPL-3.0, pushed 2026-11-18. yt-dlp: 208,920★.
- What we have: yt-dlp **identical** (`~/.local/bin/yt-dlp`). Antigravity CLI **installed** (`~/.local/bin/agy`, 1.5.0), which is where Google's free individual access now lives. Analytics: B84.md:255 places **Umami** as the second beside GA4 (its `llm` channel and `@umami/mcp`), and the deep study names "Plausible or Umami" for the consent-free total (e2-b.md:68). graphify: identical (see W004).
- What it has that we do not: nothing. Plausible does the job Umami was chosen for today, and Umami carries the AI-referrer channel and an MCP server that Plausible's README does not mention (not checked further).
- Board: B84 (analytics) · Umami beside GA4 (B84.md:255) · none for Plausible · — · — · nothing. Gemini CLI → none (the free road is `agy`, installed).
- The elimination: holds. Its strongest item, "1,000 free requests", is no longer true at the source.
- Reader's first reading: Gerek yok

## W031 — OpenCut: the open CapCut alternative
- Opened: `$J/old/W031.json`; `gh api repos/OpenCut-app/OpenCut` and releases; the whole README (78 lines); `study-cards/openmontage-opencut.md:1-12`; `B28.md:21`.
- Why it was eliminated: "İzle". Agents cannot drive it (MCP and headless only on the roadmap). It holds.
- His note: "capcut free alternative with no watermark"
- What is in it: 98,843★, MIT, last push **2026-09-24**. Latest app tag v0.3.0 (2026-04-15) plus an ffmpeg build tag. The README Status says "being rewritten from the ground up". MCP server, headless mode, editor API and plugins are still under "What's coming", and the usable version is `opencut-classic`.
- What we have: the studio's montage is agent-driven: OpenMontage at `~/tools/OpenMontage` (B28.md:21), HyperFrames inside `dxb-motion-graphics`, `video-use`, and ffmpeg. Nobody in the holding edits on a timeline by hand.
- What it has that we do not: a hand-editing timeline, which no seat uses. The agent hooks it promises do not exist yet, and the repository has been quiet for eight weeks.
- Board: B43 · OpenMontage + HyperFrames + video-use · none · — · — · nothing. (If the MCP/headless rewrite ships, B42's watch is the place that catches it.)
- The elimination: holds.
- Reader's first reading: Gerek yok

## W033 — NVIDIA build.nvidia.com free API key + OpenCode
- Opened: `$J/old/W033.json`; `gh api repos/sst/opencode` (→ anomalyco/opencode); the rest as W039.
- Why it was eliminated: the second round said "Gerek yok", later rounds "İzle". OpenCode is an extra harness, and the NVIDIA half is the same as W039.
- His note: none.
- What is in it: OpenCode: 227,809★, MIT, a second coding agent. NVIDIA: see W039.
- What we have: Claude Code (the harness); NVIDIA: see W039.
- What it has that we do not: OpenCode, nothing (a second harness, STACK.md:120). NVIDIA: see W039.
- Board: OpenCode → no row · none. NVIDIA → see W039.
- The elimination: holds for OpenCode. The NVIDIA half is judged once, in W039.
- Reader's first reading: Gerek yok (OpenCode) · NVIDIA → W039

## W039 — build.nvidia.com (NVIDIA NIM catalogue): a free inference key
- Opened: `$J/old/W039.json`; `https://build.nvidia.com/` through `fetch.py` (read: "Free inference with leading models" and the four models it lists); `docs.api.nvidia.com/nim/reference/rate-limits` (**Page Not Found**); `STACK.md:7, :26, :69`; a grep for any NVIDIA NIM wiring (`nvidia_nim|integrate.api.nvidia|NVIDIA_API_KEY|NIM_API_KEY`) over `vps tools packages scripts db supabase apps` and the board rows and study cards: **0 hits**; `B51.md:102,107`; `B34.md:24`; `turbo/ihtilaf-fable.md:15`.
- Why it was eliminated: "Dene", never taken. The terms limit it to prototyping and testing, so the saving is a few dollars of exam cost.
- His note: "take apı key"
- What is in it: today's free list on the home page: nemotron-3.5-super-vl-120b-a12b, nemotron-3.5-lightning-30b-a3b, deepseek-v4.1-flash, nemotron-3-ultra-550b-a55b. The "prototype/test only" terms and the ~40 requests/minute limit were **not re-read** (the rate-limit page is gone): UNVERIFIED. The October B06 row it pointed to is no longer on the board.
- What we have: STACK.md:7 lists "OpenRouter primary + NVIDIA Build dev tier" as a locked decision, and STACK.md:26/:69 put NVIDIA Build behind the LiteLLM proxy. **Nothing is wired**: zero hits for any NIM key or endpoint in the code, infra or records, so the locked line is unbuilt. OpenRouter through LiteLLM (`dxb_litellm` running) already reaches the cheap open models for cents (e.g. deepseek-v4-flash $0.09/$0.18 per M, `study-cards/litellm.md` table).
- What it has that we do not: zero-cost calls for the exams. The saving is cents per exam against OpenRouter, plus models OpenRouter may not carry (Nemotron 3 Ultra 550B; not checked on OpenRouter).
- Board: **B51** (move 7: the eval sweep, B51.md:102; the Kimi refusal trial, B51.md:107); second **B34** (the exam has not run, B34.md:24) · stands now: OpenRouter via LiteLLM · **second** · use: a free lane for exam and sweep traffic only, never production, as a LiteLLM model entry beside OpenRouter · first trial: the B51 eval sweep's first run sent once through NIM and once through OpenRouter for the same open model. Compare results, errors under the rate limit, and cost (0 against OpenRouter's bill). · stops at the CEO: the NVIDIA Developer account and key (identity step; brought to the button, he clicks).
- The elimination: partly. The saving is small, as October said, but his note and STACK.md:7 both already say "take it", and the record says locked while nothing exists.
- Reader's first reading: İkinci

## W041 — free-claude-code (FCC): a local proxy that runs Claude Code and 11 other harnesses on other providers' models, with an admin UI
- Opened: `$J/old/W041.json`; `gh api repos/Alishahryar1/free-claude-code` and releases; the README (630 lines: Features l.26-57, the provider catalogue l.194-262, tier routing l.355-375, Anthropic note l.283-288, licence l.628); `STACK.md:126` (free-tier-stacking routers excluded), `STACK.md:26` (LiteLLM proxy); `docker ps` (`dxb_litellm` running); the LiteLLM docs nav through `fetch.py`, which lists pages titled "Use Claude Code with Non-Anthropic Models" and "Claude Code Compatibility" (**their bodies did not render; not read**); grep for `ANTHROPIC_BASE_URL` in `scripts packages .claude` (0 hits); `B51.md:69` (move 7).
- Why it was eliminated: "İzle". Free tiers bar production, Hamza already routes to cheap paid lanes, and STACK excludes free-tier stacking.
- His note: "repo: kur. arayüz. çinli modelelri otomatik claude code içinde çalıştır."
- What is in it: 71,571★, AGPL-3.0-only (README l.628; GitHub shows NOASSERTION), v6.19.39 (2026-11-18), very active. Per Claude Code tier routing: `MODEL_FABLE/OPUS/SONNET/HAIKU` → any of 61 providers; an ordered fallback chain with per-model effort; an Admin UI; auto-discovery of local servers (LM Studio, llama.cpp, Ollama); four APIs in (`/v1/messages`, chat completions, responses, Gemini). Two limits it states itself: Anthropic models through it need a **separately billed API key** (README l.286), so the Max subscription cannot ride through it; and "multi-API key fallback" plus the free-tier providers are exactly the class STACK.md:126 excludes.
- What we have: the LiteLLM proxy (`dxb_litellm`, `ghcr.io/berriai/litellm:main-stable`, running) with OpenRouter cheap lanes (kimi-k2.6, deepseek-v4-flash, qwen, minimax; `study-cards/litellm.md` table). Nothing in the repository points Claude Code or the Agent SDK at a non-Anthropic model (0 hits for `ANTHROPIC_BASE_URL`). Today the agentic workers run only Claude models, and cheap models are reached only as plain API calls.
- What it has that we do not: an agentic run (tools, files, subagents) of Claude Code on a cheap model, mapped per tier, with a fallback chain and a UI, which is what his note asks for. LiteLLM may do the same through its Claude Code page. UNVERIFIED: the page exists by title, its content was not readable.
- Board: **B51** (move 7: "every model seat and route … the cheapest model that still passes its own test", B51.md:69) · stands now: LiteLLM + OpenRouter for plain calls; no agentic cheap lane · **second** (beside LiteLLM's own Claude Code route, which is checked first because it is already running) · use: a separate Claude Code worker session for mechanical jobs (tagging, summaries, extraction, bulk edits) with every tier mapped to a paid OpenRouter model on the existing key; free-tier providers and multi-key rotation left off · first trial: ten past mechanical helper jobs with known accepted outputs, run three ways: (a) native Sonnet 5.5, (b) Claude Code through LiteLLM's `/v1/messages` with deepseek-v4-flash, (c) Claude Code through FCC with the same model. Measure accepted outputs out of 10, tool-call failures, cost per accepted job, minutes. The winner of (b)/(c) is the default, the other the fallback. · stops at the CEO: nothing new on the paid OpenRouter key. Any free-tier provider account is an identity step and sits against STACK.md:126.
- **Conflict, named:** his note says "kur"; STACK.md:126 (a locked research decision) excludes free-tier-stacking routers for ToS reasons. By the authority order his written word stands above the stack file. The reading takes his order only on paid keys, where the STACK reason (ToS) does not apply, and leaves the free-tier half for him to rule on.
- The elimination: does not hold. It does exactly what his note asks, and no part of ours does it today.
- Reader's first reading: Dene

## W045 — bepitulaz/obsidian-multivault-mcp: one MCP server over many users' Obsidian vaults
- Opened: `$J/old/W045.json`; `gh api repos/bepitulaz/obsidian-multivault-mcp` (62★, MIT, last push 2026-07-07, 0 releases); README headings (Features, Tools, Deploy to the VPS).
- Why it was eliminated: "Gerek yok", then "İzle" as a possible part of a client "second brain" service. It holds.
- His note: none.
- What is in it: a small Node MCP server with path-safe read/write tools across vaults, deployed by copying `dist/index.js` to a VPS. Idle for over four months.
- What we have: claude-mem (enabled), graphify, Obsidian in the memory stack (STACK.md:7, :83), open-notebook running in its container, Hermes' `llm-wiki` skill (`k3-f.md:180`).
- What it has that we do not: multi-user vault access for a client. No service row exists for it, and a 62-star idle project would not be its base.
- Board: no row (nearest B83, a client "second brain" line if one is ever opened) · none · nothing.
- The elimination: holds.
- Reader's first reading: Gerek yok

## W046 + W081 — codebase-memory-mcp (DeusData): a local code graph over MCP, with change impact
- Opened: `$J/old/W046.json`, `$J/old/W081.json`; `gh api repos/DeusData/codebase-memory-mcp` and releases; the README (1,198 lines: features l.309-375, install l.69-148, telemetry l.483, language table l.1139); the installed graphify package (`affected.py`, MCP tool names in `serve.py`: `get_pr_impact`, `query_graph`, `shortest_path`, `triage_prs`, …) and `graphify --help` (`affected`, `query`, `path`, `explain`); B65 on the board (l.143); `B85.md` (dossier, "no tokens for the map").
- Why it was eliminated: "Dene", never taken into 'Öncelikli'. A construction tool whose value is only indirect for the holding.
- His note: none (both rows).
- What is in it: 48,826★, MIT, pushed 2026-11-18, v0.12.1 (2026-10-16). A native C binary, SQLite store, **no telemetry** (README l.483). 17 MCP tools. `detect_changes` maps *uncommitted* changes to affected symbols with a risk class and related tests. Call graph with Hybrid LSP type resolution (TypeScript and SQL rated "Good 75-89 %"). Semantic search on a bundled local code-embedding model plus BM25. Cypher-like queries, dead-code candidates, ADR store, and tracing through Docker/compose/CI. The installer writes hooks and agent config by default; `--skip-config` installs the binary only. The token figures (~3,400 vs ~412,000) compare a graph query against reading files one by one: the author's own, the same shape as graphify's.
- What we have: graphify 0.9.50 with the code graph of this repository (`$R/.planning/graphs`, 34,441 nodes). It **already does reverse-impact** (`graphify affected "X"`, relations calls/imports/references…) and exposes `get_pr_impact` over MCP. So "we have no change-impact tool" would be wrong. Its MCP server is not registered in any config (see W004).
- What it has that we do not: impact read straight from the uncommitted diff with a risk class, type-resolved calls (LSP) rather than AST name matching, and local semantic search. All three bear on "a fix must not break what stands around it".
- Board: **B51** (move 7, the construction's own cost tools, as for W004); second home **B85** (the read-only preparation dossier: "what stands today" per foundation part). Caution: he refused an Archify map for B85 ("no tokens for the map"), so this is offered there only if the trial shows it saves tokens. · stands now: graphify (`affected`, `query`) unwired · **second** · use: binary only (`--skip-config`, sha256 checked), MCP added by hand to one session; the session asks impact questions before a fix · first trial: the same five questions as W004, with ground truth, including "who reads the Agent SDK result without checking `is_error`" (B65: eight readers named by hand, `chat-drain.ts:160` among them) and one `detect_changes` run on a real past diff whose breakage is known. Compare graphify `affected`/`query` against codebase-memory-mcp on readers found out of 8, tokens and minutes. The better one is the default, the other the fallback; one W004/W046 run closes both. · stops at the CEO: his word to start the trial (new work), nothing else; keeping it installed is his word too.
- The elimination: partly. Not taking it into 'Öncelikli' was right for the holding; the "Dene" is right for the construction and has never been run.
- Reader's first reading: Dene

## W048 — Colibri (JustVugg/colibri): a MoE inference engine with hot experts on the GPU, warm in RAM, cold streamed from NVMe
- Opened: `$J/old/W048.json`; `gh api repos/JustVugg/colibri` and releases; the README (893 lines: "What colibri is" l.162-186, model table l.187-286, CUDA l.360-406, benchmarks l.588-640); `free -g` (30 GB RAM), `nvidia-smi` (RTX 5060 Ti 16,311 MiB), `ollama --version` (0.32.15), `~/.lmstudio/bin`; `B34.md:16-54`; `turbo/ihtilaf-fable.md:7`.
- Why it was eliminated: "İzle". "B34 is set up with Gemma/Qwen; the gain is small and unmeasured." The first half does not hold: B34.md:24 says "the exam has not been run and no model is chosen".
- His note: none.
- What is in it: 51,923★, Apache-2.0, pushed 2026-11-18, v2.1.0 (2026-10-31); an OpenAI-compatible `coli serve`, an MCP server (`coli mcp`) and a dashboard. Its own numbers (other machines, not ours): Qwen3.6-35B-A3B at **30 tok/s on an RTX 3070 8 GB** with CUDA (model table l.208, machine C); 104.8 tok/s decode on a 24 GB RTX PRO 4000. Models beyond RAM+VRAM run from NVMe at about 1-6 tok/s (DeepSeek V4 Flash 1.5-1.6 tok/s on an RTX 5080 box; GLM-5.2 0.05-1.83). No same-machine comparison with llama.cpp or Ollama is given.
- What we have: Ollama 0.32.15 and LM Studio's llama-server (B34.md:16, the 27B that takes 13.2 GB of the card); the exam is not run (B34.md:24); Ollama's upgrade is weighed before the exam (B34.md:54).
- What it has that we do not: placement of a MoE larger than the 16 GB card (hot experts on the GPU, the rest in our 30 GB RAM), measured by its author at usable speed on smaller cards. Models beyond 46 GB are too slow for B34's high-volume work.
- Board: **B34** (the exam) · Ollama 0.32.15 / LM Studio llama-server · **second** (the engine, beside Ollama) · use: the engine under a MoE exam candidate that does not fit the card · first trial: Qwen3.6-35B-A3B (same GGUF) on Colibri (CUDA) and on Ollama with partial offload on our 5060 Ti; decode and prompt tok/s, card memory, and one exam batch's answers identical or not. The faster is the exam's engine. It runs in B33's bench queue. · stops at the CEO: nothing (local, Apache-2.0); bench time goes by B33's gatekeeper.
- The elimination: partly. Its reason ("B34 is set up") was wrong. A trial belongs to the exam, not before it.
- Reader's first reading: İkinci

## W049 — Eight open web-data tools (Firecrawl, Crawl4AI, browser-use, Crawlee, Scrapy, Scrapling, AutoScraper, curl-impersonate) + "sell lead-gen"
- Opened: `$J/old/W049.json`; `gh api` for all eight; `B30.md:16` (the nine approved tools), `B30.md:98-100` (Firecrawl, today); `REVENUE-OPPORTUNITIES.md:201, 240, 244`; `~/.local/bin` and `~/.claude/skills/scrapling`.
- Why it was eliminated: "Gerek yok", because the tools are with us. It holds item by item, below.
- His note: none.
- What is in it / what we have, each on its own:
  - Firecrawl (203,045★, AGPL): **already placed**: B30.md:98-100 (in the research door; Local's whole-site crawl; the paid Cloud twin), B43.md:328 (branding).
  - Crawl4AI (87,526★), browser-use (121,433★), Crawlee (26,495★): **already on the board**: three of the nine tools he approved on 2026-08-19 (B30.md:16; not installed). New fact today: Crawl4AI's description now leads with a hosted "Crawl4AI Cloud: free API key, 1,000 credits a month, no card", a paid twin beside the open one.
  - Scrapling (104,182★): **identical, installed** (`~/.claude/skills/scrapling`, MCP `scrapling` in `.mcp.json`).
  - Scrapy (65,470★): none. A classic crawl framework doing the job Scrapling and the approved Crawlee hold.
  - AutoScraper (8,098★, last push 2026-07-29): none. It learns rules from examples; nothing of ours needs it.
  - curl-impersonate (7,205★, last push **2024-07-18**): none, abandoned.
  - Lead-gen as revenue: **already in the revenue list**: the outreach machine (REVENUE-OPPORTUNITIES.md:201), B2B appointment setting K10 (l.240), prospect finding by a public-data audit (l.244).
- What it has that we do not: nothing beyond what is placed.
- Board: B30 · as above · identical / already placed · — · — · nothing.
- The elimination: holds.
- Reader's first reading: Zaten kurulu

## W053 — block/buzz (a workspace where people and agents share rooms) + four "find a business model" prompts
- Opened: `$J/old/W053.json`; `gh api repos/block/buzz` and releases; README l.1-60; `REVENUE-OPPORTUNITIES.md` (sourced lines, e.g. l.6, l.201) and `B83.md:112`; `turbo/ihtilaf-fable.md:8`. The reel's prompts are taken from the October transcript reading, not re-transcribed.
- Why it was eliminated: "İzle". The prompts are shallow, the $73k is unsourced, and buzz would be a second event spine. It holds.
- His note: "buzz repo / iş modeli promotu iyi bak"
- What is in it: buzz: 37,580★, Apache-2.0, desktop-v0.5.30 (2026-11-14). A self-hostable Slack-like workspace on a Nostr relay; every message, review and git event is a signed event in one log; agents have their own keys and channels.
- What we have: one human and a dashboard (the holding has no team chat to host); the company's audit and event log in Postgres (OBSERVABILITY_SPEC.md §4). For the prompts: every revenue line in B83 / REVENUE-OPPORTUNITIES carries the real earner it came from, with the source link and timestamp (e.g. l.201, B83.md:112). That is the prompt's step 2 ("who does this best, give me the channel") already done as a rule.
- What it has that we do not: nothing found.
- Board: no row (nearest B83 for the prompts, B10 for the event log) · none · nothing.
- The elimination: holds. "İyi bak" is answered: buzz is a team workspace for many humans, and the one usable prompt idea is already how the revenue list is written.
- Reader's first reading: Gerek yok

## W055 — Agent-Reach: one CLI that reads Twitter, Reddit, YouTube, GitHub, Bilibili and XiaoHongShu without API fees
- Opened: `$J/old/W055.json`; `gh api repos/Panniantong/Agent-Reach` and its last two releases' notes; `agent-reach --version`; `uv tool list`; `B30.md` grep (l.16, l.67); grep for its version in today's rows (none).
- Why it was eliminated: "Gerek yok" because it is installed. Correct, with one gap.
- His note: "agent reach repo internetten veri çekme"
- What is in it: 113,040★, MIT, pushed 2026-11-08. **v1.6.0 (2026-10-23):** login platforms (XiaoHongShu, Twitter) use Agent-Reach's own dedicated browser, no pop-ups, and several agents can query at once; RSS and Exa search are merged into "web". **v1.6.1 (2026-11-01):** fixes cases where web search, Reddit, XiaoHongShu or Bilibili failed though reachable "or reported success with empty content", and a failed login copy now says so.
- What we have: **installed, v1.5.0** (`agent-reach --version`; `uv tool list`), released 2026-06-11, two releases behind. B30.md:16 says installed and records no version. Today's tabs did not note the gap.
- What it has that we do not: the 1.6.x fixes. "Reported success with empty content" is precisely a silent failure our research door would carry as data.
- Board: **B42** (versions with a last-checked date) and B30 (the tool) · stands now: v1.5.0 · identical tool, version gap · use: update to 1.6.1 · first trial: the same five reads (one Reddit thread, one X post, one YouTube transcript, one XiaoHongShu note, one web search) on 1.5.0 and 1.6.1, counting empty-but-"success" results · stops at the CEO: his word for the update (the update rule written in the 16 Nov plan, w100: "Kurulum ve güncelleme sözünüz").
- The elimination: holds. Installed; the only missing thing is the version.
- Reader's first reading: Zaten kurulu (update to 1.6.1 waits on his word)

## W058 — Hyperresearch: a 16-step deep-research pipeline for Claude Code/Codex
- Opened: `$J/old/W058.json`; `gh api repos/jordan-gibbs/hyperresearch` and releases; the README (488 lines: pipeline l.141-165, principles l.205-210, "structurally enforced" l.324-337, scholarly sources l.384-416, open-access l.417-457); our research door `.claude/skills/dxb-research/` (`scripts/independence.py` docstring, `scripts/cite-check.py` docstring, `config/registry.yaml:107-124`, `references/channels.md:186`, `SKILL.md:89`, grep for unpaywall/retract).
- Why it was eliminated: "İzle". cite-check already does it, and the ideas are a small addition. It holds; the October "we lack scholarly discovery" would have been wrong.
- His note: "hyperresearch repo."
- What is in it: 4,896★, MIT, v0.13.3 (2026-11-16). Decompose → width sweep → contradiction graph → depth → corpus critic ("what source would overturn this?") → triple draft → 4 critics → patch-only edits (tool-locked to Read+Edit) → cite-check. Quote-integrity lint; retraction block; fetched text fenced as untrusted; eight scholarly sources (OpenAlex, Crossref, CORE, DOAB, ClinicalTrials, EDGAR, FRED); open-access full-text recovery for paywalled DOIs (Unpaywall, Europe PMC, CORE), with the substitution disclosed.
- What we have: the research door already has source independence (`independence.py`, one rule `claims.source_key`, echo flags), citation re-opening (`cite-check.py`, "re-opening the page is R4"), a verbatim evidence ledger with sha256 (`SKILL.md:89`, `ingest.py:9`), the question persisted verbatim (`research.py:10`), and scholarly channels crossref, europepmc, arxiv and openalex (`registry.yaml:107-124`; `channels.md:186` adds openreview and semanticscholar).
- What it has that we do not: open-access recovery for a paywalled paper and a retraction check (grep: no unpaywall, no retraction in the door). Both are narrow for a holding whose research is markets, tools and rivals.
- Board: dxb-research (the door; nearest rows B30, B69) · the door as above · none · nothing.
- The elimination: holds.
- Reader's first reading: Gerek yok

## W067 — A ChatGPT talk about OpenObserve as DXB OS's observability layer
- Opened: `$J/old/W067.json`; `gh api repos/openobserve/openobserve`; `HOLDING-OS-MASTER-PLAN/OBSERVABILITY_SPEC.md` (headings and §3-§4); grep of STACK.md and board rows for Langfuse/OTel/Sentry/OpenObserve; `study-cards/sentry-mcp.md` (a STUB). Not re-read: the ChatGPT share page (the October row read it).
- Why it was eliminated: "İzle". The cost ledger and audit already exist in Supabase. It holds.
- His note: "openobserve hakkında güzel"
- What is in it: 23,106★, AGPL-3.0, pushed 2026-11-18. Logs, metrics, traces, RUM, session replay and LLM observability in one binary.
- What we have: the owning spec, `OBSERVABILITY_SPEC.md`: `agent_runs`, `tool_calls`, `decision_log`, `cost_ledger`, alerts and a heartbeat in Postgres, shown live (§3-§4, §20 "<2 s on LiveOps"). B10 and B75 are the rows on it.
- What it has that we do not: a second store for the same facts, plus tooling for a server fleet the holding does not run. Nothing a row needs.
- Board: B10 / B75 · OBSERVABILITY_SPEC in Postgres · none · nothing.
- The elimination: holds. His "güzel" was praise, not an order.
- Reader's first reading: Gerek yok

## W074 — DeepSeek Harness (dsh): "everything is a plugin"
- Opened: `$J/old/W074.json`; `gh api repos/deepseek-ai/deepseek-harness` (created 2026-08-13, 283,583★, 35,182 forks, MIT) and releases; the whole README (77 lines).
- Why it was eliminated: "İzle". It would be a second agent framework, a developer preview with no security audit. It holds.
- His note: none.
- What is in it: "Developer preview … THERE WILL BE COMPATIBILITY-BREAKING CHANGES" (README). Its releases are still rc tags (dsh-v0.2.2-rc.5, 2026-11-18). A Web UI on 127.0.0.1:3080, built on the Cordis plugin runtime.
- What we have: Claude Code / Agent SDK (STACK.md:21), Hermes Agent for 24/7 hands (STACK.md:29), and DeepSeek reachable as a lane through OpenRouter.
- What it has that we do not: nothing a row needs. The saving lives in DeepSeek's model price, which we reach already.
- Board: no row (nearest B51) · none · nothing.
- The elimination: holds.
- Reader's first reading: Gerek yok

## W040 — Open Design (nexu-io/open-design): already settled
- Opened: `$J/old/W040.json`; `gh api repos/nexu-io/open-design` (108,316★, Apache-2.0, pushed 2026-11-18); `B84.md:236`; `B43.md:215`; `2026-11-16-whatsapp/plan.jsonl:61` (w100).
- Why it was eliminated: "Gerek yok" in the second round (seen as agency-only).
- His note: none on this row (his W025 note: "Open-Design.ai bedava laptopa indir").
- Where it stands: B84.md:236. The "installed" record was wrong: the plugin is a shim whose `od` is the octal-dump program, and nothing listens on 7456. Its 151 design systems and five-point critique sheet are to be tried beside the style cupboard. B43.md:215 holds its 11 HyperFrames templates, to be rendered with `mg`.
- What the placement lacks: nothing found. The context list still shows `open-design@open-design` as a disabled plugin; B84.md:236 already says it is an empty shim.
- Reader's first reading: Zaten kurulu (already placed)

## Commands run (all read-only, plus writes under `$J/rows/` and `$J/a-src/`)
- `Read` of BRIEF.md and context.md; `python3 -I` dumps of the 22 `old/*.json` rows; `cat items.tsv`.
- `grep`/`python3` over `2026-11-18-recheck/{rows,placement/all.json,yeni-eklenenler,eliminated-identical.txt,inv}`, `2026-11-16-whatsapp/plan.jsonl`, `.planning/board-rows/*.md`, `00-BOARD-OPEN-WORK.md`, `STACK.md`, `REVENUE-OPPORTUNITIES.md`, `OBSERVABILITY_SPEC.md`, the study cards, and `2026-10-08-whatsapp/turbo/ihtilaf-fable.md`.
- `gh api repos/<o>/<r>` for 36 repositories; READMEs for 14; releases for 11; `gh search repos SkillUI`.
- `fetch.py` on build.nvidia.com, the NIM rate-limit doc (404), geminicli.com quota (navigation only), 21st.dev/pricing, and two LiteLLM docs pages (navigation only).
- Local: `ls` of skills, plugins, tools and bins; `uv tool list`; `graphify --help`; reading graphify's installed `benchmark.py`, `install.py`, `querylog.py`, `affected.py`; `agent-reach --version`; `agy --version`; `ollama --version`; `free -g`; `nvidia-smi`; `docker ps` (names only); MCP server names from `~/.claude.json` and `.mcp.json` (keys only, no values).

## What could not be read
- The NVIDIA NIM rate-limit page (404) and NIM terms: the "prototype/test only" and ~40 rpm limits stay UNVERIFIED.
- The Gemini CLI quota table (the site rendered only navigation). The no-free-tier fact comes from the repository's own README.
- The bodies of LiteLLM's "Use Claude Code with Non-Anthropic Models" and "Claude Code Compatibility" pages (navigation only; not found in the repository docs tree by name). Whether our LiteLLM serves Claude Code is UNVERIFIED.
- No reel was watched (by the brief); the reels' content is taken from the October rows.
