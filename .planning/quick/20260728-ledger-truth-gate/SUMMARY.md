# 20260728-ledger-truth-gate — SUMMARY

**Author:** Opus 5 (session author, U30) · **Date:** 2026-07-28 evening

## What the CEO asked

He pointed at `.planning/research/` and asked one question: *"buradaki şeyler bizim sistemimizde
yapılmış mı? eğer yapılmadıysa bizim eksikler tahtasında mevcut mu? sorun şu ki her gelen model
bir şeyleri atlıyor mutlaka."*

Mid-sweep he added the warning that decided the shape of the answer:
*"tahtada yoktur ama belki sistemde yapılmıştır dashboardta yapılmıştır bilmiorm."*
**It caught a real error before it reached him** — the off-site backup was about to be reported as
a live gap when he had closed it himself on 07-18 20:19 (`OFFSITE_OK`, 12,435,816 bytes). Every
remaining candidate was then checked in both directions: built? *and* tracked?

## What the sweep measured — drift runs BOTH ways

**(a) Promised somewhere, tracked nowhere** (board 0 / roadmap 0 / U-table 0) — seven board rows born:

| Row | The promise | Measured 2026-07-28 |
|---|---|---|
| B14 | Video-learn's dashboard entry (`INTEGRATION-TRACKER:39`, the EMBED condition of an ADOPT row) | Dashboard shipped with 46 routes; `apps/dashboard/src/app` holds **not one file** mentioning video |
| B15 | The autonomy dial (`FEATURES.md:54`, trigger "enough audit history"; `audit_log` = 29,518) | Column exists, `/org/directors` prints `L0`, **all 205 agents at 0**, nothing can change it |
| B16 | The B6 hard gate (`LITERATURE.md:98` — Phase-10 planning may not open without this document final) | W2-W5 **never ran**; activation happened anyway |
| B17 | A standing CEO report (`REVENUE-OPPORTUNITIES.md:117` — "updated each wave, presented to the CEO") | Last updated **2026-07-09**; never presented |
| B18 | Complaint C9's own ◐ leg — *"Remaining list pages = open leg"* | `FilterBar` reaches **9 of 58** command routes |
| B19 | `gitleaks-action @v2` SHA-pin TODO, trigger "remote go-live" | Written inside a phase record; no ledger ever picked it up |
| B20 | — | The roadmap's status token is **not machine-readable**, which is why the completion figure is re-derived by hand every session and drifts (STATE.md's own comments record 67 → 73 → 74 with a confessed "+1 drift") |

**(b) Recorded state contradicted by the database** — six corrections:

| Record | Said | System says |
|---|---|---|
| `E12.5-WORKFORCE-BASELINE.md` | "the holding's working hands = ONE employee", 221 rows, 21 stale paths, 127 version drift, 153-legacy + activation still to do | **199 active** of 205; stale paths **0**; live drift **0**; dispositions done 07-11; activation ran 07-18 |
| `E13.0-OPERATIONAL-READINESS.md` | two legs ◐ (off-site key, authed a11y) | **both paid the same evening** (20:19 and 20:07) |
| `E12.5-CAPABILITY-COVERAGE.md` | activation "BLOCKED-CLASS on the CEO's OPEN decisions" | he ruled D10/D11 that morning |
| roadmap `E12.5` | ◐ for ten days, remaining leg "keys→probation→evaluate" | `employee.evaluated` for **197 distinct employees**, `probation_task_assigned` 212, `registry.activate` 127 → row corrected to ✓ |
| `.planning/STATE.md` census | E13.0 / E13.1 / E13.2 unfinished | all three ✓, recorded lower in the same file |
| `.planning/STATE.md` last_activity_desc | still carried the rival-analysis verdict **the CEO had already rejected** | replaced with the corrected diagnosis |

## What was built

`scripts/governance/ledger-truth.mjs` + `scripts/governance/claims.json` — a read-only audit that
runs in the battery (`pnpm verify:ledger`) and enforces the two laws the board already declared:

- **STATE vs EVENT.** A statement about what is true NOW carries `<!-- STATE: id = value @ date -->`
  and is re-measured against the live company database every run. A statement about what happened
  ONCE is frozen and must carry its date. *The defect that started all of this was a STATE claim
  written in EVENT clothing.*
- **Every declaration of open work binds to a board row** (`<!-- OPEN: Bxx -->`) or is marked
  `<!-- HISTORY -->`. In a ledger the status token is the declaration, so there the tripwire fires
  on `◐` alone. The board is exempt — it IS the register.
- **Read-only by construction:** a claim query that is not a bare SELECT is refused by the script,
  not trusted to its author. It reads the COMPANY database because the test clone (C47) cannot
  prove what is true in the company.

## Two defects found in the gate while building it — fixed at source

1. **Only the first marker on a line was read.** The corpus holds table rows with three `STATE`
   claims in one line; the first version reported 5 claims where there were 8, so a stale number
   could have ridden along beside a fresh one. Now every marker on the line is checked, and the
   regression is pinned (`tests/governance/ledger-truth.test.ts`).
2. **`check-integration-tracker.mjs` was failing on my own morning's work** — the C42 rival table
   added today has a Status column holding source kinds (reel/repo/pdf), and the gate's main-table
   bound was "everything above the exclusions", so it judged rows it was never meant to see. The
   parser is now bounded by its own heading on both sides.

## Evidence

| Claim | Command → output |
|---|---|
| Stale number caught | `STATE agents_active = 42` → `FAIL — STALE: "agents_active" says 42 …, the system says 199` |
| Unmarked promise caught | unmarked `REMAINING:` line → `FAIL — declares open work with no OPEN/HISTORY marker`; with `OPEN: B14` → `ledger truth OK` |
| Absent row caught | `OPEN: B999` → `FAIL — … which does not exist` |
| Closed row caught | `OPEN: C43` → `FAIL — … which is CLOSED: this text claims work that is finished` |
| Unregistered claim caught | `STATE not_a_real_claim` → `FAIL — … is not registered in scripts/governance/claims.json` |
| Corpus clean | `ledger truth OK: 8 state claims re-measured, 9 open markers resolved against 60 board rows, 50 trigger lines all accounted for` |
| Gate regression | `npx vitest run tests/governance` → **7 passed** |
| Full suite | `npx vitest run` → **92 files, 682 passed, 15 skipped, 0 failed** |
| Types | `npx tsc --build` → exit 0 |
| i18n purity | `scripts/i18n-purity-check.sh` → `I18N PURITY: PASS` (en 2395 = tr 2395) |
| Tracker gate | `node scripts/check-integration-tracker.mjs` → `tracker OK: 80 data rows (76 non-excluded, 4 excluded), 76 study cards` |
| Secrets | `gitleaks detect` → `no leaks found` (564 commits) |
| **Company database only read** | after the full run: `agents 205 · tasks 217 · agent_runs 378 · audit_log 29535`, **newest `audit_log` row 09:04** — twelve hours before this session's first execution |

## Boundaries — stated, not hidden

- The tripwire is a **word list, not an oracle**. A promise phrased in words nobody anticipated
  passes. Its value is that the sweep tuned it to zero, so any future ring is real.
- **Study-card version numbers describe the outside world** (`v0.4.10 measured`) and cannot be
  re-measured by SQL. They carry dated `HISTORY` rather than a false promise of freshness.
  Upstream version tracking is not this gate's job and is not claimed to be.
- The gate proves the **marked** claims. It cannot prove that every claim got marked — the sweep
  was the author's eye over 172 files.
- **Nothing in the six C42 waves was built here.** This session bought truth, not capability:
  no chart, no connector, no speed. Those rows are untouched on the board.
- `.planning/quick/**`, `.planning/phases/**`, `_ARCHIVE/**` and `references/**` are outside the
  swept corpus, each for a written reason (tickets are one-shot; the rest is history the project
  keeps on purpose; the CEO's own documents are not annotated by us).
