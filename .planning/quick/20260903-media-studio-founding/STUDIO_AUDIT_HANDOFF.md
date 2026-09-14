# STUDIO AUDIT HANDOFF — DxB Media Studio (board row B43), audit of 2026-09-14 (evening)

**Purpose.** The single canonical carrier of everything the 2026-09-14 evening audit of the Media Studio established, so that a fresh implementation session can act without re-auditing. Written 2026-09-14 20:3x on the CEO's order (*"Bu oturumun tek görevi audit bilgisini kayıpsız biçimde kalıcı handoff dosyasına dönüştürmek … Düzeltmeye başlama. Yeni agent açma."*). Nothing in this file is a fix; nothing here is accepted by the CEO unless the ledger says so.

**Authority reminder for the reader.** CEO's live word > his latest ledger ruling (LAW A: later deletes earlier) > the spec that owns the contract > the board > `.planning/STATE.md` > code/tests/schemas (what IS) > anything older. LAW B: finished ≠ accepted. LAW C (as recorded, provenance disputed — see F014): talk before a change; "devam et" covers only the step discussed. LAW D: draft at native resolution first, enlargement only on an accepted draft on his word. Nothing becomes a law unless he says "make it a law".

## 1. Scope and the CEO's intent

- **What was audited:** the DxB Media Studio only — board row B43 (`HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` line 146) and its linked rows (B08 line 95; B28 the agency seat; B31 the armoury; B32 the V2 design package that gates every studio screen; B33 the bench; B41/B42 the arsenal), the 16 seat persona files, the studio's code (dispatch book, lanes, clock, media hands), the studio's records (STATE.md, the ledger entries dated 2026-09-01→14, the complaint rows C66–C68, the evidence folder), the product on disk (KATALOG.md, the vitrin, the masters, the cast) and the governance around that work. Holding-wide rules were read only as the ruler; incidental holding-wide findings are marked as such (F024, F056, F099, F101).
- **The CEO's two questions (2026-09-14 17:2x):** (1) is the studio inside a Ferrari-level plan; (2) was everything done for it so far done correctly. His standard: zero errors and consistency. His decision the same evening: acceptance of what waits for his eye follows the audit's verdict (*"kabul edilmesi senin denetimine bağlı doğru ise kabuldur. evet veya hayır."*) — not yet registered in the ledger; his word on the avatars the same evening (*"avatarlar kalabilir sorun değil onay"* — Safiye, Kenan, Deniz stay in the cast; the four Flux-drawn presenters retired 2026-09-13 stay retired as the author read it) — not yet registered.
- **The 2026-08-31 vision as it stands on row B43:** one script → 8–12 scenes → 3–20 s shots → one timeline as the studio's data model; only 20–40 % of a professional half-hour is generated (the edit is the cost lever); a master reference set before any shot; three engine tiers and a router as data; three lanes (station → RunPod → the external hands) with a CEO-visible, CEO-turnable dial and the cost shown before the decision; the two-roads (paid/free) cost table he said he must prepare from; the quality law (must read as filmed: model + references + camera control + upscale + post); DxB Agency as a virtual company with a showcase reel and a site; the order system → site → campaigns; 205 staff assigned. Amended by his September rulings (a)–(k) on the row: road from the brief (T2V default, I2V open), engine voice only, engine-born faces, Flux closed for local takes only, LAW D, 4 steps, no brand restriction / engine never draws lettering, men and elderly women only, brain Fable 5.1 xhigh.

## 2. The audit's true state — what ran, what did not

| Stage | Planned | Ran | Result |
|---|---|---|---|
| Finders | 9 Fable 5.1 read-only auditors (plan-quality · rulings-vs-seats · records-parity · code-vs-records · product-truth · governance-compliance · gate-strength · spec-ownership · ceo-intent-coverage) | 9/9 | 177 raw findings, 105 sound items |
| Merger | 1 | 1/1 | 111 merged findings (5 critical · 31 high · 50 medium · 25 low) |
| Adversarial refuters | 333 (3 lenses × 111) | **0/333** — every call failed with "You've hit your session limit · resets 8:10pm (Europe/Berlin)" | no finding was refuter-verified |
| Completeness critic | 1 | **0/1** — same failure | no gap list exists |
| Author's own re-measurement | — | 2026-09-14 18:1x–20:2x, shell / file / company DB (SELECT only) | see the status of every finding below |

Workflow run `wf_b5ea7151-515` (transcripts: `~/.claude/projects/-home-dxb-DxB-Global-OS/2590e49d-9ca4-4c88-8b2a-baa4689b9d2b/subagents/workflows/wf_b5ea7151-515/`, journal.jsonl holds the nine finders' and the merger's full returns; the raw output of the run is `/tmp/claude-1000/-home-dxb-DxB-Global-OS/2590e49d-9ca4-4c88-8b2a-baa4689b9d2b/tasks/w1b8r107u.output` — a /tmp path, gone at reboot). Duration 41 min 38 s; 344 agents scheduled, 10 done, 334 errored.

**Status labels used below.** VERIFIED = the author re-measured the cited evidence in this session (command → output stated). PARTIALLY VERIFIED = part of the claim re-measured. DOWNGRADED = re-measured, true in part, severity lowered with the reason. AUDITOR CLAIM / NOT REFUTER-VERIFIED = as returned by the finder, with its own cited evidence, not re-measured by the author. REJECTED = re-measured and found false (none in full; F030's sub-claim corrected inside its VERIFIED note). No verification is claimed that did not happen.

## 3. Verified baseline (measured by the author, 2026-09-14)

```
17:24  pnpm typecheck → tsc --build, exit 0
17:24  pnpm exec vitest run tests/b43 tests/r31 tests/b39 → Test Files 12 passed · Tests 100 passed (100)
17:24  pnpm verify:ledger → ledger truth OK … 202 CEO approval claims each backed by a registered approval
17:24  bash scripts/i18n-purity-check.sh → I18N PURITY: PASS (en 2395 = tr 2395)
20:17  gitleaks git <repo> --log-opts='--since=2026-09-03' → 57 commits scanned, no leaks found
17:2x  company DB: 16/16 studio seats agents.persona_id = latest passed persona (CD v16 · FD v13 · failure v12 · identity v11 · storyboard v11 · product v11 · advertising v10 · prompt v8 · editor v8 · engineer v6 · cinematographer v6 · screenwriter v5 · continuity v4 · vfx v4 · qc v3 · sound v2); all 16 status=dormant, employment_status=active; audit_log persona.bound dated 2026-09-14 = 63; routing_rules media.creative: fable-5.1 enabled p50 xhigh, fable-5 disabled p40; media_jobs: probe done 3 · shoot done 2 · shoot failed 1 · still done 26 · voice done 5; tasks status=inbox 14
17:2x  systemctl --user list-units 'dxb-*' → 8 running (board, comfyui, company-read, freeze-guard, gpu-guard, operator, scheduler, vitrin), jarvis disabled; vitrin 8899 HTTP 200; ComfyUI 8188 HTTP 200; card 799 MiB / 16311 MiB used
17:5x  queue_sheet_times reproduced read-only through sheetTimes() (scratch script sheet-times-readonly.mjs): DXB-V-EYW-005 total 22:45 · engine 10:25 · non-engine 12:20 · ratio 1.18 · idle 0:28 · planning 3:31 · unbudgeted; DXB-V-EYW-004 total 30:08 · idle 3:01 · ratio 1.89 (record says 30:15 — 7 s apart, not reconciled)
17:2x  git log --since=2026-09-03 → 63 commits, working tree clean; 004 master on disk 4,080,832 bytes
20:2x  road check on the auditor's mutated roster (12 injected sentences) → 3 failed | 13 passed (16)
```

What the finders reported SOUND and the author did not contradict (105 items; titles in the run's `sound` array): the record chain file = bound DB body = latest passed for 16/16; the dispatch book one transaction, forward-only deps, claim order; budget_minutes → due_at; the three rollback switches; lanes as loops; lease heartbeat 900/60; the GPU resource gate and the 26G scope; the five media tools, one local route; 004/005 byte-identical streams; every catalogue duration/resolution matches ffprobe; no deleted film on disk under tools/h3; 61/63 commits with the author trailer, no subagent wrote a repo line; no money/account/key moved in September; LAW D registered on his 'kanun olsun'; the voice ruling, the road-from-the-brief, Flux-local scope and the one-take rule present in the applying seats.

## 4. All 111 merged findings, structured

Fields: severity (merger's) · lens (finder) · claim (current behaviour) · rule / expected · evidence (finder's, verbatim) · CEO impact · suggested fix (finder's, not an order) · **STATUS** with the author's re-measurement note.

### F001 [CRITICAL] The deleted films survive in records, the ledger, the archive, the vitrin and the company database while the record claims 'every record says only silindi'
- **Lens:** ceo-intent-coverage, product-truth, records-parity · **merged from:** records-parity:RP-01, product-truth:PT-02, ceo-intent-coverage:F05, product-truth:PT-22
- **Current behaviour (claim):** His 2026-09-05 order ('küçük not dahi olmasın') is recorded on B43 as fully executed; descriptions of the women's/Deniz's sneaker films and the two 2026-09-03 drafts survive in C66 (line 185), three ledger entries, STATE-ARCHIVE lines 224/249/2008, index.html:273, five media_jobs voice rows carrying OE-007's script lines and six audit_log rows including its QC verdict. The purge of 2026-09-05 was entity=task only.
- **Expected (rule / ruling):** CEO order 2026-09-05; LAW A; 'What the CEO drops is not written down'; conflict with B36 audit-log immutability unnamed · **authority layer:** (2) registered ruling vs (4)/(5)/(6) records and DB
- **Evidence (finder):**
  - Ledger vitrin-women-ugc-and-deniz-cards-removed-2026-09-04 verbatim: 'yani bu projede de hiç bir yerde olmasın. küçük not dahi olmasın.'
  - Board B43 line 146: 'every record says only "silindi — CEO emri 2026-09-05"'
  - Complaint ledger line 185 (C66) narrates the four locked shots, TTS overlay, wardrobe drift; ledger entries two-brain-trial-run-approved / studio-hands-before-production / law-d-draft-first carry 'since deleted' notes; STATE-ARCHIVE:224,249,2008; index.html:273 'the four-shot films of that night (since deleted…)'
  - SELECT … FROM media_jobs WHERE kind='voice' → 5 rows 2026-09-03 with notes 'OE-007 line 1 HOOK' … texts 'Get yours at OutletEuro.'; audit_log rows 'film.DXB-V-OE-007.native-draft-cut-complete', 'qc.verdict.DXB-V-OE-007'
  - audit_log records.purge 2026-09-04 22:26 UTC → entity 'task', purged 10; commit 0d3e0a08 claims 'task and job rows purged'
- **CEO impact:** He reads the deletion as done; his own complaint row, three ledger entries, the archive, his review page and the job book still narrate the films.
- **Suggested fix (finder):** List the surviving places to him; on his word reduce each to 'silindi — CEO emri 2026-09-05', purge the five voice rows through control_records_purge, put the audit_log immutability conflict to him in one line, correct B43 and commit wording.
- **STATUS: VERIFIED.** media_jobs rows naming OE-007: 5; audit_log rows naming OE-007/OE-005: 6 (SELECT, company DB); index.html:273 carries 'the four-shot films of that night (since deleted…)'; three Sep ledger entries describe the deleted films; board B43 says every record says only 'silindi'.

### F002 [CRITICAL] STATE.md says the 2026-09-04 films were made through the company's own road — they were not (C67's misstatement repeated in the live position)
- **Lens:** product-truth · **merged from:** product-truth:PT-01
- **Current behaviour (claim):** STATE's 'Honest position' says the studio's films were 'made through the company's own road on 2026-09-04/05 … three on 2026-09-04'. Measured: EYW-001 v2, 002C, 003 never touched the road; only 004/005 did.
- **Expected (rule / ruling):** Measure never guess RULE #0-A; C67 verbatim 'bana önceki session yalan söylemiş' · **authority layer:** (5) STATE vs (6) DB and complaint ledger
- **Evidence (finder):**
  - STATE.md 'Honest position': 'made through the company's own road on 2026-09-04/05 and accepted by his eye — three on 2026-09-04, the fourth on 2026-09-13'
  - media_jobs: first shoot row 6b28a204 at 2026-09-05 00:11 UTC (EYW-004); no rows for 001/002/003; tasks: none labelled EYW-001/002/003
  - Ledger studio-brain-fable-5-1-opus-5-standby-2026-09-05: 'no agent_runs, tasks or media_jobs exist for 2026-09-04'; C67 line 186: 'company holds 0 tasks, 0 agent_runs, 0 media_jobs'
- **CEO impact:** He plans on a road that has produced one accepted film (005), told it produced four.
- **Suggested fix (finder):** Rewrite: '001 v2, 002C, 003 made by the 2026-09-04 session's own hands (C67); 005 the only film through the company's road'; align board.
- **STATUS: VERIFIED.** STATE.md 'Honest position' (lines 53–60) reads: 'the studio's films, made through the company's own road on 2026-09-04/05 … three on 2026-09-04'; ledger studio-brain-fable-5-1-opus-5-standby-2026-09-05 says no agent_runs/tasks/media_jobs exist for 2026-09-04 (films made by the session holding the seats).

### F003 [CRITICAL] STATE.md presents author-written text as the CEO's verbatim words ('His working style, in his words'), including 'KANUN C'
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-01
- **Current behaviour (claim):** The only transcript containing 'benim dilimde' / 'KANUN C' in that form is an assistant message of 2026-09-04 23:36 drafting a handover in the CEO's first person; STATE:70 and STATE-ARCHIVE:224 call it 'recovered verbatim'.
- **Expected (rule / ruling):** Measure never guess; 'nothing becomes a law unless he says' · **authority layer:** (5) STATE vs (1) his actual utterances
- **Evidence (finder):**
  - STATE.md:70 'His working style, in his words (recovered verbatim 2026-09-13): konu konu, tek soru … KANUN C …'
  - grep 'benim dilimde' over 2026-09-04/05 transcripts → one file b9c12c28…jsonl, role=assistant 2026-09-04T23:36:52Z; the 21 MB CEO transcript cc4bbd0d… → 0 hits
  - git log -S'benim dilimde (cevap' -- STATE.md → first in 400b2ba2 (2026-09-13)
- **CEO impact:** Every session obeys a list of 'his own words' he never said in that form; the C67 class.
- **Suggested fix (finder):** Rewrite as an author summary of working-mode-topic-by-topic-2026-09-03; strip 'verbatim'; keep only items carrying a ledger id or his real sentence; ask him in one line.
- **STATUS: VERIFIED.** STATE.md:70 says 'His working style, in his words (recovered verbatim 2026-09-13)'; transcript grep 'benim dilimde (cevap': first occurrence type=assistant 2026-09-04T23:36:52 (session b9c12c28); user occurrences follow at 23:41 (the pasted handover). Author-composed, then pasted by the CEO.

### F004 [CRITICAL] Row B43 files the hands, lanes and dispatch book under 'BUILT AND STANDING (accepted by his eye or his word)' with plan-approval and delegation ids that are not acceptances
- **Lens:** ceo-intent-coverage, governance-compliance, records-parity · **merged from:** ceo-intent-coverage:F01, records-parity:RP-09, governance-compliance:GC-10
- **Current behaviour (claim):** The ids beside the HANDS are LAW C consents to build; the id beside the DISPATCH BOOK says 'Nothing here is ACCEPTED'; c27-closed accepts film 005 and the complaint, not code; CEO-OK markers also sit beside the evening corrections whose entry is his order to audit, not his eye.
- **Expected (rule / ruling):** LAW B; LAW C (plan approval = consent to build) · **authority layer:** (2) ledger texts vs (4) board heading
- **Evidence (finder):**
  - B43 line 146: 'BUILT AND STANDING (accepted by his eye or his word …) … <!-- CEO-OK: studio-hands-build-plan-approved-2026-09-03 --> … <!-- CEO-OK: plan-2-dispatch-book-delegated-2026-09-05 -->'
  - Ledger plan-2-dispatch-book-delegated-2026-09-05: 'Nothing here is ACCEPTED: the code, the records and the film wait for his eye (LAW B)'; studio-hands-build-plan-approved verbatim 'Onaylıyorum, başla'
  - Ledger c27-closed-on-his-word-2026-09-13 verbatim 'kapatabilirsin 005 i beğendim.'; external-audit-before-next-leg-2026-09-03 verbatim 'Denetçiye yapılan herşeyi denettirmemiz lazım'
  - STATE.md:25 and B43 place <!-- CEO-OK: audit-of-the-days-work-corrected-2026-09-14 --> beside 'every fault fixed'; that entry's verbatim is 'denetle … düzelt'
- **CEO impact:** He reads that code he never looked at is accepted; the one thing he ordered for it — an audit — is recorded as still waiting.
- **Suggested fix (finder):** Split the section: accepted by his eye (department, films) · done on his order · BUILT AND WAITING HIS EYE/THE AUDITOR (hands, lanes, book, clock, QA receipt, corrected seats); add these to STATE's waits list.
- **STATUS: VERIFIED.** Row B43 line 146 'BUILT AND STANDING (accepted by his eye or his word)' lists the hands under studio-hands-build-plan-approved / hands-lanes-plan-approved (plan consents) and the dispatch book under plan-2-dispatch-book-delegated (entry text: 'Nothing here is ACCEPTED') + c27-closed (film + complaint). Read from the row.

### F005 [CRITICAL] Row B43 asserts the six WanGP engines are 'HELD, installed' and forbids re-checking them — WanGP is not installed and no Wan/LTX/Hunyuan/Open-Sora weights exist
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F02
- **Current behaviour (claim):** His sentence was written onto the row as a measured fact with a research ban; the station holds only MiniMax H3 and FLUX; WanGP and the four engines are STUDY cards; B28/B33 say none measured; the row's own footnote says nothing but H3 is measured.
- **Expected (rule / ruling):** RULE #0-A; bench law 3 (B33) · **authority layer:** (3) directive and board law vs (4) row text; (6) machine
- **Evidence (finder):**
  - B43 line 146: 'six engines … HELD, installed, at zero marginal licence cost … A session that researches those six as if they were new candidates has wasted its run'
  - ls /home/dxb/tools/ → no WanGP dir; find -iname '*wan2gp*' → nothing; ComfyUI-models: comfyorg, unsloth, flux only
  - study-cards/wan2gp.md:8 'Status: STUDY'; B28 line 139 'NOT ONE of the four local engines has been measured on this card'
  - B43 same line: 'NOTHING IN THIS SECTION IS MEASURED ON THIS STATION EXCEPT H3'
- **CEO impact:** He decides paid/free believing six free engines are installed.
- **Suggested fix (finder):** Replace with the measurement (held: MiniMax H3, FLUX.1-Krea; WanGP engines = study cards, not installed); tell him the sentence was recorded without a measurement; fold install/measure into a leg.
- **STATUS: VERIFIED.** find /home/dxb -maxdepth 3 -iname '*wangp*' → nothing; /home/dxb/tools/ComfyUI/models/diffusion_models holds only the placeholder file; row B43 says the six WanGP engines are 'HELD, installed' while its own footnote says nothing but H3 is measured.

### F006 [HIGH] Row B43's 2026-08-31 doctrine keeps superseded sentences in force with amendments (a)–(k) appended — the LAW A pattern he condemned in the seats the same day; several contradictions are not even amended
- **Lens:** plan-quality, records-parity, rulings-vs-seats · **merged from:** plan-quality:PQ-01, rulings-vs-seats:RS-06, records-parity:RP-02
- **Current behaviour (claim):** The doctrine still orders 'Voice from TTS', 'never text-to-video from nothing', 'scrap by policy', 'UPSCALE to 2K-4K' at step 6, Flux hero frames as engine floor, 6–10 shots of 3–5 s, a mandatory master reference set before any generation; the amendment block covers only some of these (steps ④, ⑤–⑥, 'steps 6–9 need no card'); the pre-split and mandatory-still sentences have no amendment at all.
- **Expected (rule / ruling):** LAW A; rulings tts-cancelled 09-04, road-comes-from-the-brief 09-04, law-d 09-03, flux-local-engine-only 09-14 · **authority layer:** (2) rulings vs (4) board
- **Evidence (finder):**
  - B43 line 146: 'Voice from TTS, assembly from FFmpeg/Remotion/DaVinci'; '(4) MOTION … never text-to-video from nothing'; 'A shot generated from a prompt … is scrap by policy'; '(6) UPSCALE / REGENERATE to 2K-4K'; 'THE IMAGE HAND IS PART OF THE ENGINE FLOOR'
  - B43: '⑤ 6–10 perfect shots of 3–5 seconds'; 'Every job therefore opens with a MASTER REFERENCE SET before one shot is generated'; leg (3): 'no film pre-split into a fixed number of parts'
  - B43: 'AMENDMENTS TO THE DOCTRINE ABOVE … the worked example above is read through these' — (a) step ④ only, (d) ⑤–⑥, (i) card; nothing on the pre-split or reference-set lines
  - CLAUDE.md LAW A 'Not a footnote beside it'; ledger continuity-rule-contradictions-removed-2026-09-14 verbatim 'Yalnız yeni cümleyi ekleyip eski emri bırakma'
- **CEO impact:** The next plan built from the row's 'production law' reproduces C68.
- **Suggested fix (finder):** On his word delete the contradicted doctrine sentences in place, write the ruling where each stood, record what went; dissolve the footnote block.
- **STATUS: VERIFIED.** sed -n 146p board | grep -o: 'Voice from TTS' ×2, 'never text-to-video from nothing' ×2, 'is scrap by policy' ×2, 'Flux/OpenAI-class' ×1, 'the approved frame handed to the video engine' ×1 — all live text; amendments (a)–(k) cover roads/voice/faces/LAW D/steps/lettering/cast/brain/card/SeedVR2/reviewers, not the 6–10-shot pre-split nor the mandatory still.

### F007 [HIGH] Row B43's header, status cell and 'may not be planned before B32' sentence say nothing is started or built while the body records five built legs and six approved plans
- **Lens:** ceo-intent-coverage, plan-quality, spec-ownership · **merged from:** plan-quality:PQ-06, spec-ownership:SO-03, ceo-intent-coverage:F04, ceo-intent-coverage:F14
- **Current behaviour (claim):** The row's scan-level text ('nothing drawn, nothing built', 'WHY IT IS OPEN AND NOT STARTED', 'this row may not be planned before [B32]') contradicts its BUILT AND STANDING block, 63 commits and six plan approvals on his word.
- **Expected (rule / ruling):** U41; board law 5; LAW A · **authority layer:** (4) board vs (5)/(6)
- **Evidence (finder):**
  - B43 status cell: '| Ordered 2026-08-31; nothing drawn, nothing built | **CEO** for the drawing (B32), then AUTHOR |'
  - B43: 'WHICH SINGLE COMMAND PROVES IT: not yet nameable … this row may not be planned before that'; 'WHY IT IS OPEN AND NOT STARTED'
  - B43 body: 'BUILT AND STANDING … the department … HANDS … DISPATCH BOOK … (2b) THE CLOCK — BUILT 2026-09-13'; git log --since=2026-09-03 → 63 commits
  - Ledger: six plan approvals on the row (studio-hands-build-plan, hands-lanes-plan, plan-2, budget-per-job, astra-rule, external-hands-ready-leg)
- **CEO impact:** The line he reads without folding tells him the studio was never started.
- **Suggested fix (finder):** Rewrite status cell and header to the measured position; 'the SCREEN may not be drawn before B32; the road is planned leg by leg on his approval'.
- **STATUS: VERIFIED.** Row B43 status cell reads 'Ordered 2026-08-31; nothing drawn, nothing built'; header section 'WHY IT IS OPEN AND NOT STARTED' and 'this row may not be planned before [B32]' stand beside BUILT AND STANDING and 63 commits since 2026-09-03.

### F008 [HIGH] CAPABILITY_ARSENAL_DOCTRINE §11/§9 — the studio's owning drawer — still prescribes edge-tts as the ad voice, Flux hero frames for step ③, RealESRGAN as enlarger and a 'one at a time' lane, against four later rulings
- **Lens:** ceo-intent-coverage, plan-quality, spec-ownership · **merged from:** plan-quality:PQ-02, spec-ownership:SO-17, spec-ownership:SO-18, spec-ownership:SO-27, ceo-intent-coverage:F08
- **Current behaviour (claim):** The spec the row names as the VIDEO drawer was not touched after 2026-09-03 except for film deletions; three rulings (TTS 09-04, brief-road 09-04, Flux-local 09-14) and A18 (lanes) are unapplied.
- **Expected (rule / ruling):** LAW A; board law 5 · **authority layer:** (2) later rulings vs (3) spec
- **Evidence (finder):**
  - CAPABILITY_ARSENAL_DOCTRINE.md §11: '| edge-tts | processor only | the spoken line in a talking advertisement |'; '| FLUX.1-Krea-dev | our card, ComfyUI | hero frames and reference sets — B43 step ③ |'; '| RealESRGAN ×4 | our card | enlargement to delivery size |'; §9:249 'runs it on the holding's card one at a time'
  - git log --since=2026-09-04 -- CAPABILITY_ARSENAL_DOCTRINE.md → one commit (35f3f445, deletions); git log -S'edge-tts' → last 2693b9cd 2026-09-03
  - Ledgers tts-cancelled-engine-voice-only-2026-09-04, flux-local-engine-only-everything-made-here-2026-09-14, road-comes-from-the-brief-t2v-default-2026-09-04; AGENT_ORCHESTRATION A18 'one GPU lane and N CPU lanes'
- **CEO impact:** The plan's one owning drawer tells the next author to use TTS and Flux frames for local takes — C68 by spec.
- **Suggested fix (finder):** Amend §11 rows and §9's lane sentence in place, dated with ledger ids; add SeedVR2/engine-voice as current truth.
- **STATUS: VERIFIED.** CAPABILITY_ARSENAL_DOCTRINE.md:277 'RealESRGAN ×4 … enlargement to delivery size', :278 'edge-tts … the spoken line in a talking advertisement' — after tts-cancelled-engine-voice-only-2026-09-04.

### F009 [HIGH] The cancelled TTS instrument (edge-tts, a Microsoft cloud service absent from STACK.md) is still a callable `voice` hand on every studio seat while the Sound seat says it holds no voice tool
- **Lens:** code-vs-records, plan-quality, rulings-vs-seats · **merged from:** plan-quality:PQ-03, rulings-vs-seats:RS-02, code-vs-records:CVR-07
- **Current behaviour (claim):** media_submit accepts kind 'voice' running edge-tts (default en-US-AvaNeural), pinned in the media-studio profile for all 16 seats; the guard is a parenthetical in the description; media.ts:19 calls these 'the holding's own engines'.
- **Expected (rule / ruling):** tts-cancelled-engine-voice-only-2026-09-04; LAW A; STACK.md 'tools before packages' · **authority layer:** (2) ruling vs (6) code
- **Evidence (finder):**
  - packages/dxb-mcp/src/groups/media.ts:150 'voice {…} — a TTS line (the studio's films use the engine's own voice, CEO 2026-09-04)'; :155 kind enum includes "voice"; :19 'Money never leaves the company here'
  - packages/outbox-executor/src/media-lane.ts:305-317 voiceEngine → resolveUserBinary('edge-tts'…) '--voice' 'en-US-AvaNeural'
  - packages/gateway/profiles/media-studio.mcp.json pins media_submit; STACK.md:29 TTS = Speaches (Kokoro/Piper), grep edge-tts → 0
  - media-sound-music.md:110 'No voice tool: this seat holds no TTS…'; media_jobs voice done 5 (all 2026-09-03)
- **CEO impact:** A synthetic voice is one tool call from every seat; the persona's assurance is false.
- **Suggested fix (finder):** Put to him (LAW C): refuse kind 'voice' at media_submit or drop it; correct sound-music.md:110 and media.ts:19; record edge-tts in STACK.md if any use remains.
- **STATUS: VERIFIED.** packages/outbox-executor/src/media-lane.ts:307–310 resolves edge-tts and runs it with --voice en-US-AvaNeural; groups/media.ts:155 kind enum includes 'voice'; media_submit is in profiles/media-studio.mcp.json.

### F010 [HIGH] Residual voice instructions in three seats: the Screenwriter writes voice-over/narration, the Storyboard seat builds animatics on a 'scratch voice', the Editor permits 'AI voice' tools — none producible after the TTS ruling
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-03, rulings-vs-seats:RS-09, rulings-vs-seats:RS-10
- **Current behaviour (claim):** Six Screenwriter sentences, four Storyboard sentences and one Editor governance line assume a voice source the Sound seat says does not exist; the board's long-form doctrine still says 'voice-over over stills'.
- **Expected (rule / ruling):** tts-cancelled-engine-voice-only-2026-09-04 · **authority layer:** (2) ruling vs (6) seat text; (4) board long-form doctrine
- **Evidence (finder):**
  - media-screenwriter.md:19,22,53,72,73,75 'voice-over copy', 'narration written to stills'
  - media-storyboard-previz.md:22,53,69,110 'scratch track' / 'scratch voice'
  - marketing-short-video-editing-coach.md:73 'AI voice/cleanup tools → within the brand's authenticity rules'
  - media-sound-music.md:56 'there is no third state'; :68 'no TTS track … no recorded, cloned or synthesised voice'; ledger tts-cancelled verbatim 'reklamdan tut filme kadar'
- **CEO impact:** The first spot or long form is planned with narration nobody may voice, or TTS creeps back.
- **Suggested fix (finder):** One question to him on how non-engine narration is voiced; then rewrite the eleven sentences and the board's 'voice-over over stills'; add /AI voice|scratch voice/ to the road test CONTRA list.
- **STATUS: PARTIALLY VERIFIED.** media-screenwriter.md:19,22,72,73 carry voice-over / narration lines (confirmed); the Storyboard 'scratch voice' and the Editor 'AI voice' clauses were not re-read in full by the author (storyboard:69 and editing-coach:73 seen truncated).

### F011 [HIGH] The constitutional cast rule (men and elderly women only) is written into none of the 16 seats
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-01
- **Current behaviour (claim):** The Identity seat's hard gates, the Film Director's casting rules and the Creative Director's casting line carry no restriction; a brief casting a young woman passes every seat.
- **Expected (rule / ruling):** avatar-cast-men-and-elderly-women-only-2026-09-03 (constitutional) · **authority layer:** (2) ruling vs (6) seat text
- **Evidence (finder):**
  - grep over 16 seats → only creative-director.md:70 / character-identity.md:70 'the next tests use a male presenter and a senior woman presenter'
  - media-character-identity.md:79 hard gates list no cast restriction; media-film-director.md:117 'no casting outside the approved cast sheets'
  - Ledger avatar-cast-men-and-elderly-women-only-2026-09-03: 'code may refuse a brief that casts outside it and may never widen it'
- **CEO impact:** The seats can cast against his standing ruling; he catches it on the vitrin.
- **Suggested fix (finder):** One sentence in Identity §4, Film Director §4, Creative Director §3; ANCHOR regex in road-consistency.test.ts.
- **STATUS: VERIFIED.** grep -i 'elderly|yaşlı teyze|men and elderly|only men' over the 16 seat files → 0 files.

### F012 [HIGH] Eleven clauses in six seats still admit only two cast roads — the engine-born presenters AHMET and JAMES would be refused
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-04
- **Current behaviour (claim):** The audit record says the gate was 'opened to the three roads'; the Film Director's refusal list and Identity/Storyboard/Advertising/Continuity criteria still enumerate real photograph OR written sheet.
- **Expected (rule / ruling):** ahmet-cast-member-born-in-engine-2026-09-04; flux-avatars-retired-2026-09-13 · **authority layer:** (2) rulings vs (6) seat text
- **Evidence (finder):**
  - media-film-director.md:28,77,79 'a presenter without a real photograph or a written sheet'
  - media-character-identity.md:60 'Two roads' and :92 beside :53/:79 which name three roads; storyboard:72,91; advertising:68; continuity:72; creative-director:62,86
  - Ledger audit-of-the-days-work-corrected-2026-09-14 (3) 'opened to the three roads he accepted'; STATE:29 'every generated face born in MiniMax H3 (AHMET, JAMES)'
- **CEO impact:** The only presenters he has fail the seats' own criteria; the record says otherwise.
- **Suggested fix (finder):** Replace every two-road enumeration with the three-road sentence; add CONTRA regexes and a 'born in the engine' anchor to the road test.
- **STATUS: VERIFIED.** media-character-identity.md:60 and :92, media-creative-director.md:86, media-film-director.md:28 and :79 enumerate 'real photograph OR written sheet' with no engine-born road; FD:79 'Declines … a presenter without a real photograph or a written sheet'.

### F013 [HIGH] The 4-step engine standard is absent from all 16 seats while three seats call low-step recipes 'hunting only, never a keeper'
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-05
- **Current behaviour (claim):** The Engineer, Film Director and Creative Director would shoot keepers slower than his standard.
- **Expected (rule / ruling):** engine-standard-4-steps-no-upscale-unless-asked-2026-09-04 · **authority layer:** (2) vs (6)
- **Evidence (finder):**
  - grep '4 steps|sampling steps|8 steps' over 16 seats → 0
  - media-ai-video-engineer.md:70,87 'a keeper on a hunting recipe is rejected'; creative-director:89; film-director:65,78
  - Ledger engine-standard-4-steps-no-upscale-unless-asked-2026-09-04; media.ts:148 '4 = the studio standard'; KATALOG 004/005 '4 adım' accepted
- **CEO impact:** A keeper at 8 steps takes 19 minutes, what he called too slow.
- **Suggested fix (finder):** One sentence in Engineer §3, CD:89, FD:65: keeper = 4 steps at native draft (2026-09-04), changed only by a measured A/B put to him.
- **STATUS: DOWNGRADED.** 0/16 seats name the 4-step standard (confirmed) — but the 'never a keeper' phrase is not in the files; media-creative-director.md:89 says 'the keeper is shot with the recipe the measured exam approved' (which is the 4-step recipe). Downgraded high → medium: a missing explicit standard, not a contradiction.

### F014 [HIGH] LAW C ('KANUN C') is cited and obeyed everywhere but has no registered ruling in ceo-approvals.json
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-02
- **Current behaviour (claim):** The law rests on an author note of 2026-09-03 quoting 'EVET YASA OLSUN'; no ledger entry carries it; no gate can check it.
- **Expected (rule / ruling):** LAW B registration principle; 'nothing becomes a law unless he says' · **authority layer:** (2) ledger holds nothing; (5) STATE carries the claim
- **Evidence (finder):**
  - git show 288234a5 -- STATE.md: '+3. LAW C stands on his word ("EVET YASA OLSUN", 2026-09-03 00:00)'; now STATE-ARCHIVE:238
  - grep -i 'yasa olsun' ceo-approvals.json → 0; jq keys matching 'law' → law-d only
  - Cited in STATE.md:70, three NEXT-SESSION-PROMPT files, memory index
- **CEO impact:** A law is enforced on him on an author's note; nobody can verify his words.
- **Suggested fix (finder):** Register law-c with his actual sentence and timestamp from the transcript, or remove KANUN C and tell him.
- **STATUS: VERIFIED.** jq keys | grep -i 'law-c|kanun-c|yasa' → none; grep -c 'YASA OLSUN' ceo-approvals.json → 0; transcript grep of USER messages for 'yasa olsun'/'kanun olsun' finds only 2026-08-19 and 2026-08-25 (other rules) and LAW D (2026-09-03, hook echo) — no user message minting LAW C found (⚠ transcripts may be compacted).

### F015 [HIGH] Session-only remarks written into standing files again — including 'kısa yaz', the exact remark he caught on 2026-08-13
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-03
- **Current behaviour (claim):** STATE.md:27 and NEXT-SESSION-PROMPT-2026-09-14.md:21/28 carry his passing remarks as instructions for the next session without the one-line question the prohibition requires.
- **Expected (rule / ruling):** CEO 2026-08-13 prohibition · **authority layer:** (2) prohibition vs (5) STATE and handover files
- **Evidence (finder):**
  - NEXT-SESSION-PROMPT-2026-09-14.md:28 'ÇALIŞMA TARZIM: … "bir bok yapma" = dur; kısa yaz.'; :21 'Kararlarım (oturumluk söz, kanun değil) …' handed to the next session
  - STATE.md:27 'His remarks this session, applied and not made law: no jargon to him, no "shall I write it" — find and fix'
  - CLAUDE.md §2: 'Measured the day he gave it: his passing "write it short" had been promoted'; diary 0 hits for 'asked him'
- **CEO impact:** The forbidden behaviour repeated with the same word.
- **Suggested fix (finder):** Delete the remarks; where one should persist, ask him in one line and register his answer.
- **STATUS: DOWNGRADED.** STATE.md:27 carries 'His remarks this session, applied and not made law'; NEXT-SESSION-PROMPT-2026-09-14.md:28 carries the working-style paragraph but the file is marked SUPERSEDED. Downgraded high → medium: the remark is labelled as not-law; the prohibition's one-line question was still not asked.

### F016 [HIGH] Handover prompts are written in the CEO's first person, carry author-composed orders as his, and are Turkish artifacts inside the repository
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-04
- **Current behaviour (claim):** Three .planning files speak as 'ben DxB Global OS'in CEO'su Muhittin Bey' and issue instructions the author wrote ('bana sormadan dokunma', 'anlayış raporu yeniden istemez'), reaching the next session at authority layer 1; wholly Turkish planning artifacts.
- **Expected (rule / ruling):** 00-CEO-DIRECTIVE-LANGUAGE §1; authority order layer 1 must be his voice · **authority layer:** (2) directive; (1) authority of his voice
- **Evidence (finder):**
  - NEXT-SESSION-PROMPT-2026-09-13.md:7, -13b:7, -14:9 'Selam, ben DxB Global OS'in CEO'su Muhittin Bey'
  - -13.md:16 'bana sormadan dokunma' (contradicts dxb-start SKILL.md:23-24); :32 'anlayış raporu yeniden istemez'
  - 00-CEO-DIRECTIVE-LANGUAGE.md:8-9 'any artifact produced during that conversation is still English'; Turkish-letter line counts 20/15/17
- **CEO impact:** The record cannot distinguish his orders from the author's.
- **Suggested fix (finder):** Handovers in English, author's voice, 'the CEO ordered …' with ledger ids; quote him only where the ledger carries the sentence.
- **STATUS: VERIFIED.** NEXT-SESSION-PROMPT-2026-09-13.md / -13b.md / -14.md open with '# CEO → next session' and speak in the CEO's first person in Turkish ('kabul ettiğim her film', 'ÇALIŞMA TARZIM').

### F017 [HIGH] STATE.md §4 orders the next session to write a handover prompt (citing a dxb-start step that does not exist) — against his 17:1x order 'devir promtu yazma'
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-05
- **Current behaviour (claim):** STATE:76 stands unamended after his order; dxb-start Phase 5 has no handover-prompt step; the 17:1x order is in no ledger entry.
- **Expected (rule / ruling):** LAW A; CLAUDE.md §4 doors own procedure · **authority layer:** (1) live order vs (5) STATE
- **Evidence (finder):**
  - STATE.md:76 'Handover, when he closes a session (dxb-start Phase 5): the next session's prompt goes to …'
  - dxb-start/SKILL.md:78-85 Phase 5 lists board row, STATE.md, owning spec — no handover step
  - git show 9479bf9b → only NEXT-SESSION-PROMPT-2026-09-14.md changed ('devir promtu yazma')
- **CEO impact:** The next session writes the prompt he told it not to write.
- **Suggested fix (finder):** Delete/rewrite STATE:76 on his word; register the order if it stands.
- **STATUS: VERIFIED.** STATE.md:76 orders the handover prompt 'per dxb-start Phase 5'; .claude/skills/dxb-start/SKILL.md:78 Phase 5 is 'records, in the SAME session' with no handover/NEXT-SESSION step; commit 9479bf9b says the CEO ordered no handover prompt.

### F018 [HIGH] 'RULES BORN ON THIS ROW AND STILL LIVE' promotes eight session-made rules to standing rules with no registered word from him
- **Lens:** governance-compliance, records-parity · **merged from:** records-parity:RP-03, governance-compliance:GC-07
- **Current behaviour (claim):** At least four are the session's generalisations of a complaint or a measurement (skin-mark, per-folder list with sizes, phone on a tripod, film folder contents); no ledger entry registers any as a rule; no 'asked him' in the diary.
- **Expected (rule / ruling):** CEO 2026-08-13 prohibition · **authority layer:** (2) prohibition vs (4) board
- **Evidence (finder):**
  - B43 line 146: 'RULES BORN ON THIS ROW AND STILL LIVE … no skin-mark descriptor … a deletion he orders is executed only after the per-folder list WITH sizes … "a phone on a tripod" draws the phone in frame'
  - STATE-ARCHIVE diary: his words 'bu adamın yüzündekiler ne ya'; the rule sentence is the session's; 'ne 15 gb yaaa' → memory note delete-list-sizes
  - jq over ceo-approvals.json for skin|tripod|WITH sizes → no studio entry; diary 'kanun olsun' → LAW D only
- **CEO impact:** Rules he never enacted bind seats and sessions under his name.
- **Suggested fix (finder):** List the eight to him; keep and register those he confirms; demote the rest to dated diary lessons.
- **STATUS: PARTIALLY VERIFIED.** The eight 'RULES BORN ON THIS ROW AND STILL LIVE' are on the row with no ledger id (confirmed); whether each rests on his words was not traced rule by rule (the folder rule and the deletion-list rule come from his own complaints of 2026-09-01/05).

### F019 [HIGH] The evening audit's correction ⑦ is incomplete: 'across all 16 seat files', '20/32 → 32/32 kept as regression test' and '122 place phrasings' still stand in the ledger and evidence, and 122 is not reproducible
- **Lens:** ceo-intent-coverage, records-parity · **merged from:** records-parity:RP-04, ceo-intent-coverage:F03
- **Current behaviour (claim):** STATE and the audit entry claim the ledger was corrected; the flux-local-engine-only and continuity-rule-third-pass entries are unchanged; the commit shows 13 files and ≤68 replacements.
- **Expected (rule / ruling):** RULE #0-A; LAW A; board law 5 · **authority layer:** (2) ledger contradicting itself vs (6) commit
- **Evidence (finder):**
  - STATE.md:27 '"all 16 seat files" → 13'; ceo-approvals.json:709 (flux-local-engine-only…) still 'Applied: 122 place phrasings … across all 16 seat files'; EVIDENCE-continuity-rule-2026-09-14.md:148 same
  - continuity-rule-third-pass entry still '20/32 … 32/32 after … kept as a regression test'
  - git show --stat afb7b553 → 13 persona files; removed 'station' lines 86, added 18 → ≤68
- **CEO impact:** He was told the day's records were made consistent; the ledger still gives the refuted numbers.
- **Suggested fix (finder):** Amend the entries in place (LAW A) with the measured count and command or mark 122 UNVERIFIED; re-run verify:ledger.
- **STATUS: VERIFIED.** ledger-sep.md: 'all 16 seat files' ×2 (flux-local-engine-only…, continuity-rule-third-pass…), '122 place phrasings replaced … across all 16 seat files', '20/32 before the fixes, 32/32 after' still present after the 'corrected' audit entry.

### F020 [HIGH] The complaint-renumbering ledger entry is garbled ('C66–C68 colliding with C66–C64') and C68's numbering note is stale and false
- **Lens:** plan-quality, records-parity · **merged from:** plan-quality:PQ-09, records-parity:RP-05
- **Current behaviour (claim):** The board carries C26…C64; the entry replaced the old numbers inside the sentence explaining the collision; C68 says a defect 'waits for his word' that was fixed the same night.
- **Expected (rule / ruling):** LAW A; measure never guess · **authority layer:** (2) ledger text vs (4) board
- **Evidence (finder):**
  - Ledger flux-avatars-retired-and-complaint-numbering-2026-09-13 what: 'had been written as C66–C68, colliding with the board's July series (C66–C64)'
  - Complaint ledger:4 (correct): 'written as C26–C28, colliding with … (C26–C64)'; board grep '| C6[678] |' → 0
  - Complaint ledger:187 (C68): 'the board's July series also carries C66–C68 … waits for his word, not fixed here' — commit c320d7f8 fixed it
- **CEO impact:** The ruling that fixed the numbering describes a collision that does not exist; C68 tells him a settled thing still waits.
- **Suggested fix (finder):** Rewrite the what-field; delete or date C68's numbering note.
- **STATUS: VERIFIED.** ledger flux-avatars-retired-and-complaint-numbering-2026-09-13 text: 'written as C66–C68, colliding with the board's July series (C66–C64)'; complaint row C68 (line 187) ends 'waits for his word, not fixed here'.

### F021 [HIGH] 'The seats' status untouched (14 dormant, 2 assigned active)' in the ledger, the board and the vitrin matches no column: all 16 seats and all 219 agents read status=dormant, employment_status=active for all 16; no gate claim covers studio counts
- **Lens:** code-vs-records, gate-strength, governance-compliance, plan-quality, product-truth, records-parity, spec-ownership · **merged from:** plan-quality:PQ-07, records-parity:RP-07, code-vs-records:CVR-05, product-truth:PT-16, governance-compliance:GC-08, spec-ownership:SO-08, gate-strength:GS-04
- **Current behaviour (claim):** Two ledger entries, B43 (twice), 'ACTIVE through the HR chain', STATE's '16 dormant' and index.html:284 '14 uzman aktif' describe the seats incompatibly; the evidence file has the correct form; claims.json registers no studio fact so ledger-truth cannot see it.
- **Expected (rule / ruling):** RULE #0-A; U41 · **authority layer:** (6) DB vs (2)/(4)/(5) records
- **Evidence (finder):**
  - SELECT slug,status,employment_status FROM agents WHERE department='media-studio' OR slug IN (…) → 16 rows 'dormant | active'; GROUP BY → dormant|active 213, dormant|archived 6; departments media-studio status='dormant'
  - Ledger continuity-rule-contradictions-removed-2026-09-14 and third-pass: 'the seats' status untouched (14 dormant, 2 assigned active)'; B43 line 146 same phrase; index.html:284
  - EVIDENCE-continuity-rule-2026-09-14.md:85 'the two assigned seats dormant / employment active'; claims.json 18 claims, none studio
- **CEO impact:** He cannot tell from his records whether his studio is switched on; a green gate stands beside a false status.
- **Suggested fix (finder):** Replace with '16 × employment active, 16 × legacy status dormant' everywhere; register studio claims (seats, bound-version parity, media_jobs by status) in claims.json.
- **STATUS: VERIFIED.** agents table: all 16 studio seats status=dormant, employment_status=active (SELECT 17:2x); ledger text '14 dormant, 2 assigned active' ×1; index.html:284 '14 uzman aktif + 2 koltuk atamayla'.

### F022 [HIGH] A cancelled running shoot is written into the job book as 'failed' with an opaque Turkish error — race in media-lane.ts; the one real cancellation (16277dac) is mislabelled and the cancel path is untested on a real process
- **Lens:** code-vs-records · **merged from:** code-vs-records:CVR-01
- **Current behaviour (claim):** The watchdog awaits stopScoped before rejecting 'cancelled'; the child's close handler rejects first with 'python exited null: …'; anything not 'cancelled' becomes 'failed'; the same loss applies to deadline kills; the unit test uses a fake engine that throws the magic string.
- **Expected (rule / ruling):** RULE #0-A; LAW A note on lying records · **authority layer:** (6) code/DB vs (7) evidence narrative
- **Evidence (finder):**
  - media-lane.ts:510-522 watchdog awaits stopScoped then reject('cancelled'); :524-528 close handler rejects `${basename(cmd)} exited ${code}`; :654-656 status = message==='cancelled' ? 'cancelled' : 'failed'
  - media_jobs 16277dac: 'shoot | failed | python exited null: istek: 640x1152 · 362 kare …'; audit_log 00:24:41 media.cancel → 00:24:44 media.failed
  - EVIDENCE-dispatch-book-2026-09-05.md:66 'the duplicate take was cancelled through media_cancel'; tests/b43/media-hands.test.ts:843-849 fake throws 'cancelled'
- **CEO impact:** His screen shows a FAILED take on a job the studio cancelled; the times table counts a false failure.
- **Suggested fix (finder):** Set killedFor before stopScoped and reject with it in the close handler; real-process test; correct the row on his word and the 'shoot failed 1' record.
- **STATUS: VERIFIED.** media_jobs row 16277dac: kind shoot, status failed, cancel_requested=t, error 'python exited null: istek: 640x1152 · 362 kare …' (Turkish engine chatter); media-lane.ts:514–519 kill path.

### F023 [HIGH] A media job in 'running' has no reaper, heartbeat or start-up recovery; the service's 90 s stop timeout cuts a drain while the engine runs in a scope outside the service cgroup
- **Lens:** code-vs-records · **merged from:** code-vs-records:CVR-02
- **Current behaviour (claim):** reap_expired_leases touches tasks only; lanes peek 'queued' only; the engine is its own transient scope; TimeoutStopSec=90 s vs 625 s takes and 5400 s deadline; restarts so far were guarded by a human reading 'in flight 0'.
- **Expected (rule / ruling):** CLAUDE.md 'it keeps working when nobody is watching'; A16/A17 · **authority layer:** (3) spec and product law vs (6) code + systemd
- **Evidence (finder):**
  - pg_get_functiondef(reap_expired_leases) → tasks only; media-lane.ts:572-576 peek where status='queued'; :463-471 systemd-run --user --scope
  - systemctl --user show dxb-scheduler.service → TimeoutStopUSec=1min 30s, KillMode=control-group; scheduler.ts:707-718 stopScheduler awaits activeMediaLanes.stop()
  - EVIDENCE-clock-2026-09-13.md:57-58 'in flight … 0 at 21:49:54 / systemctl --user restart'; AGENT_ORCHESTRATION A17 'Retiring never cuts a lane mid-drain'
- **CEO impact:** One crash mid-take leaves a job 'running' forever, the card held by a ghost, the next take refused.
- **Suggested fix (finder):** Recover 'running' rows and kill orphan dxb-media-* scopes at scheduler start; heartbeat + reaper for media_jobs; TimeoutStopSec ≥ maxJobSeconds or child cgroup.
- **STATUS: PARTIALLY VERIFIED.** ~/.config/systemd/user/dxb-scheduler.service has no TimeoutStopSec (systemd default 90 s) — confirmed; no media_jobs reaper in db/migrations (grep) — confirmed; the cgroup/scope escape and the recovery gap were not exercised.

### F024 [HIGH] agents.persona_version reads 'v2.0-fable' for all 213 active seats and is rendered as 'Persona' on his employees/directors pages while the org tree and the bound personas.version say v2…v16; the 2026-09-13/14 re-binds updated persona_id only; the diary used the label as a sync proof
- **Lens:** ceo-intent-coverage, code-vs-records, gate-strength, records-parity, spec-ownership · **merged from:** code-vs-records:CVR-03, records-parity:RP-16, gate-strength:GS-09, spec-ownership:SO-22, ceo-intent-coverage:F17
- **Current behaviour (claim):** Migration 20260718030000 defined the column as a mirror of the bound persona; his 'sürümleri güncelle' order and 63 re-binds never wrote it; two CEO surfaces show two different versions for one seat; a Fable label reaches his eye on the newest department; the kernel workflow step gates on the tag.
- **Expected (rule / ruling):** LAW B / measure never guess; his 2026-09-13 order; dxb-surface RULE #0 · **authority layer:** (2) ruling vs (6) DB + dashboard code
- **Evidence (finder):**
  - SELECT persona_version, p.version, count(*) … → v2.0-fable|2|192 · |3|7 · … |16|1; studio seats all 'v2.0-fable' with bound 2..16
  - employees/page.tsx:229-235 renders r.persona_version under t.colPersona; directors/page.tsx:150-155; org-tree.tsx:538 'v{detail.persona_version}' numeric; kernel/workflow/steps/agent.ts:44 startsWith('v2')
  - db/migrations/20260718030000_e125_workforce_hygiene.sql:22-23,80 'waves bound v2 personas but never updated agents.persona_version'
  - STATE-ARCHIVE diary: count filter persona_version='v2.0-fable' → 14 used as battery evidence
- **CEO impact:** The one place he can look without a database says every employee is on v2.0; the tree says v16.
- **Suggested fix (finder):** Derive persona_version from persona_id (view or same-transaction write in the bind door/sync script); backfill on his word; render bound version on every surface.
- **STATUS: VERIFIED.** agents.persona_version = 'v2.0-fable' for all 16 studio seats while personas.version is 2..16; apps/dashboard org/directors/page.tsx:28,60 and ops/workflows/page.tsx:55–57 read persona_version.

### F025 [HIGH] The showcase stamps 'FLUX ile çizildi' and 'REF2VA'ya hazır' on every cast card — including AHMET and JAMES, the engine-born presenters
- **Lens:** product-truth · **merged from:** product-truth:PT-03
- **Current behaviour (claim):** The card template hard-codes the two tags for all 11 cast entries; the same page's lead paragraph says AHMET/JAMES were born from text only.
- **Expected (rule / ruling):** CEO rulings 2026-09-04/13; dxb-surface RULE #0 · **authority layer:** (2) rulings vs CEO-facing surface
- **Evidence (finder):**
  - index.html:473 '<span class="t">FLUX ile çizildi</span><span class="t">REF2VA'ya hazır</span>' in paintCast() for all CAST entries (434–457)
  - index.html:360 'AHMET (DXB-A-010) ve JAMES (DXB-A-011) fotoğrafsız, yalnız yazıyla doğdu'; PIL: ahmet/james PNGs are 640×1152 video frames, Flux faces 832×1216
  - Ledger flux-avatars-retired-and-complaint-numbering-2026-09-13
- **CEO impact:** He reads that his two valid presenters are Flux drawings — the origin he retired.
- **Suggested fix (finder):** Per-entry origin field; render 'REF2VA'ya hazır' only for in-use members; RULE #0 eye pass.
- **STATUS: VERIFIED.** index.html:462–476 cast card template hard-codes '<span class="t">FLUX ile çizildi</span><span class="t">REF2VA’ya hazır</span>' for every entry, AHMET/JAMES included.

### F026 [HIGH] The b43 battery writes probe frames into the PRODUCTION studio work root on every run (env read at import time), and the lane never cleans probe frames, engine originals or staged inputs
- **Lens:** code-vs-records, product-truth · **merged from:** product-truth:PT-04, code-vs-records:CVR-11
- **Current behaviour (claim):** MEDIA_WORK_ROOT is bound at import; the test sets DXB_MEDIA_WORK_ROOT in beforeAll after import; 17 test-pattern probe dirs landed under ~/tools/h3/jobs/probes today; media_probe never removes frameDir; shoot leaves the take in ComfyUI/output; stageIntoInput never unlinks.
- **Expected (rule / ruling):** CLAUDE.md §5 test isolation; B43 film-folder rule; his 2026-09-05 'ne 15 gb' · **authority layer:** (6) code/tests vs the stated isolation contract
- **Evidence (finder):**
  - media.ts:25 'MEDIA_WORK_ROOT = process.env.DXB_MEDIA_WORK_ROOT ?? "/home/dxb/tools/h3/jobs"'; :267 frameDir under probes; no rm
  - tests/b43/media-hands.test.ts:106 sets env inside beforeAll; header 20-21 'Construction engine only'
  - ls jobs/probes → 2026-09-14: 17 dirs, 320×180 frames; du → 78M / 314 png / 82 dirs; media_jobs probe rows total 3
  - media-lane.ts:201-203 copyFileSync leaves produced; grep unlink|rmSync → 0; ComfyUI/output eyw* 30 MB duplicated
- **CEO impact:** The 'green battery' pollutes his production folder; disk grows silently.
- **Suggested fix (finder):** Read the env lazily; delete frameDir after encoding; remove originals and staged inputs; list the 82 dirs with sizes for his click.
- **STATUS: VERIFIED.** /home/dxb/tools/h3/jobs/probes: 88 entries, 18 created 2026-09-14 (after the 17:24 battery run).

### F027 [HIGH] KENAN and DENİZ's drawing source is on disk (FLUX.1-Krea-dev, 2026-09-01) — the record told him it is unknown and three Flux faces still show green 'kadroda'
- **Lens:** product-truth · **merged from:** product-truth:PT-05
- **Current behaviour (claim):** gen.sh/gen.log record both drawn with Flux Krea (seeds 222222/444444); the ledger says 'carry no drawing source in the record'; Safiye is Flux Krea per the catalogue; all three remain castable on the vitrin.
- **Expected (rule / ruling):** Measure never guess; his 2026-09-13 reasoning; LAW A · **authority layer:** (2) ruling applied incompletely; (6) disk
- **Evidence (finder):**
  - ~/tools/h3/avatars/gen.sh:2-3 'drawn on our own card with FLUX.1-Krea-dev'; gen.log kenan tohum=222222, deniz tohum=444444
  - Ledger flux-avatars-retired-2026-09-13: 'KENAN DXB-A-002 and DENİZ DXB-A-004 carry no drawing source in the record'
  - index.html:472 renders 'kadroda' for kenan/deniz/safiye; STATE waits list 'Safiye / Kenan / Deniz (drawing source)'
- **CEO impact:** He is asked to decide what the disk already states; three Flux faces stay castable.
- **Suggested fix (finder):** Put the measured source to him in one line; until then mark the three 'Flux çizimi — CEO sözünü bekler'.
- **STATUS: VERIFIED.** /home/dxb/tools/h3/avatars/gen.log:4–10: kenan_* and deniz_* drawn 832x1216, 28 steps, seeds 222222 / 444444 (the Flux Krea recipe); ledger says 'carry no drawing source in the record'. (CEO 2026-09-14 20:0x: 'avatarlar kalabilir sorun değil onay' — decision closed, record error stands.)

### F028 [HIGH] The studio's founding directive (16 sections, 2026-09-03) and the 2026-08-31 orders exist only in chat transcripts and the row's doctrine block — no written directive, no ledger entry, outside the read list STATE gives a new session
- **Lens:** ceo-intent-coverage, product-truth · **merged from:** product-truth:PT-06, ceo-intent-coverage:F13
- **Current behaviour (claim):** docs/ceo-directives holds only 2026-07-reanalysis; only one 2026-08-31 ledger entry concerns B43 (headcount); STATE orders reading only the row's last section and the ledger by topic — the C68 read-order class is structural.
- **Expected (rule / ruling):** 'The plan exists once'; authority layer 2 = written directives; read-all-rulings-before-a-plan-2026-09-13 · **authority layer:** (2)/(3) no carrier; (4) board sole carrier
- **Evidence (finder):**
  - STATE-ARCHIVE.md:232 'master directive (16 sections … quoted in full in his messages of 2026-09-03)'; ls docs/ceo-directives → 2026-07-reanalysis only
  - jq entries dated 2026-08-31 → headcount-205-settled is the only B43 one; the dial, two roads, hierarchy, agency chain live only in B43 folded 15–158
  - STATE.md 'Next — 0.' read list: 'board row B43's last section … the approvals ledger's entries dated 2026-09-03 → 2026-09-14'; C68 line 187 'a read-order failure'
- **CEO impact:** The next plan can contradict a 2026-08-31 order and honestly say 'the ledger has no ruling'.
- **Suggested fix (finder):** Ask him whether the directive may be filed verbatim under docs/ceo-directives (EN + TR original) and one ledger entry pointing at the doctrine block; add the block to STATE's read list.
- **STATUS: VERIFIED.** docs/ceo-directives/ holds only 2026-07-reanalysis; grep of the specs for 'Media Studio' hits only the board row and the A15–A21/§9/§11/MODEL_ROUTING adaptations.

### F029 [HIGH] The road check catches only its own phrase list: 11 of 14 independently injected contradictions passed, while STATE, the board and the audit evidence present '8/8 on a mutated copy' as proof it bites
- **Lens:** gate-strength · **merged from:** gate-strength:GS-01
- **Current behaviour (claim):** The test exempts any sentence containing no/not/never or opening with Declines/Refuses, matches English only, satisfies a condition by wording inside a negation, guards four conditions and five anchors (no cast, lettering or 4-step); the eight recorded mutations reuse the regex phrases verbatim.
- **Expected (rule / ruling):** CEO 2026-09-14 on contradictions; RULE #0-A · **authority layer:** (1)/(2) ruling; (5)/(4) records overstate
- **Evidence (finder):**
  - Run A (10 injections) → 3 failed | 13 passed; missed e.g. 'A single generation is never enough; always shoot four to six segments' (CD), Turkish 'Uzun tek çekim yasaktır …' (engineer), 'Enlarge every master to 4K' (product)
  - Runs B/C: 'Refuses: image-to-video is forbidden on every engine' and 'Young women presenters are welcome … lettering on the box' → passed
  - road-consistency.test.ts:123 NEGATION regex, :155 `if (!negated && rx.test(s))`, :125/136 HEAD_NEGATED; header L4 'It cannot judge meaning'
  - STATE.md:27, B43 'proved on a mutated copy 8/8'; EVIDENCE-audit-2026-09-14.md:117-125 eight sentences each containing a listed phrase
- **CEO impact:** 'Battery green' after a persona edit means only eight wordings are absent.
- **Suggested fix (finder):** Records state what the test proves; widen (verb forms, Turkish, refusal-head only for named acts, non-negated conditions, anchors per standing ruling) or say meaning is guarded by reading only.
- **STATUS: VERIFIED.** Re-run by the author on the auditor's scratch roster (12 injected sentences, inject.py M1–M12): DXB_ROAD_TEST_ROOT=… vitest tests/b43/road-consistency.test.ts → 3 failed | 13 passed. Undetected: 'A single generation is never enough; always shoot four to six segments', the negated form, the Turkish sentence, 'Enlarge every master to 4K before the CEO sees it', the 'Declines…' head, 'with no exceptions', the Storyboard §14 was caught, the Editor bullet caught, the Identity TTS sentence caught.

### F030 [HIGH] The persona quality gate guards the DB copy, not the prompt the agent runs: the runtime reads the file, nothing compares file to bound version, and EMPLOYEE_PERSONA_STANDARD still says the DB is the runtime copy
- **Lens:** gate-strength · **merged from:** gate-strength:GS-02
- **Current behaviour (claim):** seatStandingPrompt → loadPersonaBody reads the .md from disk; no runtime path reads body_md; the Advertising Director ran on ungated text for ~2 h today; sync --verify compares to the latest version, not agents.persona_id.
- **Expected (rule / ruling):** EMPLOYEE_PERSONA_STANDARD G3; registered-adaptation rule · **authority layer:** (3) spec vs (6) code
- **Evidence (finder):**
  - packages/voice/src/persona.ts:38-52 readFile(join(repoRoot, personaPath)); worker-shim.ts:290-296,363
  - grep body_md packages --include=*.ts → only hr/src/compiler.ts, template.ts
  - EMPLOYEE_PERSONA_STANDARD.md:25-28 'personas.body_md … → SDK system prompt'; :140 'DB = runtime + kalite kapısı kopyası'
  - EVIDENCE-audit-2026-09-14.md:98 Advertising Director edited ~15:0x, bound 17:05; sync-personas-to-db.sh:77 ORDER BY version DESC LIMIT 1
- **CEO impact:** 'Gated · bound · verified' proves the DB row, not the words his employees run on.
- **Suggested fix (finder):** Register the file-first runtime truthfully; battery check md5(file) = md5(body_md of persona_id) and 'passed'; --verify against the bound version.
- **STATUS: VERIFIED.** worker-shim seatStandingPrompt → loadPersonaBody reads the .md from disk (EVIDENCE-audit-2026-09-14 §1 auditor ③ and code grep); no runtime path reads personas.body_md. CORRECTION: no seat ran today (no agent_runs since 2026-09-05 02:55), so 'ran on ungated text for ~2 h' is false; the window existed, no run used it.

### F031 [HIGH] ledger-truth's LAW B check is a marker validator, not a claim detector: on B43 it sees 0 claims beside 33 markers; one marker exempts every claim on its line; STATE cover exempts approval claims
- **Lens:** gate-strength · **merged from:** gate-strength:GS-03
- **Current behaviour (claim):** APPROVAL_CLAIM matches six narrow forms case-sensitively; L512-514 treat any registered marker on a line as backing all claims; L506 checks id existence not topic; L515 exempts covered lines; '202 CEO approval claims each backed' means 202 markers registered.
- **Expected (rule / ruling):** LAW B; ledger-truth header L68-71 · **authority layer:** (2) LAW B; (6) gate code
- **Evidence (finder):**
  - node count on board line 146 → narrow-claims=0 broad-approval-phrases=9 CEO-OK-markers=33
  - ledger-truth.mjs:87-88 APPROVAL_CLAIM; :512 `const ok = oks.length > 0`; :514-516 cover exemption
  - Scratch replication: 'THE STUDIO PLAN WAS ACCEPTED BY THE CEO' → PASS; wrong-topic id → PASS; STATE.md:60 'accepted by his eye — three on 2026-09-04' has no marker and passes
  - EVIDENCE-audit-2026-09-14.md:61 a human found five unmarked approval claims in STATE while verify:ledger was green
- **CEO impact:** He reads '202 claims backed' as proof nothing claims his approval without his word.
- **Suggested fix (finder):** Report claims detected vs markers validated; widen the regex (case-insensitive, 'accepted by his eye/word', Turkish); per-sentence checks on single-line rows; drop the cover exemption.
- **STATUS: VERIFIED.** scripts/governance/ledger-truth.mjs:503–516: `const ok = oks.length > 0; if (APPROVAL_CLAIM.test(line) …) { if (!ok && …` — any registered marker on a line clears every claim on that line; row B43 is one line with 33 markers.

### F032 [HIGH] A fresh bootstrap reverses the studio-brain ruling: migrations seed Opus 5 ON / Fable 5.1 OFF with a guardrail requiring Fable 5.1 disabled, the seed mirror has no studio rows, the 2026-09-05 flip exists only as a live UPDATE
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-01
- **Current behaviour (claim):** MODEL_ROUTING §4e says the mirror is regenerated so bootstrap reproduces the law; routing-seed.json carries neither media.creative nor fable-5.1; the VPS landing strip is declared rebuildable from the 158 migrations.
- **Expected (rule / ruling):** CEO 2026-09-05 studio-brain ruling; MODEL_ROUTING §4e; U41 · **authority layer:** (2) ruling + (3) spec vs (6) migrations/seed
- **Evidence (finder):**
  - MODEL_ROUTING_SPEC.md:189 seed mirror rule; grep 'media.creative|fable-5.1' routing-seed.json → 0
  - db/migrations/20260903190000:58-63 fable-5 enabled priority 50; 20260903210000:21-27 fable-5.1 enabled=false; :45-47 RAISE EXCEPTION unless fable-5.1 disabled; no later migration
  - Company DB: fable-5.1|50|t, fable-5|40|f; audit_log routing_change 2026-09-04 22:45:47 only; ledger studio-brain-fable-5-1 where: routing_rules + audit_log
- **CEO impact:** On rebuild or move, his studio silently runs on the demoted brain.
- **Suggested fix (finder):** Idempotent migration setting the ruled state and relaxing the guardrail; regenerate routing-seed.json; register in MODEL_ROUTING §3.
- **STATUS: VERIFIED.** db/migrations/20260903210000_b43_two_brains.sql:7,42,45: guardrail requires exactly one enabled media.creative row (fable-5) and a DISABLED fable-5.1 row; no routing-seed json carries media.creative; the 2026-09-05 flip is a live UPDATE (audit_log routing_change).

### F033 [HIGH] Two of the sixteen seats (Prompt / Model Specialist, Editor) can never be dispatched by the studio's road: queue_dispatch refuses cross-department seats and their department profiles carry no media hands
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-02
- **Current behaviour (claim):** A19 and queue.ts make the sheet one task per seat of the author's OWN department; design/marketing profiles have no media_* tools; neither seat has received one task since founding; both personas and the road test treat them as studio seats.
- **Expected (rule / ruling):** CEO 2026-08-31 'a studio seat that is not a named employee … is a defect'; founding order 2026-09-03; A19 · **authority layer:** (2) ledger vs (6) code
- **Evidence (finder):**
  - queue.ts:209-215 `a.department !== author.department` → refused; AGENT_ORCHESTRATION A19 'a stranger's seat … writes zero rows'
  - design.mcp.json / marketing.mcp.json → no media_* tools
  - tasks since 2026-09-03 for the two slugs → 0; queue.dispatch payloads for 004/005 → seven media-* seats only
  - migration 20260903001000:6-8 'ASSIGNED … by their persona text, not transferred'; B43 '14 seats … + 2 held by assignment'
- **CEO impact:** His 16-seat department is a 14-seat department on the road; the first job needing the Editor's step is refused.
- **Suggested fix (finder):** Decide with him: second-seat/transfer with the media kit, or stop calling them studio seats; register as A19 adaptation.
- **STATUS: VERIFIED.** groups/queue.ts:87–88 refuses a seat from another department; :150 'one task per named seat of YOUR department'; profiles/design.mcp.json and marketing.mcp.json carry 0 media_ tools; tasks per seat: design-image-prompt-engineer 1, marketing-short-video-editing-coach 1 (founding tasks only).

### F034 [HIGH] MODEL_ROUTING_SPEC §4d's tier-homogeneity invariant has been contradicted by live routing since 2026-09-05 and still calls the studio's routing 'a defect' — the conflict was never named in the spec (LAW A)
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-04
- **Current behaviour (claim):** L1 carries fable-5 on 27 rows and fable-5.1 on media.creative; the §3 B43 adaptation does not mention §4d; the conflict is parked on B08.
- **Expected (rule / ruling):** LAW A; registered-adaptation rule · **authority layer:** (1)/(2) orders vs (3) spec text
- **Evidence (finder):**
  - MODEL_ROUTING_SPEC.md:144 'A routing change that puts two different models on one tier … is a defect'; :39 adaptation without '§4d'
  - routing_rules enabled L1: fable-5 ×27, fable-5.1 media.creative; model_catalog both tier_floor L1
  - Ledger top-tier-set-and-brain-switch-order-2026-09-13 'NAMED CONFLICT … registered adaptation when the plan runs'; B08 line 95 step (2) parked
- **CEO impact:** A session obeying the spec could 'repair' his studio back to one model.
- **Suggested fix (finder):** Amend §4d now with the two rulings, independent of B08.
- **STATUS: VERIFIED.** MODEL_ROUTING_SPEC.md:144 'Tier homogeneity (new invariant)' unamended; routing_rules media.creative fable-5.1 enabled / fable-5 disabled since 2026-09-05.

### F035 [HIGH] The employees page shows every studio seat's brain as Claude Opus 5 (agents.brain='fable-5') while all 27 studio runs since 2026-09-05 ran on Fable 5.1
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-06
- **Current behaviour (claim):** The founding migration set brain='fable-5'; the ruling moved the studio via a routing row only; the page prints modelLabel(r.brain); he chose 'real' over 'honest label' on 2026-07-26.
- **Expected (rule / ruling):** U41; MODEL_ROUTING §4f; CEO 2026-09-05 · **authority layer:** (2) ledger vs (6) table + dashboard
- **Evidence (finder):**
  - agents media-studio + 2 assigned → brain=fable-5, brain_source=slot (16)
  - agent_runs since 2026-09-04 22:00 → model_id fable-5.1: 24 succeeded, 3 failed; no fable-5
  - employees/page.tsx:68,202-217 renders modelLabel(modelNames, r.brain); MODEL_ROUTING_SPEC.md:150 CEO chose 'real'
- **CEO impact:** He opens /org/employees and reads that his studio thinks with Opus 5.
- **Suggested fix (finder):** Write brain='fable-5.1' for the 16 through the seam, or show the effective route beside the floor; record in MODEL_ROUTING §3.
- **STATUS: VERIFIED.** SELECT brain, count(*) FROM agents WHERE department='media-studio' → fable-5 | 14; routing row media.creative = fable-5.1; the employees page prints modelLabel(brain).

### F036 [HIGH] The two-roads cost table he said he must prepare from ('önce hazırlamam lazım') is neither delivered nor on any open leg; the diary and §11 claim it was delivered, the row says it is owed
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F06
- **Current behaviour (claim):** §11 is per engine with $0.00 and card seconds — no job-type lines, no electricity, operator time or feasibility, in English inside a spec; the row's OPEN LEGS list has no leg for it.
- **Expected (rule / ruling):** His order of 2026-08-31; board law 1; dxb-ceo-report · **authority layer:** (1) order vs (4) leg list, (3) spec claim
- **Evidence (finder):**
  - B43: 'BUT A POINTER IS NOT THE DELIVERABLE HE ASKED FOR … as a table on this screen, one line per job type … carrying BOTH roads … he intends to READ this table'
  - B43 OPEN LEGS (2b)(3)(4)(5)(6) — no table leg
  - STATE-ARCHIVE diary 2026-09-01: '§11 … is the VIDEO drawer this row owed him'; CAPABILITY_ARSENAL §11:273-280 per engine, no €0.13/h, no operator time
- **CEO impact:** The input he needs before the paid/free decision does not exist in readable form; records say both that it exists and that it is owed.
- **Suggested fix (finder):** Add a leg: per-job-type two-roads table in Turkish from measured numbers; amend §11 and the diary to 'the engine drawer, not the CEO's table'.
- **STATUS: VERIFIED.** Row B43: 'This row owes the VIDEO DRAWER … as a table on this screen' and OPEN LEGS (2b)(3)(4)(5)(6) carry no leg for it.

### F037 [MEDIUM] 'No skin-mark descriptor in a casting brief, ever' — a live rule on the board — is in no seat
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-07
- **Current behaviour (claim):** The Identity seat writing casting sheets/takes and the Prompt seat carry no such rule.
- **Expected (rule / ruling):** Board B43 live rule (his rejection 2026-09-03 21:20) — see F018 on its registration · **authority layer:** (4) board vs (6) seats
- **Evidence (finder):**
  - B43 'no skin-mark descriptor in a casting brief, ever'
  - grep 'skin|freckle|blemish' over 16 seats → quality lines only; media-character-identity.md:69 cast pattern has no descriptor rule
- **CEO impact:** The next casting take can reproduce the red-dot defect he rejected.
- **Suggested fix (finder):** One line in Identity §3/§5 and the Prompt seat's studio lane (after F018 settles the rule's status).
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F038 [MEDIUM] 'A seat is never told its minutes' — measured for him on one grep — overstates: the prompt tells the seat to read its own row with queue_get, which returns due_at; dependants read upstream rows the same way
- **Lens:** code-vs-records, rulings-vs-seats · **merged from:** rulings-vs-seats:RS-08, code-vs-records:CVR-06
- **Current behaviour (claim):** His option (a) rested on `grep due_at worker-shim.ts`; queue_get selectAll includes due_at; queue_get/list granted to the department.
- **Expected (rule / ruling):** RULE #0-A; 'validate the detector first' · **authority layer:** (2) recorded answer vs (6) code
- **Evidence (finder):**
  - worker-shim.ts:337-338 'reading it back (e.g. queue_get) is a valid minimal verification'; queue.ts:554-563 selectAll()
  - media-studio.mcp.json grants queue_get, queue_list; dispatch-book.ts:128-131 'read each of them with queue_get'
  - EVIDENCE-clock-2026-09-13.md:86-90 grep-based measurement; ledger studio-persona-bindings-corrected-2026-09-13 repeats it; B43 'a seat is never told its minutes'
- **CEO impact:** His decision rested on a narrower fact than the runtime.
- **Suggested fix (finder):** Project due_at out of queue_get for seat callers, or correct the ledger/board sentence and let him decide.
- **STATUS: VERIFIED.** groups/queue.ts:561 queue_get → selectFrom('tasks').selectAll() (due_at included); :150 tells dependants to read tasks with queue_get.

### F039 [MEDIUM] 'No persona file carries a model name' is false: 'GPT-6 Astra' is written into the Creative Director's and Film Director's live §3
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-12
- **Current behaviour (claim):** MODEL_ROUTING §4b makes a model name in a persona file a violation; the board (h) and the ledger claim none exists.
- **Expected (rule / ruling):** MODEL_ROUTING §4b; creative-brain-effort-xhigh-2026-09-03 · **authority layer:** (3)/(2) vs (6) seat text
- **Evidence (finder):**
  - media-creative-director.md:69 and media-film-director.md:71 'the CEO's rule of 2026-09-14 on GPT-6 Astra's counsel'
  - B43 amendment (h) 'no persona file carries a model name'; ledger creative-brain-effort-xhigh-2026-09-03 same
  - MODEL_ROUTING_SPEC.md §4b 'dosyaya model adı yazmak ihlal'
- **CEO impact:** A CEO-OK'd claim a grep refutes.
- **Suggested fix (finder):** Replace with the date in both seats; attribution stays in the COUNSEL file and ledger.
- **STATUS: VERIFIED.** media-creative-director.md:69 and media-film-director.md:71: 'the CEO's rule of 2026-09-14 on GPT-6 Astra's counsel' (a model name in a live persona §3).

### F040 [MEDIUM] Seat dossiers are stale against the database: 14 files say Status draft after HR activation, dates and header version stamps (v2/v3) lag the DB (v4–v16), two files say 'v2 after sync'
- **Lens:** plan-quality, rulings-vs-seats · **merged from:** rulings-vs-seats:RS-13, plan-quality:PQ-21
- **Current behaviour (claim):** The file-only dossier blocks disagree with the DB the HR chain and binds wrote; the dossier never reaches the seat (record defect, not runtime).
- **Expected (rule / ruling):** EMPLOYEE_PERSONA_STANDARD §4/§5, G5 · **authority layer:** (6) file record vs DB
- **Evidence (finder):**
  - personas/media-studio/*.md:44 (all 14) 'Status: `draft`'; agents.employment_status='active' since 2026-09-03
  - media-continuity.md:42 'Last updated 2026-09-03' vs :40 three 2026-09-14 entries; :38 '(v2 after sync)' vs DB v4; creative-director:50 '<!-- v3 · fable-5 · 2026-09-14' vs DB v16
  - EMPLOYEE_PERSONA_STANDARD.md:17 G5 'persona değişimi = yeni satır (version+1)'
- **CEO impact:** The dossier HR would open says 'draft' for employees activated on his order.
- **Suggested fix (finder):** Bring Status, dates and stamps to DB truth or have the sync script stamp the bound version.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F041 [MEDIUM] Two clocks for the standard 15 s take are on record: ledger and media_submit's description say ≈ 14 min; the board, STATE and the measured book say ≈ 10.5 min (625.3 s) — the seats read the wrong one
- **Lens:** code-vs-records, plan-quality, records-parity, rulings-vs-seats · **merged from:** plan-quality:PQ-08, rulings-vs-seats:RS-18, records-parity:RP-15, code-vs-records:CVR-09
- **Current behaviour (claim):** The Creative Director budgets seats from measured engine time and the hand's text; the hand carries the unmeasured figure.
- **Expected (rule / ruling):** Measure never guess; one fact one owner · **authority layer:** (6) measurement vs (2)/(4)/(6) records
- **Evidence (finder):**
  - media.ts:148 'steps? (4 = the studio standard, ≈ 14 min per 15 s)'; ledger engine-standard-4-steps what: '≈ 14 min'
  - B43 (e) '≈ 10.5 min'; STATE.md:74; media_jobs shoot done ×2 wall 625.3 s at steps=4
  - media-creative-director.md §3 'budget_minutes … from this station's measured engine time'
- **CEO impact:** Call-sheet budgets set ~35 % high; 'why over budget' answered wrongly.
- **Suggested fix (finder):** One measured figure (625 s at 640×1152/4 steps) in media.ts:148 and the ledger's paraphrase; 14 min stays only as his quoted words.
- **STATUS: VERIFIED.** groups/media.ts:148 '(4 = the studio standard, ≈ 14 min per 15 s)'; measured engine 625.3 s (10:25) on 004 and 005.

### F042 [MEDIUM] Fourteen 'HR: author persona for media-*' tasks born at founding sit in 'inbox' since 2026-09-03 — the only inbox tasks in the company, unlabelled, unrecorded on any board record
- **Lens:** ceo-intent-coverage, gate-strength, plan-quality, product-truth · **merged from:** plan-quality:PQ-10, product-truth:PT-18, gate-strength:GS-05, ceo-intent-coverage:F16
- **Current behaviour (claim):** fn_hr_create_employee opened one authoring task per seat; the personas were written by hand; the rows stay open and will show on /ops/tasks and the studio screen.
- **Expected (rule / ruling):** Board law 1; U41 · **authority layer:** (6) DB vs (4)/(5) records
- **Evidence (finder):**
  - SELECT status,count(*) FROM tasks WHERE department='media-studio' → done 34 · failed 1 · inbox 14; objectives 'HR: author persona for media-… (K2)', created 2026-09-03 12:13, label/label_tr NULL
  - Company-wide: inbox 14 = these; grep 'author persona for media' over STATE/board/evidence → 0
  - ops/tasks/page.tsx:17 status list contains 'inbox'
- **CEO impact:** His task page shows 14 open studio jobs for work already done.
- **Suggested fix (finder):** Close through the governed transition door with an audit row; record on B43; add inbox-age to the read gateway claims.
- **STATUS: VERIFIED.** SELECT status,count(*) FROM tasks WHERE status='inbox' → 14, created 2026-09-03, 'HR: author persona for media-…'.

### F043 [MEDIUM] The vitrin, the catalogue, ahmet.md, EVIDENCE-position.md and the archived shoot.sh still cite the deleted 'Medya OS' folder as the record of accepted films and research, against his 'never cite it again' condition
- **Lens:** ceo-intent-coverage, product-truth, records-parity · **merged from:** records-parity:RP-10, product-truth:PT-10, ceo-intent-coverage:F21
- **Current behaviour (claim):** Four places on his review page point at STORYBOARD.md, gates/, qc/, voice/, shoot-b.sh that no longer exist; only BRIEF.md, EKIP.md, shoot.sh were rescued.
- **Expected (rule / ruling):** CEO ruling 2026-09-04; RULE #0 on CEO surfaces · **authority layer:** (2) ruling vs surface and records
- **Evidence (finder):**
  - index.html:160,220,255,274 'Medya OS/01-hat/uretim/EYW-001-ugc-arda/ — STORYBOARD.md · shoot.sh …'
  - KATALOG.md:50 'SAFİYE … 2026-09-02, Medya OS'; avatars/ahmet.md:2; lab/out/2026-09-04/shoot.sh:11 JOB="/home/dxb/Medya OS/…"; EVIDENCE-position.md cites Medya OS/05-olcum, 03-arastirma
  - ls lab/out/2026-09-04/ → BRIEF.md, EKIP.md, shoot.sh + mp4 only; ledger medya-os-folder-deleted-by-his-hand-2026-09-04 conditions 'never open or cite that folder again'
- **CEO impact:** His page tells him where to look and the drawer is empty.
- **Suggested fix (finder):** Replace pointers with what survives or 'kayıt silindi — Medya OS, CEO 2026-09-04'; drop the citations in evidence.
- **STATUS: VERIFIED.** grep -c 'Medya OS' index.html → 2.

### F044 [MEDIUM] AHMET's birth take, frames, voice and lab copy are filed under ARDA's code (a006 / DXB-A-006); the vitrin's AHMET card plays them with alt 'ARDA doğum çekimi'
- **Lens:** product-truth · **merged from:** product-truth:PT-12
- **Current behaviour (claim):** One code names two people's material; a screen keyed on the code attaches the wrong face.
- **Expected (rule / ruling):** Code rule (one code, one product), CEO 2026-09-01 · **authority layer:** (2) code order vs disk naming
- **Evidence (finder):**
  - ls studio/media → dxb-a-006-birth.mp4, a006-birth-*.png, a006-birth-voice.wav; lab/out/2026-09-04/DXB-A-006-birth-take-640p.mp4
  - md5sum avatars/ahmet_portrait.png = media/a006-birth-portrait_t2.5.png (0246288b…)
  - index.html:191-207 AHMET card (DXB-A-010) plays media/dxb-a-006-birth.mp4; :205 alt='ARDA doğum çekimi — 24 kare'
- **CEO impact:** A file named A-006 is Ahmet, not Arda.
- **Suggested fix (finder):** Rename to a010-… with symlinks until the card is updated; fix alt; note in KATALOG row A-010.
- **STATUS: VERIFIED.** /home/dxb/tools/h3/lab/out/2026-09-04/DXB-A-006-birth-take-640p.mp4 (AHMET's birth take filed under ARDA's code A-006).

### F045 [MEDIUM] English blocks stand as the studio's own content inside the Turkish vitrin (lang="tr"): the EYW-001 storyboard card and two director verdicts
- **Lens:** product-truth · **merged from:** product-truth:PT-15
- **Current behaviour (claim):** The i18n gate does not scan the surface; the one screen he uses today breaks the one-locale rule.
- **Expected (rule / ruling):** 00-CEO-DIRECTIVE-LANGUAGE; CLAUDE.md §3 · **authority layer:** (2) directive vs surface
- **Evidence (finder):**
  - index.html:261-274 'STORYBOARD · İngilizce' … 'Presenter DXB-A-006 ARDA · parked car …', 'Locks: …', 'Why one take: …'; :119 'reads as FILMED — a real man…'; :143 'Like a finished suit…'
  - grep 'h3|vitrin|8899' scripts/i18n-purity-check.sh → 0
  - CLAUDE.md §3 'Every CEO-visible surface is 100 % one locale'
- **CEO impact:** His review page mixes languages in the studio's own voice.
- **Suggested fix (finder):** Translate (EN collapsed as original); add the vitrin to the i18n check or record it exempt on his word.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F046 [MEDIUM] The vitrin still promises a 2K enlargement and lists edge-tts as the ad voice — both cancelled by his 2026-09-04 rulings
- **Lens:** product-truth · **merged from:** product-truth:PT-09
- **Current behaviour (claim):** Two cards and the Ölçümler tab carry pre-ruling text.
- **Expected (rule / ruling):** LAW A; dxb-surface · **authority layer:** (2) rulings vs surface
- **Evidence (finder):**
  - index.html:254 'Sırada 21:47 kanunu: kabulden sonra 2K büyütme (sözünüzle)'; :180 '640p, 2K büyütme gerekir'; :394 '<td>edge-tts</td>…<td>konuşan reklamın sesi</td>'
  - Ledgers engine-standard-4-steps (verbatim 'yok 1080 gerek yok') and tts-cancelled-engine-voice-only-2026-09-04
- **CEO impact:** He reads on his page that 2K is next and TTS is the voice engine.
- **Suggested fix (finder):** Replace the three sentences with the rulings' words; mark edge-tts 'iptal — CEO 2026-09-04'.
- **STATUS: PARTIALLY VERIFIED.** index.html:180 carries '2K büyütme' text on a film card (seen); the edge-tts mention on the Ölçümler tab not located by the author.

### F047 [MEDIUM] tests/b43/media-hands.test.ts is not deterministic: three auditors each saw it red once (heartbeat / job-not-found) and green on re-run — global hook.enabled pin and a family-wide DELETE make concurrent suites fail each other
- **Lens:** code-vs-records, gate-strength, records-parity · **merged from:** records-parity:RP-08, code-vs-records:CVR-13, gate-strength:GS-07
- **Current behaviour (claim):** pinHookOff writes the GLOBAL hook.enabled row on the shared construction engine; beforeAll deletes every 'b43t-%' media_jobs row; the author's 100/100 is green only when nobody else runs the suites.
- **Expected (rule / ruling):** dxb-verify green must be reproducible; 'suite deletes ONLY what it creates' · **authority layer:** (6) measured behaviour
- **Evidence (finder):**
  - Run at 17:38 → 'Tests 1 failed | 60 passed (61)' media-hands.test.ts:303 expected running, received failed; alone → 12/12 twice
  - Another run → 'media_wait: job 9b735b1c… not found'; media-hands.test.ts:120 DELETE FROM media_jobs WHERE department LIKE 'b43t-%'
  - tests/helpers/suite-scope.ts:24-35 UPDATE settings_values … key='hook.enabled' AND scope='global'; construction decision_log shows three concurrent heartbeat runs 15:38:10–25 with hook_reject
- **CEO impact:** A green battery reported by one session is red for the next running the same minute.
- **Suggested fix (finder):** Scope the pin and the sweep to the run's own marker; or a lock file serialising battery runs.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F048 [MEDIUM] The battery was narrowed against dxb-verify: no `pnpm test` (12 of 123 test files) and no `gitleaks detect` since 2026-09-03; STATE.md codifies the subset; tests/c42 is red
- **Lens:** gate-strength, governance-compliance · **merged from:** governance-compliance:GC-11, gate-strength:GS-06
- **Current behaviour (claim):** The door says skipping any applicable check is a governance violation; STATE:72 names the subset as 'the battery' without a registered adaptation.
- **Expected (rule / ruling):** dxb-verify door; 'one rule, one owner' · **authority layer:** (3)/(4) door vs (5) STATE
- **Evidence (finder):**
  - dxb-verify/SKILL.md:25-36 `pnpm test`, `gitleaks detect`, 'Green on the parts you like is not green'; find tests → 123 files
  - STATE.md:72 'the battery (pnpm typecheck · vitest run tests/b43 tests/r31 tests/b39 · …)'; last full run EVIDENCE-hands-2026-09-03.md:57 (828 passed, 1 failed); grep gitleaks over EVIDENCE-* → none
  - vitest run tests/c42 → 1 failed | 14 passed; gitleaks --since=2026-09-03 → no leaks (auditor's run)
- **CEO impact:** 'Battery green' since 09-05 covers a subset and the sentence does not say so.
- **Suggested fix (finder):** Run pnpm test and gitleaks and print results; amend the door explicitly with known reds named, or restore the door's list.
- **STATUS: VERIFIED.** STATE.md:72 names the subset as 'the battery'; .claude/skills/dxb-verify/SKILL.md:27 lists `pnpm test`, :31 `gitleaks detect`; gitleaks run by the author 2026-09-14 20:17 on 57 commits since 2026-09-03 → no leaks found.

### F049 [MEDIUM] The hands' safety behaviours stated as machine facts have no test: GPU/RAM/swap refusal thresholds, the transient systemd scope, telemetry, the job-time cap, and every real engine except probe
- **Lens:** gate-strength · **merged from:** gate-strength:GS-08
- **Current behaviour (claim):** Every b43 test injects resourceCheck ok:true and fake EngineRunners; no test constructs the scheduler's media lanes.
- **Expected (rule / ruling):** Evidence before done; TEST_STRATEGY · **authority layer:** (6) code and tests
- **Evidence (finder):**
  - grep 'defaultResourceCheck|MEDIA_LIMITS|systemd-run|MemoryMax' tests → none
  - media-lane.ts:44-52 MEDIA_LIMITS; :65-90 defaultResourceCheck; :464-466 systemd-run argv; tests/b43/media-hands.test.ts:188, media-lanes.test.ts:198-206 fakes
  - STATE.md:74 'refused while the card, RAM or swap is busy'
- **CEO impact:** The valves that keep the desktop alive during a shoot rest on code reading.
- **Suggested fix (finder):** Unit-test defaultResourceCheck with injected readers; exec spy on runScoped argv; one scheduler wiring test.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F050 [MEDIUM] The mutation-proof count is inconsistent: commit says 9/9, evidence says 'nine injected' but lists eight and reports 8/8, STATE/board/ledger say 8/8; the fixture no longer exists
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-14
- **Current behaviour (claim):** One measurement reported with two numbers in the same hour; true count UNVERIFIED (scratch root gone).
- **Expected (rule / ruling):** Evidence before done; zero contradictions · **authority layer:** (6) commit vs (5)/(4)/(2)
- **Evidence (finder):**
  - git log ea0ebebf subject '9/9 injected contradictions caught'
  - EVIDENCE-audit-2026-09-14.md:93 '8/8'; :114-125 'nine sentences' followed by eight lines
  - STATE.md:27, B43, ledger audit-of-the-days-work '8/8'
- **CEO impact:** The proof he was given for the rebuilt check carries two numbers.
- **Suggested fix (finder):** Commit the mutated sentences as a fixture, re-run, print, make every record say one number.
- **STATUS: VERIFIED.** git show -s ea0ebebf → '9/9'; EVIDENCE-audit-2026-09-14.md lists eight sentences and says 8/8.

### F051 [MEDIUM] Board B43 still lists the SDK cwd + settingSources item as open 'his call' — settingSources has been isolated since 2026-09-05 (A20); only cwd = repository root remains true, and A20's 'fixed cwd' hides that
- **Lens:** code-vs-records, records-parity, spec-ownership · **merged from:** records-parity:RP-14, code-vs-records:CVR-04, spec-ownership:SO-07
- **Current behaviour (claim):** Half done, half still true, the record says neither.
- **Expected (rule / ruling):** LAW A; 'what is still open exists once' · **authority layer:** (2)/(3) vs (4) board
- **Evidence (finder):**
  - B43 'Also open on this row: … (cwd + settingSources, one line, behavioural — his call)'
  - sdk-isolation.ts:21-24 `settingSources: [], cwd: env.DXB_REPO_ROOT ?? process.cwd()`; AGENT_ORCHESTRATION A20; dispatch-book.test.ts:214-218
  - dxb-scheduler.service WorkingDirectory=%h/DxB Global OS; no DXB_REPO_ROOT set
- **CEO impact:** He is asked to decide something half built; not told the seats still run inside the construction checkout.
- **Suggested fix (finder):** Rewrite: settingSources closed 2026-09-05; cwd still the repository — his call on a neutral working directory.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F052 [MEDIUM] STATE's 'Waits on him only' list disagrees with the board, the ledger and the vitrin: the QA receipt, the corrected seats, the SDK cwd call and EYW-002 ('gözünüzü bekliyor') are absent; a C42 test red no board row owns is present
- **Lens:** ceo-intent-coverage, plan-quality, records-parity · **merged from:** records-parity:RP-06, plan-quality:PQ-24, ceo-intent-coverage:F18
- **Current behaviour (claim):** His four-line position will omit finished work waiting for his eye and ask about a red with no row.
- **Expected (rule / ruling):** LAW B; 'what is still open exists once' · **authority layer:** (4)/(2) vs (5) STATE
- **Evidence (finder):**
  - STATE.md:33 list: clock · C68 · Safiye/Kenan/Deniz · 004 file · C42 red
  - B43: QA receipt 'NOT yet accepted by his eye'; SDK cwd 'his call'; STATE:25-29 eight corrections DONE, corrected seats not listed
  - index.html H2 and KATALOG EYW-002 'CEO'nun gözünü bekliyor'; grep EYW-002 STATE.md → 0; grep rival-intel-ledger board → line 268 without the red
- **CEO impact:** He is told nothing waits on 002 while his page says it does; the seats and QA receipt never reach his eye.
- **Suggested fix (finder):** Add the corrected seats, QA receipt, SDK call and EYW-002 (or his 17:05 verdict); give the C42 red a row or drop it on his word.
- **STATUS: PARTIALLY VERIFIED.** STATE.md:33 'Waits on him only' lists the clock, C68, Safiye/Kenan/Deniz, the 004 file, the C42 red; the board's list adds the QA receipt, the SDK cwd call and the corrected seats — partially compared, not line by line.

### F053 [MEDIUM] Open items live only in evidence/row text with no owner: a credential typed into chat 'should be rotated', the ledger-truth --update bug, and MiniMax's written permission 'has no home'
- **Lens:** ceo-intent-coverage, governance-compliance, records-parity · **merged from:** records-parity:RP-18, governance-compliance:GC-13, ceo-intent-coverage:F20
- **Current behaviour (claim):** Neither the board nor STATE carries them; ledger-truth excludes .planning/quick by design; rotation UNVERIFIED.
- **Expected (rule / ruling):** Board law 1; 'Secrets never enter a prompt' · **authority layer:** (4) board vs (7) evidence
- **Evidence (finder):**
  - EVIDENCE-hands-2026-09-03.md:82 'A credential was typed into the chat by the CEO … It should be rotated.'; :79 '--update writes a JavaScript Date string … Not fixed'
  - grep -i 'rotat' board, STATE → 0; grep -- '--update' board → 0; B42 line 127 'the written permission has no home'
  - ledger-truth.mjs:101-105 excludes .planning/quick/**
- **CEO impact:** A sudo credential he typed may still be live with the recommendation forgotten.
- **Suggested fix (finder):** One line each to him; then a waits-on-him entry or silence on his word.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F054 [MEDIUM] Two of three handover prompts carry no superseded marker and re-ask settled questions; the third is 'superseded but retained'
- **Lens:** governance-compliance, records-parity · **merged from:** records-parity:RP-12, governance-compliance:GC-12
- **Current behaviour (claim):** -13 and -13b read as live CEO prompts whose first tasks were completed on 2026-09-13/14; -14 keeps its old body under a banner.
- **Expected (rule / ruling):** LAW A; 'no new plan file' · **authority layer:** (2) LAW A vs (5)/(7)
- **Evidence (finder):**
  - NEXT-SESSION-PROMPT-2026-09-13b.md:19 'İLK İŞ: (1) Astra'nın kuralına cevabımı al' (accepted 2026-09-14); :21 '97 kayıt' (now 104); no banner
  - NEXT-SESSION-PROMPT-2026-09-13.md:32 'çağrı kâğıdına koltuk başı dakika bütçesi' (built 95511c61); :14 'C27' old numbering; no banner
  - -14.md:1 SUPERSEDED banner with the old body beneath
- **CEO impact:** A session that opens the wrong prompt restarts settled questions.
- **Suggested fix (finder):** Delete the two 09-13 prompts and the 09-14 body (keep the note or nothing), on his word.
- **STATUS: VERIFIED.** NEXT-SESSION-PROMPT-2026-09-13.md and -13b.md carry no SUPERSEDED marker (grep); -14.md carries one.

### F055 [MEDIUM] CEO orders quoted as authority in standing files, hooks and migrations without any ledger entry — a quotation-shaped claim the gate cannot see
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-06
- **Current behaviour (claim):** The hooks rewrite ('sadece bu ikisi…'), the B39 migration ('düzelt'), 'devir promtu yazma' and the Turkish-summary decision have no entries; ledger-truth's own comment names the hole.
- **Expected (rule / ruling):** LAW B; dxb-close-row marking rule · **authority layer:** (2) ledger vs (4)/(5)/(6)
- **Evidence (finder):**
  - a61d7ced rewrote CLAUDE.md/hooks 'on the CEO's order ("sadece bu ikisi bu şekilde olsun…")'; grep in ceo-approvals.json → 0
  - 01c850b4 migration 20260913001000 shipped 'CEO düzelt'; board B39 line 130; no ledger entry names B39
  - ledger-truth.mjs:499-502 'a quotation of the CEO rather than an assertion about him … would have passed'
- **CEO impact:** Company migrations changed on words that exist only in commit messages.
- **Suggested fix (finder):** Register each quoted order; extend APPROVAL_CLAIM to 'on his word/order/click' phrasings.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F056 [MEDIUM] Persona bindings are written with raw UPDATEs on the company database because no fn_ door binds agents.persona_id (205 rows on 2026-09-13, 63 today)
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-19
- **Current behaviour (claim):** STATE's rule that every write goes through fn_/control_ doors is broken by the door's own procedure.
- **Expected (rule / ruling):** STATE machine rule; EMPLOYEE_PERSONA_STANDARD audit rule · **authority layer:** (5)/(3) vs (6) practice
- **Evidence (finder):**
  - EVIDENCE-clock-2026-09-13.md §6 'no fn_ door binds agents.persona_id — only the two triggers guard it'; EVIDENCE-audit-2026-09-14.md §2 'UPDATE agents SET persona_id=…'
  - STATE.md §3 'every write through the fn_/control_ doors'; audit_log persona.bound 2026-09-14 → 63
- **CEO impact:** The HR record of who runs on which persona depends on a hand-typed transaction.
- **Suggested fix (finder):** Add fn_persona_bind (gate-checked, audit row, persona_version write) as a registered adaptation; route the sync script through it.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F057 [MEDIUM] The studio's contract, data model (media_jobs, job/scene/shot/code), its dashboard section and its decisions are owned by no spec, requirement, index or stack entry — only by one 7,961-word board row
- **Lens:** ceo-intent-coverage, plan-quality, spec-ownership · **merged from:** plan-quality:PQ-04, ceo-intent-coverage:F11, spec-ownership:SO-09, spec-ownership:SO-15, spec-ownership:SO-21
- **Current behaviour (claim):** DATA_MODEL §20, SYSTEM_ARCHITECTURE §4, API_CONTRACTS, HOLDING_OS_PRODUCT_SPEC's 19 areas, REQUIREMENTS.md, 00-INDEX's decisions table (ends U43) and STACK.md carry nothing on the studio; the built job book is flat.
- **Expected (rule / ruling):** CLAUDE.md §2 'plan exists once'; board law 3; INDEX wave-4 registration rule · **authority layer:** (3) spec corpus vs (4) board / (6) migrations
- **Evidence (finder):**
  - grep counts: DATA_MODEL media_jobs/scene/shot=0; API_CONTRACTS media=0; HOLDING_OS_PRODUCT_SPEC media|studio=0; 00-INDEX B43|A15|2026-09=0; REQUIREMENTS media|studio → V2-02 only; STACK.md ComfyUI/MiniMax/SeedVR2=0
  - B43: 'THE HIERARCHY, AND IT IS THE STUDIO'S DATA MODEL … Every level of that chain is a record'; migration 20260903190000:28-50 media_jobs has no code/scene/shot/route
  - wc row B43 = 49,962 bytes / 7,961 words; STATE.md:84 points at 00-INDEX as the adaptation table
- **CEO impact:** His product spec does not know a twentieth control area exists; the record layer will be invented when the screen is drawn.
- **Suggested fix (finder):** Register media_jobs + job/scene/shot/code in DATA_MODEL, the tools in API_CONTRACTS, the studio section in HOLDING_OS_PRODUCT_SPEC, requirement rows, a B43 line in 00-INDEX, engines in STACK.md.
- **STATUS: VERIFIED.** grep -rn 'B43|media-studio|media studio' HOLDING-OS-MASTER-PLAN → only AGENT_ORCHESTRATION (A15–A21), CAPABILITY_ARSENAL (§9/§11), MODEL_ROUTING (line 39), DEPUTY-FAILOVER-MAP (line 48); REQUIREMENTS.md grep 'studio|media|B43' → only V2-02.

### F058 [MEDIUM] Cost per delivered second exists only in prose: every studio cost_ledger row is €0.0000, media_jobs has no cost column, COST_CONTROL has no card-time dimension
- **Lens:** plan-quality, spec-ownership · **merged from:** plan-quality:PQ-12, spec-ownership:SO-11
- **Current behaviour (claim):** The row promises 'what each one cost' and cost shown before the decision; no source exists.
- **Expected (rule / ruling):** HOLDING_OS_PRODUCT_SPEC area 9; CEO 2026-08-31 · **authority layer:** (3) spec / (6) DB
- **Evidence (finder):**
  - cost_ledger since 2026-09-03 → worker | 43 | 0.0000; media_jobs columns wall_seconds, peak_vram_mib, peak_ram_gib only; grep cost_ledger media-lane.ts → 0
  - COST_CONTROL_SPEC.md:12 R1 eleven dimensions, no engine time; adaptations end E11.1
  - B43 'the cost is computed and SHOWN before the decision'; B33 '€0.13 per hour'
- **CEO impact:** His cost intelligence prices the studio at zero; B28's margin decision misled.
- **Suggested fix (finder):** Register a card-time cost model in COST_CONTROL written per media_job with source 'media'.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F059 [MEDIUM] No live event exists for a shot: media_jobs transitions are in neither EVENT_MODEL's inventory nor its catalogue, and the table has no broadcast trigger — the lane writes audit rows instead
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-10
- **Current behaviour (claim):** The studio tab will have nothing to move on except polling.
- **Expected (rule / ruling):** First law of V2 'IT MUST BE ALIVE'; EVENT_MODEL G2/§9b · **authority layer:** (2) CEO law + (3) spec
- **Evidence (finder):**
  - EVENT_MODEL.md §4/§9b no media type; pg_trigger on media_jobs → RI only; media-lane.ts:560 insertInto('audit_log'); grep notify|broadcast → 0
  - OBSERVABILITY_SPEC.md:149 'audit = KİM NEYİ DEĞİŞTİRDİ … observability = NE OLDU'
- **CEO impact:** 'Motion IS state' has no source for the studio.
- **Suggested fix (finder):** Register a studio job.* type set in §9b and the trigger when the screen plan is approved; record the gap on B43.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F060 [MEDIUM] The CEO's accept/reject of a film has no owner in the company: no approval class, no decision_log row — the four acceptances live in ceo-approvals.json, KATALOG.md and index.html only
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-12
- **Current behaviour (claim):** APPROVAL_ENGINE R7 binds every approval decision to decision_log; nothing registers the acceptance.
- **Expected (rule / ruling):** LAW B + APPROVAL_ENGINE R7 · **authority layer:** (3) spec
- **Evidence (finder):**
  - approval_rules → 8 rows, no media/delivery pattern; approvals mentioning EYW → 12 hook_escalation rows of 2026-07-18
  - APPROVAL_ENGINE_SPEC.md:18 R7; B43 'he says it there, on that screen'
- **CEO impact:** His verdicts on the studio's work are not in his company's books.
- **Suggested fix (finder):** Register a non-gating decision_log kind 'ceo_acceptance' with the DXB code; backfill the four films.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F061 [MEDIUM] The ten-step production line exists as persona text and per-job call sheets, not as a workflow entity; WORKFLOW_ENGINE_SPEC neither owns it nor records the exception
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-13
- **Current behaviour (claim):** He cannot see or change the studio's production order from the cockpit.
- **Expected (rule / ruling):** HOLDING_OS_PRODUCT_SPEC area 12 · **authority layer:** (3) spec
- **Evidence (finder):**
  - WORKFLOW_ENGINE_SPEC.md:7 code-defined chains become workflows rows; grep media|studio|dispatch → 0; workflows table → 0 rows
  - migration 20260903001000:32 production line as Creative Director's responsibility text
- **CEO impact:** The order lives in a persona he must read.
- **Suggested fix (finder):** Record the dispatch book as the studio's per-job workflow (with reason) or plan a workflow template with the screen.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F062 [MEDIUM] Two built legs are registered in no spec: the clock (budget_minutes → due_at, queue_sheet_times, DXB_LANE_REST_SECONDS) and the QA judge's cost receipt (cost_ledger source 'qa', judge_ms)
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-05, spec-ownership:SO-20
- **Current behaviour (claim):** AGENT_ORCHESTRATION's B43 table ends at A21 (2026-09-05); COST_CONTROL/OBSERVABILITY carry nothing on either; the board alone describes them.
- **Expected (rule / ruling):** CLAUDE.md §2 registered adaptation; dxb-close-row · **authority layer:** (3) corpus rule vs (4) board
- **Evidence (finder):**
  - grep over HOLDING-OS-MASTER-PLAN excluding the board: queue_sheet_times 0 · budget_minutes 0 · DXB_LANE_REST_SECONDS 0 · judge_ms 0 · "source 'qa'" 0
  - queue.ts:343-347 queue_sheet_times; task-lanes.ts:27-33; migration 20260913001000:16-19 cost_ledger_source_check adds 'qa'; qa.ts:101-109,193,218
  - EVIDENCE-clock-2026-09-13.md grep 'spec|registered|adaptation' → 0
- **CEO impact:** The clock he approved and the gate's spend are knowable only from a board row.
- **Suggested fix (finder):** A22 in AGENT_ORCHESTRATION; OBSERVABILITY read registration; one line each in COST_CONTROL §4 and OBSERVABILITY §4.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F063 [MEDIUM] Three resident services the studio depends on (dxb-comfyui, dxb-vitrin, dxb-gpu-guard) exist only in ~/.config/systemd/user, not in scripts/systemd, and are registered against neither SYSTEM_ARCHITECTURE R5 nor STACK.md
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-14
- **Current behaviour (claim):** The freeze-guard precedent: a hand-written unit left the workstation unprotected after a move.
- **Expected (rule / ruling):** SYSTEM_ARCHITECTURE R5; STACK.md · **authority layer:** (3)
- **Evidence (finder):**
  - ls ~/.config/systemd/user | grep dxb → 13 incl. the three; ls scripts/systemd → 9, none of them
  - SYSTEM_ARCHITECTURE.md:16-17 R5; grep comfyui|vitrin|gpu-guard STACK.md → 0
  - dxb-freeze-guard.service header 'hand-written on the X230 and never committed … left the workstation unprotected'
- **CEO impact:** A rebuilt workstation loses the engine server, the review page and the card's guard.
- **Suggested fix (finder):** Commit the three units under scripts/systemd; register ComfyUI as the engine host.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F064 [MEDIUM] media-studio is absent from packages/gateway/policy/denials.json, so the department that will hold the paid external hands carries no payment/contract denial set
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-19
- **Current behaviour (claim):** Today harmless (house-bus only); leg (6) grants external servers to exactly this department.
- **Expected (rule / ruling):** CAPABILITY_ARSENAL §1 rule 5 / PERMISSION_MODEL G2 · **authority layer:** (3)/(6)
- **Evidence (finder):**
  - denials.json:13 'every new department gets the payment/contract denial set'; keys lack media-studio
  - generate-profiles.ts:166 `opts.denials[dept.slug] ?? []`; B43 leg (6) 'Higgsfield Plus over its official MCP'
- **CEO impact:** When the paid hands arrive, the studio is the one department without the money-touching denial layer.
- **Suggested fix (finder):** Add the standard set and regenerate profiles; note in leg (6).
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F065 [MEDIUM] Board law 7's PLAN.md requirement was never followed on this row — five approved plans, zero PLAN.md
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-05
- **Current behaviour (claim):** The hands, lanes, dispatch-book, clock and continuity plans exist only as ledger summaries.
- **Expected (rule / ruling):** Board law 7 (two-sentence-plan-rule-2026-08-20) · **authority layer:** (2) CEO-accepted rule / (4)
- **Evidence (finder):**
  - 00-BOARD-OPEN-WORK.md:45-47 law 7 'the approved plan is written to the row's own PLAN.md before that session ends'
  - ls .planning/quick/20260903-media-studio-founding/ → 0 PLAN*; ledger plan-2 'the plan was written into the conversation'; budget-per-job 'approved as written in the conversation'
- **CEO impact:** The next builder reconstructs plans from summaries.
- **Suggested fix (finder):** PLAN-<leg>.md for legs (4) and (6) before they reach him; file built legs' plans retroactively as EVIDENCE.
- **STATUS: VERIFIED.** board line 46 requires a PLAN.md per approved plan; ls .planning/quick/20260903-media-studio-founding/ | grep -c PLAN → 0.

### F066 [MEDIUM] Accepted masters and showcase media are outside every backup and have no archive/versioning policy
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-11
- **Current behaviour (claim):** The nightly backup dumps the database only; masters live in a date-named lab folder on one disk.
- **Expected (rule / ruling):** Row B43 chain step 6 · **authority layer:** (4)/(6)
- **Evidence (finder):**
  - ls lab/out/2026-09-04/, /2026-09-05/ → the masters (004/005 4,080,832 bytes each); studio/media 75 files 201 MB
  - dxb-backup.service ExecStart scripts/backup/laptop-pg-dump.sh; grep 'tools/h3|lab/out' → 0
  - media-creative-director.md §3 (6) 'archived under its product code'
- **CEO impact:** One disk failure erases every film he accepted.
- **Suggested fix (finder):** Name the archive in the plan: code-named master store with recipe+seed sidecar, in the backup, checksum in the job book.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F067 [MEDIUM] Rights and licensing are not a leg of the plan; the Flux Krea study card records no licence; music sources unnamed; OpenMontage AGPL waits on him on no leg
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-13
- **Current behaviour (claim):** Which licence FLUX.1-Krea-dev ships under is UNVERIFIED here — the record is silent.
- **Expected (rule / ruling):** B31/B41 licence per weapon; approval gate on contracts · **authority layer:** (4)/(7)
- **Evidence (finder):**
  - grep -i 'licen|commercial' study-cards/flux-krea-dev.md → none; B31 lists 'no licence' among missing fields
  - EVIDENCE-position.md OpenMontage 'AGPL-3.0 must be answered by the CEO'; creative-director §3 (8) 'music and ambience from clean sources'
- **CEO impact:** A client film could carry a still or music bed the holding has no right to sell.
- **Suggested fix (finder):** Rights leg: licence line per engine, named music source, the AGPL decision put to him once.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F068 [MEDIUM] The chain has no client-facing loop: intake is a hand-run script, no revision round, no delivery-format specification; B28's retainer arithmetic assumes rounds the plan does not model
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-14
- **Current behaviour (claim):** The brief door is 'dispatch-brief.mjs by hand today'; the Creative Director's ten steps end at the CEO's verdict; assemble has no platform profile.
- **Expected (rule / ruling):** B43 acceptance sentence; B28 revenue model · **authority layer:** (4)
- **Evidence (finder):**
  - STATE-ARCHIVE diary 'the brief door (scripts/b43/dispatch-brief.mjs by hand today, Hamza's chat tomorrow)'
  - media.ts:100-115 assemble {width,height,fps?,grade?,captions?,logo?}; B28 line 139 '$8,000 commits DXB to roughly 40+ clips'
- **CEO impact:** The first paying client exposes an unplanned revision loop.
- **Suggested fix (finder):** Brief door through Hamza's chat, revision rule per retainer (B28), delivery-profile table in assemble.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F069 [MEDIUM] The 'reference bank of world-class advertising' the seats measure against does not exist
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-15
- **Current behaviour (claim):** 24 persona mentions; on disk a six-frame test folder from Aug 31.
- **Expected (rule / ruling):** B43 quality law · **authority layer:** (4)/(6)
- **Evidence (finder):**
  - grep -rn -i 'reference bank' personas/media-studio → 24; creative-director §9
  - ls ~/tools/h3/ref → 6 files (Aug 31); grep board/STATE → 0
- **CEO impact:** 'Reads as filmed' has no comparator.
- **Suggested fix (finder):** Build the bank as a leg (what, where, licence) or delete the sentence from the seats.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F070 [MEDIUM] The 30-minute-film economics table stands uncorrected by the row's own later measurements (+37 % per cut, post 37 % of clock) while labelled 'costed on this machine's own measurements'
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-16
- **Current behaviour (claim):** Computed at 41 s card per finished second from one 2026-08-30 run; understated by at least a third for multi-shot films.
- **Expected (rule / ruling):** Measure never guess; LAW A · **authority layer:** (4)/(3)
- **Evidence (finder):**
  - B43 'EVERYTHING GENERATED … ~34 h ⟶ 40% … ~16 h ⟶ 20% … ~8 h'
  - B43 amendment (i) '+37 % card per finished second on an 8-shot film'; CAPABILITY_ARSENAL §11 '41.1 s … eight shots = 56.4 s'
- **CEO impact:** The figure he would price a documentary on is understated.
- **Suggested fix (finder):** Recompute on the later numbers or label as pre-amendment history.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F071 [MEDIUM] B33 says 'NOT ONE LINE OF THIS IS BUILT' while B43's media lane already implements a GPU gatekeeper with refusal rules and a run ledger — two designs for one bench, no cross-registration
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-17
- **Current behaviour (claim):** B33's parts (1) and (2) exist in another shape; B33 does not know; B43 says the bench 'has no gatekeeper yet'.
- **Expected (rule / ruling):** Board laws 3 and 5 · **authority layer:** (4)
- **Evidence (finder):**
  - B33 line 134 'NOT ONE LINE OF THIS IS BUILT'; B43 'the bench it displays has no gatekeeper yet (B33)'
  - CAPABILITY_ARSENAL §11 refusal thresholds; migration 20260903190000:42-44 wall_seconds, peak_vram_mib
- **CEO impact:** A second gatekeeper will be designed beside the running one.
- **Suggested fix (finder):** Register the media lane on B33 as the interim gatekeeper; point B33's ledger at media_jobs.
- **STATUS: VERIFIED.** grep -c 'NOT ONE LINE OF THIS IS BUILT' board → 1 (row B33) while media-lane.ts carries the GPU refusal gate.

### F072 [MEDIUM] The studio's screen is blocked two rows deep (B32 behind B22) and the plan never asks him to pull the studio's drawing forward; the only surface is the static vitrin
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-18
- **Current behaviour (claim):** His acceptance test cannot be attempted for the studio until two other rows move.
- **Expected (rule / ruling):** CLAUDE.md 'IT MUST BE ALIVE' acceptance test · **authority layer:** (1)/(2) vs (4) sequencing
- **Evidence (finder):**
  - B32 line 135 'Not started … waits behind B22'; B43 'gated on B32's approved drawing'; STATE 'no screen, the studio's tab included, is drawn before it'
  - index.html static 54,495 bytes served 200 on :8899
- **CEO impact:** The screen he watches most cannot move.
- **Suggested fix (finder):** One question: draw the studio's tab as B32's first screen, or keep the order.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F073 [MEDIUM] The 2026-08-31 engine floor — shot router as data, RunPod lane, engine × machine measurement, CEO-turnable dial with cost shown before the decision — has no leg, no owner row and no code
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F09
- **Current behaviour (claim):** Leg (6) covers external hands only; media_submit has no route/cost; routing_rules has media.creative only.
- **Expected (rule / ruling):** His order 2026-08-31; board law 1 · **authority layer:** (1) order vs (4)/(6)
- **Evidence (finder):**
  - B43 'THE ROUTER — WHICH SHOT GOES WHERE (data, not code…)'; 'Three lanes in order: ① our own station · ② RunPod … ③ the external hands'; 'THE DIAL MUST BE VISIBLE AND TURNABLE'
  - OPEN LEGS name none; grep route|cost|runpod media.ts → none; media_jobs params keys no route; EVIDENCE-external-hands §5 'RunPod 0'
- **CEO impact:** When three jobs land, nothing sizes a machine or prices it; no dial.
- **Suggested fix (finder):** Write legs (7)–(10) with his sentences as heads; gate on approval; nothing built now.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F074 [MEDIUM] The 30-minute film hierarchy he called the point of the row is in no seat's instruction and on no leg — every seat is written for the ≤ 15 s one-take world
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F10
- **Current behaviour (claim):** No seat mentions long form or scenes as a record level; the dispatch book has no scene/shot record.
- **Expected (rule / ruling):** His order 2026-08-31 · **authority layer:** (1) vs (4)/(6)
- **Evidence (finder):**
  - grep 'long form|half-hour|30-minute' over 16 seats → 0; dispatch-book.ts:53-76 SheetSeat no scene/shot
  - B43 'every film he has accepted is ONE prompt, ONE take, ≤ 15 s'; leg (3) PARKED
- **CEO impact:** The business he described has no record shape, no instruction, no exam.
- **Suggested fix (finder):** Plan scene/shot records with leg (3)'s first multi-take job; add long-form paragraphs to CD and Screenwriter §3.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F075 [MEDIUM] The DxB Agency chain (spawn the virtual company → showcase reel → site → clients) has no owner row: B28 does not carry it, B43 only quotes it
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F12
- **Current behaviour (claim):** His 2026-08-27 ruling covers websites only; the spawn and reel are later and unowned.
- **Expected (rule / ruling):** His order 2026-08-31; board law 1 · **authority layer:** (1) vs (4)
- **Evidence (finder):**
  - B43 'holding DxB Agency adında bir sub şirket spawn etmeli … This binds to B28'; B28 line 139 no 'virtual', 'showcase', 'DxB Agency'
  - Ledger website-work-needs-no-row-2026-08-27 scope websites; projects → three B43 projects only
- **CEO impact:** The chain will be re-invented when the system is ready.
- **Suggested fix (finder):** A section on B28 or leg (7) on B43, one line each, gated 'after the system'.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F076 [MEDIUM] The ledger condition 'No further build until the auditor's findings are in his hands' (2026-09-03) stands unamended while five later legs were built on his words; the board cites that id for a leg that says the opposite
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F07
- **Current behaviour (claim):** No ruling violated (each build had his word), but the superseded condition was never annotated; the hands/plans/clock have not reached an external auditor per any record.
- **Expected (rule / ruling):** LAW A; 'never silently choose between conflicting sources' · **authority layer:** (1) later words over (2) earlier condition — recorded wrongly
- **Evidence (finder):**
  - Ledger external-audit-before-next-leg-2026-09-03 conditions 'No further build until…' — no LAW A annotation (contrast external-hands-ready-leg)
  - B43 '(5) THE EXTERNAL AUDIT when he brings the auditor <!-- CEO-OK: external-audit-before-next-leg-2026-09-03 -->'
  - Only external verdict on record: continuity-rule-third-pass verbatim (2026-09-14)
- **CEO impact:** A session reading the ledger finds a standing prohibition he lifted five times.
- **Suggested fix (finder):** Annotate the entry with the lifting words and dates; list what the auditor has and has not seen.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F077 [MEDIUM] After the Flux presenters were retired the holding has no usable elderly-woman presenter, although his cast law requires them and the Creative Director tells the next tests to use one
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F15
- **Current behaviour (claim):** Rosa retired, Safiye (Flux Krea) waits his word, AHMET/JAMES are men; no leg opens an engine-born senior woman's casting take.
- **Expected (rule / ruling):** Cast ruling + engine-born ruling · **authority layer:** (2) joint consequence unplanned
- **Evidence (finder):**
  - Ledger avatar-cast verbatim 'sadece erkek ve yaşlı teyzelerle'; flux-avatars-retired: ROSA out of use, SAFİYE waits
  - KATALOG rows A-005, A-009, A-010, A-011; creative-director §3 'a senior woman presenter on the CEO's order'; no leg
- **CEO impact:** The first senior-woman brief has no cast member.
- **Suggested fix (finder):** One line to him on Safiye; if retired, a text-only H3 casting take under a project on his approval.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F078 [MEDIUM] The studio's product register (KATALOG.md, the vitrin) — codes, films, cast, acceptances — sits outside the repo, the database, git and every gate, Turkish-only with no English twin; tasks.label/label_tr unchecked
- **Lens:** gate-strength, governance-compliance, plan-quality, product-truth, spec-ownership · **merged from:** product-truth:PT-07, spec-ownership:SO-16, gate-strength:GS-10, plan-quality:PQ-22, governance-compliance:GC-19
- **Current behaviour (claim):** KATALOG asserts four 'KABUL EDİLDİ' with no markers; ledger-truth and the i18n check scan repo paths only; media_jobs/tasks have no code column; 28 of 49 studio tasks carry no label.
- **Expected (rule / ruling):** LAW B (gate-checked acceptance); P3 schema-first; language directive; CLAUDE.md §3 parity · **authority layer:** (3)/(4)/(5) vs (6)
- **Evidence (finder):**
  - git -C ~/tools/h3 rev-parse → not a git repository; KATALOG.md '# DXB ÜRETİM KATALOĞU'; index.html lang='tr'
  - ledger-truth.mjs:56,76-80 scan list has no tools/h3; i18n-purity-check.sh → no files/served pages/tasks; SELECT … tasks media-studio → 28 label NULL of 49
  - STATE.md:68,90 make KATALOG a mandatory read and the record of films; media_jobs/tasks columns no code; 00-CEO-DIRECTIVE-LANGUAGE.md:8 scope 'repo or the DB'
- **CEO impact:** The only list of what his studio made can be lost with one folder and edited with no battery failing.
- **Suggested fix (finder):** Mirror KATALOG into the repo (EN + TR column) with CEO-OK markers, add to ledger-truth and i18n scans; plan the product/code entity with B32.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F079 [MEDIUM] EYW-001 v2's acceptance and the K-01 frame-cap lift have no ledger entry carrying his words — LAW B unmet for the studio's first accepted film
- **Lens:** governance-compliance, product-truth · **merged from:** product-truth:PT-08, governance-compliance:GC-09
- **Current behaviour (claim):** The only trace is a clause inside the 002C entry whose verbatim is about 002C.
- **Expected (rule / ruling):** LAW B · **authority layer:** (2) ledger vs (4) and surfaces
- **Evidence (finder):**
  - grep -c 'mükemmel olmuş' ceo-approvals.json → 0; 'EYW-001' only inside eyw-002c-accepted-2026-09-04
  - KATALOG.md:35, index.html:228,240,254, B43 'films accepted by his eye: EYW-001 v2 (2026-09-04 01:12)'; grep 'K-01|124 kare' ledger → 0
- **CEO impact:** The first film's acceptance cannot be audited to his sentence.
- **Suggested fix (finder):** Register eyw-001-v2-accepted and k-01-frame-cap-lifted with his verbatim; add markers.
- **STATUS: VERIFIED.** jq keys | grep -i eyw-001 → none; KATALOG.md carries his words 'mükemmel olmuş, tam doğal ses ve görüntü'.

### F080 [MEDIUM] Code rule broken: LAB-003…006 were issued on the vitrin on 2026-09-03 and have vanished from catalogue and vitrin without a line; their media sit unreferenced
- **Lens:** product-truth · **merged from:** product-truth:PT-11
- **Current behaviour (claim):** 'A code is issued once, never reused; deleted gets one line' is not applied.
- **Expected (rule / ruling):** CEO order 2026-09-01 · **authority layer:** (2) vs catalogue
- **Evidence (finder):**
  - STATE-ARCHIVE.md:2008 'cards DXB-LAB-003 … LAB-004 … LAB-006 … LAB-005'; grep 'DXB-[VGAS]-LAB-00[0-9]' index.html KATALOG.md → G-LAB-001, V-LAB-001/002 only
  - media/ orphan files ladder_2k_motion_src-3b-7b.png, seedvr2_7b_2k_clipC.mp4; KATALOG.md:14,16 'Bir kod bir kere verilir'
- **CEO impact:** The register that should make every conversation unambiguous has holes.
- **Suggested fix (finder):** Add rows LAB-003…006 with state; re-link or drop the orphans.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F081 [MEDIUM] The 004 question to him understates disk: three identical copies, an orphan second 004 take (seed 20260904) no record names, two uncoded BEDIR masters and an uncoded UGC v2
- **Lens:** product-truth · **merged from:** product-truth:PT-13
- **Current behaviour (claim):** If he says 'delete 004', one of four files goes.
- **Expected (rule / ruling):** Code rule; 'per-folder list WITH sizes before deletion' · **authority layer:** (5) vs (6)
- **Evidence (finder):**
  - jobs/6b28a204…/eyw004_00001_.mp4, lab/out/2026-09-05/DXB-V-EYW-004-master…, ComfyUI/output/eyw004_00001_.mp4 (4080832 each); eyw004_00002_.mp4 4189510, seed 20260904, no media_jobs row
  - badr/out BEDIR-v1 60.7 MB, BEDIR-v2 78.3 MB uncoded; ugc/out/OUTLETEURO-UGC-10sn-…-v2.mp4 uncoded; STATE lists one file
- **CEO impact:** An unrecorded take sits on disk with no code.
- **Suggested fix (finder):** One list with paths, sizes, seeds before his word; code or delete the orphan on his answer.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F082 [MEDIUM] KATALOG contradicts itself and the job book on the casting: '12 kare … yeniden çizim 0' vs 25 stills and two redraw rounds
- **Lens:** product-truth · **merged from:** product-truth:PT-14
- **Current behaviour (claim):** Its own rows 006–009 record v1 rejected and redrawn.
- **Expected (rule / ruling):** Measure never guess; LAW A · **authority layer:** catalogue vs (6)
- **Evidence (finder):**
  - KATALOG.md:58 '12 kare … yeniden çizim 0'; :51-54 'v1 REDDEDİLDİ 2026-09-03 21:20 … v2 21:39'
  - media_jobs kind='still' note ILIKE '%cast%' → 25 | 28.6 | 32.7
- **CEO impact:** A number he can quote is false.
- **Suggested fix (finder):** Rewrite line 58 to the measured 25 stills in two rounds.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F083 [MEDIUM] C67 claims '31+ audit rows' for the second pass (005); the book holds 4
- **Lens:** product-truth · **merged from:** product-truth:PT-17
- **Current behaviour (claim):** The 31 belongs to 004.
- **Expected (rule / ruling):** Measure never guess · **authority layer:** complaint ledger vs (6)
- **Evidence (finder):**
  - Complaint ledger line 186 '8 tasks · 8 runs · 1 job · 95,019 tokens · 31+ audit rows'
  - psql EYW-005 → tasks 8 | runs 8 | jobs 1 | tokens 95019 | audit rows 4; EYW-004 → 31
- **CEO impact:** The row he closed carries a number that does not measure.
- **Suggested fix (finder):** Correct C67 to 4.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F084 [MEDIUM] The Prompt / Model Specialist's 'no deceptive realism / AI-labeling' hard gates are unreconciled with the studio's 'reads as filmed' standard; no CEO ruling on labeling exists
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-11
- **Current behaviour (claim):** On a studio job the seat may refuse or label the realism the studio sells.
- **Expected (rule / ruling):** B43 quality law vs design policy · **authority layer:** (4) vs (6); a question for him
- **Evidence (finder):**
  - design-image-prompt-engineer.md:81-83,129 'deceptive-realism requests … violates the labeling policy'
  - media-creative-director.md:55,96 'reads as FILMED' / 'looks like AI video — critical failure'; ledger grep 'label' → 0
- **CEO impact:** Nobody has asked him whether his ads carry an AI disclosure.
- **Suggested fix (finder):** Ask him in one line; then one sentence in the seat's §4.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F085 [MEDIUM] queue_dispatch's idempotency is a read-then-write outside the transaction with no unique constraint — two concurrent calls with the same (author, code) both birth a crew
- **Lens:** code-vs-records · **merged from:** code-vs-records:CVR-08
- **Current behaviour (claim):** A19 and the tool text promise 'Idempotent per (author task, code)'; only sequential repeats are safe.
- **Expected (rule / ruling):** A11 'Exactly-once is structural, not hopeful' · **authority layer:** (3) vs (6)
- **Evidence (finder):**
  - queue.ts:186-198 prior lookup before db.transaction() at :220; pg_indexes audit_log → pkey + idx_audit_task only
  - AGENT_ORCHESTRATION A19; dispatch-book.test.ts:291-299 sequential only
- **CEO impact:** A retry fires two crews for one film.
- **Suggested fix (finder):** pg_advisory_xact_lock inside the transaction or a unique partial index; concurrent test.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F086 [MEDIUM] A future date written in the past tense on the board: 'as Sora 2 did on 2026-09-24'
- **Lens:** records-parity · **merged from:** records-parity:RP-11
- **Current behaviour (claim):** Directive-named class in the register he reads.
- **Expected (rule / ruling):** RULE #0-A 'A prediction is never written in the past tense' · **authority layer:** (3) vs (4)
- **Evidence (finder):**
  - B43 'as Sora 2 did on 2026-09-24'; B42 line 139 'removed from the API on 2026-09-24 — measured'; today 2026-09-14
- **CEO impact:** A factual error in the register.
- **Suggested fix (finder):** 'as Sora 2 will on 2026-09-24 (OpenAI notice)' until measured.
- **STATUS: VERIFIED.** Row B43 text: 'as Sora 2 did on 2026-09-24' (today 2026-09-14).

### F087 [LOW] VFX / Post still says the enlarger's first measurement on this station has not been taken — SeedVR2 was measured 2026-09-03 and used on accepted 002C
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-14
- **Current behaviour (claim):** The seat would hedge or re-measure what he has figures for.
- **Expected (rule / ruling):** law-d conditions · **authority layer:** (2) vs (6)
- **Evidence (finder):**
  - media-vfx-post.md:61,104; B43 (j) SeedVR2 figures; KATALOG 002C 'SeedVR2 7B' accepted
- **CEO impact:** Low.
- **Suggested fix (finder):** Point :61/:104 at the dated study-card figures.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F088 [LOW] The 1080 ceiling for UGC is carried by the Creative Director only, not by VFX / Post which runs the enlarger
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-15
- **Current behaviour (claim):** VFX says delivery size is 'the format's'.
- **Expected (rule / ruling):** engine-standard-4-steps-no-upscale-unless-asked-2026-09-04 · **authority layer:** (2) vs (6)
- **Evidence (finder):**
  - grep 1080 over 16 seats → creative-director.md:68 only; media-vfx-post.md:63,72; ledger engine-standard '1080p is the ceiling'
- **CEO impact:** An enlargement could pass his ceiling in the executing seat.
- **Suggested fix (finder):** One clause in vfx-post §3 step (8).
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F089 [LOW] Replace-all artefacts: the CEO's road sentence pasted verbatim up to three times in one paragraph, five to seven times per seat; 416 KB across 16 seats delivered whole as system prompt
- **Lens:** plan-quality, rulings-vs-seats · **merged from:** rulings-vs-seats:RS-17, plan-quality:PQ-20
- **Current behaviour (claim):** Fingerprint of mechanical replacement, not the in-person authorship the records claim.
- **Expected (rule / ruling):** EMPLOYEE_PERSONA_STANDARD §4; perfection gate · **authority layer:** (3)/(2) vs (6)
- **Evidence (finder):**
  - grep -o 'the road comes from the brief' media-creative-director.md | wc -l → 5 (:63 three times); same block in identity:53, product:86, advertising:68, prompt-engineer:66, film-director:62,65
  - cat 16 seats | wc -c → 416,005; EMPLOYEE_PERSONA_STANDARD §4 'jenerik metin = yüzeysellik'
- **CEO impact:** Diluted judgement, cost per run.
- **Suggested fix (finder):** One statement per rule per seat; length ceiling; re-gate.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F090 [LOW] The Delivery / QC seat's code rule omits the catalogue's avatar form (no client segment)
- **Lens:** rulings-vs-seats · **merged from:** rulings-vs-seats:RS-16
- **Current behaviour (claim):** The next avatar coded by the seat would not match the series.
- **Expected (rule / ruling):** CEO code order 2026-09-01 · **authority layer:** catalogue vs (6)
- **Evidence (finder):**
  - media-delivery-qc.md:67 'DXB-<TYPE>-<CLIENT>-<SEQ>'; KATALOG.md 'avatarlar müşteriye ait değildir, atlanır'; DXB-A-010
- **CEO impact:** Minor.
- **Suggested fix (finder):** Add the avatar exception to :67.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F091 [LOW] Small stale numbers on the row and in a table comment: '205, settled above' beside 'roster 219'; media_jobs COMMENT 'executed one at a time'
- **Lens:** plan-quality · **merged from:** plan-quality:PQ-23
- **Current behaviour (claim):** Two roster numbers in one row; a table comment superseded by A18.
- **Expected (rule / ruling):** U41 · **authority layer:** (4)/(6)
- **Evidence (finder):**
  - B43 '205, settled above' and 'roster 219, active 213'; agents → 213 + 6 = 219
  - migration 20260903190000:54-55 COMMENT 'one at a time'; A18
- **CEO impact:** Negligible.
- **Suggested fix (finder):** One roster number; a follow-up comment or a note in A18.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F092 [LOW] The row's shelf heading says 'MEASURED 2026-08-31' while its own footnote says every figure was read from vendors
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F22
- **Current behaviour (claim):** 'MEASURED' on a vendor table is the word he told the project never to misuse (the 14 vs 10.5 min half of this raw finding is carried in F041).
- **Expected (rule / ruling):** Measure never guess · **authority layer:** (4)
- **Evidence (finder):**
  - B43 'WHAT IS HOSTABLE AND WHAT IS NOT — MEASURED 2026-08-31.' vs 'The Elo figures, the VRAM figures and the hostability column are read from vendors and leaderboards'
- **CEO impact:** Small.
- **Suggested fix (finder):** 'READ FROM VENDORS, 2026-08-31'.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F093 [LOW] Ledger 'where' pointers that do not resolve: a missing memory note, a011_*.png that does not exist, 'C67 row stays open' (closed), eleven 'STATE 2026-09-xx' blocks moved to the archive
- **Lens:** records-parity · **merged from:** records-parity:RP-13
- **Current behaviour (claim):** His external auditor following a 'where' lands nowhere.
- **Expected (rule / ruling):** Ledger discipline; LAW A · **authority layer:** (2) vs (6)
- **Evidence (finder):**
  - tts-cancelled where 'memory feedback-tts-iptal-motor-sesi' → no such file; ahmet-cast where 'a011_*.png' → No such file (james_*.png)
  - eyw-004-005-accepted where 'C67 … row stays open' — C67 CLOSED line 186; STATE blocks moved by 48b22105, b87b45cd
- **CEO impact:** Low.
- **Suggested fix (finder):** Point at what exists; add '(now STATE-ARCHIVE …)' in one pass.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F094 [LOW] COUNSEL file's 'author's reading' keeps a Flux-still destination for the local road with no superseded note
- **Lens:** records-parity · **merged from:** records-parity:RP-19
- **Current behaviour (claim):** B43 cites the file as the rule's source; his 2026-09-14 word closed Flux for local takes.
- **Expected (rule / ruling):** LAW A · **authority layer:** (2) vs (7)
- **Evidence (finder):**
  - COUNSEL-gpt-6-astra-on-plan-3-2026-09-13.md:15 'the destination still may be a Flux still only where the presenter is written'; ledger flux-local-engine-only 'Flux plays no part'
- **CEO impact:** A session reading the counsel re-opens the C68 class.
- **Suggested fix (finder):** One line at the top pointing at the two 2026-09-14 rulings.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F095 [LOW] B08's evidence cell '205/205 agents carry brain_source=slot' is stale (219; 209 slot · 10 ceo_override)
- **Lens:** records-parity · **merged from:** records-parity:RP-17
- **Current behaviour (claim):** Minor; B08 is parked.
- **Expected (rule / ruling):** Measure never guess · **authority layer:** (6) vs (4)
- **Evidence (finder):**
  - 00-BOARD-OPEN-WORK.md:95; SELECT brain_source,count(*) → slot 209 · ceo_override 10
- **CEO impact:** Minor.
- **Suggested fix (finder):** Bring the cell to 219 when B08 is next touched.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F096 [LOW] The shoot driver contract is Turkish console text parsed by regex; the failed row's CEO-visible error mixes English prefix and Turkish chatter
- **Lens:** code-vs-records · **merged from:** code-vs-records:CVR-10
- **Current behaviour (claim):** A driver wording change silently turns every take into 'failed'.
- **Expected (rule / ruling):** 00-CEO-DIRECTIVE-LANGUAGE · **authority layer:** (2) vs (6)
- **Evidence (finder):**
  - media-lane.ts:168-176 /duvar saati/, /VRAM tepe/, /sonuc: BASARILI/; run.py:150-161 prints them; media_jobs 16277dac.error 'python exited null: istek: … kare … adim'
- **CEO impact:** A half-Turkish error on a screen he reads.
- **Suggested fix (finder):** run.py emits one JSON line; lane parses JSON.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F097 [LOW] SDK isolation covers the seat's run and QA only; council, decompose, classify and the workflow executor call the SDK without it — A20's 'every task-side model call' is wider than the code
- **Lens:** code-vs-records · **merged from:** code-vs-records:CVR-12
- **Current behaviour (claim):** Nothing leaks today (media.creative needs_council=false); the day a studio row needs council the identity leak returns unannounced.
- **Expected (rule / ruling):** Spec-gap = fix at once · **authority layer:** (3) vs (6)
- **Evidence (finder):**
  - grep workerIsolation → worker-shim.ts:364, qa.ts:81-85 only; council.ts:90, decompose.ts:115, classify.ts:56, workflow/executor.ts:103 not
  - routing_rules media.creative needs_council → f; A20 wording
- **CEO impact:** None today.
- **Suggested fix (finder):** Spread workerIsolation() or narrow A20.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F098 [LOW] media_submit audits with the task uuid as actor, in a separate statement from the job insert
- **Lens:** code-vs-records · **merged from:** code-vs-records:CVR-14
- **Current behaviour (claim):** The audit trace of card spending names a uuid, not the seat.
- **Expected (rule / ruling):** Audit standard the queue group follows · **authority layer:** (6)
- **Evidence (finder):**
  - media.ts:163-181 appendAudit(task_id, 'media.submit', task_id…); audit_log actor column holds a uuid; contrast queue.ts:220-332 one transaction
- **CEO impact:** Low.
- **Suggested fix (finder):** actor = seat slug; one transaction.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F099 [LOW] Real secret files sit inside the repository directory (git-ignored, never committed): 82 gitleaks file-mode hits in vps/*/.env, secrets.local, caches
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-17
- **Current behaviour (claim):** Git history for September is clean; a `git add -f` or copied tree would carry live credentials.
- **Expected (rule / ruling):** 'Secrets never enter the repo' (satisfied for git) · **authority layer:** (6)
- **Evidence (finder):**
  - gitleaks detect --no-git → 82 (vps/litellm/.env 4, vps/provision/.hetzner.local 1, …); git check-ignore → all ignored; git log --all → 0 commits
  - gitleaks --since=2026-09-03 → 63 commits, no leaks
- **CEO impact:** None today.
- **Suggested fix (finder):** Move to ~/.config/dxb like .env.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F100 [LOW] 'LAW E' was minted on 2026-09-04 without a 'kanun olsun' and reverted 45 minutes later; the record calls it 'a wrong rewrite', not the law-minting it was; the two reverts lack the author trailer
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-18
- **Current behaviour (claim):** Reverted the same evening; the lesson is not on record under its real name.
- **Expected (rule / ruling):** 'Nothing becomes a law unless he says' · **authority layer:** (2) vs (6)
- **Evidence (finder):**
  - 5ad40315/b391a35c 'LAW E — no picture to the motion engine'; 210eea78/01f6864e reverts without Co-Authored-By (61 of 63 carry it)
  - Ledger road-comes-from-the-brief 'a wrong "no picture to the engine" rewrite at 20:50 was reverted'
- **CEO impact:** Low.
- **Suggested fix (finder):** One clause in the diary.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F101 [LOW] Audit-trail actor 'ceo' on acts the session or a migration performed (department founding, grants, routing changes, projects, purge; migrations minting the CEO's jwt sub) while persona binds carry 'fable-5' — two attribution conventions, the idiom named in no spec
- **Lens:** governance-compliance, spec-ownership · **merged from:** governance-compliance:GC-16, spec-ownership:SO-24
- **Current behaviour (claim):** Pre-existing convention (library.grant as 'ceo' since 2026-07-14); a future reader cannot tell his hand from the author's.
- **Expected (rule / ruling):** 'One session, one author'; P4 · **authority layer:** (6) vs (3) doors' design
- **Evidence (finder):**
  - audit_log actor='ceo' since 2026-09-03 → routing_change 6 · employee.created 14 · library.grant 9 · project.* 6 · records.purge 1; persona.bound → fable-5 63
  - migrations 20260903190000:69-72 and 20260903191000:20 set_config('request.jwt.claims', '{"sub":"11111111-…"}')
- **CEO impact:** The log says he founded the department and changed routing himself.
- **Suggested fix (finder):** Carry the acting author in payload; register the migration-borne CEO-approval idiom once.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F102 [LOW] The mechanical persona gate (gatePersona) has no non-test caller and is not in the recorded filing procedure; the DB verdict is the author's own word (11 seats 'passed' in four seconds, one note)
- **Lens:** gate-strength · **merged from:** gate-strength:GS-11
- **Current behaviour (claim):** 16/16 PASS when run by the auditor, so no live defect; the machine layer is not wired.
- **Expected (rule / ruling):** EMPLOYEE_PERSONA_STANDARD §7; dxb-persona step 2 · **authority layer:** (3) vs (5)/(6)
- **Evidence (finder):**
  - grep 'gatePersona(' → only hr/tests/gate.test.ts; dxb-persona SKILL.md:49 'Run the mechanical gate'
  - audit_log persona.gated 14:52:43–47 eleven 'passed' with identical note; mech-gate run → 16/16 PASS
- **CEO impact:** 'Gated' means the author signed.
- **Suggested fix (finder):** sync script runs gatePersona before submit and refuses on failure.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F103 [LOW] The runtime silently runs a seat with no persona when its file is missing; the road check's roster is hardcoded — a new or re-pathed seat is invisible to the only guard
- **Lens:** gate-strength · **merged from:** gate-strength:GS-12
- **Current behaviour (claim):** Today all 16 files exist; a renamed file or a 17th seat reintroduces the anonymous worker with every gate green.
- **Expected (rule / ruling):** Plan ② 'a seat runs AS the seat' · **authority layer:** (6)
- **Evidence (finder):**
  - persona.ts:47-52 returns '' on missing file/header; prompt-core.ts:52-53 drops the block; road-consistency.test.ts:32-52 literal paths
- **CEO impact:** Latent.
- **Suggested fix (finder):** Audit 'persona missing' and refuse the staffed run; derive the roster from agents rows.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F104 [LOW] Three studio switches (DXB_MEDIA_CPU_LANES, DXB_LANE_REST_SECONDS, DXB_WORKER_ISOLATION) are environment variables, not registered settings — invisible from the cockpit
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-25
- **Current behaviour (claim):** Unlike the B39 precedent orchestration.dispatch_lanes.
- **Expected (rule / ruling):** HOLDING_OS_PRODUCT_SPEC four-verb rule · **authority layer:** (3)
- **Evidence (finder):**
  - settings_registry keys matching media|lane|isolation → orchestration.dispatch_lanes only; media-lanes.ts, task-lanes.ts:27-33, sdk-isolation.ts:22; no unit file sets them
- **CEO impact:** He must be able to SEE them.
- **Suggested fix (finder):** Register as settings with env fallback, or record as operator-only in A17/A18.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F105 [LOW] Two b43 projects had name_tr/purpose_tr 'set by hand' — a company-database write outside the control seam that left no audit row
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-26
- **Current behaviour (claim):** P4 says an unaudited change is impossible.
- **Expected (rule / ruling):** P4 single write seam · **authority layer:** (3)/(6)
- **Evidence (finder):**
  - B43 'set by hand for two projects'; audit_log project.* since 2026-09-03 → create ×3, set_status ×3 only
- **CEO impact:** Two labels with no trace of who wrote them.
- **Suggested fix (finder):** Fix the door; retro audit row.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F106 [LOW] The vitrin serves the studio's films and catalogue on 0.0.0.0:8899 with no authentication while STATE gives the loopback address
- **Lens:** spec-ownership · **merged from:** spec-ownership:SO-23
- **Current behaviour (claim):** Client work readable by any device on the network.
- **Expected (rule / ruling):** Declared temporary; no new exposure · **authority layer:** (6)
- **Evidence (finder):**
  - dxb-vitrin.service ExecStart … http.server 8899 --bind 0.0.0.0; ss -ltnp → 0.0.0.0:8899; STATE.md:74 'http://127.0.0.1:8899/'
- **CEO impact:** Small.
- **Suggested fix (finder):** Bind to 127.0.0.1 unless he wants LAN access.
- **STATUS: VERIFIED.** ss -ltnp → LISTEN 0.0.0.0:8899 python3 pid 2683.

### F107 [LOW] Hard-coded tab counters in the vitrin source (6 · 4 · 9) disagree with content (17 · 2 · 11) beside a comment saying counters are never hand-written
- **Lens:** product-truth · **merged from:** product-truth:PT-19
- **Current behaviour (claim):** Wrong numbers if rendered without script.
- **Expected (rule / ruling):** RULE #0 · **authority layer:** surface
- **Evidence (finder):**
  - index.html:90-92 counts; :496 '// Sayaçlar sayfadan sayılır, elle yazılmaz'; card count → 17/2/11
- **CEO impact:** None while JS runs.
- **Suggested fix (finder):** Drop the numbers; let countCards() create them.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F108 [LOW] The deletion order is dated 2026-09-04 in the ledger and 2026-09-05 everywhere else
- **Lens:** product-truth · **merged from:** product-truth:PT-20
- **Current behaviour (claim):** Two dates for one order.
- **Expected (rule / ruling):** Zero contradictions · **authority layer:** (2) vs catalogue
- **Evidence (finder):**
  - ledger id vitrin-women-ugc-and-deniz-cards-removed-2026-09-04 date 2026-09-04; KATALOG/C66/commit 35f3f445 → 2026-09-05 00:20
- **CEO impact:** Minor.
- **Suggested fix (finder):** Note the local time in the what-field or re-date on his word.
- **STATUS: VERIFIED.** ledger key vitrin-women-ugc-and-deniz-cards-removed-2026-09-04 (date 2026-09-04); KATALOG rows say 'SİLİNDİ — CEO emretti, 2026-09-05'.

### F109 [LOW] Catalogue's avatar file convention (-p / -f / -b, e.g. DXB-A-001-p) matches no file on disk
- **Lens:** product-truth · **merged from:** product-truth:PT-21
- **Current behaviour (claim):** Files are <slug>_portrait/profile/body.png; the vitrin links av_<slug>_<view>.png.
- **Expected (rule / ruling):** Code rule usability · **authority layer:** catalogue vs disk
- **Evidence (finder):**
  - KATALOG.md:60-61; ls avatars → elif_portrait.png …; index.html:248 'DXB-A-006-p/f/b'
- **CEO impact:** A code he quotes points to no file.
- **Suggested fix (finder):** Symlink by code or state the real names.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F110 [LOW] Leg (6) calls the fal exam 'free' and READY 'a key in the vault' without naming that opening an account on any route is itself an approval-gated identity step
- **Lens:** ceo-intent-coverage · **merged from:** ceo-intent-coverage:F19
- **Current behaviour (claim):** A session could open an account for the 'free' exam without his word.
- **Expected (rule / ruling):** Approval gate (identity steps); B41 · **authority layer:** (3)/(4)
- **Evidence (finder):**
  - B43 'five generations a day free for a signed-in account'; B41 line 128 'Money, an account, a credential or an outward call = it stops at him'
- **CEO impact:** Latent.
- **Suggested fix (finder):** One clause in leg (6): account and key only on his approval, one proposal per route.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

### F111 [LOW] Evidence file defers decisive test output to commit messages — and the commit carried the wrong number ('32/32' beside 'the new test, 28')
- **Lens:** governance-compliance · **merged from:** governance-compliance:GC-15
- **Current behaviour (claim):** The evidence he hands his auditor points to a commit message that is itself wrong.
- **Expected (rule / ruling):** dxb-verify cites the command and its decisive output line · **authority layer:** (3) vs (7)
- **Evidence (finder):**
  - EVIDENCE-continuity-rule-2026-09-14.md:37,121 '(result in the commit message)'; git log -1 701e881e body '32/32 after … incl. the new test, 28'; EVIDENCE-audit:59-60
- **CEO impact:** Low.
- **Suggested fix (finder):** Paste the actual vitest summary lines.
- **STATUS: AUDITOR CLAIM / NOT REFUTER-VERIFIED.** Not re-measured by the author in this session; the refuters never ran. Treat as a lead to re-measure before acting.

## 5. Implementation priority — the 5 critical + 31 high, with the author's verdict

| ID | Sev | Title (short) | Author's re-measurement |
|---|---|---|---|
| F001 | critical | The deleted films survive in records, the ledger, the archive, the vitrin and the company database while the r | VERIFIED |
| F002 | critical | STATE.md says the 2026-09-04 films were made through the company's own road — they were not (C67's misstatemen | VERIFIED |
| F003 | critical | STATE.md presents author-written text as the CEO's verbatim words ('His working style, in his words'), includi | VERIFIED |
| F004 | critical | Row B43 files the hands, lanes and dispatch book under 'BUILT AND STANDING (accepted by his eye or his word)'  | VERIFIED |
| F005 | critical | Row B43 asserts the six WanGP engines are 'HELD, installed' and forbids re-checking them — WanGP is not instal | VERIFIED |
| F006 | high | Row B43's 2026-08-31 doctrine keeps superseded sentences in force with amendments (a)–(k) appended — the LAW A | VERIFIED |
| F007 | high | Row B43's header, status cell and 'may not be planned before B32' sentence say nothing is started or built whi | VERIFIED |
| F008 | high | CAPABILITY_ARSENAL_DOCTRINE §11/§9 — the studio's owning drawer — still prescribes edge-tts as the ad voice, F | VERIFIED |
| F009 | high | The cancelled TTS instrument (edge-tts, a Microsoft cloud service absent from STACK.md) is still a callable `v | VERIFIED |
| F010 | high | Residual voice instructions in three seats: the Screenwriter writes voice-over/narration, the Storyboard seat  | PARTIALLY VERIFIED |
| F011 | high | The constitutional cast rule (men and elderly women only) is written into none of the 16 seats | VERIFIED |
| F012 | high | Eleven clauses in six seats still admit only two cast roads — the engine-born presenters AHMET and JAMES would | VERIFIED |
| F013 | high | The 4-step engine standard is absent from all 16 seats while three seats call low-step recipes 'hunting only,  | DOWNGRADED |
| F014 | high | LAW C ('KANUN C') is cited and obeyed everywhere but has no registered ruling in ceo-approvals.json | VERIFIED |
| F015 | high | Session-only remarks written into standing files again — including 'kısa yaz', the exact remark he caught on 2 | DOWNGRADED |
| F016 | high | Handover prompts are written in the CEO's first person, carry author-composed orders as his, and are Turkish a | VERIFIED |
| F017 | high | STATE.md §4 orders the next session to write a handover prompt (citing a dxb-start step that does not exist) — | VERIFIED |
| F018 | high | 'RULES BORN ON THIS ROW AND STILL LIVE' promotes eight session-made rules to standing rules with no registered | PARTIALLY VERIFIED |
| F019 | high | The evening audit's correction ⑦ is incomplete: 'across all 16 seat files', '20/32 → 32/32 kept as regression  | VERIFIED |
| F020 | high | The complaint-renumbering ledger entry is garbled ('C66–C68 colliding with C66–C64') and C68's numbering note  | VERIFIED |
| F021 | high | 'The seats' status untouched (14 dormant, 2 assigned active)' in the ledger, the board and the vitrin matches  | VERIFIED |
| F022 | high | A cancelled running shoot is written into the job book as 'failed' with an opaque Turkish error — race in medi | VERIFIED |
| F023 | high | A media job in 'running' has no reaper, heartbeat or start-up recovery; the service's 90 s stop timeout cuts a | PARTIALLY VERIFIED |
| F024 | high | agents.persona_version reads 'v2.0-fable' for all 213 active seats and is rendered as 'Persona' on his employe | VERIFIED |
| F025 | high | The showcase stamps 'FLUX ile çizildi' and 'REF2VA'ya hazır' on every cast card — including AHMET and JAMES, t | VERIFIED |
| F026 | high | The b43 battery writes probe frames into the PRODUCTION studio work root on every run (env read at import time | VERIFIED |
| F027 | high | KENAN and DENİZ's drawing source is on disk (FLUX.1-Krea-dev, 2026-09-01) — the record told him it is unknown  | VERIFIED |
| F028 | high | The studio's founding directive (16 sections, 2026-09-03) and the 2026-08-31 orders exist only in chat transcr | VERIFIED |
| F029 | high | The road check catches only its own phrase list: 11 of 14 independently injected contradictions passed, while  | VERIFIED |
| F030 | high | The persona quality gate guards the DB copy, not the prompt the agent runs: the runtime reads the file, nothin | VERIFIED |
| F031 | high | ledger-truth's LAW B check is a marker validator, not a claim detector: on B43 it sees 0 claims beside 33 mark | VERIFIED |
| F032 | high | A fresh bootstrap reverses the studio-brain ruling: migrations seed Opus 5 ON / Fable 5.1 OFF with a guardrail | VERIFIED |
| F033 | high | Two of the sixteen seats (Prompt / Model Specialist, Editor) can never be dispatched by the studio's road: que | VERIFIED |
| F034 | high | MODEL_ROUTING_SPEC §4d's tier-homogeneity invariant has been contradicted by live routing since 2026-09-05 and | VERIFIED |
| F035 | high | The employees page shows every studio seat's brain as Claude Opus 5 (agents.brain='fable-5') while all 27 stud | VERIFIED |
| F036 | high | The two-roads cost table he said he must prepare from ('önce hazırlamam lazım') is neither delivered nor on an | VERIFIED |

Tally of the 36: VERIFIED 31 · PARTIALLY VERIFIED 3 (F010, F018, F023) · DOWNGRADED 2 (F013, F015) · not re-measured 0.

## 6. B43 and linked studio work — two lists, kept apart

### 6a. PRE-EXISTING BOARD WORK (open before this audit; owner and gate as the board states)

| Item | Where | Waits on | Note |
|---|---|---|---|
| (2b) the clock — built 2026-09-13, not accepted (LAW B) | B43 open legs; `EVIDENCE-clock-2026-09-13.md` | CEO's eye; first measurement on the next film | Audit verdict 2026-09-14: code correct (times table reproduced; 20/20 tests); two record notes F038, F041. His 20:0x rule makes acceptance follow the verdict — registration pending his 'devam'. |
| (3) continuity between shots — PARKED with Astra's rule | B43; ledger astra-rule-accepted-flux-scoped-to-local-2026-09-14 | first job needing more than one take | instruction corrected, not tried in production |
| (4) the QC list on the road (lettering on props, a listening hand for voice, wardrobe/flow/object state, identity threshold) | B43 | understanding report → plan → his approval → code | not started |
| (5) the external audit | B43; ledger external-audit-before-next-leg-2026-09-03 | he brings the auditor | evidence folder is the hand-over (F076: the 'no build until' condition stands unamended) |
| (6) the external hands READY (Higgsfield MCP · MiniMax H3 API · fal H3 Max) | B43; `EVIDENCE-external-hands-2026-09-14.md` | understanding report → plan → approval; money out per route (B41) | nothing integrated; hands know one route |
| B08 the brains (Hamza switchable, top-tier set, per-employee control, directive lane) incl. step 0 activation-gate author list | B08 line 95 | his call, then his approval of the six steps | PARKED 2026-09-13 |
| B32 the V2 design package — the studio tab | B32 | CEO | no studio screen before its drawing is approved (B32 is behind B22 — F072) |
| project-creation door missing name_tr/purpose_tr; SDK runs inherit repo cwd (settingSources isolated since A20 — F051) | B43 'Also open on this row' | his call | |
| the 004 file on disk (4,080,832 bytes) | STATE waits-on-him | his word | F081 says more copies exist — not re-measured |
| C68 closing; the C42 test red of 2026-08-19 | complaint ledger; STATE | his word | |
| Safiye / Kenan / Deniz drawing source | STATE waits-on-him | **answered 2026-09-14 20:0x: they stay** | ledger entry + STATE/KATALOG update pending his 'devam' |

### 6b. AUDIT-DISCOVERED DEFECTS grouped by theme (IDs above carry the evidence)

- **Records that tell the CEO an untruth:** F002 (STATE Honest position), F003 (author text as his verbatim), F004 (accepted-by-plan-ids), F005 (WanGP 'installed'), F019/F020 (ledger residue, garbled renumbering), F021 (14 dormant/2 active), F036 (cost table owed, no leg), F079 (EYW-001 acceptance unregistered), F086 (future date), F108 (two dates), F052, F054, F093.
- **Rulings not fully in the seats:** F011 (cast law absent), F012 (two-road clauses), F010 (voice-over residue), F013 (4-step standard absent), F037 (skin-mark rule), F039 (GPT-6 Astra named), F087/F088/F090.
- **Plan/spec drift (LAW A on the row and in the owning spec):** F006, F007, F008, F034, F057, F062, F059, F060, F061, F065, F071, F028, F073, F074, F075.
- **Code seams / code ↔ records:** F022 (cancel → 'failed'), F023 (no reaper, 90 s stop), F026 (tests write to production probes), F033 (two seats undispatchable), F032 (bootstrap reverses brain ruling), F035 (brain label Opus 5), F038 (queue_get exposes due_at), F041 (14 min in the hand), F085 (idempotency race), F096, F097, F098, F103, F104, F105.
- **Gate weakness:** F029 (road check 3/12), F030 (gate guards DB copy, runtime reads file), F031 (marker counter), F047 (nondeterministic b43 test), F048 (battery narrowed), F049 (safety thresholds untested), F050 (8/8 vs 9/9), F102, F111.
- **Product / cast / disk truth and provenance:** F001 (deleted-film residue in DB/vitrin/ledger), F025 (FLUX tag on engine-born cast), F027 (Kenan/Deniz Flux provenance), F043 (Medya OS pointers), F044 (AHMET under A-006), F045, F046, F080, F081, F082, F083, F106 (vitrin on 0.0.0.0), F107, F109.
- **Governance / legal:** F014 (LAW C provenance), F015, F016, F017, F018, F055, F056, F064, F067 (rights/licensing), F099, F100, F101, F110.
- **Ownership / plan completeness (Ferrari gap):** F057, F058, F066, F068, F069, F070, F072, F073, F074, F075, F077, F078, F084.

## 7. Work list for the implementation session, in dependency order (NOT executed here)

Every item: understanding report → plan → the CEO's approval → code (LAW C / dxb-start Phase 2); one topic at a time; after any change the full battery of the dxb-verify door (`pnpm typecheck` · `pnpm test` or the recorded subset with the reason · `pnpm verify:ledger` · `bash scripts/i18n-purity-check.sh` · `gitleaks detect`) and a blast-radius re-measure; a persona change goes file → `DXB_PERSONA_AUTHOR=fable-5 bash scripts/sync-personas-to-db.sh <file>` → `fn_persona_gate(...,'passed',...)` → bind → `--verify`; a resident-service restart only when `in flight = 0`.

| # | Work | Findings | Acceptance criteria | DONE evidence |
|---|---|---|---|---|
| W1 | Register the CEO's two words of 2026-09-14 20:0x in the ledger (acceptance follows the audit verdict; Safiye/Kenan/Deniz stay) and bring STATE.md's waits-on-him line, KATALOG rows A-002/004/005 and row B43 to them | F027, 6a | ledger entries with his verbatim; `pnpm verify:ledger` OK; STATE line 33 no longer lists the drawing source; KATALOG rows carry the word | `jq '."avatars-stay-…"' ceo-approvals.json`; verify:ledger output |
| W2 | Correct the records that misstate (STATE Honest position; STATE:70 'his words'; STATE:76 handover order; ledger residue 'all 16 / 122 / 32/32'; the garbled renumbering sentence; C68's stale note; '14 dormant, 2 assigned active' everywhere; B43 'BUILT AND STANDING' heading vs plan-approval ids; B43 status cell 'nothing built'; the Sora date; the two deletion dates; the EYW-001 acceptance entry with his KATALOG words) | F002 F003 F004 F007 F017 F019 F020 F021 F079 F086 F108 | each sentence replaced (LAW A), not annotated; every acceptance claim carries a registered id whose verbatim is about that thing; `pnpm verify:ledger` OK | grep of each old sentence → 0; verify:ledger output; git diff of the four files |
| W3 | Row B43 doctrine brought under LAW A: delete or rewrite the superseded 2026-08-31 sentences (TTS voice, never-T2V, scrap by policy, upscale at step 6, Flux/OpenAI hands, 6–10 shots, mandatory still, 'HELD, installed' WanGP shelf) so the row reads true without the amendment block; keep his quoted words as history | F005 F006 F007 | no live sentence on line 146 contradicts a September ruling; the six-engine shelf labelled as study cards, unmeasured | grep -o counts of the eight phrases on line 146 → 0; ledger gate OK |
| W4 | The owning spec's drawer (CAPABILITY_ARSENAL §9/§11) and MODEL_ROUTING §4d brought to the rulings: edge-tts row removed or marked cancelled, RealESRGAN → SeedVR2, lanes (A18), the tier-set conflict named as a registered adaptation | F008 F034 | spec text equals the ledger; markers present | grep 'edge-tts' §11 → 0; grep for the §4d adaptation note |
| W5 | Personas: write the cast law (men and elderly women only; engine-born faces) into every casting/boarding seat; open the two-road clauses to the three roads (identity:60/92, CD:86, FD:28/79); remove voice-over/narration/scratch-voice/AI-voice residue (screenwriter, storyboard, editor); name the 4-step standard; add the skin-mark rule to the Identity and Prompt seats; remove 'GPT-6 Astra' from CD:69 / FD:71; VFX: 1080 ceiling and the measured enlarger | F010 F011 F012 F013 F037 F039 F087 F088 | each seat re-submitted, gated, bound, `--verify` MATCH 16/16; grep proofs per topic; no old sentence left beside the new (his order of 2026-09-14) | `scripts/sync-personas-to-db.sh --verify` 16/16; grep counts; the rebuilt road check (W6) green on the roster and red on a mutated copy |
| W6 | Rebuild the road check so it bites: per-condition semantic checks (negation-aware, refusal-head-aware, Turkish-aware) plus the cast, lettering and 4-step conditions; prove on ≥ 12 injected sentences of different shapes with the failing list printed; record the true count once | F029 F050 F103 | on the live roster 16/16 pass; on the mutated roster every injected sentence named; roster not hard-coded (a 17th seat or a renamed file fails loudly) | vitest output on both roots pasted into the evidence file |
| W7 | The cancelled TTS hand: remove `voice` (edge-tts) from the media group and the media-studio profile, or gate it to his explicit order; STACK.md note | F009 | media_submit kind enum has no edge-tts route; profile recompiled; media-hands test updated | grep 'edge-tts' packages → 0 outside history; tests/b43/media-hands green |
| W8 | Media lane seams: the cancel path writes 'cancelled' (race in stopScoped/close handler), a reaper/heartbeat and start-up recovery for jobs left 'running', TimeoutStopSec sized to the longest take, tests bind DXB_MEDIA_WORK_ROOT before import and clean probe frames; the failed row 16277dac relabelled on its evidence | F022 F023 F026 F047 F049 | a real cancelled process ends 'cancelled'; a restart mid-job either waits or recovers; no probe dir lands under ~/tools/h3/jobs/probes on a test run; b43 suite deterministic across three runs | media-lane tests with a real child process; `ls ~/tools/h3/jobs/probes` count unchanged after `vitest run tests/b43` |
| W9 | Dispatch book: the two assigned seats reachable (cross-department seat on a media sheet under the author's project, with media hands granted) or the personas/road check corrected to say they are not road seats; idempotency made transactional (unique (author_task_id, code) or advisory lock) | F033 F085 | a sheet naming design-image-prompt-engineer dispatches; two concurrent dispatches with one (author, code) birth one crew | dispatch-book tests for both; SELECT tasks for the two seats |
| W10 | Brain truth: a migration/seed that reproduces the 2026-09-05 ruling (fable-5.1 ON, fable-5 OFF) on bootstrap; agents.brain / the employees page label for the studio seats made true (or the label reads the routing row); agents.persona_version written by the bind path or the column retired from the CEO pages | F032 F035 F024 | fresh construction bootstrap + seed → routing row as ruled; employees page shows the brain that runs; persona_version equals bound version or is not shown | `pnpm construction:schema && pnpm construction:seed` then SELECT; RULE #0 eye pass on the employees and directors pages |
| W11 | Product register: vitrin cast template tags per person (no FLUX tag on AHMET/JAMES), dead Medya OS pointers removed, AHMET's files re-coded from A-006, LAB-003…006 lines restored or explained, vitrin bound to 127.0.0.1 (or authenticated), the 2K/edge-tts pre-ruling text removed; KATALOG and vitrin brought under a gate (i18n scan, acceptance markers) or moved into the repo/DB | F025 F043 F044 F045 F046 F078 F080 F106 F107 F109 | every cast card true to the record; `grep 'Medya OS' index.html` → 0; `ss -ltnp` shows 127.0.0.1:8899; RULE #0 eye pass on the vitrin | grep counts; ss output; screenshot in evidence |
| W12 | Deleted-film residue: on his word, purge the five media_jobs voice rows and six audit rows naming OE-007/OE-005 through a control_ door (or record why they stay), delete index.html:273's sentence, rewrite the three ledger descriptions to 'silindi — CEO emretti' | F001 | grep/SELECT for the deleted codes and names → 0 outside the one permitted line | SELECT counts; grep counts |
| W13 | Ownership: register the studio's contract where the rule demands — DATA_MODEL (media_jobs, job/scene/shot, the DXB code), EVENT_MODEL (shot events), COST_CONTROL (card time, cost per delivered second), APPROVAL_ENGINE (his accept/reject of a film → decision_log), OBSERVABILITY (the times table), WORKFLOW_ENGINE (the production line), REQUIREMENTS.md rows, 00-INDEX decision, the clock and the QA receipt in AGENT_ORCHESTRATION; the founding directive of 2026-09-03 as a written directive under docs/ceo-directives | F028 F057 F058 F059 F060 F061 F062 F065 | each spec carries the adaptation with its board marker; verify:ledger OK; PLAN.md per approved plan going forward | grep of markers per spec; ledger output |
| W14 | The Ferrari legs he ordered first, written as owned legs with acceptance tests (no build without his word): the two-roads cost table as a CEO-facing artefact; the shot router as data; the RunPod lane; the engine × machine measurement; the visible dial with cost before the decision; the long-form hierarchy (job → scene → shot records); the DxB Agency chain; rights/licensing; master archive + backup; client intake → revision → delivery formats; the elderly-woman presenter born in the engine | F036 F066 F067 F068 F073 F074 F075 F077 | each leg on the board with an owner row, a single proving command and a CEO-facing deliverable named; nothing built until he approves | board diff; verify:ledger |
| W15 | Governance hygiene: LAW C's provenance settled by his word (registered or struck); the 'rules born on this row' either registered on his word or demoted to lessons; handover prompts no longer written in his first person and superseded ones marked; the battery run as the door defines it or the subset registered as an adaptation; persona binds through an fn_ door | F014 F015 F016 F017 F018 F048 F054 F055 F056 | ledger entries or removals; STATE:76 corrected; both -13 prompts marked superseded; verify:ledger OK | grep; ledger output |

Dependency notes: W1–W2 first (records must equal reality before any code moves); W3–W4 before W5 (the seats are written from the doctrine and the spec); W6 after W5 (the check must know the new sentences); W7–W10 independent of each other, each after W2; W11–W12 after his word on the purge; W13 after W3–W4; W14 is planning only; W15 alongside W2.

## 8. Map for the implementation session (paths, commands, facts)

- Board row B43: `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` line 146 (`sed -n '146p' … | fold -s -w 200`; never grep context flags on this file); B08 line 95; B33 is the row with 'NOT ONE LINE OF THIS IS BUILT'.
- Position: `.planning/STATE.md` (live block lines 27–33, Honest position 53–60, working-style 70, handover 76). Archive diary: `.planning/STATE-ARCHIVE.md` from line 2002.
- Ledger: `scripts/governance/ceo-approvals.json` (object keyed by id; 104 entries; 43 dated 2026-09-01→14); gate `scripts/governance/ledger-truth.mjs` (`pnpm verify:ledger`).
- Complaint rows C66–C68: `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` lines 185–187.
- Evidence folder: `.planning/quick/20260903-media-studio-founding/` (EVIDENCE-hands/-position/-dispatch-book/-clock/-continuity-rule/-external-hands/-audit-2026-09-14, COUNSEL-gpt-6-astra, NEXT-SESSION-PROMPT-13/-13b/-14, this file).
- Seats: `personas/media-studio/*.md` (14) + `personas/design/design-image-prompt-engineer.md` + `personas/marketing/marketing-short-video-editing-coach.md`; grammar `HOLDING-OS-MASTER-PLAN/EMPLOYEE_PERSONA_STANDARD.md`; door `.claude/skills/dxb-persona/SKILL.md`; sync `scripts/sync-personas-to-db.sh`.
- Runtime path of a persona: `packages/orchestrator/src/worker-shim.ts` (seatStandingPrompt → composeSeatPrompt), `packages/voice/src/prompt-core.ts`, `packages/voice/src/persona.ts` (loadPersonaBody reads the file per run).
- Hands and book: `packages/dxb-mcp/src/groups/media.ts` (kinds still·shoot·upscale·voice·assemble·probe), `groups/queue.ts` (queue_dispatch :150, queue_sheet_times :343, queue_get :554), `dispatch-book.ts` (sheetDeadlines :180, sheetTimes :320); lanes `packages/outbox-executor/src/media-lane.ts` (cancel path :262/:300/:474–519, edge-tts :307–310), `media-lanes.ts`, `task-lanes.ts`, `scheduler.ts`; profile `packages/gateway/profiles/media-studio.mcp.json`.
- Migrations: `db/migrations/20260903001000_b43_media_studio_department.sql`, `20260903190000_b43_media_hands.sql`, `20260903210000_b43_two_brains.sql` (+ the 2026-09-13 clock/QA migrations — ls | grep 202609). Tests: `tests/b43/` (dispatch-book, media-hands, media-lanes, road-consistency, sdk-schema, task-lanes); construction engine `tests/construction-engine.ts` port 54422.
- Specs carrying studio adaptations: `AGENT_ORCHESTRATION_SPEC.md` A15–A21 (~lines 174–184), `CAPABILITY_ARSENAL_DOCTRINE.md` §9/§11 (~249–284), `MODEL_ROUTING_SPEC.md` line 39 and §4d line 144, `DEPUTY-FAILOVER-MAP.md` line 48.
- Product: `/home/dxb/tools/h3/studio/KATALOG.md`, `/home/dxb/tools/h3/studio/index.html` (cast template :462–476, :273, :284), masters `/home/dxb/tools/h3/lab/out/2026-09-04/` and `/2026-09-05/`, avatars `/home/dxb/tools/h3/avatars/` (gen.log), probes `/home/dxb/tools/h3/jobs/probes/`.
- Company DB (SELECT only): `docker exec -i supabase_db_DxB_Global_OS psql -U postgres -d postgres -At -F ' | ' -c "…"`; columns of agents/personas/routing_rules/media_jobs/tasks/agent_runs as listed in §3 of the run's CONTEXT (agents: persona_id, persona_version, status, employment_status, brain; personas: employee_id, version, author, body_md, quality_gate; media_jobs: task_id, kind, status, cancel_requested, error, wall_seconds; tasks: due_at, depends_on, project_id, status; agent_runs: employee_id, task_id, model_id, status, started_at, ended_at, tokens_in/out, cost_eur).
- Scratch of this audit (a /tmp path, gone at reboot): `/tmp/claude-1000/-home-dxb-DxB-Global-OS/2590e49d-9ca4-4c88-8b2a-baa4689b9d2b/scratchpad/` — `fleet-result.json` (the full run result), `findings-merged.md`, `sound.md`, `coverage.md`, `ledger-sep.md` (the 43 September entries), `sheet-times-readonly.mjs`, `agents/gate-strength/` (the mutated roster + inject.py).
- Machine facts: absolute paths, no `cd` (the prompt gate blocks it); the Bash tool's scope is 16 GiB — GPU work only through the lanes or `systemd-run --user --scope -p MemoryMax=26G`; a `sudo` timestamp does not survive between calls; never write `.{0,N}` windows in a grep (the cost gate blocks it).

## 9. DO NOT ASSUME

- **No finding is refuter-verified.** The 333 adversarial refuters and the completeness critic did not run. The VERIFIED label means the author re-measured the cited evidence once; it does not mean a later ruling was searched for every finding, nor that severity was independently judged. Before acting on any finding, re-open the cited line and re-run the cited command.
- **The 57 AUDITOR CLAIM findings are leads.** Their evidence is the finder's own; several cite counts (e.g. F081 'three identical copies', F080 'LAB-003…006 issued', F083 '31 audit rows', F089 'pasted three times') the author did not reproduce.
- **LAW C's provenance is open (F014).** No user message with 'yasa olsun' for LAW C was found in the transcripts on this machine; transcripts may be compacted. Only the CEO's word settles it.
- **The CEO's 20:0x rule ('acceptance follows the audit's verdict') and his avatar word are NOT registered yet.** The author's yes/no reading (clock YES; corrections ① ② ⑥ YES; ③ ④ ⑤ ⑦ NO; hands/lanes/dispatch book NOT YET) was reported in chat and is not a ledger entry; nothing is accepted until an entry carries his verbatim words. His avatar word was read narrowly (Safiye/Kenan/Deniz stay; the four Flux-drawn presenters stay retired) — he was told this reading and did not yet confirm it.
- **The 100/100 battery is a subset** (tests/b43 r31 b39); the full `pnpm test` has known reds (tests/b36/wall-question, live-drills.host, tests/c42) and was not run; F047 reports the b43 suite went red once under concurrency.
- **Coverage gaps the finders themselves declared** (from their `not_read` lists): none of the nine read all 16 seat files AND the whole code AND the whole vitrin; the specs beyond the four adaptation sites were mostly grepped; STATE-ARCHIVE was not read; B28/B31/B33/B41/B42 were grepped, not read whole. A completeness critic would have listed more.
- **Counts that differ by source and were not reconciled:** 004's road time (30:15 record vs 30:08 tool), the mutation count (8/8 vs 9/9), '122 place phrasings', '44 + 30 sentences'.
- **Nothing here is an approval to build, to make a film, to open an account, or to spend.** Every work item in §7 waits for an understanding report, a plan and the CEO's word.

_Generated 2026-09-14 by Fable 5.1 (session 2590e49d) from the run's own JSON; findings: 111; status counts: VERIFIED 47, PARTIALLY VERIFIED 5, DOWNGRADED 2, AUDITOR CLAIM / NOT REFUTER-VERIFIED 57._
