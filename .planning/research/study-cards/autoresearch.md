# Study Card: autoresearch (karpathy)

> Stub filled 2026-08-30 on the CEO's order, after he brought the pattern back himself
> (a screenshot of an AutoResearch setup prompt) and asked where it stands in the holding.
> Everything below was measured that day; nothing was installed and nothing may be.

- **Tool:** autoresearch (karpathy)
- **Slug:** autoresearch
- **Category:** Other
- **Status:** STUDY
- **Target Phase:** **C40 (board row)** — corrected 2026-08-30. It read **11**, and Phase 11 IS
  the Outleteuro pilot the CEO cancelled (U19; the freeze is recorded on board row B05), so the
  card pointed at a phase that no longer exists. It never depended on that pilot: his B1 ruling of
  2026-07-09 puts the GENERIC loop-engine module first and makes Outleteuro merely its first
  instance. The owner is the board row carrying his own complaint. <!-- OPEN: C40 -->
- **Owner (dept/tier):** Loop-engineering module
- **Trigger Type:** skill
- **Source:** `github.com/karpathy/autoresearch`
- **Pinned Version:** none — **not installed, and not to be installed** (see Legitimacy Verdict)
- **Purpose:** the mutate → measure → keep-if-better loop. One mutable asset, a locked scorer the
  agent may never edit, git commit for winners and git revert for losers.
- **Official Docs URL:** the repository's own README

## Measured live, 2026-08-30 (`api.github.com/repos/karpathy/autoresearch`)

| Field | Value |
|---|---|
| stars / forks | **94,947 / 13,371** |
| open issues | 194 |
| size | 530 KB |
| created | 2026-03-06 |
| last push | **2026-03-26** — dormant since |
| **license** | **`null`** — the README says MIT and the repository ships **no licence file** |

## Key API / Usage Notes — the pattern, in three files

1. **`program.md`** — the goal, the rules, and the "keep going" instruction.
2. **the asset** — the ONE thing edited each round (an ad, an e-mail, a landing page, a prompt).
3. **the score** — the scorekeeper that turns each version into a single number. Written once,
   then **never edited by the agent**. That immutability is the whole anti-cheat.

The loop: change the asset → run → score → keep if better (`git commit`), revert if worse
(`git reset`) → repeat. Upstream applies it to single-GPU nanochat ML training: the agent edits
`train.py` and is scored on validation loss.

## Known Pitfalls

- **No licence.** An upstream that ships no LICENSE file cannot be copied into this repository —
  the precedent is board row **B27**, where four document skills were deleted from a scratch
  directory the moment their licence was read. Reading it is allowed; vendoring it is not.
- **It is an ML-training harness, not a business-asset harness.** Its scorer is validation loss on
  a model it trains; the holding's assets are ads, e-mails, listings and pages. Taking the code
  would mean carrying an nanochat training loop we would never run.
- **Without a locked scorer the pattern inverts into an anti-feature** — `FEATURES.md` states it
  in those words: unscored mutation degrades assets silently and, with no rollback, the damage
  compounds.
- **Dormant upstream.** No push since 2026-03-26, 194 open issues; nobody should plan on fixes.

## Legitimacy Verdict

**READ, NEVER INSTALL — take the pattern, write our own module.** This is not a new decision: it
is the CEO's B1 ruling of 2026-07-09, recorded in the tracker — *scope = generic loop-engine module
FIRST (program.md + asset + locked-scorer template, every department can instantiate; scorer
agent-immutable, real mail draft-only, no unapproved spend)*. The measured licence state and the
ML-training scope of the upstream both confirm that ruling rather than change it.

**Where the work lives:** board row **C40** — *"IS THE LOOP SYSTEM BUILT? I gave a repo and a
specific order. It is very famous."* <!-- OPEN: C40 --> Its closing bar is already his:
the mutate → measure → keep-if-better loop running against a locked score, with a real run
recorded. On 2026-08-30 that row also received the loop-engineering playbook from the two lectures
he ordered studied, including what this holding already owns (the verify gate `post-task.ts` +
`qa.ts`, and the stop condition `escalate.ts`).

- **Install Command:** none. Nothing is installed from this upstream.

## Lifecycle Checklist
- [x] STUDY — done 2026-08-30 (this card)
- [ ] INSTALL — **not applicable**: the upstream is read-only for us
- [ ] ADOPT — as OUR module, when C40 is taken up
- [ ] EMBED
