# ⚠ jevtypesafeai.com — NOT the official TypeSafe AI product

**This is the single most important identity-verification finding in this corpus.** Read before using any material that references `jevtypesafeai.com` or its `/api/v1/decide` endpoint.

## The finding

`jevtypesafeai.com` is a **third-party wrapper service**, not TypeSafe AI itself. The site's own docs footer states, verbatim:

> "Independent service. JevTypeSafeAI.com is not affiliated with or endorsed by TypeSafe AI."

- **Real official site:** `typesafe.ai` (marketing) + `docs.typesafe.ai` (docs) + `console.typesafe.ai` (product/playground/API keys) + `evals.typesafe.ai` (benchmarks).
- **Real official endpoint:** `POST /v1/systemone` (per `docs.typesafe.ai/concepts/system-one`).
- **jevtypesafeai.com's own endpoint:** `POST https://jevtypesafeai.com/api/v1/decide` — a **different, independently-operated** API surface that resells/wraps access to Jev, billed separately (`$0.42/1M input tokens` on jevtypesafeai.com vs. TypeSafe's own stated `$0.042/1M` — **a full order of magnitude higher**, see `04_CONFLICTS.md` and `03_CLAIMS_LEDGER.md`).

## Why this matters for DXB

1. **Pricing claims must be attributed to the right source.** The $0.42/MTok figure from jevtypesafeai.com is NOT TypeSafe's price — it is a reseller markup. Any DXB cost model must use the official `$0.042/1M input, free output` figure from `typesafe.ai` / `docs.typesafe.ai`, not this site.
2. **This is exactly the "isim benzerliği" (name-confusion) trap** the research directive (`görev1.md`) explicitly warned against — a domain containing both "jev" and "typesafeai" strongly implies official status but is not. This corpus initially (in the researching Claude's own first pass) mis-filed this site's `/docs` content as Tier-1 official material before catching the footer disclaimer. **Retained here deliberately as documented Tier-2/3 material (an independent developer's product built on top of Jev), not deleted, per the corpus rule that conflicting/confusing sources are preserved, not erased.**
3. If DXB ever integrates with "Jev," the integration target must be verified as `console.typesafe.ai` / `docs.typesafe.ai`, never a lookalike domain, before any API key or payment is set up.

## What jevtypesafeai.com actually offers (for completeness — Tier 3, independent/community)

- A general Decision API (`/v1/decide`) mirroring TypeSafe's request/response shape (`state` + typed `questions` → `answers`).
- "Ready-made" endpoint shortcuts for common jobs: email triage, support triage, agent risk-check, coding-agent context filter, LLM model routing, RAG relevance scoring, sales lead qualification, content moderation, content classification, ad analysis, SEO page-relevance.
- These ready-made endpoint *categories* are a useful **idea list** for DXB's own candidate Jev/System-One use cases (see `06_DXB_RELEVANCE_MAP.md`), even though the service itself is an unofficial middleman DXB should not use directly.

## Full captured content

Raw fetched content (full API reference, all ready-made endpoint examples) preserved at `community/unofficial-services/jevtypesafeai-com-full-docs.md` for reference.
