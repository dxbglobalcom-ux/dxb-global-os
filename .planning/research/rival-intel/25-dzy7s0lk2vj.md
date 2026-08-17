# Source 25 — `instagram.com/reel/DZY7s0LK2vj` — "a map is not a move"

> **LISTENED, NOT WATCHED — on his live order, 2026-08-17:** *"25 i de sadece ses ile dinle anla
> ve sadece bu videoyu kısaca raporla."* The audio was taken whole (42.15 s, 8 speech blocks, no
> gap over 0.6 s). **The picture was not looked at** — no frame, no screen reading, no motion
> measurement. Every visual claim about this source is therefore **absent, not negative**: if the
> design work ever needs its screen, this row must be re-opened and watched. This report is short
> on the same order.
>
> Evidence base: `media/25.wav` (pcm_s16le · 16 kHz · mono · 42.145625 s) and its own transcription
> `transcripts/25.json` (whisper, language `en`, 719 characters, max `no_speech_prob` 0.30).

## 1. Why it matters to this holding

This is the only source in the queue so far that **attacks the thing we are building** — by name.
Our design brief is an Iron Man / J.A.R.V.I.S cockpit, and V2's first law is *IT MUST BE ALIVE*
(motion IS state). This rival's whole 42 seconds says: a glowing JARVIS board, agents visibly
talking to each other, and a graph of how everything connects are **the point where everyone
stops**, and stopping there produces a map that *"doesn't tell you where to go."*

It does not contradict our first law — it adds the missing half to it. Alive is not enough; the
living surface has to **arrive with the next move and its consequences**, and the picture exists so
the CEO can **steer**, not admire. Read against complaint C26 (the surface must follow the human)
this is the same demand from the other end: our screens must not only move, they must propose.

## 2. What was heard, in order (timestamps from the audio's own record)

| Time | Words (verbatim from `transcripts/25.json`) |
|---|---|
| 0.00–6.44 | "I love Iron Man just as much as anyone, but if I see one more Jarvis dashboard, I'm a crash out." |
| 6.60–11.68 | "Everybody's flexing, glowing graphs, and look, agents talking to each other. Okay, cool." |
| 11.84–17.32 | "But a map of how your documents connect is still just a map. It doesn't tell you where to go." |
| 17.32–22.32 | "When some data point or news comes out, you want your agents to come to you and say," |
| 22.32–26.16 | "we can take XYZ action, and these would be the follow-on effects." |
| 26.24–33.16 | "Then the visualization comes in for you to be able to steer, not just watch and be mesmerized by all the pretty colors." |
| 33.44–37.64 | "Connecting everything and making it pretty is where everyone on Instagram has been stopping." |
| 37.64–41.84 | "But synthesizing all the data down to the next move is chess, not checkers." |

## 3. What this source PRODUCES

**A thesis, not a product** — and that is itself the finding. Nothing in the audio demonstrates a
running system: no latency, no cost, no volume, no name of a tool. `UNVERIFIED — the uploader is
not named in the audio; the picture was not looked at on his order.` Its value to us is a
**standard to be beaten**, and it is a standard we can be measured against without installing
anything: *does the surface hand the owner the next move, with its follow-on effects, or does it
hand him a beautiful map?*

## 4. Parts for the build (candidates — nothing starts before his design approval)

| Part | What it requires | Cost / install |
|---|---|---|
| **P25-1** | Every live surface carries a **proposed next move**, not only a state: what to do, and the follow-on effects if it is done. A card with no move on it is an unfinished card. | none |
| **P25-2** | The trigger is an event, not a click: a data point or a piece of news arrives → the agent **comes to the CEO** with the proposal. This is the same wire complaint C26 asks for. | none |
| **P25-3** | The visualization is a **steering wheel**: every visual element the CEO sees is something he can act on or redirect from where it stands — watching is a by-product, not the purpose. | none |
| **P25-4** | A connection graph is **never** a deliverable on its own. If V2 draws the company as a graph, each node must answer "what is the next move here" or it does not ship. | none |

## 5. The gap on our side, measured this session

| Question | Measurement | Verdict |
|---|---|---|
| Does any CEO surface propose a next move? | `grep -rniE 'recommend(ed|ation)?\|next[_ ]?move\|proposed[_ ]?action' apps/dashboard/src` → **4 hits, all one field** (`recommended_action`) living in the approvals lane (`approvals/[id]/page.tsx:214`, `lib/approvals-center.ts:20`, `command/approval-center.tsx:84`) | A proposal reaches him **only when he is already being asked to approve something**. Nothing proposes unprompted. |
| Does anything predict follow-on effects? | `grep -rniE 'follow[_ -]?on\|predicted[_ ]?(effect\|impact)\|consequence' apps/dashboard/src packages/*/src` → **1 hit in the whole search, and it is a code comment** (`packages/orchestrator/src/morning-briefing.ts:13`) | The "and these would be the follow-on effects" half of his sentence **does not exist in our code at all**. |
| How many of the 186 dashboard source files carry either? | 5 files (2.7 %) | The rival's criticism lands on V1 exactly as stated. |

`UNVERIFIED — could not measure` whether `recommended_action` is ever filled with real data in the
company database: `psql` is not installed on this machine and the Docker socket refuses this user
(`permission denied while trying to connect to the docker API`). V1 is dead by his ruling, so this
was not pursued further.

## 6. What this report does not do

No verdict is written on the source's screen, its motion, its speaker or its tooling — the picture
was not looked at, on his order. No design work follows from it: the design package still waits on him. <!-- OPEN: B22 -->
