---
phase: 01-security-baseline-credential-remediation
plan: 02
subsystem: security
tags: [vault, gitignore, env-example, deny-rules, sec-02]
requires:
  - "01-01 (gitleaks pre-commit gate scanning every commit in this plan)"
provides:
  - "Vault gitignore rules: .env can never enter git (.env, .env.*, !.env.example)"
  - ".env.example committed name registry — agents/code reference secrets by NAME only"
  - "Agent tool-layer vault deny rules in .claude/settings.json, functionally proven (A8 PASSED)"
  - "Machine-readable A8 outcome line parsed by plan 01-06 SEC-02 gate row"
affects:
  - "01-04 (CEO fills real .env at repo root — A8 PASSED means no out-of-workspace relocation needed)"
  - "01-06 (SEC-02 gate row parses A8-RESULT line in evidence/a8-deny-check.md)"
tech-stack:
  added: []
  patterns:
    - "vault pattern: gitignored .env + committed __SET_ME__ name registry + Read deny rules"
    - "permissions.deny as enforcement layer (not prompt discipline) for agent vault access"
    - "machine-readable single-status-line evidence artifacts (A8-RESULT:) for gate parsing"
key-files:
  created:
    - .env.example
    - .claude/settings.json
    - .planning/phases/01-security-baseline-credential-remediation/evidence/a8-deny-check.md
  modified:
    - .gitignore
decisions:
  - "A8 spot-check PASSED: file-read tool refused .env marker read — deny semantics proven, no compensating control added (block exists only in FAILED branch)"
  - "Vault block appended to .gitignore as its own commented section per RESEARCH, existing entries untouched (pre-existing .env/.env.* rules left in place; duplication harmless, negation ordering satisfied)"
  - "9Router and account passwords excluded from name registry per plan (local software / password-manager scope)"
metrics:
  duration: "~6 minutes"
  completed: "2026-07-05T23:00:00Z"
  tasks: 2
  files: 4
status: complete
---

# Phase 01 Plan 02: Secrets Vault Pattern (SEC-02) Summary

**One-liner:** Three-layer vault scaffold live — gitignore rules block .env from git, 7-name __SET_ME__ registry committed, and agent Read-deny rules functionally proven (A8-RESULT: PASSED).

## What was built

1. **Vault gitignore rules + name registry (Task 1, `ea82961`)**
   - `.gitignore`: vault block appended (`.env`, `.env.*`, `!.env.example` — negation after wildcard so the template stays tracked). Pre-existing `.env`/`.env.*`/`*.odt` entries confirmed present and left untouched.
   - `.env.example`: committed name registry at repo root. Header documents the convention (real values ONLY in gitignored `.env`, CEO-filled, never agent-filled; agents add NAMEs and ask the CEO to fill values; placeholders are the literal `__SET_ME__`, never key-shaped). 7 entries: LLM providers (OPENAI_API_KEY, OPENROUTER_API_KEY, NVIDIA_API_KEY, OLLAMA_API_KEY, OPENCODE_API_KEY) + Infra (CLOUDFLARE_API_TOKEN, APIFY_TOKEN). 9Router and account passwords intentionally excluded.
   - Verified: `.env`/`.env.local` ignored, `.env.example` NOT ignored, `dummy.odt` ignored, 7 placeholder lines with zero non-placeholder assignments, `.env` untracked.

2. **Agent vault deny rules + A8 functional proof (Task 2, `cd2fbad`)**
   - `.claude/settings.json` created with `permissions.deny`: `Read(./.env)`, `Read(./.env.*)`, `Read(**/.env)`. No prior settings.json existed (merge-preservation criterion vacuously satisfied); `settings.local.json` untouched and holds no conflicting .env allow rules.
   - A8 functional spot-check: throwaway `.env` with harmless marker `PLACEHOLDER=vault-deny-check` created; file-read tool attempt **refused** by the permission system ("File is in a directory that is denied by your permission settings"). Bash writes targeting `.env` were independently denied during the session — corroborating vault-path enforcement. Marker deleted; `test ! -f .env` confirmed.
   - `evidence/a8-deny-check.md` committed with UTC timestamp, probe description, and exactly one machine-readable status line: `A8-RESULT: PASSED` (valid-count 1, prefix-count 1 — both enforced in the automated verify).
   - Cycle-3 gate simulation (LOW-2) executed in scratchpad: an artifact with a valid PASSED line plus a stray `A8-RESULT: FAILED` line yields valid-count 1 / prefix-count 2 and correctly FAILS the dual-grep verify.

**A8 PASSED consequence:** no compensating control — `.env.example` carries no OUT-OF-WORKSPACE VAULT block (that block exists only in the FAILED branch). The CEO fills the real `.env` at repo root during Wave 2 rotation.

## Task commits

| Task | Name | Commit |
|------|------|--------|
| 1 | Vault gitignore rules + .env.example name registry | `ea82961` |
| 2 | Agent vault deny rules + A8 functional proof | `cd2fbad` |

## Deviations from Plan

None - plan executed exactly as written. (Note: `.env` and `.env.*` already existed in `.gitignore`; the plan's vault block was appended as specified, leaving existing entries untouched — the resulting duplication is harmless to git and preserves the required negation ordering.)

## Known Stubs

None. All artifacts are functional.

## Threat Register Outcomes

- T-01-05 (.env committed to git): mitigated — gitignore rules live and check-ignore-proven; `git ls-files` shows no tracked `.env`; gitleaks hook from 01-01 scanned both commits.
- T-01-06 (agent reads .env into context): mitigated — deny rules configured AND functionally proven (read refused); A8-RESULT: PASSED committed.
- T-01-07 (realistic placeholder spoofing): mitigated — grep gate proves every non-comment line in `.env.example` is exactly `NAME=__SET_ME__`.
- T-01-08 (settings merge clobber): mitigated — no prior `.claude/settings.json` existed; `settings.local.json` untouched.

## Next

Plans 01-03/01-04 (rotation checklist + CEO rotation evidence): the CEO fills `.env` at repo root using this name registry. Plan 01-06 gate parses `A8-RESULT: PASSED` from evidence/a8-deny-check.md.

## Self-Check: PASSED

- FOUND: .env.example (7 __SET_ME__ entries)
- FOUND: .claude/settings.json (3 deny rules, valid JSON)
- FOUND: evidence/a8-deny-check.md (exactly one A8-RESULT line: PASSED)
- FOUND: .gitignore vault block with !.env.example negation
- FOUND: commits ea82961, cd2fbad
- CONFIRMED: no .env file exists at plan completion
