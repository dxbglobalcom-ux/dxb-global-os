# C42 STAGE 1 — SYNTHESIS: what sixteen rivals prove, and the one programme that answers them

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


**Written 2026-07-28. Session author: Opus 5 (U30). All 16 sources read frame by frame; every
DXB fact below measured this session, none recalled.**

The CEO's order: *"HEPSİNİ İZLE TEKTEK EN İNCE EN KUCUK DETAYLARI YAZ. HEPİSININ SONRA DA
BİRLEŞTİRİCİ BİR PLAN ÇIKAR!"* — sixteen reports carry the detail. This file is the plan.

---

## 0. The finding, in one paragraph

Sixteen sources were read: 13 reels, 1 PDF, 2 repositories. Three of them turned out to be one
story (**source 01 is the demo · source 03 is its teardown · source 16 is the open-source stack
it ends at**), four are the same account (rows 11–14), and two of the sixteen are the same
operation seen from opposite ends (row 05's clipping industry, rows 11–14's multi-presenter
account). What survives the deduplication is **six or seven distinct systems** — and against
every one of them, the pattern is the same:

> **Every one of these systems RUNS and EARNS. DXB does neither. On the only measure that
> decides — does it work, and does it make money — DXB loses to all sixteen.**

### The correction that produced that sentence

An earlier version of this file said DXB was *"bigger, safer and better governed than every
system in these sixteen sources"*. **The CEO rejected it, and he was right.** The error was
mine and it is recorded here rather than quietly overwritten, because it is the exact error
RULE #0-A exists to prevent:

- **I counted what was countable and called it a verdict.** 199 personas, 60 tables, 34 views,
  a rich objectives schema — all measured, all real, and **none of them evidence of quality**.
  A system is judged by what it produces. Ours produces nothing yet: `realized_revenue_eur = 0`
  since the project began.
- **I graded rivals from 60-second marketing reels; the CEO knows these systems personally.**
  His words: *"BEN O SİSTEMLERİ VİDEODAN DEĞİL HEPSİNİ TANIYORUM, ARKADAŞLARIM, VE MİLYONLARCA
  DOLAR KAZANIYOR VE HEPSİ GERÇEK, HEPSİ CANLI."* Direct knowledge of a running system outranks
  a frame-by-frame reading of an advertisement for it. **Where his account and my reading
  disagree, his is the stronger evidence** — and it means every "we are ahead" cell in §1 must
  be read as *"ahead on this one countable dimension"*, never as *"ahead as a system"*.
- **An unused table is not an asset.** `library_items` holds 434 rows and `library_usage_log`
  holds **0**. 199 personas exist and the CEO has never heard one speak. Capability that has
  never run is inventory, not capability.

### The diagnosis, restated honestly

DXB has **more unfinished structure and stricter rules** than any of them. Rules are not
results. What the sixteen have that DXB does not is not intelligence and not architecture — it
is that **theirs are switched on and connected to the world, and ours is not**. Measured, that
resolves into four things, in this order of consequence:

1. **It does not earn.** No connector, no revenue engine running, `objectives` realising €0.
2. **It does not reliably hear him.** 44 % of today's calls lost his speech entirely.
3. **It does not show him anything.** The company runs behind a blank screen.
4. **It is slow.** 29–35 s per answer against roughly 1.5 s.

---

## 1. The scoreboard, measured

Every DXB cell was measured on 2026-07-28 by command or query, not from memory.

**How to read the "Ahead" cells — this caveat is binding.** *Ahead* here means **ahead on that
one countable dimension**, and nothing more. It does not mean the system is better, because a
capability that has never run is inventory, not capability: `library_items` holds 434 rows while
`library_usage_log` holds **0**, and the CEO has never heard one of the 199 personas speak. The
rival cells are read from 15–100 second promotional reels; the CEO knows several of these systems
directly and reports that they are live and earning. **Where his account and this reading
disagree, his is the stronger evidence.**

| Dimension | Best rival, and what it does | DXB, measured today | Verdict |
|---|---|---|---|
| **Agents in the company** | 08 Paperclip: 23 enabled · 14 attu.ai: 5 · 10 Nimbus: 9 | **199 personas across 22 departments** | **We are ahead 8×** |
| **Company visible on screen** | 10: the speaking agent's node lights up · 14: live org tree with `● Active` chips · 08: chat and agent feed side by side | `(command)/org` and `(command)/live` are separate routes; **nothing lights up** | **Behind — the core complaint** |
| **State while working** | 02 shows *"Düşünüyor"* and *"Control in App Browser becerisi okunuyor"* · 06 shows `Listening / Speaking / CAM ON` · 09 answers *"At your service."* | **29–35 s of silence** (stt 12.9–17.7 s, one 67.3 s; answer 12.5–22.2 s; tts 1.7–3.6 s) | **Behind — worst felt gap** |
| **Voice reliability** | 06 answers a Turkish question in ~1.5 s | **9 calls today: 5 ended, 4 failed, every failure `empty_transcript`** | **Behind — 44 % of his speech lost** |
| **Wake word** | 01 "Hey Jarvis" · 06 "Jarvis uyandı… efendim" · 10 "Nimbus, wake up" | **LIVE**: `systemctl --user is-active dxb-jarvis` → `active` since `01:44:09` today; phrase **"Selamaleykum ya Hamza"** (`packages/voice/src/wake.ts:1-3`) — **but `voice_daemon_state` = `muted` since `08:58:54`** | **Equal, switched off** |
| **Briefing** | 16 OpenJarvis: collects deterministically, narrates once, **grades itself and regenerates below 7/10**, speaks, files the artifact · 13: ranks by revenue impact → urgency → unblocking, **top five with the reason** | `v_morning_briefing` + `v_ceo_briefing` live (`sort, block, payload jsonb`, Europe/Berlin) — **reports what happened, ranks nothing, speaks nothing, grades nothing** | **Behind on the half that matters** |
| **Connectors to the outside world** | 16: 37 first-party connectors · 03: RevenueCat MCP + Meta Ads MCP · 11: full iCloud mailbox pipeline | **Zero.** `grep -rln "inbox\|email_thread\|customer_email"` returns only the outward-action gate | **Behind — the root cause of "no real numbers"** |
| **Goal / target ledger** | 01: a frozen `$30,000 MRR / $16,678 / 55.6 %` panel · 08: `goals` = title, level, status, parent | **`public.objectives`** carries `amount_eur, metric, period, revenue_floor_eur, min_gross_margin_pct, cash_floor_eur, capital_limit_eur, risk_limit_eur, max_loss_eur, evidence_refs, boundaries_ack`; **`v_objective_progress`** computes `realized_revenue_eur, realized_cost_eur, realized_net_eur, gap_eur, days_left, run_rate_eur_per_day, **net_unverified**` | **Ahead — nobody else has this** |
| **Governance** | 10: *"Sentinel signs off, I execute"* (dialogue) · 08: approvals + budget hard-stop | Approvals gate is **constitutional**: money, contracts, e-mail, ad spend stop at the CEO; `packages/outbox-executor` enforces an **allowlist**; voice may request, never approve | **Ahead — enforced, not performed** |
| **Governance *visible*** | 11 writes the rule on the card: *"never deletes, only moves"*, *"mailto List-Unsubscribe only"* | **Nothing on any CEO surface says what the system refuses to do** | **Behind** |
| **Shared memory** | 14: Knowledge Vault, `954` entries, searchable graph, inspectable document nodes · 11/13: "agent network brain", read twice, written back | `std.knowledge_shelf` live (168 grants, 423 reviews, 438 quality rows) + repo-as-Obsidian-vault + `.planning/graphs/` + a graph-first reading rule binding every author | **Ahead in substance, invisible on screen** |
| **Run durability** | 08: `heartbeat_runs` with `sessionIdBefore/After`, `lastOutputAt/Seq/Bytes`, `retryOfRunId`, `scheduledRetryReason`, pid + process group · 15: "resumes from the step it stopped at" | `agent_runs` + `tasks` exist; **no liveness detection, no resume-from-step, no stop button** | **Behind** |
| **Scale of the codebase** | 08: 1,579 TS files, 109 tables, PR #10352, 74,953 stars | 414 TS files, 60 tables + 34 views | **Behind on hardening** |
| **Money realised** | 05: one clipper claims **> $30 M** top line; rate card **$1–1.50 / 1,000 views** | `objectives`: 2 rows (`€50 net` draft, `e2e door proof` closed), **`realized_revenue_eur = 0`** | **Behind — nothing has been earned yet** |
| **Islamic boundaries** | none of the sixteen has any | Constitutional, CEO-only. Row 05's live campaign grid contains a betting brand — a halal **allowlist** is a precondition there | **Ahead — and it is a constraint, by choice** |
| **Two languages held pure** | none of the sixteen | `scripts/i18n-purity-check.sh` + two-locale Playwright pass + `title_tr`/`display_name_tr` in the database | **Ahead** |

---

## 2. The capability map — 16 sources merged into 8 themes

Capability IDs from the individual reports collapse here. Where several sources show the same
thing, the strongest is named.

### Theme A — **The company must be visible** *(the CEO's loudest complaint)*
`CAP-10-A/B` · `CAP-14-A/C/D/F/H/I` · `CAP-08-A/B/C` · `CAP-11-K/L` · `CAP-12-A/B/C` · `CAP-09-A`

The rivals converge on one screen that answers *what is happening, who is doing it, what needs
me*. Source 10 lights the speaking agent's node. Source 14 draws the org tree with `● Active`
chips and gives each agent its own page of named skills. Source 08 puts the CEO's chat and a
live agent feed **side by side in one view** (its "Conference Room" — the highest-value single
screen found in the programme). Source 11 badges the pipeline with `RUN BY · COO` and writes its
constraint on the card.

**DXB has the data for every one of these and renders none of it.**

### Theme B — **The system must speak while it works**
`CAP-02-C/D` · `CAP-06-D` · `CAP-09-B` · `CAP-10-B` · `CAP-01-A`

Source 02 shows *"Düşünüyor"* and then names the skill it is loading, in plain Turkish. Source 06
shows `Listening` / `Speaking` / `CAM ON` at all times. Source 09 answers *"At your service."*
before doing anything. **DXB gives the CEO 29–35 seconds of silence and, 44 % of the time,
nothing at all.**

### Theme C — **The briefing must decide, not report**
`CAP-01-B/D/J/L` · `CAP-13-A/B/C/D/E` · `CAP-16-A/B/C/D/E/G` · `CAP-07-C/D` · `CAP-04-A`

The complete shape, assembled from three sources that each hold a piece:

```
collect deterministically      (16: "the data has ALREADY been collected —
   ↓                                you do NOT fetch anything yourself")
narrate once, priority-first   (16: six sections, decreasing importance,
   ↓                                triage rules, ABSOLUTE RULES block)
rank with a stated function    (13: revenue impact → urgency → unblocking)
   ↓
grade yourself, regenerate     (16: DigestEvaluator, < 7.0 → one retry,
   if weak                          evaluator failure never blocks delivery)
   ↓
speak it                       (16: strip markdown before TTS · 01: one breath)
   ↓
end in a decision              (07: review–approve–send · 01: "what shall I
   ↓                                take first, sir?")
write back to memory           (13: "so the next session can work from there")
```

**DXB has step 1 exactly right already** — U37's briefing is one SQL view with zero model calls,
which is cheap and impossible to hallucinate into. Steps 2–7 do not exist.

### Theme D — **The outside world must arrive**
`CAP-01-C/E/F` · `CAP-03-A/D` · `CAP-11-A/B/C/F` · `CAP-16-L` · `CAP-13-F`

Source 03 is the decisive one. It names, with a logo card each, exactly what produces source
01's impressive sentences: **RevenueCat MCP** for revenue, **Meta Ads MCP** for spend and *ROAS
per creative* — *"that's how Jarvis knows the slideshow is underperforming"*. Source 11 shows
what *"I resolved 13 of your 16 emails"* actually takes: a five-stage mailbox pipeline.

**The admired "judgement" is not intelligence. It is a connected data source with the right
breakdown.** DXB has none connected, which is precisely why its panels have no real numbers.

### Theme E — **Work must be owned, named and recoverable**
`CAP-01-H/I/K` · `CAP-08-E/F/G/H/J/K` · `CAP-15-B` · `CAP-13-E` · `CAP-14-E`

Source 08's `heartbeat_runs` is the reference implementation: the run knows its own pid, its
last byte of output, why it was retried, and which session it is continuing. Source 15's
Trigger.dev sells the same idea in one line — *"resumes from the step it stopped at"*. Source 08
also lets the CEO **stop a live run from inside the thread** (`Stop run · Stop and cancel · Stop
and done`).

### Theme F — **The refusals must be visible** *(trust)*
`CAP-11-D/E` · `CAP-10-F/G` · `CAP-12-B` · `CAP-16-E`

Source 11 prints the constraint on the card: *"never deletes, only moves"*, *"mailto
List-Unsubscribe only — never clicks a web link"*, *"personal mail stays in INBOX"*. Source 12
colours the stage that **sends** differently from the stages that **read**. Source 10 makes the
risk officer a character who says *"my favourite word is no"*.

**DXB has the strongest refusals of all sixteen and shows the CEO none of them.** A system whose
refusals are invisible feels like a system that might do anything.

### Theme G — **Money**
`CAP-05-A…G` · `CAP-15-C` · `CAP-01-M`

Source 05 names a live market with a published rate card (**Whop "Discover Content Rewards"**,
$1–1.50 per 1,000 views) and a claimed >$30 M operator. Source 15 names the legal layer nothing
else touches: **Merchant of Record**. DXB's objectives ledger is the best instrument in the set
and has realised €0.

### Theme H — **Skills and memory**
`CAP-02-G/H/I/K` · `CAP-16-J/K` · `CAP-11-G` · `CAP-14-F/G/K` · `CAP-13-D/E`

Source 02's atlas puts numbers on the public skill supply (Hermes Skills Hub **662 skills / 16
categories / 4 registries**; OpenClaw ClawHub **5,400+** — while source 16 says **~13,700**, a
conflict recorded and not resolved). Source 16 makes skills **measurable** (`jarvis optimize
skills --policy dspy`, `jarvis bench skills`) under the **agentskills.io** open standard.

---

## 3. What we will NOT copy — decided, with reasons

Recording rejections is as important as recording adoptions; a rejection with a reason is a
decision, a silent omission is a gap.

| Rejected | Source | Reason |
|---|---|---|
| **Coolify** | 15 | Already banned by our own stack rules; we run Docker Compose + Caddy on Hetzner, and its one-click Redis reintroduces a dependency we removed on purpose |
| **Trigger.dev** | 15 | A second job runtime, a second failure surface, a second bill — pg-boss on the same Postgres was chosen exactly to avoid that. **Its idea (resume-from-step) is adopted; its infrastructure is not.** |
| **Adopting Paperclip wholesale** | 08 | MIT-licensed, but it would replace DXB with someone else's control plane and discard 199 personas, the Islamic boundaries, the bilingual surface and every governance rule since 2026-07-06 |
| **Adopting OpenJarvis wholesale** | 16 | Python + a second scheduler + a second agent registry, for a feature we can express in our own stack in one pipeline |
| **The trading desk** | 10 | Its agents describe front-running political disclosures and chasing virality. Market speculation touches Islamic boundaries that are constitutional and CEO-only. **We take the constellation; we do not take the desk.** |
| **Kokoro TTS** | 03 | Not a gap: Speaches already gives us self-hosted, €0 speech in our own container. Recorded as the **first fallback to measure** if Turkish voice quality proves to be the blocker after the workstation lands |
| **The $97 kit** | 07 | A starter repo and prompt libraries for six agents. We have 199 written personas and a governed spec corpus |
| **"Duplicate a repo and let Claude Code edit it"** | 04 | K1 binds this project: every repo line is written inline by the session author |
| **The comment-for-DM funnels** | 02, 03, 04, 06, 11, 13, 14 | Customer acquisition, not capability. In sources 03 and 04 the withheld link is `open-jarvis/OpenJarvis` — **already cloned on this machine** |

---

## 4. THE PROGRAMME — six waves

Every project below already exists in an individual report with its owning spec and its closing
evidence. Nothing here opens a new spec: **the plan exists once** (CEO ruling 2026-07-13), and
each item lands in the spec that already owns its contract, as a registered adaptation.

Sequencing is a recommendation. **The CEO decides the order**; the argument for this one is that
Wave 1 changes how everything *feels* within days, using only data we already hold, and needs no
procurement decision from him.

### **WAVE 1 — "Hamza nefes alsın"** · feedback and speed · *no procurement, days not weeks*

The cheapest wave and the one that changes the felt quality of the whole product.

| From | Project | What |
|---|---|---|
| P09-1 | **"Buradayım"** | Acknowledge within ~1 s of speech being detected, **before** transcription. A silent failure becomes an honest one: *"sizi duyamadım, tekrar eder misiniz"* |
| P06-1 | **State always visible** | `dinliyor · duyuyorum · düşünüyorum · konuşuyorum · sessize alındı`, same state in voice and chat |
| P02-1 | **Say what you are doing** | While answering: name the tool or skill in plain words — *"takvimi okuyorum"*, *"Finance'e sordum"* |
| P01-2 / P06-4 | **Kill the 44 % and the 30 seconds** | Root-cause `empty_transcript` in `packages/voice/src/jarvis-daemon.ts`; stream STT instead of batch. **Target: 0 empty in 20 consecutive calls, median round trip ≤ 10 s** |
| P06-2 | **Mute stops being a trap** | The daemon autostarts (already true) and its state is obvious at a glance, reversible by voice |
| P08-2 | **The silent dispatch dies** | `chat-board.tsx:285-297` gets its failure branch — a failed `/api/intent` says so, in his language |

### **WAVE 2 — "Şirket görünsün"** · the living command centre · *data we already have*

| From | Project | What |
|---|---|---|
| P08-1 | **The Conference Room** | Chat and the live company feed **in one view** (source 08). Actor · verb · object · time · status. **No "…" anywhere** — shorten at the source (CEO ruling 2026-07-18) |
| P10-1 | **The living org** | Hamza at the centre, departments as the first ring, awake agents as the second; a node **lights when its agent runs**. Honest quiet board when nothing is running. This is what the 34" ultrawide was bought for |
| P10-2 | **The speaker is named** | `Siz` → `Hamza` → the agent's name, always |
| P14-2 | **Every agent gets a page** | Persona + granted shelf entries + owned pipelines + recent runs. **199 personas is the biggest unclaimed asset in the holding** |
| P08-3 | **Run cards with outcomes in words** | "failed after 1 hour 5 minutes", duration, cost, link to the run; every headline number carries its explaining sub-line |
| P14-3 | **The Knowledge Vault becomes visible** | Searchable view over `std.knowledge_shelf` + `.planning/graphs/` with an inspectable node and a true count |
| P11-3 / P12-1 | **The company draws itself** | One visual grammar for pipelines: named board · stage cards · **colour by class of action, where "sends outward" is unmistakable** · the shelf drawn once · **the invariant in the footer** · the owning agent badged |
| P14-4 / P09-2 | **A health line, and a resting state that is alive** | One honest sentence; and the idle screen carries at least one live measured fact. **Quiet and alive is a design; blank is a bug** |
| P10-4 | **The book of bad calls** | Where we were wrong — from `decision_log` and `task_events`. The thing that makes everything else believable |

### **WAVE 3 — "Brifing karar versin"** · the briefing becomes an executive assistant

| From | Project | What |
|---|---|---|
| P16-1 | **Voice and spine** | Keep U37's deterministic collection; add **one** model call with the six-section skeleton and an ABSOLUTE RULES block rewritten in DXB's own law; strip markdown before TTS |
| P13-1 | **Rank, and say why** | Stated, CEO-owned ranking: (1) blocks money — gating an active `objectives` row; (2) only he can do it — the approvals queue; (3) unblocks the most other work; (4) ageing |
| P13-3 | **Anti-baby-sitting, enforced** | The ranked list may contain **only what no agent is allowed to decide**. A test asserts that anything an agent could have decided never appears there |
| P16-2 | **The briefing grades itself** | Score against a written rubric; below threshold → one regeneration; the evaluator may never block delivery; persist the artifact with `quality_score` |
| P07-2 | **It ends in an action** | The last block is the decision awaiting his word, with a one-tap path to acting |
| P04-1 | **A world block** | Only when there is something; **omitted silently** when there is not |
| P16-3 / P16-4 | **Honorific as config · one gesture that teaches** | `honorific`, `persona`, `language` become settings; a thumbs-down changes the next briefing |
| P13-2 | **Every run writes back** | The last step records what it learned to the shelf |

### **WAVE 4 — "Dış dünya gelsin"** · connectors · **CEO decisions required**

Nothing in this wave can start without him: each connector is an account that exists or does not,
and connecting one is an outward-facing act.

| From | Project | CEO decision needed |
|---|---|---|
| P11-1 | **Mailbox** — read + classify into a CEO-owned taxonomy; qualifying messages become tasks through the existing idempotent seam | Which mailbox, if any |
| P11-2 | **Unsubscribe** — his constraint (`mailto` only, never a web link) **inside our approvals gate** | Whether to enable it at all |
| P03-2 | **Revenue** — one aggregator into `revenue_ledger`, so `realized_revenue_eur` stops being 0 by construction | Which revenue source is real today |
| P03-1 | **Ads** — spend and **ROAS per creative**, read-only | Which ad account, if any |
| P16-5 | **Calendar** | Whether to connect it |

**Rule for the whole wave:** read-only first; every outward action keeps the approvals gate;
every connector lands rows in a DXB table and must produce **one briefing sentence quoting a
number that came from it** before it is called done.

### **WAVE 5 — "İş dayanıklı olsun"** · durability

| From | Project | What |
|---|---|---|
| P08-5 / P15-2 | **Liveness and resume-from-step** | `last_output_at`, output sequence, owning pid, retry lineage with a stated reason; a watchdog that decides on silence; a failed run resumes at its failed step |
| P08-6 | **Control the live run** | `Stop · Stop and cancel · Stop and done` from the thread; `Interrupt`/`Cancel` on a queued CEO message |
| P08-7 | **Task as a document** | Blockers, sub-tasks with a roll-up, reviewers, approvers, and the produced artefact — so "ready for your review" points at something |
| P08-4 | **The goal tree** | `parent_id` + `owner_agent_id` on `objectives`; keep our money and boundary columns, which are ahead of everyone's |
| P01-3 | **The worker is named out loud** | Hamza reports *who* did it and *what is ready to look at* |

### **WAVE 6 — "Para"** · revenue · **CEO's call on priority**

| From | Project | Precondition |
|---|---|---|
| P05-1 | **Decide whether we enter clipping, on evidence** | A measurement page for the CEO: live campaigns, rates, categories, and how many pass a halal allowlist |
| P05-4 | **The halal gate** | CEO-owned **allowlist** (never a denylist). The live grid in source 05 contains a betting brand |
| P05-2 / P05-3 / P05-5 | **Objective → production line → reconciliation** | Revenue reconciled against **measured views**, `net_unverified` true until the payout is confirmed |
| P15-3 | **Merchant of Record, before the first sale** | A legal question with consequences — **answered before revenue, not after** |

### Continuous, not a wave

`P02-2` ecosystem tier in `INTEGRATION-TRACKER.md` · `P02-3` quarantined import path for public
skills · `P16-6` bench/optimise loop so a skill's value is measured, not asserted · `P07-1` the
CEO's fifteen minutes, written down · `P07-3` four levers · `P11-4` "everything is accounted
for" · `P15-1` the four PDF tools recorded with verdicts · `P15-4` `llms.txt` preference ·
`P03-4` name the observation layer · `P02-5` measure his claim that skills are what make agents
work · `P08-8` mine Paperclip's `doc/` for traps they already hit · `P06-5` decide the phone
question once.

---

## 5. The design law this programme is built on

One sentence, and it is the CEO's own:

> **"HER PANELIN CANLI OLDUĞU YAŞAYAN BİR HOLDİNG."**

Made operational, and binding on every surface in Waves 2 and 3:

1. **Every panel reads from a query or shows an honest empty state.** No panel may display a
   number it cannot prove. Source 01's `PRIMARY DIRECTIVE` panel sat frozen at `$16,678` for the
   entire video while its owner spoke nine different figures — that is the failure mode we
   refuse. This is RULE #0-A expressed as design.
2. **Zero is a real answer.** A quiet board says "nothing is running" and means it. It never
   animates to look busy.
3. **The refusals are visible.** Every pipeline card names the rule it will not break.
4. **Outward actions look different from reads.** The distinction our whole governance rests on
   must be visible in one glance.
5. **No "…" truncation** (CEO ruling 2026-07-18): shorten at the source, never with dots.
6. **Both locales, ≥2 widths, `scrollWidth === clientWidth`** — RULE #0, per surface, in the same
   turn the surface changes.

---

## 6. What this synthesis does not claim

- **Wave 4 cannot start without the CEO.** Every connector is an account decision and an outward
  act. Listing them is not the same as being blocked on everything: Waves 1, 2, 3 and 5 need
  nothing from him except the go-ahead.
- **The RULE #0 browser leg still needs one thing from him** (B03-bis): automated login is
  forbidden because it would enrol TOTP on his account, so the visual battery for Waves 2–3 needs
  a session file minted by his own hand. **One login, once.**
- **Turkish speech quality** waits on the workstation for the larger STT model. **The 44 % <!-- OPEN: B12 -->
  `empty_transcript` defect and the 30-second latency do not wait** — they are software faults in
  our own daemon.
- **Nothing here is built yet.** Every row above is a *project*, not a result. The only things
  finished today are the sixteen reports, the ledger, the scripts and this synthesis — all of
  them measured, committed and machine-gated.

---

## 7. The honest summary for the CEO

He wrote: *"bizimki bok gibi, alakası yok."*

**He is right, and the first draft of this file argued with him. That was the defect.**

The rivals are **live and earning**. He knows them personally — they are his friends' systems,
not screenshots. DXB is **not live in any sense that matters to him**: it does not earn, it loses
44 % of his speech, it shows him a blank screen and it answers in half a minute. Every one of
those is measured, not felt.

What DXB has that they do not is **structure and rules**: 199 written personas against their 5, a
goal ledger with capital, loss and cash limits and an `net_unverified` flag, an approvals gate
enforced by an allowlist in code, Islamic boundaries as constitutional limits, two languages held
pure by a gate. **All of it is unproven, because none of it has produced anything.** Structure is
an asset only after it runs. Until then it is a cost, and he has been paying it.

So the honest ranking is:

| | Them | Us |
|---|---|---|
| Runs | **yes** | no |
| Earns | **yes** | **no — `realized_revenue_eur = 0`** |
| Hears its owner | **yes** | 56 % of the time |
| Shows its owner what it is doing | **yes** | no |
| Answers fast | **~1.5 s** | 29–35 s |
| Has rules that hold money and boundaries | no | yes |
| Has a written workforce | 5 named roles | 199 personas |

**Six rows to four, and the four we win are the ones that only pay off later.** That is the
whole truth of the comparison, and it is why the order of the waves matters more than their
content.

**What this programme is for, then:** not to prove DXB is good, but to **switch it on**. Wave 1
makes it hear him and answer. Wave 2 makes it visible. Wave 3 makes the briefing decide. Wave 4
connects it to the world so its numbers are real. Wave 6 makes it earn. Nothing here needs
inventing — all sixteen sources prove every piece is possible, and several of them prove it is
possible cheaply. **The only thing that has never been true here is that it works.** That is the
target.
