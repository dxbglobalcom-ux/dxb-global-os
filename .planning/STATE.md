---
gsd_state_version: 1.0
milestone: v2.0
status: executing
last_updated: "2026-10-03"
session_author: opus-5
---

# STATE — where the work stands today

<!-- HISTORY -->

**This file is a photograph, not a history.** One page, current only. It was a 26-page narrative
that contradicted itself in three places until 2026-07-30; that narrative is frozen in
`.planning/STATE-ARCHIVE.md` and may never be cited as current state. It had grown back to 1,796
lines / 206 KB by 2026-09-13 — a session read 50 KB of it before its first word and the CEO caught
it (*"yahu neden 165k oldu hemen ya daha bişey yapmadan"*) — and on 2026-09-14, on his word, every
block before the current one was moved whole to the same archive (§ "STATE.md as it stood on
2026-09-14"). A history growing back here is the defect this paragraph names.

**Three headings, nothing else above "Where things live"** — his approval of 2026-09-28
<!-- CEO-OK: opening-three-headings-and-board-archive-2026-09-28 -->: *Where we left off · Next ·
Waiting on his approval*, a few lines each. The session opening prints exactly these. **Every session
REWRITES them at its end — replaces, never appends;** what they held before goes to
`.planning/STATE-ARCHIVE.md` if it is worth keeping. A row's phases and log live in the row's own file,
not here. What is accepted is read from `scripts/governance/ceo-approvals.json`, never from memory.

## Where we left off

2026-10-03 ~14:11 → 15:25, Opus 5.5 session cbedb76a (after 32178f5b). His orders of the day, each in the ledger:
- **Runtime isolation** (`runtime-isolation-2026-10-03`) — done and live. Sol's single pass (`b3bc05d4`:
  the ruler, the Codex home override, no line per Codex call) fixed by a fork in `9685ecc8`: the ruler
  binds every runtime file through the TypeScript compiler (Sol's 8 counter-examples and 10 class cases
  red before, green after); `companyCodexHome()` refuses the construction's home; one `[isolation]
  lane=gate …` line per Codex call. Found while fixing: since phase 2 the gate's challengers ran at
  `reasoning effort: none` (the company home has no config.toml) — pinned `high` again. Battery GREEN
  (sandboxed 1,113 · host 266); `dxb-scheduler` restarted 15:03:48 on this build. No second round.
  - Measured, not met (done-list 21): the chat lane's claude CLI still opens the construction's settings
    files and plugin manifests (none applied), lists the repository and writes into `~/.claude` —
    closed by phase 3 (Next 1, his evet).
- **Doors** (all audited by Sol, one pass, `bec00f77^..e04e12be`): dxb-start slimmed, Fable at three
  points, the handover carries the transcript, the auditor never re-grades (`8202740c`, permanent),
  dxb-verify's battery and restart lines (`e7117fce`) and dxb-hamza-context's restart (`e04e12be`) on
  his words. Sol refuted "nothing is lost": five rules the slimming dropped are back with their owners
  (`49d61b5f`, a fork; `SOL-DOORS.md`).
- **Handover quotes** (`handover-quotes-conversation-verbatim-2026-10-03`): a note may quote him
  verbatim from the conversation, marked so — dxb-team2 §8.
- **The fork, measured on a real job** — fork 1 (the isolation fixes): 29.1 min, 444,212 new tokens,
  start-up 2,860 new over 158,146 read from the lead's cache, ~268k tokens of work kept out of the lead's
  context, battery green. Forks 2 and 3 (small fixes): 2.4 and 2.8 min, 40,644 and 48,908 new.

## Next

1. Isolation phase 3 on his "evet" (`company-claude-home-2026-10-03`): the company's Claude runs get
   their own working folder and Claude home — the same membership, his one login (an identity step;
   he is told the moment). Closes done-list 21. A short plan to him once, then build, one Sol pass.
2. The orchestration design for dxb-team2 — after this job, on his word ("dxbteam2 için sistemini bu
   işten sonra yapıcaz"): from the fork measurements above, Fable consulted, no A/B experiment for its
   own sake; the lead picks the arrangement per job and writes it, with why, on the card.
3. His question of 2026-10-01 ~21:55: why a locked tool is not resolved by the system itself, and why
   the alert comes to him instead of to the one who should fix it.

## Waiting on his approval

- The board rows that wait on him for a decision, money, an eye or an identity step — the board
  page's "Sizi bekleyenler" lists them.

## Where things live

| Question | File |
|---|---|
| What is the plan? | `HOLDING-OS-MASTER-PLAN/` — the corpus |
| What work remains? | `00-BOARD-OPEN-WORK.md` |
| What was deferred or adapted, and why? | `00-INDEX.md` — the registered-adaptation table |
| What did the CEO order in writing? | `docs/ceo-directives/` |
| What did he rule, and when? | `scripts/governance/ceo-approvals.json` — his words, dated; the later word governs |
| His complaints | `HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` (C66–C68 are the studio's) |
| How do I do X? | `.claude/skills/dxb-*` — the doors |
| The studio's evidence, film by film | `.planning/quick/20260903-media-studio-founding/` |
| The films, the cast, the codes | `~/tools/h3/studio/KATALOG.md` · the vitrin |
| Why was that decided back then? | `.planning/STATE-ARCHIVE.md` (§ "STATE.md as it stood on 2026-09-14" · § "B43 — the diary") and `.planning/_ARCHIVE/` |
