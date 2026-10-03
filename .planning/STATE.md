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

2026-10-03 ~17:10 → 17:55, Opus 5.5 session 79e77b01 (after cbedb76a). His orders of the day, each in the ledger:
- **Runtime isolation — all three phases done and live** (`runtime-isolation-2026-10-03`,
  `company-claude-home-2026-10-03`, `isolation-phase3-plan-and-memory-path-2026-10-03`). Every company
  Claude call runs in its own Claude home `~/.local/share/dxb/company-claude` (his login, claude.ai max)
  with its own working folder and cache, an ALLOWLIST env and HOME = that home; the memory router never
  reads the construction's claude-mem. Phase 3 `b146822b` → Sol's single pass (`SOL-PHASE3.md`, A1-A4)
  → fork 6 + two lead follow-ups `90341b85` (media-probe's ffmpeg from the passwd home; the tests and
  claude-mem's default path name the passwd home — the sandbox's HOME is /tmp/home). Battery GREEN
  (sandboxed 1,136 · host 266); `dxb-scheduler` restarted 17:49:48, `credentials=present`. Live strace
  (`e63afbb3`): CLEAN by class — 0 in every class under the real `~`, the CLI's built-in look-ups now
  inside the company home; resident-shape lanes clean. No second round.
  - Left in the folder (Sol's C1, older than this job): the obsidian/graphify readers hand `ref` to
    `readFile` unchecked — a `ref` naming `~/.claude-mem/claude-mem.db` reaches the file reader.
  - Not measured: the company DB's claude-mem pointer rows (the construction reads the company only
    through named questions); live strace covers chat and task, not all eight lanes.
- **Doors** (Sol, one pass, `bec00f77^..e04e12be`; five lost rules back `49d61b5f`) and **handover quotes**
  (dxb-team2 §8, `551b8af5`, audited with phase 3 — Sol found nothing widened).
- **Forks measured on real jobs** — `.planning/quick/20261003-runtime-isolation/fork-measurements.md`:
  fork 1 29.1 min 444,212 new · fork 6 8.5 min 146,201 new (Fable's brief; it found the ffmpeg side
  effect itself) · forks 2-5 2.4-6.8 min, 40-122k.

## Next

1. The orchestration design for dxb-team2 — on his word ("dxbteam2 için sistemini bu işten snra
   yapıcaz"): from the fork measurements, Fable consulted, no A/B experiment for its own sake; the lead
   picks the arrangement per job and writes it, with why, on the card. With it his note
   (`plan-max-orchestration-high-2026-10-03`): very important plans and architecture at Opus 5.5 `max`,
   everything after them as orchestration at `high`. A plan moment — tell him first, for `/effort max`.
2. His question of 2026-10-01 ~21:55: why a locked tool is not resolved by the system itself, and why
   the alert comes to him instead of to the one who should fix it.

## Waiting on his approval

- The board rows that wait on him for a decision, money, an eye or an identity step — the board
  page's "Sizi bekleyenler" lists them.
- C1 of Sol's phase-3 pass (above): close the obsidian/graphify readers to paths outside their own
  stores — recommended evet; his word decides.

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
