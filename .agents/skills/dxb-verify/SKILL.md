---
name: dxb-verify
description: Use before claiming any DXB work is finished, fixed, passing or done — first prove each thing he asked for works by running it the way he will meet it, then run the checks the change's size needs, then report verified and unverifiable apart.
---

# Verify — does it work, and is it what he asked?

**Evidence before done.** A completion claim cites the command that was actually run and its
decisive output line, or the claim is not made. This is the CEO's oldest and hardest rule.

## 1. Does it do what he asked? — always first, every job

1. Write his request as one-line asks, in his words' sense, not the implementer's — and what he
   said must stay as it was.
2. Run each ask the way he will meet it: the command, the page, the API call, the tool, the file he
   opens. Cite the output that shows it working. Example, 2026-11-07: the dictation fix was proven
   by its log printing `enter: passed on, re-pressing` after his own Enter and his next sentence
   arriving — not by the code reading right.
3. Push once at the edge beside the ask: the key held down, the empty input, the second run, the
   other terminal.
4. An ask nobody ran is not done. Green tests prove the code, not the ask.

## 2. Did it break anything around it? — by the size of the change

At every size, each row of the table below that the change touches is run — the hook's rows run by
themselves, the author runs the rest by hand. The size changes only how far the tests reach:

- **Small** (the light lane, `dxb-team3` §1): the touched test, §1 above, the traps in §4.
- **Larger, or code changed:** `pnpm typecheck` then the battery — when and how: `dxb-team3` §5,
  their one owner.

The tests a change needs follow its risk: a targeted test for a local change, an integration test
at a boundary, a security check wherever authorisation, secrets or isolation move.

| What changed | Its ruler | Who runs it |
|---|---|---|
| Code | `pnpm typecheck` · `pnpm construction:battery` (both halves, the construction engine on port 54422; green is `BATTERY_GREEN`) | the author, per job (`dxb-team3` §5) |
| Records — STATE, the board, the ledger | `node --no-warnings tests/b43/records-truth.ts` · `pnpm verify:ledger` (every record agrees with what it claims, the live company database included) · parity (`dxb-close-row`) | the commit hook runs records-truth; `verify:ledger` by the author |
| A door, the core, the opening hook | `node --no-warnings tests/hooks/opening-budget.ts` · `bash scripts/governance/sync-codex-mirror.sh` (regenerates the auditor's copy; `--check` must pass) | the hook runs the budget; the mirror by the author |
| Research engine | `bash scripts/research-ruler.sh` · `tests/b46/` · `.agents/skills/dxb-research/scripts/accept.sh` (the live run, before claiming the engine works) | the hook runs the first two |
| A persona under the ruler's contract | `bash scripts/persona-ruler.sh` | the author — the hook does not |
| CEO-visible text | `bash scripts/i18n-purity-check.sh` (both locales at parity) | the author |
| His vitrin or its catalogue (`~/tools/h3/studio`) | `bash scripts/b43/vitrin-register-gate.sh` | the author, by hand — nothing calls it (measured 2026-11-07) |
| A CEO-visible surface | the design pass, door `dxb-surface` — a human eye, `⚠ UNVERIFIED` until his | the author |
| Anything | `gitleaks` | the commit hook, every commit |

Every class has its ruler, holding-wide — a runnable script, or for a surface the eye — and no
commit passes while a ruler the hook runs is red (his word, 2026-09-15
<!-- CEO-OK: ruler-table-holding-wide-2026-09-15 -->). The rulers print their own counts; a door
never copies them.

**Green on the parts you like is not green.**

## 3. Report — two tiers, never mixed in one sentence

- `✓ VERIFIED` — ask → command → output
- `⚠ UNVERIFIED` — with the reason it cannot be machine-checked

Anything you cannot observe yourself — through a terminal or your own `operator` screenshot — such
as how a voice sounds, a third-party service's state or his own use, is labelled
`⚠ UNVERIFIED — requires human-eye confirmation` and listed apart. What you observed is reported as
observed.

**A prediction is not a result.** "This should work" is a hypothesis and is written as one. Only
measured outcomes take the past tense.

**Green is the author's half, never acceptance** — only his own eye accepts (LAW B). Say what was
verified, what could not be, and what still waits for him.

## 4. Traps this project has already paid for

- **Runtime code is not shipped until a RUNNING resident service is restarted** in the same turn,
  and that restart is part of the evidence: a stale resident once answered the CEO with
  pre-session code. A stopped service stays stopped — `dxb-scheduler` and the company engine wait
  for the key turn <!-- CEO-OK: company-engine-stopped-until-the-key-turn-2026-10-14 -->, `dxb-jarvis`
  is stopped and disabled <!-- CEO-OK: dxb-verify-battery-and-restart-lines-2026-10-03 -->. Check
  `systemctl --user is-active <unit>` first; never start one in order to restart it.
- **Live-database tests must be state-independent.** A case that books "today" passes until the
  feature actually runs in production, then fails forever. Book a day the company will never live
  through, or fixture your own row.
- **A test that writes through a second connection escapes its own rolled-back transaction.** It
  once tripped the real budget brake and left €105 of fake spend on the CEO's board.
- **Piping a build into `head` kills it with SIGPIPE** and leaves a half-written build that a
  design pass will happily photograph.
- **A pipe swallows the verdict.** `check | tail -3 && commit` commits even when the check failed —
  a pipeline's exit status is the last command's. Run the check on its own line, read the output,
  then act on it.
- **A design pass that measured the login page reported PASS.** Assert the landed address and a
  non-empty heading before you believe a screenshot.

## 5. The second eye

One hand builds, another checks; the checker only checks (the audit law, `AGENTS.md` §2).
Who audits, when, at what depth and with which read-only tool — and the light lane that skips it —
has one owner: `dxb-team3` §4. The extra triggers (his acceptance session, a closing leg no machine
can check, a defect he caught → sweep its class) are in
`HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-AUDIT-TWIN.md` §4. A finding is evidence, never a verdict,
and an auditor's CONFIRMED is never an acceptance.

## 6. The perfection gate — RULE #0-B

A deliverable of the holding — a piece he will use, such as the dashboard's CRM section — ships
when a world-class specialist would sign it: the Ferrari of `AGENTS.md`, its structure
matching the CEO's mental model rather than the implementer's convenience. "It satisfies the spec
row" is not a defence; the spec is the floor, this is the ceiling. Small work — a fix, a record, a
one-line change — does not go through this gate (his word, 2026-09-24)
<!-- CEO-OK: h6-perfection-gate-for-deliverables-2026-09-24 -->. Full text:
`HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-PERFECTION-GATE.md`.
