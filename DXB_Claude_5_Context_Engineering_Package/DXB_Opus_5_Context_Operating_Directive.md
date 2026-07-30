# DXB CLAUDE 5 CONTEXT OPERATING DIRECTIVE

**Purpose:** Define how Claude Opus 5 should acquire, prioritize, and use context while working on the DXB Global Operating System.

**Scope:** This directive governs project onboarding, planning, implementation, verification, and state handoff. It is not a substitute for the active wave specification.

---

## 1. Core operating principle

Use the smallest set of high-signal context needed to complete the current phase correctly.

Do not load unrelated plans, specifications, research, or procedures merely because they exist. Load additional context progressively when the current task requires it.

Treat context as an engineered resource:

- prefer authoritative sources over duplicated summaries;
- prefer executable references over vague prose;
- prefer repository evidence over assumptions;
- prefer one clear instruction over repeated variants;
- use judgment where the surrounding code and current intent provide enough evidence.

---

## 2. Authority hierarchy

When sources conflict, use this order unless the CEO explicitly states otherwise:

1. The CEO’s current explicit instruction
2. The approved specification for the active wave
3. Approved architectural decisions and security constraints
4. `.planning/STATE.md`
5. `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`
6. `HOLDING-OS-MASTER-PLAN/00-INDEX.md`
7. The DXB Global Operating System Directive Package
8. Relevant tests, schemas, and interface contracts
9. Current repository conventions and implementation evidence
10. Older plans, research notes, historical summaries, and superseded documents

Do not silently choose between materially conflicting authoritative sources. Identify the conflict and explain its implementation impact.

Code is evidence of current behavior, but it does not automatically override an approved specification or architectural decision. Tests are executable evidence, but stale tests must be reported rather than blindly treated as product intent.

---

## 3. Mandatory onboarding sequence

Before planning or changing the system, read the following in this exact order:

1. `Bootstrap`
2. `.planning/STATE.md`
3. `HOLDING-OS-MASTER-PLAN/00-BOARD-OPEN-WORK.md`
4. `DXB Global Operating System Directive Package`
5. `HOLDING-OS-MASTER-PLAN/00-INDEX.md`
6. `.planning/research/rival-intel/00-SYNTHESIS.md`
7. The specification for the wave you are assigned
8. Only the code, tests, ADRs, schemas, and references required to understand that wave

The onboarding phase is read-only. Do not edit files or begin implementation during this phase.

Do not read the entire repository indiscriminately. Build a focused system map, then expand only where dependencies or contradictions require it.

---

## 4. Required onboarding deliverable

After completing the onboarding sequence, provide an evidence-based understanding report containing:

- the system’s relevant architecture and boundaries;
- the active project state;
- the assigned wave’s objective, scope, and explicit exclusions;
- dependencies and affected modules;
- unfinished work that intersects the wave;
- authoritative sources used;
- contradictions, stale documents, or mismatches between plans and code;
- non-obvious risks and constraints;
- genuine unknowns that could materially change the plan.

Do not pad the report with generic software-engineering advice.

Do not restate entire source documents. Distill only what affects the active wave and the next decision.

---

## 5. Approval gate

Do not implement before the CEO approves the proposed plan.

This is a DXB governance constraint and must not be inferred away, optimized away, or treated as optional.

The proposed plan must include:

- exact intended scope;
- affected systems, modules, and files;
- ordered implementation steps;
- data model and API effects;
- migration implications;
- security and tenant-isolation implications;
- validation strategy;
- rollout and rollback strategy where relevant;
- risks, assumptions, and unresolved decisions.

After approval, implement the approved scope completely. Make routine engineering judgments independently. Escalate only when a newly discovered issue would materially alter scope, architecture, security, data integrity, or the approved outcome.

---

## 6. Rules versus judgment

Do not create or follow blanket micro-rules when the correct behavior can be inferred from:

- the approved specification;
- surrounding code;
- repository conventions;
- types and schemas;
- tests;
- the user’s current intent.

Match the surrounding codebase’s naming, structure, comment density, error-handling style, and idiom unless an authoritative source requires a different approach.

Preserve explicit hard constraints for:

- authorization and permissions;
- destructive operations;
- tenant isolation;
- secrets and sensitive data;
- legal or regulatory boundaries;
- production changes;
- approval gates;
- irreversible migrations;
- source-of-truth integrity.

Use positive, outcome-oriented guidance instead of long lists of prohibitions.

---

## 7. Progressive disclosure

Keep always-loaded context short.

Load procedures through task-specific Skills when needed, such as:

- system discovery;
- wave planning;
- implementation;
- architecture review;
- verification;
- migration;
- deployment;
- rival intelligence research.

Do not place full procedures, checklists, or tutorials in the root persistent context when they apply only to some tasks.

For a long Skill:

- keep its entry instructions concise;
- split detailed references into supporting files;
- load only the relevant branch of information;
- avoid copying the same rules into multiple Skills.

---

## 8. Single source of truth

Each information category must have one primary owner.

- Current operational state: `.planning/STATE.md`
- Open work: `00-BOARD-OPEN-WORK.md`
- Master-plan navigation: `00-INDEX.md`
- Enterprise operating principles: DXB Directive Package
- Wave scope and acceptance criteria: active wave specification
- Architectural rationale: ADRs
- Procedures: the relevant Skill
- Tool usage: the tool’s own description and schema
- Runtime behavior: code and observed system evidence
- Completion evidence: tests, acceptance checks, and rubrics

Reference the authoritative source instead of copying its full contents elsewhere.

When updating one source affects another, update all required authoritative records in the same work unit so the repository does not end in a contradictory state.

---

## 9. Tool and interface design

Prefer self-describing interfaces over prompt examples.

When designing or revising tools, scripts, APIs, and agent functions:

- use explicit parameter names;
- use enums for finite states;
- distinguish required and optional inputs;
- expose scope and environment;
- expose side effects;
- support dry-run where appropriate;
- return actionable errors;
- represent approval requirements structurally;
- avoid ambiguous free-form inputs when a typed contract is possible.

Place tool-specific instructions in the tool description. Do not repeat them in the system prompt, project directive, and Skill unless a critical safety boundary requires reinforcement.

---

## 10. Memory policy

Auto-memory may support personal preferences and recurring non-authoritative context.

Auto-memory must never replace version-controlled project truth.

Do not rely on auto-memory for:

- active wave status;
- approved decisions;
- architectural constraints;
- open blockers;
- acceptance criteria;
- migration state;
- release state;
- security requirements;
- CEO approvals.

Record authoritative project state in the designated repository files.

Do not turn `CLAUDE.md` into a session diary, backlog, or historical archive.

---

## 11. Rich references

Prefer high-fidelity references when they define the required outcome more precisely than prose.

Useful references include:

- acceptance tests;
- unit and integration tests;
- schemas;
- OpenAPI contracts;
- fixtures;
- HTML prototypes;
- reference implementations;
- code from an approved related repository;
- architecture diagrams;
- migration examples;
- quality rubrics.

Use the active specification to define intent and rich references to make that intent measurable.

Do not load every reference by default. Load the references relevant to the current component and phase.

---

## 12. Implementation behavior

After approval:

1. Reconfirm the approved scope.
2. Inspect the minimum additional context required for the first implementation step.
3. Implement complete production-quality changes; do not leave stubs or placeholders unless the approved plan explicitly calls for them.
4. Keep changes within the approved boundaries.
5. Use existing abstractions where they fit; do not preserve a broken abstraction merely to minimize diff size.
6. Avoid unrelated cleanup.
7. Update tests and contracts with the implementation.
8. Report material deviations immediately.
9. Stop when the approved task is complete.

Do not silently broaden, narrow, or transform the task.

---

## 13. Verification policy

Claude Opus 5 performs routine self-correction and verification without repeated instructions. Avoid redundant “double-check everything” loops.

Use verification proportional to risk:

- targeted tests for local changes;
- integration tests for boundary changes;
- security checks for auth, permissions, secrets, and tenant isolation;
- migration validation for data changes;
- rubric-based review for architecture or design quality;
- separate verifier agents only for complex, independent, high-value work.

Do not spawn multiple agents for work that can be completed reliably in a few tool calls.

Verification must map every active acceptance criterion to evidence.

A passing test suite is necessary but may not be sufficient if the specification, security boundary, or operational behavior requires additional evidence.

---

## 14. Completion and handoff

At completion, provide:

- what changed;
- why it changed;
- files and components affected;
- acceptance criteria and corresponding evidence;
- tests and checks run;
- migration, rollout, or rollback notes;
- residual risks;
- intentionally deferred work;
- authoritative project records updated.

Update the relevant state files in the same change where appropriate:

- `.planning/STATE.md`
- Open Work Board
- active wave status
- ADRs
- handoff notes

Do not claim completion while required state records remain stale.

---

## 15. Context hygiene audit

Before adding a persistent instruction, ask:

1. Can this be inferred from the repository?
2. Is it already stated elsewhere?
3. Is it only relevant to one workflow?
4. Was it created for an older model failure that no longer occurs?
5. Is it a brittle blanket rule with valid exceptions?
6. Would a type, schema, test, rubric, or tool design encode it better?
7. Is this the correct source of truth?
8. Will it remain current?
9. Would removing it produce a measurable error?
10. Is it a critical security, permission, or governance boundary?

Keep critical boundaries. Move procedures to Skills. Replace vague prose with rich references. Delete redundant and inferable instructions.

---

## 16. Final operating standard

The DXB context stack should follow this model:

- **Minimal persistent context**
- **Explicit source authority**
- **Progressive task-specific loading**
- **High-fidelity specs and references**
- **Version-controlled project state**
- **CEO approval before implementation**
- **Risk-proportional verification**
- **No duplicated or stale instructions**

The objective is not to give Claude less understanding. The objective is to remove context friction so Claude can apply more of its capability to the actual engineering problem.
