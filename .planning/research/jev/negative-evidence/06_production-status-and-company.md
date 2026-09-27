---
title: Production status, uptime, and company reliability
classification: mixed — status page is INDEPENDENTLY OBSERVABLE (self-reported by TypeSafe but a live, checkable page) / funding figures are press-reported (INDEPENDENTLY VERIFIED via Forbes/Seedtable, cross-checking a VENDOR CLAIM) / team size and customer count UNKNOWN
---

# Production status and company reliability

## Company facts (cross-checked across Forbes, Seedtable, WOWTALE, StackFutures — press reporting, not TypeSafe's own site, so classify as INDEPENDENTLY VERIFIED for the funding number specifically)
- Founded 2024.
- CEO: Diogo Almeida — previously at OpenAI, worked on RLHF / InstructGPT / ChatGPT / GPT-4.
- Co-founders: Erik Gafni, Sasha Sheng.
- Funding: $40M seed round, announced alongside the 2026-09-15 stealth exit / product launch. Lead investor: DCVC. Reported valuation: $200M.
- Product age at time of this research (2026-09-23): **8–9 days old.** This is a brand-new product from a ~2-year-old company.

## Uptime (status.typesafe.ai, Better Stack-backed status page — self-reported but independently checkable/live)
- api.typesafe.ai: 99.839% uptime (window as reported on the page at research time).
- Developer console: 99.988% uptime.
- Multiple short outages in the reporting window; longest was a 59-minute outage on 2026-08-03 (predates public launch — likely a pre-launch/internal-testing-phase incident).
- A 2-minute API outage plus a FULL developer-console outage occurred 2026-09-20 through 2026-09-21 (resolved 2026-09-21 08:16 UTC) — i.e., within the first week of public availability.
- **No public postmortem was found for any of these incidents.** Given the product's age, this is unsurprising rather than damning, but it means DXB has zero incident-response-quality signal to go on yet.

## What is UNKNOWN — do not guess, do not treat silence as a negative or positive signal
- Exact team/employee headcount. TypeSafe has a public team page but no numeric headcount was found in the research.
- Active user or paying-customer count. No figure found anywhere, official or independent.
- Any written SLA or uptime guarantee. Only the OBSERVED uptime number exists; no contractual commitment text was found.
- Named production customers with a real, independently-confirmed case study. The one customer reference found (Metaview, via Flavio Copes's piece) is VENDOR-SOURCED — a self-report relayed through vendor-adjacent content, not independently confirmed by the customer directly or by a third party.
- JEV's internal architecture, model size, and training method. No independent technical paper or reverse-engineering effort was found that established these facts; multiple secondary sources (including KDnuggets) explicitly note this gap.

## The vendor's own admission against interest (VENDOR SOURCE, but noteworthy — see `02_calibration-problems.md` for full context)
CEO Diogo Almeida, publicly quoted:
> "It's also possible to be confidently wrong (and all future models will be smarter still and still have that possibility)."
> "We can't prove it isn't subsidized; we'll need the long-term to prove the sustainability of our pricing."

## Relevance note for DXB
This project's own boundary rules already require measured evidence over vendor claims for anything CEO-facing (`.claude/CLAUDE.md` §2, "Measure, never guess"). TypeSafe/JEV is, as of this research, an ~8-day-old public product from an unproven company with no public SLA, no confirmed independent production customer, and no incident postmortem history. That is a fact about MATURITY, not a verdict on the technology's quality — Opus 5.5 should weigh it as one input among the benchmark/calibration evidence, not as a standalone disqualifier or endorsement.
