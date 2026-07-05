---
phase: 01-security-baseline-credential-remediation
plan: 01
subsystem: security
tags: [gitleaks, secret-scanning, pre-commit-hook, ci, sec-03]
requires: []
provides:
  - "Fail-closed pre-commit secret scan (canary-proven) on every commit"
  - "Clean full-history gitleaks report as committed evidence"
  - "CI secret-scan workflow that arms on first GitHub push"
affects:
  - "01-02 through 01-06 (all later commits in this phase are now scanned)"
tech-stack:
  added:
    - "gitleaks v8.24.3 (binary, ~/.local/bin, sha256-verified)"
  patterns:
    - "core.hooksPath -> scripts/hooks (versioned hooks; fresh clones run `git config core.hooksPath scripts/hooks` once)"
    - "fail-closed gates: missing scanner blocks commit, never passes silently"
    - "--redact on every gitleaks invocation (CEO no-values rule)"
key-files:
  created:
    - .gitleaks.toml
    - scripts/hooks/pre-commit
    - .github/workflows/secret-scan.yml
    - .planning/phases/01-security-baseline-credential-remediation/evidence/hook-selftest.md
    - .planning/phases/01-security-baseline-credential-remediation/evidence/gitleaks-history-report.json
  modified: []
decisions:
  - "gitleaks v8.24.3 installed (latest 8.24.x per plan pin); checksum verified before install (T-01-01)"
  - "Canary matched rule generic-api-key (entropy 3.70) — detection confirmed via stdin mode before commit-block test"
  - "gitleaks-action pinned at @v2 major tag with in-file TODO to SHA-pin when remote goes live (T-01-SC)"
metrics:
  duration: "~9 minutes"
  completed: "2026-07-05T22:48:00Z"
  tasks: 3
  files: 5
status: complete
---

# Phase 01 Plan 01: Automated Secret Scan (SEC-03 build half) Summary

**One-liner:** Fail-closed gitleaks pre-commit gate (canary-proven to block) + clean 22-commit full-history report + CI workflow armed for first push.

## What was built

1. **Scanner install + config (Task 1, `83629ae`)**
   - gitleaks v8.24.3 linux x64 downloaded from official GitHub releases; archive sha256 `9991e0b2903da4c8f6122b5c3186448b927a5da4deef1fe45271c3793f4ee29c` verified against the release `gitleaks_8.24.3_checksums.txt` — **checksum match: yes** (supply-chain gate T-01-01). Installed to `~/.local/bin/gitleaks`; `gitleaks version` prints `8.24.3`.
   - `.gitleaks.toml`: default rulepack via `[extend] useDefault = true`; zero allowlist entries, zero custom rules — repo policy is clean, not baselined.

2. **Fail-closed hook + canary self-test (Task 2, `f13c092`)**
   - `scripts/hooks/pre-commit` (executable POSIX sh): prepends `$HOME/.local/bin` to PATH, exits 1 with stderr error when gitleaks is missing (fail closed, Pitfall 7), otherwise `exec gitleaks git --pre-commit --staged --redact --verbose`.
   - Activated: `git config core.hooksPath` = `scripts/hooks` (local config; clone-bootstrap one-liner documented in hook header).
   - Canary self-test (all evidence in `evidence/hook-selftest.md`): random 40-hex value → stdin detection exit **1** → staged commit attempt blocked exit **1** → cleanup via scoped `git restore --staged` + `rm`; `git log --all` grep confirms the canary never entered history. Only exit codes and redacted lines recorded.

3. **Full-history proof + CI (Task 3, `066ae28`)**
   - `gitleaks git --redact -v --report-path evidence/gitleaks-history-report.json`: **22 commits scanned, 0 findings, exit 0** — report committed as an empty JSON array (answers RESEARCH Open Question 1: history is clean, no rewrite needed).
   - `.github/workflows/secret-scan.yml`: push + pull_request triggers, `actions/checkout@v4` with `fetch-depth: 0`, `gitleaks/gitleaks-action@v2` with `GITHUB_TOKEN`. Comments cover: no-remote-yet arming behavior, personal-vs-org licensing (A7), SHA-pin TODO for remote go-live (T-01-SC).

**Live proof beyond the self-test:** the hook actively scanned the Task 2 and Task 3 commits themselves during this execution ("no leaks found" in commit output) — the gate is running on every commit from now on.

## Task commits

| Task | Name | Commit |
|------|------|--------|
| 1 | Install gitleaks + .gitleaks.toml | `83629ae` |
| 2 | Fail-closed hook + canary self-test | `f13c092` |
| 3 | Full-history report + CI workflow | `066ae28` |

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All artifacts are functional; the CI workflow is intentionally dormant until first push (documented in the plan and in the workflow file).

## Threat Register Outcomes

- T-01-01 (binary tampering): mitigated — sha256 verified pre-install.
- T-01-02 (secret disclosure in output): mitigated — `--redact` on every invocation; evidence files contain exit codes and redacted lines only.
- T-01-03 (silent scanner absence): mitigated — fail-closed branch + canary evidence proving the hook fires.
- T-01-04 (`--no-verify` bypass): accepted per plan; CI re-scan is the backstop.
- T-01-SC (action supply chain): mitigated — major-tag pin now, SHA-pin mandated in workflow comment.

## Next

Plan 01-02 (vault rules) onward: every commit in the rest of this phase now passes through the live scanner gate.

## Self-Check: PASSED

- FOUND: .gitleaks.toml
- FOUND: scripts/hooks/pre-commit (executable)
- FOUND: .github/workflows/secret-scan.yml
- FOUND: evidence/hook-selftest.md
- FOUND: evidence/gitleaks-history-report.json (JSON array, length 0)
- FOUND: commits 83629ae, f13c092, 066ae28
