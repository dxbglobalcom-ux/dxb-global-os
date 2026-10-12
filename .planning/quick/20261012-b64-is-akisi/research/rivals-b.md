# Report: how work flows in rival sources 14–22, AgencyOS, and the Anthropic and Theo talks

All 12 sources were read whole. Evidence labels are kept as each report uses them: V = seen on screen, T = transcript, C = the CEO's first-hand ruling, R = repo or database measurement, W = web, and UNVERIFIED / U where the report says so. Line numbers point into the source file. Every DXB-side figure quoted inside these reports was measured on 2026-08-10 (AgencyOS on 2026-10-08). I did not re-measure any of them, so treat them as dated, not current.

## A. Per source

**14 — attu.ai, the agents page** (`14-rinaldojanjua-d.md`)
- **Intake:** an orb with "Speak with the CEO". It "logs it to shared memory and suggests who should own it", so a request gets a proposed owner instead of being acted on silently (V, 65, 174-181). An Agent Log keeps the owner's raw sentences with source, outcome and age (V, 66).
- **Ownership:** one CEO/Orchestrator "command layer" routes work to five specialists (V, 83-92). Each specialist is a role plus a list of skills. Every skill row carries a kind (SKILL / SUB-AGENT / SCHEDULED / GLOBAL), the sentences that trigger it, a behaviour rule, a cost line and where it was learned (V, 100-144). The chain is router → specialist → sub-agents (137-139).
- **Recurring work:** a SCHEDULED row prints its own clock, e.g. "At 08:00 AM and 04:00 PM, every day" (V, 140-142).
- **Checking:** the human gate is written inside the skill: "present the whole batch for one approve/deny decision" (V, 147-149).
- **Visibility:** each worker shows working, idle or waiting. In 180 frames no pulse ever entered the idle worker's branch (V measured, 158-161, 378-380). The router's READS 954 equals the memory's 954 RECORDS (V, 90-92).
- **Models and cost:** no model is named (339). Cost is stated per skill (124-125).
- **Ran vs claimed:** 26 log entries, the two legible ones "completed" (322-325). Whether the agents run concurrently is unknown (340). It was filmed on localhost (344).
- **DXB takes:** the five-field skill row (436-444), an owner suggestion for each CEO sentence (493-497), and a pulse that tells the truth about state.

**15 — "4 SaaS tools" PDF** (`15-vibecoder-4-sites-pdf.md`)
- **Recurring work:** Trigger.dev runs long background work outside request timeouts, freezes waiting tasks (CRIU) and resumes from the failed step, not from the start (V, 46-47, 101-107).
- **Intake:** the working assumption is "give the API key to Claude", i.e. an agent writes the integration (V, 42).
- **Cost:** Resend's free tier is 3,000 e-mails a month. Lemon Squeezy takes 5% + 50¢ per sale (R, vendor pages, 92-96, 119-124).
- **Ran vs claimed:** it is a printed document with no figures in it (75).
- **Refused:** Coolify and Trigger.dev as a runtime both conflict with our STACK rules (238-242).
- **DXB takes:** prove resume-from-step on one real workflow (P15-3, 267), and a "symptom → remedy" decision panel (56, 269).

**16 — OpenJarvis repository** (`16-openjarvis-repo.md`)
- **Intake:** 34 channel files and 39 connectors (R, 41-43).
- **Ownership:** 8 built-in agents, including `orchestrator` and `manager` (R, 37).
- **Recurring work:** three modes: on-demand, scheduled and continuous. A scheduled task is four fields, and `context_mode` defaults to `isolated`, so a 07:00 run does not drag the chat behind it (R, 91-93, 139-145). Memory is a background fact extractor (R, 51, 147-150).
- **Checking:** the evaluation code (37,178 lines) is bigger than the agent code (22,181 lines) (R, 36, 131-135). `error_kind` separates a broken harness from a wrong agent (R, 63-66).
- **Visibility:** the morning digest follows a contract: six sections in order of importance, 200 words maximum, interpret rather than list, never name a source that returned nothing (R, 68-83).
- **Models and cost:** a 0–1 complexity score sets a tier and token budget before a model is picked (R, 85-89). `cost_usd` is recorded on every turn (R, 56-60).
- **Ran vs claimed:** never executed here (U-1, 266). The 88.7% local-model claim is the authors' own (U-2).
- **DXB takes:** price every run, split error kinds, keep a standing scorecard, and let scheduled runs declare their context mode.

**17 — Higgsfield, "$150k MRR app"** (`17-dzojolqoqy2.md`)
- **Intake:** one spoken question, "Hey Higgsfield you up?", then nothing more from the human (V·T, 42, 314).
- **Ownership:** a single voice. Who does what underneath is not shown (U-1, 424).
- **Recurring work:** auto-posting across accounts, a trend detector that "auto-added to pipeline", and an incident responder (V, 281-287).
- **Checking:** 578 assets were scored down to 2 winners (V, 254). An incident timeline runs symptom → alert → root cause → failover → 23 minutes of downtime (V, 83, 256).
- **Visibility:** the work screen travels to whatever is being said (97). Counters ease to their true value and stop. Only the face loops (V measured, 234-237, 291-312).
- **Report shape:** what you achieved · what I did · what I found · what broke and how I fixed it · my recommendation · one question (314-320).
- **Ran vs claimed:** the figures carry label C (268-274). The machinery is unverified (424).
- **Refused:** the system creating accounts itself and posting without approval (375-378).
- **DXB takes:** end every report with one recommendation and one question (P17-1), an incident record, and hand over a scored shortlist rather than a batch.

**18 — Luke, "the Slack part of Jarvis"** (`18-dzc-h3trh7c.md`)
- **Intake:** a voice command (36). Customer mail lands in `#customer-emails` (V, 42).
- **Ownership:** Jarvis is "the main operator". Five more agents are Slack members working in seven rooms named after business functions (V·T, 213-217). Bobby, Eva and Scout's roles are UNVERIFIED.
- **Handoff:** an escalation carries the trigger that fired, an explicit permission to refuse ("If it looks like a bad idea… say that plainly"), a message ID back to the origin, and the quoted evidence (V, 221-229).
- **Recurring work:** Sarah pulls mail and reviews and has drafts ready. The ads agent posts a daily read (293-299).
- **Checking:**
  - Two gate classes: approval for the job, then a separate approval for a single dangerous command (`push --force-with-lease`) (V, 267-273).
  - The developer agent reports "Verified locally with xcodebuild" (V, 55).
  - The ads report opens "No changes were made" and recommends refusing one of its own options (V, 247-250).
  - The agent states its own reach: "Google = connected. App Store = public read-only" (V, 254-264).
- **Visibility:** rooms accumulate messages, and freshness is a timestamp or `SYNC` field (301-304). Customer letter to pull request took 19 minutes, with one sentence and one approval from the human (V, 67-72).
- **Models:** not shown (U-3, 401). The motion measurement is UNVERIFIED because the film is handheld (169-183).
- **DXB takes:** rooms, escalation with a handle, an approval block inside the report, a command-level gate, and drafts that stop at one button.

**19 — Luke's runtime** (`19-dzc0f3nx2rb.md`)
- **Ownership:** the Hermes harness, with a separate profile per sub-agent, each with its own instructions, skills, memory and knowledge base, "so they're not all pulling from the same generic setup" (T only, 146, 151).
- **Intake:** Slack, Telegram, iMessage and Voice reach the same agents (T, 147).
- **Host:** an always-on Mac mini (T plus the box is visible, 144).
- **Visibility:** a wall page with an objective card showing target, actual, gap, progress, status, ETA and sync time (V, 170-186). The page clock runs at 1.001× real time (V measured, 211).
- **Models:** UI built with Codex, voice on ElevenLabs (T, 148-149).
- **Ran vs claimed:** one screen only, and three of the six runtime parts are voice-only claims (56, 151).
- **DXB takes:** per-employee isolation and memory that belongs to someone (P19-5/6/7, 310-312), the objective card, and a wall mode.

**20 — No Hype AI, idea capture** (`20-da0euzau0ve.md`)
- **Intake:** a sentence dictated into a phone widget becomes a markdown file in `_inbox` with `source:` and `status:` (V·T, 30-31, 105).
- **Ownership:** a read-only classifier decides and emits a typed route with a `confidence`. A separate `orchestrate.py` performs the act (V, 32-34, 107, 112-114).
- **Recurring work:** `cron · hourly` empties the inbox (V, 32, 115).
- **Visibility:**
  - `manual filing 0 · you typed 1 sentence` on the board (V, 36).
  - `recalled from vault · 0.3s` stamped on the reply (V, 40).
  - A citation line naming the real components and spec (V, 43).
  - "folder = state": where an item sits is its status (V, 35).
- **Models:** Haiku 4.5 does the classification (V, 32).
- **Edit by talking:** a Telegram bot with read-write access edits and re-syncs the list (V·T, 37-40).
- **Ran vs claimed:** the board is an explainer. The 0.3 s is a stated figure, not timed (156-159).
- **DXB takes:** a clock on the intent inbox, a cheap read-only decider with a confidence, edit-by-chat inside the gate, and a human-cost counter.

**21 — "Jarvis, are you up?" camera** (`21-dxyvxcnitak.md`)
- **Intake:** wake by voice. The camera is a mode of the surface (V·T, 40-42, 49-51).
- **Order of events:** the screen acts 0.53 s after the sentence ends, and the voice confirms about 2 s later (measured, 42-43).
- **Latency:** 2.55 / 2.50 / 5.40 / 5.15 s (measured from the waveform, 100).
- **Visibility:** `connected` and `session` are always printed (V, 43, 83). It closes by asking the human a question (T, 47).
- **Ownership:** a single assistant, nothing on an org. Models are not named. The ring pulse is UNVERIFIED (94-98).
- **DXB takes:** act first and explain after (P21-3), a camera mode, and a vision model.

**22 — ATLAS, "the only human in my company"** (`22-danlpq2kdzv.md`)
- **Ownership:** Chief (orchestrator), Ned (research lead) and Hermes (content lead) with five named sub-agents beneath her (V·T, 44-45).
- **Intake and channels:** an agent-to-agent feed with filters `A→A`, `TG IN`, `TG OUT` (V, 39-40). The human writes into the same feed and Chief coaches him back (V, 41).
- **Recurring work:** "communicating with each other 24-7, completely unprompted" (T only, 39, 100).
- **Checking:** messages carry their own proof, e.g. "401 no-creds / 200 with admin", "Port 3008 is live". The agents deploy and operate the machine that runs them (V, 84-91).
- **Visibility:** each card shows `STATUS`, `HEARTBEAT` and `MODEL` (V, 38). Working cards are lit and idle ones still. Three counters sit above the graph, but their values are UNREADABLE (42). The edges move at 2.54× the static text; period and direction are UNVERIFIED (114-117).
- **Do not copy:** a credential printed in plain text (94-96).
- **DXB takes:** an agent-message channel with a feed, heartbeat per employee, actually spawning sub-agents (P22-6), and "a message isn't finished until it carries its proof" (P22-7).

**AgencyOS** (`agencyos-analysis.md`): see section B.

**Anthropic talk** (`Anthropic-Konusmasi-Raporu.md`). This is Claude's report from a transcript (T). The speaker's claims are not measured.
- **Memory works best as markdown files in a filesystem**, searched with grep, with skills loaded by their front matter first (progressive disclosure) (60-82). Read: let memory grow but give good search. Write: give agents autonomy (85-89).
- **Problems seen in production:** concurrent writes; one wrong note in the shared org context spreading to every agent; humans and agents editing together; stale memory; prompt injection (92-100).
- **Four guardrails:**
  - Versioning that records which session caused a change and who made it (107-110).
  - Concurrency by hash compare-and-swap: re-read and retry if the hash changed (112-119).
  - Permissioning: the org tier is read-only, the agent's own scratchpad is writable, with a department tier between (122-124).
  - Portability through a clean API (126-128).
- **Limits of in-session memory:** the agent splits its effort between the task and future runs, and it cannot see patterns across sessions or other agents' failures (137-151).
- **"Dreaming":** a batch, asynchronous job with its own resources. An orchestrator and a sub-agent fleet read transcripts including tool calls, then propose memory changes one by one, each with examples, how often it happens and why. A human accepts or rejects each change (154-203). The transcripts used are scoped to the same permissions as the memory store (236-237).
- **Cost:** claimed to fall because agents solve tasks in one shot (133-134, 214-216). Unmeasured.
- **Harness vs agent:** code into the harness whatever has proved deterministic (240-243).

**Theo (t3.gg)** (`Theo-Video-Raporu.md`). From auto-subtitles. Theo's figures are his own claims, unverified (6, 305).
- **The human is single-threaded and is the bottleneck.** Agents should clear their own blockers so they need him less (212).
- **Verification takes 85–90% of tokens, coding 10–15%** (161, claim). Reverting a bad change must take under 15 seconds (162).
- **Give the problem, not the solution,** and bring the agent in when you start thinking, not when you finish (166-174).
- **Threads are tasks, not history:** "settle" what is done, aim for inbox zero, auto-settle after 3 days, show running threads translucent, look only at "done" or "needs input" (184-192, 208).
- **Put "babysit" in the prompt** so the agent follows the PR until it can be merged (219-220).
- **Agents stepping on each other:** each new thread starts in its own git worktree (224-225). Queue CI so five builds do not crush one machine (289).
- **Cost:** keep a thread on the same account because the cache is per account (107-109). Pooling many subscriptions through one proxy risks the Terms of Service (303-304), so it is not for us. Anything user-facing must go through the API (79).
- **He rejects VPS hosting,** which conflicts with our Hetzner setup (280, 319).

## B. AgencyOS: is a system run by one assistant useful to us?

**It is useful as a parts list for Hamza's hands. It is not useful as a model for how the holding is organised.**

- **What actually ran is narrow:**
  - A spoken or typed command scanned 20 leads into the map and CRM in about a minute (V, 41).
  - Voice or text moved a lead's stage, opened a project and added a service (V, 42).
  - A project drawer works: linked lead, retainer, services, tasks, a weekly calendar (morning/noon/evening × 7 days), recurrence options and "Automations (live · 30s poll)" (V, 43-45).
- **Most of the rest was closed, broken or a plan:**
  - Contracts, invoices and n8n were switched off (V, 61).
  - KPIs read $0, "NO EVENTS" and "QUEUE EMPTY" (V, 62).
  - The Board screen was never run (V, 63).
  - Two pages returned 404 (V, 64).
  - Telegram was only a tab (65).
  - "It builds the solution itself" was only a plan; nothing was built on screen (58).
- **The one-assistant shape is what produced its data errors.** When Claude Code audited JARVIS's records it found five errors (V, 51-56):
  - a deal still at "Contacted" that should be Won;
  - an empty brief with `companyId: null`;
  - a duplicated task;
  - a ₺0 invoice;
  - two playbook services missing.

  On top of that, TL and $ are mixed (125), the CRM says 64 leads where the map says 100 (146), and there is no approval gate at all (109). One assistant writing everything with no second check is the failure. That is why the holding's design keeps Hamza as the door that hands work to the owning employee.

**Take, in order:**
1. **Write tools for Hamza, behind the approval gate** (117). The panel shows each tool call with its approval state. The report measured Hamza's voice and chat path at `tools: []` (103, an agent's measurement on 2026-10-08; I did not re-check it).
2. **The project drawer: client × service × recurring task × report** (119, V 43-45). Add a client/service link, drive recurrence from a cron trigger, have the schema block duplicate tasks, and count a task as done only with proof of output.
3. **"The engineer audits the assistant's data first"** as a standing check (120, V 51-56). This is the pattern that caught its errors.
4. **Playbook and formula schema with an anti-pattern field,** every figure carrying source and date (118, V 69-70).
5. **Cheap text model beside the expensive live-voice model.** Text runs on Gemini 2.0 Flash, voice on 3.1 Live, and he says text is cheaper (38).

**Do not take:** outward contact without the gate (cold calls, WhatsApp drips) (124); the currency mix (125); anonymous case studies and "%1200 ROI" (126); the guarantee/risk-reversal offer pattern, which waits on the CEO's halal ruling (127); the BYOK + n8n + SuiteCRM stack (128); the MCP token shown on screen (129).

## C. Patterns across these sources

1. **One router plus specialists who declare what they can do.** Seen in 14 (orchestrator + skill rows), 18 (main operator + rooms), 19 (a profile per sub-agent), 22 (Chief → leads → sub-agents) and 16 (`orchestrator`, `manager`).
   - **Conflict:** 17, 21 and AgencyOS show one voice doing everything. AgencyOS shows what that costs in data integrity (B).
2. **Deciding is separated from acting, and gates sit at more than one level.** 20 (read-only decider, separate writer), 18 (gate per job and per command), 14 (one approve/deny per batch), Anthropic (org memory read-only, scratchpad writable, human accepts each dreaming change).
   - **Conflict:** 17 and AgencyOS act outward with no gate visible.
3. **Recurring work is a row with its clock on it, attached to an owner.** 14 (SCHEDULED rows), 16 (cron/interval/once + `context_mode`), 20 (cron hourly), AgencyOS (recurrence + 30s poll), 17 (auto-posting), 15 (resume from the failed step).
4. **Reports end in a decision, not an open door.** 17 (recommendation + one question), 18 ("No changes were made" + approve lines, one marked "do not approve yet"), 21 (closes with a question), AgencyOS (plan ends "Onay verirsen…" — "if you approve…", 58), Theo (only "done" or "needs input" reach the human).
5. **Evidence travels with the claim.** 18 (file:line, build command run), 22 (401/200, port), 16 (`error_kind`, evals larger than agents), Theo (85–90% verification), AgencyOS (the audit pass).
6. **Visibility follows real state, and rest is real.** 14 (no pulse to an idle worker), 22 (idle still), 17 (counters stop at the true value), 18/19 (`SYNC` stamp), 20 (latency stamp, human-cost counter), 21 (connected/session).
   - **Conflict:** 18 ends "Slack is where work actually gets done" (a plain room is the work surface), while 14 and 22 put the live graph first. 19 and 18, from the same man, keep both: the wall holds the goal, the room holds the work.
7. **Memory: shared vs owned.** 14 has one shared brain (954 records). 19 gives each sub-agent its own memory and knowledge base. 22 keeps memory in project markdown. Anthropic reconciles them with tiers (org / department / own scratchpad), permissions, versioning and hash-checked writes.
8. **Cheap model for routine decisions.** 20 (Haiku classifier), 16 (complexity router), AgencyOS (text cheaper than voice), Theo (keep cache on one account).
9. **Many channels into the same agents.** 16 (34 channels), 19 (4), 20 (Telegram), 22 (TG IN/OUT).

## D. What none of them solves that the holding needs

- **Scale.** Every system shown has one human and 5–8 agents. None shows 20+ departments and 200+ employees, or routing at that size. 14's owner suggestion works over five workers.
- **A department head checking a specialist's work.** 22 draws a lead with sub-agents, but they are all idle. 14 spawns sub-agents but shows no check on their output. Nobody shows a head verifying a specialist's output before it goes up the chain.
- **Concurrent writes to business records.** Anthropic covers memory (hash compare-and-swap) and Theo covers code (worktrees). Nobody covers CRM rows, tasks or approvals touched by many agents at once.
- **Cost per department or per employee.** 16 prices runs, and Theo is about stretching personal subscriptions. Nobody attributes cost to an org unit or holds a budget per owner.
- **Upward filtering for one single-threaded human.** Theo's inbox handles about 10–15 threads. The CEO, with 200 employees under him, needs heads that consolidate before anything reaches him. Nobody shows that.
- **A holding of companies.** AgencyOS models client × service. None models companies inside a holding, each with its own P&L and staff.
- **A long-lived owner across months.** Anthropic gives the memory mechanism, but nobody shows who owns a recurring duty over time, or what happens to it when an employee's persona changes.
- **Constitutional limits in the flow.** None shows a halal screen or a CEO-only boundary inside routing or the gate.
- **Proof of unattended operation.** "24-7 unprompted" is a transcript claim (22). Higgsfield's autonomy carries label C, but its machinery is UNVERIFIED (17). No source shows days of logged work with nobody watching.

Files read (all whole): `/home/dxb/DxB Global OS/.planning/research/rival-intel/14-rinaldojanjua-d.md` through `22-danlpq2kdzv.md`, `/home/dxb/DxB Global OS/.planning/research/watch-links/2026-10-08-whatsapp/agencyos-analysis.md`, `/home/dxb/Desktop/İNCELEMELER/Anthropic-Konusmasi-Raporu.md`, `/home/dxb/Desktop/İNCELEMELER/Theo-Video-Raporu.md`. Nothing was written to scratch.