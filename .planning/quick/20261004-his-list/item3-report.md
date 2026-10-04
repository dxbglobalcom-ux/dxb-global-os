# B51 move 5: re-measurement of the Bucket-3 runtime rows (2026-10-04)

I ran `verify-runtime.py`. It only reads files and greps, so it is safe; today's output matches the 09-24 `.out` file in every template count. Code rows that moved down a few lines (C2-1 now `chat-drain.ts:112`, C2-5 `decompose.ts:164`, C2-10 `classify.ts:132`) are still present. Note one count difference: the script finds 142 files for R1, while STATE says 141. The difference is unresolved.

| Row | 09-24 | Today | What it does to an employee today → what changes if applied | Type |
|---|---|---|---|---|
| R1 "Muhakeme sırası sabittir / Fixed reasoning order" | 142 | **142**/214 | The employee walks the same fixed steps on every job, even trivial ones → it weighs the same questions but only those that fit the job. The 3 keep-list files with real sequences stay as they are. | text |
| R6/R7 Hamza (`agents-orchestrator.md:60,67`) | present | **present** (60 "atlanamaz", 67 "küçük iş istisnası yoktur") | Hamza runs the full 7-step pipeline even for a one-line answer → work is sized to the request. | text |
| R2 "Fable 5 hook" heading | 213 + template | **213** + `template.ts:33` | A dead model name sits in every prompt → neutral wording; the `hook_version` key is kept. | text + code |
| R3 escalation "one sentence" | 212 | **212** | Escalations get squeezed into one sentence and lose the reason → whole sentences, conclusion first. | text |
| R4 "Dil: rapor Türkçe" | 82 | **82** | Conflicts with the task lane's "English artefact" rule → Turkish to the CEO, English in artefacts. | text |
| R5 `notify_broadcast` / WebSearch | 186 / 76 | **186 / 76** | Names tools the seat does not hold (`tools: []`), so the model hunts for them or claims a check it never ran → line removed (strategy and quality seats keep web). | text |
| R12/R15 un-granted surfaces (pg-boss, k6, vault…) | 12 / ~50 | **72** files match the broad grep (a superset, not the same measure) | Same effect as R5 → one "use the tools this session grants" line. | text |
| R13 "On violation / rejected" | 213 | **213** | Grader-style threat wording → states the requirement. | text |
| R14 HTML comments reach the model | 213 | **213**; `persona.ts:50` still sends the whole body | Version comments go into the prompt → one-line strip in code. | code |
| R16 "Declines with a reason:" | 97 | **97**; the replacement wording appears in 0 files | Tells the seat to refuse, against his no-refusal law of 2026-08-20 → "Redirects, naming the reason and the route that works". | text |
| R17 issue quotas | 3 | **3** (`testing-evidence-collector.md:62`, `testing-reality-checker.md:63`, `sales-pipeline-analyst.md:57`) | "3-5 real issues" and "at least one deal" push the model to invent findings → the quota goes, the scrutiny stays. | text |
| R18 budget fields | 1 | **1** (`product-manager.md:68`) | Obeys `max_cost_eur`, a field the seat never receives → line removed. | text |
| R19 stale "until X exists" | several | `enterprise-risk-manager.md:55` still says "ADD gelene kadar"; the exact phrase "until the seats exist" gives 0 hits | Conditions that no longer apply → current rule only. | text |
| C2-1 `settingSources` | 6 sites | **CLOSED**: all 8 `query(` sites spread `companyIsolation()` (`sdk-isolation.ts:157`, runtime isolation 2026-10-03) | — | code |
| C2-2 xhigh→low | open | **open** (`chat-drain.ts:118`, `answer.ts:119`) | A routing row set to xhigh silently runs Hamza's chat and voice at `low` → passes xhigh through. | code |
| C2-3 executor effort | open | **open**: no `effort` in `executor.ts` | Workflow steps run at the SDK default → effort comes from the routing row. | code |
| C2-4 executor identity | open | **open** (`executor.ts:75`) | Workflow steps get a one-line identity with no persona and no laws → the real persona is loaded. | code |
| C2-5 chain ≤3 vs MAX_HOP_DEPTH 5 | open | **open** (`decompose.ts:164` vs `:40`) | The planner caps chains at 3, against his order of 2026-08-27 → cap becomes 5. | code (prompt string) |
| C2-6/7/8 | open | **open** (`chat-drain.ts:105,102`, `answer.ts:99`) | Fixed sentence quotas and PLAN MODE capitals → audience framing. | code (prompt string) |
| C2-9 | open | **open** (`chat-drain.ts:113`) | The standing prompt rides in the user turn, uncached → moved to the system prompt. | code |
| C2-10 | open | **open** (`classify.ts:132`) | Redundant "JSON ONLY" text next to the json_schema → removed. | code |
| C2-11 | open | **open** (`worker-shim.ts:268`) | Tells tool-less seats to "verify with a real tool call" → removed. | code |
| C2-12 | open | no `fallbackModel` in any `query()` options | Only matters if the runtime moves to 5.5. | code |
| C2-13 council | open | `council` still exported (`orchestrator/src/index.ts:64`) | Dead code. This is B51 move 6. | code |

## How persona text reaches the live employee

- `chat-drain.ts:211` and `worker-shim.ts` call `loadPersonaBody(repoRoot, persona_path)`, which reads the **file** on every call (`persona.ts:44-50`). The scheduler runs from the repository folder (`dxb-scheduler.service: WorkingDirectory=%h/DxB Global OS`).
- So an edited persona file reaches the live employee on its next call, with no restart. Running `scripts/sync-personas-to-db.sh` with `DXB_PERSONA_AUTHOR` set only updates the database copy, the gate and the version.
- Code rows need a build and a `dxb-scheduler` restart.
- Proof: the persona gate (`packages/hr/src/gate.ts`), `tests/r31/persona-delivery.test.ts`, the full battery, and a grep re-count by `verify-runtime.py` that must reach 0 except for keep-list files.

## Bundles

**1 — Persona text (R1, R6/R7, R3, R4, R5, R12/R15, R16, R17, R18, R19, R13, R2).**
- **Size:** 213 files to edit. Most of it is mechanical, but by the authorship law the session must write it, not a script or subagent. R5, R15 and R16 need judgment per file. Estimate: one long session.
- **Recommendation: YES.** Do R16, R17 and R6/R7 first.
- **Risk if left:** seats keep refusing against his law, inventing findings to fill a quota, and claiming checks with tools they do not have.

**2 — Small code fixes (C2-2, C2-5, C2-6/7/8, C2-10, C2-11, R14 strip, R2 in `template.ts`).**
- **Size:** about 8 short edits in 6 files, plus the tests that pin these strings (`slices/c-personas-108-213-code.md` § Coverage).
- **Recommendation: YES.** C2-2 is a live defect today.
- **Risk if left:** an xhigh row runs at low, and the planner overrides his hop order.

**3 — Structural code (C2-3, C2-4, C2-9, C2-12, C2-13).**
- **Size:** larger; it changes cache cost and how workflow steps behave. It is tied to B51's other moves (effort discipline, the checking seat, deleting the council).
- **Recommendation: decide together with B51 moves 3 and 6**, not on its own.
- **Risk if left:** workflow steps keep running without persona or effort; the chat prompt stays uncached.

## UNVERIFIED

- Why R1 counts 141 in STATE and 142 in the script.
- Whether `tests/phase6/poisoning.test.ts` or other tests pin the R-row strings (not grepped beyond `template.ts`).
- Whether C2-12's "empty result stored as reply" is still true.
- That every live task path loads persona files by `persona_path` from this checkout; only chat and the worker were traced.
- No model call was made, so the behaviour effects above come from the audit, not from a measurement.