# Phase 1: Security Baseline & Credential Remediation - Context

**Gathered:** 2026-07-05
**Status:** Ready for planning
**Source:** CEO directive (roadmap approval, 2026-07-05) — treated as locked decisions

<domain>
## Phase Boundary

Reach a verified-clean security posture before any build work: every credential leaked in the source .odt rotated and verifiably dead, 2FA on critical accounts, secrets vault pattern in place, automated secret scanning active, source document sanitized. **Hard exit gate: Phase 2 (and any build/monorepo/code work) MUST NOT start until every criterion is verified with evidence — not just ticked.**

</domain>

<decisions>
## Implementation Decisions

### Hard gate (CEO-locked)
- Old credential/key/password/token values must verifiably return 401/access-denied before Phase 2 starts
- 2FA confirmed on Gmail, Cloudflare, Namecheap, hosting at minimum
- Source ODT sanitized (credentials section stripped; original stays out of git/cloud sync)
- Vault pattern (`.env` + loader + `.gitignore`) established
- Secret scan passes clean (pre-commit + CI)

### Division of labor (CEO-locked)
- CEO personally performs all rotations (passwords, keys, 2FA enrollment) following the checklist
- The OS/builder prepares: the checklist, the verification procedures, the evidence structure, the vault scaffold, the scanning automation
- **Secret VALUES are never written into any project file, prompt, or chat** — the checklist references credentials by name/category only

### Deliverable shape (CEO-locked)
- Credential remediation checklist covering every secret category in the source doc
- Verification evidence structure: per-item record that the old value is dead (e.g., API call returns 401; login rejected), captured without exposing new values
- Canonical numbering: this is Phase 1 of 11 (P0 label is historical only)

### Credential inventory to cover (categories only — values live nowhere in this repo)
- Linux sudo password (laptop)
- Gmail account + application password
- Two Hotmail accounts
- WordPress admin (outleteuro)
- Hosting account (hostloom)
- Namecheap dashboard + private email (support@/sales@ outleteuro)
- Cloudflare: agent token + legacy fallback user token
- API keys: OpenAI, OpenRouter, 9Router, NVIDIA Build, Apify, Ollama, OpenCode
- Password-reuse hazard: the same passwords repeat across many services — every rotated value must be unique per service

### Claude's Discretion
- Checklist format and ordering (risk-first vs provider-grouped)
- Evidence record format and storage layout (no secrets in evidence)
- Secret-scanner choice (gitleaks or equivalent) and pre-commit/CI wiring
- Vault loader pattern details (dotenv conventions, template file naming)
- How to verify each provider's old key is dead (per-API 401 probes, login checks)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase definition
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, CEO-locked hard-gate note
- `.planning/REQUIREMENTS.md` — SEC-01..SEC-04

### Risk context
- `.planning/research/PITFALLS.md` — P0 verification exit gate; rotation-failure modes (password reuse, unverified rotation)
- `.planning/research/SUMMARY.md` — phase ordering rationale
- `/home/ghost/.claude/plans/bubbly-dazzling-goblet.md` — §12 Security Flag (source-of-truth extraction)

</canonical_refs>

<specifics>
## Specific Ideas

- Evidence without secrets: record HTTP status / login-failure screenshots-by-description / timestamps, never tokens
- The source .odt lives at repo root and is already gitignored (`*.odt`); sanitization produces a credentials-free copy into project docs
- Likely exposure: document content was previously pasted into third-party AI tools — treat every listed credential as compromised, no exceptions

</specifics>

<deferred>
## Deferred Ideas

- LiteLLM virtual keys per department — Phase 4 (Safety Rails)
- Secrets/Vault MCP for agent runtime access — Phase 3+ (dxb-mcp)
- Cloudflare/hosting token re-issue with narrow scopes for agent use — Phase 7+ (only after gateway exists)

</deferred>

---

*Phase: 01-security-baseline-credential-remediation*
*Context gathered: 2026-07-05 from CEO directive*
