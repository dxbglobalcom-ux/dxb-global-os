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
2. **What this holding IS** — the core carries it in short. Open the long form
   (`MASTER_PLAN.md` §1 · `HOLDING_OS_PRODUCT_SPEC.md` §§2-4 · `00-CEO-DIRECTIVE-BEKLENTILER.md`)
   when the work touches what the product is, what it must never resemble, or the CEO's 19 control
   areas — those three are exempt from the "do not read other specs" rule below.
3. `.planning/STATE.md` — the current photo. **One page. If it has grown into a history again,
   that is a defect: move the history to `.planning/STATE-ARCHIVE.md` in the same turn.**
4. `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` — what is open, and only that
5. The spec that owns the row you are taking — reached from the row itself, not by browsing
6. `HOLDING-OS-MASTER-PLAN/00-INDEX.md` — **only** when you need the registered-adaptation table
   (a deferral or deviation), or the corpus map. It is a ledger, not an orientation document.
7. Only the code, tests, schemas and references that row needs

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

## The working discipline

- Root cause before fix; an obstacle is the start of the work (standing order 12).
- New code is proven by a test that failed before it existed.
- Nothing is called done before `dxb-verify` maps every criterion to a command and its output.
- Every repo line is the session author's, inline (`.claude/CLAUDE.md` §2). Subagents audit and
  sweep; they never write. When a second pair of eyes is required: `dxb-verify` § The audit twin.

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

**No handover prompt is written here, or anywhere, unless he asks for one in that session.**
<!-- CEO-OK: handover-prompt-only-on-his-session-request-2026-09-15 --> His ruling of
2026-09-15: a handover prompt is not a global or standing rule — he asks for one in the session
that needs it, and otherwise there is none. The next session starts from `.planning/STATE.md`,
which this phase has just made true; that is the handover. When he does ask, it is written in
English in the author's own voice, and he is quoted only from `scripts/governance/ceo-approvals.json`
— never composed in his first person. Measured 2026-09-15 (audit F016, F017, F054): three such
files existed, all speaking as him, and STATE ordered the next session to write another.

## Choosing the row

Order of work is the CEO's: **this board, oldest first — half-finished older work outranks new
work.** If he has named a focus for the session, that focus outranks the board order.
