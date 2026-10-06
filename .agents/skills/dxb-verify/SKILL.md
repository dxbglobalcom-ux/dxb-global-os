---
name: dxb-verify
description: Use before claiming any DXB work is finished, fixed, passing or done — the full check battery, what counts as green, and the two-tier reporting rule that separates verified from unverifiable.
---

# The battery — what "done" is allowed to mean

**Evidence before done.** A completion claim cites the command that was actually run and its
decisive output line, or the claim is forbidden. This is the CEO's oldest and hardest rule.

**Two tiers, never mixed in one sentence:**

- `✓ VERIFIED` — command → output
- `⚠ UNVERIFIED` — with the reason it cannot be machine-checked

Anything you cannot observe yourself — through a terminal or your own `operator` screenshot — such
as how a voice sounds or a third-party service's state, is labelled
`⚠ UNVERIFIED — requires human-eye confirmation` and listed separately. What you observed is
reported as observed; it is not accepted until his eye (LAW B).

**A prediction is not a result.** "This should work" is a hypothesis and is written as one. Only
measured outcomes take the past tense.

## Run these, in this order

| Check | What it proves |
|---|---|
| `pnpm construction:battery` (vitest, both halves — the sandboxed and the host one; `BATTERY_GREEN`) — when code changed, once at the end of the job (`dxb-team2` §5); a text-only change is held by the rulers below and the commit hook | behaviour, against the construction site's own engine (`DxB_Build`, port 54422) |
| `bash scripts/research-ruler.sh` | only when the research engine changed — the commit hook runs it by itself; `accept.sh` is the live half and is run before a claim that the engine works |
| `bash scripts/persona-ruler.sh` | only when a persona under the ruler's contract changed — the writing and the doctrine of those seats, by the one metre the battery case (`tests/personas/persona-ruler.test.ts`) and the DB gate (`scripts/sync-personas-to-db.sh`) both run |
| `pnpm typecheck` (`tsc --build`) | the interfaces still hold |
| `pnpm verify:ledger` | the records still agree with the live company database |
| `bash scripts/i18n-purity-check.sh` | both locales at parity, no leakage either way |
| `gitleaks detect` | no secret entered history |
| `bash scripts/b43/vitrin-register-gate.sh` | the product register the CEO opens — his vitrin and its catalogue (`~/tools/h3/studio`, outside git) — still tells the truth: every cast face names how it was born, no cancelled hand is advertised, no pointer into a folder he deleted, no acceptance claim without a registered ledger id, no media the page shows and the disk lacks, no hand-typed counter, and the page is served to him alone (loopback). Self-skips where there is no vitrin; run by the shared studio battery since W11 |
| the design pass (door `dxb-surface`) | only when a CEO-visible surface changed |
| resident restart | only when runtime code changed — see below |
| **the audit law** (CEO, 2026-09-15: *"Tabii ki yazılsın, tabii ki."* <!-- CEO-OK: audit-law-checker-only-checks-2026-09-15 -->) | Every job is built by one hand and checked by another — in `dxb-team2` the blind Sol auditor (§4) — *"biri bir iş yaparken birisi kontrol edecek çünkü hata oluyor"*. **The checker only checks:** it measures, names the fault, and instructs what is to be done; the builder corrects it and reports "done"; whether it was done and done right is re-measured — in `dxb-team2` by the lead, on each finding's own case, with no second auditor round (its §4). The checker writes NO repo line — ruler scripts included: a ruler correction is an instruction to the builder, committed by the builder as its own `records(ruler): …` commit, never inside the build commit it measures. A checker that repairs what it then measures is not a checker. A checker's CONFIRMED is never an acceptance — only his own eye is (LAW B). |

The tests a change needs follow its risk: a targeted test for a local change, an integration test at
a boundary, a security check wherever authorisation, secrets or isolation move.

| Artifact class | Its ruler (runnable, shared by builder and checker) | State today |
|---|---|---|
| Code | `pnpm typecheck` + the battery (vitest, both halves) · i18n-purity-check · verify:ledger · gitleaks | typecheck and the battery once at a job's end when code changed (`dxb-team2` §5); gitleaks on every commit; the typecheck does not cover `tests/` or `db/seed/` (measured 2026-10-06) |
| Persona files | `tests/personas/persona-ruler.test.ts` (`scripts/persona-ruler.sh`) | built in this commit |
| Records (STATE, the board, ceo-approvals) | `scripts/governance/ledger-truth.mjs` + `tests/b43/records-truth.ts` (a record may not say his eye is awaited on what the ledger holds accepted; a new acceptance adds its row there or R4 is red) + records parity (`dxb-close-row`) | exists |
| CEO-visible surfaces | eye test + Design Pass (RULE #0) — a human eye, not a script; reported ⚠ UNVERIFIED until his eye | exists, not a script |
| Research engine (`.agents/skills/dxb-research`) | `bash scripts/research-ruler.sh` (11 rules) + `tests/b46/` (47 cases on the real scripts) + `bash .agents/skills/dxb-research/scripts/accept.sh` (a live run, judged from the files) | built 2026-09-17; the ruler runs on every commit that touches the engine |

The table is his, holding-wide, on his word *"yaz"* of 2026-09-15 <!-- CEO-OK: ruler-table-holding-wide-2026-09-15 -->.

Every commit runs gitleaks and, for what it touches, the rulers of the records, the opening and the research engine automatically — no ruler green, no commit (`scripts/hooks/pre-commit`). Code's ruler — the typecheck and the battery — runs once at a job's end, not on each commit.

A second session audits the CEO-visible and the risky work (personas, specs, money and identity
paths, surfaces) on three things: the order against the diff (what was left out), the ruler output
pasted into the evidence, and the blast radius measured.

**Green on the parts you like is not green.**

## Traps this project has already paid for

- **Shipping runtime code is not shipping until the resident services are restarted** in the same
  turn (`systemctl --user restart dxb-scheduler`; `dxb-jarvis` is stopped and disabled and is not
  started <!-- CEO-OK: dxb-verify-battery-and-restart-lines-2026-10-03 -->), and that restart is part
  of the evidence. A stale resident silently answered the CEO with pre-session code once.
- **Live-database tests must be state-independent.** A case that books "today" passes until the
  feature actually runs in production, then fails forever. Book a day the company will never live
  through, or fixture your own row.
- **A test that writes through a second connection escapes its own rolled-back transaction.** It
  once tripped the real budget brake and left €105 of fake spend on the CEO's board.
- **Piping a build into `head` kills it with SIGPIPE** and leaves a half-written build that a
  design pass will happily photograph.
- **A pipe swallows the verdict.** `check | tail -3 && commit` commits even when the check failed —
  a pipeline's exit status is the LAST command's, and `tail` always succeeds. Measured on
  2026-07-31: a record went in while its own gate was red. Run the check on its own line, read the
  output, and only then act on it.
- **A design pass that measured the login page reported PASS.** Assert the landed address and a
  non-empty heading before you believe a screenshot.

## The audit twin — when a second pair of eyes is required

An independent agent is handed a **claim plus where to measure it** — never the author's
conclusion — and told to **refute** it. It is read-only **by tool**, never by promise: a Claude
agent limited to reading and searching, or the Codex refuter — launched **only** through
`scripts/governance/refuter.sh` (gpt-6.1-sol; the lead chooses its effort with `--effort`, `high` when not given — dxb-team2 §4), which
pins the read-only profile and refuses to run without it. Calling `codex` directly for an audit
puts the promise back and takes the tool away: the base config runs unrestricted, measured
2026-08-16. `refuter.sh --proof` re-prints the evidence that it cannot write. It may run
measuring commands, never a writing command, and never a test suite (the suites write; the
author runs them and hands over the whole raw output). It queries the construction engine
itself through its one tool `sql_read` as the read-only role `sol_reader` (never the company's —
refused by identity), so database evidence is gathered by the auditor's hand, not handed over. Record the audit-trail row counts before and after; a difference invalidates the audit.

It fires once on **every construction job** that changes code, a rule or a door — a change to the
records alone is held by the commit rulers — at the depth the lead chooses (dxb-team2 §4); the
author never approves his
own work (CEO 2026-09-28 <!-- CEO-OK: audit-twin-every-job-2026-09-28 -->; the procedure is
`dxb-team2`). It also fires on the acceptance session, on a row whose closing evidence has a leg
the machine cannot check, and on a defect the CEO caught — then it sweeps the **class**.

**A finding is evidence, never a verdict.** The session author signs every ✓. A disputed finding
is settled inside the team (`dxb-team2` §4 DISPUTE): a test decides; where no test can, the lead
decides and records why; the lead has the last word. What no terminal can observe stays `⚠ UNVERIFIED`.

Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-AUDIT-TWIN.md`.

## The perfection gate — RULE #0-B

A deliverable of the holding — a piece he will use, such as the dashboard's CRM section — is held
to the standard of `AGENTS.md`: the Ferrari, a first-place candidate in a world
competition. It ships when a world-class specialist would sign it, its structure matches the
CEO's mental model rather than the implementer's convenience. Small work — a fix, a record, a one-line change — does not go through this gate
(his word, 2026-09-24). <!-- CEO-OK: h6-perfection-gate-for-deliverables-2026-09-24 -->

"It satisfies the spec row" is not a defence. The spec is the floor; this gate is the ceiling
check. Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-PERFECTION-GATE.md`.

## And then

Green is the author's half. **It is not acceptance** — only the CEO's own eye accepts (LAW B in
the always-on core). Say what was verified, what could not be, and what still waits for him.
