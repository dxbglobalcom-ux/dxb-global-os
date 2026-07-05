# A8 Deny-Rule Functional Spot-Check (SEC-02, plan 01-02 Task 2)

**Timestamp (UTC):** 2026-07-05T22:58:16Z

## Probe description

1. `.claude/settings.json` created with `permissions.deny` containing
   `Read(./.env)`, `Read(./.env.*)`, `Read(**/.env)` (enforcement layer,
   not prompt discipline — RESEARCH A8).
2. Throwaway marker file `.env` created at repo root containing the single
   harmless line `PLACEHOLDER=vault-deny-check` (no credential shape).
3. Read of `.env` attempted via the agent file-read tool.
4. **Observed behavior:** the read was refused by the permission system —
   tool error: "File is in a directory that is denied by your permission
   settings." The marker line never entered agent context. Bash-level
   writes targeting `.env` were also denied by the permission layer during
   this session (independent corroboration of vault-path enforcement).
5. Throwaway `.env` deleted after the probe; `test ! -f .env` confirmed.

## Outcome

Deny semantics proven functional at the file-read tool layer. No
compensating control required; layered backstops (gitignore vault rules,
gitleaks fail-closed pre-commit hook, and the fact that no real `.env`
exists until the CEO creates it) remain in force.

A8-RESULT: PASSED
