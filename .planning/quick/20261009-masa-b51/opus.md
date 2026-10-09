# Opus half — (2) the council and the gate · (3) records that stay current · plan → dxb-team2

Author: dxb-global-os-c3 (Opus 5.5). Measured 2026-10-09 against the repository and the company
engine (54322, SELECT only). Cross-read by Fable in `itiraz-fable.md`.

## His words for this half (verbatim, 2026-10-09)

- *"Birinci husus, evet önerini yap. Çünkü plan konuşacağız dediğimde direkt DXP Team 2 açılmalı."*
- *"Güncellenmeler yerinde ve düzgün yapılmıyor. Hep bir kopukluk oluyor. Önce bu kesinlikle
  düzeltilmeli ya. Bana eski şeyleri getirip önüme koymayın artık."*
- *"Bitmiş gitmiş işleri yani, böyle oraya sadece bir nokta iz koyun."*
- 20:46 — *"2-konseyle iligli gerekenleri yap 3-güncellemeyle iligli de gerekenleri yapın."* ·
  *"eski konseyide tamamen silebilirsiniz."* · *"bir satırda bazen işin sadece bir kısmı bitmiştir.
  dikkat edin sakın kapatmayın herşey tamamen bitince satır kapanır. bir kısmı değil. oraya sadece ne
  bittiği ile ilgili not düşülür hikaye değil. arşive taşınmaması daha iyi ise kalsınlar sorun yok.
  benim sorunum. her zaman güncellenmesi herşeyin otomatik olarak."*

## (2) The council

**Dead — CNCL-01** (three cheap producers + a judge that only compares):
- `packages/orchestrator/src/council.ts`; exported at `packages/orchestrator/src/index.ts:64-65`;
  no importer anywhere in `packages/` or `apps/` source.
- Its producers `glm-5.2`, `kimi-2.7-code`, `qwen3.6-flash` are `retired` + `banned` in `model_catalog`.
- Its own test: `tests/phase5/council-judge.test.ts`.
- Stale mentions that would mislead a reader: `qa.ts:2-3` (says the council fires at critical gates,
  pointing at council.ts), `subscription-cap.ts:38`, `packages/shared/src/sdk-schema.ts:8` (lane list),
  `tests/phase5/slice-10of10.sh:258-266` (a council-silent check on `cost_ledger.meta.council`),
  `tests/governance/company-isolation.test.ts:927` (LANES lists "council"; council.ts:102 is its only user).
- `MODEL_ROUTING_SPEC.md:189` already records CNCL-01 as dead — that line is the trace and stays.

**Live — the critical gate (§4e)**, `critical-gate.ts`: Opus 5 writes, Solo 5.6 (`gpt-5.6-sol`) and
GPT 5.5 try to refute through the Codex CLI on the subscription lane, Opus revises and signs; one
`decision_log` row with `decision='critical_gate'`. Switch: `routing_rules.needs_council`, kept under
that name on purpose ("so the gate is CEO-configurable as data", `worker-shim.ts:796-801`) — true for
`architecture`, `content.outbound`, `final-approval`, `strategy`; all four have `match = {}`, so the class
comes from classification at run time.

**Why it has never run** — `decision_log` rows with `decision='critical_gate'`: **0**, ever.
- It runs only when all of these hold (`worker-shim.ts:880-925`): the hook is on (`hook.enabled` = true)
  AND the QA post-check passed AND the task's class is one of the four AND no gate round yet.
- The company's work line has been still since early September: `tasks` — done 247 (last created
  2026-09-05), inbox 14 (all HR persona-authoring tasks of 2026-09-03, parked under the authorship law),
  failed 2, returned 3. `decision_log`'s newest row is 2026-09-05.
- The classified class is not stored per task (`task_class` exists only in `routing_rules`), so whether
  any of the 247 ever classified into the four cannot be read back. ⚠ UNVERIFIED.
- Doorways that create work: `intent-intake.ts` → `dispatch.ts` (fed by the voice drain, the morning
  briefing, the worker loop, the outbox scheduler, the workflow runner, the dashboard's automations page),
  revenue discovery, the `dxb-mcp` queue, the gateway pin check. Switches today:
  `orchestration.autogen.enabled` = true, `revenue.discovery.enabled` = true, `orchestration.dispatch_lanes`
  = 0 (= the company decides). B39 (2026-08-25) carries his frame: *"ŞİRKET HENÜZ KURULMADI"*.
- The gate module has its own test: `tests/c9/critical-gate.test.ts`.

**Proposal**
1. Delete CNCL-01 whole: council.ts, its two export lines, its test, and the five stale mentions (LAW A —
   his word *"eski konseyide tamamen silebilirsiniz"*). Keep `needs_council` as the name — renaming means
   a migration and a type change for no gain to him.
2. Prove the gate once on the construction engine along the real path (a `strategy` task through
   `worker-shim` → exactly one `critical_gate` row), so "the gate works" stops being a claim.
3. Recommendation for him, not built in this job: store the classified class on each task, so "why did
   the gate not run" is answerable next time.

## (3) Records that stay current — automatically

**The defect he caught, measured.** The B51 row's line was last changed 2026-09-28. Work on B51 committed
after it: `d364e81a`, `71811fb0`, `fbd51308` (2026-10-04, bundle 2) and `09465972` (2026-10-08, bundle 3 put
off). The row still lists the xhigh → low defect as open and says the six moves all wait on his verdict.

**The detector, calibrated.** A commit names a row when the id sits in its subject's scope —
`runtime(B51 move 5, bundle 2): …` — the house convention. Matching the id anywhere in the message gave 9
"stale" rows, 8 of them false (Sol/Fable finding labels such as B10 and B12, passing mentions). With the
scope rule: **1 stale row — B51**. Script: the session scratchpad's `stale-scope.sh`.

**What makes the drift today**
- `dxb-close-row` SKILL.md:44 — *"A statement about what happened once carries its date and `<!-- HISTORY -->`"*.
- Board law 8 — phases (done / accepted / left) go word for word into `.planning/board-rows/<ID>.md`;
  those files say *"Nothing below was edited"*.
- `dxb-team2` §6 writes STATE at a job's end and says nothing about the row the job advanced.
- No ruler compares a row with the work done on it: `tests/b43/records-truth.ts` R1-R5 check acceptance
  wording and row size; they run before a commit only when STATE, the board or the ledger is staged
  (`scripts/hooks/pre-commit:63-79`).
- The board page needs nothing: `dxb-board.service` rewrites `var/board/tahta.html` within a second of any
  change to the board file.

**Proposal** (his 20:46 frame: a partly finished row is NOT closed; it gets a note of what finished, not a
story; the archive is optional; the point is always current, automatically)
1. **The rule** — `dxb-team2` §6 and `dxb-close-row`: a job that advances a row rewrites that row in the
   same commit. The row gains one note line `✓ <date> — <what finished>` and its "what is open" says only
   what remains. A row closes only when all of it is finished. `dxb-close-row`:44 and law 8's "word for
   word" sentence are replaced by this (LAW A). Nothing is moved to an archive.
2. **The guard — R6** in `tests/b43/records-truth.ts`: for each row in an open section, the newest commit
   whose subject scope names the id is compared with the row line's last change (`git blame` on the
   working tree, so an edit staged in the same commit counts). Newer work → red. It runs where R1-R5 run,
   i.e. on every commit that touches STATE, the board or the ledger — every job's end under dxb-team2 §6 —
   so a job cannot end with its row behind. Test first: a fixture that reproduces B51 (red), then the row
   touched (green).
3. **The opening** — `spec-bootstrap.sh` names stale rows, and only when there are any: a session is told
   before it can repeat one.
4. **The note command** (makes "a note, not a story" mechanical) — `scripts/board/note-done.mjs <ID> "<note>"`
   writes the dated one-liner into the row and refuses a note longer than one short line.
5. **Once** — B51's row rewritten to today's measured truth, with notes for bundles 1-2 and the xhigh fix.

## Plan → dxb-team2 (his "evet önerini yap")

- `.claude/hooks/dxb-effort-warn.py`: `plan_reminder()` (l.93) and the `permission_mode == "plan"` branch
  (l.265) tell the lead to open `Skill("dxb-team2")` at once when it is not open in this session, and to ask
  the job inside it — today they only remind about effort.
- `dxb-team2` SKILL.md description gains the trigger (his words "plan konuşacağız", "plan moduna geçelim").
- Test first in `tests/hooks/effort-warn.test.ts`; his words registered in `scripts/governance/ceo-approvals.json`.
- Mirror: `.agents/skills/` regenerated; the opening ruler runs on the commit.

## Questions for the cross-read

1. R6 at the commit only (bites at a job's end), or also in the battery?
2. Should R6 also guard the `board-rows/<ID>.md` files, or should those files open with one line saying
   they are history and the row is the truth?
3. Is the gate proof (council item 2) worth its run inside this job, or does it belong with your Hamza /
   work-line finding (nothing created since 2026-09-05)?
