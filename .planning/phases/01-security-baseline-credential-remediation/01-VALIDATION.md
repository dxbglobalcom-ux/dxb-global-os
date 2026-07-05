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
| 01-02-T2 | 01-02 | 2 | SEC-02 | T-01-06 | agent tooling denied read of vault | smoke | settings.json parses; deny array contains the three Read entries; A8 spot-check outcome recorded | ❌ W0 | ⬜ pending |
| 01-03-T1 | 01-03 | 2 | SEC-01 | T-01-09, T-01-10 | 21 pre-assigned evidence rows; tick-without-probe structurally impossible | smoke | `grep -cE '^\| CRED-[0-9]+'` = 21; key-shape grep = 0 | ❌ W0 | ⬜ pending |
| 01-03-T2 | 01-03 | 2 | SEC-01 | T-01-11..T-01-13 | bilingual checklist with verbatim probes + all trapdoors | smoke | 12 numbered sections; ≥12 TR: lines; ≥8 curl probes; key-shape grep = 0 | ❌ W0 | ⬜ pending |
| 01-03-T3 | 01-03 | 2 | SEC-04 | T-01-19 | container-aware sanitization procedure, markdown export mandated | smoke | grep gates on procedure doc (export path, track-changes, unzip, sweep) | ❌ W0 | ⬜ pending |
| 01-04-T1 | 01-04 | 3 | SEC-01 | T-01-14..T-01-18 | accounts/infra rotated, 2FA, probed dead (CEO) | manual-only (CEO probes; old values never enter automation) | gated by 01-04-T3 | n/a | ⬜ pending |
| 01-04-T2 | 01-04 | 3 | SEC-01 | T-01-14..T-01-16 | API keys + local rotated; Apify grace declined; sweep attested (CEO) | manual-only (CEO probes) | gated by 01-04-T3 | n/a | ⬜ pending |
| 01-04-T3 | 01-04 | 3 | SEC-01 | T-01-14, T-01-15 | zero unresolved rows; timestamped; value-free | integration | reverse-filter grep on CRED rows = 0; `gitleaks dir <evidence dir> --redact` exits 0 | ✅ (template from 01-03) | ⬜ pending |
| 01-05-T1 | 01-05 | 4 | SEC-04 | T-01-19, T-01-21 | credentials section stripped; copies swept (CEO) | manual-only (LibreOffice edit) | gated by 01-05-T2 | n/a | ⬜ pending |
| 01-05-T2 | 01-05 | 4 | SEC-04 | T-01-19, T-01-20, T-01-22 | sanitized doc clean at markdown + container level; original never committed | integration | key-shape grep = 0; `gitleaks dir docs --redact` exits 0; odt-in-history grep = 0 | ❌ (CEO produces in T1) | ⬜ pending |
| 01-05-T3 | 01-05 | 4 | SEC-04 | T-01-19 | residual word matches human-reviewed | manual-only (CEO review) | checkpoint approval recorded | n/a | ⬜ pending |
| 01-06-T1 | 01-06 | 5 | SEC-01..04 | T-01-23..T-01-25 | nothing in history authenticates anywhere | integration | `trufflehog git file://. --only-verified --fail` exits 0 | ❌ W4 | ⬜ pending |
| 01-06-T2 | 01-06 | 5 | SEC-01..04 | T-01-23, T-01-26 | every hard-gate criterion re-run live and passing | integration | gate report exists; red-cross count = 0; live gitleaks re-run exits 0 | ❌ W4 | ⬜ pending |
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
- Apify grace-window trap: old token stays valid 24h if grace accepted — checklist must decline grace or delay probe.
- Google ordering trap: capture old app password for probing BEFORE account password change (change auto-revokes app passwords).
