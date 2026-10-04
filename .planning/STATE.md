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

2026-10-03 ~17:10 → 20:05, Opus 5.5 session 79e77b01 (after cbedb76a). His orders of the day, each in the ledger:
- **Runtime isolation — all three phases done and live** (`runtime-isolation-2026-10-03`,
  `company-claude-home-2026-10-03`, `isolation-phase3-plan-and-memory-path-2026-10-03`). Every company
  Claude call runs in its own Claude home `~/.local/share/dxb/company-claude` (his login) with its own
  working folder and cache, an ALLOWLIST env and HOME = that home; the memory router never reads the
  construction's claude-mem. Sol's single pass (`SOL-PHASE3.md`) fixed by fork 6 + the lead (`90341b85`);
  battery GREEN (sandboxed 1,136 · host 266); `dxb-scheduler` restarted 17:49:48; live strace CLEAN by class.
  - Not measured: the company DB's claude-mem pointer rows; live strace covers chat and task of eight lanes.
- **The orchestration design — measured and APPROVED, not yet written into the door.** Today's four lead
  sessions and six forks, by quality · cost · speed: `.planning/quick/20261003-runtime-isolation/fork-measurements.md`
  (forks keep the lead light — cbedb76a's five kept 456k out; a fork from a heavy lead costs 2.4x per
  call; cache reads are 47-59 % of a lead's cost; a handover costs ~$0.5; call latency does not grow
  with context; a Fable consult blocks the lead 42-290 s). His three words, registered:
  `orchestration-three-arrangements-lead-chooses-2026-10-03` (fork · high lead + three medium helpers ·
  hybrid; the lead chooses per job and writes why, minutes, tokens, cost, Sol's findings on the card;
  measured after 1-2 real jobs), `helpers-write-code-under-lead-verification-2026-10-03` (PERMANENT),
  `sol-single-pass-fixes-by-helper-2026-10-03` (PERMANENT).

## Next

His list of 2026-10-04 (session 9bc3fc3e), in his order — *"bunları sırayla yapalım işte ama unutulmasın
heee arada kaynamasın"* (conversation, verbatim). One at a time; each talked through with him first.

1. **C1 — the company's memory drawer on the company's desk — IN PROGRESS.**
   <!-- CEO-OK: company-memory-drawer-2026-10-04 --> Plan, card (4, normal, Sol `high`) and done-list:
   `.planning/quick/20261004-company-memory-drawer/PLAN.md`; code at `high`.
2. **Tool loading — his question 9, a board row to propose.** Measured 2026-10-04: an employee gets its
   department's whole list (finance: 24 tools, ~9.4k tokens of schemas in every task call); Claude's own
   tools are off for employees and Hamza (`tools: []`, the July 17/19 design: Hamza talks, work goes to an
   employee); SDK 0.3.259 can defer schemas behind tool search; Claude's 17 bundled skills and 5 agents
   still reach every company call (whether they can be removed is unmeasured). Same subject, his words in
   the conversation (verbatim): *"hamza zaten sınırlarını biliyor onay gerektiren şeylerin ne olduğunu
   biliyor oyüzden claude'ın tüm becerilerini kullanabilmeli istediği zaman.bir sorun çıkarsa kapatırız.
   yani benim holdingim benim iş istasyonu olan pc yi tam teşekküllü tüm aletlerle kullanmalı. hem
   dışardan yüklediğimiz aletler pluginler beceriler modlar ve claude'un kendi beceri ve aletleriyle
   birlikte."* Then he asked whether Hamza needs to know his PC at all; the lead separated doing from
   remembering (personal tasks are done, only company work reaches the company's memory). Unanswered,
   recommended yes: secret files (passwords, API keys, login files) and writing into the construction's
   folder stay closed.
3. **The prompt audit's runtime bucket (B51 move 5)** — 141 persona files still carry "Muhakeme sırası
   sabittir / Fixed reasoning order" (counted 2026-10-04); R1-R17 in
   `.planning/quick/20260923-prompt-audit/REPORT.md`. Waits on his B51 verdict.
4. **A locked tool resolved by the system itself** — his question of 2026-10-01 ~21:55: why the alert
   comes to him and not to the one who should fix it. The proposal goes with item 2.
5. **The construction's auto-memory** — stale and contradicting entries (Burj Al Arab in 2 files; 8
   entries naming paths not found in the repository, unchecked one by one). Waits on his word.

After his list: write the approved orchestration design into dxb-team2 at Opus 5.5 `max`
(`design-plan-architecture-at-max-2026-10-03`; the three arrangements, the card's new fields, the fork's two
seen weaknesses as procedure, CLAUDE.md §2 "Code" and dxb-team2 §3/§6 on his two PERMANENT words — the full
brief: ~/.claude/projects/-home-dxb-DxB-Global-OS/79e77b01-f5d1-4a63-9a63-69e03a5fe0cf.jsonl). Then the
research he asked for — the tweet's top-tier agent systems (SS and S) and Hermes, what they have that this
repository lacks; the tweet's link is still to come from him.

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
