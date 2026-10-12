**Report: Chase AI, "This NEW Jev + Claude OS Just Changed Every AI Workflow" (EOdXR6lU5ZA)**

Bottom line: his "OS" is one person's personal command centre. It has three layers: a dashboard, an Obsidian folder used as memory, and a set of skills, some of which run on a schedule. A cheap classifier (Jev) sends each request to one of three tiers. It is sold only behind his paid Skool group. It has no idea of owners, briefs, verification, concurrency, budgets or approvals. Two parts are worth taking: the three-tier routing pattern and the request-receipt protocol.

### A. What I examined
- **Transcript:** yes, read whole. I pulled the `en-orig` auto-captions (the `en` track returned HTTP 429), cut out the repeated rolling lines and read all 44 thirty-second blocks, about 4,670 words. File: `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/v5-chase-os/t.txt`.
- **Frames:** 720p video downloaded. I read 30 images: 23 full frames, 5 crops (including the terminal at 5:30 and his vault rules file at 19:50) and 2 crops that turned out to be blank or duplicates. They cover his dashboard (an Obsidian plugin), his "Jarvis HUD" web app, the Research and Audience tabs, three diagrams, the live Tier-3 terminal and his `CLAUDE.md` vault conventions.
- **Video metadata (yt-dlp):** upload_date 20260925, 1336 s, 150,717 views, plus the description.
- **Outside pages:** skool.com/chase-ai/about, chaseai.io, one Startpage search, and GitHub searches for "agentic os obsidian" and "chase ai jarvis". Exa was rate-limited; the Tavily attempt (run together with the Startpage search) returned nothing.

### B. Findings
1. **MEASURED (metadata).** Uploaded 2026-09-25, after Opus 5.5 (2026-09-22). The screen clock reads "Thu Sep 24" (f20), so it was recorded the day before. A headline on screen reads "Opus 5.5 shipped Sep 22" (f5).
2. **OFFICIAL (his words).** It has three layers: visual, memory (Obsidian) and skills. He calls skills "the backbone" and says to ignore the rest if you have to. (0:01:01–0:03:35)
3. **Shown.** There are two front ends. One is an Obsidian plugin ("Agentic OS V2"). The other is a local web app, "Jarvis V2", at 127.0.0.1:3217. Both have a Claude Code ⇄ Codex toggle, a terminal pane, and buttons that each run a skill (f5, f20, f100). Requests are spoken or clicked; answers come back on screen and out loud.
4. **Shown, diagram (f340).** "Two front doors, one brain, one shared memory." Both front ends feed one "Bridge". The Bridge records each request in the vault and calls the speech service: Whisper hears, Kokoro speaks, both local.
5. **Shown, diagram (f465).** Jev sorts each request into one of three tiers:
   - Tier 1 is "rules + saved data, no AI, instant".
   - Tier 2 is a "small fast model (Haiku / Luna)".
   - Tier 3 "opens a Claude Code or Codex terminal, or runs a skill in the background". Its connectors are Gmail, Calendar, Drive and YouTube, and it "saves reports" to the vault.
6. **Demo shown, timing UNVERIFIED (4:36–5:30).** Three spoken requests were handled:
   - "Bring up morning intel brief" (Tier 1) opened instantly.
   - "Biggest news in AI today" (Tier 2) got a short spoken answer.
   - "Create an explainer, Jev vs LLMs" (Tier 3) opened a terminal.
   - The finished explainer was never shown; the video cuts away while the terminal is still working.
7. **MEASURED (frame z330).** The Tier-3 terminal shows "The Vault | Sonnet 5 | 6%" with "auto mode on". So the heavy tier ran on Sonnet, not Opus.
8. **MEASURED (frame z330).** The Bridge puts a handoff protocol into the prompt. It gives a task UUID and a request UUID, a path under `system\v2\artifact-requests\<uuid>`, and a node helper `artifact-result.mjs` to register the output. It also states rules: "Do not claim that a file is opened or displayed; the dashboard confirms presentation separately", "Keep this request identity unchanged; do not reuse an earlier request command", and "a visual result must be PNG/JPEG/WebP/GIF/PDF, a written result Markdown".
9. **Claimed, UNVERIFIED.** Tier 1 responds in "hundreds of a millisecond" (0:07:13).
10. **Contradicted on screen.** He says Jev is "like 200x faster and cheaper" (0:09:45). His own slide says: "Illustrative outputs — not a speed or accuracy benchmark. LLMs can also return constrained choices" (f560). His example shows Billing 92%, Technical 5%, Sales 3%.
11. **OFFICIAL (his words).** On Tier 2: "Could I put Haiku here?… there's no point in doing that anymore with Jev" (0:10:15).
12. **Shown, diagram (f205, "Skill backbone").** The chain is domain → task → skill → automation, with eight domains each mapped to a skill and a trigger. Examples: /morning-intel daily 6:30; /content-cascade on "video goes live"; /proposal "manual, you check it"; /receipts on the 1st of the month. There are three rules of thumb:
    - "done it by hand twice → make it a skill"
    - "skill works 5 times in a row → automate it"
    - "it sends, spends or publishes → keep it 👆" (that is, manual)
13. **OFFICIAL (his words).** How he finds skills: ask the agent to read your last 30+ days of Claude Code / Codex logs and propose skills, or speak freely for 10–20 minutes about your work (0:11:45–0:13:17). He gives no test results for either method.
14. **Shown (f1190, his vault `CLAUDE.md`, "Last reviewed 2026-05-15").** The real vault follows "Karpathy 3-stage: inbox → projects → content", plus `wiki/`. Each top-level folder has an `_index.md` that is read first. `projects/` requires a frontmatter `status:`. `daily-notes/` is "schema-locked". `system/` holds `schemas/ templates/ metrics/ queue/ runs/ bases/ dashboards/` and a "runner-status.json heartbeat". Files go to archive after 7 days. There is a DO-NOT-TOUCH list.
15. **Shown (f170).** The teaching diagram is a different scheme from his real vault: raw/ → (compile) → wiki/ with a `_master-index.md` → (ask) → output/.
16. **OPINION (his words).** Obsidian adds no memory power; "the power… depends 100% on how you organize your files and folders"; "this is not a RAG system" (0:16:19–0:16:50).
17. **Shown (f5, f885).** On the dashboard:
    - **Usage meters:** Claude weekly usage 4% and Codex weekly usage 24%.
    - **Audience figures:** YouTube 173K, views 16.8M, Instagram 233K, TikTok 142.7K.
    - **Planning panels:** a day schedule and a task checklist.
    - **Headlines:** "Morning headlines".
    - **Weekly review:** an auto-written "YT week review 2026-09-08→09-14" labelling each upload Hit / Steady / Climbing / Miss.
    - **Research tab (f125):** GitHub trending lists and an "Outlier radar".
18. **OFFICIAL (his words).** For teams or clients, each button calls "a headless version of Claude Code or Codex", so a non-technical person gets "90–95% of the power" (0:20:59–0:21:30). Not demonstrated.
19. **OFFICIAL (skool.com/chase-ai/about, fetched 2026-10-12).** It is distributed through "Chase AI+": $99/month, or $58/month on the annual plan, 1.1k members, 4.4 rating from 7 reviews. The page lists "⭐ Jev + Claude OS". It also claims "AI Agents I sell that net me $40k/m"; that claim is unverified.
20. **MEASURED (searches).** I found no public repository. `gh search repos "chase ai jarvis"` returned [], and `gh api users/chasehannegan` returned 404. Social posts gate it the same way: "Comment 'Jarvis' to get my exact Claude OS setup" (Instagram, 2026-08-15).
21. **MEASURED (Startpage results).** It is a running series of earlier versions: "The Agentic OS Setup That Will 10x Claude Code" (2026-06-24), "Claude Code x Obsidian Agentic OS" (2026-08-15) and "graphify x claude os" (TikTok, 2026-06-08). The terminal path `Codex\2026-09-06\…\obsidian-v2` suggests V2 was built around early September. That date is inferred.
22. **Shown.** It runs on Windows (`C:\Users\Chase\The Vault`, f330) and serves one user. It has no agents or roles list, no task board with owners, and no screen that shows parallel jobs.

### C. What it means for the numbered points
- **Point 1 (one-off jobs).** His system has no brief, no done-criteria, no owner and no report-back step. A Tier-3 request is just a terminal session (5, 6). The only formal parts are the request/task UUID and the artifact registration (8). That receipt protocol is the useful piece: every job gets a fixed identity and a registered output, and the agent may not claim something is displayed.
- **Point 2 (continuous lines).** Recurring work is skill + trigger: cron-like times, events such as "video goes live", or deliberately manual (12). Deliverables land as files in the vault and feed the dashboard (17). This matches our content lines in shape only, at one-person scale. The "send / spend / publish stays manual" rule (12) is his version of our approval gate (point 9).
- **Point 4 (planning from a goal).** Only by asking the agent to propose skills from logs or a voice dump (13). It does no goal decomposition.
- **Point 5 (who orchestrates).** It is a deterministic machine (Bridge + Jev classifier + fixed tiers) with no manager brain and no ownership chain (4, 5). That works because there is one user and one worker. It does not answer "who owns this job".
- **Point 6 (models and cost).** It is tiering by request complexity: no AI, then a small model, then a full agent. Even the heavy tier ran on Sonnet (7). The cost figures he gives are illustrative by his own slide (10). Only subscription-usage meters are shown (17).
- **Point 7 (checking).** It has no verification layer. The nearest things are the "do not claim displayed" rule plus the dashboard confirming separately (8), and "automate only after 5 good runs in a row" (12). The second is a useful promotion gate for recurring skills.
- **Point 8 (concurrency).** Nothing is shown. The vault has `queue/`, `runs/` and a heartbeat (14), but how it behaves under parallel load is never demonstrated.
- **Point 10 (live view).** The dashboard shows the orb's state (Idle / Listening / Working / Speaking / Error), usage meters, results and today's schedule (f20, f5). It shows no per-job state, owner or progress. The "motion" is mostly decoration (galaxy and particle animations), which our "motion is state" rule rejects.

### D. Contradictions and doubts
- Spoken "200x faster and cheaper" against the slide's "not a speed or accuracy benchmark" (10).
- The diagram's raw/wiki/output scheme against his real vault's inbox/projects/content (15 vs 14).
- The Tier-3 deliverable was never shown, and Tier-1 latency was not measured (6, 9). The two quick demos may be edited.
- He says Karpathy "works with Anthropic now I believe". I did not check this; it is irrelevant.
- "Luna" and "Sonnet 5" as the model names on screen: not checked against vendor pages.
- I could not inspect the code, the pricing of the OS on its own, or the documentation, because it sits behind a paid login. I did not sign up, under the safety rules. Exa was rate-limited.

### E. Verdict
His OS is a well-presented one-person cockpit, not a work-flow system for a holding. It sells a course and has no public code. Two things are worth taking:
- **Tiered routing.** Deterministic/no-AI, then a small model, then a full agent, picked by a cheap classifier. Our Jev and model-routing research should test it with real measurements, not his illustrative numbers.
- **The request-receipt protocol.** A fixed request/task ID, an output registered by a helper, and a ban on the agent claiming a result was presented.

Two of his rules are also cheap and fit what we already have: "automate after 5 good runs in a row", and "anything that sends, spends or publishes stays manual". The second agrees with our approval gate rather than adding to it.

Do not take the rest. Specifically:
- the decorative orb and galaxy animation as a "live" view;
- Obsidian as the store of record (he says himself it adds nothing beyond folder order; our state belongs in our own database);
- his skill-discovery-from-logs method as a planning engine;
- any cost or speed figure from the video.

He has no answer for owners, briefs, verification against a brief, concurrency or budgets.