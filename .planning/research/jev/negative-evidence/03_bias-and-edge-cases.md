---
title: Bias and edge cases
classification: INDEPENDENTLY VERIFIED (disclosed third-party repos)
---

# Bias and edge cases

## Position / answer-order bias
- **RINNECODER/jev-behavior-study**: arithmetic-comparison accuracy dropped from 88% to 57.4% purely by changing the ORDER options were listed in — no content change.
- **123Satyajeet123/jev-wide**: adding an irrelevant, clearly-wrong extra option to a `Choice` question shifted the log-odds between the UNTOUCHED remaining options by 0.31–0.50 — i.e., adding a decoy option changes the relative confidence between options that didn't change. This violates a basic rationality property (independence of irrelevant alternatives).
- **colinmcnamara.com**: when critical information was placed in the first option, accuracy was 75%; moving the same information into shared `state` (not tied to option position) raised accuracy to 100%. Confirms the model attends differently to option-order position vs state content for logically identical information.

## Language / locale bias
- **AHTOOOXA/jev-cyrillic-audit**: Russian-language accuracy 77.3% vs English 88.3% on comparable tasks — an 11-point gap. Calibration error was roughly 3x worse in Russian.
- **marcosmartinez/jev-acento**: Spanish-language tasks lost 3–6.4 accuracy points vs English-equivalent tasks, with roughly 2x worse calibration error.
- Relevance flag for DXB: project rule requires 100% single-locale purity per CEO-visible surface (Turkish for the CEO, English for artifacts) — see `english-directive-2026-07-12` / `ui-bilingual-purity-gate` memories. If JEV were ever used on Turkish-language input, its accuracy/calibration on non-English text is UNVERIFIED for Turkish specifically (only Russian and Spanish were independently tested) and should not be assumed equal to English performance.

## Prompt-injection / adversarial robustness
- **zkousama/jagged**: baseline accuracy 96.5% dropped to 26.5% under an injected adversarial instruction embedded in the `state` field.
- **Iskandeur/system1-system2**: a single adversarial payload flipped JEV's answer on 26 of 80 test utterances; the same test against GPT (a general LLM) held 80/80 correct — i.e., on this specific adversarial-robustness axis, JEV was MORE fragile than a general-purpose LLM, not less.

## Internal consistency failures
- **colinmcnamara.com**: the same underlying factual question, asked once via `Noul` (returned 0.22) and once via `Choice` (returned 0.01 at 0.97 confidence) — contradictory, both confidently stated, answers to logically the same question depending only on which primitive type was used to ask it.
- **colinmcnamara.com**: complementary/exhaustive probabilities did not sum to 1 in at least one observed case (0.72 + 0.47 = 1.19).
- **jujumilk3/jev-calibration-audit**: a 400-item gap in agreement between `Noul` and `Choice` answers to logically equivalent questions.

## Relevance note for DXB
Any DXB workflow that would ask the SAME underlying question through more than one JEV primitive (e.g., both a `noul` escalation gate and a `choice` routing decision derived from related state) should not assume internal consistency between the two answers — this is independently observed to break down. Any workflow processing Turkish text should treat JEV's non-English performance as UNVERIFIED, not assumed-equal-to-English.
