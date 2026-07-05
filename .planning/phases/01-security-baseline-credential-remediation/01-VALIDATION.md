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
| **Full suite command** | `gitleaks detect --source . --redact && gitleaks detect --source . --log-opts="--all" --redact` |
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
| (filled by planner) | — | — | SEC-01..04 | — | old credentials verifiably dead; no secrets in repo | scan + probe evidence | see above | ❌ W0 | ⬜ pending |

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
