# SOURCE 12 — Rinaldo Janjua (`rinaldojanjua.ai`) B: the same inbox system, presented differently

> The CEO supplied four videos from this account (rows 11–14). This is the second. **It is the
> same system as source 11**, told in half the time — and that fact is itself worth recording,
> because it changes what this row is for.
>
> Row 11 carries the implementation. Row 12 carries the **presentation grammar**: the identical
> pipeline drawn as one clean board with a title, and a second presenter delivering it. Read for
> that, not for new capability.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbF2AUQh0MQ/ |
| Uploader | `rinaldojanjua.ai` |
| Kind | Instagram reel, vertical, spoken English, split-screen (board on top, presenter below), one-word burned-in captions |
| File | `media/12-DbF2AUQh0MQ.mp4` (4,571,825 bytes) |
| **sha256** | `56c13033556bec93ea2064e9e250f54af1ad1fdf0d17a5c1469b1be292f2b4be` |
| Duration | 52.1 s |
| Material studied | **52 frames** at 1 fps — swept as 5 contact sheets |
| Transcript | `transcripts/12.json`, language `en` |
| **Presenter** | **A different person from source 11.** Row 11 was filmed by an older man with a pen in what looks like a bar; row 12 is a young man at a microphone in a home studio. Same account, same board, different face — recorded as measured, not interpreted. |

---

## 2. Frame-by-frame record

| Time | On screen | Said | Frame |
|---|---|---|---|
| 0:00 | Split screen. Top: a dark board on a violet backing, titled **`Inbox Cleanup`** with a subtitle line and a badge top-right. Bottom: the presenter at a mic. | *"Here is the **free AI system** that makes it so that I never have to check my email inbox again."* | t001–t006 |
| 0:06 | The board's left half is legible: three cards in a row — **`Sweep`** → **`Classify`** → **`Curate`** — joined by thin arrows, then a long curve running into a **large dotted sphere** that occupies the centre of the canvas | *"So at the beginning of the day, my AI agent **sweeps through all of my emails**, sorts them **based on sender**, and then routes them to their own specific folders."* | t006–t015 |
| 0:15 | the same three cards; the caption band under the board reads *"One Message thing unfiled mail, open leads with days pending, and urgency flags — sent even on quiet days."* | *"**Each email gets its own folder. Each category of emails has its own folder that the agents decide.**"* | t015–t021 |
| 0:21 | board unchanged | *"So I have my **ClickUp**, I have my **receipts**, I have my **to-do lists**, I have my **inbound leads** — and this **loops until it hits zero**."* | t021–t029 |
| 0:29 | the `Curate` card | *"Then for all the newsletters that I get — **some of which I've intentionally subscribed to** — the agent can examine the content."* | t029–t036 |
| 0:36 | The board scrolls right: the curve emerges from the sphere into **`Unsubscribe`** (magenta accent) and then **`Report`** (green accent) | *"Then for every email that is classified as spam, it **automatically unsubscribes using this tool right here**."* | t036–t043 |
| 0:43 | the `Report` card, green, with a phone/message glyph | *"Then it sends me a **report directly to my phone** so I can review what's actually important."* | t043–t048 |
| 0:48 | board held | *"Now if you want to see how to build this out for yourself, just **comment 'system'** down below."* | t048–t052 |

### 2.1 The presentation grammar, which is what this row adds

| Element | What it is |
|---|---|
| **A titled board per pipeline** | `Inbox Cleanup` — the pipeline has a name, like a product |
| **Left-to-right stages as cards** | `Sweep → Classify → Curate → … → Unsubscribe → Report` |
| **Colour = kind of action** | neutral for reading, magenta for the one that *sends*, green for the one that *reports to the human* |
| **The shared brain at the centre** | a large dotted sphere that every pipeline routes through — the same node source 11 called the "agent network brain" |
| **A footer that states the invariant** | "sent even on quiet days"; source 11's footer adds "never deletes, only moves" |
| **A badge naming the owner** | top-right, `RUN BY · COO` in source 11 |
| **The same grammar reused across pipelines** | source 13's board is `Top 5 Priorities` with `Read → Query → Rank → (sphere) → Text → Log` — identical language, different pipeline |

---

## 3. Capabilities

| ID | Capability | Note |
|---|---|---|
| **CAP-12-A** | **A pipeline is a named, drawable product** | `Inbox Cleanup` as a title, not "the email script" |
| **CAP-12-B** | **Colour encodes the class of action** | reads / sends / reports-to-human are visually distinct at a glance |
| **CAP-12-C** | **One shared brain drawn at the centre of every pipeline** | the same sphere appears in rows 11, 12 and 13 |
| **CAP-12-D** | **Deliberate subscriptions are protected** | "some of which I've intentionally subscribed to" — the agent examines rather than culls |
| **CAP-12-E** | **One visual grammar reused across every pipeline** | rows 11, 12, 13 are visibly the same system of cards |
| — | Everything else in this row duplicates **CAP-11-A … CAP-11-M** and is not restated. | |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-12-A** named, drawable pipelines | **NO** | DXB runs far more pipelines than he does — the scheduler, the briefing, the outbox, the discovery engine — and **none of them has a name or a picture the CEO can look at.** Measured: 15 command routes exist; none renders a pipeline. |
| **CAP-12-B** colour by class of action | **NO** | Nothing on a CEO surface distinguishes "this only reads" from "this sends something outward" — which is exactly the distinction our approvals gate is built around. The gate exists in code and is invisible on screen. |
| **CAP-12-C** shared brain drawn once | **PARTIAL** | `std.knowledge_shelf` is live and the repo is an Obsidian vault with `.planning/graphs/`; the CEO has never seen either. |
| **CAP-12-D** protected subscriptions | **N/A** | No mailbox (see row 11). |
| **CAP-12-E** one visual grammar | **PARTIAL** | A design bank and `DESIGN_SYSTEM.md` exist with a registered directive; they govern components, not **process diagrams**, because there are none. |

---

## 5. The build project

Only one project belongs to this row; the rest is row 11's.

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P12-1** | **A visual grammar for pipelines, defined once** (CAP-12-A, -B, -C, -E) | Extend the design system with one pattern for drawing any DXB pipeline: a named board · left-to-right stage cards · **colour by class of action, where "sends something outward" is unmistakable** · the shared knowledge shelf drawn once at the centre · a footer carrying the invariant · a badge naming the owning agent. Then P11-3 renders real pipelines into it instead of inventing a look. | `DESIGN_SYSTEM.md` (registered directive section) + `CEO_COMMAND_CENTER_SPEC` | The pattern is in the design system, and two different real pipelines render in it identically, in both locales, passing the RULE #0 battery. |

---

## 6. Verdict

**`eşit` on capability (it is row 11 again) — `geride` on presentation, and the gap is not
cosmetic.**

- **No new capability.** Same system, same five stages, shorter. Recorded honestly rather than
  padded: the CEO gave four links from this account and deserves to know that two of them are
  the same product.
- **One real finding, and it is about us.** He draws one pipeline and gives it a name, a colour
  language, an owner badge and a stated invariant. **DXB runs more pipelines than he does and
  draws none of them.** The CEO's complaint that the system feels dead is, in part, exactly
  this: a company whose processes are invisible cannot be trusted or corrected, only complained
  about.
- **The colour rule is the part worth taking seriously.** He colours the stage that *sends*
  differently from the stages that *read*. DXB's entire governance rests on that same
  distinction — outward actions stop at the CEO — and it is enforced in `packages/outbox-executor`
  while being **completely invisible on screen**. Making it visible costs a colour and a legend.
- **One thing worth telling the CEO plainly:** the presenter in this video is not the presenter
  in row 11. Same account, same board, two different faces. This account is running the same
  content through multiple creators — which is, precisely, the clipping business that source 05
  describes. Two of his sixteen sources turn out to be the same operation seen from opposite
  ends.
