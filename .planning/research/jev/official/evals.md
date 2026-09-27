# evals.typesafe.ai — Official Workflow Evals Site

- **URL:** https://evals.typesafe.ai/
- **Source type:** OFFICIAL (Tier 1) — self-published benchmark methodology and results
- **Fetched:** 2026-09-23

## What it is

A self-hosted, self-run benchmark site publishing TypeSafe's own "workflow eval" methodology — the source of the "193.6x faster, 444.6x cheaper" homepage headline claim (see `official/blog/introducing-system-one-models-and-jev.md`).

## Methodology (as stated by TypeSafe)

- Thesis: "Structure is always better" than a standalone prompt for real-world automation tasks.
- Method: decompose a task into a programmatic harness of **Noul** (yes/no), **Choice** (pick one), and **Score** (rate on scale) questions, combined with deterministic code rules — rather than asking one model to solve the whole task in a single prompt.
- **Reference/"ground truth" labels**: the average of GPT-6 Astra and Claude Fable 5.1, both run at high thinking, answering every question in the harness. All other models (including Jev) are evaluated at each provider's **default** reasoning setting — i.e. the reference labels themselves come from higher-effort settings than most compared models use. This is a methodological asymmetry worth flagging for DXB (see `06_DXB_RELEVANCE_MAP.md` open questions).
- Explicit design choice: "we assume the code [harness] is correct" rather than debating harness/label correctness — i.e. this is a **relative-agreement-with-reference-models** benchmark, not an absolute-ground-truth benchmark against independently verified outcomes.
- Plotted axes: accuracy vs. cost, accuracy vs. time (mean across four workflows, equal weight per workflow).

## The four published example workflows

1. **Security Incidents** — given an alert + everything on file about the machine, decide: close / pass to analyst / contain now.
2. **Agent Trace Observability** — given a full support-agent run (all tool calls), decide whether a human needs to review it and how soon.
3. **Invoice Processing** — given a vendor bill + the order + what was delivered, decide: pay / hold / send back.
4. **Customer Service** — given a conversation thread + account state, decide what the assistant should say/do next.

These four categories map directly onto candidate DXB decision points (see `06_DXB_RELEVANCE_MAP.md`): Agent Trace Observability ≈ DXB's audit/verification needs; Invoice Processing ≈ finance approval gate; Customer Service ≈ any future customer-facing triage; Security Incidents ≈ DXB's own security-review gate.

## Caveats (from this page and cross-referenced)

- No independently reproducible dataset or held-out test set is published alongside the site — the four example workflows are described narratively (with one toy example — "Expense claims" — shown in illustrated policy-to-questions form) but raw per-item results/labels were not captured in this fetch pass. **OPEN ITEM**: fetch the four workflow detail pages individually (`/security_incidents.html`, `/agent_trace_observability.html`, `/invoice_processing.html`, `/customer_service.html`) for per-example data.
- RepoChad podcast (Tier 2, see `experts/videos/`) independently raises the geography-bias and "handicapped LLM baseline via custom adapter" critique described in `official/blog/`.
