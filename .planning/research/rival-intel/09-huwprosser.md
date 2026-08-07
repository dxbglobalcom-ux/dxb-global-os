# 09 — Huw Prosser — fifteen years of building JARVIS, and what his idle screen does

> Written 2026-08-08 from nothing, after watching the video start to end with its sound
> (ledger law 4). No sentence of the report the CEO binned on 2026-08-01 was opened or re-used.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DYK2IWyoEWh/ |
| Uploader | Huw Prosser (`huwprosser`) — ledger row 09 |
| Kind | reel — two archive clips, then a locked-off shot of a desk |
| Media on disk | `media/09-DYK2IWyoEWh.mp4` |
| **sha256** | `26a91b04f9e9e4ea5292fd9f03000c24ba60741afce8786ca1bbdc2e31115979` |
| Resolution / audio | **1080 × 1920**, audio kept — passes the CEO's 720p floor |
| Duration | **15.12 s** — the shortest source on the queue |
| Spoken word | `transcripts/09.json` — en, 3 segments |
| Frames | `frames/09/` — 15 native frames at 1 fps + 6 scene cuts + 2 native zooms in `frames/09/zoom/` |
| The CEO's note | listed without a note (item 9 of his list) |

### How the temporal analysis was performed — stated exactly

Fifteen seconds, fifteen frames: **every single frame was read, in order, with the audio beside it.**
Two native zooms were cut from the video file (ledger law 5):

```
ffmpeg -ss 11 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=1080:60:0:975" -q:v 1 → zoom/statusbar-11.0.jpg
ffmpeg -ss  9 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=700:60:380:900"  -q:v 1 → zoom/dock-9.0.jpg
```

**One transcript correction, made from what is on the screen.** `transcripts/09.json` renders the
name as **"Travis"** in *"Okay, Travis, are you there?"*. The screen says **`JARVIS`** in three
separate frames. The speech-to-text mis-heard it; the report uses the on-screen spelling and this
line records why.

---

## 2. Second-by-second record of what was watched — 00:00 to 00:15

| t | What was on screen, and what was said |
|---|---|
| 00:00 | **CAPTION (fixed for the whole reel): `15 years of obsession`** — set in a serif face, white on black, above a small pillarboxed archive clip. |
| 00:01–00:02 | **Archive clip, stamped `2011`.** A teenager in an orange T-shirt in a bedroom, gesturing at a CRT-era flat monitor. On that monitor: a **dark node graph** — a ringed circle labelled `JARVIS` with thin wires out to small labelled boxes, and under the ring the word **`OFFLINE`**. A red letterform sits top-left of the clip. |
| 00:03 | **Archive clip, stamped `2012`.** Same person, a year older, plaid shirt, glasses. Behind him a monitor showing **a blue IDE with code and a file tree** — this is the year he was writing it, not demonstrating it. **SPOKEN (03.06–05.06): *"Okay, JARVIS, are you there?"*** |
| 00:05 | **Cut to today.** No caption change. A **curved Samsung ultrawide** on a black cutting-mat desk, lit by a bar light. On the mat: a mechanical keyboard, a **Raspberry Pi**, a second single-board computer with a heatsink, a small LCD panel, a green breakout board, solder reels, a VR controller. **This is a workbench, not a studio.** On the screen: a **blue particle sphere** captioned **`JARVIS`**, and beneath it a clock reading **`23:59`** with a date line under it — the letters resolve as a weekday, a number and a month; the exact date stays **UNREADABLE**. **SPOKEN (05.06–08.82): *"At your service."*** |
| 00:06 | The screen darkens as the camera settles — the sphere fades out entirely and the screen is left as an almost-empty dark field with a faint grid. Bottom centre: a **dock of six small glyphs**. Bottom right: four bracketed chips. Bottom left: two more. |
| 00:07 | **Idle state, full frame.** A **thin engineering grid** covers the whole screen with tick marks along the top edge and a small notch drawn at the top centre. Nothing else. **This is what his machine looks like when it has nothing to say.** |
| 00:08 | The **JARVIS orb re-forms at the centre** — a ring, a broken outer arc, tick marks and drifting particles, glowing blue, with the wordmark inside it. It is the same visual language as 2011, fifteen years better executed. |
| 00:09 | **NATIVE ZOOM `zoom/dock-9.0.jpg`** on the bottom strip. The four right-hand chips read: **`[reasoning:off]`  `[voice:on]`  `[new chat]`  `[sleep]`**. Two more chips sit bottom-left; they resolve as a connection word and a short hexadecimal session id, and are recorded **UNREADABLE** rather than guessed. **The four legible ones are the whole control surface: a thinking-depth toggle, a microphone toggle, a conversation reset, and a way to put the machine to sleep.** |
| 00:09 | **SPOKEN (08.82–10.82): *"Fantastic. Can you open up a map of London for me?"*** |
| 00:10–00:11 | The orb sits centred, pulsing, while the request is processed. Nothing else appears — **no thinking spinner, no text stream, no tool log.** |
| 00:12–00:13 | **The answer arrives as the whole screen.** A dark navy **map of southern England** fills the display edge to edge: the coastline, the motorway network as fine blue capillaries, `ENGLAND` set in wide letterspacing, and place labels — `Birmingham`, `Peterborough`, `Norwich`, `Cambridge`, `Bedford`, `Luton`, `Milton Keynes`, `Northampton`, `Oxford`, `Reading`, `Watford`, `Harlow`, `Chelmsford`, `Colchester`, `Ipswich`, `Southend-on-Sea`, `Rochester`, `Maidstone`, `Canterbury`, `Ramsgate`, `Brighton`, `Eastbourne`, `Hastings`, `Portsmouth`, `Southampton`, `Salisbury`, `Swindon`, `Bristol`, `Bournemouth`, `Dunkirk`, `Calais`, `Boulogne-sur-Mer` — with **`London` set larger, at the centre of the capillary web**, and green National Park labels (`South Downs National Park`, `Chilterns National Landscape`, `New Forest National Park`). |
| 00:12 | **And the orb does not disappear — it moves.** It re-renders small in the **bottom-right corner** of the map, still ringed, still glowing, still labelled. The four chips stay in their place under it. **The assistant docks; the answer takes the room.** |
| 00:14–00:15 | Same frame, held. The reel ends with the map up and the orb docked. |

---

## 3. Capabilities — what this source demonstrably shows

| ID | Capability, as evidenced on screen | Where |
|---|---|---|
| **09-C1** | **An always-present ambient assistant with an idle state that is genuinely empty** — a grid, a dock, four chips, nothing else. No cards, no widgets, no "here are some things you could ask me". | 00:06–00:07 |
| **09-C2** | **A voice conversation opened by the human and answered in words, not text.** *"Are you there?"* → *"At your service."* | 00:03–00:08 |
| **09-C3** | **The answer renders as the entire screen, and the assistant demotes itself to a corner.** A spoken request produced a full-bleed cartographic surface; the orb re-anchored bottom-right rather than staying centre. | 00:12 |
| **09-C4** | **A four-control surface, and only four:** `[reasoning:off]` `[voice:on]` `[new chat]` `[sleep]`. Thinking depth is a **user-visible toggle**, not a hidden setting. | 00:09 zoom |
| **09-C5** | **An idle clock as the resting content** — `23:59` under the orb before the screen clears. The machine's default state is a clock, not a dashboard. | 00:05 |
| **09-C6** | **Fifteen years of the same visual idea:** the 2011 clip's ringed `JARVIS` node marked `OFFLINE` and today's ringed `JARVIS` orb are recognisably the same design, executed at two different levels of skill. | 00:01 vs 00:08 |
| **09-C7** | **It runs on a workbench.** Raspberry Pi, a heatsinked SBC, a small LCD, breakout boards and solder on the mat under the monitor — the reel places this on personal hardware, not in a cloud console. | 00:05 onward |

**Claims recorded as claims.** Fifteen seconds show one request and one rendered map. **Nothing
shows what produced the map, whether the voice reply was generated live, or whether anything beyond
this one interaction works.** The `OFFLINE` label in the 2011 clip is on screen and quoted as such.
The reel is a mood piece and does not pretend otherwise; the evidence is bounded accordingly.

---

## 4. What DXB has today — measured 2026-08-08, this session

| Their capability | Ours | Verdict |
|---|---|---|
| 09-C1 ambient idle state | `apps/dashboard/src/app/(command)/` has **17 routes**, all of them dense surfaces; there is **no idle/ambient state** anywhere | **GAP — and it is a design gap, which is his gate** |
| 09-C2 voice conversation, human opens it | **`dxb-jarvis.service` is `active (running)` on this machine right now** — "DXB JARVIS always-on wake daemon (Selamaleykum ya Hamza)". `voice_calls`, `voice_identities`, `voice_daemon_state` in the database | **PRESENT — and ours wakes on his voice, which this reel does not show** |
| 09-C3 answer fills the screen, assistant docks | Our chat and voice surfaces keep the assistant central; a spoken request does not repaint the screen with the answer | **GAP — the single strongest design idea in this source** |
| 09-C4 four visible controls incl. a reasoning toggle | Mute state and half-duplex control exist (U15); a CEO-visible **thinking-depth** toggle does not | **PARTIAL** |
| 09-C5 clock as the resting content | Our resting content is a dashboard | **DIFFERENT — deliberately, and worth re-examining under his minimalism ruling** |
| 09-C6 one visual idea held for fifteen years | The gold Hamza figure with the speaking mouth-line is fixed by the CEO and is that idea for us | **PRESENT** |
| 09-C7 personal hardware | This laptop, `dxb-scheduler` + `dxb-jarvis` + `dxb-freeze-guard` all running | **PRESENT** |

Measured this session:
```
systemctl --user list-units 'dxb*'  → dxb-jarvis.service  loaded active running
                                       DXB JARVIS always-on wake daemon (Selamaleykum ya Hamza)
ls "apps/dashboard/src/app/(command)" → 17 routes, none of them an idle/ambient state
```

---

## 5. The build project

### 5.1 What is actually here, said plainly

**Fifteen seconds, one idea, and the idea is the right one.** Everything on this queue so far has
shown a *dashboard*. This shows what a personal assistant looks like **when it is not being asked
anything** — an empty grid, a clock, an orb, four words. Then it shows what happens when it is
asked: **the answer becomes the screen, and the assistant gets out of the way.**

That is the exact opposite of what our command surface does today, and it is the exact thing the CEO
has been describing since Phase 8: *Iron Man / JARVIS cockpit*, and his own minimalism ruling —
**empty space is not filled, and nothing is truncated with "…"**.

### 5.2 The two projects

**P1 — THE IDLE STATE. Ours has none, and this is what the CEO's design brief has been asking for.**
Today every one of our 17 command routes is a dense surface. What Hamza's screen does when the CEO
has not asked anything is **undefined**. This source answers it: a grid, the gold figure, the time,
and a control strip of no more than four words. Nothing else. **This is design work, and it stops
at his gate** — the visual design package is approved before anything is drawn (his directive §8,
and his ruling of 2026-08-01 that every surface is redesigned *"tek tek her biri benimle"*).

**P2 — THE ANSWER TAKES THE SCREEN, HAMZA DOCKS.** When the CEO asks something with an answer that
has a shape — a map, a chart, a table, a company org — the answer should **repaint the surface** and
Hamza should re-render small in a corner, still live, still listening. Not a card inside a panel.
Not a chat bubble with an image in it. **The screen becomes the answer.** *Also his gate.*

### 5.3 What is explicitly NOT recommended

- **Do not copy the ringed-orb form.** The centre of Hamza's screen is fixed by the CEO: the gold
  figure with the speaking mouth-line. That is settled and this reel does not reopen it.
- **Do not add a clock as our resting content.** His resting content is his company. The *lesson* is
  emptiness, not the clock.
- **Do not claim this system works from this reel.** Fifteen seconds, one map.

---

## 6. Verdict

**The smallest source on the queue and one of the most useful — because it is the only one that
shows an assistant doing nothing.**

Its whole contribution is two design decisions: **an idle state that is genuinely empty**, and
**an answer that takes the entire screen while the assistant demotes itself to a corner**. Both land
precisely on the Phase 8 brief the CEO has already written, both are ours to build, and both are
behind his design gate, where they will stay until he has seen a drawing.

What it does not contribute: any evidence about capability. Fifteen seconds, one request, one map,
and a `2011` clip whose own screen says `OFFLINE`. That is stated as the boundary of the evidence.

**Row 09 is `reported`. P1 and P2 are design proposals only — nothing is drawn and nothing is built.**
