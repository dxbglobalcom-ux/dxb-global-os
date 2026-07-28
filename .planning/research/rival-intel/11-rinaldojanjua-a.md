# SOURCE 11 — Rinaldo Janjua (`rinaldojanjua.ai`) A: the inbox agent, drawn stage by stage

> The CEO supplied four videos from this creator (rows 11–14). This is the first, and it is the
> most useful single *implementation* document in the sixteen: a five-stage email pipeline drawn
> as a board, with the **script, the artefact, the constraint and the hard rule written on each
> card**.
>
> It is also the direct answer to source 01's most impressive claim — *"I resolved 13 of your 16
> customer emails automatically"* — which until now we had only heard asserted.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbA3JgbphEs/ |
| Uploader | `rinaldojanjua.ai` — Rinaldo Janjua |
| Kind | Instagram reel, vertical, spoken English over a screen recording |
| File | `media/11-DbA3JgbphEs.mp4` (17,829,131 bytes) |
| **sha256** | `c76361d6bee7dad583cfe422bf97e7ecd4ce72a9edd683ce6241dfdb47bec014` |
| Duration | 97.0 s |
| Material studied | **98 frames** — 97 at 1 fps + 1 scene cut — swept as 9 contact sheets |
| Transcript | `transcripts/11.json`, language `en` |
| Surface | A laptop on a table in what looks like a bar/restaurant; the screen holds a dark-blue diagram canvas. He points at cards with a pen. |

---

## 2. Frame-by-frame record

| Time | On screen | Said | Frame |
|---|---|---|---|
| 0:00 | The board, headline visible: *"…**~22 folders, curates newsletters, auto-unsubscribes from spam, then texts the items**"*, and above it *"…EVERY DAY"* | *"So this is the **free AI system** that sweeps through my entire iCloud email, filters out spam, unsubscribes for me, and then **texts me the important stuff** for me to review."* | t001–t009 |
| 0:09 | Cards left of frame (Stage 01, partly out of shot) | *"It starts out here with a **Python script** that flags the past senders **based on their behaviour** and decides whether or not it's important for me to view."* | t009–t016 |
| 0:16 | **`STAGE 02 — Classify`** card, chip **`ROUTES`**. Body: *"Reads each message and picks one of 22 folders, looping until nothing is left unfiled."* Code chip: **`sort_batch.py → sort_state.json`**. Bullets: *"Classify every new message"* · *"22 folders (ClickUp, Receipts…)"* · *"Loops until to-do tidy 0"*. Pink chip at the card's foot: **"Personal mail stays in INBOX"** | *"Then once it's decided, it **routes each email to its relevant folder**… a folder for receipts, a folder for ClickUp team notifications, a folder for new AI strategies to implement, and **it loops until the inbox is clean**."* | t016–t028 |
| 0:28 | he traces the arrow onward | *"Then all the **inbound email leads are automatically added to my ClickUp and enriched by another agent**."* | t028–t033 |
| 0:33 | a badge in the top-right corner of the canvas reads **`RUN BY · COO`** with a close ✕ | *"So right now it's running **the COO** — I have other agents to enrich my leads."* | t033–t037 |
| 0:37 | **`STAGE 03 — Curate`** card, chip **`ARCHIVES`**. Body: *"Skims the new newsletters and promotes only the ones carrying a real insight."* Path chip: **`Business/Newsletters → To Look Over`**. Bullets: *"Read new newsletters"* · *"Move the real-insight ones"* | *"Then it identifies if the contents of the business newsletter are **relevant to me**, and if they are, it adds the important information to my **agent network brain** right here."* | t037–t047 |
| 0:47 | he points at a node off to the side | **"And this is what all the agents use to see what others have done — to constantly improve and learn over time."** | t047–t053 |
| 0:53 | **`STAGE 04 — Unsubscribe`** card, chip **`PUBLISHES`**. Body: *"Emails unsubscribe requests to repeat offenders. **Never clicks a web link.**"* Code chip: **`iCloud SMTP smtp.mail.me.com:587`**. A constraint chip floats above the card: **`CONSTRAINT · mailto List-Unsubscribe only`**. Bullets: *"University spam + Spam/Auto"* · *"Never web one-click links"* | *"Next, for all the emails classified as spam — **which is my favourite feature** — it actually goes in and **unsubscribes for me**. This feature alone is probably the biggest time saver of the entire system."* | t053–t065 |
| 1:05 | **`STAGE 05 — Report`** card, chip **`TEXTS YOU`**. Body: *"Texts what's left: unfiled mail, open leads, and anything urgent."* Code chip: **`pending_inbox_report.py → iMessage`**. Bullets: *"Every INBOX UID accounted for"* · *"All Business/Leads items daily"* · *"Flag urgent + leads > 3 days"* | *"And lastly it sends a message to my phone with any important business or personal emails that **I actually need to review personally**."* | t065–t074 |
| 1:14 | the whole board; the canvas footer reads **"▲ FULLY AUTONOMOUS — Fully autonomous. Hard rule: never deletes, only moves."** and the header strip adds *"…unfiled mail, open leads with days pending, and urgency flags — **sent even on quiet days**."* | *"And honestly, this **saves me like 15 hours per week**, and every single day this whole system just runs completely on autopilot."* | t074–t082 |
| 1:22 | closing | *"If you want to set this up for yourself, just comment **'system'** and I can send you the file and the scripts. It's completely free and **it works with any AI you prefer to use**. Or if you want my team to set this up for you, check my profile."* | t082–t097 |

### 2.1 The pipeline, as the board draws it

| Stage | Chip | What it does | Named artefact | Constraint on the card |
|---|---|---|---|---|
| 01 | — | flags senders **by behaviour**, decides importance | a Python script | — |
| **02 Classify** | `ROUTES` | one of **22 folders**, loops until nothing is unfiled | `sort_batch.py → sort_state.json` | **personal mail stays in INBOX** |
| **03 Curate** | `ARCHIVES` | promotes only newsletters carrying a real insight | `Business/Newsletters → To Look Over` | — |
| **04 Unsubscribe** | `PUBLISHES` | emails unsubscribe requests to repeat offenders | `iCloud SMTP smtp.mail.me.com:587` | **`mailto List-Unsubscribe` only — never clicks a web link** |
| **05 Report** | `TEXTS YOU` | texts what is left | `pending_inbox_report.py → iMessage` | every INBOX UID accounted for; urgent + leads > 3 days flagged; **sent even on quiet days** |
| whole board | `RUN BY · COO` | — | — | **hard rule: never deletes, only moves** |

---

## 3. Capabilities

| ID | Capability | What the source demonstrates |
|---|---|---|
| **CAP-11-A** | **Autonomous inbox triage to a folder taxonomy** | 22 folders, looping until nothing is unfiled |
| **CAP-11-B** | **Classification by sender behaviour, not keywords** | "flags the past senders based on their behaviour" |
| **CAP-11-C** | **Newsletters filtered for insight, not archived wholesale** | Curate promotes "only the ones carrying a real insight" |
| **CAP-11-D** | **Outward action with a hard safety constraint** | unsubscribes **only** via `mailto:` `List-Unsubscribe`, **never a web link** — a deliberate refusal to click anything |
| **CAP-11-E** | **A stated invariant for the whole system** | "**never deletes, only moves**" |
| **CAP-11-F** | **Leads leave e-mail and enter the work system automatically** | inbound leads → ClickUp → enriched by another agent |
| **CAP-11-G** | **A shared "agent network brain"** | "what all the agents use to see what others have done — to constantly improve and learn over time" |
| **CAP-11-H** | **A daily digest that fires even when nothing happened** | "sent even on quiet days" |
| **CAP-11-I** | **Completeness assertion as a design goal** | "**Every INBOX UID accounted for**" — nothing may silently vanish |
| **CAP-11-J** | **Ageing surfaced as urgency** | "flag urgent + leads > 3 days" |
| **CAP-11-K** | **The owning agent is badged on the pipeline** | `RUN BY · COO` |
| **CAP-11-L** | **Every stage names its script and its output** | `sort_batch.py → sort_state.json`, `pending_inbox_report.py → iMessage` |
| **CAP-11-M** | **Model-agnostic** | "works with any AI you prefer to use" |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-11-A/B/C** inbox triage | **NO** | Measured: no mailbox is connected. `grep -rln "inbox\|email_thread\|customer_email" apps/dashboard/src packages` returns only the internal approvals/outbox machinery (`packages/outbox-executor`, `apps/dashboard/src/lib/approvals.ts`, `(command)/approvals`) — that is the *outward-action gate*, not an inbox. Source 01 claimed 13 of 16 emails resolved; **this is what that would actually take**, and we have none of it. |
| **CAP-11-D** outward action with a hard constraint | **HAVE — and it is the same instinct, already law** | Our outbox runs an **allowlist, not a denylist** (recorded 2026-07-26), and every outward action stops at the approvals gate. His "never clicks a web link, `mailto` only" is exactly our shape: constrain the *mechanism*, not the intent. |
| **CAP-11-E** stated invariant | **PARTIAL** | We have invariants (allowlist, `dxb_test` isolation, no plaintext credentials) but they live in specs and governance docs — **none of them is printed on the surface the CEO looks at.** He cannot see what the system refuses to do. |
| **CAP-11-F** leads into the work system | **PARTIAL** | `tasks` + `task_events` + the org seam with a mandatory `Idempotency-Key` exist. There is no inbound channel feeding them from outside. |
| **CAP-11-G** shared agent brain | **HAVE — and stronger** | `std.knowledge_shelf` is live (R4.2: 168 grants, 423 reviews, 438 quality rows), the repo root is an Obsidian vault with `.planning/graphs/`, and graph-first reading binds every author and subagent. His "agent network brain" is a node on a diagram; ours is a governed table plus a knowledge graph. |
| **CAP-11-H** fires even on quiet days | **HAVE** | U37's briefing runs at 07:00 on a schedule regardless of activity, with honest zero-states. |
| **CAP-11-I** completeness assertion | **PARTIAL — and worth borrowing the phrasing** | Our gates assert completeness in tests (e.g. the C42 ledger gate proves no `reported` row lacks a report). Nothing on a CEO surface says "everything is accounted for". |
| **CAP-11-J** ageing as urgency | **HAVE** | Decision-ageing shipped 2026-07-24 (14g); `v_objective_progress` carries `days_left`. |
| **CAP-11-K** owning agent badged | **NO** | Nothing on a CEO surface says which agent owns a running pipeline. |
| **CAP-11-L** stage names its script and output | **NO — and this is the presentation lesson of the whole source** | DXB has far more machinery than he does and shows the CEO none of its shape. He has five scripts and draws all five. |
| **CAP-11-M** model-agnostic | **HAVE** | LiteLLM in front of every provider; the model catalogue and tier floors are CEO-changeable from the dashboard. |

---

## 5. The build project

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P11-1** | **The inbox seam** (CAP-11-A, -B, -C, -F) | Read-only mailbox ingest into DXB tables, then triage: classify by sender behaviour into a CEO-owned folder/label taxonomy, promote what carries a real signal, and turn qualifying messages into `tasks` through the existing idempotent org seam. **Read and classify first; no outward reply until the CEO opens that gate.** Composes with P03-1/P16-5 as one connector programme. **CEO decision needed:** which mailbox, if any, may be connected. | `CAPABILITY_ARSENAL_DOCTRINE` (registered adaptation) + `INTEGRATION-TRACKER` rows | A real message is classified, its class is visible to the CEO, and a qualifying one becomes a task with its `Idempotency-Key`. |
| **P11-2** | **Unsubscribe with his constraint, our gate** (CAP-11-D) | If and only if the CEO wants it: unsubscribe via `mailto` `List-Unsubscribe` **only**, never a web link — plus our own addition, which he does not have: **it passes the approvals gate the first time and then runs under a standing approval the CEO can revoke.** | `CAPABILITY_ARSENAL_DOCTRINE` + approvals spec | One unsubscribe is sent through the gate, the constraint is enforced in code, and the audit row names the standing approval. |
| **P11-3** | **The company draws itself** (CAP-11-K, -L, -E) — *the presentation lesson* | Every running pipeline gets a CEO-facing card: the stage, the owning agent, the artefact it produces, and **the rule it will not break**. Built from what already exists (`tasks`, `agent_runs`, the outbox allowlist), not from new data. This is how "never deletes, only moves" becomes something the CEO can *see* rather than trust. | `CEO_COMMAND_CENTER_SPEC` | A real pipeline renders its stages, its owner and its constraint, in both locales, with no invented values. |
| **P11-4** | **"Everything is accounted for"** (CAP-11-I) | Where a surface claims to be complete, it says so and proves it — every inbox item, every task, every approval reconciled, with the count. An honest "3 unaccounted" is worth more than a silent list. | `CEO_COMMAND_CENTER_SPEC` | A surface shows a reconciliation count that a `select count(*)` confirms. |

---

## 6. Verdict

**`daha iyisi` on the engine — `geride` on the drawing — and one habit worth stealing outright.**

- **Behind on the capability itself.** He triages an entire mailbox into 22 folders, unsubscribes
  from repeat offenders, promotes only newsletters with real insight, pushes leads into his work
  system, and texts himself what is left — every day, unattended, saving a claimed 15 hours a
  week. DXB has **no mailbox at all**. Source 01's "I resolved 13 of your 16 emails" is not
  magic; it is this, and this is buildable.
- **Ahead on safety, and it is not close.** His constraint is a note on a card. Ours is an
  allowlist in `packages/outbox-executor` and an approvals gate that stops every outward action
  at the CEO. The right build is **his pipeline inside our gate** — which is strictly safer than
  what he shipped.
- **Ahead on memory.** His "agent network brain" is one node. Ours is `std.knowledge_shelf` plus
  an Obsidian graph with a reading rule binding every author.
- **The habit to steal, and it costs nothing:** *he writes the constraint on the card.*
  `mailto List-Unsubscribe only` · `never clicks a web link` · `personal mail stays in INBOX` ·
  **`never deletes, only moves`**. DXB has more and stronger invariants than he does and shows
  the CEO **none** of them. A system whose refusals are visible is a system you can trust; a
  system whose refusals are invisible feels like a system that might do anything. That, more
  than any missing feature, is why the CEO does not feel safe with his own company yet.
