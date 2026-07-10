---
phase: 08-ceo-dashboard-crm
plan: 04
status: complete
completed: 2026-07-10
commits: [0bd606b, cfb5956, 64c3d3f]
requirements: [COST-04, DASH-03]
author: Fable 5 (inline; dataviz skill okundu, chart disiplini uygulandı)
---

# 08-04 SUMMARY — Cost surface (SQL-equal) + task drill-down

## Sonuçlar

| İş | Durum | Kanıt |
|---|---|---|
| Task 1: DataTile + CostBreakdown + costs page (canlı) | ✓ VERIFIED | build: `/costs` route derlendi; yasak grep (pie/h-screen/#000000/border-l-4) → 0 |
| Task 2: SQL-eşitlik kapısı | ✓ VERIFIED | `cost-view.test.ts` 5/5 PASS — 3 boyutta byte-eşitlik, yerel-geceyarısı sınırı (23:59 dışarıda / 00:01 içeride), duyarlılık kanıtı (tag corrupt → eşitlik bozuldu → rollback → restore) |
| Task 3: AuditTimeline + tasks/[id] | ✓ VERIFIED | build yeşil; sorgular task_id'ye sabit; canlı katman record.task_id filtresiyle — cross-task abonelik kod düzeyinde yok; UUID-dışı/bilinmeyen id → notFound |
| Horizon "bugünkü maliyet" tek kaynak | ✓ VERIFIED | layout.tsx artık `periodTotal(postgrestCostSource)` çağırıyor — costs sayfası + Horizon aynı modül; tam suite 27/27 PASS |
| Görsel doğrulama (toggle ekranları, skeleton, canlı <2s, tek-hue göz kontrolü) | ⚠ UNVERIFIED | GUI — wave-3 sonu toplu Playwright turu + CEO göz testi |

## Sapmalar / uyarlamalar (kayıtlı)

| # | Uyarlama | Gerekçe |
|---|---|---|
| 1 | Boyut/dönem toggle'ları client state değil RSC link (`?dim=&period=`) | SQL tek kaynakta kalır (server), client'ta ikinci aggregate yolu doğmaz — eşitlik kapısının ruhu |
| 2 | Bar rengi: accent değil mürekkep-türevi nötr (`color-mix(ink-2 38%)`) | UI-SPEC §2 altın ≤%8 disiplini — bar listesi accent'te boyansa bütçe patlar; dataviz tek-hue kuralı korunur, status yalnız bütçe eşiği tile'ında |
| 3 | Sparkline eklenmedi (DataTile `detail` satırı var) | Dönem tile'ları zaten üç ufukta değer veriyor; trend çizgisi için ayrı zaman-serisi sorgusu gerekir — 08-07 polish'e not, şimdilik fake-precision riski alınmadı |
| 4 | Test row-source seam'i (kysely) ile modülü çağırıyor; PostgREST yolu build+runtime'da | Testte auth'lu PostgREST istemcisi kurmak lokal service-key sabitine bağımlılık yaratır; seam sayesinde modülün TÜM mantığı (gruplama, sınır, hassasiyet) DB'ye karşı test ediliyor |
| 5 | `components/task-live-refresh.tsx` eklendi | Timeline RSC kalsın diye canlı katman ayrı küçük client adası |

## Not

Konsoldaki `/costs` ve `/tasks/[id]` RSC 404'leri bu planla kapandı. Kalan: `/crm` (08-06).
