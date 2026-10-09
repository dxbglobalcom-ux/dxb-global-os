---
name: dxb-close-row
description: Use when taking a row on the open work board from open to closed — the board's laws, what closing evidence must contain, and the ledger-parity rule that keeps records from drifting behind reality.
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

**The machine enforces it (his order "1-KOY", 2026-08-27).** A board row written `✓ CLOSED`
carries `<!-- CEO-OK: <id> -->` naming a registered approval, or the battery goes red
(`scripts/governance/closure-guard.mjs`, `tests/governance/no-closure-without-his-word.test.ts`).
There is no "closed on evidence" exemption. You never close a row, including one whose premise
seems gone; he does.

## Marking what you write, so the machine can check it

The board defines the STATE-versus-EVENT rule; this is how you satisfy it.

- A statement about what is true **now** carries `<!-- STATE: id = value @ date -->`, and its
  read-only query is registered in `scripts/governance/claims.json`. The gate refuses anything
  that is not a bare SELECT, and re-measures the value against the live company database on every
  run — so the number cannot go stale in silence.
- A statement about what happened **once** carries its date and `<!-- HISTORY -->`.
- On a board row, a part that finished is ONE dated note — `✓ <date> — <what finished>`, written with
  `node scripts/board/note-done.mjs <ID> "<note>"` — never a story; the story may stay in the row's own file.
  The note's `✓ <date>` is its event mark: a HISTORY marker covers from its own line and cannot stand inside a
  table row, so the row carries the date and the row file's `## Done notes` is the dated record.
  A row closes only when ALL of it is finished, never on a part. The job that advances a row rewrites it in
  the same commit; the records ruler's R6 is red while a row is behind work committed under its id
  <!-- CEO-OK: rows-keep-up-note-not-story-2026-10-09 -->.
- An `<!-- OPEN: <row> -->` marker, where one is written, names a live board row. A board row is
  opened only on the CEO's word (board law 1).
- A claim that the CEO approved something carries `<!-- CEO-OK: <id> -->` and an entry in
  `scripts/governance/ceo-approvals.json`.

An unregistered approval claim fails the battery.

## What a closing entry contains

- what changed, and why
- the command and the decisive output line
- what could **not** be machine-checked, labelled and listed apart
- the registered adaptation written into the owning spec
- the boundary: what this row deliberately did **not** do

## A skipped contract

A defect found inside the job at hand is fixed in that job. A spec contract that a ✓-closed row
skipped, outside the job at hand, is told to the CEO with a recommendation, and he decides
(CEO, 2026-10-01).

## When a CEO order contradicts a record

**LAW A.** The record goes. Not a footnote beside it, not "superseded but retained" — deleted,
and the report names what was deleted. Historical *facts* (who authored what, what a migration
did, an evidenced measurement with its date) are never rewritten; what gets deleted is a
**claim about the present** that his order has overturned.
