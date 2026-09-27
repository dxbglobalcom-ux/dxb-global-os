---
title: Integration friction, API limitations, and vendor lock-in
classification: mixed — INDEPENDENTLY VERIFIED (GitHub issues are primary evidence of real events) / COMMUNITY OBSERVATION (risk-assessment posts)
---

# Integration friction, API limitations, vendor lock-in

## Real integration incident — silent total failure
**genfeedai/genfeed.ai#4906** — https://github.com/genfeedai/genfeed.ai/issues/4906
A third-party adapter was written while `docs.typesafe.ai` was unavailable, reconstructing the wire format from secondary sources. It got the shape wrong in multiple ways: question payload in the wrong field, `Choice` criteria in the wrong shape, `Score` ranges in the wrong shape, wrong `usage` fields.
> Result, verbatim: "every call degrades to `null`. The practical effect is that `TYPED_DECISION_PROVIDER=jev` is inert."
This is the closest thing to a "production incident" found anywhere in this research — but it is a THIRD-PARTY integration bug (self-reported, self-diagnosed, fix described in the issue), not a TypeSafe-side outage. Classify as INDEPENDENTLY VERIFIED (it's a real, disclosed, first-person account of an actual failure) but attribute the fault correctly: integrator error compounded by unavailable docs at the time, not a JEV model defect.

## Documentation / versioning gaps
- **AndyTheFactory/jev-skill#34** — CLI/skill/config docs needed updating for a second provider; flagged as a documentation-completeness gap, not a defect.
- **brightshore/jev-net PR#2** — a breaking API change required a version bump on a client library, i.e., JEV's API is not yet stable/frozen (expected for an early-access product, but relevant to any integration-cost estimate).
- Noul/Boolean answers apparently omit a `confidence` field in some cases — undocumented; discovered only by probing (per opentweet.io), not stated in official docs.

## opentweet.io/jev/limits — practical operating limits (independent technical write-up)
- **Version drift risk**: quoted verbatim — "When `jev-latest` moves to a new version, every threshold you calibrated moves with it and nothing in your logs says so." I.e., pinning to a specific version (e.g. `jev-1.13.0`) is necessary for any production threshold-based gate; using the `jev-latest` alias silently changes calibration under you.
- **Rate limits are dynamic and can change without notice**, per this source.
- **Batching matters a lot**: un-batched (one question per call) questions were measured at 12.2x higher cost and 10.0x higher latency than batched multi-question calls sharing one `state`.

## Official API hard limits (for reference, source: OpenRouter docs + opentweet.io, cross-checked)
- Context: `state` + longest question combined budget 32,000 tokens; 64,000 token total request ceiling.
- Account-level throughput: ~250,000 tokens/sec (input only), 1,200 requests/minute — reported as the PRACTICAL bottleneck at scale by at least one independent operator (opentweet.io: hit a ~1,200 posts/minute ceiling in their own use case).
- No non-text input support (no image/audio/video) despite the API technically accepting arbitrary `state` content — see `../benchmarks/2026-09-19-mikulski-jev-cannot-see.md` for the independently-confirmed image-blindness finding.
- Max 255 labelled options per `Choice` question.

## Vendor lock-in
- JEV is single-provider-hosted; going through OpenRouter routes directly and exclusively to TypeSafe — there is no multi-provider routing/fallback built into the product itself.
- **Pattern found across 3 independent local-alternative projects, all launched within JEV's first week, all citing the same three complaints:** `github.com/wfzyx/von` ("sub-15ms non-autoregressive, local drop-in alternative"), `github.com/r-ms/mini-jev`, `github.com/ikermoel/open-alternative-jev`. The `von` README states its motivation explicitly: *"Jev is Cloud Only... creates cloud provider dependency."* Its own (unverified, self-reported, VENDOR CLAIM in the sense that it's the alternative's own repo, not independently benchmarked) numbers: sub-15ms local vs ~115ms cloud latency for Jev, $0 local cost vs $0.042/M token cloud cost, and a claimed 60.1% higher win rate in a ViZDoom game-playing comparison. **Three independent projects converging on the same three complaints (latency, cloud-only cost, lock-in) in one week is a real pattern, not one anecdote** — even though none of their own performance claims about beating JEV were independently re-verified in this research.
- **open-orcha/orcha#253** (pre-adoption risk assessment, not an incident): explicitly lists "vendor lock-in, a second vendor's terms over our code, failure modes when the instructions are wrong (a cheap executor will follow a bad plan confidently), debuggability, and what happens when Jev is down" as risks to weigh BEFORE adopting. Classify as COMMUNITY OBSERVATION / prospective risk-listing, not a realized incident.
- **fujibee/agmsg PR#1364**: one team deliberately added TypeSafe as a SECOND provider alongside OpenRouter specifically as a lock-in hedge — a real, if indirect, signal that at least one adopter treated lock-in as a live-enough risk to engineer around.

## Pricing caveats (independent, not vendor-sourced)
- **ai-crescent.com**: explicitly flags TypeSafe's own pricing figures as "vendor-reported figures, not independently verified," notes this is early-access pricing, and cautions "pricing commonly changes at general availability — don't build a multi-year cost model" on today's numbers.
- Janus cascade-routing study (referenced via `awesome-typesafe-jev` index): in at least one dataset (Web of Science), a Jev→DeepSeek cascade produced the same result as Jev alone but at 3x the cost — i.e., adding a routing layer does not automatically pay for itself; it must be measured per task.

## Relevance note for DXB
If DXB ever integrates JEV programmatically: (1) pin the exact model version, never `jev-latest`, given the documented silent-threshold-drift risk; (2) batch questions sharing one `state` into a single call — un-batched use is measured 10-12x worse on cost and latency; (3) treat the single-provider dependency as a real architectural fact, not a hypothetical, consistent with this project's existing "Tools before packages" / no-vendor-lock-in caution (`.planning/research/STACK.md`).
