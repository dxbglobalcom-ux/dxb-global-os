# JEV — DXB Relevance Map

**Rule followed throughout this file (görev1.md §14): evidence → opportunity. Never evidence → architectural conclusion.** Every row below names a possible relationship point and the evidence for/against it; none of them is a recommendation. Opus 5.5 decides whether, where, and how (or whether not at all).

```
JEV capability                    ↕  Possible DXB subsystem              ↕  Evidence                                          ↕  Questions Opus must answer
```

---

### 1. Confidence-gated routing / escalation

- **DXB subsystem**: the approval gate (CLAUDE.md §2) — money-out, contracts, identity steps stop at the CEO; routine work does not. Also the CEO-escalation pattern generally (when should a surface interrupt him vs. proceed silently).
- **Evidence for**: `Confidence` docs describe exactly a 3-tier (act / proceed-with-caution / escalate) pattern with risk-scaled thresholds — structurally similar to DXB's own approval-gate concept. TypeSafe's own "Confidence-Gated Routing" pattern is named explicitly (`official/docs/core-concepts.md`).
- **Evidence against / caution**: Calibration quality is the single most contested finding in this entire corpus (`04_CONFLICTS.md` Conflict #2, `negative-evidence/02_calibration-problems.md` — Score-type answers reportedly 74% mean confidence at 44.7% actual accuracy in one independent test). The vendor's own jaggedness doc explicitly warns confidence thresholds are NOT transferable across question types or across separate queries (`official/docs/jev-1.13-model-jaggedness.md` item #9).
- **Questions for Opus**: Would DXB ever let a JEV `confidence` value gate an action that reaches the CEO's approval boundary, given the mixed/contested calibration evidence? If used only for pre-filtering (deciding what to SHOW the CEO, never what to DO autonomously), does the calibration risk change?

### 2. Verification triage / audit-twin support

- **DXB subsystem**: `dxb-verify` door, the "Evidence before done" boundary, refuter-agent triage in `dxb-crew`.
- **Evidence for**: Choice/Score primitives map naturally onto "is this claim CONFIRMED/PLAUSIBLE/wrong" triage (similar shape to `ReportFindings`' own verdict field). RepoChad and official docs both frame Jev as well-suited to "verify everything... score, judge, verify, guardrail" tasks.
- **Evidence against**: The vendor's own literal-reading and irrelevant-context failure modes (`jaggedness` items #1, #6) are exactly the failure shapes that matter most for auditing subtle code/claim correctness — a verifier that reads too literally or gets distracted by irrelevant state is a weak verifier. No evidence in this corpus tests JEV specifically on code-correctness or claim-verification tasks resembling DXB's own refuter role.
- **Questions for Opus**: Is a fast/cheap pre-filter before a full refuter pass (not a replacement for one) worth the integration cost? Would it ever be trusted to say "PASS" without a human/Opus-level check, given "one session one author" and "audit twin" laws already require a separate, careful audit step?

### 3. Model / agent routing (which model handles this turn)

- **DXB subsystem**: none currently formalized in DXB, but structurally analogous to Fable/Opus role routing (görev1.md's own author line: "Sonnet 5 High") and any future per-task model selection.
- **Evidence for**: TypeSafe's own `/v1/model/route` example endpoint (`community/unofficial-services/jevtypesafeai-com.md`) and the independent `0xNatoshi/jev-codex-router` GitHub project (`community/github/ecosystem-overview.md`) do exactly this — pick model/reasoning-depth per turn for Codex.
- **Evidence against**: DXB's model-routing decisions are currently governed by an explicit, CEO-authored hierarchy (Fable=engineer, Opus=writer, per `~/.claude/CLAUDE.md`), not by a learned/opaque classifier — introducing a probabilistic router adds a new, hard-to-audit decision point into a system where CEO's own directive already forbids silent rule-changes ("NOTHING BECOMES A LAW UNLESS HE SAYS 'MAKE IT A LAW'").
- **Questions for Opus**: Does DXB's routing problem (Fable vs Opus vs Sonnet) actually need a probabilistic classifier, or is it already fully specified by explicit rules where JEV would add cost/opacity without benefit?

### 4. Context filtering / agent context-bloat control

- **DXB subsystem**: any long-running crew/session's context management (the "40% context gate" pattern referenced in STATE.md's session history), memory write/retrieval gating (claude-mem observations).
- **Evidence for**: TypeSafe's own `/v1/context/filter` example (keep/truncate/drop an old context item) is a close structural match to a "memory write gate" or "memory eviction" concern explicitly named in görev1.md §6's use-case list.
- **Evidence against**: `jaggedness` item #6 (irrelevant context as distractor) and item #1 (literal reading) suggest JEV itself is sensitive to the exact problem it would be asked to solve here — using a context-sensitive model to judge context relevance may compound rather than fix the issue. No evidence in this corpus tests this specific use case directly.
- **Questions for Opus**: Is this a good fit, or does it need a non-JEV (rule-based or embedding-based) solution instead?

### 5. Browser/computer-use agent speed-up

- **DXB subsystem**: the `operator` skill, `mcp__claude-in-chrome__*` / Playwright browser automation.
- **Evidence for**: Multiple independent sources address this directly — Alex Hitt's video (`videos/video-index-and-section-notes.md` V8) on browser-agent architecture, `jkudish/jev-browser` and `moritzkremb/jev-voice-browser` GitHub projects (`community/github/ecosystem-overview.md`), and the official launch blog's "browser-use flight booking in 7 seconds" community demo (via the Syntax video, V1).
- **Evidence against**: Vendor's own docs state images/video are not yet supported (per negative-evidence cross-reference in `03_CLAIMS_LEDGER.md` #14) — meaning any browser-use integration must work from structured DOM/accessibility-tree state, not screenshots, which is a real architectural constraint given `operator`'s current screenshot-based verification pattern ("Always take `operator shot` and LOOK at it").
- **Questions for Opus**: Does DXB's browser automation currently rely on visual verification in a way that's incompatible with a text/state-only judgment model, or could DOM-state-based fast triage sit alongside (not replace) visual verification?

### 6. Content/communication moderation and classification

- **DXB subsystem**: the Islamic-boundaries constitutional constraint (CLAUDE.md §2), bilingual-purity gate, any outward-facing communication DXB eventually automates.
- **Evidence for**: Moderation is a named official ready-made use case (`/api/v1/content/moderate`), and TypeSafe explicitly targets "fuzzy business logic... moderation, routing, risk scoring" as RLCD's design target.
- **Evidence against**: This is one of DXB's highest-stakes, CEO-owned boundary categories ("Islamic boundaries are constitutional. CEO-only. Code may refuse its own work against them; code may never widen or narrow them.") — a probabilistic, occasionally-confidently-wrong, architecturally-opaque third-party model is a poor structural fit for a constitutional boundary, regardless of its measured accuracy elsewhere.
- **Questions for Opus**: Almost certainly a hard no for the constitutional boundary itself — is there a narrower, non-constitutional communication-triage task (e.g. routine outward-communication routing, which CLAUDE.md already treats as not requiring CEO approval) where this could apply instead?

### 7. Cost/speed as a category, independent of specific use case

- **DXB subsystem**: general system economics — every DXB agent call currently costs Opus/Fable/Sonnet-tier tokens.
- **Evidence for**: Even the most conservative independent re-measurements in this corpus (not the vendor's own 193x/444x headline) found real 4–7x speed and 30–96x cost multiples for single-call classification-shaped tasks (`04_CONFLICTS.md` Conflict #1, `benchmarks/*.md`). If DXB has any high-volume, narrow, atomic classification/routing decisions today handled by a full LLM call, the economic case is real and independently corroborated, not just vendor marketing.
- **Evidence against**: The gap between "real economic case for SOME narrow tasks" and "worth the integration/vendor-dependency/audit cost for DXB specifically" is exactly what the rest of this relevance map is meant to help Opus assess task-by-task — a general cost argument does not by itself justify adoption anywhere specific.
- **Questions for Opus**: Does DXB currently have any concrete, identifiable, high-volume narrow-classification workload today (not hypothetical) where this economic case would apply? If none exists yet, is this a "watch and revisit" item rather than an active integration candidate?

---

## Cross-cutting constraints that apply to ALL seven rows above

1. **Vendor lock-in / dependency risk**: TypeSafe is a single, ~2-week-old company (`official/company-profile.md`) with a single hosted API, self-reported uptime only (`negative-evidence/06_production-status-and-company.md`), and CEO's own public admission that pricing sustainability is unproven. Multiple open-source local alternatives exist (`community/github/ecosystem-overview.md`, `community/github/third-party-implementations.md`) but none independently benchmarked against Jev at parity in this corpus (`04_CONFLICTS.md` Conflict #5).
2. **"Measure, never guess" (CLAUDE.md §2)**: nothing in this corpus is a DXB-specific measurement — every number here is either TypeSafe's own or a third party's, on third-party tasks. Any DXB decision to actually use JEV for a specific subsystem requires DXB's own measurement on DXB's own data before it could ever be called "done," per the project's own evidence-before-done law.
3. **Secrets boundary**: any integration would require an API key (`jv_live_...` pattern) — CLAUDE.md's "Secrets never enter the repo, a prompt, or any printed output" applies exactly as it does to every other external service.
4. **One-session-one-author law**: a hosted third-party model is not a "subagent" under DXB's own governance model — it would need its own clearly scoped role (advisory signal only, never a repo-writing or decision-making authority) to avoid conflicting with "Subagents audit, refute and sweep; they never write."
