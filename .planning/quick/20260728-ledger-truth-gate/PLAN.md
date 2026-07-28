# 20260728-ledger-truth-gate — execution ticket

**This is a ticket, not a plan.** The plan exists once: the corpus. (CEO ruling 2026-07-13.)

| | |
|---|---|
| **Owning spec / ledger** | [[00-BOARD-OPEN-WORK]] — laws 1 (one row per open thing) and 5 (ledger parity) |
| **Registered adaptation** | `00-INDEX.md` → **U41** |
| **Roadmap rows touched** | E12.5 (stale ◐ → ✓ against its own audit trail) |
| **Board rows born** | B14 · B15 · B16 · B17 · B18 · B19 · B20 |
| **Trigger** | CEO, 2026-07-28: *"buradaki şeyler bizim sistemimizde yapılmış mı? eğer yapılmadıysa bizim eksikler tahtasında mevcut mu? sorun şu ki her gelen model bir şeyleri atlıyor mutlaka."* Approach approved by him in-session ("Yol 1'i kur") |
| **New design decisions** | **None.** Laws 1 and 5 already existed as honour rules; this gives them a machine. |

## Evidence contract

| Claim | How it is proven |
|---|---|
| The gate catches a stale number | Red-first: a `STATE` value set to 42 → FAIL naming file:line, claimed vs actual |
| The gate catches an unmarked promise | Red-first: an unmarked `REMAINING:` line → FAIL; the same line with `OPEN: B14` → PASS |
| The gate catches a broken binding | Red-first: `OPEN: B999` → FAIL (absent); `OPEN: C43` → FAIL (closed row) |
| The gate catches an unregistered claim | Red-first: an id absent from `claims.json` → FAIL |
| Every marker on a line is read | Regression case with three `STATE` claims in one table row |
| The company database is only read | Claim queries refused unless bare SELECT; row counts + newest `audit_log` timestamp compared |
| The corpus is clean afterwards | `pnpm verify:ledger` exit 0 across 172 corpus files |
| Nothing regressed | Full suite · `tsc --build` · i18n purity · tracker gate · gitleaks |
