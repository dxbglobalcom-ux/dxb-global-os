# EVIDENCE — plan ②, the dispatch book (B43), 2026-09-05 night session

**For the independent auditor the CEO named.** Every claim below names the command and its decisive output. The CEO slept through this session on his own word (*"sen yatıcam herşey sende 3 saat uyuycam"*, 01:4x); nothing here is ACCEPTED — the code, the records and the film wait for his eye (LAW B). The delegation is registered: `scripts/governance/ceo-approvals.json` → `plan-2-dispatch-book-delegated-2026-09-05`.

## 1. What was measured before a line was written

| Claim | Command | Decisive output |
|---|---|---|
| The dependency machinery already existed | `psql … "select pg_get_functiondef('claim_next_task'::regproc)"` | `AND NOT EXISTS (SELECT 1 FROM tasks d WHERE d.id = ANY(t.depends_on) AND d.status <> 'done')` |
| No door turned a plan into staffed, dependent tasks | `grep -n depends_on packages/outbox-executor/src/scheduler.ts packages/dxb-mcp/src/groups/queue.ts packages/orchestrator/src/worker-shim.ts` | (no output) — only `orchestrator/src/dispatch.ts` (the intent road) wrote `depends_on`; `queue_create_task` inserted without `agent_id` or `project_id` |
| A staffed run carried no persona | `grep -n -i 'persona\|systemPrompt' packages/orchestrator/src/worker-shim.ts packages/orchestrator/src/hook-binding.ts` | (no output); the prompt began `"You are a DXB Global OS worker agent…"` |
| The SDK loaded the construction settings into a seat's run | `sdk.d.ts` (0.3.259) line 2066 | *"When omitted, all sources are loaded (matches CLI defaults)."* — `settingSources` was omitted, `cwd` = the repository (scheduler `WorkingDirectory=%h/DxB Global OS`) |
| The studio's tool surface before | `packages/gateway/profiles/media-studio.mcp.json` `_generated_at 2026-09-03T17:26` | `queue_create_task` present, no dispatch door |

## 2. What was built (commit `2029cc63`)

| Piece | File | Proof |
|---|---|---|
| The dispatch book's contract and graph checks | `packages/dxb-mcp/src/dispatch-book.ts` | `tests/b43/dispatch-book.test.ts` §1–3 |
| `queue_dispatch` — one transaction, staffed, under the project, idempotent per (author, code), dependants told what to read, audit + decision rows | `packages/dxb-mcp/src/groups/queue.ts` | §4–6 on the construction engine |
| `queue_create_task` + `agent_slug` / `project_id` / `label` / `label_tr` — the brief door | same file; `scripts/b43/dispatch-brief.mjs` by hand | §7 |
| A seat runs AS the seat — `composeSeatPrompt`, `seatStandingPrompt` (prompt-core task lane) | `packages/orchestrator/src/worker-shim.ts`, `packages/voice/src/prompt-core.ts` | §3; `tests/b21` 11/11 and `tests/r31` 4/4 unchanged |
| SDK isolation for the seat's run and the QA gate; `DXB_WORKER_ISOLATION=0` rollback | `packages/orchestrator/src/sdk-isolation.ts`, `qa.ts` | §3 |
| The hands' parameter contract in `media_submit`'s description | `packages/dxb-mcp/src/groups/media.ts` | read by every seat that holds the hands |
| `TasksTable` gains `project_id`, `milestone_id`, `label`, `label_tr` (Generated) | `packages/shared/src/db-types.ts` | `tsc --build` clean |

## 3. The battery

```
pnpm typecheck                                        → $ tsc --build   (clean, no output)
pnpm exec vitest run tests/b43 tests/b21/agent-context.test.ts tests/r31/persona-delivery.test.ts
   tests/phase3 tests/phase4 tests/c9/brain-floor.test.ts tests/r21 tests/r22 tests/e8
                                                      → Test Files 26 passed (26) · Tests 158 passed | 3 skipped
   tests/b43/dispatch-book.test.ts                    → 11 passed
bash scripts/i18n-purity-check.sh                     → I18N PURITY: PASS
pnpm verify:ledger                                    → ledger truth OK: 11 state claims … 113 CEO approval claims each backed by a registered approval
node scripts/gateway/pin-arsenal.mjs (company)        → pinned 1 new: dxb-mcp.queue_dispatch (74 already pinned)
systemctl --user restart dxb-scheduler.service        → 02:03:21, in flight 0 tasks · 0 running jobs; log: "the studio's hands: 4 lanes running" · "the company is working with 1 hand"
profiles after the 30 s recompile chain               → queue_dispatch in 22 of 22 profiles, `_generated_at 2026-09-05T00:03:41.882Z`
```

## 4. Live proof of the seat identity (company DB, task `0e5f1817`)

The QC seat was handed a two-part probe through the brief door (`dispatch-brief.mjs --seat media-delivery-qc`, 02:04:07). Claimed at 02:04:07, run `succeeded` 02:04:36 (29 s, `fable-5.1`, 58 in / 2,068 out), QA `done` 02:04:58 — **birth → done 51 s**. Its answer, unprompted by the task text: *"I am the Final Delivery / QC Specialist of the media-studio department at DXB Global … judged by the §6 standard … The one law about upscaling … is LAW D (CEO 2026-09-03)."* Tool calls: `media_probe`, `queue_get`, `StructuredOutput`. That sentence exists only in the persona file — the persona reached the run.

## 5. The film through the road — DXB-V-EYW-004

(appended below when the road finishes; the monitor's event stream is the timeline)

### 5.1 The first pass — DXB-V-EYW-004 (02:06:18 → 02:36:33, 30 min 15 s; STUDIO VERDICT PASS 5/5; the CEO's eye pending)

The brief: the CEO's immutable exam prompt of 2026-09-04 with his own four-line ACTION block (his 20:21 message, recovered from the previous session's transcript; prefix and suffix byte-identical to the BRIEF.md text, the block replaced whole), handed to `media-creative-director` through the brief door under project `ea30097d` (opened through `control_project_action` with the CEO claim on his delegation; `name_tr`/`purpose_tr` set by hand — the door still lacks them).

| Step | Measured (company DB, `task_events` / `agent_runs` / `media_jobs`) |
|---|---|
| Director claimed | 02:06:26 (8 s after birth); planning run 6 min 8 s, 29,424 tokens out; `queue_dispatch` at 02:10:47 → **7 seats in 3 levels**: L0 engineer → L1 delivery-qc · identity · product · continuity · sound → L2 the director's verdict (`decision_log` `call_sheet`) |
| Prompt fidelity | the engineer's task text carries the v2 prompt **verbatim** (python `v2 in objective` → True); the shoot job's params: 640×1152 · 15.08 s · 4 steps · seed 20260905 · prefix eyw004 |
| Engineer claimed | 02:10:46 — **1.2 s after the sheet was born**, by a second lane (`resident-worker-2`) |
| The take on the card | job `6b28a204`: 02:11:14 → 02:21:39, **wall 625.3 s (10 min 25 s)**, peak VRAM 13,671 MiB, 640×1152 · 362 frames · 15.083 s · h264 + aac |
| Five reviewers claimed | 02:23:24–02:23:28 — **all five within 4 s of the engineer's `done`**, five separate lanes (`resident-worker`, `-2`, `-5`, `-6`, sound waited for a lane — see defect 3) |
| Verdict claimed | 02:33:02, 2 s after the fifth review's `done`; verdict run 2 min 52 s; QA `done` 02:36:26 |
| The book | 8 tasks · 17 runs · 2 media jobs · 14 cost rows / 175,754 tokens · 31 audit rows · 109 tool calls — all under one project, all by the seats' own keys, brain `fable-5.1` |

**Three defects of the road itself, surfaced by this pass and fixed at the source the same hour (commit `a3d35775`, scheduler restarted 02:29:34 with no productive run in flight):**

1. **A seat could move its own task** (`task_events` 02:22:15: `queue.transition` running→review by actor `media-ai-video-engineer`; then QA at 02:22:22: *"Worker result is null"* → failed → ladder `retry-same-tier` → re-claimed by lane 3 → a **second shoot** `16277dac` started at 02:22:39). The first run's own transition landed at 02:23:04 with the real result and QA passed it; the duplicate take was cancelled through `media_cancel` at 02:24:44 to free the card. All five reviewers did the same at 02:25–02:28 (their runs closed with `worker-shim: transition running→failed lost a race`, the rows sat in `review` with no result, QA failed them, the ladder requeued them, and they ran again on the fixed code at 02:29:37 → all five `done` 02:31:06–02:33:02). Fix: `queue_transition` refuses to move a task out of claimed/running for any actor but the hand that holds it; `queue_claim` refuses an employee slug; the seat's standing prompt says its answer IS its delivery. Since the restart: `tool_calls` with `queue_transition` = **0**.
2. **Seven lanes judged the same review** (`scheduler.log`: 33 × `lost a race` on `dd76b31e` alone — six QA model calls paid for one verdict). Fix: one judge per task per process (`judging` / `laddering` sets in `worker-loop.ts`).
3. **The lane count stood down while work was in flight** (`scheduler.log` 02:24: *"the company is working with 2 hands (was 6)"* with five reviewers running — the count was of `queued` rows only; the sound reviewer waited for a busy lane, and four finished reviews then queued behind one lane's QA leg). Fix: the count is every piece of work that still needs a hand — queued, held by a resident lane, at the gate, on the ladder (`dispatchLanes`, `scheduler.ts`); after the restart the log reads *"7 hands (first tick)"* for the 7-task sheet.

**The studio's verdict on the take (task `d03b8d71`, `media-creative-director`):** *"STUDIO VERDICT: PASS — deciding frames 1.5, 5.5, 6.9, 8, 12, 14.9 s … it reads as FILMED … At 1.5 s the white box is open in his hands with the black pair lying in the tray — yesterday's shut box is gone … at 6.9 s the glasses go onto his nose with both hands at the temples … Nothing floats, nothing morphs, no lettering, no second pair, no second face."* Reviewers: delivery-qc PASS (G1–G7; the four lines PASS-BY-SIGHT — *"no transcription hand on this road"*), identity PASS (I1–I7), product PASS (*"2026-09-04 DEFECT WINDOW (4.4–6.9 s): HELD"*), continuity PASS (beats at 1.5 / 3.0 / 7.5 / 10.0 s), sound PASS (stream, length, one voice by construction; *"the words, the room sounds and the loudness remain unmeasured"*). Three observations handed to the CEO's eye, not as defects: the rim reads warmer at 12–14.9 s (window light on gloss black, the product seat's ruling), the smile at 12–14.9 s is broader than the prompt's "no exaggerated smile", and the softest gate is skin (I5).

**Against the acceptance test:** engine 10 min 25 s + 12 min = **22 min 25 s target; measured 30 min 15 s — missed by 7 min 50 s**, the whole gap inside the three defects (the reviewers' second round alone 02:25:47 → 02:33:02). By the CEO's rule the design was wrong and was fixed before anything else; the clean measurement is the second pass below.

The master: `~/tools/h3/lab/out/2026-09-05/DXB-V-EYW-004-master-640x1152.mp4` (4,080,832 bytes); showcase links `media/dxb-v-eyw-004-master.mp4` and `media/eyw-004-sheet.jpg` (24 frames, 0.63 s apart) — both HTTP 200 on :8899.

### 5.2 The second pass — DXB-V-EYW-005 on the fixed road (02:36:54.7 → 02:59:40.1, **22 min 45.4 s**; the acceptance line 22 min 25.3 s — **20.1 s over**)

The same brief (the "second pass" paragraph added, the code changed to EYW-005), handed through the same door at 02:36:54.692 with no other work in the queue (in flight 0, card 763 MiB). The scheduler on commit `a3d35775` since 02:29:34.

| Step | `task_events` / `media_jobs` | Δ on the critical path |
|---|---|---|
| Director claimed | 02:36:54 (0 s) — sheet written 02:40:25 (`decision_log`: 7 seats in 3 levels, the same graph) | planning **3 min 31 s** |
| Engineer claimed | 02:40:25 — **0 s after the sheet was born** (`resident-worker-2`) | — |
| The take | job `f9d4e8c7` queued 02:40:43, on the card 02:40:49 → 02:51:14, **wall 625.3 s** (seed 20260905, 4 steps, 640×1152 — the same recipe, the same picture: the 0.6 s lid crop of both takes is pixel-identical, PIL difference bbox None) | lane pick-up 24 s · engine **10 min 25 s** |
| Engineer's answer + gate | review 02:52:18, done 02:52:48.064 | **94 s** |
| Five reviewers | claimed 02:52:48–02:52:56 (**all five within 8 s**, lanes `resident-worker`, `-2`, `-5`, `-6`, `-7`; log *"the company is working with 8 hands"*) → done 02:54:52 · 02:54:54 · 02:55:05 · 02:55:47 · 02:55:47 | slowest review + gate **2 min 59 s** |
| Verdict | claimed 02:55:47 (0 s after the fifth `done`), review 02:59:10, done **02:59:40.067** | run 3 min 23 s + gate 30 s = **3 min 53 s** |
| The book | 8 tasks · **8 runs, 8 succeeded** · 1 job · 95,019 tokens · **0 `queue_transition` calls by seats · 0 failed events · 0 races** in the scheduler log since the restart |

**Arithmetic:** 1365.4 s measured − 625.3 s engine = **740.1 s of road overhead (12 min 20 s) against his 12 minutes** — 20.1 s over the line. Where the twelve minutes go, largest first: the verdict 3 min 53 s, the director's planning 3 min 31 s, the reviewers 2 min 59 s, the engineer's answer + gate 1 min 34 s, lane and gate latencies ≈ 25 s. The first pass on the same road, before the fixes, took 30 min 15 s; the subagent road of 2026-09-04 took 37 min 53 s.

**The studio's verdict on the second take (task `EYW-005 · the studio's verdict`, `media-creative-director`):** *"FAIL — on one defect only: the engine drew a black signature-like scrawl on the white box lid in the first second of the take (0.5 s and 1.0 s). Everything the CEO's four defects of 2026-09-04 lived in holds this time … Like a finished suit with one ink mark on the lapel."* Reviewers: delivery-qc **FAIL on G6 (no lettering)**, identity PASS, product PASS (*"the 4.4–6.9 s window that broke on 2026-09-04 held"*), continuity PASS, sound PASS with S3 *"unverified (no listening hand on the road)"* and S4 *"the road needs a local speech-to-text hand and a loudness/waveform hand"*.

**A finding for leg (4), the QC checklist — measured, not argued:** the first pass PASSED and the second FAILED a lid frame that is pixel-identical; the first pass's product seat had seen the same *"cursive scrawl on the lid"* and let it stand under the 2026-09-03 no-brand-restriction ruling, the second pass's delivery seat read it under the same ruling's other half (*"the engine still never draws lettering"*). The checklist must say which it is for an engine-drawn mark on a prop, and the road needs the listening hand three seats asked for. Both takes wait for the CEO's eye (LAW B).

The master: `~/tools/h3/lab/out/2026-09-05/DXB-V-EYW-005-master-640x1152.mp4`; showcase link `media/dxb-v-eyw-005-master.mp4` HTTP 200.
