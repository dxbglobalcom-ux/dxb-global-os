# 25 — "a map is not a move" · the source that attacks the screen we are drawing

> **LISTENED, NOT WATCHED — on his live order, 2026-08-17:** *"25 i de sadece ses ile dinle anla
> ve sadece bu videoyu kısaca raporla."* The audio was taken whole (42.145625 s, 8 speech blocks,
> no gap over 0.6 s). **The picture was not opened** — no frame was cut, no screen was read, no
> motion was timed. Every visual statement about this source is therefore **absent**, and where a
> law of this ledger asks for the screen, the section below writes `UNVERIFIED` and names what
> would be needed. This report is short on the same order.

## 1. Source identity

| | |
|---|---|
| Address | https://www.instagram.com/reel/DZY7s0LK2vj/?igsh=YmhzMmNxdGd3ZHVt |
| Operator | Not named on the source |

## 2. The audio record — every block in order, nothing summarised `T`

| Time | Words (verbatim from `transcripts/25.json`) |
|---|---|
| 00:00 | "I love Iron Man just as much as anyone, but if I see one more Jarvis dashboard, I'm a crash out." |
| 00:06 | "Everybody's flexing, glowing graphs, and look, agents talking to each other. Okay, cool." |
| 00:11 | "But a map of how your documents connect is still just a map. It doesn't tell you where to go." |
| 00:17 | "When some data point or news comes out, you want your agents to come to you and say," |
| 00:22 | "we can take XYZ action, and these would be the follow-on effects." |
| 00:26 | "Then the visualization comes in for you to be able to steer, not just watch and be mesmerized by all the pretty colors." |
| 00:33 | "Connecting everything and making it pretty is where everyone on Instagram has been stopping." |
| 00:37 | "But synthesizing all the data down to the next move is chess, not checkers." |

**Rhythm, measured from the same file:** 8 blocks across 42.15 s, the longest gap **0.60 s**, the
argument closing at **41.84 s**. The shape is thesis (00:00–00:17), prescription (00:17–00:33),
and the line that names the standard (00:33–00:42).

## 3. Capabilities — the mechanism this source describes

This source hands over a **standard for the surface**, and it is aimed at exactly what our design
brief draws:

> A board that glows, agents visibly talking to each other, and a graph of how everything connects
> is **where everyone stops**. What is wanted instead: when a data point or a piece of news
> arrives, **the agent comes to you** and says *"we can take XYZ action, and these would be the
> follow-on effects."* The visualization comes **after** that, so the owner can **steer** — and
> "synthesizing all the data down to the next move is chess, not checkers."

**On output:** the recording **does not show what it produces** — no revenue, no customer, no
latency, no volume, no tool named, no account named. `U` It is 42 seconds of argument. What would
be needed to say more: the uploader's account and its posted work, which sits behind the picture
that was not opened on his order.

### Aliveness — how this source is built to live, and what DXB takes

The living mechanism named here is **the arrival**: an external event (a data point, a piece of
news) reaches the system, and the system moves toward the human with a proposal rather than
waiting to be asked. Its clock is the world's, not the owner's clicking. That is the pulse this
source is arguing for, stated in its own words at 00:17–00:26, and it is the same wire his
complaint C26 asks for from the other end.

Its own delivery is the only rhythm this file can measure: **8 blocks in 42.145625 s, longest gap
0.60 s, argument closing at 41.84 s.**

`UNVERIFIED — the screen was not opened, on his live order of 2026-08-17 ("25 i de sadece ses ile
dinle"), so what moves on it, in which direction, how long a movement takes and how often it
repeats were never measured.` What would be needed: a dense pass over
`media/25-DZY7s0LK2vj.mp4` at 5–10 fps with `scripts/rival-intel/motion.py`, which is on disk and
ready the moment he re-opens this row.

**What DXB takes from it:** V2's first law is his — *IT MUST BE ALIVE*, motion IS state. This source
adds the missing half: alive is not enough, the living surface must **arrive with the next move and
its consequences**, and the picture exists so the owner can steer, not admire. The four projects in
§5 are that, made buildable.

## 4. What DXB has today — measured 2026-08-17 `R`

| Question this source forces | Measurement | What it means |
|---|---|---|
| Does any CEO surface propose a next move? | `grep -rniE 'recommend(ed\|ation)?\|next[_ ]?move\|proposed[_ ]?action' apps/dashboard/src` → **4 hits, all one field** (`recommended_action`), living in the approvals lane: `approvals/[id]/page.tsx:214`, `lib/approvals-center.ts:20`, `command/approval-center.tsx:84` | A proposal reaches him **only when he is already being asked to approve something**. Nothing proposes unprompted. |
| Does anything predict follow-on effects? | `grep -rniE 'follow[_ -]?on\|predicted[_ ]?(effect\|impact)\|consequence' apps/dashboard/src packages/*/src` → **1 hit in the whole search, and it is a code comment**: `packages/orchestrator/src/morning-briefing.ts:13` | The "and these would be the follow-on effects" half of his sentence has no implementation anywhere in our code. |
| How many of the 186 dashboard source files carry either? | **5 files (2.7 %)** | The criticism lands on V1 exactly as stated. |
| **Is that one field ever filled with real data?** | **Measured over TCP with SELECT only, once `psql` was installed on this machine, 2026-08-17:** `SELECT count(*), count(recommended_action) FROM public.approvals` → **51 rows, 0 filled, 0 non-blank** | Worse than the code search suggested. The single field in the whole company that could carry "the next move" **has never been used, in any of the 51 approvals the company has ever raised.** |

The last row is the one this source is judged against. He asks for an agent that comes to the owner
with an action and its consequences; our schema has one column for the first half of that sentence,
no column for the second half, and the one column is empty on every row.

## 5. The build project

> **MECHANISM — the figures a builder needs, carried here so §5 can be read alone.**
> - **The living mechanism named here is THE ARRIVAL:** an external event — a data point, a piece of
>   news — reaches the system, and **the system moves toward the human with a proposal** rather than
>   waiting to be asked. Its clock is the world's, not the owner's clicking (stated at 00:17–00:26).
> - **The order of the two halves is the design rule:** the agent arrives with *"we can take XYZ
>   action, and these would be the follow-on effects"* **first**, and the picture comes **after**, so
>   the owner **steers** instead of watching. *"Synthesizing all the data down to the next move is
>   chess, not checkers."*
> - **The only rhythm this file can measure is the source's own delivery: 8 blocks in 42.145625 s,
>   longest gap 0.60 s, the argument closing at 41.84 s.**
> - **`UNVERIFIED` — the screen was never opened**, on his live order of 2026-08-17 (*"25 i de sadece
>   ses ile dinle"*), so no motion, colour or geometry figure exists for this source. What would
>   settle it: a 5–10 fps dense pass over `media/25-DZY7s0LK2vj.mp4` with
>   `scripts/rival-intel/motion.py`, which is on disk and ready the moment he re-opens the row.

Nothing starts before his design approval; these are the parts, costed. `<!-- OPEN: B22 -->`

| Part | What it requires | Cost / install |
|---|---|---|
| **P25-1** | **Every live surface carries a proposed next move**, not only a state: what to do, and the follow-on effects if it is done. A card with no move on it is an unfinished card. | none |
| **P25-2** | **The trigger is an event, not a click:** a data point or a piece of news arrives → the agent comes to the CEO with the proposal. Same wire as complaint C26. | none |
| **P25-3** | **The visualization is a steering wheel:** every visual element he sees is something he can act on or redirect from where it stands. Watching is a by-product, not the purpose. | none |
| **P25-4** | **A connection graph is never a deliverable on its own.** If V2 draws the company as a graph, each node answers "what is the next move here" or it does not ship. | none |

### What must NOT be copied, and why

The source argues against the graph itself, and that goes further than we should. A holding of 21
departments genuinely needs a picture of how it connects — his own directive asks for it. What we
take is the requirement that the picture **carry a move**; what we leave is the conclusion that the
picture is worthless.

## 6. Verdict

The only source in the queue that attacks the thing we are drawing, by name, and it does not
contradict V2's first law — it completes it. Alive is the premise; **arriving with the next move
and its consequences is the standard**, and it is a standard we can be measured against without
installing anything: does the surface hand the owner his next move, or a beautiful map?

Tonight's answer is a number: **51 approvals, 0 recommendations.**

The report follows his listen-only order, so it carries no reading of this source's screen, and no
design work follows from it: the design package still waits on him. <!-- OPEN: B22 -->

<!-- FINGERPRINT -->
---

**What was read**

| | |
|---|---|
| sha256 | `d25c578a56078fa73d796bb116cd6ef03cd55380d6a1050523f7b7d6646a0759` |
