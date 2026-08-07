# 11 — Rinaldo Janjua — a five-stage inbox agent, and the one word on it we should steal

> Written 2026-08-08 from nothing, after watching the video start to end with its sound
> (ledger law 4). No sentence of the report the CEO binned on 2026-08-01 was opened or re-used.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbA3JgbphEs/ |
| Uploader | Rinaldo Janjua (`rinaldojanjua.ai`) — ledger row 11, the first of his four (rows 11–14) |
| Kind | reel — a handheld phone recording of a laptop screen showing one architecture diagram |
| Media on disk | `media/11-DbA3JgbphEs.mp4` |
| **sha256** | `c76361d6bee7dad583cfe422bf97e7ecd4ce72a9edd683ce6241dfdb47bec014` |
| Resolution / audio | **720 × 1280**, audio kept — **meets the CEO's floor exactly on the short side (720), the lowest-quality source watched so far** |
| Duration | **97.04 s** |
| Spoken word | `transcripts/11.json` — en, 25 segments |
| Frames | `frames/11/` — 97 native frames at 1 fps + 1 scene cut |
| The CEO's note | listed without a note (item 11 of his list) |

### How the temporal analysis was performed — stated exactly

Watched **start to end with its sound**, transcript beside it, frames read every 5–7 s: the screen
holds one static diagram and the camera pans slowly left to right across it, so the content changes
only as the pan reveals the next card. **No zooms were needed** — at 720 px the card text is legible
in the native frames, and the two places where it is not (`RJ Brain` sub-label, the left-hand footer
line) are written **UNREADABLE** below rather than guessed.

---

## 2. Second-by-second record of what was watched — 00:00 to 01:37

**The whole reel is one diagram, panned.** Two captions sit fixed over it for the first ~25 s:
**`Inbox Cleaner agent saves me 15hrs/wk`** (black box) and **`It Unsubscribes for me`** (white box).

**The page header, read at 00:11 and 00:24:**
> *(chip)* `EVERY DAY` — **`Inbox Cleanup`** — *"Sorts every new iCloud email into ~22 folders,
> curates newsletters, auto-unsubscribes from spam, then texts the items that actually need
> Rinaldo."*

**The page footer, read at 00:36 and 00:75:**
> `⚙ FULLY AUTONOMOUS` — *"Fully autonomous. **Hard rule: never deletes, only moves.**"*
> and, on the left, *"… and urgency flags — sent even on quiet days."*

**Top-right of the canvas, read at 01:09:** a pill reading **`RUN BY  COO`** with a close `✕`.

| t | What was on screen, and what was said |
|---|---|
| 00:00 | Diagram in view, camera close. **SPOKEN (00.37–05.37): *"So this is the free AI system that sweeps through my entire iCloud email, filters out spam, unsubscribes for me, and then texts me the important stuff for me to review."*** |
| 00:04 | Two cards visible, gold and cyan. Captions over them. |
| 00:09 | **SPOKEN (09.37–14.37): *"It starts out here with a Python script that flags the past senders based on their behavior and decides whether or not it's important for me to view."*** |
| 00:11 | **STAGE 01 card, read in full.** Badge `SORTS`. Title **`Sweep`**. Body: *"Bulk-moves mail from senders it already trusts, before anything else runs."* Technical line: **`inbox-manager/bulk_sweep.py · iCloud IMAP`**. Icon: a folder with three messages flowing into it. Two chips: **`High-confidence sender moves`** · **`Never delete, move only`**. |
| 00:16 | **SPOKEN (16.37–20.37): *"Then once it's decided, it routes each email to its relevant folder."*** |
| 00:20 | **SPOKEN (20.37–28.37): *"So I have a folder for receipts, I have a folder for click-up team notifications, I have a folder for new AI strategies to implement, and it loops until the inbox is clean."*** |
| 00:24 | **STAGE 02 card, read in full.** Badge `ROUTES`. Title **`Classify`**. Body: *"Reads each new message and picks one of 22 folders, looping until nothing is left unfiled."* Technical line: **`sort_batch.py + sort_state.json`**. Three chips: **`Classify every new message`** · **`22 folders (Clickup, Receipts…)`** · **`Loops until to-do hits 0`**. A fourth chip hangs below on its own: **`Personal mail stays in INBOX`**. |
| 00:28 | **SPOKEN (28.37–33.37): *"Then all the inbound email leads are automatically added to my ClickUp and enriched by another agent."*** |
| 00:31 | **STAGE 03 card comes into view.** Badge `ARCHIVES`. Title **`Curate`**. Body: *"Skims the new newsletters and promotes only the ones carrying a real insight."* Routing line: **`Business/Newsletters → To Look Over`**. Two chips: **`Read new newsletters`** · **`Move the real-insight ones`**. |
| 00:33 | **SPOKEN (33.37–37.37): *"So right now it's running the COO. I have other agents to enrich my leads."*** — the `RUN BY COO` pill seen at 01:09 is this sentence, drawn. |
| 00:37 | **SPOKEN (37.37–47.37): *"Then it identifies if the contents of the business newsletter are relevant to me, and if they are, it adds the important information to my agent network brain right here."*** |
| 00:45 | The pan reveals, to the right of the stage cards, **a large wireframe globe** built of nodes and edges with coloured vertices. The wire running into it is labelled **`READS + WRITES BRAIN`**. |
| 00:47 | **SPOKEN (47.37–53.37): *"And this is what all the agents use to see what others have done — is to constantly improve and learn over time."*** |
| 00:50 | **The globe's own label, read directly: `AGENT BRAIN` with a sub-line `RJ Brain · shared memory`** (the sub-line is at the pixel floor and the middle word is **UNREADABLE**; `shared memory` is legible). **This is a shared-memory node that every stage reads from and writes to — drawn as a first-class object, the same size as the whole pipeline.** |
| 00:53 | **SPOKEN (53.37–61.37): *"Next, for all the emails that are classified as spam — which is my favorite feature — it actually goes in and unsubscribes for me."*** |
| 00:57 | **STAGE 04 card, read in full.** Badge `PUBLISHES`. Title **`Unsubscribe`**. Body: *"Emails unsubscribe requests to repeat offenders. **Never clicks a web link.**"* Technical line: **`iCloud SMTP smtp.mail.me.com:587`**. Two chips: **`University spam + Spam/Auto`** · **`Never web one-click links`**. **And attached to it by a dotted leader, a separate lilac card labelled `CONSTRAINT` reading `mailto List-Unsubscribe only`.** |
| 00:61 | **SPOKEN (61.37–65.37): *"And this feature alone is probably the biggest time saver of this entire system."*** |
| 00:65 | **SPOKEN (65.37–74.37): *"And then lastly, it sends a message to my phone with any important business or personal emails that I actually need to review personally."*** |
| 00:69 | **STAGE 05 card, read in full.** Badge `TEXTS YOU`. Title **`Report`**. Body: *"Texts what's left: unfiled mail, open leads, and anything urgent."* Technical line: **`pending_inbox_report.py → iMessage`**. Icon: a phone and a speech bubble with a dotted wire between them. Three chips: **`Every INBOX UID accounted for`** · **`All Business/Leads items daily`** · **`Flag urgent + leads >3 days`**. |
| 00:74 | **SPOKEN (74.37–82.37): *"And honestly, this saves me like 15 hours per week, and every single day this whole system just runs completely on autopilot."*** |
| 00:82 | **SPOKEN (82.37–91.37): *"And if you want to set this up for yourself, just comment 'system' and I can send you the file and the scripts that I use. Again, it's completely free and it works with any AI you prefer to use."*** |
| 00:91 | **SPOKEN (91.37–97.04): *"Or if you want my team to set this up for you, just check out my profile and you'll see all the information for that."*** |
| 00:94 | Final pan back across the globe and Stage 04. The footer hard rule is legible one last time: **`Fully autonomous. Hard rule: never deletes, only moves.`** Reel ends. |

---

## 3. Capabilities — what this source demonstrably shows

| ID | Capability, as evidenced on screen | Where |
|---|---|---|
| **11-C1** | **A five-stage pipeline where every stage names its own file.** `bulk_sweep.py` · `sort_batch.py + sort_state.json` · `pending_inbox_report.py`. **Not "an AI does it" — a path you could open.** | 00:11–00:69 |
| **11-C2** | **Every stage carries a badge saying what it is allowed to DO:** `SORTS` · `ROUTES` · `ARCHIVES` · `PUBLISHES` · `TEXTS YOU`. The verb is the permission. | throughout |
| **11-C3** | **A hard rule stated once, at the bottom, for the whole system: *"never deletes, only moves."*** Restated as a chip on Stage 01 (`Never delete, move only`). | footer + 00:11 |
| **11-C4** | **A CONSTRAINT drawn as its own object, wired to the stage it binds:** `mailto List-Unsubscribe only`, attached to `Unsubscribe`, with the stage body repeating *"Never clicks a web link."* **A safety boundary given the same visual weight as a feature.** | 00:57 |
| **11-C5** | **A shared memory every agent reads and writes**, drawn as a globe the size of the pipeline itself, wire labelled `READS + WRITES BRAIN`, and described aloud as *"what all the agents use to see what others have done… to constantly improve and learn over time."* | 00:45–00:50 |
| **11-C6** | **A carve-out for the human's private domain:** `Personal mail stays in INBOX`, hanging off the classifier as its own chip. | 00:24 |
| **11-C7** | **Termination conditions written on the card:** `Loops until to-do hits 0` · `Every INBOX UID accounted for`. **The system says how it knows it is finished.** | 00:24, 00:69 |
| **11-C8** | **Who runs it, on the canvas:** a `RUN BY COO` pill — the pipeline is owned by a named role, not by "the system". | 01:09 |
| **11-C9** | **A daily push to the human by text, including on quiet days**, with urgency and staleness flags (`Flag urgent + leads >3 days`, *"sent even on quiet days"*). | 00:69, footer |

**Claims recorded as claims.** The **"15 hours per week"** is spoken and appears in the caption; it
is **not measured anywhere on screen** and there is no before/after, no counter, no log. Nothing in
97 seconds shows the system running: **no inbox, no folder tree, no sent unsubscribe, no received
text message.** The reel shows an *architecture diagram of* the system, which is not the same thing.
The offer at the end (*"comment 'system' and I can send you the file"*, and *"if you want my team to
set this up for you"*) makes this a lead-generation reel, and that is stated plainly rather than
held against it.

---

## 4. What DXB has today — measured 2026-08-08, this session

| Their capability | Ours | Verdict |
|---|---|---|
| 11-C1 every stage names its file | `packages/orchestrator/src` — `dispatch.ts`, `decompose.ts`, `escalate.ts`, `critical-gate.ts`, `worker-loop.ts`, `morning-briefing.ts`, `qa.ts` … | **PRESENT in code — never shown to the CEO** |
| 11-C2 a verb badge per stage | `intents`, `routing_rules`, `hook_policies` | **PRESENT as data; not as a legible permission label** |
| 11-C3 one hard rule for the whole system | The approval gate and the Islamic boundary — both constitutional, both far stronger than *"never deletes"* | **PRESENT and stronger** |
| 11-C4 a constraint drawn as its own object | `hook_policies` + `hook_violations` are live and fail-closed | **PRESENT in code, INVISIBLE on every surface** |
| 11-C5 shared brain all agents read/write | **`memory_index`, `memory_embeddings`, `packages/memory-router`** — and the CEO's own v2 memory ruling of 2026-08-01 (ONE brain the holding owns) | **PRESENT and deeper** |
| 11-C6 personal domain carve-out | The approval gate stops outward mail at the CEO | **PRESENT, differently** |
| 11-C7 termination conditions on the card | `workflow_runs`, `workflow_steps`, `task_events` | **PARTIAL — a stated "how I know I'm done" is not a rule anywhere** |
| 11-C8 who runs it, named | 199 employees each with a department and a director | **PRESENT** |
| 11-C9 daily push even on quiet days | W2.6 — Hamza opens at 07:00 himself, `ceo_briefings` table | **PRESENT — and ours speaks; his texts** |
| **email out** | `outbox` + outbox allowlist; **e-mail is inside the approval gate by constitution** | **DELIBERATELY DIFFERENT — his system sends unsubscribe mail unattended; ours may not send anything outward unattended** |

Measured this session:
```
ls packages/orchestrator/src         → chat-drain, council, critical-gate, decompose, dispatch, escalate,
                                        intent-intake, morning-briefing, qa, select-model, work-generation,
                                        worker-loop, worker-shim, hook-binding, context-budget, ops-live-collector …
ls packages/memory-router            → present
psql … public tables                 → memory_index, memory_embeddings, outbox, hook_policies, hook_violations,
                                        ceo_briefings, workflow_runs, workflow_steps  (60 tables total)
```

---

## 5. The build project

### 5.1 The finding, said plainly

**His system is smaller than one of our departments. His DRAWING is better than anything we have.**

Look at what that one diagram does in a single screen: five stages, each with a verb badge saying
what it may do, each naming the file it runs, each listing how it knows it is finished — plus **one
hard rule for the whole machine**, **one constraint drawn as an object and wired to the exact stage
it binds**, and **one shared brain the size of the pipeline** that everything reads and writes.

**We have every one of those things and the CEO can see none of them.** Our hard rules are stronger
than his (his is *"never deletes"*; ours is *"nothing goes outward without you"*). Our brain is
deeper than his. Our pipeline is thirty times larger. **And it is all invisible.**

### 5.2 The three projects

**P1 — DRAW THE CONSTRAINT AS AN OBJECT.** This is the single best idea in the source and it is
ours to take exactly: `mailto List-Unsubscribe only`, in its own card, wired by a dotted leader to
the one stage it binds. Our equivalents already exist and are enforced fail-closed in
`packages/hook/src/pre-task.ts` — **money out stops at the CEO**, **e-mail stops at the CEO**,
**the Islamic boundary is absolute**. Today they live in a Markdown file and a hook. They should be
**drawn on the surface, attached to the step they bind**, so the CEO sees his own boundaries holding
rather than being told they hold. *Design work — his gate.*

**P2 — EVERY STAGE SAYS HOW IT KNOWS IT IS FINISHED.** `Loops until to-do hits 0`. `Every INBOX UID
accounted for`. Ours has none of this, and it is exactly the discipline the CEO's own complaint was
about — *"bişeyler oldu deniyor bitti deniyor ama olmamış işte."* A stage that cannot state its own
completion condition in one line has not been designed. This is a rule for the orchestrator, not a
picture. *Buildable now; no design gate.*

**P3 — THE VERB BADGE.** `SORTS` · `ROUTES` · `ARCHIVES` · `PUBLISHES` · `TEXTS YOU`. One word per
step, and the word IS the permission. Our `intents` and `routing_rules` carry the same information
in a form no one can read at a glance. *Rests on P1's surface.*

### 5.3 What is explicitly NOT recommended

- **Do not build an inbox cleaner.** E-mail is inside the CEO's approval gate by constitution. A
  system that sends unsubscribe mail unattended is exactly what our boundary forbids, and the fact
  that his is careful about it (`mailto` only, never a web link) does not change ours.
- **Do not quote the "15 hours per week".** It is spoken, unmeasured, and RULE #0-A forbids
  repeating it as a fact. It is recorded above as a claim and stays one.
- **Do not take his `RJ Brain`.** The CEO ruled on the memory architecture on 2026-08-01: ONE brain
  the holding owns, fed by the work itself. That ruling stands and this reel does not reopen it.

---

## 6. Verdict

**A lead-generation reel for a small personal automation — and the clearest diagram of a working
system on the queue so far.**

Nothing in it is technically ahead of us. Everything in it is *legible* ahead of us. Five cards, five
verbs, one hard rule at the bottom, one constraint drawn as an object, one brain. A person who has
never written a line of code understands his entire system in ninety seconds.

**The CEO owns a system thirty times larger and cannot do that.** That is not an engineering gap; it
is a drawing gap, and it is the third source tonight to say the same thing from a different angle:
source 07 said *show the traffic*, source 10 said *let them introduce themselves*, and source 11 says
**draw the boundary next to the step it binds.**

**Row 11 is `reported`. P2 is buildable now and needs only his word; P1 and P3 are design work behind
his gate. Nothing is built.**
