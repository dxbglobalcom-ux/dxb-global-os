# Hook Self-Test Evidence — SEC-03 (pre-commit secret scan fires and blocks)

**UTC timestamp:** Sun Jul 5 10:44 PM UTC 2026 (2026-07-05T22:43–22:44Z)
**gitleaks version:** 8.24.3 (installed at `~/.local/bin/gitleaks`, sha256 of release archive verified against `gitleaks_8.24.3_checksums.txt` — match: yes)
**Hook:** `scripts/hooks/pre-commit`, activated via `git config core.hooksPath scripts/hooks`

## Self-test protocol and results

Canary: a freshly generated random 40-hex value (`openssl rand -hex 20`) assigned to an
AWS-style secret variable name. The value was random, never a real credential, and is
NOT recorded here (status codes and redacted lines only).

| Step | Command mode | Expected | Observed exit code | Result |
|------|--------------|----------|--------------------|--------|
| (b) stdin detection | `gitleaks stdin --redact` (canary line piped) | non-zero (leak found) | **1** — `leaks found: 1` | PASS |
| (c) blocked commit | `git commit` with `canary-selftest.txt` staged | non-zero (hook blocks) | **1** — commit rejected, nothing entered history | PASS |

## Redacted output line proving the block

```
Secret:      REDACTED
Fingerprint: canary-selftest.txt:generic-api-key:1
```

(Rule matched: `generic-api-key`, entropy 3.70. `--redact` suppressed the matched value.)

## Cleanup confirmation

- `git restore --staged canary-selftest.txt` then `rm canary-selftest.txt` (scoped commands; no bare `git reset`)
- `test ! -f canary-selftest.txt` → exit 0 (canary file removed from working tree)
- `git log --all --name-only --format= | grep -cx 'canary-selftest.txt'` → `0` (canary never entered history)

## Fail-closed property

`scripts/hooks/pre-commit` exits 1 with an error to stderr when `gitleaks` is not on
PATH — a missing scanner blocks the commit instead of passing silently (RESEARCH
Pitfall 7). The hook prepends `$HOME/.local/bin` to PATH so gitleaks resolves for
every git client, including parallel executor agents.
