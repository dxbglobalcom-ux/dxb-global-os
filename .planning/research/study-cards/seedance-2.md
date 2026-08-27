# Study Card: Seedance 2.0

> ⚠ **VERSION DRIFT — MEASURED 2026-08-27, AND THIS CARD IS THE EXHIBIT.** The CEO corrected it
> himself (*"şuan seedance 2.5 var"*) and a live check confirmed him: **Seedance 2.5 launched
> 2026-07-31** — 30 seconds in one pass, native 4K, audio in the same latent space, up to 50
> reference inputs — while this card, the arsenal doctrine's paid bench and
> `INTEGRATION-TRACKER.md` all still said 2.0. **27 days stale, and nothing in this holding was
> watching.** That gap is board row **B42**. The body below is left as it was written for 2.0;
> it is re-studied when the bench row is next proposed, not patched by hand here.
> Sources: seed.bytedance.com · technode.com (2026-07-31).

> FILLED 2026-07-17 (R4.1 Library research pass — D8 masaüstü item 15).

- **Tool:** Seedance 2.0 — ByteDance video-generation model (text/image/video/audio-mixed input → audio-synced multi-shot video)
- **Slug:** seedance-2
- **Category:** Media/content (video generation)
- **Status:** STUDY
- **Target Phase:** 10+ — **budget-gated (D1): paid API only, waits for post-profit funding + CEO approval** (same gate class as Gemini Omni video)
- **Owner (dept/tier):** Creative dept — gated tool
- **Trigger Type:** ref (until funded; then mcp-profile/API via cost-tagged executor)
- **Source:** official public beta on BytePlus ModelArk (2026-04-14); aggregator APIs: fal.ai (official partner), Replicate, EvoLink
- **Pinned Version:** Seedance 2.0 (Fast/Standard/Pro variants); pricing measured from ~$0.045/s (EvoLink) — official BytePlus pricing to be re-measured at funding time
- **Purpose:** Cinema-grade generation lane for the video pipeline: up to 15s per generation with native multi-shot cuts, synchronized audio, physics, camera control; reference inputs up to 9 images + 3 video clips + 3 audio files → character/brand consistency (pairs with [[banana-pro-director]] sheets + [[cinema-world-builder]] direction).
- **Official Docs URL:** https://docs.byteplus.com/en/docs/ModelArk/1520757

## Key API / Usage Notes

- Access order at funding: official BytePlus ModelArk first (source pricing), fal.ai second (agent-friendly SDK); unofficial scraping clients (seedance-api GitHub clones) are EXCLUDED — ToS risk.
- Every call cost-tagged into cost_ledger (Gemini-Omni precedent); per-run seconds cap declared in the task contract.

## Known Pitfalls

1. **Paid-only** — no meaningful free tier measured; D1 hard gate. Free interim: stills via [[z-image]] locally; editing via [[openmontage-opencut]].
2. Aggregator markup vs official pricing — compare at funding time; avoid double-metering through multiple providers.
3. Content boundaries: generation prompts inherit R1.5 halal content rules; no indecent/sexualized output lanes.
4. 15s clip ceiling: long-form = multi-generation + edit assembly (OpenMontage stage), plan storyboard accordingly.

- **Install Command:** none now (gated). At funding: BytePlus ModelArk account + API key via vault → cost-tagged executor tool.
- **Legitimacy Verdict:** OK as gated tool — official ByteDance product with public API; excluded unofficial clients noted.

## Lifecycle Checklist
- [x] STUDY (2026-07-17 — R4.1 pass)
- [ ] INSTALL (blocked by D1 funding gate + CEO approval)
- [ ] ADOPT
- [ ] EMBED
