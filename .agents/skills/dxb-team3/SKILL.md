---
name: dxb-team3
description: Use when the CEO hands the construction a job, or says a plan will be talked ("plan konuşacağız", "plan moduna geçelim") — the default construction door. The lead (the session) chooses who writes — itself, a fork, medium helpers, or a fork with helpers — and verifies every piece; GPT-6.1 Sol and Fable 5.2 audit the work blind, side by side, read-only; their findings are fixed and tested; the CEO is warned to switch the effort — high for normal work and normal plans, xhigh only for a truly complex, important job, never max. Trigger `/dxb-team3 <the job in one sentence>`.
---

# The team — one lead, the hands it chooses, two blind auditors

`dxb-team3` is the door for a lead that runs on Fable 5.2 (CEO 2026-11-10 <!-- CEO-OK: dxb-team3-default-door-fable-5-2-2026-11-10 -->). `dxb-team2`, the door before it, is kept
for comparison and opens only when named.

The construction's default door <!-- CEO-OK: dxb-team2-default-door-2026-09-28 -->, and since
2026-10-06 a lean one: no score card, no done-list, no paperwork per job — the work, a blind check, the
fixes, the tests <!-- CEO-OK: dxb-team2-lean-2026-10-06 -->; a second Fable 5.2, walled off, audits beside Sol (§3, §4) <!-- CEO-OK: fable-audits-opus-second-writer-effort-by-weight-2026-11-09 -->. Every holding build runs
through it, so the standard is the Ferrari's: fast because nothing in it is ceremony, right because
nothing reaches him unchecked. The laws it obeys are in `AGENTS.md`; it opens `dxb-verify`
and `dxb-close-row`.

## 1. The flow

```
THE CEO'S JOB, in one sentence he would sign
   │
   ├── small — a fix, a deletion, a text he already worded: no plan, straight to ARRANGE
   ├── light — a small, low-risk job (narrow glue, a setting, a record, a deletion he ordered): one Opus 5.5
   │   session at medium does it end to end, tests it at once, no Sol pass; reading or measuring that would
   │   swell its context goes to a helper (his word, 2026-11-07 <!-- CEO-OK: light-lane-small-jobs-opus-medium-2026-11-07 -->).
   │   Money, the approval gate, security, moving data, parallel or many-place changes keep the full flow.
   │
PLAN      the talk turns to plan, design or architecture → the lead weighs the job: normal → `plan`
          (high); a truly complex, important job → xhigh, said to him in one line with its reason (§2);
          his "plan konuşacağız" opens this door at once, the job is asked inside it
          the lead writes the plan; on an important or complex job a second Opus 5.5 writes it too, sealed
          → Sol and Fable audit it blind, side by side → the lead adds, fixes, signs (below)
          the plan goes to him once, in his language, closing with the HIGH warning (§2) → his yes
   │
ARRANGE   the lead chooses the hands (§3) and says it in one line
   │
BUILD     the hands write and run their own tests; the lead verifies every piece and commits it
   │
TEST      code changed → typecheck and the battery (§5), ended before Sol starts
   │
AUDIT     Sol and Fable, one blind, read-only pass each, at the same time, over the job's commits, the
          battery's output in hand (§4) — A blocks · B fixed now · C in the report
   │
FIX       a fork or a writing helper fixes; the lead verifies; no second audit round; the touched tests,
          typecheck, and the battery again when a fix changed code
   │
COMMIT the fixes → TELL him in a few lines (§6) → STATE, when nothing is left in hand
```

**What reaches him as a question:** starting a job, its plan (once), money out, a contract, an identity
step, the Islamic boundaries, a discovery that would change the scope he approved, the architecture or
the data's integrity (the work stops at it), and an order of his that truly reads two ways — each with a
recommendation, answerable in one word. Technical choices inside a job he said yes to are the lead's.
The plan's single trip is his word <!-- CEO-OK: plan-comes-to-him-once-2026-10-03 -->.
His plan words open the door; the hook reminds the lead, it cannot open it
<!-- CEO-OK: plan-words-open-dxb-team2-2026-10-09 -->.

**The plan**, when there is one, names the scope, what it touches, the ordered steps, how it is verified,
and the risks — in his language, short, and comes with an Archify map (`~/.claude/skills/archify`, the Turkish
catalogue `archify-tr.json` beside this door as `meta.translations`) opened in his Chrome
<!-- CEO-OK: every-plan-comes-with-an-archify-map-2026-11-09 -->; not who writes, which the lead chooses after his yes (§3)
<!-- CEO-OK: plan-names-no-arrangement-2026-10-08 -->. No file changes before his yes.

**The plan's writers and its audit** <!-- CEO-OK: fable-audits-opus-second-writer-effort-by-weight-2026-11-09 --> — every plan, design or architecture of a board row,
before it goes to him; not a small job. The lead writes it. On an important or complex job a second
Opus 5.5 writes the same plan from the same brief, so the two complete each other; neither sees the
other's, by tool, not by promise <!-- CEO-OK: plan-writers-sealed-independent-2026-10-19 -->.
1. The lead writes the brief once. It opens with the holding reminder — the per-turn line's THE HOLDING text,
   one source with the employees' `holdingLine()` (`packages/voice/src/prompt-core.ts`) <!-- CEO-OK: holding-reminder-every-turn-and-brief-2026-11-09 --> — and, when the
   job belongs to a business line, that line's mission and vision; then his words verbatim, the scope, the facts measured. On a two-writer job
   it starts the second writer: `scripts/governance/second-plan.sh start <job> <brief> high` runs
   Opus 5.5 walled off in bwrap — the brief and a copy of HEAD only, no shell; the lead's scratchpad, the
   live tree, the transcripts and its memory do not exist inside — and a watcher on its output starts with it.
2. The lead writes its own plan in its scratchpad and, on a two-writer job, seals it (`second-plan.sh seal`)
   before it opens the other (`reveal`); anything that read the other's output before `reveal` voids the job,
   and `SEALS.log` records every step with its time and hash.
3. The audit — Sol and Fable, blind, side by side, one pass each, from the same brief. `second-plan.sh blind`
   puts the brief and the plan(s) — "A" and "B" in a random order, no model or effort named — in
   `<job>/blind/`; `second-plan.sh audit <job> <audit-brief> [effort]` runs Sol (`refuter.sh`) with the key,
   the originals and the transcripts denied, and `scripts/governance/fable-audit.sh <job> <audit-brief>
   high` runs Fable 5.2 read-only in the same walled box, at the same time. Each first writes, from the
   brief alone, the conditions and risks the job carries; then, for each plan, its errors, what it lacks
   (and on two plans, what one has that the other lacks), and what the brief needs that no plan meets. They
   may read the sources a claim rests on and write nothing into the plan.
4. The lead's plan is the base: it adds what the second plan brought, fixes what the audits found, checks
   each unmeasured claim at its source, and signs (`second-plan.sh sign`). An auditor down → the plan waits
   for it; a writer never audits.
5. **What he says yes to is what is recorded.** Nothing enters the plan, the row or the ledger after his
   yes; a later addition goes back to him first, marked as the writer's, with its reason.
6. **The measure:** the job folder keeps `sealed/` and both audits; one line per job goes into
   `.planning/quick/20261019-degerli-is-danisma/MEASURE.md` — what Fable's audit found that Sol's did not, and
   on a two-writer job what the second plan added — the minutes, the quota. After three or four jobs the
   lead tells him the table.

**A side study or a side task inside the talk** <!-- CEO-OK: side-study-offered-to-the-team-2026-10-14 -->:
when the plan rests on something still to be learned — a tool he sent, a measurement, the holding's own
side — or he hands over another task in the middle of the talk, the lead asks before starting, in one line:
*"Muhittin Bey, isterseniz bu işi şu an ekibe dağıtabilirim; biz konumuza devam ederiz."* On his yes,
`helper`s take it in parallel — how many and on what, the lead decides — and the talk goes on; what they
find comes back into the conversation and into the plan. The lead does not do it alone, one piece after
another, while he waits.

## 2. Effort — the session warns, he switches

The session runs at `high`: the talk, normal work, a normal plan, the build, the fixes, the tests. Only a
truly complex, important job — its plan and its work — runs at `xhigh`. `max` is not used
<!-- CEO-OK: effort-high-xhigh-no-max-2026-11-10 -->. The lead weighs the job and says it in one
line with its reason ("bu iş gerçekten karmaşık ve önemli, xhigh'da çalışıyorum, çünkü …"); his word on the level
overrides. **He
switches with /effort; the lead warns him — on every reply, until he has.**

- **The warning comes before the thinking** <!-- CEO-OK: plan-warning-before-the-thinking-2026-10-12 -->.
  The moment his message turns the talk to a plan, a design or an architecture — to plan, propose or
  evaluate one, not to ask a plain fact about what exists — the lead runs
  `python3 .claude/hooks/dxb-effort-warn.py plan` before it thinks about the substance; it answers with the
  live level and whether this reply opens with `⚠ Muhittin Bey, plan konuşmasındayız — /effort high'a geçin.`
  (not when he is already there). For a truly complex, important job the lead asks him in one line to switch
  to xhigh. Until he has switched, that reply does no plan, design or architecture
  thinking at all: the line, the plain facts he asked in a line or two, the wait, and no file. An
  architecture weighed at high and warned about at the end is the failure this exists for (2026-10-12). His
  plan permission mode starts the same warning by itself.
- In the reply that brings him the plan for his yes, the lead runs
  `python3 .claude/hooks/dxb-effort-warn.py build` and closes that reply with
  `⚠ Muhittin Bey, plan bitti — koda geçmeden /effort high'a geçin.` — the warning travels with the
  question, so his yes can arrive at high and the build starts at once. A yes that arrives at another
  level gets the line again, and nothing is written until he has switched; a correction instead of a yes
  → `plan` again. At the job's end: `python3 .claude/hooks/dxb-effort-warn.py off`.
- Between those, the hook `dxb-effort-warn.py` repeats the line on each of his messages until the
  session's live level matches. With no mode set, a message of his naming a plan, a design or an
  architecture tells the lead to decide first, before the thinking, and — when the reply would be plan work —
  to run `plan`, open with its line and stop; and a session whose level is not high reminds the lead to
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
| **Writing helper** | `helper-writer` (Fable 5.2 · `medium`) | writes and tests a piece the lead specified; fixes a Sol finding | commits; widens the piece <!-- CEO-OK: helpers-write-code-under-lead-verification-2026-10-03 --> |
| **Helper** | `helper` (Opus 5.5 · `medium`, read-only) | reads code or documents, measures, researches | writes |
| **Reader** | a one-shot `scout` or `Explore` | a wide search whose text would swell the lead's context | writes; is resumed (its cache dies at 5 min) |
| **Escalation writer** | `builder` (Fable 5.2 · `xhigh`), one-shot | only a piece that failed twice at `high` | is opened for a routine fix |
| **Second writer** | Opus 5.5, at the plan's level, its own process through `scripts/governance/second-plan.sh` <!-- CEO-OK: fable-audits-opus-second-writer-effort-by-weight-2026-11-09 --> | on an important or complex job, writes the same plan from the same brief, unseen (§1) | sees the lead's draft; audits; writes code |
| **Auditor** | GPT-6.1 Sol <!-- CEO-OK: auditor-sol-6-1-2026-10-01 -->, through `scripts/governance/refuter.sh` | one blind pass over the job's commits (§4); on a plan job, also the blind plan audit (§1) | writes; audits the same thing twice; sees the lead's reasoning or verdict |
| **Second auditor** | Fable 5.2 — `high` — through `scripts/governance/fable-audit.sh` <!-- CEO-OK: fable-audits-opus-second-writer-effort-by-weight-2026-11-09 --> | audits whatever Sol audits, from the same brief, at the same time, blind (§1, §4) | writes a plan or code; audits twice; sees Sol's findings or the lead's verdict |

`design-eye` is not a seat of this door. The second auditor finds and never writes.

**The arrangement — four, all equal**
<!-- CEO-OK: orchestration-three-arrangements-lead-chooses-2026-10-03 --> <!-- CEO-OK: four-equal-arrangements-lead-chooses-2026-10-08 -->:

| Arrangement | Who writes |
|---|---|
| **Lead** | the lead itself |
| **Fork** | the fork, while the lead stays free to verify |
| **Team** | `helper-writer`s at `medium`, each its own piece, in parallel; `helper`s read and research beside them; the lead at `high` directs them |
| **Hybrid** | the fork writes the core; `helper-writer`s the side pieces; `helper`s read |

After the plan is talked through and he says yes, the lead at `high` looks at the job and chooses
one of the four by its own judgement, and tells him in one line which and why. Writing itself is one of the
four, not the default.

- Parallel writers never touch the same file, and run their tests with `DXB_ENGINE_LOCK_WAIT=200`: one
  run at a time holds the construction engine, and with it a second one queues instead of being refused
  — inside the 4-minute rule (§7), so the lead starts no battery while writers are testing.
- Each writer gets a spec it can work from alone: the files, the
  behaviour, the measured facts it must not re-litigate, the test it writes first, what it reports.
- Whoever writes — lead, fork, `helper-writer`, `builder` — writes by the principles in
  `references/engineering-craft/codebase-design.md` and, before hand-over, checks only its own lines once
  against its 12 smells: fixed there, or named with a reason. No extra agent, no extra round; the lead
  never sends work back on a smell <!-- CEO-OK: ye18-pocock-skills-trimmed-for-both-2026-10-19 -->.
- The lead verifies each piece before it is committed — reads the diff, runs its tests — and commits
  only what it verified. Nobody else commits.
- A piece that fails: a medium writer's goes to the lead or a fork at `high`; one that failed twice at
  `high` goes to the `builder` at `xhigh`, never earlier. Eye-facing code, the look of a page or a screen, is
  written at `xhigh` <!-- CEO-OK: eye-facing-work-xhigh-max-studio-skills-2026-10-28 --> — `max` is not used
  <!-- CEO-OK: effort-high-xhigh-no-max-2026-11-10 -->. Code is written by Fable 5.2: the lead, its fork, the
  writing helper and the escalation writer <!-- CEO-OK: code-written-by-fable-5-2-2026-11-10 -->.

## 4. Sol and Fable — one blind pass each

Every job that changes code, a rule or a door gets one Sol pass and one Fable pass, side by side, after BUILD — the light lane (§1) excepted; a change to the records
alone (STATE, the board) is checked by the rulers on commit instead.

- **Launch:** `scripts/governance/refuter.sh [--effort medium|high|xhigh] "<brief>"` — `high` by
  default; `xhigh` for money, a database, security, approval, governance or the agents; `medium` for a
  text-only change. Fable at the same moment: `scripts/governance/fable-audit.sh <job> <brief-file>
  high` — the same brief; its findings take the same form and
  the same A/B/C. An audit can outlast the Bash tool's 10 minutes: launch each detached (a small
  script under `setsid nohup`, its output to the job folder, `EXIT=` on its last line) and wait for
  that line.
- **The brief — blind, not in the dark:** it opens like the plan's brief (the holding reminder, the line's
  mission and vision); his words verbatim; the plan's decisions as facts ("this door
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
  There is no second Sol round <!-- CEO-OK: sol-single-pass-fixes-by-helper-2026-10-03 -->. A ruler the
  audit shows wrong is corrected by the builder in its own `records(ruler): …` commit, never inside the
  build commit it measures <!-- CEO-OK: audit-law-checker-only-checks-2026-09-15 -->.
- **Dispute:** the lead runs the evidence Sol gave — it fails → real, fixed; it holds → the finding drops
  and the report says why. A question no test can settle is the lead's, with its reason in the report.
- **Sol unavailable** (quota, error, timeout): on an ordinary job the `refuter` subagent (Opus 5.5 ·
  `high`) audits once, and the report says *"audited by Opus instead of Sol — read-only by word, not by
  tool — because …"*; on money, a database or security the lead waits for Sol's window and works on
  something else. No job closes unaudited; the auditor is never swapped silently
  <!-- CEO-OK: fallback-auditor-named-and-refuter-second-round-gone-2026-10-04 -->.

## 5. Tests

- New behaviour is proven by a test written first — red before the code, green after. A test that can
  never go red — one that recomputes its expected value the way the code does — is a defect.
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
- **The row:** a job that advances a board row rewrites that row in the same commit — what finished becomes
  one dated note, `node scripts/board/note-done.mjs <ID> "<what finished>"`, never a story; what remains open
  stays; the row closes only when all of it is finished (`dxb-close-row`)
  <!-- CEO-OK: rows-keep-up-note-not-story-2026-10-09 -->. The commit's subject names the row in its scope —
  `type(B51 …): …` — and the records ruler's R6 stops the STATE commit while a row is behind work so named. A row left behind by
  another job's commit gets its note from that commit and its folder — measured, never guessed.
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

- **What the handover is for** <!-- CEO-OK: handover-is-for-long-jobs-2026-11-10 -->: the handover exists so that a
  long job goes on comfortably — the successor carries the same job forward with a fresh context, and nothing
  is lost. It never shortens the job, drops a part of it or ends it early. The context meter only informs.
- **The 4-minute rules** (held by `~/.claude/hooks/dxb-cost-gate.py`): a command over 4 minutes is the
  lead's; a subagent idle over 4 minutes is never resumed — its cache is the 5-minute one.
- **The context gate** (held by `~/.claude/hooks/dxb-context-gate.py`) and **the clean break**: from
  50 % used, hand over at the first clean break — the piece finished well, the tree committed, no
  battery running, the report sent — even when reaching it takes the session to about 60 %; never in
  the middle of a piece. The clean break and the quality decide, not the number; the lead judges it,
  helpers included <!-- CEO-OK: handover-at-the-clean-break-2026-10-06 -->. At 60 % the gate refuses
  the Agent tool: this session opens no new agent, finishes the piece in hand and hands over; the job
  continues in the successor in full.
- **The handover** is done by the engineer, never the CEO
  <!-- CEO-OK: handover-at-50-without-asking-2026-10-01 -->. A note in the scratchpad, in the author's
  own voice, whose first line tells the successor to open this door — `Skill("dxb-team3")` — before
  anything else: it carries the job on as its lead, the orchestrator, not as a fresh session
  <!-- CEO-OK: successor-opens-dxb-team2-2026-10-09 -->; then the job's place in the whole, then his words of this job verbatim, every phase with
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
  (`claude` is not on that terminal's PATH) → `operator shot`, read it → `operator key Return`. With his
  dictation on (status bar "Dikte açık"), the Return does not reach the terminal: `operator key ctrl+space`
  (dictation off) → `operator key Return` → `operator key ctrl+space` (on again), each checked on a shot
  <!-- CEO-OK: handover-dictation-off-enter-on-2026-11-09 -->.
  Proof it is alive: `ListAgents` shows it and it answers. If the job is in its plan phase, the
  successor's first reply carries the effort warning (§2).

## 8. The prompts for Fable 5.2 — the video's, in Anthropic's own wording

The system works by the prompts of the video he sent on 2026-11-10
<!-- CEO-OK: video-prompts-in-the-door-2026-11-10 -->; each is taken word for word from Anthropic's guide
for this model. The lead works by all four and puts the first two into every brief it gives a writing
seat, where "the user" is the lead.

1. **Prove it.**

   > Before you say it's done, run the tests and show me the output. If something is missing or broken,
   > tell me instead of working around it.

2. **Finish the whole task.**

   > Please avoid stopping while you still owe work the user asked for. Be persistent and do not stop
   > unless needed.
   >
   > While status notes are welcome, as is clarifying with the user on open decisions, carry on with work
   > that does not depend on the user's answer without unnecessary stops.
   >
   > If you notice yourself inviting the user to redirect you or offering to wait, instead proceed on the
   > next part of the task. You may meet ordinary obstacles like errors, timeouts, locked files, empty
   > results or failing tools. Diagnose them first, and when they are not real blockers, work through them
   > with the access you have (wait and retry, fix the request, use another tool or source) rather than
   > stopping unnecessarily.
   >
   > If someone clearly decided something is a hard blocker, such as a file marked not to be touched,
   > access that was intentionally withheld, or a safety guardrail, leave it alone, say plainly what you
   > found, and look for another safe way to finish the task. Stopping before the task is complete is very
   > rarely merited, as in when the task can't move forward without user input, or where the blocker is
   > deliberate and should not be worked past. This does not override the need for confirmation on risky
   > or destructive actions.

3. **Whose code it is** — for the lead and its fork; the lead reads the diff, not the summary.

   > This codebase is yours: what it's for and how it's built are your call, and you'll keep building on
   > it.

4. **Keep him informed.** The closing recap is the job report of §6.

   > Before you start, say in a line what you're about to do; brief updates while you work help the user
   > follow along. Close with a short recap that stands on its own (what you found, what you did, and
   > what's next), so a reader who only sees the last message has the full picture.
