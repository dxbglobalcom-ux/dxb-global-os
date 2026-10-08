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
PLAN      the talk turns to plan, design or architecture → `plan`: effort warning MAX (§2)
          the plan goes to him once, in his language, closing with the HIGH warning (§2) → his yes
   │
ARRANGE   the lead chooses the hands (§3) and says it in one line
   │
BUILD     the hands write and run their own tests; the lead verifies every piece and commits it
   │
TEST      code changed → typecheck and the battery (§5), ended before Sol starts
   │
SOL       one blind, read-only pass over the job's commits, the battery's output in hand (§4) —
          A blocks · B fixed now · C in the report
   │
FIX       a fork or a writing helper fixes; the lead verifies; no second Sol round; the touched tests,
          typecheck, and the battery again when a fix changed code
   │
COMMIT the fixes → TELL him in a few lines (§6) → STATE, when nothing is left in hand
```

**What reaches him as a question:** starting a job, its plan (once), money out, a contract, an identity
step, the Islamic boundaries, a discovery that would change the scope he approved, the architecture or
the data's integrity (the work stops at it), and an order of his that truly reads two ways — each with a
recommendation, answerable in one word. Technical choices inside a job he said yes to are the lead's.
The plan's single trip is his word <!-- CEO-OK: plan-comes-to-him-once-2026-10-03 -->.

**The plan**, when there is one, names the scope, what it touches, the ordered steps, how it is verified,
and the risks — in his language, short; not who writes, which the lead chooses after his yes (§3)
<!-- CEO-OK: plan-names-no-arrangement-2026-10-08 -->. No file changes before his yes.

## 2. Effort — the session warns, he switches

The session runs at `high`: the talk, the build, the fixes, the tests. Plan, design and architecture run
at `max`. **He switches with /effort; the lead warns him — on every reply, until he has.**

- The moment the talk turns to a plan, a design or an architecture, the lead runs
  `python3 .claude/hooks/dxb-effort-warn.py plan`; it answers with the live level and whether this reply
  opens with `⚠ Muhittin Bey, plan konuşmasındayız — /effort max'a geçin.` (not when he is already at
  max). His plan permission mode starts the same warning by itself.
- In the reply that brings him the plan for his yes, the lead runs
  `python3 .claude/hooks/dxb-effort-warn.py build` and closes that reply with
  `⚠ Muhittin Bey, plan bitti — koda geçmeden /effort high'a geçin.` — the warning travels with the
  question, so his yes can arrive at high and the build starts at once. A yes that arrives at another
  level gets the line again, and nothing is written until he has switched; a correction instead of a yes
  → `plan` again. At the job's end: `python3 .claude/hooks/dxb-effort-warn.py off`.
- Between those, the hook `dxb-effort-warn.py` repeats the line on each of his messages until the
  session's live level matches. With no mode set, a message of his naming a plan, a design or an
  architecture reminds the lead to run `plan`, and a session whose level is not high reminds the lead to
  open any reply in which it writes code itself with `⚠ Muhittin Bey, koda geçmeden /effort high'a geçin.`
  — a small job is not written at max either. Outside a plan, code a medium `helper-writer` writes needs
  no switch. After a plan the session returns to high in every case, whoever writes: the lead's own turns
  — specifying, verifying, testing — belong at high, not at max.
- Measured 2026-10-06: neither a hook's input nor its environment carries the effort (`CLAUDE_EFFORT`
  reaches the Bash tool, not a UserPromptSubmit hook). The live level is the newest, by timestamp, of the
  status line's record (`$XDG_RUNTIME_DIR/claude-ctx/<session>.json`, field `effort`), this session's last
  step in the transcript, and its last /effort row there (`Set effort level to …`, written by a switch
  between turns; a switch in the middle of a turn writes none) — none known → an unknown level.
  A skill's `effort` can raise a turn but never lower one — the reason the old design-at-max skill went.

## 3. The seats and the arrangement

| Seat | Who | Does | Never |
|---|---|---|---|
| **Lead** | the session, `high` | chooses the hands, writes what it keeps, verifies every piece and every fix, runs the tests, commits, tells him | approves its own work; commits a piece it has not verified; asks him a technical question |
| **Fork** | the lead's own copy (`subagent_type: "fork"`), its whole context | writes a piece that needs this conversation <!-- CEO-OK: fork-seat-no-size-2026-10-08 --> | commits |
| **Writing helper** | `helper-writer` (Opus 5.5 · `medium`) | writes and tests a piece the lead specified; fixes a Sol finding | commits; widens the piece <!-- CEO-OK: helpers-write-code-under-lead-verification-2026-10-03 --> |
| **Helper** | `helper` (Opus 5.5 · `medium`, read-only) | reads code or documents, measures, researches | writes |
| **Reader** | a one-shot `scout` or `Explore` | a wide search whose text would swell the lead's context | writes; is resumed (its cache dies at 5 min) |
| **Escalation writer** | `builder` (Opus 5.5 · `max`), one-shot | only a piece that failed twice at `high` | is opened for a routine fix |
| **Auditor** | GPT-6.1 Sol <!-- CEO-OK: auditor-sol-6-1-2026-10-01 -->, through `scripts/governance/refuter.sh` | one blind pass per job (§4) | writes; audits a job twice; sees the lead's reasoning or verdict |

Fable 5.1 is not consulted in a dxb-team2 job — neither the `advisor` tool (its own "before the work
and before done" advice does not apply here) nor the Fable-based `design-eye`.

**The arrangement — four, all equal**
<!-- CEO-OK: orchestration-three-arrangements-lead-chooses-2026-10-03 --> <!-- CEO-OK: four-equal-arrangements-lead-chooses-2026-10-08 -->:

| Arrangement | Who writes |
|---|---|
| **Lead** | the lead itself |
| **Fork** | the fork, while the lead stays free to verify |
| **Team** | `helper-writer`s at `medium`, each its own piece, in parallel; `helper`s read and research beside them; the lead at `high` directs them |
| **Hybrid** | the fork writes the core; `helper-writer`s the side pieces; `helper`s read |

At ARRANGE — after the plan is talked through at `max` and he says yes, or at once on a small job — the
lead at `high` looks at the job and chooses one of the four by its own judgement, and tells him in one
line which and why. Writing itself is one of the four, not the default.

- Parallel writers never touch the same file, and run their tests with `DXB_ENGINE_LOCK_WAIT=200`: one
  run at a time holds the construction engine, and with it a second one queues instead of being refused
  — inside the 4-minute rule (§7), so the lead starts no battery while writers are testing.
- Each writer gets a spec it can work from alone: the files, the
  behaviour, the measured facts it must not re-litigate, the test it writes first, what it reports.
- The lead verifies each piece before it is committed — reads the diff, runs its tests — and commits
  only what it verified. Nobody else commits.
- A fork starts cheap: its first call reads the lead's cache (203,676 tokens read, 1,200 written —
  session 5ed74ad7, 2026-10-03).
- A piece that fails: a medium writer's goes to the lead or a fork at `high`; one that failed twice at
  `high` goes to the `builder`, never earlier. Opus `xhigh` is never used for code (FrontierCode 51.4 %, the bottom of the
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
  is closed on purpose"); the range; where the raw test and battery output lies. Never the lead's reasoning, a
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
- **Code changed → `pnpm typecheck`, then the battery, before Sol** — Sol reads its output instead of
  marking it unverified, and reads the engine only after the battery has stopped writing to it
  <!-- CEO-OK: dxb-team2-overall-look-fixes-2026-10-06 -->; again after the fixes when a fix changed code;
  and a resident service whose
  code changed is restarted (`dxb-verify`). The typecheck covers `packages/` and `apps/`, then `tests/` and
  `db/seed/` (`tsconfig.tests.json`, since 2026-10-06). The battery: `pnpm construction:battery`, the whole suite in
  both halves against the construction's own engine (port 54422), 1,486 tests, about 6 minutes
  (2026-10-04). Launch it detached from a shell whose `oom_score_adj` is 100; green is the line
  `BATTERY_GREEN`. It answers the one question no single test can: did this break anything else.
- **Text only** → no battery. A door, the core or a record: the commit hook's rulers read those on
  every commit. A persona's words: `bash scripts/persona-ruler.sh` (dxb-verify), which the commit
  hook does not run.
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
- **STATE** is written once, when the job is told and nothing is left in hand (a session's end cannot
  be seen coming): the three headings, a few lines each — what
  finished and waits for his eye, what is next, what waits on him. No conversation, no quotes, no
  hashes or counts beyond the one that names a job.
- **The job folder** (`.planning/quick/<date>-<slug>/`) holds Sol's report and the raw evidence — only
  for a job that went to Sol. Sol's raw dump (`*.raw`) and its brief (`*brief*.txt`, his words verbatim)
  stay on the disk and out of git (`.gitignore`), and leave the disk after 90 days
  (`scripts/governance/sol-dump-sweep.sh`, run after every commit)
  <!-- CEO-OK: sol-dumps-swept-after-90-days-2026-10-06 -->; `SOL.md`, the verdict, is committed
  <!-- CEO-OK: dxb-team2-overall-look-fixes-2026-10-06 -->.

## 7. Long commands, context and handover

- **The 4-minute rules** (held by `~/.claude/hooks/dxb-cost-gate.py`): a command over 4 minutes is the
  lead's; a subagent idle over 4 minutes is never resumed — its cache is the 5-minute one.
- **The context gate** (held by `~/.claude/hooks/dxb-context-gate.py`) and **the clean break**: from
  50 % used, hand over at the first clean break — the piece finished well, the tree committed, no
  battery running, the report sent — even when reaching it takes the session to about 60 %; never in
  the middle of a piece. The clean break and the quality decide, not the number; the lead judges it,
  helpers included <!-- CEO-OK: handover-at-the-clean-break-2026-10-06 -->. At 60 % the gate refuses
  the Agent tool — a safety net, past which nothing new starts.
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
