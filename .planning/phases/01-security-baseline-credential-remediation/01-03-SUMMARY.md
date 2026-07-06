---
phase: 01-security-baseline-credential-remediation
plan: 03
subsystem: security
tags: [credential-rotation, gitleaks, odt-sanitization, evidence-schema, ceo-checklist]

# Dependency graph
requires:
  - phase: 01-security-baseline-credential-remediation (plan 01-01)
    provides: gitleaks scanner + pre-commit hook (evidence files pass the same scan)
provides:
  - CREDENTIAL-ROTATION-CHECKLIST.md — bilingual, risk-first, 12-section CEO rotation runbook with verbatim probes
  - evidence/ROTATION-EVIDENCE.md — 21 pre-assigned CRED rows + 5 machine-parseable ATT attestation rows
  - ODT-SANITIZATION-PROCEDURE.md — container-aware sanitization procedure with two distinct scratch paths
affects: [01-04-fill-rotation-evidence, 01-05-odt-sanitization-execution, 01-06-phase-gate-report]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Column-scoped completeness gate: DEAD?/Status/Action cells parsed by table column position (awk -F'|' $N), never whole-row grep — prevents an N/A or placeholder written in the wrong cell from silently satisfying a gate (HIGH-2, MED-2)"
    - "Sorted-ID-set gate: row count alone cannot prove no duplicate/missing ID; a sort-and-diff against the generated CRED-01..CRED-21 sequence catches a duplicate masking a gap (cycle 3 MED-6)"
    - "Probe-tagged fenced block verbatim gate: opening fence is `\`\`\`probe` (no space) so an awk state machine can isolate probe recipes from unrelated fenced blocks (Section 11 sweep commands) and prove byte-identity against the RESEARCH source of truth in both directions (MED-1, cycle 3 MED-7)"
    - "TR: bilingual annotation convention — every trapdoor/ordering-constraint/irreversible-action/ambiguous step carries a Turkish annotation line directly beneath the English step"

key-files:
  created:
    - .planning/phases/01-security-baseline-credential-remediation/evidence/ROTATION-EVIDENCE.md
    - .planning/phases/01-security-baseline-credential-remediation/CREDENTIAL-ROTATION-CHECKLIST.md
    - .planning/phases/01-security-baseline-credential-remediation/ODT-SANITIZATION-PROCEDURE.md
  modified: []

key-decisions:
  - "Copied all 12 probe commands byte-identically (including original leading whitespace) from 01-RESEARCH.md's Per-Service Recipes, rather than reformatting — guarantees exact-line matches for the reverse verbatim gate rather than relying on substring tolerance"
  - "CRED-20 (9Router) DEAD? cell pre-filled 'N/A (local software)' unconditionally, distinct from CRED-09 (Cloudflare Global API Key) which is left blank for the CEO to resolve conditionally, since only CRED-20 is structurally never probeable while CRED-09's applicability depends on facts only the CEO can confirm"
  - "Used flush-left (column-0) fence markers throughout the checklist, even where nested under numbered steps, so every fenced block is correctly recognized by the awk fence-detection state machine (a fence indented under a list item would not trigger at index==1)"

patterns-established:
  - "Evidence-schema no-values contract: Observed column may hold only a status/error code or the literal phrase 'login rejected' — never a secret value, enforced by grep gates on all three deliverables"

requirements-completed: [SEC-01, SEC-04]

coverage:
  - id: D1
    description: "Rotation evidence template: 21 pre-assigned CRED-01..CRED-21 rows (sorted-ID-set proven unique) + 5 machine-parseable ATT attestation rows, column-scoped N/A and grace-placeholder gates"
    requirement: "SEC-01"
    verification:
      - kind: other
        ref: "grep -cE row-count/sorted-ID-set diff/ATT-count/CRED-17-Action-column/key-shape checks per PLAN.md Task 1 acceptance_criteria — all executed inline, all pass"
        status: pass
    human_judgment: false
  - id: D2
    description: "Bilingual CEO rotation checklist: 12 sections, 15 TR: annotations, 12 probe-tagged fenced blocks byte-verbatim against RESEARCH, all four trapdoor callouts, 19 CRED-NN evidence links"
    requirement: "SEC-01"
    verification:
      - kind: other
        ref: "endpoint-presence loop + probe-scoped full-verbatim awk gate + probe-tag-count + TR-count + trapdoor greps per PLAN.md Task 2 acceptance_criteria — all executed inline, all pass"
        status: pass
    human_judgment: false
  - id: D3
    description: "ODT sanitization procedure: two distinct scratch paths (/tmp/odt-original-work.odt vs /tmp/odt-sanitized-check.odt, old ambiguous path fully retired), markdown export destination, container hygiene, verification preview, cloud-sync sweep checklist"
    requirement: "SEC-04"
    verification:
      - kind: other
        ref: "path-distinctness/track-changes/versions/unzip/trash/cloud/TR-count/key-shape greps per PLAN.md Task 3 acceptance_criteria — all executed inline, all pass"
        status: pass
    human_judgment: false

duration: 14min
completed: 2026-07-06
status: complete
---

# Phase 1 Plan 3: CEO Rotation Deliverables Summary

**Three CEO-facing security deliverables — a 21-row no-values evidence template, a bilingual 12-section rotation checklist with byte-verbatim probe commands, and a two-path ODT sanitization procedure — all machine-gated so unverified ticking or an ambiguous scratch path is structurally impossible.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-07-06T08:48:15Z
- **Completed:** 2026-07-06T11:00:23Z
- **Tasks:** 3
- **Files modified:** 3 (all created)

## Accomplishments

- `evidence/ROTATION-EVIDENCE.md`: 21 pre-assigned CRED-01..CRED-21 rows (ID uniqueness machine-proven via sorted-set diff, not just row count — cycle 3 MED-6), plus a 5-row machine-parseable ATT attestation table; CRED-17's Action cell pre-filled with the `grace=__PENDING__` placeholder so the plan 01-04 gate can block on it column-by-column (MED-2); CRED-20's DEAD? cell pre-filled `N/A (local software)` since that row is structurally never probeable
- `CREDENTIAL-ROTATION-CHECKLIST.md`: 12 numbered sections (0-11) in recovery-vector risk-first order, 15 Turkish (`TR:`) annotations on every trapdoor/ordering-constraint/irreversible step, and 12 probe-tagged fenced blocks copied byte-identically from `01-RESEARCH.md` — verified in both directions (every RESEARCH endpoint appears here, and every line inside a `probe`-tagged block is verbatim in RESEARCH); all four trapdoor callouts present (Apify grace decline, Google capture-before-password-change ordering, 9Router local-software reframe, OpenRouter public-endpoint ban)
- `ODT-SANITIZATION-PROCEDURE.md`: two named, never-interchanged scratch paths (`/tmp/odt-original-work.odt` for the unsanitized copy, `/tmp/odt-sanitized-check.odt` for the sanitized copy — the old single-path `/tmp/sanitize-work.odt` from RESEARCH is fully retired per cross-AI review HIGH-6), markdown export target named explicitly to dodge the silent `*.odt` gitignore trap, container-level Track Changes/Versions purge steps, a verification preview of what plan 01-05 will run, and a guided cloud-sync/backup sweep checklist

## Task Commits

Each task was committed atomically:

1. **Task 1: Rotation evidence template (21 pre-assigned rows, no-values schema)** - `7870da7` (feat)
2. **Task 2: Bilingual CEO rotation checklist (risk-first, trapdoors encoded)** - `3e07709` (feat)
3. **Task 3: ODT sanitization procedure document** - `c91d81c` (feat)

_No TDD tasks in this plan — single commit per task._

## Files Created/Modified

- `.planning/phases/01-security-baseline-credential-remediation/evidence/ROTATION-EVIDENCE.md` - 21-row CRED evidence table + 5-row ATT attestation table, header rules (no-values, probe-before-tick, column-scoped N/A)
- `.planning/phases/01-security-baseline-credential-remediation/CREDENTIAL-ROTATION-CHECKLIST.md` - 12-section bilingual rotation runbook with 12 probe-tagged verbatim curl recipes
- `.planning/phases/01-security-baseline-credential-remediation/ODT-SANITIZATION-PROCEDURE.md` - two-scratch-path ODT sanitization procedure with cloud-sweep checklist

## Decisions Made

- Copied all 12 probe commands byte-identically (original leading whitespace preserved) from `01-RESEARCH.md`'s Per-Service Recipes rather than reformatting for readability — this guarantees the reverse full-verbatim gate finds exact-line matches rather than relying on substring containment across different indentation
- Kept every fenced code block's opening/closing backtick markers flush-left (column 0) throughout the checklist, even where the surrounding prose is a numbered list step — an indented fence marker would not be recognized by the gate's awk state machine (`index($0,fs)==1` requires the fence at line position 1)
- CRED-20 (9Router) gets its DEAD? cell pre-filled `N/A (local software)` unconditionally in the template, distinct from CRED-09 (Cloudflare Global API Key) which is left blank for the CEO to resolve conditionally — only CRED-20 is structurally never probeable via a dead-value check; CRED-09's applicability depends on a fact (did this key appear in the leaked doc) only the CEO can confirm

## Deviations from Plan

None - plan executed exactly as written. All must-have truths, artifacts, and key-links from the plan frontmatter are satisfied; every acceptance-criteria command from all three tasks was run inline and passed on the first attempt.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required. The CEO's next action is to execute `CREDENTIAL-ROTATION-CHECKLIST.md` end to end (plan 01-04 fills the resulting evidence) and `ODT-SANITIZATION-PROCEDURE.md` (plan 01-05 verifies the sanitized output).

## Next Phase Readiness

- Wave 2 can start: the CEO has a complete, self-contained, bilingual rotation runbook and a structurally-honest evidence template — no ambiguity about which endpoint to probe, which trapdoor to watch for, or which cell means "done"
- Plan 01-04 (fill rotation evidence) depends on `evidence/ROTATION-EVIDENCE.md`'s exact column layout — do not reorder or rename columns without updating 01-04's parsing logic
- Plan 01-05 (ODT sanitization execution) depends on the two named scratch paths in `ODT-SANITIZATION-PROCEDURE.md` — both paths must appear exactly as written for its verification commands to find the right file
- No blockers

---
*Phase: 01-security-baseline-credential-remediation*
*Completed: 2026-07-06*

## Self-Check: PASSED

All three created deliverables and this SUMMARY.md verified present on disk; all three task commits (7870da7, 3e07709, c91d81c) verified present in git log.
