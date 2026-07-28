# SOURCE 13 — Rinaldo Janjua (`rinaldojanjua.ai`) C: "Top 5 Priorities" — the ranking agent

> ## ⛔ SCOPE CORRECTION — CEO ruling 2026-07-28, binding on this report
>
> **What was measured here is the RECORDING. What was NOT measured is the SYSTEM.**
> A frame-by-frame reading proves what a 15–100 second video showed. It proves nothing about what
> that system does when the camera is off, what it earns, how long it has run, or whether its
> owner is satisfied with it. **I have never used any of these systems.**
>
> The CEO knows several of these systems and their owners personally. His words, 2026-07-28:
> *"BEN O SİSTEMLERİ VİDEODAN DEĞİL, HEPSİNİ TANIYORUM — ARKADAŞLARIM — VE MİLYONLARCA DOLAR
> KAZANIYOR VE HEPSİ GERÇEK, HEPSİ CANLI."*
>
> **His testimony outranks this reading.** Every verdict below is therefore scoped to the
> recording, never to the company behind it, and where his account and this reading disagree,
> **his is the evidence and this is the guess.** Sentences that judged a system rather than a
> video were a RULE #0-A violation by the session author and have been corrected in place, with
> the correction recorded rather than quietly overwritten.


> The third of the CEO's four videos from this account, and **the most directly useful of them**.
> Where source 01 said *"my recommendation today…"* and left the reasoning invisible, this one
> draws the ranking function on screen and states it out loud.
>
> This is the missing half of DXB's morning briefing: we compute *what happened*; this computes
> *what to do next, and why*.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbHOTOqhBXE/ |
| Uploader | `rinaldojanjua.ai` |
| Kind | Instagram reel, vertical, split-screen (board above, presenter below), one-word captions |
| File | `media/13-DbHOTOqhBXE.mp4` (5,079,319 bytes) |
| **sha256** | `6b1fac4a2e9203dcf0e7b2a10394d4c5f247836cc1aad683be33e19a21562f56` |
| Duration | 52.3 s |
| Material studied | **52 frames** at 1 fps — swept as 5 contact sheets |
| Transcript | `transcripts/13.json`, language `en` |
| Board title | **`Top 5 Priorities`** — the same visual grammar as row 12's `Inbox Cleanup` |

---

## 2. Frame-by-frame record

| Time | On screen | Said | Frame |
|---|---|---|---|
| 0:00 | Split screen; board titled **`Top 5 Priorities`** with a badge top-right. Stage cards left to right: **`Read`** → **`Query`** → **`Rank`** → a **large dotted sphere** (the shared brain) → **`Text`** → **`Log`** | **"If you're a business owner with ADHD, this is how you get AI to keep you on task."** | t001–t005 |
| 0:05 | the **`Read`** card, with a document glyph | *"Every single morning, my AI **reads from the agent network brain** to understand what projects are currently happening and **their statuses**."* | t005–t013 |
| 0:13 | the **`Query`** card, with a magnifier glyph | *"Then it pulls everything from my **ClickUp team workspace** to understand **what's overdue, what's due today**, and then **what priorities they're all at**."* | t013–t021 |
| 0:21 | the **`Rank`** card, with a bar-chart glyph | **"Next, it ranks everything by what will actually make the biggest impact on my revenue, and urgency — and then what unblocks other tasks to do in the future."** | t021–t030 |
| 0:30 | the arrow curving back through the sphere | *"Once that's done, it **reads from this agent brain again** to understand the **full context**."* | t030–t035 |
| 0:35 | the `Rank` card, and the presenter holding up five fingers | *"…and once it's all ranked, it finds the **top five tasks** that I need to do today to actually move my business forward."* | t035–t042 |
| 0:42 | the **`Text`** card (green, phone/message glyph) | **"Lastly, it sends a text directly to my phone of the top five things to do today — and why."** | t042–t047 |
| 0:47 | the **`Log`** card (last in the chain, dark) | **"And then it logs everything back to the brain so the next session can work from there."** | t047–t052 |
| — | The board's footer band, legible across the video: *"…AI that brings you to a 15-header morning actions with easy exact statistics…"* (partly below the recording's resolution — recorded as **UNREADABLE** rather than guessed) | — | — |

### 2.1 The pipeline, and the one thing that makes it work

```
Read ──→ Query ──→ Rank ──→ ( shared brain ) ──→ Text ──→ Log
 │         │         │              │              │       │
 project   ClickUp:  revenue     full context    top 5    written
 statuses  overdue / impact ·    re-read          + WHY    back for
 from the  due today ·  urgency ·                          the next
 brain     priority    unblocks                            session
```

**The ranking function, stated in his own words and in this order:**

1. **biggest impact on revenue**
2. **urgency**
3. **what unblocks other future tasks**

And two structural details that matter more than the ranking itself:

- **The brain is read twice** — once for project statuses at the start, once again after ranking
  "to understand the full context". Retrieval is not a single lookup at the front of the run.
- **The run ends by writing back** — *"logs everything back to the brain so the next session can
  work from there."* The pipeline's last stage is memory, not delivery. That is what makes the
  next morning's run cheaper and better than this one.

---

## 3. Capabilities

| ID | Capability | What the source demonstrates |
|---|---|---|
| **CAP-13-A** | **A stated, ordered ranking function** | revenue impact → urgency → unblocking. Not "the AI decides". |
| **CAP-13-B** | **A hard output shape: exactly five** | "the top five tasks I need to do today" |
| **CAP-13-C** | **"…and why"** | the reason travels with the recommendation |
| **CAP-13-D** | **Read the shared memory, twice** | once for statuses, once after ranking for full context |
| **CAP-13-E** | **Write back at the end of every run** | "so the next session can work from there" |
| **CAP-13-F** | **The work system is the source of truth for state** | ClickUp: overdue, due today, priority |
| **CAP-13-G** | **Delivered where the human already is** | a text to his phone |
| **CAP-13-H** | **Framed around a human limitation, not a technology** | "if you're a business owner with ADHD" — the product promise is attention, not automation |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-13-A** stated ranking function | **NO — the sharpest gap in the briefing** | `public.v_morning_briefing` is a `(sort, block, payload jsonb)` view over `task_events` and `tasks`, computing the overnight window in `Europe/Berlin`. It reports **what happened**. Nothing in it ranks anything by revenue impact, urgency or unblocking. |
| **CAP-13-B** a hard output shape | **PARTIAL** | The briefing has blocks; it has no "here are the N things" contract. |
| **CAP-13-C** the reason travels with it | **PARTIAL** | `decision_log` and `evidence_refs` exist for decisions; the briefing itself does not carry a "why" per item. |
| **CAP-13-D/E** read and write the shared memory | **HAVE the store, MISSING the loop** | `std.knowledge_shelf` is live (R4.2: 168 grants, 423 reviews, 438 quality rows) and the repo is an Obsidian vault with `.planning/graphs/` under a graph-first reading rule. **What is not established is that a run ends by writing back what it learned** — his last stage. |
| **CAP-13-F** work system as truth | **HAVE — and it is ours, not a third party's** | `tasks` + `task_events` are inside our own Postgres; `v_objective_progress` computes `days_left` and `run_rate_eur_per_day`; decision-ageing shipped 2026-07-24. He rents ClickUp; we own the table. |
| **CAP-13-G** delivered where he already is | **PARTIAL** | Dashboard and voice line. No push to a channel the CEO already lives in (same gap as source 16, CAP-16-P). |
| **CAP-13-H** framed around the human | **N/A — but worth noticing** | His pitch is "keep me on task". The CEO's own charter word is **anti-baby-sitting**: state intent once, the company executes. Same human problem, opposite direction — he wants to be told what to do; the CEO wants not to have to tell. |

---

## 5. The build project

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P13-1** | **The briefing ranks, and says why** (CAP-13-A, -B, -C) | Add a ranking block to `v_ceo_briefing`: the small number of things that most need the CEO today, each with the reason attached. The ranking function is **written down and CEO-owned**, not hidden in a prompt. Starting order, adapted to our ledger and open for his correction: (1) **blocks money** — anything gating an active `objectives` row; (2) **only he can do it** — items in the approvals queue, because no agent may act there; (3) **unblocks the most other work** — count of dependent tasks; (4) **ageing** — `days_left`, overdue first. | `CEO_COMMAND_CENTER_SPEC` + the U37 briefing adaptation | The briefing names its top items with a reason each, and the reason is derived from a query the CEO can be shown. |
| **P13-2** | **Every run ends by writing back** (CAP-13-D, -E) | A run's last step records what it learned to `std.knowledge_shelf` — the decision, the outcome, and what it would do differently — so the next run starts from it. Cheap, and it is the difference between a system that repeats itself daily and one that compounds. | `ORCHESTRATOR` spec | Two consecutive runs of the same pipeline are shown to differ because of what the first one wrote. |
| **P13-3** | **Anti-baby-sitting, stated as the inverse** (CAP-13-H) | His product tells the human what to do; ours exists so the CEO does **not** have to be told. That means the ranked list must be short and must be **only the things no agent may decide** — approvals, money, contracts, identity. Anything else on that list is a failure of autonomy, not a feature. Write this into the briefing contract so the list cannot quietly grow into a to-do list for the CEO. | `CEO_COMMAND_CENTER_SPEC` | The briefing's ranked block contains only CEO-only items, and a test asserts that anything an agent could have decided never appears there. |

---

## 6. Verdict

**`geride` on the ranking — `daha iyisi` on where the truth lives — and one inversion that is
ours alone.**

- **Behind, precisely.** Source 01 said *"my recommendation today"* and showed nothing. This
  source shows the whole thing: read state → query the work system → **rank by revenue impact,
  urgency, unblocking** → re-read context → **top five with the reason** → **log back**. DXB's
  briefing computes what happened last night and stops there. The ranking half does not exist.
- **Ahead on the foundation.** He ranks tasks out of a rented ClickUp workspace. We rank out of
  our own `tasks`, `objectives` and `v_objective_progress`, which already carry gap, days left,
  run rate and an `net_unverified` flag. A ranking built on our tables can cite the row it came
  from; his cannot.
- **The structural lesson, and it costs almost nothing:** his pipeline's **last stage is memory**.
  Ours ends at delivery. A company that never writes down what it learned will produce the same
  briefing forever.
- **And the inversion worth stating for the CEO.** He built this to be told what to do. The
  charter here says the opposite — *anti-baby-sitting*: intent once, then autonomous execution.
  So we take his machinery and invert its purpose: the ranked list must contain **only what no
  agent is allowed to decide** — money, contracts, identity, approvals. If it ever grows into a
  general to-do list for Muhittin Bey, the system has failed, not improved.
