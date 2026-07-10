---
phase: 08-ceo-dashboard-crm
plan: 03
status: complete
completed: 2026-07-10
commits: [179a208, e89167b]
requirements: [GATE-03, DASH-01]
author: Fable 5 (inline)
---

# 08-03 SUMMARY — Risk-grouped approval inbox + single-tx decision seam

## Sonuçlar

| İş | Durum | Kanıt |
|---|---|---|
| Task 1: ApprovalCard high/medium/low + BatchBar + gruplu canlı inbox | ✓ VERIFIED | build: `/approvals` route derlendi; yasak grep (confirm/alert/border-l/grid-cols-3) → 0; katalog paritesi 70/70 |
| Task 2: decide_approvals tek-tx + audit 1:1 + purity allowlist | ✓ VERIFIED | `pnpm vitest run tests/phase8/` → 22/22 PASS (inbox 10: batch 2+2 audit atomik, zehirli batch → sıfır etki, ghost id → sıfır etki, not persist, broadcast, anon deny, tablo grant'ı yok) |
| Migration 0015 lokal DB'de | ✓ VERIFIED | `has_function_privilege`: anon=f, authenticated=t; ON_ERROR_STOP apply temiz |
| Batch rollback (kısmi hata = hiçbiri) | ✓ VERIFIED | test: 3'lü batch'te 1 karar-verilmiş kayıt → exception, 0 approved, audit sayısı değişmedi |
| Gruplu render + çift-teyit + Kapı temiz + fatigue GÖRSEL doğrulama | ⚠ UNVERIFIED | GUI — wave-3 sonu toplu Playwright/göz turunda; mekanik davranışlar (grouping, eşik=50) unit-testli |

## Sapmalar / uyarlamalar (kayıtlı)

| # | Uyarlama | Gerekçe |
|---|---|---|
| 1 | Yazım kapısı = SECURITY DEFINER RPC; authenticated'e tablo grant'ı AÇILMADI (plandaki "RLS check" niyetinin sıkılaştırılması) | trg_outbox_enqueue outbox'a yazar; 0014 outbox'ı bilinçli dışlamıştı — UPDATE grant'ı açmak o kararı deler. Tek fonksiyon kapısı = daha dar yüzey; anon-deny + no-direct-UPDATE testli |
| 2 | `components/approvals/inbox.tsx` eklendi (plan dosya listesinde yoktu) | Client orchestrator'ı card varyantlarından ayırmak — tek-sorumluluk; page RSC kaldı |
| 3 | B7b "WHERE direction != 'in'" filtresi yok — kolon yok | Yön kolonu şemada hiç yoktu; B7b upstream'de sağlanıyor (Phase-4 gate yalnız OUTWARD aksiyona draft üretir). Money-OUT rozeti action_type ailesinden türetildi (payment/transfer/ad_spend/refund/payout), testli |
| 4 | Bilinmeyen risk_class → high grubuna (fail-safe) | Batchlenebilir low'a düşmesin — güvenli taraf; testli |

## Not

Cockpit konsolundaki `/approvals` RSC 404'ü bu planla kapandı (route artık var).
