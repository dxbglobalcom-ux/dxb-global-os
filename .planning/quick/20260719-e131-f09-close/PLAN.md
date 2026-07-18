# Execution ticket — E13.1 final leg (F-09) + CEO complaint ledger registration

**Spec pointers (no new design decisions here):**
- Roadmap row: `HOLDING-OS-MASTER-PLAN/IMPLEMENTATION_ROADMAP.md` E13.1 (◐ — remaining leg F-09; F-15 struck by U19)
- F-09 disposition: `00-CEO-DIRECTIVE-REVENUE-FIRST.md` disposition table (production proofs mandatory, mock/demo cannot close)
- Evidence-class taxonomy: `Dış Denetim Raporu/…` §F-09 table
- U19: Outleteuro cancellation (CEO order 2026-07-19, chat + şikayet.odt item 2)
- C-ledger: `00-NOTE-CEO-COMPLAINT-LEDGER-2026-07-19.md` (19 items, remediation AFTER this closure per CEO in-chat ruling)

**Work items:**
1. Register U19 + amend E13.1/R6.1 rows + write C-ledger (done in this ticket's first commit).
2. F-09 production capability proof report: live-DB measurements (read-only), every claim cited command→output, evidence-class labeled per audit taxonomy, honest zeros (F-10 discipline: revenue_ledger 0 etc.).
3. Close E13.1 row ✓ with evidence; STATE mirror; commit.

**Evidence contract:** every number in the report reproducible by the cited psql command; no GUI claims beyond E13.2 CEO-session record; gitleaks clean on commit.
