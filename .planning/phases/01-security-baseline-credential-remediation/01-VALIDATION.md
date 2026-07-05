---
phase: 1
slug: security-baseline-credential-remediation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-05
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | bash + gitleaks (no app test framework yet — this phase is ops/security; Wave 0 installs gitleaks) |
| **Config file** | `.gitleaks.toml` (Wave 0 creates) |
| **Quick run command** | `gitleaks git --pre-commit --staged --redact` |
| **Full suite command** | `gitleaks git --redact -v` (full history; the older detect/protect subcommands are deprecated since v8.19 per 01-RESEARCH.md) |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `gitleaks git --pre-commit --staged --redact`
- **After every plan wave:** Run full repo + history scan
- **Before `/gsd-verify-work`:** Full scan green + every checklist item has a verification-evidence record
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T1 | 01-01 | 1 | SEC-03 | T-01-01 | scanner installed from checksum-verified binary; default rulepack, no allowlist | smoke | `gitleaks version && grep -c 'useDefault = true' .gitleaks.toml` | ❌ W0 | ⬜ pending |
| 01-01-T2 | 01-01 | 1 | SEC-03 | T-01-02, T-01-03 | staged detectable secret blocks the commit (fail-closed, canary-proven) | integration | `test -x scripts/hooks/pre-commit && git config core.hooksPath \| grep -qx scripts/hooks` + hook-selftest.md evidence | ❌ W0 | ⬜ pending |
| 01-01-T3 | 01-01 | 1 | SEC-03 | T-01-03 | full history clean; CI wired | integration | `gitleaks git --redact -v` exits 0; report JSON length 0 | ❌ W0 | ⬜ pending |
| 01-02-T1 | 01-02 | 2 | SEC-02 | T-01-05, T-01-07 | .env unignorable-uncommittable; registry placeholder-only | smoke | `git check-ignore -q .env && ! git check-ignore -q .env.example && test "$(grep -c '=__SET_ME__$' .env.example)" = 7` | ❌ W0 | ⬜ pending |
| 01-02-T2 | 01-02 | 2 | SEC-02 | T-01-06 | agent tooling denied read of vault; A8 outcome committed machine-readable; failure triggers out-of-workspace-vault compensating control (review HIGH-1, MED-5) | smoke | settings.json parses; deny array contains the three Read entries; evidence/a8-deny-check.md holds exactly one `A8-RESULT: PASSED\|FAILED+COMPENSATED` line, committed — FAILED+COMPENSATED requires 'OUT-OF-WORKSPACE VAULT' block in .env.example (parsed + blocking-gated in 01-06); BOTH grep counts (valid-line regex AND `^A8-RESULT:` prefix) = 1 in the automated verify itself, so a stray bare-FAILED line fails (cycle 3 LOW-2) | ❌ W0 | ⬜ pending |
| 01-03-T1 | 01-03 | 2 | SEC-01 | T-01-09, T-01-10 | 21 pre-assigned evidence rows with the ID set exactly CRED-01..CRED-21 (cycle 3 MED-6) + 5 machine-parseable ATT attestation rows; tick-without-probe structurally impossible | smoke | `grep -cE '^\| CRED-[0-9]+'` = 21; sorted CRED ID set = generated CRED-01..CRED-21 sequence exactly (awk+sort set-compare, cycle 3 MED-6); `grep -cE '^\| ATT-0[1-5] '` = 5; key-shape grep = 0 | ❌ W0 | ⬜ pending |
| 01-03-T2 | 01-03 | 2 | SEC-01 | T-01-11..T-01-13 | bilingual checklist with verbatim probes + all trapdoors | smoke | 12 numbered sections; ≥12 TR: lines; ≥8 curl probes; every RESEARCH endpoint verbatim-present AND every non-empty line inside probe-tagged fenced blocks verbatim in RESEARCH — verbatim loop scoped to `probe` fence-info-tagged blocks with a ≥8 probe-tag floor, plain-fenced sweep blocks exempt (review MED-1, cycle 3 MED-7); key-shape grep = 0 | ❌ W0 | ⬜ pending |
| 01-03-T3 | 01-03 | 2 | SEC-04 | T-01-19 | container-aware sanitization procedure, markdown export mandated, distinct scratch paths (review HIGH-6) | smoke | grep gates on procedure doc (export path, track-changes, unzip, sweep); /tmp/odt-original-work.odt + /tmp/odt-sanitized-check.odt present, /tmp/sanitize-work.odt count = 0 | ❌ W0 | ⬜ pending |
| 01-04-T1 | 01-04 | 3 | SEC-01 | T-01-14..T-01-18 | accounts/infra rotated, 2FA, probed dead (CEO) | manual-only (CEO probes; old values never enter automation) | gated by 01-04-T3 | n/a | ⬜ pending |
| 01-04-T2 | 01-04 | 3 | SEC-01 | T-01-14..T-01-16 | API keys + local rotated; CRED-17 Action cell carries structured grace= field (placeholder replaced); ATT rows filled (CEO) | manual-only (CEO probes) | gated by 01-04-T3 | n/a | ⬜ pending |
| 01-04-T3 | 01-04 | 3 | SEC-01 | T-01-14, T-01-15 | zero unresolved rows via DEAD?-column parse (review HIGH-2); CRED ID set exactly CRED-01..21, no duplicates (cycle 3 MED-6); ✅ rows timestamp + non-empty Observed (MED-4); ATT table complete (HIGH-3); grace literal column-parsed from exactly one CRED-17 row (MED-2, MED-6); value-free | integration | column-aware awk on DEAD? column prints 21-rows 0-unresolved; sorted ID-set compare = CRED-01..CRED-21 exactly (cycle 3 MED-6); MED-4 awk prints 0; ATT awk prints ATT-OK (ATT-01 = YES); CRED-17 Action-column awk with `n == 1` row-count guard prints GRACE-OK (cycle 3 MED-6); `gitleaks dir <evidence dir> --redact` exits 0 | ✅ (template from 01-03) | ⬜ pending |
| 01-05-T1 | 01-05 | 4 | SEC-04 | T-01-19, T-01-21 | credentials section stripped; copies swept (CEO) | manual-only (LibreOffice edit) | gated by 01-05-T2 | n/a | ⬜ pending |
| 01-05-T2 | 01-05 | 4 | SEC-04 | T-01-19, T-01-20, T-01-22 | sanitized doc clean at markdown + container level; original never committed; word-match line content only in /tmp scratch; no commits before CEO review (review HIGH-4); path guard + container outcome + scratch cleanup asserted by the automated verify itself (cycle 3 LOW-3) | integration | key-shape grep = 0; `gitleaks dir docs --redact` exits 0; odt-in-history grep = 0; word-match summary format-gate = 0 violations; sanitized md untracked pre-approval; `cmp -s` original-vs-sanitized exits exactly 1; evidence lines `container-verified-path: /tmp/odt-sanitized-check.odt` and `container-scan: PASS` each grep-count 1; `test ! -e /tmp/odt-check` (all four in the automated verify, cycle 3 LOW-3) | ❌ (CEO produces in T1) | ⬜ pending |
| 01-05-T3 | 01-05 | 4 | SEC-04 | T-01-19 | residual word matches human-reviewed from /tmp scratch BEFORE any commit (review HIGH-4) | manual-only (CEO review) + post-approval commit | approval line committed; sanitized md tracked (ls-files = 1); /tmp scratch deleted | n/a | ⬜ pending |
| 01-06-T1 | 01-06 | 5 | SEC-01..04 | T-01-23..T-01-25 | zero verified live secrets among trufflehog-supported detectors in full history (plain-password dead-proofs = the 21 per-item probes, review MED-3) | integration | `trufflehog git file://. --only-verified --fail` exits 0; scope statement present in evidence | ❌ W4 | ⬜ pending |
| 01-06-T2 | 01-06 | 5 | SEC-01..04 | T-01-23, T-01-26 | every hard-gate criterion re-run live and passing; SEC-01 via column-aware parsers incl. Observed + grace column, unique ID-set gate, single-CRED-17-row grace parse (review HIGH-5, MED-4, MED-2, cycle 3 MED-6); A8 blocking rule parsed from evidence/a8-deny-check.md with both grep counts machine-run (review HIGH-1, cycle 3 LOW-2) | integration | gate report exists; red-cross count = 0; report shows 21-rows 0-unresolved + ID-SET-OK + MED-4 check 0 + ATT-OK + GRACE-OK (n==1 CRED-17 rows); ID-set compare also re-run live against ROTATION-EVIDENCE.md in the automated verify (cycle 3 MED-6); exactly one A8-RESULT line parsed, valid-line AND prefix counts both 1 (cycle 3 LOW-2); live gitleaks re-run exits 0 | ❌ W4 | ⬜ pending |
| 01-06-T3 | 01-06 | 5 | SEC-01..04 | T-01-26 | 2FA + uniqueness CEO-confirmed; phase exit approved | manual-only (CEO sign-off) | timestamped approval line committed in gate report | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] gitleaks installed and `.gitleaks.toml` present
- [ ] pre-commit hook active (fail-closed)
- [ ] evidence directory structure exists (no-secrets schema)

---

## Validation Notes

- Probes run against OLD (revoked) values only, transiently, never stored — evidence records status code + UTC timestamp.
- Apify grace-window trap: old token stays valid 24h if grace accepted — checklist must decline grace or delay probe. CRED-17's Action cell must carry the structured literal `grace=declined` or `grace=accepted; probe_after_24h=yes`, replacing the template's `grace=__PENDING__` placeholder (column-parsed and machine-gated in 01-04-T3 and the 01-06 gate report, review MED-2). The grace parser fails unless exactly one CRED-17 row exists, and the full CRED ID set must equal CRED-01..CRED-21 exactly (sorted-set compare) — a duplicated row cannot mask a pending grace decision behind the 21-row count (cycle 3 MED-6).
- Google ordering trap: capture old app password for probing BEFORE account password change (change auto-revokes app passwords).
