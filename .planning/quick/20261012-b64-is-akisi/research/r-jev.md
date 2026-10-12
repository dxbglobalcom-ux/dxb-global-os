**Verdict:** we should not add Jev now. The holding's cheap decisions should stay on Claude Haiku 5.5 with code-held thresholds. Jev's only measured edges over Haiku 5.5 are latency (about 260 ms against 0.8–1.2 s) and better-calibrated probabilities. Its cost advantage is gone at our volumes. Its weak points (English-first, swayed by adversarial input, weak on numbers, dates and multi-hop questions) hit exactly where the holding needs quality. Laya is the one worth trialling later, on our own GPU and our own Turkish data, because nothing leaves the house and it speaks Jev's API.

## A. What I examined

All page copies are under `/tmp/claude-1000/-home-dxb-DxB-Global-OS/98d5669e-f759-4609-9b7d-3e469b1b84cd/scratchpad/b64/r-jev/` (pages, docs, p2–p5, plus redhat.md and haiku-decides.md).

- **The CEO's image** `/home/dxb/Desktop/jevle ilgili.png`: an Alex Xu / ByteByteGo post on X. The next post in the feed is dated 23 Sep; the LinkedIn copy is dated 23 Sep 2026.
- **TypeSafe, official:** launch blog "Introducing System One Models & Jev" (search snippet says 16 Sep 2026; Wikipedia says released 15 Sep), home page, enterprise page, Jack & Jill case study, Series A post (undated). Docs: introduction, models, "Jev 1.13 jaggedness" (reviewed 2026-10-02), coding-agents, legal, the Data Processing Agreement (DPA), and llms.txt.
- **Independent on Jev:**
  - Red Hat Developer, 2026-10-02
  - OpenRouter, 2026-09-22 (updated 09-24)
  - nibzard/decision-model-benchmark (runs of 09-26 and 09-29)
  - AbdelStark/jev-benchmarks (pilot, seed 20260917)
  - Kungie/haiku-decides (run of 2026-10-08)
  - Hacker News item 49933476 (about 7 days old)
  - OpenAI community thread (2026-10-06/07)
  - Reddit r/AI_Agents and r/hermesagent (Sep–Oct 2026)
  - LangChain blog, 2026-09-17
  - Wikipedia "Jev (AI model)"
  - Medium (Spector, 2026-10-12)
- **Laya:** Hugging Face model card `convaiinnovations/laya` (v0.3.20).
- **OpenAI:** developers.openai.com Decisions guide; community announcement of the public beta (2026-10-06).
- **Anthropic:** Haiku 5.5 launch (2026-10-07), pricing page, models overview.

**Could not open or verify:**
- TypeSafe's FAQ answers render client-side and came back empty. That includes "Can we run Jev in our own VPC or on-premises?", "Where is our data processed?" and "Are these prices subsidized?".
- Paywalled bodies: Medium (Sahu, Spector).
- Not opened: Fortune, TechCrunch, Cloudflare Clef (only boilerplate came back), inovex, the Google codelab.
- Exa, Tavily and Firecrawl hit rate limits. I fell back to Startpage and direct fetches.
- No published decision benchmark for Gemma 4 E4B or Qwen3.8-27B was found.

## B. Findings

**What Jev is**
1. **OFFICIAL:** Jev is a hosted proprietary model from TypeSafe AI (San Francisco). It does not generate text. You send a "state" plus typed questions (Choice, Score, or Noul for true/false) to `POST /v1/systemone`. It returns probabilities and confidence. Source: docs.typesafe.ai/introduction, /models.
2. **OFFICIAL:** It cannot be customised. "Jev is not fine-tuned or LoRA-adapted with customer data… the same weights serve every account." You configure it only through instructions and criteria in the request. Source: docs /models §Customizing Jev.
3. **OFFICIAL:** Pricing and limits for jev-1.13.0:
   - Input $0.042/MTok; output is free.
   - Limits of 100K tokens/s and 80 requests/s, which "can change without notice".
   - Context of 64k per request (32k for state plus the longest question). Text only.
   - Source: docs /models.
4. **OFFICIAL:** "English is the primary training language… Other languages… not equally well; test on your own content." Source: docs /models §Language support.
5. **OFFICIAL, failure modes in their own words:**
   - It reads instructions literally.
   - It is weak at math and counting, and at comparing dates.
   - It struggles with indirection and with large irrelevant state.
   - Adversarial content in the state "can move the answer".
   - It leans toward the first Choice option.
   - Source: docs /model-jaggedness/jev-1.13.
6. **OFFICIAL, speed and cost claims:**
   - "70ms–500ms"; "193.6x faster, 444.6x cheaper".
   - These are measured against the average of GPT-6 Astra and Fable 5.1 as the reference answer, which they admit "biases" the result.
   - They call the multiples "on the higher end of real world gains" and say "we can't prove it isn't subsidized".
   - Source: launch blog §Workflow evals, §Evidence.
7. **OFFICIAL, data handling:**
   - No training on customer data.
   - SOC 2 Type II.
   - Zero data retention for enterprise customers only.
   - The DPA retains customer data "as long as necessary" and lets subprocessors handle it.
   - The service is based on the US West Coast.
   - Sources: enterprise page, DPA §3/§8, launch blog.
8. **OFFICIAL, company:** Founder Diogo Almeida, formerly of OpenAI. A $40M seed was led by DCVC (per Wikipedia). A Series A of "$870 million at a $7.5B valuation" was led by a16z. Sources: blog, Series A post.
9. **OFFICIAL, only vendor-run comparison against a small model:** Jack & Jill replaced Gemini 3.1 Flash-Lite. Cost per 1,000 candidates fell from $0.755 to $0.092; median time from 20.3 s to 10.3 s (only 2× faster); recall 93.9% vs 94.6% (not statistically significant). Source: typesafe.ai/blog/jack-jill-jev-case-study.

**Independent measurements of Jev**
10. **MEASURED, Jev vs Claude Opus 5 on Banking77 (3,080 items):** Jev 81.0% vs Opus 84.4%. Jev p50 175 ms vs 2,266 ms; $0.11 vs $2.42 per 1,000. "Confidence… not a calibrated probability", but it ranks errors well. Accepting Jev at confidence ≥0.90 handles 76% of traffic for −0.4 pt accuracy at 3.5× lower cost. Source: openrouter.ai/blog/insights/jev-vs-claude-opus-5-classification.
11. **MEASURED, Haiku 5.5 vs Jev vs OpenAI Decisions (500 items per dataset):**
    - Accuracy, single Haiku call vs Jev: Banking77 79.1 vs 79.9; AG News 88.2 vs 89.2; SMS Spam 96.2 vs 96.6; SST-5 52.6 vs 55.8. None of these differences is distinguishable from zero.
    - BoolQ is the exception: Jev 91.0 vs Haiku 87.2.
    - Median latency: Jev 261–278 ms; Haiku 813–1228 ms.
    - Cost per 1,000 decisions: Jev $0.014–0.071; Haiku $0.040–0.054. On Banking77 Haiku was cheapest, because 97% of its input came from the prompt cache.
    - Jev's calibration error (ECE) is better than sampled Haiku's on 4 of 5 datasets.
    - Caveats: 0 GitHub stars and a single author.
    - Source: github.com/Kungie/haiku-decides, run of 2026-10-08.
12. **MEASURED, guardrails (Red Hat):**
    - Prompt injection: Jev 86.35% at 348 ms, versus Qwen3.6-35B-A3B as LLM judge 89.31% at 312 ms, and a 200M-parameter DeBERTa classifier 89.01% at 54 ms.
    - Content safety: Jev ranked first at 86.20% (360 ms); Laya 57.87%.
    - Source: developers.redhat.com/articles/2026/10/02/benchmarking-ai-decision-models-against-traditional-guardrails, Tables 1–2.
13. **MEASURED, nibzard (40,226 decisions):**
    - Banking77 79.2%; CLINC150 88.6%; NLU++ only 4.3% of messages fully correct.
    - p50 267–316 ms.
    - Jev rejected all 12 items with more than 255 options. When no option was correct, its mean confidence was 53.7%.
    - Source: github.com/nibzard/decision-model-benchmark.
14. **MEASURED, AbdelStark (300 examples):** On DAIR Emotion, Jev got 48.0% and put "zero probability on the true label for 16% of examples". It was strong on AG News and Banking77 (91.0% and 87.0%). Hosted p50 was 236–256 ms when called from France. Source: github.com/AbdelStark/jev-benchmarks.
15. **EXPERT, OpenAI forum user:** an informal test (a few hundred questions from word games) found Jev ahead of GPT-6 Luna, with median turns of 0.3 s vs 1.6 s. Another user found choice questions over-concentrate probability ("heads 98% instead of 70%") and are order-sensitive on both products. Source: community.openai.com/t/…/1403877, posts 6 and 14–17.
16. **OPINION, Hacker News:** "Jev can do a strict subset of what LLMs can do, but incredibly quickly and incredibly cheaply." Commenters also note that no paper or technical details have been published. Source: news.ycombinator.com/item?id=49933476.
17. **ANECDOTE, Reddit r/AI_Agents:** handing decisions to Jev strips the agent of the reasoning context behind them. Source: r/AI_Agents 1x0cw8r.

**Laya**
18. **OFFICIAL:** Laya is an open-weights model (Apache 2.0) from Convai Innovations, built on ModernBERT-large (421M parameters, 512-token context) plus a multilingual variant on mmBERT (322M, 1,024 tokens, up to 8k). It ships `laya-serve`, a self-hosted server that copies Jev's `/v1/systemone` API. Source: HF model card.
19. **OFFICIAL, the author's own honest limits:**
    - The base checkpoints score 0.362 on the typed-decisions benchmark, below the 0.461 majority-class baseline. Only the version fine-tuned on that benchmark reaches 0.766.
    - It "ships over-confident": calibration error 0.466, falling to 0.081 only after temperature refitting.
    - Its act_probability output carries no usable signal.
    - Source: HF card §Honest Limits.
20. **MEASURED, by Laya's author:**
    - 32.8 ms on a T4 GPU; 193–464 ms on CPU.
    - On MASSIVE intent in 13 non-English languages: 0.451.
    - The English checkpoint scores 0.000 on Khmer at 0.952 confidence.
    - Source: HF card §Why Route.

**OpenAI, Anthropic, Google**
21. **OFFICIAL, OpenAI Decisions API:**
    - Announced at DevDay on 29 Sep 2026 (TechCrunch, Valyu); public beta 2026-10-06.
    - Runs on GPT-6 Luna. Takes text and images. Supports predicates, choices and scores.
    - Input $0.10/MTok, no output charge, no caching. "About 10x faster than the Responses API".
    - Zero data retention and HIPAA "for eligible customers"; US and EU residency.
    - Sources: developers.openai.com/api/docs/guides/decisions §Pricing and availability; community announcement.
22. **OFFICIAL, Claude Haiku 5.5:**
    - Released 2026-10-07.
    - $0.10/MTok input and $0.50 output for prompts up to 100K tokens; batch $0.05/$0.25; cache reads $0.01/MTok.
    - Positioned "for… classification, extraction, and routing". 1M context, adjustable effort.
    - Sources: platform.claude.com pricing page; anthropic.com/claude-haiku-5-5.
23. **Anthropic has no decision API.** The haiku-decides README states this, and my searches found none — UNVERIFIED against an official Anthropic statement.
24. **Google:** I found no first-party equivalent. The only Google items are a codelab putting Jev and DiffusionGemma next to Gemini (seen as a search title only) and the experimental vLLM `/v1/systemone` endpoint that Red Hat used.

## C. Comparison

| | Jev 1.13 | Laya 0.3.20 | OpenAI Decisions | Haiku 5.5 | Local small model |
|---|---|---|---|---|---|
| What it is | Closed decision model, hosted API (B1) | Open encoder plus decision head (B18) | Luna behind a decision endpoint (B21) | General LLM, enum-constrained output (B11) | Gemma 4 E4B / Qwen3.8 (ours), or Laya on our GPU |
| Price | $0.042/MTok input, output free (B3) | $0 plus our GPU | $0.10/MTok input, no caching (B21) | $0.10 in / $0.50 out; cache read $0.01 (B22) | $0 plus our GPU |
| Latency, measured | 175–360 ms p50 (B10–B14) | 33 ms on a T4 (B20) | 139–252 ms (B11) | 813–1228 ms (B11) | Qwen3.6-35B judge on vLLM 307–312 ms (B12); ours UNVERIFIED |
| Accuracy evidence | Equal to Haiku on 4 of 5 datasets; −3.4 pt vs Opus 5; DAIR 48% | Weak zero-shot (0.362); needs fine-tuning | Equal to Haiku on 4 of 5; BoolQ 83.8 | Equal to Jev on 4 of 5; BoolQ −3.8 pt | Qwen3.6-35B ≥ Jev on injection (B12) |
| Self-hostable | Not documented; FAQ unreadable (UNVERIFIED) | Yes, Jev-compatible API | No | No | Yes |
| Data terms | US-based; zero retention for enterprise only (B7) | Stays in the house | Zero retention and EU residency if eligible | Our existing provider | Stays in the house |
| Maturity | Early access since 15/16 Sep 2026 | Released Sep 2026, 45k downloads/month | Beta since 6 Oct 2026 | Generally available since 7 Oct 2026 | Already installed |

## D. Where Jev would fit in the holding

**Each decision point, compared with Haiku 5.5 or a local model:**

- **Routing a request to a department or model:** No gain. Accuracy is equal on intent tasks (B11, B10). The cost difference is cents: at 10,000 decisions a day it is about $0.40 for Haiku vs $0.14–0.71 for Jev (B11). The 255-option cap does not bind us (B13). Jev's only edge is about 0.7 s of latency per decision, which a background department router does not need.
- **Triaging incoming client messages:** Jev is not a fit for now. Clients write in Turkish, Arabic and English, and TypeSafe itself says non-English is weaker (B4). Laya's English checkpoint is confidently wrong on unfamiliar scripts (B20). Nobody has published Turkish numbers. If a live chat ever needs a sub-300 ms triage step, the candidate is Laya on our GPU, fine-tuned and measured on our own messages.
- **Gating an agent's tool call:** Jev is acceptable only as a first filter, never as the gate. Its own docs say adversarial state "can move the answer" (B5), and Red Hat ranked it 4th on prompt injection (B12). The approval gate (money out, contracts, ad spend, identity steps) must stay deterministic code.
- **Checking an output against a rubric or brief:** Not a fit. Our checks verify the brief with real tests, and Jev cannot run tests. It is weak on numbers, dates and multi-hop reasoning (B5) and on NLU++-type multi-label judgments (B13). The vendor itself recommends splitting a judgment into atomic questions in code.
- **Bulk labeling (archives, content tags):** Plausible on paper, but Haiku batch at $0.05/MTok, or our GPU at $0, is in the same range. Data would leave the house for no measured gain.
- **Confidence and escalation decisions:** This is Jev's real edge. Its ECE is better than sampled Haiku's (B11), and the cascade result in B10 is the strongest number: Jev at confidence ≥0.90 handles 76% of traffic for −0.4 pt. The evidence also says its confidence is "not a calibrated probability" (B10, B13), so thresholds must be fitted on our own labelled data. A single Haiku call has no probability at all; getting one costs 8–10× more by sampling (B11).

**What Jev would cost us beyond tokens:**
- A new external dependency with rate limits that "can change without notice" (B3).
- A raw provider key, which our constraints forbid. A gateway route might avoid this: OpenRouter ran Jev through its own Decisions API (B10). That route is inferred — UNVERIFIED as an offering we can use.
- Client data going to the US with retention "as long as necessary" unless we hold an enterprise contract (B7).
- Lock-in risk on the API shape is low, because Laya and vLLM already serve the same endpoint (B18, B24). Lock-in risk on quality and pricing is high: closed weights, possibly subsidised prices, no paper.

## E. Contradictions, doubts, unverified items

- **Launch date:** 15 Sep (Wikipedia; Spector on Medium) vs 16 Sep (blog snippet).
- **"Can't hallucinate":** this holds only for type safety, which is guaranteed by construction. AbdelStark measured zero probability on the true label for 16% of DAIR Emotion items, and when no option was right Jev still gave 53.7% mean confidence (B13, B14).
- **Calibration:** TypeSafe sells calibration. OpenRouter and nibzard both say the confidence is not a calibrated probability. haiku-decides found Jev better calibrated than the alternatives. Treat it as good at ranking, not as a true probability.
- **Laya's "beats Jev" table:** it compares its own fine-tuned numbers with third-party Jev numbers. The author says "sample sizes and prompts differ".
- **Self-correction:** I first noted Jev's Banking77 score at 87.0%; that figure is AbdelStark's 72-label variant (B14). The full-set measurements are 79.2%, 79.9% and 81.0% (B13, B11, B10).
- **Haiku 5.5 vs Jev evidence:** it rests on one repository with 0 stars and one 50-item latency sample measured from Aachen. It needs our own rerun.
- **UNVERIFIED:** Jev on-premises or VPC; where data is processed; whether prices are subsidised; the "a third of the Fortune 500" claim (Series A post, marketing); Gemma 4 E4B and Qwen3.8 decision accuracy.

## F. Verdict

Jev is a real, well-built product. On the measured comparisons its only edges over Haiku 5.5 are latency (about 260 ms against 0.8–1.2 s) and better-calibrated probabilities. Accuracy is the same on 4 of 5 datasets (Jev ahead only on BoolQ), and per-decision cost now overlaps once Haiku's prompt caching is counted. Against that, it adds a new external US dependency and needs a raw key, with weaker Turkish and Arabic, a documented susceptibility to adversarial input, and weakness on numbers, dates and multi-hop questions. Those last two are exactly where the holding needs quality. OpenAI's Decisions API is the same idea at more than twice Jev's input price ($0.10 vs $0.042/MTok), with the same order-sensitivity complaints. Anthropic has no equivalent; Haiku 5.5 already covers the job.

**Recommendation:** keep routing, triage and labeling on Haiku 5.5 with thresholds held in code. Keep the approval gate and the checks against the brief deterministic. If a real-time path or a confidence cascade becomes worth building, trial Laya on our own GPU: fine-tune it on our Turkish and Arabic data, fit its calibration, and measure it head to head against Haiku. Nothing leaves the house, and the Jev-compatible API keeps the door open to Jev if an enterprise contract with zero data retention is ever justified.