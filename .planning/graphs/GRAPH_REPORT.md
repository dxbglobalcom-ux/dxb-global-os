# Graph Report - DxB Global OS  (2026-07-06)

## Corpus Check
- 41 files · ~72,932 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 472 nodes · 440 edges · 43 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8d2b39a4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Architecture Research|Architecture Research]]
- [[_COMMUNITY_CLAUDE|CLAUDE.md]]
- [[_COMMUNITY_Implications for Roadmap|Implications for Roadmap]]
- [[_COMMUNITY_v1 Requirements|v1 Requirements]]
- [[_COMMUNITY_Critical Pitfalls|Critical Pitfalls]]
- [[_COMMUNITY_Credential Rotation Checklist (CEO-executed)|Credential Rotation Checklist (CEO-executed)]]
- [[_COMMUNITY_Cross-AI Plan Review — Phase 1 Security Baseline & Credential Remediation|Cross-AI Plan Review — Phase 1: Security Baseline & Credential Remediation]]
- [[_COMMUNITY_Phase Details|Phase Details]]
- [[_COMMUNITY_Phase 1 Security Baseline & Credential Remediation - Research|Phase 1: Security Baseline & Credential Remediation - Research]]
- [[_COMMUNITY_Cross-AI Plan Review — Phase 1 — Convergence Cycle 2|Cross-AI Plan Review — Phase 1 — Convergence Cycle 2]]
- [[_COMMUNITY_Quick Task 260706-h26 Second-Brain Infrastructure (Obsidian + Knowledge Graph) Summary|Quick Task 260706-h26: Second-Brain Infrastructure (Obsidian + Knowledge Graph) Summary]]
- [[_COMMUNITY_Feature Research|Feature Research]]
- [[_COMMUNITY_Per-Service Recipes (rotate → prove dead → record)|Per-Service Recipes (rotate → prove dead → record)]]
- [[_COMMUNITY_Stack Research|Stack Research]]
- [[_COMMUNITY_Phase 1 Plan 3 CEO Rotation Deliverables Summary|Phase 1 Plan 3: CEO Rotation Deliverables Summary]]
- [[_COMMUNITY_Implementation Decisions|Implementation Decisions]]
- [[_COMMUNITY_DXB Global OS|DXB Global OS]]
- [[_COMMUNITY_Project State|Project State]]
- [[_COMMUNITY_260706-h26-PLAN|260706-h26-PLAN.md]]
- [[_COMMUNITY_Phase 01 Plan 01 Automated Secret Scan (SEC-03 build half) Summary|Phase 01 Plan 01: Automated Secret Scan (SEC-03 build half) Summary]]
- [[_COMMUNITY_Phase 01 Plan 02 Secrets Vault Pattern (SEC-02) Summary|Phase 01 Plan 02: Secrets Vault Pattern (SEC-02) Summary]]
- [[_COMMUNITY_Common Pitfalls|Common Pitfalls]]
- [[_COMMUNITY_ODT Sanitization Procedure (CEO-executed)|ODT Sanitization Procedure (CEO-executed)]]
- [[_COMMUNITY_manifest.json|manifest.json]]
- [[_COMMUNITY_Phase 1 — Validation Strategy|Phase 1 — Validation Strategy]]
- [[_COMMUNITY_Secret Scanning decision + wiring|Secret Scanning: decision + wiring]]
- [[_COMMUNITY_Hook Self-Test Evidence — SEC-03 (pre-commit secret scan fires and blocks)|Hook Self-Test Evidence — SEC-03 (pre-commit secret scan fires and blocks)]]
- [[_COMMUNITY_Validation Architecture|Validation Architecture]]
- [[_COMMUNITY_Phase 1 Rotation Evidence|Phase 1 Rotation Evidence]]
- [[_COMMUNITY_01-01-PLAN|01-01-PLAN.md]]
- [[_COMMUNITY_01-02-PLAN|01-02-PLAN.md]]
- [[_COMMUNITY_01-03-PLAN|01-03-PLAN.md]]
- [[_COMMUNITY_01-04-PLAN|01-04-PLAN.md]]
- [[_COMMUNITY_01-05-PLAN|01-05-PLAN.md]]
- [[_COMMUNITY_01-06-PLAN|01-06-PLAN.md]]
- [[_COMMUNITY_Standard Stack|Standard Stack]]
- [[_COMMUNITY_User Constraints (from CONTEXT.md)|User Constraints (from CONTEXT.md)]]
- [[_COMMUNITY_Code Examples|Code Examples]]
- [[_COMMUNITY_Vault Pattern (SEC-02)|Vault Pattern (SEC-02)]]
- [[_COMMUNITY_Sources|Sources]]
- [[_COMMUNITY_A8 Deny-Rule Functional Spot-Check (SEC-02, plan 01-02 Task 2)|A8 Deny-Rule Functional Spot-Check (SEC-02, plan 01-02 Task 2)]]
- [[_COMMUNITY_Security Domain|Security Domain]]

## God Nodes (most connected - your core abstractions)
1. `Phase 1: Security Baseline & Credential Remediation - Research` - 26 edges
2. `v1 Requirements` - 18 edges
3. `Per-Service Recipes (rotate → prove dead → record)` - 15 edges
4. `caddy             — TLS reverse proxy` - 13 edges
5. `Credential Rotation Checklist (CEO-executed)` - 13 edges
6. `Phase Details` - 12 edges
7. `Cross-AI Plan Review — Phase 1: Security Baseline & Credential Remediation` - 12 edges
8. `Quick Task 260706-h26: Second-Brain Infrastructure (Obsidian + Knowledge Graph) Summary` - 12 edges
9. `Phase 1 Plan 3: CEO Rotation Deliverables Summary` - 11 edges
10. `Architecture Research` - 11 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (43 total, 0 thin omitted)

### Community 0 - "Architecture Research"
Cohesion: 0.06
Nodes (31): Anti-Pattern 1: Peer-to-peer agent chatter, Anti-Pattern 2: Approval as review, execution as function call, Anti-Pattern 3: N databases of truth, Anti-Pattern 4: Building all 367 agents (or all 8 MCPs, or the whole dashboard) before the loop closes, Anti-Pattern 5: `postgres_changes` everywhere + LISTEN/NOTIFY as a queue, Anti-Patterns, Architectural Patterns, Architecture Research (+23 more)

### Community 1 - "CLAUDE.md"
Cohesion: 0.06
Nodes (30): Alternatives Considered, Architecture, Architecture Fit (how the pieces click), caddy             — TLS reverse proxy, Constraints, Conventions, Core Technologies, Developer Profile (+22 more)

### Community 2 - "Implications for Roadmap"
Cohesion: 0.08
Nodes (24): Architecture Approach, Confidence Assessment, Critical Pitfalls, Executive Summary, Expected Features, Gaps to Address, Implications for Roadmap, Key Findings (+16 more)

### Community 3 - "v1 Requirements"
Cohesion: 0.09
Nodes (22): 24/7 Runtime (VPS), Agent Registry (REG), Approval Gates (GATE), Cost & Audit (COST), Council (CNCL), Dashboard & CRM (DASH), Departments & Personas (DEPT), Integration Program (INTEG) (+14 more)

### Community 4 - "Critical Pitfalls"
Cohesion: 0.09
Nodes (21): Critical Pitfalls, Integration Gotchas, "Looks Done But Isn't" Checklist, Performance Traps, Pitfall 10: The dashboard that lies — a second source of truth nobody maintains, Pitfall 1: Building the org chart before proving one workflow, Pitfall 2: Approval gates as prompt text instead of code, Pitfall 3: Cheap worker models silently degrading quality — and a judge too weak to catch it (+13 more)

### Community 5 - "Credential Rotation Checklist (CEO-executed)"
Cohesion: 0.10
Nodes (19): 0. Before you start, 10. Linux sudo password (laptop), 11. Runtime-state sweep (after all rotations), 1. Google (recovery hub first), 2. Microsoft Hotmail accounts (×2), 3. Namecheap dashboard, 4. Namecheap Private Email (×2 — support@, sales@), 5. Cloudflare (agent token + legacy user token + Global API Key) (+11 more)

### Community 6 - "Cross-AI Plan Review — Phase 1: Security Baseline & Credential Remediation"
Cohesion: 0.11
Nodes (19): Agreed Concerns (highest priority), Agreed Strengths, Codex Review, Consensus Summary, Cross-AI Plan Review — Phase 1: Security Baseline & Credential Remediation, Divergent Views, False-positive check, Overall Risk Assessment (+11 more)

### Community 7 - "Phase Details"
Cohesion: 0.11
Nodes (17): Coverage, Overview, Phase 10: Department Activation Waves & Persona Factory, Phase 11: Outleteuro Pilot, Phase 1: Security Baseline & Credential Remediation, Phase 2: Foundation & Integration Program, Phase 3: State Layer & dxb-mcp Core, Phase 4: Safety Rails — Gates, Cost, Audit (+9 more)

### Community 8 - "Phase 1: Security Baseline & Credential Remediation - Research"
Cohesion: 0.12
Nodes (16): 2FA Enrollment (TOTP-first) — summary table, Architectural Responsibility Map, Assumptions Log, Document Sanitization (SEC-04), Don't Hand-Roll, Environment Availability, Evidence-Record Schema (proposal), Metadata (+8 more)

### Community 9 - "Cross-AI Plan Review — Phase 1 — Convergence Cycle 2"
Cohesion: 0.12
Nodes (16): Agreed Strengths (cycle 2), Codex Review (cycle 2), Codex Review (cycle 3), Consensus Summary — Cycle 2, Consensus Summary — Cycle 3, Cross-AI Plan Review — Phase 1 — Convergence Cycle 2, Current concerns after cycle 2, Cycle-2 verdict (+8 more)

### Community 10 - "Quick Task 260706-h26: Second-Brain Infrastructure (Obsidian + Knowledge Graph) Summary"
Cohesion: 0.12
Nodes (15): Accomplishments, Decisions Made, Dependency graph, Deviations from Plan, Documented Non-Blocking Failure (Task 2, per plan's own instructions), Files Created/Modified, Issues Encountered, Known Stubs (+7 more)

### Community 11 - "Feature Research"
Cohesion: 0.12
Nodes (15): Add After Validation (v1.x), Anti-Features (Commonly Requested, Often Problematic), Competitor Feature Analysis, Dependency Notes, Differentiators (Competitive Advantage), Feature Dependencies, Feature Landscape, Feature Prioritization Matrix (+7 more)

### Community 12 - "Per-Service Recipes (rotate → prove dead → record)"
Cohesion: 0.13
Nodes (15): 10. Microsoft accounts (two Hotmail) — confidence: MEDIUM, 11. WordPress admin (outleteuro) — confidence: HIGH, 12. Hosting (hostloom, cPanel-class) — confidence: LOW (provider-specific paths unverifiable), 13. Namecheap dashboard + Private Email — confidence: HIGH, 14. Linux sudo password (laptop) — confidence: HIGH, 1. OpenAI API — confidence: HIGH, 2. OpenRouter — confidence: MEDIUM, 3. 9Router — confidence: MEDIUM (nature of service verified; remediation is local) (+7 more)

### Community 13 - "Stack Research"
Cohesion: 0.13
Nodes (14): Alternatives Considered, Architecture Fit (how the pieces click), Core Technologies, Development Tools, Headline Recommendation, Implications for Roadmap Phases, Installation, Recommended Stack (+6 more)

### Community 14 - "Phase 1 Plan 3: CEO Rotation Deliverables Summary"
Cohesion: 0.14
Nodes (13): Accomplishments, Decisions Made, Dependency graph, Deviations from Plan, Files Created/Modified, Issues Encountered, Next Phase Readiness, Performance (+5 more)

### Community 15 - "Implementation Decisions"
Cohesion: 0.14
Nodes (13): Canonical References, Claude's Discretion, Credential inventory to cover (categories only — values live nowhere in this repo), Deferred Ideas, Deliverable shape (CEO-locked), Division of labor (CEO-locked), Hard gate (CEO-locked), Implementation Decisions (+5 more)

### Community 16 - "DXB Global OS"
Cohesion: 0.15
Nodes (12): Active, Business Context, Constraints, Context, Core Value, DXB Global OS, Evolution, Key Decisions (+4 more)

### Community 17 - "Project State"
Cohesion: 0.18
Nodes (10): Accumulated Context, Blockers/Concerns, Current Position, Decisions, Deferred Items, Pending Todos, Performance Metrics, Project Reference (+2 more)

### Community 18 - "260706-h26-PLAN.md"
Cohesion: 0.20
Nodes (9): - "DXB GLOBAL OS/" folder is UNTRACKED in git (git status shows "?? DXB GLOBAL OS/") → plain `mv` is a clean move, no `git mv` / no cached removal needed., - "DXB GLOBAL OS/.obsidian/" holds 5 files: app.json, appearance.json, core-plugins.json, graph.json (shareable) + workspace.json (personal). Plus disposable Welcome.md (203 bytes) in the folder., Facts already verified during planning (do not re-investigate):, - .gitignore currently ends at line 22 (`!.env.example`) with the SEC-02 vault deny block above it — APPEND ONLY below it., - No .obsidian/ exists at repo root yet → `mv` will not nest., - .planning/graphs/ does not exist yet., STRIDE Threat Register, - The 26 files under .planning/research/.cache/ are UNTRACKED → gitignoring removes them from status with no `git rm --cached`. (+1 more)

### Community 19 - "Phase 01 Plan 01: Automated Secret Scan (SEC-03 build half) Summary"
Cohesion: 0.22
Nodes (8): Deviations from Plan, Known Stubs, Next, Phase 01 Plan 01: Automated Secret Scan (SEC-03 build half) Summary, Self-Check: PASSED, Task commits, Threat Register Outcomes, What was built

### Community 20 - "Phase 01 Plan 02: Secrets Vault Pattern (SEC-02) Summary"
Cohesion: 0.22
Nodes (8): Deviations from Plan, Known Stubs, Next, Phase 01 Plan 02: Secrets Vault Pattern (SEC-02) Summary, Self-Check: PASSED, Task commits, Threat Register Outcomes, What was built

### Community 21 - "Common Pitfalls"
Cohesion: 0.22
Nodes (9): Common Pitfalls, Pitfall 1: Probing before revocation actually takes effect, Pitfall 2: Probing an endpoint that doesn't require auth, Pitfall 3: Rotation without session/app-password kill, Pitfall 4: The old value leaks *during* verification, Pitfall 5: Google ordering surprise, Pitfall 6: Sanitized copy committed as .odt, Pitfall 7: Hook exists but nothing proves it fires (+1 more)

### Community 22 - "ODT Sanitization Procedure (CEO-executed)"
Cohesion: 0.22
Nodes (8): Handoff, ODT Sanitization Procedure (CEO-executed), Step 1 — Copy the original (never edit in place), Step 2 — Open the copy in LibreOffice and strip the credentials, Step 3 — Save As a NEW file (rewrites the whole container), Step 4 — Export to Markdown (never .odt), Step 5 — Verification (the builder runs this in plan 01-05), Step 6 — Guided cloud-sync and backup sweep

### Community 23 - "manifest.json"
Cohesion: 0.29
Nodes (6): author, authorUrl, fundingUrl, minAppVersion, name, version

### Community 24 - "Phase 1 — Validation Strategy"
Cohesion: 0.29
Nodes (6): Per-Task Verification Map, Phase 1 — Validation Strategy, Sampling Rate, Test Infrastructure, Validation Notes, Wave 0 Requirements

### Community 25 - "Secret Scanning: decision + wiring"
Cohesion: 0.33
Nodes (6): CI (optional per CONTEXT; recommended), Full-history scan (run once now, then in CI), Hook self-test (SEC-03 verification, no realistic fake secrets committed), Local pre-commit hook (mandatory — zero-dependency variant), Post-rotation verified sweep (the elegant second proof), Secret Scanning: decision + wiring

### Community 26 - "Hook Self-Test Evidence — SEC-03 (pre-commit secret scan fires and blocks)"
Cohesion: 0.33
Nodes (5): Cleanup confirmation, Fail-closed property, Hook Self-Test Evidence — SEC-03 (pre-commit secret scan fires and blocks), Redacted output line proving the block, Self-test protocol and results

### Community 27 - "Validation Architecture"
Cohesion: 0.40
Nodes (5): Phase Requirements → Test Map, Sampling Rate, Test Framework, Validation Architecture, Wave 0 Gaps

### Community 28 - "Phase 1 Rotation Evidence"
Cohesion: 0.40
Nodes (4): Attestation, Header rules — read before filling any row, Phase 1 Rotation Evidence, Rotation Evidence

### Community 29 - "01-01-PLAN.md"
Cohesion: 0.50
Nodes (3): Artifacts this phase produces, STRIDE Threat Register, Trust Boundaries

### Community 30 - "01-02-PLAN.md"
Cohesion: 0.50
Nodes (3): Artifacts this phase produces, STRIDE Threat Register, Trust Boundaries

### Community 31 - "01-03-PLAN.md"
Cohesion: 0.50
Nodes (3): Artifacts this phase produces, STRIDE Threat Register, Trust Boundaries

### Community 32 - "01-04-PLAN.md"
Cohesion: 0.50
Nodes (3): Artifacts this phase produces, STRIDE Threat Register, Trust Boundaries

### Community 33 - "01-05-PLAN.md"
Cohesion: 0.50
Nodes (3): Artifacts this phase produces, STRIDE Threat Register, Trust Boundaries

### Community 34 - "01-06-PLAN.md"
Cohesion: 0.50
Nodes (3): Artifacts this phase produces, STRIDE Threat Register, Trust Boundaries

### Community 35 - "Standard Stack"
Cohesion: 0.50
Nodes (4): Alternatives Considered, Core, Standard Stack, Supporting

### Community 36 - "User Constraints (from CONTEXT.md)"
Cohesion: 0.50
Nodes (4): Claude's Discretion, Deferred Ideas (OUT OF SCOPE), Locked Decisions, User Constraints (from CONTEXT.md)

### Community 37 - "Code Examples"
Cohesion: 0.50
Nodes (4): Code Examples, Full history scan + report (SEC-03), Repo-clean spot check for key-shaped strings (belt-and-braces), Vault presence checks (SEC-02)

### Community 38 - "Vault Pattern (SEC-02)"
Cohesion: 0.50
Nodes (4): How agents reference secrets without reading .env, Phase 1 scaffold (pre-monorepo), Phase 2 loader convention (pnpm monorepo — decided now so the scaffold survives), Vault Pattern (SEC-02)

### Community 39 - "Sources"
Cohesion: 0.50
Nodes (4): Primary (HIGH confidence — official docs, tool-verified), Secondary (MEDIUM confidence — official pages via search, cross-checked), Sources, Tertiary (LOW confidence — flagged inline)

### Community 40 - "A8 Deny-Rule Functional Spot-Check (SEC-02, plan 01-02 Task 2)"
Cohesion: 0.50
Nodes (3): A8 Deny-Rule Functional Spot-Check (SEC-02, plan 01-02 Task 2), Outcome, Probe description

### Community 41 - "Security Domain"
Cohesion: 0.67
Nodes (3): Applicable ASVS Categories, Known Threat Patterns for this phase, Security Domain

## Knowledge Gaps
- **374 isolated node(s):** `name`, `version`, `minAppVersion`, `author`, `authorUrl` (+369 more)
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Phase 1: Security Baseline & Credential Remediation - Research` connect `Phase 1: Security Baseline & Credential Remediation - Research` to `Standard Stack`, `User Constraints (from CONTEXT.md)`, `Code Examples`, `Vault Pattern (SEC-02)`, `Sources`, `Security Domain`, `Per-Service Recipes (rotate → prove dead → record)`, `Common Pitfalls`, `Secret Scanning: decision + wiring`, `Validation Architecture`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `Per-Service Recipes (rotate → prove dead → record)` connect `Per-Service Recipes (rotate → prove dead → record)` to `Phase 1: Security Baseline & Credential Remediation - Research`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `Common Pitfalls` connect `Common Pitfalls` to `Phase 1: Security Baseline & Credential Remediation - Research`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `name`, `version`, `minAppVersion` to the rest of the system?**
  _374 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Architecture Research` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._
- **Should `CLAUDE.md` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Implications for Roadmap` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._