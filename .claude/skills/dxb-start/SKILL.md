---
name: dxb-start
description: Use at the beginning of any DXB session, and whenever picking up a new piece of work — establishes the read order, what NOT to read, how to choose the row, and the phase gates from onboarding to state handoff.
---

# Starting work on DXB

The CEO's standing complaint is *"her gelen model bir şeyleri atlıyor mutlaka"*. Two causes were
measured on 2026-07-30: sessions began by reading ~170 pages of scattered, partly contradictory
text, and no document said which source outranked which. The core file fixed the second. This
door fixes the first: **read the smallest set that lets you act correctly, then expand only where
a dependency or a contradiction forces you to.**

## Phase 0 — onboarding (read-only, nothing is edited)

Read in this order and stop when you can state the work:

1. The always-on core — `.claude/CLAUDE.md` (already loaded)
2. `.planning/STATE.md` — the current photo. **One page. If it has grown into a history again,
   that is a defect: move the history to `.planning/STATE-ARCHIVE.md` in the same turn.**
3. `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` — what is open, and only that
4. The spec that owns the row you are taking — reached from the row itself, not by browsing
5. `HOLDING-OS-MASTER-PLAN/00-INDEX.md` — **only** when you need the registered-adaptation table
   (a deferral or deviation), or the corpus map. It is a ledger, not an orientation document.
6. Only the code, tests, schemas and references that row needs

**Do not** read the whole repository, the archive, other specs, other rows' research, or the
rival reports unless the row names them. `.planning/STATE-ARCHIVE.md` and `_ARCHIVE/` are history:
open them to answer *"why was this decided"*, never to learn the current state.

## Phase 1 — the understanding report

Before proposing anything, state in the CEO's language:

- what the row asks for, and what it explicitly excludes
- which parts of the system it touches
- what contradicts what, across documents and code
- the real unknowns that could change the plan
- what you will measure to prove it done

No generic software advice, no restating documents.

## Phase 2 — approval

The CEO approves the plan before any file changes. The plan states scope, the surfaces and files
affected, ordered steps, data and interface effects, migration and rollback where relevant, how
it will be verified, and the risks. **This gate cannot be inferred away.**

## The process skill comes before the work — STANDING ORDER 11

**CEO order 2026-07-24.** Every session on this project works through the superpowers process
skills, and the matching one is invoked **before** the work, not after it goes wrong:

| Situation | Skill |
|---|---|
| any defect, test failure or unexpected behaviour | `systematic-debugging` — root cause before fix |
| a written plan to carry out | `executing-plans` |
| new code | `test-driven-development` — red before green |
| about to say something is done | `verification-before-completion` |
| a new feature or a change in behaviour | `brainstorming` first, then the implementation skills |

**Excluded: `subagent-driven-development` and agent dispatch for authorship** — every repo line is
the session author's, written inline (K1). Subagents audit and sweep; they never write. The two
required subagent uses are in door `dxb-verify`.

Full text: `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md`, standing order 11.

## Phase 3 — implementation

Approved scope only, completely. No stubs, no placeholders, no silent narrowing and no silent
widening. Routine engineering judgement is yours. Stop and report only when a discovery would
materially change scope, architecture, security, data integrity or the outcome.

Match the surrounding code — its naming, structure, comment density, error handling and idiom.

## Phase 4 — verification

Open `dxb-verify`. Every acceptance criterion maps to evidence. Risk-proportional: targeted tests
for a local change, integration tests at a boundary, security checks wherever authorisation,
secrets or isolation move, a design pass for anything the CEO sees.

## Phase 5 — records, in the SAME session

- the board row closes with its evidence, or its remaining leg is named
- `.planning/STATE.md` becomes true again
- the owning spec carries the registered adaptation
- nothing is left claiming a state the system contradicts

A turn that changed the system and left its record stale is not finished.

## Before ending any turn, answer in writing

**measured? · complete? · recorded? · verified (command → output)?**

## Choosing the row

Order of work is the CEO's: **this board, oldest first — half-finished older work outranks new
work.** If he has named a focus for the session, that focus outranks the board order.
