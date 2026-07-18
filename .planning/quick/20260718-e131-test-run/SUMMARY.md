---
status: complete
completed_at: 2026-07-18T06:00:00.000Z
---

# SUMMARY — E13.1 machine tier (L1-L6 + §38 M items)

Roadmap row E13.1 → ◐ (machine tier green; remaining legs named in the row).

- **§24 command set 5/5 green, run verbatim:** pnpm test 455/0 · db-suite
  PUSH OK 94=94 / IDEMPOTENT OK / ASSERTS 7/7 / ROLLBACK BLOCKS 46/46 (0021x
  executed live) · playwright public tier 5/5 · typecheck+build+gitleaks 0 ·
  i18n-audit "missing: 0" (1846).
- **Three §24 tools BORN** (were paper-only): `scripts/test/db-suite.sh`
  (ephemeral-container L2 with the 7 binding asserts), `scripts/test/
  i18n-audit.mjs`, L5 runner (`@playwright/test` 1.61.1 + `apps/dashboard/
  playwright.config.ts` + `tests/e2e/{public,authed}.spec.ts` + CEO helper
  `scripts/test/e2e-login.mjs`).
- **Real findings fixed in-wave:** 0021x rollback block STALE at chain head
  (CASCADE amendment — first-ever live rollback execution); champagne
  accent fallback had drifted from its token (#c8a962≠#d8b98c) — killed;
  preamble plane + auth.uid() GUC-style gotchas encoded into the suite;
  anonymous unknown-route truth measured (wall-first 307, no enumeration).
- **Auth boundary (recorded, not silent):** automated login forbidden —
  mfa_factors is EMPTY so form login would ENROLL TOTP on the CEO account;
  cookie extraction classifier-blocked. Authed tier (8 scenarios) skips with
  reason until the CEO mints a storageState (2-min `e2e-login.mjs` run).
- **Ops:** :3000 restarted on the fresh build (pid 2445296, until-curl);
  "ghost 3985" mystery closed — it is open-notebook's container-internal
  next-server, not project debris.
