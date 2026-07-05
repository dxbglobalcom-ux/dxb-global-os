---
phase: 1
reviewers: [codex]
reviewed_at: 2026-07-05T16:34:51Z
plans_reviewed: [01-01-PLAN.md, 01-02-PLAN.md, 01-03-PLAN.md, 01-04-PLAN.md, 01-05-PLAN.md, 01-06-PLAN.md]
---

# Cross-AI Plan Review — Phase 1: Security Baseline & Credential Remediation

## Codex Review

> Reviewer: codex-cli 0.142.5 (`codex exec --ephemeral`), run inside the project working tree with repo file access. Prompt included PROJECT.md context, Phase 1 roadmap section, SEC-01..04 requirements, 01-CONTEXT.md, and all six plans; the reviewer was instructed to verify claims against the repo (01-RESEARCH.md, .gitignore, etc.) and cite file:line evidence.

## Summary

The six-plan sequence is well-grounded in the repo's actual Phase 1 requirements and research: `ROADMAP.md:33-42` and `REQUIREMENTS.md:9-12` match the phase scope, and `01-RESEARCH.md` contains the cited rotation recipes, vault pattern, scanner design, ODT procedure, assumptions, and environment notes. Overall quality is high, but several machine gates are weaker than the plans claim. The main risk is false confidence: a few grep-based checks can pass while evidence rows, runtime sweeps, or agent-deny enforcement remain incomplete.

## Plan 01-01 — Secret Scanning Foundation

**Summary**: Strong scanner bootstrap plan. It correctly front-loads gitleaks before later evidence commits, and the canary self-test addresses the known "hook exists but does not fire" pitfall.

**Strengths**
- Correctly matches research: gitleaks is the chosen local gate and trufflehog is reserved for verified post-rotation sweep (`01-RESEARCH.md:367-433`).
- Hook activation is explicit via `core.hooksPath`, addressing Pitfall 7 (`01-RESEARCH.md:582-583`, `01-01-PLAN.md:104-116`).
- Uses `--redact` in hook/scan paths, aligned with the no-values rule (`01-RESEARCH.md:384-385`, `01-01-PLAN.md:104`).

**Concerns**
- **MEDIUM**: CI action is left on `gitleaks/gitleaks-action@v2` with SHA pin deferred (`01-01-PLAN.md:134`, `01-01-PLAN.md:166`). For a security-baseline phase, this leaves a supply-chain gap at first push.
- **LOW**: "CI runs on every commit" is imprecise. The workflow triggers on push/PR (`01-RESEARCH.md:411-421`); only the local hook runs per commit.

**Suggestions**
- Pin `gitleaks-action` to a commit SHA now, or add a blocking gate before first remote push.
- In the gate report, phrase SEC-03 as "pre-commit scans every local commit; CI scans every push/PR."

**Risk Assessment**: **LOW-MEDIUM**. Core local protection is solid; residual risk is CI supply-chain and wording precision.

## Plan 01-02 — Vault Scaffold

**Summary**: Correctly identifies the current repo gap: `.gitignore` already ignores `.env.*` and `*.odt` (`.gitignore:1-8`) but lacks `!.env.example`, so the plan's unignore rule is necessary. The placeholder-only registry is aligned with research.

**Strengths**
- Vault layout and seven placeholder names match `01-RESEARCH.md:439-472`.
- It preserves the existing `*.odt` exclusion required by context (`01-CONTEXT.md:73-75`, `.gitignore:7-8`).
- It recognizes `.claude/settings.json` merge risk instead of clobbering config (`01-02-PLAN.md:23-24`, `01-02-PLAN.md:96`).

**Concerns**
- **HIGH**: The plan can complete even if the `.env` read-deny spot check fails. It says record `A8 deny-rule check: FAILED` but still treats layered backstops as sufficient (`01-02-PLAN.md:98-107`), while SEC-02 requires secrets not appear in "agent-visible config" (`REQUIREMENTS.md:10`) and the plan's own must-have says agent tooling is denied (`01-02-PLAN.md:15-17`).
- **MEDIUM**: `01-06` only "notes" the A8 outcome rather than making A8 failure block the gate (`01-06-PLAN.md:99-101`).

**Suggestions**
- Make A8 failure a blocking failure for SEC-02, or explicitly downgrade the plan truth from "denied" to "deny configured; semantics unverified."
- Add an alternative hard control if Claude deny semantics fail, such as relocating runtime `.env` outside the workspace and keeping only `.env.example` in repo.

**Risk Assessment**: **MEDIUM-HIGH**. Git protection is good, but agent-read enforcement is currently allowed to fail without blocking.

## Plan 01-03 — CEO Deliverables

**Summary**: Strong human-procedure plan. It maps the credential inventory from context (`01-CONTEXT.md:34-43`) into 21 evidence rows and encodes the major research trapdoors.

**Strengths**
- Evidence schema matches research columns and rules (`01-RESEARCH.md:514-533`, `01-03-PLAN.md:71-75`).
- Checklist ordering follows the research risk-first order (`01-RESEARCH.md:535-536`, `01-03-PLAN.md:101-109`).
- ODT procedure correctly handles tracked changes, versions, Save As, markdown export, and copy sweep (`01-RESEARCH.md:490-512`, `01-03-PLAN.md:133-136`).

**Concerns**
- **MEDIUM**: The acceptance checks are mostly presence/count checks. They verify `curl -sS` count and trapdoor words (`01-03-PLAN.md:112-121`) but do not prove the commands are copied verbatim from research as required by `01-03-PLAN.md:105`.
- **LOW**: The key-shape grep list is useful but not comprehensive; gitleaks later compensates, but the plan should not imply the grep alone proves no secrets.

**Suggestions**
- Add a generated checklist review step that diffs or references each probe endpoint against the research recipe IDs.
- Add provider-neutral entropy scanning through gitleaks as an explicit verification on the three deliverables, not only key-shape grep.

**Risk Assessment**: **LOW-MEDIUM**. Good procedural design; verification could be stricter.

## Plan 01-04 — Rotation Execution

**Summary**: The human checkpoints are appropriate and respect the no-values boundary. The weakness is the machine completeness gate: it is too loose for the evidence table it is supposed to validate.

**Strengths**
- Correctly keeps old values in the CEO terminal only (`01-04-PLAN.md:67`, `01-04-PLAN.md:90`), matching research probe hygiene (`01-RESEARCH.md:153-162`).
- Explicitly handles Apify grace and Google ordering (`01-RESEARCH.md:208-218`, `01-RESEARCH.md:279-295`, `01-04-PLAN.md:90-100`).
- Requires gitleaks scan before committing evidence (`01-04-PLAN.md:114-125`).

**Concerns**
- **HIGH**: The unresolved-row gate can false-pass. It treats any row containing `✅` or `N/A` as resolved (`01-04-PLAN.md:119-123`), but the evidence table has multiple columns where `N/A` may appear, such as 2FA or action notes (`01-RESEARCH.md:521-532`). It does not parse the `DEAD?` column.
- **HIGH**: Runtime-state attestations are required by the task (`01-04-PLAN.md:90-100`) and research (`01-RESEARCH.md:548-560`), but Task 3 checks only CRED rows, uniqueness, Apify, key-shapes, and gitleaks (`01-04-PLAN.md:114-126`). Sweep attestations can remain blank and still pass.
- **MEDIUM**: The Apify T+24h check is described in prose but not implemented as a parseable timestamp comparison (`01-04-PLAN.md:114`).

**Suggestions**
- Replace grep gates with a small table parser that validates exact columns: `Rotated`, `Probe`, `Observed`, `DEAD?`, `Action`.
- Add explicit attestation IDs and block unless each runtime-state attestation is filled.
- For Apify, require structured fields: `grace=declined` or `grace=accepted; probe_after_24h=yes`.

**Risk Assessment**: **HIGH** until the evidence parser is tightened. This is the central SEC-01 proof.

## Plan 01-05 — ODT Sanitization

**Summary**: The two-level markdown/container verification is well-designed, and the plan correctly avoids reading the original ODT content. The main issue is committing word-match content before CEO review.

**Strengths**
- Current repo does have the ignored source ODT at root, and it has not appeared in git history based on filename check; this matches the plan premise.
- Hard rule not to open/grep original content is appropriate (`01-05-PLAN.md:89`).
- Container verification follows research: ODT is a zip, check extracted content plus gitleaks (`01-RESEARCH.md:490-510`, `01-05-PLAN.md:91-103`).

**Concerns**
- **HIGH**: Task 2 commits `ODT-SANITIZATION-EVIDENCE.md` with line-numbered word matches before Task 3 CEO review (`01-05-PLAN.md:91-93`, `01-05-PLAN.md:108-124`). If a residual value-adjacent fragment exists, the evidence file can preserve it in git before the human catches it.
- **MEDIUM**: The key-shape grep is narrow. Research's ODT verification grep includes broader words/patterns (`01-RESEARCH.md:503-510`), but the plan's hard gate only checks a few provider-shaped prefixes (`01-05-PLAN.md:91-96`).

**Suggestions**
- Do the word-match review in `/tmp` first; commit the evidence only after CEO approval.
- In committed evidence, store line numbers and categories, not matched line text, unless reviewed clean first.
- Add gitleaks and broader credential-adjacent checks before any commit.

**Risk Assessment**: **MEDIUM-HIGH**. The sanitization model is sound, but the review artifact ordering can reintroduce sensitive text.

## Plan 01-06 — Hard-Gate Closure

**Summary**: Good final consolidation plan: it reruns checks live and adds CEO sign-off. The main concern is overclaiming what trufflehog proves and inheriting the weak evidence-row grep from 01-04.

**Strengths**
- Correctly maps final report to all Phase 1 hard gates (`ROADMAP.md:37-42`, `01-06-PLAN.md:97-103`).
- Uses trufflehog verified sweep as a useful semantic backstop (`01-RESEARCH.md:425-433`, `01-06-PLAN.md:70-82`).
- Final human confirmations cover 2FA and backup codes, which machines cannot verify (`01-06-PLAN.md:123-133`).

**Concerns**
- **HIGH**: Gate report inherits the loose unresolved-row reverse filter from 01-04 (`01-06-PLAN.md:99`), so the final gate can pass with incomplete SEC-01 evidence.
- **MEDIUM**: "Nothing in history authenticates anywhere anymore" is overstated (`01-06-PLAN.md:72-84`). Trufflehog verified mode only tests supported detector candidates; it will not prove dead status for ordinary passwords like Gmail, Hotmail, Namecheap, hostloom, WordPress, or sudo from the context inventory (`01-CONTEXT.md:34-43`).
- **MEDIUM**: A8 deny-rule failure is recorded as an operational note, not necessarily a blocking SEC-02 failure (`01-06-PLAN.md:99-101`).

**Suggestions**
- Make the gate report consume structured outputs from stricter parsers, not grep text.
- State trufflehog's scope precisely: "zero verified supported live secrets in repo history," not "nothing authenticates anywhere."
- Block final approval if A8 failed and no alternative vault isolation was implemented.

**Risk Assessment**: **MEDIUM-HIGH**. The closure concept is right, but it depends on fixing 01-04 and 01-02 gate semantics.

## Overall Risk Assessment

**Overall risk: MEDIUM-HIGH.** The phase design is security-aware and source-grounded, but the highest-risk plans rely on brittle text checks for security evidence. Fixing the SEC-01 evidence parser, making agent vault-deny failure blocking or compensating with out-of-workspace vault isolation, and moving ODT word-match review before commit would reduce the plan set to **LOW-MEDIUM** risk.

---

## Consensus Summary

Single external reviewer this cycle (Codex; only the `--codex` flag was requested and gemini/qwen/cursor/antigravity CLIs are not installed). No cross-reviewer consensus is possible; the sections below reflect the one grounded review, cross-checked by the orchestrator against the repo during the source-grounding pass.

### Agreed Strengths

- Plans are genuinely source-grounded: every RESEARCH.md section, pitfall, assumption, and recipe the plans cite exists at the cited location (see Verification coverage below) — confirmed independently by both the reviewer and the orchestrator's grep pass.
- Correct dependency ordering: scanner (01-01) lands before any evidence is committed; rotation (01-04) precedes document sanitization (01-05); the gate (01-06) depends on 01-02/01-04/01-05.
- The no-values discipline is enforced in layers (checklist hygiene, key-shape greps, gitleaks hook, redacted output), not by prompt discipline alone.

### Agreed Concerns (highest priority)

1. **Loose SEC-01 completeness gate** (01-04 Task 3, inherited by 01-06 Task 2): `grep -E '^\| CRED-' | grep -vc -e '✅' -e 'N/A'` counts a row as resolved if `N/A` appears in ANY column (e.g., a 2FA cell), without parsing the `DEAD?` column — the central rotation proof can false-pass. Orchestrator cross-check confirms: the ROTATION-EVIDENCE schema (01-RESEARCH.md:514-533) has 10 columns, several of which legitimately hold `N/A`.
2. **A8 deny-rule failure is non-blocking** (01-02 Task 2, 01-06 Task 2): the plan's must-have claims agent tooling "is denied" by configuration, yet a FAILED spot-check only gets recorded, not gated. Either the must-have needs downgrading or the failure needs to block/trigger a compensating control.
3. **Evidence-before-review ordering in 01-05**: word-match line content is committed in Task 2 before the CEO reviews it in Task 3; a residual non-key-shaped fragment (e.g., a password) could enter permanent history.
4. **Unchecked runtime-sweep attestations** (01-04): attestation rows are mandated but no Task 3 gate verifies they are filled.

### Divergent Views

None recordable — single reviewer. The orchestrator notes one soft disagreement: Codex rates the 01-01 CI SHA-pin deferral MEDIUM, but the plan already contains an explicit, rationale-backed deferral (threat T-01-SC: "major-tag pin now; workflow comment mandates SHA-pin when remote goes live", and the repo has no remote yet), so this is treated as an accepted/deferred item rather than an open action.

### False-positive check

Per the phase's security constraint, `__SET_ME__` placeholders and the `.env.example` name registry are deliberate no-value patterns. The reviewer did not flag them as leaks — no false positives to discount this cycle.

---

## Verification coverage (source-grounding pass)

Authority: `grep` (`gsd-tools drift-guard authority --raw`). Severity mapping under this authority: VERIFIED → none, AMBIGUOUS → MEDIUM, MISSING → needs-acknowledgement, UNCHECKABLE → INFO (never treated as verified). Scope: every symbol/file-path cited by the six PLAN.md files, excluding items each plan declares under "Artifacts this phase produces" (new artifacts, including `~/.local/bin/gitleaks`, `~/.local/bin/trufflehog`, `docs/`, all `evidence/` files, `.gitleaks.toml`, `scripts/hooks/pre-commit`, `.github/workflows/secret-scan.yml`, `.env.example`, `.claude/settings.json`, the three CEO deliverables, and the `git config core.hooksPath` side effect).

### Verdicts — repo files cited by plans

| Symbol / path | Cited by | Verdict | Severity |
|---|---|---|---|
| `.planning/ROADMAP.md` (Phase 1 section) | all plans | VERIFIED — .planning/ROADMAP.md:33-56 | none |
| `.planning/STATE.md` | 01-01 | VERIFIED — file exists | none |
| `.planning/REQUIREMENTS.md` SEC-01..04 | frontmatter of all plans | VERIFIED — .planning/REQUIREMENTS.md:9-12 | none |
| `01-CONTEXT.md` (credential inventory, locked decisions) | 01-01..01-06 | VERIFIED — 01-CONTEXT.md:34-43, :14-51 | none |
| `01-RESEARCH.md` | 01-01..01-06 | VERIFIED — file exists, 59KB | none |
| `01-VALIDATION.md` (Wave 0 requirements; per-task verification map) | 01-01, 01-06 | VERIFIED — 01-VALIDATION.md:63 (`## Wave 0 Requirements`), :37 (map table) | none |
| `.gitignore` `*.odt` rule (claimed pre-existing) | 01-02, 01-05 | VERIFIED — .gitignore:8 | none |
| `.gitignore` missing `!.env.example` (plan adds it) | 01-02 | VERIFIED — .gitignore:2-3 have `.env`/`.env.*`, no negation present (plan's premise correct) | none |
| `.claude/settings.local.json` (check for conflicting allow rules) | 01-02 | VERIFIED — exists; allow list is `Bash(claude *)`, `Bash(npm ...)` only, no `.env` reads | none |
| Source `.odt` at repo root, gitignored, never committed | 01-05 | VERIFIED — file present at root; `git check-ignore -v` matches .gitignore:8; `git log --all` shows no .odt | none |
| `$HOME/.claude/gsd-core/workflows/execute-plan.md` | all plans (execution_context) | VERIFIED — file exists | none |
| `$HOME/.claude/gsd-core/templates/summary.md` | all plans (execution_context) | VERIFIED — file exists | none |

### Verdicts — 01-RESEARCH.md sections cited as source of truth

| Section cited | Cited by | Verdict | Severity |
|---|---|---|---|
| "Secret Scanning: decision + wiring" | 01-01 | VERIFIED — 01-RESEARCH.md:367 | none |
| "Standard Stack" | 01-01 | VERIFIED — :94 | none |
| "Package Legitimacy Audit" | 01-01, 01-06 | VERIFIED — :139 | none |
| "Environment Availability" | 01-01 | VERIFIED — :651 | none |
| "Local pre-commit hook (mandatory — zero-dependency variant)" | 01-01 | VERIFIED — :371 | none |
| "Hook self-test" | 01-01 | VERIFIED — :435 | none |
| "Full-history scan" | 01-01 | VERIFIED — :399 | none |
| "CI (optional per CONTEXT; recommended)" | 01-01 | VERIFIED — :407 | none |
| Open Question 1 (and Q1→01-01 T3 mapping) | 01-01 | VERIFIED — :638 | none |
| Assumption A7 (gitleaks-action licensing) | 01-01 | VERIFIED — :631 | none |
| Assumption A8 (deny-glob semantics) | 01-02 | VERIFIED — :632 | none |
| "State of the Art" (gitleaks git vs detect/protect) | 01-01 | VERIFIED — :611 | none |
| "Vault Pattern (SEC-02)" | 01-02 | VERIFIED — :439 | none |
| "How agents reference secrets without reading .env" | 01-02 | VERIFIED — :480 | none |
| Recipe 3 — 9Router local-software rationale | 01-02, 01-03 | VERIFIED — :190 | none |
| "Evidence-Record Schema (proposal)" | 01-03, 01-04 | VERIFIED — :514 | none |
| "Per-Service Recipes" 1-14 | 01-03 | VERIFIED — :151-352 (all 14 recipes present) | none |
| "2FA Enrollment (TOTP-first)" table | 01-03 | VERIFIED — :354 | none |
| "Checklist ordering" (recovery-vector risk-first) | 01-03 | VERIFIED — :535 | none |
| "Common Pitfalls" 1-8 | 01-03 | VERIFIED — :562-586 | none |
| Pitfall 2 (unauthenticated endpoint false PASS) | 01-03 | VERIFIED — :567 | none |
| Pitfall 4 (old value leaks during verification) | 01-03 | VERIFIED — :573 | none |
| Pitfall 6 (sanitized copy committed as .odt) | 01-03, 01-05 | VERIFIED — :579 | none |
| Pitfall 7 (hook exists but nothing proves it fires) | 01-01 | VERIFIED — :582 | none |
| "Runtime State Inventory" | 01-03, 01-04 | VERIFIED — :548 | none |
| "Document Sanitization (SEC-04)" | 01-03, 01-05 | VERIFIED — :490 | none |
| "Post-rotation verified sweep" | 01-06 | VERIFIED — :425 | none |
| Probe-hygiene preamble (leading-space export, HISTCONTROL) | 01-03 | VERIFIED — :154, :634 (A10) | none |

No MISSING or AMBIGUOUS verdicts this cycle.

### UNCHECKABLE / skipped symbols (severity INFO under grep authority — not treated as verified)

| Symbol | Cited by | Why uncheckable |
|---|---|---|
| gitleaks v8.24.x release archive + sha256 checksums (github.com/gitleaks/gitleaks/releases) | 01-01 | External network artifact; grep cannot verify release availability or checksum contents. Mitigated in-plan by T-01-01 checksum gate at execution time. |
| trufflehog v3 release binary + checksums (github.com/trufflesecurity/trufflehog/releases) | 01-06 | External network artifact; same as above (T-01-24). |
| `gitleaks/gitleaks-action@v2` GitHub Action | 01-01 | External action; existence/behavior not greppable. SHA-pin explicitly deferred in-plan (T-01-SC) until a remote exists. |
| `actions/checkout@v4` GitHub Action | 01-01 | External action; not greppable. |
| Provider probe endpoints (smtp.gmail.com:465, login.live.com, mail.privateemail.com:993, Cloudflare `tokens/verify` + `user/tokens/verify`, hostloom `:2083`, `wp-login.php`, `wp-json` users/me, OpenAI `/v1/models`, OpenRouter `/api/v1/key`, NVIDIA chat/completions, Apify `/v2/users/me`, Ollama `api/generate`, OpenCode Zen chat/completions) | 01-03, 01-04 | Live third-party endpoints; grep verifies they are cited verbatim in 01-RESEARCH.md recipes (:164-352) but cannot verify endpoint correctness/liveness. Plans mitigate via "copied verbatim from RESEARCH" rule + Pitfall 2 trapdoor. |
| Claude Code `permissions.deny` `Read(./.env)` glob semantics (A8) | 01-02, 01-06 | Runtime tool behavior, not a repo symbol; the plan itself marks this verify-at-execution with a functional spot-check. Flagged HIGH by the reviewer for its non-blocking failure path (see Consensus). |
| LibreOffice UI paths (Edit > Track Changes > Manage; File > Versions; Save As zip rewrite) | 01-03, 01-05 | External application behavior; not greppable. Backstopped in-plan by container-level gitleaks + key-shape gates on the extracted zip. |
| Environment binaries: `python3`, `openssl`, `unzip`, `git`, `curl` (used in verify commands) | 01-01..01-06 | Environment state, not repo content; grep authority cannot verify. Orchestrator side-note: `command -v` confirms all present on this machine, and 01-RESEARCH.md "Environment Availability" (:651) documents them; verdict remains UNCHECKABLE per contract. |
| Apify 24-hour grace-window behavior; Google app-password auto-revocation ordering; provider dashboard paths | 01-03, 01-04 | Third-party provider behavior; documented in RESEARCH recipes with confidence ratings but not verifiable from the repo. |
| trufflehog exit-code semantics (183 = verified finding) | 01-06 | External tool behavior; cited from 01-RESEARCH.md:431 but not greppable beyond the citation. |

Skipped (out of scope for this pass): symbols cited only by 01-CONTEXT.md or PROJECT.md rather than by the plans themselves (`.planning/research/PITFALLS.md`, `.planning/research/SUMMARY.md`, `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md`); all items under each plan's "Artifacts this phase produces" (new by declaration).
