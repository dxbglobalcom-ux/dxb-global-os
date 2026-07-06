---
phase: 01-security-baseline-credential-remediation
plan: 04
status: complete
completed: 2026-07-06
requirements: [SEC-01]
---

# Plan 01-04 Summary — Credential Rotation Evidence

## What happened

All 21 CRED rows closed with the CEO executing rotations and the builder recording machine-verifiable evidence. Two tours: critical subset first (CRED-01, 04, 07-09, 14, 15, 21), then the remaining 12 rows (rotated by the CEO earlier the same day; report was lost to a session crash and reconstructed from CEO attestation).

## Highlights

- **Evidence-Before-Done catch:** CRED-21 (sudo) "rotated" claim was falsified by a live machine probe — the exposed value still authenticated. Second rotation attempt machine-verified dead (both variants rejected 15:24Z). The rule caught a real false-positive the same day it was adopted.
- **Probe policy:** ✅ login-rejected probes where old values were retained (CRED-01, 04, 21); structured `N/A (old value not retained; server-side invalidation)` elsewhere — recorded as CEO decisions.
- **Attestations:** 5/5 closed. ATT-01 carries a recorded CEO exception (values unique but hand-created before the vault existed; re-generation backlogged). ATT-03/04/05 executed by builder with value-blind sweeps (counts/paths only); ATT-02 CEO-confirmed.
- **Side quests:** Bitwarden vault stood up (web + CLI + Chrome extension); `vault-import.sh` moved all new values from the CEO's odt into the vault without any value transiting agent context; two July-5 transcripts with dead-key traces scrubbed (CEO-approved); bash history scrubbed.

## Deviations

- Rotation scope split into two tours by CEO direction (critical-first); both completed same day.
- 2FA briefly waived by CEO, then reinstated within minutes — waiver file created and deleted, never committed.
