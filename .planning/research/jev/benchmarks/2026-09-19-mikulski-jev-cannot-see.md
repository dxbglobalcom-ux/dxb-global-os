---
title: "TypeSafe's Jev Can't See. I Made It Guess What I Drew Anyway"
author: Bartosz Mikulski
organization: independent (AI/MLOps engineer, production-AI focus)
date: 2026-09-19
url: https://mikulskibartosz.name/typesafe-jev-guess-what-i-drew
hn_discussion: yes (3 pts)
classification: INDEPENDENTLY VERIFIED
authority_score: medium-high — statistically rigorous (Wilson confidence intervals, McNemar's test)
technical_depth: high
relevance_to_dxb: high — establishes a hard capability boundary (text-only) that matters if any DXB workflow considers feeding JEV non-text state
---

## Method
400 Google Quick-Draw sketches converted to SVG coordinate text (10 categories, 40 drawings/category). Compared four conditions: Jev-on-SVG-text, Jev-on-base64-PNG, Claude Sonnet 5-on-actual-image, Claude Sonnet 5-on-SVG-text.

## Results
| Condition | Accuracy |
|---|---|
| Claude Sonnet 5 + real image | ~91% |
| Claude Sonnet 5 + SVG text | ~57% |
| Jev + SVG text | ~35% |
| Jev + base64 PNG (image bytes) | ~9% (chance level) |

## Key finding
Jev accepts a base64-encoded image in its `state` field without erroring — but performs at chance level, confirming it is **not actually processing image content**, despite the API not rejecting the input. This is a silent capability gap: the API's willingness to accept non-text state does not imply support for it.

## Bias finding
> "Jev answered airplane for 209 of the 400 drawings" — over half of all answers, regardless of category. 85% accuracy on actual airplane drawings, 0% on cat drawings — a strong single-category bias artifact, not evenly distributed confusion.

## VENDOR CLAIM vs INDEPENDENT
Entirely independent measurement. No official TypeSafe multimodal claim was found to be contradicted here — the finding is that JEV is TEXT-ONLY, which is consistent with (not contradicting) the official docs' description of `state` as text/JSON input. The value of this test is confirming that the API's permissiveness (accepting image bytes without an error) does not mean the model uses them.
