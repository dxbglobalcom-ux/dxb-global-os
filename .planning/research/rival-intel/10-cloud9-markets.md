# 10 — `cloud9.markets` — Nimbus: nine agents with names, jobs and one sentence each

> Written 2026-08-08 from nothing, after watching the video start to end with its sound
> (ledger law 4). No sentence of the report the CEO binned on 2026-08-01 was opened or re-used.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbBAOdVBjka/ |
| Uploader | `cloud9.markets` — ledger row 10 |
| Kind | reel — a phone recording of one curved ultrawide monitor, in a dark room lit magenta |
| Media on disk | `media/10-DbBAOdVBjka.mp4` |
| **sha256** | `36bf05ac45b79902e4ca10b462e7f7f9554dad15be12936f3a9c46f0bcb4083d` |
| Resolution / audio | **1080 × 1920**, audio kept — passes the CEO's 720p floor |
| Duration | **75.44 s** |
| Spoken word | `transcripts/10.json` — en, 15 segments |
| Frames | `frames/10/` — 75 native frames at 1 fps + 2 native zooms in `frames/10/zoom/` |
| The CEO's note | listed without a note (item 10 of his list) |
| **Its own headline, burned into the video** | **"Everyone's building Jarvis, I built Nimbus, multi agent trading desk"** |

### How the temporal analysis was performed — stated exactly

Watched **start to end with its sound**, transcript beside it, frames read every 4–6 s across the
whole 75 s — the shot is a single locked-off camera on one screen whose only changes are the speaker
chip and the node that lights, so nothing between the read frames is lost. Two native zooms were cut
from the video file (ledger law 5):

```
ffmpeg -ss 12 -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=760:80:300:700" -q:v 1 → zoom/nimbus-role-12.0.jpg
ffmpeg -ss 62 -i media/10-DbBAOdVBjka.mp4 -vframes 1 -vf "crop=380:80:700:0"   -q:v 1 → zoom/localvoice-62.0.jpg
```

---

## 2. Second-by-second record of what was watched — 00:00 to 01:15

**The screen never changes layout for 75 seconds.** It is one node map, and the only things that
move are (a) which node glows and (b) a **speaker chip that appears inside the centre node's
subtitle line**. Every quotation below is read off the screen or the audio.

**The map, read once and in full (clearest at `t012`, `t017`, `t038`):**

| Group label on screen | Node | Sub-label |
|---|---|---|
| *(centre)* | **`NIMBUS`** | **`MASTER · STRATEGY SYNTHESIS / RISK ROUTER`** — confirmed by native zoom at 00:12 |
| `INTELLIGENCE` | `CAPITOL` | `SMART MONEY` |
| `INTELLIGENCE` | `ATLAS` | `MACRO` |
| `INTELLIGENCE` | `SCOUT` | `RECON` |
| `ANALYSIS` | `ATHENA` | `ANALYST` |
| `ANALYSIS` | `CHARTIST` | `TECHNICIAN` |
| `ANALYSIS` | `ORACLE` | `QUANT` |
| `EXECUTION` | `SENTINEL` | `RISK OFFICER` |
| `EXECUTION` | `PILOT` | `EXECUTION` |
| `EXECUTION` | `LEDGER` | `THE BOOK` |

Each node is a coloured ring with a filled centre; each group is colour-coded (intelligence amber,
analysis green/cyan, execution red/magenta, macro violet). **On the `SENTINEL → PILOT` wire there is
a small hollow diamond** — a gate glyph sitting between the risk officer and the executor, and the
only marker of its kind on the map.

| t | What was on screen, and what was said |
|---|---|
| 00:00 | *(through 00:02)* **CAPTION (fixed, white box, first ~20 s): `Everyone's building Jarvis, I built Nimbus, multi agent trading desk`.** Opening shot is over the keyboard, the map above it. A small application chip is visible on the desk image reading **`Claude Fable 5`** with an orange asterisk mark — recorded as observed, drawn from no other claim. **SPOKEN (00.00–03.00): *"Nimbus, wake up. Let's make some money today."*** |
| 00:04 | The camera lifts to the full screen. All ten nodes visible at once. **SPOKEN (04.50–09.50): *"Good morning, sir. Nine agents online. Markets are moving. Say the word."*** — **the count matches the map exactly: nine named agents plus Nimbus.** |
| 00:10 | Centre node breathing, no chip yet. **SPOKEN (10.20–14.20): *"Alright, Nimbus. I want to meet your team. Can you introduce me to your team?"*** |
| 00:12 | **NATIVE ZOOM `zoom/nimbus-role-12.0.jpg`** — the centre's role line resolves exactly: **`MASTER · STRATEGY SYNTHESIS / RISK ROUTER`**. Not "assistant". Not "orchestrator". **A router of risk.** |
| 00:15 | A chip **`•NIMBUS`** appears inside the subtitle line and the word `meet` renders beneath it. **SPOKEN (15.50–19.00): *"You want to meet the desk? Very well, sir. Teams sound off."*** |
| 00:20 | *(through 00:23)* `ATLAS` lights violet. **SPOKEN: *"Atlas — when the money printer turns on, I'm the first to know."*** (macro/central-bank watch, in one sentence) |
| 00:24 | *(through 00:29)* Chip **`•CAPITOL`** appears at centre, `CAPITOL` lights amber. **SPOKEN: *"Capitol — when Trump or Pelosi buy us stuff, I know before the news does."*** (congressional-disclosure tracking, in one sentence) |
| 00:31 | *(through 00:35)* Chip **`•SCOUT`**, `SCOUT` lights. **SPOKEN: *"Scout — whatever stock's going viral today, I found it an hour ago."*** |
| 00:36 | *(through 00:40)* `ATHENA` lights green. **SPOKEN: *"Athena — I read the boring legal filings. All of them, even the footnotes."*** |
| 00:42 | *(through 00:45)* Chip **`•CHARTIST`**, `CHARTIST` lights cyan, word `draw` renders. **SPOKEN: *"Chartist — I draw the lines where to buy and where to run."*** |
| 00:46 | *(through 00:50)* Chip **`•ORACLE`**, `ORACLE` lights magenta. **SPOKEN: *"Oracle — I whisper where the price goes next."*** |
| 00:51 | *(through 00:55)* Still Oracle. **SPOKEN: *"Probabilities, darling. Never promises."*** — **the quant agent states its own epistemic limit, out loud, unprompted.** |
| 00:56 | *(through 00:59)* Chip **`•SENTINEL`**, `SENTINEL` lights red, word `Risk` renders. **SPOKEN: *"Sentinel, risk officer — my favourite word is no."*** |
| 01:00 | *(through 01:04)* Chip **`•PILOT`**, `PILOT` lights magenta, word `Sentinel` renders beneath. The camera is now on the `SENTINEL → ◇ → PILOT → LEDGER` chain. **SPOKEN: *"Pilot — Sentinel signs off, I execute the trade. No cowboy stuff."*** — **the diamond on the wire is that sign-off, drawn.** |
| 01:02 | Top-right of the screen, a status chip reads **`LOCAL VOIC…`** — the crop cuts the tail; read as **`LOCAL VOICE`**, with the remainder recorded **UNREADABLE**. |
| 01:06 | *(through 01:10)* Chip **`•LEDGER`**, `LEDGER` lights white, word `remember` renders. **SPOKEN: *"Ledger — I remember every call this desk makes, especially the bad ones."*** |
| 01:11 | *(through 01:15)* Chip **`•NIMBUS`** returns to centre, word `run` renders. **SPOKEN (71.50–74.50): *"And I am Nimbus. I run this desk. Give the word, sir."*** Reel ends on the full map. |

---

## 3. Capabilities — what this source demonstrably shows

| ID | Capability, as evidenced on screen or in audio | Where |
|---|---|---|
| **10-C1** | **Nine agents, each with a name, a one-word job title, a group, and ONE SENTENCE that a non-technical person understands instantly.** No agent needs a paragraph. | 00:20–01:10 |
| **10-C2** | **The org chart IS the interface.** There is no dashboard, no table, no chat log for 75 seconds — the company's structure is the only screen. | whole reel |
| **10-C3** | **The speaker is shown at the centre, not beside the message.** A `•NAME` chip renders inside the master node's own subtitle whenever an agent talks, so the eye never leaves the middle. | 00:15 onward |
| **10-C4** | **A risk officer with veto, drawn as a gate.** `SENTINEL — RISK OFFICER`, *"my favourite word is no"*, sitting on the wire before `PILOT` with a diamond marker between them, and `PILOT` says *"Sentinel signs off, I execute."* **The approval gate is a picture, not a policy document.** | 00:56–01:04 |
| **10-C5** | **An agent that states its own epistemic limit aloud:** *"Probabilities, darling. Never promises."* | 00:51 |
| **10-C6** | **A memory agent whose stated job is the bad calls:** `LEDGER — THE BOOK`, *"I remember every call this desk makes, especially the bad ones."* | 01:06 |
| **10-C7** | **The master's role is risk routing, not answering:** `MASTER · STRATEGY SYNTHESIS / RISK ROUTER`. | 00:12 zoom |
| **10-C8** | **Voice is stated as local:** a `LOCAL VOICE` status chip pinned top-right. | 01:02 |
| **10-C9** | **Wake, greet, count, offer.** *"Nimbus, wake up"* → *"Good morning, sir. Nine agents online. Markets are moving. Say the word."* A four-part opening in nine words. | 00:00–00:09 |

**Claims recorded as claims.** In 75 seconds **no market data, no price, no position, no order, no
filing and no result appears on screen** — only the org map and voice. The agents' descriptions of
what they do are **spoken self-descriptions**, and the voices are performed. Whether any of the nine
is wired to a data feed or a broker is **not shown and is not inferred here.**

---

## 4. What DXB has today — measured 2026-08-08, this session

| Their capability | Ours | Verdict |
|---|---|---|
| 10-C1 one sentence per employee | **200 persona `.md` files, 199 `employee_records`, 205 `agents`** — and the persona law already forbids a generic identity | **PRESENT at 20× the scale; whether each has a ONE-LINE public sentence is UNVERIFIED this session** |
| 10-C2 org chart as the interface | `(command)/org` exists with `companies`, `departments`, `directors`, `employees`, `hr`; `(command)/live` exists | **PRESENT as pages — not as a single living map** |
| 10-C3 speaker shown at the centre | Chat and voice surfaces name the speaker beside the message | **DIFFERENT** |
| 10-C4 risk officer with veto, drawn | **The approval gate is constitutional here** (`.claude/CLAUDE.md` §2), live as `approvals`, `approval_rules`, `hook_policies`, `hook_violations` — and ours is stronger, because ours refuses on principle, not on risk | **PRESENT and stronger; NOT DRAWN** |
| 10-C5 an agent stating its own limit | RULE #0-A — *measure, never guess*, `UNVERIFIED — could not measure because …` | **PRESENT as law; not spoken aloud to the CEO** |
| 10-C6 memory of the bad calls | `decision_log`, `memory_index`, `memory_embeddings`, `library_usage_log` | **PRESENT — the "especially the bad ones" framing is not** |
| 10-C7 master routes risk | Hamza is general manager; `packages/orchestrator/src` carries `critical-gate.ts`, `escalate.ts`, `council.ts`, `select-model.ts` | **PRESENT** |
| 10-C8 local voice | **Speaches container on this machine** (`dxb_speaches_local`, started this session, HTTP 200) + `dxb-jarvis.service` running | **PRESENT — ours is local by construction and €0** |
| 10-C9 wake, greet, count, offer | W2.6 proactive briefing: Hamza opens at 07:00 himself | **PRESENT** |

Measured this session:
```
find personas -name "*.md" | wc -l                     → 200
psql … select count(*) from public.agents              → 205
psql … select count(*) from public.employee_records    → 199
ls "apps/dashboard/src/app/(command)/org"              → companies departments directors employees hr page.tsx
curl -s -o /dev/null -w "%{http_code}" :8969/v1/models → 200   (dxb_speaches_local, local voice)
```

---

## 5. The build project

### 5.1 The finding, said plainly

**We have 199 employees and this man has nine — and his nine are more legible than our 199.**

That is the whole lesson, and it is uncomfortable in exactly the useful way. Every one of his agents
can be understood by a person who knows nothing about software, in one sentence, spoken in that
agent's own voice: *"I read the boring legal filings. All of them, even the footnotes."* Nobody
needs a manual. Nobody needs to open a file. **The company introduces itself.**

Ours cannot do that today. We have the depth — a written persona, a department, a director, a real
database row. What we do not have is **the one line**, and the surface that says it.

### 5.2 The three projects

**P1 — ONE LINE PER EMPLOYEE, IN THEIR OWN VOICE.** Every one of the 199 gets a single sentence,
first person, no jargon, that says what they actually do — the persona files are the source of
truth and already carry the material. **This is the cheapest high-value thing on the entire rival
queue so far**, it is pure text, it needs no design gate, and it makes 199 employees introducible to
the CEO for the first time. *Rests on: `personas/**/*.md`, which exist. Buildable now.*

**P2 — THE DESK SOUNDS OFF.** *"Teams sound off."* One command, and the company introduces itself —
department by department, one line each, the speaking employee lit on the org map. For a holding
whose measured V1 failure was **199 employees and a usage ledger at 0**, a surface where the CEO can
hear his own workforce identify itself is not decoration; it is the proof the workforce exists.
*Rests on P1. The visual half is design work and stops at his gate.*

**P3 — DRAW THE GATE.** Their strongest single frame is a hollow diamond on the wire between the
risk officer and the executor, and an agent saying *"Sentinel signs off, I execute. No cowboy
stuff."* **Our approval gate is constitutional and completely invisible.** It should be drawn on
whatever map we build: the wire from any employee to the outside world passes through the CEO, and
you can see it. *Design work — his gate.*

### 5.3 ⛔ WHAT IS NOT RECOMMENDED, AND WHY — read this part first

**This source is a TRADING DESK. Nothing in it is proposed as a business for DXB, and no part of
these three projects touches markets, trading, positions, or money.** What is taken is **the way
nine agents introduce themselves** — a presentation pattern — and nothing else.

Three separate reasons, all of them binding:

1. **The Islamic boundaries are constitutional and CEO-only.** Whether a market activity is
   permissible — and questions of interest, of excessive uncertainty, of what a company earns from —
   belongs to him and to no code and no author. This report does not open that question and does not
   answer it.
2. **His absolute line of 2026-08-07 is on the record and is wider than it looks:** *"bahislerle
   asla işimiz yok ÇOK BÜYÜK UYARI SAKIN HEEE UFACIK ŞEKİLDE YAPMAYIN!"* It was given about the
   clipping business; it is quoted here because a system whose agents are named `ORACLE — I whisper
   where the price goes next` is exactly the neighbourhood a session should not wander into on its
   own initiative.
3. **`STACK.md` and the revenue directive.** DXB's revenue path is already decided and is not this.

**And do not copy the personas themselves.** `Capitol`, `Oracle`, `Sentinel` are that man's
employees. Ours have names, departments and a written identity of their own, and the persona-quality
law forbids a copied identity outright.

---

## 6. Verdict

**Seventy-five seconds, one screen, nine sentences — and it is the best answer on this queue to the
question the CEO has never been able to get a straight answer to: *what exactly do my employees do?***

He owns 199 of them. He cannot hear a single one of them say what it is for. This man owns nine and
every one of them introduces itself in a sentence his mother would understand. **That gap is not
about scale, engineering or money. It is one line of text per employee, and we already have every
word we need to write it.** That is P1, it costs nothing, and it is the only thing on this queue so
far that could be finished tomorrow morning.

Everything else in this source — the trading, the markets, the whispering quant — **stays where it
is.** The presentation pattern is taken; the business is not, and the boundary question is his
alone.

**Row 10 is `reported`. P1 is proposed as immediate and needs only his word; P2 and P3 are design
work behind his gate. Nothing is built.**
