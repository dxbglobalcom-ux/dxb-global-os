I read all 13 files whole. Three of them describe real systems running on screen: 29 (Sureflow), the Bennett OS set (30/33/35) and 23 (J.A.R.V.I.S). Four only argue or list tools: 25, 28, 37 and 38. One, 41, is a lecture about how MCP tools reach an agent. One, 34 (cognee), is a code repository rather than a film. Line numbers below refer to the report files under `/home/dxb/DxB Global OS/.planning/research/rival-intel/`. The labels are the reports' own: `T` is speech, `V` is what the screen showed, `R` is a DXB measurement, `W` is a web source, `U` and UNVERIFIED mean not proven. Every DXB-side number below is as each report measured it in Aug–Sep 2026; I did not re-measure any of them.

## A. Each rival

**29 — Sureflow Agentic OS (it runs hermes-agent, the same harness DXB chose)**
- **Intake:** a schedule. "Every single morning at 6am it reviews what got done yesterday, decides what matters today, and then assigns work" `T` (29:46, 142). He calls the result "zero manual task management" (29:44). There is also one chat channel per employee, e.g. `#ceo-channel` `V` (29:57, 114).
- **Ownership:** one `CEO/Orchestrator` card, "Routes work, reviews context, coordinates specialists, and returns the operator debrief", with counters `ROUTES 169 · READS 288` `V` (29:45, 104–107). It routes to five specialists: Researcher, CMO, Sales Rep, Dev, Data Analyst (29:54–55). Each specialist has a layer name, a one-line job, a live state and its own model.
- **Recurring work:** the 6am cycle and a `Daily KB Sync` that refreshes the shared memory, with a node reading `18H AGO` `T`/`V` (29:142–146). The CEO agent files a dated "board meeting debrief" (29:52).
- **Checking:** no reviewer step is shown. The only quality signals are `INTEGRITY 95.41%` and `ERRORS 10` on the wall (29:47).
- **Visibility:** three live states, `working · waiting · idle`, with idle drawn in a neutral colour (29:86–93). The six agents sit permanently in the rail on every page (29:74–76). An `Agent Log · LAST 50` reads like "CEO · Checked 30-day funnel lead count… · gpt-5.5 · COMPLETED · 2h ago" `V` (29:56). Agent-written documents are filed with their reasoning beside them (29:52–53), and each agent's context-window fill is drawn as a bar (29:46, 123–125).
- **Models and cost:** models are mixed by role, `gpt-5.5` ×4 and `gemini-2.5-pro` ×2, printed on each card `V` (29:54–55, 109–112). Usage is on the wall as `TOKENS IN 26,521,165`, but no price is shown (29:47).
- **Ran vs claimed:** it is filmed running, with 11,164 messages and 218 agent calls. That it earns money is `U` (29:135–138).
- **DXB takes:** the employee "grammar": layer name, one job, a three-state pill, the model printed on the card, its own channel, a run log in plain words, and the router counting its own routes. Copy that grammar, not his six-agent roster (29:241–245).

**30 / 33 / 35 — Bennett OS (one operator filmed three times; 35 shows the machinery underneath)**
- **Intake:**
  - One box on the tasks page, "Give the company a task — the Conductor triages it…" `V` (35:75).
  - A conductor chat box drawn inside the org chart (30:55, 127–129).
  - A `CONDUCTOR · SEEING:` panel docked on every page that "sees what you see and routes to the best-fit agent (`@agent-id` to force one)" `T`/`V` (33:59, 81–84).
  - The knowledge base takes "text · voice · drag or upload" (35:77).
- **Ownership:**
  - Operator → `CONDUCTOR (SUPER AGENT)` → department heads with real titles (Finances CFO, Marketing/Growth CMO, TECH CTO, Forge Founding Engineer) plus a Reflection Coach and a Summarizer `V` (35:66, 30:55).
  - A department is "a model + a crew + a toolbox" (35:52).
  - Humans are cards in the same grammar, e.g. `Syed · human employee · runs on human · judgment call` (33:51, 92–94).
  - Runtime: the conductor is Claude Code run headless; paperclip holds tasks and audit; Hermes is the action layer with 9 tools and 78 skills (35:92–100).
- **Recurring work:**
  - Every job is an SOP card: a numbered procedure, `BREAKS INTO` sub-skills, `BUILDS ON`, `WHAT IT REPLACES` and a three-rung ladder from `HUMAN-LED` to `FULLY AUTONOMOUS` (30:48–50, 216–221; 35:84–85).
  - A rung can be refused: "Not the goal, editorial taste stays human" (33:53).
  - The order of steps is a cost decision: "Cull takes that break the brief BEFORE rendering finals, that's where the compute cost is" (33:49).
  - The conductor registered its own daily monitor, "next 2026-08-06 ~20:48 UTC" (35:55). A `CRON JOBS 0` tile is shown honestly (35:56).
- **Fan-out, the core flow:** one typed paragraph asks for six parallel micro-tasks, says "do not do any of the work yourself", gives a rule for broken seats ("Skip TECH if it errors"), and asks for one compiled answer with a CEO verdict `V` (35:58). Six task ids, BEN-33 to BEN-39, appear seconds later. "Agents advance their own cards as they commit and finish" (35:75–76).
- **Checking:**
  - A `Markdown Auditor` checks that the generated org docs still match the live agents, SOPs and tools (30:150–154).
  - A watchdog review, BEN-26, "closed out clean" (35:55).
  - The run chart has `Succeeded · Recovered · Failed · Other` (35:64).
  - The payment SOP will not mark anything paid without a receipt (35:85).
  - Its coding agent reports `972/973 pass`, "Nothing is committed", "None of this is live yet" (35:82).
  - There is no independent reviewer of agent output.
- **Visibility:**
  - The running card shows its plan, "Working for 9 seconds · called 2 tools · startup step…" (35:62).
  - An activity feed of real readings, with failures shown and the fix named (35:57).
  - `● 16/22 systems live · localhost:4100 · sqlite · real agents` on every page (35:48).
  - An unprompted "Three things are waiting on you, in order of payoff… What do you want to pick up?" (35:81).
  - The knowledge graph lights the path a query walks (35:71–73).
  - `INCOME · MTD $0 · 0/6 LIVE`, with expenses labelled `SAMPLE` (33:57, 96–98).
- **Models and cost:** each department has its own model (`claude-opus-4-6`, `claude-fable-5`, `claude-haiku-4-6`, `gpt-5.4` in `ERROR`). The roster mixes six tiers and two vendors (35:52, 68). `COST & RUNTIME $4.31 ESTIMATED` sits under the agents (35:60). Hermes runs on `glm-5.2` (35:70). Monthly burn is $3,946 (33:57).
- **Ran vs claimed:** the run, the fan-out, Stripe at 3,229.23 USD and 11/22 connectors are `V` (35:405–413). The funnel carries his own `DEMO DATA` label (30:54). Answer latency is UNVERIFIED/UNREADABLE (30:185, 33:116, 35:166). The number of agents shifts between films (37 → 112) while the knowledge base stays identical (33:103–105). Note: 35's first version claimed all frames had been read when they had not, and the CEO caught it (35:439–442).
- **DXB takes:**
  - The single sentence that fans out to named seats (P35-9).
  - The SOP card with its ladder and refusable top rung, which is where the approval gate gets written into each job (P30-1, P33-2).
  - The position report as something the product emits (35 §5.1).
  - The docked conductor (P33-1).
  - The `Recovered` outcome class.
  - The model, state and cost shown on the card.
  - The live-systems counter.
  - Not his stack: paperclip, Hermes and the Mac mini would each be a second runtime (35:391–393).

**23 — J.A.R.V.I.S (fatihmakes): a spoken request becomes a posted reel in 22.8 s**
- **Intake:** voice, typing and file drop in one stacked door (23:161–172). It asks for the missing parameter, "What would you like the caption to be, sir?", 1.30 s after the command `T` (23:88–97, 300).
- **Ownership:** one agent drives the whole operating system itself: Start menu → Opera GX → Instagram → file dialog → crop 9:16 → 242-character caption → Share `V` (23:58–72, 253–256).
- **Concurrency:** the microphone stays open while it works. A repeated command is answered in ≤0.20 s and no second post is made `T` (23:68–69, 201–205). The refusal was spoken while the first post was still in flight, which is why the report calls for four states rather than a yes/no (23:451–454).
- **Checking:** no verification step. Its log shows what it heard, mis-hearings included ("video nedir?"), and the tool line `[UploadVideo] Posted to …` (23:213–246).
- **Visibility:** one state word under the sphere: LISTENING / SPEAKING / THINKING (23:122–135). A permanent `⏸ INTERRUPT [ESC]` button (23:168–171).
- **Models and cost:** none shown.
- **Ran vs claimed:** the post itself is `V`. An earlier claim that it started work before the instruction was complete was deleted (23:195–199). Its revenue is not shown (23:401–404).
- **DXB takes:** P23-1 to P23-9 at 23:364–372: ask instead of guessing, one door for all input, show what was heard and what will be done before acting, a refusal that knows the job's state, one universal interrupt, and step-by-step progress with a receipt. The actual hand works behind the CEO gate: prepare everything, show it, the CEO releases it (23:355–360).

**24 — downey.ai / Higgsfield console: the report of a night it worked alone**
- **Intake:** none. The owner was asleep. The machine reports a list of things it did overnight on its own `T` (24:59–77).
- **Ownership:** seven named agents in an `AGENT ACTION FEED` (SENTINEL, ECHO, ATLAS, PRIME, NEXUS, ORACLE, VERTEX). The agent currently acting is boxed `V` (24:63, 115).
- **Recurring work:** the overnight autonomy is the film's claim only. Higgsfield's product pages describe a chat-driven creative team with no scheduled operation, UNVERIFIED (24:147–152).
- **Checking:** "67 weak ads were deleted", spoken only `T` (24:67).
- **Visibility:**
  - The feed refreshes in place every 2.0 s; it does not scroll (24:185–190).
  - A revenue counter rising about $604/s (24:81–88).
  - The surface follows the narration (chart → world map → inbox), but whether that is automatic or edited is UNVERIFIED (24:119).
  - The console comes to rest at 0.06 (24:105–106).
- **Ran vs claimed:** the console motion (11.5× the room) is `V`. "84 products shipped" and "47 markets" are claims. The spoken "287" contradicts the screen's "368" (24:77, 335–341).
- **DXB takes:** a feed of named agents and verbs, a rate beside each value with zero printed as zero, the one-line "awaiting operator" self-description, and the surface following the talk. Order matters: P24-1, getting events to flow again, comes before any feed is drawn (24:258–268). The content farm's ban evasion is not taken (24:306).

**25 — "A map is not a move" (listened only, on the CEO's order)**
- **Intake:** an outside event. When "some data point or news comes out, you want your agents to come to you and say, we can take XYZ action, and these would be the follow-on effects" `T` (25:24–25).
- **Visibility:** the visualisation comes after the proposal, for steering (25:26).
- **Ran vs claimed:** nothing ran; this is argument only. The screen is UNVERIFIED (25:61–65).
- **DXB measured:** 51 approvals, 0 `recommended_action` filled `R` (25:79).
- **DXB takes:** every surface carries a proposed next move with its consequences, triggered by an event, not by a click (P25-1 to P25-4, 25:106–109).

**28 — A revenue tier list that ranks "AI OS" in a tier of its own, above all others**
- **Recurring work:** his top four systems are all triggered by events: a lead arrives, a call is missed, a customer goes quiet, a purchase pattern completes (28:204–208, 297–298). The AI OS is "what deploys all the S tier systems" `T` (28:66–69).
- **Checking:** the report checked his speed claim against the primary study. The MIT study says 5 minutes and 21× the odds of qualifying a lead, not 60 seconds and 21× the money (28:174–189).
- **Ran vs claimed:** nothing is shown running `U` (28:198–200).
- **DXB takes:** an appointment clock, a visible answer-time target, the outbox opened first (51 of 51 failed `R`), and a rule that AI does the research and analytics, never the voice (P28-1 to P28-5, 28:270–276).

**32 — lukebuildsai: the system draws itself**
- **Intake:** three input surfaces: Slack, iMessage and voice `V` (32:46). A spoken sentence changes the wall in 2.2 s, before the voice answers (32:39–40).
- **Ownership:** `J.A.R.V.I.S. · AGENT ORCHESTRATOR · AGENT MESH` with five agents, each a name plus a lane: `TOM · DEVELOPER`, `SARAH · CUSTOMER SUPPORT`, `EVA · CONTENT MANAGER`, `SCOUT · CONTENT RESEARCH`, `BOBBY · ADS · GROWTH`. They are footed `5 AGENTS · SHARED CONTEXT` and `STATE · IDLE` (32:43–44). "Each have their own context and skills, so they know what they're responsible for" `T` (32:43).
- **Flow model:** channels → mesh → reasoning core → tools (Instagram, Meta Ads, Gmail, Calendar, Stripe…) (32:72–78).
- **Visibility:** a moving light on every live wire at 28 px/s, repeating every 1.00 s. Its direction carries meaning: work comes in from channels, goes out to tools, and asks upward to the model. An idle link shows no light (32:93–129).
- **Models and cost:** one chip, `CHATGPT 5.x`, shown as a replaceable part (32:42).
- **Ran vs claimed:** the money card (`REVENUE $16,650` against a $30k MRR target) is `V` (32:37).
- **DXB takes:** P32-1 to P32-5: the holding drawn as a page of the product itself, each employee's lane printed on the employee, the tool shelf, and a sentence that changes the wall (32:159–163).

**34 — cognee (code repository, read under its Apache-2.0 licence, not to be installed)**
- **Recurring work:** `remember(run_in_background)` writes to a fast session cache that syncs to the graph in the background (34:148–156). `improve` is a scheduled pipeline (34:96–101). The permanent write happens at `SessionEnd`, after the human has left (34:155–156).
- **Checking:** the agent's own working trace is written back as memory (`persist_agent_trace_feedbacks_in_knowledge_graph`). Learning goes into `truth_subspace`, which is rebuilt deterministically (34:100–106).
- **Visibility:** the screen refreshes at three speeds: 5 s while work is in flight, 15 s at rest, 120 s when idle. The idle check exists for "pipeline runs… started elsewhere — another tab, an agent, a direct API call" (34:161–177).
- **Models and cost:** one Postgres store; their own CI measured search ~10% faster than the split stack (34:113–117).
- **DXB takes:** the method for the memory brain already approved on the board: links extracted rather than typed, events as nodes in the graph, agent traces as memory, ownership in the model from day one, and the three-speed refresh (34:220–253).

**37 — six free video engines (only the named tools kept, on the CEO's order)**
- **Ownership:** setup is handed to an agent as one paragraph: "Check my system first. Install everything… Then show me how to run it" (37:44, 65–67).
- **Models and cost:** Remotion charges $0.01 per render with a $100/mo minimum. Open-Sora, LTX-Video and HyperFrames are Apache-2.0 and run locally. Published speed: preview at 3 s, HD at 10 s. Whether that holds on DXB's 16 GB card is UNVERIFIED (37:60–75).
- **DXB takes:** a local render lane recording seconds-per-render as a cost unit, and an artifact record (P37-2 to P37-3, 37:111–117). It pairs with 33's UGC card: 33 says what the lane is worth, 37 what it costs to run (37:146–153).

**38 — ericsocal: five commerce SaaS tools (frames only)**
- **Checking:** the report researched each tool. Four of the five cannot be driven by an agent at all (38:223–229).
- **Models and cost:** the stack costs about $142/mo for one seat (38:231–235). ChatGPT is not a new purchase: models already route through LiteLLM (38:184).
- **DXB takes:** P38-1, the API-first admission test: "can an agent drive this without a human at a browser?" (38:257–262). And P38-2, a read-only WooCommerce connector, so revenue stops being typed in by hand (38:264–271).

**41 — "MCP Çok Daha İyi Hale Geldi" (listened)**
- **Models and cost:** one-tool-per-endpoint costs about 150,000 tokens of definitions (41:48–51). The client discovers tools when needed, and the 1–5% threshold is set by the client (41:59–69). In "code mode", intermediate results never enter the context (41:71–77). Frequent multi-step jobs are wrapped into one tool (41:79–91). An agent is given only its own categories (41:93–95).
- **DXB measured:** 126 tools arrive as names only (about 1,150 tokens), Playwright is mounted twice (49 tools), and the opening is about 18,340 tokens. The claude-mem injection is UNVERIFIED (41:120–175).
- **DXB takes:** each employee gets its own tool category, not the whole arsenal. The report notes the research fleet already wraps a multi-step job into one, as the film recommends (41:199–205, 242–243).

## B. Patterns across these rivals

1. **One orchestrator that routes and does not work itself.** Seen in 29 (`ROUTES 169`), 35 ("do not do any of the work yourself"), 32 (agent mesh) and 24 (the same pattern by voice). In every case the orchestrator is a card on the org picture with its own counters. Conflict: 23 is one agent that does everything itself.
2. **A department means model + crew + tools + written procedure.** 35:52, 30:47–49, 32:43–45. The model is printed on the department or employee in 29, 35 and 32. The models are always mixed by role: two vendors in 29, six tiers in 35.
3. **Scheduled self-start.** 29's 6am cycle, 35's self-registered monitor with its next wake time, 34's background sync, and 28's event-triggered systems. 25 pushes the trigger outward: news or data arrives and the agent comes to the human. Conflict: 35 also shows `CRON JOBS 0` and "neither service survives a reboot" (35:81, 134–135). The clock is drawn but not wired.
4. **Autonomy as a ladder per job, not a switch.** 30/33/35 only. The refused rung (33:53) is the only place any rival writes a boundary into the work itself. Conflict: 23 and 24 run fully autonomous on outward acts; 35 does so on payment verification.
5. **Visibility is named agent + verb + elapsed time.** 24's feed, 29's log, 35's running card, 23's `[UploadVideo]` line. Idle is shown as a neutral state in 29 and 32. Rest and zero are honest in 24 (0.06), 28 (empty rows) and 33 (`$0 · 0/6 LIVE`).
6. **Fan-out then compile.** Only 35 shows a parallel fan-out to named seats with one compiled answer and a verdict. It shows six seats only.
7. **Checking is weak everywhere.** Output is checked only by:
   - the honest-failure lines in 35:57;
   - the self-audit agent in 30:150–154;
   - the "cull before render" step in 33:49;
   - the receipt rule in 35:85;
   - feedback written back into memory in 34.

   No rival shows a second agent reviewing another agent's output against a brief.
8. **Cost shown as one total, never per job.** 29 shows tokens but no price. 35 shows `$4.31` estimated. 37 prices per render. 41 counts tokens as cost. Nobody shows cost per task or per department against a budget.
9. **Surface follows the human.** 33's docked conductor, 32's 2.2 s sentence-to-wall, 24's narration (UNVERIFIED as automatic). 25 says the move must come before the map.

## C. What none of them solves that the holding needs

- **Scale and concurrency.** The largest fan-out actually filmed is six seats (35:58). Every live roster is 5–10 agents (29, 32, 35). The "112 agents" in 33 is a card count, not runs. No rival shows queueing, priority between departments, many heads working at once, or collisions on shared resources. 35's environment leases (35:65) are the only hint. Nothing approaches 20+ departments and 200+ employees.
- **Two-level delegation.** No rival shows head → specialists → head reviews → general manager → CEO. 35 is conductor → seat → compiled summary with one verdict line. Hamza's "give it to the owner and bring the result back" with a head in the middle is not shown anywhere.
- **Verification against the brief.** No independent checker before a result reaches the human. Recovery is counted (`Recovered`) but not explained.
- **Cost control.** No per-task or per-department budget, no hard stop shown, no model choice driven by cost. DXB's LiteLLM budget stop (38:184) is ahead of every rival here.
- **The approval gate inside the flow.** 23, 24 and 35 act outward or on money autonomously. Only 33's refused rung writes the boundary into the job. None shows a prepare → show → CEO releases step, which 23's report proposes (23:355–360).
- **Recurring work that survives the machine.** Schedules are shown but not durable: `CRON JOBS 0`, nothing survives a reboot (35). 24's overnight run is a claim.
- **Proposal with consequences.** 25 asks for it; none of the filmed systems delivers "here is the action and its follow-on effects". 35's "in order of payoff" with the number each item moves is the closest.
- **Multi-company ownership.** 35 has business filter chips (35:49) and 34 has datasets and tenants. No rival routes work between several companies owned by one holding.