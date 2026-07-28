# 00-BOARD — THE OPEN WORK BOARD

**Accepted by the CEO, 2026-07-27 22:0x ("açık işler tahtası teklifini kabul ettim").**
**This board is the single answer to "what is left".** Until tonight that answer lived in six
separate ledgers — the roadmap, the U-table, the factory queue, the complaint ledger, the
acceptance criteria and the voice remediation note — and no one, CEO or a fresh session, could
see it in one look. That scatter is the measured root cause of the CEO's 2026-07-27 complaint
that the project "advances in a mess and specs stay half-finished".

## The law of this board

1. **One row per open thing.** If work is open anywhere in the corpus, it has a row here. The
   six ledgers keep their detail; this board keeps the truth about what is still open.
2. **No row closes without evidence.** A row closes with a command and its decisive output, or
   with the CEO's own eye/ear where the machine cannot check it. A closed row keeps its evidence.
3. **No work starts outside this board.** New work gets a row first. New design goes into the
   spec that already owns the contract as a registered adaptation — never into a new spec.
4. **Historical order.** Rows are ordered by the date the item was opened, oldest first, because
   the CEO's ruling of 2026-07-27 is that half-finished older work outranks new work.
5. **Ledger parity.** When a row closes here, the ledger that owns it is corrected in the SAME
   session. A stale ✓ or a stale ◐ is a governance violation of the same tier as an invented number.

## How to read the "Waits on" column

| Value | Meaning |
|---|---|
| **CEO** | Needs the CEO's decision, money, eye, ear or identity. The author cannot close it. |
| **AUTHOR** | The session author's work. No excuse, no deferral — a missing tool or a blocked path is the beginning of the work. |
| **HARDWARE** | Physically blocked until the workstation arrives (CEO confirmed: **Friday**). |

---

## Section 1 — Open work, historical order

Every row measured on 2026-07-27 unless its evidence column says otherwise.

| # | Opened | What is open (plain language) | Owning spec / ledger | Why it is still open | Waits on | What closes it |
|---|---|---|---|---|---|---|
| B01 | 2026-07-10 | **Boardroom** — several directors discussing a question out loud, with the CEO listening | [[VOICE_INTERACTION_SPEC]] §3.4 (add-later section), U4 | The CEO deferred it at the time | CEO | A CEO order to build it |
| B02 | 2026-07-17 | **Small design symmetry defects the CEO disliked** — the list was never captured | U16, [[DESIGN_SYSTEM]] | Deferred by CEO ruling; nobody ever wrote down which surfaces | AUTHOR | A written surface-by-surface defect list, then RULE #0 pass per surface |
| B03 | 2026-07-17 | **Voice line — the CEO's ear test** (block 8): selam → spoken ack · question → spoken answer · "kapanabilirsin" → spoken bye | [[00-NOTE-R32-VOICE-REMEDIATION-PLAN]] block 8, roadmap R3.2 ◐, U15 | Machine blocks 1-7 executed 2026-07-25; only the CEO's ear can close D1/D3 | CEO + HARDWARE | The 5-minute spoken protocol at the real mic, legs timed |
| B03-bis | 2026-07-28 | **RULE #0 browser leg for every authenticated CEO surface** — render in the real browser, both locales, ≥2 widths. Currently unrunnable in an author session: no `DXB_E2E_STATE` file exists, and automated login is forbidden (no MFA factor is enrolled, so a form login would ENROL TOTP on the CEO's account — an auth-state mutation). Every command-surface change therefore ships with its machine legs green and its eye leg ⚠ UNVERIFIED. First rows affected: **C50/C51** (the Bellek page, 2026-07-28) | RULE #0 + [[00-CEO-DIRECTIVE-DESIGN-VERIFICATION]] | The blocker is an auth boundary, not effort: `scripts/test/e2e-login.mjs` needs the CEO to mint the state once, and a minted state expires | CEO (one login) | A CEO-minted `storageState` on disk, and a re-mint cadence recorded so the leg does not silently lapse again |
| B04 | 2026-07-17 | **University product layer** — a separate product | Roadmap R6.2 | Never started; no architecture written | CEO | A CEO order to start |
| B05 | 2026-07-19 | **Real payment / storefront integrations** (Stripe, DocuSign, Gmail send) | Roadmap R6.1 | Frozen when the CEO cancelled Outleteuro (U19); still shows as a debt | CEO | A future CEO order |
| B06 | 2026-07-25 | **kimi-3 model exam** | [[MODEL_ROUTING_SPEC]] §4c | OpenRouter balance exhausted; the exam costs money | CEO (money) | Balance, then the §4c onboarding chain |
| B07 | 2026-07-25 | **Codex 5.6 exam** | [[MODEL_ROUTING_SPEC]] §4c | Needed a subscription session; the path is open now | AUTHOR | §4c chain run to `active` with the scores recorded |
| B08 | 2026-07-25 | **Per-employee brain switch** — the CEO changing ONE employee's model from the dashboard | [[MODEL_ROUTING_SPEC]] §4b | Half shipped: 205/205 agents carry `brain_source='slot'`; `fn_update_agent_brain` was never written | AUTHOR | The function + the dashboard control + an audited change |
| B09 | 2026-07-26 | **Hermes has no brain** — the 24/7 server runs but cannot think (credit exhausted + a retired model) | Factory queue W3 | Needs money or a subscription lane | CEO (money) | A live server-side agent run that succeeds |
| B10 | 2026-07-26 | **Hermes is invisible on the CEO's board** — the server and the laptop are two separate databases | Factory queue W3, [[OBSERVABILITY_SPEC]] | No bridge between the two databases | AUTHOR | The server's work appearing on the CEO's live board |
| B11 | 2026-07-26 | **13 department keys on the server + the first 06:00 run** | Factory queue W3 | Setup debt, never closed | AUTHOR | Keys present + one proven overnight run |
| B12 | 2026-07-26 | **Local model layer + full voice repair** (5 rows: local model exam, `whisper large-v3-turbo`, mixed language, pronunciation layer, local embeddings) | Factory queue W4.1-4.5 | Physically blocked on the workstation | HARDWARE (Friday) | Each row's own evidence; models chosen by measurement, never reputation |
| B13 | 2026-07-26 | **The CEO acceptance session was never held** — 11 of 27 acceptance criteria are permanently UNVERIFIED | [[ACCEPTANCE_CRITERIA]] §38, factory queue W5.1 | The session has not happened | CEO | The session, after the audit twin has faced the machine-checkable legs |

---

## Section 2 — The CEO's complaints of 2026-07-27 (C26-C42)

The complaint ledger C1-C25 (`00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md`) closed 25/25. These
are NEW, spoken by the CEO on the night of 2026-07-27 while looking at the live dashboard. They
continue the same numbering so the complaint history stays one sequence.

Every "Measured" cell below was taken this session. A row with no measurement says so.

| # | The complaint, in the CEO's terms | Measured tonight | Owning spec | Waits on | What closes it |
|---|---|---|---|---|---|
| C26 | **"I say 'Hamza, tell me what is going on on this page' and he must know which page I am on and explain it."** Hamza has no idea where the CEO is standing | `apps/dashboard/src/app/api/chat/route.ts` — **zero** references to pathname / page / route context. The chat receives the message and nothing else | [[CEO_COMMAND_CENTER_SPEC]] + [[VOICE_INTERACTION_SPEC]] | AUTHOR | The CEO asks the question on three different pages and gets three page-correct answers |
| C27 | **Links between pages are weak** — the surfaces do not lead into each other | Not yet measured surface-by-surface | [[CEO_COMMAND_CENTER_SPEC]] §7 | AUTHOR | A navigation audit table: every entity on every page reaches its own detail |
| C28 | **"Opportunities were found but you cannot open one. Where are the details? THERE ARE NONE."** | `revenue/opportunities/` holds `page.tsx` only — **no `[id]` detail route exists** | [[REVENUE_ENGINE_SPEC]] | AUTHOR | Clicking a discovered opportunity opens its full record |
| C29 | **The Skills page is rubbish** — 23 skills, all from one source, one flat list. A plugin or skill that contains other skills must collapse into a dropdown group | `library_items` kind=`skill` = **23**; kind=`plugin` = **18**; the page renders a flat table | [[HOLDING_LIBRARY_SPEC]] | AUTHOR | Parent/child grouping with the CEO's preferred progressive disclosure |
| C30 | **"I gave nearly 100 repos. NOT ONE was properly studied, installed and integrated into the system."** Plugins and MCPs are weak | `INTEGRATION-TRACKER.md` — 80 tracked items: **51 STUDY · 4 INSTALL** · the rest other. Most study cards are stubs | [[CAPABILITY_ARSENAL_DOCTRINE]] | AUTHOR | Per source: a real study card, an install decision with a reason, and a code path that consumes it — or an explicit written refusal |
| C31 | **"What are these tools? Skinny. Everything about the holding looks skinny."** | `library_items` = 434 rows across 15 kinds, but `library_usage_log` = **0 rows** and only **12 distinct items** were ever granted to anyone (173 grant rows). The catalogue is real; the *use* is empty | [[HOLDING_LIBRARY_SPEC]] | AUTHOR | Usage recorded per item, and the catalogue reflecting what the workforce actually reaches for |
| C32 | **"Something was built, but it is WEAK. Every page must be re-upgraded until it is excellent."** | Systemic — no single measurement | [[DESIGN_SYSTEM]] + RULE #0-B | AUTHOR | A per-page upgrade pass with a RULE #0 verification per surface, one surface per turn, never batched |
| C33 | **"There is no DATE — only a time. When did this work start?"** (Live Operations and the timelines) | **7** dashboard components render `toLocaleTimeString` with no date: `live-feed`, `live-ticker`, `alerts-rail`, `intelligence-rail`, `models-table`, `voice-call`, `live-clock` | [[CEO_COMMAND_CENTER_SPEC]] | AUTHOR | Every time stamp on a CEO surface carries the date it belongs to |
| C34 | **The date is placed stupidly** — bad position, no aesthetic judgement | Same components as C33 | [[DESIGN_SYSTEM]] + RULE #0 | AUTHOR | Date/time treatment designed once as a token, applied everywhere |
| C35 | **Long descriptions must be dropdowns** — click to open, excellent design, not a wall of text | Risk panel renders full paragraphs inline (CEO screenshot 2026-07-27) | [[DESIGN_SYSTEM]] progressive disclosure | AUTHOR | Long text collapsed by default, discoverable, and beautiful open |
| C36 | **"'Coffee token' — what is that? It has nothing to do with business."** Construction debris sits in the CEO's risk register | Risk register row: *"Onay ekranındaki kahve-token denetimi"* — a design chore, severity Düşük, still Açık | [[RISK_REGISTER]] | AUTHOR | The risk register carries business risk only; construction chores move to their own ledger |
| C37 | **Hamza speaks in code words** — "bacak" (leg), "yetimleri kapattım" (closed the orphans). He must speak normal business terminology to the CEO | Author-side language defect, present in this session's own chat too | [[EMPLOYEE_PERSONA_STANDARD]] + [[VOICE_INTERACTION_SPEC]] §27 | AUTHOR | A banned-vocabulary gate on CEO-facing text, same class as the i18n purity gate |
| C38 | **"I opened Hamza and there is a microphone on/off button. Nobody's JARVIS needs a button."** Always listening on the wake word; the button is for when the CEO wants it off | `dxb-jarvis` daemon holds a MUTED state (`var/jarvis.log` 15:50:48 "MUTED by chat/panel order") and starts muted | [[VOICE_INTERACTION_SPEC]] §24bis | AUTHOR | Wake word live without any press; the control becomes mute-on-demand, not activate-on-demand |
| C39 | **"Where is the company doctor?"** Who knows this holding perfectly and fixes a problem the moment it appears? | No such role existed in the 199-persona roster. **SHAPE DECIDED — CEO approved 2026-07-27: ONE DOOR, A TEAM BEHIND IT.** Hamza is the doctor the CEO speaks to — he diagnoses, names the owner and carries the repair to a closed, evidenced end; behind him stands a permanent **system-health team** that watches continuously and repairs without being asked. NOT a second department the CEO has to address: splitting diagnosis away from Hamza would give the CEO two doors to knock on, which is the very scatter he complained about | [[ORGANIZATION_ENGINE_SPEC]] + [[AGENT_ORCHESTRATION_SPEC]] | AUTHOR (shape approved) | The team exists and is staffed; a defect injected on purpose is detected, owned and repaired without the CEO reporting it, with the audit trail to prove it |
| C40 | **"IS THE LOOP SYSTEM BUILT? I gave a repo and a specific order. It is very famous."** (karpathy / autoresearch) | `INTEGRATION-TRACKER.md:61` — autoresearch (karpathy), **Status STUDY**, target phase 11, study card `autoresearch.md` is a **STUB**. **It was never built** | [[CAPABILITY_ARSENAL_DOCTRINE]] | AUTHOR | The mutate → measure → keep-if-better loop running against a locked score, with a real run recorded |
| C41 | **"Burj Al Arab was one throwaway example I gave at the start of the project — and it got written into the design department's persona as if it were the goal."** Who knows what other rubbish is in the personas | **2 persona files** carry it: `personas/design/head-of-design.md`, `personas/design/design-ui-designer.md` | [[EMPLOYEE_PERSONA_STANDARD]] | AUTHOR | Both files corrected at source **and** a sweep of all 199 personas for the same class (a construction-time example frozen into a permanent instruction) |
| C42 | **STANDING ORDER — competitor systems become ours.** The CEO hands Opus 5 reels, videos and repos. Opus 5 watches them (cheap sub-agents allowed for the watching), writes a report, and then builds the same capability **or better**. No other outcome is acceptable. Whatever skills, plugins or tools that needs — from the holding's own inventory, from GitHub, or from the Claude Code marketplace — Opus 5 installs them itself | New order, 2026-07-27 | [[CAPABILITY_ARSENAL_DOCTRINE]] (new section) | CEO supplies sources → AUTHOR builds | Per source: report → feature parity or better, shipped and evidenced. **STAGE 1 CLOSED 2026-07-28: 16/16 sources read frame by frame, reported and merged — see Section 3.** The row stays open because the building has not started |

---

## Section 2b — Closed on the board the night it opened (2026-07-27/28)

Rows are kept, never deleted, with the evidence that closed them.

| # | What | Closed by | Evidence |
|---|---|---|---|
| C43 | **THE PERSONA WAS AUTHORED AND NEVER DELIVERED.** Both live answer lanes (voice `answer.ts`, chat `chat-drain.ts`) each held a private `personaHead()` that read **the first 60 lines of the persona FILE**. A persona file opens with the 33-row SİCİL dossier — 48 lines for the orchestrator — so the identity reaching the live Hamza was: the dossier table, §1, and one sentence of §2. **2 of 13 sections.** His working method, decision rules, escalation limits, reporting standard, §12 (Discipline DNA & Islamic conduct) and §13 never arrived. **This is the mechanical cause of the CEO's C-row complaint that "Hamza does not know the holding and is confused"** — he was answering with a dossier table where his mind should have been | One shared loader `packages/voice/src/persona.ts` (`loadPersonaBody`), used by BOTH lanes — the duplicated function is gone. Boundary is the same `# PERSONA — ` header the sync script, the gate and the compiler already use: one definition of "the persona" in this company | Before → after on the authored file: delivered sections `[1,2]` → `[1..13]`, 18,168 chars, dossier absent, §12 and §13 present. Regression pinned in `tests/r31/persona-delivery.test.ts` (4 cases, and the old loader fails all three content cases) |
| C44 | **The database physically refused to record the truth about authorship.** `personas_author_check` allowed only `('fable-5','hr-factory')`, so an Opus 5 session could file a persona only by labelling it Fable 5's work — U20 (2026-07-25) and U30 (2026-07-26) had moved authorship and nobody updated the constraint. **CEO confirmed the rule again in-session on 2026-07-27:** *"Fable 5 ve Opus 5 yazar olabilir bu projede CEO talimatıdır, kayda geçilsin md'de ve gereken yerde"* | Migration `20260728001000_persona_author_u30.sql` extends the constraint to `opus-5 \| fable-5 \| hr-factory`; [[EMPLOYEE_PERSONA_STANDARD]] G4-bis records it as a registered adaptation. **Historical rows are NOT relabelled** — guessing which past rows were mislabelled would replace one wrong record with another | Migration applied twice (idempotent); constraint now reads all three; Hamza v6 filed with `author='opus-5'`, gate `passed` |
| C45 | **The sync script hardcoded the author and reported success for work the database refused.** `scripts/sync-personas-to-db.sh` wrote `'fable-5'` for every persona an Opus 5 session synced, and when the DB rejected the insert it still printed `submit: 1 · fail: 0` and exited 0 | Author now comes from `DXB_PERSONA_AUTHOR` — required, whitelisted to the two authorized authors, **no default** (a silent wrong author is worse than a stopped script). An empty returned persona id is now a FAIL | Measured before → after on a refused submit: `submit: 1 · fail: 0 · EXIT=0` → `submit: 0 · fail: 1 · EXIT=1` |
| C46 | **A role-specific section would have been silently dropped from the prompt.** The prompt compiler emits only sections listed in `PERSONA_SECTIONS` (1-12), so §13 would have been authored, gated and stored — and never compiled. Adding it as a REQUIRED section would instead have failed the other 198 personas at the gate | `SectionSpec.optional` added; §13 registered as optional; gate skips an absent optional section, compiler emits it when present | `compilePersonaPrompt` on Hamza contains `## 13.` and `Hamza ibn Abd al-Muttalib`; a persona without §13 still compiles and still gates `ok: true` |

| C47 | **THE CONSTRUCTION SITE WAS INSIDE THE COMPANY.** CEO, 2026-07-28 02:18: *"bu inşaa sürecinin her boku neden bu şirkete yansıyor — burası ayrı bir platform."* Every test suite wrote into the SAME Postgres database his dashboard reads. Six residue classes had accumulated in `tests/global-teardown.ts`, each one a leak that had already reached a CEO surface once. That night at 01:50 he was looking at two 'Hook ihlali' rows and a failed `r23t-` workflow on his KRİTİK UYARILAR panel. **Root cause of why the sweep did not save him, measured:** journal `01:49:01 earlyoom: sending SIGTERM to process ... "code": badness 893` (swap free 0 of 6143 MiB) — the editor was killed three times between 01:49 and 01:53, the suite inside it died, and the teardown never ran | **Isolation, not a sixth sweep.** The suite runs against `dxb_test`, a full clone of the company database in the same Postgres — same schema, seeds, roles and RLS, so live-data acceptance proofs still measure real rows. One `test.env` line in `vitest.config.ts` redirects all 89 files; `scripts/test/refresh-test-db.sh` rebuilds it after a migration | Full suite **662 passed / 15 skipped / 0 failed** with company-database counts **identical before and after**: alerts 149→149, tasks 216→216, agent_runs 377→377, hook_violations 1963→1963, chat_messages 79→79, audit_log 29518→29518, decision_log 4728→4728. Unresolved alerts on the CEO panel: **0** |
| C48 | **A sweep that was deleting the CEO's real constitutional rejections.** Found while fixing C47: `global-teardown` removed every hook alert whose `dedup_key` ended in `':no-run'`. Measured over 1963 live rows, the pre-gate is **516 null-run / 0 with-run** — it fires before the run exists by design — so that sweep had been quietly deleting genuine halal and permission blocks off his panel on every suite run | The blind sweep is gone. Migration `20260728002000` replaces it with two intrinsic rules: a **post/runtime** violation with no run raises no CEO alert (impossible in production; the audit row is still written), and deleting a workflow or a violation resolves its alert (an alert pointing at something that no longer exists is an orphaned projection). The **pre-gate class is deliberately left loud** — a real rejection is indistinguishable from a probe there, and hiding a constitutional block is worse than showing one extra alert | `tests/e10/alert-projection-purity.test.ts` (7 cases incl. the boundary case proving the pre-gate still alerts); r23 now clears its own violations by id watermark; e10 suite 52/52 |
| C49 | **The CEO's editor was the designated victim of the memory killer.** Electron raises its own windows to `oom_score_adj=300` — measured score **894** for a VS Code window against 666-686 for everything else — so earlyoom chose it every time. `freeze-guard` killed chroma-mcp at 01:49:**02**, one second after the editor was already gone: a fixed 6-minute grace loses that race | An unprivileged process may only RAISE `oom_score_adj`, never lower it, so the editor cannot be shielded directly. The guard now pushes the expendables it **already kills** above the editor, and drops its grace to 60s while memory is under 20% | chroma-mcp measured at score **1333** vs the editor's **894** after one guard run — the kernel's own victim choice now lands on something whose loss costs nothing |

| C50 | **The Bellek page described itself in engineering language.** CEO, 2026-07-28 02:33: *"şu mallığa bak ya saçma sapan küçük yazılar ör: notebook altında bu ne yaaa ben CEO yum bunlar ne yaaa."* Each store card printed `library_items.usage_notes` — a note written for the library catalogue — so his NOTEBOOK card read *"procedure store — memory-store/procedure/\*.md (open-notebook line); kind=procedure, LOCKED composition"*. A file path, a `kind=` pair and a composition rule, on a command surface | The inventory join is **removed**, not reworded: a store card now says what the store HOLDS in one word from the page dictionary — Belgeler · Bağlantılar · Prosedürler · Olgular (EN: Documents · Connections · Procedures · Facts). The words are **measured**, not chosen: each company store holds exactly one kind (`memory_index`: obsidian=artifact 32, notebook=procedure 5, pgvector=fact 37) | `tests/phase8/memory-store-labels.test.ts` (5 cases): both locales carry a label for every store, no label may contain a path / `kind=` / `LOCKED` / more than two words, and the page may no longer read `usage_notes`. i18n purity PASS (en 2395 = tr 2395), tsc clean, phase8 44/44. **Browser leg ⚠ UNVERIFIED — see B03-bis** |
| C51 | **A false statement stood on a CEO surface.** The same page titled its archive *"Fable'ın yapım notları (10-24 Temmuz)"*. Measured: `memory_index` store `claude-mem` runs **2026-07-10 → 2026-07-28**, with **2,135 rows written after Fable's last day** (07-24: 520 · 07-25: 481 · 07-26: 1370 · 07-27: 172 · 07-28: 92). The archive holds Opus 5's build notes too, and the CEO was being told otherwise | Renamed for what it is in both locales — *"İnşaat arşivi — yapım oturumlarının notları"* / *"Construction archive — the build sessions' own notes"*, dated "10 Temmuz'dan bugüne". The four-line explanation that stood open permanently now sits behind a native `<details>` (C35 — long text discoverable, never a wall); the count and last write stay visible | Date range measured in-session; both locale strings updated together; i18n purity PASS |

## Section 2c — The CEO's complaints of 2026-07-28 (C52-C56)

From `HAMZA VE KOMPLE SISTEM SIKAYETİ.odt` (224 lines + 6 screenshots, read in full 2026-07-28)
and from the measurements taken while reading it. Every "Measured" cell was taken this session.

| # | The complaint, in the CEO's terms | Measured 2026-07-28 | Owning spec | Waits on | What closes it |
|---|---|---|---|---|---|
| C52 | **"TAMAMEN DATA BASETEN SİLİNSİN ÇOK YER KAPLAMASIN."** He calls this his *"TEK istek ve tek görev"* for the chat panel: a conversation must be deletable **completely from the database**, not hidden | **No delete door exists at all.** The chat write path has exactly three functions — `fn_chat_post_message`, `fn_chat_session_for_new_message`, `fn_chat_touch_session`. Nothing deletes | [[CEO_COMMAND_CENTER_SPEC]] | AUTHOR | A CEO-triggered delete that removes the session and its messages from the database, audited, with the row count measured before and after |
| C53 | **Images must be sendable to the chat** | No image upload on the chat surface. Note the irony measured the same day: **his own complaint arrived as six screenshots** he had to describe in words | [[CEO_COMMAND_CENTER_SPEC]] | AUTHOR | He drops a screenshot into chat and gets an answer that refers to what is in it |
| C54 | **"bir kısmı gidiyor bir kısmı gitmiyor"** — half of what he says never arrives | **44 % of today's calls lost his speech.** `select status,count(*) from voice_calls where started_at::date=current_date` → `ended 5 · failed 4`; every failure `empty_transcript`. This is a software defect in our own daemon, **not** the hardware question that waits on Friday | [[VOICE_INTERACTION_SPEC]] · [[00-NOTE-R32-VOICE-REMEDIATION-PLAN]] | AUTHOR | 20 consecutive calls with 0 `empty_transcript`, and a spoken "sizi duyamadım" when capture is empty |
| C55 | **He waits and nothing tells him anything** | Measured per call: **stt 12.9–17.7 s (one 67.3 s) + answer 12.5–22.2 s + tts 1.7–3.6 s ≈ 29–35 s**, with no state shown at any point. Two independent rivals (sources 02, 06) show `Düşünüyor` / `Listening` / `Speaking` throughout | [[VOICE_INTERACTION_SPEC]] · [[CEO_COMMAND_CENTER_SPEC]] | AUTHOR | Acknowledgement within ~1 s, visible state throughout, median round trip ≤ 10 s |
| C56 | **A button that fails without saying so** | `apps/dashboard/src/components/chat/chat-board.tsx:285-297` — the "send as task" dispatch has **no `else` branch**; a failed `/api/intent` call tells the CEO nothing. Same class as the fault that killed his chat on 2026-07-26 (U27 fault 4) | [[CEO_COMMAND_CENTER_SPEC]] | AUTHOR | A forced-failure test asserts a visible message; the button can never fail silently again |

### Section 2c continued — C57-C64, found on a SECOND reading of the same document

**Author's defect, recorded:** the first pass through `HAMZA VE KOMPLE SISTEM SIKAYETİ.odt`
produced only C52-C56. The document contains more, and the file was **edited again at 19:52**
after that first reading. The complete text and all **7 screenshots** are now preserved at
`references/ceo-complaints-2026-07-28/` (they were living only on the CEO's Desktop, outside the
repository — the 2026-07-19 complaint screenshots had been saved, these had not). Measured below.

| # | The complaint, in the CEO's own words | Measured 2026-07-28 | Owning spec | Waits on | What closes it |
|---|---|---|---|---|---|
| C57 | **"aynı anda ses üstüne ses bindi 'çözümlüyorum' başka bir ses daha bindi üstüne"** — voices playing on top of each other | A `playing` guard **does exist** in `packages/voice/src/jarvis-daemon.ts:394-401,466` — and the CEO still heard overlap, so the guard does not cover every lane that can speak (the dashboard voice panel plays independently of the daemon). **A guard that the user can hear through is not a guard** | [[VOICE_INTERACTION_SPEC]] | AUTHOR | One speaker at a time, proven by forcing two answers to collide |
| C58 | **"her söylediğimde 'anlayamadım Muhittin Bey' diyor"** | **The phrase exists nowhere in the code or the dictionary** — zero hits across `*.ts`, `*.tsx`, `*.json`. It is therefore **generated by the model**, which means Hamza received an empty or garbled transcript and *answered anyway* instead of failing honestly. That is the `empty_transcript` defect (C54) wearing a polite sentence | [[VOICE_INTERACTION_SPEC]] | AUTHOR | An unusable capture produces a **fixed, honest** recovery line, never a model-invented apology |
| C59 | **"ÇOK BÜYÜK HALÜSİNASYON — ben ona 'ne kadar token yaktın' diye sordum, o bana 'siz bana benim seviyemi sordunuz' deyip alakasız şeyler söylemeye başladı"** | Not reproduced this session; recorded as **the CEO's direct observation**, which under the 2026-07-28 evidence ruling outranks an unreproduced test. Related and measured: the cost-metering gap for the chat lane was already found on 2026-07-28 11:04 | [[VOICE_INTERACTION_SPEC]] · [[ORCHESTRATOR]] | AUTHOR | A cost question returns the measured number from `cost_ledger`, or says it cannot measure it — never an unrelated answer |
| C60 | **"BİR GÖREV VERDİĞİMDE GÖREVİ TAKİP EDECEĞİM ALAN YOK. BİTTİ, PEKİ SONUCU NEDİR İŞİN??? YOK!!!!!"** | **Worse than "missing": it exists and is hidden.** `tasks` carries **`result`** and **`output_contract`** columns, and `ops/tasks/page.tsx` references them **0 times**. The work's outcome is being stored and never shown to the person who ordered it | [[CEO_COMMAND_CENTER_SPEC]] | AUTHOR | Every task the CEO gives has one place showing its state, its owner and **its result**, with the row id |
| C61 | **"NEREDEN İÇİNE GİRİLİYOR? KARTLARA TIKLAYINCA HİÇBİR ŞEY YOK"** | Extends C27/C28 from `revenue/opportunities` to **every card on every surface** | [[CEO_COMMAND_CENTER_SPEC]] §7 | AUTHOR | A navigation audit: every card on every page opens its own record |
| C62 | **"34 INC EKRAN KOCA BOŞ SAYFA! SAYFAYI KÜÇÜLTÜNCE SAĞA SOLA KAYDIRMA"** | The design directive already names a 34" ultrawide (A1, 2026-07-11); the surfaces do not use it, and horizontal overflow is a RULE #0 Amendment A1 automatic FAIL | [[DESIGN_SYSTEM]] + RULE #0 | AUTHOR | Every CEO surface fills the 34" width with live content and measures `scrollWidth === clientWidth` at every tested width |
| C63 | **"YAHU NE GRAFİK ANALİZLERİ NE CHARTLAR… KUTU KUTU KART KART"** — no charts, no analysis, everything is boxes | **Measured: the dashboard contains ZERO charts.** No chart library is installed (`recharts/chart.js/d3/visx/nivo/echarts` — none in `apps/dashboard/package.json`), no file is named `*chart*`/`*graph*`/`*spark*`/`*trend*`, and of 63 components exactly one draws anything (`health-ring.tsx`). Meanwhile **34 views exist that are literally chart fuel** — `v_pnl_daily`, `v_cost_breakdown`, `v_model_stats`, `v_workforce_tokens`, `v_opportunity_pipeline`, `v_org_graph`, `v_live_ops`, `v_approval_fatigue`, `v_exec_overview` | [[CEO_COMMAND_CENTER_SPEC]] + [[DESIGN_SYSTEM]] | AUTHOR | A screen-by-screen specification, then charts on every main surface, **each one reading a named view** and showing an honest empty state |
| C64 | **"UX'i 'U eks' diye okuyor — yabancı kelimeleri yabancı okuması lazım"** | Turkish TTS reading foreign technical terms letter-by-letter in Turkish | [[VOICE_INTERACTION_SPEC]] (pronunciation layer, factory row W4.4) | AUTHOR + HARDWARE | A pronunciation layer that speaks foreign terms as foreign words |

**Process complaint recorded separately (not a surface defect):** *"PROJENİN MİMARİSİ TAMAMI VS
ADIM ADIM KALİTE NASIL ARTACAKSA O ŞEKİLDE İLERLESİN. KOMPLE PROJE BAŞTAN SONA YAZILIYOR, KALİTE
Mİ DÜŞÜYOR UYGULARKEN ANLAMIYORUM. BUNUN ÇÖZÜMÜ OLMALI."* — the CEO cannot tell whether quality is
rising or falling as the project is executed. This is what the open work board and the evidence
rule are for, and it is evidently not yet answering him. **Owned by the board itself.**

---

| Decision | The CEO's ruling |
|---|---|
| Cloud speech-to-text to fix the 46-second voice round trip | **REJECTED.** No cloud move. The workstation arrives **Friday**; local models will be installed then |
| How local models get chosen | **By measurement** — accuracy, speed, spare memory, and researched user feedback, picking what fits this holding. Never by reputation |
| The open work board | **ACCEPTED** — this file |
| Order of work | **This board, oldest first.** Half-finished work outranks new work |
| Order of work, amended 2026-07-28 | **Rival analysis first, then build.** The CEO chose it himself: *"Rakip analizi önce"* — because the report defines the target, and building before the target is known means demolishing afterwards. **Stage 1 is now closed (Section 3).** |
| How the sixteen sources get read | **"HEPSİNİ İZLE TEKTEK EN İNCE EN KUCUK DETAYLARI YAZ. HEPİSININ SONRA DA BİRLEŞTİRİCİ BİR PLAN ÇIKAR!"** (CEO, 2026-07-28). Not one report then a pause — all sixteen, then one unifying plan |

---

## Section 3 — The C42 programme (opened 2026-07-28)

**Stage 1 — rival intelligence — is CLOSED.** Sixteen sources supplied by the CEO were read
frame by frame, reported, and merged into one plan. The reading lives at
`.planning/research/rival-intel/` (16 reports + `00-LEDGER.md` + `00-SYNTHESIS.md`), it is
machine-gated (`tests/c42/rival-intel-ledger.test.ts`, 7 cases — a `reported` row with no report,
or a report missing its six sections, or a reel report whose section 2 is a summary rather than
a timestamped record, all fail the suite), and it is crash-resumable
(`scripts/rival-intel/next.sh`).

### 3.1 What stage 1 measured

| Fact | Measurement |
|---|---|
| Sources read | **16/16 reported** — 13 reels, 1 PDF, 2 repositories; `00-LEDGER.md` `NEXT: done` |
| Distinct systems behind them | **6–7.** Sources 01/03/16 are one story (demo → teardown → the open-source stack); rows 11–14 are one account; rows 05 and 11–14 are the same clipping operation from opposite ends |
| The diagnosis | **CORRECTED 2026-07-28 by the CEO, and the correction is the finding.** The first draft read "DXB is bigger, safer and better governed than every one of them" — counting personas and tables and calling it a verdict. He rejected it: *"BEN O SİSTEMLERİ VİDEODAN DEĞİL HEPSİNİ TANIYORUM, ARKADAŞLARIM, VE MİLYONLARCA DOLAR KAZANIYOR VE HEPSİ GERÇEK, HEPSİ CANLI."* **Every one of the sixteen RUNS and EARNS; DXB does neither.** On the only measure that decides — does it work and does it make money — DXB loses to all sixteen. What DXB holds is more unfinished structure and stricter rules, and **rules are not results**: `library_items` 434 rows against `library_usage_log` **0**, `realized_revenue_eur` **0**. Consequences in order: it does not earn · it loses 44% of his speech · it shows him nothing · it is 20× slow |
| Highest-value single screen found | Source 08's **Conference Room** — the CEO's chat and a live agent feed side by side in one view |
| Highest-value single idea found | Source 10's **constellation** — the org chart IS the live activity display; the speaking agent's node lights up |
| What the admired "judgement" actually is | Source 03 names it: **a connected data source with the right breakdown** (Meta Ads MCP returning ROAS *per creative*). Not reasoning |
| Where DXB is unambiguously ahead | The objectives ledger (`capital_limit_eur`, `risk_limit_eur`, `max_loss_eur`, `net_unverified` — nobody else has anything like it) · the enforced approvals gate · 199 personas against their 5 · Islamic boundaries · two languages held pure |

### 3.2 The six waves — every project already has an owning spec

Full text, per-project evidence contracts and the per-source derivation:
`.planning/research/rival-intel/00-SYNTHESIS.md`.

| # | Wave | What it delivers | Waits on | Owning specs |
|---|---|---|---|---|
| **W-C42-1** | **"Hamza nefes alsın"** — feedback and speed | Acknowledge in ~1 s before transcription · state always visible (`dinliyor · düşünüyorum · konuşuyorum · sessize alındı`) · name the tool while using it · **kill the 44 % `empty_transcript` and the 29–35 s round trip** · mute stops being a trap · the silent dispatch button dies | AUTHOR | [[VOICE_INTERACTION_SPEC]] · [[CEO_COMMAND_CENTER_SPEC]] · [[00-NOTE-R32-VOICE-REMEDIATION-PLAN]] |
| **W-C42-2** | **"Şirket görünsün"** — the living command centre | The Conference Room (chat + live feed in one view) · the living org constellation · the speaker always named · a page per agent · run cards with outcomes in words · the Knowledge Vault made visible · pipelines drawn with their invariants and their owner · a health line · a resting state that is alive · the book of bad calls | AUTHOR (+ CEO for the RULE #0 browser leg, B03-bis) | [[CEO_COMMAND_CENTER_SPEC]] · [[DESIGN_SYSTEM]] |
| **W-C42-3** | **"Brifing karar versin"** | The briefing gains a voice and a spine · a **stated, CEO-owned ranking function** · it grades itself and regenerates when weak · it ends in the decision awaiting him · a world block that omits itself when empty · honorific as configuration · one gesture that teaches · every run writes back to memory | AUTHOR | [[VOICE_INTERACTION_SPEC]] §24quinquies · [[CEO_COMMAND_CENTER_SPEC]] |
| **W-C42-4** | **"Dış dünya gelsin"** — connectors | Mailbox · unsubscribe inside our gate · revenue aggregator · ads with ROAS per creative · calendar. **Read-only first; every outward action keeps the approvals gate; each connector must produce one briefing sentence quoting a number that came from it** | **CEO** (which accounts exist and may be connected) | [[CAPABILITY_ARSENAL_DOCTRINE]] · [[REVENUE_ENGINE_SPEC]] · `INTEGRATION-TRACKER.md` |
| **W-C42-5** | **"İş dayanıklı olsun"** — durability | Run liveness + resume-from-step + retry lineage with a stated reason · stop/interrupt a live run from the thread · task as a document (blockers, sub-tasks, reviewers, artefact) · the goal tree (`parent_id`, `owner_agent_id` on `objectives`) · the worker named out loud | AUTHOR | [[AGENT_ORCHESTRATION_SPEC]] · [[REVENUE_ENGINE_SPEC]] |
| **W-C42-6** | **"Para"** — revenue | Decide on the clipping engine **on evidence** · a CEO-owned **halal allowlist** (the live campaign grid in source 05 contains a betting brand) · objective → production line → reconciliation against measured views · **Merchant of Record answered before the first sale** | **CEO** | [[REVENUE_ENGINE_SPEC]] · governance / boundaries |

### 3.3 The design law the waves are built on

The CEO's own sentence — *"HER PANELIN CANLI OLDUĞU YAŞAYAN BİR HOLDİNG"* — made operational and
binding on every surface in W-C42-2 and W-C42-3:

1. **Every panel reads from a query or shows an honest empty state.** No panel may display a
   number it cannot prove. Source 01's goal panel sat frozen at `$16,678` for its whole video
   while its owner spoke nine different figures; that is the failure mode we refuse. RULE #0-A,
   expressed as design.
2. **Zero is a real answer** — a quiet board says "nothing is running" and never animates to look
   busy.
3. **The refusals are visible** — every pipeline card names the rule it will not break.
4. **Outward actions look different from reads** — the distinction the whole governance rests on
   must be visible in one glance.
5. **No "…" truncation** (CEO ruling 2026-07-18) — shorten at the source.
6. **Both locales, ≥2 widths, `scrollWidth === clientWidth`** — RULE #0, per surface, same turn.

### 3.4 What stage 1 explicitly refused, with reasons

Coolify (already banned by our stack rules; its one-click Redis reintroduces a removed
dependency) · Trigger.dev (a second job runtime; **its idea, resume-from-step, is adopted — its
infrastructure is not**) · adopting Paperclip or OpenJarvis wholesale (would replace DXB with
someone else's control plane, or add a second language and scheduler) · the trading desk of
source 10 (market speculation touches constitutional Islamic boundaries — **we take the
constellation, not the desk**) · Kokoro TTS (Speaches already gives us self-hosted €0 speech;
recorded as the first fallback to measure) · the $97 six-agent kit · "duplicate a repo and let
Claude Code edit it" (K1) · every comment-for-DM funnel (in two of them the withheld link is
`open-jarvis/OpenJarvis`, **already cloned on this machine**).

---

## Section 4 — What this board is NOT

It is not a plan. The plan exists once: this corpus. This board is the index of what the corpus
still owes. Every row points at the spec that owns it, and every fix lands in that spec as a
registered adaptation.

---

*Board opened 2026-07-27 by Opus 5 (session author, U30). Every measurement in it was taken in
the same session; no row was carried over from a summary.*
