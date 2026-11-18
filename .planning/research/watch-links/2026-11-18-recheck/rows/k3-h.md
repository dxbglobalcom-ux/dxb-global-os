# k3-h — second reading of k3-26, k3-27, k3-28 (tab "Kasım 3-4 web linkleri")

None of the three rows is in `twins.tsv`, so there was no earlier w-row placement to build on.

## k3-26 (d16) — a Higgsfield-style ad reel. Codex CLI plus the Higgsfield CLI and its skill bundle, sold as a "content factory from one product photo"

- **Opened:**
  - The transcript `.planning/quick/20261103-web-ders/transcripts/d16-DYAopkSSDL6.txt`, read whole (0:00-0:52).
  - The frame sheets `frames/d16-DYAopkSSDL6/sheet-1793746071.jpg` and `frames/d16-DYAopkSSDL6-all/sheet01-07.jpg`.
  - The earlier readers: `reader-opus.md:37-40,95`, `reader-fable.md:30` and `MERGE.md:26`.
  - From GitHub: `gh api repos/higgsfield-ai/cli` (with its README and releases), `repos/higgsfield-ai/skills` (with its tree, README, `higgsfield-marketplace-cards/SKILL.md`, `higgsfield-generate/references/marketing-modes.md`, and `higgsfield-websites/references/{wow-catalog,wow-maker,review-rubric,scroll-scrub}.md`), `orgs/higgsfield-ai/repos` and `repos/openai/codex`.
  - Every frame sheet opened. No video was watched again.
- **His note:** none.
- **What is in it:**
  - **The claim.** The reel says "Codex CLI is 10x cheaper than Claude Code". The chart on screen at 0:01-0:03 is titled "Optimized token spend" and shows "With MCP $94 / With CLI $8", so it compares an MCP with a CLI. The caption "Claude Code" sits under it. No source is given.
  - **The prompt on screen at 0:06-0:07.** "I need a full content stack for my product: 20 UGC videos per category (unboxing, review, lifestyle, demo), 20 Amazon listing cards, and 30 studio product shots. Daily."
  - **Install.** `hf auth login`, then `cp -r ~/Downloads/skills/* ~/.codex/skills/` ("3 skills installed: ug…").
  - **A second prompt at 0:39-0:40.** "create photoshoots in different styles · lighting: professional studio · angles: different angles · reflections: ray-traced · make me 50 realistic UGC".
  - **The agent's output folders.** Unboxing, GRWM, Street fashion and Released, each with Shot #1 and a captions SRT. A frame then implies posting to Instagram.
  - **The cast.** The presenter and the "UGC" people all look generated. Whether the reel is Higgsfield's own advertising is not stated.
  - **The parts it names, each read on its own:**
    - **Codex CLI.** `openai/codex`, Apache-2.0, 135,734★, release rust-v0.170.0 of 2026-11-18. The agent shell only.
    - **Higgsfield CLI.** `higgsfield-ai/cli`, MIT, 720★, v1.2.3 of 2026-10-22. It holds only the README, `MODELS.md`, `install.sh` and a demo image; the binary comes from releases or npm `@higgsfield/cli`. It reaches 40+ paid Higgsfield models: image (Nano Banana Pro, GPT Image 2.5, Seedream, FLUX.2, Soul V2), video (Veo 3.1, Kling 3.0, Seedance 2.5, Wan 2.7, Marketing Studio Video), 3D, and audio (Seed Audio, TTS with ElevenLabs/MiniMax variants). It also carries:
      - workflows (draw_to_video, reframe to 9:16, voice-change, dubbing);
      - `generate cost workflow …`, a price estimate before a job runs;
      - **Virality Predictor** (`brain_activity`), which scores a finished video for hook strength, attention, retention and viral potential;
      - Soul ID (face-faithful identity);
      - `higgsfield website create`, React 19 + TanStack Start deployed to a Cloudflare Worker on their platform;
      - game deploy.
    - **The Higgsfield skills.** `higgsfield-ai/skills`, MIT, 2,017★, v0.14.0, pushed 2026-11-05. These are the "skills" in the reel. There are nine:
      - generate, which includes Marketing Studio with 9 ad-video modes: ugc, ugc_how_to, ugc_unboxing, product_showcase, product_review, tv_spot, wild_card, ugc_virtual_try_on, virtual_try_on;
      - soul-id;
      - product-photoshoot, with 10 modes: product_shot, lifestyle_scene, closeup_with_person, moodboard_pin, hero_banner, social_carousel, ad_creative_pack, virtual_model_tryout, conceptual_product, restyle;
      - brandkit;
      - marketplace-cards, scope `full-set` = main image + 5 secondary + 7 A+ modules. The 13 named assets are main_image, infographic, multi_angle, detail_shot, lifestyle, whats_in_box, aplus_hero_banner, aplus_pain_points, aplus_features, aplus_ingredients, aplus_efficacy, aplus_how_to_use and aplus_endorsement. The skill says outright that "Backend owns marketplace compliance references and prompt templates", so the prompts are private;
      - websites;
      - faceless-video;
      - video-explainer;
      - youtube-thumbnail.
    - **The websites skill's MIT reference files.** These are a written method for "award-tier" animated sites:
      - `wow-catalog.md` (7.8 KB): one memorable Tier-1 mechanic per page, chosen to enact the site's concept, and an anti-convergence ledger, "never reuse the previous build's technique";
      - `scroll-scrub.md` (20 KB): a seam-locked scroll-scrub camera journey as the default, with a static reduced-motion fallback;
      - `review-rubric.md` (8.7 KB): a mechanical pre-deploy gate run by grep. It checks for placeholder tokens, bans em-dashes in visible copy, bans default "AI" palettes (purple glow, near-black + neon, beige/brass), and limits eyebrow labels;
      - `wow-maker.md` (22 KB).
- **What we have:**
  - **Codex: identical, installed** at `~/.local/bin/codex` → `~/.codex/packages/standalone/current/bin/codex` (codex-cli 0.159.3). Its image tool is already the UGC recipe's first image hand (`.planning/board-rows/B43.md:53`, R20). Eliminated.
  - **Higgsfield is already placed** as a paid fallback: `B43.md:79` (R30, "carrying a person onto a filmed performance", priced 2026-11-17) and `B43.md:215-222` (the priced leg). That leg notes the unlimited plans do not apply through the CLI or MCP.
  - **The skills repo was read on 2026-09-25** in the virtual-creator plan, `.planning/quick/20260925-virtual-creator/PLAN.md:96-107` (v0.12.0, 8 skills). It judged them: product-photoshoot "BELKİ, for B28's desks"; Virality Predictor "BELKİ, secondary to SIGNAL's own pre-publish score"; marketplace-cards and websites "ALMA". That plan is not approved.
  - **Image recipes.** `~/.claude/skills/kisayol/s/` holds 202 recipes. Among them are `whitepackshot.md` (a marketplace main image, with the Amazon 85 %/RGB 255 note at line 30), `aplusmodule.md`, `bundleset.md`, `ugc*.md` (7) and `unboxvideo.md`.
  - **Scroll sites.** `~/.claude/skills/scrollcraft` builds scroll-driven sites.
  - **B84's own gates** are decisions 2 and 12 and the 2026-11-17 release-gate leg (`B84.md:57,66,179-183`).
  - **Pre-publish scoring: none found.** A grep for "virality / hook strength / brain_activity" over `board-rows/` and `study-cards/` returns nothing. B28's weekly loop measures only after posting (`B28.md:43`, step 4).
- **What it has that we do not:**
  1. **A pre-publish score** of a finished video for hook and retention (Virality Predictor). It is paid and the method behind it is closed.
  2. **The complete marketplace listing set as one named bundle** of 13 assets, the A+ modules spelled out. kisayol has the single recipes but no "full listing set" order. Only the set's structure is taken; the prompts are not public.
  3. **A written award-site method** in the websites references: a Tier-1 mechanic tied to the concept, an anti-convergence ledger across builds, and a grep-level gate (banned AI palettes, the em-dash ban, eyebrow ration, placeholder scan). scrollcraft and B84's gate list have no ledger across builds and no banned-palette check.
  4. **A cost estimate before a paid job** (`higgsfield generate cost`). This matters to R30's "cost per accepted clip".
- **Board:**
  - **Virality Predictor**
    - Row: B28, in the weekly loop "Format research + the weekly winner", step 4.
    - What stands there: measurement after posting (7-day view velocity, retention, shares and saves, conversion). There is nothing before posting.
    - Relation: `new`.
    - Use: before a week's videos go out, each is scored, and the lowest-scoring is recut or held.
    - First trial: score 10 of our own finished videos, then compare the predicted order with the order step 4 measures after 7 days. It is kept only if the two orders agree well enough to be worth the credits.
    - What stops at the CEO: credits are money out.
  - **The full marketplace listing set**
    - Row: B43, through kisayol (sold from B28's agency seat to a store client).
    - What stands there: `kisayol/s/whitepackshot.md`, `aplusmodule.md` and `bundleset.md` as single recipes.
    - Relation: `method`.
    - Use: one order "listing set" that makes a product's 13 assets from one real product photo through kisayol and the Codex image tool.
    - First trial: one real product photo; the 13-asset set made on our road; the main image's corner pixels checked at 255; the set judged against the CEO's "AI bağırıyor" verdict from 8 Nov (`B43.md:188`).
    - What stops at the CEO: nothing.
  - **The award-site method** (wow-catalog, review-rubric, scroll-scrub)
    - Row: B84 (the release gate and decision 2's build brief), with scrollcraft as the skill beside it.
    - What stands there: `~/.claude/skills/scrollcraft`, the B84 gate list (`B84.md:66,179-183`) and the cupboard's `DESIGN.md`.
    - Relation: `method`.
    - Use: the rubric's §A grep checks join the release gate; the anti-convergence ledger joins the shared cupboard so two client sites never share a signature mechanic.
    - First trial: run the rubric's §A on the first bench site beside our own gate and count what it catches that ours misses; read wow-catalog beside scrollcraft's grammar.
    - What stops at the CEO: nothing. The files are MIT and are read only; their platform deploy is not used.
  - **Higgsfield CLI**
    - Row: B43, R30 — already placed.
    - What stands there: Higgsfield by subscription for person swap.
    - Relation: `second`, already written.
    - What is still missing there: one clause, that a paid job is priced with `higgsfield generate cost` before it runs.
    - What stops at the CEO: any subscription or credit.
  - **Codex CLI:** `identical`.
- **The old verdict and reason:** partly holds. "Araştır" and the debunk of the 10x chart stand. But the old reading never checked Codex, which is identical and installed. It also did not read the skills repo, where the three parts worth taking are (a pre-publish score, the 13-asset listing set, the award-site method). Its FTC "fake testimony" point is now answered by B43's R39 testimony rule (`B43.md:97`).
- **Reader's first reading:** Yöntem. Per item: Virality Predictor Dene; listing set Yöntem; site method Yöntem; Higgsfield CLI İkinci (already placed); Codex Zaten kurulu.

## k3-27 (d17) — "Scrapling inside Hermes builds a lead list from one Telegram prompt" (lead-generation reel)

- **Opened:**
  - The transcript `transcripts/d17-DZujU8XhvNx.txt`, read whole (0:00-0:38).
  - The frame sheets `frames/d17-DZujU8XhvNx-all/sheet01-04.jpg`. sheet05 was not opened, because 0:32-0:38 is the talking head and the call to action per the transcript.
  - `reader-opus.md:41` and `reader-fable.md:35`.
  - `gh api repos/D4Vinci/Scrapling` and `repos/NousResearch/hermes-agent`.
  - On disk: `~/.hermes/` (listing only; `.env` was not read), `~/.hermes/hermes-agent/optional-skills/research/scrapling/SKILL.md` and `git log -1` of `~/.hermes/hermes-agent`.
  - Board files: `B84.md:57-69,148-159`, `B83.md:64-75` and `B30.md:43-58`.
- **His note:** "SCRAPE". This is the reel's comment keyword ("Comment, scrape below and I will send the setup link"), and it marks the scraping setup as what he wants from this reel.
- **What is in it:**
  - **The prompt on screen at 0:18-0:23.** A Telegram message to "Hermes Agent": "Get me 50 dentists from California with their name, clinic, email, phone number, website, and LinkedIn profile profile". The message contains garbled words ("wreradn", "pham.er").
  - **The rest of the screen.** The "lead list" and CRM screens are motion graphics. Two seconds of a real terminal show several Hermes panes (0:30-0:31).
  - **The claims.** Scrapling bypasses Cloudflare, handles JS-heavy sites and "never breaks when a site redesigns" (its adaptive selectors reduce breakage; the reel shows no proof that they remove it). Several Hermes agents in one group split the work.
  - **No figure** for how many of the 50 records were real.
  - **The repos.** `D4Vinci/Scrapling`: BSD-3-Clause, 104,048★, v0.5.1 of 2026-11-04, pushed 2026-11-17. `NousResearch/hermes-agent`: MIT, 264,332★, v0.23.2 of 2026-11-16.
- **What we have:**
  - **Scrapling: identical, installed.** It is at `~/.claude/skills/scrapling/SKILL.md`, `~/scrapling-env/bin/scrapling`, the scrapling MCP server (healthy in `context.md`) and `study-cards/scrapling.md`. The installed copy is 0.4.10; the 0.5.1 comparison is already placed at `B30.md:57`.
  - **Hermes with its own Scrapling skill: identical, installed.** Hermes is at `~/.local/bin/hermes` and `~/.hermes/hermes-agent` (clone `f293e72`, 2026-08-23; no use since 2026-08-23). The reel's "integration" is the skill Hermes ships, `~/.hermes/hermes-agent/optional-skills/research/scrapling/SKILL.md` (author FEUAZUR, MIT). Hermes's place is fixed at `B84.md:65` (decision 10: hands and eyes on the holding's server once it stands; B11: the server was deleted).
  - **Lead finding on the board:** Y9 at `B84.md:157-159` ("leads and niche playbooks inside B64's client record … Apify is used here on the free plan first", his YE10 of 2026-10-15) and decision 9 at `B84.md:64` (lead finding on a map; an outreach campaign approved by him once).
  - **Sending work out in parallel:** the holding's own engine (pg-boss jobs).
- **What it has that we do not:** no tool, since both are identical. What Y9 lacks is the written job: "sector + city + count + fields → a verified list". Y9 names the source (Apify) and the destination (B64's client record) but no recipe, no free road beside Apify, and no accuracy check.
- **Board:**
  - Row: B84, leg Y9 (client-finding).
  - What stands there now: Apify, free plan first (`B84.md:158`).
  - Relation: `second` (Scrapling as the free road beside Apify) plus `method` (the job recipe).
  - Use: one job takes niche, city, count and fields. It works like this:
    1. It gathers candidates from public listings (maps, sector directories) and each business's own site.
    2. It fetches with Scrapling, stealthy where walled, else the research door's chain.
    3. It keeps only contacts found on the business's own pages.
    4. It checks each e-mail's domain has an MX record and normalises phone numbers.
    5. It removes duplicates.
    6. It writes each as a prospect in B64's client record.
    The first thing then sent to a prospect is B83's "Monday market page" (`B83.md:73`).
  - First trial: one niche and one city, 50 records built twice, once with Scrapling and once on Apify's free plan. Measured: accuracy (10 records per arm checked by hand against the business's own site), minutes and cost. The winner becomes the default and the other the fallback.
  - What stops at the CEO:
    - the outreach campaign (niche, city, template, daily cap), once, as `B84.md:64` already says;
    - Apify past its free plan (money out).
    - The cold-contact rule of each target country is read when the work starts, one line in the job.
- **The old verdict and reason:** partly holds. "Gerek yok" is right for tools: both are installed, and Hermes is not the holding's runtime. The old row put the job under "Y9" as if that were a row of its own. Y9 now lives inside B84 (`B84.md:148-159`), where the recipe is still missing, and his note "SCRAPE" asks for the scraping job to be taken.
- **Reader's first reading:** Yöntem. Per item: Scrapling Zaten kurulu; the Hermes Scrapling skill Zaten kurulu; the lead-list recipe Yöntem.

## k3-28 (d18) — UI-TARS Desktop (ByteDance's screen-driving agent app). The repository is archived now

- **Opened:**
  - The transcript `transcripts/d18-DZsVLjTNOEr.txt`, read whole (0:00-0:49).
  - The frame sheets `frames/d18-DZsVLjTNOEr-all/sheet01.jpg`, `sheet04.jpg` and `sheet06.jpg`. sheets 02, 03, 05 and 07 were not opened; the transcript covers them, and the old reader read all seven.
  - `reader-fable.md:54` and `reader-opus.md:61`.
  - `gh api repos/bytedance/UI-TARS-desktop` (with its README, latest release body and last 3 commits), `repos/bytedance/UI-TARS` (with its README) and `repos/web-infra-dev/midscene` (with its README and latest release).
  - On disk: `B35.md` whole, and a grep for midscene / ui-tars over `.planning/research`, `HOLDING-OS-MASTER-PLAN`, `~/.local/share/dxb`, `~/.claude/skills` and `~/.hermes` (no hit). The first wider grep also took in `~/tools` and was stopped because it ran too long; the `~/tools` listing shows no such folder.
- **His note:** none.
- **What is in it:**
  - **The reel's claims.** "Free, Apache 2.0, 36,000 stars", it "sees your screen, moves your mouse", and "free remote operator, no setup". Its demos book a flight, sort an inbox and pull PDFs into a spreadsheet, and it "replaces every virtual assistant charging 5,000 a month". The Claude/OpenAI scenes are other products' promo frames.
  - **`bytedance/UI-TARS-desktop`: ARCHIVED.**
    - Apache-2.0, 39,604★. The last release, v0.3.1 (2026-10-08), only closes security holes in the Agent TARS CLI server: it now binds to 127.0.0.1, requires a token for a non-loopback host, and rejects injected agent options.
    - The last commit is 2026-10-09.
    - The "free remote operator, no configuration" is a README news item of **2025-06-12**.
    - The app needs a vision-language model: self-hosted, or a provider key.
  - **`bytedance/UI-TARS` (the model): ARCHIVED.** 11,698★, last push 2026-01-27. Its README points to the open weights `ByteDance-Seed/UI-TARS-1.5-7B` on Hugging Face and to UI-TARS-2 (a technical report of 2025-09-04). Whether UI-TARS-2's weights are open was not checked. For web automation the README points to Midscene.js.
  - **The live sibling: `web-infra-dev/midscene`.**
    - MIT, 15,638★, v1.18.1 of 2026-11-17, pushed 2026-11-18.
    - It locates elements by appearance in screenshots and acts on them (`aiAct`), waits on visible state (`aiWaitFor`) and checks what is seen (`aiAssert`, "the selected plan has a blue border"), with an HTML report of every step.
    - It runs on Web (Playwright, Puppeteer, desktop Chrome), Android (ADB), iOS, HarmonyOS, and macOS/Windows/Linux desktop with remote RDP.
    - It works with any model, including self-hosted open ones.
    - Its own reported run: 58 of 60 AppControlBench tasks for $0.59 of model cost (Doubao Seed 2.1 Turbo).
- **What we have:**
  - `operator`: `/usr/local/bin/operator`, `~/.claude/skills/operator`, `scripts/operator/`. It drives the real GNOME Wayland desktop and the session's own model reads the screenshot (`B35.md:16`).
  - Playwright MCP (`mcp__playwright__*`).
  - The hidden Chrome and camofox (`B35.md:34-47`).
  - agent-desktop, placed in B35 as a trial (`B35.md:49-59`; accessibility tree, not vision).
  - Neither UI-TARS nor Midscene is anywhere on disk or in the board.
- **What it has that we do not:**
  - UI-TARS Desktop itself: nothing worth taking now. It is archived, and its remote operator is ByteDance's hosted service.
  - Midscene has three things we lack:
    1. a vision-based act/assert library that sits on Playwright and ADB, so the holding's agents could drive a page or a phone by description without a full model turn per click;
    2. visual assertions in natural language for tests;
    3. a step report with screenshots.
  - The UI-TARS-1.5-7B open weights: a GUI-grounding model that could run on our own card. Not measured here.
- **Board:**
  - **UI-TARS Desktop**
    - Row: B35.
    - What stands there: operator, agent-desktop (trial) and the hidden screens.
    - Relation: `none`. The repository is archived; nothing to place.
  - **Midscene**
    - Row: B35, second for the holding's agents' hands (open part 3 of the row: "the agents able to reach the same hands"). It also serves B84's acceptance gate (`B84.md:187`, four visitors by Playwright).
    - What stands there: operator (the session's eyes on screenshots) and agent-desktop (the accessibility tree); for B84, plain Playwright.
    - Relation: `second`.
    - Use: the agents' web and phone hand by description; in B84, `aiAssert` lines for what a visitor must see.
    - First trial, on this machine:
      - one Playwright page task (log in to a bench site, fill a form, `aiAssert` the confirmation), done with Midscene and with operator, steps, tokens and minutes side by side;
      - one Android task over the phone's ADB.
      - Model: a self-hosted open model on our card first. The STACK check: it is a library on Playwright, not an agent runtime; this is confirmed at the trial.
    - What stops at the CEO: his word to install (as with agent-desktop at `B35.md:58`). A paid model key, only if the local model falls short, is money out.
  - **The UI-TARS-1.5-7B weights**
    - Row: B33/B34 (bench and local worker), serving B35.
    - What stands there: no local GUI model.
    - Relation: `new`.
    - Trial: whether it fits the 16 GB card beside the resident floor, and its click accuracy on 10 screenshots of our own screens.
    - What stops at the CEO: nothing.
- **The old verdict and reason:** partly holds. "İzle" on UI-TARS Desktop is now empty, because the repository was archived after 2026-10-09. The old reading missed that the live line is Midscene, which its own model README points to.
- **Reader's first reading:** Gerek yok for UI-TARS Desktop. Per item: Midscene İkinci (beside operator and agent-desktop); the UI-TARS-1.5-7B weights Araştır.
