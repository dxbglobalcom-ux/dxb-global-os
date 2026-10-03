---
name: dxb-start
description: Use when the CEO asks you to learn the holding — "holdingi tanı", "dolapları ve çekmeceleri bil", "ne nerede" — or before you orient in a part of it you do not know. The smallest read that lets you act, what NOT to read, and where things are. A job itself runs through dxb-team2.
---

# Learning the holding — the smallest read

The CEO's standing complaint is *"her gelen model bir şeyleri atlıyor mutlaka"*. Two causes were
measured on 2026-07-30: sessions began by reading ~170 pages of scattered, partly contradictory
text, and no document said which source outranked which. The core file fixed the second. This
door fixes the first: **read the smallest set that lets you act correctly, then expand only where
a dependency or a contradiction forces you to.**

It is the door a session opens when he says *learn the holding, know the cupboards and drawers*
(2026-09-04, 2026-10-03). Since 2026-10-03 it holds only that <!-- CEO-OK: dxb-start-slimmed-2026-10-03 -->;
the rules of a job — understanding it, the plan's contents, root cause and the red test first —
live in `dxb-team2`, which every job opens. The position (STATE's three headings) and the cupboard
are already in the opening: never re-read them.

## The read order — stop when you can state the work

1. The always-on core — `AGENTS.md` (already loaded)
2. **What this holding IS** — the core carries it in short. Open the long form
   (`MASTER_PLAN.md` §1 · `HOLDING_OS_PRODUCT_SPEC.md` §§2-4 · `00-CEO-DIRECTIVE-BEKLENTILER.md`)
   when the work touches what the product is, what it must never resemble, or the CEO's 19 control
   areas — those three are exempt from the "do not read other specs" rule below.
3. `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md` — what is open, and only that; its own first
   lines say which row comes first
4. The spec that owns the row you are taking — reached from the row itself, not by browsing
5. `HOLDING-OS-MASTER-PLAN/00-INDEX.md` — **only** when you need the registered-adaptation table
   (a deferral or deviation), or the corpus map. It is a ledger, not an orientation document.
6. Only the code, tests, schemas and references that row needs

**Do not** read the whole repository, the archive, other specs, other rows' research, or the
rival reports unless the row names them. `.planning/STATE-ARCHIVE.md` and `_ARCHIVE/` are history:
open them to answer *"why was this decided"*, never to learn the current state.

## Where things are

| Drawer | What is in it |
|---|---|
| `HOLDING-OS-MASTER-PLAN/` | the plan, once — the specs, his directives (`00-CEO-DIRECTIVE-*`), the open-work board |
| `docs/ceo-directives/` | his most recent written orders |
| `.planning/` | `STATE.md` (today's photo) · `board-rows/` (each row's full record) · `quick/` (each job's card, done-list, probes) · `STATE-ARCHIVE.md` (history) |
| `scripts/governance/` | `ceo-approvals.json` (what he has approved, in his words) · the rulers · `refuter.sh` (Sol's only door) |
| `apps/` | `dashboard` (his screen) · `jarvis` (voice) |
| `packages/` | the engine — kernel, orchestrator, gateway, hook, hr, memory-router, observability, outbox-executor (the scheduler), revenue, shared, voice, dxb-mcp (the house bus) |
| `db/` · `supabase/` | the migrations, the seed and the local stack's set-up; the construction engine is spelled once in `tests/construction-engine.ts` |
| `tests/` | the battery, run against the construction's own engine, never the company's |
| `.claude/` | `CLAUDE.md` (the always-on core) · `CUPBOARD.md` (the tools, printed at the opening) · the doors (`skills/`) · the hooks |
