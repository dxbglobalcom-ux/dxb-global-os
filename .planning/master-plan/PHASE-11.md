# PHASE 11 — Outleteuro Pilot

**Req:** PILOT-01..04
**Bağımlılık:** Phase 10 (aktive departmanlar)
**İlke:** Anti-baby-sitting'in kanıtı — holding'in KENDİ departmanları gerçek mağazayı işletir; ne builder ne CEO mağazaya doğrudan dokunur. Gerçek paraya komşu her şey rayların arkasında.

## 1. Hedef + Kabul Kapısı

1. outleteuro.com katalog işi orchestrator'dan departmanlara dispatch edilir — builder/CEO mağazayı doğrudan İŞLETMEZ (audit kanıtı: mağaza yazımlarının %100'ü task zincirli)
2. **Catalog Automation Rate (CAR)** sürekli ölçülür ve cockpit'te: 73 markanın canlı+eksiksiz+DOĞRU listing'i otonom bakımda olan yüzdesi
3. Autoresearch döngüsü ≥1 Outleteuro asset'inde: kilitli scorer + git commit/revert disiplini
4. Stripe/DocuSign/Cloudflare eylemleri YALNIZ outbox executor arkasında draft; kısıtlı anahtarlar; WooCommerce yazımları staging-first

## 2. LOCKED Kararlar

| Karar | Gerekçe |
|---|---|
| CAR tanımı: `CAR = doğru_marka_sayısı / 73`; "doğru" = canlı + zorunlu alanlar dolu + güçlü-model (sonnet+) doğrulaması geçmiş — ucuz-judge sign-off SAYILMAZ | Pitfall 3 + gotcha tablosu |
| WooCommerce: staging site VEYA draft-status ürün — canlı kataloğa ilk yazım ASLA (pipeline kanıtlanana dek) | gotcha tablosu |
| Stripe: restricted key (charge scope YOK — read + product yönetimi min. scope); DocuSign: envelope-draft-only; Cloudflare: zone-scoped token — üçü de YALNIZ outbox executor env'inde | PILOT-04 |
| Bu üç MCP HİÇBİR ajan profiline girmez; handler'lar outbox executor'a bu fazda eklenir (Phase 4 iskeleti hazır) | I2 |
| Autoresearch: karpathy kalıbı — `program.md` + TEK mutable asset + KİLİTLİ scorer; kazanan commit, kaybeden revert; scorer'ı değiştirmek ayrı CEO-onaylı iş | locked pattern |
| İlk autoresearch asset'i: bir kategori sayfası başlık/açıklama seti; scorer: kilitli SEO+doğruluk rubriği (sonnet-5, sabit prompt hash'li) | küçük, ölçülebilir, geri alınabilir |
| Katalog verisi CRM/tasks şemasına eklenmez — `catalog_brands` ayrı tablo (0014); dashboard CAR panели buradan okur | operasyonel state tek DB'de ama alan ayrık |

### 0014_catalog.sql (çekirdek)

```sql
CREATE TABLE catalog_brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,                  -- 73 satır seed
  status text NOT NULL DEFAULT 'unmanaged'
    CHECK (status IN ('unmanaged','in_progress','live_unverified','live_correct','stale')),
  last_verified_at timestamptz, verified_by_model text,
  woo_ref text,                               -- staging/live ürün-koleksiyon referansı
  updated_at timestamptz NOT NULL DEFAULT now());
-- CAR = count(status='live_correct') / 73.0 ; 'stale' = 30 günü geçmiş doğrulama (cron düşürür)
```

## 3. Dosya-Seviyesi Spec

```
db/migrations/0014_catalog.sql + seed (73 marka)
packages/outbox-executor/src/actions/{woocommerce,stripe,docusign,cloudflare}.ts
apps/dashboard/src/app/(cockpit)/pilot/page.tsx    # CAR paneli + marka tablosu
autoresearch/outleteuro-category-copy/{program.md,scorer.md,asset/}
tests/phase11/{no-direct-write,car-verify,autoresearch-cycle}.test.ts
```

## 4. Adım Listesi

| # | Adım | Doğrulama |
|---|---|---|
| 1 | Faz toolset study→install: Stripe/DocuSign/Cloudflare MCP study card'ları + kısıtlı anahtar üretimi (CEO: anahtar yaratma; scope tanımı planda) | anahtar scope'ları study card'da kayıtlı; test çağrısı: charge denemesi 403 (scope kanıtı) |
| 2 | WooCommerce staging + 0014 seed | staging erişilir; `SELECT count(*) FROM catalog_brands`=73 |
| 3 | Katalog pipeline'ı departmanlara (envelope şablonları: sourcing→listing→verify) | 1 marka uçtan uca: dispatch→draft listing→sonnet verify→live_correct; builder'ın hiçbir git/woo yazımı yok (audit taraması) |
| 4 | CAR paneli + stale cron | panel yüzdesi SQL ile eşit; 31 gün önceye çekilen kayıt stale'e düştü |
| 5 | Outbox handler'ları (woo publish, stripe read, docusign draft, cf zone) | her biri: draft→approve→executed zinciri; idempotency double-fire yeşil |
| 6 | Autoresearch döngüsü | 3 iterasyon: scorer skorları kayıtlı; kazanan commit'li, kaybeden revert'li (git log kanıtı); scorer hash değişmedi |
| 7 | Ölçekleme: 73 markaya dalga dalga (10'arlı) | her dalga sonrası CAR artışı + örnekleme denetimi disagreement <%15 |
| 8 | Faz kapanışı = v1 MILESTONE | 4 kriter + CAR trend raporu; CEO kapanış onayı |

## 5. Risk + Fallback

- **Gerçek para bitişiği:** bu fazın TÜM yeni handler'ları çift-onay (CEO + canary yeşil) ister; restricted-key scope'ları kurulum günü Stripe/DocuSign güncel dokümanından DOĞRULANIR (planlama-anı bilgisi eskimiş olabilir — no-guessing).
- **WooCommerce API kırılganlığı:** staging'de hata bütçesi; canlıya geçiş marka-dalga başına CEO onayı.
- **CAR "doğru"nun öznelleşmesi:** verify rubriği repo'da versiyonlu; değişiklik = CEO onaylı ayrı commit.
- **Autoresearch scorer gaming:** scorer prompt hash'i golden_runs'a kayıtlı; hash değişimi pipeline'ı durdurur.

## 6. Bütçe-Fallback İşaretleri

- ⛔ FABLE-ONLY: canlıya geçiş dalgaları; handler güvenlik incelemesi; scorer/rubrik değişiklikleri; milestone kapanışı.
- Opus uygulayabilir: adım 2–4, 6–7 mekanik kısımları; adım 1 ve 5 güvenlik incelemesi Fable'sız kapanamaz — fallback modunda pilot staging'de İLERLER, canlı yayın bekler.
