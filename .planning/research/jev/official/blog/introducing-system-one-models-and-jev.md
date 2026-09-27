# "Introducing System One Models & Jev" — Official Launch Blog Post

- **URL:** https://www.typesafe.ai/blog/introducing-system-one-models-and-jev
- **Author:** Diogo Almeida, founder, TypeSafe
- **Source type:** OFFICIAL (Tier 1) — the primary launch/announcement document
- **Fetched:** 2026-09-23, full content, via Jina reader
- **Authority:** Highest — this is the founder's own technical announcement, published on the company's own domain

---

## Founder narrative (self-reported, treat framing as VENDOR CLAIM even where facts are checkable)

- "At OpenAI, I helped build the methods that made language models useful at following instructions and talking with people. That work ended up as the research behind ChatGPT." — i.e. Diogo Almeida claims co-invention of RLHF / instruction-following research behind ChatGPT. **Independently corroborated** by the AI primer page linking his Google Scholar profile as RLHF co-inventor (see `official/docs/core-concepts.md`) — classify as INDEPENDENTLY VERIFIABLE (Scholar profile is checkable), not just self-report.
- "After two years in stealth" — implies TypeSafe founded roughly 2024, though no exact founding date is stated here. Cross-check against `flaviocopes.com` claim of "stealth exit 2026-09-15" in `experts/articles/` — those are different claims (stealth duration vs. public-launch date) and are NOT in conflict, but should not be merged.
- Launched: **Jev**, described as the first public "System One Model," "available today in early access."

## The core technical claims (VENDOR CLAIM unless noted)

Comparison table "Existing LLMs" vs "System One + Jev" as published:

| Dimension | Existing LLMs | System One + Jev |
|---|---|---|
| Training | RLHF / RLVR | RLCD (Reinforcement Learning for Calibrated Decisions) |
| Optimizes for | Human preference / verifiable rewards | Calibrated decisions — epistemically honest probabilities |
| Inputs | Unstructured text, sequential messages | Unstructured data, emphasis on structured program state |
| Outputs | Strings (flexible, needs parsing/validation, risk of going "off the rails") | Type-safe structured values, pre-defined shapes, no type errors, always carries calibrated probability/confidence |
| Sampling | Sequential (one token at a time) | Parallel (all outputs in one query) |
| Cost | $0.20–$10 / MTok input; output ~5x input | $0.042 / MTok input ($42/billion); output **free** ("too cheap to meter") |
| Speed | 3–329 seconds end-to-end (cited external source: llm-benchmarks.diegoromero.es) | 70ms–500ms end-to-end; claimed 40x–200x faster for "System One shaped queries" |
| Confidence | Prompted confidence tends to be overconfident/inconsistent | Always reports calibrated confidence/uncertainty |
| Use cases | Human-in-the-loop (chat/copilot/coding agents), verifiable problems (math, kernel opt), demos | AI-powered workflows / "smart if-statements" (classify/route/score/extract/branch), map-reduce over big data, real-time apps, verification/guardrails/jailbreak detection |

### "193.6x Faster, 444.6x Cheaper" headline claim

- Sourced to the company's own **Workflow evals** (see `official/evals.md`), explicitly labeled by TypeSafe itself as "on the higher end of real world gains" (self-qualified, not presented as a typical/average result).
- Side-by-side demo: cost $0.000081 / 0.114s (Jev) vs $0.013880 / 8.566s (an LLM) for one example query.
- **Vendor's own nuance/caveats (important — this is the company disclosing limits on its own numbers, i.e. more trustworthy than a bare claim):**
  - Published evals generally run "from our laptops on the West Coast" — the company's own service is West-Coast based, so this is a favorable-geography measurement, disclosed by TypeSafe itself. (Independently, RepoChad podcast raised the same geography-bias critique — see `04_CONFLICTS.md` for cross-source agreement, this is NOT a conflict, it's corroboration.)
  - Cannot prove pricing isn't subsidized; "we'll need the long-term to prove sustainability."
  - The side-by-side demo `state` is "short, dense, and detailed," which the company admits "paints our model in an advantageous light."
  - Compared against GPT-5.6 Terra "because we've found it to be the most comparable at intelligence to Jev on average" — vendor's own model choice for the comparison.
  - Workflow evals use the **average of GPT-6 Astra and Claude Fable 5.1** (both at high thinking) as the reference/"ground truth" labels, not an independently curated golden dataset. Company admits this "biases answers towards OpenAI and Anthropic's models" and likely **underestimates** DeepSeek's relative performance.
  - LLM comparisons run through TypeSafe's own `system-one-adapter-python` wrapper (GitHub: `typesafe-ai/system-one-adapter-python`) — company states this is "the most accurate way to get decisions from LLMs" but "tends to be slower and more expensive than giving decisions without probabilities" — i.e., the LLM baseline may be handicapped by the wrapper's own overhead, a methodological point echoed independently by RepoChad ("LLMs wrapped in a custom open-source probability adapter").

### Type-safety / "0% hallucination" claim

- "Schema matching is guaranteed" — company states this is **not an empirical measurement**, it is a structural/mathematical guarantee of the sampling interface ("we can confidently add 0% into the plots"). This is a claim about **output shape validity**, not about **decision correctness** — the company does not claim 0% wrong answers, only 0% malformed answers. This distinction is corroborated independently (Reddit r/aigossips thread, RepoChad podcast) — see `03_CLAIMS_LEDGER.md`.

### Fun demos (VENDOR CLAIM, illustrative not benchmark-grade)

- **Doom bot**: real-time play driven by structured text game-state (not images), ~10 queries/second, ~$7/hour cost estimate.
- **Wikiracing**: navigate Wikipedia link graphs (hundreds–thousands of link choices per step) to a target page. Choice cardinality up to 255 confirmed; above that, company describes a "2-stage system" (score independently, then explicit choice) causing occasional slowdown. Company notes speed advantage here is smaller than other demos because LLM competitors were run in non-reasoning mode (except Astra at lowest reasoning) to keep the demo watchable — an explicit disclosure that the comparison conditions favor Jev.

## Naming origin (official, resolves a claim seen in secondary sources)

- "System One" — from Daniel Kahneman, *Thinking, Fast and Slow* (System 1 = fast/intuitive vs System 2 = slow/deliberate). Company explicitly argues against the implication that "System 1 = error-prone."
- **"Jev"** — named after **William Stanley Jevons** (Jevons paradox: efficiency gains increase, not decrease, total resource demand). Official framing: cheaper intelligence unlocks more use cases, analogous to coal demand rising after steam-engine efficiency gains. (Multiple independent video sources joke that "Jev" sounds like a person's name / "engineer nickname" — that is NOT the official etymology; flag as a recurring but incorrect community assumption, not a real conflict since it's just internet humor, not a factual claim anyone treats as true.)

## What's next / open access

- Early access via waitlist at typesafe.ai; company explicitly soliciting which decisions people want automated.
- FAQ section present but several answers were **collapsed/accordion UI** and did NOT render in the static fetch (questions visible, answers not captured): "Why was a new training algorithm needed?", "What use cases is Jev good for?", "Is Jev just a smaller LLM?", "How does Jev perform against public benchmarks?", "Where does our training data come from?", "These results are kinda crazy - how is it possible?" — **OPEN ITEM**, see `05_OPEN_QUESTIONS.md`. These FAQ answers should be re-fetched with a JS-rendering fetch (not a static markdown reader) in a follow-up pass.

## Related official links surfaced in this post (fetch status)

| Link | Fetched in this corpus? |
|---|---|
| https://docs.typesafe.ai/ | Yes — `official/docs/core-concepts.md` |
| https://evals.typesafe.ai/ | Yes — `official/evals.md` |
| https://github.com/typesafe-ai/system-one-adapter-python | Metadata only — `official/github/org-repos.md` |
| https://console.typesafe.ai/playground | No (requires login) |
| https://typesafe.ai/manifesto | **No — open item** |
| https://llm-benchmarks.diegoromero.es/ (third-party LLM latency reference the company cites) | **No — open item** |
