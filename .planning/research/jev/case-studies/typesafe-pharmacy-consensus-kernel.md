---
title: "A pharmacy safety system built on Jev — formally-specified quorum consensus with measured noise floor"
author: Don Johnson (YouTube, channel appears to be a personal/independent technical account — affiliation not otherwise identified)
date: 2026-09-19
url: https://www.youtube.com/watch?v=C_l8FI1oddE
video_views_at_research_time: 14 (obscure — found by depth, not popularity, per görev1.md §3 instruction to not select by view count)
classification: INDEPENDENTLY VERIFIED — a named third party's own system, own measurements, own adversarial testing
authority_score: high technical rigor despite low reach — formal methods (TLA+), disclosed statistics, honest uncertainty framing
technical_depth: very high
relevance_to_dxb: CRITICAL — this is the single closest analog in the entire corpus to how DXB would need to use JEV safely for any high-stakes, CEO-adjacent, or irreversible decision. Read this before designing any DXB confidence-gate.
---

# A production-shaped pattern: JEV + formal spec + quorum voting + honest uncertainty

## What was built
A pharmacy safety system with one governing rule: **it is allowed to say "I don't know." It is not allowed to be sure and wrong.** Built entirely on top of JEV's `noul` primitive (a probability, not a paragraph).

## Architecture (in the author's own words, condensed)
1. A **TLA+ formal specification** was model-checked until the quorum bound (how many agreeing votes are needed) fell out of the math, not a textbook rule of thumb.
2. An async API contract was derived from that spec.
3. Rust code was generated from the contract, with JEV sitting behind a single trait as "the oracle."
4. A record goes in. **Five paraphrased questions fan out to Jev** (same underlying question, five different wordings) — because, in the author's own words, *"five agents on one prompt turned out to be one agent sampled five times."* This is a direct, independently-discovered engineering response to the exact non-determinism problem documented elsewhere in this corpus (Saik0s's repeat-variation finding of ~0.02–0.042 jitter on identical requests).
5. **Three of five votes must land on the same answer stably before the round decides** — a quorum, not a single call.

## The measured noise floor — directly corroborates Saik0s's independent finding
> "Send Jev the identical request over and over and the answer jitters by about 0.042. That's the noise floor from 1,400 repeated calls. Any vote whose margin sits inside that band is noise wearing a verdict. The gate throws it out."

This 0.042 noise-floor figure, independently derived from 1,400 repeated identical calls, is a second independent confirmation (alongside Saik0s's GitHub probe, `../benchmarks/00_fleet-measure-summary.md`) that JEV's output is not fully deterministic even on byte-identical input — and shows a concrete, disciplined engineering response: measure the noise, then refuse to trust any vote margin that falls inside it.

## Adversarial and chaos testing
Adversarial text spliced into patient records, agents crashed mid-round, calls rate-limited, records cut off mid-sentence — all driven by a fixed random seed so any failure replays exactly.

**First version failure (self-reported, honest):** a transport error killed an entire voting round under chaos conditions, voiding 71% of rounds and pushing every one of them to a human pharmacist for no clinical reason. **This is exactly the kind of failure a naive single-call JEV gate would produce** — a transient infrastructure error masquerading as a decision failure. The fix: "a lost agent is just a lost agent" — the quorum design now lets survivors decide or escalate on their own terms rather than aborting the whole round.

## Real example of the system correctly escalating (not just correctly deciding)
Documented penicillin anaphylaxis history; a new order for amoxicillin arrives under chaos conditions. Two of five voting agents got rate-limited. The third came back at 0.54 confidence — right on the measured noise floor. **Quorum not met. The system sent it to a human.** The author's framing: *"It declined a trivial question. And that's the design working."*

## Results — reported with unusual statistical honesty
1,080 "golden" test rounds across 3 chaos levels, 40 seeds each. **Zero wrong verdicts.**
> "I want to be careful with that. Zero observed doesn't mean zero. It means the true rate is below about a quarter of a percent at 95% confidence. That's the claim. And we're not going to round it up to safe."

This is the single most methodologically careful confidence-interval statement about JEV found anywhere in this research corpus — most other sources (vendor and independent alike) report point accuracy figures without confidence bounds.

## Self-critical follow-up: the system's ambiguity-detection tier caught the AUTHOR, not just the model
An "ambiguous tier" was built to catch cases where the consensus kernel decides when it shouldn't have. Example: a late period, no test, an isotretinoin (acne medication with severe pregnancy-related risk) order. The system labeled it "escalate." Jev itself said "pregnancy is not ruled out" 115 times out of 120 repeated queries — and was right to hedge. A second, separate case (amoxicillin ordered, details unknown) saw Jev hedge 86 times and decide 34 times out of some number of trials — the author flags this as a genuinely ambiguous case, not a system defect.

## Closing thesis (author's own words — the single best summary of JEV's real value proposition found in this entire corpus)
> "None of this works on prose. It works because Jev hands you a probability, something you can measure, gate on, replay, and write a spec against."

## Relevance note for DXB (evidence → opportunity only, no architectural conclusion — per görev1.md §14, Opus decides)
This case study is direct evidence that JEV's `noul`/probability output CAN be made safe for a high-stakes decision — but only through substantial additional engineering: multi-agent quorum voting (not a single call), a measured and empirically-derived noise-floor threshold (not a guessed one), formal specification of the escalation logic, chaos/adversarial testing before trust, and honest confidence-interval reporting rather than point accuracy claims. This is the opposite of a "just call the API and branch on `confidence`" pattern — it is closer in spirit to DXB's own existing rules on measured evidence and CEO-escalation gates (`.claude/CLAUDE.md` §2) than to any of the simpler tutorial-style JEV integrations found elsewhere in this corpus.
