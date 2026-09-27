# TypeSafe AI — Official Docs: Core Concepts (docs.typesafe.ai)

Source type: **OFFICIAL** (Tier 1). Fetched 2026-09-23 via Jina reader from `docs.typesafe.ai`.
Full doc index available at https://docs.typesafe.ai/llms.txt (not fetched in this pass — see 00_INDEX open items).

---

## Introduction (docs.typesafe.ai/)

> Jev is TypeSafe's flagship model and the first System One model. Send state and typed questions; get structured answers your code can use directly.

- LLMs produce text for humans; Jev evaluates typed **questions** against a **state** and returns structured results directly — no text generation, no parsing.
- Choice and Score answers include **confidence**; Noul does not.
- Three primitives, mixed in one call, each evaluated in parallel and in isolation against the same state — "adding more questions does not create context-rot" (VENDOR CLAIM).
- Design guidance: ask **atomic** questions (one gut-check judgment each). If a judgment needs multi-factor reasoning, decompose into separate questions and combine with your own code logic (e.g. score market size / feasibility / differentiation separately rather than "rate this pitch").

Docs nav tree (from quickstart sidebar):
- Get started: Introduction, Quick start, Jev with coding agents, Example use cases
- Concepts: System One, State, Primitives (Choice/Score/Noul/Advanced structure), Confidence, How to build with TypeSafe, AI primer
- Patterns: Speculative fan-out, Confidence-gated routing, Composite scoring, Intent routing
- Reference: Models, API, SDK (top nav: Documentation / Cookbooks / Reference)

## System One (docs.typesafe.ai/concepts/system-one)

- "System One models make fast, structured decisions for software." Understands natural-language input like an LLM, but returns typed decisions + probabilities, not generated text.
- Calibration is measured **across groups of predictions**; it does not guarantee an individual answer is correct (official, explicit caveat).
- Does not write replies, produce code, or explain its reasoning.
- Call via client SDKs or `POST /v1/systemone` (HTTP API) — **note:** this is the real official endpoint path, distinct from the unofficial `jevtypesafeai.com/api/v1/decide` wrapper documented separately under `community/unofficial-services/`.
- `model` field selects the model; `jev-latest` is the SDK default.

## AI Primer (docs.typesafe.ai/introduction/machine-learning-primer)

- Positioning: "Machine Native Intelligence" — AI with software-like properties (structure, reliability, observability, testability, speed, consistency, low cost). Expectation stated: "~99% machine-to-machine interactions and 1% human interaction" for large-scale AI automation (VENDOR CLAIM / thesis statement, not a measured figure).
- Three post-training approaches contrasted:
  - **RLHF** (Reinforcement Learning from Human Feedback) — trains chatbots to produce human-preferred responses. Risks: sycophancy, confident-sounding hallucination, **mode dropping** (a milder version of GAN-style **mode collapse**).
  - **RLVR** (Reinforcement Learning with Verifiable Rewards) — strong at math/verifiable tasks, slower/more expensive.
  - **RLCD** (Reinforcement Learning for Calibrated Decisions) — TypeSafe's own method. Model returns decisions + calibrated probabilities, not text. Calibration target: predictions assigned probability `p` should be correct with frequency `p` across many predictions (0.2 → ~20% correct, 0.8 → ~80%, 1.0 → 100%).
  - **Confirmed by official source:** RLHF was co-invented by **Diogo Almeida**, cofounder of TypeSafe (linked Google Scholar profile: `scholar.google.com/citations?user=0T4y07QAAAAJ`). This resolves the "Diogo vs Diego Almeida" name-spelling conflict seen in secondary sources — official spelling is **Diogo Almeida**. See `04_CONFLICTS.md`.
  - Link to `typesafe.ai/manifesto` (not yet fetched — open item).

## Confidence (docs.typesafe.ai/confidence)

- `confidence` is a derived statistic (0–1) computed from the `probabilities` distribution TypeSafe already returns on Choice/Score answers. Noul answers carry no separate confidence (the `noul` probability itself is the signal).
- Flatter distribution → lower confidence. For Choice: no clear winner among options. For Score: ambiguous/multi-dimensional state, or insufficient information in state.
- Recommended 3-tier usage pattern: **High confidence** → act automatically. **Medium** → proceed with caution (confirm/flag/gather more info). **Low** → do not act, escalate to human or fallback.
- Explicit guidance: thresholds should **scale with risk** — a destructive action needs a higher confidence floor than a read-only one; encode risk tolerance in application code, not in the model call.

## Primitives (docs.typesafe.ai/primitives)

| Type | Question | Returns |
|---|---|---|
| Choice | Which of these options? | `choice`, `probabilities`, `confidence` |
| Score | Which level? | `score`, `legend`, `probabilities`, `confidence` |
| Noul | Is this true? | `noul` (0–1) |

- Every question has an ID (arbitrary key), a `type`, `instructions` (the judgment prompt — can be a string, object, or array to reference specific state paths via dot-and-index notation), and (for Choice/Score, optionally Noul) `criteria`.
- Choice: unordered option set (routing, classification, language detection). Add an `other`/`none of the above` catch-all when the list may not be exhaustive.
- Score: ordered spectrum with described levels (severity, frustration, skill).
- Noul: clean yes/no where the probability itself is the useful signal (PII detection, refund request detection).
- **Every answer is constrained to the supplied options** — never a value outside them, no free-text recovery needed.
- **Every answer is independent** — one question's answer is not hidden context for another; questions can be added/removed without affecting others' results (VENDOR CLAIM — no cross-question interaction/leakage).
- Questions can be chained: one question's answer can feed the `state` of a follow-up request.

## Quick Start (docs.typesafe.ai/introduction/quickstart)

- Playground at `console.typesafe.ai/playground` — paste state text, add typed questions, see results live.
- Full documentation index machine-readable at `docs.typesafe.ai/llms.txt`.
- Top-level docs sections confirmed: Documentation / Cookbooks / Reference; separate `console.typesafe.ai` for the interactive product (playground, account, API keys).

## Patterns (docs.typesafe.ai/patterns)

Four named architectural patterns (only summary table fetched; individual pattern pages NOT yet fetched — open item, see `05_OPEN_QUESTIONS.md`):

| Pattern | What it does | Benefits (as stated) |
|---|---|---|
| Speculative Fan-Out | Send many questions in one call, including speculative ones; code picks what's relevant | Cost, Speed |
| Confidence-Gated Routing | Use confidence as a second decision axis for safer systems | Reliability, Safety |
| Composite Scoring | Combine several analysis dimensions into one score | Cost, Reliability, Speed |
| Intent Routing | Classify user intent, route to the right handler | Cost, Speed |

These four pattern names map closely to DXB's own candidate use cases (agent routing, tool permission gating, confidence-gated human escalation) — see `06_DXB_RELEVANCE_MAP.md`.
