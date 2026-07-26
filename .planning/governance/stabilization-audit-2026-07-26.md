---
name: stabilization-audit-2026-07-26
description: "2026-07-26 öğleden sonra, 5 commit: U30 Fable 5 yeniden yetkili; U31 chat×ses çakışması (details-slot dersi); outbox allowlist sınıfı; U28 kayıt-gerçek uyuşmazlığı; batarya 3 fix + yeni yasalar"
metadata: 
  node_type: memory
  type: project
  originSessionId: 75eccf6a-b7c5-4961-b02d-7bfb25aa6dc7
  modified: 2026-07-26T12:31:54.043Z
---

# Stabilizasyon oturumu 2026-07-26 12:00-14:35 (yazar: Fable 5, U30 sonrası ilk oturum)

**Bağlam:** CEO Opus 5 dönemini "mahvetti gibi" diye rapor etti; küçük parçalar istedi. Ölçüm: Opus 5 kayıtsız iş YAPMAMIŞ (U21-U29 hepsi kanıtlı) ama tempo doğrulanmamış katman bırakmış. Commits: 2d2d7c4, 79ae98c, 750956b, 719fe59, ec44fa1.

**Why:** kararlar + dersler sonraki oturumları bağlar. **How to apply:** aşağıdaki kurallar artık standarttır.

1. **U30:** İnşaat yazarı = oturumu süren model (Opus 5 VEYA Fable 5). Yedek zinciri DEĞİL. [[model-routing-hierarchy]] v11.
2. **U31 + `<details>` dersi:** sabit yükseklikli sayfada disclosure yalnız SINIRLI bölge olarak açılır (`clamp(taban, 100vh - sabitler, tavan)` İÇERİK div'inde — Chromium `<details>` içeriğini slot'lar, details üzerinden flex zinciri içeriğe ULAŞMAZ; ölçüldü: 518px taşma). Batarya yasası spec §24quater-ter: sabit yükseklikli yüzeyin pası her disclosure'un AÇIK halini içerir. 45vh ilk fix 1366/1920'de yeşildi, 1280×800 pencere bacağı çürüttü — pencere bacağı zorunlu.
3. **Outbox allowlist sınıfı:** enqueue trigger'ı artık yürütücü registry'sinin AYNASI (denylist değil); çift test tutuyor (`tests/c9/outbox-enqueue-allowlist.test.ts`). Yürütülemez onaylı aksiyon = audit izi, asla zehirli satır. Kök olay: CEO'nun onayladığı `discovery_engine.scheduler_disable` — handler'ı YOK ve OLAMAZ (settings kapısı §26: system yazarı CEO politika anahtarına dokunamaz); satır 15 sn'de bir ready→rollback döndü, attempts 0'da çakılı = alarm yolu kör.
4. **Yerleşik-restart kuralı ihlali yakalandı:** üniteler 11:32'de restart, son runtime commit 11:36 — kuralın yazılmasından 4 saat sonra kural sahibi tarafından çiğnendi. Denetim her oturumda `ActiveEnterTimestamp` vs son `packages/` commit karşılaştırmalı.
5. **U28 kayıt-gerçek uyuşmazlığı:** U-tablosu "her fırsat 3 URL cite ediyor" derken canlı satırlar 1 URL'lik koşu-3 satırlarıydı (kayıt yazılırken ESKİ koşunun verisi çoktan değişmişti — kayıt anında YENİDEN ölç). 15 kayıt/10 denetimsiz silinme: opportunities'te delete kapısı yok (sınır kaydı).
6. **Batarya dersleri:** (a) gizli HelpTip katmanları overlap taramasında yanlış-pozitif — opacity/visibility zinciri filtrelenir; (b) yanlış rota = şık 404 sayfası "temiz" ölçülür — rotalar `ls app/(command)` ile doğrulanır (/ops/projects, /gov/decisions); (c) makinenin göremediğini göz görür: TR sayfada İngilizce DB metni (projects.purpose → purpose_tr migration 20260726011100, İKİ tüketici birden), "KİLOM ETRE" kelime-ortası kırılma (4'lü şerit → 2×2).
7. **Yeni kalıcı kapılar:** authed.spec U31 vakası (3 viewport, çakışma+taşma) + "no visible ellipsis" 8 rota + teardown 3. sınıf (kendini-doğrulayan hook:conflict süpürmesi). `scripts/test/e2e-state-mint.mjs` repo'da — batarya CEO storageState'ini insansız basar.
8. **Çalışma modu (CEO emri):** tur başına tek küçük iş + kanıt; W2.3-2.6 CEO emri olmadan açılmaz. CEO'ya açık kararlar: Hermes beyni (para), W2.3+ devam.
