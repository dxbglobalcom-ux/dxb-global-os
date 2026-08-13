# 21 — "Okay, Jarvis, are you up?" · he speaks, the machine LOOKS, and names the thing in his hand

**WHAT IT DOES.** One man, one desk, 34.7 seconds, no keyboard touched. He asks if it is awake; it
answers. He says *"take a look at my desk"*; **the screen turns into a live overhead camera view of
the desk half a second later.** He holds up a bare circuit board and asks what it is; **it looks
through the camera and names it** — *"a small circuit board… a single board computer, or a similar
microcontroller module"* — and when he corrects it to a Raspberry Pi 4 it answers back and asks him
what he is going to build.

**WHY IT MATTERS TO THIS HOLDING.** The CEO handed this source over with a standing order for Hamza
(2026-08-10): *"kamerayı aktif edip sahibinin elinde ne var onu tanımlıyor. bu da hamzanın
yapabilmesi gereken şeylerden… bütün teknolojik herşeyi yapabilmeli."* Measured against that order
in our own product and database this session:

| His order | Ours, measured 2026-08-10 |
|---|---|
| Hamza opens the camera and SEES | **No camera exists.** The only two `getUserMedia` calls in the whole product both ask for `{ audio: true }` — microphone only. **0** `<video>`, `<canvas>`, `createImageBitmap` or `toDataURL` in the CEO's dashboard |
| Hamza identifies an object | **No vision path.** All 11 "vision" hits in `packages/` are the word **re*vision***; **0** matches for `image_url` or multimodal input. The model gateway holds **8** models — `glm-5.2`, `deepseek-v4-pro/flash`, `qwen3.6-flash`, `kimi-3`, `kimi-2.7-code`, `minimax-m3`, `embed-small` — **not one of them is a seeing model** |
| He speaks, it answers **at 1.5 s** (his standing figure, this session: *"1.5 saniye alım verim… instantly yani olmalı"*) | **Median 40.67 s** across 58 timed calls — STT 22.63 s · answer 14.82 s · TTS 2.57 s. **Our fastest call ever: 28.18 s.** Last call **2026-07-28 08:58** |
| It moves while it speaks, and repositions itself | **Nothing can move.** No orb/avatar/identity component exists anywhere, and **0** files in the dashboard use `framer-motion`, `layoutId` or `AnimatePresence` |

---

## 1. Source identity

Instagram reel `DXyvXCNITAK` · `media/21-DXyvXCNITAK.mp4` · **1080×1920, vp9, 24 fps, 34.67 s, aac
stereo kept** (R — `ffprobe`) · watched as 35 native frames in order with the sound, plus a 10 fps
dense pass, a 24 fps pass over the transition and 3 native zoom crops (R).

## 2. Watched record — 34.7 s in order, the clock taken from the waveform

Timings are **measured from the audio itself** (50 ms windows, speech = 12 dB over the room's own
noise floor of −48.7 dB), not from the transcript's segment boundaries.

| Time | Span (s) | Who | Said (T) | On the screen (V) |
|---|---|---|---|---|
| 00:00 | 0.05–1.25 | man | *"Okay, Jarvis, are you up?"* | Asleep: a particle sphere marked `JARVIS`, the clock `23:43`, `THURSDAY 30 APRIL`. Bottom-right: `[reasoning:off] [voice:on] [new chat] [sleep]` |
| 00:02 | 1.25–3.80 | — | *(silence)* | Screen goes dark, then a thin HUD frame draws in with a faint grid |
| 00:03 | 3.80–4.75 | **JARVIS** | *"At your service."* | A bright ring lights at the centre of the canvas, `JARVIS` inside it. **Answer latency 2.55 s** |
| 00:05 | 5.40–6.10 | man | *"Take a look at my desk."* | Ring breathing at centre |
| 00:06 | 6.59–6.63 | — | *(still silent)* | **THE CANVAS SWAPS: the overhead desk camera goes live and fills the surface; the ring shrinks into the lower-right corner.** 0.53 s after he stopped speaking; the swap itself completes in **2 native frames = 0.083 s** |
| 00:08 | 8.60–9.65 | **JARVIS** | *"Toggling the desk view."* | Bottom-left now reads `● connected   session: a2c3a284`. **The voice confirms 1.97 s AFTER the screen had already done it** |
| 00:11 | 11.05–12.50 | man | *"What am I holding right now?"* | He lifts the board into the camera's field; the feed shows his hand from above |
| 00:17 | 17.90–23.85 | **JARVIS** | *"You are holding a small circuit board, sir. It looks like a single board computer, or a similar microcontroller module."* | Ring pulsing in the corner while it talks. **Answer latency 5.40 s** |
| 00:25 | 25.55–26.90 | man | *"That's right, it's a Raspberry Pi 4."* | Feed live, ring in corner |
| 00:32 | 32.05–34.50 | **JARVIS** | *"A classic choice, sir. What are you planning to build with it?"* | **Latency 5.15 s.** It ends by asking HIM a question |

**Read off the native zoom crops (R):** the mode dock at bottom-centre — six icons, divider-separated:
**orb · chat · video camera · library · audio · document**, with a small page indicator beneath. The
camera is a MODE of the surface, not a feature buried in a menu.

## 2.2 Design and appearance — measured in pixels

Sampled from the native frame at 22.0 s over the canvas (1030×850 px, 875,500 pixels), colour taken
from the pixels and never named by eye:

| Role | Value |
|---|---|
| Ground | **`#22242F`** (mean of the darkest 60 %) |
| Ink | **`#C3D9E4`** (mean of the brightest 1 %) |
| Median luminance | **48.8 / 255** — dark by default |
| Hue discipline | of the lit pixels, **blue-cyan 92.4 %**, warm 0.4 %, neutral 7.2 %; mean lit blue **`#7294A9`** |

**Composition:** the canvas is one surface with one occupant. At rest the identity mark owns the
centre; the moment a view is opened, **the view takes the whole canvas and the mark retreats to the
lower-right corner** — small, still lit, still named. Two thin status strips frame the bottom:
machine state on the left (`connected`, session id), the switches on the right (`reasoning`,
`voice`, `new chat`, `sleep`). Nothing else is on the screen. **What DXB takes from the design:** one
occupant at a time; the assistant's mark is a *resident of the canvas that yields the floor* rather
than a widget in a fixed slot; the machine's connection state and session handle are printed where
the eye can always find them.

## 3. Capabilities

| # | Mechanism | Evidence |
|---|---|---|
| 1 | **Wake and answer by voice alone**, no key pressed | T + V, 2.55 s |
| 2 | **The camera is a mode of the surface** — one sentence opens a live overhead view | V at 6.63 s; the dock's camera icon |
| 3 | **It sees and identifies an object held up to it**, and hedges honestly (*"or a similar microcontroller module"*) rather than guessing hard | T 17.90–23.85 |
| 4 | **The surface acts before the sentence is spoken** — screen at 0.53 s, voice confirmation at 2.47 s | measured |
| 5 | **The identity mark repositions by context** — centre at rest, corner when a view owns the canvas | V |
| 6 | **State is always printed**: `● connected`, `session: a2c3a284`, and four switches | zoom crop |
| 7 | **It closes with a question back to the human** | T 32.05–34.50 |

### Aliveness — how this system is built to live, and what DXB takes

**1 — What runs on its own clock.** The idle screen keeps a live clock (`23:43`) and holds a `[sleep]`
state it can be woken from by voice; the assistant is a resident process waiting, not an app opened.

**2 — What makes the surface breathe, TIMED.** The measurable event is the **canvas swap**: at 24 fps
the centred view is replaced by the live camera feed within **2 frames (0.083 s)**, beginning
**0.53 s** after the human's sentence ends, and the identity mark travels centre → lower-right in the
same beat. **UNVERIFIED — the ring's own pulse while speaking.** Measured over a 10 fps dense pass
with the camera's translation removed pair by pair: speaking window 0.283 against a same-frame static
control of 0.275 (1.03×), silent window 0.284 against 0.397. The control's own reading moves more
between the two windows than the ring does, so **this handheld film cannot separate the ring's
animation from the camera** — a screen recording of the canvas would settle it in one pass.

**3 — How it answers the human, measured four times:** **2.55 s · 2.50 s · 5.40 s · 5.15 s.** The two
short ones are state changes; the two long ones carry a look through the camera and a conversational
reply. **The CEO's standing figure for us is 1.5 s** — so this source is not the bar, it is the floor.

**4 — What DXB takes:** the camera as a mode of the CEO's surface · a seeing model on the gateway ·
the surface acting at 0.5 s and the voice explaining afterwards instead of the whole answer arriving
at once · an identity mark that yields the centre when a view needs it · `connected / session` always
printed · and the reply that ends in a question back to him.

## 4. What DXB has today — measured 2026-08-10

| Their mechanism | Ours | Command |
|---|---|---|
| Camera on command | **Missing.** 2 `getUserMedia` calls, both `{ audio: true }`; 0 video/canvas elements in the dashboard | `grep -rlE "getUserMedia\|<video\|<canvas" apps packages` |
| Sees and names an object | **Missing.** 0 image inputs; the 11 "vision" hits are `revision` | `grep -rhoiE "image_url\|multimodal\|\bvision\b" packages` |
| A seeing model on the shelf | **Missing.** 8 models on the gateway, none of them a vision model | `docker exec dxb_litellm cat /app/config.yaml` |
| Answer in 2.5–5.4 s (his target 1.5 s) | **Median 40.67 s**, fastest ever **28.18 s**, 58 timed calls, last one 2026-07-28 | `select percentile_cont(0.5) … from voice_calls` |
| Per-leg timing shown on the surface | **We have this.** `voice-call.tsx` renders `stt_ms`, `answer_ms`, `tts_ms` and localises every status enum | `apps/dashboard/src/components/command/voice-call.tsx:319` |
| A mark that moves with context | **Missing.** No identity component; 0 files use a layout-animation library | `find … -iname "*orb*" -o -iname "*avatar*"` → none |
| `connected / session` on the surface | **Missing** from the CEO's eye, although `voice_calls` carries a 7-state machine (`listening → transcribing → routing → answering → speaking → ended/failed`) and a `session_id` column | `\d voice_calls` |

## 5. The build project

His order names the means as well as the end: *"hangi skill tool plugin mcp hook vb şeyler
gerekiyorsa kurulmalı."* Each row below names them.

| # | Project | What must be installed / built | Cost & gate |
|---|---|---|---|
| **P21-1** | **HAMZA SEES.** A camera pane on the CEO's surface; one still frame goes to a seeing model and comes back as a named object with a confidence | Browser `getUserMedia({ video: true })` + frame grab (no install) · a **vision-capable model** added to the LiteLLM gateway — a local `qwen3-vl`-class 7–8 B model fits the workstation's **16 GB GPU** and keeps every frame inside the house · a new MCP tool `vision.identify(frame)` in `packages/dxb-mcp` · a `packages/hook` policy that gates it | Local model **€0**; a hosted seeing model costs money → **his gate**. The camera is a sensor in his own house: frames never leave the machine, and nothing is stored without his word |
| **P21-2** | **The camera becomes a MODE**, beside chat, library and documents — a dock on the command surface, the way theirs carries six | Front-end only, inside `CEO_COMMAND_CENTER_SPEC` | €0 · design package |
| **P21-3** | **The surface acts before the sentence lands.** Dispatch the action at intent recognition and let the voice explain afterwards — theirs moved at 0.53 s and spoke at 2.47 s | `packages/kernel` intent path + the voice surface | €0 |
| **P21-4** | **The identity mark that repositions** — centre at rest, corner when a view owns the canvas | The component does not exist; a layout-animation library is needed (0 in the product today) | €0 · design package |
| **P21-5** | **1.5 s round trip — HIS FIGURE, no exception.** The measured killer is STT at **22.63 s median**; the fix is the local stack on the workstation he bought (Ryzen, 24 threads, 32 GB, 16 GB GPU) | Local `whisper large-v3-turbo` + local TTS — already board row **B12** | €0 · **blocked on the workstation** |
| **P21-6** | **`● connected · session: <id>`** printed on the CEO's surface, from the state machine `voice_calls` already has | Surface change only | €0 |

**No implementation starts before he approves the visual design package** (his directive of
2026-07-29). P21-1's model choice and P21-5 are machinery, not surface, and are startable on his word.

## 6. Verdict

Thirty-four seconds prove the thing our own product cannot do at all: **a man speaks, a machine
opens its eye, and names what he is holding.** The mechanism worth copying is not the naming — it is
the ORDER of events: the screen obeys in half a second, the voice explains two seconds later, and the
mark that was the centre of the canvas steps aside so the view can have it. **This source does not
show what it produces** — no revenue, no customers, no user count is on screen or in the caption; the
CEO knows these systems first-hand and his knowledge outranks a reading of a 34-second reel.

Against us the distance is not subtle: they answer in 2.5–5.4 s, his standing order for us is 1.5 s,
and our own median is **40.67 s** with the fastest call we have ever recorded at **28.18 s** — and
our assistant has no eye at all. Six projects; four of them cost nothing and need no account, and the
one that decides everything is the workstation.

---

## Change log

| Date | Change |
|---|---|
| 2026-08-10 | Written from the source. Row claimed at `2026-08-10T21:16:52Z` **before** the media was opened (law 1). Watched as 35 native frames in order with the audio; every quoted time comes from a **waveform measurement at 50 ms resolution**, not from transcript segment boundaries. The canvas swap was cut at native 24 fps; motion of the ring measured against a same-frame static control with the camera's translation removed pair by pair, and recorded **UNVERIFIED** with the recording that would settle it named. §1 is one line instead of the usual table; the six section headings are kept because `tests/c42/rival-intel-ledger.test.ts` fails the commit without them. **His standing capability order for Hamza** and **his 1.5 s round-trip figure**, both given this session, are registered in `scripts/governance/ceo-approvals.json`. |
