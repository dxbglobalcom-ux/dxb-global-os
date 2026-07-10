# SECURITY_MODEL — DXB GLOBAL AI-NATIVE HOLDING OS

> Dalga 4 · Yazar: Fable 5 bizzat · Kaynak hüküm: CEO hizalaması madde 4 (sertleştirme DURUR; para-ÇIKIŞI kapısı + outbox KALIR; bu dosya ertelenmiş-sertleştirme sicilini tutar) · Üst: [[SYSTEM_ARCHITECTURE]] §16 · Kardeşler: [[PERMISSION_MODEL]] (yetki matrisi), [[APPROVAL_ENGINE_SPEC]] (B7b), [[AUDIT_AND_LOGGING_SPEC]]
> BAĞLAYICI SINIR: Bu spec yeni güvenlik İŞİ AÇMAZ. İki içeriği vardır: (1) değişmez omurganın kaydı, (2) ertelenen kalemlerin sicili. Sicil pasif kayıttır — execution görevi üretmez.

## 1. Amaç

Güvenlik duruşunun dürüst tek-sayfası: neyin korunduğu (omurga — dokunulmaz), neyin bilinçli ertelendiği (sicil — CEO kararıyla, tetik koşullarıyla). "Sessiz güvenlik borcu" yerine kayıtlı, görünür, tetiklenebilir erteleme.

## 2. Gereksinimler

- G1. Omurga kalemleri hiçbir spec/execution kararıyla zayıflatılamaz (⛔ + CEO onayı bile ÖNCE bu dosyayı günceller).
- G2. Her ertelenen kalem: ne, neden ertelendi, hangi tetikte açılır, hangi spec sahiplenir.
- G3. Yeni bürokrasi yasağı: MFA, ek kimlik adımı, yeni onay katmanı, yeni tarama zorunluluğu EKLENMEZ (CEO emri; tek insan-CEO işletimi).

## 3. Mimari — DEĞİŞMEZ OMURGA (KALIR, tamamı canlı)

| # | Kalem | Mekanizma | Kanıt yolu |
|---|-------|-----------|-----------|
| O1 | Para-ÇIKIŞI insan kapısı | `approvals.risk_class='money_out'` onaysız `outbox`a satır düşemez (B7b) | 0015 karar yolu + APPROVAL_ENGINE testi |
| O2 | Dışa-dönük tek çıkış | `outbox` + packages/outbox-executor — başka hiçbir yol dış dünyaya yazamaz | mimari değişmez (R7) |
| O3 | Ajan yetki sınırı | MCP gateway least-privilege profiller (14 profil, registry-üretimli) | Phase 7 study + profil dosyaları |
| O4 | Model anahtar izolasyonu | LiteLLM virtual keys; raw provider key hiçbir config/prompt'ta yok | LiteLLM kurulumu (canlı) |
| O5 | Yazım seamı | control-plane mutasyonları yalnız SECURITY DEFINER fn; doğrudan tablo grant'i yok | 0015 emsali → genelleme |
| O6 | Okuma sınırı | RLS read-policy seti (0014 deseni yeni ailelere kopyalanır) | migration'lar |
| O7 | Secret hijyeni | vault/.env dışında credential yok; gitleaks commit kapısı; memory-router `redact.ts` geçidi | Phase 1 kapısı + her dalga taraması |
| O8 | Append-only kayıt | log/audit ailelerinde UPDATE/DELETE grant'i yok (0008 emsali) | DATA_MODEL §12 |
| O9 | Login | mevcut Supabase Auth akışı KALIR (3D hover görsel upgrade davranışı değiştirmez) | CEO_COMMAND_CENTER §16 |

## 4. Veri modeli

Yeni tablo YOK. Sicil bu dosyada yaşar (markdown tablo — düşük frekans, CEO-okur artefakt; DB'ye taşımak sicili "iş" yapardı, madde 4'e aykırı). İstisna işareti: sicil kalemi AÇILDIĞINDA normal spec/migration süreci işler ve satır güncellenir.

## 5-10. Component/Backend/Frontend/API/Event/State

Bu spec'in yürütme bileşeni yoktur (G3). Dashboard'daki tek yüzeyi: Governance grubunda salt-okunur "Security Posture" kartı — O1-O9 durum satırları (yeşil=canlı) + sicil özeti (`⏸ ertelenmiş: N kalem`). Kaynak: bu dosyanın yapılandırılmış bloğu (build-time parse; DB'siz).

## 11. Database tabloları / 12. İlişkiler

Yok (yukarıda). İlişki: diğer spec'lerin "SECURITY_MODEL siciline" referansları BU tabloya düşer (§13 sicil).

## 13. ERTELENMİŞ-SERTLEŞTİRME SİCİLİ (bağlayıcı kayıt)

| # | Kalem | Neden ertelendi | Açılma tetiği | Sahip spec |
|---|-------|-----------------|---------------|------------|
| S1 | MFA / 2FA zorunluluğu | CEO kararı: tek kullanıcı, hız önce; kapatıldı | CEO kararı VEYA sistemin internete CEO-dışı kullanıcıya açılması | (bu dosya) |
| S2 | Local erişim kısıtlama | geliştirme hızı; local açık kalır | VPS'in üretim-tek-kaynak olması + CEO kararı | BACKUP_PLAN ortamı |
| S3 | API rate-limit + IP allowlist | dış-açık API yok (Caddy yalnız dashboard) | API'nin dışa açılması | API_CONTRACTS §16 |
| S4 | Kolon-düzeyi şifreleme (at-rest) | tek-tenant VPS, disk şifreleme yeterli sayıldı | müşteri verisi (Outleteuro PII) tabloya girdiğinde | DATA_MODEL §14 |
| S5 | Audit satır imzalama (tamper-evidence) | append-only grant modeli yeterli sayıldı | dış denetim/uyum ihtiyacı | AUDIT_AND_LOGGING §16 |
| S6 | Credential rotasyon otomasyonu + kadans | rotasyon CEO-manuel (Phase 1 düzeni); bilinen bekleyen rotasyon kalemi CEO checklist'inde | Outleteuro canlı ödeme akışı ÖNCESİ zorunlu gözden geçirme | (bu dosya; Phase 1 checklist emsali) |
| S7 | 2-kişi kuralı (kritik değişimde ikinci onaycı) | N/A — tek insan var | ikinci yetkili insan katılırsa | PERMISSION_MODEL §100 notu |
| S8 | Session sertleştirme (kısa TTL, cihaz bağlama) | CEO tek cihaz seti; mevcut Auth TTL yeterli | S1 ile birlikte | (bu dosya) |
| S9 | CSP/headers sıkılaştırma turu | dış kullanıcı yok; Next.js varsayılanları | dışa açılma VEYA Phase sonu boş pencere | CEO_COMMAND_CENTER §16 |
| S10 | Ajan çıktı-içerik DLP taraması (redact dışı katman) | redact.ts + outbox insan kapısı yeterli sayıldı | dış-iletişim otonomisinin genişlemesi | FABLE_5_HOOK post-gate |

Sicil değişiklik kuralı: satır ekleme serbest (kayıtlı erteleme her zaman sessiz borçtan iyi); satır SİLME yalnız kalem açılıp uygulandığında (satır "AÇILDI → <spec/migration ref>" notuyla kalır — tarih silinmez).

## 14. Logging / 15. Audit

Bu dosyanın değişiklik tarihi git'tedir (sicilin audit'i = commit geçmişi). Posture kartı görüntülemeleri loglanmaz.

## 16. Security (tehdit modeli — mevcut duruşun dürüst özeti)

- **Koruma hedefi sıralaması:** (1) para/dış-aksiyon kötüye kullanımı — O1/O2 ile insan kapılı; (2) credential sızıntısı — O4/O7; (3) ajan taşması (compromised/hallüsinasyonlu ajanın yetki aşımı) — O3/O5/O6 + hook kapıları; (4) kayıt bütünlüğü — O8.
- **Kabul edilen risk yüzeyi (bilinçli):** tek-faktör CEO girişi (S1), local geliştirme erişimi (S2), at-rest kolon şifresizliği (S4). Bunlar CEO kararıyla açık risklerdir; sicil tetikleri izler.
- **En zayıf halka dürüstlüğü:** insan-CEO'nun tek oturumu. Telafi: para-çıkışı yine ayrı onay ekranından geçer (oturum çalınsa bile outbox kuyruğu görünürdür; kritik alarm `alerts` kanalında).

## 17. Error handling / 18. Retry / 19. Fallback

Güvenlik mekanizması hatası her zaman KAPALI-güvenli (fail-closed): O1 onay sorgusu hata verirse outbox'a yazım REDDEDİLİR; gateway profili yüklenemezse ajan araçsız başlar (çalışamaz — sızamaz). Fallback yönü hiçbir zaman "açık geç" değildir.

## 20. Test planı / 21. Acceptance criteria

- O1 kanıtı: onaysız money_out outbox denemesi → fn reddi (mevcut test KALIR, her dalga koşulur).
- O7 kanıtı: gitleaks dalga-sonu taraması 0 leak; redact canary testi (MEMORY_ARCHITECTURE §20).
- Kabul: Posture kartı O1-O9 canlı gösterir; sicil tablosu dashboard özetiyle eş sayıda (N kalem); fail-closed testleri (O1, gateway) yeşil.

## 22. Migration planı / 23. Rollback planı

Migration yok. "Rollback" bu dosyada tersine işler: bir omurga kalemini gevşetme talebi = ÖNCE bu dosyada ⛔ değişiklik + CEO onayı + gerekçe satırı; sonra teknik iş.

## 24. Uygulama sırası (doğrulamalı)

```bash
grep -c "^| O[0-9]" HOLDING-OS-MASTER-PLAN/SECURITY_MODEL.md    # → 9 (omurga tam)
grep -c "^| S[0-9]" HOLDING-OS-MASTER-PLAN/SECURITY_MODEL.md    # → 10 (sicil tam)
gitleaks detect --source . --no-banner | tail -1                 # → no leaks found
```

## 25. Bağımlılıklar / 26. Riskler / 27. Edge case'ler

- Bağımlılık: mevcut Phase 1-7 güvenlik varlıkları (canlı); hiçbir yeni kurulum yok.
- Risk: sicilin unutulması → tetik koşulları Outleteuro/dışa-açılma fazlarının giriş kriterlerine yazılır (IMPLEMENTATION_ROADMAP D5'e madde: "Faz 11 girişinde S4+S6 zorunlu gözden geçirme").
- Edge: ertelenen kalemin tetiklenmesi Fable-sonrası döneme denk gelirse → Opus sicili okur, kalemi normal spec sürecinde açar (⛔: omurga gevşetme Opus'a KAPALI — yalnız eldeki en güçlü model + CEO).

## Opus-devralma notu

Bu dosya Opus için "dokunma listesi"dir: O1-O9'a dokunma, S1-S10'u tetiksiz açma, tetik gelirse sahip spec'e git. Sicil formatı sabit — satır ekle, silme.

## Done definition (bu spec)

27 başlık ✓ · omurga 9 kalem (kanıt yollu) ✓ · sicil 10 kalem (neden+tetik+sahip) ✓ · yeni-iş-açmama sınırı açık ✓ · fail-closed ilkesi ✓ · tehdit modeli dürüst özeti ✓ · doğrulama komutları ✓ · Opus dokunma-listesi ✓
