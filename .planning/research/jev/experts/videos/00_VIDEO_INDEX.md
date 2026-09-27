---
title: Video corpus index — 11 videos, selected by technical depth not view count (görev1.md §3)
compiled: 2026-09-23
raw_transcripts: "../../transcripts/ — full raw auto-caption transcripts, one .txt per video, filename = date-channel-slug. görev1.md §4's no-verbatim-copyright restriction was rescinded by the CEO in conversation, 2026-09-23 (\"yanlış yazılmış o iptal, böyle bir kısıtlamayı CEO olarak kaldırdım\") — full transcripts are retained per his live order (CLAUDE.md §1, LAW A)."
---

# Video corpus index

Selection criteria applied (per görev1.md §3): technical accuracy, speaker authority, content depth, hands-on examples, currency, community interest — NOT view count alone. The lowest-view video in this list (14 views) is also one of the two highest-value entries because of what it demonstrates, not who watched it.

| # | Title | Channel | Date | Duration | Views (at research time) | Tier | Transcript file |
|---|---|---|---|---|---|---|---|
| 1 | Livestream Coding with the new TypeSafe AI JEV Model \| Parallel Constrained Decoding | Neural Breakdown with AVB | 2026-09-17 | 2:19:04 | 12,620 | Expert/independent — reverse-engineering | `2026-09-17-neuralbreakdown-avb-livestream-parallel-constrained-decoding.txt` |
| 2 | TypeSafe AI (pharmacy consensus kernel case study) | Don Johnson | 2026-09-19 | 4:15 | 14 | **Independent case study — highest DXB relevance in corpus** — full writeup at `../../case-studies/typesafe-pharmacy-consensus-kernel.md` | `2026-09-19-donjohnson-typesafe-ai-pharmacy-consensus-kernel-case-study.txt` |
| 3 | Jev AI Is INSANE... 193× Faster Than LLMs?! | AI WITH Rithesh | 2026-09-16 | 8:07 | 21,956 | Independent explainer — unusually rigorous about vendor-chart caveats | `2026-09-16-aiwithrithesh-jev-insane-193x-faster.txt` |
| 4 | Jev: The Schema-Safe AI That Could Change Automation Forever! | RepoChad | 2026-09-16 | 8:10 | 84,954 | Independent technical breakdown. Video ID resolved during transcript restore: `RPpQacmBe4A` (title-verified via `yt-dlp --get-title`) | `2026-09-16-repochad-jev-schema-safe-ai.txt` |
| 5 | JEV Breakdown: The First AI Model Built For Code | Rob Shocks | 2026-09-17 | 10:36 | 386,921 | Community/enthusiast, vendor-positive, real named-customer leads (Vercel) | `2026-09-17-robshocks-jev-breakdown-first-ai-model-for-code.txt` |
| 6 | Jev Ultrafast GitHub: How TypeSafe AI Makes Browser Agents Faster | Alex Hitt | 2026-09-18 | 8:47 | 5,149 | Third-party open-source implementation walkthrough | `2026-09-18-alexhitt-jev-ultrafast-github-browser-agents.txt` |
| 7 | TypeSafe AI Jev vs. Laya (what they are and the controversy so far) | Adam Gardner | 2026-09-21 | 6:56 | 21,544 | Independent — the clearest account of the novelty/priority dispute | `2026-09-21-adamgardner-jev-vs-laya-controversy.txt` |
| 8 | Jev From TypeSafe is a New Class of AI Model that is FAST and CHEAP - But There is a Caveat! | Gary Explains | 2026-09-18 | 10:52 | 33,405 | Independent hands-on demo with reproducible live failures | `2026-09-18-garyexplains-jev-new-class-caveat.txt` |
| 9 | What is Jev and How to Use it? | Codevolution | 2026-09-20 | 22:12 | 184,510 | Independent SDK tutorial | `2026-09-20-codevolution-what-is-jev-how-to-use.txt` |
| 10 | "wtf is jev?" | Syntax (CJ) | 2026-09 | ~12–15 min (est.) | — | Independent technical explainer + demo | `2026-09-syntax-cj-wtf-is-jev.txt` |
| 11 | "An ex-OpenAI researcher just deleted language from the LLM..." (The Code Report) | Fireship | 2026-09-21 | ~3–4 min (est.) | — | High-authority independent dev channel, fast-paced, both vendor claims and skeptical voices | `2026-09-21-fireship-code-report-ex-openai-researcher-deleted-language.txt` |

## Per-video key findings (beyond what's already filed in benchmarks/negative-evidence/case-studies)

### #1 — Neural Breakdown with AVB (livestream reverse-engineering)
The single deepest technical investigation in the video corpus — a live attempt to reverse-engineer JEV's internal architecture by probing its API behavior. Key finding: the presenter empirically demonstrates that JEV does NOT generate tokens autoregressively into open vocabulary space — it requires the CALLER to supply the exact candidate answer strings as `criteria`, and the model then runs what the presenter hypothesizes is a classifier over special "choice-slot" tokens, not a true text-embedding lookup. Demonstrated live: removing the `criteria`/instruction fields still produces plausible-looking output (the API does no input-shape validation — "anything you pass in... just goes... just a JSON dump"), and the model cannot generate a value that wasn't explicitly listed as a candidate option. Also covers taxonomy-walking (one `Choice` call per tree level, not a single call for a full deep hierarchy) and structured score/rubric use for PR-description quality grading. Presenter's own repeated caveat: "there's no research paper... this is all hunches at this point."

### #3 — AI WITH Rithesh (unusually rigorous vendor-chart critique)
Best independent breakdown of TypeSafe's own "workflow eval" methodology found anywhere: accuracy is graded as agreement with the AVERAGE of GPT-6/Astra/Fable 5.1, not ground truth. On this chart, **Jev scores ~68% — actually BELOW OpenAI's Sol and Anthropic's Opus 5, both in the low 70s** — Jev's advantage is accuracy-PER-DOLLAR, not raw accuracy (directly corroborates the OpenRouter Banking77 finding of a 3.3-point gap vs Opus 5). Also flags: the "zero hallucination/zero type-error" chart entry "wasn't measured" — it's a structural guarantee TypeSafe put at 0% by definition, not an empirical result. Names the Jevons-paradox etymology (William Stanley Jevons, 1860s steam engines/coal consumption).

### #4 — RepoChad
Explicit, important methodology finding not stated elsewhere as clearly: **"Type-Safe deliberately published zero numbers on standard public benchmarks."** Their stated policy: public leaderboards encourage dataset contamination and prompt gaming. While understandable as a policy, it also means (RepoChad's own words) "independent developers cannot verify how Jev performs on generalized tasks" using any standard reference point — everything is vendor-workflow-shaped.

### #5 — Rob Shocks
Contains the most-repeated "named customer" claim in the video corpus: **Vercel reportedly swapped a cheap classifier (Gemini 2.5 Flash-Lite) for JEV and saw 6x speed with accuracy that "saturated the eval."** This is relayed secondhand by the video's presenter (not a Vercel-authored source, not independently confirmed by Vercel directly) — classify as VENDOR-ADJACENT / UNVERIFIED, same caution as the Metaview reference in `../articles/2026-09-23-flaviocopes-jev-deep-dive.md`. Smart-home voice-command demo measured live at 185ms.

### #6 — Alex Hitt (jev-ultrafast browser-automation project)
Describes a specific third-party open-source repo ("jev-ultrafast") using JEV for browser automation: DOM-snapshot-based (not screenshot/vision-based) state representation, sub-20ms decision latency claimed, a DUAL-MODEL architecture (JEV decides WHICH action; a separate LLM generates any free-text needed, e.g., typing "Zurich" into a field, since JEV itself cannot generate arbitrary text), plus concrete safety guardrails: click-occlusion verification (checks whether a modal covers the target before clicking) and a stale-page handler (cryptographic fingerprint of page state, retries if the DOM mutated mid-execution). This is the most concrete "how do you actually engineer around JEV's text-generation limitation in a tool-calling context" example in the corpus — directly relevant to any DXB tool-routing use.

### #7 — Adam Gardner (Jev vs Laya controversy)
The clearest, most detailed account of Conflict C3 (novelty/priority dispute) — see updated `../../04_CONFLICTS.md`. Quotes Nandakishor Mukkunnoth's own dev.to/LinkedIn account directly: built a similar non-autoregressive structured-decision architecture starting March 2025, published a paper, released model weights on HuggingFace, published an open dataset, built a PyPI package, posted the approach on Reddit; published a second paper in September 2025 on "schema-based decisions guided by reinforcement learning." His response to JEV's September 2026 launch: open-sourced his own system as **Laya**, explicitly "fixing every architectural limitation of the old approach."

### #8 — Gary Explains (live hands-on demo with reproducible failures)
Best "try it yourself and watch it fail" video in the corpus. Concrete reproducible tests: (a) "Alice has 5 brothers, 3 sisters — how many sisters does Alice's brother have?" → correctly answered 4 at 96% confidence. (b) A large prime number correctly identified as NOT obviously prime at only 55% confidence when given a moderately-sized prime (9,857) — and then, given a much larger genuine prime number, confidently (not disclosed exact %, but presented as confident) answered "No, not prime" — WRONG. (c) A classic three-flower logic riddle (red/yellow/blue, "at least one is always red," "at least one is always yellow," does it follow at least one is always blue?) — Jev confidently backed the WRONG student's answer, while the presenter notes frontier LLMs get this riddle right. Demonstrates the boundary between JEV's strengths (sentiment analysis, straightforward classification) and weaknesses (multi-step logical inference, math/counting on larger numbers) live and reproducibly.

### #9 — Codevolution
Clean, accurate SDK tutorial (TypeScript client, `noul`/`choice`/`score` question types, real API responses shown). No new independent findings beyond confirming API mechanics already documented elsewhere — useful as a clean reference for how DXB would actually write integration code, not for evidence purposes.

### #10 — Syntax (CJ) / #11 — Fireship
Both summarized in detail in `../../videos/video-index-and-section-notes.md` (V1/V2), with full raw transcripts in `../../transcripts/`; Fireship in particular is notable for openly calling TypeSafe's own benchmark chart "trust-me-bro benchmarks" on air, and for being the source that most directly names the non-determinism caveat ("send it the exact same question in the exact same context and get different results") and the architectural-secrecy point (CEO says a paper may come "maybe" in the future).

## What this video sweep did NOT find
No official TypeSafe-produced YouTube video or founder conference talk was located in this research pass (only a blog post, `typesafe.ai/blog/introducing-system-one-models-and-jev`, not a video). Flagged UNKNOWN — a targeted follow-up search would be needed to confirm whether one exists.
