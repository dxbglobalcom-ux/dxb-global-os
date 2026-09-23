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

Anything outside a terminal's observation — how a page renders, an external dashboard, a
third-party service's state, how a voice sounds — can **never** be reported as done. It is
labelled `⚠ UNVERIFIED — requires human-eye confirmation` and listed separately.

**A prediction is not a result.** "This should work" is a hypothesis and is written as one. Only
measured outcomes take the past tense.

## Run these, in this order

| Check | What it proves |
|---|---|
| `pnpm test` (vitest) | behaviour, against the construction site's own engine (`DxB_Build`, port 54422) |
| `bash scripts/research-ruler.sh` | only when the research engine changed — the commit hook runs it by itself; `accept.sh` is the live half and is run before a claim that the engine works |
| `bash scripts/persona-ruler.sh` | only when a persona under the ruler's contract changed — the writing and the doctrine of those seats, by the one metre the battery case (`tests/personas/persona-ruler.test.ts`) and the DB gate (`scripts/sync-personas-to-db.sh`) both run |
| `pnpm typecheck` (`tsc --build`) | the interfaces still hold |
| `pnpm verify:ledger` | the records still agree with the live company database |
| `bash scripts/i18n-purity-check.sh` | both locales at parity, no leakage either way |
| `gitleaks detect` | no secret entered history |
| `bash scripts/b43/vitrin-register-gate.sh` | the product register the CEO opens — his vitrin and its catalogue (`~/tools/h3/studio`, outside git) — still tells the truth: every cast face names how it was born, no cancelled hand is advertised, no pointer into a folder he deleted, no acceptance claim without a registered ledger id, no media the page shows and the disk lacks, no hand-typed counter, and the page is served to him alone (loopback). Self-skips where there is no vitrin; run by the shared studio battery since W11 |
| the design pass (door `dxb-surface`) | only when a CEO-visible surface changed |
| resident restart | only when runtime code changed — see below |
| **the ruler rule** (CEO, 2026-09-15: *"kural olsun"* <!-- CEO-OK: audit-ruler-is-a-runnable-script-2026-09-15 -->) | Every audit's ruler is a runnable script, handed to the builder before the work; the order is that script's PASS; builder and checker run the same script and paste its output into the evidence. |
| **the audit law** (CEO, 2026-09-15: *"Tabii ki yazılsın, tabii ki."* <!-- CEO-OK: audit-law-checker-only-checks-2026-09-15 -->) | Every job on the open board is built by one session and checked by a second — *"biri bir iş yaparken birisi kontrol edecek çünkü hata oluyor"*. **The checker only checks:** it measures, names the fault, and instructs what is to be done; the builder corrects it and reports "done"; the checker re-measures whether it was done and done right. The checker writes NO repo line — ruler scripts included: a ruler correction is an instruction to the builder, committed by the builder as its own `records(ruler): …` commit, never inside the build commit it measures. A checker that repairs what it then measures is not a checker. A checker's CONFIRMED is never an acceptance — only his own eye is (LAW B). |

| Artifact class | Its ruler (runnable, shared by builder and checker) | State today |
|---|---|---|
| Code | the battery: typecheck · vitest · i18n-purity-check · verify:ledger · gitleaks | exists, runs on every commit |
| Persona files | `tests/personas/persona-ruler.test.ts` (`scripts/persona-ruler.sh`) | built in this commit |
| Records (STATE, the board, ceo-approvals) | `scripts/governance/ledger-truth.mjs` + `tests/b43/records-truth.ts` (a record may not say his eye is awaited on what the ledger holds accepted; a new acceptance adds its row there or R4 is red) + records parity (`dxb-close-row`) | exists |
| CEO-visible surfaces | eye test + Design Pass (RULE #0) — a human eye, not a script; reported ⚠ UNVERIFIED until his eye | exists, not a script |
| Research engine (`.agents/skills/dxb-research`) | `bash scripts/research-ruler.sh` (11 rules) + `tests/b46/` (47 cases on the real scripts) + `bash .agents/skills/dxb-research/scripts/accept.sh` (a live run, judged from the files) | built 2026-09-17; the ruler runs on every commit that touches the engine |
| Specs / plan text | none yet — the ruler is written before the work, or the work is reported ⚠ UNVERIFIED | gap, named |

The table is his, holding-wide, on his word *"yaz"* of 2026-09-15 <!-- CEO-OK: ruler-table-holding-wide-2026-09-15 -->.

Every commit runs its class's ruler automatically — no ruler green, no commit.

A second session audits the CEO-visible and the risky work (personas, specs, money and identity
paths, surfaces) on three things: the order against the diff (what was left out), the ruler output
pasted into the evidence, and the blast radius measured; a class with no ruler gets its ruler first.

**Green on the parts you like is not green.** Skipping any applicable check is a governance
violation of the same tier as an invented number.

## Traps this project has already paid for

- **Shipping runtime code is not shipping until the resident services are restarted** in the same
  turn (`systemctl --user restart dxb-scheduler dxb-jarvis`), and that restart is part of the
  evidence. A stale resident silently answered the CEO with pre-session code once.
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
`scripts/governance/refuter.sh` (default gpt-5.6-sol at high, `--55` for gpt-5.5 at xhigh), which
pins the read-only profile and refuses to run without it. Calling `codex` directly for an audit
puts the promise back and takes the tool away: the base config runs unrestricted, measured
2026-08-16. `refuter.sh --proof` re-prints the evidence that it cannot write. It may run
measuring commands, never a writing command, and never a test suite (fixtures seed the live
database). Record the audit-trail row counts before and after; a difference invalidates the audit.

It fires on exactly three triggers, never per run and never per commit:

1. the CEO acceptance session — cross-model, because a Claude auditing a Claude shares its blind spots
2. a row whose closing evidence has a leg the machine cannot check
3. a defect the CEO caught — then sweep the **class** across the repository, not the instance

**A finding is evidence, never a verdict.** The session author signs every ✓. When auditor and
author disagree and neither can prove it, the claim drops to `⚠ UNVERIFIED` rather than staying ✓.
Anything machine-catchable the twin finds is recorded as the author's own defect.

Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-AUDIT-TWIN.md`.

## The perfection gate — RULE #0-B

Before anything ships, answer three questions in writing and act on the answers:

1. **Is this perfect** — would a world-class specialist sign it?
2. **Is this logical** — does the structure match the CEO's mental model, not the implementer's convenience?
3. **Could it be better** — name the concrete better version. Build it now if it is in scope;
   record it as a boundary if it is not.

"It satisfies the spec row" is not a defence. The spec is the floor; this gate is the ceiling
check. Full text: `HOLDING-OS-MASTER-PLAN/00-CEO-DIRECTIVE-PERFECTION-GATE.md`.

## And then

Green is the author's half. **It is not acceptance** — only the CEO's own eye accepts (LAW B in
the always-on core). Say what was verified, what could not be, and what still waits for him.
