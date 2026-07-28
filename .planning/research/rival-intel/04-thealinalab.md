# SOURCE 04 — The Alina Lab (`thealinalab`): "HOW TO BUILD UR OWN JARVIS AI ASSISTANT"

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


> Listed by the CEO without a note. Read in full anyway, because the order was to read
> everything and because a source that turns out to be empty is itself a finding — it tells
> us what the market noise looks like, and it lets the CEO stop spending attention on this
> shape of video.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DYG-_i9PPCM/ |
| Uploader | `thealinalab` |
| Kind | Instagram reel, vertical, spoken English |
| File | `media/04-DYG-_i9PPCM.mp4` (5,718,320 bytes) |
| **sha256** | `91f19ae9e1a1042a3206a14f8898332227d257bfee00f58a841a55afc0fa7419` |
| Duration | **32.1 s** — the shortest source in the set |
| Material studied | **35 frames** — 32 at 1 fps + 3 scene cuts — swept as 3 contact sheets |
| Transcript | `transcripts/04.json`, language `en` |
| Hard caption, whole video | **"HOW TO BUILD UR OWN JARVIS AI ASSISTANT"** in yellow |

---

## 2. Frame-by-frame record

| Time | On screen | Said | Frame |
|---|---|---|---|
| 0:00 | Creator to camera in a flat; inset clip of a news broadcast | *"It looks like tensions are high with Iran, boss, following recent US–Israeli strikes, and a deadline from the president to reopen the strait…"* — she is **performing a spoken briefing**, in character, as the hook | t001–t007 |
| 0:08 | Inset switches to **Iron Man film footage** — Tony Stark in the holographic workshop, four different shots | *"Everyone is building their own Jarvis, so here's how to build one to improve your productivity"* | t008–t011 |
| 0:11 | more Iron Man footage | *"…and also feel like Tony Stark"* (caption: *"(and also feel like Tony Stark) 😅"*) | t011–t013 |
| 0:13 | Inset switches to a laptop showing a dark code editor, then an office with people | *"This is really perfect to help with the **AI B2B / SaaS isolation** that we currently have"* — the phrase is unclear in both audio and caption; recorded as spoken, not interpreted | t013–t019 |
| 0:19 | same | *"You're gonna feel like Tony Stark"* | t019–t020 |
| 0:20 | Creator to camera, pointing | *"Okay, so I did some digging and **I found the exact GitHub repository that you just need to duplicate**, and then put it into Claude Code, and then tell it to edit it."* | t020–t025 |
| 0:26 | same | *"**That's it, guys. That's it.** Thank me later, goodbye, and follow me for more."* | t026–t030 |
| 0:30 | Caption changes to **"COMMENT 'JARVIS' FOR THE LINK IN DMS"** | *"okay"* | t031–t032 |

**That is the entire video.** There is no repository name, no tool name, no screenshot of a
terminal, no configuration, no architecture. The only concrete instruction is *"duplicate the
repo, put it into Claude Code, tell it to edit it"*, and the repository is withheld behind a
comment-for-DM funnel.

---

## 3. Capabilities

| ID | Capability | What the source proves |
|---|---|---|
| **CAP-04-A** | **A briefing that opens with world context, addressed to "boss"** | The hook is a spoken news briefing — *"It looks like tensions are high with Iran, **boss**"* — delivered as if by the assistant. It is a performance, but the *shape* is real and matches source 16's `world` digest section (weather + top news). |
| **CAP-04-B** | **"Duplicate a repo into Claude Code and tell it to edit it"** | Offered as the whole method. Verifiable as a claim about how such systems are actually assembled by non-engineers. |
| — | **Nothing else.** No tool, no repo, no config, no screen of the system running. | |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-04-A** world context in the briefing | **NO — and it is a genuine, small gap** | `public.v_morning_briefing` reads `task_events` and `tasks` only: it is entirely inward-looking. Source 16's shipped digest carries a `world` section (`weather`, `hackernews`, `news_rss`) and skips it when there is no data. A CEO briefing that never mentions the outside world is narrower than both rivals. |
| **CAP-04-B** repo-duplication method | **N/A — and forbidden here** | K1 binds this project: every line in the repo is written inline by the session author. "Duplicate someone's repo and let an agent edit it" is the opposite of how DXB is built, deliberately. |

---

## 5. The build project

One project, and it is small. Recording it rather than inflating the source.

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P04-1** | **A world block in the briefing** (CAP-04-A) | An optional final block in `v_ceo_briefing` — currency/market moves that touch the holding, and anything in the news that touches a live objective or a named market. **Rules it must obey:** skipped entirely when there is no data (never an empty heading), every item traceable to its source, and no commentary the data does not support. Cost stays near zero: a read of an existing feed, not a research run. | `CEO_COMMAND_CENTER_SPEC` + the U37 briefing adaptation | The briefing carries a world line when there is one and **omits the block silently** when there is not, in both locales. |

**Not built:** anything else, because **this 32-second clip does not show anything else**. That is a
statement about the clip, not about its author or whatever they may have built.

---

## 6. Verdict

**`reddedildi` — this RECORDING carries no capability to copy, and one small idea worth keeping.**
Nothing here is a judgement of the person or of any system they may run; 32 seconds of Iron Man
footage is simply not evidence either way.

- **Rejected.** Thirty-two seconds of Iron Man footage and a promise. The repository is never
  named. The instruction "duplicate it and tell Claude Code to edit it" is not a method.
- **Kept:** the *shape* of the opening — an assistant that leads with what is happening in the
  world, addressed to its principal. Source 16 ships that as the `world` digest section; DXB's
  briefing has no equivalent. Recorded as **P04-1**, deliberately small.
- **The pattern worth naming for the CEO.** This is the third source in a row that ends with
  *"comment 'Jarvis' and I'll DM you the link"* (source 02 → WhatsApp/Skool/PDF, source 03 →
  same phrase, source 04 → same phrase). In sources 03 and 04 the withheld link is the same
  thing: `open-jarvis/OpenJarvis`. **It is already on this machine**, cloned this morning,
  Apache-2.0, 146 MB — see source 16. Nobody needs to be messaged for it.

There is no shame in a source being thin, and there would have been shame in pretending
otherwise. Read in full, recorded in full, worth one small project.
