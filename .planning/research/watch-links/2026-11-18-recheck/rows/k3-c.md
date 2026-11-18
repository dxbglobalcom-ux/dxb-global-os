# k3-c — second reading of k3-07, k3-08, k3-09, k3-10 (tab "Kasım 3-4 web linkleri"), 2026-11-18

All four rows have a twin in the 24 Sep - 16 Nov tab (k3-07=w052, k3-08=w057, k3-09=w047, k3-10=w046). The twins'
judgements are in `$R/.planning/research/watch-links/2026-11-16-whatsapp/plan.jsonl`, w052 and w057 have a second
reading in `…/recheck/h1.md`, and all four are already written into board-row files. Each row below says where it
already stands and then writes only what that placement still lacks or gets wrong.

## k3-07 (c07) — nexoupdates reel: "nine paid apps with a free twin on GitHub", plus REA at the end
- Opened: the transcript, whole (`$R/.planning/quick/20261103-web-ders/transcripts/c07-De7DFk0IQkj.txt`, 55 s); h1.md §w052 (frame sheets read there, all 10 repos opened there on 2026-11-17); `gh api` again today for open-higgsfield, WeKnora and Cap; `~/tools`, `~/.hermes`, `docker images`. I did not re-watch the video and did not re-open the frame sheets.
- His note: "Stop paying for software"
- What is in it: the h1.md list holds (h1.md:5-16). Re-measured today: wide-trace/open-higgsfield 6,282★ (last push 2026-09-17), Tencent/WeKnora 37,715★ (push 2026-11-18), CapSoftware/Cap 25,205★ (push 2026-11-18).
- Where it already stands:
  - WeKnora: `B84.md:233` (trial: a compose on the bench with a local model, one client's PDFs, the widget on a test page) and `B83.md:89`.
  - OpenSEO: identical, already on the shelf at `~/.local/share/dxb/skills/openseo` (SOURCE: every-app/open-seo d7ea785), and placed in `B84.md:88-91`. Eliminated.
  - REA: identical, installed at `~/.local/share/dxb/skills/reverse-engineer-anything`. Eliminated.
  - Chatwoot: `B83.md:71`. Cal.com/cal.diy: `B83.md:72`. OpenProject: `B84.md:231` (row w082). OpenWhispr: `B25.md:36,43`.
- What the placement gets wrong or lacks:
  - **VoiceStudio is on disk, contrary to two records.** h1.md:21 says "Not found", and the B43 archive (`B43-full-record-to-2026-11-17.md:136`) says "Voice Studio is not on disk". In fact `~/tools/VoiceStudio` is a git checkout of `debpalash/VoiceStudio` at commit 4ca7dc6 (2026-11-12), with 20 engine folders under `backend/engines` (omnivoice, voxcpm2, cosyvoice, indextts and others). It is not built: there is no `.venv`, no `node_modules` and no docker image. One session has already flagged this (`.planning/quick/20261117-deneme-2/ZEMIN.md:50`), but B43 R23/R25 (`B43.md:56,63`) still do not name the path. Its role in B43 is unchanged.
  - **Open Higgsfield:** h1 proposed copying its catalog-driven settings pattern into the B43 studio surface. That proposal was never written in B43. The same idea is already present there through Freefield, where "each app is a manifest plus a ComfyUI workflow" (`B43.md:176`), and Open-Generative-AI holds the same job of one UI over paid models (`B43.md:175`). Nothing more is needed.
  - **Cap:** no row and no need. Our walkthrough films are made by agents, not recorded by a person.
  - **His note, "Stop paying for software", as a sales line.** B84 already sells one self-hosted twin to clients (`B84.md:231`): OpenProject, "installed and run for you" beside care and hosting. The same offer could cover the other twins already placed (Cal.diy, Chatwoot, WeKnora) as a menu of tools we install and run for the client, under B84's care-and-hosting line. This is a method to be written into an existing row, not a new tool.
- The old verdict and reason ("İzle"; "no new information, OpenSEO and Chatwoot registered"): partly. Six of the ten items are placed. WeKnora was never weighed, and "VoiceStudio biliniyor" understated a tool that B43 actually names, which is now on disk.
- Reader's first reading: **Araştır**, for WeKnora only (already at `B84.md:233`). Two items are already installed (OpenSEO, REA). The VoiceStudio record correction goes to B43.

## k3-08 (c08) — sebintel carousel: "eight free repos for AI filmmaking with Claude Code"
- Opened: slides 01, 02, 04, 05, 06 and 07 as images (`$R/.planning/quick/20261103-web-ders/carousel/c08/slide02,03,05,06,07,08.png`; file N+1 holds slide N); h1.md §w057; `B43.md:200-212`. 14 GitHub search queries today (5 by `gh search repos`, which returned nothing, and 9 by the search API); READMEs of Vincentwei1021/mg-styles-15 and athemeroy/awesome-claude-5-5-videos (today's version, and the version at commit 87e5cbf, the last commit before 2026-10-26); `dxb-motion-graphics` SKILL.md, `references/sound.md`, `sfx/`.
- His note: "Comment DIRECTOR"
- What is in it (the slide numbers are the post's own):
  1. lemomo-ai/lemo-opuscar — the style catalogue, 18,037★. Already in `B43.md:172`.
  2. **Newly identified: https://github.com/Vincentwei1021/mg-styles-15** — MIT, 3,643★, created 2026-10-02, last push 2026-11-17. It matches the slide exactly: 15 styles, one 10-second film each, one prompt per style. What it contains:
     - each film is a page with `window.renderAt(t)`, rendered by headless Chrome with ffmpeg (`harness/render.mjs`);
     - `audio.py` synthesises each film's music and sound effects (the `lib/audio` "mgaudio" toolkit plus 103 VCSL instrument samples, CC0) on the same `cues.json` timing sheet;
     - `rubric.md` is a second AI's review prompt: each film went through two review rounds, with final scores of 7.57-8.21 out of 10;
     - `template.md` is a template for writing the prompt for a new style.
  3. JohnHeibel/ClaudeAnimationBase (3,080★). Already in `B43.md:207`.
  4. JohnHeibel/PDoomVideo (2,967★) — a lyric music video split across parallel subagents.
  5. **Still not identified.** I ran 14 more searches today and listed all 21 of JohnHeibel's repos. The nearest candidates do not match the slide's figures, so none is claimed.
  6. joeseesun/opus-video-prompts (1,146★) — 18 prompts and 54 cases, a "banned list" of template effects, and a cost range per film.
  7. **Newly identified: https://github.com/athemeroy/awesome-claude-5-5-videos** — CC-BY-4.0, 1,028★, last push 2026-11-16. Its README at the last commit before 2026-10-26 reads "As of 2026-10-11: 424 distinct source posts" and "Opus | 301", exactly the slide's figures. Today it holds 597 posts, a "Model Selection Guide" with creator-reported cost and reliability figures per model (Opus 5.5, Sonnet 5.5, Haiku 5.5, Fable 5.2), and "an empirical study of 1,119 files".
  8. yihui-dev/awesome-opus5-5-videos — 703 prompts, 15,763★. Already in `B43.md:207`.
  - Slides 9-10 are comment bait. The "5 ways to income" sits behind the comment and was not read, because commenting is not allowed.
- Where it already stands: `B43.md:207` (ClaudeAnimationBase trial, and awesome-opus5-5-videos as reference) and `B43.md:172` (lemo-opuscar, waiting on his word).
- What we have: `~/.claude/skills/dxb-motion-graphics` already uses the same page-as-a-function-of-time engine (`SKILL.md:8,55`), measured `mg check` gates (`SKILL.md:158`), sound effects with a starter set and `sfx/synth.mjs` (`references/sound.md`), and the rule "Music — This skill adds none. The holding's own work carries no music" (`sound.md:49-51`). By grep it has no scored aesthetic review prompt, no banned-effects list (no hit for `banned` or `lens flare`), and no character or cartoon lane.
- What these have that we do not:
  - mg-styles-15 has a review rubric with scores and two revision rounds; one written prompt per style with a template for new ones; and synthesised sound effects in Python, timed from a cues sheet, beside our `synth.mjs`.
  - PDoomVideo and opus-video-prompts are not placed anywhere. They offer the parallel-writer split of one film, the banned list, and a first cost ruler per film.
  - athemeroy offers creator-reported cost per model for film jobs, a reference for pricing (B43) and for model choice (B51). These are not measurements of ours.
- Board: B43 / `dxb-motion-graphics`.
  - mg-styles-15 is placed **second** beside our skill. Trial: one of its 15 prompts (for example Flat Vector) is run through `mg` on our engine, and its `rubric.md` scores that film and one film of our own. What decides it is whether the rubric finds what our `mg check` gates and his eye find.
  - Its instrument-sample music is limited by the holding's music ruling (`sound.md:49-51`). It enters a client's film only under the client-work ruling, so that part stops at the CEO.
  - The banned list and the parallel-writer split become a **method** line in `references/craft.md`.
- The old verdict and reason ("Gerek yok, konu dışı"): does not hold. B43 already took two of these repos, and two more are identified today.
- Reader's first reading: **Dene** (mg-styles-15 beside `dxb-motion-graphics`). The rest are already placed or are method notes.

## k3-09 (c09) — Voxyz: turning one paid feature into a ChatGPT plugin (one MCP server)
- Opened: the post and its replies with the research door's `opencli twitter thread` (saved at `$J/rows/k3-c-src/k3-09-thread.txt`; the global `opencli` refused X and named the door). Also OpenAI's docs as markdown: `developers.openai.com/llms.txt`, `plugins/deploy/connect-chatgpt.md` (read whole), `plugins/deploy/submission.md` (grep), and `plugins/build/app-quickstart.md` (grep). In the repo: `packages/dxb-mcp`, `packages/gateway/src/inventory.ts`, `pnpm-workspace.yaml`, and `command -v` for the tunnel tools. The post's image was not opened.
- His note: "Ürünün bir özelliğini ..."
- What is in it: the plugin is one MCP server on `/mcp` (MCP SDK, ext-apps, zod), with one tool whose name and description say when to use it, and a `ui://` card registered with `registerAppResource`. It is tested in MCP Inspector, served over a cloudflared tunnel, and added in ChatGPT through Plugins → + → "Add custom MCP server". To be listed it needs a privacy URL, the token at `/.well-known/openai-apps-challenge`, and positive and negative test cases. The post's prompt ends "Don't touch my keys and don't submit anything for review." One reply asks "do ppl actually find them in there yet?"; it got no answer.
- Where it already stands: `B83.md:74` holds "The desk inside ChatGPT (w047, Dene)": the desk's booking function, tried on our own demo with MCP Inspector and a temporary HTTPS tunnel, not sent to the directory. `B83.md:76` says the directory's company verification stops at him. `REVENUE-OPPORTUNITIES.md:235` adds "ChatGPT içinde çalışan randevu işlevi masanın uzantısı".
- What the placement lacks (new facts, read today):
  - **We already serve MCP in-house.** The old line "bizde MCP dışa sunulmuyor" is half right. `@modelcontextprotocol/sdk` 1.29.0 is pinned in the workspace catalogue, and `packages/dxb-mcp` is the holding's own MCP server (`createDxbMcpServer`; groups approval, crm, queue, media, …). That server speaks stdio only (`index.ts:43`), and `packages/gateway` hashes its tool declarations (pin-check). The plugin is therefore a new streamable-HTTP entry on the same SDK and the same pin pattern. Only `@modelcontextprotocol/ext-apps` is missing from `node_modules`.
  - **A tunnel without installing anything.** cloudflared is not installed, but `tailscale` 1.104.1 is (`~/.local/bin/tailscale`). OpenAI now also offers its own "Secure MCP Tunnel", which connects a private server "without exposing the server to the public internet" (`connect-chatgpt.md:19-30`). Whether Tailscale Funnel is enabled on our tailnet is UNVERIFIED (not run).
  - **A plugin is now skills plus MCP, for ChatGPT and Codex.** The docs say "Extend ChatGPT and Codex", and a package carries skills, a manifest and the MCP connection; skills-only plugins exist (`connect-chatgpt.md:5-8,117-127`). The docs also give an evaluation method to copy into the trial: direct, indirect, follow-up, write-needing-confirmation and unsupported requests, each recorded with the tool chosen and its arguments (`:64-78`).
  - **Listing needs more than the old row says.** It needs an OpenAI platform organisation and a verified developer identity, individual or business (`submission.md:25-34`); all four of website, support, privacy and terms URLs for an MCP app (`:610`); the domain challenge (`:145-150`); and an optional country allowlist (`:632`).
  - **No sale line in B84.** The old row named B84 for "siten + ChatGPT eklentin", but B84 (`B84.md:199`) only points to B83, and B83 places the desk's own booking function. Selling a client's plugin with the client's site is written nowhere. It touches B84's is-agentic gate, which already scores "an MCP surface" (`B84.md:181`).
  - **Reader's suggestion, not a fact:** the membership line is literally called "ChatGPT söyler, DxB yapar" (`REVENUE-OPPORTUNITIES.md:237`). A DxB plugin in ChatGPT, which answers "how is this done / the member price if we do it", could be that membership's front door. Demand is unmeasured, as the reply above shows.
- Board: B83, at `B83.md:74`, with relation **new** (we have no outward plugin).
  - Use: in the same trial, the booking tool is put on an HTTP transport next to `dxb-mcp` and run through OpenAI's evaluation set, over Secure MCP Tunnel or tailscale instead of cloudflared.
  - Second owner: B84, a sale line "the client's site plus its ChatGPT plugin". This should be written there, after B83's trial shows it works.
  - What stops at the CEO: an OpenAI platform organisation and account; individual or business verification; the directory submission. ChatGPT Commerce, if it is ever used, is a contract. The custom-server test itself needs a ChatGPT account whose "workspace policies" allow custom MCP servers (`connect-chatgpt.md:47`); which plan does is not established.
- The old verdict and reason ("Dene"): holds. "We do not serve MCP outward" is partly wrong (see above), and the listing requirements were incomplete.
- Reader's first reading: **Dene** (already placed at `B83.md:74`; add the four points above).

## k3-10 (c10) — Voxyz: twelve real-browser user flows before a vibe-coded site ships, with TestSprite CLI
- Opened: the post and its replies with the research door's `opencli` (`$J/rows/k3-c-src/k3-10-thread.txt`); `gh api` and `npm view` for TestSprite; `B84.md:185-189`; `~/tools/ECC/.kiro/agents/e2e-runner.md`, `~/tools/ECC/skills/` (e2e-testing, browser-qa), and `~/.hermes/skills/software-development/dogfood/SKILL.md`.
- His note: "Claude Code tip: vibe-coded işi yayınlamadan önce"
- What is in it: the 12 flows, the setup (`npm install -g @testsprite/testsprite-cli`, `testsprite setup`), and a ready prompt (quoted in the saved thread). TestSprite today: v0.16.0 (2026-11-01), 5,186★, last push 2026-11-16, Apache-2.0. `B84.md:187` is accurate.
- Where it already stands: `B84.md:185-187`, "The acceptance gate — one gate from two rows (w043 + w046)", with the 12 flows by Playwright and TestSprite as the paid twin (opening its account is his).
- What the placement lacks: the post's prompt carries safety handles and a counting rule that `B84.md:187` does not. B84 has only "on the preview, with test accounts and payments in test mode". Missing:
  1. Before anything runs, check that the preview is **not on the production database**. If it is, use local dev on a test database; if neither is possible, stop.
  2. Two **pre-confirmed** accounts, A and B.
  3. **Every created record prefixed**, and at the end **only the prefixed records deleted**.
  4. Mail **only to a test inbox**.
  5. **"A pass that skipped a step is a failure."**
  6. **Each failure reproduced in Playwright before any fix.** Failures that do not reproduce are listed as unconfirmed and rerun once.
  7. A pass/fail/n.a. table for all 12 flows.
  8. Secrets kept out of git and output, with a reminder to revoke any preview-bypass secret (Vercel's `x-vercel-protection-bypass`).
  9. The flows touched by the change, and their neighbours, always included.
  10. The unsubscribe link tried while logged out.
  11. From the replies: the app opened signed out in a private window, and a double-click on checkout over a slow connection (one confirmation page can hide two orders). B84's "breaker" has double clicks, but not the two-orders check.
- What we have beside it, not named in B84:
  - `~/tools/ECC` (a checkout of everything-claude-code; not an enabled plugin) carries an `e2e-runner` agent and `e2e-testing` / `browser-qa` skills, built on Playwright plus "Agent Browser".
  - Hermes's `dogfood` skill (`~/.hermes/skills/software-development/dogfood/SKILL.md`, MIT) is a five-phase exploratory QA of a web app with a screenshot for each issue and a report.
  - Neither is a tool to install: no second framework. They are text a builder may read when writing the gate.
- Board: B84 acceptance gate, `B84.md:185-187`.
  - Counterpart: Playwright with our own visitor agents, and TestSprite as the paid twin.
  - Relation: **method**. The 11 handles above are written into the gate.
  - First trial: unchanged. It is the gate's first bench site, and it should count how many failures reproduce and how many "passes" skipped a step.
  - What stops at the CEO: the TestSprite account (already written).
- The old verdict and reason ("Dene"; the 12 flows to the B84 gate, TestSprite as the paid fallback): holds. The gate took the flows but not the prompt's safety handles.
- Reader's first reading: **Yöntem** (the safety handles into `B84.md:187`). TestSprite stays the paid twin.

## Commands run (decisive)
- `opencli twitter thread …` failed: "Could not find X only through the X gate — run opencli from the dxb-research door". I reran it with `$R/.claude/skills/dxb-research/bin/opencli twitter thread <url>`, which gave rc=0 for both posts, saved under `$J/rows/k3-c-src/`.
- `curl https://developers.openai.com/{llms.txt, plugins/deploy/connect-chatgpt.md, plugins/deploy/submission.md, plugins/build/app-quickstart.md}`.
- `gh api repos/{TestSprite/testsprite-cli, wide-trace/open-higgsfield, Tencent/WeKnora, CapSoftware/Cap, Vincentwei1021/mg-styles-15, athemeroy/awesome-claude-5-5-videos}`, plus their READMEs. For athemeroy I also read the README at the commit before 2026-10-26: 424 posts / 301 Opus.
- `gh api users/JohnHeibel/repos`, and `gh search repos` with 5 queries (no results) and `gh api search/repositories` with 9 queries.
- `git -C ~/tools/VoiceStudio log -1` showed 4ca7dc6 of 2026-11-12. `ls` found no `.venv`, no `node_modules`, and no matching docker image.
- `grep` over board rows, `REVENUE-OPPORTUNITIES.md`, `packages/dxb-mcp`, `packages/gateway`, and `dxb-motion-graphics`. `command -v tailscale cloudflared ngrok` found only tailscale.

## Could not read
- k3-08 slide 5: the repo is still not identified. The "5 ways to income" behind the comment bait was not read.
- k3-09: the post's image was not opened. Which ChatGPT plan allows custom MCP servers is not established. Whether Tailscale Funnel is enabled is not checked.
- No video was watched, downloaded or transcribed.
