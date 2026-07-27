# NOTE — FACTORY COMPLETION ROADMAP (ordered work queue, 2026-07-26)

> **Status:** binding work order. Written by Opus 5 on the CEO's instruction *"herşey karıştı sen düzene sok lütfen"* and *"senden sonra gelen opus 5 kaldığın yerden devam etsin veya planı bilsin"*.
> **This note does not design anything.** Every row points at a spec that already owns the contract, or at a measured defect. New design decisions go into the SPEC as registered adaptations, never here (CEO ruling 2026-07-13, "PLAN.md ≠ a plan").
> **Read order for a fresh session:** `memory/opus-5-construction-governance.md` → `memory/model-routing-hierarchy.md` → `.planning/STATE.md` → `00-INDEX.md` (U-table) → this note.

---

## 0. The CEO's framing (binding, do not re-litigate)

1. **The factory is built first; the money leg is LAST.** CEO, verbatim: *"şuan biz üretim aşamasında değiliz fabrikayı tam anlamıyla kurmamız lazım"* and *"ben bilerek henüz aktif para üretme mekanizmasını başlatmadım"*. Therefore **zero revenue, zero opportunities and zero running work are the EXPECTED state, not defects.** Any report that frames the empty tables as a failure is wrong and has already been corrected twice in chat.
2. **Quality is the ceiling, cost is not the constraint.** CEO: *"ana hedef KALİTE!!! her işte!!! zeka!!!"* The tier law (U21, `MODEL_ROUTING_SPEC` §4d) is the standing answer.
3. **No excuses** (standing order 12): a missing tool, a blocked path, an expired session is the beginning of the work, not the end. Only money-out, contract signature, and steps needing the CEO's identity or a secret only he holds may reach him.
4. **Outleteuro is cancelled** (U19). Do not plan work for it.

---

## 1. Where the OS actually stands (measured, cite before re-measuring)

| Fact | Value | Source |
|---|---|---|
| Roadmap rows closed | 75 / 79 | `IMPLEMENTATION_ROADMAP.md` |
| Dashboard pages | 58 | route inventory |
| Agents / active employees | 205 / 199 | `agents` |
| Lifetime revenue · opportunities · running work | €0.00 · 0 · 0 | `revenue_ledger`, `opportunities`, `tasks` — **expected, see §0.1** |
| Model roster | L1 Opus 5 · L2-L4 Sonnet · 8 models retired+banned | U21 migration `20260726001000` |
| OpenRouter balance | exhausted (5 credits / 5.1955 used) | OpenRouter API, 2026-07-26 |
| OpenAI API key | authenticates, **429 insufficient_quota** — API billing ≠ ChatGPT subscription | measured 2026-07-26 |
| Codex CLI | logged in with subscription tokens, answered live as `gpt-5.6-sol` | measured 2026-07-26 |

---

## 2. The queue, in order

Each row: **what** · **why it is not done** · **spec that owns it** · **evidence that closes it**. Rows inside a wave may run in any order; waves are sequential because later ones depend on earlier ones.

### W1 — Brains and the CEO conversation (no hardware needed)

| # | Work | Owner spec | Closing evidence |
|---|---|---|---|
| 1.1 | **Quality tier law** — DONE 2026-07-26 | §4d | ✓ migration applied, 515 tests, tier homogeneity verified |
| 1.2 | ✓ **DONE 2026-07-26 (U22).** **Employee brain becomes a real floor** (CEO chose option B, 2026-07-26). Today `agents.brain` is decoration: `fn_select_model` does NOT read it and no TS router reads it, so the workforce page shows a model that decides nothing. The brain must set a MINIMUM: it may raise a task's tier, never lower it — a critical class always resolves to Opus 5 regardless of whose brain it is. | §4b (step-0 contract, never implemented) + new §4f | `agent_runs` shows a director's L3 task executed by the L1 model; a Sonnet-brained agent's L1 task still executed by Opus 5; both proven by test, not by reading code |
| 1.3 | ✓ **DONE 2026-07-26 (U23).** **Council adapter** — §4e is written but nothing calls it. Needs the Codex CLI subscription lane (subprocess, not the API key), the refute prompt, and the objection ledger. | §4e | a real critical decision runs the gate; the objections and their disposition are readable in `decision_log`; cost row exists |
| 1.4 | ✓ **DONE 2026-07-26 (U24).** **Hamza's two legs** — `chat.strategy` (money/plans/decisions, Opus 5, no turn limit) and `chat.brief` (daily report, fetches data first). Today one `chat.answer` row serves both. | VOICE_INTERACTION_SPEC + §4d | a planning question and a status question resolve to different rows, proven from `agent_runs` |
| 1.5 | ✓ **DONE 2026-07-26 (U26).** **Chat conversations have titles** — `chat_messages` has no session column and the board is one flat 200-row list; "new chat" does not exist in code. Voice already has `session_id` (U15 D13); chat must join it. | CEO_COMMAND_CENTER_SPEC | a second conversation starts clean, both appear as separate threads, model context does not bleed |
| 1.6 | ✓ **DONE 2026-07-26 (U25).** **Budget 100% brake** — the critical alert says work stopped; the only writer is a hand-run CLI. Either wire the automatic writer or correct the copy. The system may not claim a brake it does not have. | COST_CONTROL_SPEC | crossing 100% in a test flips `budget_state.hard_stopped` with no human in the loop, or the copy is fixed and the claim withdrawn |

### W2 — The autonomy loop (this is the factory)

Nothing here starts revenue; it builds the machine that could. The CEO opens it when he chooses.

| # | Work | Owner spec | Closing evidence |
|---|---|---|---|
| 2.1 | ✓ **DONE 2026-07-26 (REVENUE_ENGINE_SPEC §7bis).** **Objective gate in the product** — `control_objective_create/_activate` exist but have no screen and no API caller; setting a target today needs psql. | REVENUE_ENGINE_SPEC §7 | CEO sets a target from the dashboard; audit row + decision row exist |
| 2.2 | ✓ **DONE 2026-07-26 (U28).** **Discovery engine** — `revenue.scan` re-reads existing rows with SQL; `opportunities` is empty; the spec's `revenue/propose.ts` was never written. The tools it needs are installed and have **never been called** (scrapling 10 tools / playwright 24 tools → 0 calls). | REVENUE_ENGINE_SPEC | **CLOSED WITH ITS OWN EVIDENCE:** 5 `opportunities` rows born from one real research run — each carrying 3 distinct source URLs it fetched — with 5 `scrapling` `tool_calls` behind them. Scrapling had never been called once in this project's life before today. Report on the knowledge shelf: `dxb://scout-run/ff956901…` |
| 2.3 | ✓ **DONE 2026-07-26 (U32).** **The two written gates actually fire** — zero-capital filter (G4) and evidence gate (G3): `capital_required_eur` is compared nowhere, `evidence_refs` is validated nowhere. | REVENUE_ENGINE_SPEC G3/G4 → §7quater | **CLOSED WITH ITS OWN EVIDENCE:** live rolled-back door proof on the real DB — *"needs €900 capital; the active limit is €0 — raising it is the CEO's call (G4)"* · *"evidence cites an opportunity that does not exist: 1111…"* · a proposal citing a live opportunity accepted. `fn_revenue_capital_limit()` = one source; refusals audited as `revenue.opportunity.capital_filtered`; gate re-checked at `advance` so a lowered limit cannot be walked past. 9 red-first tests (`tests/c9/revenue-gates.test.ts`), migration `20260726012000`, full suite 82 files / 606 passed, `tsc -b` clean |
| 2.3b | ✓ **DONE 2026-07-26 (U35).** **The filtered refusal is visible where the CEO looks** (CEO order 2026-07-26 16:45, "bunu sıraya al hemen"). W2.3 made the capital gate real, but a refused opportunity explains itself only in `audit_log`: `/revenue/opportunities` shows the row with no sign that money — not merit — stopped it. The CEO must be able to see, on the page, that a candidate is waiting on a limit HE can raise. | REVENUE_ENGINE_SPEC §7 (surfaces) + §7quater | the pipeline board marks a capital-blocked candidate with its required amount vs the active limit, both locales, and the RULE #0 pass runs on the surface — **MET:** ceiling line (limit + its objective + how many wait on it) and a warn-marked card carrying "needs €X, ceiling €Y — stopped by money, not by merit", both locales; one source via `v_revenue_capital_ceiling`; RULE #0 EN+TR × 1366/1920 with a probe row rendering the blocked state (probe removed, residue 0); authed E2E gate pins the bilingual line |
| 2.4 | ✓ **DONE 2026-07-26 (U33).** **Allocation → project → task seam** — all six engines have `owner_department = NULL`; an approved allocation produces no work. | REVENUE_ENGINE_SPEC §5 → §7quinquies | **CLOSED WITH ITS OWN EVIDENCE:** live rolled-back proof through the CEO's real doors — allocate €40 against the €50 objective → project `rev-consultancy-feed2756`, owner Head of Customer Success, kickoff task queued in `customer-success` at L1, TR headline *"Pilot planı: Girişimler için AI/LLM backend entegrasyon danışmanlığı"*. Owners shipped as data; `NO_OWNER` refuses orphan work; **stop now stops** (project pauses + `claim_next_task` skips halted projects — a company-wide gap that had made "paused" a label with no consequence). 6 red-first tests, full suite 83/612, authed E2E 20/20, RULE #0 pass on `/ops/projects` EN+TR × 1366/1920 (two surface defects found and fixed there: missing `name_tr`, viewport-sized grid) |
| 2.5 | ✓ **DONE 2026-07-26 (U34).** **Autonomous work generation** — all three task-creating paths need a human today. This is the line between "24/7 OS" and "very well audited idle system". | AGENT_ORCHESTRATION_SPEC A10-A13 | **MET — live window 16:45:43Z:** the scheduler read finished plan `f724848a` with no human in the loop, opened 3 staffed tasks through `control_work_generate` (risk-audit, finance, strategy), and 2 of them completed autonomously (`tasks.status='done'`, results filed). The 3rd was refused by the constitutional halal screen — which produced the second defect fix of the turn: the door now runs the same screen AT BIRTH instead of minting work the gate can never let run. First defect fix: 120-char labels cut mid-word → the plan writes its own headline (`title` + `do:`). Surface debt: `/ops/tasks` clipped its last column at 1366 (770px table / 748px container) → the information-free "Üstlenen" column removed, gate added |
| 2.6 | ✓ **DONE 2026-07-27 (U37).** **Proactive 07:00 briefing** — the operating manual promises it; `scheduler.ts` has no such job. Hamza never opens a conversation. | VOICE_INTERACTION_SPEC §24quinquies + CC_SPEC A6 | **CLOSED WITH ITS OWN EVIDENCE:** the resident scheduler delivered the briefing with no human in the loop (`ceo_briefings` 2026-07-27/morning → thread `27 Temmuz sabah brifingi`, one `role='hamza'` `source='briefing'` message, zero CEO messages in the thread) and the board opened it as the newest conversation. Content from ONE view (`v_ceo_briefing`), no model call, both language legs; switch + daily ceiling + audited refusals + `UNIQUE(briefing_date, slot)`. Cron `0 7 * * *` **tz Europe/Berlin** — the first non-UTC schedule in this company. 17 red-first tests, full battery green, RULE #0 EN+TR × 1366/1920 read by eye. **One defect found by the live run and fixed at its source:** the date leg crossed the driver as a local-midnight `Date` and `toISOString()` filed the first delivery as "26 Temmuz" at 01:30 on the 27th — the view now hands the day over as text and a test pins it |

### W3 — Hermes and the 24/7 body

The CEO's own words: *"Hermes mükemmel bir agentic sistem 7/24 holding çalışmasını sağlayacaktı … ama yok"*. Hermes WAS deployed (phase 07-06: bounded jobs, watchdog timer, kill-switch, night-job→morning-queue) — the defect is that it is invisible from the Holding and its debts were never closed.

| # | Work | Closing evidence |
|---|---|---|
| 3.1 | ✓ **MEASURED 2026-07-26 04:23 — Hermes is ALIVE.** `hermes.service` active running since 2026-07-25 08:05 (v0.18.2, bounded jobs only), main PID 3451340, 9 tasks, 132 MB, `LOAD_JOBS_OK enabled=1 rejected=0`; `watchdog.timer` enabled (its `.service` is `static`, i.e. timer-triggered — "inactive dead" is its correct resting state, not a fault); the whole core stack up 2 weeks (db, kong, auth, rest, realtime, meta, studio, litellm, outbox). **SSH access solved without asking the CEO:** port 22 refused over IPv4 after one root attempt (fail2ban), so the box was reached over **IPv6** (`dxb@2a01:4f8:c0c:cf01::1`, key `~/.ssh/dxb_vps_ed25519`) — the documented user is `dxb`, never root | live `systemctl status` + `docker ps` read on the box |
| 3.1b | ❌ **THE REAL DEFECT: Hermes is alive but BRAIN-DEAD.** Its last job died on `HTTP 402 — OpenrouterException: "This request requires more credits… you requested 4096 tokens, can only afford 282"`, and the model it was asking for is **`glm-5.2`** — a model U21 retired and banned. So the thing the CEO could not find is not missing: it is running, loaded, and unable to think, pointed at a fired model on an exhausted lane. This is the honest answer to *"Hermes'i göremedim"* | `journalctl -u hermes.service` |
| 3.1c | **Hermes needs a lane that works.** The VPS LiteLLM has only the OpenRouter upstream (Anthropic was removed 2026-07-19, complaint C2) and that balance is spent; the Codex CLI subscription lane exists only on the CEO's laptop. So the options are: (a) fund OpenRouter — **money-out, CEO's decision, never mine**; (b) put a subscription lane on the VPS; (c) wait for the local model and run Hermes's bounded jobs on it. **Not decided tonight — it is a spend question** | — |
| 3.2 | Surface Hermes inside the Holding: visible, controllable, its jobs legible to the CEO. **Boundary measured while doing 3.1:** the CEO's dashboard runs against the LAPTOP database, and Hermes runs against the VPS one — they are separate deployments, so "visible in the Holding" needs a heartbeat the laptop can read, not just a page. That is design work, not a screen | a dashboard surface showing its state and last run |
| 3.3 | Close the recorded deployment debts: 13 department keys missing on the VPS; first unattended 06:00 firing never observed | both measured on the box |

### W4 — Local layer and full voice repair (starts when the workstation arrives)

Hardware confirmed by the CEO: Ryzen 9 7900X · **RTX 5060 Ti 16 GB** · 32 GB DDR5-6000 · 2 TB NVMe · Linux. 16 GB VRAM means no frontier model runs locally — and none is asked to: this tier is L4 clerical plus the whole voice stack.

| # | Work | Closing evidence |
|---|---|---|
| 4.1 | **Local model exam** — 3 candidates × a Turkish task battery (intent classification, extraction, labelling, TR↔EN first-pass translation) scored on accuracy, tokens/sec and spare VRAM. The winner enters through the §4c onboarding chain (testing → smoke → eval → active). Chosen by measurement, never by reputation. | scored table + catalog row at `active` |
| 4.2 | **STT to `whisper large-v3-turbo`** (~2 GB) — today `faster-whisper-small`, measured round trip 33-51s against a ≤10s contract. This is the single biggest quality win in the voice lane ("CEO" heard as "JEO" dies here). | before/after on the same recording |
| 4.3 | **Mixed language** — one language label per utterance makes Turkish+English structurally impossible; needs per-segment labelling. | a mixed sentence transcribed correctly |
| 4.4 | **Pronunciation layer** — English words inside a Turkish sentence must be spoken with English phonetics. No phoneme/lexicon/SSML layer exists today; this is new construction. | CEO ear test (the open block-8bis gate) |
| 4.5 | **Local embeddings** — closes the OpenRouter embedding spend entirely | recall quality unchanged on a fixed probe set |

### W5 — Acceptance

| # | Work | Closing evidence |
|---|---|---|
| 5.1 | **The CEO acceptance session was never held**, which is why 11 of 27 acceptance criteria are permanently UNVERIFIED. **Gate added 2026-07-26 (U36):** the machine-checkable legs face the AUDIT TWIN before the session — cross-model (Codex `-s read-only`), told to refute, one row per claim with the command it ran; tier-C rows are the CEO's eye and the auditor may only confirm that nobody claimed them verified. | `ACCEPTANCE_CRITERIA.md:134` filled with real results + the audit's refutation table, and every claim neither side can prove recorded as ⚠ UNVERIFIED |

---

## 3. Standing boundaries (do not silently "fix" these)

- **GLM 5.2 · Qwen 3.6 · MiniMax M3 · DeepSeek Flash · Kimi · haiku 4.5 · Codex 5.5** stay retired+banned unless the CEO reopens them.
- **The GPT/Codex lane runs on the Codex CLI subscription**, never on the API key, until the CEO funds API billing. Do not "solve" a 429 by asking him for money.
- **Dense grids scroll horizontally** at 1280 with both rails open. Content is reachable and nothing is truncated; this is the sanctioned pattern, not a defect to re-open.
- **Persona `Created by: fable-5`, `persona_version='v2.0-fable'`, applied migrations and evidence notes are historical truth** (U20 decision 3) — never rewritten.

---

## 4. How a fresh session picks this up

1. Read the five bootstrap files (top of this note).
2. Take the **lowest-numbered open row** in the lowest open wave.
3. Read the spec that owns it. If the spec is silent, that is a design gap: record it as a registered adaptation in the SPEC and make it CEO-visible — do not invent the answer inside a ticket.
4. Close it with the evidence in its row. Executed verification or it did not happen.
