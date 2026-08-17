# 26 — "one specific job, attached to the bottleneck" · the source that counts our roster back at us

> **LISTENED, NOT WATCHED — on his live order, 2026-08-17:** *"26 da sadece dinlemen yeterli."*
> The audio was taken whole (45.860813 s, 18 speech blocks, **no gap anywhere** — the speaker never
> pauses). **The picture was not opened** — no frame was cut, no screen was read, no motion was
> timed. Every visual statement about this source is therefore **absent**, and where a law of this
> ledger asks for the screen, the section below writes `UNVERIFIED` and names what would be needed.
> If the design work ever needs this source's screen, the row is re-opened and watched.

## 1. Source identity

| Field | Value |
|---|---|
| Address | `https://www.instagram.com/reel/Day97uOu0SA/?igsh=MTNoMHZjZ2RvazR5cA==` |
| Uploader | Not named in the audio, and the picture was not opened — `U` |
| File | `.planning/research/rival-intel/media/26-Day97uOu0SA.mp4` — 8,864,517 bytes |
| **sha256 of the file on disk** | `c3147592dfac2232a3679de9412f87d1036956e902177627e47b4b530a6275d9` |
| **sha256 of the audio actually studied** | `170ae7968752bba614c5e46c1e99134e4bb03dfcd5a30c17c205de0ad8b08284` |
| Repository state when written | commit `6cef95b4` |
| Resolution | 1080 × 1920 (vertical) — recorded from the container, **not viewed** |
| Codec | VP9 video, 30 fps · AAC audio — **audio present** |
| Duration | **45.860998 s** (video container) · **45.860813 s** (extracted audio) |
| Audio studied | `media/26.wav` — pcm_s16le · 16 kHz · mono · 1,467,624 bytes |
| Obtained | `scripts/rival-intel/fetch.sh` (yt-dlp), 2026-08-01T23:50:50Z |
| Transcript | `transcripts/26.json` — English, **18 segments, 768 characters**, highest `no_speech_prob` **0.086** |
| Frames | **None cut.** The picture was not opened, on his order of 2026-08-17 |

## 2. The audio record — every block in order, nothing summarised `T`

| Time | Words (verbatim from `transcripts/26.json`) |
|---|---|
| 00:00 | "If I see one more 40-person AI org chart," |
| 00:03 | "I'm gonna move to Idaho and become a potato farmer." |
| 00:05 | "And you've seen it too, those army of agents" |
| 00:07 | "that supposedly run their business." |
| 00:09 | "But when you need a researcher, a writer," |
| 00:12 | "a manager, and a reviewer," |
| 00:14 | "all to do a 'read this, grab that' task," |
| 00:16 | "you don't get a company, you get hallucination city." |
| 00:19 | "The agents actually working in production" |
| 00:21 | "all have one specific job, and they do it really well." |
| 00:24 | "If it feels simple, then it's probably a great idea." |
| 00:27 | "You attach the agent to the bottleneck" |
| 00:30 | "that allows you to scale without hiring." |
| 00:32 | "Because it's usually one small part" |
| 00:34 | "that a person needs to do over and over again." |
| 00:36 | "And you need to hire 20 of them" |
| 00:38 | "to match your demand for your scaling plan." |
| 00:39 | "So wouldn't you just attach an agent there?" |

**Rhythm, measured from the same file:** 18 blocks across 45.86 s, every gap **0.00 s** — the
longest silence in the whole recording is under one frame of speech. The last block closes at
**42.64 s**, leaving **3.22 s** of tail. This is one continuous argument delivered without a breath,
and its shape matters: the thesis (00:00–00:19), the rule (00:19–00:27), the prescription
(00:27–00:42).

## 3. Capabilities — the mechanism this source describes

This source hands over a **selection rule**, and it is the sharpest one the queue has produced:

> An agent that works in production has **one specific job** and does it really well. You attach it
> to **the bottleneck that lets you scale without hiring** — the one small part a person repeats
> over and over, the part where the honest alternative is hiring twenty people.

Its counter-example is stated as directly: when a researcher, a writer, a manager **and** a reviewer
are all needed to move one "read this, grab that" item, the result is not a company. And it gives
the test for having got it right — *"if it feels simple, then it's probably a great idea."*

**On output:** the recording **does not show what it produces** — no revenue, no customer, no
latency, no volume, no tool named, no account named. `U` It is 45.86 seconds of argument, and the
argument is what it delivers. What would be needed to say more: the uploader's account and its
posted work, which sits behind the picture that was not opened on his order.

### Aliveness — how this source is built to live, and what DXB takes

The living mechanism this source describes is **the attachment point**, not a screen. Its whole
argument is about where an agent is wired: to a repeated human step that has a queue behind it, so
the agent runs whenever that step recurs rather than whenever a human remembers to start it. A
roster is a list; an attachment is a pulse. That is the mechanism, stated in the source's own
words at 00:27–00:32.

Its own delivery is the only rhythm this file can measure: **18 blocks in 45.860813 s, gaps of
0.00 s throughout, argument closing at 42.64 s** — one continuous run with no rest built into it.

`UNVERIFIED — the screen was not opened, on his live order of 2026-08-17 ("26 da sadece dinlemen
yeterli"), so what moves on it, in which direction, how long a movement takes and how often it
repeats were never measured.` What would be needed: a dense pass over
`media/26-Day97uOu0SA.mp4` at 5–10 fps with `scripts/rival-intel/motion.py`, which is on disk and
ready the moment he re-opens this row.

**What DXB takes from it:** one job per agent, written down and enforced; the bottleneck named
before the seat exists; and headcount reported as agents that produced work, never as rows in a
table. The four projects in §5 are that, made buildable.

## 4. What DXB has today — measured 2026-08-17 `R`

Every figure below was read from the company database over TCP with SELECT only, this session.

| Question this source forces | Measurement | What it means |
|---|---|---|
| How many agents do we carry? | `SELECT count(*) FROM agents` → **205** | The org chart he opens with is a 40-seat one. |
| Are they running? | `status` is **`dormant` on all 205** (199 `active` employment, 6 `archived`) | Not one is awake. |
| Does each have one specific job? | `skills` is a JSON array on all 205 rows; its length is **0 on every single row** — average 0.00, maximum 0, minimum 0 | The rule this source states is failed on a column: no agent carries a declared job at all. |
| How specific is the structure underneath the titles? | **2** distinct `role` values (`worker` 184 · `head` 21), **21** departments, **199** distinct titles, **2** brains (`claude-sonnet-5` 183 · `fable-5` 22) | 199 titles resolve to 2 actual roles. |
| How much work has this company produced in its life? | `SELECT count(*) FROM tasks` → **217** — 213 `done`, 3 `returned`, 1 `failed` | 205 agents, 217 tasks ever. |
| How is that work spread? | 199 of 205 agents have at least one task; **6 have never had one**; the busiest agent in company history is `global-expansion-lead` with **4** | Roughly one task each, once. |
| When did it last produce? | last task `2026-07-28 09:03:43`, last task event `2026-07-28 09:04:56`, **0 task events in 24 h** (1,543 events in total) | Twenty days silent. |
| Does the machine that feeds them turn? | **15** schedules exist, including `orchestration.work_generate` at `*/15 * * * *`; pg-boss has completed **303,117** jobs, the last at `2026-08-17 14:41:18` | The engine runs and the roster does not. |

The last row is the one that changes what this source means for us. **A job runner that has
completed three hundred thousand jobs is attached to a roster that has produced two hundred and
seventeen tasks in its whole life.** Our missing piece is not more seats and it is not a dead
queue — it is the attachment between them, which is exactly the thing this source is about.

## 5. The build project

Nothing starts before his design approval; these are the parts, costed. `<!-- OPEN: B22 -->`

| Part | What it requires | Cost / install |
|---|---|---|
| **P26-1** | **One job per agent, written down.** Every live agent carries a single named job it does end to end, and `skills` stops being empty. An agent with no declared job does not run. | none |
| **P26-2** | **Bottleneck first, seat second.** Before an agent exists, the repeated human step it removes is named — what the CEO or an operator does over and over. No bottleneck, no agent. | none |
| **P26-3** | **No relay chains for one item.** A single work item is not passed researcher → writer → manager → reviewer. One owner carries it end to end; review is a gate, not a seat. | none |
| **P26-4** | **A dormant roster is not a workforce.** Headcount reaches the CEO as *agents that produced work in the last 24 h*. A number that counts seats is not shown to him. | none |

### What must NOT be copied, and why

The source's rule is stated for a small operation and would, taken literally, argue against having
a roster at all. This holding is a **holding** — 21 departments exist because the business does.
What we take is the attachment discipline, not the headcount ceiling: 205 seats are legitimate the
day each one is attached to a recurring step, and only a burden while they are not.

## 6. Verdict

The most direct hit the queue has landed on us, and it lands on the workforce rather than the
screen. Read beside source 25 the two make one sentence: **a surface that proposes the next move
is worth nothing if the thing behind it is an org chart of dormant seats.** The measurement that
decides it is already in §4 — 217 tasks, one day, twenty days ago, and an empty `skills` column on
all 205 rows.

The report follows his listen-only order, so it carries no reading of this source's screen, and no
design work follows from it: the design package still waits on him. <!-- OPEN: B22 -->
