# B03-bis — the board row's full record, word for word

> **History, not the present.** What is true today is this row on the board (`HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`); this file keeps the story <!-- CEO-OK: rows-keep-up-note-not-story-2026-10-09 -->.

Moved off the board on 2026-09-28 on the CEO's order; the board keeps a short row that links here.
Nothing below was edited: each section is one cell of the row as it stood on the board.

<!-- HISTORY -->

## Opened

2026-07-28

## What is open (plain language)

**RULE #0 browser leg for every authenticated CEO surface** — render in the real browser, both locales, ≥2 widths. Currently unrunnable in an author session: no `DXB_E2E_STATE` file exists, and automated login is forbidden (no MFA factor is enrolled, so a form login would ENROL TOTP on the CEO's account — an auth-state mutation). Every command-surface change therefore ships with its machine legs green and its eye leg ⚠ UNVERIFIED. First rows affected: **C50/C51** (the Bellek page, 2026-07-28)

## Owning spec / ledger

RULE #0 + [[00-CEO-DIRECTIVE-DESIGN-VERIFICATION]]

## Why it is still open

The blocker is an auth boundary, not effort: `scripts/test/e2e-login.mjs` needs the CEO to mint the state once, and a minted state expires

## Waits on

CEO (one login)

## What closes it

A CEO-minted `storageState` on disk, and a re-mint cadence recorded so the leg does not silently lapse again
