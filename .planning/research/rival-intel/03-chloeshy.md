# SOURCE 03 — Chloe Shy (`chloeshy.ai`): the build recipe for source 01

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


> The CEO listed this one without a note. It turns out to be **the most useful single video in
> the set**, because it is not another demo — it is the *teardown* of source 01. She replays
> his exact reel and names, with a logo card on screen for each one, every tool that produces
> each sentence he speaks.
>
> The chain closes here: **source 01 is the demo · source 03 is the recipe · source 16 is the
> open-source stack it ends at.** All three of the CEO's separately-supplied links are one
> story.

---

## 1. Source identity

| Field | Value |
|---|---|
| URL | https://www.instagram.com/reel/DbBPiy4vcz4/ |
| Uploader | `chloeshy.ai` — Chloe Shy |
| Kind | Instagram reel, vertical. Spoken English, **burned-in bilingual subtitles (English + Traditional Chinese)** |
| File | `media/03-DbBPiy4vcz4.mp4` (6,580,139 bytes) |
| **sha256** | `e5a1d0d66c218e143b52d1889b1cabfb1069c9655fb9fb5c1f1bae4b0b841bc1` |
| Duration | 74.0 s |
| Material studied | **84 frames** — 74 at 1 fps + 10 scene cuts — swept as 7 contact sheets (`scripts/rival-intel/sheets.sh 03`) |
| Transcript | `transcripts/03.json`, language `en` |
| Format | Split screen: her face below, source 01's reel or a tool card above |

---

## 2. Frame-by-frame record

| Time | Card / screen shown above | Said | Frame |
|---|---|---|---|
| 0:00 | Source 01's reel, playing, caption *"POV: Jarvis is building you a $30k MRR app"* and *"How's the app doing?"* | *"Hey Jarvis wake up daddy. So how's the app doing?"* — she is quoting his opening | t001–t004 |
| 0:04 | Her laptop; then the **Claude** wordmark on a white card | *"For the dashboard — you can design it in Claude, or just drop a reference image and it'll just build it out for you"* | t005–t009 |
| 0:09 | Her laptop showing the finished HUD (the same particle constellation) | *"…and it takes about **five to ten minutes** to create"* | t010–t012 |
| 0:12 | Source 01 again: *"Good evening, sir"* | — | t013–t014 |
| 0:13 | **An agent-harness architecture diagram** (see 2.1) | *"So for this voice — his Jarvis runs on an **agentic harness**. It's great, but it routes through a **hosted voice model**…"* | t015–t019 |
| 0:18 | the same diagram, held on screen | *"…so **every reply costs credits**. For a **free (open-sourced) model that turns text into speech**…"* | t019–t021 |
| 0:22 | **`Kokoro TTS`** — a card with a violet waveform | *"**this is what I'm using**"* | t022–t024 |
| 0:24 | Source 01: *"Pulling up our app stats now"* | — | t024–t026 |
| 0:26 | **A Chrome extension panel**, readable: *"Once connected, you can open the extension side panel in any tab and ask Claude to do things directly in your browser."* / *"**Claude for Chrome** — Claude can browse, click, and fill forms right in your Chrome tabs. [Install]"* | *"connect Claude to Chrome"* | t026–t028 |
| 0:28 | **`Playwright` + `Model Context Protocol`** logo card | *"**or install a Playwright MCP**… so the Claude can view your browser"* | t028–t031 |
| 0:31 | Source 01: *"Over the last seven days, we had 2,459 new downloads and generated $4,289 in…"* | — | t031–t035 |
| 0:35 | **`RevenueCat`** logo card **plus its architecture diagram** — `App → (POST /receipts) → RevenueCat backend → Third-party tools: Webhook server · Analytics tool · Marketing tool · Attribution tool`, and below, *"Subscription changes polled and pushed from App Stores"* → `App Stores: Apple, Google, Amazon, Stripe` | *"**RevenueCat MCP** to track revenue"* | t035–t037 |
| 0:37 | Source 01: *"You spent $475 at a 1.5 return on ad spend…"* | — | t037–t044 |
| 0:44 | Source 01: *"…while the slideshow continues to be the weakest performer"* | — | t044–t046 |
| 0:47 | **A Meta Ads performance dashboard**: header `Performance: Meta Ads`, source chip `(2) Instagram, Facebook`, range `Last 1 week…`; tiles `Spend 190,236.27`, `pRevenue 1,535,393.14`, `Clicks`, `Impressions` sparkline charts, plus `ROAS`, `CPC`, `CPM`, `CTR`, and a footer tab `Ad Type Split` | *"All right, so **add the Meta Ads MCP** — your agent reads **ad spend and ROAS per creative**."* | t047–t050 |
| 0:51 | her face | **"That's how Jarvis knows the slideshow is underperforming."** — the single most valuable sentence in the video: it explains that his *judgement* is not intelligence, it is **a connected data source with a per-creative breakdown** | t051–t053 |
| 0:54 | Source 01: *"My recommendation today: review the back-end PR, keep leaning into the street interview ad angle, and have Scout research the next set of organic content angles"* | — | t054–t063 |
| 0:64 | her face | *"Now if all that sounds like a lot — **here's the cheat code**…"* | t064–t066 |
| 0:66 | **The OpenJarvis GitHub page**: `open-jarvis / OpenJarvis · Public`, tabs `Code · Issues 26 · Pull requests 41 · Discussions · Actions · Projects · Security and quality · Insights`, sidebar **About: "Personal AI, On Personal Devices" · `openjarvis.stanford.edu` · Readme · Apache-2.0 license · Code of conduct · Contributing · Activity**, file rows `.github · assets · configs/openjarvis · deploy` | *"**Stanford just open sourced the entire concept and put it onto GitHub**"* | t066–t069 |
| 0:69 | A terminal running a build (`rm -rf bin/`, `release/PrimeFunction.o`, `g++ -Wall -c release/…`, `make clean`) | *"**One command in your terminal and you're good to go.**"* | t069–t071 |
| 0:71 | A **JARVIS** logo card, cyan on dark: **"Joint Agentic and Robotic Virtual Interaction System"** | — | t071–t072 |
| 0:72 | her face | *"So comment **'Jarvis'** and I'll send you the link"* | t072–t074 |

### 2.1 The agent-harness diagram, read box by box

Held on screen for six seconds, so it is meant to be read. Three columns:

```
OBSERVATION                AGENT HARNESS                     CONTEXT INPUT
  Live data monitoring  →  ┌──────────────┬──────────────┐ ←  Documents
  Logs                  →  │ Observation  │   Context    │ ←  Prompts
  Text                  →  │    Layer     │    Layer     │ ←  Database
                           ├──────────────┴──────────────┤ ←  External resources
                           │        AGENT MODEL          │
                           ├──────────────┬──────────────┤
                           │   Memory     │   Actions    │
                           │    Layer     │    Layer     │
                           └──────────────┴──────────────┘
                                     ↓         ↑
                              [ tools / keyboard ]
                                     ↓
                        SUPERVISOR FEEDBACK & ESCALATION
```

Two things in it are worth naming. **Observation is a separate layer from context** — live data
monitoring, logs and raw text arrive on their own path, not through the prompt. And the bottom
of the diagram is not the model: it is **supervisor feedback and escalation**, a human above
the loop. That is the same shape as DXB's approvals gate, drawn by someone else.

### 2.2 The complete named stack

| Layer | Tool she names | Why |
|---|---|---|
| UI | **Claude** (or a reference image dropped into it) | builds the HUD in 5–10 minutes |
| Voice out | **Kokoro TTS** — open-source, free | hosted voice models "cost credits per reply" |
| Browser | **Claude for Chrome** extension **or Playwright MCP** | so the agent can see and drive a browser |
| Revenue | **RevenueCat MCP** | downloads and revenue |
| Ads | **Meta Ads MCP** | spend and **ROAS per creative** |
| The whole thing | **OpenJarvis** (Stanford, Apache-2.0) | "the entire concept, open sourced" |

---

## 3. Capabilities

| ID | Capability | What the source proves |
|---|---|---|
| **CAP-03-A** | **The judgement in source 01 is a data source, not intelligence** | "That's how Jarvis knows the slideshow is underperforming" — because the Meta Ads MCP returns ROAS *per creative* |
| **CAP-03-B** | **Free, self-hosted TTS is the correct choice** | Kokoro TTS, chosen explicitly over hosted voice because "every reply costs credits" |
| **CAP-03-C** | **The browser is reachable two ways** | Claude for Chrome (extension, side panel, browse/click/fill) **or** Playwright MCP |
| **CAP-03-D** | **Revenue arrives through one aggregator, not per-store** | RevenueCat sits between the app and Apple/Google/Amazon/Stripe and fans out to analytics/marketing/attribution |
| **CAP-03-E** | **Observation is a separate layer from context** | the harness diagram: live monitoring/logs/text enter on their own path |
| **CAP-03-F** | **A supervisor sits below the loop with escalation** | the bottom box of the same diagram |
| **CAP-03-G** | **The HUD is cheap** | "5 to 10 minutes" from a reference image |
| **CAP-03-H** | **The whole stack is open source and one command** | OpenJarvis, Apache-2.0, Stanford |

---

## 4. What DXB has today

| ID | DXB status | Evidence taken today |
|---|---|---|
| **CAP-03-A** per-creative judgement | **NO** | No ad platform is connected. This is the same gap recorded on source 01 (CAP-01-D), now with the exact cause named: it is not a reasoning gap, it is a **missing connector**. |
| **CAP-03-B** free self-hosted TTS | **HAVE — and it is already law** | Speaches runs in our own container (`dxb_speaches_local`, up 4 days); V9 forbids audio leaving our hardware; measured TTS 1.7–3.6 s per answer at €0. We reached her conclusion before the video, from sovereignty rather than credits. |
| **CAP-03-C** browser reach | **HAVE** | Playwright MCP is already in the pinned corpus (R4.3, 69 tools / 5 servers, `playwright` among them). What is missing is that **Hamza does not use it in front of the CEO and does not narrate it** (see source 02, CAP-02-C). |
| **CAP-03-D** revenue aggregator | **NO** | `public.revenue_ledger`, `revenue_engines` and `revenue_scout_runs` exist as tables; no external revenue source feeds them. |
| **CAP-03-E** observation ≠ context | **PARTIAL** | The morning-briefing views read live tables directly rather than through a prompt (U37), which is the same instinct. There is no named observation layer. |
| **CAP-03-F** supervisor + escalation | **HAVE — and stronger** | The approvals gate is constitutional: every outward action (money, contracts, e-mail, ad spend) stops at the CEO. Hers is a box on a slide; ours is enforced in `packages/outbox-executor` with an allowlist. |
| **CAP-03-G** cheap HUD | **N/A** | DXB's surfaces are governed by RULE #0 and the design bank; "5 minutes from a reference image" is not a standard we would accept. |
| **CAP-03-H** one-command stack | **N/A** | We are the stack. |

---

## 5. The build project

This video converts three of source 01's vague capabilities into a shopping list with names.
The procurement decisions belong to the CEO, and they are stated as questions, not assumed.

| # | Project | What is built | Owning spec (adaptation — no new spec) | Closes when |
|---|---|---|---|---|
| **P03-1** | **Ads connector with per-creative ROAS** (CAP-03-A) | Read-only ingest of ad spend, revenue and **ROAS per creative** into a DXB table, so Hamza can say "X is winning, Y is your worst" with the row behind it. **CEO decision needed:** which ad account, if any, exists today. Nothing outward-facing — spend changes still pass the approvals gate. | `CAPABILITY_ARSENAL_DOCTRINE` (registered adaptation) + `INTEGRATION-TRACKER` row | One briefing sentence ranks two real creatives and cites the query. |
| **P03-2** | **Revenue connector through one aggregator** (CAP-03-D) | Land external revenue in `revenue_ledger` from a single aggregator rather than per-store, so `v_objective_progress.realized_revenue_eur` stops being 0 by construction. **CEO decision needed:** which revenue source is real today. | `REVENUE` spec + tracker row | An objective's `realized_revenue_eur` moves because of an external fact, and `net_unverified` is false. |
| **P03-3** | **Hamza uses the browser in front of the CEO** (CAP-03-C) | The Playwright MCP already in the corpus becomes a visible capability: the CEO asks for something on the web, Hamza does it, and the surface shows *which* tool is running while it runs. | `ORCHESTRATOR` spec + `CEO_COMMAND_CENTER_SPEC` | A live turn where the CEO asks for a web fact, sees the tool named, and gets the answer with its source. |
| **P03-4** | **Name the observation layer** (CAP-03-E) | Write the distinction into the orchestrator spec: live measurements enter Hamza's answer through queries, never through remembered prompt text. This is RULE #0-A expressed as architecture, and it is already how U37 works — it simply is not written down. | `ORCHESTRATOR` spec | The spec carries the rule and one test asserts a briefing number came from a query, not from context. |

**Deliberately not adopted:** Kokoro TTS. Speaches already gives us self-hosted, €0 speech with
Turkish, and swapping engines buys nothing today. Recorded as a *studied alternative*, not a gap
— if Turkish voice quality proves to be the blocker after Friday's workstation, Kokoro is the
first fallback to measure.

---

## 6. Verdict

**`daha iyisi` — and this video is the cheapest intelligence in the whole programme.**

She did the work of explaining a competitor's product for us, and what she reveals is
deflating in the best way: **the "Jarvis" the CEO admired is five connectors and a TTS engine
around a normal agent.** The HUD is 5–10 minutes of Claude. The voice is an open-source model.
The "judgement" about the slideshow is one API field.

Which means the distance between DXB and that demo is not intelligence and not architecture. It
is:

1. **connectors we have not built** (ads, revenue, mailbox),
2. **narration we have not written** (say the tool, say the state, say the recommendation),
3. **speed we have not fixed** (29–35 s against ~1.5 s).

Everything else in her recipe, DXB either already has in stronger form (self-hosted voice at
€0, browser MCP, a supervisor gate that is enforced rather than drawn) or deliberately rejects
(a HUD built in five minutes from a reference image).

One last thing worth telling the CEO plainly: her video ends the same way source 04 and source
02 do — *"comment 'Jarvis' and I'll send you the link"*. The link is `open-jarvis/OpenJarvis`.
**It is already cloned on this machine** (source 16, 146 MB, HEAD from this morning). There is
nothing to ask anyone for.
