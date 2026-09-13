---
name: dxb-close-row
description: Use when taking a row on the open work board from open to closed, or when new work appears that no row covers — the board's laws, what closing evidence must contain, and the ledger-parity rule that keeps records from drifting behind reality.
---

# Closing a row on the open work board

The board (`HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`) is the single answer to *"what is
left"*. Before it existed, that answer lived in six ledgers at once, and the CEO's measured
complaint was that the project *"advances in a mess and specs stay half-finished"*.

## Its laws are on the board itself

The board opens with its own five laws and the STATE-versus-EVENT rule that keeps records from
lying. **Read them there** — they are not repeated here, because a rule with two homes is a rule
that will one day say two different things. Laws 1 and 5 are enforced by `pnpm verify:ledger`.

What follows is the procedure the board does not carry.

## Closed by the author is not accepted by the CEO

**LAW B.** A row may reach `✓ evidenced` on the author's battery. It becomes **accepted** only
when the CEO has looked at it himself. Never write approved / accepted / onaylandı against his
name without an entry in `scripts/governance/ceo-approvals.json` carrying his own words and the
date — the battery fails on it.

Rows whose closing evidence has a leg the machine cannot check go to the audit twin first
(door `dxb-verify`), and then to him.

**AND SINCE 2026-08-27 THE MACHINE ENFORCES IT — his order, "1-KOY".** A board row written as
`✓ CLOSED` MUST carry `<!-- CEO-OK: <id> -->` naming a registered approval, or the battery goes
red. There is no second door and no "closed on evidence" exemption. The rule is
`scripts/governance/closure-guard.mjs`, the gate asks it, and
`tests/governance/no-closure-without-his-word.test.ts` calls the same function — each predicate
proven red by deleting it. **Why it exists:** that morning the author wiped the rented box on his
order, decided by himself that rows B09, B10 and B11 were void with it, and closed all three. B10
was never about the box. He caught it — *"BEN BUNU FARKETMESEM BOK GİBİ MAHVOLACAKTIK"* — and
nothing in the gate could have. **So: you do not close a row. He does.**

## Marking what you write, so the machine can check it

The board defines the STATE-versus-EVENT rule; this is how you satisfy it.

- A statement about what is true **now** carries `<!-- STATE: id = value @ date -->`, and its
  read-only query is registered in `scripts/governance/claims.json`. The gate refuses anything
  that is not a bare SELECT, and re-measures the value against the live company database on every
  run — so the number cannot go stale in silence.
- A statement about what happened **once** carries its date and `<!-- HISTORY -->`.
- A line declaring open work carries `<!-- OPEN: <row> -->` naming a live board row.
- A claim that the CEO approved something carries `<!-- CEO-OK: <id> -->` and an entry in
  `scripts/governance/ceo-approvals.json`.

An unmarked declaration fails the battery. The board itself is exempt — it *is* the register.

## What a closing entry contains

- what changed, and why
- the command and the decisive output line
- what could **not** be machine-checked, labelled and listed apart
- the registered adaptation written into the owning spec
- the boundary: what this row deliberately did **not** do

## A skipped contract is YOUR defect, not a discovery

**CEO ruling 2026-07-13.** If you find a spec contract that a ✓-closed row skipped, fix it
**immediately, in that same session**. *"Buldum — yapayım mı?"* is forbidden; the only acceptable
sentence is *"buldum, ve düzelttim"*. The CEO is never the one who has to order the fix.

The single exception: if the item belongs to a row that has not been reached yet, record it as a
boundary instead of jumping ahead — and say so out loud.

## When a CEO order contradicts a record

**LAW A.** The record goes. Not a footnote beside it, not "superseded but retained" — deleted,
and the report names what was deleted. Historical *facts* (who authored what, what a migration
did, an evidenced measurement with its date) are never rewritten; what gets deleted is a
**claim about the present** that his order has overturned.
