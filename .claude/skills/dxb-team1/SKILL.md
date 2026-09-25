---
name: dxb-team1
description: Use when the CEO hands the construction a job to run as a team — a Fable 5.1 lead splits it into lanes and picks each lane's effort, up to three Opus 5.5 writers build at once (medium or max by difficulty), a fresh Opus 5.5 verifier at high checks the result, escalation to xhigh then max only on a problem, and the lead gives the final judgment. Trigger `/dxb-team1 <the job in one sentence>`.
---

# The team — one lead, parallel writers, a fresh verifier

**Where it came from.** 2026-09-25: the CEO drew the shape himself and ordered a second
orchestrator beside `dxb-crew`, which stays untouched (*"dxb-crew üzerinde oynama yapma o kalsın
bazen onu kullanırız"*). <!-- CEO-OK: dxb-team1-ordered-2026-09-25 --> His word on the writers'
effort the same night: *"işin zorluk seviyesine göre ya max'li opus 5.5'e ya da mediumlu opus 5.5'e
ver"* — the lead decides per lane, by difficulty, not a size envelope.
<!-- CEO-OK: dxb-team1-effort-by-difficulty-2026-09-25 --> Build order: *"tmmdır dxb-team1
yapılsın"*. <!-- CEO-OK: dxb-team1-build-order-2026-09-25 --> **This is the construction's default
door** — his word 2026-09-26 after the first live run: *"önerini kabul ediorum varsayılan kapı dxb-team1
olsun."* <!-- CEO-OK: dxb-team1-default-door-2026-09-26 --> `dxb-crew` stays for a single-lane job. The laws this door obeys are in
`.claude/CLAUDE.md`; the doors it opens are `dxb-verify`, `dxb-close-row`, `dxb-ceo-report`.

## 1. The shape — his diagram

```
                 FABLE 5.1 — the lead (this session)
                 splits the job into lanes · picks each lane's effort · writes the done-list first
                          │
          ┌───────────────┼───────────────┐
      Opus 5.5         Opus 5.5        Opus 5.5        ← up to three writers, AT ONCE,
      medium           max             medium            each in its own lane
          └───────────────┼───────────────┘
                     the diff
                          │
                 Opus 5.5 · high — a FRESH verifier (has seen nothing of the writers)
                          │
                     a problem?
                    /            \
                  NO              YES → Opus 5.5 · xhigh, a second look at that finding only
                   │                    still unclear → Opus 5.5 · max, the last look
                   ▼
                 FABLE 5.1 — final judgment: re-measures every number itself, commits, reports
```

## 2. Seats

| Seat | Model · effort · agent | Does | Never |
|---|---|---|---|
| **Lead** | Fable 5.1, the session | splits the job into ≤ 3 lanes with disjoint file sets; picks each lane's effort (§3); writes the done-list before the writers start; hands every code change to a writer; re-measures every number with its own commands; rules ACCEPT / REJECT; commits per phase; reports | writes a code file (the gate refuses it); asks the CEO what to do |
| **Writer, medium** | Opus 5.5 · `medium` · `builder-medium` | the lane the lead judged not hard | a guarded path (money, approval, database, security, governance, hooks / agents / skills — the gate refuses); the full battery; commits |
| **Writer, max** | Opus 5.5 · `max` · `builder` | the hard lane, and every fix of a confirmed A finding | the full battery; commits |
| **Verifier** | Opus 5.5 · `high` · `verifier` | fresh: receives only the diff, the done-list and the lane list; runs the list itself; sorts findings A / B / C | writes; sees a writer's summary, assumptions or transcript |
| **Second look** | Opus 5.5 · `xhigh` · `refuter` | only on an A finding; re-checks that A list, nothing else | a new hunt |
| **Last look** | Opus 5.5 · `max` · `arbiter` | only when verifier and refuter disagree, or neither found the cause; read-only ruling: real or not · cause · the narrowest fix spec | writes; any other call |

Every seat below the lead is a subagent of the lead's session, never a separate session: a subagent
carries its effort in its own file, the gate sees its name, its reading never enters the lead's
context, and a session opened by hand inherits nothing of the job. No seat below the lead has the
`Agent` tool. The `refuter` and `builder` seats are the ones `dxb-crew` already owns; `builder-medium`,
`verifier` and `arbiter` are this door's, in `~/.claude/agents/`.

## 3. The effort picker — the lead's rule, per lane

From Anthropic's official effort page (read 2026-09-25: Opus 5.5 defaults to `medium`; *"run an
effort sweep on your own evals rather than carrying settings over"*) and the T8 measurement of
2026-09-24 (a one-file fix: `medium` equal to `max` at 5.6× less; a two-file fix: `max` better):

- **`medium`** — the spec is fully written, the path is known, no new design decision, one or two
  files, no guarded path. Anthropic's row: *"agentic tasks that require a balance of speed, cost,
  and performance."*
- **`max`** — a new design, cross-cutting change, more than two files, a guarded path, an unknown
  cause, or a piece that already fell once at `medium`. Anthropic's row: *"the deepest possible
  reasoning."*
- **Unsure → `max`.** Cheap on the wrong side costs a second round.
- **Verification** — first look `high` (Anthropic: *"complex reasoning, difficult coding problems"*,
  *"often the best balance of quality and token efficiency"*); second look `xhigh` (*"exploratory
  tasks such as repeated tool calling"*); last look `max` (*"reserve for frontier problems"*).
  The gate holds the line mechanically: `builder-medium` never writes a guarded path; the size of
  a medium lane is the lead's call, not a rule.

## 4. The loop

```
INTAKE   → the job in ONE sentence, provable by measurement; the CEO's words verbatim;
           what is his and untouchable.
SPLIT    → ≤ 3 lanes; file sets never overlap (overlap → one writer; measured: the same job
           $5.67 on one writer, $11.99 split three ways when the parts were not independent);
           one effort per lane (§3); the done-list per lane and for the whole — numbered,
           each item a command and its expected output — written BEFORE the writers start.
BUILD    → the writers are opened in ONE message, in parallel; each carries the full brief
           (goal · its files · what it may change · what it must verify · what it must not do ·
           output format · who reads it · what is already known); each runs only its lane's
           tests, never the full battery (two batteries on one engine measure each other).
VERIFY   → the fresh verifier: diff + done-list + lane list, nothing from the writers.
           A — blocks · B — the lane's writer repairs it now · C — older than this work → a
           board row through `dxb-close-row`.
ESCALATE → an A finding → `refuter` (xhigh) re-checks that A list only.
           agreed → `builder` (max) writes the fix → verifier round 2, A list only.
           disagreed or cause unknown → `arbiter` (max) rules; its ruling is final for the machine.
           Two verifier rounds; an A still open after round 2 goes to the CEO with its reason.
JUDGE    → the lead re-measures every number itself, runs the battery ONCE, measures the
           dependants again; ACCEPT → one commit per phase; REJECT → back with file:line + scenario.
TELL     → the CEO, `dxb-ceo-report` shape: the position first, then the result; never a question.
RECORD   → STATE (the contradicted sentence goes, LAW A), the board row, evidence with a dated
           note, rulers green. A phase whose record is behind reality is not finished.
```

## 5. Taken from `dxb-crew` on his word (2026-09-25) — one sentence each; the text lives there

- **§0** — what he says is done by the engineers through `operator`; he is never told to type or click.
- **§1** — the A / B / C definitions, and his law of 2026-09-22 that a minor finding is repaired in
  the same pass, never in a round of its own.
- **§3** — the context gate: read the bar (`dxb-ctx --pct`, else `operator shot`), never guess it;
  hand over at ≥ 50 % used, or when used + the next phase's honest estimate > 55 % (his numbers
  2026-09-26, held by the B59 hook); only at a clean
  break, never mid-phase.
- **§4** — the handover, done by the engineer through `operator`, exactly as written there, with one
  difference: the successor is opened as `--model claude-fable-5-1`. **The note's first line is the
  job's place in the whole** — which leg of the Ferrari, where this job sits in it, what changes
  when it is done (his order 2026-09-25: a successor must never think it is building a small part
  of a wheel hub without the car in view).
- **§5** while he is away, **§6** the traps already paid for.

## 6. Measurements owed — the first jobs pay them

- The same diff verified twice, at `high` and at `xhigh`: findings, A / B / C split, time, cost
  side by side. That number decides whether the second look keeps its level.
- The same lane written twice, once by a subagent and once by a separate session, both read by the
  fresh verifier against the same done-list. That number decides the seat, not an opinion.
- Cost and time of the first team job beside `dxb-crew`'s last measured phase.
