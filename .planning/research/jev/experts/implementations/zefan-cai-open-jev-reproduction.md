---
title: Open-Jev — independent reproduction/open-weight clone with published benchmarks
author: Zefan Cai
organization: independent researcher (GitHub/HuggingFace attribution, no stated employer)
date: unspecified on page (v1.1 latest at research time)
url: https://zefan-cai.github.io/open-jev/benchmarks/
classification: INDEPENDENTLY VERIFIED (own benchmark of own reproduction, not TypeSafe's code)
authority_score: medium — open methodology, published model weights, but not TypeSafe's own architecture (a best-effort independent reproduction)
technical_depth: high
relevance_to_dxb: medium — relevant mainly as evidence of ecosystem maturity/openness, and as a self-hostable alternative if vendor-lock-in becomes a real DXB concern
---

## What it is
An open-weight reproduction of JEV's typed-decision behavior (Qwen-base, LoRA fine-tune + scalar confidence head + post-hoc calibration), NOT TypeSafe's own code or weights — an independent attempt to replicate the capability.

## Published benchmark results
| Model | JevBench (231 public tasks) |
|---|---|
| Open-Jev-27B v1.1 | 85.28% |
| Original Jev (baseline reference) | 86.58% |
| "GPT-6 Astra" (frontier reference) | 100% |

Latency (P50/P95, customer-service task):
| Model | P50 | P95 |
|---|---|---|
| Open-Jev-2B | 85.03ms | 133.91ms |
| Jev | 295.26ms | 330.37ms |
| GPT-6 Astra | 1938.39ms | 2375.71ms |

Internal OOD accuracy: 95.98% (14,825/15,446).

## Stated limitations (author's own)
> "These are reference matches in prepared task data, not end-to-end workflow success."
Local (self-hosted, H100 GPU) vs hosted (JEV via API) latency comparisons are NOT matched-hardware — the P50 gap partly reflects local-vs-network-hosted deployment, not necessarily raw model speed.

## Relevance note for DXB
Confirms a credible open-source reproduction exists and is self-hostable, which matters only if vendor lock-in (see `../../negative-evidence/04_integration-and-api-issues.md`) becomes a real adoption blocker — evidence of an alternative, not a recommendation to use one over the other (Opus decides).
