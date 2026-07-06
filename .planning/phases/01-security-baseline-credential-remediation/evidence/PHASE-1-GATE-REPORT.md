# Phase 1 Gate Report — Security Baseline & Credential Remediation

- **Status:** APPROVED
- **Generated (UTC):** 2026-07-06T16:16Z
- **Method:** every row below re-run LIVE at report time (no copied results); commands and observed output verbatim.

## Gate rows

| Req | Check | Command | Observed | Status |
|-----|-------|---------|----------|--------|
| SEC-01 | Evidence completeness (column-aware DEAD? parser) | `awk -F'\|' '$2 ~ /CRED-/ {...}' ROTATION-EVIDENCE.md` | `21-rows 0-unresolved` | ✅ |
| SEC-01 | Unique CRED-01..21 ID set (no dup/gap) | sorted-ID-set compare vs generated CRED-01..21 | `ID-SET-OK` | ✅ |
| SEC-01 | Dead rows timestamped + Observed non-empty (MED-4) | `awk` over Probe(UTC) $9 / Observed $10 on ✅ rows | `0` bad rows | ✅ |
| SEC-01 | Attestation table complete (5/5) | `awk` ATT Status column | `ATT-OK` (ATT-01=YES) | ✅ |
| SEC-01 | Apify grace literal (exactly-one-row Action parse) | `awk` CRED-17 $5, n==1 guard | `GRACE-OK` (`grace=declined`) | ✅ |
| SEC-02 | .env gitignored | `git check-ignore -q .env` | exit 0 | ✅ |
| SEC-02 | .env.example tracked | `git ls-files \| grep -cxF '.env.example'` | 1 | ✅ |
| SEC-02 | no .env tracked | `git ls-files \| grep -cxF '.env'` | 0 | ✅ |
| SEC-02 | settings.json deny rules (3 Read entries) | JSON parse of `.claude/settings.json` permissions.deny | 3 | ✅ |
| SEC-02 | A8 deny check (blocking, machine-parsed) | `grep -cE '^A8-RESULT: (PASSED\|FAILED\+COMPENSATED)$'` = 1 AND `grep -c '^A8-RESULT:'` = 1 | 1 and 1; line reads `A8-RESULT: PASSED` | ✅ |
| SEC-03 | hooks path wired | `git config core.hooksPath` | `scripts/hooks` | ✅ |
| SEC-03 | pre-commit hook executable | `test -x scripts/hooks/pre-commit` | pass | ✅ |
| SEC-03 | hook self-test evidence | `test -f evidence/hook-selftest.md` | exists | ✅ |
| SEC-03 | gitleaks full-history re-run AT REPORT TIME | `gitleaks git --redact .` | exit 0 (2026-07-06T16:16Z) | ✅ |
| SEC-03 | CI workflow present | `test -f .github/workflows/secret-scan.yml` | present — wired, arms on first push | ✅ |
| SEC-04 | sanitized markdown tracked | `git ls-files \| grep -c 'docs/source-architecture-notes-sanitized.md'` | 1 | ✅ |
| SEC-04 | key-shape gate on sanitized markdown | `grep -cE 'sk-...\|nvapi-...\|apify_api_...'` | 0 | ✅ |
| SEC-04 | no .odt anywhere in git history | `git log --all --name-only --format= \| grep -ci '\.odt$'` | 0 | ✅ |
| SEC-04 | ODT sanitization evidence + CEO approval | grep approval line in ODT-SANITIZATION-EVIDENCE.md | present (15:52Z approval) | ✅ |
| cross | trufflehog verified sweep (full history) | `trufflehog git file://. --only-verified --fail` | exit 0, findings 0 (evidence: trufflehog-verified-sweep.md) | ✅ |

## Operational notes

- Fresh clones must run `git config core.hooksPath scripts/hooks` once (hook path is per-clone config).
- The CI workflow (`.github/workflows/secret-scan.yml`) arms on first push to a GitHub remote — repo currently has none. Pin gitleaks-action to a commit SHA at that point. SEC-03 CI status is therefore "wired, arms on first push", never an unqualified pass.
- A8 outcome quoted from `evidence/a8-deny-check.md`: `A8-RESULT: PASSED` (no compensating control needed; pass/fail decision lives in the SEC-02 gate row above).
- SEC-02 deferral note for CEO sign-off: the runtime `.env` loader is deferred to Phase 2 by documented sequencing choice — no code exists in this phase to load it.
- SEC-01 context: DEAD? proofs are ✅ login-rejected probes where old values were retained (CRED-01, 04, 21) and structured `N/A (old value not retained; server-side invalidation)` entries elsewhere — trufflehog's zero-verified-findings sweep complements these per-item proofs for detector-supported credential types.
- ATT-01 exception on record (ROTATION-EVIDENCE.md CEO decisions): values unique per CEO attestation but hand-created before the vault existed, not generator-produced; accepted by CEO 2026-07-06, optional re-generation backlogged.

## CEO approval (Task 3)

- 2026-07-06T16:21Z — CEO confirmed: (1) 2FA enrolled and working on Google, Microsoft Hotmail x2, Namecheap, Private Email x2, Cloudflare, hostloom; (2) backup codes stored in password manager; (3) all new values unique per service (generator exception on record); (4) gate report read and accepted. **Phase 1 hard gate CLOSED — Phase 2 unblocked.**
