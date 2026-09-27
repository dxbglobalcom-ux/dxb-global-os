---
title: TypeSafe AI — company profile
classification: INDEPENDENTLY VERIFIED (press-reported funding figures, cross-checked across multiple outlets) + VENDOR-adjacent (team/site facts)
sources:
  - https://www.forbes.com/sites/the-prompt/2026/09/15/this-200-million-startup-wants-to-fix-ais-overconfidence-problem/
  - https://seedtable.com/companies/typesafe-ai/funding-rounds/seed-2026-09
  - docs.typesafe.ai, console.typesafe.ai (real official channels — see correction note below; jevtypesafeai.com is NOT official, initially mis-filed as such in this file's first draft)
date_compiled: 2026-09-23
---

# TypeSafe AI — company profile

- **Product**: Jev — a "System One" typed decision model. Three primitives: `Choice` (select from labelled options, returns choice + per-option probabilities + confidence), `Score` (position on an ordered scale, returns score + per-level probabilities + confidence), `Noul` (probability that a yes/no condition holds, 0–1).
- **Model access**: official channels are `console.typesafe.ai` (playground/API keys) and `docs.typesafe.ai` (real endpoint: `POST /v1/systemone`), plus `typesafe/jev-1.13` (alias `~typesafe/jev-latest`) on OpenRouter. **Correction (2026-09-23, cross-checked directly against the site's own footer):** `jevtypesafeai.com` is an **unaffiliated third-party reseller**, not an official TypeSafe channel — its own docs state "Independent service. JevTypeSafeAI.com is not affiliated with or endorsed by TypeSafe AI." It mirrors the API shape but charges ~10x TypeSafe's own list price ($0.42/1M vs $0.042/1M input tokens). Full detail: `../community/unofficial-services/jevtypesafeai-com.md`. This correction does not change any other fact in this profile (funding, founders, etc. are independent of this specific site).
- **Context window**: 32,000 tokens (`state` + longest question combined); 64,000 token total request ceiling.
- **Pricing model**: input-token-only billing; output tokens free (there is no free-text output to bill for — output is a typed structure).
- **Founded**: 2024.
- **CEO**: Diogo Almeida — prior OpenAI, worked on RLHF / InstructGPT / ChatGPT / GPT-4.
- **Co-founders**: Erik Gafni, Sasha Sheng.
- **Funding**: $40M seed round, lead investor DCVC, reported $200M valuation. Announced alongside the product's stealth exit, 2026-09-15.
- **Product launch date**: 2026-09-15 through 2026-09-18 (stealth exit + public API availability over a few days). Age at time of this research corpus (2026-09-23): under two weeks.
- **Access model**: early access at launch (some reports mention a prior waitlist), publicly billable via OpenRouter as of this research.

## What's UNKNOWN (do not guess — see `../negative-evidence/06_production-status-and-company.md` for the full list)
Team headcount, active user/customer count, any written SLA, verified named production customers, internal model architecture/size/training method.

## Vendor's own admitted limitations
See `../negative-evidence/02_calibration-problems.md` and `06_production-status-and-company.md` for the CEO's own public statements acknowledging JEV can be "confidently wrong" and that pricing sustainability is unproven.
