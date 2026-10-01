---
name: dxb-team2
description: Use when the CEO hands the construction a job — the default construction door. One lead (the session) scores the job, writes the done-list, writes and fixes the code itself; a fresh, blind, read-only GPT-6.1 Sol auditor checks every job at a depth set by its score; Fable 5.1 drafts the architecture of a critical job and settles a disagreement; nothing technical is ever sent to the CEO as a question. Trigger `/dxb-team2 <the job in one sentence>`.
---

# The team — one lead who builds, one blind auditor, Fable for architecture

**Where it came from.** 2026-09-28, after `dxb-team1` burned half the weekly quota on one job in two
days. The CEO read four outside opinions and the Opus 5.5 launch charts with the lead, item by item,
and ordered this door as the construction's default: *"hiç biryerde dxbteam1 kalmasın aynen … ve
başla"* <!-- CEO-OK: dxb-team2-default-door-2026-09-28 -->. The measured cause of the burn, which
this door is built against: **the fire came from waste, not from checking** — three writers each
re-reading the repository, a fresh `max` writer for every fix, subagents whose prompt cache dies at
5 minutes (measured 2026-09-28 over 25–28 Sep: subagents wrote 50.6 M tokens to the 5-minute cache,
main sessions 22.8 M to the 1-hour cache). Waste is cut; checks are not. Every seat below was weighed
in two columns — what quality it buys, what it costs — and a check leaves only when a measured check
replaces it. `dxb-crew` stays for its own use. The laws this door obeys are in `.claude/CLAUDE.md`;
it opens `dxb-verify` and `dxb-close-row`.

## 1. The shape

```
            THE CEO'S SENTENCE
                    │
            SCORE CARD (4 axes, 0-8) + DONE-LIST + budget
                    │
     ┌──────────────┼──────────────────────────┐
  LIGHT (0-2)   NORMAL (3-5)             CRITICAL (6-8)
     │              │              Fable drafts / challenges the architecture
     │              │              → Sol reads the plan → the CEO approves the plan
     └──────────────┼──────────────────────────┘
                    ▼
     THE LEAD (this session) writes the code and runs its tests
                    │
     SOL AUDITOR — blind, read-only, one pass:  medium │ high │ xhigh
                    │
     finding → the lead fixes → Sol re-checks the finding and its surroundings
     disagreement → a test decides → else Fable rules → the lead has the last word
                    │
     BATTERY once · dependants re-measured · commit · report
```

## 2. Seats

| Seat | Who | Does | Never |
|---|---|---|---|
| **Lead** | the session — model and effort are the CEO's choice (`high` is the measured sweet spot) | scores the job, writes the done-list, writes the code, fixes every finding, runs the tests, the battery, commits, reports | approves its own work; writes code at Opus `xhigh` (FrontierCode: 51.4 %, the bottom of the curve); asks the CEO a technical question |
| **Auditor** | GPT-6.1 Sol <!-- CEO-OK: auditor-sol-6-1-2026-10-01 --> through `scripts/governance/refuter.sh --card <file>` — read-only by tool | one blind pass per job (§5); re-checks a fixed finding and what the fix touched | writes; sees a verdict or the lead's reasoning; is called as bare `codex` (the base config writes everywhere) |
| **Architect / advisor** | Fable 5.1, one call | drafts or challenges the architecture of a critical job; rules on a disagreement no test can settle | writes code; is asked routine steps |
| **Reader** | a one-shot subagent (`scout`, or `Explore`) | a wide search or read whose text would swell the lead's context | writes; is resumed (its cache dies at 5 min) |
| **Escalation writer** | `builder` (Opus 5.5 · `max`), one-shot, description `guarded:` when the path is guarded | only after the same piece failed twice at the lead's level | is opened for a routine fix |
| **Design eye** | `design-eye` (Fable 5.1) | reads a surface the CEO will see | writes |

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

**0-2 light · 3-5 normal · 6-8 critical.** Floor: a job touching money, the database, security,
approval or governance files is **at least normal**; the lead cannot score it lower. The card (axes,
total, class, auditor effort and why) goes into the commit body, so any later reader can check the
lead did not grade itself down.

**A machine holds the card** (*"tmm makineyi de kur"* <!-- CEO-OK: score-card-gate-2026-10-01 -->).
The card is a file (`job:` · `range:` · `blast:` · `risk:` · `reasoning:` · `ambiguity:`) handed to
`refuter.sh --card <file>`; `scripts/governance/audit-card.mjs` refuses an audit without one, measures
the floor from the files the range touches (its `FLOOR` table is the one copy of the guarded classes),
sets the auditor's effort, refuses an `--effort` beneath it, puts the card in front of Sol, and logs
every launch to `~/.local/state/dxb/audit-cards.log` — the class budgets of §7 are summed from it.

## 4. The loop

```
INTAKE    → the job in ONE sentence, provable by measurement; the CEO's words verbatim; what is his.
SCORE     → the card (§3); `dxb-quota` read once — the week's headroom and pace.
CRITICAL  → Fable drafts or challenges the architecture → Sol reads the PLAN (marked draft) →
            the plan goes to the CEO in his language; no code before his yes.
DONE-LIST → numbered, each item a command and its expected output, written BEFORE the code.
BUILD     → the lead writes and runs the job's own tests. Parallel work only as a measured fork (§8).
AUDIT     → Sol, blind (§5), one pass at the class's effort (§6).
            A — blocks · B — repaired in this same pass · C — older than this work → a board row.
FIX       → the lead fixes. Sol re-checks that finding AND what the fix touched, at the same
            effort; one level up if the fix spread to other files or a guarded path.
DISPUTE   → the lead says a finding is wrong: the auditor proves it with a test or a command —
            it fails → real, fixed; it holds → the finding drops, the reason is recorded.
            No test can decide it (a design question) → Fable rules on that one finding.
            The lead has the last word. The CEO reads the line in the report; he is not asked.
BRAKE     → the job passes its class budget (§7): stop at a clean break, find why it grew,
            re-plan, continue. The CEO hears of it only if the week's quota cannot carry the job.
JUDGE     → battery ONCE, the dependants of every changed thing re-measured and printed;
            one commit per phase.
TELL      → the CEO, in his language: the position, then the result. Never a technical question.
RECORD    → STATE (the contradicted sentence goes, LAW A), the board row, rulers green.
```

**What reaches the CEO as a question:** money out, a contract, an identity step, the Islamic
boundaries, the plan of a critical job, and an order of his that truly reads two ways — then with a
recommendation, answerable in one word. Nothing else.

## 5. The auditor's brief — blind, not in the dark

| Sol sees | Sol does not see (first pass) |
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
by the lead and handed over whole. After the first verdict, the lead's reply may be shown and
Sol weighs it. Output per claim:

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
| FrontierCode (mergeable code) | **54.6 % · $0.80** | 54.0 % · $1.09 | 51.4 % · $2.25 | 54.4 % · $6.19 |
| Terminal-Bench 4.0 | ≈ 58 % | **64.2 % · $3.88** | 66.4 % · $7.35 | 64.8 % · $11.24 |
| CursorBench 4.0 | 52.5 % | ≈ 56 % | ≈ 56 % | 57.8 % |

- **Writing code:** the lead's level (`high`). Opus `xhigh` is never used for code — the bottom of the
  FrontierCode curve (the CEO's word, 2026-09-28). `max` only after the same piece failed twice at
  `high`: a medium try plus a high retry ($1.89) is under a third of one `max` run ($6.19) and passes
  the same auditor.
- **Auditor (Sol):** light `medium` · normal `high` · critical `xhigh`. The first critical job runs
  `high` and `xhigh` on the same diff side by side; that number keeps or moves the critical level.
- `audit-card.mjs` sets the auditor's level from the card; the lead may raise it (a fix that spread),
  never lower it, and the floor in §3 is measured from the files, not declared.

## 7. The brake and the bill

- Class budgets are set from the first three jobs (light · normal · critical) — measured, never
  guessed. Until then the lead reads `dxb-quota` at the start and at each phase end.
- Nothing is logged by hand. Every token is already in the transcripts
  (`~/.claude/projects/-home-dxb-DxB-Global-OS/**/*.jsonl`, `message.usage`) and the Codex rollouts
  (`~/.codex/sessions/**`, `rate_limits`); when the CEO asks, one command sums them.

## 8. Carried over — from `dxb-crew`, unchanged

- **A / B / C** and his law of 2026-09-22: a minor finding is repaired in the same pass.
- **The 4-minute rules** (held by `~/.claude/hooks/dxb-cost-gate.py`): a command over 4 minutes is the
  lead's; a subagent idle over 4 minutes is never resumed — measured: its cache is the 5-minute one.
- **The context gate** — `dxb-crew` §3: hand over at ≥ 50 % used, or when used + the next phase's
  honest estimate > 55 % (held by `dxb-context-gate.py`); only at a clean break.
- **The handover** — `dxb-crew` §4, done by the engineer through `operator`; the successor opens with
  the same model and effort as this session. The note's first line is the job's place in the whole:
  which leg of the Ferrari, where this job sits, what changes when it is done.

## 9. Owed measurements — the first jobs pay them

- **The fork.** A forked subagent starts with the lead's whole context. Measure whether it reuses the
  lead's cache (cache read, not write) on a real job; if it does, forks become the parallel lane —
  the speed of three workers without three re-reads.
- **Sol `high` vs `xhigh`** on the same critical diff: findings, false alarms, time, Plus usage.
- **Plus share per audit:** `rate_limits` before and after each audit in the Codex rollout.
- **The first critical job** was Sol's own database reach (built 2026-09-28, §5); its audit pays the
  `high` vs `xhigh` measurement above.
