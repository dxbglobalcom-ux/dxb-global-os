# Model and effort research for the holding's workflow: Opus 5.5, Sonnet 5.5, Haiku 5.5, GPT-6.1 Sol

**Short answer to the CEO:** yes, but only if each model is matched to the right step and a deterministic check sits behind it. Haiku 5.5 is the right model for routine work, and the evidence for that is solid. Sol 6.1 is the best value for well-specified agentic and coding work, but it is a poor fit for writing that a client sees. Sonnet 5.5 is not the cheap all-rounder people assume, because at low effort it spends so many tokens that its per-task cost catches up with Opus.

All evidence is post-release (Opus 5.5 came out 2026-09-22). I made no paid calls. Raw files are under `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/r-models/`.

## A. Sources examined

**Official (all fetched 2026-10-12):**
- Anthropic launch pages: Opus 5.5 (2026-09-22), Sonnet 5.5 (2026-09-28), Haiku 5.5 (2026-10-07).
- Anthropic docs: "Effort", "Models overview".
- Opus 5.5 system card (2026-09-22), the copy already on disk.
- OpenAI "Introducing GPT-6.1 Sol" (2026-09-29) and its developer model page `gpt-6.1-sol`.

**Independent measurement:**
- Artificial Analysis (AA): leaderboard (fetched 2026-10-12), model pages for Sonnet, Haiku and Sol, and articles on Sonnet 5.5 (09-28), GPT-6.1 Sol (09-29) and Haiku 5.5 (10-07).
- Vals Index, as of 2026-10-07.
- VulcanBench Frontier v4: Sonnet vs Opus vs Sol comparison (10-08), Sol sweep (10-01), Opus sweep (09-26).

**Expert and practitioner reports:**
- George Liu, 120-prompt effort sweep (09-25).
- CodeRabbit, Sonnet 5.5 review (09-28).
- Pawel Huryn on X: Sol (09-29) and Haiku (10-08).
- Whats_AI writing benchmark (09-29). Jerry Liu, OCR results (09-30). Morgan Linton (10-01).
- Reddit: a 3-run Sonnet vs Opus skills test (09-29), a Luna/Haiku JSON test (10-08), and several Sol complaints (09-30 to 10-09).
- Secondary write-ups: Balázs Csorba (an AA summary with an inconsistent date), DataCamp, beam.ai, Datanorth.

**What I could not open or read:**
- Exa, Tavily and Firecrawl hit their free-tier limits. I did not pay or answer the "bonus" questions.
- LMArena rankings, the Terminal-Bench leaderboard and SWE-bench model rows did not render as text.
- AA per-benchmark charts (images only).
- The Sonnet 5.5 and Haiku 5.5 system cards and OpenAI's GPT-6.1 Sol system-card addendum (not read).
- Any routine-task benchmark covering classification, extraction or templating across all candidate models. None exists in what I found.

## B. Findings

**Official, prices and settings**
1. Prices per Mtok (input/output): Fable 5.1 $10/$50, Opus 5.5 $4/$20, Sonnet 5.5 $2/$10, Haiku 5.5 "from" $0.10/$0.50. Relative latency: Slower, Moderate, Fast, Fastest. (platform.claude.com, Models overview, comparison table)
2. Haiku 5.5 costs $0.10/$0.50 for prompts up to 100K tokens and $0.50/$2.50 above that. The same launch halved Sonnet 5.5 cache reads to $0.10. (anthropic.com/claude-haiku-5-5, Pricing, 2026-10-07)
3. Sol 6.1 costs $2 input, $0.10 cached input and $10 output. Prompts over 272K tokens bill at 2x input and 1.5x output for the whole request. Batch and Flex are 50% cheaper. (developers.openai.com, gpt-6.1-sol, Pricing)
4. Sol 6.1 effort runs low to max. "The none and minimal reasoning efforts are not supported." (same page)
5. Default effort: Opus 5.5 and Haiku 5.5 default to `medium`, other models to `high`. For Sonnet 5.5 the docs say: "For agentic coding … start with `medium` for well-specified tasks". (Effort doc, "How effort works" and the per-model sections)
6. Haiku 5.5 at `low`: "the model is more likely to skip a search, stop early, or skip a check" in long agent prompts. The docs say to use `high` for strict instruction following. (Effort doc, Haiku 5.5 section)
7. Anthropic, in its own words: Sonnet 5.5 is "strongest at well-scoped everyday tasks", while "Opus 5.5 remains clearly stronger at complex, open-ended work requiring sustained judgment". (Sonnet 5.5 page, Introduction and Performance)
8. Anthropic's Sonnet 5.5 numbers: Terminal-Bench 4.0 70.6% (Opus 5.5 66.4%), GDPval-AA 1844 (Opus 1846), CursorBench 55.5% (Opus 57.8%). (Sonnet page, table)
9. Anthropic's Haiku 5.5 numbers: OSWorld 2.1 72.4%, Terminal-Bench 39.2%, GDPval-AA 1620. GPT-6 Luna scores 48.9%, 16.4% and 1437 on the same rows. (Haiku page, table)
10. OpenAI's claims for Sol 6.1:
    - AutomationBench: 2.2 percentage points above Opus 5.5 at medium, at about one-third of the cost.
    - Terminal-Bench Science: $5.47 per task, against $23.21 for Opus 5.5.
    - Share of answers with a factual error at low effort fell from 11.4% to 7.7%.
    - Silent broken-search failure: Sol 2.1%, Luna 28.7%.
    (OpenAI post, Professional work, Scientific research, Factuality and Safety sections)
11. Opus 5.5 system card, effort findings:
    - FrontierCode best score (54.6%) is at **medium**; scores decline above medium.
    - CursorBench: 56.0% at high (about $4 per task) and 52.5% at medium (about $3).
    - At **low** effort its refusal "typically stays in its reasoning" instead of being told to the user, which is a transparency risk.
    (system card, lines ~5951-5962, ~6078-6086, ~4901)

**Customer reports quoted by vendors (each is a single-vendor anecdote, rated OFFICIAL/ANECDOTE)**
12. Zendesk on Sonnet 5.5: "fewer wrong decisions", tickets handled 20% faster. Balyasny on Sonnet 5.5: 121k tokens per answer against 497k for Sonnet 5. (Sonnet page, Knowledge work)
13. HubSpot on Haiku 5.5: 92.8% on CRM tasks over 3 runs, with the lowest false-positive rate. AlphaSense on Haiku 5.5: 0.84 against 0.76 on 400 queries. (Haiku page, quotes)
14. Opus 5.5 at its lowest effort: Deloitte says it caught 72% of known bugs, against 56% for Opus 5 at high. Rogo says it beat Opus 5 at high on BigFinance Bench with about 60% fewer output tokens. (Opus page, quotes)

**Measured by Artificial Analysis (leaderboard fetched 2026-10-12; columns are index score, $ per task, output tokens/s, time to first token)**
15. Opus 5.5:

    | Effort | Index | $/task | Tokens/s | First token |
    |---|---|---|---|---|
    | max | 58 | $5.98 | 96 | 662s |
    | xhigh | 56 | $3.46 | — | — |
    | high | 54 | $1.82 | — | — |
    | medium | 51 | $1.34 | 76 | 21.7s |
    | low | 42 | $0.55 | 71 | 8.7s |

16. Sonnet 5.5:

    | Effort | Index | $/task | Tokens/s | First token |
    |---|---|---|---|---|
    | max | 56 | $5.46 | 141 | — |
    | xhigh | 52 | $2.01 | — | — |
    | high | 47 | $0.88 | — | — |
    | medium | 41 | $0.48 | 99 | 1.9s |
    | low | 36 | $0.35 | 100 | 0.9s |

17. Sol 6.1:

    | Effort | Index | $/task | Tokens/s | First token |
    |---|---|---|---|---|
    | max | 52 | $0.72 | 56 | — |
    | xhigh | 51 | $0.39 | — | — |
    | high | 50 | $0.32 | — | — |
    | medium | 48 | $0.21 | 49 | 5.8s |
    | low | 42 | $0.13 | 47 | 2.8s |

18. Haiku 5.5:

    | Effort | Index | $/task | Tokens/s | First token |
    |---|---|---|---|---|
    | max | 43 | $0.21 | 240 | — |
    | xhigh | 41 | $0.12 | — | — |
    | high | 38 | $0.08 | — | — |
    | medium | 34 | $0.05 | 166 | 13.4s |
    | low | 29 | $0.02 | 178 | — |

    AA notes these Haiku costs do not yet include the price step above 100K tokens.

19. Other models on the same leaderboard: GPT-6 Luna max 38 at $0.07. Qwen3.8 27B scores 34 (xhigh), 28 (medium) and 26 (low). Gemma 4 E4B scores 9\*; the asterisk appears to mark an estimated score (UNVERIFIED), and AA lists no cost for it.
20. AA on Sonnet 5.5: "Heaviest token use we have measured", about 193k output tokens per task at max, and it "sits off the … Pareto Frontier". At low, medium and high it sits behind Sol configurations "delivering equivalent performance for lower cost". Factual accuracy is 54% against Opus 5.5's 66%, but the hallucination rate is lower, 47% against 59%. (AA article, 2026-09-28)
21. AA on Haiku 5.5: about 162k output tokens per task at max, roughly 3x Luna. Hallucination rate 40%, against 77% for Luna. AutomationBench-AA score of 35% is "likely understated" because of over-refusal before release. (AA article, 2026-10-07)
22. AA on Sol 6.1: its low and medium settings are "Pareto optimal for token efficiency". On coding, xhigh beats max by 3 points. (AA article, 2026-09-29)

**Measured by Vals AI** (Vals Index, as of 2026-10-07)
23. Sonnet 5.5 67.04% at $21.34 per test. Opus 5.5 66.97% at $32.14. Fable 5.1 65.83% at $28.71. Sol 6.1 61.15% at $3.24. Haiku 5.5 54.31% at $2.99. Sonnet's fallback rate was 4.56%.

**Measured by VulcanBench** (23 real coding tasks, hidden tests, 2026-10-08)
24. Tasks passed out of 23, low to max: Sonnet 15/17/20/22/23, Opus 17/23/22/22/21, Sol 20/22/23/23/23.
25. Cost per task: Sol $0.31-$0.46, Opus $1.70-$8.75, Sonnet $2.39-$5.52. At low effort Sonnet cost 70% more than Opus.
26. Code-quality score: Opus medium 77.32, Sol high 73.67.
27. Opus 5.5 handed replies to Opus 4.8 when its safety classifier refused: 47.8% of replies at max, 0% at low. Its high-effort results are therefore partly Opus 4.8's.

**Expert and practitioner tests**
28. Pawel Huryn, 105 planted bugs, n=1. Sol max found 44 for $6.56, Astra 45 for $33, Opus 5.5 max 41.7 for $58.53 (2026-09-29). Opus 5.5 xhigh 36 for $34.98, Sonnet 5.5 xhigh 36 for $19.85, Haiku 5.5 max 21.5 for $5.83 (2026-10-08). (x.com/i/status/2105065401193279918 and …2108090906381328482)
29. George Liu, 120 prompts. Opus 5.5 scored 9/9 on instruction-following checks at every effort. Cost was flat at $0.54-$0.65 from low to xhigh. At max, output tokens rose 8.5x over xhigh, and one 120-word summary took 40,196 tokens and 5.5 minutes. (ai.georgeliu.com, TL;DR, 2026-09-25)
30. CodeRabbit on Sonnet 5.5: caught 6 of 13 hard known bugs at 41.2% precision, in half Sonnet 5's time. (coderabbit.ai, 2026-09-28)
31. Whats_AI writing benchmark: Sol 6.1's best setting is 153 Elo below GPT-6 Sol's. Sol at xhigh roughly ties Astra (1976 vs 1968 Elo) at about one-sixth of the price. (x.com/i/status/2105034919848312990)
32. Reddit JSON test, 18 hard cases: Haiku 5.5 passed 16/18 and had the best median calorie error (1.8%). GPT-6 Luna passed 15/18 and twice returned prose instead of JSON. (r/OpenaiCodex 1x0xsbh, 2026-10-08)
33. Reddit 3-run test: Sonnet and Opus were indistinguishable once skills were loaded ($2.30 vs $5.74). The verdict flipped between runs in 5 of 9 comparisons. (r/ClaudeAI 1wtend0)
34. Anecdotes on Sol 6.1 (unverified, single users):
    - "Lazy": diagnoses a problem without fixing it (r/codex 1wz00n8).
    - Answered in Japanese in a Korean-only chat (r/ChatGPT 1wtut0o).
    - Only 8.33% cache hits in Codex after 10-07 (r/codex 1x1qj57).
    - About 20 tokens/s in Codex (r/codex 1wuatzt).

## C. Comparison table

| Model / effort | $ in/out per Mtok | Speed (AA tok/s, first token) | Quality evidence | Where it broke | Sources |
|---|---|---|---|---|---|
| Opus 5.5 medium | 4 / 20 | 76, 21.7s | AA 51 at $1.34; Vulcan 23/23, quality 77.3 | Fallback to Opus 4.8 rises with effort | B1, B15, B24-27 |
| Opus 5.5 high | 4 / 20 | 77 | AA 54; CursorBench 56%; Vulcan 22/23 | 21% of replies from Opus 4.8 on Vulcan | B11, B15, B27 |
| Opus 5.5 low | 4 / 20 | 71, 8.7s | AA 42 at $0.55; Deloitte and Rogo quotes | Refusals hidden in its reasoning | B11, B14 |
| Opus 5.5 max | 4 / 20 | 96, 662s | AA 58 | 119k tokens per task, 11-minute first token | B15, B29 |
| Sonnet 5.5 medium/high | 2 / 10 (cache $0.10) | ~100, 1.9s | AA 41 / 47; Vals #2; Zendesk quote | Vulcan 17-20/23; dominated by Sol on AA | B16, B20, B23-25 |
| Sonnet 5.5 xhigh/max | 2 / 10 | 104-141 | AA 52-56; Vulcan 22-23/23 | Heaviest token use measured; 38 min per task at max | B16, B20, B24 |
| Haiku 5.5 medium/high | 0.10 / 0.50 (≤100K) | 166-174 | AA 34-38 at $0.05-0.08; HubSpot, AlphaSense; JSON 16/18 | Skips checks at low; 5x price above 100K; over-refusal | B2, B6, B13, B18, B21, B32 |
| Sol 6.1 low/medium | 2 / 10 (cached 0.10) | 47-49, 2.8-5.8s | AA 42 / 48 at $0.13 / $0.21; Vulcan 20-22/23 | No "none" effort; writing weaker; anecdotes of laziness | B4, B17, B31, B34 |
| Sol 6.1 high/xhigh | 2 / 10 | 50-53 | Vulcan 23/23 at $0.33-0.43; Huryn 44/105 | Code quality 2-4 points below Opus | B17, B24-26, B28 |
| Fable 5.1 | 10 / 50 | 54-70 | AA 47-53 at $2.37-$7.63; Vals 65.83% | Beaten by Opus 5.5 at lower cost on both | B1, B23, AA leaderboard |
| GPT-6 Luna | 0.10 / 0.50 | 116-139 | AA 38 at max | JSON returned as prose; 28.7% silent search failure | B10, B19, B32 |
| Qwen3.8 27B / Gemma 4 E4B (local) | our own GPU | not measured on our hardware | AA 26-34 / 9\* | No routine-task evidence | B19 |

## D. Recommended model for each step

1. **Understanding a goal and writing a brief: Opus 5.5 medium, raised to high when the goal is ambiguous.**
   - Evidence: B7, B15, B29.
   - Risk: do not run this step at low effort, because refusals stay hidden in the reasoning (B11).
2. **Planning: Opus 5.5 high. Never max.**
   - Evidence: B11, B15. Max brings 119k tokens per task, an 11-minute first token and heavy fallback to Opus 4.8 (B15, B27).
3. **Coding, well-specified with tests: Sol 6.1 high.**
   - Evidence: B24-26, B28.
   - For code the holding keeps long-term, use Opus 5.5 medium, which scores higher on code quality (B26).
   - Sonnet 5.5 only wins at xhigh or max, and costs more there (B24-25).
   - Risk: Sol's "laziness" reports are unverified (B34).
4. **Writing, content and client-facing text: Sonnet 5.5 medium/high, or Opus 5.5 medium for brand-critical pieces.**
   - Evidence: B8, B12. Sol is a step back for writing (B31), and it switched language once (B34).
   - The evidence here is thin. No one has measured Turkish or multilingual output quality.
5. **Research: Opus 5.5 medium.**
   - Evidence: AA factual accuracy 66% against Sonnet's 54% (B20). The 16/18 grounded-report result is a vendor claim from the Opus launch page.
6. **Routine work** (labelling, summarising, triage, templates, data cleaning, standard replies):
   - **Haiku 5.5 at medium**, or **high** where strict format matters. Validate every output against a schema. Keep prompts under 100K tokens.
   - Evidence: B6, B13, B18, B21, B32.
   - Sol 6.1 low is an alternative of similar AA quality at somewhat lower cost per task (42 at $0.13 against Haiku xhigh 41 at $0.12 and Haiku max 43 at $0.21), but it is 3-4x slower in tokens per second (B17-18).
7. **Checking work against a brief: deterministic tests first, then a judge from a different model family, run 3 times.**
   - Evidence: run-to-run verdicts flipped in 5 of 9 comparisons (B33); VulcanBench uses neutral judges (B27).
   - Opus 5.5 medium is the judge for high-stakes work; Sonnet 5.5 is enough for simple reviews (B30).
   - The evidence for this step is thin.
8. **Reporting: Haiku 5.5 high or Sonnet 5.5 medium.** The numbers must come from the database, not from the model.

**Too thin to decide, and how we would measure it ourselves:**
- Turkish-language quality across all models.
- Local Gemma and Qwen models for any routine flow.
- Sol versus Haiku on our own routine flows.

The method: build a golden set of 150-200 real items for each routine flow. Run each candidate model at each effort 3 times, via the Batch API at half price. Score with exact checks (labels, schema validity, numbers) plus a blind judge from another model family. Record error rate with 95% confidence intervals, cost and latency. Before switching any flow, run the new model in shadow mode for 1-2 weeks. These eval runs are paid API spend, so they need your approval or the CEO's first.

## E. Contradictions and doubts

- **Terminal-Bench 4.0 numbers differ between vendors and AA.** Sonnet: Anthropic 70.6%, AA 64%. Opus: Anthropic 66.4%, AA about 60%. Haiku: Anthropic 39.2%, AA 33%.
- **Sonnet's AA cost changed.** It was $7.60 per task at max on 09-28 and is $5.46 on the leaderboard now. The cache-price cut is a plausible cause but UNVERIFIED.
- **Sonnet's OSWorld score differs.** 80.1% on its own page against 83.9% on the Haiku page; the two use different subsets.
- **The Balázs Csorba blog is dated 2026-09-07**, before Opus 5.5's release. I used it only where it agrees with the AA leaderboard.
- **OpenAI's AutomationBench claim (B10) does not match Anthropic's own table.** OpenAI says Sol beats Opus 5.5 at medium; Anthropic's table has Opus 5.5 at 40.0% (max). AA's AutomationBench-AA has Sonnet at 71% and Opus at 70%.
- **Haiku's AutomationBench score was hurt by over-refusal** that has since been fixed, so it is understated (B21).
- **Sol's speed is disputed.** AA measured 47-66 tokens/s; Reddit users report about 20 tokens/s in Codex.
- **Vendor customer quotes are selected by the vendor.**
- **VulcanBench used different harnesses for each model** (Claude Code vs Codex).

## F. Verdict

Yes, conditionally.
- **Haiku 5.5** has the strongest evidence for repetitive, well-defined work. It is cheap, fast, low on hallucination and good on structured output. The conditions: run it at medium or high (not low), keep prompts under 100K tokens, and validate outputs against a schema.
- **Sol 6.1** gives the best quality per dollar on agentic and coding work with clear specifications, roughly matching Astra at about one-fifth of the cost. It is weaker for writing, it has no effort setting below low, and its laziness reports are unverified. It should not write anything a client sees until we have measured it ourselves.
- **Sonnet 5.5** is close to Opus on knowledge work. But at low and medium effort it is not cheaper per task than Opus low or Sol, so "cheap Sonnet for normal work" only holds where it is measured per task, not per token.
- **Opus 5.5 at medium** should stay the default for briefs, plans, research and judging. Max should never be the default.

None of this is proven on the holding's own flows or in Turkish. The golden-set measurement above is the step that would turn this into evidence.