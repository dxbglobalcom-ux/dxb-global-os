---
name: dxb-team2
description: Use when the CEO hands the construction a job — the default construction door. The lead (the session) chooses who writes — itself, a fork, medium helpers, or a fork with helpers — and verifies every piece; one blind, read-only GPT-6.1 Sol pass checks the work; its findings are fixed and tested; the CEO is warned to switch the effort — max for plan, design and architecture, high for the build. Trigger `/dxb-team2 <the job in one sentence>`.
---

# The team — one lead, the hands it chooses, one blind auditor

The construction's default door <!-- CEO-OK: dxb-team2-default-door-2026-09-28 -->, and since
2026-10-06 a lean one: no score card, no done-list, no Fable, no paperwork per job — the work, a blind
check, the fixes, the tests <!-- CEO-OK: dxb-team2-lean-2026-10-06 -->. Every holding build runs
through it, so the standard is the Ferrari's: fast because nothing in it is ceremony, right because
nothing reaches him unchecked. The laws it obeys are in `AGENTS.md`; it opens `dxb-verify`
and `dxb-close-row`.

## 1. The flow

```
THE CEO'S JOB, in one sentence he would sign
   │
   ├── small — a fix, a deletion, a text he already worded: no plan, straight to ARRANGE
   │
PLAN      the talk turns to plan, design or architecture → effort warning MAX (§2)
          the plan goes to him once, in his language → his yes → effort warning HIGH (§2)
   │
ARRANGE   the lead chooses the hands (§3) and says it in one line
   │
BUILD     the hands write and run their own tests; the lead verifies every piece
   │
SOL       one blind, read-only pass (§4) — A blocks · B fixed now · C stays in the report
   │
FIX       a fork or a writing helper fixes; the lead verifies; no second Sol round
   │
TEST      the touched tests; code changed → the battery once (§5)
   │
COMMIT → TELL him in a few lines (§6) → STATE once, at the session's end
```

**What reaches him as a question:** starting a job, its plan (once), money out, a contract, an identity
step, the Islamic boundaries, and an order of his that truly reads two ways — each with a
recommendation, answerable in one word. Technical choices inside a job he said yes to are the lead's.
The plan's single trip is his word <!-- CEO-OK: plan-comes-to-him-once-2026-10-03 -->.

**The plan**, when there is one, names the scope, what it touches, the ordered steps, the
arrangement, how it is verified, and the risks — in his language, short. No file changes before his yes.

## 2. Effort — the session warns, he switches

The session runs at `high`: the talk, the build, the fixes, the tests. Plan, design and architecture run
at `max`. **He switches with /effort; the lead warns him — on every reply, until he has.**

- The moment the talk turns to a plan, a design or an architecture, the lead runs
  `python3 .claude/hooks/dxb-effort-warn.py plan` and opens that reply with
  `⚠ Muhittin Bey, plan konuşmasındayız — /effort max'a geçin.`
- At his yes to the plan, the lead runs `python3 .claude/hooks/dxb-effort-warn.py build`, opens the reply
  with `⚠ Muhittin Bey, plan bitti — koda geçmeden /effort high'a geçin.`, and writes nothing until he
  has switched. At the job's end: `python3 .claude/hooks/dxb-effort-warn.py off`.
- Between those, the hook `dxb-effort-warn.py` repeats the line on each of his messages until the
  session's live level matches — the lead cannot forget it. A small job has no plan and no warning.
- Measured 2026-10-06: a hook's input carries no effort and /effort writes no transcript row, so the
  live level is read from the status line's record (`$XDG_RUNTIME_DIR/claude-ctx/<session>.json`,
  field `effort`, which follows /effort at once), else from the last step's `effort` in the transcript.
  A skill's `effort` can raise a turn but never lower one — the reason the old design-at-max skill went.

## 3. The seats and the arrangement

| Seat | Who | Does | Never |
|---|---|---|---|
| **Lead** | the session, `high` | chooses the hands, writes what it keeps, verifies every piece and every fix, runs the tests, commits, tells him | approves its own work; commits a piece it has not verified; asks him a technical question |
| **Fork** | the lead's own copy (`subagent_type: "fork"`), its whole context | writes a large piece that needs this conversation | commits |
| **Writing helper** | `helper-writer` (Opus 5.5 · `medium`) | writes and tests a piece the lead specified; fixes a Sol finding | commits; widens the piece <!-- CEO-OK: helpers-write-code-under-lead-verification-2026-10-03 --> |
| **Helper** | `helper` (Opus 5.5 · `medium`, read-only) | reads code or documents, measures, researches | writes |
| **Reader** | a one-shot `scout` or `Explore` | a wide search whose text would swell the lead's context | writes; is resumed (its cache dies at 5 min) |
| **Escalation writer** | `builder` (Opus 5.5 · `max`), one-shot | only a piece that failed twice at `high` | is opened for a routine fix |
| **Auditor** | GPT-6.1 Sol <!-- CEO-OK: auditor-sol-6-1-2026-10-01 -->, through `scripts/governance/refuter.sh` | one blind pass per job (§4) | writes; audits a job twice; sees the lead's reasoning or verdict |

Fable 5.1 is not consulted in a dxb-team2 job — neither the `advisor` tool (its own "before the work
and before done" advice does not apply here) nor the Fable-based `design-eye`.

**The arrangement — chosen at ARRANGE, said to him in one line with its why**
<!-- CEO-OK: orchestration-three-arrangements-lead-chooses-2026-10-03 -->:

| Arrangement | Who writes | When |
|---|---|---|
| **Lead** | the lead itself | a small job, or pieces so coupled that splitting them costs more than it saves |
| **Fork** | the fork | one large piece that needs the whole conversation, while the lead stays free to verify |
| **Team** | `helper-writer`s, in parallel; `helper`s read and research beside them | independent pieces, each specifiable in a paragraph |
| **Hybrid** | the fork writes the core; `helper-writer`s the side pieces; `helper`s read | a large core with independent pieces around it |

- Parallel writers never touch the same file. Each gets a spec it can work from alone: the files, the
  behaviour, the measured facts it must not re-litigate, the test it writes first, what it reports.
- The lead verifies each piece before it is committed — reads the diff, runs its tests — and commits
  only what it verified. Nobody else commits.
- A fork starts cheap: its first call reads the lead's cache (203,676 tokens read, 1,200 written —
  session 5ed74ad7, 2026-10-03).
- Code is written at `high`. Opus `xhigh` is never used for code (FrontierCode 51.4 %, the bottom of the
  curve); `max` writes code only as the escalation writer — a medium try plus a high retry (USD 1.89)
  is under a third of one `max` run (USD 6.19) and passes the same auditor. Prices in this door are
  written USD, never with a dollar sign: opened with a job sentence, a dollar sign and a digit are
  replaced by the sentence's words (measured 2026-10-04).

## 4. Sol — one blind pass

Every job that changes code, a rule or a door gets one Sol pass, after BUILD; a change to the records
alone (STATE, the board) is checked by the rulers on commit instead.

- **Launch:** `scripts/governance/refuter.sh [--effort medium|high|xhigh] "<brief>"` — `high` by
  default; `xhigh` for money, a database, security, approval, governance or the agents; `medium` for a
  text-only change. An audit can outlast the Bash tool's 10 minutes: launch it detached (a small
  script under `setsid nohup`, its output to the job folder, `EXIT=` on its last line) and wait for
  that line.
- **The brief — blind, not in the dark:** his words verbatim; the plan's decisions as facts ("this door
  is closed on purpose"); the range; where the raw test output lies. Never the lead's reasoning, a
  summary, "tests are green", or another auditor's verdict. Its first question: *does this do what he
  asked?*
- **Its hand:** Sol queries the construction engine itself through its one tool `sql_read`
  (`scripts/governance/sol-db-mcp.mjs`, role `sol_reader`) — the lead never hands over a count Sol can
  take. Its sandbox has no network, so the lead runs the database-writing tests and hands their output
  over whole.
- **Its findings**, per claim: Claim · Verdict (REFUTED | STANDS AFTER ATTEMPTED REFUTATION |
  UNVERIFIED) · Finding (`file:line`, scenario, impact) · Evidence · Correction required.
  **A** blocks · **B** is fixed in this pass · **C** is older than this work and stays in the job's
  report — never the board; a row opens only on his word.
- **Fix:** a fork or a `helper-writer` fixes each A and B; the lead verifies the finding's own case.
  There is no second Sol round <!-- CEO-OK: sol-single-pass-fixes-by-helper-2026-10-03 -->.
- **Dispute:** the lead runs the evidence Sol gave — it fails → real, fixed; it holds → the finding drops
  and the report says why. A question no test can settle is the lead's, with its reason in the report.
- **Sol unavailable** (quota, error, timeout): on an ordinary job the `refuter` subagent (Opus 5.5 ·
  `high`) audits once, and the report says *"audited by Opus instead of Sol — read-only by word, not by
  tool — because …"*; on money, a database or security the lead waits for Sol's window and works on
  something else. No job closes unaudited; the auditor is never swapped silently
  <!-- CEO-OK: fallback-auditor-named-and-refuter-second-round-gone-2026-10-04 -->.

## 5. Tests

- New behaviour is proven by a test written first — red before the code, green after.
- After each piece, its own tests. After Sol's fixes, the touched tests again.
- **Code changed → the battery, once, at the end:** `pnpm construction:battery` — the whole suite in
  both halves against the construction's own engine (port 54422), 1,486 tests, about 6 minutes
  (2026-10-04). Launch it detached from a shell whose `oom_score_adj` is 100; green is the line
  `BATTERY_GREEN`. It answers the one question no single test can: did this break anything else.
- **Text only** — a door, a persona's words, a record → no battery: the commit hook's rulers read those
  texts on every commit.
- The commit hook runs by itself on every commit: the secret scan (gitleaks); the records ruler when
  STATE, the board or the ledger change; the opening ruler when the core, a skill or the opening hook
  change; the research ruler and `tests/b46` when the research engine changes.

## 6. Commit, tell, record

- **Commit:** one per job, or one per independent piece; the message says what changed and why.
- **Tell him** in his language, in a few lines, under three headings — *Sizi bekleyen · Değişen ·
  Bulunan* <!-- CEO-OK: job-report-three-headings-2026-10-03 -->: what waits on him; what changed;
  what was found outside the job, each with a recommendation. An empty heading is not written; a
  defect fixed inside the job is not listed; the proof stays in the work until he asks.
- **His words** are written once, in `scripts/governance/ceo-approvals.json`, and only where a record
  must rest on his order or approval (LAW B) — never copied into commits, doors or STATE.
- **STATE** is written once, at the session's end: the three headings, a few lines each — what
  finished and waits for his eye, what is next, what waits on him. No conversation, no quotes, no
  hashes or counts beyond the one that names a job.
- **The job folder** (`.planning/quick/<date>-<slug>/`) holds Sol's report and the raw evidence — only
  for a job that went to Sol.

## 7. Long commands, context and handover

- **The 4-minute rules** (held by `~/.claude/hooks/dxb-cost-gate.py`): a command over 4 minutes is the
  lead's; a subagent idle over 4 minutes is never resumed — its cache is the 5-minute one.
- **The context gate** (held by `~/.claude/hooks/dxb-context-gate.py`): hand over at ≥ 50 % used, or
  when used + the next phase's honest estimate > 55 %; only at a clean break — no battery running,
  tree committed, report sent.
- **The handover** is done by the engineer, never the CEO
  <!-- CEO-OK: handover-at-50-without-asking-2026-10-01 -->. A note in the scratchpad, in the author's
  own voice: the job's place in the whole first, then his words of this job verbatim, every phase with
  status and commit, the traps met, the first message the successor sends; session-only orders marked
  as such; last, the path of this session's own conversation —
  `~/.claude/projects/-home-dxb-DxB-Global-OS/$CLAUDE_CODE_SESSION_ID.jsonl` — with the line *if
  anything here is unclear, read the part you need there*
  <!-- CEO-OK: handover-carries-transcript-2026-10-03 -->, `wl-copy`'d. He is quoted verbatim — from
  the ledger, or from this conversation marked so
  <!-- CEO-OK: handover-quotes-conversation-verbatim-2026-10-03 --> — never composed in his first
  person. The successor opens with the same model at his saved default effort, in a VS Code
  editor-area terminal, through `operator` (look first; if the CEO is typing, wait):
  `operator key ctrl+shift+p` → `operator type "Terminal: Create New Terminal in Editor Area"` →
  `operator key Return` → `operator shot` → paste with `operator key ctrl+shift+v` (`ctrl+v` does not
  reach the terminal; `operator type` inverts case here, so a command line is pasted, never typed) the
  line
  `systemd-run --user --scope --quiet --collect -p MemoryMax=16G -p MemorySwapMax=4G -- /home/dxb/.local/bin/claude --model <same> "$(cat <note>)"`
  (`claude` is not on that terminal's PATH) → `operator shot`, read it → `operator key Return`.
  Proof it is alive: `ListAgents` shows it and it answers. If the job is in its plan phase, the
  successor's first reply carries the max warning (§2).
