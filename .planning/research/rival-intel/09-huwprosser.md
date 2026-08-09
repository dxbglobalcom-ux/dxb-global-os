# Source 09 — Huw Prosser (`huwprosser`) — JARVIS

> **Written 2026-08-09**, after the CEO deleted the first attempt at rows 07-11 on 2026-08-08:
> *"BOZUK OLAN BOKTAN RAPORLAR HEPSİNİ sil. 7 8 9 10 11."* Not one sentence of the deleted text was
> re-read while writing this. Bound by **ledger law 7** — a rival is judged by what it PRODUCES,
> never by what it owns — and by the C42 standing order that is the reason this file exists:
> *"ŞU SKİLLERİ ŞU PLUGİNLERİ ŞU TOOLLARI İNDİRİP KURUP YAPARIM YAPILIR PROJESİ OLMALI."*
> **Section 5 is the deliverable. Sections 1–4 exist to make section 5 honest.**

---

## 1. Source identity

| Field | Measured value |
|---|---|
| Address | `https://www.instagram.com/reel/DYK2IWyoEWh/` |
| Handle | `huwprosser` — Huw Prosser, ML engineer, London (GitHub bio, read at live HEAD this session) |
| File | `media/09-DYK2IWyoEWh.mp4` — 2,804,997 bytes |
| sha256 | `26a91b04f9e9e4ea5292fd9f03000c24ba60741afce8786ca1bbdc2e31115979` |
| Resolution | **1080 × 1920** (`ffprobe`, this session) |
| Codec / frame rate | `vp9` / 30 fps · video bitrate 1,418,585 |
| Duration | **15.100000 s** (audio track 15.118005 s) |
| Audio | present — `aac`, 61,568 bit/s |
| How obtained | `yt-dlp` via `scripts/rival-intel/fetch.sh`, 2026-07-28 12:42. Nothing left this machine |
| Transcript | `transcripts/09.json` — en, **3 segments**, the holding's own Speaches container (`Systran/faster-whisper-small`) |

### How the temporal analysis was performed — stated exactly, as §3.2 of his directive requires

The reel is 15 seconds, so it was read **denser than one frame per second**:

- **30 native frames at 0.5 s steps** (`frames/09/seq/t001_0s.jpg` … `t030_14.5s.jpg`, **1080 × 1920,
  `-q:v 2`, never downscaled**), read **in order t001 → t030** against the timestamped transcript.
- **14 further native frames at 0.1–0.2 s steps between 12.4 s and 13.9 s**, cut to pin the two
  transitions that decide this report (the assistant moving, and the map arriving). These are working
  frames and live in the session scratch directory, not in the repository.
- **Edit points measured, not eyeballed:** `ffmpeg -vf "select='gt(scene,0.08)',metadata=print"`
  returns cuts at `0.467 · 1.467 · 2.867 · 3.000 · 3.033 · 3.100 · 3.167 · 3.333 · 3.467` and then
  **one more at 8.567 and nothing after it** — so everything from 3.47 s to the end is a **single
  continuous take**, and the timings measured inside it are the recording's own, not an edit.
- **Audio checked for cuts:** `silencedetect=noise=-25dB:d=0.2` returns **no silence at all** — a
  continuous music bed runs under the whole clip.
- **Detail reads are native crops cut from the video** — ledger law 5 — never crops of a frame:

```
ffmpeg -ss 14.0 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=220:50:860:955,scale=iw*6:ih*6:flags=lanczos" -q:v 1 → zoom/09/status-right-14.0.jpg
ffmpeg -ss 14.0 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=260:50:0:955,scale=iw*6:ih*6:flags=lanczos"   -q:v 1 → zoom/09/status-left-14.0.jpg
ffmpeg -ss 14.0 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=220:40:400:935,scale=iw*6:ih*6:flags=lanczos" -q:v 1 → zoom/09/dock-14.0.jpg
ffmpeg -ss 14.6 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=430:280:280:560,scale=iw*3:ih*3:flags=lanczos" -q:v 1 → zoom/09/map-london-14.6.jpg
ffmpeg -ss 14.6 -i media/09-DYK2IWyoEWh.mp4 -vframes 1 -vf "crop=300:230:760:790,scale=iw*3:ih*3:flags=lanczos" -q:v 1 → zoom/09/orb-corner-14.6.jpg
```

The enlargement in those crops is a **reading aid stated as such** — the pixels are the video's own,
nothing is presented as higher quality than the source.

**The recording is not a screen capture.** It is a phone filming an ultrawide monitor in a dark room;
the desk, the keyboard, the monitor light bar and the room are in frame throughout. Every reading
below therefore carries a camera between the pixels and the eye, and where the pixels ran out the
report writes **UNREADABLE** instead of a guess.

### Transcript correction — meaning-changing, and it is NOT resolved by the machine

`transcripts/09.json` renders the first line as *"Okay, **Travis**, are you there?"*. The screen says
**JARVIS** in five separate places. A second reading was run this session on the isolated 2.5–6.0 s
clip through the same local container:

| Model | Returned |
|---|---|
| `Systran/faster-whisper-small` (whole file, 2026-07-28) | *"Okay, **Travis**, are you there?"* |
| `Systran/faster-whisper-small` (isolated clip, this session) | *"Okay, **Javis**, are you there?"* |
| `Systran/faster-whisper-base` (isolated clip, this session) | *"Okay, **Travis**, see you then."* |

Three machine readings, three answers. **V beats T:** the assistant's name is **JARVIS**, which is
what the screen shows. What syllables the man actually pronounced is a machine guess and this report
does not pretend to have heard it. The transcript file is left exactly as the machine produced it.

---

## 2. What was on the screen — the record, second by second

| Time | On screen (V) | Spoken (T) |
|---|---|---|
| 00:00 | Burned-in title **`15 years of obsession`** over an archive clip: a teenager in a red hoodie at a plank-and-breeze-block desk, three monitors, one showing a dark particle graphic. Overlay year **`2014`** | — (music only) |
| 00:00.5 | Cut. Same person, younger, a CRT-era flat panel behind him showing a blue code editor. Overlay year **`2012`** | — |
| 00:01.5 | Cut. Overlay year **`2011`**: a dark screen holding a **node graph** — a ringed centre node with lines out to labelled nodes; under the ring the word **`OFFLINE`**. The centre label is **UNREADABLE** at this resolution; a red **`T-`** is painted on the wall at frame left | — |
| 00:02.5 | Same 2011 clip, he waves a hand at the screen, a pencil in his mouth. The node graph is unchanged — a still interface, not an animated one | — |
| 00:03.0 | Last archive cut of the montage — the same 2011 shot from a second angle | — |
| 00:03.5 | **Cut to the present day, and the camera does not cut again.** A curved Samsung ultrawide on a black cutting mat: mechanical keyboard, two Raspberry Pi boards, a bare SBC with a heatsink, a small LCD panel, solder reels, a VR controller, a small silver box at right. Screen: a **particle sphere** with **`JARVIS`** across it and, beneath, a large clock **`23:59`** with `WEDNESDAY 29 APRIL` under it | — |
| 00:04.0 | Identical frame, camera pushing in slowly. **The idle screen IS the clock** — the machine at rest is showing the time, not a blank desktop | — |
| 00:05.0 | Camera closer. Bottom of the screen: a **dock of six icons**; at the very bottom-right, four small square-bracket chips | — |
| 00:05.5 | **The sphere and the clock dissolve** — the screen goes to a bare grid. This is the wake transition: he has started speaking and the idle face is clearing | *"Okay, [JARVIS], are you there?"* (3.06–5.06, name corrected from the screen) |
| 00:06.0 | Screen carries only the dock and the corner chips over an empty grid | — |
| 00:07.0 | Still bare. Grid faintly brighter at the top edge | — |
| 00:07.5 | **The JARVIS ring appears dead centre** — a bright blue circle with the word `JARVIS` inside it, wrapped in two broken arcs and a ring of tick marks | *"At your service."* (5.06–8.82) |
| 00:08.5 | The ring is at full brightness, the arcs at a different rotation than the previous frame — it is **animating while the voice speaks** | — |
| 00:09.0 | Screen edges now carry a blue bloom; measured scene change at 8.567 s is this state arriving | — |
| 00:09.5 | Ring unchanged in place, arcs rotated again. He is mid-request | *"Fantastic. Can you open up a map of London for me?"* (8.82–10.82) |
| 00:10.5 | Ring still centre, arcs rotated. **Nothing else has appeared** — the machine is holding its listening face | — |
| 00:11.5 | Same, camera closer still | — |
| 00:12.5 | Ring still dead centre — **1.7 s after the request ended, nothing has been drawn yet** | — |
| 00:12.8 | Ring still centre. **This is the last frame in which it is** | — |
| 00:13.0 | **The ring is now parked in the bottom-right corner**, slightly larger and motion-blurred — caught arriving. It moved centre → corner **inside a 0.2 s window** | — |
| 00:13.2 | Ring settled bottom-right, sharp. The rest of the screen is still empty | — |
| 00:13.6 | **The map begins to appear** — faint tiles fading in across the full width, behind the ring | — |
| 00:13.7 | Map legible: the outline of southern England and the Channel | — |
| 00:14.0 | **Map fully rendered, edge to edge.** Native zoom `zoom/09/map-london-14.6.jpg` reads it: `London` at the centre with the motorway web around it, `Watford · Luton · Harlow · Chelmsford · Basildon · Southend-on-Sea · Ilford · Croydon · Rochester · Maidstone · Canterbury · Colchester · Ipswich · Reading · Aylesbury · Milton Keynes · Oxford · Bristol · Birmingham · Cambridge · Brighton · Hastings · Portsmouth`, motorway shields in blue, and **national-park labels in green** — `Chilterns National Landscape`, `South Downs National Park`, `New Forest National Park`, `The Cotswolds National Landscape`. Across the Channel: `Calais · Dunkirk · Boulogne-sur-Mer`. **This is a real map service, not a drawing** | — |
| 00:14.5 | Unchanged, camera still pushing in. The ring holds the corner and keeps animating over the map | — |
| 00:15.05 | Final frame — map, ring in the corner, dock, corner chips. **The clip ends without the assistant speaking again** | — |

### The two corner strips, read at native size

- **Bottom right** (`zoom/09/status-right-14.0.jpg`): four bracketed controls, verbatim —
  **`[reasoning:off]  [voice:on]  [new chat]  [sleep]`**
- **Bottom left** (`zoom/09/status-left-14.0.jpg`): `…ted` (the tail of a word, almost certainly
  `connected`) then **`session: `** and an identifier. **The identifier is UNREADABLE** — roughly six
  characters, `b7…d?`, and the report will not guess it.
- **Dock** (`zoom/09/dock-14.0.jpg`): **six icons** separated by hairlines — a target/aperture, a
  speech bubble, a camera, a shape that may be a book or an open map (**UNREADABLE**), a music note,
  a document. Beneath them a **pager indicator** (`· ▬ ·`), so the dock has more than one page.

---

## 3. Capabilities — what this system demonstrably has

### 09-C1 · The assistant is a presence on the screen, not a window — **V**
There is no chat window, no title bar, no application chrome anywhere in fifteen seconds. The whole
screen belongs to the assistant: at rest a clock, when addressed a ring, when answering a map. The
ring is the only thing that persists across all three states.

### 09-C2 · The presence MOVES OUT OF THE WAY when a result opens — **V**
Measured to a 0.2 s window: centre at 12.8 s, corner at 13.0 s, and the map only starts painting
0.6 s later at 13.6 s. **The order is deliberate** — the assistant clears the stage first, then the
answer occupies it. It does not overlap its own result and it does not vanish either; it keeps
animating in the corner while the map is up, so the machine is still visibly present.

### 09-C3 · A spoken sentence produces a rendered artefact that fills the screen — **V**
*"Can you open up a map of London for me?"* ends at 10.82 s. First tiles at 13.6 s, fully rendered by
14.0 s: **≈ 2.8–3.2 s from the end of the request to a finished answer on screen**, inside a
continuous take with no edit after 8.567 s. The artefact is a live map product with motorway shields
and national-park labels, not an illustration.

### 09-C4 · The modes are four one-word controls, permanently visible — **V**
`[reasoning:off]` `[voice:on]` `[new chat]` `[sleep]`. Four facts in four words, in the corner, all
the time: how hard it is thinking, whether it is listening, how to start clean, how to send it away.
No settings page is opened in the clip to change any of them.

### 09-C5 · The idle state is useful — **V**
At rest the machine shows a clock and its own name, not a blank screen or a desktop. It looks awake
before it is spoken to.

### 09-C6 · A session is named on screen — **V (partly UNREADABLE)**
`connected · session: <id>` sits bottom-left throughout. The user can see which conversation he is
inside without asking.

### 09-C7 · A tool dock with more than one page — **V**
Six icons and a pager. The assistant is not voice-only; there are direct entrances to camera, chat,
music, documents and at least two more.

### What the author publishes, measured at live HEAD this session — **R**

| Measured | Value (2026-08-09, GitHub API) |
|---|---|
| `github.com/huwprosser/jarvis-mlx` | **515 stars · 68 forks · 3 open issues · Python** |
| Licence | **none — `license: null`.** No `LICENSE` file: all rights reserved |
| Created / last push | 2024-04-28 / **2026-05-11** (three months before this reading) |
| Author profile | 40 public repositories, **1,034 followers**, bio *"In a cave with a box of scraps 📦 ML Engineer · Tinkerer · 📍London"* |
| The repo's own first line | *"⚠️ This project is very out of date — while it offers a great place to start, it does not reflect current progress!"* |
| What that repo is | offline STT (Whisper) + LLM (Phi-3, ~60 tok/s on an M1 Max) + TTS (MeloTTS), all local on an Apple-Silicon MacBook |

### What is **not** established

- **Whether the system in this reel is that repository.** The repo is MacBook/MLX; the reel is an
  ultrawide with a small silver box beside it that could be a Mac. Same author, same product name —
  **that is all that is measured. Unverified.** To verify: his own statement, or a shot showing the
  machine.
- **Whether it ran offline here, and on what models.** Nothing on screen says. **Unverified.**
- **Whether the map is a native view or a browser.** No chrome is visible, which is consistent with
  both a native map view and a full-screen browser. **Unverified.**
- **Whether any of it was rehearsed for the camera.** It is a promotional reel. What is measured is
  that it is one continuous take after 3.47 s, so the three seconds are not an edit. **Unverified**
  beyond that, and this report does not turn that uncertainty into an accusation.

---

## 4. What DXB has today — measured by command, this session

| # | Measured | Command |
|---|---|---|
| 1 | **The ear is live and has been for four days.** `dxb-jarvis.service — DXB JARVIS always-on wake daemon`, active since 2026-08-04 18:19, `arecord -f S16_LE -r 16000` open, wake phrase armed | `systemctl --user status dxb-jarvis` |
| 2 | **The local models are ours already.** `dxb_speaches_local` up on port 8969, serving `piper` text-to-speech in Turkish, English and German and `faster-whisper` base + small for hearing | `docker ps` · `curl :8969/v1/models` |
| 3 | **The loop is timed, and the timing is the finding.** 102 voice calls, 80 of them timed, 2026-07-23 → 2026-07-28. **Median total 32,684 ms** — hearing 20,083 ms, thinking 14,821 ms, speaking 2,572 ms. Worst 155,367 ms. 13 marked degraded | `select … from voice_calls` (company DB, SELECT only) |
| 4 | **And it has not run since.** No voice call recorded after 2026-07-28 — twelve days | same query, `max(started_at)` |
| 5 | **The answer lands only in text.** `apps/dashboard/src/components/command/voice-call.tsx` is 590 lines and renders transcript lines, director chips and timing chips. A search of that file for `map\|canvas\|artifact\|iframe\|chart` returns **only JavaScript `.map()` calls** — there is no surface on which a spoken request can draw anything | `grep -n` on the file |
| 6 | **`stt_ms` is machine time, not speaking time.** `packages/voice/src/intake.ts:175` — `result.sttMs = Date.now() - sttStart`, started after the audio is already in hand. The 20 seconds are the machine transcribing, not the CEO talking | `sed -n '150,180p' packages/voice/src/intake.ts` |
| 7 | **The standing measurement of law 7 still holds.** `sum(realized_revenue_eur)` over `v_objective_progress` = **0** | company DB, SELECT only |

**In one line: we have the ear and the mouth, and neither the face nor the hands.** The machine hears
the CEO and answers him in speech; it has nothing that stays on his screen, and nothing that a
sentence can make it draw. And the ear takes twenty seconds where this rival's whole loop takes three.

---

## 5. The build project — *"yaparım, yapılır"*

### P09-1 — The answer must land on the screen, not only in the ear · **the item this source is here for**

| | |
|---|---|
| **What** | A voice answer may carry a **rendered result**, not only spoken text: the reply payload gains an artefact (a table, a chart, a map, a document, a page of the command centre) and the CEO surface renders it full-width beneath the conversation. The first artefact types are the ones the holding already computes — an objective's progress, a cost table, an approval waiting on him |
| **Why this one** | Measured above: his spoken question can only ever come back as speech and text. Everything this company knows how to draw, it can only draw when he clicks. That is the difference between an assistant that answers and one that shows |
| **Where it lands** | `VOICE_INTERACTION_SPEC` (owns the reply contract) and `CEO_COMMAND_CENTER_SPEC` (owns the surface). **No new spec, no new table** |
| **Skills / plugins / tools to download and install** | **None.** The renderers exist in the dashboard; what is missing is a reply that can name one |
| **Recurring cost** | Zero |
| **Done means** | He asks out loud for this month's costs and the chart is on the screen when the sentence ends — shown live in one session |

### P09-2 — The thirty-two-second answer

Measured: median 32.7 s, of which **20.1 s is hearing**. The hearing runs on a model we already host
(`faster-whisper-small` in our own container), so this is a tuning and streaming problem, not a
purchase: transcribe the segment as it is spoken instead of after it is finished, and measure each
stage separately so the number cannot hide again. **Installs: none** — `faster-whisper-base` is
already downloaded beside it. **Done means** a re-measured median under five seconds on the same
table, with the query in the evidence.

### P09-3 — The presence that steps aside — **DESIGN, and it waits for his approval**

09-C1, 09-C2 and 09-C5 together are one idea: a mark that is always on the screen, that holds the
centre while it listens, moves to the corner when the answer arrives, and shows something useful when
nobody is talking to it. This is exactly the Iron Man / JARVIS cockpit the CEO set as the Phase-8
design law. **It is therefore not started here.** His own written directive is binding —
`00_READ_FIRST_MASTER_DIRECTIVE.md:5`, *"Implementation status: PROHIBITED until the CEO approves the
complete visual design package"* — so this enters the design package as a requirement with the
measured behaviour attached (centre → corner in 0.2 s, result 0.6 s later), and it is built only after
he approves that package.

### What is NOT taken, and why

- **`jarvis-mlx` code is not copied, and cannot be.** Measured this session: the repository ships
  **no licence** (`license: null` from the GitHub API), which means all rights reserved. We take the
  shape of what was seen on screen, never his lines. The author himself calls the repository out of
  date, so there is nothing there we would want to copy anyway.
- **Apple-Silicon-only local inference.** His stack is MLX on a MacBook. Ours runs where the holding
  runs; `.planning/research/STACK.md` already fixes our local speech stack and it is live.
- **A second agent framework or a second job runtime** — the standing boundary in `.claude/CLAUDE.md`.

---

## 6. Verdict

**What this source PRODUCES, measured, with its limits stated.**

It produces **attention and an open codebase**: 515 stars and 68 forks on `jarvis-mlx`, 1,034 GitHub
followers, 40 public repositories. **It does not show that it earns.** There is no price, no product,
no checkout anywhere in the fifteen seconds, and his own site serves nothing but a name to a fetcher
(a JavaScript application — **UNREADABLE** without a browser, and no browser leg was run). The one
paid channel that could be measured is his Buy Me a Coffee page: **37 supporters**, memberships at
**£1 and £2 a month**, and its most recent post is from **2022**. Third-party pages describe 80 million
views and a million followers on the project; that figure was not measured by us and is
**Unverified**. **Whether he earns from this is Unverified**, and this report does not turn that into
a criticism — a fifteen-second reel is not a sales page and was never trying to be one.

**Where they are ahead of us, stated plainly and measured.** A man speaks one ordinary sentence and
**2.8 to 3.2 seconds later** the machine has drawn the answer across a 34-inch screen, then stepped
its own face into the corner so as not to stand in front of it. Our machine, on the same kind of
request, takes a **median of 32.7 seconds** and can draw **nothing at all** — and has not been spoken
to since 2026-07-28. Fifteen years of his iterations are in that ring; ours has run 102 times.

**Where we are level, and it is worth knowing:** the offline speech stack. Local hearing and local
speech in three languages are already running in our own container, on our own machine, with no
provider key involved — the same ground his repository stands on. We did not need this reel to get
there.

**Row 09 is `reported`. Nothing is built and nothing is installed.** <!-- OPEN: B22 --> P09-1 and P09-2 wait on his word; P09-3 waits behind the visual design package his own directive requires first. <!-- OPEN: B22 -->

**And the gap that decides this report:** it is not the ring and it is not the animation. It is that
**his machine can put its answer where his eyes already are, and ours cannot.** Everything this
holding knows — 199 written employees, the objectives, the costs, the approvals — is reachable only
by a man clicking through pages. On the measure that decides, this source runs and is watched, and
DXB has never run end to end with `realized_revenue_eur` at 0. We are behind it.
