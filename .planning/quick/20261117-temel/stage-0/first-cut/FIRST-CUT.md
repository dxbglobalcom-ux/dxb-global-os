# First cut — what stays and what goes (proposal, nothing deleted)

Measured 2026-11-22 on `/home/dxb/DxB Global OS` (master @ 52374cf2 + working tree). Read-only. Scripts and raw data: this folder (`collect.py`, `classify.py`, `refine.py`, `build.py`, `md.py`; `collect.json`, `rows2.json`, `refine.json`, `files.json`). Machine table: `first-cut.tsv`.

**Units.** `size` = apparent bytes (what `du -sb` reports), summed by the script from `lstat`; `disk` = allocated blocks. `tracked` = in `git ls-files`; `untracked` = in `git ls-files -o --exclude-standard`; `ignored` = on disk, in neither (git-ignored). Untracked and ignored files are NOT in git history: deleting them is permanent. Tracked files stay recoverable from history.

**Reference check.** 16,416 text files scanned (≤3 MB each, text extensions only; `.raw`/`.log`/`.jsonl`/binaries not scanned as citers). Each candidate's name is matched as a path token. Board lines are split at `## Section 5` (line 331): above = OPEN, below = CLOSED. Open rows = the brief's awk command (73 ids). Open-row files = `.planning/board-rows/<open id>.md`; every other row file and `board-rows/archive/` = CLOSED. The generated graph indexes (`.planning/graphs/*`, `graphify-out/*`) name every file and are not counted as citations.

Living = STATE.md · open board · open-row files · temel `PLAN.md` + `reorder/ORDER.md` · `ceo-approvals.json` · `.claude/CLAUDE.md` · `.claude/skills/**` · `HOLDING-OS-MASTER-PLAN/*.md` · `docs/ceo-directives/**` · code that reads the path (tests, scripts, hooks, packages, apps, tools, db, configs).

## 1. Totals

| class | entries | size | disk | files | tracked files | untracked files | ignored files | tracked bytes | untracked+ignored bytes |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| STAYS | 119 | 4,040.3 MB | 4,259.8 MB | 81,759 | 3,684 | 17,553 | 60,522 | — | — |
| GOES | 58 | 13.4 MB | 14.1 MB | 268 | 158 | 34 | 76 | 2.7 MB | 10.7 MB |
| DOUBT | 63 | 191.1 MB | 193.5 MB | 1,001 | 279 | 486 | 236 | 4.5 MB | 186.6 MB |
| NOT A CANDIDATE | 62 | 1,906.7 MB | 2,095.1 MB | 73,035 | 1,811 | 1 | 71,223 | — | — |

Cross-check: all rows sum to 5,101,302,869 B / 117,624 files = the full walk of the repository minus `.git` and `node_modules` (exact match). `.planning/quick/` holds 173 job folders (not ~175): STAYS 72, GOES 56, DOUBT 45.

**Two STAYS groups the lead should weigh** (kept STAYS by the brief's rule, flagged):
- **Approval-evidence only** — 20 quick folders, 144.3 MB: the ONLY living record naming them is `ceo-approvals.json` (the evidence line of an accepted item). They are listed in §5 with `APPROVAL-EVIDENCE ONLY`.
- **Partial** — 28 staying folders where the living records name only specific files inside; the remainder (2,291.6 MB) is named by nothing living. Table in §6. The three biggest: `20261022-iki-yol` (only `RUNBOOK.md` named, by C41.md:40; 1,856.8 MB / 59,747 untracked+ignored files unnamed), `20261103-web-ders` (only `tracks/4-reklam-olcum.md`, by B28.md; 327.8 MB unnamed), `20261104-web-bedava-aletler` (only `crawl-test/RUN.md`, by B84.md:87; 80.2 MB unnamed).

## 2. Readers — what would break

Mechanisms that read a path under `.planning/` or another pile (each `file:line` read in this session):

| reader | reads | runs when |
|---|---|---|
| `scripts/hooks/pre-commit:88` → `tests/b43/records-truth.ts:56,229,309` | `.planning/STATE.md`, the board, `scripts/governance/ceo-approvals.json` | every commit staging a record |
| `scripts/hooks/commit-msg:16` → `tests/b43/records-truth.ts:352` | the staged board | every commit |
| `scripts/hooks/pre-commit:107` → `tests/hooks/opening-budget.ts:65-78` | `.claude/CLAUDE.md`, `.claude/skills/*/SKILL.md`, `.claude/CUPBOARD.md` | commits touching those |
| `scripts/hooks/pre-commit:53` → `scripts/research-ruler.sh` / `tests/b46/research-ruler.ts:419` | `.claude/skills/dxb-research/**`, checks that paths its SKILL.md/ARSENAL.md cite exist | commits touching the research engine |
| `scripts/hooks/post-commit`, `post-checkout` (graphify) | writes `graphify-out/` | every commit / checkout |
| `.claude/hooks/spec-bootstrap.sh:32,123,130-141` | `.planning/STATE.md`, the board | every session start |
| `tests/governance/usage-cost.test.ts:13` | `.planning/quick/20261003-runtime-isolation/usage.mjs` | test suite |
| `tests/b43/motion-graphics.test.ts:1789` | `.planning/quick/20261112-motion-graphics/CONTRACT.md` | test suite |
| `scripts/b36/company-write-watch.mjs:46-47` | `.planning/quick/20260823-construction-company-separation/company-write-baseline.json` | b36 watch |
| `scripts/models/side-by-side.mjs:35` | writes into `.planning/quick/20261009-masa-b51/evidence/` (default) | on run |
| `tools/studio-prompts/kisayol/quarry/build_quarry.py:29-33` | `catalog-*.tsv` in `.planning/quick/20261108-kisayol/` — **none exists today; already broken** | on run |
| `tests/c42/rival-intel-ledger.test.ts:20`; `scripts/rival-intel/next.sh:12`, `fetch.sh:16`, `motion.py:53` | `.planning/research/rival-intel/` (`00-LEDGER.md`) | test suite / on run |
| `tests/b23/graph-is-not-stale.test.ts:10`; `scripts/governance/graph-refresh.mjs:28-29` | `.planning/graphs/` (canon), `graphify-out/` (working) | test suite / `graph:check` |
| `scripts/governance/ledger-truth.mjs:139-146` (+ `tests/governance/ledger-truth.test.ts:33-36`) | flat: `.planning/*`, `.planning/research/*`, `research/study-cards`, `research/rival-intel`, `.planning/board-rows` | `verify:ledger`, test suite |
| `scripts/check-integration-tracker.mjs:17`; `tests/phase6/fixtures/known-facts.json:15-16` | `research/INTEGRATION-TRACKER.md`, `research/STACK.md` | on run / test |
| `scripts/library/intake.mjs:193,230`; `register-media-engines.mjs:49` | every `.md` directly in `.planning/research/`; `research/study-cards/`, `.planning/study-cards/` | library intake run |
| `scripts/board/note-done.mjs:33`, `render.mjs:37,538`, `movement.mjs:31` | `.planning/board-rows/`, `var/board/` | board tools |
| `scripts/governance/sol-dump-sweep.sh:23` (+ test) | deletes ignored files under `.planning/quick/` older than N days — generic | on run |
| `scripts/governance/rules.json:3` | names `.planning/STATE-ARCHIVE.md` | ledger rules |
| `vitest.config.ts:93,98`; tests under `tests/phase4`, `phase6` | `var/construction-gateway-profiles`, `var/construction-memory`, `tmp/outbox-proof` | test suite |

**No GOES entry is read by any of these** (by construction: GOES requires zero hits in code, comments, living records, papers and memory). Deleting a STAYS reader target would break the listed test or script; the commit hooks themselves read only STATE, the board, the approvals ledger, CLAUDE.md, the skills and the research engine — none of which is a candidate.

## 3. Inventory — top level and `.planning/`

| path | size | files | tracked | untracked | ignored | last change | class |
|---|---:|---:|---:|---:|---:|---|---|
| `.agents` | 2,101,212 | 122 | 111 | 0 | 11 | 2026-11-22 | (expanded below) |
| `.archify` | 2,013,250 | 15 | 0 | 15 | 0 | 2026-11-19 | (expanded below) |
| `.claude` | 2,167,393 | 129 | 117 | 0 | 12 | 2026-11-22 | NOT A CANDIDATE |
| `.codex` | 10,036 | 4 | 3 | 0 | 1 | 2026-11-22 | (expanded below) |
| `.dockerignore` | 395 | 1 | 1 | 0 | 0 | 2026-07-10 | NOT A CANDIDATE |
| `.env` | 26 | 1 | 0 | 0 | 1 | 2026-08-24 | NOT A CANDIDATE |
| `.env.daemon` | 33 | 1 | 0 | 0 | 1 | 2026-08-24 | NOT A CANDIDATE |
| `.env.example` | 1,327 | 1 | 1 | 0 | 0 | 2026-07-06 | NOT A CANDIDATE |
| `.gitattributes` | 39 | 1 | 1 | 0 | 0 | 2026-08-26 | NOT A CANDIDATE |
| `.github` | 2,603 | 2 | 2 | 0 | 0 | 2026-08-26 | NOT A CANDIDATE |
| `.gitignore` | 4,092 | 1 | 1 | 0 | 0 | 2026-11-05 | NOT A CANDIDATE |
| `.gitleaks.toml` | 322 | 1 | 1 | 0 | 0 | 2026-07-06 | NOT A CANDIDATE |
| `.graphifyignore` | 238 | 1 | 1 | 0 | 0 | 2026-10-06 | NOT A CANDIDATE |
| `.mcp.json` | 356 | 1 | 1 | 0 | 0 | 2026-08-27 | NOT A CANDIDATE |
| `.planning` | 4,149,716,400 | 82557 | 3843 | 18057 | 60657 | 2026-11-22 | (expanded below) |
| `.playwright-mcp` | 4,204,601 | 172 | 0 | 0 | 172 | 2026-11-14 | DOUBT |
| `.ripgreprc` | 1,237 | 1 | 1 | 0 | 0 | 2026-08-17 | NOT A CANDIDATE |
| `.scrollcraft.json` | 37 | 1 | 1 | 0 | 0 | 2026-08-27 | NOT A CANDIDATE |
| `.vscode` | 38 | 1 | 0 | 1 | 0 | 2026-11-05 | NOT A CANDIDATE |
| `AGENTS.md` | 13,225 | 1 | 1 | 0 | 0 | 2026-11-22 | NOT A CANDIDATE |
| `DXB.code-workspace` | 1,751 | 1 | 1 | 0 | 0 | 2026-07-26 | NOT A CANDIDATE |
| `Dış Denetim Raporu` | 33,186 | 1 | 1 | 0 | 0 | 2026-07-16 | STAYS |
| `HOLDING-OS-MASTER-PLAN` | 1,558,461 | 58 | 58 | 0 | 0 | 2026-11-22 | NOT A CANDIDATE |
| `MUSTS from Fable 5 - English.md` | 35,042 | 1 | 1 | 0 | 0 | 2026-07-16 | STAYS |
| `README.md` | 3,852 | 1 | 1 | 0 | 0 | 2026-11-22 | NOT A CANDIDATE |
| `Solo -kadro denetim raporu.odt` | 65,393 | 1 | 0 | 0 | 1 | 2026-07-12 | STAYS |
| `apps` | 215,536,769 | 521 | 206 | 0 | 315 | 2026-11-22 | NOT A CANDIDATE |
| `construction` | 16,997 | 4 | 3 | 0 | 1 | 2026-10-21 | NOT A CANDIDATE |
| `d07-desktop.jpeg` | 29,770 | 1 | 0 | 1 | 0 | 2026-11-04 | GOES |
| `dashboard ve hamza ornekleri ve complaints` | 5,823,642 | 3 | 3 | 0 | 0 | 2026-07-29 | STAYS |
| `db` | 1,608,556 | 197 | 197 | 0 | 0 | 2026-11-22 | NOT A CANDIDATE |
| `docs` | 28,654,423 | 18 | 17 | 0 | 1 | 2026-10-26 | (expanded below) |
| `graphify-out` | 156,347,908 | 7136 | 0 | 0 | 7136 | 2026-11-22 | (expanded below) |
| `node_modules` | 1,050,210,346 | 38439 | 0 | 0 | 38439 | 2026-11-22 | NOT A CANDIDATE |
| `package.json` | 3,422 | 1 | 1 | 0 | 0 | 2026-11-12 | NOT A CANDIDATE |
| `packages` | 21,005,185 | 1030 | 541 | 0 | 489 | 2026-11-22 | NOT A CANDIDATE |
| `pnpm-lock.yaml` | 163,892 | 1 | 1 | 0 | 0 | 2026-10-17 | NOT A CANDIDATE |
| `pnpm-workspace.yaml` | 975 | 1 | 1 | 0 | 0 | 2026-10-10 | NOT A CANDIDATE |
| `references` | 53,223,154 | 258 | 256 | 0 | 2 | 2026-11-10 | (expanded below) |
| `scripts` | 2,159,632 | 146 | 143 | 0 | 3 | 2026-11-22 | NOT A CANDIDATE |
| `supabase` | 16,196 | 4 | 3 | 0 | 1 | 2026-07-10 | NOT A CANDIDATE |
| `tests` | 3,118,351 | 317 | 317 | 0 | 0 | 2026-11-22 | NOT A CANDIDATE |
| `tmp` | 156 | 2 | 0 | 0 | 2 | 2026-11-22 | (expanded below) |
| `tools` | 1,245,047 | 120 | 69 | 0 | 51 | 2026-11-22 | NOT A CANDIDATE |
| `tsconfig.base.json` | 244 | 1 | 1 | 0 | 0 | 2026-07-06 | NOT A CANDIDATE |
| `tsconfig.json` | 739 | 1 | 1 | 0 | 0 | 2026-10-17 | NOT A CANDIDATE |
| `tsconfig.tests.json` | 746 | 1 | 1 | 0 | 0 | 2026-10-06 | NOT A CANDIDATE |
| `var` | 450,350,731 | 24758 | 0 | 0 | 24758 | 2026-11-22 | (expanded below) |
| `vitest.config.ts` | 6,328 | 1 | 1 | 0 | 0 | 2026-11-22 | NOT A CANDIDATE |
| `vps` | 55,461 | 25 | 22 | 0 | 3 | 2026-11-19 | NOT A CANDIDATE |
| `.planning/REQUIREMENTS.md` | 17,869 | 1 | 1 | 0 | 0 | 2026-11-16 | STAYS |
| `.planning/STATE-ARCHIVE.md` | 607,711 | 1 | 1 | 0 | 0 | 2026-11-16 | STAYS |
| `.planning/STATE.md` | 38,108 | 1 | 1 | 0 | 0 | 2026-11-22 | STAYS |
| `.planning/board-rows` | 901,053 | 83 | 83 | 0 | 0 | 2026-11-22 | STAYS |
| `.planning/governance` | 2,321 | 1 | 1 | 0 | 0 | 2026-11-16 | (expanded below) |
| `.planning/graphs` | 51,942,843 | 5 | 5 | 0 | 0 | 2026-11-11 | (expanded below) |
| `.planning/phases` | 5,296,068 | 53 | 53 | 0 | 0 | 2026-07-12 | (expanded below) |
| `.planning/quick` | 3,092,167,682 | 76301 | 1577 | 16812 | 57912 | 2026-11-22 | (expanded below) |
| `.planning/research` | 998,736,734 | 6110 | 2120 | 1245 | 2745 | 2026-11-22 | (expanded below) |
| `.planning/study-cards` | 6,011 | 1 | 1 | 0 | 0 | 2026-07-10 | (expanded below) |

Other paper piles found: `.raw` 1,541 files / 65.5 MB, `.err` 2,101 / 24.5 MB, `.log` 458 / 9.7 MB, `.out` 190 — all inside `.planning/` (inside the quick folders above). Outside `.planning/`: `.playwright-mcp/` (172 ignored screenshots), `d07-desktop.jpeg`, `.archify/` (2 workflow folders, untracked), `graphify-out/`, `var/` logs, `tmp/outbox-proof`. A nested git repository sits at `.planning/research/watch-links/2026-11-08-archify/src/.git`.

## 4. `.planning/quick/` — one line per job folder

| folder | class | size | tracked | untracked+ignored | last change |
|---|---|---:|---:|---:|---|
| `20260710-approvals-readable-payload` | DOUBT | 2,378 | 2 | 0 | 2026-07-10 |
| `20260710-beklentiler-master-plan-v2` | DOUBT | 2,064 | 1 | 0 | 2026-07-10 |
| `20260710-login-redesign` | DOUBT | 5,854 | 2 | 0 | 2026-07-10 |
| `20260710-ui-spec-amendment-a1` | DOUBT | 3,036 | 2 | 0 | 2026-07-10 |
| `20260713-e71-model-routing` | GOES | 8,626 | 2 | 0 | 2026-07-13 |
| `20260713-e83-ops-live` | GOES | 7,342 | 2 | 0 | 2026-07-13 |
| `20260713-e84-audit-surface` | DOUBT | 9,521 | 2 | 0 | 2026-07-13 |
| `20260713-e84b-alert-center` | STAYS | 11,565 | 2 | 0 | 2026-07-13 |
| `20260713-e91-workflow-runner` | STAYS | 7,623 | 1 | 0 | 2026-07-13 |
| `20260713-e92-workflow-settings-ui` | GOES | 3,306 | 1 | 0 | 2026-07-13 |
| `20260713-e93-approval-center` | STAYS | 6,236 | 1 | 0 | 2026-07-13 |
| `20260713-org-chart-professional` | DOUBT | 13,133 | 2 | 0 | 2026-07-13 |
| `20260713-sicil-backfill` | DOUBT | 2,975 | 1 | 0 | 2026-07-13 |
| `20260714-e101-hook-engine` | STAYS | 11,993 | 2 | 0 | 2026-07-14 |
| `20260714-e102-spawn-binding` | STAYS | 5,062 | 2 | 0 | 2026-07-14 |
| `20260714-e111-cost-breakdown` | GOES | 5,263 | 2 | 0 | 2026-07-14 |
| `20260714-e121-real-data-pages` | GOES | 3,343 | 1 | 0 | 2026-07-14 |
| `20260714-e94-project-command-view` | GOES | 5,850 | 1 | 0 | 2026-07-14 |
| `20260714-e95-library` | GOES | 13,316 | 2 | 0 | 2026-07-14 |
| `20260717-r32-live-defect-remediation` | GOES | 1,888 | 1 | 0 | 2026-07-17 |
| `20260717-r42-library-enrichment` | GOES | 5,127 | 2 | 0 | 2026-07-18 |
| `20260718-e122-widget-system` | GOES | 3,682 | 2 | 0 | 2026-07-18 |
| `20260718-e123-route-gate` | GOES | 2,597 | 2 | 0 | 2026-07-18 |
| `20260718-e124-crm-gate` | DOUBT | 3,333 | 2 | 0 | 2026-07-18 |
| `20260718-e125-workforce-gate` | GOES | 4,445 | 2 | 0 | 2026-07-18 |
| `20260718-e131-test-run` | GOES | 3,402 | 2 | 0 | 2026-07-18 |
| `20260718-e133-ceo-manual` | GOES | 2,931 | 2 | 0 | 2026-07-18 |
| `20260718-r43-capability-arsenal` | GOES | 3,820 | 2 | 0 | 2026-07-18 |
| `20260719-c-series-remediation` | STAYS | 13,584 | 1 | 0 | 2026-07-19 |
| `20260719-c9-filter-bar-rollout` | GOES | 5,632 | 2 | 0 | 2026-07-19 |
| `20260719-e131-f09-close` | GOES | 1,202 | 1 | 0 | 2026-07-19 |
| `20260723-helptip-depth` | GOES | 1,495 | 1 | 0 | 2026-07-23 |
| `20260724-10d10e-portfolio-responsibility` | GOES | 6,047 | 2 | 0 | 2026-07-24 |
| `20260724-19e-decisions-content-i18n` | GOES | 2,925 | 2 | 0 | 2026-07-24 |
| `20260724-3a3b-dead-click-sweep` | GOES | 3,109 | 2 | 0 | 2026-07-24 |
| `20260724-9c9d9e-data-controls` | GOES | 6,447 | 2 | 0 | 2026-07-24 |
| `20260724-c5-trigger-workforce-truth` | DOUBT | 4,743 | 2 | 0 | 2026-07-24 |
| `20260724-chat-dictation-voice-merge` | GOES | 8,570 | 2 | 0 | 2026-07-24 |
| `20260724-machine-room` | GOES | 3,432 | 2 | 0 | 2026-07-24 |
| `20260725-c9-filterbar-rollout` | GOES | 6,507 | 2 | 0 | 2026-07-25 |
| `20260725-ceo-morning-decisions` | DOUBT | 769,696 | 6 | 0 | 2026-07-25 |
| `20260725-fable-to-opus5-rename` | GOES | 9,078 | 2 | 0 | 2026-07-25 |
| `20260725-suite-afterall-hygiene` | STAYS | 5,829 | 2 | 0 | 2026-07-25 |
| `20260725-u15-voice-remediation` | STAYS | 6,135 | 2 | 0 | 2026-07-25 |
| `20260725-u15-voice-round2` | STAYS | 3,568 | 1 | 0 | 2026-07-25 |
| `20260726-brain-floor` | GOES | 3,332 | 1 | 0 | 2026-07-26 |
| `20260726-critical-gate` | GOES | 2,443 | 1 | 0 | 2026-07-26 |
| `20260726-w23-revenue-gates` | GOES | 4,128 | 1 | 0 | 2026-07-26 |
| `20260726-w25-autonomous-work` | GOES | 4,348 | 1 | 0 | 2026-07-26 |
| `20260727-w26-proactive-briefing` | GOES | 5,273 | 1 | 0 | 2026-07-27 |
| `20260728-ledger-truth-gate` | DOUBT | 9,568 | 2 | 0 | 2026-07-28 |
| `20260821-gece-vardiyasi` | GOES | 7,301 | 1 | 0 | 2026-08-21 |
| `20260823-construction-company-separation` | STAYS | 408,734 | 12 | 0 | 2026-08-25 |
| `20260827-arsenal-watch` | STAYS | 8,204 | 1 | 0 | 2026-08-27 |
| `20260903-media-studio-founding` | STAYS | 683,150 | 41 | 0 | 2026-09-27 |
| `20260919-the-opening` | STAYS | 15,031 | 1 | 0 | 2026-09-27 |
| `20260922-session-opening-budget` | DOUBT | 7,573 | 1 | 0 | 2026-09-27 |
| `20260923-prompt-audit` | STAYS | 219,713 | 14 | 0 | 2026-09-27 |
| `20260924-caveman-on-5-5` | STAYS | 1,124,407 | 116 | 0 | 2026-09-27 |
| `20260924-code-gate` | DOUBT | 6,234 | 1 | 0 | 2026-09-27 |
| `20260924-night-content-engine` | STAYS | 40,370 | 3 | 0 | 2026-09-27 |
| `20260924-research-door-perplexity` | STAYS | 628,371 | 16 | 0 | 2026-09-27 |
| `20260924-signal-revenue-study` | STAYS | 235,575 | 8 | 0 | 2026-09-27 |
| `20260925-dxb-team1` | STAYS | 21,520 | 2 | 0 | 2026-09-27 |
| `20260925-virtual-creator` | STAYS | 149,599 | 6 | 0 | 2026-11-18 |
| `20260926-b59-context-gate` | STAYS | 26,449 | 2 | 0 | 2026-09-27 |
| `20260928-sol-db-reach` | STAYS | 25,246 | 4 | 0 | 2026-09-28 |
| `20261001-auditor-exam` | STAYS | 80,536 | 5 | 2 | 2026-10-01 |
| `20261001-pin-auto-review` | GOES | 14,762 | 3 | 0 | 2026-10-01 |
| `20261001-score-card-gate` | GOES | 51,266 | 11 | 0 | 2026-10-01 |
| `20261003-doors-slim` | GOES | 31,915 | 8 | 0 | 2026-10-03 |
| `20261003-runtime-isolation` | STAYS | 1,108,859 | 93 | 0 | 2026-10-04 |
| `20261004-auditor-text` | DOUBT | 738,214 | 12 | 1 | 2026-10-04 |
| `20261004-b51-code-and-lock` | STAYS | 630,424 | 22 | 1 | 2026-10-04 |
| `20261004-company-memory-drawer` | STAYS | 257,988 | 19 | 0 | 2026-10-04 |
| `20261004-design-max` | STAYS | 531,996 | 13 | 1 | 2026-10-04 |
| `20261004-his-list` | STAYS | 36,748 | 6 | 3 | 2026-10-04 |
| `20261004-live-turn-bar` | DOUBT | 81,227 | 25 | 0 | 2026-10-04 |
| `20261004-locked-tool` | STAYS | 1,724,513 | 24 | 1 | 2026-10-04 |
| `20261004-memory-followups` | DOUBT | 2,782,795 | 18 | 2 | 2026-10-04 |
| `20261004-orchestration-door` | STAYS | 263,453 | 16 | 1 | 2026-10-04 |
| `20261004-persona-old-patterns` | STAYS | 4,130,746 | 23 | 4 | 2026-10-04 |
| `20261006-door-overall-look` | GOES | 628,610 | 2 | 2 | 2026-10-06 |
| `20261006-dxb-team2-lean` | GOES | 1,025,508 | 18 | 2 | 2026-10-06 |
| `20261006-effort-machinery-removal` | STAYS | 2,464,212 | 9 | 1 | 2026-10-06 |
| `20261006-fable-review-fixes` | GOES | 560,380 | 7 | 2 | 2026-10-06 |
| `20261006-handover-clean-break` | GOES | 133,480 | 2 | 2 | 2026-10-06 |
| `20261006-medium-first` | GOES | 148,621 | 1 | 4 | 2026-10-06 |
| `20261006-sol-dump-sweep` | GOES | 285,684 | 3 | 2 | 2026-10-06 |
| `20261006-typecheck-tests` | GOES | 799,961 | 4 | 2 | 2026-10-06 |
| `20261008-four-equal-arrangements` | GOES | 845,909 | 4 | 10 | 2026-10-08 |
| `20261009-masa-b51` | STAYS | 7,072,549 | 82 | 8 | 2026-10-12 |
| `20261012-b64-is-akisi` | STAYS | 4,809,869 | 28 | 9 | 2026-11-16 |
| `20261012-b64-sayfa` | GOES | 4,375 | 0 | 2 | 2026-10-12 |
| `20261012-xhigh-plan` | GOES | 326,493 | 3 | 2 | 2026-10-12 |
| `20261013-b41-tasarim-becerileri` | GOES | 1,000,882 | 7 | 2 | 2026-10-13 |
| `20261013-jev-olcum` | STAYS | 148,075 | 15 | 0 | 2026-10-13 |
| `20261014-88-link` | STAYS | 1,062,460 | 20 | 0 | 2026-10-14 |
| `20261014-b64-adim1` | DOUBT | 749,855 | 3 | 4 | 2026-10-14 |
| `20261014-iki-video` | STAYS | 827,567 | 8 | 2 | 2026-10-14 |
| `20261014-tahta-sirasi` | STAYS | 238,337 | 16 | 0 | 2026-11-22 |
| `20261014-yan-calisma-kapisi` | GOES | 65,939 | 2 | 2 | 2026-10-14 |
| `20261015-arama-testi` | STAYS | 1,434,761 | 15 | 2 | 2026-10-15 |
| `20261015-ekim-linkleri` | DOUBT | 1,568 | 1 | 0 | 2026-10-15 |
| `20261015-scrollcraft-studio` | GOES | 469,110 | 14 | 2 | 2026-10-15 |
| `20261017-studio-platform-hub` | STAYS | 276,708 | 16 | 0 | 2026-11-19 |
| `20261017-temizlik` | STAYS | 827,196 | 4 | 2 | 2026-10-17 |
| `20261018-gozlem-odasi` | STAYS | 1,789,954 | 8 | 2 | 2026-10-18 |
| `20261019-calisma1-door` | GOES | 84,610 | 1 | 2 | 2026-10-19 |
| `20261019-canli-dinlenme` | GOES | 415,716 | 1 | 2 | 2026-10-19 |
| `20261019-degerli-is-danisma` | STAYS | 1,857,141 | 5 | 44 | 2026-11-22 |
| `20261019-excel-tab` | GOES | 260,798 | 3 | 4 | 2026-10-19 |
| `20261019-ye18-pocock` | DOUBT | 209,817 | 2 | 2 | 2026-10-19 |
| `20261021-b03bis` | GOES | 2,087,202 | 9 | 4 | 2026-10-21 |
| `20261021-dort-yollu-olcum` | STAYS | 47,755,352 | 0 | 206 | 2026-10-21 |
| `20261021-ekim-linkleri` | STAYS | 2,204 | 1 | 0 | 2026-10-21 |
| `20261021-musteri-gozu` | DOUBT | 410,227 | 1 | 6 | 2026-10-21 |
| `20261021-uc-seviye` | DOUBT | 7,354,320 | 0 | 134 | 2026-10-28 |
| `20261022-iki-yol` | STAYS | 1,856,761,016 | 0 | 59748 | 2026-10-22 |
| `20261023-calisan-sistemi` | DOUBT | 31,535 | 0 | 11 | 2026-10-28 |
| `20261024-zeytin-tek-kol` | STAYS | 840,431 | 38 | 0 | 2026-11-16 |
| `20261027-b64-inceleme` | DOUBT | 601,180 | 1 | 4 | 2026-10-27 |
| `20261028-b64-deneme-kurallari` | DOUBT | 679,607 | 0 | 4 | 2026-10-28 |
| `20261028-deneme-sol` | DOUBT | 5,496,054 | 0 | 15 | 2026-10-29 |
| `20261029-web-ofisi-devir` | DOUBT | 37,794 | 0 | 4 | 2026-11-08 |
| `20261101-gelir-devir` | DOUBT | 56,068,758 | 0 | 133 | 2026-11-01 |
| `20261101-gelir-sol` | GOES | 1,513,202 | 1 | 4 | 2026-11-01 |
| `20261102-mavi-kusak-tek-opus` | STAYS | 106,989 | 9 | 0 | 2026-11-02 |
| `20261102-tarz-dolabi` | STAYS | 4,384 | 1 | 0 | 2026-11-02 |
| `20261102-web-studio-personalar` | STAYS | 249,984 | 23 | 0 | 2026-11-03 |
| `20261103-mavi-kusak-max` | DOUBT | 6,262 | 1 | 0 | 2026-11-03 |
| `20261103-web-ders` | STAYS | 327,791,812 | 236 | 7422 | 2026-11-04 |
| `20261103-web-studio-kesif` | STAYS | 35,281 | 3 | 0 | 2026-11-16 |
| `20261103-web-studio-plan` | STAYS | 271,108 | 4 | 16 | 2026-11-16 |
| `20261104-goz-olcumu` | STAYS | 51,466 | 11 | 4 | 2026-11-04 |
| `20261104-web-bedava-aletler` | STAYS | 80,232,550 | 25 | 4549 | 2026-11-04 |
| `20261105-gorsel-karsilastirma` | DOUBT | 93,158,112 | 0 | 95 | 2026-11-05 |
| `20261107-dxb-verify` | DOUBT | 431,224 | 3 | 2 | 2026-11-07 |
| `20261107-fleet-gate` | GOES | 3,173 | 0 | 1 | 2026-11-07 |
| `20261107-ugc` | DOUBT | 92,206 | 9 | 0 | 2026-11-08 |
| `20261108-kisayol` | DOUBT | 1,202,736 | 51 | 5 | 2026-11-08 |
| `20261108-playbook-calismasi` | STAYS | 39,423,258 | 23 | 117 | 2026-11-08 |
| `20261108-seo-aletleri` | STAYS | 68,093 | 6 | 0 | 2026-11-08 |
| `20261109-ilke` | STAYS | 1,966,389 | 1 | 498 | 2026-11-16 |
| `20261109-outletcity-b84` | STAYS | 94,810,898 | 5 | 449 | 2026-11-09 |
| `20261109-sol-zarf` | GOES | 27,550 | 2 | 1 | 2026-11-09 |
| `20261110-efor-kendiliginden` | DOUBT | 1,805,883 | 8 | 3 | 2026-11-10 |
| `20261110-fable-5-2-calisma` | STAYS | 3,877,399 | 2 | 190 | 2026-11-16 |
| `20261110-mod-bolme` | DOUBT | 3,380,760 | 10 | 62 | 2026-11-10 |
| `20261110-mod-deneme` | STAYS | 2,406,747 | 10 | 72 | 2026-11-10 |
| `20261110-sozun-sahibi` | GOES | 2,424,141 | 0 | 33 | 2026-11-10 |
| `20261110-yonetici-oturum` | DOUBT | 417,448 | 2 | 11 | 2026-11-10 |
| `20261111-link-kapisi` | DOUBT | 131,394 | 1 | 4 | 2026-11-11 |
| `20261111-orkestrator-alti-madde` | DOUBT | 1,186,901 | 20 | 5 | 2026-11-11 |
| `20261112-kota-sayaci` | DOUBT | 846,915 | 1 | 7 | 2026-11-12 |
| `20261112-motion-graphics` | STAYS | 3,623,750 | 26 | 28 | 2026-11-13 |
| `20261112-sinir-taramasi` | STAYS | 4,204,525 | 9 | 34 | 2026-11-16 |
| `20261113-uzakta-duzen` | STAYS | 828,064 | 7 | 6 | 2026-11-13 |
| `20261117-b43-sozlesme-sayfasi` | STAYS | 3,432,970 | 13 | 16 | 2026-11-17 |
| `20261117-deneme-2` | STAYS | 27,630 | 3 | 0 | 2026-11-17 |
| `20261117-dosya-boyutu-bekcisi` | STAYS | 672,456 | 10 | 6 | 2026-11-17 |
| `20261117-efor-medium` | DOUBT | 671,041 | 1 | 8 | 2026-11-17 |
| `20261117-kapi-iki-kural` | DOUBT | 255,171 | 2 | 3 | 2026-11-17 |
| `20261117-sekme-tahtaya` | STAYS | 4,708 | 1 | 0 | 2026-11-17 |
| `20261117-temel` | STAYS | 4,087,951 | 26 | 44 | 2026-11-22 |
| `20261117-uzakta-sozle-biter` | DOUBT | 1,710,451 | 1 | 5 | 2026-11-17 |
| `20261118-obscura-zincir` | DOUBT | 1,118,419 | 1 | 1 | 2026-11-18 |
| `20261118-yeni-eklenenler` | DOUBT | 623,266 | 2 | 3 | 2026-11-18 |
| `20261119-studyo-platformu` | STAYS | 271,261 | 4 | 3 | 2026-11-19 |
| `20261120-reklam-filmleri` | STAYS | 128,213,199 | 27 | 457 | 2026-11-20 |
| `20261120-reklam-storyboardlari` | STAYS | 258,386,888 | 2 | 155 | 2026-11-20 |
| `260706-h26-set-up-second-brain-infrastructure-obsid` | DOUBT | 23,169 | 2 | 0 | 2026-07-06 |
| `260712-mno-add-scrapling-github-com-d4vinci-scrapli` | DOUBT | 16,952 | 2 | 0 | 2026-07-12 |

## 5. The proposal

### STAYS

| path | size | files | tracked | untracked+ignored | last change | reason |
|---|---:|---:|---:|---:|---|---|
| `.planning/quick/20261022-iki-yol` | 1,856,761,016 | 59748 | 0 | 59748 | 2026-10-22 | named by living records ROWFILE_OPEN×1: .planning/board-rows/C41.md:40 \| PARTIAL: living lines name only RUNBOOK.md (8,938 B, 1 files); the other 1,856,752,078 B / 59747 files are named by nothing living |
| `.planning/research/watch-links` | 881,186,281 | 3279 | 823 | 2456 | 2026-11-19 | named by living records STATE×3, ROWFILE_OPEN×81, APPROVALS×8, SKILLS×1: .planning/STATE.md:38, .planning/STATE.md:40, .planning/STATE.md:50, .planning/board-rows/B03-bis.md:40 (+89 more) |
| `.planning/quick/20261103-web-ders` | 327,791,812 | 7658 | 236 | 7422 | 2026-11-04 | named by living records ROWFILE_OPEN×2: .planning/board-rows/B28.md:89, .planning/board-rows/B28.md:109 \| PARTIAL: living lines name only tracks/4-reklam-olcum.md, tracks/4-reklam-olcum.md:183-185 (32,919 B, 1 files); the other 327,758,893 B / 7657 files are named by nothing living |
| `.planning/quick/20261120-reklam-storyboardlari` | 258,386,888 | 157 | 2 | 155 | 2026-11-20 | named by living records STATE×2: .planning/STATE.md:32, .planning/STATE.md:64 |
| `.planning/quick/20261120-reklam-filmleri` | 128,213,199 | 484 | 27 | 457 | 2026-11-20 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×3: scripts/governance/ceo-approvals.json:3170, scripts/governance/ceo-approvals.json:3171, scripts/governance/ceo-approvals.json:3172 |
| `.planning/quick/20261109-outletcity-b84` | 94,810,898 | 454 | 5 | 449 | 2026-11-09 | named by living records ROWFILE_OPEN×2: .planning/board-rows/B84.md:100, .planning/board-rows/B84.md:219 |
| `.planning/research/rival-intel` | 80,650,249 | 958 | 957 | 1 | 2026-11-22 | read by tests/c42/rival-intel-ledger.test.ts:20, scripts/rival-intel/{next.sh:12,fetch.sh:16,motion.py:53}, scripts/governance/ledger-truth.mjs:142; PLAN.md cites rival-intel/00-SYNTHESIS.md |
| `.planning/quick/20261104-web-bedava-aletler` | 80,232,550 | 4574 | 25 | 4549 | 2026-11-04 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B84.md:87 \| PARTIAL: living lines name only crawl-test/RUN.md (3,647 B, 1 files); the other 80,228,903 B / 4573 files are named by nothing living |
| `.planning/graphs/graph.json` | 49,651,690 | 1 | 1 | 0 | 2026-11-11 | canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10 |
| `.planning/quick/20261021-dort-yollu-olcum` | 47,755,352 | 206 | 0 | 206 | 2026-10-21 | named by living records APPROVALS×2, SPECS×1: scripts/governance/ceo-approvals.json:2796, scripts/governance/ceo-approvals.json:2812, HOLDING-OS-MASTER-PLAN/AGENT_ORCHESTRATION_SPEC.md:219 |
| `references/design-bank` | 42,081,839 | 191 | 191 | 0 | 2026-07-18 | references/** is 'the CEO's own documents' (scripts/governance/ledger-truth.mjs:130-132 comment); also named by specs/skills |
| `.planning/quick/20261108-playbook-calismasi` | 39,423,258 | 140 | 23 | 117 | 2026-11-08 | named by living records STATE×1, ROWFILE_OPEN×4: .planning/STATE.md:77, .planning/board-rows/B15.md:41, .planning/board-rows/B41.md:60, .planning/board-rows/B64.md:139 (+1 more) |
| `.planning/research/answers` | 35,404,514 | 1660 | 149 | 1511 | 2026-11-07 | named by living records ROWFILE_OPEN×1, APPROVALS×3, SKILLS×6: .planning/board-rows/B28.md:47, scripts/governance/ceo-approvals.json:1510, scripts/governance/ceo-approvals.json:1548, scripts/governance/ceo-approvals.json:1569 (+6 more) |
| `docs/ceo-directives/2026-07-reanalysis/source` | 8,745,991 | 1 | 0 | 1 | 2026-07-29 | the CEO's directives (docs/ceo-directives/) — his material by the brief |
| `.planning/quick/20261009-masa-b51` | 7,072,549 | 90 | 82 | 8 | 2026-10-12 | written by a script: scripts/models/side-by-side.mjs:35 defaults its evidence to this folder's evidence/; db/migrations/20261010070000_b51_p4_opus_5_5_takes_its_seats.sql:38 records a path in it as data; also open board rows B65, B69 \| PARTIAL: living lines name only PLAN.md, SOL-step2.md, SOL-step3.md (21,994 B, 3 files); the other 7,050,555 B / 87 files are named by nothing living |
| `docs/ceo-directives/2026-07-reanalysis/evidence` | 6,761,584 | 11 | 11 | 0 | 2026-08-01 | the CEO's directives (docs/ceo-directives/) — his material by the brief |
| `docs/ceo-directives/2026-07-reanalysis/DXB_GLOBAL_OS_CEO_MASTER_DIRECTIVE.docx` | 6,528,833 | 1 | 1 | 0 | 2026-08-04 | the CEO's directives (docs/ceo-directives/) — his material by the brief |
| `docs/ceo-directives/2026-07-reanalysis/DXB_GLOBAL_OS_CEO_MASTER_DIRECTIVE.BACKUP-2026-08-04.docx` | 6,528,201 | 1 | 1 | 0 | 2026-08-04 | the CEO's directives (docs/ceo-directives/) — his material by the brief |
| `dashboard ve hamza ornekleri ve complaints` | 5,823,642 | 3 | 3 | 0 | 2026-07-29 | the CEO's own samples and complaints (folder name); named by a spec |
| `.planning/phases/08-ceo-dashboard-crm` | 5,246,624 | 45 | 45 | 0 | 2026-07-12 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B81.md:37 |
| `.planning/quick/20261012-b64-is-akisi` | 4,809,869 | 37 | 28 | 9 | 2026-11-16 | named by living records ROWFILE_OPEN×1, TEMEL_ORDER×1, APPROVALS×18, SPECS×25: .planning/board-rows/B64.md:50, .planning/quick/20261117-temel/reorder/ORDER.md:350, scripts/governance/ceo-approvals.json:2316, scripts/governance/ceo-approvals.json:2324 (+41 more) \| PARTIAL: living lines name only PLAN.md, deneme-2026-10-13, is-akisi.html (159,931 B, 8 files); the other 4,649,938 B / 29 files are named by nothing living |
| `references/ceo-complaints-2026-07-19` | 4,733,592 | 29 | 28 | 1 | 2026-07-19 | references/** is 'the CEO's own documents' (scripts/governance/ledger-truth.mjs:130-132 comment); also named by specs/skills |
| `.planning/quick/20261112-sinir-taramasi` | 4,204,525 | 43 | 9 | 34 | 2026-11-16 | named by living records STATE×3, APPROVALS×2: .planning/STATE.md:52, .planning/STATE.md:54, .planning/STATE.md:72, scripts/governance/ceo-approvals.json:3124 (+1 more) \| PARTIAL: living lines name only LISTE.md, SOL.md, sol-e/SOL.md (32,581 B, 3 files); the other 4,171,944 B / 40 files are named by nothing living |
| `.planning/quick/20261004-persona-old-patterns` | 4,130,746 | 27 | 23 | 4 | 2026-10-04 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:2100 |
| `.planning/quick/20261117-temel` | 4,087,951 | 70 | 26 | 44 | 2026-11-22 | the foundation's own job folder (B85) — stays whole by the brief; named by STATE and the open board |
| `.planning/quick/20261110-fable-5-2-calisma` | 3,877,399 | 192 | 2 | 190 | 2026-11-16 | named by living records STATE×2, APPROVALS×1: .planning/STATE.md:54, .planning/STATE.md:74, scripts/governance/ceo-approvals.json:3124 |
| `.planning/quick/20261112-motion-graphics` | 3,623,750 | 54 | 26 | 28 | 2026-11-13 | read by a test: tests/b43/motion-graphics.test.ts:1789 reads its CONTRACT.md (file exists) |
| `.planning/quick/20261117-b43-sozlesme-sayfasi` | 3,432,970 | 29 | 13 | 16 | 2026-11-17 | named by living records STATE×1, APPROVALS×1: .planning/STATE.md:48, scripts/governance/ceo-approvals.json:3132 \| PARTIAL: living lines name only SOL.md, plan.signed.md (16,787 B, 2 files); the other 3,416,183 B / 27 files are named by nothing living |
| `references/ceo-complaints-2026-07-28` | 3,285,747 | 10 | 9 | 1 | 2026-07-28 | references/** is 'the CEO's own documents' (scripts/governance/ledger-truth.mjs:130-132 comment); also named by specs/skills |
| `references/design-direction` | 3,101,237 | 24 | 24 | 0 | 2026-07-11 | references/** is 'the CEO's own documents' (scripts/governance/ledger-truth.mjs:130-132 comment); also named by specs/skills |
| `.planning/quick/20261006-effort-machinery-removal` | 2,464,212 | 10 | 9 | 1 | 2026-10-06 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:2132 |
| `.planning/quick/20261110-mod-deneme` | 2,406,747 | 82 | 10 | 72 | 2026-11-10 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:3113 |
| `.planning/quick/20261109-ilke` | 1,966,389 | 499 | 1 | 498 | 2026-11-16 | named by living records STATE×1: .planning/STATE.md:73 \| PARTIAL: living lines name only reminder-test (432,214 B, 28 files); the other 1,534,175 B / 471 files are named by nothing living |
| `.planning/quick/20261019-degerli-is-danisma` | 1,857,141 | 49 | 5 | 44 | 2026-11-22 | named by living records APPROVALS×1, SKILLS×2, SPECS×2: scripts/governance/ceo-approvals.json:2732, .claude/skills/dxb-team3/SKILL.md:89, .claude/skills/dxb-team2/SKILL.md:91, HOLDING-OS-MASTER-PLAN/AGENT_ORCHESTRATION_SPEC.md:221 (+1 more) |
| `.planning/quick/20261018-gozlem-odasi` | 1,789,954 | 10 | 8 | 2 | 2026-10-18 | named by living records ROWFILE_OPEN×3, APPROVALS×3, SKILLS×1, BOARD_OPEN×1: .planning/board-rows/B64.md:181, .planning/board-rows/B82.md:15, .planning/board-rows/B82.md:20, scripts/governance/ceo-approvals.json:2622 (+4 more) \| PARTIAL: living lines name only HIS-WORDS.md, PLAN.md (18,424 B, 2 files); the other 1,771,530 B / 8 files are named by nothing living |
| `.planning/quick/20261004-locked-tool` | 1,724,513 | 25 | 24 | 1 | 2026-10-04 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×2: scripts/governance/ceo-approvals.json:2120, scripts/governance/ceo-approvals.json:2124 |
| `.planning/graphs/graph.html` | 1,679,195 | 1 | 1 | 0 | 2026-11-11 | canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10 |
| `.planning/quick/20261015-arama-testi` | 1,434,761 | 17 | 15 | 2 | 2026-10-15 | named by living records ROWFILE_OPEN×1, APPROVALS×1, SKILLS×1: .planning/board-rows/B30.md:77, scripts/governance/ceo-approvals.json:2524, .claude/skills/dxb-research/SKILL.md:37 |
| `.planning/quick/20260924-caveman-on-5-5` | 1,124,407 | 116 | 116 | 0 | 2026-09-27 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×4: scripts/governance/ceo-approvals.json:1281, scripts/governance/ceo-approvals.json:1284, scripts/governance/ceo-approvals.json:1316, scripts/governance/ceo-approvals.json:1319 |
| `.planning/quick/20261003-runtime-isolation` | 1,108,859 | 93 | 93 | 0 | 2026-10-04 | read by a test: tests/governance/usage-cost.test.ts:13 runs .planning/quick/20261003-runtime-isolation/usage.mjs (file exists) |
| `.planning/quick/20261014-88-link` | 1,062,460 | 20 | 20 | 0 | 2026-10-14 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×2: scripts/governance/ceo-approvals.json:2484, scripts/governance/ceo-approvals.json:2492 |
| `.planning/board-rows` | 901,053 | 83 | 83 | 0 | 2026-11-22 | the board's row files — written by scripts/board/note-done.mjs:33, read by tests/b43/records-truth.ts:239 and scripts/governance/ledger-truth.mjs:143 |
| `.planning/quick/20261024-zeytin-tek-kol` | 840,431 | 38 | 38 | 0 | 2026-11-16 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:3098 |
| `.planning/quick/20261113-uzakta-duzen` | 828,064 | 13 | 7 | 6 | 2026-11-13 | named by living records STATE×2: .planning/STATE.md:56, .planning/STATE.md:58 \| PARTIAL: living lines name only SOL.md (3,792 B, 1 files); the other 824,272 B / 12 files are named by nothing living |
| `.planning/quick/20261014-iki-video` | 827,567 | 10 | 8 | 2 | 2026-10-14 | named by living records ROWFILE_OPEN×1, APPROVALS×1: .planning/board-rows/B71.md:21, scripts/governance/ceo-approvals.json:2516 \| PARTIAL: living lines name only MERGE.md (6,540 B, 1 files); the other 821,027 B / 9 files are named by nothing living |
| `.planning/quick/20261017-temizlik` | 827,196 | 6 | 4 | 2 | 2026-10-17 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B81.md:10 |
| `.planning/quick/20260903-media-studio-founding` | 683,150 | 41 | 41 | 0 | 2026-09-27 | named by living records STATE×1, ROWFILE_OPEN×2, APPROVALS×23, SPECS×2: .planning/STATE.md:134, .planning/board-rows/B08.md:16, .planning/board-rows/B43.md:123, scripts/governance/ceo-approvals.json:515 (+24 more) |
| `.planning/quick/20261117-dosya-boyutu-bekcisi` | 672,456 | 16 | 10 | 6 | 2026-11-17 | named by living records STATE×1, APPROVALS×1: .planning/STATE.md:44, scripts/governance/ceo-approvals.json:3148 \| PARTIAL: living lines name only SOL.md (11,126 B, 1 files); the other 661,330 B / 15 files are named by nothing living |
| `.planning/quick/20261004-b51-code-and-lock` | 630,424 | 23 | 22 | 1 | 2026-10-04 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×3: scripts/governance/ceo-approvals.json:2076, scripts/governance/ceo-approvals.json:2080, scripts/governance/ceo-approvals.json:2084 \| PARTIAL: living lines name only CARD.md, PLAN-locked-tool.md (12,746 B, 2 files); the other 617,678 B / 21 files are named by nothing living |
| `.planning/quick/20260924-research-door-perplexity` | 628,371 | 16 | 16 | 0 | 2026-09-27 | named by living records APPROVALS×6, SKILLS×1: scripts/governance/ceo-approvals.json:1366, scripts/governance/ceo-approvals.json:1370, scripts/governance/ceo-approvals.json:1450, scripts/governance/ceo-approvals.json:1498 (+3 more) |
| `.planning/graphs/GRAPH_REPORT.md` | 609,617 | 1 | 1 | 0 | 2026-11-11 | canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10 |
| `.planning/STATE-ARCHIVE.md` | 607,711 | 1 | 1 | 0 | 2026-11-16 | named by STATE.md (4 lines) and scripts/governance/rules.json:3; read flat by scripts/governance/ledger-truth.mjs:140 SCOPE |
| `.planning/quick/20261004-design-max` | 531,996 | 14 | 13 | 1 | 2026-10-04 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:1996 |
| `.planning/quick/20260823-construction-company-separation` | 408,734 | 12 | 12 | 0 | 2026-08-25 | read by a script: scripts/b36/company-write-watch.mjs:46-47 reads company-write-baseline.json (file exists) \| PARTIAL: living lines name only EVIDENCE.md, PLAN.md (265,862 B, 2 files); the other 142,872 B / 10 files are named by nothing living |
| `.planning/research/study-cards` | 344,544 | 100 | 100 | 0 | 2026-11-18 | read by scripts/library/intake.mjs:230, scripts/library/register-media-engines.mjs:49, scripts/governance/ledger-truth.mjs:141; named by STATE and 14 open-row-file lines |
| `.planning/quick/20261017-studio-platform-hub` | 276,708 | 16 | 16 | 0 | 2026-11-19 | named by living records ROWFILE_OPEN×6, APPROVALS×7: .planning/board-rows/B43.md:106, .planning/board-rows/B43.md:132, .planning/board-rows/B43.md:162, .planning/board-rows/B43.md:294 (+9 more) \| PARTIAL: living lines name only FINAL.md, R5-youtube-ai-rules-and-risks.md (46,408 B, 2 files); the other 230,300 B / 14 files are named by nothing living |
| `.planning/quick/20261119-studyo-platformu` | 271,261 | 7 | 4 | 3 | 2026-11-19 | named by living records STATE×1, APPROVALS×1: .planning/STATE.md:34, scripts/governance/ceo-approvals.json:3167 |
| `.planning/quick/20261103-web-studio-plan` | 271,108 | 20 | 4 | 16 | 2026-11-16 | named by living records ROWFILE_OPEN×2, APPROVALS×1: .planning/board-rows/B84.md:48, .planning/board-rows/B84.md:57, scripts/governance/ceo-approvals.json:3098 |
| `.planning/quick/20261004-orchestration-door` | 263,453 | 17 | 16 | 1 | 2026-10-04 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:2052 |
| `.planning/quick/20261004-company-memory-drawer` | 257,988 | 19 | 19 | 0 | 2026-10-04 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×4: scripts/governance/ceo-approvals.json:1976, scripts/governance/ceo-approvals.json:1980, scripts/governance/ceo-approvals.json:1984, scripts/governance/ceo-approvals.json:1988 |
| `.planning/quick/20261102-web-studio-personalar` | 249,984 | 23 | 23 | 0 | 2026-11-03 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:3043 \| PARTIAL: living lines name only RAPOR.md (8,474 B, 1 files); the other 241,510 B / 22 files are named by nothing living |
| `.planning/quick/20261014-tahta-sirasi` | 238,337 | 16 | 16 | 0 | 2026-11-22 | named by living records STATE×1, ROWFILE_OPEN×23, TEMEL_ORDER×1, APPROVALS×7: .planning/STATE.md:121, .planning/board-rows/B05.md:60, .planning/board-rows/B31.md:17, .planning/board-rows/B32.md:39 (+28 more) \| PARTIAL: living lines name only HIS-WORDS-2026-10-15.md, ORDER.md, review-R1.md:27, review-R1.md:59 (51,454 B, 3 files); the other 186,883 B / 13 files are named by nothing living |
| `.planning/quick/20260924-signal-revenue-study` | 235,575 | 8 | 8 | 0 | 2026-09-27 | named by living records ROWFILE_OPEN×1, APPROVALS×1: .planning/board-rows/B43.md:157, scripts/governance/ceo-approvals.json:1385 \| PARTIAL: living lines name only EVIDENCE.md, STUDY.md (150,419 B, 2 files); the other 85,156 B / 6 files are named by nothing living |
| `.planning/quick/20260923-prompt-audit` | 219,713 | 14 | 14 | 0 | 2026-09-27 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×2: scripts/governance/ceo-approvals.json:1298, scripts/governance/ceo-approvals.json:1305 \| PARTIAL: living lines name only PROPOSED.diff, REPORT.md (63,421 B, 2 files); the other 156,292 B / 12 files are named by nothing living |
| `.planning/quick/20260925-virtual-creator` | 149,599 | 6 | 6 | 0 | 2026-11-18 | named by living records ROWFILE_OPEN×3: .planning/board-rows/B28.md:90, .planning/board-rows/B43.md:158, .planning/board-rows/B83.md:122 \| PARTIAL: living lines name only PLAN.md, PLAN.md:81 (41,616 B, 1 files); the other 107,983 B / 5 files are named by nothing living |
| `.planning/quick/20261013-jev-olcum` | 148,075 | 15 | 15 | 0 | 2026-10-13 | named by living records APPROVALS×1, SPECS×1: scripts/governance/ceo-approvals.json:2322, HOLDING-OS-MASTER-PLAN/TEST_STRATEGY.md:114 |
| `.planning/research/RESEARCH-ENGINE-2026.md` | 143,406 | 1 | 1 | 0 | 2026-11-16 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B34.md:39 |
| `.planning/quick/20261102-mavi-kusak-tek-opus` | 106,989 | 9 | 9 | 0 | 2026-11-02 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B84.md:29 |
| `.planning/quick/20261001-auditor-exam` | 80,536 | 7 | 5 | 2 | 2026-10-01 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:1752 \| PARTIAL: living lines name only RESULT.md (3,285 B, 1 files); the other 77,251 B / 6 files are named by nothing living |
| `.planning/research/REVENUE-OPPORTUNITIES.md` | 76,143 | 1 | 1 | 0 | 2026-11-18 | named by living records ROWFILE_OPEN×21, APPROVALS×9, SPECS×4, BOARD_OPEN×1: .planning/board-rows/B04.md:36, .planning/board-rows/B05.md:36, .planning/board-rows/B12.md:36, .planning/board-rows/B17.md:16 (+31 more) |
| `.planning/research/INTEGRATION-TRACKER.md` | 68,139 | 1 | 1 | 0 | 2026-11-18 | read by scripts/check-integration-tracker.mjs:17 and tests/phase6/fixtures/known-facts.json:16; 9 open-row-file lines |
| `.planning/quick/20261108-seo-aletleri` | 68,093 | 6 | 6 | 0 | 2026-11-08 | named by living records ROWFILE_OPEN×2: .planning/board-rows/B84.md:88, .planning/board-rows/B84.md:256 |
| `Solo -kadro denetim raporu.odt` | 65,393 | 1 | 0 | 1 | 2026-07-12 | named by 3 spec lines; ignored by git (not in history) — an .odt document, likely his own |
| `.planning/quick/20261104-goz-olcumu` | 51,466 | 15 | 11 | 4 | 2026-11-04 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B84.md:86 \| PARTIAL: living lines name only gemini-api-test.py (2,286 B, 1 files); the other 49,180 B / 14 files are named by nothing living |
| `.planning/phases/09-jarvis-voice-layer` | 49,444 | 8 | 8 | 0 | 2026-07-10 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B81.md:38 |
| `.planning/research/PITFALLS.md` | 40,787 | 1 | 1 | 0 | 2026-11-16 | named by living records ROWFILE_OPEN×1, APPROVALS×1: .planning/board-rows/B30.md:16, scripts/governance/ceo-approvals.json:170 |
| `.planning/quick/20260924-night-content-engine` | 40,370 | 3 | 3 | 0 | 2026-09-27 | named by living records ROWFILE_OPEN×2, APPROVALS×1: .planning/board-rows/B43.md:106, .planning/board-rows/B43.md:157, scripts/governance/ceo-approvals.json:1382 \| PARTIAL: living lines name only PLAN.md (25,885 B, 1 files); the other 14,485 B / 2 files are named by nothing living |
| `.planning/STATE.md` | 38,108 | 1 | 1 | 0 | 2026-11-22 | the state record itself — read by .claude/hooks/spec-bootstrap.sh:32 and tests/b43/records-truth.ts:56 |
| `.planning/quick/20261004-his-list` | 36,748 | 9 | 6 | 3 | 2026-10-04 | named by living records ROWFILE_OPEN×1, APPROVALS×1, SPECS×1: .planning/board-rows/B41.md:23, scripts/governance/ceo-approvals.json:2036, HOLDING-OS-MASTER-PLAN/PERMISSION_MODEL.md:111 \| PARTIAL: living lines name only evidence/tools-probe.txt, item2-report.md:32, item5-report.md (9,642 B, 2 files); the other 27,106 B / 7 files are named by nothing living |
| `.planning/quick/20261103-web-studio-kesif` | 35,281 | 3 | 3 | 0 | 2026-11-16 | named by living records ROWFILE_OPEN×1, APPROVALS×1: .planning/board-rows/B84.md:28, scripts/governance/ceo-approvals.json:3098 |
| `MUSTS from Fable 5 - English.md` | 35,042 | 1 | 1 | 0 | 2026-07-16 | named by 3 spec lines in HOLDING-OS-MASTER-PLAN |
| `Dış Denetim Raporu` | 33,186 | 1 | 1 | 0 | 2026-07-16 | named by a spec (HOLDING-OS-MASTER-PLAN); an audit report addressed to the CEO's plan — his material |
| `.planning/research/skillspector` | 29,594 | 5 | 5 | 0 | 2026-08-27 | named by living records ROWFILE_OPEN×3, APPROVALS×1, SPECS×3: .planning/board-rows/B27.md:20, .planning/board-rows/B41.md:40, .planning/board-rows/B41.md:80, scripts/governance/ceo-approvals.json:115 (+3 more) |
| `.planning/quick/20261117-deneme-2` | 27,630 | 3 | 3 | 0 | 2026-11-17 | named by living records STATE×1, ROWFILE_OPEN×1, APPROVALS×1: .planning/STATE.md:42, .planning/board-rows/B64.md:52, scripts/governance/ceo-approvals.json:3152 |
| `.planning/research/STACK.md` | 27,057 | 1 | 1 | 0 | 2026-11-19 | .claude/CLAUDE.md §5 names it ('read before installing'); tests/phase6/fixtures/known-facts.json:15 |
| `.planning/quick/20260926-b59-context-gate` | 26,449 | 2 | 2 | 0 | 2026-09-27 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:1434 \| PARTIAL: living lines name only EVIDENCE-B60-2026-09-26.md (14,419 B, 1 files); the other 12,030 B / 1 files are named by nothing living |
| `docs/ceo-directives/2026-07-reanalysis/00_READ_FIRST_MASTER_DIRECTIVE.md` | 25,825 | 1 | 1 | 0 | 2026-10-26 | the CEO's directives (docs/ceo-directives/) — his material by the brief |
| `docs/kelam` | 25,395 | 1 | 1 | 0 | 2026-08-01 | named by an open row file and 3 spec lines |
| `.planning/quick/20260928-sol-db-reach` | 25,246 | 4 | 4 | 0 | 2026-09-28 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×2: scripts/governance/ceo-approvals.json:1708, scripts/governance/ceo-approvals.json:1716 |
| `.planning/research/FEATURES.md` | 22,506 | 1 | 1 | 0 | 2026-08-27 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B15.md:16 |
| `.planning/quick/20260925-dxb-team1` | 21,520 | 2 | 2 | 0 | 2026-09-27 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:1426 \| PARTIAL: living lines name only HANDOVER-2026-09-26.md (8,602 B, 1 files); the other 12,918 B / 1 files are named by nothing living |
| `references/engineering-craft` | 20,739 | 4 | 4 | 0 | 2026-11-10 | references/** is 'the CEO's own documents' (scripts/governance/ledger-truth.mjs:130-132 comment); also named by specs/skills |
| `.planning/REQUIREMENTS.md` | 17,869 | 1 | 1 | 0 | 2026-11-16 | named by ceo-approvals.json (4) and specs (3); read flat by scripts/governance/ledger-truth.mjs:140 SCOPE |
| `.planning/research/LITERATURE.md` | 16,178 | 1 | 1 | 0 | 2026-11-18 | named by living records ROWFILE_OPEN×5, TEMEL_ORDER×1, SPECS×1, BOARD_OPEN×1: .planning/board-rows/B16.md:16, .planning/board-rows/B16.md:20, .planning/board-rows/B16.md:32, .planning/board-rows/B30.md:20 (+4 more) |
| `.planning/quick/20260919-the-opening` | 15,031 | 1 | 1 | 0 | 2026-09-27 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×2: scripts/governance/ceo-approvals.json:1017, scripts/governance/ceo-approvals.json:1020 \| PARTIAL: living lines name only PLAN.md (15,031 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/quick/20260719-c-series-remediation` | 13,584 | 1 | 1 | 0 | 2026-07-19 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md:80 \| PARTIAL: living lines name only PLAN.md (13,584 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/research/R4.1-LIBRARY-INTAKE-REPORT.md` | 12,579 | 1 | 1 | 0 | 2026-07-31 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md:191 |
| `.planning/quick/20260714-e101-hook-engine` | 11,993 | 2 | 2 | 0 | 2026-07-14 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/FABLE_5_HOOK_SPEC.md:165 |
| `.planning/quick/20260713-e84b-alert-center` | 11,565 | 2 | 2 | 0 | 2026-07-13 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/OBSERVABILITY_SPEC.md:91 |
| `.planning/research/R4.2-LIBRARY-GAP-MATRIX.md` | 9,666 | 1 | 1 | 0 | 2026-07-17 | named by living records SPECS×3: HOLDING-OS-MASTER-PLAN/CAPABILITY_ARSENAL_DOCTRINE.md:117, HOLDING-OS-MASTER-PLAN/HOLDING_LIBRARY_SPEC.md:144, HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md:192 |
| `.planning/research/E12.3-ROUTE-DOD-MATRIX.md` | 9,513 | 1 | 1 | 0 | 2026-07-18 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md:157 |
| `.planning/research/web-cupboard` | 9,363 | 2 | 2 | 0 | 2026-11-04 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B84.md:299 \| PARTIAL: living lines name only INDEX.md:29 (0 B, 0 files); the other 9,363 B / 2 files are named by nothing living |
| `.planning/quick/20260827-arsenal-watch` | 8,204 | 1 | 1 | 0 | 2026-08-27 | named by living records ROWFILE_OPEN×1, BOARD_OPEN×1: .planning/board-rows/B42.md:16, HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md:127 (B42) \| PARTIAL: living lines name only PLAN.md (8,204 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/quick/20260713-e91-workflow-runner` | 7,623 | 1 | 1 | 0 | 2026-07-13 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/WORKFLOW_ENGINE_SPEC.md:121 \| PARTIAL: living lines name only PLAN.md (7,623 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/quick/20260713-e93-approval-center` | 6,236 | 1 | 1 | 0 | 2026-07-13 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/APPROVAL_ENGINE_SPEC.md:152 \| PARTIAL: living lines name only PLAN.md (6,236 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/quick/20260725-u15-voice-remediation` | 6,135 | 2 | 2 | 0 | 2026-07-25 | named by living records SPECS×2: HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md:178, HOLDING-OS-MASTER-PLAN/00-NOTE-R32-VOICE-REMEDIATION-PLAN.md:22 |
| `.planning/study-cards/speaches.md` | 6,011 | 1 | 1 | 0 | 2026-07-10 | read by scripts/library/intake.mjs:230 (legacy study-card dir) |
| `.planning/quick/20260725-suite-afterall-hygiene` | 5,829 | 2 | 2 | 0 | 2026-07-25 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md:171 |
| `.planning/quick/20260714-e102-spawn-binding` | 5,062 | 2 | 2 | 0 | 2026-07-14 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/FABLE_5_HOOK_SPEC.md:180 |
| `.planning/research/E12.5-CAPABILITY-COVERAGE.md` | 4,981 | 1 | 1 | 0 | 2026-07-18 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md:159 |
| `.planning/research/E13.0-OPERATIONAL-READINESS.md` | 4,911 | 1 | 1 | 0 | 2026-07-28 | named by living records SPECS×1: HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md:165 |
| `.planning/quick/20261117-sekme-tahtaya` | 4,708 | 1 | 1 | 0 | 2026-11-17 | APPROVAL-EVIDENCE ONLY — named by living records APPROVALS×1: scripts/governance/ceo-approvals.json:3144 \| PARTIAL: living lines name only DEVIR.md (4,708 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/quick/20261102-tarz-dolabi` | 4,384 | 1 | 1 | 0 | 2026-11-02 | named by living records ROWFILE_OPEN×2, APPROVALS×3: .planning/board-rows/B84.md:30, .planning/board-rows/B84.md:238, scripts/governance/ceo-approvals.json:3003, scripts/governance/ceo-approvals.json:3007 (+1 more) \| PARTIAL: living lines name only DESIGN.md (4,384 B, 1 files); the other 0 B / 0 files are named by nothing living |
| `.planning/quick/20260725-u15-voice-round2` | 3,568 | 1 | 1 | 0 | 2026-07-25 | named by living records SPECS×2: HOLDING-OS-MASTER-PLAN/00-NOTE-R32-VOICE-REMEDIATION-PLAN.md:8, HOLDING-OS-MASTER-PLAN/VOICE_INTERACTION_SPEC.md:264 |
| `.planning/governance/model-routing-hierarchy.md` | 2,321 | 1 | 1 | 0 | 2026-11-16 | named by specs (5) and ceo-approvals.json (3); the model-routing copy the memory index points to |
| `.planning/quick/20261021-ekim-linkleri` | 2,204 | 1 | 1 | 0 | 2026-10-21 | named by living records ROWFILE_OPEN×1: .planning/board-rows/B64.md:173 \| PARTIAL: living lines name only RECORD.md:25 (0 B, 0 files); the other 2,204 B / 1 files are named by nothing living |
| `.planning/graphs/README.md` | 2,076 | 1 | 1 | 0 | 2026-08-26 | canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10 |
| `docs/ceo-directives/2026-07-reanalysis/README.txt` | 1,575 | 1 | 1 | 0 | 2026-08-02 | the CEO's directives (docs/ceo-directives/) — his material by the brief |
| `.planning/graphs/BUILD.json` | 265 | 1 | 1 | 0 | 2026-11-11 | canonical graph copy: scripts/governance/graph-refresh.mjs:28 CANON, tests/b23/graph-is-not-stale.test.ts:10 |

### GOES

| path | size | files | tracked | untracked+ignored | last change | reason |
|---|---:|---:|---:|---:|---|---|
| `.planning/quick/20261110-sozun-sahibi` | 2,424,141 | 33 | 0 | 33 | 2026-11-10 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261021-b03bis` | 2,087,202 | 13 | 9 | 4 | 2026-10-21 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261101-gelir-sol` | 1,513,202 | 5 | 1 | 4 | 2026-11-01 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261006-dxb-team2-lean` | 1,025,508 | 20 | 18 | 2 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/graph.html) |
| `.planning/quick/20261013-b41-tasarim-becerileri` | 1,000,882 | 9 | 7 | 2 | 2026-10-13 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261008-four-equal-arrangements` | 845,909 | 14 | 4 | 10 | 2026-10-08 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261006-typecheck-tests` | 799,961 | 6 | 4 | 2 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261006-door-overall-look` | 628,610 | 4 | 2 | 2 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261006-fable-review-fixes` | 560,380 | 9 | 7 | 2 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261015-scrollcraft-studio` | 469,110 | 16 | 14 | 2 | 2026-10-15 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261019-canli-dinlenme` | 415,716 | 3 | 1 | 2 | 2026-10-19 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261012-xhigh-plan` | 326,493 | 5 | 3 | 2 | 2026-10-12 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261006-sol-dump-sweep` | 285,684 | 5 | 3 | 2 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261019-excel-tab` | 260,798 | 7 | 3 | 4 | 2026-10-19 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20261006-medium-first` | 148,621 | 5 | 1 | 4 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261006-handover-clean-break` | 133,480 | 4 | 2 | 2 | 2026-10-06 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261019-calisma1-door` | 84,610 | 3 | 1 | 2 | 2026-10-19 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261014-yan-calisma-kapisi` | 65,939 | 4 | 2 | 2 | 2026-10-14 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261001-score-card-gate` | 51,266 | 11 | 11 | 0 | 2026-10-01 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261003-doors-slim` | 31,915 | 8 | 8 | 0 | 2026-10-03 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `d07-desktop.jpeg` | 29,770 | 1 | 0 | 1 | 2026-11-04 | a loose screenshot (2026-11-04), untracked, named by nothing |
| `.planning/quick/20261109-sol-zarf` | 27,550 | 3 | 2 | 1 | 2026-11-09 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/graph.html) |
| `.planning/quick/20261001-pin-auto-review` | 14,762 | 3 | 3 | 0 | 2026-10-01 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260714-e95-library` | 13,316 | 2 | 2 | 0 | 2026-07-14 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/research/.cache` | 10,592 | 22 | 0 | 22 | 2026-07-06 | ignored cache (.gitignore:25), 22 files from 2026-07-06; only CODE hit is .gitignore |
| `.planning/quick/20260725-fable-to-opus5-rename` | 9,078 | 2 | 2 | 0 | 2026-07-25 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260713-e71-model-routing` | 8,626 | 2 | 2 | 0 | 2026-07-13 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260724-chat-dictation-voice-merge` | 8,570 | 2 | 2 | 0 | 2026-07-24 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260713-e83-ops-live` | 7,342 | 2 | 2 | 0 | 2026-07-13 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260821-gece-vardiyasi` | 7,301 | 1 | 1 | 0 | 2026-08-21 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260725-c9-filterbar-rollout` | 6,507 | 2 | 2 | 0 | 2026-07-25 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260724-9c9d9e-data-controls` | 6,447 | 2 | 2 | 0 | 2026-07-24 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260724-10d10e-portfolio-responsibility` | 6,047 | 2 | 2 | 0 | 2026-07-24 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260714-e94-project-command-view` | 5,850 | 1 | 1 | 0 | 2026-07-14 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260719-c9-filter-bar-rollout` | 5,632 | 2 | 2 | 0 | 2026-07-19 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260727-w26-proactive-briefing` | 5,273 | 1 | 1 | 0 | 2026-07-27 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260714-e111-cost-breakdown` | 5,263 | 2 | 2 | 0 | 2026-07-14 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260717-r42-library-enrichment` | 5,127 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260718-e125-workforce-gate` | 4,445 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261012-b64-sayfa` | 4,375 | 2 | 0 | 2 | 2026-10-12 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260726-w25-autonomous-work` | 4,348 | 1 | 1 | 0 | 2026-07-26 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260726-w23-revenue-gates` | 4,128 | 1 | 1 | 0 | 2026-07-26 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260718-r43-capability-arsenal` | 3,820 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260718-e122-widget-system` | 3,682 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260724-machine-room` | 3,432 | 2 | 2 | 0 | 2026-07-24 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260718-e131-test-run` | 3,402 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260714-e121-real-data-pages` | 3,343 | 1 | 1 | 0 | 2026-07-14 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260726-brain-floor` | 3,332 | 1 | 1 | 0 | 2026-07-26 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260713-e92-workflow-settings-ui` | 3,306 | 1 | 1 | 0 | 2026-07-13 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20261107-fleet-gate` | 3,173 | 1 | 0 | 1 | 2026-11-07 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260724-3a3b-dead-click-sweep` | 3,109 | 2 | 2 | 0 | 2026-07-24 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260718-e133-ceo-manual` | 2,931 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260724-19e-decisions-content-i18n` | 2,925 | 2 | 2 | 0 | 2026-07-24 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260718-e123-route-gate` | 2,597 | 2 | 2 | 0 | 2026-07-18 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260726-critical-gate` | 2,443 | 1 | 1 | 0 | 2026-07-26 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260717-r32-live-defect-remediation` | 1,888 | 1 | 1 | 0 | 2026-07-17 | named by no living record, read by no code, named by no other paper or memory |
| `.planning/quick/20260723-helptip-depth` | 1,495 | 1 | 1 | 0 | 2026-07-23 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |
| `.planning/quick/20260719-e131-f09-close` | 1,202 | 1 | 1 | 0 | 2026-07-19 | named by no living record, read by no code, named by no other paper or memory; only the generated graph index names it (.planning/graphs/GRAPH_REPORT.md, .planning/graphs/graph.html) |

### DOUBT

| path | size | files | tracked | untracked+ignored | last change | reason |
|---|---:|---:|---:|---:|---|---|
| `.planning/quick/20261105-gorsel-karsilastirma` | 93,158,112 | 95 | 0 | 95 | 2026-11-05 | named only by closed row/closing evidence: .planning/board-rows/archive/B43-full-record-to-2026-11-17.md:123 |
| `.planning/quick/20261101-gelir-devir` | 56,068,758 | 133 | 0 | 133 | 2026-11-01 | paper-only (a staying paper names it) — named only by other papers: .planning/research/watch-links/2026-11-18-recheck/rows/k1-a.md:10, .planning/research/watch-links/2026-11-18-recheck/rows/k1-a.md:140, .planning/research/watch-links/2026-11-18-recheck/rows/k1-a.md:202 (+5 more) \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261021-uc-seviye` | 7,354,320 | 134 | 0 | 134 | 2026-10-28 | named only by foundation folder's working papers (not PLAN/ORDER): .planning/quick/20261117-temel/workers/blind/EVIDENCE.md:60 |
| `.planning/quick/20261028-deneme-sol` | 5,496,054 | 15 | 0 | 15 | 2026-10-29 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261117-deneme-2/ZEMIN.md:25 \| the naming papers' own class: STAYS×1 |
| `.playwright-mcp` | 4,204,601 | 172 | 0 | 172 | 2026-11-14 | ignored Playwright-MCP screenshot dump (172 files); named by open row file .planning/board-rows/B62.md:16 — check whether B62 needs a file from it; .gitignore:60 says durable evidence is copied into .planning/phases/*/evidence/ |
| `.planning/quick/20261110-mod-bolme` | 3,380,760 | 72 | 10 | 62 | 2026-11-10 | paper-only (a staying paper names it) — named only by other papers: .planning/STATE-ARCHIVE.md:2815, .planning/quick/20261110-fable-5-2-calisma/yedek/memory/helper-names-carry-model-and-effort-2026-11-10.md:15 \| the naming papers' own class: STAYS×2 |
| `.planning/quick/20261004-memory-followups` | 2,782,795 | 20 | 18 | 2 | 2026-10-04 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:2402 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261110-efor-kendiliginden` | 1,805,883 | 11 | 8 | 3 | 2026-11-10 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:2817 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261117-uzakta-sozle-biter` | 1,710,451 | 6 | 1 | 5 | 2026-11-17 | touched 2026-11-17 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `.planning/quick/20261108-kisayol` | 1,202,736 | 56 | 51 | 5 | 2026-11-08 | named by a reader: tools/studio-prompts/kisayol/quarry/build_quarry.py:29-33 reads catalog-*.tsv from this folder — but no catalog-*.tsv exists there today (find returned nothing), so the reader is already broken; open row files cite it too |
| `.planning/quick/20261111-orkestrator-alti-madde` | 1,186,901 | 25 | 20 | 5 | 2026-11-11 | paper-only (a staying paper names it) — named only by other papers: .planning/STATE-ARCHIVE.md:2811, .planning/STATE-ARCHIVE.md:2813, .planning/quick/20261110-fable-5-2-calisma/yedek/memory/design-trials-2026-11-11-are-not-a-measure.md:12 \| the naming papers' own class: STAYS×2 |
| `.planning/quick/20261118-obscura-zincir` | 1,118,419 | 2 | 1 | 1 | 2026-11-18 | touched 2026-11-18 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `.archify/workflow-b43-sozlesme-sayfasi-20261117-084500` | 1,058,636 | 9 | 0 | 9 | 2026-11-17 | touched 2026-11-17 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `var/jarvis.log` | 1,033,831 | 1 | 0 | 1 | 2026-09-14 | voice daemon log, last written 2026-09-14; named by open row file C38.md:16 and ceo-approvals.json:723,725 — runtime log, not a job paper |
| `.archify/workflow-studyo-platformu-20261119-1150` | 954,614 | 6 | 0 | 6 | 2026-11-19 | touched 2026-11-19 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `.planning/quick/20261112-kota-sayaci` | 846,915 | 8 | 1 | 7 | 2026-11-12 | touched 2026-11-12 (inside the last 10 days) and named by no living record — may be work in progress of a running session; named by papers: .planning/quick/20261112-motion-graphics/DEVIR-2.md:20 |
| `.planning/quick/20260725-ceo-morning-decisions` | 769,696 | 6 | 6 | 0 | 2026-07-25 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:263 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261014-b64-adim1` | 749,855 | 7 | 3 | 4 | 2026-10-14 | named only by code comment: tests/c9/chat-legs.test.ts:493 |
| `.planning/quick/20261004-auditor-text` | 738,214 | 13 | 12 | 1 | 2026-10-04 | paper-only (a staying paper names it) — named only by other papers: .planning/STATE-ARCHIVE.md:2294, .planning/quick/20261006-effort-machinery-removal/SOL.md:2377, .planning/quick/20261006-effort-machinery-removal/SOL.md:2547 \| the naming papers' own class: STAYS×2 |
| `.planning/quick/20261028-b64-deneme-kurallari` | 679,607 | 4 | 0 | 4 | 2026-10-28 | paper-only (namers do not stay) — named only by other papers: .planning/quick/20261028-deneme-sol/run-sol-a.sh:3, .planning/quick/20261028-deneme-sol/run-sol-c.sh:3, .planning/quick/20261028-deneme-sol/run-sol-b.sh:3 \| the naming papers' own class: DOUBT×1 |
| `.planning/quick/20261117-efor-medium` | 671,041 | 9 | 1 | 8 | 2026-11-17 | touched 2026-11-17 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `.planning/quick/20261118-yeni-eklenenler` | 623,266 | 5 | 2 | 3 | 2026-11-18 | touched 2026-11-18 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `.planning/quick/20261027-b64-inceleme` | 601,180 | 5 | 1 | 4 | 2026-10-27 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:2676 \| the naming papers' own class: STAYS×1 |
| `.planning/research/jev` | 449,450 | 60 | 60 | 0 | 2026-09-23 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261014-88-link/reader-fable.md:965, .planning/quick/20261014-88-link/input/batch-8.md:217, .planning/quick/20261014-88-link/input/batch-8.md:222 (+4 more) \| the naming papers' own class: STAYS×2 |
| `.planning/quick/20261107-dxb-verify` | 431,224 | 5 | 3 | 2 | 2026-11-07 | paper-only (namers do not stay) — named only by other papers: .planning/quick/20261110-yonetici-oturum/fable-audit.md:7 \| the naming papers' own class: DOUBT×1 |
| `.planning/quick/20261110-yonetici-oturum` | 417,448 | 13 | 2 | 11 | 2026-11-10 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:2815 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261021-musteri-gozu` | 410,227 | 7 | 1 | 6 | 2026-10-21 | paper-only (namers do not stay) — named only by other papers: .planning/quick/20261021-uc-seviye/arm-2/CARD.md:37 \| the naming papers' own class: DOUBT×1 |
| `.planning/quick/20261117-kapi-iki-kural` | 255,171 | 5 | 2 | 3 | 2026-11-17 | touched 2026-11-17 (inside the last 10 days) and named by no living record — may be work in progress of a running session |
| `.planning/quick/20261019-ye18-pocock` | 209,817 | 4 | 2 | 2 | 2026-10-19 | paper-only (a staying paper names it) — named only by other papers: .planning/research/watch-links/2026-11-18-recheck/yeni-eklenenler/BRIEF.md:38 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261111-link-kapisi` | 131,394 | 5 | 1 | 4 | 2026-11-11 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:2811 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20261107-ugc` | 92,206 | 9 | 9 | 0 | 2026-11-08 | paper-only (namers do not stay) — named only by other papers: .planning/quick/20261108-kisayol/BRIEF.md:11, .planning/quick/20261108-kisayol/BRIEF.md:12, .planning/quick/20261108-kisayol/WRITERS-BRIEF.md:17 (+7 more) \| the naming papers' own class: DOUBT×1 |
| `.planning/quick/20261004-live-turn-bar` | 81,227 | 25 | 25 | 0 | 2026-10-04 | paper-only (a staying paper names it) — named only by other papers: .planning/STATE-ARCHIVE.md:2353, .planning/quick/20261006-effort-machinery-removal/SOL.md:1371, .planning/quick/20261006-effort-machinery-removal/evidence/dxb-statusline.before.js:170 (+1 more) \| the naming papers' own class: STAYS×3 |
| `.planning/research/AGENT-REACH-CLI-SURFACE-2026-09-16.md` | 47,547 | 1 | 1 | 0 | 2026-09-27 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261014-88-link/input/batch-4.md:175; NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat \| the naming papers' own class: STAYS×1 |
| `.planning/research/KEYLESS-MCP-SEARCH-ENDPOINTS-2026-09-16.md` | 38,546 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/quick/20261029-web-ofisi-devir` | 37,794 | 4 | 0 | 4 | 2026-11-08 | named only by foundation folder's working papers (not PLAN/ORDER): .planning/quick/20261117-temel/workers/fable-audit.md:11, .planning/quick/20261117-temel/workers/blind/EVIDENCE.md:37 (+1 more) |
| `.planning/research/OPENCLI-WINDOW-FLAG-2026-09-16.md` | 37,464 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `docs/source-architecture-notes-sanitized.md` | 37,019 | 1 | 1 | 0 | 2026-07-06 | named only by papers: STATE-ARCHIVE.md, research/rival-intel/00-LEDGER.md (stays), research/rival-intel/16-openjarvis-repo.md (stays) |
| `.planning/research/TAVILY-MCP-KEYLESS-HEADER-2026-09-16.md` | 33,815 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/quick/20261023-calisan-sistemi` | 31,535 | 11 | 0 | 11 | 2026-10-28 | named only by foundation folder's working papers (not PLAN/ORDER): .planning/quick/20261117-temel/workers/blind/EVIDENCE.md:60 |
| `.planning/quick/260706-h26-set-up-second-brain-infrastructure-obsid` | 23,169 | 2 | 2 | 0 | 2026-07-06 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:255 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/260712-mno-add-scrapling-github-com-d4vinci-scrapli` | 16,952 | 2 | 2 | 0 | 2026-07-12 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:261 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260713-org-chart-professional` | 13,133 | 2 | 2 | 0 | 2026-07-13 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:264 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260728-ledger-truth-gate` | 9,568 | 2 | 2 | 0 | 2026-07-28 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261006-effort-machinery-removal/SOL.md:1081 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260713-e84-audit-surface` | 9,521 | 2 | 2 | 0 | 2026-07-13 | named only by code comment: apps/dashboard/src/components/gov/gov-tabs.tsx:7, db/migrations/20260713070000_e84_audit_surface.sql:10 |
| `.planning/research/2026-09-16-reddit-claude-design-vs-open-design.md` | 8,951 | 1 | 1 | 0 | 2026-09-27 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261014-88-link/input/batch-3.md:136; NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat \| the naming papers' own class: STAYS×1 |
| `.planning/research/SEARXNG-GOOGLE-ENGINE-ISSUES-2026-09-16.md` | 8,831 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/research/STOP-HOOK-BLOCK-CEILING-2026-09-16.md` | 8,743 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/research/CLAUDE-CODE-POSTTOOLUSE-HOOK-STDIN-2026-09-16.md` | 8,561 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/quick/20260922-session-opening-budget` | 7,573 | 1 | 1 | 0 | 2026-09-27 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261110-fable-5-2-calisma/yedek/memory/ask-before-switching-off-any-tool-2026-09-22.md:38 \| the naming papers' own class: STAYS×1 |
| `.planning/research/SKILL-FRONTMATTER-HOOKS-2026-09-16.md` | 6,871 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/research/LANGCHAIN-OPEN-DEEP-RESEARCH-STATE-2026-09-16.md` | 6,569 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/quick/20261103-mavi-kusak-max` | 6,262 | 1 | 1 | 0 | 2026-11-03 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:2764 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260924-code-gate` | 6,234 | 1 | 1 | 0 | 2026-09-27 | named only by closed row/closing evidence: HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md:369 (B54) |
| `.planning/quick/20260710-login-redesign` | 5,854 | 2 | 2 | 0 | 2026-07-10 | named in code (not a verified reader — check): apps/dashboard/src/app/globals.css:196 |
| `.planning/research/OPEN-DEEP-RESEARCH-REPO-STATE-2026-09-16.md` | 5,488 | 1 | 1 | 0 | 2026-09-27 | named by nothing living, read by nothing (no hit in any living record, code, paper or memory); NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/research/E12.5-WORKFORCE-BASELINE.md` | 4,895 | 1 | 1 | 0 | 2026-11-22 | touched 2026-11-22 (inside the last 10 days) and named by no living record — may be work in progress of a running session; named by papers: .planning/quick/20260718-e125-workforce-gate/PLAN.md:6, .planning/quick/20260728-ledger-truth-gate/SUMMARY.md:35; NOTE scripts/library/intake.mjs:193 lists every .md in .planning/research as a library asset, and ledger-truth.mjs:141 reads the folder flat |
| `.planning/quick/20260724-c5-trigger-workforce-truth` | 4,743 | 2 | 2 | 0 | 2026-07-24 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20261110-fable-5-2-calisma/yedek/memory/july-2026-session-lessons.md:164 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260718-e124-crm-gate` | 3,333 | 2 | 2 | 0 | 2026-07-18 | paper-only (a staying paper names it) — named only by other papers: .planning/quick/20260923-prompt-audit/slices/d1-personas.md:41 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260710-ui-spec-amendment-a1` | 3,036 | 2 | 2 | 0 | 2026-07-10 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:258 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260713-sicil-backfill` | 2,975 | 1 | 1 | 0 | 2026-07-13 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:262 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260710-approvals-readable-payload` | 2,378 | 2 | 2 | 0 | 2026-07-10 | named only by STATE-ARCHIVE.md (history) — named only by other papers: .planning/STATE-ARCHIVE.md:259 \| the naming papers' own class: STAYS×1 |
| `.planning/quick/20260710-beklentiler-master-plan-v2` | 2,064 | 1 | 1 | 0 | 2026-07-10 | paper-only (a staying paper names it) — named only by other papers: .planning/STATE-ARCHIVE.md:159, .planning/quick/20261014-tahta-sirasi/rows-A.md:176 \| the naming papers' own class: STAYS×2 |
| `.planning/quick/20261015-ekim-linkleri` | 1,568 | 1 | 1 | 0 | 2026-10-15 | paper-only (a staying paper names it) — named only by other papers: .planning/STATE-ARCHIVE.md:2612, .planning/research/watch-links/2026-11-18-recheck/BRIEF.md:37, .planning/research/watch-links/2026-11-18-recheck/rows/e1-b.md:237 (+2 more) \| the naming papers' own class: STAYS×2 |

### NOT A CANDIDATE (code, config, runtime state, generated output)

| path | size | files | tracked | untracked+ignored | last change | reason |
|---|---:|---:|---:|---:|---|---|
| `.agents/skills` | 2,101,212 | 122 | 111 | 11 | 2026-11-22 | Codex mirror of the skills (111 of 122 files tracked); read by Codex sessions — mechanism, not a paper |
| `.claude` | 2,167,393 | 129 | 117 | 12 | 2026-11-22 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.codex/config.toml` | 315 | 1 | 0 | 1 | 2026-10-10 | Codex config |
| `.codex/hooks` | 9,485 | 2 | 2 | 0 | 2026-11-22 | Codex hooks |
| `.codex/hooks.json` | 236 | 1 | 1 | 0 | 2026-10-01 | Codex hooks |
| `.dockerignore` | 395 | 1 | 1 | 0 | 2026-07-10 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.env` | 26 | 1 | 0 | 1 | 2026-08-24 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.env.daemon` | 33 | 1 | 0 | 1 | 2026-08-24 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.env.example` | 1,327 | 1 | 1 | 0 | 2026-07-06 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.gitattributes` | 39 | 1 | 1 | 0 | 2026-08-26 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.github` | 2,603 | 2 | 2 | 0 | 2026-08-26 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.gitignore` | 4,092 | 1 | 1 | 0 | 2026-11-05 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.gitleaks.toml` | 322 | 1 | 1 | 0 | 2026-07-06 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.graphifyignore` | 238 | 1 | 1 | 0 | 2026-10-06 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.mcp.json` | 356 | 1 | 1 | 0 | 2026-08-27 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.ripgreprc` | 1,237 | 1 | 1 | 0 | 2026-08-17 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.scrollcraft.json` | 37 | 1 | 1 | 0 | 2026-08-27 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `.vscode` | 38 | 1 | 0 | 1 | 2026-11-05 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `AGENTS.md` | 13,225 | 1 | 1 | 0 | 2026-11-22 | Codex's instruction file (counterpart of .claude/CLAUDE.md) — mechanism |
| `DXB.code-workspace` | 1,751 | 1 | 1 | 0 | 2026-07-26 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `HOLDING-OS-MASTER-PLAN` | 1,558,461 | 58 | 58 | 0 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `README.md` | 3,852 | 1 | 1 | 0 | 2026-11-22 | repository readme — not a job paper |
| `apps` | 215,536,769 | 521 | 206 | 315 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `construction` | 16,997 | 4 | 3 | 1 | 2026-10-21 | code / specs / dependencies — outside the first cut by the brief |
| `db` | 1,608,556 | 197 | 197 | 0 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `graphify-out/.graphify_analysis.json` | 3,425,219 | 1 | 0 | 1 | 2026-11-11 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/.graphify_labels.json` | 125,247 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/.graphify_labels.json.sig` | 75,050 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/.graphify_root` | 23 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/GRAPH_REPORT.md` | 630,608 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/cache` | 96,681,869 | 7128 | 0 | 7128 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/graph.html` | 1,687,134 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/graph.json` | 48,874,916 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `graphify-out/manifest.json` | 4,847,842 | 1 | 0 | 1 | 2026-11-22 | graphify's working output: written by scripts/hooks/post-commit (graphify hook) and read by scripts/governance/graph-refresh.mjs:29 WORKING; ignored (.gitignore:28) |
| `node_modules` | 1,050,210,346 | 38439 | 0 | 38439 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `package.json` | 3,422 | 1 | 1 | 0 | 2026-11-12 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `packages` | 21,005,185 | 1030 | 541 | 489 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `pnpm-lock.yaml` | 163,892 | 1 | 1 | 0 | 2026-10-17 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `pnpm-workspace.yaml` | 975 | 1 | 1 | 0 | 2026-10-10 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `scripts` | 2,159,632 | 146 | 143 | 3 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `supabase` | 16,196 | 4 | 3 | 1 | 2026-07-10 | code / specs / dependencies — outside the first cut by the brief |
| `tests` | 3,118,351 | 317 | 317 | 0 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `tmp/outbox-proof` | 156 | 2 | 0 | 2 | 2026-11-22 | test scratch: written by tests/phase4/{toctou,gate-canary,double-fire}.test.ts and packages/outbox-executor/src/actions/test-write-file.ts:13 — regenerated each run, ignored (.gitignore:43) |
| `tools` | 1,245,047 | 120 | 69 | 51 | 2026-11-22 | code / specs / dependencies — outside the first cut by the brief |
| `tsconfig.base.json` | 244 | 1 | 1 | 0 | 2026-07-06 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `tsconfig.json` | 739 | 1 | 1 | 0 | 2026-10-17 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `tsconfig.tests.json` | 746 | 1 | 1 | 0 | 2026-10-06 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `var/b36` | 424,828 | 4 | 0 | 4 | 2026-09-28 | runtime state written/read by scripts/b36/install-company-window.mjs:346 and prove-*.mjs |
| `var/board` | 855,602 | 3 | 0 | 3 | 2026-11-22 | board render output: scripts/board/render.mjs:37,538, movement.mjs:31 |
| `var/board-watch.log` | 179,612 | 1 | 0 | 1 | 2026-11-22 | service log of the board watcher (scripts/board/watch.mjs) |
| `var/company-read-gateway.log` | 130,211 | 1 | 0 | 1 | 2026-11-22 | service log (company read gateway) |
| `var/construction-fixtures` | 0 | 0 | 0 | 0 |  | empty runtime dir |
| `var/construction-gateway-profiles` | 29,492 | 25 | 0 | 25 | 2026-09-16 | read by vitest.config.ts:93 |
| `var/construction-memory` | 391,204 | 1084 | 0 | 1084 | 2026-11-22 | read by tests/phase6/memory-drawer.test.ts:65 and vitest.config.ts:98 |
| `var/freeze-guard.log` | 539,449 | 1 | 0 | 1 | 2026-11-22 | written by scripts/ops/freeze-guard.sh:61; named by open row file B62.md:36 |
| `var/measure` | 1,905,263 | 25 | 0 | 25 | 2026-09-26 | written by scripts/measure/startup-budget.sh:74,154,358 |
| `var/media-factory` | 655 | 1 | 0 | 1 | 2026-08-26 | runtime dir named by open row file B28.md:17 and ceo-approvals.json:340 |
| `var/research` | 443,627,369 | 23611 | 0 | 23611 | 2026-11-07 | research engine's run store: .claude/skills/dxb-research/fleet/fleet.sh:490-510, tests/b46/completion-gate.test.ts:155 — 443 MB, ignored |
| `var/scheduler.log` | 1,233,215 | 1 | 0 | 1 | 2026-10-14 | read by scripts/hr/wave-monitor.sh:45; scheduler service log |
| `var/voice` | 0 | 0 | 0 | 0 |  | packages/voice/src/paths.ts:22 |
| `vitest.config.ts` | 6,328 | 1 | 1 | 0 | 2026-11-22 | configuration / mechanism (hooks, settings, tool config) — not a paper |
| `vps` | 55,461 | 25 | 22 | 3 | 2026-11-19 | code / specs / dependencies — outside the first cut by the brief |

## 6. Partial — inside staying folders, what living records name

| folder | size | named sub-paths | named bytes | unnamed remainder |
|---|---:|---|---:|---:|
| `.planning/quick/20261022-iki-yol` | 1,856,761,016 | RUNBOOK.md | 8,938 | 1,856,752,078 |
| `.planning/quick/20261103-web-ders` | 327,791,812 | tracks/4-reklam-olcum.md, tracks/4-reklam-olcum.md:183-185 | 32,919 | 327,758,893 |
| `.planning/quick/20261104-web-bedava-aletler` | 80,232,550 | crawl-test/RUN.md | 3,647 | 80,228,903 |
| `.planning/quick/20261009-masa-b51` | 7,072,549 | PLAN.md, SOL-step2.md, SOL-step3.md | 21,994 | 7,050,555 |
| `.planning/quick/20261012-b64-is-akisi` | 4,809,869 | PLAN.md, deneme-2026-10-13, is-akisi.html | 159,931 | 4,649,938 |
| `.planning/quick/20261112-sinir-taramasi` | 4,204,525 | LISTE.md, SOL.md, sol-e/SOL.md | 32,581 | 4,171,944 |
| `.planning/quick/20261117-b43-sozlesme-sayfasi` | 3,432,970 | SOL.md, plan.signed.md | 16,787 | 3,416,183 |
| `.planning/quick/20261018-gozlem-odasi` | 1,789,954 | HIS-WORDS.md, PLAN.md | 18,424 | 1,771,530 |
| `.planning/quick/20261109-ilke` | 1,966,389 | reminder-test | 432,214 | 1,534,175 |
| `.planning/quick/20261113-uzakta-duzen` | 828,064 | SOL.md | 3,792 | 824,272 |
| `.planning/quick/20261014-iki-video` | 827,567 | MERGE.md | 6,540 | 821,027 |
| `.planning/quick/20261117-dosya-boyutu-bekcisi` | 672,456 | SOL.md | 11,126 | 661,330 |
| `.planning/quick/20261004-b51-code-and-lock` | 630,424 | CARD.md, PLAN-locked-tool.md | 12,746 | 617,678 |
| `.planning/quick/20261102-web-studio-personalar` | 249,984 | RAPOR.md | 8,474 | 241,510 |
| `.planning/quick/20261017-studio-platform-hub` | 276,708 | FINAL.md, R5-youtube-ai-rules-and-risks.md | 46,408 | 230,300 |
| `.planning/quick/20261014-tahta-sirasi` | 238,337 | HIS-WORDS-2026-10-15.md, ORDER.md, review-R1.md:27, review-R1.md:59, review-R2.md:41, review-R2.md:67 | 51,454 | 186,883 |
| `.planning/quick/20260923-prompt-audit` | 219,713 | PROPOSED.diff, REPORT.md | 63,421 | 156,292 |
| `.planning/quick/20260823-construction-company-separation` | 408,734 | EVIDENCE.md, PLAN.md | 265,862 | 142,872 |
| `.planning/quick/20260925-virtual-creator` | 149,599 | PLAN.md, PLAN.md:81 | 41,616 | 107,983 |
| `.planning/quick/20260924-signal-revenue-study` | 235,575 | EVIDENCE.md, STUDY.md | 150,419 | 85,156 |
| `.planning/quick/20261001-auditor-exam` | 80,536 | RESULT.md | 3,285 | 77,251 |
| `.planning/quick/20261104-goz-olcumu` | 51,466 | gemini-api-test.py | 2,286 | 49,180 |
| `.planning/quick/20261004-his-list` | 36,748 | evidence/tools-probe.txt, item2-report.md:32, item5-report.md | 9,642 | 27,106 |
| `.planning/quick/20260924-night-content-engine` | 40,370 | PLAN.md | 25,885 | 14,485 |
| `.planning/quick/20260925-dxb-team1` | 21,520 | HANDOVER-2026-09-26.md | 8,602 | 12,918 |
| `.planning/quick/20260926-b59-context-gate` | 26,449 | EVIDENCE-B60-2026-09-26.md | 14,419 | 12,030 |
| `.planning/research/web-cupboard` | 9,363 | INDEX.md:29 | 0 | 9,363 |
| `.planning/quick/20261021-ekim-linkleri` | 2,204 | RECORD.md:25 | 0 | 2,204 |

## 7. The twenty largest GOES

| # | path | size | tracked files | untracked+ignored files | untracked+ignored bytes (permanent on delete) |
|---:|---|---:|---:|---:|---:|
| 1 | `.planning/quick/20261110-sozun-sahibi` | 2,424,141 | 0 | 33 | 2,424,141 |
| 2 | `.planning/quick/20261021-b03bis` | 2,087,202 | 9 | 4 | 505,408 |
| 3 | `.planning/quick/20261101-gelir-sol` | 1,513,202 | 1 | 4 | 1,511,287 |
| 4 | `.planning/quick/20261006-dxb-team2-lean` | 1,025,508 | 18 | 2 | 778,232 |
| 5 | `.planning/quick/20261013-b41-tasarim-becerileri` | 1,000,882 | 7 | 2 | 986,026 |
| 6 | `.planning/quick/20261008-four-equal-arrangements` | 845,909 | 4 | 10 | 835,006 |
| 7 | `.planning/quick/20261006-typecheck-tests` | 799,961 | 4 | 2 | 719,605 |
| 8 | `.planning/quick/20261006-door-overall-look` | 628,610 | 2 | 2 | 625,557 |
| 9 | `.planning/quick/20261006-fable-review-fixes` | 560,380 | 7 | 2 | 375,923 |
| 10 | `.planning/quick/20261015-scrollcraft-studio` | 469,110 | 14 | 2 | 341,101 |
| 11 | `.planning/quick/20261019-canli-dinlenme` | 415,716 | 1 | 2 | 412,219 |
| 12 | `.planning/quick/20261012-xhigh-plan` | 326,493 | 3 | 2 | 322,553 |
| 13 | `.planning/quick/20261006-sol-dump-sweep` | 285,684 | 3 | 2 | 139,276 |
| 14 | `.planning/quick/20261019-excel-tab` | 260,798 | 3 | 4 | 256,359 |
| 15 | `.planning/quick/20261006-medium-first` | 148,621 | 1 | 4 | 145,531 |
| 16 | `.planning/quick/20261006-handover-clean-break` | 133,480 | 2 | 2 | 123,651 |
| 17 | `.planning/quick/20261019-calisma1-door` | 84,610 | 1 | 2 | 83,588 |
| 18 | `.planning/quick/20261014-yan-calisma-kapisi` | 65,939 | 2 | 2 | 59,909 |
| 19 | `.planning/quick/20261001-score-card-gate` | 51,266 | 11 | 0 | 0 |
| 20 | `.planning/quick/20261003-doors-slim` | 31,915 | 8 | 0 | 0 |

## 8. Findings the brief did not anticipate

- **PLAN.md does not cite `research/STACK.md` or `research/web-cupboard/`.** `grep` of `.planning/quick/20261117-temel/PLAN.md` and `reorder/ORDER.md` finds only `.planning/research/rival-intel/00-SYNTHESIS.md` (PLAN) and `research/LITERATURE.md`, `quick/20261014-tahta-sirasi/ORDER.md`, `quick/20261012-b64-is-akisi/PLAN.md` (ORDER). STACK.md stays on `.claude/CLAUDE.md` §5; web-cupboard stays on `.planning/board-rows/B84.md:299`.
- **`build_quarry.py` is already broken:** it reads `catalog-image-general.tsv`, `catalog-image-ads.tsv`, `catalog-video.tsv` from `quick/20261108-kisayol/`; `find` returns none.
- **A previous cleaning exists:** `ceo-approvals.json:1111` — "ROW B50 — THE HOUSE IS CLEANED: his one click on the folder-by-folder list with sizes". Not read further.
- **Memory backup copy inside a job folder:** `quick/20261110-fable-5-2-calisma/yedek/memory/` holds copies of auto-memory files; they name several folders and were counted as papers, not as memory.
- **One `.env` file was opened by the scan script:** `vps/litellm/.env` (the text-extension filter let a dot-file with no extension through). It was only regex-matched; it produced 0 hits; nothing from it was printed or stored except its path in `collect.json`'s source list.

## 9. Not inspected

- Contents of `.raw`, `.log`, `.jsonl`, `.err`, `.out`, images, video, `.docx`/`.odt`, and text files over 3 MB were not scanned as citers (a citation inside them is not seen).
- References written in a way that does not contain the folder name as a path token (e.g. a path assembled from a date variable at runtime) — only the generic readers in §2 were found by hand-grep for `"quick"`, `readdir`, `glob`.
- Whether a running session or service is writing into a folder right now (only last-change dates are reported; folders touched since 2026-11-12 and named by nothing living are DOUBT for that reason).
- Git history: what a tracked folder's last commit was, and whether a deleted tracked folder would be restored by any script.
- `node_modules/` (1,050 MB, ignored) and `.git/` (1,220 MB) — outside the cut; not classified beyond NOT A CANDIDATE.
- Whether CLOSED row text or `STATE-ARCHIVE.md` should count as living — the brief puts closed-row-only citations in DOUBT and I followed it; STATE-ARCHIVE is treated as a staying paper (STATE.md names it).
- The auto-memory directory was scanned (133 files) but no candidate was decided by it.

