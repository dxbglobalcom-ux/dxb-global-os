# B42 — THE ARSENAL WATCH · PLAN

**Status: PROPOSED, NOT APPROVED.** Written 2026-08-27 on his order
(*"trendi ve güncellemelerin mimarisi nasıl yapılabilir onun planını da yazmamız lazım"*).
No file outside this folder changes until he says yes.

## The two sentences (board law 7)

1. **What is on his screen when this row closes:** Hamza opens a conversation he did not ask for
   and says, in Turkish, *"biz X'in 2.0'ını tutuyoruz, dünya 2.5'e geçti — şunu değiştirir, şu
   kadara mal olur, önerim şu"* — and on every domain where nothing was genuinely surpassed, he
   says nothing at all.
2. **The single command that proves it:** `pnpm watch:arsenal --report` — prints every tracked
   capability with the version we hold, the version upstream holds, the date each was last
   checked, and the one line it would have said to him; a deliberately outdated row makes it
   speak, and an up-to-date arsenal makes it silent.

## Why this exists — the measured exhibit

He corrected the holding himself: *"şuan Seedance 2.5 var."* The check agreed with him —
**Seedance 2.5 shipped 2026-07-31** (30 s in one pass, native 4K, audio in the same latent space,
up to 50 reference inputs) — while `study-cards/seedance-2.md`, `INTEGRATION-TRACKER.md:83` and
the doctrine's paid bench all still said **2.0**. **27 days stale, and the CEO was the detector.**

Measured the same session, so the plan rests on ground and not on assumption:

| What | Measured | How |
|---|---|---|
| `library_items` carries no upstream reference and no last-checked date | columns are `kind · name · version · owner_dept · usage_notes · dependencies · quality_score · review_status · last_used_at · updated_at` — **no `upstream_ref`, no `checked_at`** | `db/migrations/20260711002400_library_family.sql:9-26` |
| The only automatic arsenal check we own watches the wrong thing | `pinCheckCron: "0 4 * * *"` runs `pin-arsenal.mjs`, which quarantines a **mutated** schema; nothing anywhere asks whether a tool has been **superseded** | `packages/outbox-executor/src/scheduler.ts:130` · `packages/gateway/src/pin-check.ts:176` |
| Bench maintenance was promised and never executed | *"at every phase gate, rows re-checked"* — a promise with no owner, no cron and no evidence row | `CAPABILITY_ARSENAL_DOCTRINE.md` §8 closing line |
| Hamza already knows how to open a conversation by himself | `morning-briefing.ts` writes a system-authored `chat_messages` row with `content_tr` and a briefing badge | `packages/orchestrator/src/morning-briefing.ts` · CC-SPEC adaptation A6 |
| The catalogue side is real | 289 plugins in Anthropic's own marketplace, 13 known marketplaces, 412 items on our own shelf | this session's measurements, recorded on B41 |

## The three legs

### Leg 1 — OURS: every capability says which version it is and when it was last looked at

- One migration through the canonical chain (`db/migrations/`, applied by `scripts/bootstrap-db.sh`
  — the same path B40's one-row fix used), adding to `library_items`:
  `upstream_ref text` (where truth lives: a GitHub repo, an npm package, a PyPI project, a model
  card URL) and `checked_at timestamptz`.
- A backfill that writes `upstream_ref` for what we already hold, read from the records that
  already name it: the doctrine's §3 pin table, `INTEGRATION-TRACKER.md`, and each study card's
  own **Source** line. **Anything whose upstream cannot be named is left NULL and reported as
  NULL** — an unwatchable item is a finding, not a blank.
- Verification: `select count(*) from library_items where upstream_ref is null` printed before and
  after, and the null list named in the report.

### Leg 2 — THE WORLD: what is newest, most tested and most liked

Two lanes, because two kinds of thing go stale differently:

- **Machine lane (exact, cheap, no judgement):** for every `upstream_ref` that is a repo or a
  package, the newest release/tag/version is read from that ecosystem's own registry. Weekly.
  This lane is where "we hold 0.4.10, upstream is 0.6.2" comes from, and it cannot be wrong.
- **Judgement lane (rare, evidenced):** for the things with no registry — a video model, an image
  model, a hosted service — a scouted answer written to the **rival-intel evidence floor**
  (`.claude/skills/dxb-rival-intel`): a claim traceable to a named source with its date, or it is
  not written. Monthly, and only over the domains the holding actually earns in: video · image ·
  web reading · commerce · outbound · design.
- **"Most liked and most tested" is not a star count.** A candidate is only reported as better if
  it beats the incumbent on the job we use it for, and the report says on what evidence. Free
  before paid stands; **D1-bis** applies — where the job must win, the paid twin is named with its
  price beside the free one.

### Leg 3 — THE VOICE: it reaches him through Hamza, or it does not exist

- The finding does not sit in a file. It becomes a `chat_messages` row authored by Hamza, in
  Turkish with the English leg beside it (the existing i18n contract), carrying: what we hold,
  what the world moved to, **what actually changes for the holding**, the cost, and a recommendation.
- **Silence is designed in, and it is his own boundary — *"abartmadan, balanced, ölçülü"*.**
  The watch speaks only when something the holding **actually uses** has been genuinely surpassed.
  Nothing surpassed → **no message, and the run still records that it looked**. Zero is a real
  answer (V2's first law).
- Ceiling, so it can never become a feed: **at most one message per week**, at most three findings
  in it, the rest queued to the next one. A run that would exceed it logs what it held back.

## Cadence — deliberately slow

`arsenalWatchCron: "0 8 * * 1"` — **weekly, Monday 08:00**, in the quiet window after the existing
daily crons, never contending with them (the same session-pool rule the HR crons already follow).
The judgement lane fires monthly, on the first Monday.

## Whose department it is

The row invents no department. In the written roster **data-ai** owns model and tool evaluation and
**strategy** owns market intelligence; the watch is a data-ai job with a strategy input, and the
need is registered in the doctrine's §9 growth list rather than by silently adding tools.

## What this plan explicitly does NOT do

- It does not upgrade anything. It reports; **every upgrade that costs money is his**, and every
  install still goes through the customs gate (INTEG-01) exactly as B41 defines it.
- It does not add a resident service. It is a job inside the scheduler that already runs
  (SYSTEM_ARCHITECTURE R5).
- It does not open a new spec. The contract lives in `CAPABILITY_ARSENAL_DOCTRINE.md` §8/§9 as a
  registered adaptation.

## How it is proven finished

| Criterion | Command → what must be printed |
|---|---|
| Every held capability is watchable, or its gap is named | `pnpm watch:arsenal --report` → each row with `held / upstream / checked_at`; the NULL-upstream list printed, not hidden |
| The detector is proven RED before it is trusted | `pnpm watch:arsenal --prove-red` → a deliberately stale row makes it speak; the same run with the row corrected makes it silent |
| It speaks to him, in his language, through Hamza | a `chat_messages` row authored by hamza with `content_tr`, rendered on `/chat` and read by his own eye |
| It stays quiet when it should | a run over an up-to-date arsenal → **0 messages written**, and a run record proving it looked |
| Nothing was written to the company by the construction | `pnpm verify:separation` → BATTERY_GREEN |
| The records agree with reality | `pnpm verify:ledger` → OK |

## Order of work

1. Migration + backfill (leg 1) → the report command with no world lane yet: it can already print
   what we hold and what we cannot watch.
2. Machine lane (leg 2a) + `--prove-red`.
3. Hamza's voice (leg 3) with the weekly ceiling and the silence rule.
4. Judgement lane (leg 2b) over the six earning domains.
5. Doctrine §8/§9 adaptation registered; B42 closed on his eye.

**He approves this before step 1. Nothing above is built until he does.**
