I could not watch either video directly, but I got everything I needed another way. Both have full auto-captions, and I read both all the way through. For V2 the official Anthropic documentation is published and dated, and the product shipped after Opus 5.5. V3 retells an Anthropic talk from 2025-12-08. The narrator adds two of his own practices and describes them as Anthropic's, and the narrator's "Anthropic engineers just said" hook makes a nine-month-old talk sound new.

## A. What was examined

**V2 (Chase AI, Mods, 2026-10-02, after Opus 5.5)**
- **Transcript:** read whole, yes. The first `yt-dlp` call failed with `HTTP Error 429: Too Many Requests`. Asking only for the `en-orig` track with `--sleep-subtitles 5` worked. I cleaned it to 1,899 words in `v2.txt`.
- **Frames:** 9 read (0:40, 1:02, 1:15, 2:10, 4:50, 5:35, 6:15, 7:20, 7:50). The first video download failed with `HTTP Error 403`. It worked with `player_client=tv,mweb`.
- **Official sources read:**
  - The Mods overview, reference and API pages, in full or by section: `code.claude.com/docs/en/plugins/mods/{overview,reference,api}.md`.
  - The changelog at `code.claude.com/docs/en/changelog.md`.
  - GitHub issue anthropics/claude-code#91870, read through the public API.
  - Downloaded but only skimmed by heading: create, interface, events, test, admin.
- **Repo check:** a quick read-only look at how the holding's runtime starts Claude.

**V3 (Nate Herk, 2026-09-13, before Opus 5.5)**
- **Transcript:** read whole, yes; 2,533 words in `v3.txt`.
- **Frames:** 7 read (0:27, 1:35, 2:30, 4:40, 6:35, 7:15, 8:20). The video is mostly a talking head plus motion graphics, so the frames carry little.
- **Primary source found and read whole:** "Don't Build Agents, Build Skills Instead", by Barry Zhang and Mahesh Murag of Anthropic, on the AI Engineer channel (https://www.youtube.com/watch?v=CEvIs9y1uog). Upload date measured with `yt-dlp`: `20251208`. It is 16:22 long; my cleaned transcript is 2,656 words in `orig.txt`.
- **Related Anthropic posts read:**
  - "Equipping agents for the real world with Agent Skills", 2025-10-16, by Zhang, Lazuka and Murag.
  - "Building effective agents", 2024-12-19, by Erik S. and Barry Zhang.
- **Not done:** I took no frames from the original talk, because its transcript was enough. No search engines worked for this task: Exa and Tavily both returned rate or quota errors. Startpage, through `hidden.py`, did work and found the official Mods page.

Everything is under `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/v2v3-mods-anthropic/`, in `v2.txt`, `v3.txt`, `orig.txt`, `web/`, `f2/` and `f3/`.

## B. Findings

**V2: Mods**

1. OFFICIAL · Mods shipped in Claude Code 2.1.287 on October 1, 2026, with the changelog line "Added Claude Mods: plugins may now modify deeper behavior". That is after Opus 5.5 · changelog.md:797-800.
2. OFFICIAL · A mod is a plugin made of JavaScript or TypeScript handlers that run inside Claude Code's own process. On each event a handler can let it pass, rewrite it, or answer it so the normal behaviour never runs · mods-overview.md:9, 179-183.
3. OFFICIAL · Events a mod can hook:
   - tools: `tool.call`, `tool.check`, `tool.describe`
   - prompts: `prompt.submit`, and `prompt.compose`/`prompt.section`, which can rewrite or remove parts of the system prompt
   - turns: `turn.step`, which can change the model or effort for each request
   - subagents: `agent.spawn`, which can pick a subagent's model or refuse it
   - sessions: `session.*`
   - interface: `ui.*`
   - other plugins: `plugin.register`, which lets a mod refuse another mod
   - Source: mods-reference.md:51-175.
4. OFFICIAL · A mod can call these tools: commands, tools, calls to a model, timers, messages to other sessions, files, processes, HTTP, a key-value store shared by every session on the machine, a list of agents with their status, and sound · mods-reference.md:181-203.
5. OFFICIAL · What a mod can draw: a pane beside the transcript, a band above the prompt, buttons, text fields, toasts, a status line, and restyled built-in rows. The permission prompt is the one thing it cannot restyle · mods-overview.md:19-23, 83; reference:209-223.
6. OFFICIAL · Mods are installed as plugins from a marketplace with `/plugin install name@marketplace` and switched off through `/plugin`, `--safe-mode` or `disableAllHooks`. `claude plugin validate` lists what a mod does without running it · overview:41-48, 87-110.
7. OFFICIAL · Mods are not sandboxed. A mod runs with the user's permissions, can read secrets, can approve a tool call that an `ask` rule or a `PreToolUse` hook would have stopped, and spends the user's usage · overview:68-81.
8. OFFICIAL · In `claude -p` and the Agent SDK, a mod's hooks run but nothing it draws appears · overview:193-201.
9. OFFICIAL · The built-in mods (`agents-md`, `diff`, `sec-default`, `telemetry`) are not stopped by `disableAllHooks`, `--bare` or `--safe-mode` · overview:229-238.
10. OFFICIAL · Origin: issue #91870, opened 2026-09-03 by user `poteat`. It called the feature "function hooks", announced the name "Claude Mods" on 2026-09-09 together with the early-access flag `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`, and announced it live on Oct 1 · GitHub API output.
11. OFFICIAL (screen) · @ClaudeDevs post "You can now mod Claude Code: change how it behaves, customize the UI, swap in your own features…", Oct 1, 2026, 1:08 PM · V2 0:40.
12. EXPERT/demo · He shows a "next steps" pane that offers three suggested follow-up prompts after a task · V2 4:39-5:40, frame 4:50.
13. EXPERT/demo · He shows a cache-clock band ("43 minutes" left before the cache goes cold) with a Compact button · V2 5:40-6:41, frame 6:15.
14. EXPERT/demo · His recipe is an audit prompt: Claude reads his last 30 session transcripts and proposes 5 mods ranked by time saved. It returned Rehearsal Deck, Project Pulse, Mod Doctor, Cache Clock and Undo · V2 7:12-7:50, frames 7:20 and 7:50.
15. OPINION · "Biggest upgrade since skills" and "an ecosystem will grow exponentially" · V2 0:01, 8:42.
16. ANECDOTE, UNVERIFIED · He says Boris Cherny tweeted about this in early September. The issue I could check was opened by `poteat`, not Cherny · V2 0:45.
17. UNVERIFIED and partly contradicted · He says a warm cache gives "95% discount" and "lasts for an hour". The official default cache lifetime is 5 minutes, configurable to 1h with `subagentPromptCacheTtl`, for a mod's own `$.model.complete` calls (api.md:148). I did not open the docs page that governs the main session's cache, and I did not check the 95% figure · V2 6:11.

**V3: skills instead of separate agents**

18. OFFICIAL/EXPERT · The original talk's thesis is that "code is all we need". Claude Code turned out to be a general-purpose agent whose scaffolding can be "as thin as just bash and file system". The gap is domain expertise, so stop rebuilding a separate agent for each domain and build skills on one general agent · orig 1:17-2:48, 15:53.
19. OFFICIAL · Skills are folders of procedural knowledge that can carry scripts as tools. Only the name and description sit in the prompt at startup; the full file loads only when the skill is used ("progressive disclosure") · orig 2:48-4:54; skills-blog.md:41.
20. OFFICIAL · Their example: Claude kept rewriting the same slide-styling script, so they had it save the script inside the skill "as a tool for his future self", which made results more consistent and cheaper · orig 3:49.
21. OFFICIAL · "Sorting a list via token generation is far more expensive than simply running a sorting algorithm… because code is deterministic, this workflow is consistent and repeatable" · skills-blog.md:82-84.
22. OFFICIAL · The architecture they describe: agent loop + runtime (file system and code) + MCP servers + a library of skills. Anthropic shipped its financial-services and life-sciences offerings as MCP servers plus skills · orig 9:08-10:42.
23. OFFICIAL · Open questions they name as future work: testing and evaluation of skills (did it trigger at the right time, is the output quality right), versioning, and skills that depend on other skills · orig 10:42-11:43.
24. OFFICIAL · Their "guarantee": "anything that Claude writes down can be used efficiently by a future version of itself". Skills hold procedural knowledge, not all memory · orig 13:20-13:51.
25. OFFICIAL · Anthropic's guidance on when agents are the right choice:
    - Start with the simplest solution.
    - Agentic systems trade latency and cost for better task performance.
    - Workflows give predictability for well-defined tasks; agents fit open-ended problems where the number of steps cannot be predicted.
    - Agents mean "higher costs, and the potential for compounding errors".
    - The page now carries a note that the tooling has changed and points to Managed Agents.
    - Source: bea.md:24, 43-45, 172-174.
26. EXPERT (Nate), faithful retelling · DRY scripts in skills, progressive disclosure, and the future-self guarantee · V3 1:32, 3:02, 5:04.
27. EXPERT (Nate), his own addition · Write sharp skill descriptions and test triggering three ways: an obvious request, a differently worded one, and an unrelated one that must not trigger. This is consistent with the official advice about `description`, but the three-way test is his · V3 4:02-4:33; skills-blog.md:97.
28. EXPERT (Nate), his own addition presented as Anthropic's · Build verification into the skill:
    - render screenshots and check them, check claims against primary sources, or use a reviewer-persona panel
    - "verification isn't Claude reading its own work"; it needs evidence from outside the draft
    - "define the acceptance criteria" before returning
    - This does not appear in the original talk · V3 6:35-8:35, frame 8:20.
29. EXPERT (Nate), partly sourced · Skills are portable to Codex and Hermes Agent because "Agent Skills are an open format". The open standard was published 2025-12-18, after the talk (skills-blog.md:24); the portability to those two tools is his claim · V3 6:05-6:35.

**Repo (read-only)**

30. MEASURED · The runtime uses the Agent SDK pinned at `0.3.296` (pnpm-workspace.yaml:10), in the `kernel`, `orchestrator` and `voice` packages. It is isolated with `settingSources: []` (`/home/dxb/DxB Global OS/packages/kernel/src/sdk-isolation.ts:157`) and logs a count of loaded plugins (line 220).

## C. What it means for the question points

- **Point 5 (who orchestrates):** The original (#18, #22) supports one general runtime with ownership expressed as skills plus MCP. That fits Hamza handing work to employees, each being a persona plus skills on the same Agent SDK runtime, with no per-department agent stacks. "Building effective agents" (#25) gives the split: work with a known path (point 2's continuous lines, recurring client services) belongs in fixed workflows, i.e. the deterministic orchestrator; open-ended goals (points 1 and 4) belong to the agent loop.
- **Point 6 (model and cost):** Saved scripts replace token-generated work (#20, #21), which cuts cost and variance on repeated production steps such as rendering, styling and posting. For the engineers' own sessions, mods' `turn.step` and `agent.spawn` (#3) can enforce model and effort per request or per subagent in-process. Today's `dxb-cost-gate` settings hook does part of that job, so a mod would be a second, overlapping layer.
- **Point 7 (checking work):** Nate's rule (#28) is to define acceptance criteria first and verify with evidence from outside the draft (screenshots, tests, sources), then report what could not be verified. That matches the brief-against-real-tests rule. His reviewer-persona panel is the opposite: refuting toward a better version, which point 7 rules out. The official open question (#23) shows Anthropic itself treats evaluation of skills as unsolved.
- **Point 2 and 3 (continuous lines, changing mandates):** Skills that improve through corrections (#24) are the official way to keep procedure current. Point 3 (mandates changing over time) maps onto editing the skill, while point 2 (lines running continuously) needs a scheduler, which skills do not give.
- **Point 9 (approval gate):** For the engineers' sessions, a mod's `tool.call` hook can hold or deny actions (as in the official `blast-radius` sample). But a mod can also approve past `ask` rules and is not sandboxed (#7), so it is not a safe place for the CEO's gate. In the runtime, mods would duplicate the gate the holding already has.
- **Point 10 (CEO sees work live):** Mods draw only in the terminal and the Desktop app, and draw nothing in the Agent SDK (#8). They cannot be the CEO's live surface. At most they give engineers a live view of their own sessions: agent status via `$.agent.list`, timers and toasts (#4).
- **Point 8 (many jobs at once):** `$.store` is a 4 MiB key-value store shared by every session on a machine, and `$.session.send` sends messages between sessions (#4). These are coordination tools for the engineers' own sessions, not for runtime concurrency.

## D. Contradictions, doubts, unverified

- **V3 framing:** The title "Anthropic Engineer Explains" refers to two engineers. The opening "just said" refers to a talk uploaded 2025-12-08, about nine months before his video. Practices #27-#28 are framed as "what Anthropic engineers are building", but #28 is not in the original.
- **Model dependence (V3):** The original's thesis is architectural and does not depend on a particular model generation. The only dated claim is that agents "lack expertise", made in the era of the 4.5-generation models. "Building effective agents" carries Anthropic's own note that its tooling picture is out of date (#25). I found no evidence that Opus 5.5 changes the skills advice.
- **Unverified V2 claims:**
  - the Boris Cherny tweet;
  - the "95% discount" and one-hour cache lifetime;
  - that "everything in desktop applies to terminal": the docs say elements marked terminal-only differ, and WSL sessions get no mods at all;
  - whether his "next steps" and cache-clock panes are mods of his own or someone else's; he did not show their code.
- **Unverified for the runtime:** whether the built-in mods load in the holding's isolated SDK sessions. That matters because `agents-md` loads `AGENTS.md` as project instructions and survives `--bare` (#9). I also did not confirm which Claude Code version SDK `0.3.296` bundles; 2.1.296 is a guess from matching numbers. Measuring this means running the SDK, which I did not do; it is the lead's call.
- **Not opened:** the `prompt-caching`, `interface`, `events` and `admin` pages were only skimmed by heading or not opened. The `anthropics/claude-code-playground` mods samples were not opened.

## E. Verdict

**V2:** Mods are real, official (2.1.287, 2026-10-01) and powerful. They are an in-process plugin layer over Claude Code's events and interface. For the engineers' build sessions, two things are worth taking:
1. One guard or meter mod. Candidates: a hold on dangerous commands like `blast-radius`, a context and cache meter, or a band showing agent status. Any of these would be written and reviewed like any other code.
2. His audit-transcripts-then-propose-mods prompt, as a cheap way to find repeated friction.

Do not take these:
- Mods as part of the holding's runtime: nothing draws in the SDK, and the runtime already has its own gates and isolation.
- Mods as the approval gate: they are unsandboxed and can approve past `ask` rules.
- Mods as the CEO's live surface.
- His hype and his cache numbers.

Before installing anything, run `claude plugin validate` and decide whether to set `allowManagedModsOnly`.

**V3:** Take the original, not the retelling. One general runtime, with each employee's expertise packaged as skills (scripts for the repeatable parts) plus MCP for connections. That supports ownership chains on one Agent SDK runtime. Pair it with Anthropic's own split: workflows for predictable recurring lines, the agent loop for open-ended goals. From Nate, take the acceptance-criteria-plus-outside-evidence pattern, because it is exactly point 7, and his three-way trigger test for skill descriptions. Do not take his reviewer-persona panel, because it is refutation toward a "better version". Do not repeat his claim that Anthropic itself prescribes the verification loop.