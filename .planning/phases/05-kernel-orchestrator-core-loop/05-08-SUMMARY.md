---
phase: 05-kernel-orchestrator-core-loop
plan: 08
status: complete
completed: 2026-07-08
tasks_completed: 3/3
commits:
  - "685e064 feat(05-08): qa.ts single-strong-model QA gate + council.ts N+1"
  - "e7a6fb9 feat(05-08): golden set (10 fixtures) + council-judge suite"
---

# 05-08 SUMMARY — qa.ts + council.ts + golden set (master-plan step 7)

**Executed inline by Fable 5 (governance v5 — no subagent).**

## What closed

CNCL-01 + the default QA gate. QA = ONE strong model per task (model from the
`final-approval` routing row — data, no literal in qa.ts). Council = LOCKED
N+1: 3 cheap producers in parallel + 1 judge that ONLY compares (never
produces); fires IFF `approval_class='outward' OR model_tier='L1'`; every call
cost-tagged `meta.council=true`. Judge strength proven on the golden set.

## Modules

1. **qa.ts** — `qa(taskId, evaluate?)`: task must sit in 'review'; verdict
   Zod `{pass, confidence 0-1, notes}`, one retry on malformed then throw.
   Pass → `review→done` (approval 'none') or `review→awaiting_approval`
   (Phase-4 flow). Fail → `review→failed {reason:'qa-fail'}` — the 05-06
   ladder engages. Actor `orchestrator:qa`; injectable evaluator for tests.
2. **council.ts** — `shouldCouncil(task)` pure LOCKED trigger;
   `COUNCIL_CONFIG` single config surface (producers glm-5.2 / kimi-2.7-code /
   qwen3.6-flash — ADAPT-2 continuation slugs; judge sonnet-5, escalation
   opus-4.8); `judgeCandidates()` anonymized A/B/C, winner Zod-enum'd,
   candidate text declared DATA (T-05-20/21); `council(task)` producers via
   LiteLLM department virtual key, judge via Agent SDK; per-call cost_ledger
   row `meta {council:true, role, label}`.

## Evidence

| İddia | Durum | Kanıt |
|---|---|---|
| shouldCouncil doğruluk tablosu (outward→T, L1→T, internal/L3→F, none/L2→F) | ✓ VERIFIED | unit test, deterministik 6/6 içinde |
| qa fail → failed{qa-fail} → ladder devreye girer | ✓ VERIFIED | event actor `orchestrator:qa` payload `{reason:'qa-fail'}`; ardından `escalate` → `{requeued, retry-same-tier, failCount:1}` |
| qa pass yönlendirmesi approval_class'a göre | ✓ VERIFIED | 'none' → done; 'internal' → awaiting_approval — her ikisi DB'den assert |
| Bozuk verdict 2× → throw, task review'da kalır | ✓ VERIFIED | `rejects.toThrow(/malformed twice/)`, calls=2, status 'review' |
| **NEGATİF test: normal görevde council çağrısı YOK** | ✓ VERIFIED | internal/L3 worker→qa→awaiting_approval; `meta->>'council'='true'` satır sayısı **0** — deterministik, hiç skip edilmez |
| **Judge ≥ 8/10 golden** | ✓ VERIFIED | canlı koşu: **10/10, judge sonnet-5, escalation GEREKMEDİ** — pick tablosu aşağıda |
| Canlı council: 4 cost satırı meta.council=true | ✓ VERIFIED | outward görev → 3 producer (api) + 1 judge (subscription) satırı; winner A (glm-5.2), rationale kaydedildi |
| qa.ts'de model literal yok | ✓ VERIFIED | grep model adları → 0 eşleşme; model `final-approval` routing satırından |
| Tam suite | ✓ VERIFIED | `pnpm test` → **71 passed \| 11 skipped (82)** |

**Golden pick tablosu (canlı, judge = sonnet-5):**
```
arithmetic-vat: A✓  code-iseven: B✓  summary-fidelity: C✓  policy-refund: B✓
listing-draft: A✓  logic-syllogism: C✓  date-arithmetic: C✓  sql-count: B✓
translation-tr-en: C✓  unit-conversion: A✓            → 10/10
```
Fixture doğru-etiket dağılımı A:3 B:3 C:4 (pozisyon bias'ı kontrollü).

**Canlı council çıktısı:** `council winner: A (glm-5.2) — "3 clean sentences,
exact contract match, brand-safe..."` — judge kendi cevabını ÜRETMEDİ,
yalnız karşılaştırdı (winner enum A|B|C, dördüncü cevap kanalı yok).

## Deviations (kayıtlı, CEO-görünür)

| Sapma | Durum |
|---|---|
| Plan metni QA modelini "sonnet-5 per seed" diyordu; gerçek seed `final-approval` satırı = **fable-5**. Mekanizma plana birebir uyuldu (model = routing SATIRI); satır içeriği seed'in kendisi. Model değişikliği istenirse = routing_rules UPDATE (data), kod değişmez | Gözlem kaydedildi — kapalı (kod tarafında sapma yok) |
| Council cost satırları `cost_eur=0, source='manual'` + token sayıları: 04-04 LOCKED tek-kaynak kuralı (api EUR yalnız LiteLLM spend loglarından; breaker cost_ledger+spend TOPLUYOR — ikinci EUR yazımı çift sayardı). meta.council=true görünürlüğü tam | Uygulandı + testte assert — kapalı |
| Judge maliyet satırı token 0 (Agent SDK usage alanı bu katmanda çekilmiyor; subscription EUR=0 zaten) | Kayıtlı — kapalı (Phase-8 cost görünümü genişletebilir) |

Açık sapma yok.

## Threats closed

- **T-05-19:** trigger LOCKED outward/L1; negatif test sessizliği kanıtlıyor; meta.council sorgulanabilir; Phase-4 breaker'lar backstop.
- **T-05-20:** A/B/C anonim; judge prompt'u aday metnini DATA ilan ediyor; çıktı Zod-kısıtlı.
- **T-05-21:** comparative-only prompt + winner enum — dördüncü cevap kanalı yapısal olarak yok.
- **T-05-22:** kabul edilmiş (producer'lar CEO-onaylı OpenRouter slugları; outward içerik gönderim öncesi Phase-4 kapısında).
