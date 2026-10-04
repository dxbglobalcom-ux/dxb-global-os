---
name: dxb-team2
description: Use when the CEO hands the construction a job — the default construction door. One lead (the session) scores the job, writes the done-list, chooses who writes (itself, a fork or medium helpers) and verifies every piece; a fresh, blind, read-only GPT-6.1 Sol auditor checks every job once, at a depth set by its score; Fable 5.1 is consulted only where the score card's `fable:` line says — at the start and the end of a normal or critical job, never on a light one. Trigger `/dxb-team2 <the job in one sentence>`.
---

# The team — one lead, the hands it chooses, one blind auditor, Fable where the card says

The construction's default door since 2026-09-28 <!-- CEO-OK: dxb-team2-default-door-2026-09-28 -->, built against waste, not against checking. The laws it obeys are in `.claude/CLAUDE.md`;
it opens `dxb-verify` and `dxb-close-row`.

## 1. The shape

```
            THE CEO'S SENTENCE — the approach talked through with him
                    │
            SCORE CARD (4 axes, 0-8) + `fable:` line + DONE-LIST + budget
                    │
     ┌──────────────┼──────────────┐
  LIGHT (0-2)   NORMAL (3-5)   CRITICAL (6-8)
     └──────────────┼──────────────┘
                    ▼
     FABLE at the start, where `fable:` says (normal · critical) → the lead closes its gaps
                    │
     THE PLAN, in his language → the CEO looks at it once → his yes
                    │
     ARRANGEMENT (§3) — the lead, a fork, or medium helpers write; the lead verifies
                    │
     SOL AUDITOR — blind, read-only, ONE pass:  medium │ high │ xhigh
                    │
     finding → a fork or a helper fixes → the lead verifies; no second Sol round
     disagreement → a test decides → else the lead (normal · critical: Fable, in its end call)
                    │
     BATTERY once · dependants re-measured · FABLE at the end, normal · critical · commit · report
```

## 2. Seats

| Seat | Who | Does | Never |
|---|---|---|---|
| **Lead** | the session — model and effort are the CEO's choice (`high` is the measured sweet spot); design, plan and architecture turns at `max` through `dxb-design-max` (§4 PLAN) | scores the job, writes the done-list, chooses the arrangement (§3), writes code itself or through the hands it chose, verifies every piece and every fix, runs the battery, commits, reports | approves its own work; commits a piece it has not verified; writes code at Opus `xhigh` (FrontierCode: 51.4 %, the bottom of the curve); asks the CEO a technical question |
| **Auditor** | GPT-6.1 Sol <!-- CEO-OK: auditor-sol-6-1-2026-10-01 --> through `scripts/governance/refuter.sh --card <file>` — read-only by tool | one blind pass per job (§5) — there is no second round <!-- CEO-OK: sol-single-pass-fixes-by-helper-2026-10-03 --> | writes; audits the same job twice; sees a verdict or the lead's reasoning; is called as bare `codex` (the base config writes everywhere) |
| **Advisor** | Fable 5.1 | only where the card's `fable:` line says (§3), measured before it is consulted: on a normal or critical job, twice: the **start** call, before the plan goes to the CEO, reads the approach, the plan and the design, and the lead closes its gaps; the **end** call, before "done", reads the finished work with Sol's findings and in the same call rules on a disagreement no test settled <!-- CEO-OK: fable-start-and-end-normal-and-important-2026-10-04 --> | writes code; is consulted anywhere else — on a repeated error, "whenever the lead needs it", on a light job; the advisor tool's own advice to call it before substantive work or when done applies only where the card's `fable:` line allows it |
| **Fork** | the lead's own copy (`subagent_type: "fork"`), on the lead's model | writes the job, or a part of it, with the lead's whole context (§3) | commits |
| **Helper** | `helper` (Opus 5.5 · `medium`, read-only) | reads code, documents or the outside world for the lead, beside the others | writes |
| **Writing helper** | `helper-writer` (Opus 5.5 · `medium`) | edits and tests a piece the lead specified; fixes Sol's findings | commits; widens the piece — the lead commits only what it verified <!-- CEO-OK: helpers-write-code-under-lead-verification-2026-10-03 --> |
| **Reader** | a one-shot subagent (`scout`, or `Explore`) | a wide search or read whose text would swell the lead's context | writes; is resumed (its cache dies at 5 min) |
| **Escalation writer** | `builder` (Opus 5.5 · `max`), one-shot, description `guarded:` when the path is guarded | only after the same piece failed twice at the lead's level | is opened for a routine fix |
| **Design eye** | `design-eye` (Fable 5.1) | reads a finished surface the CEO will see, after it changed, against the design system and his design rulings | writes; advises the lead on the work, reads a plan, or rules on a dispute — it is a reader of a finished surface, not an advisor: Fable as an advisor is the Advisor row's alone, where the card's `fable:` line says (§3) |

**Fallback auditor.** Sol unavailable (quota, error, timeout): on a light or normal job a fresh
one-shot Opus 5.5 `high` subagent audits and the record says *"audited by Opus instead of Sol, because
…"*; on a critical job the lead waits for Sol's 5-hour window and works on something else. No job
closes unaudited; the auditor is never swapped silently.

## 3. The score card — written before a line of code

Four axes, 0-2 each (the depth rule from the outside review of 2026-09-28, weighed and kept):

| Axis | 0 | 1 | 2 |
|---|---|---|---|
| Blast radius | one function | one subsystem | several subsystems |
| Risk | copy, layout | business logic | money · database · security · approval · governance · agents |
| Reasoning | deterministic | a few edge cases | stateful, concurrent, agentic, emergent |
| Ambiguity | exact | some reading | unclear or conflicting |

**0-2 light · 3-5 normal · 6-8 critical.** The card (axes, total, class, auditor effort and why) goes
into the commit body.

**A machine holds the card** (*"tmm makineyi de kur"* <!-- CEO-OK: score-card-gate-2026-10-01 -->).
The card is a file (`job:` · `range:` · `blast:` · `risk:` · `reasoning:` · `ambiguity:`) handed to
`refuter.sh --card <file>`; `scripts/governance/audit-card.mjs` refuses an audit without one, checks
that the card's range is real and changes something, refuses any forwarded option that could
override the effort, model, sandbox or servers,
sets the auditor's effort, refuses an `--effort` beneath it, shows Sol the card for information (§6), and logs
every launch to `~/.local/state/dxb/audit-cards.log` — the class budgets of §7 are summed from it.

**Fable — measured before it is consulted** (*"Fable için de başta ve sonda sorulsun. Advice yapılsın o
kadar. Normal işlerde olabilir bir de önemli işlerde. Basit işlerde gerek yok."* <!-- CEO-OK: fable-start-and-end-normal-and-important-2026-10-04 -->).
At SCORE the lead writes on the card a `fable:` line with its why, and Fable is consulted only where that
line says (§2): a light job (0-2) `none`; a normal (3-5) or critical (6-8) job `start+end` — once before
the plan goes to the CEO, once before "done". Fable advises; it never writes. The machine reads only `job:` · `range:` · `blast:` · `risk:` · `reasoning:` ·
`ambiguity:`; `fable:` and `arrangement:` are the lead's lines beside them.

**The arrangement — who writes** (*"bu yazdığın plan oklenebilir. ve 1-2 işten sonra ölçümde
yapılabilir."* <!-- CEO-OK: orchestration-three-arrangements-lead-chooses-2026-10-03 -->). Before BUILD
the lead chooses one per job and writes it on the card as `arrangement:`, with its why:

| Arrangement | Who writes | Beside it |
|---|---|---|
| **Fork** | the fork — the lead's own copy, with its whole context | — |
| **Team** | `helper-writer` edits and runs the tests | a `helper` reads the code, a `helper` reads documents or researches; the lead gathers their results and decides |
| **Hybrid** | the fork | `helper`s read and research |

The core's *"the session writes it"* stands beside them: a piece the lead writes itself is written
`arrangement: lead`, with its why. At the job's end the card carries, under `## Measured`, the minutes of
each phase, the new tokens and their list-price cost, and Sol's findings.
`node .planning/quick/20261003-runtime-isolation/usage.mjs <transcript> --from <ISO>` gives the tokens
and their list-price cost for the lead's transcript and for each subagent's (`<session>/subagents/`):
the executor's tokens by class, Fable's advisor calls apart (`advisor`), and `usd`, priced from the
script's own table of the claude-api skill's list prices — a model it has no price for is listed under
`unpriced`, never guessed. The card's cost is the sum of their `usd`. After one or two real jobs these
records show which arrangement suits which job; there is no separate A/B test. The 50 % handover gate
(§8) holds in every arrangement.

## 4. The loop

```
INTAKE    → the job in ONE sentence, provable by measurement; the CEO's words verbatim; what is his;
            what it excludes, what it touches, what contradicts what across documents and code,
            the real unknowns that could change the plan — reported to him in his language
            before any proposal; no generic software advice, no documents restated.
SCORE     → the card (§3) with its `fable:` line — measured before Fable is consulted;
            `dxb-quota` read once — the week's headroom and pace.
PLAN      → the approach is talked through with the CEO first; the lead then writes the plan.
            Where the card's `fable:` line says `start+end`, Fable's start call reads
            the approach, the plan and the design, and the lead closes its gaps — before the plan
            goes to him. The plan goes to the CEO once, in his language, and no file changes before
            his yes.
            The plan names the scope, the surfaces and files it touches, the ordered steps, the
            data and interface effects, migration and rollback where relevant, how it is verified,
            and the risks.
            Every turn of this talk and of the plan — design, plan, architecture — runs at `max`:
            the lead invokes `dxb-design-max` as its first step; a skill holds max for one turn,
            so its project hook `dxb-design-max.py` reminds it on each of his messages and the
            lead calls it on every one, whatever it asks; only his yes closes the mode
            <!-- CEO-OK: design-max-only-his-yes-closes-2026-10-04 --> and the job goes on at the session's level
            <!-- CEO-OK: design-plan-architecture-at-max-2026-10-03 --> <!-- CEO-OK: design-max-skill-every-turn-2026-10-04 -->.
DONE-LIST → numbered, each item a command and its expected output, written BEFORE the code.
BUILD     → root cause before fix; new code is proven by a test that failed before it existed. The
            writers write and run the job's own tests — the approved scope, completely: no stub, no
            placeholder, no silent narrowing or widening; a discovery that would change the scope,
            architecture, security, data integrity or the outcome stops the work and is reported.
            The change matches the surrounding code — naming, structure, comment density, error
            handling, idiom. The hands are the arrangement's (§3); whoever writes, the lead verifies
            each piece — its failing-first test, a reading against the registered sources — before
            it is committed.
AUDIT     → Sol, blind (§5), one pass at the class's effort (§6).
            A — blocks · B — repaired in this same pass · C — older than this work → stays in the
            job's own folder (the audit report); never the board — a row opens only on his word.
FIX       → a fork or a `helper-writer` fixes each finding; the lead verifies it — the finding's own
            failing case now green, what the fix touched re-measured. There is no second Sol round
            <!-- CEO-OK: sol-single-pass-fixes-by-helper-2026-10-03 -->.
DISPUTE   → the lead says a finding is wrong: the lead runs the evidence Sol gave with it —
            it fails → real, fixed; it holds → the finding drops, the reason is recorded.
            No test can decide it (a design question): the lead decides and records why; on a
            normal or critical job Fable rules on it in its end call (§2).
            The lead has the last word. The CEO reads the line in the report; he is not asked.
BRAKE     → the job passes its class budget (§7): stop at a clean break, find why it grew,
            and ask the CEO before going on.
JUDGE     → battery ONCE, the dependants of every changed thing re-measured and printed; on a
            normal or critical job Fable's end call, before "done" (§2); one commit per phase.
TELL      → the CEO, in his language, under three headings: Sizi bekleyen · Değişen · Bulunan.
            An empty heading is not written; the evidence stays in the work until he asks; never
            a technical question. A defect fixed inside the job is not listed (the commit carries
            it); what is found outside it goes under Bulunan with a recommendation, he decides.
RECORD    → STATE (the contradicted sentence goes, LAW A), the board row, rulers green.
```

**What reaches the CEO as a question:** starting any job, its plan (once), money out, a contract, an
identity step, the Islamic boundaries, a job outgrowing its budget, and an order of his
that truly reads two ways — each with a recommendation, answerable in one word. Technical choices
inside a job he already said yes to are the lead's. The plan's single trip and the three-heading
report are his words of 2026-10-03 <!-- CEO-OK: plan-comes-to-him-once-2026-10-03 --> <!-- CEO-OK: job-report-three-headings-2026-10-03 -->.

## 5. The auditor's brief — blind, not in the dark

| Sol sees | Sol does not see |
|---|---|
| the CEO's sentence, verbatim | "Opus / Fable found it correct" |
| the plan and its design decisions **as facts** ("this door is closed on purpose") | the lead's reasoning or summary |
| the done-list | "tests are green" or any other summary |
| the diff | a previous auditor's verdict |
| test output, **raw and whole** | |

Its first question on every job: *does this done-list prove what the CEO's sentence asked for?* — the
lead wrote the exam; the auditor checks the exam too. **Sol queries the construction engine itself**
through its one tool `sql_read` (`scripts/governance/sol-db-mcp.mjs`, role `sol_reader`, job 1
2026-09-28) — the brief tells it so, and tells it to read that file before trusting it; the lead never
hands over a count the auditor can take. Sol may ask for any other read-only command; the lead runs it
and returns the raw output. Sol's sandbox has no network, so the database-writing test suites are run
by the lead and handed over whole. Sol audits once; there is no reply round. Output per claim:

```text
Claim / done-list item:
Verdict: REFUTED | STANDS AFTER ATTEMPTED REFUTATION | UNVERIFIED
Finding: file:line, concrete scenario, impact
Evidence: the command or artifact and its decisive result
Correction required:
```

## 6. Effort routing — the charts, read from the CEO's own screenshots 2026-09-27

| Opus 5.5 | medium | high | xhigh | max |
|---|---|---|---|---|
| FrontierCode (mergeable code) | **54.6 % · USD 0.80** | 54.0 % · USD 1.09 | 51.4 % · USD 2.25 | 54.4 % · USD 6.19 |
| Terminal-Bench 4.0 | ≈ 58 % | **64.2 % · USD 3.88** | 66.4 % · USD 7.35 | 64.8 % · USD 11.24 |
| CursorBench 4.0 | 52.5 % | ≈ 56 % | ≈ 56 % | 57.8 % |

- **Writing code:** the lead's level (`high`). Opus `xhigh` is never used for code — the bottom of the
  FrontierCode curve (the CEO's word, 2026-09-28). `max` only after the same piece failed twice at
  `high`: a medium try plus a high retry (USD 1.89) is under a third of one `max` run (USD 6.19) and
  passes the same auditor. Prices here are written USD, never with a dollar sign: opened with a job
  sentence, this door has a dollar sign and a digit replaced by the sentence's words (measured
  2026-10-04).
- **Auditor (Sol):** light `medium` · normal `high` · critical `xhigh`. Measured 2026-10-01, the
  auditor exam on the first critical job's diff (`.planning/quick/20261001-auditor-exam/RESULT.md`):
  both levels found its blocking defect; `xhigh` took 24.9 minutes against 16.5, and Plus 5-hour +9
  against +6.
- `audit-card.mjs` sets the auditor's level from the card; the lead may raise it, never lower it. The card is the lead's judgment — no machine can tell a dangerous file (the CEO,
  2026-10-01: *"sistem tahmin edemez onu sadece sen bilirsin"*). **Sol audits at the level the card
  gives and never re-grades it** <!-- CEO-OK: auditor-never-regrades-2026-10-03 --> — checking the
  done-list (§5) is auditing the work; grading the job is the lead's.

## 7. The brake and the bill

- Class budgets are set from the first three jobs (light · normal · critical) — measured, never
  guessed. Until then the lead reads `dxb-quota` at the start and at each phase end.
- Nothing is logged by hand. Every token is already in the transcripts
  (`~/.claude/projects/-home-dxb-DxB-Global-OS/**/*.jsonl`, `message.usage`) and the Codex rollouts
  (`~/.codex/sessions/**`, `rate_limits`); when the CEO asks, one command sums them.

## 8. Findings, long commands, context and handover

- **A / B / C** and his law of 2026-09-22: a minor finding is repaired in the same pass.
- **The 4-minute rules** (held by `~/.claude/hooks/dxb-cost-gate.py`): a command over 4 minutes is the
  lead's; a subagent idle over 4 minutes is never resumed — its cache is the 5-minute one.
- **The context gate** (held by `~/.claude/hooks/dxb-context-gate.py`, the CEO's numbers of
  2026-09-26): hand over at ≥ 50 % used, or when used + the next phase's honest estimate > 55 %;
  only at a clean break — no battery running, tree committed, report sent.
- **The handover** is done by the engineer, never the CEO
  <!-- CEO-OK: handover-at-50-without-asking-2026-10-01 -->. A note in the scratchpad, in the author's
  own voice (the job's place
  in the whole first, then his words of this job verbatim, every phase with status and commit, the
  traps met, the first message the successor sends; session-only orders marked as such; last, the
  path of this session's own conversation — `~/.claude/projects/-home-dxb-DxB-Global-OS/$CLAUDE_CODE_SESSION_ID.jsonl`
  — with the line *if anything here is unclear, read the part you need there*), `wl-copy`'d
  <!-- CEO-OK: handover-carries-transcript-2026-10-03 -->. He is quoted verbatim — from the ledger, or
  from this conversation marked so <!-- CEO-OK: handover-quotes-conversation-verbatim-2026-10-03 --> —
  never composed in his first person.
  The successor opens with the same model and effort as this session, in a VS Code editor-area
  terminal, through `operator` (look first; if the CEO is typing, wait): `operator key ctrl+shift+p`
  → `operator type "Terminal: Create New Terminal in Editor Area"` → `operator key Return` →
  `operator shot` → paste with `operator key ctrl+shift+v` (`ctrl+v` does not reach the terminal;
  `operator type` inverts case here, so a command line is pasted, never typed) the line
  `systemd-run --user --scope --quiet --collect -p MemoryMax=16G -p MemorySwapMax=4G -- /home/dxb/.local/bin/claude --model <same> --effort <same> "$(cat <note>)"`
  (`claude` is not on that terminal's PATH) → `operator shot`, read it → `operator key Return`.
  Proof it is alive: `ListAgents` shows it and it answers.

## 9. Owed measurements — the first jobs pay them

- **The fork — its start measured 2026-10-03.** A forked subagent's first call read 203,676 tokens from
  the lead's cache and wrote 1,200 (session 5ed74ad7): a fork does not re-read the lead's context. What
  it reads after that is new, and it runs on the lead's model. Whether a fork, a team or a hybrid
  pays on a real job is paid by the cards' measured fields (§3).
- **Plus share per audit:** `rate_limits` before and after each audit in the Codex rollout.
